/**
 * UnifiedFaceTracker - 统一人脸跟踪服务
 *
 * 支持多种人脸检测方案，自动选择最佳方案并降级：
 * 1. MediaPipe Face Mesh (首选 - 468关键点，高精度)
 * 2. Face-api.js (备选 - 68关键点，广泛兼容)
 * 3. 基础模式 (降级 - 无人脸跟踪，使用固定位置)
 *
 * 浏览器兼容性：
 * - Chrome 80+: MediaPipe (最佳) / Face-api.js
 * - Firefox 75+: Face-api.js (推荐) / MediaPipe
 * - Safari 14+: Face-api.js
 * - Edge 80+: MediaPipe / Face-api.js
 */

import * as faceapi from 'face-api.js'

// 跟踪引擎类型
export const TrackerEngine = {
  MEDIAPIPE: 'mediapipe',
  FACEAPI: 'faceapi',
  BASIC: 'basic'
}

class UnifiedFaceTracker {
  constructor() {
    this.currentEngine = null
    this.isInitialized = false
    this.isTracking = false

    // MediaPipe实例
    this.faceMesh = null

    // Face-api.js状态
    this.faceApiLoaded = false

    // 跟踪状态
    this.trackingState = {
      faceDetected: false,
      faceCount: 0,
      faceBounds: null,
      landmarks: [],
      smoothedPosition: { x: 0.5, y: 0.5 },
      confidence: 0,
      engine: null
    }

    // 配置
    this.options = {
      preferredEngine: null, // 自动选择
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      smoothFactor: 0.8,
      // Face-api.js模型路径
      faceApiModelPath: '/models'
    }

    // 性能监控
    this.performance = {
      fps: 0,
      frameCount: 0,
      lastFrameTime: 0,
      averageProcessingTime: 0
    }

    // 事件监听器
    this.eventListeners = {
      faceDetected: [],
      faceLost: [],
      trackingUpdate: [],
      engineChanged: [],
      error: []
    }

    // 动画帧ID
    this.animationFrame = null

    console.log('🎯 统一人脸跟踪服务已创建')
  }

  /**
   * 初始化 - 自动检测并选择最佳引擎
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.warn('人脸跟踪服务已初始化')
      return { success: true, engine: this.currentEngine }
    }

    this.options = { ...this.options, ...options }

    console.log('🔧 初始化统一人脸跟踪服务...')

    // 检测浏览器兼容性
    const compatibility = this.checkBrowserCompatibility()
    console.log('📋 浏览器兼容性:', compatibility)

    // 按优先级尝试初始化引擎
    const enginePriority = this.getEnginePriority(compatibility)
    console.log('📋 引擎优先级:', enginePriority)

    for (const engine of enginePriority) {
      try {
        const success = await this.initializeEngine(engine)
        if (success) {
          this.currentEngine = engine
          this.isInitialized = true
          this.trackingState.engine = engine

          console.log(`✅ 人脸跟踪服务初始化完成，使用引擎: ${engine}`)
          this.emit('engineChanged', { engine, reason: 'initialization' })

          return { success: true, engine }
        }
      } catch (error) {
        console.warn(`⚠️ ${engine} 引擎初始化失败:`, error.message)
      }
    }

    // 所有引擎都失败，使用基础模式
    this.currentEngine = TrackerEngine.BASIC
    this.isInitialized = true
    this.trackingState.engine = TrackerEngine.BASIC

    console.log('⚠️ 所有人脸检测引擎不可用，使用基础模式（固定位置）')
    this.emit('engineChanged', { engine: TrackerEngine.BASIC, reason: 'fallback' })

    return { success: true, engine: TrackerEngine.BASIC, fallback: true }
  }

  /**
   * 检测浏览器兼容性
   */
  checkBrowserCompatibility() {
    const ua = navigator.userAgent
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua)
    const isFirefox = /Firefox/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
    const isEdge = /Edg/.test(ua)

    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    })()

    const hasWebAssembly = typeof WebAssembly === 'object'
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    return {
      browser: {
        chrome: isChrome,
        firefox: isFirefox,
        safari: isSafari,
        edge: isEdge,
        name: isChrome
          ? 'Chrome'
          : isFirefox
            ? 'Firefox'
            : isSafari
              ? 'Safari'
              : isEdge
                ? 'Edge'
                : 'Unknown'
      },
      features: {
        webgl: hasWebGL,
        webassembly: hasWebAssembly,
        getUserMedia: hasGetUserMedia
      },
      // MediaPipe在Chrome/Edge上表现最好
      mediapipeSupport: hasWebGL && hasWebAssembly && (isChrome || isEdge),
      // Face-api.js在所有现代浏览器上都能工作
      faceapiSupport: hasWebGL
    }
  }

  /**
   * 获取引擎优先级
   */
  getEnginePriority(compatibility) {
    // 如果用户指定了首选引擎
    if (this.options.preferredEngine) {
      return [this.options.preferredEngine, TrackerEngine.FACEAPI, TrackerEngine.MEDIAPIPE].filter(
        (v, i, a) => a.indexOf(v) === i
      )
    }

    const { browser, mediapipeSupport, faceapiSupport } = compatibility

    // Chrome/Edge: MediaPipe优先
    if (browser.chrome || browser.edge) {
      if (mediapipeSupport) {
        return [TrackerEngine.MEDIAPIPE, TrackerEngine.FACEAPI]
      }
      return [TrackerEngine.FACEAPI]
    }

    // Firefox: Face-api.js优先（MediaPipe在Firefox上性能较差）
    if (browser.firefox) {
      if (faceapiSupport) {
        return [TrackerEngine.FACEAPI, TrackerEngine.MEDIAPIPE]
      }
      return [TrackerEngine.MEDIAPIPE]
    }

    // Safari: 只用Face-api.js（MediaPipe不支持Safari）
    if (browser.safari) {
      return [TrackerEngine.FACEAPI]
    }

    // 默认：Face-api.js优先（兼容性更好）
    return [TrackerEngine.FACEAPI, TrackerEngine.MEDIAPIPE]
  }

  /**
   * 初始化指定引擎
   */
  async initializeEngine(engine) {
    switch (engine) {
      case TrackerEngine.MEDIAPIPE:
        return await this.initializeMediaPipe()
      case TrackerEngine.FACEAPI:
        return await this.initializeFaceApi()
      default:
        return false
    }
  }

  /**
   * 初始化MediaPipe Face Mesh
   */
  async initializeMediaPipe() {
    console.log('🔧 初始化MediaPipe Face Mesh...')

    // 动态加载MediaPipe脚本
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')

    // 等待FaceMesh可用
    await this.waitForGlobal('FaceMesh', 5000)

    // 创建实例
    this.faceMesh = new window.FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
    })

    this.faceMesh.setOptions({
      maxNumFaces: this.options.maxNumFaces,
      refineLandmarks: true,
      minDetectionConfidence: this.options.minDetectionConfidence,
      minTrackingConfidence: this.options.minTrackingConfidence
    })

    this.faceMesh.onResults(results => this.handleMediaPipeResults(results))

    console.log('✅ MediaPipe Face Mesh初始化完成')
    return true
  }

  /**
   * 初始化Face-api.js
   */
  async initializeFaceApi() {
    console.log('🔧 初始化Face-api.js...')

    // 加载模型
    const modelPath = this.options.faceApiModelPath

    try {
      // 尝试从CDN加载模型
      const cdnPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(cdnPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(cdnPath)
      ])

      this.faceApiLoaded = true
      console.log('✅ Face-api.js模型加载完成 (CDN)')
      return true
    } catch (cdnError) {
      console.warn('⚠️ CDN加载失败，尝试本地模型...')

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath)
        ])

        this.faceApiLoaded = true
        console.log('✅ Face-api.js模型加载完成 (本地)')
        return true
      } catch (localError) {
        console.error('❌ Face-api.js模型加载失败:', localError)
        throw localError
      }
    }
  }

  /**
   * 开始跟踪
   */
  async startTracking(videoElement) {
    if (!this.isInitialized) {
      throw new Error('人脸跟踪服务未初始化')
    }

    if (this.isTracking) {
      console.warn('跟踪已在进行中')
      return
    }

    console.log(`🎬 开始人脸跟踪 (引擎: ${this.currentEngine})`)

    this.isTracking = true
    this.performance.frameCount = 0
    this.performance.lastFrameTime = 0

    // 根据引擎启动跟踪循环
    switch (this.currentEngine) {
      case TrackerEngine.MEDIAPIPE:
        this.startMediaPipeTracking(videoElement)
        break
      case TrackerEngine.FACEAPI:
        this.startFaceApiTracking(videoElement)
        break
      case TrackerEngine.BASIC:
        this.startBasicMode()
        break
    }
  }

  /**
   * MediaPipe跟踪循环
   */
  startMediaPipeTracking(videoElement) {
    const loop = async () => {
      if (!this.isTracking) return

      try {
        await this.faceMesh.send({ image: videoElement })
      } catch (error) {
        console.error('MediaPipe跟踪错误:', error)
        this.handleEngineError(error)
      }

      this.animationFrame = requestAnimationFrame(loop)
    }

    this.animationFrame = requestAnimationFrame(loop)
  }

  /**
   * Face-api.js跟踪循环
   */
  startFaceApiTracking(videoElement) {
    const loop = async () => {
      if (!this.isTracking) return

      const startTime = performance.now()

      try {
        const detections = await faceapi
          .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)

        this.handleFaceApiResults(detections, startTime)
      } catch (error) {
        console.error('Face-api.js跟踪错误:', error)
        this.handleEngineError(error)
      }

      this.animationFrame = requestAnimationFrame(loop)
    }

    this.animationFrame = requestAnimationFrame(loop)
  }

  /**
   * 基础模式 - 使用固定位置
   */
  startBasicMode() {
    // 基础模式下，使用固定的中心位置
    this.trackingState.faceDetected = false
    this.trackingState.smoothedPosition = { x: 0.5, y: 0.4 } // 稍微偏上的中心位置
    this.trackingState.confidence = 0

    this.emit('trackingUpdate', {
      ...this.trackingState,
      timestamp: performance.now()
    })
  }

  /**
   * 处理MediaPipe结果
   */
  handleMediaPipeResults(results) {
    const currentTime = performance.now()
    this.updatePerformance(currentTime)

    const landmarks = results.multiFaceLandmarks

    if (!landmarks || landmarks.length === 0) {
      this.handleNoFaceDetected()
      return
    }

    // 使用第一张人脸
    const faceLandmarks = landmarks[0]

    // 计算边界框
    const bounds = this.calculateBoundsFromLandmarks(faceLandmarks)

    // 更新状态
    this.updateTrackingState({
      faceDetected: true,
      faceCount: landmarks.length,
      faceBounds: bounds,
      landmarks: faceLandmarks,
      confidence: 0.9 // MediaPipe通常有较高置信度
    })
  }

  /**
   * 处理Face-api.js结果
   */
  handleFaceApiResults(detections, startTime) {
    const currentTime = performance.now()
    this.updatePerformance(currentTime)

    if (!detections || detections.length === 0) {
      this.handleNoFaceDetected()
      return
    }

    // 使用第一张人脸
    const detection = detections[0]
    const box = detection.detection.box

    // 转换为归一化坐标
    const videoWidth = detection.detection.imageWidth
    const videoHeight = detection.detection.imageHeight

    const bounds = {
      minX: box.x / videoWidth,
      minY: box.y / videoHeight,
      maxX: (box.x + box.width) / videoWidth,
      maxY: (box.y + box.height) / videoHeight,
      centerX: (box.x + box.width / 2) / videoWidth,
      centerY: (box.y + box.height / 2) / videoHeight
    }

    // 转换关键点
    const landmarks = detection.landmarks.positions.map(p => ({
      x: p.x / videoWidth,
      y: p.y / videoHeight
    }))

    this.updateTrackingState({
      faceDetected: true,
      faceCount: detections.length,
      faceBounds: bounds,
      landmarks: landmarks,
      confidence: detection.detection.score
    })
  }

  /**
   * 处理未检测到人脸
   */
  handleNoFaceDetected() {
    if (this.trackingState.faceDetected) {
      this.trackingState.faceDetected = false
      this.trackingState.faceCount = 0
      this.emit('faceLost')
    }

    this.emit('trackingUpdate', {
      ...this.trackingState,
      timestamp: performance.now()
    })
  }

  /**
   * 更新跟踪状态
   */
  updateTrackingState(newState) {
    const wasDetected = this.trackingState.faceDetected

    // 更新状态
    Object.assign(this.trackingState, newState)

    // 平滑位置
    if (newState.faceBounds) {
      const targetX = newState.faceBounds.centerX
      const targetY = newState.faceBounds.centerY

      this.trackingState.smoothedPosition.x =
        this.trackingState.smoothedPosition.x * this.options.smoothFactor +
        targetX * (1 - this.options.smoothFactor)

      this.trackingState.smoothedPosition.y =
        this.trackingState.smoothedPosition.y * this.options.smoothFactor +
        targetY * (1 - this.options.smoothFactor)
    }

    // 触发事件
    if (!wasDetected && newState.faceDetected) {
      this.emit('faceDetected', {
        faceCount: newState.faceCount,
        bounds: newState.faceBounds,
        confidence: newState.confidence
      })
    }

    this.emit('trackingUpdate', {
      ...this.trackingState,
      timestamp: performance.now()
    })
  }

  /**
   * 从关键点计算边界框
   */
  calculateBoundsFromLandmarks(landmarks) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    landmarks.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })

    return {
      minX,
      minY,
      maxX,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    }
  }

  /**
   * 更新性能统计
   */
  updatePerformance(currentTime) {
    this.performance.frameCount++

    if (this.performance.lastFrameTime > 0) {
      const frameTime = currentTime - this.performance.lastFrameTime
      this.performance.fps = 1000 / frameTime
      this.performance.averageProcessingTime =
        this.performance.averageProcessingTime * 0.9 + frameTime * 0.1
    }

    this.performance.lastFrameTime = currentTime
  }

  /**
   * 处理引擎错误 - 尝试降级
   */
  async handleEngineError(error) {
    console.error(`引擎错误 (${this.currentEngine}):`, error)

    this.emit('error', { engine: this.currentEngine, error })

    // 尝试降级到下一个引擎
    const compatibility = this.checkBrowserCompatibility()
    const priority = this.getEnginePriority(compatibility)
    const currentIndex = priority.indexOf(this.currentEngine)

    if (currentIndex < priority.length - 1) {
      const nextEngine = priority[currentIndex + 1]
      console.log(`⚠️ 尝试降级到 ${nextEngine}...`)

      this.stopTracking()

      try {
        const success = await this.initializeEngine(nextEngine)
        if (success) {
          this.currentEngine = nextEngine
          this.trackingState.engine = nextEngine
          this.emit('engineChanged', { engine: nextEngine, reason: 'error_fallback' })
          console.log(`✅ 已降级到 ${nextEngine}`)
        }
      } catch (fallbackError) {
        console.error('降级失败:', fallbackError)
        this.currentEngine = TrackerEngine.BASIC
        this.trackingState.engine = TrackerEngine.BASIC
        this.emit('engineChanged', { engine: TrackerEngine.BASIC, reason: 'all_failed' })
      }
    } else {
      // 已经是最后一个引擎，使用基础模式
      this.currentEngine = TrackerEngine.BASIC
      this.trackingState.engine = TrackerEngine.BASIC
      this.emit('engineChanged', { engine: TrackerEngine.BASIC, reason: 'all_failed' })
    }
  }

  /**
   * 停止跟踪
   */
  stopTracking() {
    if (!this.isTracking) return

    console.log('⏹️ 停止人脸跟踪')

    this.isTracking = false

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    this.trackingState.faceDetected = false
    this.trackingState.faceCount = 0
  }

  /**
   * 获取当前跟踪状态
   */
  getTrackingState() {
    return {
      ...this.trackingState,
      isTracking: this.isTracking,
      isInitialized: this.isInitialized,
      performance: { ...this.performance }
    }
  }

  /**
   * 获取人脸位置（用于画中画定位）
   */
  getFacePosition() {
    if (this.currentEngine === TrackerEngine.BASIC) {
      // 基础模式返回默认位置
      return {
        x: 0.5,
        y: 0.4,
        bounds: null,
        confidence: 0,
        isDefault: true
      }
    }

    if (!this.trackingState.faceDetected) {
      return null
    }

    return {
      x: this.trackingState.smoothedPosition.x,
      y: this.trackingState.smoothedPosition.y,
      bounds: this.trackingState.faceBounds,
      confidence: this.trackingState.confidence,
      isDefault: false
    }
  }

  /**
   * 获取当前引擎信息
   */
  getEngineInfo() {
    const engineNames = {
      [TrackerEngine.MEDIAPIPE]: 'MediaPipe Face Mesh (468关键点)',
      [TrackerEngine.FACEAPI]: 'Face-api.js (68关键点)',
      [TrackerEngine.BASIC]: '基础模式 (无人脸跟踪)'
    }

    return {
      engine: this.currentEngine,
      name: engineNames[this.currentEngine] || '未知',
      isTracking: this.isTracking,
      landmarkCount:
        this.currentEngine === TrackerEngine.MEDIAPIPE
          ? 468
          : this.currentEngine === TrackerEngine.FACEAPI
            ? 68
            : 0
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      engine: this.currentEngine,
      fps: Math.round(this.performance.fps),
      averageProcessingTime: Math.round(this.performance.averageProcessingTime),
      frameCount: this.performance.frameCount,
      isTracking: this.isTracking
    }
  }

  /**
   * 事件系统
   */
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback)
    }
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback)
      if (index > -1) {
        this.eventListeners[event].splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件回调错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 工具方法：加载脚本
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
      document.head.appendChild(script)
    })
  }

  /**
   * 工具方法：等待全局变量
   */
  waitForGlobal(name, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const check = () => {
        if (window[name]) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for ${name}`))
        } else {
          setTimeout(check, 100)
        }
      }

      check()
    })
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stopTracking()

    if (this.faceMesh) {
      this.faceMesh.close()
      this.faceMesh = null
    }

    this.faceApiLoaded = false
    this.isInitialized = false
    this.currentEngine = null

    this.eventListeners = {
      faceDetected: [],
      faceLost: [],
      trackingUpdate: [],
      engineChanged: [],
      error: []
    }

    console.log('🗑️ 统一人脸跟踪服务已清理')
  }
}

// 导出单例
export default new UnifiedFaceTracker()

// 导出类（用于测试或多实例场景）
export { UnifiedFaceTracker }
