package repository

import (
	"context"
	"strconv"

	"bookstore-manager/global"
	"bookstore-manager/model"

	"go.uber.org/zap"
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

// GetHotBooks 查看热销书籍 (Redis ZSet)
func (b *BookDAO) GetHotBooks(limit int) ([]*model.Book, error) {
	// 1. 从 Redis 取出前 limit 名的 ID
	// ZREVRANGE rank:hot_books 0 limit-1
	idsStr, err := global.RedisClient.ZRevRange(context.Background(), "rank:hot_books", 0, int64(limit-1)).Result()
	if err != nil {
		global.Logger.Error("获取热销榜失败(Redis)", zap.Error(err))
		return nil, err
	}

	if len(idsStr) == 0 {
		return []*model.Book{}, nil
	}

	// 2. 根据 ID 去 MySQL 查详情
	var books []*model.Book
	if err := b.db.Debug().Where("id IN ?", idsStr).Find(&books).Error; err != nil {
		return nil, err
	}

	// 3. 按照 Redis 的 ID 顺序手动排序 (MySQL IN 查询不保证顺序)
	bookMap := make(map[string]*model.Book)
	for _, book := range books {
		bookMap[strconv.FormatInt(book.ID, 10)] = book
	}

	var sortedBooks []*model.Book
	for _, idStr := range idsStr {
		if book, ok := bookMap[idStr]; ok {
			sortedBooks = append(sortedBooks, book)
		}
	}

	return sortedBooks, nil
}

// GetNewBooks 新书上市 (Redis ZSet)
func (b *BookDAO) GetNewBooks(limit int) ([]*model.Book, error) {
	// 1. 从 Redis 取出前 limit 名的 ID
	// ZREVRANGE rank:new_books 0 limit-1
	idsStr, err := global.RedisClient.ZRevRange(context.Background(), "rank:new_books", 0, int64(limit-1)).Result()
	if err != nil {
		global.Logger.Error("获取新书榜失败(Redis)", zap.Error(err))
		return nil, err
	}

	if len(idsStr) == 0 {
		return []*model.Book{}, nil
	}

	// 2. 根据 ID 去 MySQL 查详情
	var books []*model.Book
	if err := b.db.Debug().Where("id IN ?", idsStr).Find(&books).Error; err != nil {
		return nil, err
	}

	// 3. 排序
	bookMap := make(map[string]*model.Book)
	for _, book := range books {
		bookMap[strconv.FormatInt(book.ID, 10)] = book
	}

	var sortedBooks []*model.Book
	for _, idStr := range idsStr {
		if book, ok := bookMap[idStr]; ok {
			sortedBooks = append(sortedBooks, book)
		}
	}

	return sortedBooks, nil
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

func (b *BookDAO) GetBooksByID(id int64) (*model.Book, error) {
	var books model.Book
	err := b.db.Debug().Where("status = ?", 1).First(&books, id).Error
	if err != nil {
		return nil, err
	}
	return &books, nil
}

// 根据分类名称获取书籍 (实现连表查询)
func (b *BookDAO) GetBooksByCategory(categoryName string, page, pageSize int) ([]*model.Book, int64, error) {
	var books []*model.Book
	var total int64

	// 连表查询：Books JOIN Categories
	// 逻辑：找到 categories.name = categoryName 的所有 books
	query := b.db.Debug().Model(&model.Book{}).
		Joins("JOIN categories ON categories.id = books.category_id").
		Where("categories.name = ? AND books.status = 1", categoryName)

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = query.Offset(offset).Limit(pageSize).Find(&books).Error
	if err != nil {
		return nil, 0, err
	}
	return books, total, nil
}
