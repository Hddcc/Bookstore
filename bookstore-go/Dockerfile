# 使用官方 Go 镜像作为构建环境
# 注意：你的 go.mod 指定了 go 1.24.2，所以这里必须用最新的 go 镜像，否则会报错
FROM golang:alpine AS builder

# [新增] 设置 Go Proxy 解决国内下载依赖失败/超时的问题
ENV GOPROXY=https://goproxy.cn,direct

# 设置容器内的工作目录
WORKDIR /app

# 1. 先复制依赖文件 (利用 Docker 缓存层)
COPY go.mod go.sum ./
# 2. 下载依赖
RUN go mod download

# 3. 复制剩余的所有源码
COPY . .

# 4. 编译应用
RUN go build -o bookstore-app cmd/bookstore-manager/bookstore-manager.go

# --- 运行阶段 ---
FROM alpine:latest

# [可选] 如果运行阶段也需要装东西，可以换源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

WORKDIR /app

# 从构建阶段复制编译好的程序
COPY --from=builder /app/bookstore-app .
# 复制配置文件 (确保 conf 目录在 bookstore-go 下存在)
COPY --from=builder /app/conf ./conf
# [新增] 复制静态资源 (解决浏览器访问 404 的问题)
# 假设你的 index.html 和 css/js 都在 bookstore-go/static 目录下
COPY --from=builder /app/static ./static

# 暴露端口
EXPOSE 8080

CMD ["./bookstore-app"]