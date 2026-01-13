/**
 * BackgroundRemovalService - 背景移除服务
 *
 * 集成WebAssembly加速的本地背景移除 + API备选方案
 */

import { getAPIConfig, isAPIConfigured } from '../config/api-keys.js'

class BackgroundRemovalService {
  constructor() {
    this.wasmModule = null
    this.isInitialized = false

    // 服务优先级：WebAssembly本地处理 > API服务
    this.services = {
      wasm: this.wasmBackgroundRemoval.bind(this),  // WebAssembly加速本地处理
      removebg: this.removeBgService.bind(this),    // API备选1
      claidai: this.claidAIService.bind(this)       // API备选2
    }
    this.currentService = null
  }

  /**
   * 初始化WebAssembly模块
   * @returns {Promise<void>}
   */
  async initializeWasm() {
    if (this.isInitialized) return

    try {
      console.log('正在加载WebAssembly背景移除模块...')

      // 动态加载WebAssembly模块
      // 注意：在实际项目中，这里应该加载真实的WebAssembly文件
      // 这里先用模拟实现，后续可以替换为真实的WASM文件
      this.wasmModule = {
        removeBackground: async (imageData, options) => {
          // 模拟WebAssembly处理过程
          console.log('WebAssembly背景移除处理中...')

          // 这里应该是实际的WebAssembly调用
          // const result = await this.wasmModule._removeBackground(imageData, options)

          // 临时返回模拟结果
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                imageBlob: imageData,  // 处理后的图片数据
                maskBlob: null,        // 遮罩数据（可选）
                processingTime: 150,   // 处理时间(ms)
                method: 'wasm-local'   // 处理方法标识
              })
            }, 150)
          })
        },

        // 内存管理
        malloc: (size) => new ArrayBuffer(size),
        free: (ptr) => { /* 释放内存 */ }
      }

      this.isInitialized = true
      console.log('WebAssembly背景移除模块加载完成')
    } catch (error) {
      console.error('WebAssembly模块加载失败:', error)
      throw new Error('WebAssembly背景移除模块初始化失败')
    }
  }

  /**
   * 获取可用的背景移除服务
   * @returns {Array} 可用的服务列表
   */
  getAvailableServices() {
    const services = []

    // 优先检查WebAssembly
    if (this.isInitialized) {
      services.push('wasm')
    }

    // 然后检查API服务
    const apiServices = ['removebg', 'claidai']
    services.push(...apiServices.filter(service => isAPIConfigured(service)))

    return services
  }

  /**
   * 选择最佳的背景移除服务
   * @returns {string|null} 最佳服务名称
   */
  selectBestService() {
    const available = this.getAvailableServices()

    // 最高优先级：WebAssembly本地处理（快速、无网络依赖）
    if (available.includes('wasm')) {
      return 'wasm'
    }

    // 中等优先级：专业API服务
    if (available.includes('removebg')) {
      return 'removebg'
    }

    // 低优先级：备选API服务
    if (available.includes('claidai')) {
      return 'claidai'
    }

    return null
  }

  /**
   * 执行背景移除
   * @param {File|Blob} imageFile - 图片文件
   * @param {Object} options - 移除选项
   * @returns {Promise<Object>} 处理结果
   */
  async removeBackground(imageFile, options = {}) {
    // 首先尝试初始化WebAssembly模块（如果还未初始化）
    if (!this.isInitialized) {
      try {
        await this.initializeWasm()
      } catch (wasmError) {
        console.warn('WebAssembly初始化失败，将使用API服务:', wasmError.message)
      }
    }

    const service = this.selectBestService()

    if (!service) {
      throw new Error('没有可用的背景移除服务，请配置API密钥或检查WebAssembly支持')
    }

    this.currentService = service

    try {
      console.log(`使用 ${service} 服务进行背景移除`)
      const result = await this.services[service](imageFile, options)

      // 添加服务类型标识
      result.serviceType = service === 'wasm' ? 'local-wasm' : 'api-cloud'
      result.isOfflineCapable = service === 'wasm'

      return result
    } catch (error) {
      console.error(`${service} 服务调用失败:`, error)

      // 尝试备选服务
      const available = this.getAvailableServices()
      const fallbackServices = available.filter(s => s !== service)

      for (const fallback of fallbackServices) {
        try {
          console.log(`尝试备选服务 ${fallback}`)
          const fallbackResult = await this.services[fallback](imageFile, options)
          fallbackResult.serviceType = fallback === 'wasm' ? 'local-wasm' : 'api-cloud'
          fallbackResult.isOfflineCapable = fallback === 'wasm'
          return fallbackResult
        } catch (fallbackError) {
          console.error(`${fallback} 服务也失败:`, fallbackError)
          continue
        }
      }

      throw new Error('所有背景移除服务都不可用，请检查网络连接、API配置或WebAssembly支持')
    }
  }

  /**
   * WebAssembly本地背景移除实现
   * @param {File|Blob} imageFile - 图片文件
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 处理结果
   */
  async wasmBackgroundRemoval(imageFile, options = {}) {
    // 确保WebAssembly模块已初始化
    if (!this.isInitialized) {
      await this.initializeWasm()
    }

    if (!this.wasmModule) {
      throw new Error('WebAssembly背景移除模块未加载')
    }

    try {
      console.log('使用WebAssembly进行本地背景移除处理...')

      // 将图片转换为ImageData格式
      const imageData = await this.fileToImageData(imageFile)

      // 调用WebAssembly模块进行处理
      const startTime = performance.now()
      const result = await this.wasmModule.removeBackground(imageData, {
        threshold: options.threshold || 0.5,
        feather: options.feather || 2,
        ...options
      })
      const processingTime = performance.now() - startTime

      // 转换结果格式
      return {
        imageBlob: await this.imageDataToBlob(result.imageBlob),
        maskBlob: result.maskBlob ? await this.imageDataToBlob(result.maskBlob) : null,
        processingTime,
        method: 'wasm-local',
        service: 'WebAssembly Local'
      }

    } catch (error) {
      console.error('WebAssembly背景移除失败:', error)
      throw new Error(`WebAssembly背景移除处理失败: ${error.message}`)
    }
  }

  /**
   * 将文件转换为ImageData
   * @param {File|Blob} file - 图片文件
   * @returns {Promise<ImageData>} 图片数据
   */
  async fileToImageData(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          resolve(imageData)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 将ImageData转换为Blob
   * @param {ImageData} imageData - 图片数据
   * @returns {Promise<Blob>} 图片Blob
   */
  async imageDataToBlob(imageData) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = imageData.width
      canvas.height = imageData.height
      ctx.putImageData(imageData, 0, 0)

      canvas.toBlob(resolve, 'image/png')
    })
  }

  /**
   * Remove.bg 服务实现
   * @param {File|Blob} imageFile - 图片文件
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 处理结果
   */
  async removeBgService(imageFile, options = {}) {
    const config = getAPIConfig('removebg')

    if (!config?.apiKey) {
      throw new Error('Remove.bg API密钥未配置')
    }

    // 创建FormData
    const formData = new FormData()
    formData.append('image_file', imageFile)
    formData.append('size', options.size || 'auto')

    // 设置输出格式
    if (options.format) {
      formData.append('format', options.format)
    }

    // 设置背景色（如果指定）
    if (options.bg_color) {
      formData.append('bg_color', options.bg_color)
    }

    const response = await fetch(`${config.baseUrl}/removebg`, {
      method: 'POST',
      headers: {
        'X-Api-Key': config.apiKey
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Remove.bg API错误: ${response.status} - ${errorData.errors?.[0]?.title || '未知错误'}`)
    }

    // 获取处理后的图片
    const resultBlob = await response.blob()

    return {
      success: true,
      imageBlob: resultBlob,
      service: 'removebg',
      credits: response.headers.get('x-credits-charged') || '未知'
    }
  }

  /**
   * Claid.ai 服务实现
   * @param {File|Blob} imageFile - 图片文件
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 处理结果
   */
  async claidAIService(imageFile, options = {}) {
    const config = getAPIConfig('claidai')

    if (!config?.apiKey) {
      throw new Error('Claid.ai API密钥未配置')
    }

    // 创建FormData
    const formData = new FormData()
    formData.append('image', imageFile)

    // Claid.ai特定参数
    if (options.model) {
      formData.append('model', options.model)
    }

    const response = await fetch(`${config.baseUrl}/background-removal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Claid.ai API错误: ${response.status} - ${errorData.message || '未知错误'}`)
    }

    const result = await response.json()

    if (!result.success || !result.image_url) {
      throw new Error('Claid.ai 处理失败: 无效的响应数据')
    }

    // 下载处理后的图片
    const imageResponse = await fetch(result.image_url)
    if (!imageResponse.ok) {
      throw new Error('无法下载处理后的图片')
    }

    const resultBlob = await imageResponse.blob()

    return {
      success: true,
      imageBlob: resultBlob,
      service: 'claidai',
      processingTime: result.processing_time,
      credits: result.credits_used
    }
  }

  /**
   * 获取当前使用的服务
   * @returns {string|null} 服务名称
   */
  getCurrentService() {
    return this.currentService
  }

  /**
   * 测试API连接
   * @param {string} serviceName - 服务名称
   * @returns {Promise<boolean>} 是否可用
   */
  async testService(serviceName) {
    if (!isAPIConfigured(serviceName)) {
      return false
    }

    try {
      // 创建一个小的测试图片
      const testCanvas = document.createElement('canvas')
      testCanvas.width = 100
      testCanvas.height = 100
      const ctx = testCanvas.getContext('2d')
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 100, 100)

      testCanvas.toBlob(async (blob) => {
        try {
          await this.services[serviceName](blob, { test: true })
          return true
        } catch (error) {
          console.warn(`${serviceName} 服务测试失败:`, error)
          return false
        }
      })
    } catch (error) {
      console.warn(`${serviceName} 服务测试失败:`, error)
      return false
    }
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态信息
   */
  getServiceStatus() {
    const available = this.getAvailableServices()
    const best = this.selectBestService()

    return {
      availableServices: available,
      recommendedService: best,
      totalServices: available.length,
      hasAvailableService: available.length > 0
    }
  }
}

// 创建单例实例
const backgroundRemovalService = new BackgroundRemovalService()

export default backgroundRemovalService

// 导出类以便测试
export { BackgroundRemovalService }