/**
 * VidSlide AI - 高级人脸跟踪器
 * 基于MediaPipe Face Mesh实现高精度人脸跟踪
 *
 * 功能特性：
 * - 468个面部关键点检测
 * - 实时跟踪和位置预测
 * - 多脸场景支持
 * - 性能优化和内存管理
 * - 降级策略支持
 */

export class AdvancedFaceTracker {
  constructor(options = {}) {
    this.faceMesh = null
    this.isInitialized = false
    this.isTracking = false
    this.lastResults = null
    this.animationFrame = null

    // 配置选项
    this.options = {
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      smoothFactor: 0.8, // 平滑因子
      ...options
    }

    // 跟踪状态
    this.trackingState = {
      faceDetected: false,
      faceCount: 0,
      dominantFace: null,
      faceBounds: null,
      landmarks: [],
      smoothedPosition: { x: 0, y: 0 },
      confidence: 0
    }

    // 性能监控
    this.performance = {
      fps: 0,
      frameCount: 0,
      lastFrameTime: 0,
      averageProcessingTime: 0,
      memoryUsage: 0
    }

    // 事件监听器
    this.eventListeners = {
      faceDetected: [],
      faceLost: [],
      trackingUpdate: [],
      performanceUpdate: []
    }

    console.log('🎯 高级人脸跟踪器已创建')
  }

  /**
   * 初始化MediaPipe Face Mesh
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('人脸跟踪器已经初始化')
      return true
    }

    try {
      console.log('🔧 初始化MediaPipe Face Mesh...')

      // 检查WebAssembly支持
      if (typeof WebAssembly !== 'object') {
        throw new Error('WebAssembly not supported')
      }

      // 检查WebGL支持
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        throw new Error('WebGL not supported')
      }

      // 动态加载MediaPipe脚本
      await this.loadMediaPipeScripts()

      // 创建Face Mesh实例
      this.faceMesh = new window.FaceMesh({
        locateFile: file => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
        }
      })

      // 配置选项
      this.faceMesh.setOptions({
        maxNumFaces: this.options.maxNumFaces,
        refineLandmarks: this.options.refineLandmarks,
        minDetectionConfidence: this.options.minDetectionConfidence,
        minTrackingConfidence: this.options.minTrackingConfidence
      })

      // 设置结果处理函数
      this.faceMesh.onResults(results => {
        this.handleResults(results)
      })

      this.isInitialized = true
      console.log('✅ MediaPipe Face Mesh初始化完成')

      return true
    } catch (error) {
      console.error('❌ MediaPipe Face Mesh初始化失败:', error)
      this.isInitialized = false
      throw error
    }
  }

  /**
   * 加载MediaPipe相关脚本
   */
  async loadMediaPipeScripts() {
    const scripts = ['https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js']

    const loadPromises = scripts.map(url => this.loadScript(url))
    await Promise.all(loadPromises)

    // 等待FaceMesh全局变量可用
    return new Promise(resolve => {
      const checkAvailable = () => {
        if (window.FaceMesh) {
          resolve()
        } else {
          setTimeout(checkAvailable, 100)
        }
      }
      checkAvailable()
    })
  }

  /**
   * 加载单个脚本
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
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * 处理检测结果
   */
  handleResults(results) {
    const currentTime = performance.now()
    this.performance.frameCount++

    try {
      // 更新性能统计
      if (this.performance.lastFrameTime > 0) {
        const frameTime = currentTime - this.performance.lastFrameTime
        this.performance.fps = 1000 / frameTime
        this.performance.averageProcessingTime =
          this.performance.averageProcessingTime * 0.9 + frameTime * 0.1
      }
      this.performance.lastFrameTime = currentTime

      // 处理人脸检测结果
      this.processFaceResults(results)

      // 触发跟踪更新事件
      this.emit('trackingUpdate', {
        ...this.trackingState,
        timestamp: currentTime
      })

      // 定期触发性能更新
      if (this.performance.frameCount % 30 === 0) {
        this.emit('performanceUpdate', { ...this.performance })
      }
    } catch (error) {
      console.error('处理人脸检测结果时出错:', error)
    }
  }

  /**
   * 处理人脸检测结果
   */
  processFaceResults(results) {
    const multiFaceLandmarks = results.multiFaceLandmarks
    const multiFaceGeometry = results.multiFaceGeometry

    if (!multiFaceLandmarks || multiFaceLandmarks.length === 0) {
      // 没有人脸检测到
      if (this.trackingState.faceDetected) {
        this.trackingState.faceDetected = false
        this.trackingState.faceCount = 0
        this.trackingState.dominantFace = null
        this.emit('faceLost')
      }
      return
    }

    // 更新检测状态
    const wasDetected = this.trackingState.faceDetected
    this.trackingState.faceDetected = true
    this.trackingState.faceCount = multiFaceLandmarks.length

    // 选择主要人脸（第一个或置信度最高的）
    const dominantFaceIndex = this.selectDominantFace(multiFaceLandmarks, multiFaceGeometry)
    this.trackingState.dominantFace = dominantFaceIndex

    // 获取主要人脸的关键点
    const landmarks = multiFaceLandmarks[dominantFaceIndex]
    this.trackingState.landmarks = landmarks

    // 计算人脸边界框
    this.trackingState.faceBounds = this.calculateFaceBounds(landmarks)

    // 计算平滑位置
    this.updateSmoothedPosition(landmarks)

    // 计算置信度
    this.trackingState.confidence = this.calculateConfidence(multiFaceGeometry?.[dominantFaceIndex])

    // 触发人脸检测事件
    if (!wasDetected) {
      this.emit('faceDetected', {
        faceCount: this.trackingState.faceCount,
        bounds: this.trackingState.faceBounds,
        confidence: this.trackingState.confidence
      })
    }
  }

  /**
   * 选择主要人脸
   */
  selectDominantFace(multiFaceLandmarks, multiFaceGeometry) {
    if (multiFaceLandmarks.length === 1) {
      return 0
    }

    // 如果有多张人脸，选择面积最大的一张
    let maxArea = 0
    let dominantIndex = 0

    multiFaceLandmarks.forEach((landmarks, index) => {
      const bounds = this.calculateFaceBounds(landmarks)
      const area = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)

      if (area > maxArea) {
        maxArea = area
        dominantIndex = index
      }
    })

    return dominantIndex
  }

  /**
   * 计算人脸边界框
   */
  calculateFaceBounds(landmarks) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    landmarks.forEach(landmark => {
      minX = Math.min(minX, landmark.x)
      minY = Math.min(minY, landmark.y)
      maxX = Math.max(maxX, landmark.x)
      maxY = Math.max(maxY, landmark.y)
    })

    return { minX, minY, maxX, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 }
  }

  /**
   * 更新平滑位置
   */
  updateSmoothedPosition(landmarks) {
    // 使用鼻子尖作为主要跟踪点（关键点5）
    const noseTip = landmarks[5] // MediaPipe Face Mesh关键点5是鼻子尖

    if (noseTip) {
      // 应用指数移动平均平滑
      this.trackingState.smoothedPosition.x =
        this.trackingState.smoothedPosition.x * this.options.smoothFactor +
        noseTip.x * (1 - this.options.smoothFactor)

      this.trackingState.smoothedPosition.y =
        this.trackingState.smoothedPosition.y * this.options.smoothFactor +
        noseTip.y * (1 - this.options.smoothFactor)
    }
  }

  /**
   * 计算置信度
   */
  calculateConfidence(faceGeometry) {
    if (!faceGeometry) return 0.5

    // 基于几何信息计算置信度
    // 这里可以根据实际需求调整计算方式
    return Math.min(faceGeometry.poseTransformMatrix?.[15] || 0.5, 1.0)
  }

  /**
   * 开始跟踪
   */
  async startTracking(videoElement) {
    if (!this.isInitialized) {
      throw new Error('人脸跟踪器未初始化，请先调用initialize()')
    }

    if (this.isTracking) {
      console.warn('跟踪已经在进行中')
      return
    }

    try {
      console.log('🎬 开始人脸跟踪...')

      this.isTracking = true
      this.performance.frameCount = 0
      this.performance.lastFrameTime = 0

      // 开始跟踪循环
      this.trackLoop(videoElement)

      console.log('✅ 人脸跟踪已启动')
    } catch (error) {
      console.error('启动人脸跟踪失败:', error)
      this.isTracking = false
      throw error
    }
  }

  /**
   * 跟踪循环
   */
  async trackLoop(videoElement) {
    if (!this.isTracking) return

    try {
      // 发送视频帧进行检测
      await this.faceMesh.send({ image: videoElement })

      // 继续下一帧
      this.animationFrame = requestAnimationFrame(() => {
        this.trackLoop(videoElement)
      })
    } catch (error) {
      console.error('跟踪循环出错:', error)
      this.stopTracking()
    }
  }

  /**
   * 停止跟踪
   */
  stopTracking() {
    if (!this.isTracking) return

    console.log('⏹️ 停止人脸跟踪...')

    this.isTracking = false

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    // 重置状态
    this.trackingState.faceDetected = false
    this.trackingState.faceCount = 0
    this.trackingState.dominantFace = null
    this.trackingState.landmarks = []
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
    if (!this.trackingState.faceDetected) {
      return null
    }

    return {
      x: this.trackingState.smoothedPosition.x,
      y: this.trackingState.smoothedPosition.y,
      bounds: this.trackingState.faceBounds,
      confidence: this.trackingState.confidence
    }
  }

  /**
   * 检查跟踪器是否可用
   */
  isAvailable() {
    return this.isInitialized && typeof WebAssembly === 'object'
  }

  /**
   * 事件系统
   */
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback)
    }
  }

  removeEventListener(event, callback) {
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
          console.error(`事件回调执行失败 (${event}):`, error)
        }
      })
    }
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

    this.isInitialized = false
    this.eventListeners = {
      faceDetected: [],
      faceLost: [],
      trackingUpdate: [],
      performanceUpdate: []
    }

    console.log('🗑️ 人脸跟踪器已清理')
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      fps: Math.round(this.performance.fps),
      averageProcessingTime: Math.round(this.performance.averageProcessingTime),
      frameCount: this.performance.frameCount,
      memoryUsage: this.performance.memoryUsage,
      isTracking: this.isTracking
    }
  }
}

// 导出工厂函数
export function createAdvancedFaceTracker(options = {}) {
  return new AdvancedFaceTracker(options)
}

// 兼容性检查
export function checkFaceTrackingSupport() {
  const support = {
    webAssembly: typeof WebAssembly === 'object',
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    })(),
    mediaPipe: typeof window !== 'undefined' && !!window.FaceMesh,
    performance: typeof performance !== 'undefined'
  }

  support.overall = support.webAssembly && support.webGL

  return support
}
