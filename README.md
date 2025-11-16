# 传输助手 - 跨平台剪贴板同步工具

一个基于 Web 的跨平台剪贴板同步工具，支持实时同步文本和文件内容。

## 功能特性

- **跨设备同步**：支持在不同设备之间实时同步剪贴板内容
- **文本与文件支持**：不仅支持文本内容，还支持文件传输
- **实时同步**：通过 WebSocket 实现实时内容同步
- **用户认证**：支持用户注册登录，以及访客模式
- **历史记录**：保存剪贴板历史记录，方便找回
- **中文支持**：完美支持中文文件名和内容
- **时区处理**：正确显示本地时间（支持中国时区）
- **多设备同步**：在多个设备上保持剪贴板内容一致

## 技术架构

- **前端**：React + TypeScript
- **后端**：Express + TypeScript
- **数据库**：SQLite
- **实时通信**：Socket.IO
- **文件上传**：Multer
- **认证**：JWT

## 系统架构

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ──────────────►  │   Backend       │
│   (React)       │                  │   (Express)     │
│                 │ ◄──────────────  │                 │
│   WebSocket     │    WebSocket     │   Socket.IO     │
└─────────────────┘                  └─────────────────┘
                                            │
                                            │ Database
                                            ▼
                                     ┌─────────────────┐
                                     │   SQLite        │
                                     └─────────────────┘
```

## 安装与运行

### 环境要求

- Node.js (v14.0.0 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆项目
   ```bash
   git clone <repository-url>
   cd clipboard-sync
   ```

2. 安装依赖
   ```bash
   # 安装后端依赖
   cd backend
   npm install
   
   # 安装前端依赖
   cd ../frontend
   npm install
   ```

3. 配置环境变量
   ```bash
   # 在项目根目录创建 .env 文件
   cp .env.example .env
   # 编辑 .env 文件，设置相关配置
   ```

4. 构建项目
   ```bash
   # 构建前端
   cd frontend
   npm run build
   
   # 将前端构建文件复制到后端目录
   cp -r dist ../backend/dist/frontend-dist
   
   # 构建后端
   cd ../backend
   npm run build
   ```

5. 启动服务
   ```bash
   cd backend
   npm start
   ```

### 环境变量配置

- `PORT`：服务端口（默认 5681）
- `JWT_SECRET`：JWT 密钥（重要，生产环境请修改）
- `FRONTEND_URL`：前端 URL（默认 * 允许所有域名）

## 使用说明

1. 访问 `http://localhost:5681`
2. 可以选择注册/登录或使用访客模式
3. 点击"粘贴"按钮同步剪贴板内容或上传文件
4. 在其他设备上访问相同 URL，内容会自动同步

### 功能操作

- **粘贴内容**：点击"粘贴"按钮同步当前剪贴板内容
- **上传文件**：点击"粘贴"后选择"取消"可上传文件
- **查看历史**：登录用户可查看和管理历史记录
- **复制内容**：点击"复制"将内容复制到本地剪贴板

## 项目结构

```
clipboard-sync/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── controllers/     # API 控制器
│   │   ├── services/        # 业务逻辑服务
│   │   ├── database/        # 数据库相关
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   ├── routes.ts        # 路由定义
│   │   └── socket.ts        # Socket.IO 逻辑
│   └── dist/              # 构建输出目录
├── frontend/         # 前端项目
│   ├── src/
│   │   ├── services/        # 前端服务
│   │   ├── App.tsx          # 主应用组件
│   │   └── index.tsx        # 入口文件
│   └── dist/              # 构建输出目录
├── uploads/          # 文件上传目录
├── .env             # 环境变量配置
└── README.md        # 项目说明
```

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 剪贴板接口
- `POST /api/clipboard` - 创建剪贴板内容（需认证）
- `GET /api/clipboard` - 获取最新内容（需认证）
- `POST /api/clipboard/guest` - 创建访客剪贴板内容
- `GET /api/clipboard/guest` - 获取访客最新内容

### 文件接口
- `POST /api/upload` - 文件上传（需认证）
- `POST /api/upload/guest` - 访客文件上传
- `GET /api/files/:filename` - 文件下载

### 历史记录接口
- `GET /api/history` - 获取历史记录（需认证）
- `DELETE /api/history/:id` - 删除历史记录（需认证）
- `PUT /api/history/:id` - 设置为最新内容（需认证）

## WebSocket 事件

- `clipboard-update` - 剪贴板内容更新
- `user-authenticated` - 用户认证事件

## 配置说明

### 数据库配置

项目默认使用 SQLite，数据文件为 `backend/clipboard.db`

### 文件上传配置

- 最大文件大小：10MB
- 上传目录：`uploads/`
- 文件名处理：使用唯一ID避免冲突

## 部署指南

### 生产环境部署

1. 修改 `.env` 中的安全配置
2. 设置合适的 `JWT_SECRET`
3. 配置反向代理（如 Nginx）
4. 设置 SSL 证书

### Docker 部署 (可选)

```dockerfile
# Dockerfile 示例
FROM node:16-alpine

WORKDIR /app

# 复制后端代码
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# 复制前端构建文件
COPY frontend/dist/ ./dist/frontend-dist

# 构建
RUN npm run build

EXPOSE 5681

CMD ["npm", "start"]
```

## 开发说明

### 后端开发

```bash
# 启动后端开发服务器
cd backend
npm run dev
```

### 前端开发

```bash
# 启动前端开发服务器
cd frontend
npm run dev
```

## 常见问题

### 中文文件名问题

项目已内置中文文件名处理机制，支持中文文件名的上传和下载。

### 时区问题

服务器时间已配置为本地时区，时间显示会正确反映本地时间。

### 同步延迟

WebSocket 实现实时同步，通常延迟在毫秒级别。

## 许可证

MIT License

## 贡献

欢迎提交问题和 Pull Request 来改进项目。

## 联系方式

如有问题，请提交 GitHub Issues。