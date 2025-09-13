package service

import (
	"bookstore-manager/global"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/mojocn/base64Captcha"
)

type CaptchaService struct {
	store base64Captcha.Store
}

func NewCaptchaService() *CaptchaService {
	return &CaptchaService{
		store: base64Captcha.DefaultMemStore,
	}
}

type CaptchaResponse struct {
	CaptchaID     string `json:"captcha_id"`
	CaptchaBase64 string `json:"captchaBase64"`
}

// 生成验证码，将验证码ID和图片数据打包成CaptchaResponse结构返回
func (c *CaptchaService) GenerateCaptcha() (*CaptchaResponse, error) {
	//设置验证码的一些参数
	driver := base64Captcha.NewDriverDigit(
		80,  //高度
		240, //宽度
		4,   //验证码长度
		0.7, //干扰强度
		80,  //干扰数量
	)
	captcha := base64Captcha.NewCaptcha(driver, c.store)
	id, b64s, answer, err := captcha.Generate()
	if err != nil {
		return nil, err
	}
	log.Println("图片验证码真实answer:", answer)

	//用到redis,作用是存储有效期的图片验证码
	redisKey := fmt.Sprintf("captcha:%s", id)
	//key值是redisKey，value是answer
	err = global.RedisClient.Set(context.TODO(), redisKey, answer, 1*time.Minute).Err()
	if err != nil {
		return nil, err
	}
	return &CaptchaResponse{
		CaptchaID:     id,
		CaptchaBase64: b64s,
	}, nil
}

// 校验验证码
func (c *CaptchaService) VerifyCaptcha(captchaID, captChaValue string) bool {
	if captchaID == "" || captChaValue == "" {
		return false
	}

	//从Redis获取验证码答案
	ctx := context.Background()
	redisKey := fmt.Sprintf("captcha:%s", captchaID)
	storedAnswer, err := global.RedisClient.Get(ctx, redisKey).Result()
	if err != nil {
		return false
	}

	//比较用户输入的验证码和存储的答案
	isValid := storedAnswer == captChaValue
	if isValid {
		global.RedisClient.Del(ctx, redisKey)
	}
	return isValid
}
