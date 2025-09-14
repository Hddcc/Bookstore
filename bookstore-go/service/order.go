package service

import (
	"bookstore-manager/model"
	"bookstore-manager/repository"
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

// 创建新订单
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
	return order, err
}

// 判断库存是否充足
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

// 如果库存充足，生成订单号
func (o *OrderService) GenerateOrderNo() string {
	//用时间戳标记
	orderNo := fmt.Sprintf("ORD%d", time.Now().UnixNano())
	return orderNo
}

// 获取用户订单列表
func (o *OrderService) GetUserOrders(userID, page, pageSize int) ([]*model.Order, int64, error) {
	return o.OrderDB.GetUserOrders(userID, page, pageSize)
}

// 支付
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
