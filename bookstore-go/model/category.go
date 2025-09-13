package model

import "time"

//种类
type Category struct {
	ID          int       `json:"id" gorm:"primaryKey" `
	Name        string    `json:"name" gorm:"not null;unique"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Color       string    `json:"color"`
	Gradient    string    `json:"gradient"` //渐变色彩
	Sort        int       `json:"sort" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	BookCount   int       `json:"book_count" gorm:"default:0"` //该分类下的图书数量
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (c *Category) TableName() string {
	return "categories"
}
