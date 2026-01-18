/**
 * VidSlide AI - 视频处理服务
 * 整合视频上传、关键帧提取、场景检测、语音识别等功能
 *
 * 功能：
 * 1. 视频文件处理和元数据提取
 * 2. 关键帧自动提取
 * 3. 场景切换检测
 * 4. 语音识别和文本提取
 * 5. 内容分析和智能分段
 */

import { BaiduSpeechService } from './BaiduSpeechService.js'
import { getBaiduNLPService } from './BaiduNLPService.js'

/**
 * 视频处理服务类
 */
export class VideoProcessingService {
  constructor() {
    this.videoFile = null
    this.videoElement = null
    this.videoMetadata = null
    this.keyframes = []
    this.scenes = []
    this.transcript = ''
    this.keywords = []
    this.segments = []
    this.isProcessing = false
    this.processingProgress = 0
    this.currentStep = ''

    // 服务实例
    this.baiduSpeechService = new BaiduSpeechService()
    this.nlpService = getBaiduNLPService()
  }

  /**
   * 加载视频文件
   * @param {File} file - 视频文件
   * @returns {Promise<Object>} 视频元数据
   */
  async loadVideo(file) {
    this.videoFile = file
    this.currentStep = '加载视频文件'
    this.processingProgress = 5

    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true

      video.onloadedmetadata = () => {
        this.videoElement = video
        this.videoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }

        this.processingProgress = 10
        resolve(this.videoMetadata)
      }

      video.onerror = error => {
        reject(new Error('视频加载失败: ' + error.message))
      }

      video.src = URL.createObjectURL(file)
    })
  }

  /**
   * 提取关键帧
   * @param {Object} options - 提取选项
   * @returns {Promise<Array>} 关键帧列表
   */
  async extractKeyframes(options = {}) {
    if (!this.videoElement) {
      throw new Error('请先加载视频文件')
    }

    this.currentStep = '提取关键帧'
    this.processingProgress = 15

    const {
      interval = 2, // 每2秒提取一帧
      maxFrames = 50, // 最多提取50帧
      minInterval = 1, // 最小间隔1秒
      quality = 0.8 // 图片质量
    } = options

    const video = this.videoElement
    const duration = video.duration
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const keyframes = []
    const totalFrames = Math.min(Math.floor(duration / interval), maxFrames)
    let frameCount = 0

    for (let time = 0; time < duration; time += interval) {
      if (frameCount >= maxFrames) break

      try {
        // 跳转到指定时间
        await this.seekToTime(video, time)

        // 绘制当前帧到canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // 转换为图片
        const thumbnailUrl = canvas.toDataURL('image/jpeg', quality)

        // 计算帧的重要性（基于图像差异）
        const importance = await this.calculateFrameImportance(ctx, canvas)

        keyframes.push({
          id: `keyframe-${frameCount}`,
          timestamp: time,
          thumbnailUrl,
          importance,
          width: canvas.width,
          height: canvas.height,
          isProcessing: false
        })

        frameCount++
        this.processingProgress = 15 + (frameCount / totalFrames) * 25
      } catch (error) {
        console.error(`提取关键帧失败 (时间: ${time}s):`, error)
      }
    }

    this.keyframes = keyframes
    this.processingProgress = 40
    return keyframes
  }

  /**
   * 跳转到指定时间
   * @param {HTMLVideoElement} video - 视频元素
   * @param {number} time - 时间（秒）
   * @returns {Promise<void>}
   */
  seekToTime(video, time) {
    return new Promise((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
        resolve()
      }

      const onError = error => {
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
        reject(error)
      }

      video.addEventListener('seeked', onSeeked)
      video.addEventListener('error', onError)
      video.currentTime = time
    })
  }

  /**
   * 计算帧的重要性
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @returns {Promise<number>} 重要性分数 (0-1)
   */
  async calculateFrameImportance(ctx, canvas) {
    // 简单的重要性计算：基于图像的亮度和对比度
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let totalBrightness = 0
    let totalContrast = 0
    const sampleSize = Math.min(10000, data.length / 4) // 采样以提高性能

    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(Math.random() * (data.length / 4)) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]

      // 计算亮度
      const brightness = (r + g + b) / 3
      totalBrightness += brightness

      // 计算对比度（简化版）
      const contrast = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
      totalContrast += contrast
    }

    const avgBrightness = totalBrightness / sampleSize
    const avgContrast = totalContrast / sampleSize

    // 归一化分数
    const brightnessScore = Math.min(avgBrightness / 255, 1)
    const contrastScore = Math.min(avgContrast / 255, 1)

    // 综合评分
    return brightnessScore * 0.3 + contrastScore * 0.7
  }

  /**
   * 检测场景切换
   * @param {Array} keyframes - 关键帧列表
   * @returns {Promise<Array>} 场景列表
   */
  async detectScenes(keyframes = this.keyframes) {
    if (!keyframes || keyframes.length === 0) {
      throw new Error('没有可用的关键帧')
    }

    this.currentStep = '检测场景切换'
    this.processingProgress = 45

    const scenes = []
    let currentScene = {
      id: 'scene-0',
      startTime: 0,
      endTime: 0,
      keyframes: [],
      title: '场景 1'
    }

    for (let i = 0; i < keyframes.length; i++) {
      const frame = keyframes[i]

      // 检测场景切换（基于帧的重要性变化）
      if (i > 0) {
        const prevFrame = keyframes[i - 1]
        const importanceDiff = Math.abs(frame.importance - prevFrame.importance)

        // 如果重要性变化超过阈值，认为是场景切换
        if (importanceDiff > 0.3) {
          // 保存当前场景
          currentScene.endTime = prevFrame.timestamp
          scenes.push(currentScene)

          // 开始新场景
          currentScene = {
            id: `scene-${scenes.length}`,
            startTime: frame.timestamp,
            endTime: frame.timestamp,
            keyframes: [],
            title: `场景 ${scenes.length + 1}`
          }
        }
      }

      currentScene.keyframes.push(frame)
      currentScene.endTime = frame.timestamp

      this.processingProgress = 45 + ((i + 1) / keyframes.length) * 10
    }

    // 添加最后一个场景
    if (currentScene.keyframes.length > 0) {
      scenes.push(currentScene)
    }

    this.scenes = scenes
    this.processingProgress = 55
    return scenes
  }

  /**
   * 语音识别（使用百度语音识别API）
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeSpeech(onProgress) {
    this.currentStep = '语音识别'
    this.processingProgress = 60

    try {
      if (!this.videoFile) {
        throw new Error('未找到视频文件')
      }

      // 使用百度语音识别服务处理视频
      const result = await this.baiduSpeechService.transcribeVideo(this.videoFile, progress => {
        // 将百度服务的进度（0-100）映射到总进度的60-80区间
        const mappedProgress = 60 + progress.progress * 0.2
        this.processingProgress = mappedProgress

        if (onProgress) {
          onProgress({
            text: progress.text || '',
            progress: mappedProgress
          })
        }
      })

      this.transcript = result.text || ''
      this.processingProgress = 80

      // 如果有文本内容，提取关键词
      if (this.transcript) {
        try {
          const keywords = await this.nlpService.extractKeywords(this.transcript)
          this.keywords = keywords || []
        } catch (error) {
          console.warn('关键词提取失败:', error)
          this.keywords = []
        }
      }

      return {
        text: this.transcript,
        keywords: this.keywords
      }
    } catch (error) {
      console.error('语音识别失败:', error)
      throw new Error(`语音识别失败: ${error.message}`)
    }
  }

  /**
   * 分析视频内容
   * @param {string} text - 文本内容
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeContent(text = this.transcript) {
    if (!text || text.length < 10) {
      throw new Error('文本内容太短，无法分析')
    }

    this.currentStep = '分析内容'
    this.processingProgress = 85

    try {
      // 提取关键词
      const keywords = await this.nlpService.extractKeywords(text, 20)
      this.keywords = keywords

      // 提取主题
      const topics = await this.extractTopics(text, keywords)

      this.processingProgress = 90
      return {
        keywords,
        topics,
        wordCount: text.length,
        summary: this.generateSummary(text, keywords)
      }
    } catch (error) {
      console.error('内容分析失败:', error)
      // 使用本地算法作为备用
      const keywords = this.speechService.localExtractKeywords(text)
      this.keywords = keywords

      return {
        keywords,
        topics: [],
        wordCount: text.length,
        summary: text.substring(0, 200) + '...'
      }
    }
  }

  /**
   * 提取主题
   * @param {string} text - 文本内容
   * @param {Array} keywords - 关键词列表
   * @returns {Promise<Array>} 主题列表
   */
  async extractTopics(text, keywords) {
    // 简单的主题提取：基于关键词聚类
    const topics = []
    const topKeywords = keywords.slice(0, 10)

    // 将关键词分组为主题
    const groups = []
    for (const keyword of topKeywords) {
      let added = false
      for (const group of groups) {
        // 如果关键词与组内的词相似，加入该组
        if (this.areSimilar(keyword.text, group[0].text)) {
          group.push(keyword)
          added = true
          break
        }
      }
      if (!added) {
        groups.push([keyword])
      }
    }

    // 为每个组生成主题
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      topics.push({
        id: `topic-${i}`,
        title: group[0].text,
        keywords: group.map(k => k.text),
        importance: group.reduce((sum, k) => sum + k.importance, 0) / group.length
      })
    }

    return topics
  }

  /**
   * 判断两个词是否相似
   * @param {string} word1 - 词1
   * @param {string} word2 - 词2
   * @returns {boolean} 是否相似
   */
  areSimilar(word1, word2) {
    // 简单的相似度判断：是否有共同字符
    const chars1 = new Set(word1.split(''))
    const chars2 = new Set(word2.split(''))

    let commonChars = 0
    for (const char of chars1) {
      if (chars2.has(char)) {
        commonChars++
      }
    }

    return commonChars >= Math.min(word1.length, word2.length) * 0.5
  }

  /**
   * 生成摘要
   * @param {string} text - 文本内容
   * @param {Array} keywords - 关键词列表
   * @returns {string} 摘要
   */
  generateSummary(text, keywords) {
    // 简单的摘要生成：提取包含关键词的句子
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0)
    const topKeywords = keywords.slice(0, 5).map(k => k.text)

    const importantSentences = sentences.filter(sentence => {
      return topKeywords.some(keyword => sentence.includes(keyword))
    })

    return importantSentences.slice(0, 3).join('。') + '。'
  }

  /**
   * 智能分段
   * @param {Object} options - 分段选项
   * @returns {Promise<Array>} 分段列表
   */
  async segmentVideo(options = {}) {
    const {
      minSegmentDuration = 10, // 最小分段时长（秒）
      maxSegmentDuration = 60, // 最大分段时长（秒）
      useScenes = true, // 是否基于场景分段
      useKeywords = true // 是否基于关键词分段
    } = options

    this.currentStep = '智能分段'
    this.processingProgress = 95

    const segments = []

    if (useScenes && this.scenes.length > 0) {
      // 基于场景分段
      for (const scene of this.scenes) {
        const duration = scene.endTime - scene.startTime

        if (duration < minSegmentDuration) {
          // 场景太短，合并到上一个分段
          if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1]
            lastSegment.endTime = scene.endTime
            lastSegment.scenes.push(scene)
            lastSegment.keyframes.push(...scene.keyframes)
          } else {
            segments.push({
              id: `segment-${segments.length}`,
              startTime: scene.startTime,
              endTime: scene.endTime,
              title: scene.title,
              scenes: [scene],
              keyframes: scene.keyframes,
              keywords: []
            })
          }
        } else if (duration > maxSegmentDuration) {
          // 场景太长，拆分为多个分段
          const numSegments = Math.ceil(duration / maxSegmentDuration)
          const segmentDuration = duration / numSegments

          for (let i = 0; i < numSegments; i++) {
            const startTime = scene.startTime + i * segmentDuration
            const endTime = Math.min(scene.startTime + (i + 1) * segmentDuration, scene.endTime)

            segments.push({
              id: `segment-${segments.length}`,
              startTime,
              endTime,
              title: `${scene.title} - 第${i + 1}部分`,
              scenes: [scene],
              keyframes: scene.keyframes.filter(
                kf => kf.timestamp >= startTime && kf.timestamp <= endTime
              ),
              keywords: []
            })
          }
        } else {
          // 场景长度合适
          segments.push({
            id: `segment-${segments.length}`,
            startTime: scene.startTime,
            endTime: scene.endTime,
            title: scene.title,
            scenes: [scene],
            keyframes: scene.keyframes,
            keywords: []
          })
        }
      }
    } else {
      // 基于时间均匀分段
      const duration = this.videoMetadata.duration
      const numSegments = Math.ceil(duration / maxSegmentDuration)
      const segmentDuration = duration / numSegments

      for (let i = 0; i < numSegments; i++) {
        const startTime = i * segmentDuration
        const endTime = Math.min((i + 1) * segmentDuration, duration)

        segments.push({
          id: `segment-${i}`,
          startTime,
          endTime,
          title: `第${i + 1}部分`,
          scenes: [],
          keyframes: this.keyframes.filter(
            kf => kf.timestamp >= startTime && kf.timestamp <= endTime
          ),
          keywords: []
        })
      }
    }

    // 为每个分段分配关键词
    if (useKeywords && this.keywords.length > 0) {
      const keywordsPerSegment = Math.ceil(this.keywords.length / segments.length)

      for (let i = 0; i < segments.length; i++) {
        segments[i].keywords = this.keywords.slice(
          i * keywordsPerSegment,
          (i + 1) * keywordsPerSegment
        )
      }
    }

    this.segments = segments
    this.processingProgress = 100
    return segments
  }

  /**
   * 完整的视频处理流程
   * @param {File} file - 视频文件
   * @param {Object} options - 处理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 处理结果
   */
  async processVideo(file, options = {}, onProgress) {
    this.isProcessing = true
    this.processingProgress = 0

    try {
      // 1. 加载视频
      const metadata = await this.loadVideo(file)
      if (onProgress) onProgress({ step: 'load', progress: 10, data: metadata })

      // 2. 提取关键帧
      const keyframes = await this.extractKeyframes(options.keyframe)
      if (onProgress) onProgress({ step: 'keyframes', progress: 40, data: keyframes })

      // 3. 检测场景
      const scenes = await this.detectScenes(keyframes)
      if (onProgress) onProgress({ step: 'scenes', progress: 55, data: scenes })

      // 4. 智能分段
      const segments = await this.segmentVideo(options.segment)
      if (onProgress) onProgress({ step: 'segments', progress: 100, data: segments })

      this.isProcessing = false

      return {
        metadata,
        keyframes,
        scenes,
        segments,
        transcript: this.transcript,
        keywords: this.keywords
      }
    } catch (error) {
      this.isProcessing = false
      throw error
    }
  }

  /**
   * 获取处理进度
   * @returns {Object} 进度信息
   */
  getProgress() {
    return {
      isProcessing: this.isProcessing,
      progress: this.processingProgress,
      currentStep: this.currentStep
    }
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.videoFile = null
    this.videoElement = null
    this.videoMetadata = null
    this.keyframes = []
    this.scenes = []
    this.transcript = ''
    this.keywords = []
    this.segments = []
    this.isProcessing = false
    this.processingProgress = 0
    this.currentStep = ''
  }

  /**
   * 销毁服务
   */
  destroy() {
    this.reset()
    if (this.videoElement && this.videoElement.src) {
      URL.revokeObjectURL(this.videoElement.src)
    }
    this.speechService.destroy()
  }
}

// 单例实例
let videoProcessingServiceInstance = null

export function getVideoProcessingService() {
  if (!videoProcessingServiceInstance) {
    videoProcessingServiceInstance = new VideoProcessingService()
  }
  return videoProcessingServiceInstance
}

export default VideoProcessingService
