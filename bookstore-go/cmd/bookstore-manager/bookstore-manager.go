package main

import (
	"bookstore-manager/config"
	"bookstore-manager/core"
	"bookstore-manager/global"
	"bookstore-manager/model"
	"bookstore-manager/mq"
	"bookstore-manager/service"
	"bookstore-manager/utils/snowflake"
	"bookstore-manager/web/router"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// StartOrderConsumer 定义消费者逻辑
func StartOrderConsumer(orderService *service.OrderService) {
	// 监听 "order.seckill" 队列
	mq.StartConsumer("order.seckill", func(msgStr string, d amqp.Delivery) {
		// 1. 先反序列化消息
		var msg service.OrderMessage
		if err := json.Unmarshal([]byte(msgStr), &msg); err != nil {
			global.Logger.Error("消息格式错误，丢弃", zap.String("msg", msgStr), zap.Error(err))
			d.Ack(false) // 只有格式错才直接丢弃
			return
		}

		global.Logger.Info("【异步消费者】 处理中", zap.String("orderNo", msg.OrderNo))

		// 2. 调用 Service 落库
		err := orderService.CreateOrderInDB(&msg)
		if err != nil {
			if err.Error() == "库存不足" {
				global.Logger.Warn("业务失败(无库存)", zap.Error(err))
				d.Ack(false) // 业务失败，确认消费（不再重试）
			} else {
				global.Logger.Error("系统失败(DB抖动), 准备重试", zap.Error(err))
				// Nack(multiple=false, requeue=true)
				// requeue=true 表示把消息放回队列头部，让别人（或者自己）再试一次
				d.Nack(false, true)
			}
		} else {
			global.Logger.Info("成功落库", zap.String("orderNo", msg.OrderNo))
			d.Ack(false) // 成功，确认消费
		}
	})
}

// warmUpData 数据预热：库存 + 排行榜
func warmUpData() {
	var books []model.Book
	// 1. 从 MySQL 捞出所有上架商品
	if err := global.DBClient.Where("status = ?", 1).Find(&books).Error; err != nil {
		global.Logger.Error("预热数据失败", zap.Error(err))
		return
	}

	ctx := context.Background()
	pipe := global.RedisClient.Pipeline() // 使用 Pipeline 批量提交

	for _, book := range books {
		// 1. 库存预热 Key: stock:BookID
		stockKey := fmt.Sprintf("stock:%d", book.ID)
		pipe.Set(ctx, stockKey, book.Stock, 0)

		// 2. 销量榜预热 ZSet: rank:hot_books Score: Sale
		pipe.ZAdd(ctx, "rank:hot_books", redis.Z{
			Score:  float64(book.Sale),
			Member: book.ID,
		})

		// 3. 新书榜预热 ZSet: rank:new_books Score: CreatedAt (Timestamp)
		pipe.ZAdd(ctx, "rank:new_books", redis.Z{
			Score:  float64(book.CreatedAt.Unix()),
			Member: book.ID,
		})
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		global.Logger.Error("Redis 预热 Pipeline 执行失败", zap.Error(err))
		return
	}

	global.Logger.Info("成功预热数据到 Redis",
		zap.Int("count", len(books)),
		zap.String("items", "Stock, HotRank, NewRank"),
	)
}

func main() {
	// 1. 初始化基础架构 (Infrastructure Initialization)
	core.InitLogger()                                    // 初始化日志 (最先初始化)
	config.InitConfig("conf/config.yaml", global.Logger) // 加载配置 (传入 Logger)

	//初始化雪花算法 (时间戳: 2025-12-26, 机器ID: 1)
	if err := snowflake.Init("2023-12-01", 1); err != nil {
		global.Logger.Fatal("雪花算法初始化失败", zap.Error(err))
	}

	global.InitMysql() // 初始化 MySQL
	global.InitRedis() // 初始化 Redis
	mq.InitRabbitMQ()  // 初始化 RabbitMQ

	// 2. 数据预热 (Data Warm-up)
	warmUpData()

	// 3. 初始化业务服务 (Service Initialization)
	orderService := service.NewOrderService()

	// 4. 启动后台消费者 (Start Background Consumers)
	// 4.1 订单创建后通知 (如发货)
	mq.StartConsumer("order.created", func(msg string, d amqp.Delivery) {
		global.Logger.Info("【收到订单消息】 有新订单了! 准备通知仓库发货...", zap.String("msg", msg))
		d.Ack(false)
	})

	// 4.2 用户注册后通知 (如发券)
	mq.StartConsumer("user.registered", func(msg string, d amqp.Delivery) {
		global.Logger.Info("【收到注册消息】 欢迎新用户! 发送欢迎优惠券...", zap.String("msg", msg))
		d.Ack(false)
	})

	// 4.3 处理秒杀订单 (核心异步逻辑)
	StartOrderConsumer(orderService)

	// 5. 启动 HTTP 服务器
	r := router.InitRouter()
	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// 在协程中启动服务器
	go func() {
		global.Logger.Info("Server is running", zap.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			global.Logger.Fatal("listen error", zap.Error(err))
		}
	}()

	// 6. 优雅停机
	// 等待中断信号以优雅地关闭服务器（设置 5 秒的超时时间）
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM) // 监听 Ctrl+C 或 Docker stop
	<-quit
	global.Logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		global.Logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	// 关闭数据库和MQ连接
	global.CloseDB()
	if mq.Conn != nil {
		mq.Conn.Close()
	}

	global.Logger.Info("Server exiting")
}
