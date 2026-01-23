# VidSlide AI - 多智能体蜂群系统

> **自研方案 | 快速验证 | 一人开发**

一个基于多智能体协作的智能视频生成系统，通过5个核心智能体的协同工作，自动将原始视频转换为具有丰富视觉效果的短视频。

## 🎯 核心特性

### 三类画面系统
- **原视频画面**: 用于过渡、开场和结尾
- **原视频+卡片**: 观点表述（蓝色/黄色/亮色卡片）
- **多层组合**: 深度解释（5层结构：背景+素材+卡片+原视频+人脸）

### 智能协作
- **内容理解**: 语音识别（百度ASR）+ 文心一言深度分析
- **场景拆解**: 7条规则智能规划时间轴
- **素材生成**: 豆包AI生成 + 4层降级策略
- **质量控制**: 5个维度的多重检查
- **视频合成**: FFmpeg高质量合成

### 质量保证
- 内容理解准确性: 95%+
- 素材匹配准确性: 90%+
- 场景拆解准确性: 95%+
- 原视频占比: ≥25%

## 📦 安装

```bash
cd vidslide-ai
npm install
```

## 🚀 快速开始

### 方式1: 命令行工具

```bash
node examples/cli.js /path/to/video.mp4
```

带选项:
```bash
node examples/cli.js /path/to/video.mp4 --allow-rework
```

### 方式2: 代码调用

```javascript
import { generateVideo } from './src/index.js';

const result = await generateVideo('/path/to/video.mp4', {
  allowRework: true,
  cacheDir: '.cache',
  outputDir: 'output',
  logLevel: 'info'
});

if (result.success) {
  console.log('视频生成成功:', result.videoPath);
  console.log('质量评分:', result.qualityScore);
}
```

## 🏗️ 系统架构

```
┌─────────────────────────────────────────┐
│         ProjectManager（协调层）          │
│    - 5阶段执行计划                        │
│    - 任务分配和监控                       │
│    - 异常处理                            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       QualityDirector（质量控制层）       │
│    - 多维度检查                          │
│    - 质量门禁                            │
│    - 改进建议                            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           执行智能体层（5个）             │
├─────────────────────────────────────────┤
│ ContentAnalyst  │ SceneDesigner         │
│ MaterialExpert  │ VisualDesigner        │
│ VideoEngineer                           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           核心支持层（4个）               │
├─────────────────────────────────────────┤
│ Logger    │ DataManager                 │
│ ErrorHandler │ CacheManager             │
└─────────────────────────────────────────┘
```

## 📋 5阶段执行流程

### 阶段1: 内容理解（串行）
1. 语音识别（百度ASR）
2. 文心一言分析
3. 质量检查

### 阶段2: 场景设计（串行）
1. 场景拆解（7条规则）
2. 质量检查

### 阶段3: 素材生成（并行）
1. 生成内容素材（豆包AI）
2. 设计卡片
3. 生成背景遮罩
4. 提取人脸

### 阶段4: 质量检查（串行）
1. 素材准确性检查
2. 视觉质量检查

### 阶段5: 视频合成（串行）
1. 合成视频
2. 最终质量检查

## 🎨 核心智能体

### 1. ContentAnalyst（内容分析师）
- 语音识别（百度ASR）
- 文心一言深度分析
- 提取关键词、观点、解释

### 2. SceneDesigner（场景设计师）
- 7条场景拆解规则
- 三类画面系统
- 原视频占比控制（≥25%）
- 时间轴自动调整

### 3. MaterialExpert（素材专家）
- 豆包AI图像生成
- 4层降级策略：缓存→生成→优化→默认
- 智能提示词构建

### 4. VisualDesigner（视觉设计师）
- 卡片设计（3种样式）
- 背景生成
- 动画效果

### 5. VideoEngineer（视频工程师）
- 人脸提取
- 视频合成（FFmpeg）
- 压缩优化

## ⚙️ 配置选项

```javascript
{
  // 是否允许返工
  allowRework: false,

  // 缓存配置
  cacheDir: '.cache',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7天
  maxSize: 1024 * 1024 * 1024,      // 1GB

  // 输出配置
  outputDir: 'output',

  // 日志配置
  logLevel: 'info',  // debug | info | warn | error
  logFile: null      // 日志文件路径（可选）
}
```

## 🔧 环境变量

创建 `.env` 文件:

```env
# 百度ASR
BAIDU_ASR_APP_ID=your_app_id
BAIDU_ASR_API_KEY=your_api_key
BAIDU_ASR_SECRET_KEY=your_secret_key

# 文心一言
WENXIN_API_KEY=your_api_key
WENXIN_SECRET_KEY=your_secret_key

# 豆包
DOUBAO_API_KEY=your_api_key
```

## 📖 使用示例

### 示例1: 基础使用

```javascript
import { generateVideo } from './src/index.js';

const result = await generateVideo('/path/to/video.mp4');

if (result.success) {
  console.log('成功!', result.videoPath);
}
```

### 示例2: 批量处理

```javascript
const videos = [
  '/path/to/video1.mp4',
  '/path/to/video2.mp4',
  '/path/to/video3.mp4'
];

for (const videoPath of videos) {
  const result = await generateVideo(videoPath);
  console.log(`${videoPath}: ${result.success ? '成功' : '失败'}`);
}
```

### 示例3: 高级用法

```javascript
import { ProjectManager } from './src/index.js';

const pm = new ProjectManager({
  cacheManager: { cacheDir: '.cache' },
  logger: { logLevel: 'debug' }
});

const result = await pm.execute('/path/to/video.mp4', {
  allowRework: true
});
```

更多示例请查看 [examples/usage.js](examples/usage.js)

## 📁 项目结构

```
vidslide-ai/
├── src/
│   ├── core/                    # 核心支持层
│   │   ├── Logger.js           # 日志记录器
│   │   ├── DataManager.js      # 数据管理器
│   │   ├── ErrorHandler.js     # 错误处理器
│   │   └── CacheManager.js     # 缓存管理器
│   ├── agents/                  # 智能体层
│   │   ├── executors/          # 执行智能体
│   │   │   ├── ContentAnalyst.js
│   │   │   ├── SceneDesigner.js
│   │   │   ├── MaterialExpert.js
│   │   │   ├── VisualDesigner.js
│   │   │   └── VideoEngineer.js
│   │   ├── quality/            # 质量控制
│   │   │   └── QualityDirector.js
│   │   └── coordinator/        # 协调层
│   │       └── ProjectManager.js
│   ├── services/               # 服务层
│   └── index.js                # 入口文件
├── examples/                    # 示例
│   ├── cli.js                  # 命令行工具
│   └── usage.js                # 使用示例
└── docs/                        # 文档
```

## 📄 文档

- [多智能体蜂群执行文档](../多智能体蜂群执行文档.md) - 完整的设计文档
- [实施总结](../多智能体蜂群系统实施总结.md) - 实施进度和计划

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT License

---

**版本**: v1.0-MVP
**创建时间**: 2026-01-22
**最后更新**: 2026-01-22
