/**
 * ImageQualityOptimizer - 图像质量优化服务
 *
 * 提供完整的图像质量优化管道：分辨率增强、色彩匹配、亮度调整等
 */

class ImageQualityOptimizer {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.isInitialized = false
  }

  /**
   * 初始化Canvas上下文
   */
  initialize() {
    if (this.isInitialized) return

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.isInitialized = true
  }

  /**
   * 执行完整质量优化
   * @param {File|Blob} imageFile - 原始图片
   * @param {Object} options - 优化选项
   * @returns {Promise<Object>} 优化结果
   */
  async optimizeImage(imageFile, options = {}) {
    this.initialize()

    try {
      console.log('开始图像质量优化...')

      const {
        targetResolution = null,    // 目标分辨率 {width, height}
        colorProfile = null,        // 目标色彩配置
        brightness = 0,             // 亮度调整 (-100 to 100)
        contrast = 0,               // 对比度调整 (-100 to 100)
        saturation = 0,             // 饱和度调整 (-100 to 100)
        sharpness = 0,              // 锐度调整 (0-100)
        noiseReduction = 0,         // 降噪强度 (0-100)
        enableUpscaling = true      // 是否启用超分辨率
      } = options

      // 加载原始图片
      const originalImage = await this.loadImage(imageFile)
      const originalData = await this.getImageData(originalImage)

      // 创建优化管道
      let optimizedData = originalData

      // 1. 分辨率优化（超分辨率或降采样）
      if (targetResolution) {
        optimizedData = await this.optimizeResolution(optimizedData, targetResolution, enableUpscaling)
      }

      // 2. 色彩校正
      if (colorProfile) {
        optimizedData = this.applyColorCorrection(optimizedData, colorProfile)
      }

      // 3. 亮度和对比度调整
      if (brightness !== 0 || contrast !== 0) {
        optimizedData = this.adjustBrightnessContrast(optimizedData, brightness, contrast)
      }

      // 4. 饱和度调整
      if (saturation !== 0) {
        optimizedData = this.adjustSaturation(optimizedData, saturation)
      }

      // 5. 锐度增强
      if (sharpness > 0) {
        optimizedData = this.sharpenImage(optimizedData, sharpness)
      }

      // 6. 降噪处理
      if (noiseReduction > 0) {
        optimizedData = this.reduceNoise(optimizedData, noiseReduction)
      }

      // 转换为Blob
      const optimizedBlob = await this.imageDataToBlob(optimizedData)

      console.log('图像质量优化完成')

      return {
        optimizedBlob,
        originalSize: { width: originalData.width, height: originalData.height },
        optimizedSize: { width: optimizedData.width, height: optimizedData.height },
        optimizations: {
          resolution: !!targetResolution,
          colorCorrection: !!colorProfile,
          brightnessContrast: brightness !== 0 || contrast !== 0,
          saturation: saturation !== 0,
          sharpness: sharpness > 0,
          noiseReduction: noiseReduction > 0
        },
        quality: this.assessQuality(optimizedData)
      }

    } catch (error) {
      console.error('图像质量优化失败:', error)
      throw new Error(`图像质量优化失败: ${error.message}`)
    }
  }

  /**
   * 分辨率优化（超分辨率或降采样）
   * @param {ImageData} imageData - 原始图片数据
   * @param {Object} targetResolution - 目标分辨率
   * @param {boolean} enableUpscaling - 是否启用超分辨率
   * @returns {ImageData} 优化后的图片数据
   */
  async optimizeResolution(imageData, targetResolution, enableUpscaling = true) {
    const { width: targetWidth, height: targetHeight } = targetResolution
    const { width: originalWidth, height: originalHeight } = imageData

    // 计算缩放比例
    const scaleX = targetWidth / originalWidth
    const scaleY = targetHeight / originalHeight

    // 如果是降采样或者不允许超分辨率，使用标准缩放
    if (!enableUpscaling && (scaleX > 1 || scaleY > 1)) {
      console.log('跳过超分辨率，使用标准缩放')
      return this.resizeImage(imageData, targetWidth, targetHeight)
    }

    // 对于超分辨率，使用简单的插值算法
    // 注意：在实际应用中，这里应该使用更先进的超分辨率算法
    if (scaleX > 1 || scaleY > 1) {
      console.log('应用超分辨率算法')
      return this.superResolution(imageData, targetWidth, targetHeight)
    }

    // 降采样
    return this.resizeImage(imageData, targetWidth, targetHeight)
  }

  /**
   * 超分辨率处理（简化实现）
   * @param {ImageData} imageData - 原始图片数据
   * @param {number} targetWidth - 目标宽度
   * @param {number} targetHeight - 目标高度
   * @returns {ImageData} 超分辨率后的图片数据
   */
  superResolution(imageData, targetWidth, targetHeight) {
    // 创建目标Canvas
    this.canvas.width = targetWidth
    this.canvas.height = targetHeight

    // 使用Canvas的高质量缩放
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    // 创建临时Canvas用于原始图片
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)

    // 执行高质量缩放
    this.ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)

    return this.ctx.getImageData(0, 0, targetWidth, targetHeight)
  }

  /**
   * 标准图像缩放
   * @param {ImageData} imageData - 原始图片数据
   * @param {number} targetWidth - 目标宽度
   * @param {number} targetHeight - 目标高度
   * @returns {ImageData} 缩放后的图片数据
   */
  resizeImage(imageData, targetWidth, targetHeight) {
    this.canvas.width = targetWidth
    this.canvas.height = targetHeight

    // 创建临时Canvas用于原始图片
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)

    // 执行缩放
    this.ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight)

    return this.ctx.getImageData(0, 0, targetWidth, targetHeight)
  }

  /**
   * 色彩校正
   * @param {ImageData} imageData - 图片数据
   * @param {Object} colorProfile - 目标色彩配置
   * @returns {ImageData} 校正后的图片数据
   */
  applyColorCorrection(imageData, colorProfile) {
    const data = imageData.data
    const { r: targetR, g: targetG, b: targetB } = colorProfile

    // 计算平均色彩值
    let totalR = 0, totalG = 0, totalB = 0
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i]
      totalG += data[i + 1]
      totalB += data[i + 2]
    }

    const pixelCount = data.length / 4
    const avgR = totalR / pixelCount
    const avgG = totalG / pixelCount
    const avgB = totalB / pixelCount

    // 计算色彩校正系数
    const rFactor = targetR / Math.max(avgR, 1)
    const gFactor = targetG / Math.max(avgG, 1)
    const bFactor = targetB / Math.max(avgB, 1)

    // 应用色彩校正
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * rFactor))         // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * gFactor)) // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * bFactor)) // B
      // Alpha通道保持不变
    }

    return imageData
  }

  /**
   * 亮度和对比度调整
   * @param {ImageData} imageData - 图片数据
   * @param {number} brightness - 亮度 (-100 to 100)
   * @param {number} contrast - 对比度 (-100 to 100)
   * @returns {ImageData} 调整后的图片数据
   */
  adjustBrightnessContrast(imageData, brightness, contrast) {
    const data = imageData.data
    const brightnessFactor = brightness / 100
    const contrastFactor = (contrast + 100) / 100

    for (let i = 0; i < data.length; i += 4) {
      // 亮度调整
      data[i] = Math.min(255, Math.max(0, data[i] + brightnessFactor * 255))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessFactor * 255))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessFactor * 255))

      // 对比度调整
      data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastFactor) + 128))
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastFactor) + 128))
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastFactor) + 128))
    }

    return imageData
  }

  /**
   * 饱和度调整
   * @param {ImageData} imageData - 图片数据
   * @param {number} saturation - 饱和度 (-100 to 100)
   * @returns {ImageData} 调整后的图片数据
   */
  adjustSaturation(imageData, saturation) {
    const data = imageData.data
    const saturationFactor = saturation / 100

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 计算灰度值
      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      // 应用饱和度调整
      data[i] = Math.min(255, Math.max(0, gray + (r - gray) * (1 + saturationFactor)))
      data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * (1 + saturationFactor)))
      data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * (1 + saturationFactor)))
    }

    return imageData
  }

  /**
   * 锐度增强
   * @param {ImageData} imageData - 图片数据
   * @param {number} sharpness - 锐度强度 (0-100)
   * @returns {ImageData} 锐化后的图片数据
   */
  sharpenImage(imageData, sharpness) {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const strength = sharpness / 100

    // 创建原始数据副本
    const originalData = new Uint8ClampedArray(data)

    // Laplacian算子锐化
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB通道
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              const kidx = (ky + 1) * 3 + (kx + 1)
              sum += originalData[idx] * kernel[kidx]
            }
          }

          const currentIdx = (y * width + x) * 4 + c
          data[currentIdx] = Math.min(255, Math.max(0,
            originalData[currentIdx] + (sum - originalData[currentIdx]) * strength
          ))
        }
      }
    }

    return imageData
  }

  /**
   * 降噪处理
   * @param {ImageData} imageData - 图片数据
   * @param {number} strength - 降噪强度 (0-100)
   * @returns {ImageData} 降噪后的图片数据
   */
  reduceNoise(imageData, strength) {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const factor = strength / 100

    // 创建副本用于读取原始值
    const originalData = new Uint8ClampedArray(data)

    // 中值滤波降噪
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // 收集3x3邻域的值
          const neighbors = []
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c
              neighbors.push(originalData[idx])
            }
          }

          // 排序并取中值
          neighbors.sort((a, b) => a - b)
          const median = neighbors[4] // 3x3的中值

          // 与原始值混合
          const currentIdx = (y * width + x) * 4 + c
          data[currentIdx] = Math.round(
            originalData[currentIdx] * (1 - factor) + median * factor
          )
        }
      }
    }

    return imageData
  }

  /**
   * 质量评估
   * @param {ImageData} imageData - 图片数据
   * @returns {Object} 质量评估结果
   */
  assessQuality(imageData) {
    const data = imageData.data
    let sharpness = 0
    let brightness = 0
    let contrast = 0

    // 计算亮度
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      brightness += (r + g + b) / 3
    }
    brightness /= (data.length / 4)

    // 计算对比度和锐度
    let sumSquares = 0
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      sumSquares += gray * gray
      contrast += Math.abs(gray - brightness)
    }

    contrast /= (data.length / 4)
    const variance = sumSquares / (data.length / 4) - brightness * brightness
    sharpness = Math.sqrt(variance)

    return {
      brightness: Math.round(brightness),
      contrast: Math.round(contrast),
      sharpness: Math.round(sharpness),
      overall: Math.round((brightness / 255 * 30 + contrast / 128 * 35 + sharpness / 50 * 35))
    }
  }

  /**
   * 加载图片
   * @param {File|Blob} file - 图片文件
   * @returns {Promise<HTMLImageElement>} 图片元素
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 获取图片数据
   * @param {HTMLImageElement} img - 图片元素
   * @returns {Promise<ImageData>} 图片数据
   */
  async getImageData(img) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    this.ctx.drawImage(img, 0, 0)
    return this.ctx.getImageData(0, 0, img.width, img.height)
  }

  /**
   * ImageData转Blob
   * @param {ImageData} imageData - 图片数据
   * @returns {Promise<Blob>} 图片Blob
   */
  async imageDataToBlob(imageData) {
    return new Promise(resolve => {
      this.canvas.width = imageData.width
      this.canvas.height = imageData.height
      this.ctx.putImageData(imageData, 0, 0)
      this.canvas.toBlob(resolve, 'image/png')
    })
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.canvas = null
    this.ctx = null
    this.isInitialized = false
  }
}

export default new ImageQualityOptimizer()