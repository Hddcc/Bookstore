package model

import "time"

type Order struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	UserID      int       `json:"user_id"`
	OrderNo     string    `json:"order_no"`
	TotalAmount int       `json:"total_amount"`
	Status      int       `json:"status"` //订单状态：0-待支付，1-已支付，2-已取消
	IsPaid      bool      `json:"is_paid"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:"updated_at"`

	//关联字段（关联了哪些模型）
	User       *User       `gorm:"foreignKey:UserID" json:"user"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items"`
}

func (o *Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	OrderID   int       `gorm:"not null" json:"order_id"`
	BookID    int       `gorm:"not null" json:"book_id"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	Price     int       `gorm:"not null" json:"price"`
	Subtotal  int       `gorm:"not null" json:"subtotal"` //小计（分）
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Book      *Book     `gorm:"foreignKey:BookID" json:"book"`
}

func (oi *OrderItem) TableName() string {
	return "order_items"
}
