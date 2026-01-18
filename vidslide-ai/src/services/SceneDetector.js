/**
 * VidSlide AI - 场景检测服务
 * 使用多种算法检测视频中的场景切换
 *
 * 检测方法：
 * 1. 基于颜色直方图的差异检测
 * 2. 基于边缘检测的变化分析
 * 3. 基于光流的运动检测
 * 4. 基于音频能量的变化检测
 */

/**
 * 场景检测器类
 */
export class SceneDetector {
  constructor(options = {}) {
    this.options = {
      threshold: 0.3, // 场景切换阈值
      minSceneDuration: 2, // 最小场景时长（秒）
      sampleRate: 1, // 采样率（每秒采样帧数）
      useColorHistogram: true, // 使用颜色直方图
      useEdgeDetection: true, // 使用边缘检测
      useMotionDetection: false, // 使用运动检测（计算密集）
      ...options
    }

    this.previousFrame = null
    this.scenes = []
  }

  /**
   * 检测视频中的场景
   * @param {HTMLVideoElement} video - 视频元素
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 场景列表
   */
  async detectScenes(video, onProgress) {
    const duration = video.duration
    const sampleInterval = 1 / this.options.sampleRate
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 320 // 降低分辨率以提高性能
    canvas.height = Math.floor(320 * (video.videoHeight / video.videoWidth))

    const scenes = []
    let currentScene = {
      id: 'scene-0',
      startTime: 0,
      endTime: 0,
      frames: [],
      avgBrightness: 0,
      avgContrast: 0
    }

    let frameCount = 0
    const totalFrames = Math.floor(duration / sampleInterval)

    for (let time = 0; time < duration; time += sampleInterval) {
      try {
        // 跳转到指定时间
        await this.seekToTime(video, time)

        // 绘制当前帧
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // 获取帧数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // 检测场景切换
        const isSceneChange = await this.isSceneChange(imageData, time)

        if (isSceneChange && time - currentScene.startTime >= this.options.minSceneDuration) {
          // 保存当前场景
          currentScene.endTime = time
          currentScene.duration = currentScene.endTime - currentScene.startTime
          scenes.push(currentScene)

          // 开始新场景
          currentScene = {
            id: `scene-${scenes.length}`,
            startTime: time,
            endTime: time,
            frames: [],
            avgBrightness: 0,
            avgContrast: 0
          }
        }

        // 添加帧到当前场景
        currentScene.frames.push({
          time,
          brightness: this.calculateBrightness(imageData),
          contrast: this.calculateContrast(imageData)
        })

        // 更新场景统计
        currentScene.endTime = time
        this.updateSceneStats(currentScene)

        // 保存当前帧用于下次比较
        this.previousFrame = imageData

        frameCount++
        if (onProgress) {
          onProgress({
            current: frameCount,
            total: totalFrames,
            progress: (frameCount / totalFrames) * 100,
            scenesDetected: scenes.length
          })
        }
      } catch (error) {
        console.error(`场景检测失败 (时间: ${time}s):`, error)
      }
    }

    // 添加最后一个场景
    if (currentScene.frames.length > 0) {
      currentScene.endTime = duration
      currentScene.duration = currentScene.endTime - currentScene.startTime
      scenes.push(currentScene)
    }

    this.scenes = scenes
    return scenes
  }

  /**
   * 判断是否为场景切换
   * @param {ImageData} currentFrame - 当前帧
   * @param {number} time - 当前时间
   * @returns {Promise<boolean>} 是否为场景切换
   */
  async isSceneChange(currentFrame, time) {
    if (!this.previousFrame) {
      return false
    }

    let totalDifference = 0
    let numTests = 0

    // 1. 颜色直方图差异
    if (this.options.useColorHistogram) {
      const histogramDiff = this.compareColorHistograms(this.previousFrame, currentFrame)
      totalDifference += histogramDiff
      numTests++
    }

    // 2. 边缘检测差异
    if (this.options.useEdgeDetection) {
      const edgeDiff = this.compareEdges(this.previousFrame, currentFrame)
      totalDifference += edgeDiff
      numTests++
    }

    // 3. 运动检测
    if (this.options.useMotionDetection) {
      const motionDiff = this.detectMotion(this.previousFrame, currentFrame)
      totalDifference += motionDiff
      numTests++
    }

    // 计算平均差异
    const avgDifference = totalDifference / numTests

    return avgDifference > this.options.threshold
  }

  /**
   * 比较颜色直方图
   * @param {ImageData} frame1 - 帧1
   * @param {ImageData} frame2 - 帧2
   * @returns {number} 差异值 (0-1)
   */
  compareColorHistograms(frame1, frame2) {
    const hist1 = this.calculateColorHistogram(frame1)
    const hist2 = this.calculateColorHistogram(frame2)

    // 计算直方图差异（使用巴氏距离）
    let distance = 0
    for (let i = 0; i < hist1.length; i++) {
      distance += Math.sqrt(hist1[i] * hist2[i])
    }

    return 1 - distance
  }

  /**
   * 计算颜色直方图
   * @param {ImageData} imageData - 图像数据
   * @returns {Array} 直方图
   */
  calculateColorHistogram(imageData) {
    const data = imageData.data
    const bins = 64 // 每个通道64个bin
    const histogram = new Array(bins * 3).fill(0)

    // 统计RGB直方图
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor((data[i] / 256) * bins)
      const g = Math.floor((data[i + 1] / 256) * bins)
      const b = Math.floor((data[i + 2] / 256) * bins)

      histogram[r]++
      histogram[bins + g]++
      histogram[bins * 2 + b]++
    }

    // 归一化
    const total = data.length / 4
    for (let i = 0; i < histogram.length; i++) {
      histogram[i] /= total
    }

    return histogram
  }

  /**
   * 比较边缘
   * @param {ImageData} frame1 - 帧1
   * @param {ImageData} frame2 - 帧2
   * @returns {number} 差异值 (0-1)
   */
  compareEdges(frame1, frame2) {
    const edges1 = this.detectEdges(frame1)
    const edges2 = this.detectEdges(frame2)

    // 计算边缘差异
    let totalDiff = 0
    for (let i = 0; i < edges1.length; i++) {
      totalDiff += Math.abs(edges1[i] - edges2[i])
    }

    return totalDiff / (edges1.length * 255)
  }

  /**
   * 边缘检测（Sobel算子）
   * @param {ImageData} imageData - 图像数据
   * @returns {Uint8ClampedArray} 边缘图
   */
  detectEdges(imageData) {
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    const edges = new Uint8ClampedArray(width * height)

    // Sobel算子
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0
        let gy = 0

        // 应用Sobel算子
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3

            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            gx += gray * sobelX[kernelIdx]
            gy += gray * sobelY[kernelIdx]
          }
        }

        // 计算梯度幅值
        const magnitude = Math.sqrt(gx * gx + gy * gy)
        edges[y * width + x] = Math.min(255, magnitude)
      }
    }

    return edges
  }

  /**
   * 检测运动
   * @param {ImageData} frame1 - 帧1
   * @param {ImageData} frame2 - 帧2
   * @returns {number} 运动强度 (0-1)
   */
  detectMotion(frame1, frame2) {
    const data1 = frame1.data
    const data2 = frame2.data

    let totalDiff = 0
    const blockSize = 16 // 块大小
    const width = frame1.width
    const height = frame1.height

    // 块匹配
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        let blockDiff = 0

        for (let by = 0; by < blockSize && y + by < height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4

            const gray1 = (data1[idx] + data1[idx + 1] + data1[idx + 2]) / 3
            const gray2 = (data2[idx] + data2[idx + 1] + data2[idx + 2]) / 3

            blockDiff += Math.abs(gray1 - gray2)
          }
        }

        totalDiff += blockDiff / (blockSize * blockSize)
      }
    }

    const numBlocks = Math.ceil(width / blockSize) * Math.ceil(height / blockSize)
    return totalDiff / (numBlocks * 255)
  }

  /**
   * 计算亮度
   * @param {ImageData} imageData - 图像数据
   * @returns {number} 平均亮度 (0-255)
   */
  calculateBrightness(imageData) {
    const data = imageData.data
    let totalBrightness = 0

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      totalBrightness += brightness
    }

    return totalBrightness / (data.length / 4)
  }

  /**
   * 计算对比度
   * @param {ImageData} imageData - 图像数据
   * @returns {number} 对比度 (0-255)
   */
  calculateContrast(imageData) {
    const data = imageData.data
    const brightness = this.calculateBrightness(imageData)
    let totalVariance = 0

    for (let i = 0; i < data.length; i += 4) {
      const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      totalVariance += Math.pow(pixelBrightness - brightness, 2)
    }

    return Math.sqrt(totalVariance / (data.length / 4))
  }

  /**
   * 更新场景统计信息
   * @param {Object} scene - 场景对象
   */
  updateSceneStats(scene) {
    if (scene.frames.length === 0) return

    let totalBrightness = 0
    let totalContrast = 0

    for (const frame of scene.frames) {
      totalBrightness += frame.brightness
      totalContrast += frame.contrast
    }

    scene.avgBrightness = totalBrightness / scene.frames.length
    scene.avgContrast = totalContrast / scene.frames.length
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
   * 获取场景摘要
   * @returns {Object} 场景摘要
   */
  getSceneSummary() {
    if (this.scenes.length === 0) {
      return null
    }

    return {
      totalScenes: this.scenes.length,
      avgSceneDuration: this.scenes.reduce((sum, s) => sum + s.duration, 0) / this.scenes.length,
      shortestScene: Math.min(...this.scenes.map(s => s.duration)),
      longestScene: Math.max(...this.scenes.map(s => s.duration)),
      scenes: this.scenes.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        avgBrightness: s.avgBrightness,
        avgContrast: s.avgContrast
      }))
    }
  }

  /**
   * 重置检测器
   */
  reset() {
    this.previousFrame = null
    this.scenes = []
  }
}

export default SceneDetector
