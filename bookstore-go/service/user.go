package service

//service处理具体的业务逻辑
import (
	"bookstore-manager/jwt"
	"bookstore-manager/model"
	"bookstore-manager/mq"
	"bookstore-manager/repository"
	"encoding/base64"
	"errors"
)

type UserService struct {
	UserDB *repository.UserDAO
}

// services --> repository --> 调用db方法（对应model的模型）
func NewUserService() *UserService {
	return &UserService{
		UserDB: repository.NewUserDAO(),
	}
}

type LoginResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpireIn     int64     `json:"expire_in"`
	UserInfo     *UserInfo `json:"user_info"`
}

type UserInfo struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

func (u *UserService) UserRegister(username, password, phone, email string) error {
	// 1、检查用户名，邮箱，手机号的唯一性
	exits, err := u.UserDB.CheckUserExists(username, phone, email)
	if err != nil {
		return err
	}
	if exits {
		return errors.New("用户已存在，请检查用户名、邮箱或手机号")
	}

	//2、密码加密 （base64编码）
	encodePassword := u.encodePassword(password)

	err = u.createUser(username, encodePassword, phone, email)
	if err != nil {
		return err
	}
	go func() {
		// 这里可以发送用户名或者用户ID
		mq.SendMessage("user.registered", username)
	}()
	return nil
}

func (u *UserService) UserLogin(username, password string) (*LoginResponse, error) {
	//查询用户是否存在
	user, err := u.UserDB.GetUserByUsername(username)
	if err != nil {
		return nil, errors.New("用户不存在")
	}
	//若用户存在则验证密码是否正确
	if !u.verifyPassword(password, user.Password) {
		return nil, errors.New("密码错误")
	}
	//JWT
	token, err := jwt.GenerateTokenPair(uint(user.ID), user.Username)
	if err != nil {
		return nil, errors.New("生成token失败")
	}
	response := &LoginResponse{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		ExpireIn:     token.ExpiresIn,
		UserInfo: &UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			Phone:    user.Phone,
		},
	}
	return response, nil
}

// 验证密码
func (u *UserService) verifyPassword(inputPassword, truePassword string) bool {
	eInput := u.encodePassword(inputPassword)
	return eInput == truePassword
}

func (u *UserService) encodePassword(password string) string {
	return base64.StdEncoding.EncodeToString([]byte(password))
}

func (u *UserService) createUser(username, password, phone, email string) error {
	user := &model.User{
		Username: username,
		Password: password,
		Phone:    phone,
		Email:    email,
	}
	return u.UserDB.CreateUser(user)
}

func (u *UserService) GetUserByID(userID int) (*model.User, error) {
	user, err := u.UserDB.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}
	return user, nil
}

func (u *UserService) UpdateUserInfo(user *model.User) error {
	existinguser, err := u.UserDB.GetUserByID(user.ID)
	if err != nil {
		return errors.New("用户不存在")
	}
	existinguser.Phone = user.Phone
	existinguser.Email = user.Email
	existinguser.Avatar = user.Avatar

	// 调用DAO（数据库）层更新信息
	err = u.UserDB.UpdateUser(existinguser)
	if err != nil {
		return err
	}
	return nil
}

func (u *UserService) ChangePassword(userID int, oldPassword, newPassword string) error {
	// 1.获取对应用户
	user, err := u.UserDB.GetUserByID(userID)
	if err != nil {
		return errors.New("用户不存在")
	}
	// 2.验证旧密码
	if !u.verifyPassword(oldPassword, user.Password) {
		return errors.New("原密码错误")
	}
	// 3.更新新密码
	enPassword := u.encodePassword(newPassword)
	user.Password = enPassword
	err = u.UserDB.UpdateUser(user)
	if err != nil {
		return errors.New("修改失败")
	}
	return nil
}
