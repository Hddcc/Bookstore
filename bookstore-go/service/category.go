package service

import (
	"bookstore-manager/model"
	"bookstore-manager/repository"
)

type CategoryService struct {
	CategoryDAO *repository.CategoryDAO
}

func NewCategoryService(categoryDAO *repository.CategoryDAO) *CategoryService {
	return &CategoryService{CategoryDAO: categoryDAO}
}

func (s *CategoryService) GetAllCategories() ([]*model.Category, error) {
	return s.CategoryDAO.GetAll()
}
