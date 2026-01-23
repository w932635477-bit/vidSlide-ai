# VidSlide AI 项目流程图

> **完整的视频自动生成系统工作流程详解**
> 
> 生成时间: 2026-01-22
> 版本: v1.0

---

## 📋 目录

1. [系统架构概览](#系统架构概览)
2. [核心工作流程](#核心工作流程)
3. [详细流程图](#详细流程图)
4. [关键服务说明](#关键服务说明)
5. [数据流转](#数据流转)
6. [技术栈](#技术栈)

---

## 🏗️ 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      VidSlide AI 系统                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   前端界面    │ ───▶ │  后端服务器   │ ───▶ │  AI服务   │ │
│  │  (React)     │      │  (Node.js)   │      │  (豆包)   │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │       │
│         │                      ▼                     │       │
│         │              ┌──────────────┐              │       │
│         └─────────────▶│  FFmpeg处理   │◀─────────────┘       │
│                        │  (视频合成)   │                      │
│                        └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### 系统组成

- **前端**: React + Vite
- **后端**: Node.js + Express
- **视频处理**: FFmpeg
- **AI服务**: 豆包图像生成API
- **人脸检测**: Python + OpenCV

---

## 🔄 核心工作流程

### 主流程（6大步骤）

```
用户上传视频
    ↓
① 视频分析 (10%)
    ↓
② 模板推荐 (30%)
    ↓
③ 内容组合 (50%)
    ↓
④ 生成素材 (70%)
    ↓
⑤ 视频合成 (85%)
    ↓
⑥ 视频压缩 (95%)
    ↓
完成输出 (100%)
```

---

## 📊 详细流程图

### 步骤1: 视频分析 (10%)

```
┌─────────────────────────────────────────────────────────┐
│                    视频分析阶段                          │
└─────────────────────────────────────────────────────────┘

输入: 原始视频文件 (video.mp4)
    ↓
┌───────────────────────────────────────┐
│  ServerVideoAnalysisService           │
│  ────────────────────────────────────  │
│  • 提取视频元数据                      │
│    - 分辨率 (width x height)          │
│    - 时长 (duration)                  │
│    - 帧率 (fps)                       │
│    - 码率 (bitrate)                   │
│  • 提取关键帧 (5帧)                   │
│  • 场景检测                           │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  FaceDetectionService                 │
│  ────────────────────────────────────  │
│  • 检测人脸位置                        │
│  • 计算人脸区域                        │
│  • 返回人脸坐标 (x, y, width, height) │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  关键词生成                            │
│  ────────────────────────────────────  │
│  • 如果有语音识别: 提取关键词          │
│  • 否则: 使用随机关键词                │
│    - 从8个主题池中随机选择             │
│    - 确保唯一性                        │
└───────────────────────────────────────┘
    ↓
输出: analysis对象
{
  metadata: { width, height, duration, fps },
  keyframes: [frame1.jpg, frame2.jpg, ...],
  scenes: [{startTime, endTime}, ...],
  faceDetection: { detected, face: {x, y, width, height} },
  keywords: ['关键词1', '关键词2', '关键词3']
}
```

### 步骤2: 模板推荐 (30%)

```
┌─────────────────────────────────────────────────────────┐
│                    模板推荐阶段                          │
└─────────────────────────────────────────────────────────┘

输入: analysis对象
    ↓
┌───────────────────────────────────────┐
│  模板选择逻辑                          │
│  ────────────────────────────────────  │
│  • 分析视频时长                        │
│  • 分析视频比例                        │
│  • 匹配最佳模板                        │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  可用模板类型                          │
│  ────────────────────────────────────  │
│  1. 单层模板 (simple)                  │
│     - 纯视频 + 文字                    │
│  2. 双层模板 (pip)                     │
│     - 主视频 + 画中画                  │
│  3. 多层模板 (multi-layer)             │
│     - 主视频 + 画中画 + 翻转卡片       │
│  4. 竖版模板 (vertical)                │
│     - 1080x1920 竖版视频               │
└───────────────────────────────────────┘
    ↓
输出: template对象
{
  type: 'multi-layer',
  layout: 'vertical',
  layers: [
    { type: 'background', position: {...} },
    { type: 'pip', position: {...} },
    { type: 'flip-card', position: {...} }
  ]
}
```

### 步骤3: 内容组合 (50%)

```
┌─────────────────────────────────────────────────────────┐
│                    内容组合阶段                          │
└─────────────────────────────────────────────────────────┘

输入: analysis + template
    ↓
┌───────────────────────────────────────┐
│  ServerCompositionUnitGenerator       │
│  ────────────────────────────────────  │
│  • 生成组合单元                        │
│  • 分配时间轴                          │
│  • 计算位置坐标                        │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  组合单元结构                          │
│  ────────────────────────────────────  │
│  每个单元包含:                         │
│  • 时间范围 (startTime, endTime)       │
│  • 文本内容 (从关键词生成)             │
│  • 图片提示词 (用于AI生成)             │
│  • 布局信息 (position, size)           │
│  • 动画效果 (transition, duration)     │
└───────────────────────────────────────┘
    ↓
输出: composition对象
{
  units: [
    {
      id: 'unit_1',
      startTime: 0,
      endTime: 5,
      text: '关键词1',
      imagePrompt: '关键词1的图片描述',
      layout: { x: 100, y: 200, width: 500, height: 888 }
    },
    ...
  ]
}
```

### 步骤4: 生成素材 (70%)

```
┌─────────────────────────────────────────────────────────┐
│                    素材生成阶段                          │
└─────────────────────────────────────────────────────────┘

输入: composition对象
    ↓
┌───────────────────────────────────────┐
│  DoubaoImageService                   │
│  ────────────────────────────────────  │
│  • 调用豆包AI API                      │
│  • 根据提示词生成图片                  │
│  • 下载图片到本地                      │
│  • 保存路径: cache/images/            │
└───────────────────────────────────────┘
    ↓
    并行处理
    ↓
┌───────────────────────────────────────┐
│  CardFlipAnimationGenerator           │
│  ────────────────────────────────────  │
│  • 使用Canvas生成翻转动画              │
│  • 创建正面/背面图片                   │
│  • 使用FFmpeg合成翻转视频              │
│  • 保存路径: cache/flip-videos/       │
│  • 时长: 2秒                           │
│  • 尺寸: 500x888 (9:16)                │
└───────────────────────────────────────┘
    ↓
输出: generatedAssets对象
{
  images: [
    { id: 'unit_1', path: 'cache/images/img_1.jpg' },
    ...
  ],
  flipVideos: [
    { id: 'unit_1', path: 'cache/flip-videos/flip_1.mp4' },
    ...
  ]
}
```

### 步骤5: 视频合成 (85%)

```
┌─────────────────────────────────────────────────────────┐
│                    视频合成阶段                          │
└─────────────────────────────────────────────────────────┘

输入: 原视频 + composition + generatedAssets
    ↓
┌───────────────────────────────────────┐
│  ServerVideoCompositionService        │
│  ────────────────────────────────────  │
│  步骤5.1: 转换为竖版                   │
│  ────────────────────────────────────  │
│  • 检测视频方向                        │
│  • 如果是横版: 转换为1080x1920         │
│  • 使用SmartCropServiceV2智能裁剪      │
│  • 如果有人脸: 以人脸为中心裁剪        │
│  • 否则: 中心裁剪                      │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  步骤5.2: 生成画中画                   │
│  ────────────────────────────────────  │
│  • 提取人脸区域                        │
│  • 扩展3.5倍确保完整                   │
│  • 缩放到600x600正方形                 │
│  • 保存: cache/pip-video.mp4          │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  步骤5.3: 生成背景图                   │
│  ────────────────────────────────────  │
│  • 使用Canvas绘制背景                  │
│  • 添加渐变效果                        │
│  • 添加粒子动画                        │
│  • 添加标题横幅                        │
│  • 添加圆形边框                        │
│  • 保存: cache/background.png         │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  步骤5.4: 叠加翻转动画                 │
│  ────────────────────────────────────  │
│  • 使用FFmpeg overlay滤镜              │
│  • 循环播放翻转动画 (stream_loop -1)   │
│  • 位置: 根据layout计算                │
│  • 保存: cache/with-flip.mp4          │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  步骤5.5: 合成最终视频                 │
│  ────────────────────────────────────  │
│  • 三层叠加:                           │
│    1. 背景图 (1080x1920)               │
│    2. 画中画视频 (240, 950)            │
│    3. 圆形遮罩 (0, 0)                  │
│  • 使用FFmpeg filter_complex           │
│  • 保存: cache/composed.mp4           │
└───────────────────────────────────────┘
    ↓
输出: 合成后的视频文件
```

### 步骤6: 视频压缩 (95%)

```
┌─────────────────────────────────────────────────────────┐
│                    视频压缩阶段                          │
└─────────────────────────────────────────────────────────┘

输入: 合成后的视频
    ↓
┌───────────────────────────────────────┐
│  ServerVideoCompositionService        │
│  ────────────────────────────────────  │
│  • 使用FFmpeg压缩                      │
│  • 编码: H.264 (libx264)               │
│  • 预设: medium                        │
│  • CRF: 20 (质量控制)                  │
│  • 码率: 12M                           │
│  • 音频: AAC 192k                      │
│  • 像素格式: yuv420p                   │
└───────────────────────────────────────┘
    ↓
输出: 最终视频文件
保存路径: output/final_video_[timestamp].mp4
```

---

## 🔧 关键服务说明

### 1. ServerAutoGenerationAgent
**主控制器** - 协调整个生成流程

```javascript
class ServerAutoGenerationAgent {
  // 核心方法
  async autoGenerate(videoPath, platform, onProgress)
  
  // 子方法
  async analyzeVideo(videoPath)
  async recommendTemplate(analysis)
  async composeContent(analysis, template)
  async generateImages(composition, videoId)
  async composeVideo(videoPath, composition, assets)
  async compressVideo(video, platform)
}
```

**职责**:
- 流程编排
- 进度回调
- 错误处理
- 资源管理

### 2. ServerVideoAnalysisService
**视频分析服务**

```javascript
class ServerVideoAnalysisService {
  async analyzeVideo(videoPath, options)
  async extractKeyframes(videoPath, count)
  async detectScenes(videoPath)
  async getVideoMetadata(videoPath)
}
```

**功能**:
- FFprobe提取元数据
- FFmpeg提取关键帧
- 场景检测算法
- 视频质量分析

### 3. DoubaoImageService
**豆包AI图像生成服务**

```javascript
class DoubaoImageService {
  async generateImage(prompt, options)
  async downloadImage(url, savePath)
}
```

**API调用流程**:
```
1. 构建请求参数
   - model_name: doubao-pro-32k
   - prompt: 图片描述
   - size: 1024x1024

2. 发送POST请求
   - URL: https://ark.cn-beijing.volces.com/api/v3/...
   - Headers: Authorization, Content-Type

3. 解析响应
   - 提取图片URL
   - 下载图片到本地

4. 返回本地路径
```

### 4. FaceDetectionService
**人脸检测服务**

```javascript
class FaceDetectionService {
  async detectFaces(videoPath, timestamp)
}
```

**检测流程**:
```
1. 提取指定时间戳的帧
   ffmpeg -i video.mp4 -ss 5 -frames:v 1 frame.jpg

2. 调用Python脚本
   python3 face_detector.py video.mp4 5

3. 解析JSON结果
   {
     detected: true,
     face: { x, y, width, height }
   }

4. 返回人脸坐标
```

### 5. CardFlipAnimationGenerator
**翻转卡片动画生成器**

```javascript
class CardFlipAnimationGenerator {
  async generateFlipAnimation(text, options)
  async createFrontImage(text)
  async createBackImage(text)
  async composeFlipVideo(frontPath, backPath)
}
```

**生成流程**:
```
1. 使用Canvas绘制正面
   - 渐变背景
   - 文字内容
   - 装饰元素

2. 使用Canvas绘制背面
   - 不同颜色
   - 相同文字

3. 使用FFmpeg合成翻转动画
   - 正面: 0-1秒
   - 翻转: 1-1.5秒 (3D旋转效果)
   - 背面: 1.5-2秒

4. 输出2秒视频
```

### 6. ServerVideoCompositionService
**视频合成服务**

```javascript
class ServerVideoCompositionService {
  async convertToVertical(videoPath, faceDetection)
  async generatePIP(videoPath, faceDetection)
  async overlayFlipAnimations(videoPath, flipVideos)
  async compressVideo(videoPath, platform)
}
```

**核心功能**:
- 视频格式转换
- 智能裁剪
- 多层叠加
- 视频压缩

### 7. SmartCropServiceV2
**智能裁剪服务**

```javascript
class SmartCropServiceV2 {
  async cropToVertical(videoPath, faceDetection)
  calculateCropRegion(face, videoWidth, videoHeight)
}
```

**裁剪策略**:
```
如果检测到人脸:
  1. 以人脸中心为基准
  2. 扩展3.5倍确保完整
  3. 人脸偏上1/3处
  4. 确保不超出边界

否则:
  1. 中心裁剪
  2. 保持9:16比例
```

---

## 📦 数据流转

### 文件系统结构

```
VidSlide AI/
├── uploads/              # 用户上传的原始视频
│   └── video_[id].mp4
├── cache/                # 临时缓存文件
│   ├── images/           # AI生成的图片
│   │   └── img_[id].jpg
│   ├── flip-videos/      # 翻转动画视频
│   │   └── flip_[id].mp4
│   ├── keyframes/        # 提取的关键帧
│   │   └── frame_[n].jpg
│   ├── pip-video.mp4     # 画中画视频
│   ├── background.png    # 背景图
│   ├── fullsize-circle-mask.png  # 圆形遮罩
│   └── composed.mp4      # 合成后的视频
└── output/               # 最终输出视频
    └── final_video_[timestamp].mp4
```

### 数据流向图

```
用户上传
    ↓
uploads/video.mp4
    ↓
    ├─→ cache/keyframes/frame_*.jpg (分析)
    ├─→ cache/images/img_*.jpg (AI生成)
    ├─→ cache/flip-videos/flip_*.mp4 (动画)
    ├─→ cache/pip-video.mp4 (画中画)
    ├─→ cache/background.png (背景)
    └─→ cache/fullsize-circle-mask.png (遮罩)
    ↓
cache/composed.mp4 (合成)
    ↓
output/final_video.mp4 (压缩)
    ↓
返回给用户
```

---

## 🛠️ 技术栈

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.x | Web框架 |
| FFmpeg | 6.0+ | 视频处理 |
| Canvas | 2.x | 图像生成 |
| Python | 3.8+ | 人脸检测 |
| OpenCV | 4.x | 计算机视觉 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| Vite | 4.x | 构建工具 |
| Axios | 1.x | HTTP客户端 |

### AI服务

| 服务 | 提供商 | 用途 |
|------|--------|------|
| 图像生成 | 豆包AI | 生成卡片图片 |
| 语音识别 | 百度AI | 提取关键词 (可选) |

### FFmpeg核心命令

#### 1. 提取关键帧
```bash
ffmpeg -i input.mp4 -vf "select='eq(pict_type,I)'" -frames:v 5 frame_%d.jpg
```

#### 2. 视频裁剪
```bash
ffmpeg -i input.mp4 -vf "crop=1080:1920:x:y" output.mp4
```

#### 3. 画中画叠加
```bash
ffmpeg -i main.mp4 -i pip.mp4 \
  -filter_complex "[0:v][1:v]overlay=x:y" output.mp4
```

#### 4. 循环叠加翻转动画
```bash
ffmpeg -i main.mp4 -stream_loop -1 -i flip.mp4 \
  -filter_complex "[0:v][1:v]overlay=x:y" \
  -shortest output.mp4
```

#### 5. 三层叠加
```bash
ffmpeg -loop 1 -i bg.png -i pip.mp4 -loop 1 -i mask.png \
  -filter_complex "\
    [0:v][1:v]overlay=240:950[tmp];\
    [tmp][2:v]overlay=0:0:shortest=1[v]\
  " \
  -map "[v]" output.mp4
```

#### 6. 视频压缩
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -preset medium -crf 20 \
  -b:v 12M -maxrate 12M -bufsize 24M \
  -c:a aac -b:a 192k \
  output.mp4
```

---

## 🎯 性能优化

### 1. 并行处理
```javascript
// 同时生成多个素材
const [images, flipVideos] = await Promise.all([
  generateImages(composition),
  generateFlipAnimations(composition)
]);
```

### 2. 缓存机制
```javascript
// 缓存已生成的图片
const cacheKey = `img_${prompt}_${size}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 3. 流式处理
```javascript
// 使用流处理大文件
const readStream = fs.createReadStream(videoPath);
const writeStream = fs.createWriteStream(outputPath);
readStream.pipe(ffmpegProcess).pipe(writeStream);
```

### 4. 资源清理
```javascript
// 定期清理临时文件
setInterval(() => {
  cleanupOldFiles(cacheDir, 24 * 60 * 60 * 1000); // 24小时
}, 60 * 60 * 1000); // 每小时检查
```

---

## 🐛 错误处理

### 错误类型

1. **视频格式错误**
   - 检查: 文件扩展名、编码格式
   - 处理: 返回友好提示

2. **AI服务失败**
   - 检查: API密钥、网络连接
   - 处理: 重试3次，使用默认图片

3. **FFmpeg处理失败**
   - 检查: 命令参数、文件权限
   - 处理: 记录日志，返回错误信息

4. **磁盘空间不足**
   - 检查: 可用空间
   - 处理: 清理缓存，提示用户

### 错误处理流程

```javascript
try {
  // 主流程
  const result = await autoGenerate(videoPath);
  return result;
} catch (error) {
  // 记录错误
  console.error('生成失败:', error);
  
  // 清理资源
  await cleanup(videoId);
  
  // 返回错误信息
  throw new Error(`视频生成失败: ${error.message}`);
}
```

---

## 📈 监控指标

### 关键指标

1. **处理时长**
   - 视频分析: < 10秒
   - 图片生成: < 30秒
   - 视频合成: < 60秒
   - 总时长: < 2分钟

2. **成功率**
   - 目标: > 95%
   - 监控: 每小时统计

3. **资源使用**
   - CPU: < 80%
   - 内存: < 4GB
   - 磁盘: < 10GB缓存

4. **API调用**
   - 豆包AI: 每天限额
   - 成功率: > 90%

---

## 🔐 安全考虑

### 1. 文件上传
```javascript
// 限制文件大小
const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// 验证文件类型
const allowedTypes = ['video/mp4', 'video/quicktime'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('不支持的文件类型');
}
```

### 2. 路径安全
```javascript
// 防止路径遍历攻击
const safePath = path.join(baseDir, path.basename(userInput));
```

### 3. API密钥
```javascript
// 使用环境变量
const API_KEY = process.env.DOUBAO_API_KEY;

// 不在日志中输出
console.log('API调用成功'); // ✅
console.log('API_KEY:', API_KEY); // ❌
```

---

## 📝 总结

VidSlide AI是一个完整的视频自动生成系统，通过6个核心步骤将用户上传的视频转换为精美的竖版短视频：

1. **视频分析** - 提取元数据、关键帧、人脸信息
2. **模板推荐** - 根据视频特征选择最佳模板
3. **内容组合** - 生成时间轴和布局信息
4. **素材生成** - AI生成图片和翻转动画
5. **视频合成** - 多层叠加、画中画、特效
6. **视频压缩** - 优化质量和文件大小

整个流程高度自动化，用户只需上传视频，系统即可在2分钟内生成专业级的短视频内容。

---

**文档维护**: 请在每次重大更新后同步更新此文档
**联系方式**: 如有问题请提Issue
**最后更新**: 2026-01-22

