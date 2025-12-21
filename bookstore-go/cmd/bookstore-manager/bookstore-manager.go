package main

import (
	"bookstore-manager/config"
	"bookstore-manager/global"
	"bookstore-manager/model"
	"bookstore-manager/mq"
	"bookstore-manager/service"
	"bookstore-manager/web/router"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// StartOrderConsumer 定义消费者逻辑
func StartOrderConsumer(orderService *service.OrderService) {
	// 监听 "order.seckill" 队列
	mq.StartConsumer("order.seckill", func(msgStr string, d amqp.Delivery) {
		// 1. 先反序列化消息
		var msg service.OrderMessage
		if err := json.Unmarshal([]byte(msgStr), &msg); err != nil {
			log.Println("消息格式错误，丢弃:", msgStr)
			d.Ack(false) // 只有格式错才直接丢弃
			return
		}

		fmt.Printf("【异步消费者】 处理中: %s\n", msg.OrderNo)

		// 2. 调用 Service 落库
		err := orderService.CreateOrderInDB(&msg)
		if err != nil {
			if err.Error() == "库存不足" {
				log.Printf("业务失败(无库存): %v\n", err)
				d.Ack(false) // 业务失败，确认消费（不再重试）
			} else {
				log.Printf("系统失败(DB抖动): %v, 准备重试...\n", err)
				// Nack(multiple=false, requeue=true)
				// requeue=true 表示把消息放回队列头部，让别人（或者自己）再试一次
				d.Nack(false, true)
			}
		} else {
			log.Printf("成功落库: %s\n", msg.OrderNo)
			d.Ack(false) // 成功，确认消费
		}
	})
}

// loadStockToRedis 库存预热
func loadStockToRedis() {
	var books []model.Book
	// 1. 从 MySQL 捞出所有上架商品
	if err := global.DBClient.Where("status = ?", 1).Find(&books).Error; err != nil {
		log.Println("预热数据失败:", err)
		return
	}

	ctx := context.Background()
	for _, book := range books {
		// Key: stock:BookID (如 stock:101)
		key := fmt.Sprintf("stock:%d", book.ID)
		// 2. 写入 Redis (Set key value 0)
		global.RedisClient.Set(ctx, key, book.Stock, 0)
	}
	log.Printf("成功预热 %d 本书的库存到 Redis\n", len(books))
}

func main() {
	// 1. 初始化基础架构 (Infrastructure Initialization)
	config.InitConfig("conf/config.yaml") // 加载配置
	global.InitMysql()                    // 初始化 MySQL
	global.InitRedis()                    // 初始化 Redis
	mq.InitRabbitMQ()                     // 初始化 RabbitMQ

	// 2. 数据预热 (Data Warm-up)
	loadStockToRedis()

	// 3. 初始化业务服务 (Service Initialization)
	orderService := service.NewOrderService()

	// 4. 启动后台消费者 (Start Background Consumers)
	// 4.1 订单创建后通知 (如发货)
	mq.StartConsumer("order.created", func(msg string, d amqp.Delivery) {
		log.Printf("【收到订单消息】 有新订单了! 订单号: %s -> 准备通知仓库发货...\n", msg)
		d.Ack(false)
	})

	// 4.2 用户注册后通知 (如发券)
	mq.StartConsumer("user.registered", func(msg string, d amqp.Delivery) {
		log.Printf("【收到注册消息】 欢迎新用户: %s -> 发送欢迎优惠券...\n", msg)
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
		log.Println("Server is running on", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// 6. 优雅停机 
	// 等待中断信号以优雅地关闭服务器（设置 5 秒的超时时间）
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM) // 监听 Ctrl+C 或 Docker stop
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	// 关闭数据库和MQ连接
	global.CloseDB()
	if mq.Conn != nil {
		mq.Conn.Close()
	}

	log.Println("Server exiting")
}
