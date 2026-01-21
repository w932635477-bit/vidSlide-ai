/**
 * MasterPipeline - 主流程控制器
 *
 * 功能：
 * 1. 整合5大模块
 * 2. 流程控制和错误处理
 * 3. 进度跟踪
 * 4. 缓存管理
 */

import HybridContentAnalyzer from './HybridContentAnalyzer.js'
import SimpleNarrativeDetector from './SimpleNarrativeDetector.js'
import VisualAssetGenerator from './VisualAssetGenerator.js'
import PracticalTimelineGenerator from './PracticalTimelineGenerator.js'
import EnhancedVideoRenderer from './EnhancedVideoRenderer.js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

class MasterPipeline {
  constructor() {
    // 初始化所有模块
    this.contentAnalyzer = new HybridContentAnalyzer()
    this.narrativeDetector = new SimpleNarrativeDetector()
    this.assetGenerator = new VisualAssetGenerator()
    this.timelineGenerator = new PracticalTimelineGenerator()
    this.videoRenderer = new EnhancedVideoRenderer()

    // 默认配置
    this.config = {
      outputDir: path.join(process.cwd(), 'output'),
      enableCache: true,
      maxRetries: 3,
      timeout: 300000 // 5分钟
    }

    // 缓存
    this.cache = new Map()
    this.cacheStats = {
      hits: 0,
      misses: 0
    }

    // 进度跟踪
    this.progress = {
      phase: 0,
      percentage: 0,
      message: ''
    }

    // 事件监听器
    this.listeners = new Map()
  }

  /**
   * 执行完整流程
   */
  async run(videoPath, audioPath, outputPath) {
    console.log('开始执行完整流程...')

    try {
      // 验证输入
      const validation = this.validateInput(videoPath, audioPath, outputPath)
      if (!validation.valid) {
        throw new Error(`输入验证失败: ${validation.errors.join(', ')}`)
      }

      const startTime = Date.now()

      // 阶段1: 内容分析
      this.updateProgress(1, 0, '内容分析中...')
      const analysisResult = await this.executePhase1(videoPath, audioPath)
      this.updateProgress(1, 100, '内容分析完成')

      // 阶段2: 叙事检测
      this.updateProgress(2, 0, '叙事检测中...')
      const pattern = this.executePhase2(analysisResult)
      this.updateProgress(2, 100, '叙事检测完成')

      // 阶段3: 素材生成
      this.updateProgress(3, 0, '素材生成中...')
      const preprocessed = { duration: analysisResult.duration || 10 }
      const assets = await this.executePhase3(
        analysisResult,
        pattern,
        preprocessed,
        this.config.outputDir
      )
      this.updateProgress(3, 100, '素材生成完成')

      // 阶段4: 时间轴生成
      this.updateProgress(4, 0, '时间轴生成中...')
      const timeline = this.executePhase4(analysisResult, pattern, assets)
      this.updateProgress(4, 100, '时间轴生成完成')

      // 阶段5: 视频渲染
      this.updateProgress(5, 0, '视频渲染中...')
      const result = await this.executePhase5(timeline, outputPath)
      this.updateProgress(5, 100, '视频渲染完成')

      const endTime = Date.now()

      console.log('✅ 完整流程执行成功')

      return {
        success: true,
        outputPath: result,
        duration: (endTime - startTime) / 1000,
        phases: {
          analysis: analysisResult,
          pattern: pattern,
          assets: assets,
          timeline: timeline
        },
        timing: {
          total: endTime - startTime,
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0,
          phase5: 0
        }
      }
    } catch (error) {
      console.error('流程执行失败:', error.message)
      throw error
    }
  }

  /**
   * 阶段1: 内容分析
   */
  async executePhase1(videoPath, audioPath) {
    console.log('执行阶段1: 内容分析')

    // 检查缓存
    const cacheKey = this.generateCacheKey('phase1', videoPath, audioPath)
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      this.cacheStats.hits++
      console.log('使用缓存结果')
      return this.cache.get(cacheKey)
    }

    this.cacheStats.misses++

    // 执行分析
    const result = await this.contentAnalyzer.analyze(videoPath, audioPath)

    // 缓存结果
    if (this.config.enableCache) {
      this.cache.set(cacheKey, result)
    }

    return result
  }

  /**
   * 阶段2: 叙事检测
   */
  executePhase2(analysisResult) {
    console.log('执行阶段2: 叙事检测')
    return this.narrativeDetector.detect(analysisResult)
  }

  /**
   * 阶段3: 素材生成
   */
  async executePhase3(analysisResult, pattern, preprocessed, outputDir) {
    console.log('执行阶段3: 素材生成')
    return await this.assetGenerator.generateAll(analysisResult, pattern, preprocessed, outputDir)
  }

  /**
   * 阶段4: 时间轴生成
   */
  executePhase4(analysisResult, pattern, assets) {
    console.log('执行阶段4: 时间轴生成')
    return this.timelineGenerator.generate(analysisResult, pattern, assets)
  }

  /**
   * 阶段5: 视频渲染
   */
  async executePhase5(timeline, outputPath) {
    console.log('执行阶段5: 视频渲染')
    return await this.videoRenderer.render(timeline, outputPath)
  }

  /**
   * 验证输入
   */
  validateInput(videoPath, audioPath, outputPath) {
    const errors = []

    if (!videoPath) {
      errors.push('视频路径不能为空')
    }

    if (!audioPath) {
      errors.push('音频路径不能为空')
    }

    if (!outputPath) {
      errors.push('输出路径不能为空')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config) {
    const errors = []

    if (config.outputDir && config.outputDir.trim() === '') {
      errors.push('输出目录不能为空')
    }

    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      errors.push('重试次数不能为负数')
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      errors.push('超时时间必须大于0')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取配置
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * 设置配置
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
    this.cacheStats.hits = 0
    this.cacheStats.misses = 0
  }

  /**
   * 获取缓存大小
   */
  getCacheSize() {
    return this.cache.size
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses
    }
  }

  /**
   * 初始化进度
   */
  initProgress() {
    this.progress = {
      phase: 0,
      percentage: 0,
      message: ''
    }
  }

  /**
   * 更新进度
   */
  updateProgress(phase, percentage, message) {
    this.progress = {
      phase,
      percentage,
      message
    }

    // 触发进度事件
    this.emit('progress', this.progress)
  }

  /**
   * 获取进度
   */
  getProgress() {
    return { ...this.progress }
  }

  /**
   * 事件监听
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(...args) {
    const str = args.join('|')
    return crypto.createHash('md5').update(str).digest('hex')
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * 格式化时长
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

export default MasterPipeline
