/**
 * VidSlide AI - 视觉效果库
 * 提供模板渲染所需的各种视觉效果和动画
 */

export class VisualEffects {
  constructor(canvas, context) {
    this.canvas = canvas
    this.ctx = context
    this.animations = new Map()
    this.effects = new Map()
  }

  /**
   * 绘制圆角矩形
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @param {string} fillStyle - 填充样式
   * @param {string} strokeStyle - 边框样式
   * @param {number} lineWidth - 边框宽度
   */
  /**

   * drawRoundedRect 方法

   * VidSlide AI 功能实现

   */

  drawRoundedRect(
    x,
    y,
    width,
    height,
    radius,
    fillStyle = null,
    strokeStyle = null,
    lineWidth = 1
  ) {
    this.ctx.save()
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

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  /**
   * 绘制渐变背景
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {Object} gradient - 渐变配置
   */
  /**

   * drawGradientBackground 方法

   * VidSlide AI 功能实现

   */

  drawGradientBackground(x, y, width, height, gradient) {
    this.ctx.save()

    let gradientObj
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if (gradient.type === 'linear') {
      gradientObj = this.ctx.createLinearGradient(
        x + gradient.x0 * width,
        y + gradient.y0 * height,
        x + gradient.x1 * width,
        y + gradient.y1 * height
      )
    } else if (gradient.type === 'radial') {
      /**
       * if 方法
       * VidSlide AI 功能实现
       */
      gradientObj = this.ctx.createRadialGradient(
        x + gradient.x0 * width,
        y + gradient.y0 * height,
        gradient.r0 * Math.min(width, height),
        x + gradient.x1 * width,
        y + gradient.y1 * height,
        gradient.r1 * Math.min(width, height)
      )
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (gradientObj && gradient.colors) {
      gradient.colors.forEach((colorStop, index) => {
        const position = index / (gradient.colors.length - 1)
        gradientObj.addColorStop(position, colorStop)
      })
    }

    this.ctx.fillStyle = gradientObj || gradient.colors[0] || '#000000'
    this.ctx.fillRect(x, y, width, height)

    this.ctx.restore()
  }

  /**
   * 绘制阴影效果
   * @param {Function} drawFunction - 绘制函数
   * @param {Object} shadow - 阴影配置
   */
  /**

   * drawWithShadow 方法

   * VidSlide AI 功能实现

   */

  drawWithShadow(drawFunction, shadow) {
    this.ctx.save()

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (shadow) {
      this.ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.3)'
      this.ctx.shadowBlur = shadow.blur || 10
      this.ctx.shadowOffsetX = shadow.offsetX || 0
      this.ctx.shadowOffsetY = shadow.offsetY || 0
    }

    drawFunction()

    this.ctx.restore()
  }

  /**
   * 绘制文字
   * @param {string} text - 文字内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} style - 文字样式
   */
  /**

   * drawText 方法

   * VidSlide AI 功能实现

   */

  drawText(text, x, y, style = {}) {
    this.ctx.save()

    this.ctx.font = this.buildFontString(style)
    this.ctx.fillStyle = style.color || '#ffffff'
    this.ctx.textAlign = style.textAlign || 'left'
    this.ctx.textBaseline = style.textBaseline || 'top'

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (style.shadow) {
      this.ctx.shadowColor = style.shadow.color || 'rgba(0,0,0,0.5)'
      this.ctx.shadowBlur = style.shadow.blur || 3
      this.ctx.shadowOffsetX = style.shadow.offsetX || 0
      this.ctx.shadowOffsetY = style.shadow.offsetY || 0
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke.color || '#000000'
      this.ctx.lineWidth = style.stroke.width || 1
      this.ctx.strokeText(text, x, y)
    }

    this.ctx.fillText(text, x, y)

    this.ctx.restore()
  }

  /**
   * 绘制多行文字
   * @param {string} text - 文字内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} maxWidth - 最大宽度
   * @param {number} lineHeight - 行高
   * @param {Object} style - 文字样式
   */
  /**

   * drawMultilineText 方法

   * VidSlide AI 功能实现

   */

  drawMultilineText(text, x, y, maxWidth, lineHeight, style = {}) {
    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    // 分行处理
    /**

     * for 方法

     * VidSlide AI 功能实现

     */

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = this.ctx.measureText(testLine)

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // 绘制每一行
    lines.forEach((line, index) => {
      this.drawText(line, x, y + index * lineHeight, style)
    })
  }

  /**
   * 绘制时间线
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {Array} events - 事件数组
   * @param {Object} style - 样式配置
   */
  /**

   * drawTimeline 方法

   * VidSlide AI 功能实现

   */

  drawTimeline(x, y, width, height, events, style = {}) {
    this.ctx.save()

    const lineColor = style.lineColor || '#FFD700'
    const lineWidth = style.lineWidth || 3
    const dotRadius = style.dotRadius || 8

    // 绘制主时间线
    this.ctx.strokeStyle = lineColor
    this.ctx.lineWidth = lineWidth
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + height / 2)
    this.ctx.lineTo(x + width, y + height / 2)
    this.ctx.stroke()

    // 绘制事件点和标签
    const eventSpacing = width / (events.length + 1)
    events.forEach((event, index) => {
      const eventX = x + eventSpacing * (index + 1)
      const eventY = y + height / 2

      // 绘制事件点
      this.ctx.fillStyle = lineColor
      this.ctx.beginPath()
      this.ctx.arc(eventX, eventY, dotRadius, 0, Math.PI * 2)
      this.ctx.fill()

      // 绘制事件标签
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (event.label) {
        this.drawText(event.label, eventX, eventY - dotRadius - 10, {
          ...style.labelStyle,
          textAlign: 'center',
          textBaseline: 'bottom'
        })
      }

      // 绘制年份
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if (event.year) {
        this.drawText(event.year.toString(), eventX, eventY + dotRadius + 10, {
          ...style.yearStyle,
          textAlign: 'center',
          textBaseline: 'top'
        })
      }
    })

    this.ctx.restore()
  }

  /**
   * 绘制分屏分割线
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} height - 高度
   * @param {Object} style - 样式配置
   */
  /**

   * drawSplitScreenDivider 方法

   * VidSlide AI 功能实现

   */

  drawSplitScreenDivider(x, y, height, style = {}) {
    this.ctx.save()

    this.ctx.strokeStyle = style.color || '#ffffff'
    this.ctx.lineWidth = style.width || 2
    this.ctx.setLineDash(style.dash || [10, 5])

    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x, y + height)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制图表
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {Array} data - 图表数据
   * @param {string} type - 图表类型
   * @param {Object} style - 样式配置
   */
  /**

   * drawChart 方法

   * VidSlide AI 功能实现

   */

  drawChart(x, y, width, height, data, type = 'bar', style = {}) {
    this.ctx.save()

    const colors = style.colors || ['#007BFF', '#28A745', '#FFC107', '#DC3545']
    const maxValue = Math.max(...data.map(d => d.value))

    /**


     * if 方法


     * VidSlide AI 功能实现


     */

    if (type === 'bar') {
      const barWidth = (width / data.length) * 0.8
      const barSpacing = (width / data.length) * 0.2

      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * height
        const barX = x + index * (barWidth + barSpacing)
        const barY = y + height - barHeight

        // 绘制柱子
        this.ctx.fillStyle = colors[index % colors.length]
        this.ctx.fillRect(barX, barY, barWidth, barHeight)

        // 绘制数值标签
        this.drawText(item.value.toString(), barX + barWidth / 2, barY - 5, {
          ...style.valueStyle,
          textAlign: 'center',
          textBaseline: 'bottom'
        })

        // 绘制标签
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (item.label) {
          this.drawText(item.label, barX + barWidth / 2, y + height + 5, {
            ...style.labelStyle,
            textAlign: 'center',
            textBaseline: 'top'
          })
        }
      })
    }

    this.ctx.restore()
  }

  /**
   * 构建字体字符串
   * @param {Object} style - 字体样式
   * @returns {string} CSS字体字符串
   */
  /**

   * buildFontString 方法

   * VidSlide AI 功能实现

   */

  buildFontString(style) {
    const fontSize = style.fontSize || 16
    const fontWeight = style.fontWeight || 'normal'
    const fontFamily = style.fontFamily || 'Arial, sans-serif'

    return `${fontWeight} ${fontSize}px ${fontFamily}`
  }

  /**
   * 开始动画
   * @param {string} id - 动画ID
   * @param {Function} animateFunction - 动画函数
   * @param {number} duration - 动画时长(ms)
   * @param {Object} options - 动画选项
   */
  /**

   * startAnimation 方法

   * VidSlide AI 功能实现

   */

  startAnimation(id, animateFunction, duration, options = {}) {
    const startTime = Date.now()
    const easing = options.easing || 'ease-out'

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = this.easeProgress(progress, easing)

      animateFunction(easedProgress)

      /**


       * if 方法


       * VidSlide AI 功能实现


       */

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 动画完成
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (options.onComplete) {
          options.onComplete()
        }
        this.animations.delete(id)
      }
    }

    this.animations.set(id, { animate, startTime, duration })
    animate()
  }

  /**
   * 停止动画
   * @param {string} id - 动画ID
   */
  /**

   * stopAnimation 方法

   * VidSlide AI 功能实现

   */

  stopAnimation(id) {
    if (this.animations.has(id)) {
      this.animations.delete(id)
    }
  }

  /**
   * 缓动函数
   * @param {number} t - 时间进度 (0-1)
   * @param {string} type - 缓动类型
   * @returns {number} 缓动后的进度
   */
  /**

   * easeProgress 方法

   * VidSlide AI 功能实现

   */

  easeProgress(t, type) {
    /**

     * switch 方法

     * VidSlide AI 功能实现

     */

    switch (type) {
    case 'ease-in':
      return t * t
    case 'ease-out':
      return t * (2 - t)
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    case 'linear':
    default:
      return t
    }
  }

  /**
   * 创建脉冲效果
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} radius - 半径
   * @param {Object} style - 样式配置
   */
  /**

   * createPulseEffect 方法

   * VidSlide AI 功能实现

   */

  createPulseEffect(x, y, radius, style = {}) {
    const effectId = `pulse_${Date.now()}`

    this.startAnimation(
      effectId,
      progress => {
        const currentRadius = radius * (1 + progress * 0.5)
        const alpha = (1 - progress) * 0.6

        this.ctx.save()
        this.ctx.globalAlpha = alpha
        this.ctx.strokeStyle = style.color || '#FFD700'
        this.ctx.lineWidth = style.width || 2
        this.ctx.beginPath()
        this.ctx.arc(x, y, currentRadius, 0, Math.PI * 2)
        this.ctx.stroke()
        this.ctx.restore()
      },
      1000,
      {
        easing: 'ease-out',
        onComplete: () => this.createPulseEffect(x, y, radius, style) // 循环脉冲
      }
    )

    this.effects.set(effectId, { x, y, radius, style })
  }

  /**
   * 创建文字打字效果
   * @param {string} text - 文字内容
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} style - 文字样式
   * @param {number} speed - 打字速度 (ms per char)
   */
  /**

   * createTypewriterEffect 方法

   * VidSlide AI 功能实现

   */

  createTypewriterEffect(text, x, y, style = {}, speed = 100) {
    const effectId = `typewriter_${Date.now()}`
    let currentText = ''
    let charIndex = 0

    this.startAnimation(
      effectId,
      progress => {
        const targetCharCount = Math.floor(progress * text.length)
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if (targetCharCount > charIndex) {
          currentText += text[charIndex]
          charIndex++
        }

        this.drawText(currentText, x, y, style)
      },
      text.length * speed,
      { easing: 'linear' }
    )

    this.effects.set(effectId, { text, x, y, style, speed })
  }

  /**
   * 清除所有效果
   */
  /**

   * clearAllEffects 方法

   * VidSlide AI 功能实现

   */

  clearAllEffects() {
    this.animations.clear()
    this.effects.clear()
  }

  /**
   * 销毁视觉效果实例
   */
  /**

   * destroy 方法

   * VidSlide AI 功能实现

   */

  destroy() {
    this.clearAllEffects()
    this.canvas = null
    this.ctx = null
  }
}

export default VisualEffects
