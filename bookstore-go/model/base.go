package model

import (
	"bookstore-manager/utils/snowflake"
	"time"

	"gorm.io/gorm"
)

// BaseModel 替代 gorm.Model
type BaseModel struct {
	ID        int64          `gorm:"primaryKey;autoIncrement:false" json:"id,string"` // 关键：关闭自增，json输出为string防止前端精度丢失
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate GORM 的钩子函数，在创建记录前自动调用
func (b *BaseModel) BeforeCreate(tx *gorm.DB) (err error) {
	// 只有当 ID 为 0 时才自动生成，允许手动指定所有的 ID
	if b.ID == 0 {
		b.ID = snowflake.GenID()
	}
	return
}