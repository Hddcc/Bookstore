package controller

import (
	"bookstore-manager/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	OrderService *service.OrderService
}

func NewOrderController() *OrderController {
	return &OrderController{
		OrderService: service.NewOrderService(),
	}
}

// CreateOrder 创建订单
func (o *OrderController) CreateOrder(ctx *gin.Context) {
	var req service.OrderRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "请求参数错误",
			"error":   err.Error(),
		})
		return
	}
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "用户未登录",
		})
		return
	}
	// Fix: assert to int64 or cast
	switch v := userID.(type) {
	case int:
		req.UserID = int64(v)
	case int64:
		req.UserID = v
	case float64:
		req.UserID = int64(v)
	case uint:
		req.UserID = int64(v)
	default:
		req.UserID = 0
	}

	order, err := o.OrderService.CreateOrder(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "创建订单失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "创建订单成功",
		"data":    order,
	})
}

// GetUserOrders 获取订单列表
func (o *OrderController) GetUserOrders(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "10"))

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code":    -1,
			"message": "用户未登录",
		})
		return
	}

	var uid int64
	switch v := userID.(type) {
	case int:
		uid = int64(v)
	case int64:
		uid = v
	case float64:
		uid = int64(v)
	case uint:
		uid = int64(v)
	}

	orders, total, err := o.OrderService.GetUserOrders(uid, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取订单列表失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "获取订单列表成功",
		"data": gin.H{
			"orders":      orders,
			"total":       total,
			"page":        page,
			"page_size":   pageSize,
			"total_pages": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// PayOrder 支付
func (o *OrderController) PayOrder(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "无效的订单ID",
		})
		return
	}
	err = o.OrderService.PayOrders(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "支付失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "支付成功",
	})
}

// GetOrderDetail 获取订单详情接口
func (o *OrderController) GetOrderDetail(ctx *gin.Context) {
	idstr := ctx.Param("id")
	orderID, _ := strconv.ParseInt(idstr, 10, 64)

	order, err := o.OrderService.GetOrder(orderID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "获取订单失败",
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data":    order,
	})
}

// CancelOrder 取消订单
func (o OrderController) CancelOrder(ctx *gin.Context) {
	// 获取路径参数 /order/:id/cancel
	idStr := ctx.Param("id")
	orderID, _ := strconv.ParseInt(idStr, 10, 64)

	// 获取当前用户id
	userID, _ := ctx.Get("userID")

	var uid int64
	switch v := userID.(type) {
	case int:
		uid = int64(v)
	case int64:
		uid = v
	case float64:
		uid = int64(v)
	case uint:
		uid = int64(v)
	}

	err := o.OrderService.CancelOrder(uid, orderID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "订单已取消",
	})
}
