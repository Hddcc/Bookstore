package mq

import (
	"bookstore-manager/config"
	"fmt"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

var Conn *amqp.Connection
var Channel *amqp.Channel

// InitRabbitMQ 初始化连接 (在 main.go 中调用)
func InitRabbitMQ() {
	cfg := config.AppConfig.RabbitMQ
	// 拼接连接字符串: amqp://user:password@host:port/vhost
	url := fmt.Sprintf("amqp://%s:%s@%s:%d/%s", cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.VHost)

	var err error
	Conn, err = amqp.Dial(url)
	if err != nil {
		log.Fatalf("RabbitMQ 连接失败: %v", err)
	}

	Channel, err = Conn.Channel()
	if err != nil {
		log.Fatalf("RabbitMQ 打开通道失败: %v", err)
	}

	// 1. 声明死信交换机 (DLX)
	// 名字叫 "dlx_exchange", 类型 "topic"
	err = Channel.ExchangeDeclare("dlx_exchange", "topic", true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	// 2. 声明死信队列 (DLQ)
	// 名字叫 "dlq_queue"
	_, err = Channel.QueueDeclare("dlq_queue", true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	// 3. 绑定 DLQ 到 DLX
	// RoutingKey set to "#" (接盘所有被遗弃的消息)
	err = Channel.QueueBind("dlq_queue", "#", "dlx_exchange", false, nil)
	if err != nil {
		log.Fatal(err)
	}

	// 声明一个常用的交换机 (Exchange)，例如 'bookstore_event_exchange'
	Channel.ExchangeDeclare(
		"bookstore_event_exchange", // 参数1: 交换机名称
		"topic",                    // 参数2: 交换机类型
		true,                       // 参数3: durable - 持久化
		false,                      // 参数4: autoDelete - 自动删除
		false,                      // 参数5: internal - 内部交换机
		false,                      // 参数6: noWait - 不等待服务器响应
		nil,                        // 参数7: arguments - 额外参数
	)
	if err != nil {
		log.Fatalf("声明交换机失败: %v", err)
	}

	log.Println("RabbitMQ 初始化成功")
}

// SendMessage 发送消息到指定 Topic
func SendMessage(routingKey string, message string) error {
	// 简单示例：直接发送字符串
	err := Channel.Publish(
		"bookstore_event_exchange", // exchange
		routingKey,                 // routing key (例如: "order.created")
		false,                      // mandatory
		false,                      // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		})
	if err != nil {
		log.Printf("发送消息失败 [%s]: %v\n", routingKey, err)
		return err
	}
	return nil
}

// StartConsumer 监听指定 routing key 的消息
func StartConsumer(routingKey string, handler func(string, amqp.Delivery)) {
	// 配置队列参数，绑定死信
	args := amqp.Table{
		// 假如这个队列里的消息死了，发送到 dlx_exchange
		"x-dead-letter-exchange": "dlx_exchange",
	}
	q, err := Channel.QueueDeclare(
		"order_seckill_queue",    // 队列名称
		true, // durable
		false, // delete when unused
		false,  // exclusive
		false, // no-wait
		args,   // arguments
	)
	if err != nil {
		log.Println("声明队列失败:", err)
		return
	}

	// 绑定队列到交换机
	err = Channel.QueueBind(
		q.Name,                     // queue name
		routingKey,                 // routing key
		"bookstore_event_exchange", // exchange
		false,
		nil,
	)

	msgs, err := Channel.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)

	// 启动一个协程一直从队列里拿数据
	go func() {
		for d := range msgs {
			// 调用传入的处理函数
			handler(string(d.Body), d)
		}
	}()
}
