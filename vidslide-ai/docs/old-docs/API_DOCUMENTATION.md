# VidSlide AI - API使用文档

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件并配置以下API密钥：

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

### 基本使用

```javascript
import MasterPipeline from './src/services/MasterPipeline.js'

// 创建主流程实例
const pipeline = new MasterPipeline()

// 配置输出目录
pipeline.setConfig({
  outputDir: './output',
  enableCache: true,
  maxRetries: 3
})

// 执行完整流程
const result = await pipeline.run(
  '/path/to/video.mp4',
  '/path/to/audio.wav',
  '/path/to/output.mp4'
)

console.log('视频生成成功:', result.outputPath)
```

## 核心模块

### 1. MasterPipeline - 主流程控制器

主流程控制器整合了所有模块，提供完整的视频生成流程。

#### 初始化

```javascript
import MasterPipeline from './src/services/MasterPipeline.js'

const pipeline = new MasterPipeline()
```

#### 配置管理

```javascript
// 设置配置
pipeline.setConfig({
  outputDir: './output',      // 输出目录
  enableCache: true,           // 启用缓存
  maxRetries: 3,               // 最大重试次数
  timeout: 300000              // 超时时间（毫秒）
})

// 获取配置
const config = pipeline.getConfig()
```

#### 执行流程

```javascript
// 完整流程
const result = await pipeline.run(videoPath, audioPath, outputPath)

// 分阶段执行
const analysisResult = await pipeline.executePhase1(videoPath, audioPath)
const pattern = pipeline.executePhase2(analysisResult)
const assets = await pipeline.executePhase3(analysisResult, pattern, preprocessed, outputDir)
const timeline = pipeline.executePhase4(analysisResult, pattern, assets)
const output = await pipeline.executePhase5(timeline, outputPath)
```

#### 进度跟踪

```javascript
// 监听进度事件
pipeline.on('progress', (progress) => {
  console.log(`阶段${progress.phase}: ${progress.percentage}% - ${progress.message}`)
})

// 获取当前进度
const progress = pipeline.getProgress()
```

#### 缓存管理

```javascript
// 清除缓存
pipeline.clearCache()

// 获取缓存大小
const size = pipeline.getCacheSize()

// 获取缓存统计
const stats = pipeline.getCacheStats()
```

### 2. HybridContentAnalyzer - 内容分析器

分析视频内容，提取语义信息。

```javascript
import HybridContentAnalyzer from './src/services/HybridContentAnalyzer.js'

const analyzer = new HybridContentAnalyzer()

// 分析视频内容
const result = await analyzer.analyze(videoPath, audioPath)

console.log('主题:', result.mainTopic)
console.log('段落数:', result.segments.length)
```

### 3. SimpleNarrativeDetector - 叙事检测器

检测视频的叙事模式。

```javascript
import SimpleNarrativeDetector from './src/services/SimpleNarrativeDetector.js'

const detector = new SimpleNarrativeDetector()

// 检测叙事模式
const pattern = detector.detect(analysisResult)

console.log('叙事模式:', pattern.name)
console.log('置信度:', pattern.confidence)
```

支持的叙事模式：
- `sequential_reveal` - 顺序揭示（悬念→揭示循环）
- `comparison` - 对比（左右对比布局）
- `timeline` - 时间线（时间顺序展示）
- `basic` - 基础（默认模式）

### 4. VisualAssetGenerator - 素材生成器

使用豆包AI生成视觉素材。

```javascript
import VisualAssetGenerator from './src/services/VisualAssetGenerator.js'

const generator = new VisualAssetGenerator()

// 生成单张图片
const imagePath = await generator.generateImage(
  'A modern banner design',
  './output/banner.png'
)

// 生成横幅
const bannerPath = await generator.generateBanner('主题标题', './output')

// 生成问号卡片
const questionCardsPath = await generator.generateQuestionCards(2, './output')

// 生成概念卡片
const conceptCardPath = await generator.generateConceptCard('多模态', './output', 0)

// 批量生成所有素材
const assets = await generator.generateAll(
  analysisResult,
  pattern,
  preprocessed,
  './output'
)
```

#### 概念词典

```javascript
// 获取概念信息
const concept = generator.getConcept('多模态')

// 加载自定义概念词典
const library = generator.loadConceptLibrary()
```

### 5. PracticalTimelineGenerator - 时间轴生成器

生成多层视频时间轴。

```javascript
import PracticalTimelineGenerator from './src/services/PracticalTimelineGenerator.js'

const generator = new PracticalTimelineGenerator()

// 生成时间轴
const timeline = generator.generate(analysisResult, pattern, assets)

console.log('时间轴时长:', timeline.duration)
console.log('图层数量:', timeline.layers.length)
```

#### 动画效果

```javascript
// 淡入淡出
const fadeEffect = generator.createFadeEffect(3, 6)

// 翻转效果
const flipEffect = generator.createFlipEffect(6, 7)

// 缩放效果
const scaleEffect = generator.createScaleEffect(0, 1, 0.8, 1.0)

// 滑动效果
const slideEffect = generator.createSlideEffect(0, 1, 'left')
```

### 6. EnhancedVideoRenderer - 视频渲染器

使用FFmpeg渲染最终视频。

```javascript
import EnhancedVideoRenderer from './src/services/EnhancedVideoRenderer.js'

const renderer = new EnhancedVideoRenderer()

// 渲染视频
const outputPath = await renderer.render(timeline, './output/final.mp4')

// 验证时间轴
const validation = renderer.validateTimeline(timeline)

// 获取视频信息
const info = await renderer.getVideoInfo(videoPath)
```

## 数据结构

### AnalysisResult

```javascript
{
  mainTopic: string,           // 主题
  segments: [                  // 段落数组
    {
      text: string,            // 文本内容
      startTime: number,       // 开始时间（秒）
      endTime: number,         // 结束时间（秒）
      type: string,            // 类型：opening/suspense/reveal
      concepts: string[]       // 概念数组
    }
  ],
  duration: number             // 总时长（秒）
}
```

### Pattern

```javascript
{
  name: string,                // 模式名称
  confidence: number,          // 置信度（0-1）
  stats: {                     // 统计信息
    suspenseCount: number,
    revealCount: number,
    conceptCount: number
  }
}
```

### Assets

```javascript
{
  videoPath: string,           // 视频路径
  bannerPath: string,          // 横幅路径
  questionCardsPath: string,   // 问号卡片路径
  conceptCards: [              // 概念卡片数组
    {
      concept: string,         // 概念名称
      path: string             // 图片路径
    }
  ],
  duration: number             // 时长
}
```

### Timeline

```javascript
{
  duration: number,            // 总时长
  fps: number,                 // 帧率
  resolution: {                // 分辨率
    width: number,
    height: number
  },
  layers: [                    // 图层数组
    {
      type: string,            // 类型：video/image/subtitle
      name: string,            // 名称
      source: string,          // 源文件路径
      startTime: number,       // 开始时间
      endTime: number,         // 结束时间
      position: {              // 位置
        x: number | 'center',
        y: number | 'center',
        width: number,
        height: number
      },
      zIndex: number,          // 层级
      effects: []              // 动画效果数组
    }
  ]
}
```

## 错误处理

```javascript
try {
  const result = await pipeline.run(videoPath, audioPath, outputPath)
  console.log('成功:', result)
} catch (error) {
  console.error('错误:', error.message)

  // 检查错误类型
  if (error.message.includes('API')) {
    console.error('API调用失败，请检查API密钥')
  } else if (error.message.includes('文件')) {
    console.error('文件不存在或无法访问')
  }
}
```

## 性能优化

### 并发控制

```javascript
// 并发生成多张图片
const promises = prompts.map(prompt =>
  generator.generateImage(prompt, outputPath)
)
const results = await Promise.all(promises)
```

### 缓存使用

```javascript
// 启用缓存以提高性能
pipeline.setConfig({ enableCache: true })

// 清除缓存以释放内存
pipeline.clearCache()
```

### 进度监控

```javascript
pipeline.on('progress', (progress) => {
  // 更新UI进度条
  updateProgressBar(progress.percentage)
})
```

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- src/tests/unit1-environment.test.js

# 运行性能测试
npm test -- src/tests/performance.test.js
```

## 常见问题

### Q: 如何提高图片生成速度？

A: 使用并发生成多张图片，或者降低图片质量设置。

### Q: 如何自定义叙事模式？

A: 修改 `SimpleNarrativeDetector.js` 中的检测规则。

### Q: 如何添加新的动画效果？

A: 在 `PracticalTimelineGenerator.js` 中添加新的效果生成方法。

### Q: 如何处理大文件？

A: 使用流式处理或分块处理，避免一次性加载整个文件到内存。

## 更多资源

- [GitHub仓库](https://github.com/your-repo/vidslide-ai)
- [问题反馈](https://github.com/your-repo/vidslide-ai/issues)
- [更新日志](./CHANGELOG.md)

## 许可证

MIT License
