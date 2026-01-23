# VidSlide AI 部署指南

## 系统要求

### 软件依赖
- Node.js >= 16.x
- FFmpeg >= 4.x
- npm >= 8.x

### 系统资源
- CPU: 4核心或以上
- 内存: 8GB或以上
- 磁盘空间: 50GB或以上（用于视频处理和缓存）

## 安装步骤

### 1. 克隆代码库
```bash
cd /Users/weilei/VidSlide\ AI/vidslide-ai
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env` 文件并配置以下变量：
```env
# API密钥
DOUBAO_API_KEY=your_api_key_here

# 服务器配置
PORT=3002

# 文件路径
UPLOAD_DIR=../uploads
OUTPUT_DIR=../output
CACHE_DIR=../cache
```

### 4. 创建必要的目录
```bash
mkdir -p ../uploads ../output ../cache
mkdir -p ../cache/face-videos
mkdir -p ../cache/flip-cards
```

### 5. 验证FFmpeg安装
```bash
ffmpeg -version
ffprobe -version
```

## 启动服务

### 开发模式
```bash
node server.js
```

### 生产模式（使用PM2）
```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name vidslide-ai

# 查看状态
pm2 status

# 查看日志
pm2 logs vidslide-ai

# 重启服务
pm2 restart vidslide-ai

# 停止服务
pm2 stop vidslide-ai
```

## API使用

### Health检查
```bash
curl http://localhost:3002/health
```

### 自动生成视频
```bash
curl -X POST http://localhost:3002/api/auto-generate \
  -F "video=@/path/to/video.mp4" \
  -F "platform=douyin"
```

### 查询任务状态
```bash
curl http://localhost:3002/api/auto-generate/{taskId}/status
```

## 测试

### 运行MasterPipeline测试
```bash
node test-master-pipeline.js
```

### 运行API端点测试
```bash
node test-api-endpoints.js
```

## 监控和维护

### 日志位置
- 应用日志: PM2管理（`pm2 logs`）
- 错误日志: 控制台输出
- 任务状态: `../output/{taskId}/status.json`

### 清理缓存
```bash
# 清理旧的缓存文件（保留最近7天）
find ../cache -type f -mtime +7 -delete

# 清理旧的输出文件（保留最近30天）
find ../output -type d -mtime +30 -exec rm -rf {} +
```

### 磁盘空间监控
```bash
# 检查磁盘使用情况
df -h

# 检查各目录大小
du -sh ../uploads ../output ../cache
```

## 性能优化

### 1. FFmpeg优化
在 `ServerVideoCompositionService.js` 中调整FFmpeg参数：
```javascript
// 使用硬件加速（如果可用）
-hwaccel auto

// 调整编码预设
-preset fast  // 或 medium, slow

// 调整CRF质量
-crf 23  // 18-28之间，数值越小质量越高
```

### 2. 并发处理
限制同时处理的任务数量以避免资源耗尽：
```javascript
// 在server.js中添加任务队列
const maxConcurrentTasks = 3;
```

### 3. 缓存策略
- 启用视频片段缓存
- 缓存人脸提取结果
- 缓存翻转动画模板

## 故障排查

### 问题1: 服务器无法启动
**症状**: 端口被占用
**解决**:
```bash
# 查找占用端口的进程
lsof -i :3002

# 杀死进程
kill -9 <PID>
```

### 问题2: 视频处理失败
**症状**: 任务状态显示失败
**检查**:
1. 查看任务状态文件: `../output/{taskId}/status.json`
2. 检查FFmpeg是否正确安装
3. 验证输入视频格式是否支持
4. 检查磁盘空间是否充足

### 问题3: 内存不足
**症状**: 进程崩溃或OOM错误
**解决**:
```bash
# 增加Node.js内存限制
node --max-old-space-size=4096 server.js

# 或在PM2中配置
pm2 start server.js --name vidslide-ai --node-args="--max-old-space-size=4096"
```

### 问题4: Canvas安装失败
**症状**: npm install canvas失败
**解决**:
```bash
# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# 然后重新安装
npm install canvas
```

## 安全建议

### 1. 文件上传限制
- 限制文件大小（当前500MB）
- 验证文件类型
- 扫描恶意内容

### 2. API访问控制
```javascript
// 添加API密钥验证
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 3. 速率限制
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制100个请求
});

app.use('/api', limiter);
```

## 备份策略

### 1. 代码备份
```bash
# 使用Git
git add .
git commit -m "Backup before deployment"
git push
```

### 2. 数据备份
```bash
# 备份输出文件
tar -czf output-backup-$(date +%Y%m%d).tar.gz ../output

# 备份缓存
tar -czf cache-backup-$(date +%Y%m%d).tar.gz ../cache
```

### 3. 配置备份
```bash
# 备份环境变量
cp .env .env.backup
```

## 更新和升级

### 1. 更新依赖
```bash
# 检查过期的包
npm outdated

# 更新所有依赖
npm update

# 更新特定包
npm install package-name@latest
```

### 2. 代码更新
```bash
# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重启服务
pm2 restart vidslide-ai
```

## 联系和支持

- **问题反馈**: https://github.com/anthropics/claude-code/issues
- **文档**: 查看项目根目录下的Markdown文档
- **测试**: 运行测试脚本验证功能

## 附录

### 目录结构
```
VidSlide AI/
├── vidslide-ai/
│   ├── server.js                 # 主服务器文件
│   ├── src/
│   │   └── services/            # 服务模块
│   │       ├── MasterPipeline.js
│   │       ├── CardFlipAnimationGenerator.js
│   │       ├── FaceVideoExtractorServiceV2.js
│   │       ├── VisualAssetGenerator.js
│   │       ├── PracticalTimelineGenerator.js
│   │       └── ServerVideoCompositionService.js
│   ├── test-master-pipeline.js  # 测试脚本
│   ├── test-api-endpoints.js    # API测试
│   └── package.json
├── uploads/                      # 上传文件目录
├── output/                       # 输出文件目录
├── cache/                        # 缓存目录
│   ├── face-videos/
│   └── flip-cards/
└── test-videos/                  # 测试视频目录
```

### 环境变量说明
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3002 |
| DOUBAO_API_KEY | 豆包API密钥 | - |
| UPLOAD_DIR | 上传目录 | ../uploads |
| OUTPUT_DIR | 输出目录 | ../output |
| CACHE_DIR | 缓存目录 | ../cache |

---

**文档版本**: 1.0.0
**最后更新**: 2026-01-21
**维护者**: VidSlide AI Team
