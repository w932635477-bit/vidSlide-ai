/**
 * VidSlide AI - 主自动化生成引擎
 *
 * 功能：一键完成从视频到PPT+视频的全自动化流程
 *
 * 工作流程：
 * 1. 视频分析 (0-40%): 语音识别、关键帧提取、场景检测、内容分析
 * 2. 智能推荐 (40-50%): 自动选择最佳模板
 * 3. 内容组合 (50-85%): 使用豆包生图、自动填充模板、生成场景序列
 * 4. 渲染合成 (85-100%): 渲染场景、生成预览
 */

import { VideoProcessingService } from './VideoProcessingService.js'
import { getBaiduNLPService } from './BaiduNLPService.js'
import TemplateArchitecture from '../utils/TemplateArchitecture.js'
import videoCompositionService from './VideoCompositionService.js'
import { getInstance as getMicroSceneGenerator } from './MicroSceneGeneratorV3.js'
import config from '../config/app.config.js'

/**
 * 主自动化生成引擎类
 */
export class MasterAutoGenerationAgent {
  constructor() {
    // 依赖的服务
    this.videoService = new VideoProcessingService()
    this.nlpService = getBaiduNLPService()

    // 服务器端 API 配置（从配置文件读取）
    this.serverURL = config.server.url
    this.useServerAPI = config.server.useServerAPI
    this.pollInterval = config.server.pollInterval

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
    // 检测是否在浏览器环境且启用服务器端 API
    if (typeof window !== 'undefined' && this.useServerAPI) {
      console.log('🌐 使用服务器端 API 进行一键生成');
      return await this.autoGenerateViaServer(videoFile, onProgress);
    }

    // 原有的浏览器端流程
    return await this.autoGenerateLocally(videoFile, onProgress);
  }

  /**
   * 通过服务器端 API 进行一键生成
   */
  async autoGenerateViaServer(videoFile, onProgress) {
    this.isProcessing = true
    this.progress = 0

    try {
      console.log('🚀 开始服务器端一键自动生成...')
      this.updateProgress('正在上传视频到服务器...', 5, onProgress)

      // 1. 上传视频并创建任务
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('platform', 'douyin')

      const response = await fetch(`${this.serverURL}/api/auto-generate`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.statusText}`)
      }

      const { taskId, message } = await response.json()
      console.log(`✅ 任务创建成功: ${taskId}`)

      this.updateProgress('服务器正在处理...', 10, onProgress)

      // 2. 轮询任务状态
      let lastProgress = 10
      while (true) {
        await new Promise(resolve => setTimeout(resolve, this.pollInterval))

        const statusResponse = await fetch(`${this.serverURL}/api/auto-generate/${taskId}/status`)
        if (!statusResponse.ok) {
          throw new Error('查询任务状态失败')
        }

        const statusData = await statusResponse.json()
        const { progress, message: statusMessage, status, videoUrl, videoPath } = statusData

        // 更新进度
        if (progress > lastProgress) {
          this.updateProgress(statusMessage || '处理中...', progress, onProgress)
          lastProgress = progress
        }

        // 检查任务状态
        if (status === 'completed') {
          console.log('✅ 服务器端处理完成')
          this.updateProgress('下载生成的视频...', 95, onProgress)

          // 3. 下载生成的视频
          const videoResponse = await fetch(`${this.serverURL}${videoUrl}`)
          if (!videoResponse.ok) {
            throw new Error('下载视频失败')
          }

          const videoBlob = await videoResponse.blob()
          const localVideoUrl = URL.createObjectURL(videoBlob)

          this.updateProgress('生成完成!', 100, onProgress)
          this.isProcessing = false

          // 返回结果（格式与本地流程一致）
          return {
            video: {
              url: localVideoUrl,
              blob: videoBlob,
              duration: 0, // 服务器端暂不返回
              fileSize: videoBlob.size
            },
            template: {
              id: 'modern-business',
              name: 'Modern Business',
              category: 'business'
            },
            scenes: [], // 服务器端暂不返回详细场景
            transcript: '',
            keywords: [],
            serverGenerated: true // 标记为服务器端生成
          }
        }

        if (status === 'failed') {
          throw new Error(statusData.error || '服务器端处理失败')
        }

        // 继续轮询
      }
    } catch (error) {
      console.error('❌ 服务器端生成失败:', error)
      this.isProcessing = false
      throw new Error(`服务器端生成失败: ${error.message}`)
    }
  }

  /**
   * 本地浏览器端一键生成（原有流程）
   */
  async autoGenerateLocally(videoFile, onProgress) {
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

      // === 步骤3: 内容组合 (50% - 85%) ===
      this.updateProgress('正在组合内容...', 50, onProgress)

      const composition = await this.composeContent(
        analysisResult,
        template,
        progress => {
          this.updateProgress('组合内容中...', 50 + progress * 0.35, onProgress)
        }
      )

      console.log('✅ 内容组合完成:', composition)

      // === 步骤4: 渲染合成 (85% - 100%) ===
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

    // 使用TemplateArchitecture的智能推荐功能
    const recommendations = templateEngine.recommendTemplates(analysisResult)

    console.log('🎯 模板推荐结果:', recommendations.length, '个推荐')

    // 选择评分最高的模板
    let selectedTemplate = null

    if (recommendations.length > 0) {
      selectedTemplate = recommendations[0].template
      console.log(
        '✅ 自动选择模板:',
        selectedTemplate.name || selectedTemplate.id,
        '(评分:',
        recommendations[0].score,
        ')',
        '-',
        recommendations[0].reason
      )
    } else {
      // 如果推荐失败，使用第一个可用模板
      selectedTemplate = templates[0]
      console.log('⚠️ 推荐失败，使用默认模板:', selectedTemplate.name || selectedTemplate.id)
    }

    onProgress(100)
    return selectedTemplate
  }

  /**
   * 步骤3: 匹配素材
   */
  /**
   * 步骤4: 组合内容
   */
  async composeContent(analysisResult, template, onProgress) {
    onProgress(10)

    // 根据转录文本分段
    const segments = this.segmentTranscript(
      analysisResult.transcript,
      analysisResult.keywords,
      template
    )

    onProgress(30)

    // 为关键词生成图片（使用豆包生图服务）
    console.log('🎨 开始生成图片...');

    // 动态导入 DoubaoImageService（仅在 Node.js 环境）
    let generatedImages = [];
    if (typeof window === 'undefined') {
      // Node.js 环境 - 使用豆包生图
      const { getInstance: getDoubaoService } = await import('./DoubaoImageService.js');
      const doubaoService = getDoubaoService();

      const imageRequests = analysisResult.keywords.map(kw => ({
        keyword: kw.text || kw,
        context: {
          stylePreset: 'tech',
          sceneType: 'basic',
          size: '1920x1920',
          quality: 'standard',
          useAdvancedPrompt: true
        }
      }));

      generatedImages = await doubaoService.generateImages(imageRequests);
      console.log(`✅ 生成 ${generatedImages.length} 张图片`);
    } else {
      // 浏览器环境 - 使用测试图片或跳过
      console.warn('⚠️ 浏览器环境，跳过豆包生图');
      generatedImages = analysisResult.keywords.map(() => null);
    }

    onProgress(50)

    // 生成场景序列 - 使用微场景生成器
    const scenes = []
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index]

      // 为segment添加transcript属性（从analysisResult中获取对应时间段的字幕）
      const segmentWithTranscript = {
        ...segment,
        transcript: this.getTranscriptForSegment(
          analysisResult.transcript,
          segment.startTime,
          segment.endTime
        ),
        id: index
      }

      // 使用微场景生成器生成微场景（传递豆包生成的图片）
      const microSceneGenerator = getMicroSceneGenerator();
      const microScenes = await microSceneGenerator.generateMicroScenes(
        segmentWithTranscript,
        analysisResult.keywords,
        generatedImages.slice(index, index + 1) // 为每个场景分配一张图片
      )

      console.log(`📊 场景 ${index} 生成了 ${microScenes.length} 个微场景`)

      // 为每个微场景分配素材和模板
      for (const microScene of microScenes) {
        console.log(`  处理微场景: type=${microScene.type}, startTime=${microScene.startTime}, endTime=${microScene.endTime}`)

        if (microScene.type === 'composition') {
          // 组合场景 - 使用组合单元
          const compositionScene = {
            ...microScene,
            id: `${index}-composition-${scenes.length}`,
            compositionUnitPath: microScene.compositionUnitPath, // 组合单元路径
            template: microScene.template,
            type: 'composition'
          }

          console.log(`  ✅ 添加组合场景: id=${compositionScene.id}, type=${compositionScene.type}`)
          scenes.push(compositionScene)
        } else {
          // 原视频片段
          const originalScene = {
            ...microScene,
            id: `${index}-original-${scenes.length}`,
            type: 'original'
          }

          console.log(`  ✅ 添加原视频场景: id=${originalScene.id}, type=${originalScene.type}`)
          scenes.push(originalScene)
        }
      }

      onProgress(50 + ((index + 1) / segments.length) * 30)
    }

    onProgress(80)

    // 打印最终场景列表
    console.log(`📋 最终生成 ${scenes.length} 个场景:`)
    scenes.forEach((scene, i) => {
      console.log(`  ${i + 1}. ${scene.type === 'composition' ? '🎨 组合' : '📹 原视频'}: ${scene.startTime?.toFixed(1)}s - ${scene.endTime?.toFixed(1)}s (id: ${scene.id})`)
    })

    // 优化时长分配
    const optimizedScenes = this.optimizeSceneTiming(scenes, analysisResult.metadata.duration)

    console.log(`📋 优化后 ${optimizedScenes.length} 个场景:`)
    optimizedScenes.forEach((scene, i) => {
      console.log(`  ${i + 1}. ${scene.type === 'composition' ? '🎨 组合' : '📹 原视频'}: ${scene.startTime?.toFixed(1)}s - ${scene.endTime?.toFixed(1)}s (id: ${scene.id})`)
    })

    onProgress(100)

    return {
      template,
      scenes: optimizedScenes,
      metadata: analysisResult.metadata,
      transcript: analysisResult.transcript,
      keywords: analysisResult.keywords
    }
  }

  /**
   * 为场景分配素材 (优化版 - 只需要背景)
   */
  /**
   * 生成图表数据 (优化版 - 可选)
   */
  generateChartData(scene) {
    // 判断是否需要数据可视化
    const needsChart = this.shouldGenerateChart(scene)

    if (!needsChart) {
      return null
    }

    const keywords = scene.keywords.slice(0, 4)

    if (keywords.length === 0) {
      return null
    }

    return {
      type: 'bar',
      labels: keywords.map(k => k.text || k),
      values: keywords.map(() => Math.floor(Math.random() * 40) + 60),
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
    }
  }

  /**
   * 判断是否需要生成图表 (新增方法)
   */
  shouldGenerateChart(scene) {
    const content = (scene.content || scene.text || '').toLowerCase()

    // 包含数据相关关键词时生成图表
    const dataKeywords = ['数据', '增长', '下降', '对比', '统计', '百分比', '%',
                          'data', 'growth', 'increase', 'decrease', 'statistics']

    return dataKeywords.some(keyword => content.includes(keyword))
  }

  /**
   * 步骤5: 渲染最终视频
   */
  /**
   * 步骤5: 渲染最终视频
   * @param {object} composition - 组合结果
   * @param {File} videoFile - 原始视频文件
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<object>} 渲染结果
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
      transcript: composition.transcript,
      keywords: composition.keywords
    }

    onProgress(40)

    // 调用视频合成服务进行完整合成
    try {
      console.log('🎬 开始完整视频合成流程...')

      // 调用VideoCompositionService进行完整合成
      const compositionResult = await this.composeFullVideo(
        videoFile,
        { ...composition, template: composition.template, scenes: composition.scenes },
        { platform: 'douyin' },
        progress => {
          // 将合成进度映射到40-100%
          onProgress(40 + progress.progress * 0.6)
        }
      )

      console.log('✅ 视频合成完成:', compositionResult)

      onProgress(100)

      // 返回合成结果
      return {
        ...renderData,
        video: {
          ...renderData.video,
          url: compositionResult.videoUrl,
          composedUrl: compositionResult.videoUrl,
          blob: compositionResult.videoBlob
        },
        compositionResult,
        canExport: true,
        canDownload: true,
        previewReady: true,
        isComposed: true,
        fileSize: compositionResult.fileSize,
        metadata: compositionResult.metadata
      }
    } catch (error) {
      console.error('❌ 视频合成失败:', error)

      // 返回预览模式
      onProgress(100)

      return {
        ...renderData,
        canExport: true,
        previewReady: true,
        isRendered: false,
        previewMode: true,
        error: error.message
      }
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
   * 获取指定时间段的字幕
   * @param {Array|string} transcript - 字幕数组或字符串
   * @param {number} startTime - 开始时间
   * @param {number} endTime - 结束时间
   * @returns {Array} 字幕片段数组
   */
  getTranscriptForSegment(transcript, startTime, endTime) {
    // 如果transcript是字符串，转换为简单的字幕数组格式
    if (typeof transcript === 'string') {
      const sentences = transcript.split(/[。！？.!?]+/).filter(s => s.trim().length > 0)
      const duration = endTime - startTime
      const timePerSentence = duration / sentences.length

      return sentences.map((text, index) => ({
        text: text.trim(),
        startTime: startTime + index * timePerSentence,
        endTime: startTime + (index + 1) * timePerSentence
      }))
    }

    // 如果transcript已经是数组，过滤出时间范围内的字幕
    if (Array.isArray(transcript)) {
      return transcript.filter(
        item => item.startTime >= startTime && item.endTime <= endTime
      )
    }

    // 兜底：返回空数组
    return []
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
   * 完整视频合成
   * 使用VideoCompositionService进行完整的视频合成流程
   *
   * @param {File} videoFile - 原始视频文件
   * @param {Object} generationResult - 自动生成的结果
   * @param {Object} options - 合成选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 合成结果
   */
  async composeFullVideo(videoFile, generationResult, options = {}, onProgress = null) {
    try {
      console.log('🎬 开始完整视频合成流程...')

      // 准备场景数据
      const scenes = generationResult.scenes.map((scene, index) => ({
        id: index + 1,
        type: scene.type || 'original', // 🔥 保留场景类型！
        title: scene.title || `场景 ${index + 1}`,
        content: scene.content || scene.text || '',
        subtitle: scene.subtitle || '',
        duration: scene.duration || 5,
        startTime: scene.startTime || index * 5,
        endTime: scene.endTime || (index + 1) * 5,
        materials: scene.materials || [],
        keywords: scene.keywords || [],
        templateId: scene.templateId // 🔥 保留模板ID
      }))

      // 准备模板配置
      const template = {
        id: generationResult.template?.id || 'modern-business',
        name: generationResult.template?.name || 'Modern Business',
        category: generationResult.template?.category || 'business'
      }

      // 合成选项
      const compositionOptions = {
        platform: options.platform || 'douyin',
        pipConfig: {
          position: 'auto', // 自动选择位置（会使用人脸识别）
          useFaceDetection: true, // 启用人脸识别（默认值）
          pipWidth: 280, // PIP 宽度
          pipHeight: 280, // PIP 高度
          shape: 'rounded-square', // 圆角方形
          cornerRadius: 20 // 圆角半径
        },
        ...options
      }

      console.log('📋 合成配置:', {
        scenes: scenes.length,
        template: template.id,
        platform: compositionOptions.platform
      })

      // 调用VideoCompositionService
      const result = await videoCompositionService.composeVideo(
        videoFile,
        scenes,
        template,
        compositionOptions,
        onProgress
      )

      console.log('✅ 视频合成完成:', result)

      return {
        success: true,
        videoUrl: result.videoUrl,
        videoBlob: result.videoBlob,
        fileSize: result.fileSize,
        duration: result.duration,
        metadata: result.metadata,
        canDownload: true
      }
    } catch (error) {
      console.error('❌ 视频合成失败:', error)
      throw error
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
