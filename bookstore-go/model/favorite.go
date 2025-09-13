package model

import "time"

//收藏
type Favorite struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	UserID    int       `json:"user_id"`
	BookID    int       `json:"book_id"`
	CreatedAt time.Time `json:"created_at"`
	Book      *Book     `json:"book,omitempty" gorm:"foreignKey:BookID"`
}

func (f *Favorite) TableName() string {
	return "favorites"
}
