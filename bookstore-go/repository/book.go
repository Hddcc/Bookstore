package repository

import (
	"bookstore-manager/global"
	"bookstore-manager/model"

	"gorm.io/gorm"
)

type BookDAO struct {
	// db 持有 GORM 数据库连接实例，所有用户相关的数据库操作都通过它执行
	db *gorm.DB
}

// NewBookDAO初始化并返回一个包含数据库连接的 BookDAO实例，封装所有用户表操作。
func NewBookDAO() *BookDAO {
	return &BookDAO{
		db: global.GetDB(),
	}
}

func (b *BookDAO) GetHotBooks(limit int) ([]*model.Book, error) {
	var books []*model.Book
	err := b.db.Debug().Where("status = ?", 1).Order("sale DESC").Limit(limit).Find(&books).Error
	if err != nil {
		return nil, err
	}
	return books, nil
}

func (b *BookDAO) GetNewBooks(limit int) ([]*model.Book, error) {
	var books []*model.Book
	err := b.db.Debug().Where("status = ?", 1).Order("created_at DESC").Limit(limit).Find(&books).Error
	if err != nil {
		return nil, err
	}
	return books, nil
}

func (b *BookDAO) GetBooksByPage(page, pageSize int) ([]*model.Book, int64, error) {
	var books []*model.Book
	var total int64
	err := b.db.Model(&model.Book{}).Debug().Where("status = ?", 1).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	//利用sql的offset语法实现位移
	offset := (page - 1) * pageSize
	err = b.db.Debug().Where("status = ?", 1).Offset(offset).Limit(pageSize).Find(&books).Error
	if err != nil {
		return nil, 0, err
	}
	return books, total, nil
}

func (b *BookDAO) SearchBooksWithPage(keyword string, page, pageSize int) ([]*model.Book, int64, error) {
	var books []*model.Book
	var total int64
	searchCondition := b.db.Debug().Where("status = ? AND (title LIKE ? OR author LIKE ? OR description LIKE ?)",
		1, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	err := searchCondition.Model(&model.Book{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	err = searchCondition.Offset(offset).Limit(pageSize).Find(&books).Error
	if err != nil {
		return nil, 0, err
	}
	return books, total, err
}

func (b *BookDAO) GetBooksByID(id int) (*model.Book, error) {
	var books model.Book
	err := b.db.Debug().Where("status = ?", 1).First(&books, id).Error
	if err != nil {
		return nil, err
	}
	return &books, nil
}
