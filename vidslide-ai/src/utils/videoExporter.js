/**
 * VidSlide AI - 视频导出器
 * 使用MediaRecorder API实现高质量视频导出，支持水印
 */

import { getWatermarkGenerator } from './WatermarkGenerator.js'

export class VideoExporter {
  constructor() {
    this.recorder = null
    this.chunks = []
    this.canvas = null
    this.isRecording = false
    this.animationFrame = null
    this.watermarkGenerator = getWatermarkGenerator()
  }

  /**
   * 检查浏览器支持
   */
  static isSupported() {
    return typeof MediaRecorder !== 'undefined'
  }

  /**
   * 获取支持的格式
   */
  static getSupportedFormats() {
    if (!this.isSupported()) return []

    const formats = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4'
    ]

    return formats.filter(format => MediaRecorder.isTypeSupported(format))
  }

  /**
   * 导出视频
   * @param {Object} options 导出选项
   * @param {HTMLCanvasElement} options.canvas 画布元素
   * @param {number} options.duration 导出时长(秒)
   * @param {number} options.frameRate 帧率
   * @param {string} options.format 导出格式
   * @param {boolean} options.applyWatermark 是否应用水印
   * @param {Function} options.onProgress 进度回调
   * @param {Function} options.onComplete 完成回调
   * @param {Function} options.onError 错误回调
   */
  async exportVideo(options = {}) {
    const {
      canvas,
      duration = 30,
      frameRate = 30,
      format = 'video/webm;codecs=vp9',
      resolution = '1080p', // 新增：分辨率选项 '720p', '1080p', '1440p', '4k'
      quality = 'high', // 新增：质量选项 'low', 'medium', 'high', 'ultra'
      applyWatermark = true,
      onProgress,
      onComplete,
      onError
    } = options

    if (!canvas) {
      const error = new Error('Canvas element is required')
      onError?.(error)
      throw error
    }

    // 解析分辨率设置
    const resolutionConfig = this.parseResolution(resolution)
    const qualityConfig = this.parseQuality(quality, resolutionConfig)

    // 更新format和编码参数
    format = qualityConfig.format || format
    frameRate = Math.min(frameRate, qualityConfig.maxFrameRate)

    if (!this.constructor.isSupported()) {
      const error = new Error('MediaRecorder is not supported in this browser')
      onError?.(error)
      throw error
    }

    // 检查格式支持
    const supportedFormats = this.constructor.getSupportedFormats()
    if (!supportedFormats.includes(format)) {
      // 使用第一个支持的格式作为备选
      format = supportedFormats[0] || 'video/webm'
      console.warn(`Format ${options.format} not supported, using ${format} instead`)
    }

    this.canvas = canvas
    this.chunks = []

    try {
      // 如果需要水印，创建带有水印的副本canvas
      let streamCanvas = canvas
      if (applyWatermark) {
        streamCanvas = document.createElement('canvas')
        streamCanvas.width = canvas.width
        streamCanvas.height = canvas.height

        const ctx = streamCanvas.getContext('2d')
        if (!ctx) {
          throw new Error('无法创建Canvas上下文，无法应用水印')
        }

        try {
          // 复制原始内容
          ctx.drawImage(canvas, 0, 0)
          // 应用水印
          this.watermarkGenerator.applyToCanvas(streamCanvas)
        } catch (watermarkError) {
          console.warn('水印应用失败，使用原始画布:', watermarkError)
          streamCanvas = canvas // 降级到不带水印的原始画布
        }
      }

      // 应用分辨率调整
      if (resolutionConfig.width !== canvas.width || resolutionConfig.height !== canvas.height) {
        const scaledCanvas = document.createElement('canvas')
        scaledCanvas.width = resolutionConfig.width
        scaledCanvas.height = resolutionConfig.height

        const scaledCtx = scaledCanvas.getContext('2d')
        if (!scaledCtx) {
          throw new Error('无法创建缩放Canvas上下文')
        }

        // 使用高质量缩放
        scaledCtx.imageSmoothingEnabled = true
        scaledCtx.imageSmoothingQuality = 'high'

        // 绘制缩放后的图像
        scaledCtx.drawImage(streamCanvas, 0, 0, resolutionConfig.width, resolutionConfig.height)

        streamCanvas = scaledCanvas
      }

      // 创建媒体流
      const stream = streamCanvas.captureStream(frameRate)
      if (!stream) {
        throw new Error('Failed to capture canvas stream')
      }

      // 配置MediaRecorder
      const recorderOptions = {
        mimeType: format,
        videoBitsPerSecond: qualityConfig.targetBitrate
      }

      this.recorder = new MediaRecorder(stream, recorderOptions)

      // 设置事件监听器
      this.recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          this.chunks.push(event.data)
        }
      }

      this.recorder.onstop = () => {
        this.handleRecordingComplete(onComplete, onError)
      }

      this.recorder.onerror = event => {
        const error = new Error(`MediaRecorder error: ${event.error?.message || 'Unknown error'}`)
        onError?.(error)
      }

      // 开始录制
      this.recorder.start(100) // 每100ms收集一次数据
      this.isRecording = true

      onProgress?.({ phase: 'recording', progress: 0, message: '开始录制...' })

      // 等待指定时长后停止
      await this.waitForDuration(duration, onProgress)

      // 停止录制
      this.recorder.stop()
      this.isRecording = false
    } catch (error) {
      this.isRecording = false
      onError?.(error)
      throw error
    }
  }

  /**
   * 等待录制时长
   */
  async waitForDuration(duration, onProgress) {
    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    return new Promise(resolve => {
      const checkProgress = () => {
        const currentTime = Date.now()
        const elapsed = (currentTime - startTime) / 1000
        const progress = Math.min(elapsed / duration, 1)

        onProgress?.({
          phase: 'recording',
          progress,
          message: `录制中... ${Math.round(elapsed)}s / ${duration}s`
        })

        if (currentTime >= endTime) {
          resolve()
        } else {
          // 使用requestAnimationFrame保持流畅的进度更新
          this.animationFrame = requestAnimationFrame(checkProgress)
        }
      }

      checkProgress()
    })
  }

  /**
   * 解析分辨率配置
   * @param {string} resolution 分辨率字符串
   * @returns {Object} 分辨率配置
   */
  parseResolution(resolution) {
    const configs = {
      '720p': { width: 1280, height: 720, name: 'HD' },
      '1080p': { width: 1920, height: 1080, name: 'Full HD' },
      '1440p': { width: 2560, height: 1440, name: 'Quad HD' },
      '4k': { width: 3840, height: 2160, name: '4K UHD' }
    }

    return configs[resolution] || configs['1080p']
  }

  /**
   * 解析质量配置
   * @param {string} quality 质量等级
   * @param {Object} resolutionConfig 分辨率配置
   * @returns {Object} 质量配置
   */
  parseQuality(quality, resolutionConfig) {
    const baseConfigs = {
      low: {
        bitrateMultiplier: 0.5,
        maxFrameRate: 24,
        format: 'video/webm;codecs=vp8'
      },
      medium: {
        bitrateMultiplier: 0.75,
        maxFrameRate: 30,
        format: 'video/webm;codecs=vp9'
      },
      high: {
        bitrateMultiplier: 1.0,
        maxFrameRate: 30,
        format: 'video/webm;codecs=vp9'
      },
      ultra: {
        bitrateMultiplier: 1.5,
        maxFrameRate: 60,
        format: 'video/mp4;codecs=h264'
      }
    }

    const config = baseConfigs[quality] || baseConfigs['high']

    // 根据分辨率调整比特率
    const pixels = resolutionConfig.width * resolutionConfig.height
    const baseBitrate = pixels * config.bitrateMultiplier // 每像素比特率

    return {
      ...config,
      targetBitrate: Math.min(baseBitrate, 50000000), // 最高50Mbps
      recommendedBitrate: Math.max(baseBitrate, 1000000) // 最低1Mbps
    }
  }

  /**
   * 处理录制完成
   */
  handleRecordingComplete(onComplete, onError) {
    try {
      if (this.chunks.length === 0) {
        throw new Error('No video data recorded')
      }

      // 合并数据块
      const blob = new Blob(this.chunks, { type: this.recorder.mimeType })

      // 验证blob大小
      if (blob.size === 0) {
        throw new Error('Generated video file is empty')
      }

      // 清理资源
      this.cleanup()

      const result = {
        blob,
        size: blob.size,
        type: this.recorder.mimeType,
        duration: this.chunks.length * 0.1 // 估算时长
      }

      onComplete?.(result)
    } catch (error) {
      this.cleanup()
      onError?.(error)
    }
  }

  /**
   * 根据格式和分辨率获取合适的比特率
   */
  getBitrateForFormat(format, width, height) {
    // 基于分辨率估算合适的比特率
    const pixels = width * height
    let baseBitrate = 2000000 // 2Mbps基础比特率

    if (pixels > 1920 * 1080) {
      // 4K
      baseBitrate = 8000000 // 8Mbps
    } else if (pixels > 1280 * 720) {
      // 1080p
      baseBitrate = 5000000 // 5Mbps
    } else if (pixels > 854 * 480) {
      // 720p
      baseBitrate = 3000000 // 3Mbps
    }

    // 根据格式调整
    if (format.includes('vp9')) {
      baseBitrate *= 0.8 // VP9通常更高效
    } else if (format.includes('h264')) {
      baseBitrate *= 1.2 // H.264可能需要更高比特率
    }

    return Math.round(baseBitrate)
  }

  /**
   * 取消导出
   */
  cancel() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop()
      this.isRecording = false
    }
    this.cleanup()
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    this.chunks = []
    this.recorder = null
    this.canvas = null
  }

  /**
   * 获取导出状态
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      chunksCount: this.chunks.length,
      supportedFormats: this.constructor.getSupportedFormats()
    }
  }
}

// 便捷的导出函数
export async function exportVideo(options) {
  const exporter = new VideoExporter()
  return new Promise((resolve, reject) => {
    exporter
      .exportVideo({
        ...options,
        onComplete: resolve,
        onError: reject
      })
      .catch(reject)
  })
}

// 默认导出
export default VideoExporter
