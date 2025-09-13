package middleware

import (
	"bookstore-manager/jwt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

//约定：从请求头中获取认证信息
//header key为Authorization value是Bearer Authorization xxxx

// JWTAuthMiddleware JWT认证中间件
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// 从请求头获取token
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    1,
				"message": "请求头中缺少Authorization字段",
			})
			ctx.Abort()
			return
		}

		//检查Bearer前缀
		tokenParts := strings.SplitN(authHeader, " ", 2)
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    -1,
				"message": "Authorization格式错误,应为:Bearer {token}",
			})
			ctx.Abort()
			return
		}

		tokenString := tokenParts[1]

		// 解析并验证token
		claims, err := jwt.ParseToken(tokenString)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    -1,
				"message": "无效token",
				"error":   err.Error(),
			})
			ctx.Abort()
			return
		}

		//检查token类型，只许access token访问API
		if claims.TokenType != "access" {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"code":    -1,
				"message": "token类型错误,请使用access token",
			})
			ctx.Abort()
			return
		}

		//将用户信息存储到上下文中
		ctx.Set("userID", int(claims.UserID))
		ctx.Set("username", claims.Username)

		//继续处理请求
		ctx.Next()
	}
}

// 可选认证中间件（用于可选登录的接口）
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		//从请求头获取token
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			//如果没有token，继续处理请求
			ctx.Next()
			return
		}

		//检查Bearer前缀
		tokenParts := strings.SplitN(authHeader, " ", 2)
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			ctx.Next()
			return
		}

		tokenString := tokenParts[1]

		//解析并验证token
		claims, err := jwt.ParseToken(tokenString)
		if err != nil {
			ctx.Next()
			return
		}

		//检查token类型
		if claims.TokenType == "access" {
			//将用户信息存储到上下文中
			ctx.Set("userID", int(claims.UserID))
			ctx.Set("username", claims.Username)
			ctx.Set("authenticated", true)
		}
		ctx.Next()
	}
}
