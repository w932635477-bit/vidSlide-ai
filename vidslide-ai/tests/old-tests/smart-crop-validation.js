/**
 * SmartCrop Validation - 智能裁剪技术验证工具
 * 验证OpenCV.js集成和智能裁剪算法可行性
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class SmartCropValidator {
  constructor() {
    this.results = {
      opencvIntegration: {},
      imageProcessing: {},
      algorithmAccuracy: {},
      performanceBenchmark: {},
      memoryManagement: {}
    }

    this.testImages = []
    this.isInitialized = false
  }

  /**
   * 初始化验证器
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      // 创建测试图像
      await this.createTestImages()
      this.isInitialized = true
      console.log('SmartCropValidator initialized')
    } catch (error) {
      console.error('SmartCropValidator initialization failed:', error)
      throw error
    }
  }

  /**
   * 创建测试图像
   */
  async createTestImages() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    // 创建不同类型的测试图像
    const testCases = [
      { name: 'centered-subject', description: '居中主体图像' },
      { name: 'offset-subject', description: '偏移主体图像' },
      { name: 'multiple-objects', description: '多主体图像' },
      { name: 'complex-background', description: '复杂背景图像' },
      { name: 'minimal-contrast', description: '低对比度图像' }
    ]

    for (const testCase of testCases) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 生成测试图像内容
      this.generateTestImage(ctx, canvas.width, canvas.height, testCase.name)

      // 转换为Image对象
      const image = new Image()
      image.src = canvas.toDataURL()

      await new Promise(resolve => {
        image.onload = resolve
      })

      this.testImages.push({
        ...testCase,
        image: image,
        canvas: canvas,
        expectedCrop: this.getExpectedCrop(testCase.name, canvas.width, canvas.height)
      })
    }
  }

  /**
   * 生成测试图像内容
   */
  generateTestImage(ctx, width, height, type) {
    // 绘制背景
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    switch (type) {
      case 'centered-subject':
        // 居中的矩形主体
        ctx.fillStyle = '#333333'
        ctx.fillRect(width * 0.3, height * 0.3, width * 0.4, height * 0.4)
        break

      case 'offset-subject':
        // 偏移的圆形主体
        ctx.fillStyle = '#666666'
        ctx.beginPath()
        ctx.arc(width * 0.7, height * 0.6, width * 0.15, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'multiple-objects':
        // 多个主体
        ctx.fillStyle = '#444444'
        ctx.fillRect(width * 0.2, height * 0.2, width * 0.2, height * 0.2)
        ctx.fillStyle = '#777777'
        ctx.fillRect(width * 0.6, height * 0.5, width * 0.25, height * 0.15)
        break

      case 'complex-background':
        // 复杂背景 + 主体
        // 绘制复杂背景
        for (let i = 0; i < 50; i++) {
          ctx.fillStyle = `hsl(${Math.random() * 360}, 30%, ${50 + Math.random() * 20}%)`
          ctx.fillRect(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 50 + 10,
            Math.random() * 50 + 10
          )
        }
        // 绘制主体
        ctx.fillStyle = '#000000'
        ctx.fillRect(width * 0.35, height * 0.35, width * 0.3, height * 0.3)
        break

      case 'minimal-contrast':
        // 低对比度图像
        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#c0c0c0'
        ctx.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5)
        break
    }
  }

  /**
   * 获取期望的裁剪区域
   */
  getExpectedCrop(type, width, height) {
    switch (type) {
      case 'centered-subject':
        return { x: width * 0.25, y: height * 0.25, width: width * 0.5, height: height * 0.5 }
      case 'offset-subject':
        return { x: width * 0.55, y: height * 0.45, width: width * 0.3, height: height * 0.3 }
      case 'multiple-objects':
        return { x: width * 0.15, y: height * 0.15, width: width * 0.7, height: height * 0.5 }
      case 'complex-background':
        return { x: width * 0.3, y: height * 0.3, width: width * 0.4, height: height * 0.4 }
      case 'minimal-contrast':
        return { x: width * 0.2, y: height * 0.2, width: width * 0.6, height: height * 0.6 }
      default:
        return null
    }
  }

  /**
   * 验证OpenCV.js集成
   */
  async validateOpenCVIntegration() {
    console.log('验证OpenCV.js集成...')

    const startTime = Date.now()
    let opencvLoaded = false
    let loadTime = 0

    try {
      // 检查OpenCV是否已加载
      if (typeof window.cv === 'undefined') {
        // 动态加载OpenCV.js
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
          script.onload = () => {
            const checkReady = () => {
              if (typeof window.cv !== 'undefined' && window.cv.Mat) {
                resolve()
              } else {
                setTimeout(checkReady, 100)
              }
            }
            setTimeout(checkReady, 100)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      opencvLoaded = true
      loadTime = Date.now() - startTime

      // 验证基本功能
      const testMat = new window.cv.Mat(10, 10, window.cv.CV_8UC1)
      testMat.delete()

      this.results.opencvIntegration = {
        success: true,
        loadTime: loadTime,
        version: '4.8.0',
        basicFunctionality: true
      }

      console.log(`✅ OpenCV.js集成成功，加载时间: ${loadTime}ms`)
      return true
    } catch (error) {
      this.results.opencvIntegration = {
        success: false,
        error: error.message,
        loadTime: loadTime
      }

      console.error('❌ OpenCV.js集成失败:', error)
      return false
    }
  }

  /**
   * 验证图像处理功能
   */
  async validateImageProcessing() {
    console.log('验证图像处理功能...')

    try {
      // 创建测试图像
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 200
      canvas.height = 150

      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 100, 75)
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(100, 75, 100, 75)

      // 转换为OpenCV Mat
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const src = window.cv.matFromImageData(imageData)

      // 测试基本图像处理操作
      const gray = new window.cv.Mat()
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0)

      const blurred = new window.cv.Mat()
      window.cv.GaussianBlur(gray, blurred, new window.cv.Size(3, 3), 0)

      // 验证处理结果
      const success =
        gray.cols === canvas.width &&
        gray.rows === canvas.height &&
        blurred.cols === canvas.width &&
        blurred.rows === canvas.height

      // 清理资源
      src.delete()
      gray.delete()
      blurred.delete()

      this.results.imageProcessing = {
        success: success,
        operations: ['cvtColor', 'GaussianBlur'],
        resolution: `${canvas.width}x${canvas.height}`
      }

      console.log(`✅ 图像处理功能验证${success ? '成功' : '失败'}`)
      return success
    } catch (error) {
      this.results.imageProcessing = {
        success: false,
        error: error.message
      }

      console.error('❌ 图像处理功能验证失败:', error)
      return false
    }
  }

  /**
   * 验证算法准确性
   */
  async validateAlgorithmAccuracy() {
    console.log('验证算法准确性...')

    try {
      // 导入智能裁剪模块
      const { SmartCrop } = await import('./src/utils/smartCrop.js')
      const cropper = new SmartCrop()
      await cropper.initialize()

      let totalTests = 0
      let successfulTests = 0
      const accuracyResults = []

      for (const testImage of this.testImages) {
        totalTests++

        try {
          const result = await cropper.crop(testImage.image)

          if (result.success && result.cropRect) {
            const iou = this.calculateIoU(result.cropRect, testImage.expectedCrop)
            const isAccurate = iou >= 0.5 // IoU >= 0.5认为是准确的

            accuracyResults.push({
              testName: testImage.name,
              iou: iou,
              accurate: isAccurate,
              processingTime: result.processingTime
            })

            if (isAccurate) {
              successfulTests++
            }
          } else {
            accuracyResults.push({
              testName: testImage.name,
              error: '裁剪失败',
              accurate: false
            })
          }
        } catch (error) {
          accuracyResults.push({
            testName: testImage.name,
            error: error.message,
            accurate: false
          })
        }
      }

      const accuracy = successfulTests / totalTests
      const averageIoU =
        accuracyResults.filter(r => r.iou !== undefined).reduce((sum, r) => sum + r.iou, 0) /
        accuracyResults.filter(r => r.iou !== undefined).length

      this.results.algorithmAccuracy = {
        success: accuracy >= 0.6, // 60%以上准确率算通过
        accuracy: accuracy,
        averageIoU: averageIoU || 0,
        totalTests: totalTests,
        successfulTests: successfulTests,
        detailedResults: accuracyResults
      }

      console.log(`✅ 算法准确性验证完成，准确率: ${(accuracy * 100).toFixed(1)}%`)
      return accuracy >= 0.6
    } catch (error) {
      this.results.algorithmAccuracy = {
        success: false,
        error: error.message
      }

      console.error('❌ 算法准确性验证失败:', error)
      return false
    }
  }

  /**
   * 计算IoU (Intersection over Union)
   */
  calculateIoU(rect1, rect2) {
    if (!rect1 || !rect2) return 0

    const x1 = Math.max(rect1.x, rect2.x)
    const y1 = Math.max(rect1.y, rect2.y)
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width)
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height)

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
    const union = rect1.width * rect1.height + rect2.width * rect2.height - intersection

    return union > 0 ? intersection / union : 0
  }

  /**
   * 验证性能基准
   */
  async validatePerformanceBenchmark() {
    console.log('验证性能基准...')

    try {
      const { SmartCrop } = await import('./src/utils/smartCrop.js')
      const cropper = new SmartCrop()
      await cropper.initialize()

      const performanceResults = []
      const testSizes = [
        { width: 640, height: 480, name: 'VGA' },
        { width: 1280, height: 720, name: 'HD' },
        { width: 1920, height: 1080, name: 'FullHD' }
      ]

      for (const size of testSizes) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = size.width
        canvas.height = size.height

        // 生成测试内容
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, size.width, size.height)
        ctx.fillStyle = '#333333'
        ctx.fillRect(size.width * 0.2, size.height * 0.2, size.width * 0.6, size.height * 0.6)

        const image = new Image()
        image.src = canvas.toDataURL()

        await new Promise(resolve => (image.onload = resolve))

        const startTime = performance.now()
        const result = await cropper.crop(image)
        const endTime = performance.now()

        performanceResults.push({
          resolution: size.name,
          dimensions: `${size.width}x${size.height}`,
          processingTime: endTime - startTime,
          success: result.success
        })
      }

      const avgProcessingTime =
        performanceResults.reduce((sum, r) => sum + r.processingTime, 0) / performanceResults.length
      const allSuccessful = performanceResults.every(r => r.success)

      this.results.performanceBenchmark = {
        success: allSuccessful && avgProcessingTime < 2000, // 平均处理时间 < 2秒
        averageProcessingTime: avgProcessingTime,
        maxProcessingTime: Math.max(...performanceResults.map(r => r.processingTime)),
        detailedResults: performanceResults
      }

      console.log(`✅ 性能基准验证完成，平均处理时间: ${avgProcessingTime.toFixed(1)}ms`)
      return allSuccessful && avgProcessingTime < 2000
    } catch (error) {
      this.results.performanceBenchmark = {
        success: false,
        error: error.message
      }

      console.error('❌ 性能基准验证失败:', error)
      return false
    }
  }

  /**
   * 验证内存管理
   */
  async validateMemoryManagement() {
    console.log('验证内存管理...')

    try {
      const { SmartCrop } = await import('./src/utils/smartCrop.js')
      const cropper = new SmartCrop()

      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 执行多次裁剪操作
      for (let i = 0; i < 10; i++) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 800
        canvas.height = 600

        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, 800, 600)
        ctx.fillStyle = '#333333'
        ctx.fillRect(200, 150, 400, 300)

        const image = new Image()
        image.src = canvas.toDataURL()

        await new Promise(resolve => (image.onload = resolve))
        const _result = await cropper.crop(image)
      }

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      const memoryIncrease = finalMemory - initialMemory

      // 强制垃圾回收 (如果可用)
      if (window.gc) {
        window.gc()
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const afterGcMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      const memoryLeak = afterGcMemory - initialMemory

      const acceptableLeak = 5 * 1024 * 1024 // 5MB以内算正常
      const memoryManagementGood = memoryLeak < acceptableLeak

      this.results.memoryManagement = {
        success: memoryManagementGood,
        initialMemory: initialMemory,
        finalMemory: finalMemory,
        memoryIncrease: memoryIncrease,
        afterGcMemory: afterGcMemory,
        memoryLeak: memoryLeak,
        acceptableLeak: acceptableLeak,
        memoryLeakMB: (memoryLeak / (1024 * 1024)).toFixed(2)
      }

      console.log(`✅ 内存管理验证完成，内存泄漏: ${(memoryLeak / (1024 * 1024)).toFixed(2)}MB`)
      return memoryManagementGood
    } catch (error) {
      this.results.memoryManagement = {
        success: false,
        error: error.message
      }

      console.error('❌ 内存管理验证失败:', error)
      return false
    }
  }

  /**
   * 运行所有验证
   */
  async validateAll() {
    console.log('🚀 开始智能裁剪功能全面验证')
    console.log('=====================================')

    await this.initialize()

    const validations = [
      { name: 'OpenCV.js集成', method: this.validateOpenCVIntegration.bind(this) },
      { name: '图像处理功能', method: this.validateImageProcessing.bind(this) },
      { name: '算法准确性', method: this.validateAlgorithmAccuracy.bind(this) },
      { name: '性能基准', method: this.validatePerformanceBenchmark.bind(this) },
      { name: '内存管理', method: this.validateMemoryManagement.bind(this) }
    ]

    const results = []
    let overallScore = 0

    for (const validation of validations) {
      console.log(`\n📋 验证: ${validation.name}`)
      try {
        const success = await validation.method()
        results.push({ name: validation.name, success })
        overallScore += success ? 20 : 0
      } catch (error) {
        console.error(`${validation.name}验证出错:`, error)
        results.push({ name: validation.name, success: false, error: error.message })
      }
    }

    const summary = {
      overallScore: overallScore,
      results: results,
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results)
    }

    console.log('\n=====================================')
    console.log(`🏆 验证完成 - 总体得分: ${overallScore}/100`)
    console.log('=====================================')

    return summary
  }

  /**
   * 生成实施建议
   */
  generateRecommendations(results) {
    const recommendations = []

    const failedValidations = results.filter(r => !r.success)

    if (failedValidations.some(r => r.name === 'OpenCV.js集成')) {
      recommendations.push('🔧 优化OpenCV.js加载策略，考虑CDN加速或本地部署')
    }

    if (failedValidations.some(r => r.name === '算法准确性')) {
      recommendations.push('🎯 改进裁剪算法，考虑添加机器学习模型辅助判断')
    }

    if (failedValidations.some(r => r.name === '性能基准')) {
      recommendations.push('⚡ 优化图像处理性能，考虑WebAssembly优化和算法并行化')
    }

    if (failedValidations.some(r => r.name === '内存管理')) {
      recommendations.push('🧠 改进内存管理，实现对象池和主动垃圾回收')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有验证项目通过，可以开始功能实现')
    }

    return recommendations
  }

  /**
   * 生成后续步骤
   */
  generateNextSteps(results) {
    const nextSteps = []

    const allPassed = results.every(r => r.success)

    if (allPassed) {
      nextSteps.push('1. 开始实现SmartCrop组件UI界面')
      nextSteps.push('2. 集成到AssetBrowser.vue素材浏览器')
      nextSteps.push('3. 添加用户交互和参数调节')
      nextSteps.push('4. 实现批量智能裁剪功能')
    } else {
      nextSteps.push('1. 分析失败的验证项目')
      nextSteps.push('2. 优化算法和性能瓶颈')
      nextSteps.push('3. 重新运行验证测试')
      nextSteps.push('4. 解决技术障碍后再实施')
    }

    nextSteps.push('5. 更新功能实现对比分析文档')
    nextSteps.push('6. 在缺失功能开发计划中标记完成')

    return nextSteps
  }

  /**
   * 获取验证摘要
   */
  getValidationSummary() {
    return {
      opencvIntegration: this.results.opencvIntegration,
      imageProcessing: this.results.imageProcessing,
      algorithmAccuracy: this.results.algorithmAccuracy,
      performanceBenchmark: this.results.performanceBenchmark,
      memoryManagement: this.results.memoryManagement
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.testImages = []
    this.isInitialized = false
  }
}

// 全局验证器实例
let validatorInstance = null

/**
 * 获取智能裁剪验证器
 */
export function getSmartCropValidator() {
  if (!validatorInstance) {
    validatorInstance = new SmartCropValidator()
  }
  return validatorInstance
}

/**
 * 运行智能裁剪验证
 */
export async function validateSmartCrop() {
  const validator = getSmartCropValidator()
  return await validator.validateAll()
}

/**
 * 获取验证结果摘要
 */
export function getSmartCropValidationSummary() {
  const validator = getSmartCropValidator()
  return validator.getValidationSummary()
}

// 自动运行验证（如果在浏览器环境中）
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.validateSmartCrop = validateSmartCrop
  window.getSmartCropValidationSummary = getSmartCropValidationSummary
}
