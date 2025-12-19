package repository

import (
	"bookstore-manager/global"
	"bookstore-manager/model"

	"gorm.io/gorm"
)

type CategoryDAO struct {
	DB *gorm.DB
}

func NewCategoryDAO() *CategoryDAO {
	return &CategoryDAO{DB: global.GetDB()}
}

// GetAll 获取所有分类
func (c *CategoryDAO) GetAll() ([]*model.Category, error) {
	var categories []*model.Category
	
	// 使用子查询：在查询 Category 的同时，去 Books 表查一下有多少本书属于这个分类
	// books.status = 1 确保只统计已上架的书
	err := c.DB.Table("categories").
		Select("categories.*, (SELECT count(*) FROM books WHERE books.category_id = categories.id AND books.status = 1) as book_count").
		Order("sort ASC").
		Find(&categories).Error
		
	return categories, err
}