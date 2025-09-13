package main

import (
	"bookstore-manager/config"
	"bookstore-manager/global"
	"bookstore-manager/web/router"
	"fmt"
	"net/http"
	"os"
)

func main() {
	//初始化，如mysql、配置文件、redis
	//配置
	config.InitConfig("conf/config.yaml")
	global.InitMysql()
	global.InitRedis()
	r := router.InitRouter()
	addr := fmt.Sprintf("%s:%d", "localhost", config.AppConfig.Server.Port)
	server := &http.Server{
		Addr:    addr,
		Handler: r,
	}
	err := server.ListenAndServe()
	if err != nil {
		fmt.Println("服务器启动失败")
		os.Exit(-1)
	}
}
