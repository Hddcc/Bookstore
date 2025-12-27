package repository

//repository直接和数据库打交道，比如增删改查
import (
	"bookstore-manager/global"
	"bookstore-manager/model"

	"gorm.io/gorm"
)

// 定义 UserDAO 结构体，用于封装所有与用户表相关的数据库操作
type UserDAO struct {
	// db 持有 GORM 数据库连接实例，所有用户相关的数据库操作都通过它执行
	db *gorm.DB
}

// NewUserDAO初始化并返回一个包含数据库连接的 UserDAO实例，封装所有用户表操作。
func NewUserDAO() *UserDAO {
	return &UserDAO{
		db: global.GetDB(),
	}
}

// 创建新用户
func (u *UserDAO) CreateUser(user *model.User) error {
	return u.db.Debug().Create(user).Error
}

// 检查用户信息是否已经存在
func (u *UserDAO) CheckUserExists(username, phone, email string) (bool, error) {
	var count int64
	err := u.db.Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	if err != nil {
		return false, err
	}
	if count > 0 {
		return true, err
	}
	err = u.db.Model(&model.User{}).Where("phone = ?", phone).Count(&count).Error
	if err != nil {
		return false, err
	}
	if count > 0 {
		return true, err
	}
	err = u.db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	if err != nil {
		return false, err
	}
	if count > 0 {
		return true, err
	}

	return count > 0, nil
}

// 通过username查询对应的user是否存在于数据库中
func (u *UserDAO) GetUserByUsername(username string) (*model.User, error) {
	var user *model.User
	err := u.db.Debug().Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (u *UserDAO) GetUserByID(id int64) (*model.User, error) {
	var user model.User
	err := u.db.Debug().First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserDAO) UpdateUser(user *model.User) error {
	if err := u.db.Debug().Save(user).Error; err != nil {
		return err
	}
	return nil
}
