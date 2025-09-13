package model

import "time"

type User struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"type:varchar(191);unique;not null" json:"username"`
	Password  string    `json:"password"`
	Email     string    `gorm:"type:varchar(191);unique;not null" json:"email"`
	Phone     string    `json:"phone"`
	Avatar    string    `json:"avatar"` //头像
	IsAdmin   bool      `gorm:"default:false" json:"is_admin"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) TableName() string {
	return "users"
}
