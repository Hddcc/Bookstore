package config

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type ServerConfig struct {
	Port int `mapstructure:"port"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	Name     string `mapstructure:"name"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type RabbitMQConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	VHost    string `mapstructure:"vhost"`
}

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	RabbitMQ RabbitMQConfig `mapstructure:"rabbitmq"`
}

// 全局配置变量
var AppConfig Config
var zapLog *zap.Logger

// InitConfig 初始化配置
// path: 配置文件路径 (例如 "conf/config.yaml")
func InitConfig(path string, logger *zap.Logger) {
	zapLog = logger
	v := viper.New()

	// 1. 设置配置文件路径
	v.SetConfigFile(path)

	// 2. 读取配置
	if err := v.ReadInConfig(); err != nil {
		zapLog.Panic("读取配置文件失败", zap.Error(err))
	}

	// 3. 开启实时监听 (热加载)
	v.WatchConfig()
	v.OnConfigChange(func(e fsnotify.Event) {
		zapLog.Info("配置文件被修改", zap.String("file", e.Name))
		// 当文件变化时，重新解析到结构体
		if err := v.Unmarshal(&AppConfig); err != nil {
			zapLog.Error("重新解析配置失败", zap.Error(err))
		}
	})

	// 4. 解析到结构体
	if err := v.Unmarshal(&AppConfig); err != nil {
		zapLog.Panic("配置解析失败", zap.Error(err))
	}

	zapLog.Info("Viper 加载配置成功")
}
