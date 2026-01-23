/**
 * SafariCompatibility - Safari兼容性检测和降级方案
 * 为Safari浏览器提供兼容性检测和功能降级
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class SafariCompatibilityChecker {
  constructor() {
    this.isSafari = this.detectSafari()
    this.safariVersion = this.getSafariVersion()
    this.compatibilityResults = {}
    this.fallbackStrategies = {}
  }

  /**
   * 检测是否为Safari浏览器
   */
  detectSafari() {
    const userAgent = navigator.userAgent
    const vendor = navigator.vendor

    // Safari的特征检测
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(userAgent) && /Apple Computer/.test(vendor)

    // 排除Chrome和其他基于Chromium的浏览器
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(vendor)
    const isEdge = /Edg/.test(userAgent)
    const isOpera = /OPR/.test(userAgent)

    return isSafari && !isChrome && !isEdge && !isOpera
  }

  /**
   * 获取Safari版本
   */
  getSafariVersion() {
    if (!this.isSafari) return null

    const userAgent = navigator.userAgent
    const versionMatch = userAgent.match(/Version\/(\d+)/)

    if (versionMatch) {
      return parseInt(versionMatch[1], 10)
    }

    // 尝试其他方式检测版本
    const webkitMatch = userAgent.match(/AppleWebKit\/(\d+)/)
    if (webkitMatch) {
      const webkitVersion = parseInt(webkitMatch[1], 10)
      // 基于WebKit版本估算Safari版本
      if (webkitVersion >= 612) return 12
      if (webkitVersion >= 605) return 11
      if (webkitVersion >= 602) return 10
      return 9
    }

    return null
  }

  /**
   * 检测WebAssembly支持
   */
  async checkWebAssemblySupport() {
    try {
      // 基本WebAssembly支持检测
      if (typeof WebAssembly !== 'object' || typeof WebAssembly.instantiate !== 'function') {
        return {
          supported: false,
          reason: 'WebAssembly API not available'
        }
      }

      // 测试WebAssembly实例化
      const wasmModule = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,
        0x03, 0x02, 0x01, 0x00, 0x07, 0x08, 0x01, 0x04, 0x6d, 0x61, 0x69, 0x6e, 0x00, 0x00, 0x0a,
        0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b
      ])

      const result = await WebAssembly.instantiate(wasmModule)
      const value = result.instance.exports.main()

      return {
        supported: value === 42,
        version: this.safariVersion,
        performance: this.safariVersion >= 11 ? 'good' : 'limited'
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message,
        version: this.safariVersion
      }
    }
  }

  /**
   * 检测WebCodecs API支持
   */
  checkWebCodecsSupport() {
    try {
      const hasVideoEncoder = typeof VideoEncoder === 'function'
      const hasVideoDecoder = typeof VideoDecoder === 'function'
      const hasAudioEncoder = typeof AudioEncoder === 'function'
      const hasAudioDecoder = typeof AudioDecoder === 'function'

      return {
        supported: hasVideoEncoder && hasVideoDecoder,
        videoEncoder: hasVideoEncoder,
        videoDecoder: hasVideoDecoder,
        audioEncoder: hasAudioEncoder,
        audioDecoder: hasAudioDecoder,
        version: this.safariVersion,
        note: 'Safari does not support WebCodecs API'
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message,
        version: this.safariVersion
      }
    }
  }

  /**
   * 检测WebGL支持
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (!gl) {
        return {
          supported: false,
          reason: 'WebGL context not available'
        }
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown'

      return {
        supported: true,
        renderer: renderer,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        safariOptimized: renderer.includes('Apple')
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      }
    }
  }

  /**
   * 检测SharedArrayBuffer支持
   */
  checkSharedArrayBufferSupport() {
    try {
      // 检查SharedArrayBuffer是否可用
      const hasSharedArrayBuffer = typeof SharedArrayBuffer === 'function'

      // 检查跨域隔离状态
      const isCrossOriginIsolated = window.crossOriginIsolated === true

      return {
        supported: hasSharedArrayBuffer && isCrossOriginIsolated,
        hasSharedArrayBuffer: hasSharedArrayBuffer,
        isCrossOriginIsolated: isCrossOriginIsolated,
        note: !isCrossOriginIsolated
          ? 'Requires Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers'
          : null
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      }
    }
  }

  /**
   * 检测MediaRecorder支持
   */
  checkMediaRecorderSupport() {
    try {
      const hasMediaRecorder = typeof MediaRecorder === 'function'

      if (!hasMediaRecorder) {
        return {
          supported: false,
          reason: 'MediaRecorder not available'
        }
      }

      // 检查支持的格式
      const supportedFormats = []
      const testMimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm'
      ]

      testMimeTypes.forEach(mimeType => {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedFormats.push(mimeType)
        }
      })

      return {
        supported: supportedFormats.length > 0,
        supportedFormats: supportedFormats,
        preferredFormat: supportedFormats[0] || null,
        version: this.safariVersion
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      }
    }
  }

  /**
   * 检测Web Audio API支持
   */
  checkWebAudioSupport() {
    try {
      const hasWebAudio =
        typeof AudioContext === 'function' || typeof webkitAudioContext === 'function'

      if (!hasWebAudio) {
        return {
          supported: false,
          reason: 'Web Audio API not available'
        }
      }

      // 测试音频上下文创建
      const AudioCtx = AudioContext || webkitAudioContext
      const audioContext = new AudioCtx()

      return {
        supported: true,
        audioContext: true,
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
        version: this.safariVersion
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      }
    }
  }

  /**
   * 检测IndexedDB支持
   */
  checkIndexedDBSupport() {
    try {
      const hasIndexedDB = typeof indexedDB !== 'undefined'

      return {
        supported: hasIndexedDB,
        version: this.safariVersion,
        note: hasIndexedDB ? null : 'IndexedDB not available'
      }
    } catch (error) {
      return {
        supported: false,
        reason: error.message
      }
    }
  }

  /**
   * 运行全面兼容性检测
   */
  async runCompatibilityCheck() {
    console.log('Safari兼容性检测开始...')

    this.compatibilityResults = {
      browser: {
        isSafari: this.isSafari,
        safariVersion: this.safariVersion,
        userAgent: navigator.userAgent
      },
      webassembly: await this.checkWebAssemblySupport(),
      webcodecs: this.checkWebCodecsSupport(),
      webgl: this.checkWebGLSupport(),
      sharedArrayBuffer: this.checkSharedArrayBufferSupport(),
      mediaRecorder: this.checkMediaRecorderSupport(),
      webAudio: this.checkWebAudioSupport(),
      indexedDB: this.checkIndexedDBSupport()
    }

    this.generateFallbackStrategies()

    console.log('Safari兼容性检测完成')
    return this.compatibilityResults
  }

  /**
   * 生成降级策略
   */
  generateFallbackStrategies() {
    this.fallbackStrategies = {
      videoExport: this.getVideoExportFallback(),
      audioProcessing: this.getAudioProcessingFallback(),
      imageProcessing: this.getImageProcessingFallback(),
      storage: this.getStorageFallback(),
      performance: this.getPerformanceFallback()
    }
  }

  /**
   * 获取视频导出降级策略
   */
  getVideoExportFallback() {
    const webcodecs = this.compatibilityResults.webcodecs
    const mediaRecorder = this.compatibilityResults.mediaRecorder

    if (!webcodecs.supported && mediaRecorder.supported) {
      return {
        primary: 'MediaRecorder',
        format: mediaRecorder.preferredFormat,
        quality: 'medium',
        note: '使用MediaRecorder替代WebCodecs，质量可能下降'
      }
    } else if (!webcodecs.supported && !mediaRecorder.supported) {
      return {
        primary: 'Canvas',
        method: 'frame-by-frame',
        quality: 'low',
        note: '使用Canvas手动编码，性能较差'
      }
    }

    return {
      primary: 'WebCodecs',
      note: '原生支持，无需降级'
    }
  }

  /**
   * 获取音频处理降级策略
   */
  getAudioProcessingFallback() {
    const webAudio = this.compatibilityResults.webAudio

    if (!webAudio.supported) {
      return {
        primary: 'HTMLAudioElement',
        features: ['basic-playback'],
        limitations: ['no-real-time-processing', 'no-advanced-effects'],
        note: '降级到基础音频播放，无法进行实时音频处理'
      }
    }

    return {
      primary: 'WebAudioAPI',
      note: '原生支持，无需降级'
    }
  }

  /**
   * 获取图像处理降级策略
   */
  getImageProcessingFallback() {
    const webgl = this.compatibilityResults.webgl
    const webassembly = this.compatibilityResults.webassembly

    if (!webgl.supported && webassembly.supported) {
      return {
        primary: 'Canvas2D + WebAssembly',
        performance: 'medium',
        note: '使用Canvas 2D API + WebAssembly加速处理'
      }
    } else if (!webgl.supported && !webassembly.supported) {
      return {
        primary: 'Canvas2D',
        performance: 'low',
        note: '仅使用Canvas 2D API，性能有限'
      }
    }

    return {
      primary: 'WebGL',
      note: '原生支持，无需降级'
    }
  }

  /**
   * 获取存储降级策略
   */
  getStorageFallback() {
    const indexedDB = this.compatibilityResults.indexedDB

    if (!indexedDB.supported) {
      return {
        primary: 'localStorage',
        capacity: '5-10MB',
        features: ['basic-key-value'],
        limitations: ['small-capacity', 'string-only'],
        note: '降级到localStorage，容量和功能受限'
      }
    }

    return {
      primary: 'IndexedDB',
      note: '原生支持，无需降级'
    }
  }

  /**
   * 获取性能优化策略
   */
  getPerformanceFallback() {
    const safariVersion = this.safariVersion

    if (safariVersion <= 12) {
      return {
        animationFrame: true,
        webWorkers: safariVersion >= 10,
        serviceWorkers: safariVersion >= 11.1,
        recommendations: [
          '减少动画复杂度',
          '使用transform代替position',
          '避免大面积重绘',
          '使用passive事件监听器'
        ]
      }
    }

    return {
      animationFrame: true,
      webWorkers: true,
      serviceWorkers: true,
      recommendations: ['Safari ' + safariVersion + ' 性能良好', '可以使用现代Web API']
    }
  }

  /**
   * 获取兼容性摘要
   */
  getCompatibilitySummary() {
    const results = this.compatibilityResults

    if (Object.keys(results).length === 0) {
      return { error: '请先运行兼容性检测' }
    }

    const criticalFeatures = ['webassembly', 'webcodecs', 'webgl', 'mediaRecorder']
    const supportedFeatures = criticalFeatures.filter(
      feature => results[feature] && results[feature].supported
    )

    return {
      browser: results.browser,
      overallScore: (supportedFeatures.length / criticalFeatures.length) * 100,
      supportedFeatures: supportedFeatures,
      unsupportedFeatures: criticalFeatures.filter(
        feature => !results[feature] || !results[feature].supported
      ),
      fallbackStrategies: this.fallbackStrategies,
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * 生成用户建议
   */
  generateRecommendations() {
    const recommendations = []
    const results = this.compatibilityResults

    if (!results.webassembly.supported) {
      recommendations.push('⚠️ WebAssembly不支持：某些AI功能可能无法使用')
    }

    if (!results.webcodecs.supported) {
      recommendations.push('⚠️ WebCodecs不支持：视频导出将使用兼容模式，质量可能下降')
    }

    if (!results.webgl.supported) {
      recommendations.push('⚠️ WebGL不支持：图像处理性能可能下降')
    }

    if (results.safariVersion && results.safariVersion < 13) {
      recommendations.push('📈 建议升级到Safari 13+以获得最佳体验')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Safari兼容性良好，可以正常使用所有功能')
    }

    return recommendations
  }

  /**
   * 应用降级策略
   */
  applyFallbackStrategies() {
    const strategies = this.fallbackStrategies

    // 设置全局降级标志
    window.safariFallbacks = {
      videoExport: strategies.videoExport,
      audioProcessing: strategies.audioProcessing,
      imageProcessing: strategies.imageProcessing,
      storage: strategies.storage,
      performance: strategies.performance
    }

    console.log('Safari降级策略已应用:', window.safariFallbacks)
  }
}

/**
 * 全局Safari兼容性检查器实例
 */
let safariCheckerInstance = null

/**
 * 获取Safari兼容性检查器
 */
export function getSafariCompatibilityChecker() {
  if (!safariCheckerInstance) {
    safariCheckerInstance = new SafariCompatibilityChecker()
  }
  return safariCheckerInstance
}

/**
 * 运行Safari兼容性检测
 */
export async function checkSafariCompatibility() {
  const checker = getSafariCompatibilityChecker()
  const results = await checker.runCompatibilityCheck()
  checker.applyFallbackStrategies()
  return results
}

/**
 * 获取Safari兼容性摘要
 */
export function getSafariCompatibilitySummary() {
  const checker = getSafariCompatibilityChecker()
  return checker.getCompatibilitySummary()
}

/**
 * 获取降级策略
 */
export function getSafariFallbackStrategies() {
  const checker = getSafariCompatibilityChecker()
  return checker.fallbackStrategies
}

// 自动检测Safari并运行兼容性检查
if (typeof window !== 'undefined') {
  const checker = getSafariCompatibilityChecker()
  if (checker.isSafari) {
    console.log(`Safari ${checker.safariVersion} 检测到，开始兼容性检查...`)
    checkSafariCompatibility()
      .then(results => {
        console.log('Safari兼容性检查完成:', results)
      })
      .catch(error => {
        console.error('Safari兼容性检查失败:', error)
      })
  }
}
