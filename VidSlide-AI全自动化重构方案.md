# VidSlide AI 全自动化重构方案

**创建时间**: 2026-01-16
**目标**: 重构UI为剪映风格 + 实现完全自动化工作流程
**原则**: 用户上传视频 → 一键自动生成 → 满意即导出 / 不满意再调整

---

## 📋 目录

1. [当前问题分析](#当前问题分析)
2. [UI重构方案 - 剪映风格](#ui重构方案---剪映风格)
3. [全自动工作流程设计](#全自动工作流程设计)
4. [技术实现方案](#技术实现方案)
5. [实施步骤](#实施步骤)

---

## 🎯 当前问题分析

### 问题1: UI布局混乱
- ❌ 组件堆叠,找不到入口
- ❌ 被遮挡,无法操作
- ❌ 缺乏清晰的视觉层次
- ❌ 没有参考成熟产品的布局逻辑
- ❌ 功能分散,用户不知道从哪里开始

### 问题2: 违背项目初衷
- ❌ **当前**: 用户需要手动点击每一步(分析→选模板→搜素材→调整→导出)
- ✅ **应该**: 用户上传视频 → 点击"一键生成" → 自动完成所有步骤 → 展示结果
- ❌ 所有功能都暴露在UI上,增加用户认知负担
- ✅ 应该隐藏复杂性,只在需要时提供手动调整

---

## 🎨 UI重构方案 - 剪映风格

### 整体布局架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header - 顶部工具栏 (64px)                                               │
│  [Logo] [新建] [打开] [保存] [撤销] [重做]      [语言] [导出] [设置]      │
├─────────────┬───────────────────────────────────┬─────────────────────────┤
│             │                                   │                         │
│  左侧素材库  │         中央预览区                 │      右侧属性面板         │
│  (280px)    │        (flex: 1)                  │        (320px)          │
│             │                                   │                         │
│ 📁 项目     │  ┌─────────────────────────────┐  │  🎨 当前选中            │
│ 📹 视频     │  │                             │  │                         │
│ 🖼️  图片     │  │   Canvas渲染区/视频预览      │  │  ┌─────────────────┐  │
│ 🎵 音频     │  │   (16:9 或 9:16自适应)       │  │  │   模板信息       │  │
│ 📝 文本     │  │                             │  │  │   - 名称         │  │
│ ✨ 特效     │  │   实时预览合成效果            │  │  │   - 描述         │  │
│ 🎭 动画     │  │                             │  │  └─────────────────┘  │
│            │  └─────────────────────────────┘  │                         │
│  [搜索框]   │                                   │  ⚙️ 调整参数            │
│            │   🎮 播放控制条                    │  - 位置: [5选项]        │
│  [一键生成] │   [播放] [暂停] 00:00 / 03:45     │  - 大小: [滑块]         │
│            │                                   │  - 颜色: [色板]         │
│            │                                   │  - 动画: [列表]         │
│            │                                   │  - 时长: [输入]         │
│            │                                   │                         │
├─────────────┴───────────────────────────────────┴─────────────────────────┤
│  时间轴 Timeline (200px - 可调整)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ 🎬 视频轨  ████████████████████████████████████████████              │ │
│  │ 📄 PPT轨   ░░░██████░░░██████░░░██████░░░                            │ │
│  │ 🎵 音频轨  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                        │ │
│  │ ✨ 特效轨  ━━━━━⚡━━━━━⚡━━━━━⚡━━━━━                                  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  [播放头] ▼ 00:00 / 03:45                      [放大] [缩小] [适配]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 设计语言 - 苹果风格

#### 颜色系统
```css
/* 主色调 - 科技蓝 */
--primary: #0071E3;
--primary-hover: #0077ED;
--primary-active: #006EDB;

/* 中性色 - 高级灰 */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F7;
--bg-tertiary: #E8E8ED;
--surface: rgba(255, 255, 255, 0.8);
--surface-hover: rgba(255, 255, 255, 0.95);

/* 文字色 */
--text-primary: #1D1D1F;
--text-secondary: #86868B;
--text-tertiary: #6E6E73;

/* 边框 */
--border: rgba(0, 0, 0, 0.08);
--border-hover: rgba(0, 0, 0, 0.12);

/* 阴影 */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
```

#### 排版系统
```css
/* SF Pro Display - 苹果标准字体 */
--font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
               'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* 字体大小 */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;

/* 行高 */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### 圆角系统
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

#### 动画系统
```css
/* 缓动函数 */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 过渡时长 */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
```

### 核心组件设计

#### 1. Header - 顶部工具栏
```vue
<WorkspaceHeader>
  ├── Logo区域
  │   └── "VidSlide AI" + 图标
  ├── 项目操作
  │   ├── 新建项目
  │   ├── 打开项目
  │   ├── 保存项目
  │   ├── 撤销
  │   └── 重做
  ├── 视图控制
  │   ├── 布局切换
  │   └── 全屏切换
  └── 右侧操作
      ├── 语言切换
      ├── 导出按钮 (主要CTA)
      └── 设置
</WorkspaceHeader>
```

**样式特点**:
- 高度: 64px
- 背景: 毛玻璃效果 `backdrop-filter: blur(20px)`
- 边框: 1px底部边框,极细
- 按钮: 40x40px,圆角8px,hover有背景色
- 导出按钮: 主色调蓝色,圆角20px

#### 2. AssetPanel - 左侧素材库
```vue
<AssetPanel width="280px">
  ├── 搜索框
  ├── 素材分类 Tab
  │   ├── 📁 项目
  │   ├── 📹 视频
  │   ├── 🖼️ 图片
  │   ├── 🎵 音频
  │   ├── 📝 文本
  │   ├── ✨ 特效
  │   └── 🎭 动画
  ├── 素材列表 (可滚动)
  │   └── 素材卡片 (拖拽到时间轴)
  └── 底部操作
      ├── [上传素材]
      └── [一键自动生成] ← 核心CTA
</AssetPanel>
```

**样式特点**:
- 宽度: 280px (可调整)
- 背景: 白色 #FFFFFF
- 分隔线: 1px #E8E8ED
- 卡片: 圆角8px,hover有阴影
- **一键生成按钮**:
  - 高度: 48px
  - 背景: 渐变蓝色
  - 圆角: 24px
  - 图标: ⚡ 闪电
  - 文字: "一键自动生成"

#### 3. PreviewCanvas - 中央预览区
```vue
<PreviewCanvas flex="1">
  ├── Canvas渲染区域
  │   ├── 视频播放器 (原始视频)
  │   ├── PPT图层 (Canvas叠加)
  │   ├── 特效图层 (Canvas叠加)
  │   └── 实时预览合成效果
  ├── 播放控制条
  │   ├── 播放/暂停
  │   ├── 进度条 (拖拽定位)
  │   ├── 时间显示 00:00 / 03:45
  │   ├── 音量控制
  │   └── 全屏按钮
  └── 浮动工具栏
      ├── 网格线开关
      ├── 安全框开关
      └── 质量控制
</PreviewCanvas>
```

**样式特点**:
- 背景: 纯黑 #000000
- Canvas: 16:9或9:16自适应,居中显示
- 播放控制条: 毛玻璃,悬浮在底部
- 进度条: 主色调蓝色,圆角
- 按钮: 白色图标,40x40px

#### 4. PropertyPanel - 右侧属性面板
```vue
<PropertyPanel width="320px">
  ├── 当前选中信息
  │   ├── 缩略图
  │   ├── 名称
  │   └── 类型
  ├── 参数调整区 (根据选中类型动态显示)
  │   ├── 基础参数
  │   │   ├── 位置 (5选项)
  │   │   ├── 大小 (滑块 10-100%)
  │   │   ├── 旋转 (滑块 -180~180°)
  │   │   └── 透明度 (滑块 0-100%)
  │   ├── 样式参数
  │   │   ├── 颜色主题
  │   │   ├── 字体选择
  │   │   └── 边框样式
  │   └── 动画参数
  │       ├── 入场动画
  │       ├── 出场动画
  │       ├── 持续时间
  │       └── 缓动函数
  └── 快捷操作
      ├── [应用到所有]
      ├── [重置]
      └── [保存预设]
</PropertyPanel>
```

**样式特点**:
- 宽度: 320px (可调整)
- 背景: #F5F5F7
- 分组: 白色卡片,圆角12px
- 标签: 粗体,14px
- 输入框: 圆角8px,边框1px
- 滑块: 主色调蓝色

#### 5. Timeline - 底部时间轴
```vue
<Timeline height="200px" resizable>
  ├── 轨道区域
  │   ├── 视频轨 (主轨道,不可删除)
  │   ├── PPT轨 (自动生成的PPT片段)
  │   ├── 音频轨 (背景音乐/音效)
  │   ├── 特效轨 (动画特效)
  │   └── [添加轨道]
  ├── 时间标尺
  │   └── 00:00 - 03:45 (刻度线)
  ├── 播放头 (红色竖线)
  └── 底部控制
      ├── 缩放控制
      │   ├── [放大]
      │   ├── [缩小]
      │   └── [适配窗口]
      └── 对齐辅助
          ├── [吸附]
          └── [网格]
</Timeline>
```

**样式特点**:
- 高度: 200px (可拖拽调整 150-400px)
- 背景: #1E1E1E (深色主题)
- 轨道: #2A2A2A
- 片段: 圆角6px,不同颜色区分
  - 视频: #4A90E2
  - PPT: #7B68EE
  - 音频: #50C878
  - 特效: #FFB347
- 播放头: 红色 #FF3B30,2px宽
- 时间标尺: 白色文字,12px

### 响应式设计

#### 宽屏模式 (>1600px)
```
左侧素材库: 280px
中央预览区: flex
右侧属性面板: 320px
时间轴: 200px
```

#### 标准模式 (1200-1600px)
```
左侧素材库: 240px
中央预览区: flex
右侧属性面板: 280px
时间轴: 180px
```

#### 窄屏模式 (<1200px)
```
隐藏素材库 (可点击按钮展开)
中央预览区: flex
右侧属性面板: 可折叠
时间轴: 150px
```

#### 移动端 (<768px)
```
单列布局
预览区: 全屏
属性面板: 底部抽屉
时间轴: 简化版
```

---

## ⚡ 全自动工作流程设计

### 核心理念

**用户体验目标**:
- 用户上传视频
- 点击 "一键自动生成" 按钮
- 等待 30-60 秒
- 直接看到可导出的最终成品
- 满意 → 导出
- 不满意 → 进入手动调整模式

### 自动化流程架构

```
┌─────────────────────────────────────────────────────────────┐
│                   用户上传视频                                │
│                 (拖拽 or 点击上传)                            │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               点击 "一键自动生成" 按钮                         │
│                    (主要CTA)                                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│             🤖 MasterAutoGenerationAgent 启动                │
│                   (自动编排所有步骤)                          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
┌──────────────────┐            ┌──────────────────┐
│  步骤1: 视频分析  │            │   进度提示UI     │
│  (10-20秒)       │            │   [████░░░] 30%  │
└────────┬─────────┘            │   正在分析视频... │
         │                      └──────────────────┘
         ├─ 语音识别 (Baidu API)
         ├─ 关键帧提取 (VideoProcessingService)
         ├─ 场景检测 (VideoProcessingService)
         ├─ 关键词提取 (NLP Service)
         └─ 内容分类 (AI分析)
         ↓
┌──────────────────┐
│  步骤2: 智能推荐  │
│  (3-5秒)         │
└────────┬─────────┘
         ├─ 分析内容类型
         ├─ 匹配模板 (TemplateRecommender)
         ├─ 自动选择最佳模板 (Top 1)
         └─ 生成场景序列 (TemplateComposer)
         ↓
┌──────────────────┐
│  步骤3: 素材匹配  │
│  (10-15秒)       │
└────────┬─────────┘
         ├─ 根据关键词搜索素材
         ├─ 外部平台搜索 (自动授权)
         ├─ 智能颜色匹配
         ├─ 质量评分排序
         └─ 自动选择最佳素材
         ↓
┌──────────────────┐
│  步骤4: 内容组合  │
│  (5-8秒)         │
└────────┬─────────┘
         ├─ 自动填充模板内容
         ├─ 自动计算时长
         ├─ 自动同步时间轴
         └─ 生成场景序列
         ↓
┌──────────────────┐
│  步骤5: 渲染合成  │
│  (5-10秒)        │
└────────┬─────────┘
         ├─ 渲染每个场景 (TemplateRenderer)
         ├─ 添加动画效果 (AnimationSystem)
         ├─ 合成图层
         └─ 生成预览视频
         ↓
┌─────────────────────────────────────────────────────────────┐
│                    ✅ 自动生成完成!                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │         展示最终预览 (可播放的完整视频)              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [▶️ 播放预览]  [⬇️ 直接导出]  [✏️ 手动调整]               │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    播放查看              导出成品            进入编辑模式
                                            (显示所有调整工具)
```

### 自动化引擎设计

#### MasterAutoGenerationAgent 架构

```javascript
// src/services/MasterAutoGenerationAgent.js

class MasterAutoGenerationAgent {
  constructor() {
    // 依赖的服务
    this.videoService = new VideoProcessingService()
    this.templateRecommender = new TemplateRecommender()
    this.materialService = new MaterialService()
    this.templateComposer = new TemplateComposer()
    this.renderer = new TemplateRenderer()
    this.animationSystem = new AnimationSystem()

    // 状态
    this.isProcessing = false
    this.currentStep = ''
    this.progress = 0
    this.result = null
  }

  /**
   * 一键自动生成
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<GenerationResult>}
   */
  async autoGenerate(videoFile, onProgress) {
    this.isProcessing = true
    this.progress = 0

    try {
      // === 步骤1: 视频分析 (0% - 40%) ===
      this.updateProgress('正在分析视频内容...', 5, onProgress)

      const analysisResult = await this.analyzeVideo(videoFile, (step, progress) => {
        this.updateProgress(`分析视频: ${step}`, 5 + progress * 0.35, onProgress)
      })

      // === 步骤2: 智能推荐 (40% - 50%) ===
      this.updateProgress('正在推荐最佳模板...', 40, onProgress)

      const template = await this.recommendTemplate(analysisResult, (progress) => {
        this.updateProgress('推荐模板中...', 40 + progress * 0.10, onProgress)
      })

      // === 步骤3: 素材匹配 (50% - 70%) ===
      this.updateProgress('正在搜索匹配素材...', 50, onProgress)

      const materials = await this.matchMaterials(analysisResult, (progress) => {
        this.updateProgress('搜索素材中...', 50 + progress * 0.20, onProgress)
      })

      // === 步骤4: 内容组合 (70% - 85%) ===
      this.updateProgress('正在组合内容...', 70, onProgress)

      const composition = await this.composeContent(
        analysisResult,
        template,
        materials,
        (progress) => {
          this.updateProgress('组合内容中...', 70 + progress * 0.15, onProgress)
        }
      )

      // === 步骤5: 渲染合成 (85% - 100%) ===
      this.updateProgress('正在渲染最终视频...', 85, onProgress)

      const finalResult = await this.renderFinal(composition, (progress) => {
        this.updateProgress('渲染中...', 85 + progress * 0.15, onProgress)
      })

      this.updateProgress('生成完成!', 100, onProgress)
      this.isProcessing = false
      this.result = finalResult

      return finalResult

    } catch (error) {
      this.isProcessing = false
      throw new Error(`自动生成失败: ${error.message}`)
    }
  }

  /**
   * 步骤1: 分析视频
   */
  async analyzeVideo(videoFile, onProgress) {
    // 1.1 加载视频
    onProgress('加载视频', 0)
    const metadata = await this.videoService.loadVideo(videoFile)

    // 1.2 提取关键帧
    onProgress('提取关键帧', 20)
    const keyframes = await this.videoService.extractKeyframes({
      interval: 2,
      maxFrames: 50
    })

    // 1.3 场景检测
    onProgress('检测场景', 40)
    const scenes = await this.videoService.detectScenes(keyframes)

    // 1.4 语音识别
    onProgress('语音识别', 60)
    const transcript = await this.videoService.recognizeSpeech()

    // 1.5 内容分析
    onProgress('分析内容', 80)
    const analysis = await this.videoService.analyzeContent(transcript.text)

    onProgress('分析完成', 100)

    return {
      metadata,
      keyframes,
      scenes,
      transcript: transcript.text,
      keywords: analysis.keywords,
      topics: analysis.topics,
      contentType: this.detectContentType(transcript.text, analysis.keywords)
    }
  }

  /**
   * 步骤2: 推荐模板
   */
  async recommendTemplate(analysisResult, onProgress) {
    onProgress(10)

    // 分析内容特征
    const features = {
      contentType: analysisResult.contentType,
      keywords: analysisResult.keywords.map(k => k.text),
      duration: analysisResult.metadata.duration,
      hasData: this.hasDataMentions(analysisResult.transcript),
      sentiment: this.analyzeSentiment(analysisResult.transcript)
    }

    onProgress(50)

    // 获取推荐模板
    const recommendations = await this.templateRecommender.recommend(features)

    onProgress(90)

    // 自动选择第一个(最佳)模板
    const selectedTemplate = recommendations[0]

    console.log('✅ 自动选择模板:', selectedTemplate.name)

    onProgress(100)
    return selectedTemplate
  }

  /**
   * 步骤3: 匹配素材
   */
  async matchMaterials(analysisResult, onProgress) {
    const keywords = analysisResult.keywords.slice(0, 5) // 取前5个关键词
    const materials = []

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i].text

      onProgress((i / keywords.length) * 100)

      try {
        // 自动搜索素材 (外部优先)
        const results = await this.materialService.searchMaterials({
          keyword,
          platforms: ['unsplash', 'pexels'], // 自动授权这些平台
          maxResults: 3
        })

        if (results.length > 0) {
          // 自动选择评分最高的素材
          const bestMaterial = this.selectBestMaterial(results)
          materials.push({
            keyword,
            material: bestMaterial
          })
        }
      } catch (error) {
        console.warn(`素材搜索失败: ${keyword}`, error)
        // 失败则跳过,不阻塞流程
      }
    }

    onProgress(100)
    return materials
  }

  /**
   * 步骤4: 组合内容
   */
  async composeContent(analysisResult, template, materials, onProgress) {
    onProgress(10)

    // 根据模板类型选择组合模式
    const compositionMode = this.selectCompositionMode(
      analysisResult.contentType,
      template
    )

    onProgress(30)

    // 生成场景序列
    const scenes = await this.templateComposer.compose({
      mode: compositionMode,
      transcript: analysisResult.transcript,
      keywords: analysisResult.keywords,
      topics: analysisResult.topics,
      template: template,
      materials: materials,
      duration: analysisResult.metadata.duration
    })

    onProgress(70)

    // 自动优化时长分配
    const optimizedScenes = this.optimizeSceneTiming(
      scenes,
      analysisResult.metadata.duration
    )

    onProgress(100)

    return {
      template,
      scenes: optimizedScenes,
      materials,
      metadata: analysisResult.metadata
    }
  }

  /**
   * 步骤5: 渲染最终视频
   */
  async renderFinal(composition, onProgress) {
    const { template, scenes, materials, metadata } = composition

    // 初始化渲染器
    await this.renderer.initialize(metadata.width, metadata.height)

    const renderedScenes = []

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]

      onProgress((i / scenes.length) * 100)

      // 渲染单个场景
      const renderedScene = await this.renderer.renderScene(scene, {
        template: template,
        enableAnimation: true,
        quality: 'high'
      })

      renderedScenes.push(renderedScene)
    }

    onProgress(100)

    return {
      scenes: renderedScenes,
      template: template,
      materials: materials,
      metadata: metadata,
      previewUrl: this.generatePreviewUrl(renderedScenes),
      canExport: true
    }
  }

  // === 辅助方法 ===

  detectContentType(text, keywords) {
    // 简单的内容类型检测逻辑
    const keywordTexts = keywords.map(k => k.text).join(' ')

    if (keywordTexts.includes('数据') || keywordTexts.includes('统计')) {
      return 'data'
    }
    if (keywordTexts.includes('教程') || keywordTexts.includes('学习')) {
      return 'educational'
    }
    if (keywordTexts.includes('产品') || keywordTexts.includes('推广')) {
      return 'promotional'
    }

    return 'presentation'
  }

  hasDataMentions(text) {
    const dataKeywords = ['数据', '百分比', '增长', '下降', '统计', '数字']
    return dataKeywords.some(keyword => text.includes(keyword))
  }

  analyzeSentiment(text) {
    // 简单的情感分析
    const positiveKeywords = ['好', '棒', '优秀', '成功', '增长']
    const negativeKeywords = ['差', '问题', '失败', '下降', '困难']

    const positiveCount = positiveKeywords.filter(k => text.includes(k)).length
    const negativeCount = negativeKeywords.filter(k => text.includes(k)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  selectBestMaterial(materials) {
    // 根据质量评分选择最佳素材
    return materials.sort((a, b) => b.quality - a.quality)[0]
  }

  selectCompositionMode(contentType, template) {
    // 根据内容类型和模板选择组合模式
    const modeMap = {
      'data': 'data-driven',
      'educational': 'standard-presentation',
      'promotional': 'marketing-funnel',
      'presentation': 'standard-presentation'
    }

    return modeMap[contentType] || 'standard-presentation'
  }

  optimizeSceneTiming(scenes, totalDuration) {
    // 优化场景时长分配
    const optimalDuration = totalDuration / scenes.length

    return scenes.map(scene => ({
      ...scene,
      duration: Math.min(scene.duration, optimalDuration)
    }))
  }

  generatePreviewUrl(renderedScenes) {
    // 生成预览URL (实际实现需要合成视频)
    return 'blob:preview-url'
  }

  updateProgress(step, progress, callback) {
    this.currentStep = step
    this.progress = Math.round(progress)

    if (callback) {
      callback({
        step: this.currentStep,
        progress: this.progress
      })
    }
  }
}

export default MasterAutoGenerationAgent
```

### 进度提示UI设计

```vue
<!-- AutoGenerationProgress.vue -->
<template>
  <div class="auto-generation-overlay" v-if="visible">
    <div class="progress-modal">
      <!-- 动画图标 -->
      <div class="loading-icon">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
        </svg>
      </div>

      <!-- 当前步骤 -->
      <h3 class="step-title">{{ currentStep }}</h3>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>

      <!-- 进度百分比 -->
      <p class="progress-text">{{ progress }}%</p>

      <!-- 详细步骤列表 -->
      <div class="step-list">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :class="{
            'completed': step.completed,
            'current': step.current
          }"
        >
          <div class="step-icon">
            <svg v-if="step.completed" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <div v-else-if="step.current" class="dot"></div>
            <div v-else class="dot inactive"></div>
          </div>
          <span class="step-name">{{ step.name }}</span>
        </div>
      </div>

      <!-- 取消按钮 (可选) -->
      <button class="cancel-btn" @click="onCancel" v-if="canCancel">
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  currentStep: String,
  progress: Number,
  canCancel: Boolean
})

const emit = defineEmits(['cancel'])

const steps = computed(() => [
  {
    name: '分析视频内容',
    completed: props.progress > 40,
    current: props.progress <= 40 && props.progress > 0
  },
  {
    name: '推荐最佳模板',
    completed: props.progress > 50,
    current: props.progress > 40 && props.progress <= 50
  },
  {
    name: '搜索匹配素材',
    completed: props.progress > 70,
    current: props.progress > 50 && props.progress <= 70
  },
  {
    name: '组合生成内容',
    completed: props.progress > 85,
    current: props.progress > 70 && props.progress <= 85
  },
  {
    name: '渲染最终视频',
    completed: props.progress >= 100,
    current: props.progress > 85 && props.progress < 100
  }
])

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.auto-generation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.progress-modal {
  background: white;
  border-radius: 20px;
  padding: 48px;
  min-width: 480px;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.loading-icon {
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 100%;
  height: 100%;
}

.spinner .path {
  stroke: #0071E3;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0 0 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E8E8ED;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0071E3, #00A0FF);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 18px;
  font-weight: 600;
  color: #0071E3;
  margin: 0 0 32px;
}

.step-list {
  text-align: left;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.step-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon svg {
  width: 24px;
  height: 24px;
  fill: #34C759;
}

.step-icon .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0071E3;
}

.step-icon .dot.inactive {
  background: #C7C7CC;
}

.step-name {
  font-size: 16px;
  color: #1D1D1F;
}

.step-item.completed .step-name {
  color: #86868B;
}

.step-item.current .step-name {
  font-weight: 600;
  color: #0071E3;
}

.cancel-btn {
  padding: 12px 32px;
  background: transparent;
  border: 1px solid #D2D2D7;
  border-radius: 20px;
  color: #1D1D1F;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #F5F5F7;
  border-color: #B0B0B5;
}
</style>
```

---

## 🛠️ 技术实现方案

### 文件结构重构

```
vidslide-ai/
├── src/
│   ├── components/
│   │   ├── workspace/
│   │   │   ├── WorkspaceLayout.vue (新) ← 主布局容器
│   │   │   ├── WorkspaceHeader.vue (重构) ← 顶部工具栏
│   │   │   ├── AssetPanel.vue (新) ← 左侧素材库
│   │   │   ├── PreviewCanvas.vue (新) ← 中央预览区
│   │   │   ├── PropertyPanel.vue (新) ← 右侧属性面板
│   │   │   └── Timeline.vue (重构) ← 底部时间轴
│   │   ├── auto-generation/
│   │   │   ├── AutoGenerationProgress.vue (新) ← 进度提示
│   │   │   └── ResultPreview.vue (新) ← 结果预览
│   │   └── ... (其他组件)
│   ├── services/
│   │   ├── MasterAutoGenerationAgent.js (新) ← 自动化引擎
│   │   ├── VideoProcessingService.js (已有)
│   │   ├── TemplateRecommender.js (已有)
│   │   ├── MaterialService.js (已有)
│   │   ├── TemplateComposer.js (已有)
│   │   └── TemplateRenderer.js (已有)
│   ├── stores/
│   │   ├── workspaceStore.js (重构) ← 工作区状态管理
│   │   └── autoGenerationStore.js (新) ← 自动化流程状态
│   ├── composables/
│   │   ├── useAutoGeneration.js (新) ← 自动化流程逻辑
│   │   └── ... (其他composables)
│   └── styles/
│       └── theme.css (新) ← 设计系统变量
```

### Pinia Store 设计

```javascript
// src/stores/autoGenerationStore.js

import { defineStore } from 'pinia'
import MasterAutoGenerationAgent from '@/services/MasterAutoGenerationAgent'

export const useAutoGenerationStore = defineStore('autoGeneration', {
  state: () => ({
    // 自动化引擎
    agent: null,

    // 处理状态
    isProcessing: false,
    currentStep: '',
    progress: 0,

    // 结果
    result: null,
    error: null,

    // UI状态
    showProgress: false,
    showResult: false
  }),

  getters: {
    canStartGeneration: (state) => !state.isProcessing,
    hasResult: (state) => state.result !== null,
    canExport: (state) => state.result?.canExport || false
  },

  actions: {
    /**
     * 初始化Agent
     */
    initAgent() {
      if (!this.agent) {
        this.agent = new MasterAutoGenerationAgent()
      }
    },

    /**
     * 开始自动生成
     */
    async startAutoGeneration(videoFile) {
      this.initAgent()

      this.isProcessing = true
      this.showProgress = true
      this.progress = 0
      this.error = null

      try {
        const result = await this.agent.autoGenerate(
          videoFile,
          this.handleProgress.bind(this)
        )

        this.result = result
        this.showProgress = false
        this.showResult = true

        return result
      } catch (error) {
        this.error = error.message
        this.showProgress = false
        throw error
      } finally {
        this.isProcessing = false
      }
    },

    /**
     * 处理进度更新
     */
    handleProgress({ step, progress }) {
      this.currentStep = step
      this.progress = progress
    },

    /**
     * 取消生成
     */
    cancelGeneration() {
      // TODO: 实现取消逻辑
      this.isProcessing = false
      this.showProgress = false
      this.progress = 0
    },

    /**
     * 重置状态
     */
    reset() {
      this.isProcessing = false
      this.currentStep = ''
      this.progress = 0
      this.result = null
      this.error = null
      this.showProgress = false
      this.showResult = false
    }
  }
})
```

### Composable 设计

```javascript
// src/composables/useAutoGeneration.js

import { computed } from 'vue'
import { useAutoGenerationStore } from '@/stores/autoGenerationStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { ElMessage } from 'element-plus'

export function useAutoGeneration() {
  const autoGenStore = useAutoGenerationStore()
  const workspaceStore = useWorkspaceStore()

  // 计算属性
  const isProcessing = computed(() => autoGenStore.isProcessing)
  const progress = computed(() => autoGenStore.progress)
  const currentStep = computed(() => autoGenStore.currentStep)
  const showProgress = computed(() => autoGenStore.showProgress)
  const result = computed(() => autoGenStore.result)
  const canStartGeneration = computed(() => autoGenStore.canStartGeneration)

  /**
   * 一键自动生成
   */
  const autoGenerate = async () => {
    if (!workspaceStore.video.file) {
      ElMessage.error('请先上传视频!')
      return
    }

    try {
      console.log('🚀 开始一键自动生成...')

      const result = await autoGenStore.startAutoGeneration(
        workspaceStore.video.file
      )

      console.log('✅ 自动生成完成!', result)
      ElMessage.success('自动生成完成!')

      return result
    } catch (error) {
      console.error('❌ 自动生成失败:', error)
      ElMessage.error(`生成失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 取消生成
   */
  const cancelGeneration = () => {
    autoGenStore.cancelGeneration()
    ElMessage.info('已取消生成')
  }

  /**
   * 重新生成
   */
  const regenerate = async () => {
    autoGenStore.reset()
    return await autoGenerate()
  }

  return {
    // 状态
    isProcessing,
    progress,
    currentStep,
    showProgress,
    result,
    canStartGeneration,

    // 方法
    autoGenerate,
    cancelGeneration,
    regenerate
  }
}
```

---

## 📅 实施步骤

### 阶段1: UI布局重构 (优先级最高)

**目标**: 实现剪映风格的工作页面布局

#### 第1步: 创建设计系统 (1-2小时)
- [ ] 创建 `src/styles/theme.css` - 定义设计变量
- [ ] 创建 `src/styles/jianying-theme.css` - 剪映风格样式
- [ ] 在 `main.js` 中引入全局样式

#### 第2步: 重构WorkspaceLayout (2-3小时)
- [ ] 创建 `WorkspaceLayout.vue` - 四区域布局容器
- [ ] 实现响应式布局 (Grid/Flexbox)
- [ ] 实现可调整大小的面板 (Resizable)

#### 第3步: 实现核心组件 (4-6小时)
- [ ] `WorkspaceHeader.vue` - 顶部工具栏
- [ ] `AssetPanel.vue` - 左侧素材库
- [ ] `PreviewCanvas.vue` - 中央预览区
- [ ] `PropertyPanel.vue` - 右侧属性面板
- [ ] `Timeline.vue` - 底部时间轴

#### 第4步: 集成到WorkspaceView (1-2小时)
- [ ] 替换现有布局为新的 `WorkspaceLayout`
- [ ] 迁移现有功能到新组件
- [ ] 测试所有组件正常显示

#### 第5步: 样式优化 (2-3小时)
- [ ] 应用苹果设计风格
- [ ] 优化动画和过渡
- [ ] 响应式适配测试

**预计总时长**: 10-16小时 (1-2天)

### 阶段2: 全自动工作流程实现

**目标**: 实现一键自动生成功能

#### 第6步: 创建自动化引擎 (3-4小时)
- [ ] 创建 `MasterAutoGenerationAgent.js`
- [ ] 实现 `autoGenerate()` 主流程
- [ ] 集成现有服务 (VideoProcessing, TemplateRecommender等)

#### 第7步: 创建状态管理 (1-2小时)
- [ ] 创建 `autoGenerationStore.js`
- [ ] 创建 `useAutoGeneration.js` composable
- [ ] 集成到WorkspaceView

#### 第8步: 实现进度UI (2-3小时)
- [ ] 创建 `AutoGenerationProgress.vue`
- [ ] 实现进度动画
- [ ] 集成到布局

#### 第9步: 实现结果预览 (2-3小时)
- [ ] 创建 `ResultPreview.vue`
- [ ] 展示生成的视频预览
- [ ] 提供导出和编辑选项

#### 第10步: 集成"一键生成"按钮 (1小时)
- [ ] 在 `AssetPanel` 添加主CTA按钮
- [ ] 绑定自动生成逻辑
- [ ] 测试完整流程

#### 第11步: 优化和测试 (2-4小时)
- [ ] 错误处理优化
- [ ] 性能优化
- [ ] 端到端测试
- [ ] 用户体验优化

**预计总时长**: 11-17小时 (1.5-2天)

### 总计时间估算
- **阶段1 (UI重构)**: 10-16小时
- **阶段2 (自动化流程)**: 11-17小时
- **总计**: 21-33小时 (约3-4天)

---

## ✅ 验收标准

### UI布局验收
- [ ] 采用剪映的四区域布局
- [ ] 苹果风格的设计语言 (简洁、科技感、高级感)
- [ ] 所有组件都能正确显示和操作
- [ ] 布局可调整大小
- [ ] 响应式适配良好
- [ ] 时间轴清晰可用

### 自动化流程验收
- [ ] 用户上传视频后,一键点击即可自动生成
- [ ] 显示清晰的进度提示
- [ ] 30-60秒内完成自动生成
- [ ] 展示可播放的最终预览
- [ ] 可直接导出或进入手动调整模式
- [ ] 错误处理完善

### 用户体验验收
- [ ] 操作流程简单直观
- [ ] 界面美观专业
- [ ] 性能流畅 (60fps)
- [ ] 符合项目初衷: "上传视频 → 一键生成 → 满意导出 / 不满意调整"

---

## 📝 后续优化建议

### 短期优化 (1-2周)
1. 添加更多模板选项
2. 优化素材搜索算法
3. 改进内容分析准确度
4. 添加更多动画效果

### 中期优化 (1-2个月)
1. 实现更智能的场景检测
2. 支持更多视频格式
3. 添加协作功能
4. 实现云端存储

### 长期规划 (3-6个月)
1. AI模型自训练
2. 多语言支持
3. 移动端应用
4. 企业级功能

---

**方案版本**: v1.0
**创建时间**: 2026-01-16
**下次更新**: 实施完成后
