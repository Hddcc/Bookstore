package service

import (
	"bookstore-manager/global"
	"bookstore-manager/model"
	"bookstore-manager/mq"
	"bookstore-manager/repository"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type OrderService struct {
	OrderDB *repository.OrderDAO
	BookDB  *repository.BookDAO
}

func NewOrderService() *OrderService {
	return &OrderService{
		OrderDB: repository.NewOrderDAO(),
		BookDB:  repository.NewBookDAO(),
	}
}

type OrderRequest struct {
	UserID int          `json:"user_id"`
	Items  []OrderItems `json:"items"`
}

type OrderItems struct {
	BookID   int `json:"book_id"`
	Quantity int `json:"quantity"`
	Price    int `json:"price"`
}

type OrderMessage struct {
	UserID     int
	Items      []OrderItems
	OrderNo    string
	CreateTime int64
}

// CreateOrder 创建新订单
func (o *OrderService) CreateOrder(req *OrderRequest) (*model.Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("订单项不能为空")
	}
	//1.判断库存是否充足
	err := o.CheckStockAvailability(req)
	if err != nil {
		return nil, err
	}
	//2.生成订单号（下单成功）
	orderNo := o.GenerateOrderNo()
	var totalAmount int
	var OrderItems []*model.OrderItem

	for _, item := range req.Items {
		subtotal := item.Price * item.Quantity
		totalAmount += subtotal

		OrderItems = append(OrderItems, &model.OrderItem{
			BookID:   item.BookID,
			Quantity: item.Quantity,
			Price:    item.Price,
			Subtotal: subtotal,
		})
	}
	//支付
	order := &model.Order{
		UserID:      req.UserID,
		OrderNo:     orderNo,
		TotalAmount: totalAmount,
		Status:      0,
		IsPaid:      false,
	}
	err = o.OrderDB.CreateOrderWithItems(order, OrderItems)
	if err != nil {
		return nil, err
	}
	fullOrder, err := o.OrderDB.GetOrderByID(order.ID)
	if err != nil {
		return nil, err // 或者降级返回 partial order
	}
	go func() {
		// 使用 go 协程发送，确保不阻塞主线程返回给用户
		mq.SendMessage("order.created", order.OrderNo)
	}()
	return fullOrder, err
}

// CheckStockAvailability 判断库存是否充足
func (o *OrderService) CheckStockAvailability(req *OrderRequest) error {
	for _, item := range req.Items {
		book, err := o.BookDB.GetBooksByID(item.BookID)
		if err != nil {
			return errors.New("图书不存在")
		}
		if book.Status != 1 {
			return errors.New("图书已下架")
		}
		if book.Stock < item.Quantity {
			return errors.New("库存不足")
		}
	}
	return nil
}

// GenerateOrderNo 如果库存充足，生成订单号
func (o *OrderService) GenerateOrderNo() string {
	//用时间戳标记
	orderNo := fmt.Sprintf("ORD%d", time.Now().UnixNano())
	return orderNo
}

// GetUserOrders 获取用户订单列表
func (o *OrderService) GetUserOrders(userID, page, pageSize int) ([]*model.Order, int64, error) {
	return o.OrderDB.GetUserOrders(userID, page, pageSize)
}

// PayOrders 支付
func (o *OrderService) PayOrders(orderID int) error {
	// 检查订单是否存在
	order, _ := o.OrderDB.GetOrderByID(orderID)

	//检查订单是否支付
	if order.IsPaid {
		return errors.New("订单已支付")
	}
	err := o.OrderDB.UpdateOrderStatus(order)
	return err
}

func (o *OrderService) GetOrderByID(orderID int) error {
	_, err := o.OrderDB.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	return nil
}

// GetOrder 获取单个订单详情
func (o *OrderService) GetOrder(orderID int) (*model.Order, error) {
	return o.OrderDB.GetOrderByID(orderID)
}

// CancelOrder 取消订单
func (o *OrderService) CancelOrder(userID, orderID int) error {
	// 1.检查订单是否存在
	order, err := o.OrderDB.GetOrderByID(orderID)
	if err != nil {
		return errors.New("订单不存在")
	}
	// 2.检查权限
	if order.UserID != userID {
		return errors.New("无权操作此订单")
	}
	// 3.检查状态（只有未支付的订单才可以取消）
	if order.Status != 0 {
		return errors.New("只有未支付的订单才可以取消")
	}
	return o.OrderDB.CancelOrder(orderID)
}

// CreateOrderAsync 秒杀生成订单
func (o *OrderService) CreateOrderAsync(req *OrderRequest) (string, error) {
	if len(req.Items) == 0 {
		return "", errors.New("订单项不能为空")
	}
	// 1. Redis 预扣减
	// 假设秒杀场景一次只买一种书 (Items[0])
	targetBookID := req.Items[0].BookID
	buyNum := req.Items[0].Quantity

	stockKey := fmt.Sprintf("stock:%d", targetBookID)
	// DecrBy 是原子操作，并发安全，不会超卖
	// 返回值 result 是扣减后的剩余库存
	result, err := global.RedisClient.DecrBy(context.Background(), stockKey, int64(buyNum)).Result()
	if err != nil {
		// 如果 Redis 挂了或者 Key 不存在，建议降级（报错或直接走DB）
		return "", errors.New("系统繁忙 (Redis Error)")
	}

	if result < 0 {
		// 扣减后小于 0，说明库存不足
		// [回滚] 把它加回去 (虽然已经是负数了，加回去不影响逻辑，主要是为了计数准确)
		global.RedisClient.IncrBy(context.Background(), stockKey, int64(buyNum))
		return "", errors.New("库存不足，被抢光啦！")
	}

	// 2.生成订单号
	orderNo := o.GenerateOrderNo()

	// 3.组装消息并发送
	msgObj := OrderMessage{
		UserID:     req.UserID,
		OrderNo:    orderNo,
		Items:      req.Items,
		CreateTime: time.Now().Unix(),
	}

	// 序列化成JSON字符串
	msgBytes, _ := json.Marshal(msgObj)

	// 发送到rabbitmq的“order.seckill”队列
	// RoutingKey 改成 “order.seckill”是为了和普通订单区分开
	err = mq.SendMessage("order.seckill", string(msgBytes))
	if err != nil {
		return "", errors.New("系统繁忙，请稍后再试")
	}

	// 3.立即返回（但其实数据库里没有这个订单）
	return orderNo, nil
}

// CreateOrderInDB 专门给 MQ 消费者调用
func (o *OrderService) CreateOrderInDB(msg *OrderMessage) error {
	// 1.重新计算总价
	var totalAmount int
	var orderItems []*model.OrderItem

	for _, item := range msg.Items {
		subtotal := item.Price * item.Quantity
		totalAmount += subtotal

		orderItems = append(orderItems, &model.OrderItem{
			BookID:   item.BookID,
			Quantity: item.Quantity,
			Price:    item.Price,
			Subtotal: subtotal,
		})
	}

	// 2.组装model.Order对象
	order := &model.Order{
		UserID:      msg.UserID,
		OrderNo:     msg.OrderNo,
		TotalAmount: totalAmount,
		Status:      0, //0 待支付
		IsPaid:      false,
	}

	// 3.调用原有的DAO方法落库
	// 这里面包含了：开启事务 -> 存订单 -> 存详情 -> 扣库存
	return o.OrderDB.CreateOrderWithItems(order, orderItems)
}
