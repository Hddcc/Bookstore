# 在线图书电商平台 (Online Bookstore E-commerce Platform)

> 基于 Go (Gin) + React 的现代化全栈分布式电商系统，集成了 RabbitMQ 异步削峰、Redis 多级缓存与全链路容器化部署。

## 📖 项目简介

这是一个采用 **前后端分离** 架构的企业级 B2C 在线书店系统。不仅实现了完整的电商业务闭环（用户-商品-订单-支付），更作为高并发系统的演练靶场，深度实践了 **高可用缓存架构**、**消息队列异步解耦**、**容器化编排** 等生产级技术方案。

后端核心基于 **Go (Gin)** 框架构建，前端预编译集成 React 应用，所有组件均通过 **Docker Compose** 一键编排。

## 🚀 核心亮点 (Highlights)

*   **⚡ 高性能后端**: 基于 Go 协程 (Goroutine) 构建的高并发接口，结合 GORM 优化 (Preload/Covering Index)，有效解决 N+1 查询问题。
*   **🛡️ 高可用缓存**: 设计了 **L1(HTTP) + L2(Redis)** 多级缓存架构。采用 **Cache-Aside 模式** 保证数据一致性，引入 **随机 TTL (Jitter)** 策略有效防止缓存雪崩。
*   **🐇 异步削峰架构**: 引入 **RabbitMQ** 重构核心交易链路。通过 **异步下单** 机制，将数据库写压力从 500ms+ 优化至 50ms 级，彻底解耦交易核心与非核心业务。
*   **🐳 全栈容器化**: 编写 `Dockerfile` 与 `docker-compose.yml`，实现开发环境 (Dev) 与生产环境 (Prod) 的 **1:1 镜像级交付**，解决“在我机器上能跑”的经典痛点。
*   **🔌 健壮性设计**: 前端实施防御式编程，后端封装统一错误处理中间件。针对跨平台数据迁移，设计了 **Hex (十六进制) 字节流** 导入方案，完美解决字符集乱码难题。

## 🛠️ 技术栈 (Tech Stack)

| 领域 | 技术选型 | 核心作用 |
| :--- | :--- | :--- |
| **开发语言** | Go (Golang) 1.20+ | 高并发后端逻辑 |
| **Web 框架** | Gin | RESTful API 路由与中间件 |
| **数据库** | MySQL 8.0 | 核心业务数据持久化 |
| **ORM** | GORM | 数据对象映射与事务管理 |
| **缓存** | Redis | 热点数据缓存 / 分布式会话 / 验证码 |
| **消息队列** | RabbitMQ | 订单异步处理 / 流量削峰 |
| **容器化** | Docker & Compose | 环境编排与服务隔离 |
| **前端** | React | 现代化 SPA 单页应用 |

## 📂 项目结构

```bash
.
├── cmd/                # 程序主入口 (main.go)
├── conf/               # 配置文件 (yaml)
├── global/             # 全局单例 (DB/Redis/Logger)
├── model/              # 数据库模型 (Struct)
├── repository/         # 数据访问层 (DAO - 直接操作数据库)
├── service/            # 业务逻辑层 (Service - 处理缓存、事务、复杂逻辑)
├── web/                # Web 层
│   ├── controller/     # 控制器 (参数解析与响应封装)
│   ├── middleware/     # 中间件 (JWT/CORS/ErrorHandle)
│   └── router/         # 路由注册
├── mq/                 # 消息队列客户端与消费者逻辑
├── static/             # 前端静态资源 (React Build)
├── sql/                # SQL 初始化脚本
├── docker-compose.yml  # 容器编排文件
└── Dockerfile          # 后端镜像构建文件
```

## 💻 快速开始 (Quick Start)

### 前置要求
*   Docker & Docker Desktop (必装)
*   Git

### 一键启动
本项目已完全容器化，无需在本地安装 Go 或 MySQL 即可运行。

1.  **克隆项目**
    ```bash
    git clone https://github.com/Hddcc/Bookstore.git
    cd Bookstore
    ```

2.  **配置与启动**
    ```bash
    # 拉取镜像并后台启动所有服务 (MySQL, Redis, RabbitMQ, Go App)
    docker-compose up -d --build
    ```

3.  **访问系统**
    *   **前端页面**: 打开浏览器访问 `http://localhost:8080`
    *   **API 接口**: `http://localhost:8080/api/v1/...`

### 常见操作指南

*   **查看服务状态**: `docker-compose ps`
*   **查看应用日志**: `docker-compose logs -f bookstore-api`
*   **停止并清理**: `docker-compose down` (保留数据) / `docker-compose down -v` (警告：删除数据库数据)

## ⚖️ License
MIT License
