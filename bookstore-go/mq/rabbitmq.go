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
	q, err := Channel.QueueDeclare(
		"",    // 队列名称，留空由 RabbitMQ 自动生成临时队列
		false, // durable
		false, // delete when unused
		true,  // exclusive
		false, // no-wait
		nil,   // arguments
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
