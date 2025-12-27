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

	"go.uber.org/zap"
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

// [修改] DTO 里的 ID 也要改成 int64
type OrderRequest struct {
	UserID int64        `json:"user_id,string"` // int -> int64
	Items  []OrderItems `json:"items"`
}

type OrderItems struct {
	BookID   int64 `json:"book_id,string"` // int -> int64
	Quantity int   `json:"quantity"`
	Price    int   `json:"price"`
}

type OrderMessage struct {
	UserID     int64 // int -> int64
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
		return nil, err
	}
	go func() {
		mq.SendMessage("order.created", order.OrderNo)
	}()
	return fullOrder, err
}

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

func (o *OrderService) GenerateOrderNo() string {
	orderNo := fmt.Sprintf("ORD%d", time.Now().UnixNano())
	return orderNo
}

// [修改] 参数 userID 改为 int64
func (o *OrderService) GetUserOrders(userID int64, page, pageSize int) ([]*model.Order, int64, error) {
	return o.OrderDB.GetUserOrders(userID, page, pageSize)
}

// [修改] 参数 orderID 改为 int64
func (o *OrderService) PayOrders(orderID int64) error {
	order, _ := o.OrderDB.GetOrderByID(orderID)
	if order.IsPaid {
		return errors.New("订单已支付")
	}
	err := o.OrderDB.UpdateOrderStatus(order)
	if err != nil {
		return err
	}

	// [新增] 支付成功后，更新销量排行榜 (即使失败也不影响支付主流程，仅打日志)
	go func() {
		ctx := context.Background()
		for _, item := range order.OrderItems {
			// ZINCRBY rank:hot_books <quantity> <bookID>
			err := global.RedisClient.ZIncrBy(ctx, "rank:hot_books", float64(item.Quantity), fmt.Sprintf("%d", item.BookID)).Err()
			if err != nil {
				global.Logger.Error("更新热销榜失败", zap.Error(err), zap.Int64("bookID", item.BookID))
			}
		}
	}()

	return nil
}

// [修改] 参数 orderID 改为 int64
func (o *OrderService) GetOrderByID(orderID int64) error {
	_, err := o.OrderDB.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	return nil
}

// [修改] 参数 orderID 改为 int64
func (o *OrderService) GetOrder(orderID int64) (*model.Order, error) {
	return o.OrderDB.GetOrderByID(orderID)
}

// [修改] 参数 userID, orderID 改为 int64
func (o *OrderService) CancelOrder(userID, orderID int64) error {
	order, err := o.OrderDB.GetOrderByID(orderID)
	if err != nil {
		return errors.New("订单不存在")
	}
	if order.UserID != userID {
		return errors.New("无权操作此订单")
	}
	if order.Status != 0 {
		return errors.New("只有未支付的订单才可以取消")
	}
	return o.OrderDB.CancelOrder(orderID)
}

func (o *OrderService) CreateOrderAsync(req *OrderRequest) (string, error) {
	if len(req.Items) == 0 {
		return "", errors.New("订单项不能为空")
	}
	targetBookID := req.Items[0].BookID
	buyNum := req.Items[0].Quantity

	stockKey := fmt.Sprintf("stock:%d", targetBookID)
	result, err := global.RedisClient.DecrBy(context.Background(), stockKey, int64(buyNum)).Result()
	if err != nil {
		return "", errors.New("系统繁忙 (Redis Error)")
	}

	if result < 0 {
		global.RedisClient.IncrBy(context.Background(), stockKey, int64(buyNum))
		return "", errors.New("库存不足，被抢光啦！")
	}

	orderNo := o.GenerateOrderNo()

	msgObj := OrderMessage{
		UserID:     req.UserID,
		OrderNo:    orderNo,
		Items:      req.Items,
		CreateTime: time.Now().Unix(),
	}

	msgBytes, _ := json.Marshal(msgObj)
	err = mq.SendMessage("order.seckill", string(msgBytes))
	if err != nil {
		return "", errors.New("系统繁忙，请稍后再试")
	}
	return orderNo, nil
}

func (o *OrderService) CreateOrderInDB(msg *OrderMessage) error {
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

	order := &model.Order{
		UserID:      msg.UserID,
		OrderNo:     msg.OrderNo,
		TotalAmount: totalAmount,
		Status:      0,
		IsPaid:      false,
	}

	return o.OrderDB.CreateOrderWithItems(order, orderItems)
}
