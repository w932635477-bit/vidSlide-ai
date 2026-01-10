/**
 * VidSlide AI - 画中画渲染器
 * 负责实际的画中画内容渲染和视觉效果
 */

export class PipRenderer {
  constructor(canvas, videoElement) {
    this.canvas = canvas
    this.videoElement = videoElement
    this.ctx = canvas.getContext('2d')
    this.isRendering = false
    this.animationFrame = null

    // 检查Canvas上下文是否可用
    if (!this.ctx) {
      throw new Error('Canvas不支持2D上下文，无法初始化画中画渲染器')
    }

    // 画中画配置
    this.pipConfig = {
      position: 'bottom-right',
      size: 25, // 默认25%的画布大小
      style: 'rounded',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.8)',
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      overlayOpacity: 0.4
    }

    // 性能监控
    this.performanceStats = {
      renderTime: 0,
      fps: 60,
      frameCount: 0,
      lastFrameTime: 0
    }
  }

  /**
   * 开始渲染画中画
   * @param {Object} config - 画中画配置
   */
  /**

   * startRendering 方法

   * VidSlide AI 功能实现

   */

  startRendering(config = {}) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.isRendering) {
      this.stopRendering()
    }

    // 更新配置
    Object.assign(this.pipConfig, config)

    this.isRendering = true
    this.performanceStats.lastFrameTime = performance.now()
    this.performanceStats.frameCount = 0

    this.renderLoop()
  }

  /**
   * 停止渲染画中画
   */
  /**

   * stopRendering 方法

   * VidSlide AI 功能实现

   */

  stopRendering() {
    this.isRendering = false
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  /**
   * 渲染循环
   */
  renderLoop = () => {
    if (!this.isRendering) return

    const startTime = performance.now()

    try {
      this.renderFrame()
      this.updatePerformanceStats(startTime)
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error('画中画渲染错误:', error)
    }

    this.animationFrame = requestAnimationFrame(this.renderLoop)
  }

  /**
   * 渲染单帧
   */
  /**

   * renderFrame 方法

   * VidSlide AI 功能实现

   */

  renderFrame() {
    const {
      x,
      y,
      width,
      height,
      borderRadius,
      borderWidth,
      borderColor,
      shadowBlur,
      shadowColor,
      overlayOpacity
    } = this.pipConfig

    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制背景遮罩
    this.drawOverlay(overlayOpacity)

    // 保存上下文用于阴影
    this.ctx.save()

    // 设置阴影
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (shadowBlur > 0) {
      this.ctx.shadowBlur = shadowBlur
      this.ctx.shadowColor = shadowColor
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
    }

    // 绘制画中画容器
    this.drawPipContainer(x, y, width, height, borderRadius, borderColor, borderWidth)

    // 绘制视频内容
    this.drawVideoContent(
      x + borderWidth,
      y + borderWidth,
      width - 2 * borderWidth,
      height - 2 * borderWidth,
      borderRadius - borderWidth
    )

    // 恢复上下文
    this.ctx.restore()
  }

  /**
   * 绘制背景遮罩
   * @param {number} opacity - 遮罩透明度
   */
  /**

   * drawOverlay 方法

   * VidSlide AI 功能实现

   */

  drawOverlay(opacity) {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 绘制画中画容器
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} borderRadius - 圆角半径
   * @param {string} borderColor - 边框颜色
   * @param {number} borderWidth - 边框宽度
   */
  /**

   * drawPipContainer 方法

   * VidSlide AI 功能实现

   */

  drawPipContainer(x, y, width, height, borderRadius, borderColor, borderWidth) {
    this.ctx.fillStyle = borderColor

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (borderRadius > 0) {
      this.drawRoundedRect(x, y, width, height, borderRadius)
    } else {
      this.ctx.fillRect(x, y, width, height)
    }
  }

  /**
   * 绘制视频内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} borderRadius - 圆角半径
   */
  /**

   * drawVideoContent 方法

   * VidSlide AI 功能实现

   */

  drawVideoContent(x, y, width, height, borderRadius) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (!this.videoElement || this.videoElement.readyState < 2) {
      // 视频未准备好，绘制占位符
      this.drawPlaceholder(x, y, width, height, borderRadius)
      return
    }

    this.ctx.save()

    // 创建圆角裁剪路径
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (borderRadius > 0) {
      this.createRoundedClip(x, y, width, height, borderRadius)
    }

    // 绘制视频帧
    try {
      this.ctx.drawImage(this.videoElement, x, y, width, height)
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.warn('绘制视频帧失败:', error)
      this.drawPlaceholder(x, y, width, height, borderRadius)
    }

    this.ctx.restore()
  }

  /**
   * 绘制占位符内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} borderRadius - 圆角半径
   */
  /**

   * drawPlaceholder 方法

   * VidSlide AI 功能实现

   */

  drawPlaceholder(x, y, width, height, borderRadius) {
    this.ctx.save()

    // 设置填充样式
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'

    // 绘制圆角矩形
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (borderRadius > 0) {
      this.drawRoundedRect(x, y, width, height, borderRadius)
    } else {
      this.ctx.fillRect(x, y, width, height)
    }

    // 绘制占位符文字
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.font = '14px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('画中画内容', x + width / 2, y + height / 2)

    this.ctx.restore()
  }

  /**
   * 绘制圆角矩形
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
  /**

   * drawRoundedRect 方法

   * VidSlide AI 功能实现

   */

  drawRoundedRect(x, y, width, height, radius) {
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
   * 创建圆角裁剪路径
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
  /**

   * createRoundedClip 方法

   * VidSlide AI 功能实现

   */

  createRoundedClip(x, y, width, height, radius) {
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
    this.ctx.clip()
  }

  /**
   * 更新性能统计
   * @param {number} startTime - 开始时间
   */
  /**

   * updatePerformanceStats 方法

   * VidSlide AI 功能实现

   */

  updatePerformanceStats(startTime) {
    const currentTime = performance.now()
    const renderTime = currentTime - startTime

    this.performanceStats.renderTime = renderTime
    this.performanceStats.frameCount++

    // 计算FPS
    const timeDiff = currentTime - this.performanceStats.lastFrameTime
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (timeDiff >= 1000) {
      this.performanceStats.fps = Math.round((this.performanceStats.frameCount * 1000) / timeDiff)
      this.performanceStats.frameCount = 0
      this.performanceStats.lastFrameTime = currentTime
    }
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能统计数据
   */
  /**

   * getPerformanceStats 方法

   * VidSlide AI 功能实现

   */

  getPerformanceStats() {
    return { ...this.performanceStats }
  }

  /**
   * 更新画中画配置
   * @param {Object} config - 新配置
   */
  /**

   * updateConfig 方法

   * VidSlide AI 功能实现

   */

  updateConfig(config) {
    Object.assign(this.pipConfig, config)

    // 如果正在渲染，需要重新计算位置和大小
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (this.isRendering) {
      this.calculatePipPosition()
    }
  }

  /**
   * 计算画中画位置
   */
  /**

   * calculatePipPosition 方法

   * VidSlide AI 功能实现

   */

  calculatePipPosition() {
    const { position, size } = this.pipConfig
    const canvasWidth = this.canvas.width
    const canvasHeight = this.canvas.height

    // 计算画中画尺寸
    const pipSize = Math.min(canvasWidth, canvasHeight) * (size / 100)
    this.pipConfig.width = pipSize
    this.pipConfig.height = pipSize

    // 计算位置
    const margin = 20
    /**

     * switch 方法

     * VidSlide AI 功能实现

     */

    switch (position) {
    case 'top-left':
      this.pipConfig.x = margin
      this.pipConfig.y = margin
      break
    case 'top-right':
      this.pipConfig.x = canvasWidth - pipSize - margin
      this.pipConfig.y = margin
      break
    case 'bottom-left':
      this.pipConfig.x = margin
      this.pipConfig.y = canvasHeight - pipSize - margin
      break
    case 'bottom-right':
    default:
      this.pipConfig.x = canvasWidth - pipSize - margin
      this.pipConfig.y = canvasHeight - pipSize - margin
      break
    }

    // 根据样式设置圆角
    /**

     * switch 方法

     * VidSlide AI 功能实现

     */

    switch (this.pipConfig.style) {
    case 'circle':
      this.pipConfig.borderRadius = pipSize / 2
      break
    case 'rounded':
      this.pipConfig.borderRadius = Math.min(pipSize * 0.2, 20)
      break
    case 'square':
    default:
      this.pipConfig.borderRadius = 0
      break
    }
  }

  /**
   * 设置画中画位置
   * @param {string} position - 位置标识
   */
  /**

   * setPosition 方法

   * VidSlide AI 功能实现

   */

  setPosition(position) {
    this.pipConfig.position = position
    this.calculatePipPosition()
  }

  /**
   * 设置画中画大小
   * @param {number} size - 大小百分比
   */
  /**

   * setSize 方法

   * VidSlide AI 功能实现

   */

  setSize(size) {
    this.pipConfig.size = Math.max(10, Math.min(50, size))
    this.calculatePipPosition()
  }

  /**
   * 设置画中画样式
   * @param {string} style - 样式类型
   */
  /**

   * setStyle 方法

   * VidSlide AI 功能实现

   */

  setStyle(style) {
    this.pipConfig.style = style
    this.calculatePipPosition()
  }

  /**
   * 销毁渲染器
   */
  /**

   * destroy 方法

   * VidSlide AI 功能实现

   */

  destroy() {
    this.stopRendering()
    this.canvas = null
    this.videoElement = null
    this.ctx = null
  }
}

export default PipRenderer
