package controller

//主要用于解析HTTP请求参数,然后告诉Service层该做什么，最后把结果返回给用户。
import (
	"bookstore-manager/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BookController struct {
	BookService *service.BookService
}

func NewBookController() *BookController {
	return &BookController{
		BookService: service.NewBookService(),
	}
}

// 查看热销书籍
func (b *BookController) GetHotBooks(ctx *gin.Context) {
	//根据销量Sale降序排列
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "5"))
	books, err := b.BookService.GetHotBooks(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取热销书籍失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"data":    books,
		"message": "获取热销书籍成功",
	})
}

// 新书上市
func (b *BookController) GetNewBooks(ctx *gin.Context) {
	//根据更新时间UpdatedAt降序排列
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "5"))
	books, err := b.BookService.GetNewBooks(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取新书榜失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"data":    books,
		"message": "获取新书榜成功",
	})
}

// 书本翻页
func (b *BookController) GetBookList(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "12"))
	books, total, err := b.BookService.GetBooksByPage(page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取书籍列表失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "获取书籍列表成功",
		"data": gin.H{
			"books":      books,
			"total":      total,
			"page":       page,
			"page_size":  pageSize,
			"total_size": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// 图书搜索
func (b *BookController) Searchbooks(ctx *gin.Context) {
	keyword := ctx.Query("q")
	if keyword == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "关键词不能为空",
		})
	}

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "12"))
	books, total, err := b.BookService.SearchBooksWithPage(keyword, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "搜索图书失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "搜索图书成功",
		"data": gin.H{
			"books":      books,
			"total":      total,
			"page":       page,
			"page_size":  pageSize,
			"total_size": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// 获取图书细节

func (b *BookController) GetBookDetail(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "无效的书籍ID",
		})
		return
	}
	book, err := b.BookService.GetBooksByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"code":    -1,
			"message": "书籍不存在",
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "获取书籍信息成功",
		"data":    book,
	})
}
