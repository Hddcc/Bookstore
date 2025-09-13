package global

import (
	"bookstore-manager/config"
	"bookstore-manager/model"
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DBClient *gorm.DB
var RedisClient *redis.Client

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
		log.Fatalln("连接数据库失败：", err)
	}
	if err := client.AutoMigrate(&model.User{}); err != nil {
		log.Fatalln("自动迁移表失败：", err)
	}
	DBClient = client
	log.Println("连接mysql成功")

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
		log.Fatalln("redis连接失败：", err)
	}
	log.Println("str:", str)
	log.Println("Redis连接成功")
}

func GetDB() *gorm.DB {
	return DBClient
}
func CloseDB() {
	if DBClient != nil {
		sqlDB, err := DBClient.DB()
		if err != nil {
			sqlDB.Close()
		}
	}
}
