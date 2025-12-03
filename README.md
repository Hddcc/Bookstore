# 博学书城 (Bookstore-Go)

一个功能丰富的在线网上书城 Web 应用，后端使用 Go 语言和 Gin 框架，并集成 React 前端。项目涵盖了用户认证、图书浏览、搜索、收藏、订单管理等核心电商功能。

## 功能特性

- **用户模块**:
  - 用户注册与登录
  - JWT (JSON Web Token) 认证与鉴权
  - 查看和修改个人信息
  - 修改密码与安全退出
  - 图片验证码增强安全性

- **图书模块**:
  - 首页热门图书和新书推荐
  - 图书列表分页展示
  - 按书名、作者、描述进行模糊搜索
  - 查看图书详细信息

- **收藏模块**:
  - 添加图书到个人收藏
  - 从收藏中移除图书
  - 查看个人收藏列表
  - 实时检查某本书是否已被收藏

- **订单模块**:
  - 从购物车创建新订单
  - 查看个人历史订单列表
  - 模拟支付并更新订单状态

- **前端集成**:
  - 提供预编译的 React 静态文件
  - 后端路由无缝承载前端应用

## 技术栈

- **后端**: Go
- **Web 框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL
- **缓存/会话**: Redis (用于 JWT 和验证码)
- **前端**: React (预编译)

## 快速开始

### 环境依赖

- Go (建议 1.18 或更高版本)
- 一个正在运行的 MySQL 服务 (建议 8.0+)
- 一个正在运行的 Redis 服务

### 安装与运行

1.  **克隆仓库：**
    ```bash
    git clone https://github.com/your-username/bookstore-go.git
    cd bookstore-go
    ```

2.  **配置环境：**
    打开 `conf/config.yaml` 文件，根据您的本地环境修改 `database` (MySQL) 和 `redis` 的连接信息。
    ```yaml
    server:
      port: 8080

    database:
      host: 127.0.0.1
      port: 3306
      user: root
      password: your_mysql_password
      name: bookstore

    redis:
      host: 127.0.0.1
      port: 6379
      password: ""
      db: 0
    ```

3.  **初始化数据库：**
    - 连接到您的 MySQL 服务。
    - 执行 `sql/bookstore.sql` 文件中的 SQL 语句来创建数据库和所有必需的表。
    - (可选) 执行 `sql/mock.sql` 来填充一些初始的模拟数据。

4.  **安装依赖：**
    此命令将下载所有必需的 Go 模块。
    ```bash
    go mod tidy
    ```

5.  **运行程序：**
    ```bash
    go run ./cmd/bookstore-manager/bookstore-manager.go
    ```
    程序默认将在 `http://localhost:8080` 启动服务。您可以在浏览器中直接访问此地址。

## 项目结构

```
.
├── cmd/                # 程序主入口
│   └── bookstore-manager/
├── conf/               # 配置文件 (config.yaml)
├── config/             # Go 配置模型
├── global/             # 全局变量 (数据库、Redis 实例)
├── jwt/                # JWT 认证逻辑
├── model/              # 数据模型 (ORM 结构体)
├── repository/         # 数据访问层 (DAO)
├── service/            # 业务逻辑层
├── sql/                # 数据库结构和模拟数据
├── static/             # 编译后的前端静态资源
└── web/                # Web 相关层
    ├── controller/     # 控制器 (处理请求)
    ├── middleware/     # 中间件 (如 JWT 认证)
    └── router/         # API 路由配置
```

## 项目展示
![主页](bookstore-admin-fronted/show_main.png)
![书籍详情](bookstore-admin-fronted/show_book.png)
![购物车](bookstore-admin-fronted/show_pay.png)
