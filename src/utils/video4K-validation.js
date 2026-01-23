/**
 * VidSlide AI - 4K视频导出技术验证
 * 验证WebCodecs API对4K分辨率的支持情况
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

export class Video4KValidator {
  constructor() {
    this.results = {
      webCodecs4K: {
        supported: false,
        codecs: [],
        maxResolution: null,
        performance: null
      },
      mediaRecorder4K: {
        supported: false,
        formats: [],
        quality: null
      },
      hardwareAcceleration: {
        available: false,
        gpuInfo: null
      },
      memoryUsage: {
        peakUsage: 0,
        recommended: '1GB'
      }
    }

    this.testCanvas = null
    this.testStream = null
  }

  /**
   * 执行完整的4K导出技术验证
   * @returns {Promise<Object>} 验证结果
   */
  async validate4KSupport() {
    console.log('🎬 开始4K视频导出技术验证...')

    try {
      // 1. 验证WebCodecs API 4K支持
      await this.validateWebCodecs4K()

      // 2. 验证MediaRecorder 4K支持
      await this.validateMediaRecorder4K()

      // 3. 验证硬件加速能力
      await this.validateHardwareAcceleration()

      // 4. 验证内存使用情况
      await this.validateMemoryUsage()

      // 5. 生成综合评估报告
      this.generateReport()

      return this.results
    } catch (error) {
      console.error('4K验证失败:', error)
      this.results.error = error.message
      return this.results
    }
  }

  /**
   * 验证WebCodecs API对4K的支持
   */
  async validateWebCodecs4K() {
    console.log('📹 验证WebCodecs API 4K支持...')

    if (!('VideoEncoder' in window) || !('VideoDecoder' in window)) {
      console.warn('WebCodecs API不可用')
      return
    }

    const codecs = [
      'avc1.42001E', // H.264 High Profile
      'avc1.640028', // H.264 Main Profile
      'vp09.00.10.08', // VP9
      'hev1.1.6.L93.B0', // H.265/HEVC (如果支持)
      'hvc1.1.6.L93.B0' // H.265/HEVC (如果支持)
    ]

    const resolutions = [
      { width: 1920, height: 1080, name: '1080p' },
      { width: 2560, height: 1440, name: '1440p' },
      { width: 3840, height: 2160, name: '4K' }
    ]

    const supportedConfigs = []

    for (const codec of codecs) {
      for (const resolution of resolutions) {
        try {
          const config = {
            codec,
            width: resolution.width,
            height: resolution.height,
            bitrate: this.calculateBitrate(resolution.width, resolution.height),
            framerate: 30
          }

          const support = await VideoEncoder.isConfigSupported(config)

          if (support.supported) {
            supportedConfigs.push({
              codec,
              resolution: resolution.name,
              config
            })

            if (resolution.name === '4K') {
              this.results.webCodecs4K.supported = true
            }
          }
        } catch (error) {
          console.warn(`编解码器 ${codec} ${resolution.name} 测试失败:`, error)
        }
      }
    }

    this.results.webCodecs4K.codecs = supportedConfigs
    this.results.webCodecs4K.maxResolution = this.getMaxResolution(supportedConfigs)

    console.log('WebCodecs 4K验证完成:', this.results.webCodecs4K)
  }

  /**
   * 验证MediaRecorder对4K的支持
   */
  async validateMediaRecorder4K() {
    console.log('🎥 验证MediaRecorder 4K支持...')

    if (!('MediaRecorder' in window)) {
      console.warn('MediaRecorder不可用')
      return
    }

    try {
      // 创建4K测试画布
      const canvas = document.createElement('canvas')
      canvas.width = 3840
      canvas.height = 2160

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法创建4K画布上下文')
      }

      // 填充测试内容
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, 3840, 2160)
      ctx.fillStyle = 'white'
      ctx.font = '200px Arial'
      ctx.fillText('4K Test', 100, 300)

      // 获取媒体流
      const stream = canvas.captureStream(30)
      if (!stream) {
        throw new Error('无法从4K画布获取媒体流')
      }

      // 测试不同的MIME类型
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/mp4;codecs=h264',
        'video/webm'
      ]

      const supportedFormats = []

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedFormats.push(mimeType)

          try {
            const recorder = new MediaRecorder(stream, {
              mimeType,
              videoBitsPerSecond: 20000000 // 20Mbps for 4K
            })

            // 简单的录制测试
            const chunks = []
            recorder.ondataavailable = event => {
              if (event.data && event.data.size > 0) {
                chunks.push(event.data)
              }
            }

            recorder.onstop = () => {
              if (chunks.length > 0) {
                console.log(`${mimeType} 4K录制成功, 数据大小: ${chunks[0].size} bytes`)
              }
            }

            // 开始录制
            recorder.start()

            // 等待一小段时间
            await new Promise(resolve => setTimeout(resolve, 100))

            // 停止录制
            recorder.stop()

            // 等待停止事件
            await new Promise(resolve => {
              recorder.onstop = () => resolve()
            })

            this.results.mediaRecorder4K.supported = true
          } catch (error) {
            console.warn(`${mimeType} 4K录制失败:`, error)
          }
        }
      }

      this.results.mediaRecorder4K.formats = supportedFormats

      // 清理资源
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('MediaRecorder 4K验证失败:', error)
    }

    console.log('MediaRecorder 4K验证完成:', this.results.mediaRecorder4K)
  }

  /**
   * 验证硬件加速能力
   */
  async validateHardwareAcceleration() {
    console.log('🚀 验证硬件加速能力...')

    try {
      // 检查WebGL支持
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)

          this.results.hardwareAcceleration.available = true
          this.results.hardwareAcceleration.gpuInfo = {
            renderer,
            vendor
          }

          console.log('GPU信息:', { renderer, vendor })
        }
      }

      // 检查硬件并发性
      if ('hardwareConcurrency' in navigator) {
        console.log('硬件并发性:', navigator.hardwareConcurrency)
      }

      // 检查设备内存
      if ('deviceMemory' in navigator) {
        console.log('设备内存:', navigator.deviceMemory, 'GB')
      }
    } catch (error) {
      console.warn('硬件加速验证失败:', error)
    }

    console.log('硬件加速验证完成:', this.results.hardwareAcceleration)
  }

  /**
   * 验证内存使用情况
   */
  async validateMemoryUsage() {
    console.log('💾 验证内存使用情况...')

    if (!('memory' in performance)) {
      console.warn('Performance.memory API不可用')
      return
    }

    try {
      // 创建4K画布进行内存压力测试
      const canvas = document.createElement('canvas')
      canvas.width = 3840
      canvas.height = 2160

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法创建4K画布')
      }

      // 执行一些4K渲染操作
      ctx.fillStyle = 'blue'
      ctx.fillRect(0, 0, 3840, 2160)

      // 绘制大量图形来模拟复杂场景
      for (let i = 0; i < 1000; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * 3840, Math.random() * 2160, 10, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
        ctx.fill()
      }

      // 记录内存使用峰值
      const memoryInfo = performance.memory
      this.results.memoryUsage.peakUsage = memoryInfo.usedJSHeapSize

      console.log('内存使用统计:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      })
    } catch (error) {
      console.warn('内存验证失败:', error)
    }

    console.log('内存验证完成:', this.results.memoryUsage)
  }

  /**
   * 计算推荐比特率
   */
  calculateBitrate(width, height) {
    // 基于分辨率估算比特率
    // 4K通常需要10-20 Mbps
    const pixels = width * height
    const bitrate = Math.max(pixels * 0.1, 10000000) // 至少10Mbps
    return Math.min(bitrate, 50000000) // 最多50Mbps
  }

  /**
   * 获取支持的最大分辨率
   */
  getMaxResolution(supportedConfigs) {
    const resolutionOrder = ['4K', '1440p', '1080p']

    for (const res of resolutionOrder) {
      if (supportedConfigs.some(config => config.resolution === res)) {
        return res
      }
    }

    return null
  }

  /**
   * 生成综合评估报告
   */
  generateReport() {
    console.log('📊 生成4K导出综合评估报告...')

    const report = {
      overallSupport: this.evaluateOverallSupport(),
      recommendedApproach: this.getRecommendedApproach(),
      performanceEstimates: this.getPerformanceEstimates(),
      limitations: this.getLimitations(),
      nextSteps: this.getNextSteps()
    }

    this.results.report = report

    console.log('4K导出评估报告:', report)
  }

  /**
   * 评估整体支持情况
   */
  evaluateOverallSupport() {
    let score = 0
    const maxScore = 4

    if (this.results.webCodecs4K.supported) score += 1
    if (this.results.mediaRecorder4K.supported) score += 1
    if (this.results.hardwareAcceleration.available) score += 1
    if (this.results.memoryUsage.peakUsage < 1000000000) score += 1 // 1GB以内

    const percentage = Math.round((score / maxScore) * 100)

    return {
      score,
      maxScore,
      percentage,
      level:
        percentage >= 75
          ? 'excellent'
          : percentage >= 50
            ? 'good'
            : percentage >= 25
              ? 'fair'
              : 'poor'
    }
  }

  /**
   * 获取推荐方案
   */
  getRecommendedApproach() {
    if (this.results.webCodecs4K.supported) {
      return {
        primary: 'WebCodecs API',
        secondary: 'MediaRecorder (备选)',
        reasoning: 'WebCodecs提供最佳的4K编码质量和性能'
      }
    } else if (this.results.mediaRecorder4K.supported) {
      return {
        primary: 'MediaRecorder',
        secondary: '降级到1080p',
        reasoning: 'MediaRecorder提供基本的4K支持，虽然质量可能较低'
      }
    } else {
      return {
        primary: '不支持4K',
        secondary: '保持1080p',
        reasoning: '当前环境不支持4K导出，建议保持现有1080p功能'
      }
    }
  }

  /**
   * 获取性能估算
   */
  getPerformanceEstimates() {
    return {
      encodingSpeed: this.results.webCodecs4K.supported ? '实时或接近实时' : '较慢，可能需要降级',
      fileSize: '4K视频文件大小约为1080p的4-8倍',
      memoryUsage:
        this.results.memoryUsage.peakUsage > 0
          ? Math.round(this.results.memoryUsage.peakUsage / 1024 / 1024) + 'MB'
          : '未知',
      hardwareRequirements: this.results.hardwareAcceleration.available
        ? '支持硬件加速'
        : '依赖软件编码'
    }
  }

  /**
   * 获取限制条件
   */
  getLimitations() {
    const limitations = []

    if (!this.results.webCodecs4K.supported) {
      limitations.push('WebCodecs API不支持4K编码')
    }

    if (!this.results.mediaRecorder4K.supported) {
      limitations.push('MediaRecorder不支持4K录制')
    }

    if (!this.results.hardwareAcceleration.available) {
      limitations.push('缺少硬件加速支持，可能影响性能')
    }

    if (this.results.memoryUsage.peakUsage > 1000000000) {
      limitations.push('内存使用过高，可能导致页面崩溃')
    }

    return limitations.length > 0 ? limitations : ['无明显限制']
  }

  /**
   * 获取下一步建议
   */
  getNextSteps() {
    if (this.evaluateOverallSupport().percentage >= 50) {
      return [
        '开始实现4K导出功能',
        '添加分辨率选择UI',
        '实现性能监控和降级策略',
        '进行用户验收测试'
      ]
    } else {
      return [
        '继续优化现有1080p功能',
        '关注浏览器兼容性更新',
        '考虑服务端4K处理方案',
        '收集用户对4K功能的需求反馈'
      ]
    }
  }
}

/**
 * 执行4K导出验证的便捷函数
 */
export async function validateVideo4KSupport() {
  const validator = new Video4KValidator()
  return await validator.validate4KSupport()
}

/**
 * 检查4K导出的快速检测
 */
export function quick4KCheck() {
  const results = {
    webCodecs: 'VideoEncoder' in window && 'VideoDecoder' in window,
    mediaRecorder: 'MediaRecorder' in window,
    canvas4K: false,
    memory: 'deviceMemory' in navigator ? navigator.deviceMemory >= 4 : true
  }

  // 测试4K画布创建
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 3840
    canvas.height = 2160
    const ctx = canvas.getContext('2d')
    results.canvas4K = !!ctx
  } catch (error) {
    results.canvas4K = false
  }

  return results
}
