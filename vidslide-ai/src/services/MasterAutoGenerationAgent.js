/**
 * VidSlide AI - 主自动化生成引擎
 *
 * 功能：一键完成从视频到PPT+视频的全自动化流程
 *
 * 工作流程：
 * 1. 视频分析 (0-40%): 语音识别、关键帧提取、场景检测、内容分析
 * 2. 智能推荐 (40-50%): 自动选择最佳模板
 * 3. 素材匹配 (50-70%): 自动搜索和选择匹配素材
 * 4. 内容组合 (70-85%): 自动填充模板、生成场景序列
 * 5. 渲染合成 (85-100%): 渲染场景、生成预览
 */

import { VideoProcessingService } from './VideoProcessingService.js'
import { getBaiduNLPService } from './BaiduNLPService.js'
import TemplateArchitecture from '../utils/TemplateArchitecture.js'

/**
 * 主自动化生成引擎类
 */
export class MasterAutoGenerationAgent {
  constructor() {
    // 依赖的服务
    this.videoService = new VideoProcessingService()
    this.nlpService = getBaiduNLPService()

    // 状态
    this.isProcessing = false
    this.currentStep = ''
    this.progress = 0
    this.result = null
  }

  /**
   * 一键自动生成
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调 {step: string, progress: number}
   * @returns {Promise<GenerationResult>}
   */
  async autoGenerate(videoFile, onProgress) {
    this.isProcessing = true
    this.progress = 0

    try {
      console.log('🚀 开始一键自动生成...')

      // === 步骤1: 视频分析 (0% - 40%) ===
      this.updateProgress('正在分析视频内容...', 5, onProgress)

      const analysisResult = await this.analyzeVideo(videoFile, (step, progress) => {
        this.updateProgress(`分析视频: ${step}`, 5 + progress * 0.35, onProgress)
      })

      console.log('✅ 视频分析完成:', analysisResult)

      // === 步骤2: 智能推荐 (40% - 50%) ===
      this.updateProgress('正在推荐最佳模板...', 40, onProgress)

      const template = await this.recommendTemplate(analysisResult, progress => {
        this.updateProgress('推荐模板中...', 40 + progress * 0.1, onProgress)
      })

      console.log('✅ 模板推荐完成:', template)

      // === 步骤3: 素材匹配 (50% - 70%) ===
      this.updateProgress('正在搜索匹配素材...', 50, onProgress)

      const materials = await this.matchMaterials(analysisResult, progress => {
        this.updateProgress('搜索素材中...', 50 + progress * 0.2, onProgress)
      })

      console.log('✅ 素材匹配完成:', materials.length, '个素材')

      // === 步骤4: 内容组合 (70% - 85%) ===
      this.updateProgress('正在组合内容...', 70, onProgress)

      const composition = await this.composeContent(
        analysisResult,
        template,
        materials,
        progress => {
          this.updateProgress('组合内容中...', 70 + progress * 0.15, onProgress)
        }
      )

      console.log('✅ 内容组合完成:', composition)

      // === 步骤5: 渲染合成 (85% - 100%) ===
      this.updateProgress('正在渲染最终视频...', 85, onProgress)

      const finalResult = await this.renderFinal(composition, videoFile, progress => {
        this.updateProgress('渲染中...', 85 + progress * 0.15, onProgress)
      })

      console.log('✅ 渲染完成')

      this.updateProgress('生成完成!', 100, onProgress)
      this.isProcessing = false
      this.result = finalResult

      return finalResult
    } catch (error) {
      console.error('❌ 自动生成失败:', error)
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
      maxFrames: 50,
      onProgress: p => onProgress('提取关键帧', 20 + p * 0.2)
    })

    // 1.3 场景检测
    onProgress('检测场景', 40)
    const scenes = await this.videoService.detectScenes(keyframes)

    // 1.4 语音识别
    onProgress('语音识别', 60)
    const transcript = await this.videoService.recognizeSpeech(p => {
      onProgress('语音识别', 60 + p.progress * 0.002) // 60-80映射到60-64
    })

    // 1.5 内容分析
    onProgress('分析内容', 80)
    const keywords = transcript.keywords || []

    // 提取主题
    const topics = this.extractTopics(transcript.text, keywords)

    // 检测内容类型
    const contentType = this.detectContentType(transcript.text, keywords)

    onProgress('分析完成', 100)

    return {
      metadata,
      keyframes,
      scenes,
      transcript: transcript.text,
      keywords,
      topics,
      contentType
    }
  }

  /**
   * 步骤2: 推荐模板
   */
  async recommendTemplate(analysisResult, onProgress) {
    onProgress(10)

    // 使用 TemplateArchitecture 实例并确保已初始化
    const templateEngine = TemplateArchitecture

    // 确保模板引擎已初始化
    if (!templateEngine.initialized) {
      await templateEngine.initialize()
    }

    onProgress(30)

    // 获取所有可用模板
    const templates = templateEngine.getAllTemplates()

    console.log('📋 可用模板数量:', templates.length)

    if (!templates || templates.length === 0) {
      throw new Error('没有可用的模板')
    }

    onProgress(50)

    // 根据内容类型选择模板
    let selectedTemplate = null

    // 根据内容类型匹配模板
    if (analysisResult.contentType === 'data') {
      // 数据展示类 -> 数据可视化模板
      selectedTemplate = templates.find(t => t.id === 'data-visualization')
    } else if (analysisResult.contentType === 'educational') {
      // 教育类 -> 标准演示模板
      selectedTemplate = templates.find(t => t.id === 'standard-presentation')
    } else if (analysisResult.contentType === 'promotional') {
      // 推广类 -> 营销漏斗模板
      selectedTemplate = templates.find(t => t.id === 'marketing-funnel')
    } else {
      // 默认使用标准演示模板
      selectedTemplate = templates.find(t => t.id === 'standard-presentation')
    }

    // 如果没找到特定模板，使用第一个可用模板
    if (!selectedTemplate) {
      selectedTemplate = templates[0]
      console.log('⚠️ 未找到匹配模板，使用默认模板:', selectedTemplate.name || selectedTemplate.id)
    } else {
      console.log(
        '✅ 自动选择模板:',
        selectedTemplate.name || selectedTemplate.id,
        '(类型:',
        analysisResult.contentType,
        ')'
      )
    }

    onProgress(100)
    return selectedTemplate
  }

  /**
   * 步骤3: 匹配素材
   */
  async matchMaterials(analysisResult, onProgress) {
    const keywords = analysisResult.keywords.slice(0, 5) // 取前5个关键词
    const materials = []

    // 模拟素材搜索（实际应该调用 MaterialService）
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i]

      onProgress((i / keywords.length) * 100)

      try {
        // 为每个关键词创建一个素材占位符
        materials.push({
          keyword: keyword.text || keyword,
          material: {
            type: 'placeholder',
            keyword: keyword.text || keyword,
            url: null
          }
        })
      } catch (error) {
        console.warn(`素材搜索失败: ${keyword}`, error)
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

    // 根据转录文本分段
    const segments = this.segmentTranscript(
      analysisResult.transcript,
      analysisResult.keywords,
      template
    )

    onProgress(50)

    // 生成场景序列
    const scenes = segments.map((segment, index) => {
      return {
        id: `scene-${index}`,
        title: segment.title,
        content: segment.content,
        keywords: segment.keywords,
        duration: segment.duration,
        startTime: segment.startTime,
        endTime: segment.endTime,
        template: template.id,
        material: materials[index % materials.length] // 循环使用素材
      }
    })

    onProgress(80)

    // 优化时长分配
    const optimizedScenes = this.optimizeSceneTiming(scenes, analysisResult.metadata.duration)

    onProgress(100)

    return {
      template,
      scenes: optimizedScenes,
      materials,
      metadata: analysisResult.metadata,
      transcript: analysisResult.transcript,
      keywords: analysisResult.keywords
    }
  }

  /**
   * 步骤5: 渲染最终视频
   */
  async renderFinal(composition, videoFile, onProgress) {
    onProgress(20)

    // 准备渲染数据
    const renderData = {
      video: {
        file: videoFile,
        url: URL.createObjectURL(videoFile),
        duration: composition.metadata.duration,
        width: composition.metadata.width,
        height: composition.metadata.height
      },
      template: composition.template,
      scenes: composition.scenes,
      materials: composition.materials,
      transcript: composition.transcript,
      keywords: composition.keywords
    }

    onProgress(60)

    // 模拟渲染延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    onProgress(100)

    return {
      ...renderData,
      canExport: true,
      previewReady: true
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 检测内容类型
   */
  detectContentType(text, keywords) {
    const keywordTexts = keywords.map(k => k.text || k).join(' ')
    const fullText = text + ' ' + keywordTexts

    if (fullText.includes('数据') || fullText.includes('统计') || fullText.includes('百分比')) {
      return 'data'
    }
    if (fullText.includes('教程') || fullText.includes('学习') || fullText.includes('课程')) {
      return 'educational'
    }
    if (fullText.includes('产品') || fullText.includes('推广') || fullText.includes('营销')) {
      return 'promotional'
    }

    return 'presentation'
  }

  /**
   * 提取主题
   */
  extractTopics(text, keywords) {
    // 使用前3个关键词作为主题
    return keywords.slice(0, 3).map(k => k.text || k)
  }

  /**
   * 分段转录文本
   */
  segmentTranscript(transcript, keywords, template) {
    // 简单分段：按句子分
    const sentences = transcript.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)

    // 每个场景包含2-3个句子
    const segments = []
    const sentencesPerScene = 2

    for (let i = 0; i < sentences.length; i += sentencesPerScene) {
      const sceneSentences = sentences.slice(i, i + sentencesPerScene)
      const content = sceneSentences.join('。') + '。'

      // 提取这段内容的关键词
      const sceneKeywords = keywords.filter(k => content.includes(k.text || k)).slice(0, 3)

      // 生成标题（使用第一个关键词或前几个字）
      const title = sceneKeywords[0]?.text || content.substring(0, 10) + '...'

      segments.push({
        title,
        content,
        keywords: sceneKeywords,
        duration: 3, // 默认每个场景3秒
        startTime: i * 3,
        endTime: (i + sentencesPerScene) * 3
      })
    }

    return segments
  }

  /**
   * 优化场景时长
   */
  optimizeSceneTiming(scenes, totalDuration) {
    if (scenes.length === 0) return scenes

    // 平均分配时长
    const durationPerScene = totalDuration / scenes.length

    return scenes.map((scene, index) => ({
      ...scene,
      duration: durationPerScene,
      startTime: index * durationPerScene,
      endTime: (index + 1) * durationPerScene
    }))
  }

  /**
   * 更新进度
   */
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

  /**
   * 取消生成
   */
  cancel() {
    this.isProcessing = false
    console.log('🛑 自动生成已取消')
  }
}

// 导出单例
let instance = null

export function getMasterAutoGenerationAgent() {
  if (!instance) {
    instance = new MasterAutoGenerationAgent()
  }
  return instance
}

export default MasterAutoGenerationAgent
