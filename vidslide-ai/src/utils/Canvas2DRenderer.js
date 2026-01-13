/**
 * Canvas2DRenderer - Canvas 2D降级渲染器
 *
 * 当WebGL不可用时使用的Canvas 2D渲染器，提供模板渲染功能
 */

class Canvas2DRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.templates = new Map()
    this.animations = new Map()
    this.isInitialized = false
    this.animationFrameId = null
    this.isRendering = false
    this.lastFrameTime = 0
    this.frameCount = 0
    this.fps = 0
  }

  /**
   * 初始化渲染器
   */
  initialize() {
    if (this.isInitialized) return

    // 设置Canvas属性
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    // 设置渲染循环
    this.setupRenderLoop()

    this.isInitialized = true
    console.log('Canvas 2D降级渲染器已初始化')
  }

  /**
   * 设置渲染循环
   */
  setupRenderLoop() {
    // 与WebGL渲染器保持一致的接口
  }

  /**
   * 渲染模板
   * @param {Object} template - 模板定义
   * @param {Object} data - 渲染数据
   * @param {Object} options - 渲染选项
   */
  async renderTemplate(template, data, options = {}) {
    this.initialize()

    console.log('使用Canvas 2D渲染模板:', template.id)

    try {
      // 设置Canvas尺寸
      this.canvas.width = options.width || 1920
      this.canvas.height = options.height || 1080

      // 清除画布
      this.clear()

      // 渲染模板层级
      await this.renderTemplateLayers(template, data)

      return {
        success: true,
        renderer: 'canvas2d',
        fps: () => this.fps,
        stop: () => this.stopRenderLoop()
      }

    } catch (error) {
      console.error('Canvas 2D模板渲染失败:', error)
      throw new Error(`Canvas 2D渲染失败: ${error.message}`)
    }
  }

  /**
   * 渲染模板层级
   * @param {Object} template - 模板定义
   * @param {Object} data - 数据
   */
  async renderTemplateLayers(template, data) {
    // 按z-index排序所有层级
    const allLayers = []
    for (const layerType of Object.keys(template.layers)) {
      for (const layer of template.layers[layerType]) {
        allLayers.push(layer)
      }
    }

    allLayers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    // 逐层渲染
    for (const layer of allLayers) {
      await this.renderLayer(layer, data)
    }
  }

  /**
   * 渲染单个层级
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderLayer(layer, data) {
    const props = layer.properties

    // 保存上下文状态
    this.ctx.save()

    try {
      // 设置变换
      this.applyTransform(props)

      // 根据层类型渲染
      switch (layer.type) {
        case 'fixed':
          await this.renderFixedLayer(layer, data)
          break
        case 'dynamic':
          await this.renderDynamicLayer(layer, data)
          break
        case 'adjustable':
          await this.renderAdjustableLayer(layer, data)
          break
      }

      // 应用动画效果
      if (props.animation) {
        this.applyAnimation(layer, props.animation)
      }

    } finally {
      // 恢复上下文状态
      this.ctx.restore()
    }
  }

  /**
   * 渲染固定层
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderFixedLayer(layer, data) {
    const props = layer.properties

    // 设置位置和大小
    const bounds = this.calculateBounds(props)

    // 渲染背景
    if (props.backgroundColor) {
      this.ctx.fillStyle = props.backgroundColor
      this.fillRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, props.borderRadius || 0)
    }

    // 渲染边框
    if (props.border) {
      this.ctx.strokeStyle = props.border.color || '#000000'
      this.ctx.lineWidth = props.border.width || 1
      this.strokeRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, props.borderRadius || 0)
    }

    // 渲染背景图片
    if (props.backgroundImage) {
      await this.renderImage(props.backgroundImage, bounds)
    }

    // 渲染文字内容
    if (props.text) {
      this.renderText(props.text, bounds, props)
    }
  }

  /**
   * 渲染动态层
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderDynamicLayer(layer, data) {
    const props = layer.properties

    // 根据数据源渲染内容
    switch (layer.source) {
      case 'ai-analysis':
        await this.renderAIAnalysis(layer, data)
        break
      case 'keyword-analysis':
        await this.renderKeywordAnalysis(layer, data)
        break
      case 'face-detection':
        await this.renderFaceDetection(layer, data)
        break
      default:
        // 默认渲染固定层
        await this.renderFixedLayer(layer, data)
    }
  }

  /**
   * 渲染可调整层
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderAdjustableLayer(layer, data) {
    // 可调整层与固定层渲染类似，但允许动态调整
    await this.renderFixedLayer(layer, data)
  }

  /**
   * 渲染AI分析内容
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderAIAnalysis(layer, data) {
    const props = layer.properties

    if (props.content && data.aiAnalysis) {
      // 渲染AI生成的内容
      const bounds = this.calculateBounds(props)

      if (typeof props.content === 'string') {
        this.renderText(data.aiAnalysis[props.content] || props.content, bounds, props)
      }
    }
  }

  /**
   * 渲染关键词分析
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderKeywordAnalysis(layer, data) {
    const props = layer.properties

    if (data.keywords && data.keywords.length > 0) {
      const bounds = this.calculateBounds(props)

      // 渲染关键词
      const keyword = data.keywords[0] // 暂时取第一个关键词
      const keywordText = typeof keyword === 'string' ? keyword : keyword.text

      this.renderText(keywordText, bounds, {
        ...props,
        fontSize: props.fontSize || 24,
        fontWeight: 'bold',
        color: props.color || '#FFD700'
      })
    }
  }

  /**
   * 渲染人脸检测结果
   * @param {Object} layer - 层定义
   * @param {Object} data - 数据
   */
  async renderFaceDetection(layer, data) {
    // 人脸检测相关的渲染逻辑
    // 这里可以绘制人脸框或应用特效
  }

  /**
   * 计算边界
   * @param {Object} props - 属性
   * @returns {Object} 边界对象
   */
  calculateBounds(props) {
    let x = 0, y = 0, width = 100, height = 100

    // 根据位置计算坐标
    if (props.position) {
      if (props.position === 'fullscreen') {
        x = 0
        y = 0
        width = this.canvas.width
        height = this.canvas.height
      } else if (props.position === 'center') {
        x = (this.canvas.width - (props.size?.width || 100)) / 2
        y = (this.canvas.height - (props.size?.height || 100)) / 2
        width = props.size?.width || 100
        height = props.size?.height || 100
      } else if (typeof props.position === 'object') {
        // 处理相对位置
        const ref = props.position
        x = ref.x || 0
        y = ref.y || 0
        width = props.size?.width || 100
        height = props.size?.height || 100

        // 处理偏移量
        if (ref.offsetX) x += ref.offsetX
        if (ref.offsetY) y += ref.offsetY
      }
    }

    if (props.size) {
      width = props.size.width || width
      height = props.size.height || height
    }

    return { x, y, width, height }
  }

  /**
   * 应用变换
   * @param {Object} props - 属性
   */
  applyTransform(props) {
    if (props.position) {
      const bounds = this.calculateBounds(props)

      // 移动到正确位置
      this.ctx.translate(bounds.x, bounds.y)

      // 应用旋转
      if (props.rotation) {
        const centerX = bounds.width / 2
        const centerY = bounds.height / 2
        this.ctx.translate(centerX, centerY)
        this.ctx.rotate((props.rotation * Math.PI) / 180)
        this.ctx.translate(-centerX, -centerY)
      }

      // 应用缩放
      if (props.scale) {
        const scaleX = props.scale.x || props.scale
        const scaleY = props.scale.y || props.scale
        this.ctx.scale(scaleX, scaleY)
      }
    }
  }

  /**
   * 渲染图片
   * @param {string} src - 图片源
   * @param {Object} bounds - 边界
   */
  async renderImage(src, bounds) {
    try {
      const img = await this.loadImage(src)
      this.ctx.drawImage(img, 0, 0, bounds.width, bounds.height)
    } catch (error) {
      console.warn('图片加载失败:', error)
    }
  }

  /**
   * 渲染文字
   * @param {string} text - 文字内容
   * @param {Object} bounds - 边界
   * @param {Object} props - 属性
   */
  renderText(text, bounds, props) {
    this.ctx.fillStyle = props.color || '#000000'
    this.ctx.font = `${props.fontWeight || 'normal'} ${props.fontSize || 16}px ${props.fontFamily || 'Arial'}`
    this.ctx.textAlign = props.textAlign || 'left'
    this.ctx.textBaseline = 'middle'

    const x = props.textAlign === 'center' ? bounds.width / 2 : 10
    const y = bounds.height / 2

    // 应用阴影
    if (props.shadow) {
      this.ctx.shadowColor = props.shadow.color || '#000000'
      this.ctx.shadowBlur = props.shadow.blur || 2
      this.ctx.shadowOffsetX = props.shadow.offsetX || 1
      this.ctx.shadowOffsetY = props.shadow.offsetY || 1
    }

    this.ctx.fillText(text, x, y)
  }

  /**
   * 填充圆角矩形
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
  fillRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
    this.ctx.fill()
  }

  /**
   * 描边圆角矩形
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
  strokeRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
    this.ctx.stroke()
  }

  /**
   * 应用动画效果
   * @param {Object} layer - 层定义
   * @param {Object} animation - 动画定义
   */
  applyAnimation(layer, animation) {
    // Canvas 2D动画实现（简化版）
    const currentTime = performance.now()
    const elapsed = currentTime - (animation.startTime || currentTime)

    switch (animation.type) {
      case 'fade-in':
        const opacity = Math.min(elapsed / (animation.duration || 300), 1)
        this.ctx.globalAlpha = opacity
        break

      case 'slide-up':
        const offset = animation.offset || 10
        const slideProgress = Math.min(elapsed / (animation.duration || 300), 1)
        this.ctx.translate(0, offset * (1 - slideProgress))
        break

      case 'scale-in':
        const scaleProgress = Math.min(elapsed / (animation.duration || 300), 1)
        const fromScale = animation.from?.scale || 0.9
        const toScale = animation.to?.scale || 1.0
        const currentScale = fromScale + (toScale - fromScale) * scaleProgress
        this.ctx.scale(currentScale, currentScale)
        break
    }
  }

  /**
   * 加载图片
   * @param {string} src - 图片源
   * @returns {Promise<HTMLImageElement>} 图片元素
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }

  /**
   * 清除画布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 开始渲染循环
   */
  startRenderLoop() {
    if (this.isRendering) return
    this.isRendering = true
    this.render()
  }

  /**
   * 停止渲染循环
   */
  stopRenderLoop() {
    this.isRendering = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 渲染循环
   */
  render = () => {
    if (!this.isRendering) return

    // 更新FPS计算
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime

    this.frameCount++
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastFrameTime = currentTime
    }

    // 继续循环（用于动画更新）
    this.animationFrameId = requestAnimationFrame(this.render)
  }

  /**
   * 截图
   * @param {Object} options - 截图选项
   * @returns {Promise<string>} Base64图片数据
   */
  async takeScreenshot(options = {}) {
    const { format = 'png', quality = 0.9 } = options

    return new Promise(resolve => {
      this.canvas.toBlob(blob => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      }, `image/${format}`, quality)
    })
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能数据
   */
  getPerformanceStats() {
    return {
      fps: this.fps,
      isWebGL: false,
      renderer: 'Canvas 2D',
      maxTextureSize: null,
      supportedFeatures: ['images', 'text', 'animations', 'transforms']
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopRenderLoop()
    this.templates.clear()
    this.animations.clear()
    this.isInitialized = false

    console.log('Canvas 2D渲染器已清理')
  }
}

export default Canvas2DRenderer