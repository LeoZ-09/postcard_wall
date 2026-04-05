# 明信片电子展示墙 - 部署文档

## 项目简介

明信片电子展示墙是一个全栈 Web 应用，用于管理个人寄出和收到的明信片。系统支持上传和管理明信片的正面和背面图片，自动计算寄送天数，并实现了图片去重存储机制。

## 技术栈

### 后端
- Node.js + Express
- SQLite (better-sqlite3)
- Sharp (图片处理)
- Multer (文件上传)
- Zod (数据验证)

### 前端
- React 18
- React Router v6
- Axios
- Vite

## 项目结构

```
postcard-wall/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── context/         # React Context
│   │   └── styles/         # 全局样式
│   └── index.html
├── server/                 # 后端 Express 应用
│   ├── routes/             # API 路由
│   ├── middleware/         # 中间件
│   ├── database/          # 数据库相关
│   │   └── models/        # 数据模型
│   └── index.js
├── tests/                  # 测试文件
├── uploads/                # 上传文件目录
│   └── images/
├── data/                    # 数据库文件目录
├── package.json
├── vite.config.js
└── jest.config.js
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

这将同时启动前端开发服务器 (http://localhost:5173) 和后端 API 服务器 (http://localhost:3001)。

### 生产构建

```bash
npm run build
```

## 环境变量

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| PORT | 3001 | 服务器端口 |
| NODE_ENV | development | 运行环境 |

## API 文档

### 明信片 API

#### 获取明信片列表
```
GET /api/postcards?page=1&limit=12&status=pending
```

#### 获取单个明信片
```
GET /api/postcards/:id
```

#### 按编码获取明信片
```
GET /api/postcards/code/:code
```

#### 获取统计信息
```
GET /api/postcards/statistics
```

#### 创建明信片
```
POST /api/postcards
Content-Type: application/json

{
  "frontImageId": "uuid",
  "backImageId": "uuid",
  "senderName": "寄件人",
  "recipientName": "收件人",
  "sentDate": "2024-01-01T00:00:00.000Z",
  "deliveredDate": "2024-01-06T00:00:00.000Z",
  "description": "描述",
  "status": "pending"
}
```

#### 更新明信片
```
PUT /api/postcards/:id
Content-Type: application/json

{
  "senderName": "新寄件人",
  "status": "delivered"
}
```

#### 删除明信片
```
DELETE /api/postcards/:id
```

### 图片 API

#### 上传图片
```
POST /api/images/upload
Content-Type: multipart/form-data

image: <file>
```

#### 获取图片列表
```
GET /api/images?page=1&limit=20
```

#### 获取单张图片
```
GET /api/images/:id
```

#### 删除图片
```
DELETE /api/images/:id
```

## 功能特性

### 1. 图片去重机制
系统通过 SHA-256 哈希检测重复图片。当上传相同图片时，系统会：
1. 计算图片内容哈希
2. 检查哈希是否已存在于数据库
3. 如存在，返回现有图片引用，避免重复存储

### 2. 图片选择器
- 从已上传图片库选择
- 支持即时上传新图片
- 网格预览，支持分页

### 3. 明信片管理
- 创建、编辑、删除明信片
- 查看正面和背面图片
- 自动计算寄送天数
- 状态跟踪（待寄出/运输中/已送达）

### 4. 响应式设计
- 桌面端：4 列网格
- 平板端：3 列网格
- 移动端：2 列网格

### 5. 数据验证
- 前端：React 表单验证
- 后端：Zod schema 验证

## 生产部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start server/index.js --name postcard-api

# 使用 Nginx 反向代理
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/postcard-wall/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /path/to/postcard-wall/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "server/index.js"]
```

## 运行测试

```bash
npm test
```

## 注意事项

1. 上传目录 `uploads/images` 需要有写入权限
2. 数据库目录 `data` 需要有写入权限
3. 图片不会进行压缩处理，会保留原始清晰度
4. 最大文件大小限制为 50MB
