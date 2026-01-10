/**
 * SmartCrop - 智能裁剪算法
 * 基于OpenCV.js实现的主体检测和智能裁剪
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { getAssetManager } from './AssetManager.js'

// OpenCV.js 加载状态管理
let cvReady = false
let cvLoadingPromise = null

/**
 * 加载OpenCV.js
 * @returns {Promise} OpenCV加载Promise
 */
async function loadOpenCV() {
  if (cvReady) {
    return Promise.resolve()
  }

  if (cvLoadingPromise) {
    return cvLoadingPromise
  }

  cvLoadingPromise = new Promise((resolve, reject) => {
    if (typeof window.cv !== 'undefined') {
      cvReady = true
      resolve()
      return
    }

    // 创建script标签加载OpenCV.js
    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
    script.onload = () => {
      // 等待OpenCV完全初始化
      const checkReady = () => {
        if (typeof window.cv !== 'undefined' && window.cv.Mat) {
          cvReady = true
          resolve()
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
    }
    script.onerror = () => {
      reject(new Error('OpenCV.js加载失败'))
    }
    document.head.appendChild(script)
  })

  return cvLoadingPromise
}

/**
 * 智能裁剪配置
 */
const SmartCropConfig = {
  // 边缘检测参数
  canny: {
    threshold1: 50,
    threshold2: 150,
    apertureSize: 3
  },

  // 轮廓检测参数
  contours: {
    mode: window.cv?.RETR_EXTERNAL || 0,
    method: window.cv?.CHAIN_APPROX_SIMPLE || 2
  },

  // 形态学操作参数
  morphology: {
    kernelSize: 3,
    iterations: 2
  },

  // 裁剪参数
  crop: {
    padding: 0.1, // 10%内边距
    minAreaRatio: 0.05, // 最小面积比例
    aspectRatio: {
      min: 0.5,
      max: 2.0
    }
  },

  // 性能参数
  performance: {
    maxProcessingTime: 5000, // 最大处理时间5秒
    targetResolution: 800 // 处理目标分辨率
  }
}

/**
 * 智能裁剪算法类
 */
export class SmartCrop {
  constructor() {
    this.config = { ...SmartCropConfig }
    this.isInitialized = false
  }

  /**
   * 初始化智能裁剪
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      await loadOpenCV()
      this.isInitialized = true
      console.log('SmartCrop initialized with OpenCV.js')
    } catch (error) {
      console.error('SmartCrop initialization failed:', error)
      throw error
    }
  }

  /**
   * 智能裁剪主函数
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @param {Object} options - 裁剪选项
   * @returns {Promise<Object>} 裁剪结果
   */
  async crop(imageSource, options = {}) {
    await this.initialize()

    const startTime = Date.now()

    try {
      // 合并配置
      const config = { ...this.config, ...options }

      // 转换为OpenCV格式
      const src = this.imageToMat(imageSource, config.performance.targetResolution)

      // 执行智能裁剪算法
      const cropRect = await this.findBestCrop(src, config)

      // 清理资源
      src.delete()

      const processingTime = Date.now() - startTime

      return {
        success: true,
        cropRect,
        processingTime,
        confidence: cropRect ? this.calculateConfidence(cropRect, src) : 0
      }
    } catch (error) {
      console.error('Smart crop failed:', error)
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * 将图像转换为OpenCV Mat
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @param {number} targetResolution - 目标分辨率
   * @returns {cv.Mat} OpenCV矩阵
   */
  imageToMat(imageSource, targetResolution) {
    let canvas, ctx

    if (imageSource instanceof HTMLCanvasElement) {
      canvas = imageSource
      ctx = canvas.getContext('2d')
    } else {
      // 创建canvas处理图片
      canvas = document.createElement('canvas')
      ctx = canvas.getContext('2d')

      // 计算缩放比例
      const scale = Math.min(1, targetResolution / Math.max(imageSource.width, imageSource.height))
      canvas.width = imageSource.width * scale
      canvas.height = imageSource.height * scale

      ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height)
    }

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const src = window.cv.matFromImageData(imageData)

    return src
  }

  /**
   * 寻找最佳裁剪区域
   * @param {cv.Mat} src - 源图像
   * @param {Object} config - 配置
   * @returns {Object|null} 裁剪矩形
   */
  async findBestCrop(src, config) {
    // 转换为灰度图
    const gray = new window.cv.Mat()
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0)

    // 高斯模糊去噪
    const blurred = new window.cv.Mat()
    window.cv.GaussianBlur(gray, blurred, new window.cv.Size(5, 5), 0)

    // Canny边缘检测
    const edges = new window.cv.Mat()
    window.cv.Canny(
      blurred,
      edges,
      config.canny.threshold1,
      config.canny.threshold2,
      config.canny.apertureSize
    )

    // 形态学操作 - 膨胀
    const kernel = window.cv.getStructuringElement(
      window.cv.MORPH_RECT,
      new window.cv.Size(config.morphology.kernelSize, config.morphology.kernelSize)
    )
    const dilated = new window.cv.Mat()
    window.cv.dilate(
      edges,
      dilated,
      kernel,
      new window.cv.Point(-1, -1),
      config.morphology.iterations
    )

    // 查找轮廓
    const contours = new window.cv.MatVector()
    const hierarchy = new window.cv.Mat()
    window.cv.findContours(
      dilated,
      contours,
      hierarchy,
      window.cv.RETR_EXTERNAL,
      window.cv.CHAIN_APPROX_SIMPLE
    )

    // 清理临时变量
    gray.delete()
    blurred.delete()
    edges.delete()
    dilated.delete()
    kernel.delete()
    hierarchy.delete()

    // 分析轮廓找到最佳裁剪区域
    const bestRect = this.analyzeContours(contours, src.cols, src.rows, config)

    // 清理轮廓
    contours.delete()

    return bestRect
  }

  /**
   * 分析轮廓找到最佳裁剪区域
   * @param {cv.MatVector} contours - 轮廓向量
   * @param {number} width - 图像宽度
   * @param {number} height - 图像高度
   * @param {Object} config - 配置
   * @returns {Object|null} 最佳裁剪矩形
   */
  analyzeContours(contours, width, height, config) {
    let bestRect = null
    let bestScore = 0

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i)
      const rect = window.cv.boundingRect(contour)

      // 计算面积比例
      const areaRatio = (rect.width * rect.height) / (width * height)

      // 过滤太小的轮廓
      if (areaRatio < config.crop.minAreaRatio) {
        continue
      }

      // 计算宽高比
      const aspectRatio = rect.width / rect.height

      // 过滤不符合宽高比的轮廓
      if (aspectRatio < config.crop.aspectRatio.min || aspectRatio > config.crop.aspectRatio.max) {
        continue
      }

      // 计算得分 (面积 + 位置权重)
      const centerX = rect.x + rect.width / 2
      const centerY = rect.y + rect.height / 2
      const centerDistance = Math.sqrt(
        Math.pow(centerX - width / 2, 2) + Math.pow(centerY - height / 2, 2)
      )
      const centerWeight = 1 - centerDistance / (Math.sqrt(width * width + height * height) / 2)

      const score = areaRatio * 0.7 + centerWeight * 0.3

      if (score > bestScore) {
        bestScore = score
        bestRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          score: score
        }
      }
    }

    // 添加内边距
    if (bestRect) {
      const padding = config.crop.padding
      bestRect.x = Math.max(0, bestRect.x - bestRect.width * padding)
      bestRect.y = Math.max(0, bestRect.y - bestRect.height * padding)
      bestRect.width = Math.min(width - bestRect.x, bestRect.width * (1 + 2 * padding))
      bestRect.height = Math.min(height - bestRect.y, bestRect.height * (1 + 2 * padding))
    }

    return bestRect
  }

  /**
   * 计算置信度
   * @param {Object} rect - 裁剪矩形
   * @param {cv.Mat} src - 源图像
   * @returns {number} 置信度分数
   */
  calculateConfidence(rect, src) {
    if (!rect) return 0

    // 基于面积比例和位置的置信度计算
    const areaRatio = (rect.width * rect.height) / (src.cols * src.rows)
    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2
    const centerDistance = Math.sqrt(
      Math.pow(centerX - src.cols / 2, 2) + Math.pow(centerY - src.rows / 2, 2)
    )
    const maxDistance = Math.sqrt(src.cols * src.cols + src.rows * src.rows) / 2
    const centerScore = 1 - centerDistance / maxDistance

    return Math.min(1, areaRatio * 0.6 + centerScore * 0.4)
  }

  /**
   * 批量处理智能裁剪
   * @param {Array} imageSources - 图像源数组
   * @param {Object} options - 选项
   * @returns {Promise<Array>} 处理结果数组
   */
  async batchCrop(imageSources, options = {}) {
    const results = []

    for (const source of imageSources) {
      try {
        const result = await this.crop(source, options)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * 获取智能裁剪建议
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @returns {Promise<Array>} 裁剪建议列表
   */
  async getCropSuggestions(imageSource) {
    await this.initialize()

    try {
      const src = this.imageToMat(imageSource, this.config.performance.targetResolution)
      const gray = new window.cv.Mat()
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0)

      // 获取多个候选区域
      const suggestions = await this.findCropSuggestions(src, gray, this.config)

      // 清理资源
      src.delete()
      gray.delete()

      return suggestions.slice(0, 5) // 返回前5个建议
    } catch (error) {
      console.error('Get crop suggestions failed:', error)
      return []
    }
  }

  /**
   * 寻找多个裁剪建议
   * @param {cv.Mat} src - 源图像
   * @param {cv.Mat} gray - 灰度图像
   * @param {Object} config - 配置
   * @returns {Array} 裁剪建议列表
   */
  async findCropSuggestions(src, gray, config) {
    const suggestions = []

    // 不同参数组合生成多个候选
    const paramSets = [
      { threshold1: 30, threshold2: 100 },
      { threshold1: 50, threshold2: 150 },
      { threshold1: 70, threshold2: 200 }
    ]

    for (const params of paramSets) {
      try {
        const edges = new window.cv.Mat()
        window.cv.Canny(
          gray,
          edges,
          params.threshold1,
          params.threshold2,
          config.canny.apertureSize
        )

        const contours = new window.cv.MatVector()
        const hierarchy = new window.cv.Mat()
        window.cv.findContours(
          edges,
          contours,
          hierarchy,
          window.cv.RETR_EXTERNAL,
          window.cv.CHAIN_APPROX_SIMPLE
        )

        for (let i = 0; i < Math.min(contours.size(), 3); i++) {
          const contour = contours.get(i)
          const rect = window.cv.boundingRect(contour)

          const areaRatio = (rect.width * rect.height) / (src.cols * src.rows)
          if (areaRatio >= config.crop.minAreaRatio) {
            suggestions.push({
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              confidence: areaRatio
            })
          }
        }

        // 清理资源
        edges.delete()
        contours.delete()
        hierarchy.delete()
      } catch (error) {
        console.warn('Parameter set processing failed:', error)
      }
    }

    // 按置信度排序
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 销毁资源
   */
  dispose() {
    this.isInitialized = false
    // OpenCV资源由浏览器自动管理
  }
}

/**
 * 全局智能裁剪实例
 */
let smartCropInstance = null

/**
 * 获取智能裁剪实例
 * @returns {SmartCrop} 智能裁剪实例
 */
export function getSmartCrop() {
  if (!smartCropInstance) {
    smartCropInstance = new SmartCrop()
  }
  return smartCropInstance
}

/**
 * 智能裁剪工具函数
 * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
 * @param {Object} options - 选项
 * @returns {Promise<Object>} 裁剪结果
 */
export async function smartCropImage(imageSource, options = {}) {
  const cropper = getSmartCrop()
  return await cropper.crop(imageSource, options)
}

/**
 * 批量智能裁剪
 * @param {Array} imageSources - 图像源数组
 * @param {Object} options - 选项
 * @returns {Promise<Array>} 处理结果数组
 */
export async function batchSmartCrop(imageSources, options = {}) {
  const cropper = getSmartCrop()
  return await cropper.batchCrop(imageSources, options)
}

/**
 * 获取裁剪建议
 * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
 * @returns {Promise<Array>} 裁剪建议列表
 */
export async function getCropSuggestions(imageSource) {
  const cropper = getSmartCrop()
  return await cropper.getCropSuggestions(imageSource)
}
