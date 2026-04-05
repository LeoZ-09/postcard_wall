# 数据库配置指南

## 概述

明信片墙项目支持 **MySQL** 和 **SQLite** 两种数据库，默认使用 MySQL。

## MySQL 配置

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | `localhost` | 数据库主机地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USER` | `root` | 数据库用户名 |
| `DB_PASSWORD` | `''` | 数据库密码 |
| `DB_NAME` | `postcard_wall` | 数据库名称 |

### 设置方式

#### 方式一：.env 文件（推荐）

在项目根目录创建 `.env` 文件：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=postcard_wall
```

需要安装 `dotenv` 依赖：

```bash
npm install dotenv
```

然后在 `server/index.js` 顶部引入：

```javascript
import 'dotenv/config';
```

#### 方式二：系统环境变量

**Windows (PowerShell):**

```powershell
$env:DB_PASSWORD="your_password"
$env:DB_NAME="postcard_wall"
npm run server
```

**Windows (CMD):**

```cmd
set DB_PASSWORD=your_password
set DB_NAME=postcard_wall
npm run server
```

**Linux/macOS:**

```bash
export DB_PASSWORD="your_password"
export DB_NAME="postcard_wall"
npm run server
```

#### 方式三：直接修改默认值

编辑 [database/init.js](file:///c:/Users/Leo/Desktop/Postcard_Wall/database/init.js#L6-L19)：

```javascript
pool = mysql.createPool({
  host: 'your_host',
  port: 3306,
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
  // ...
});
```

### 创建数据库

登录 MySQL 后执行：

```sql
CREATE DATABASE postcard_wall
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

验证数据库：

```sql
SHOW DATABASES;
USE postcard_wall;
SHOW TABLES;
```

### 初始化表结构

启动服务时自动创建表结构：

```bash
npm run server
```

控制台输出 `Database initialized successfully` 表示成功。

### 测试连接

健康检查接口：

```bash
curl http://localhost:3001/api/health
```

响应示例：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## SQLite 配置（备用）

如需切换回 SQLite，修改 `package.json`：

```bash
npm uninstall mysql2
npm install better-sqlite3
```

### SQLite 数据文件位置

```
项目根目录/
└── data/
    └── postcard.db
```

### 启用 SQLite

编辑 [database/init.js](file:///c:/Users/Leo/Desktop/Postcard_Wall/database/init.js)：

```javascript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/postcard.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function getDatabase() {
  return db;
}

export async function initializeDatabase() {
  // SQLite 初始化代码
}
```

## 数据迁移

### 从 SQLite 迁移到 MySQL

1. 导出 SQLite 数据：

```bash
sqlite3 data/postcard.db ".dump" > backup.sql
```

2. 转换数据格式：

将 `.dump` 文件中的 SQLite 语法转换为 MySQL 语法，或使用工具：

```bash
npm install -g sqlite-to-mysql
sqlite2mysql backup.sql > mysql_backup.sql
```

3. 导入 MySQL：

```bash
mysql -u root -p postcard_wall < mysql_backup.sql
```

### 从 MySQL 迁移到 SQLite

1. 导出 MySQL 数据：

```bash
mysqldump -u root -p --compatible=sqlite3 postcard_wall > backup.sql
```

2. 清理 MySQL 特定语法：

```bash
# 移除 ENGINE、CHARSET 等 MySQL 特有内容
sed -i 's/ENGINE=InnoDB.*//g' backup.sql
sed -i 's/CHARSET=utf8mb4.*//g' backup.sql
```

3. 导入 SQLite：

```bash
sqlite3 data/postcard.db < backup.sql
```

## 常见问题

### 连接被拒绝

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案：**
1. 确认 MySQL 服务正在运行
2. 检查 `DB_HOST` 和 `DB_PORT` 配置
3. 确认防火墙允许 3306 端口

### 密码错误

```
Error: Access denied for user 'root'@'localhost'
```

**解决方案：**
1. 确认密码正确
2. 检查是否需要使用 socket 认证
3. 尝试无密码连接（本地开发）

### 数据库不存在

```
Error: Unknown database 'postcard_wall'
```

**解决方案：**
1. 创建数据库：
```sql
CREATE DATABASE postcard_wall;
```

### 字符集问题

```
Error: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD
```

**解决方案：**
1. 确保使用 `utf8mb4` 字符集
2. 检查表结构的字符集设置
3. 确认连接使用正确的字符集

## 性能优化

### MySQL

```javascript
pool = mysql.createPool({
  // 连接池大小
  connectionLimit: 10,
  // 连接超时
  connectTimeout: 10000,
  // 等待连接队列大小
  queueLimit: 0,
  // 保持连接活跃
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

### SQLite（开发环境）

```javascript
db.pragma('journal_mode = WAL');      // Write-Ahead Logging
db.pragma('synchronous = NORMAL');    // 平衡安全性和性能
db.pragma('cache_size = -64000');     // 64MB 缓存
db.pragma('temp_store = MEMORY');      // 临时表使用内存
```

## 备份与恢复

### MySQL 备份

```bash
# 全量备份
mysqldump -u root -p postcard_wall > backup_$(date +%Y%m%d).sql

# 压缩备份
mysqldump -u root -p postcard_wall | gzip > backup_$(date +%Y%m%d).sql.gz

# 仅备份数据
mysqldump -u root -p --no-create-info postcard_wall > data_backup.sql
```

### MySQL 恢复

```bash
# 从备份恢复
mysql -u root -p postcard_wall < backup_20240101.sql

# 从压缩备份恢复
gunzip < backup_20240101.sql.gz | mysql -u root -p postcard_wall
```

### SQLite 备份

```bash
# 备份（在线）
cp data/postcard.db data/backup_$(date +%Y%m%d).db

# 完整导出
sqlite3 data/postcard.db ".dump" > backup_$(date +%Y%m%d).sql
```

### SQLite 恢复

```bash
# 从 dump 文件恢复
sqlite3 data/postcard.db < backup_20240101.sql
```
