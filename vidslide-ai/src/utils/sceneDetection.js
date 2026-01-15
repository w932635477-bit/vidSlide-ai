/**
 * VidSlide AI - 场景检测算法库
 * 实现图像差异检测、运动检测和镜头切换识别
 */

export class SceneDetection {
  constructor(options = {}) {
    this.options = {
      // 图像差异检测参数
      diffThreshold: 0.15, // 差异阈值 (0-1)
      minSceneDuration: 2.0, // 最小场景持续时间(秒)
      maxSceneDuration: 30.0, // 最大场景持续时间(秒)

      // 运动检测参数
      motionThreshold: 0.05, // 运动阈值
      opticalFlowThreshold: 0.1, // 光流阈值
      blockSize: 16, // 运动检测块大小

      // 镜头切换检测参数
      cutThreshold: 0.3, // 剪辑点阈值
      fadeThreshold: 0.1, // 淡入淡出阈值
      transitionMinFrames: 3, // 过渡最小帧数

      ...options
    }

    this.canvas = null
    this.context = null
    this.previousFrame = null
    this.frameBuffer = []
    this.sceneChanges = []
  }

  /**
   * 初始化Canvas环境
   */
  initialize(width = 640, height = 360) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d', {
      willReadFrequently: true
    })
    return this
  }

  /**
   * 从视频元素提取帧
   */
  extractFrame(videoElement, timestamp = null) {
    if (!this.canvas || !this.context) {
      throw new Error('SceneDetection未初始化，请先调用initialize()')
    }

    if (timestamp !== null) {
      videoElement.currentTime = timestamp
    }

    this.context.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height)
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 图像差异检测算法
   * 基于像素差异的场景切换识别
   */
  detectImageDifference(currentFrame, previousFrame) {
    if (!previousFrame) return 0

    const currentData = currentFrame.data
    const previousData = previousFrame.data
    const length = currentData.length

    let diffSum = 0
    let pixelCount = 0

    // 每4个值(RGBA)比较一次
    for (let i = 0; i < length; i += 4) {
      // 计算RGB差异 (忽略Alpha通道)
      const rDiff = Math.abs(currentData[i] - previousData[i])
      const gDiff = Math.abs(currentData[i + 1] - previousData[i + 1])
      const bDiff = Math.abs(currentData[i + 2] - previousData[i + 2])

      // 加权平均差异
      const pixelDiff = (rDiff * 0.299 + gDiff * 0.587 + bDiff * 0.114) / 255
      diffSum += pixelDiff
      pixelCount++
    }

    // 返回平均差异
    return diffSum / pixelCount
  }

  /**
   * 运动检测算法
   * 基于帧间差异的运动分析
   */
  detectMotion(currentFrame, previousFrame) {
    if (!previousFrame) return 0

    const width = currentFrame.width
    const height = currentFrame.height
    const blockSize = this.options.blockSize

    let totalMotion = 0
    let blockCount = 0

    // 分块检测运动
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        const motion = this.calculateBlockMotion(currentFrame, previousFrame, x, y, blockSize)
        totalMotion += motion
        blockCount++
      }
    }

    return blockCount > 0 ? totalMotion / blockCount : 0
  }

  /**
   * 计算块运动
   */
  calculateBlockMotion(currentFrame, previousFrame, x, y, blockSize) {
    const currentData = currentFrame.data
    const previousData = previousFrame.data
    const width = currentFrame.width

    let motionSum = 0
    let pixelCount = 0

    for (let by = 0; by < blockSize; by++) {
      for (let bx = 0; bx < blockSize; bx++) {
        const pixelX = x + bx
        const pixelY = y + by
        const index = (pixelY * width + pixelX) * 4

        const rDiff = Math.abs(currentData[index] - previousData[index])
        const gDiff = Math.abs(currentData[index + 1] - previousData[index + 1])
        const bDiff = Math.abs(currentData[index + 2] - previousData[index + 2])

        const pixelMotion = (rDiff + gDiff + bDiff) / (3 * 255)
        motionSum += pixelMotion
        pixelCount++
      }
    }

    return pixelCount > 0 ? motionSum / pixelCount : 0
  }

  /**
   * 简化版光流检测
   * Lucas-Kanade算法简化实现
   */
  detectOpticalFlow(currentFrame, previousFrame) {
    if (!previousFrame) return 0

    const width = currentFrame.width
    const height = currentFrame.height
    const windowSize = 5 // 5x5窗口

    let totalFlow = 0
    let validPoints = 0

    // 在图像上采样点计算光流
    for (let y = windowSize; y < height - windowSize; y += 10) {
      for (let x = windowSize; x < width - windowSize; x += 10) {
        const flow = this.calculateOpticalFlowAtPoint(currentFrame, previousFrame, x, y, windowSize)

        if (flow.magnitude > 0) {
          totalFlow += flow.magnitude
          validPoints++
        }
      }
    }

    return validPoints > 0 ? totalFlow / validPoints : 0
  }

  /**
   * 计算特定点的光流
   */
  calculateOpticalFlowAtPoint(currentFrame, previousFrame, x, y, windowSize) {
    const halfWindow = Math.floor(windowSize / 2)
    const currentData = currentFrame.data
    const previousData = previousFrame.data
    const width = currentFrame.width
    const height = currentFrame.height

    let Ix = 0,
      Iy = 0,
      It = 0

    // 计算空间和时间导数
    for (let wy = -halfWindow; wy <= halfWindow; wy++) {
      for (let wx = -halfWindow; wx <= halfWindow; wx++) {
        const cx = x + wx
        const cy = y + wy
        const idx = (cy * width + cx) * 4

        // 空间导数 (使用相邻像素)
        if (cx + 1 < width) {
          Ix += (currentData[idx] - currentData[idx + 4]) / 2
        }
        if (cy + 1 < height) {
          Iy += (currentData[idx] - currentData[(cy + 1) * width * 4 + cx * 4]) / 2
        }

        // 时间导数
        It += currentData[idx] - previousData[idx]
      }
    }

    // 计算光流向量 (简化的Lucas-Kanade)
    const denominator = Ix * Ix + Iy * Iy
    if (denominator < 0.001) {
      return { magnitude: 0, vx: 0, vy: 0 }
    }

    const vx = -(Ix * It) / denominator
    const vy = -(Iy * It) / denominator
    const magnitude = Math.sqrt(vx * vx + vy * vy)

    return { magnitude, vx, vy }
  }

  /**
   * 镜头切换检测算法
   * 专业的剪辑点检测算法
   */
  detectCut(currentFrame, previousFrame, nextFrame = null) {
    if (!previousFrame) return { isCut: false, confidence: 0 }

    // 计算当前帧与前一帧的差异
    const diff1 = this.detectImageDifference(currentFrame, previousFrame)

    // 如果有下一帧，也计算与下一帧的差异
    let diff2 = 0
    if (nextFrame) {
      diff2 = this.detectImageDifference(currentFrame, nextFrame)
    }

    // 综合差异评分
    const combinedDiff = Math.max(diff1, diff2 * 0.5)

    // 检测是否为剪辑点
    const isCut = combinedDiff > this.options.cutThreshold

    return {
      isCut,
      confidence: Math.min(combinedDiff / this.options.cutThreshold, 1),
      diffScore: combinedDiff
    }
  }

  /**
   * 检测淡入淡出过渡
   */
  detectFade(currentFrame, previousFrame, nextFrame = null) {
    if (!previousFrame) return { isFade: false, type: 'none', confidence: 0 }

    // 计算亮度变化
    const currentBrightness = this.calculateFrameBrightness(currentFrame)
    const previousBrightness = this.calculateFrameBrightness(previousFrame)

    let nextBrightness = currentBrightness
    if (nextFrame) {
      nextBrightness = this.calculateFrameBrightness(nextFrame)
    }

    // 检测淡入/淡出模式
    const brightnessDiff1 = Math.abs(currentBrightness - previousBrightness)
    const brightnessDiff2 = Math.abs(nextBrightness - currentBrightness)

    // 简化的淡入淡出检测
    const isFadeIn =
      brightnessDiff1 > this.options.fadeThreshold && currentBrightness > previousBrightness
    const isFadeOut =
      brightnessDiff1 > this.options.fadeThreshold && currentBrightness < previousBrightness

    if (isFadeIn) {
      return { isFade: true, type: 'fade-in', confidence: brightnessDiff1 }
    } else if (isFadeOut) {
      return { isFade: true, type: 'fade-out', confidence: brightnessDiff1 }
    }

    return { isFade: false, type: 'none', confidence: 0 }
  }

  /**
   * 计算帧平均亮度
   */
  calculateFrameBrightness(frame) {
    const data = frame.data
    let totalBrightness = 0
    let pixelCount = 0

    for (let i = 0; i < data.length; i += 4) {
      // 计算RGB亮度
      const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
      totalBrightness += brightness
      pixelCount++
    }

    return pixelCount > 0 ? totalBrightness / pixelCount : 0
  }

  /**
   * 综合场景检测
   * 结合所有算法进行场景切换检测
   */
  detectSceneChange(currentFrame, previousFrame, nextFrame = null, timestamp = 0) {
    const results = {
      timestamp,
      isSceneChange: false,
      changeType: 'none',
      confidence: 0,
      metrics: {}
    }

    // 1. 图像差异检测
    const imageDiff = this.detectImageDifference(currentFrame, previousFrame)
    results.metrics.imageDiff = imageDiff

    // 2. 运动检测
    const motion = this.detectMotion(currentFrame, previousFrame)
    results.metrics.motion = motion

    // 3. 光流检测
    const opticalFlow = this.detectOpticalFlow(currentFrame, previousFrame)
    results.metrics.opticalFlow = opticalFlow

    // 4. 剪辑点检测
    const cutDetection = this.detectCut(currentFrame, previousFrame, nextFrame)
    results.metrics.cutDetection = cutDetection

    // 5. 淡入淡出检测
    const fadeDetection = this.detectFade(currentFrame, previousFrame, nextFrame)
    results.metrics.fadeDetection = fadeDetection

    // 综合判断是否为场景切换
    if (cutDetection.isCut && cutDetection.confidence > 0.7) {
      results.isSceneChange = true
      results.changeType = 'hard-cut'
      results.confidence = cutDetection.confidence
    } else if (fadeDetection.isFade && fadeDetection.confidence > 0.5) {
      results.isSceneChange = true
      results.changeType = fadeDetection.type
      results.confidence = fadeDetection.confidence
    } else if (imageDiff > this.options.diffThreshold) {
      results.isSceneChange = true
      results.changeType = 'content-change'
      results.confidence = imageDiff / this.options.diffThreshold
    } else if (motion > this.options.motionThreshold) {
      results.isSceneChange = true
      results.changeType = 'motion-change'
      results.confidence = motion / this.options.motionThreshold
    }

    return results
  }

  /**
   * 批量处理视频帧进行场景检测
   */
  async analyzeVideoFrames(videoElement, options = {}) {
    const {
      startTime = 0,
      endTime = videoElement.duration,
      frameRate = 1, // 每秒检测帧数
      onProgress = null,
      onSceneDetected = null
    } = options

    const sceneChanges = []
    const duration = endTime - startTime
    const totalFrames = Math.floor(duration * frameRate)
    let processedFrames = 0

    // 重置状态
    this.previousFrame = null
    this.frameBuffer = []

    for (let time = startTime; time < endTime; time += 1 / frameRate) {
      try {
        // 提取当前帧
        const currentFrame = this.extractFrame(videoElement, time)
        let nextFrame = null

        // 如果不是第一帧，尝试获取下一帧用于检测
        if (time + 1 / frameRate < endTime) {
          nextFrame = this.extractFrame(videoElement, time + 1 / frameRate)
        }

        // 检测场景切换
        const sceneResult = this.detectSceneChange(
          currentFrame,
          this.previousFrame,
          nextFrame,
          time
        )

        if (sceneResult.isSceneChange) {
          sceneChanges.push(sceneResult)

          if (onSceneDetected) {
            onSceneDetected(sceneResult)
          }
        }

        // 更新前一帧
        this.previousFrame = currentFrame

        // 进度回调
        processedFrames++
        if (onProgress) {
          const progress = (processedFrames / totalFrames) * 100
          onProgress(progress, processedFrames, totalFrames)
        }

        // 添加小延迟避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 10))
      } catch (error) {
        console.error('场景检测过程中出错:', error)
      }
    }

    return sceneChanges
  }

  /**
   * 清理资源
   */
  dispose() {
    this.canvas = null
    this.context = null
    this.previousFrame = null
    this.frameBuffer = []
    this.sceneChanges = []
  }
}

/**
 * 人脸识别功能验证
 */
export class FaceRecognitionValidator {
  constructor() {
    this.isAvailable = false
    this.capabilities = {
      webgl: false,
      webassembly: false,
      getUserMedia: false,
      canvas: false
    }
  }

  /**
   * 检查人脸识别功能是否完全可用
   */
  async validateFaceRecognition() {
    console.log('🔍 开始验证人脸识别功能...')

    // 检查基础Web API支持
    this.capabilities.canvas = !!document.createElement('canvas').getContext
    this.capabilities.webgl = this.checkWebGLSupport()
    this.capabilities.webassembly = typeof WebAssembly === 'object'
    this.capabilities.getUserMedia = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    )

    console.log('📋 Web API支持情况:', this.capabilities)

    // 检查MediaPipe Face Mesh可用性
    const faceMeshAvailable = await this.checkFaceMeshAvailability()
    console.log('📋 MediaPipe Face Mesh可用性:', faceMeshAvailable)

    // 检查AdvancedFaceTracker功能
    const trackerFunctional = await this.validateFaceTracker()
    console.log('📋 AdvancedFaceTracker功能验证:', trackerFunctional)

    // 综合判断
    this.isAvailable =
      this.capabilities.canvas &&
      this.capabilities.webgl &&
      this.capabilities.webassembly &&
      faceMeshAvailable &&
      trackerFunctional

    console.log('🎯 人脸识别功能总体可用性:', this.isAvailable)

    return {
      isAvailable: this.isAvailable,
      capabilities: this.capabilities,
      details: {
        faceMeshAvailable,
        trackerFunctional
      }
    }
  }

  /**
   * 检查WebGL支持
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  /**
   * 检查MediaPipe Face Mesh可用性
   */
  async checkFaceMeshAvailability() {
    try {
      // 尝试加载FaceMesh脚本
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'

      return new Promise(resolve => {
        script.onload = () => {
          // 检查FaceMesh是否可用
          setTimeout(() => {
            resolve(typeof window.FaceMesh !== 'undefined')
          }, 1000)
        }

        script.onerror = () => resolve(false)
        document.head.appendChild(script)

        // 超时处理
        setTimeout(() => resolve(false), 5000)
      })
    } catch (error) {
      console.error('检查FaceMesh可用性时出错:', error)
      return false
    }
  }

  /**
   * 验证AdvancedFaceTracker功能
   */
  async validateFaceTracker() {
    try {
      // 动态导入AdvancedFaceTracker
      const { AdvancedFaceTracker } = await import('./advancedFaceTracker.js')

      const tracker = new AdvancedFaceTracker()

      // 检查基本方法存在
      const hasRequiredMethods = [
        'initialize',
        'startTracking',
        'stopTracking',
        'processFaceResults',
        'dispose'
      ].every(method => typeof tracker[method] === 'function')

      // 检查事件系统
      const hasEventSystem = typeof tracker.emit === 'function' && typeof tracker.on === 'function'

      // 检查配置选项
      const hasValidOptions =
        tracker.options &&
        typeof tracker.options.maxNumFaces === 'number' &&
        typeof tracker.options.minDetectionConfidence === 'number'

      return hasRequiredMethods && hasEventSystem && hasValidOptions
    } catch (error) {
      console.error('验证FaceTracker功能时出错:', error)
      return false
    }
  }

  /**
   * 获取详细的兼容性报告
   */
  getCompatibilityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      capabilities: this.capabilities,
      recommendations: []
    }

    // 生成建议
    if (!this.capabilities.webgl) {
      report.recommendations.push('浏览器不支持WebGL，请更新到现代浏览器')
    }

    if (!this.capabilities.webassembly) {
      report.recommendations.push('浏览器不支持WebAssembly，请使用Chrome 57+或Firefox 52+')
    }

    if (!this.capabilities.getUserMedia) {
      report.recommendations.push('浏览器不支持摄像头访问，可能无法进行实时人脸跟踪')
    }

    if (!this.isAvailable) {
      report.recommendations.push('人脸识别功能不可用，将自动降级为人脸检测不可用的模式')
    }

    return report
  }
}
