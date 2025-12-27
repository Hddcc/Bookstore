package model

type User struct {
	BaseModel // 嵌入 BaseModel，自动获得 ID, CreatedAt, UpdatedAt

	Username string `gorm:"type:varchar(191);unique;not null" json:"username"`
	Password string `json:"password"`
	Email    string `gorm:"type:varchar(191);unique;not null" json:"email"`
	Phone    string `json:"phone"`
	Avatar   string `json:"avatar"` //头像
	IsAdmin  bool   `gorm:"default:false" json:"is_admin"`
}

func (u *User) TableName() string {
	return "users"
}
