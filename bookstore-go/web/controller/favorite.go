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

// [修改] 返回值改为 int64，从中间件获取的 userID 如果是 float64 需要转化
func getUserID(ctx *gin.Context) int64 {
	userID, exists := ctx.Get("userID")
	if !exists {
		return 0
	}
	// 注意：JWT 解析出来的数字可能是 float64，也可能是 int/int64，视具体实现而定
	// 这里做一个类型断言的安全处理
	switch v := userID.(type) {
	case int:
		return int64(v)
	case int64:
		return v
	case float64:
		return int64(v)
	case uint:
		return int64(v)
	default:
		return 0
	}
}

func (f *FavoriteController) AddFavorite(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	// [修改] strconv.Atoi -> strconv.ParseInt
	bookID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
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

func (f *FavoriteController) RemoveFavorite(ctx *gin.Context) {
	userID := getUserID(ctx)
	if userID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请先登录",
		})
		return
	}
	// [修改] strconv.Atoi -> strconv.ParseInt
	bookID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
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
	// [修改] strconv.Atoi -> strconv.ParseInt
	bookID, err := strconv.ParseInt(bookIDStr, 10, 64)
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