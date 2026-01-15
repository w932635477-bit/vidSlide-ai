# VidSlide AI 工作流验证 Agent 设计文档

## 概述

本文档定义了 VidSlide AI 项目的工作流验证框架，用于确保开发过程中的质量控制和功能完整性。

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    VidSlide AI 验证 Agent                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   指导层      │  │   验证层      │  │   报告层      │       │
│  │ (Guidance)    │  │ (Validation)  │  │ (Reporting)   │       │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘       │
│          │                  │                  │                │
│          ▼                  ▼                  ▼                │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                    核心验证器                          │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │     │
│  │  │模块检查 │ │接口契约 │ │工作流   │ │回归检测 │     │     │
│  │  │Checker  │ │Contract │ │Workflow │ │Regression│     │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 核心工作流定义

### 1. 视频处理工作流

```
用户上传视频
     │
     ▼
┌─────────────┐
│ 视频解析    │ ← VideoEditorView.handleVideoUpload()
└─────┬───────┘
      │
      ├──────────────────┬──────────────────┐
      ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 场景检测    │   │ 人脸跟踪    │   │ 内容分析    │
│ SceneDetect │   │ FaceTracker │   │ ContentAnal │
└─────┬───────┘   └─────┬───────┘   └─────┬───────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         ▼
               ┌─────────────────┐
               │ 模板推荐/应用   │
               │ TemplateEngine  │
               └─────────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │ 渲染/导出       │
               │ Export/Render   │
               └─────────────────┘
```

### 2. 人脸跟踪工作流

```
初始化请求
     │
     ▼
┌─────────────────────────────────────────┐
│ UnifiedFaceTracker.initialize()         │
│                                         │
│  1. 检测浏览器类型                       │
│  2. 获取引擎优先级                       │
│  3. 尝试初始化首选引擎                   │
│  4. 失败则降级到备选引擎                 │
└─────────────────┬───────────────────────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│MediaPipe│ │Face-api │ │ Basic   │
│(Chrome) │ │(Firefox)│ │(Fallback│
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 ▼
        ┌───────────────┐
        │ startTracking │
        │ (videoElement)│
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ 实时人脸检测   │
        │ → 画中画定位   │
        └───────────────┘
```

### 3. 场景检测工作流

```
视频加载完成
     │
     ▼
┌─────────────────────────────────────────┐
│ SceneDetection.initialize(width,height) │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ analyzeVideoFrames(video, options)      │
│                                         │
│  for each frame:                        │
│    1. extractFrame()                    │
│    2. detectSceneChange()               │
│       - detectImageDifference()         │
│       - detectMotion()                  │
│       - detectCut()                     │
│       - detectFade()                    │
│    3. onSceneDetected(scene)            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌───────────────┐
        │ 场景切换列表   │
        │ → 时间线标记   │
        │ → 模板推荐     │
        └───────────────┘
```

### 4. 素材需求分析工作流

```
AI分析完成 (语音识别 + 关键帧提取)
     │
     ▼
┌─────────────────────────────────────────┐
│ SpeechRecognitionService.extractKeywords│
│ (异步方法，返回关键词数组)               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ MaterialRequirementAnalyzer.vue         │
│ (接收 keywords 和 keyframes props)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ IntelligentDispatcher.dispatch(keyword) │
│                                         │
│  1. KeywordAnalyzer.analyze()           │
│     - 检测语言 (中文/英文/混合)          │
│     - 计算置信度                         │
│     - 匹配模式特征                       │
│                                         │
│  2. selectStrategy()                    │
│     - single_platform (速度优先)         │
│     - parallel_platforms (质量优先)      │
│     - progressive_expansion (平衡)       │
│                                         │
│  3. PlatformEvaluator.calculateScores() │
│     - 百度 (中文优先)                    │
│     - Unsplash (英文优先)                │
│     - Pexels (备选)                      │
│                                         │
│  4. TranslationService.translate()      │
│     (中文关键词翻译为英文)               │
└─────────────────┬───────────────────────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ 百度    │ │Unsplash │ │ Pexels  │
│(中文)   │ │(英文)   │ │(备选)   │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 ▼
        ┌───────────────┐
        │ 素材搜索结果   │
        │ → 展示列表     │
        │ → 添加到画布   │
        └───────────────┘
```

### 5. 智能调度策略

| 策略 | 触发条件 | 平台数量 | 翻译 | 适用场景 |
|------|----------|----------|------|----------|
| single_platform | 置信度 > 0.8 或 speedPriority | 1 | 中文时翻译 | 快速搜索 |
| parallel_platforms | 置信度 < 0.6 或 qualityPriority | 2 | 始终翻译 | 高质量搜索 |
| progressive_expansion | 默认 | 1+备选 | 中文/混合时翻译 | 平衡模式 |

## 模块依赖关系

### 核心服务模块

| 模块 | 路径 | 依赖 | 被依赖 |
|------|------|------|--------|
| UnifiedFaceTracker | services/UnifiedFaceTracker.js | face-api.js, @mediapipe/face_mesh | PictureInPicture, FaceTrackingSettings, VideoEditorView |
| SceneDetection | utils/sceneDetection.js | - | VideoEditorView |
| TemplateEngine | core/template-engine/ | - | VideoEditorView, WorkspaceView |
| MaterialService | services/MaterialService.js | IntelligentDispatcher, API services | WorkspaceView, MaterialRequirementAnalyzer |
| IntelligentDispatcher | services/IntelligentDispatcher.js | KeywordAnalyzer, PlatformEvaluator, TranslationService | MaterialService, MaterialRequirementAnalyzer |
| KeywordAnalyzer | services/utils/IntelligentDispatcher/KeywordAnalyzer.js | - | IntelligentDispatcher |
| PlatformEvaluator | services/utils/IntelligentDispatcher/PlatformEvaluator.js | - | IntelligentDispatcher |
| TranslationService | services/utils/IntelligentDispatcher/TranslationService.js | Baidu Translate API | IntelligentDispatcher |

### UI 组件模块

| 组件 | 路径 | 依赖服务 |
|------|------|----------|
| VideoEditorView | views/VideoEditorView.vue | UnifiedFaceTracker, SceneDetection, TemplateEngine |
| PictureInPicture | components/PictureInPicture.vue | UnifiedFaceTracker |
| FaceTrackingSettings | components/FaceTrackingSettings.vue | UnifiedFaceTracker |
| Timeline | components/Timeline.vue | SceneDetection |
| WorkspaceView | views/WorkspaceView.vue | MaterialRequirementAnalyzer, MaterialService, SpeechRecognitionService |
| MaterialRequirementAnalyzer | components/MaterialRequirementAnalyzer.vue | MaterialService, IntelligentDispatcher |
| DispatcherStatus | components/DispatcherStatus.vue | IntelligentDispatcher |

## 接口契约定义

### UnifiedFaceTracker 接口

```javascript
// 必须实现的方法
interface UnifiedFaceTracker {
  // 初始化
  initialize(options?: {
    maxNumFaces?: number,
    smoothFactor?: number,
    minDetectionConfidence?: number,
    preferredEngine?: TrackerEngine
  }): Promise<{
    success: boolean,
    engine: TrackerEngine,
    message: string
  }>

  // 开始跟踪
  startTracking(videoElement: HTMLVideoElement): Promise<void>

  // 停止跟踪
  stopTracking(): void

  // 获取跟踪状态
  getTrackingState(): {
    faceDetected: boolean,
    faceCount: number,
    faceBounds: { x, y, width, height, centerX, centerY } | null,
    landmarks: Array,
    confidence: number,
    engine: TrackerEngine
  }

  // 事件监听
  on(event: 'faceDetected', callback: (data) => void): void
  off(event: 'faceDetected', callback: (data) => void): void
}
```

### SceneDetection 接口

```javascript
interface SceneDetection {
  // 初始化
  initialize(width?: number, height?: number): this

  // 分析视频帧
  analyzeVideoFrames(videoElement: HTMLVideoElement, options?: {
    startTime?: number,
    endTime?: number,
    frameRate?: number,
    onProgress?: (progress, current, total) => void,
    onSceneDetected?: (scene) => void
  }): Promise<Array<{
    timestamp: number,
    type: 'cut' | 'fade' | 'motion' | 'diff',
    confidence: number,
    metrics: object
  }>>

  // 清理资源
  dispose(): void
}
```

## 验证规则

### 1. 模块存在性检查

```javascript
const REQUIRED_MODULES = [
  'src/services/UnifiedFaceTracker.js',
  'src/utils/sceneDetection.js',
  'src/components/PictureInPicture.vue',
  'src/components/FaceTrackingSettings.vue',
  'src/views/VideoEditorView.vue'
]
```

### 2. 接口完整性检查

```javascript
const INTERFACE_CHECKS = {
  'UnifiedFaceTracker': [
    'async initialize(',
    'async startTracking(',
    'stopTracking(',
    'getTrackingState(',
    'TrackerEngine'
  ],
  'SceneDetection': [
    'initialize(',
    'analyzeVideoFrames(',
    'detectImageDifference(',
    'dispose('
  ]
}
```

### 3. 集成检查

```javascript
const INTEGRATION_CHECKS = [
  {
    component: 'PictureInPicture.vue',
    mustImport: ['UnifiedFaceTracker', 'TrackerEngine'],
    mustUse: ['faceTrackingSupported', 'currentTrackerEngine']
  },
  {
    component: 'VideoEditorView.vue',
    mustImport: ['UnifiedFaceTracker', 'SceneDetection'],
    mustUse: ['analyzeVideoScenes', 'startFaceTrackingForVideo']
  }
]
```

## 验证执行流程

### 开发前检查

```bash
# 运行模块检查
node scripts/validate-modules.js

# 检查内容:
# 1. 所有必需模块是否存在
# 2. 接口是否完整
# 3. 依赖关系是否正确
```

### 开发中检查

```bash
# 运行集成测试
node vidslide-ai/test-modules.js

# 检查内容:
# 1. 模块导入/导出
# 2. 接口契约
# 3. 组件集成
```

### 开发后检查

```bash
# 运行构建验证
npm run build

# 运行 E2E 测试
# 打开 test-integration.html 进行交互测试
```

## 错误处理规范

### 人脸跟踪错误处理

```javascript
// 引擎初始化失败 → 自动降级
if (!mediapipeSuccess) {
  console.warn('MediaPipe 初始化失败，尝试 Face-api.js')
  return initializeFaceApi()
}

// 所有引擎失败 → 基础模式
if (!anyEngineSuccess) {
  console.warn('所有引擎初始化失败，使用基础模式')
  return { success: true, engine: 'basic', message: '基础模式' }
}
```

### 场景检测错误处理

```javascript
// 帧提取失败 → 跳过当前帧
try {
  const frame = detector.extractFrame(video, time)
} catch (error) {
  console.warn(`帧提取失败 @ ${time}s, 跳过`)
  continue
}
```

## 渐进式完善计划

### 阶段 1: 基础验证 (当前)

- [x] 模块存在性检查
- [x] 接口完整性检查
- [x] 基础集成测试
- [x] 交互式测试页面

### 阶段 2: 自动化测试 (测试过程中)

- [ ] 单元测试覆盖
- [ ] 集成测试自动化
- [ ] CI/CD 集成
- [ ] 测试报告生成

### 阶段 3: 完整工作流 Agent (测试完成后)

- [ ] 工作流状态机
- [ ] 自动回归检测
- [ ] 智能错误诊断
- [ ] 性能监控

## 使用指南

### 新功能开发流程

1. **开发前**
   ```bash
   # 检查当前模块状态
   node vidslide-ai/test-modules.js
   ```

2. **开发中**
   - 遵循接口契约定义
   - 确保错误处理完整
   - 添加必要的日志

3. **开发后**
   ```bash
   # 运行构建
   npm run build

   # 运行集成测试
   node vidslide-ai/test-modules.js

   # 交互测试
   # 打开 http://localhost:5174/test-integration.html
   ```

### 问题排查流程

1. **构建失败**
   - 检查模块导入/导出
   - 检查依赖是否安装

2. **功能异常**
   - 检查接口契约是否满足
   - 检查错误处理是否正确
   - 查看浏览器控制台日志

3. **集成问题**
   - 运行 test-modules.js 检查集成
   - 使用 test-integration.html 交互测试

## 附录

### 浏览器兼容性矩阵

| 浏览器 | 人脸跟踪引擎 | 场景检测 | 视频处理 |
|--------|-------------|----------|----------|
| Chrome 80+ | MediaPipe (首选) | ✅ | ✅ |
| Firefox 75+ | Face-api.js (首选) | ✅ | ✅ |
| Safari 14+ | Face-api.js | ✅ | ✅ |
| Edge 80+ | MediaPipe (首选) | ✅ | ✅ |

### 性能基准

| 操作 | 目标时间 | 备注 |
|------|----------|------|
| 人脸跟踪初始化 | < 3s | 包括模型加载 |
| 单帧人脸检测 | < 50ms | 30fps 实时跟踪 |
| 场景检测 (1分钟视频) | < 30s | 2fps 采样率 |
| 模板渲染 | < 100ms | 单帧渲染 |
