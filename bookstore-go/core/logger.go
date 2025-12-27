package core

import (
	"bookstore-manager/global"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

// InitLogger 初始化Logger
func InitLogger() {
	// 配置 Lumberjack 归档
	writeSyncer := getLogWriter()
	encoder := getEncoder()

	core := zapcore.NewCore(encoder, writeSyncer, zapcore.DebugLevel)

	// zap.AddCaller() 显示调用文件和行号
	logger := zap.New(core, zap.AddCaller())
	global.Logger = logger
	zap.ReplaceGlobals(logger) // 替换全局的 logger
}

func getEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder   // 时间格式 2023-01-01T00:00:00.000Z
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder // 大写 INFO ERROR
	return zapcore.NewConsoleEncoder(encoderConfig)         // 控制台格式输出，便于通过 docker logs 查看
}

func getLogWriter() zapcore.WriteSyncer {
	lumberJackLogger := &lumberjack.Logger{
		Filename:   "logs/bookstore.log", //日志文件位置
		MaxSize:    10,                   //单文件最大容量(MB)
		MaxBackups: 5,                    //保留旧文件的最大数量
		MaxAge:     30,                   //保留旧文件的最大天数
		Compress:   false,                //是否压缩/归档旧文件
	}
	// 同时输出到文件和控制台
	return zapcore.NewMultiWriteSyncer(zapcore.AddSync(lumberJackLogger), zapcore.AddSync(os.Stdout))
}
