package main

import (
	"bookstore-manager/config"
	"bookstore-manager/global"
	"bookstore-manager/mq"
	"bookstore-manager/service"
	"bookstore-manager/web/router"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

// 定义消费者逻辑 (放在 main 函数外面或者里面都可以)
func StartOrderConsumer(orderService *service.OrderService) {
	// 监听 "order.seckill" 队列
	mq.StartConsumer("order.seckill", func(msgStr string, d amqp.Delivery) {

		// 1. 反序列化
		var msg service.OrderMessage // 注意：OrderMessage 应该定义在 service 包里
		if err := json.Unmarshal([]byte(msgStr), &msg); err != nil {
			log.Println("格式错误，丢弃:", msgStr)
			d.Ack(false) // 致命错误，直接确认丢弃
			return
		}

		fmt.Printf("【异步消费者】 处理中: %s\n", msg.OrderNo)

		// 2. 调用 Service 落库
		err := orderService.CreateOrderInDB(&msg)

		if err != nil {
			if err.Error() == "库存不足" {
				fmt.Printf("业务失败(无库存): %v\n", err)
				d.Ack(false) // 业务失败，确认消费（不再重试）
			} else {
				fmt.Printf("系统失败(DB抖动): %v, 准备重试...\n", err)
				// Nack(multiple=false, requeue=true)
				// requeue=true 表示把消息放回队列头部，让别人（或者自己）再试一次
				d.Nack(false, true)
			}
		} else {
			fmt.Printf("成功落库: %s\n", msg.OrderNo)
			d.Ack(false) // 成功，确认消费
		}
	})
}

func main() {
	//初始化，如mysql、配置文件、redis
	//配置
	config.InitConfig("conf/config.yaml")
	global.InitMysql()
	global.InitRedis()
	mq.InitRabbitMQ()
	mq.StartConsumer("order.created", func(msg string, d amqp.Delivery) {
		fmt.Printf("【收到订单消息】 有新订单了! 订单号: %s -> 准备通知仓库发货...\n", msg)
	})
	mq.StartConsumer("user.registered", func(msg string, d amqp.Delivery) {
		fmt.Printf("【收到注册消息】 欢迎新用户: %s -> 发送欢迎优惠券...\n", msg)
	})
	r := router.InitRouter()
	// addr := fmt.Sprintf("%s:%d", "localhost", config.AppConfig.Server.Port)
	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	server := &http.Server{
		Addr:    addr,
		Handler: r,
	}
	err := server.ListenAndServe()
	if err != nil {
		fmt.Println("服务器启动失败")
		os.Exit(-1)
	}
}
