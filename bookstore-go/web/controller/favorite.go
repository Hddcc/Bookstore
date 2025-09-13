package controller

import (
	"bookstore-manager/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FavoriteController struct {
	favoriteService *service.FavoriteService
}

func NewFavoriteController(favoriteService *service.FavoriteService) *FavoriteController {
	return &FavoriteController{
		favoriteService: favoriteService,
	}
}

func getUserID(ctx *gin.Context) int {
	userID, exists := ctx.Get("userID")
	if !exists {
		return 0
	}
	return userID.(int)
}

// 添加收藏
func (f *FavoriteController) AddFavorite(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	bookID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "无效的书籍ID",
			"error":   err.Error(),
		})
		return
	}
	err = f.favoriteService.AddFavorite(userID, bookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "添加收藏失败",
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "添加收藏成功",
	})
}

// 删除收藏
func (f *FavoriteController) RemoveFavorite(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	bookID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "无效的书籍ID",
			"error":   err.Error(),
		})
		return
	}
	err = f.favoriteService.RemoveFavorite(userID, bookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "移除收藏失败",
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "移除收藏成功",
	})
}

// 获取用户收藏列表
func (f *FavoriteController) GetUserFavorites(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "12"))
	timeFilter := ctx.DefaultQuery("time_filter", "all")

	favs, total, err := f.favoriteService.GetUserFavorites(userID, page, pageSize, timeFilter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    1,
			"message": "获取收藏列表失败",
		})
		return
	}
	totalPages := (int(total) + pageSize - 1) / pageSize
	ctx.JSON(200, gin.H{
		"code": 0,
		"data": gin.H{
			"favorites":    favs,
			"total":        total,
			"total_pages":  totalPages,
			"current_page": page,
		},
	})
}

// 获取用户收藏总数
func (f *FavoriteController) GetUserFavoriteCount(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	count, err := f.favoriteService.GetUserFavoriteCount(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取收藏数量失败",
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"count": count,
		},
		"message": "获取收藏数量成功",
	})
}

// 是否为收藏书籍
func (f *FavoriteController) CheckFavorite(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	bookIDStr := ctx.Param("id")
	bookID, err := strconv.Atoi(bookIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "无效的书籍ID",
		})
		return
	}
	isFavorited, err := f.favoriteService.IsFavorited(userID, bookID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "检查收藏状态失败",
		})
		return
	}

	ctx.JSON(200, gin.H{
		"code": 0,
		"data": gin.H{
			"is_favorited": isFavorited,
		},
	})
}
