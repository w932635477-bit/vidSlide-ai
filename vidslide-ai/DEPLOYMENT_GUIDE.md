# VidSlide AI - 部署指南

## 系统要求

### 硬件要求

- **CPU**: 4核心以上
- **内存**: 8GB以上（推荐16GB）
- **硬盘**: 10GB以上可用空间
- **网络**: 稳定的互联网连接（用于API调用）

### 软件要求

- **操作系统**: macOS / Linux / Windows
- **Node.js**: v18.0或更高版本
- **FFmpeg**: v4.4或更高版本
- **npm**: v8.0或更高版本

## 安装步骤

### 1. 安装Node.js

#### macOS

```bash
# 使用Homebrew
brew install node

# 或下载安装包
# https://nodejs.org/
```

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Windows

下载并安装Node.js安装包：https://nodejs.org/

### 2. 安装FFmpeg

#### macOS

```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows

1. 下载FFmpeg: https://ffmpeg.org/download.html
2. 解压到目录（如 `C:\ffmpeg`）
3. 添加到系统PATH环境变量

### 3. 克隆项目

```bash
git clone https://github.com/your-repo/vidslide-ai.git
cd vidslide-ai/vidslide-ai
```

### 4. 安装依赖

```bash
npm install
```

### 5. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的API密钥：

```env
# 百度语音识别API
BAIDU_ASR_APP_ID=your_app_id
BAIDU_ASR_API_KEY=your_api_key
BAIDU_ASR_SECRET_KEY=your_secret_key

# 百度NLP API
BAIDU_NLP_API_KEY=your_api_key
BAIDU_NLP_SECRET_KEY=your_secret_key

# 文心一言API
WENXIN_API_KEY=your_api_key
WENXIN_SECRET_KEY=your_secret_key

# 豆包AI生图API
DOUBAO_API_KEY=your_api_key
DOUBAO_API_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/images/generations
DOUBAO_MODEL=doubao-seedream-4-5-251128
```

### 6. 验证安装

```bash
# 运行测试
npm test -- src/tests/unit1-environment.test.js

# 应该看到所有环境检查通过
```

## API密钥获取

### 百度API

1. 访问 [百度AI开放平台](https://ai.baidu.com/)
2. 注册并登录
3. 创建应用获取API Key和Secret Key

### 文心一言API

1. 访问 [文心一言平台](https://yiyan.baidu.com/)
2. 申请API访问权限
3. 获取API Key和Secret Key

### 豆包AI API

1. 访问 [豆包AI平台](https://www.volcengine.com/)
2. 注册并申请图片生成API
3. 获取API Key和Endpoint

## 配置选项

### 基础配置

在代码中配置：

```javascript
import MasterPipeline from './src/services/MasterPipeline.js'

const pipeline = new MasterPipeline()

pipeline.setConfig({
  outputDir: './output',        // 输出目录
  enableCache: true,             // 启用缓存
  maxRetries: 3,                 // 最大重试次数
  timeout: 300000                // 超时时间（5分钟）
})
```

### 高级配置

#### 图片生成配置

编辑 `src/services/VisualAssetGenerator.js`:

```javascript
this.doubaoModel = 'doubao-seedream-4-5-251128'  // 模型名称
// 图片尺寸在generateImage方法中设置
size: '1920x1920'  // 图片尺寸（最小3686400像素）
```

#### FFmpeg配置

编辑 `src/services/EnhancedVideoRenderer.js`:

```javascript
// FFmpeg编码参数
-c:v libx264           // 视频编码器
-preset fast           // 编码速度（ultrafast/fast/medium/slow）
-crf 23                // 质量（0-51，越小质量越高）
```

## 生产环境部署

### 1. 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 创建启动脚本 start.js
cat > start.js << 'EOF'
import MasterPipeline from './src/services/MasterPipeline.js'

const pipeline = new MasterPipeline()
// 你的业务逻辑
EOF

# 启动服务
pm2 start start.js --name vidslide-ai

# 查看状态
pm2 status

# 查看日志
pm2 logs vidslide-ai

# 设置开机自启
pm2 startup
pm2 save
```

### 2. Docker部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

# 安装FFmpeg
RUN apk add --no-cache ffmpeg

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口（如果需要）
EXPOSE 3000

# 启动命令
CMD ["node", "start.js"]
```

构建和运行：

```bash
# 构建镜像
docker build -t vidslide-ai .

# 运行容器
docker run -d \
  --name vidslide-ai \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/.env:/app/.env \
  vidslide-ai
```

### 3. 使用Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  vidslide-ai:
    build: .
    container_name: vidslide-ai
    volumes:
      - ./output:/app/output
      - ./.env:/app/.env
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

运行：

```bash
docker-compose up -d
```

## 性能优化

### 1. 并发控制

```javascript
// 限制并发API调用数量
const pLimit = require('p-limit')
const limit = pLimit(3)  // 最多3个并发请求

const promises = items.map(item =>
  limit(() => generator.generateImage(item.prompt, item.path))
)
```

### 2. 缓存策略

```javascript
// 启用缓存
pipeline.setConfig({ enableCache: true })

// 定期清理缓存
setInterval(() => {
  pipeline.clearCache()
}, 3600000)  // 每小时清理一次
```

### 3. 资源限制

```javascript
// 限制内存使用
node --max-old-space-size=4096 start.js  // 限制4GB内存
```

## 监控和日志

### 1. 日志配置

```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// 在代码中使用
logger.info('视频生成开始', { videoPath })
logger.error('生成失败', { error: error.message })
```

### 2. 性能监控

```javascript
// 监控API调用时间
const startTime = Date.now()
await generator.generateImage(prompt, path)
const duration = Date.now() - startTime

logger.info('图片生成完成', { duration })
```

### 3. 健康检查

```javascript
// 创建健康检查端点
import express from 'express'

const app = express()

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

app.listen(3000)
```

## 故障排查

### 常见问题

#### 1. FFmpeg未找到

```bash
# 检查FFmpeg是否安装
ffmpeg -version

# 如果未安装，参考上面的安装步骤
```

#### 2. API调用失败

```bash
# 检查API密钥是否正确
cat .env

# 测试API连接
curl -X POST https://api.example.com/test \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 3. 内存不足

```bash
# 增加Node.js内存限制
node --max-old-space-size=8192 start.js

# 或在package.json中设置
"scripts": {
  "start": "node --max-old-space-size=8192 start.js"
}
```

#### 4. 图片生成失败

检查豆包API配置：
- 图片尺寸必须至少3686400像素（如1920x1920）
- API密钥是否有效
- 网络连接是否正常

### 日志分析

```bash
# 查看错误日志
tail -f error.log

# 搜索特定错误
grep "API错误" combined.log

# 统计错误次数
grep -c "错误" combined.log
```

## 备份和恢复

### 备份

```bash
# 备份输出文件
tar -czf output-backup-$(date +%Y%m%d).tar.gz output/

# 备份配置文件
cp .env .env.backup
```

### 恢复

```bash
# 恢复输出文件
tar -xzf output-backup-20260121.tar.gz

# 恢复配置文件
cp .env.backup .env
```

## 安全建议

1. **保护API密钥**
   - 不要将 `.env` 文件提交到版本控制
   - 使用环境变量或密钥管理服务

2. **限制访问权限**
   - 设置适当的文件权限
   - 使用防火墙限制网络访问

3. **定期更新**
   - 定期更新依赖包
   - 关注安全漏洞公告

4. **数据加密**
   - 对敏感数据进行加密存储
   - 使用HTTPS传输数据

## 更新和维护

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 运行测试
npm test

# 重启服务
pm2 restart vidslide-ai
```

### 数据库维护

```bash
# 清理旧文件
find output/ -type f -mtime +30 -delete

# 清理缓存
rm -rf temp/*
```

## 支持

如有问题，请：
1. 查看[API文档](./API_DOCUMENTATION.md)
2. 搜索[GitHub Issues](https://github.com/your-repo/vidslide-ai/issues)
3. 提交新的Issue

## 许可证

MIT License
