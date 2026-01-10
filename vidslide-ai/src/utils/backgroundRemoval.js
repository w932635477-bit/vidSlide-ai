/**
 * BackgroundRemoval - 背景移除功能
 * 基于DeepLab v3语义分割的智能背景移除
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { getAssetManager } from './AssetManager.js'

// TensorFlow.js 加载状态管理
let tfReady = false
let tfLoadingPromise = null
let deeplabModel = null

/**
 * 加载TensorFlow.js和DeepLab模型
 * @returns {Promise} TensorFlow加载Promise
 */
async function loadTensorFlow() {
  if (tfReady && deeplabModel) {
    return deeplabModel
  }

  if (tfLoadingPromise) {
    return tfLoadingPromise
  }

  tfLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      // 动态加载TensorFlow.js
      if (typeof tf === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.8.0/dist/tf.min.js'
        script.onload = () => {
          console.log('TensorFlow.js loaded')
          loadDeepLabModel().then(resolve).catch(reject)
        }
        script.onerror = reject
        document.head.appendChild(script)
      } else {
        await loadDeepLabModel()
        resolve(deeplabModel)
      }
    } catch (error) {
      reject(new Error('TensorFlow.js加载失败: ' + error.message))
    }
  })

  return tfLoadingPromise
}

/**
 * 加载DeepLab v3模型
 */
async function loadDeepLabModel() {
  try {
    // 使用MobileNet v3 backbone的DeepLab v3 (更轻量)
    const modelUrl = 'https://tfhub.dev/tensorflow/tfjs-model/deeplab/pascal/1/default/1'

    console.log('Loading DeepLab v3 model...')
    const startTime = Date.now()

    // 使用tf.loadGraphModel加载模型
    deeplabModel = await tf.loadGraphModel(modelUrl, { fromTFHub: true })

    const loadTime = Date.now() - startTime
    console.log(`DeepLab model loaded in ${loadTime}ms`)

    tfReady = true
    return deeplabModel
  } catch (error) {
    console.error('DeepLab model loading failed:', error)
    throw new Error('DeepLab模型加载失败: ' + error.message)
  }
}

/**
 * 背景移除配置
 */
const BackgroundRemovalConfig = {
  // 模型配置
  model: {
    inputSize: 513, // DeepLab v3标准输入尺寸
    outputStride: 16,
    scale: 1.0
  },

  // 分割参数
  segmentation: {
    personClass: 15, // PASCAL VOC数据集中的person类别ID
    confidenceThreshold: 0.5, // 分割置信度阈值
    smoothingIterations: 3 // 边缘平滑迭代次数
  },

  // 后处理参数
  postProcessing: {
    featherAmount: 3, // 羽化边缘像素数
    backgroundColor: [0, 0, 0, 0], // 透明背景
    minSubjectArea: 0.05 // 最小主体面积比例
  },

  // 性能参数
  performance: {
    maxProcessingTime: 10000, // 最大处理时间10秒
    targetResolution: 400 // 处理目标分辨率
  }
}

/**
 * 背景移除类
 */
export class BackgroundRemoval {
  constructor() {
    this.config = { ...BackgroundRemovalConfig }
    this.isInitialized = false
  }

  /**
   * 初始化背景移除
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      await loadTensorFlow()
      this.isInitialized = true
      console.log('BackgroundRemoval initialized with DeepLab v3')
    } catch (error) {
      console.error('BackgroundRemoval initialization failed:', error)
      throw error
    }
  }

  /**
   * 执行背景移除
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @param {Object} options - 处理选项
   * @returns {Promise<Object>} 处理结果
   */
  async removeBackground(imageSource, options = {}) {
    await this.initialize()

    const startTime = Date.now()

    try {
      // 合并配置
      const config = { ...this.config, ...options }

      // 预处理图像
      const processedImage = this.preprocessImage(imageSource, config.performance.targetResolution)

      // 执行语义分割
      const segmentationResult = await this.performSegmentation(processedImage, config)

      // 后处理生成结果
      const result = await this.postProcess(segmentationResult, processedImage, config)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        resultImage: result,
        processingTime,
        confidence: segmentationResult.confidence,
        maskData: segmentationResult.maskData
      }
    } catch (error) {
      console.error('Background removal failed:', error)
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * 预处理图像
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @param {number} targetResolution - 目标分辨率
   * @returns {Object} 预处理后的图像数据
   */
  preprocessImage(imageSource, targetResolution) {
    let canvas, ctx

    if (imageSource instanceof HTMLCanvasElement) {
      canvas = imageSource
      ctx = canvas.getContext('2d')
    } else {
      canvas = document.createElement('canvas')
      ctx = canvas.getContext('2d')

      // 计算缩放比例
      const scale = Math.min(1, targetResolution / Math.max(imageSource.width, imageSource.height))
      canvas.width = imageSource.width * scale
      canvas.height = imageSource.height * scale

      ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height)
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return {
      canvas: canvas,
      ctx: ctx,
      imageData: imageData,
      width: canvas.width,
      height: canvas.height,
      originalWidth: imageSource.width || canvas.width,
      originalHeight: imageSource.height || canvas.height
    }
  }

  /**
   * 执行语义分割
   * @param {Object} processedImage - 预处理后的图像
   * @param {Object} config - 配置
   * @returns {Promise<Object>} 分割结果
   */
  async performSegmentation(processedImage, config) {
    return tf.tidy(() => {
      // 转换为TensorFlow张量
      const tensor = tf.browser
        .fromPixels(processedImage.imageData)
        .resizeBilinear([config.model.inputSize, config.model.inputSize])
        .div(255.0)
        .expandDims(0)

      // 执行推理
      const predictions = deeplabModel.predict(tensor)

      // 获取分割结果
      const segmentation = predictions.squeeze()
      const personMask = segmentation.slice(
        [0, 0, config.segmentation.personClass],
        [config.model.inputSize, config.model.inputSize, 1]
      )

      // 调整回原始尺寸
      const resizedMask = tf.image.resizeBilinear(personMask, [
        processedImage.height,
        processedImage.width
      ])

      // 应用置信度阈值
      const thresholdedMask = resizedMask.greater(config.segmentation.confidenceThreshold)

      // 转换为JavaScript数组
      const maskData = thresholdedMask.dataSync()

      // 计算置信度
      const confidence = this.calculateSegmentationConfidence(maskData, processedImage)

      return {
        maskData: maskData,
        confidence: confidence,
        width: processedImage.width,
        height: processedImage.height
      }
    })
  }

  /**
   * 计算分割置信度
   * @param {Float32Array} maskData - 掩码数据
   * @param {Object} processedImage - 处理后的图像
   * @returns {number} 置信度分数
   */
  calculateSegmentationConfidence(maskData, processedImage) {
    const totalPixels = maskData.length
    let personPixels = 0

    for (let i = 0; i < totalPixels; i++) {
      if (maskData[i] > 0) personPixels++
    }

    const personRatio = personPixels / totalPixels

    // 主体面积应该在合理范围内 (5%-80%)
    if (personRatio < this.config.postProcessing.minSubjectArea || personRatio > 0.8) {
      return Math.max(0, 1 - Math.abs(personRatio - 0.4) / 0.4)
    }

    return personRatio
  }

  /**
   * 后处理生成结果
   * @param {Object} segmentationResult - 分割结果
   * @param {Object} processedImage - 处理后的图像
   * @param {Object} config - 配置
   * @returns {Promise<HTMLCanvasElement>} 处理结果
   */
  async postProcess(segmentationResult, processedImage, config) {
    const resultCanvas = document.createElement('canvas')
    const resultCtx = resultCanvas.getContext('2d')

    resultCanvas.width = processedImage.width
    resultCanvas.height = processedImage.height

    // 创建结果图像数据
    const resultImageData = new ImageData(processedImage.width, processedImage.height)
    const originalData = processedImage.imageData.data
    const resultData = resultImageData.data

    // 应用掩码和边缘羽化
    for (let y = 0; y < processedImage.height; y++) {
      for (let x = 0; x < processedImage.width; x++) {
        const pixelIndex = y * processedImage.width + x
        const dataIndex = pixelIndex * 4

        // 获取掩码值 (0-1)
        const maskValue = segmentationResult.maskData[pixelIndex]

        // 应用边缘羽化
        const featheredMask = this.applyFeathering(
          segmentationResult.maskData,
          x,
          y,
          processedImage.width,
          processedImage.height,
          config.postProcessing.featherAmount
        )

        // 复制原始像素
        resultData[dataIndex] = originalData[dataIndex] // R
        resultData[dataIndex + 1] = originalData[dataIndex + 1] // G
        resultData[dataIndex + 2] = originalData[dataIndex + 2] // B
        resultData[dataIndex + 3] = Math.round(featheredMask * 255) // A
      }
    }

    resultCtx.putImageData(resultImageData, 0, 0)
    return resultCanvas
  }

  /**
   * 应用边缘羽化
   * @param {Float32Array} maskData - 掩码数据
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 图像宽度
   * @param {number} height - 图像高度
   * @param {number} featherAmount - 羽化程度
   * @returns {number} 羽化后的掩码值
   */
  applyFeathering(maskData, x, y, width, height, featherAmount) {
    if (featherAmount <= 0) return maskData[y * width + x]

    let sum = 0
    let count = 0

    // 在羽化范围内采样
    for (let dy = -featherAmount; dy <= featherAmount; dy++) {
      for (let dx = -featherAmount; dx <= featherAmount; dx++) {
        const nx = x + dx
        const ny = y + dy

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance <= featherAmount) {
            const weight = 1 - distance / featherAmount
            sum += maskData[ny * width + nx] * weight
            count += weight
          }
        }
      }
    }

    return count > 0 ? sum / count : 0
  }

  /**
   * 批量背景移除
   * @param {Array} imageSources - 图像源数组
   * @param {Object} options - 选项
   * @returns {Promise<Array>} 处理结果数组
   */
  async batchRemoveBackground(imageSources, options = {}) {
    const results = []

    for (const source of imageSources) {
      try {
        const result = await this.removeBackground(source, options)
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
   * 获取背景移除建议
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
   * @returns {Promise<Object>} 处理建议
   */
  async getRemovalSuggestions(imageSource) {
    await this.initialize()

    try {
      const processedImage = this.preprocessImage(
        imageSource,
        this.config.performance.targetResolution
      )
      const segmentationResult = await this.performSegmentation(processedImage, this.config)

      const suggestions = {
        hasPerson: segmentationResult.confidence > this.config.segmentation.confidenceThreshold,
        confidence: segmentationResult.confidence,
        estimatedProcessingTime: Math.round(segmentationResult.confidence * 3000 + 1000), // 基于置信度的估算
        recommendedSettings: this.getRecommendedSettings(segmentationResult.confidence)
      }

      return suggestions
    } catch (error) {
      console.error('Get removal suggestions failed:', error)
      return {
        hasPerson: false,
        confidence: 0,
        error: error.message
      }
    }
  }

  /**
   * 获取推荐设置
   * @param {number} confidence - 置信度
   * @returns {Object} 推荐设置
   */
  getRecommendedSettings(confidence) {
    if (confidence > 0.8) {
      return {
        featherAmount: 2,
        quality: 'high',
        processingMode: 'standard'
      }
    } else if (confidence > 0.5) {
      return {
        featherAmount: 3,
        quality: 'medium',
        processingMode: 'standard'
      }
    } else {
      return {
        featherAmount: 5,
        quality: 'low',
        processingMode: 'conservative'
      }
    }
  }

  /**
   * 销毁资源
   */
  dispose() {
    this.isInitialized = false
    // TensorFlow资源由浏览器自动管理
  }
}

/**
 * 全局背景移除实例
 */
let backgroundRemovalInstance = null

/**
 * 获取背景移除实例
 * @returns {BackgroundRemoval} 背景移除实例
 */
export function getBackgroundRemoval() {
  if (!backgroundRemovalInstance) {
    backgroundRemovalInstance = new BackgroundRemoval()
  }
  return backgroundRemovalInstance
}

/**
 * 背景移除工具函数
 * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
 * @param {Object} options - 选项
 * @returns {Promise<Object>} 处理结果
 */
export async function removeImageBackground(imageSource, options = {}) {
  const remover = getBackgroundRemoval()
  return await remover.removeBackground(imageSource, options)
}

/**
 * 批量背景移除
 * @param {Array} imageSources - 图像源数组
 * @param {Object} options - 选项
 * @returns {Promise<Array>} 处理结果数组
 */
export async function batchRemoveBackgrounds(imageSources, options = {}) {
  const remover = getBackgroundRemoval()
  return await remover.batchRemoveBackground(imageSources, options)
}

/**
 * 获取背景移除建议
 * @param {HTMLImageElement|HTMLCanvasElement} imageSource - 图像源
 * @returns {Promise<Object>} 处理建议
 */
export async function getBackgroundRemovalSuggestions(imageSource) {
  const remover = getBackgroundRemoval()
  return await remover.getRemovalSuggestions(imageSource)
}
