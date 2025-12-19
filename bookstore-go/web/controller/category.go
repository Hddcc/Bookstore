package controller

import (
	"bookstore-manager/repository"
	"bookstore-manager/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryController struct {
	CategoryService *service.CategoryService
}

func NewCategoryController() *CategoryController {
	categoryDAO := repository.NewCategoryDAO()
	categoryService := service.NewCategoryService(categoryDAO)
	return &CategoryController{CategoryService: categoryService}
}

func (c *CategoryController) GetCategoryList(ctx *gin.Context) {
	categories, err := c.CategoryService.GetAllCategories()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    1,
			"message": "获取分类失败",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    categories,
	})
}
