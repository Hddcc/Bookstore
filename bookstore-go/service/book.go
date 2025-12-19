package service

import (
	"bookstore-manager/global"
	"bookstore-manager/model"
	"bookstore-manager/repository"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"time"
)

type BookService struct {
	BookDB *repository.BookDAO
}

func NewBookService() *BookService {
	return &BookService{
		BookDB: repository.NewBookDAO(),
	}
}

func (b *BookService) GetHotBooks(limit int) ([]*model.Book, error) {
	return b.BookDB.GetHotBooks(limit)
}

func (b *BookService) GetNewBooks(limit int) ([]*model.Book, error) {
	return b.BookDB.GetNewBooks(limit)
}

func (b *BookService) GetBooksByPage(page, pageSize int) ([]*model.Book, int64, error) {
	return b.BookDB.GetBooksByPage(page, pageSize)
}

func (b *BookService) SearchBooksWithPage(keyword string, page, pageSize int) ([]*model.Book, int64, error) {
	return b.BookDB.SearchBooksWithPage(keyword, page, pageSize)
}

func (b *BookService) GetBooksByID(id int) (*model.Book, error) {
	// 1. 定义缓存 Key
	cacheKey := fmt.Sprintf("book:detail:%d", id)

	// 2. 查询缓存 (Redis)
	val, err := global.RedisClient.Get(context.Background(), cacheKey).Result()
	if err == nil {
		// 缓存命中
		var book model.Book
		if json.Unmarshal([]byte(val), &book) == nil {
			return &book, nil
		}
	}

	// 3. 缓存未命中，查数据库
	book, err := b.BookDB.GetBooksByID(id)
	if err != nil {
		return nil, err
	}

	// 4. 写入缓存 (Cache-Aside + 随机 TTL)
	go func() {
		data, _ := json.Marshal(book)
		// 基础时间 10分钟 + 随机 0-60秒 抖动
		ttl := 10*time.Minute + time.Duration(rand.Intn(60))*time.Second
		global.RedisClient.Set(context.Background(), cacheKey, data, ttl)
	}()

	return book, nil
}

func (b *BookService) GetBooksByCategory(categoryName string, page, pageSize int) ([]*model.Book, int64, error) {
	return b.BookDB.GetBooksByCategory(categoryName, page, pageSize)
}
