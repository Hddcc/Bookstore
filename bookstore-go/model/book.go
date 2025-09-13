package model

import "time"

type Book struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	Price       int       `json:"price"`
	Discount    int       `json:"discount"` //折扣
	Type        string    `json:"type"`
	Stock       int       `json:"stock"`  //库存
	Status      int       `json:"status"` //状态，上架1，下架0
	Description string    `json:"description"`
	CoverURL    string    `json:"cover_url"`
	ISBN        string    `json:"isbn"`
	Publisher   string    `json:"publisher"`
	Pages       int       `json:"pages"`
	Language    string    `json:"language"`
	Format      string    `json:"format"`
	CategoryID  uint      `json:"category_id"`
	Sale        int       `json:"sale"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (b *Book) TableName() string {
	return "books"
}
