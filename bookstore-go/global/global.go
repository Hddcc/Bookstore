package global

import (
	"bookstore-manager/config"
	"bookstore-manager/model"
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DBClient *gorm.DB
var RedisClient *redis.Client
var Logger *zap.Logger

func InitMysql() {
	mysqlConfig := config.AppConfig.Database //用于读取配置
	//建立连接
	//	dsn := "root:123456@tcp(127.0.0.1:3306)/sql_demo?charset=utf8mb4&parseTime=True"
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		mysqlConfig.User, mysqlConfig.Password, mysqlConfig.Host, mysqlConfig.Port, mysqlConfig.Name)
	client, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		Logger.Fatal("连接数据库失败：", zap.Error(err))
	}
	if err := client.AutoMigrate(&model.User{}, &model.Book{}, &model.Category{}, &model.Order{}, &model.OrderItem{}, &model.Favorite{}); err != nil {
		Logger.Fatal("自动迁移表失败：", zap.Error(err))
	}
	DBClient = client
	Logger.Info("连接mysql成功")

}

func InitRedis() {
	redisConfig := config.AppConfig.Redis //用于读取配置
	//建立连接
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", redisConfig.Host, redisConfig.Port),
		Password: redisConfig.Password,
		DB:       redisConfig.DB,
	})
	RedisClient = client
	str, err := client.Ping(context.TODO()).Result()
	if err != nil {
		Logger.Fatal("redis连接失败：", zap.Error(err))
	}
	Logger.Info("Redis连接检查", zap.String("pong", str))
	Logger.Info("Redis连接成功")
}

func GetDB() *gorm.DB {
	return DBClient
}
func CloseDB() {
	if DBClient != nil {
		sqlDB, err := DBClient.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}
