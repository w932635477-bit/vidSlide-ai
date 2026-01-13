/**
 * TemplateRenderer - 模板渲染器管理器
 *
 * 统一管理WebGL和Canvas 2D渲染器，自动选择最佳渲染方案
 */

import WebGLRenderer from './WebGLRenderer.js'
import Canvas2DRenderer from './Canvas2DRenderer.js'

class TemplateRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.webglRenderer = null
    this.canvasRenderer = null
    this.currentRenderer = null
    this.isInitialized = false
    this.preferredRenderer = 'auto' // 'webgl', 'canvas2d', 'auto'
  }

  /**
   * 初始化渲染器管理器
   */
  async initialize() {
    if (this.isInitialized) return

    // 检查WebGL支持
    const webglSupported = this.checkWebGLSupport()

    if (webglSupported && (this.preferredRenderer === 'auto' || this.preferredRenderer === 'webgl')) {
      try {
        this.webglRenderer = new WebGLRenderer(this.canvas)
        await this.webglRenderer.initialize()
        this.currentRenderer = this.webglRenderer
        console.log('使用WebGL渲染器')
      } catch (error) {
        console.warn('WebGL初始化失败，降级到Canvas 2D:', error.message)
        this.webglRenderer = null
      }
    }

    // 如果WebGL不可用或失败，使用Canvas 2D
    if (!this.currentRenderer) {
      this.canvasRenderer = new Canvas2DRenderer(this.canvas)
      this.canvasRenderer.initialize()
      this.currentRenderer = this.canvasRenderer
      console.log('使用Canvas 2D渲染器')
    }

    this.isInitialized = true
  }

  /**
   * 检查WebGL支持
   * @returns {boolean} 是否支持WebGL
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          console.log('WebGL渲染器:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        }
        return true
      }
    } catch (error) {
      console.log('WebGL检测失败:', error.message)
    }
    return false
  }

  /**
   * 渲染模板
   * @param {Object} template - 模板定义
   * @param {Object} data - 渲染数据
   * @param {Object} options - 渲染选项
   * @returns {Promise<Object>} 渲染结果
   */
  async renderTemplate(template, data, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.currentRenderer) {
      throw new Error('没有可用的渲染器')
    }

    try {
      const result = await this.currentRenderer.renderTemplate(template, data, options)

      // 添加渲染器信息
      result.rendererInfo = this.getRendererInfo()

      return result

    } catch (error) {
      console.error('模板渲染失败:', error)

      // 如果当前渲染器失败，尝试切换到备选渲染器
      if (this.currentRenderer === this.webglRenderer && this.canvasRenderer) {
        console.log('WebGL渲染失败，切换到Canvas 2D')
        this.currentRenderer = this.canvasRenderer
        return await this.canvasRenderer.renderTemplate(template, data, options)
      }

      throw error
    }
  }

  /**
   * 切换渲染器
   * @param {string} rendererType - 渲染器类型 ('webgl' 或 'canvas2d')
   */
  async switchRenderer(rendererType) {
    if (rendererType === 'webgl' && this.webglRenderer) {
      this.currentRenderer = this.webglRenderer
    } else if (rendererType === 'canvas2d' && this.canvasRenderer) {
      this.currentRenderer = this.canvasRenderer
    } else if (rendererType === 'webgl' && !this.webglRenderer) {
      // 尝试初始化WebGL
      try {
        this.webglRenderer = new WebGLRenderer(this.canvas)
        await this.webglRenderer.initialize()
        this.currentRenderer = this.webglRenderer
      } catch (error) {
        console.warn('无法切换到WebGL渲染器:', error.message)
        return false
      }
    }

    return true
  }

  /**
   * 获取渲染器信息
   * @returns {Object} 渲染器信息
   */
  getRendererInfo() {
    if (!this.currentRenderer) return null

    const stats = this.currentRenderer.getPerformanceStats()
    return {
      type: this.currentRenderer.constructor.name,
      isWebGL: stats.isWebGL,
      fps: stats.fps,
      maxTextureSize: stats.maxTextureSize,
      supportedExtensions: stats.supportedExtensions,
      supportedFeatures: stats.supportedFeatures
    }
  }

  /**
   * 截图
   * @param {Object} options - 截图选项
   * @returns {Promise<string>} Base64图片数据
   */
  async takeScreenshot(options = {}) {
    if (!this.currentRenderer) {
      throw new Error('没有可用的渲染器')
    }

    return await this.currentRenderer.takeScreenshot(options)
  }

  /**
   * 添加动画
   * @param {string} id - 动画ID
   * @param {Object} animation - 动画定义
   */
  addAnimation(id, animation) {
    if (this.currentRenderer && typeof this.currentRenderer.addAnimation === 'function') {
      this.currentRenderer.addAnimation(id, animation)
    }
  }

  /**
   * 移除动画
   * @param {string} id - 动画ID
   */
  removeAnimation(id) {
    if (this.currentRenderer && typeof this.currentRenderer.removeAnimation === 'function') {
      this.currentRenderer.removeAnimation(id)
    }
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能数据
   */
  getPerformanceStats() {
    if (!this.currentRenderer) return null

    const stats = this.currentRenderer.getPerformanceStats()
    return {
      ...stats,
      rendererType: this.currentRenderer.constructor.name,
      rendererSwitched: this.webglRenderer && this.canvasRenderer,
      webglAvailable: !!this.webglRenderer,
      canvas2dAvailable: !!this.canvasRenderer
    }
  }

  /**
   * 设置偏好渲染器
   * @param {string} preference - 偏好 ('auto', 'webgl', 'canvas2d')
   */
  setPreferredRenderer(preference) {
    this.preferredRenderer = preference

    // 如果需要，重新初始化
    if (preference !== 'auto') {
      this.initialize()
    }
  }

  /**
   * 检查渲染器健康状态
   * @returns {Object} 健康状态
   */
  getHealthStatus() {
    return {
      initialized: this.isInitialized,
      currentRenderer: this.currentRenderer ? this.currentRenderer.constructor.name : null,
      webglSupported: this.checkWebGLSupport(),
      webglInitialized: !!this.webglRenderer,
      canvas2dInitialized: !!this.canvasRenderer,
      preferredRenderer: this.preferredRenderer
    }
  }

  /**
   * 优化渲染设置
   * @param {Object} options - 优化选项
   */
  optimizeRendering(options = {}) {
    const { powerPreference = 'default', pixelRatio = window.devicePixelRatio || 1 } = options

    // 设置Canvas像素密度
    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      const rect = this.canvas.getBoundingClientRect()
      this.canvas.width = rect.width * pixelRatio
      this.canvas.height = rect.height * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)
    }

    // WebGL特定优化
    if (this.webglRenderer) {
      // 可以在这里添加WebGL特定的优化设置
    }

    console.log('渲染器已优化:', { pixelRatio, powerPreference })
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.webglRenderer) {
      this.webglRenderer.cleanup()
      this.webglRenderer = null
    }

    if (this.canvasRenderer) {
      this.canvasRenderer.cleanup()
      this.canvasRenderer = null
    }

    this.currentRenderer = null
    this.isInitialized = false

    console.log('模板渲染器管理器已清理')
  }
}

export default TemplateRenderer