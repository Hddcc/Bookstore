package model

import (
	"time"
)

type Order struct {
	BaseModel

	UserID      int64      `json:"user_id,string"`
	OrderNo     string     `json:"order_no"`
	TotalAmount int        `json:"total_amount"`
	Status      int        `json:"status"`
	IsPaid      bool       `json:"is_paid"`
	PaymentTime *time.Time `json:"payment_time"`

	// 关联字段
	User       *User       `gorm:"foreignKey:UserID" json:"user"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items"`
}

func (o *Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	BaseModel

	OrderID  int64 `gorm:"not null" json:"order_id,string"`
	BookID   int64 `gorm:"not null" json:"book_id,string"`
	Quantity int   `gorm:"not null" json:"quantity"`
	Price    int   `gorm:"not null" json:"price"`
	Subtotal int   `gorm:"not null" json:"subtotal"`

	Book *Book `gorm:"foreignKey:BookID" json:"book"`
}

func (oi *OrderItem) TableName() string {
	return "order_items"
}
