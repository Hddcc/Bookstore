package controller

import (
	"bookstore-manager/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CaptchController struct {
	CaptchaService *service.CaptchaService
}

func NewCaptchController() *CaptchController {
	return &CaptchController{
		CaptchaService: service.NewCaptchaService(),
	}
}

func (c *CaptchController) GenerateCaptcha(ctx *gin.Context) {
	//生成图片验证码
	//captchaSvc := service.NewCaptchaService()
	res, err := c.CaptchaService.GenerateCaptcha()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "生成验证码失败",
			"error":   err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"data":    res,
		"message": "生成验证码成功",
	})
}
