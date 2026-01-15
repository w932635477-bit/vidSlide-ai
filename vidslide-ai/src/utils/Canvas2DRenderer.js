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
      this.strokeRoundedRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        props.borderRadius || 0
      )
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
    let x = 0,
      y = 0,
      width = 100,
      height = 100

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
      this.canvas.toBlob(
        blob => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        },
        `image/${format}`,
        quality
      )
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
      supportedFeatures: ['images', 'text', 'animations', 'transforms', 'compositions']
    }
  }

  // ========== 组合渲染支持 ==========

  /**
   * 渲染模板组合序列
   * @param {Object} composition - 组合配置
   * @param {Object} options - 渲染选项
   * @returns {Object} 渲染控制器
   */
  async renderComposition(composition, options = {}) {
    this.initialize()

    const { width = 1080, height = 1920, onSceneChange = null } = options

    this.canvas.width = width
    this.canvas.height = height

    // 组合状态
    this.compositionState = {
      composition,
      currentSceneIndex: 0,
      startTime: performance.now(),
      isPlaying: true,
      onSceneChange
    }

    // 开始组合渲染循环
    this.startCompositionLoop()

    return {
      success: true,
      renderer: 'canvas2d-composition',
      play: () => this.playComposition(),
      pause: () => this.pauseComposition(),
      seekToScene: (index) => this.seekToScene(index),
      getCurrentScene: () => this.getCurrentScene(),
      stop: () => this.stopComposition()
    }
  }

  /**
   * 开始组合渲染循环
   */
  startCompositionLoop() {
    if (this.compositionLoopId) {
      cancelAnimationFrame(this.compositionLoopId)
    }

    const loop = async () => {
      if (!this.compositionState?.isPlaying) {
        this.compositionLoopId = requestAnimationFrame(loop)
        return
      }

      const elapsed = performance.now() - this.compositionState.startTime
      const { composition, currentSceneIndex, onSceneChange } = this.compositionState

      // 计算当前应该显示的场景
      let accumulatedTime = 0
      let targetSceneIndex = 0

      for (let i = 0; i < composition.scenes.length; i++) {
        const sceneDuration = composition.scenes[i].duration
        if (elapsed < accumulatedTime + sceneDuration) {
          targetSceneIndex = i
          break
        }
        accumulatedTime += sceneDuration
        targetSceneIndex = i
      }

      // 检查是否需要切换场景
      if (targetSceneIndex !== currentSceneIndex) {
        this.compositionState.currentSceneIndex = targetSceneIndex

        // 触发场景切换回调
        if (onSceneChange) {
          onSceneChange(targetSceneIndex, composition.scenes[targetSceneIndex])
        }
      }

      // 渲染当前场景
      const currentScene = composition.scenes[targetSceneIndex]
      if (currentScene) {
        const sceneElapsed = elapsed - accumulatedTime
        await this.renderScene(currentScene, sceneElapsed)
      }

      // 检查是否播放完成
      if (elapsed >= composition.totalDuration) {
        // 循环播放或停止
        this.compositionState.startTime = performance.now()
        this.compositionState.currentSceneIndex = 0
      }

      this.compositionLoopId = requestAnimationFrame(loop)
    }

    this.compositionLoopId = requestAnimationFrame(loop)
  }

  /**
   * 渲染单个场景
   * @param {Object} scene - 场景配置
   * @param {number} elapsed - 场景内经过时间
   */
  async renderScene(scene, elapsed) {
    this.clear()

    const { template, content, duration } = scene
    const progress = Math.min(elapsed / duration, 1)

    // 应用场景转场效果
    this.applySceneTransition(scene, progress)

    // 渲染模板
    if (template) {
      await this.renderTemplateWithContent(template, content, elapsed)
    }
  }

  /**
   * 使用内容渲染模板
   * @param {Object} template - 模板定义
   * @param {Object} content - 内容数据
   * @param {number} elapsed - 经过时间
   */
  async renderTemplateWithContent(template, content, elapsed) {
    // 按z-index排序所有层级
    const allLayers = []
    for (const layerType of Object.keys(template.layers)) {
      for (const layer of template.layers[layerType]) {
        allLayers.push({ ...layer, content })
      }
    }

    allLayers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    // 逐层渲染
    for (const layer of allLayers) {
      await this.renderLayerWithContent(layer, content, elapsed)
    }
  }

  /**
   * 渲染带内容的层
   * @param {Object} layer - 层定义
   * @param {Object} content - 内容数据
   * @param {number} elapsed - 经过时间
   */
  async renderLayerWithContent(layer, content, elapsed) {
    const props = layer.properties

    this.ctx.save()

    try {
      // 应用动画
      if (props.animation) {
        const animProgress = Math.min(elapsed / (props.animation.duration || 500), 1)
        this.applyAnimationWithProgress(props.animation, animProgress)
      }

      // 计算边界
      const bounds = this.calculateBounds(props)

      // 渲染背景
      if (props.backgroundColor && props.backgroundColor !== 'transparent') {
        this.ctx.fillStyle = props.backgroundColor
        this.ctx.globalAlpha = props.opacity || 1.0
        this.fillRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, props.borderRadius || 0)
        this.ctx.globalAlpha = 1.0
      }

      // 渲染边框
      if (props.border) {
        this.ctx.strokeStyle = props.border.color || '#FFFFFF'
        this.ctx.lineWidth = props.border.width || 1
        this.strokeRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, props.borderRadius || 0)
      }

      // 渲染文字内容
      await this.renderLayerText(layer, content, bounds, elapsed)

    } finally {
      this.ctx.restore()
    }
  }

  /**
   * 渲染层文字内容
   * @param {Object} layer - 层定义
   * @param {Object} content - 内容数据
   * @param {Object} bounds - 边界
   * @param {number} elapsed - 经过时间
   */
  async renderLayerText(layer, content, bounds, elapsed) {
    const props = layer.properties
    let text = props.text || ''

    // 根据层ID映射内容
    switch (layer.id) {
      case 'main-title':
        text = content.title || text
        break
      case 'subtitle':
        text = content.subtitle || text
        break
      case 'section-title':
        text = content.sectionTitle || text
        break
      case 'hero-number':
        text = content.number || text
        break
      case 'number-label':
        text = content.label || text
        break
      case 'quote-text':
        text = content.quote || text
        break
      case 'quote-author':
        text = content.author ? `— ${content.author}` : ''
        break
      case 'comparison-title':
        text = content.title || '对比分析'
        break
      case 'left-title':
        text = content.leftTitle || '优势'
        break
      case 'right-title':
        text = content.rightTitle || '劣势'
        break
    }

    // 渲染要点列表
    if (layer.id === 'bullet-list' && content.bullets) {
      await this.renderBulletList(content.bullets, bounds, props, elapsed)
      return
    }

    // 渲染左侧要点
    if (layer.id === 'left-points' && content.leftPoints) {
      await this.renderBulletList(content.leftPoints, bounds, props, elapsed)
      return
    }

    // 渲染右侧要点
    if (layer.id === 'right-points' && content.rightPoints) {
      await this.renderBulletList(content.rightPoints, bounds, props, elapsed)
      return
    }

    // 渲染普通文字
    if (text) {
      this.renderText(text, bounds, props)
    }
  }

  /**
   * 渲染要点列表
   * @param {Array} bullets - 要点数组
   * @param {Object} bounds - 边界
   * @param {Object} props - 属性
   * @param {number} elapsed - 经过时间
   */
  async renderBulletList(bullets, bounds, props, elapsed) {
    const itemSpacing = props.itemSpacing || 50
    const bulletColor = props.bulletColor || '#4ECDC4'
    const fontSize = props.fontSize || 24
    const textColor = props.color || '#E0E0E0'

    bullets.forEach((bullet, index) => {
      // 计算动画延迟
      const stagger = props.animation?.stagger || 200
      const itemDelay = index * stagger
      const itemProgress = Math.max(0, Math.min((elapsed - itemDelay) / 300, 1))

      if (itemProgress <= 0) return

      this.ctx.save()
      this.ctx.globalAlpha = itemProgress

      const y = bounds.y + index * itemSpacing

      // 绘制圆点
      this.ctx.fillStyle = bulletColor
      this.ctx.beginPath()
      this.ctx.arc(bounds.x, y + fontSize / 2, 4, 0, Math.PI * 2)
      this.ctx.fill()

      // 绘制文字
      this.ctx.fillStyle = textColor
      this.ctx.font = `${fontSize}px ${props.fontFamily || 'PingFang SC, sans-serif'}`
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(bullet, bounds.x + 20, y + fontSize / 2)

      this.ctx.restore()
    })
  }

  /**
   * 应用带进度的动画
   * @param {Object} animation - 动画配置
   * @param {number} progress - 进度 0-1
   */
  applyAnimationWithProgress(animation, progress) {
    const easeOut = t => 1 - Math.pow(1 - t, 3)
    const easedProgress = easeOut(progress)

    switch (animation.type) {
      case 'fade-in':
        this.ctx.globalAlpha = easedProgress
        break

      case 'slide-up':
        const offset = animation.offset || 30
        this.ctx.translate(0, offset * (1 - easedProgress))
        break

      case 'slide-left':
        const slideOffset = animation.offset || 50
        this.ctx.translate(slideOffset * (1 - easedProgress), 0)
        break

      case 'scale-in':
        const fromScale = animation.from?.scale || 0.8
        const toScale = animation.to?.scale || 1.0
        const currentScale = fromScale + (toScale - fromScale) * easedProgress
        // 从中心缩放
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.ctx.scale(currentScale, currentScale)
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
        break

      case 'bounce-in':
        const bounceScale = 1 + Math.sin(easedProgress * Math.PI) * 0.1
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.ctx.scale(bounceScale, bounceScale)
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
        this.ctx.globalAlpha = easedProgress
        break
    }
  }

  /**
   * 应用场景转场效果
   * @param {Object} scene - 场景
   * @param {number} progress - 场景进度
   */
  applySceneTransition(scene, progress) {
    // 入场动画（前10%时间）
    if (progress < 0.1) {
      const enterProgress = progress / 0.1
      this.ctx.globalAlpha = enterProgress
    }
    // 出场动画（后10%时间）
    else if (progress > 0.9) {
      const exitProgress = (progress - 0.9) / 0.1
      this.ctx.globalAlpha = 1 - exitProgress
    }
  }

  /**
   * 播放组合
   */
  playComposition() {
    if (this.compositionState) {
      this.compositionState.isPlaying = true
    }
  }

  /**
   * 暂停组合
   */
  pauseComposition() {
    if (this.compositionState) {
      this.compositionState.isPlaying = false
    }
  }

  /**
   * 跳转到指定场景
   * @param {number} index - 场景索引
   */
  seekToScene(index) {
    if (!this.compositionState) return

    const { composition } = this.compositionState

    if (index < 0 || index >= composition.scenes.length) return

    // 计算目标时间
    let targetTime = 0
    for (let i = 0; i < index; i++) {
      targetTime += composition.scenes[i].duration
    }

    this.compositionState.startTime = performance.now() - targetTime
    this.compositionState.currentSceneIndex = index
  }

  /**
   * 获取当前场景
   * @returns {Object} 当前场景信息
   */
  getCurrentScene() {
    if (!this.compositionState) return null

    const { composition, currentSceneIndex } = this.compositionState
    return {
      index: currentSceneIndex,
      scene: composition.scenes[currentSceneIndex],
      total: composition.scenes.length
    }
  }

  /**
   * 停止组合渲染
   */
  stopComposition() {
    if (this.compositionLoopId) {
      cancelAnimationFrame(this.compositionLoopId)
      this.compositionLoopId = null
    }
    this.compositionState = null
    this.clear()
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopRenderLoop()
    this.stopComposition()
    this.templates.clear()
    this.animations.clear()
    this.isInitialized = false

    console.log('Canvas 2D渲染器已清理')
  }
}

export default Canvas2DRenderer
