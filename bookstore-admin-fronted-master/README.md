# 📚 博学书城管理系统 - 前端

这是博学书城管理系统的前端部分，基于React + TypeScript + Ant Design构建。

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   └── Layout.tsx      # 布局组件
├── pages/              # 页面组件
│   ├── Dashboard.tsx   # 仪表盘
│   ├── BookList.tsx    # 图书列表
│   ├── BookEdit.tsx    # 图书编辑
│   └── CategoryList.tsx # 分类管理
├── App.tsx             # 应用入口
├── index.tsx           # 渲染入口
└── App.css             # 全局样式
```

## 🎨 功能特性

### 1. 仪表盘
- 统计卡片展示
- 最近添加的图书
- 系统功能进度
- 快速操作按钮

### 2. 图书管理
- 图书列表展示
- 搜索和筛选
- 新增/编辑图书
- 删除图书
- 上架/下架操作

### 3. 分类管理
- 分类列表展示
- 新增/编辑分类
- 删除分类
- 分类状态管理

## 🛠️ 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Ant Design** - UI组件库
- **React Router** - 路由管理
- **Axios** - HTTP客户端

## 🎯 设计特色

### 圆角设计
- 所有按钮都采用圆角设计
- 输入框、选择器等组件统一圆角风格
- 卡片、模态框等容器采用圆角设计

### 现代化UI
- 渐变按钮效果
- 阴影和过渡动画
- 响应式布局
- 优雅的加载状态

### 用户体验
- 直观的操作界面
- 清晰的信息层级
- 友好的错误提示
- 流畅的交互体验

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建新组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Layout.tsx` 中添加菜单项

### 样式定制

- 全局样式在 `src/App.css` 中定义
- 组件样式使用内联样式或CSS模块
- 遵循Ant Design的设计规范

### API集成

- 使用Axios进行HTTP请求
- API基础URL在package.json中配置
- 统一的错误处理和加载状态

## 📱 响应式设计

- 桌面端：完整功能展示
- 平板端：适配中等屏幕
- 移动端：简化界面布局

## 🚀 部署

### 开发环境

```bash
npm start
```

### 生产环境

```bash
npm run build
```

构建后的文件在 `build/` 目录中。

## 📞 联系方式

- 项目维护者: [Mike Lin]
- 邮箱: 931002611@qq.com (一般晚上才会处理信息，有事情辛苦留言 ~)

---

如果这个项目对您有帮助，或者您觉得代码写得还不错，谢谢请我喝杯奶茶！您的支持是我持续开源的动力 💪

<div align="center">

**微信支付** (推荐) | **支付宝**
---|---
<img src="./pic/wechat.jpg" width="200" height="200" /> | <img src="./pic/zhifubao.jpg" width="200" height="200" />

</div>