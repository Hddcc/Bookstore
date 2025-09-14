package router

import (
	"bookstore-manager/repository"
	"bookstore-manager/service"
	"bookstore-manager/web/controller"
	"bookstore-manager/web/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	// 添加CORS中间件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, X-Requested-With, Cache-Control, X-Api-Key")
		c.Header("Access-Control-Expose-Headers", "Content-Length")
		c.Header("Access-Control-Allow-Credentials", "true")

		// 处理预检请求
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})
	userController := controller.NewUserController()
	captchController := controller.NewCaptchController()
	bookController := controller.NewBookController()
	favoriteDAO := repository.NewFavoriteDAO()
	favoriteService := service.NewFavoriteService(favoriteDAO)
	favoriteController := controller.NewFavoriteController(favoriteService)
	orderController := controller.NewOrderController()
	v1 := r.Group("/api/v1")
	{
		user := v1.Group("/user")
		{
			user.POST("/register", userController.UserRegister)
			user.POST("/login", userController.UserLogin)
		}
		auth := user.Group("")
		{
			auth.Use(middleware.JWTAuthMiddleware())
			{
				auth.GET("/profile", userController.GetUserProfile)
				auth.PUT("/profile", userController.UpdateUserProfile)
				auth.PUT("/password", userController.ChangePassword)
				auth.DELETE("logout", userController.Logout)
			}
		}

		book := v1.Group("/book")
		{
			book.GET("/hot", bookController.GetHotBooks)
			book.GET("/new", bookController.GetNewBooks)
			book.GET("/list", bookController.GetBookList)
			book.GET("/search", bookController.Searchbooks)
			book.GET("/detail/:id", bookController.GetBookDetail)
		}
		favorite := v1.Group("favorite")
		favorite.Use(middleware.OptionalAuthMiddleware())
		{
			favorite.POST("/:id", favoriteController.AddFavorite)
			favorite.DELETE("/:id", favoriteController.RemoveFavorite)
			favorite.GET("/list", favoriteController.GetUserFavorites)
			favorite.GET("/count", favoriteController.GetUserFavoriteCount)
			favorite.GET("/:id/check", favoriteController.CheckFavorite)
		}
		order := v1.Group("/order")
		order.Use(middleware.JWTAuthMiddleware())
		{
			order.POST("/create",orderController.CreateOrder)
			order.GET("/list",orderController.GetUserOrders)
			order.POST("/:id/pay",orderController.PayOrder)
		}

	}

	captcha := v1.Group("/captcha")
	{
		captcha.GET("/generate", captchController.GenerateCaptcha)
	}
	r.Static("/static", "./static/static")
	r.NoRoute(func(c *gin.Context) {
		c.File("./static/index.html")
	})

	return r
}
