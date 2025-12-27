package controller

//主要用于解析HTTP请求参数,然后告诉Service层该做什么，最后把结果返回给用户。
import (
	"bookstore-manager/jwt"
	"bookstore-manager/model"
	"bookstore-manager/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	UserService *service.UserService
}

func NewUserController() *UserController {
	return &UserController{
		UserService: service.NewUserService(),
	}
}

// 注册的请求参数
type RegisterRequest struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
	Email           string `json:"email"`
	Phone           string `json:"phone"`
	CaptchaID       string `json:"captcha_id"`
	CaptchaValue    string `json:"captcha_value"`
}

type LoginRequest struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	CaptchaID    string `json:"captcha_id"`
	CaptchaValue string `json:"captcha_value"`
}

func (u *UserController) UserRegister(ctx *gin.Context) {
	var req RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "参数绑定失败",
			"error":   err.Error(),
		})
		return
	}

	captchaSvc := service.NewCaptchaService()
	if !captchaSvc.VerifyCaptcha(req.CaptchaID, req.CaptchaValue) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "验证码错误",
		})
		return
	}

	//验证两次输入的密码是否一致
	if req.Password != req.ConfirmPassword {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "两次输入的密码不一致",
		})
		return
	}
	// svc := service.NewUserService()
	err := u.UserService.UserRegister(req.Username, req.Password, req.Phone, req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "注册成功",
	})
}

func (u *UserController) UserLogin(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请求参数绑定错误",
			"error":   err.Error(),
		})
		return
	}
	//1、验证图片验证码
	captchaSvc := service.NewCaptchaService()
	if !captchaSvc.VerifyCaptcha(req.CaptchaID, req.CaptchaValue) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "验证码错误",
		})
		return
	}

	//2、校验用户信息（是否有这个用户，密码是否正确）
	//userSvc := service.NewUserService()
	response, err := u.UserService.UserLogin(req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": err.Error(),
		})
		return
	}
	//3、返回JWT给用户，后面发送请求就知道是哪个用户发送的了
	ctx.JSON(200, gin.H{
		"code":    0,
		"data":    response,
		"message": "登陆成功",
	})
}

func (u *UserController) GetUserProfile(ctx *gin.Context) {
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

	user, err := u.UserService.GetUserByID(uid)
	if err != nil {
		ctx.JSON(500, gin.H{
			"code":    -1,
			"message": err.Error(),
		})
		return
	}
	response := gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"phone":      user.Phone,
		"avatar":     user.Avatar,
		"created_at": user.CreatedAt.Format("2006-01-02 15:04:05"),
		"updated_at": user.UpdatedAt.Format("2006-01-02 15:04:05"),
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"data":    response,
		"message": "获取用户信息成功",
	})
}

func (u *UserController) UpdateUserProfile(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code":    -1,
			"message": "用户未登录",
		})
		return
	}
	var updateData struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Avatar   string `json:"avatar"`
	}

	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "参数绑定错误",
			"error":   err.Error(),
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

	user := &model.User{
		Username: updateData.Username,
		Email:    updateData.Email,
		Phone:    updateData.Phone,
		Avatar:   updateData.Avatar,
	}
	user.ID = uid // ID is embedded in BaseModel, so we set it here
	err := u.UserService.UpdateUserInfo(user)
	if err != nil {
		ctx.JSON(500, gin.H{
			"code":    -1,
			"message": "更新用户信息失败",
			"error":   err.Error(),
		})
		return
	}

	updatedUser, err := u.UserService.GetUserByID(uid)
	if err != nil {
		ctx.JSON(500, gin.H{
			"code":    -1,
			"message": "更新用户信息失败",
		})
		return
	}

	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "更新用户信息成功",
		"data":    updatedUser,
	})
}

func (u *UserController) ChangePassword(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code":    -1,
			"message": "用户未登录",
		})
		return
	}
	var passwordData struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := ctx.ShouldBindJSON(&passwordData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "请求参数错误",
			"error":   err.Error(),
		})
		return
	}
	if len(passwordData.NewPassword) < 6 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "新密码至少6位",
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

	err := u.UserService.ChangePassword(uid, passwordData.OldPassword, passwordData.NewPassword)
	if err != nil {
		ctx.JSON(500, gin.H{
			"code":  -1,
			"error": err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"code":    0,
		"message": "修改密码成功",
	})
}

func (u *UserController) Logout(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"code":    -1,
			"message": "用户未登录",
		})
		return
	}

	var uid uint
	switch v := userID.(type) {
	case int:
		uid = uint(v)
	case int64:
		uid = uint(v)
	case float64:
		uid = uint(v)
	case uint:
		uid = v
	}

	//撤销用户token
	err := jwt.RevokeToken(uid)
	if err != nil {
		ctx.JSON(500, gin.H{
			"code":    -1,
			"message": "退出登录失败",
			"error":   err.Error(),
		})
		return
	}
}
