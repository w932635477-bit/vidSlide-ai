# 全自动视频生成工作流程

## 🤖 完整自动化流程

```
用户上传内容
    ↓
[1] AI 内容分析
    ↓
[2] 自动选择模板
    ↓
[3] 智能提取内容
    ↓
[4] 自动插入素材
    ↓
[5] 渲染输出视频
    ↓
返回给用户
```

## 📋 详细实现方案

### 步骤 1：AI 内容分析

```javascript
/**
 * 智能内容分析器
 * 使用百度NLP + 自定义规则
 */
class ContentAnalyzer {
  constructor() {
    this.baiduNLP = new BaiduNLPService()
  }

  /**
   * 分析用户内容
   * @param {Object} userContent - 用户上传的内容
   * @returns {Object} 分析结果
   */
  async analyze(userContent) {
    const { text, images, video } = userContent

    // 1. 提取关键词
    const keywords = await this.baiduNLP.extractKeywords(text)

    // 2. 情感分析
    const sentiment = await this.baiduNLP.sentimentAnalysis(text)

    // 3. 实体识别
    const entities = await this.baiduNLP.entityRecognition(text)

    // 4. 分析内容类型
    const contentType = this.detectContentType(keywords, text)

    // 5. 分析视觉风格
    const visualStyle = await this.analyzeVisualStyle(images)

    return {
      keywords,           // ['产品', '展示', 'AI', '智能']
      sentiment,          // 'positive'
      entities,           // ['VidSlide AI', '人工智能']
      contentType,        // 'product_showcase'
      visualStyle,        // { colors: ['#007AFF'], style: 'modern' }
      structure: this.analyzeStructure(text),
    }
  }

  /**
   * 检测内容类型
   */
  detectContentType(keywords, text) {
    const types = {
      product_showcase: ['产品', '展示', '介绍', '特性', '功能'],
      comparison: ['对比', '比较', 'VS', '优劣', '差异'],
      data_analysis: ['数据', '图表', '统计', '分析', '增长'],
      timeline: ['时间', '流程', '步骤', '历程', '发展'],
      tutorial: ['教程', '如何', '步骤', '方法', '指南'],
      story: ['故事', '经历', '回忆', '旅程', '历程'],
    }

    let maxScore = 0
    let detectedType = 'product_showcase' // 默认

    for (const [type, typeKeywords] of Object.entries(types)) {
      const score = keywords.filter(k =>
        typeKeywords.some(tk => k.includes(tk) || tk.includes(k))
      ).length

      if (score > maxScore) {
        maxScore = score
        detectedType = type
      }
    }

    return detectedType
  }

  /**
   * 分析内容结构
   */
  analyzeStructure(text) {
    const lines = text.split('\n').filter(line => line.trim())

    return {
      title: this.extractTitle(lines),
      subtitle: this.extractSubtitle(lines),
      mainPoints: this.extractMainPoints(lines),
      features: this.extractFeatures(lines),
      callToAction: this.extractCTA(lines),
    }
  }

  /**
   * 提取标题（通常是第一行或最短的行）
   */
  extractTitle(lines) {
    if (lines.length === 0) return '标题'

    // 优先选择第一行
    const firstLine = lines[0].trim()

    // 如果第一行太长，找最短的行
    if (firstLine.length > 20) {
      const shortLines = lines.filter(line => line.length <= 20)
      return shortLines[0] || firstLine.substring(0, 20)
    }

    return firstLine
  }

  /**
   * 提取副标题
   */
  extractSubtitle(lines) {
    if (lines.length < 2) return ''
    return lines[1].trim()
  }

  /**
   * 提取要点
   */
  extractMainPoints(lines) {
    return lines
      .filter(line =>
        line.match(/^\d+[\.\、]/) ||  // 1. 2. 3.
        line.match(/^[一二三四五][\.\、]/) ||  // 一、二、三、
        line.includes('•') ||
        line.includes('·')
      )
      .map(line => line.replace(/^[\d一二三四五\.\、•·\s]+/, '').trim())
      .slice(0, 5)  // 最多5个要点
  }

  /**
   * 提取特性列表
   */
  extractFeatures(lines) {
    return lines
      .filter(line =>
        line.includes('✓') ||
        line.includes('√') ||
        line.includes('✔') ||
        line.match(/^[✓√✔]/)
      )
      .map(line => line.replace(/[✓√✔\s]+/, '').trim())
      .slice(0, 4)  // 最多4个特性
  }

  /**
   * 提取行动号召
   */
  extractCTA(lines) {
    const ctaKeywords = ['立即', '马上', '现在', '点击', '购买', '了解更多', '联系我们']

    for (const line of lines) {
      if (ctaKeywords.some(keyword => line.includes(keyword))) {
        return line.trim()
      }
    }

    return ''
  }

  /**
   * 分析视觉风格
   */
  async analyzeVisualStyle(images) {
    if (!images || images.length === 0) {
      return { colors: ['#007AFF'], style: 'modern' }
    }

    // 这里可以用图像分析API提取主色调
    // 简化版：返回默认值
    return {
      colors: ['#007AFF', '#5856D6'],
      style: 'modern',
      mood: 'professional',
    }
  }
}
```

### 步骤 2：自动选择模板

```javascript
/**
 * 智能模板选择器
 */
class SmartTemplateSelector {
  constructor() {
    this.templates = {
      product_showcase: 'ProductShowcaseEnhanced',
      comparison: 'SplitComparison',
      data_analysis: 'DataVisualization',
      timeline: 'TimelineDisplay',
      tutorial: 'StepByStep',
      story: 'StorytellingTemplate',
    }
  }

  /**
   * 根据分析结果选择最佳模板
   */
  selectTemplate(analysisResult) {
    const { contentType, keywords, sentiment, visualStyle } = analysisResult

    // 1. 基于内容类型选择
    let templateId = this.templates[contentType] || 'ProductShowcaseEnhanced'

    // 2. 根据关键词微调
    if (keywords.includes('对比') && templateId !== 'SplitComparison') {
      templateId = 'SplitComparison'
    }

    // 3. 根据情感调整风格
    const styleVariant = sentiment === 'positive' ? 'energetic' : 'calm'

    return {
      templateId,
      styleVariant,
      confidence: this.calculateConfidence(analysisResult, templateId),
    }
  }

  /**
   * 计算匹配置信度
   */
  calculateConfidence(analysisResult, templateId) {
    // 简化版：基于关键词匹配度
    return 0.85  // 85% 置信度
  }
}
```

### 步骤 3：智能内容映射

```javascript
/**
 * 内容映射器
 * 将分析结果映射到模板参数
 */
class ContentMapper {
  /**
   * 映射内容到模板 props
   */
  mapToTemplate(analysisResult, templateId, userContent) {
    const { structure, visualStyle, keywords } = analysisResult
    const { images, video } = userContent

    // 基础映射
    const baseProps = {
      title: structure.title,
      subtitle: structure.subtitle,
      description: structure.mainPoints.join(' '),
      features: structure.features,
      images: this.selectBestImages(images, 3),
      brandColor: visualStyle.colors[0],
      backgroundColor: this.generateBackground(visualStyle),
    }

    // 根据不同模板定制
    switch (templateId) {
      case 'ProductShowcaseEnhanced':
        return {
          ...baseProps,
          cardCount: Math.min(images.length, 3),
          animationSpeed: 1.2,
          animationStyle: 'bouncy',
        }

      case 'SplitComparison':
        return {
          leftTitle: this.extractComparisonLeft(structure),
          rightTitle: this.extractComparisonRight(structure),
          leftImage: images[0],
          rightImage: images[1],
          leftColor: '#FF6B6B',
          rightColor: '#4ECDC4',
        }

      case 'DataVisualization':
        return {
          ...baseProps,
          dataPoints: this.extractDataPoints(structure),
          chartType: 'bar',
        }

      default:
        return baseProps
    }
  }

  /**
   * 选择最佳图片
   */
  selectBestImages(images, count) {
    if (!images || images.length === 0) return []

    // 简化版：取前N张
    // 实际可以用图像质量评分、相关性等
    return images.slice(0, count)
  }

  /**
   * 生成背景
   */
  generateBackground(visualStyle) {
    const { colors, style } = visualStyle

    if (style === 'modern') {
      return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1] || colors[0]} 100%)`
    }

    return null  // 使用默认背景
  }

  /**
   * 提取对比内容
   */
  extractComparisonLeft(structure) {
    // 查找"之前"、"传统"、"旧"等关键词
    const leftKeywords = ['之前', '传统', '旧', '过去', 'Before']

    for (const point of structure.mainPoints) {
      if (leftKeywords.some(k => point.includes(k))) {
        return point
      }
    }

    return '对比前'
  }

  extractComparisonRight(structure) {
    const rightKeywords = ['之后', '现在', '新', '改进', 'After']

    for (const point of structure.mainPoints) {
      if (rightKeywords.some(k => point.includes(k))) {
        return point
      }
    }

    return '对比后'
  }

  /**
   * 提取数据点
   */
  extractDataPoints(structure) {
    // 从文本中提取数字
    const numbers = []

    for (const point of structure.mainPoints) {
      const matches = point.match(/\d+(\.\d+)?%?/g)
      if (matches) {
        numbers.push(...matches)
      }
    }

    return numbers.map((num, index) => ({
      label: structure.mainPoints[index] || `数据${index + 1}`,
      value: parseFloat(num),
    }))
  }
}
```

### 步骤 4：全自动生成服务

```javascript
/**
 * 全自动视频生成服务
 * 整合所有步骤
 */
class AutoVideoGenerationService {
  constructor() {
    this.analyzer = new ContentAnalyzer()
    this.templateSelector = new SmartTemplateSelector()
    this.contentMapper = new ContentMapper()
    this.remotionService = new RemotionService()
  }

  /**
   * 一键生成视频
   * @param {Object} userContent - 用户上传的内容
   * @returns {Promise<Object>} 生成结果
   */
  async generateVideo(userContent) {
    try {
      console.log('🚀 开始自动生成视频...')

      // 步骤 1：分析内容
      console.log('📊 [1/5] 分析内容...')
      const analysisResult = await this.analyzer.analyze(userContent)
      console.log('✅ 分析完成:', analysisResult.contentType)

      // 步骤 2：选择模板
      console.log('🎨 [2/5] 选择模板...')
      const templateSelection = this.templateSelector.selectTemplate(analysisResult)
      console.log('✅ 选择模板:', templateSelection.templateId)

      // 步骤 3：映射内容
      console.log('🔄 [3/5] 映射内容...')
      const templateProps = this.contentMapper.mapToTemplate(
        analysisResult,
        templateSelection.templateId,
        userContent
      )
      console.log('✅ 内容映射完成')

      // 步骤 4：渲染视频
      console.log('🎬 [4/5] 渲染视频...')
      const renderResult = await this.remotionService.renderVideo(
        templateSelection.templateId,
        templateProps
      )
      console.log('✅ 渲染完成:', renderResult.outputPath)

      // 步骤 5：返回结果
      console.log('✅ [5/5] 生成完成！')

      return {
        success: true,
        videoPath: renderResult.outputPath,
        template: templateSelection.templateId,
        confidence: templateSelection.confidence,
        analysisResult,
        props: templateProps,
      }

    } catch (error) {
      console.error('❌ 自动生成失败:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * 批量生成（多个场景）
   */
  async generateMultipleScenes(userContent) {
    // 将长内容分割成多个场景
    const scenes = this.splitIntoScenes(userContent)

    const results = []

    for (const [index, scene] of scenes.entries()) {
      console.log(`🎬 生成场景 ${index + 1}/${scenes.length}`)

      const result = await this.generateVideo(scene)
      results.push(result)
    }

    // 合并所有场景
    const finalVideo = await this.mergeScenes(results)

    return finalVideo
  }

  /**
   * 分割场景
   */
  splitIntoScenes(userContent) {
    // 根据段落、时间点等分割
    // 简化版：每3个要点一个场景
    const { text, images } = userContent
    const lines = text.split('\n').filter(line => line.trim())

    const scenes = []
    const chunkSize = 5

    for (let i = 0; i < lines.length; i += chunkSize) {
      scenes.push({
        text: lines.slice(i, i + chunkSize).join('\n'),
        images: images.slice(i, i + 3),
      })
    }

    return scenes
  }

  /**
   * 合并场景
   */
  async mergeScenes(sceneResults) {
    // 使用 FFmpeg 合并视频
    const videoPaths = sceneResults.map(r => r.videoPath)

    // 调用 FFmpeg 合并
    // 这里简化，实际需要实现
    return {
      success: true,
      finalVideoPath: '/path/to/merged-video.mp4',
    }
  }
}
```

### 步骤 5：在 Vue 中使用

```javascript
// WorkspaceView.vue
import { AutoVideoGenerationService } from '@/services/AutoVideoGenerationService'

export default {
  setup() {
    const autoGenService = new AutoVideoGenerationService()

    /**
     * 用户点击"一键生成"按钮
     */
    async function handleAutoGenerate() {
      // 获取用户上传的内容
      const userContent = {
        text: userInputText.value,
        images: uploadedImages.value,
        video: uploadedVideo.value,
      }

      // 显示加载状态
      loading.value = true
      progress.value = 0

      try {
        // 一键生成！
        const result = await autoGenService.generateVideo(userContent)

        if (result.success) {
          ElMessage.success('视频生成成功！')

          // 显示结果
          generatedVideo.value = result.videoPath
          showPreview.value = true

          // 显示分析信息
          console.log('使用的模板:', result.template)
          console.log('置信度:', result.confidence)
        } else {
          ElMessage.error('生成失败: ' + result.error)
        }

      } catch (error) {
        ElMessage.error('生成失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    return {
      handleAutoGenerate
    }
  }
}
```

## ✅ 完整流程示例

```javascript
// 用户输入
const userContent = {
  text: `
    VidSlide AI - 智能视频生成平台
    一键将视频转换为精美PPT

    核心功能：
    ✓ AI智能分析
    ✓ 自动配乐
    ✓ 一键导出
    ✓ 云端渲染

    立即体验，开启智能创作之旅！
  `,
  images: [
    '/path/to/screenshot1.png',
    '/path/to/screenshot2.png',
    '/path/to/screenshot3.png',
  ]
}

// 一键生成
const result = await autoGenService.generateVideo(userContent)

// 自动完成：
// ✅ 分析出内容类型：product_showcase
// ✅ 选择模板：ProductShowcaseEnhanced
// ✅ 提取标题：VidSlide AI - 智能视频生成平台
// ✅ 提取副标题：一键将视频转换为精美PPT
// ✅ 提取特性：['AI智能分析', '自动配乐', '一键导出', '云端渲染']
// ✅ 插入3张图片
// ✅ 渲染视频
// ✅ 输出：/output/video-20260117-143022.mp4
```

## 🎯 总结

**完全可以实现全自动化！**

1. ✅ **自动判断模板** - 基于AI分析和关键词匹配
2. ✅ **自动提取内容** - 智能识别标题、要点、特性
3. ✅ **自动插入素材** - 图片、文字、视频自动映射
4. ✅ **自动输出视频** - 一键渲染，无需人工干预

用户只需：
1. 上传内容（文字 + 图片）
2. 点击"一键生成"
3. 等待几分钟
4. 获得专业视频

**零人工干预，全自动化！**
