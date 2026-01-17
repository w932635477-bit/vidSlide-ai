/**
 * VidSlide AI - 强调焦点渲染器
 * 专门处理强调焦点模板的渲染
 *
 * @module EmphasisFocusRenderer
 * @description 渲染全屏强调、重点突出等焦点内容
 */

import BaseRenderer from './BaseRenderer.js'

/**
 * EmphasisFocusRenderer 强调焦点渲染器类
 * 继承自BaseRenderer，实现强调焦点的具体渲染逻辑
 */
export class EmphasisFocusRenderer extends BaseRenderer {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {CanvasRenderingContext2D} context - Canvas上下文
   * @param {VisualEffects} visualEffects - 视觉效果实例
   */
  constructor(canvas, context, visualEffects) {
    super(canvas, context, visualEffects)
  }

  /**
   * 渲染强调焦点
   * @param {Object} config - 模板配置对象
   * @param {Object} config.visual - 视觉配置
   * @param {Object} config.content - 内容配置
   * @param {Object} data - 渲染数据
   * @param {Object} data.content - 数据内容
   * @param {string} data.content.title - 主标题
   * @param {string} data.content.subtitle - 副标题
   * @param {Object} options - 渲染选项
   * @param {boolean} options.animate - 是否启用动画，默认true
   * @returns {Object} 渲染结果 {position, size, type}
   */
  render(config, data, options = {}) {
    const { visual, content } = config

    // 安全获取数据内容
    const dataContent = this.safeGetContent(data, { title: '', subtitle: '' })

    // 全屏渲染
    const position = { x: 0, y: 0 }
    const size = { width: this.width, height: this.height }

    // 绘制背景
    this.drawEmphasisBackground(position, size, visual)

    // 绘制主标题
    if (dataContent.title) {
      this.drawMainTitle(size, content, dataContent.title)
    }

    // 绘制副标题
    if (dataContent.subtitle) {
      this.drawSubtitle(size, content, dataContent.subtitle)
    }

    // 绘制装饰元素
    if (visual.decoration) {
      this.drawDecoration(size, visual.decoration)
    }

    // 应用动画
    if (visual.animation && options.animate !== false) {
      this.applyAnimation(visual.animation, {
        element: { x: position.x, y: position.y, width: size.width, height: size.height },
        type: 'emphasis'
      })
    }

    return {
      position,
      size,
      type: 'emphasis',
      content: dataContent
    }
  }

  /**
   * 绘制强调背景
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawEmphasisBackground(position, size, visual) {
    if (visual.background) {
      if (visual.background.type === 'radial') {
        // 径向渐变背景
        this.visualEffects.drawGradientBackground(position.x, position.y, size.width, size.height, visual.background)
      } else if (visual.background.type === 'linear') {
        // 线性渐变背景
        this.visualEffects.drawGradientBackground(position.x, position.y, size.width, size.height, visual.background)
      } else {
        // 纯色背景
        this.ctx.save()
        this.ctx.fillStyle = visual.background
        this.ctx.fillRect(position.x, position.y, size.width, size.height)
        this.ctx.restore()
      }
    }

    // 绘制遮罩效果（可选）
    if (visual.overlay) {
      this.drawOverlay(position, size, visual.overlay)
    }
  }

  /**
   * 绘制遮罩效果
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} overlay - 遮罩配置
   */
  drawOverlay(position, size, overlay) {
    this.ctx.save()
    this.ctx.fillStyle = overlay.color || 'rgba(0, 0, 0, 0.3)'
    this.ctx.fillRect(position.x, position.y, size.width, size.height)
    this.ctx.restore()
  }

  /**
   * 绘制主标题
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {string} title - 标题文本
   */
  drawMainTitle(size, content, title) {
    const titleConfig = content.title || {}
    const centerX = size.width / 2
    const centerY = size.height / 2 - 50

    // 绘制标题文本
    this.visualEffects.drawText(title, centerX, centerY, {
      font: titleConfig.font || 'bold 48px Arial',
      color: titleConfig.color || '#ffffff',
      textAlign: 'center',
      textBaseline: 'middle'
    })

    // 绘制标题装饰（可选）
    if (titleConfig.decoration) {
      this.drawTitleDecoration(centerX, centerY, title, titleConfig)
    }

    // 绘制文字阴影效果
    if (titleConfig.shadow) {
      this.drawTextShadow(centerX, centerY, title, titleConfig)
    }
  }

  /**
   * 绘制副标题
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {string} subtitle - 副标题文本
   */
  drawSubtitle(size, content, subtitle) {
    const subtitleConfig = content.subtitle || {}
    const centerX = size.width / 2
    const centerY = size.height / 2 + 50

    // 绘制副标题文本
    this.visualEffects.drawText(subtitle, centerX, centerY, {
      font: subtitleConfig.font || '24px Arial',
      color: subtitleConfig.color || 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      textBaseline: 'middle'
    })

    // 绘制副标题装饰线（可选）
    if (subtitleConfig.underline) {
      this.drawSubtitleUnderline(centerX, centerY, subtitle, subtitleConfig)
    }
  }

  /**
   * 绘制标题装饰
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} title - 标题文本
   * @param {Object} titleConfig - 标题配置
   */
  drawTitleDecoration(x, y, title, titleConfig) {
    const decoration = titleConfig.decoration

    if (decoration.type === 'underline') {
      // 下划线装饰
      const textWidth = this.ctx.measureText(title).width
      const lineY = y + 30

      this.ctx.save()
      this.ctx.strokeStyle = decoration.color || '#FFD700'
      this.ctx.lineWidth = decoration.width || 4
      this.ctx.lineCap = 'round'

      this.ctx.beginPath()
      this.ctx.moveTo(x - textWidth / 2, lineY)
      this.ctx.lineTo(x + textWidth / 2, lineY)
      this.ctx.stroke()

      this.ctx.restore()
    } else if (decoration.type === 'highlight') {
      // 高亮背景装饰
      const textWidth = this.ctx.measureText(title).width
      const padding = 20

      this.ctx.save()
      this.ctx.fillStyle = decoration.color || 'rgba(255, 215, 0, 0.3)'
      this.ctx.fillRect(x - textWidth / 2 - padding, y - 30, textWidth + padding * 2, 60)
      this.ctx.restore()
    }
  }

  /**
   * 绘制文字阴影
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} text - 文本
   * @param {Object} config - 配置
   */
  drawTextShadow(x, y, text, config) {
    const shadow = config.shadow

    this.ctx.save()
    this.ctx.shadowColor = shadow.color || 'rgba(0, 0, 0, 0.5)'
    this.ctx.shadowBlur = shadow.blur || 10
    this.ctx.shadowOffsetX = shadow.offsetX || 0
    this.ctx.shadowOffsetY = shadow.offsetY || 4

    this.ctx.font = config.font || 'bold 48px Arial'
    this.ctx.fillStyle = config.color || '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, x, y)

    this.ctx.restore()
  }

  /**
   * 绘制副标题下划线
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} subtitle - 副标题文本
   * @param {Object} subtitleConfig - 副标题配置
   */
  drawSubtitleUnderline(x, y, subtitle, subtitleConfig) {
    const textWidth = this.ctx.measureText(subtitle).width
    const lineY = y + 20

    this.ctx.save()
    this.ctx.strokeStyle = subtitleConfig.underlineColor || 'rgba(255, 255, 255, 0.5)'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([5, 5])

    this.ctx.beginPath()
    this.ctx.moveTo(x - textWidth / 2, lineY)
    this.ctx.lineTo(x + textWidth / 2, lineY)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制装饰元素
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawDecoration(size, decoration) {
    switch (decoration.type) {
      case 'particles':
        this.drawParticles(size, decoration)
        break
      case 'spotlight':
        this.drawSpotlight(size, decoration)
        break
      case 'frame':
        this.drawFrame(size, decoration)
        break
      case 'corners':
        this.drawCorners(size, decoration)
        break
      default:
        console.warn(`Unknown decoration type: ${decoration.type}`)
    }
  }

  /**
   * 绘制粒子效果
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawParticles(size, decoration) {
    const particleCount = decoration.count || 50
    const particleColor = decoration.color || 'rgba(255, 255, 255, 0.5)'

    this.ctx.save()
    this.ctx.fillStyle = particleColor

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * size.width
      const y = Math.random() * size.height
      const radius = Math.random() * 3 + 1

      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  /**
   * 绘制聚光灯效果
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawSpotlight(size, decoration) {
    const centerX = size.width / 2
    const centerY = size.height / 2
    const radius = decoration.radius || 300

    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    this.ctx.save()
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, size.width, size.height)
    this.ctx.restore()
  }

  /**
   * 绘制边框装饰
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawFrame(size, decoration) {
    const margin = decoration.margin || 40
    const lineWidth = decoration.width || 3
    const color = decoration.color || 'rgba(255, 255, 255, 0.5)'

    this.ctx.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth

    this.ctx.strokeRect(margin, margin, size.width - margin * 2, size.height - margin * 2)

    this.ctx.restore()
  }

  /**
   * 绘制角落装饰
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawCorners(size, decoration) {
    const cornerSize = decoration.size || 50
    const lineWidth = decoration.width || 3
    const color = decoration.color || 'rgba(255, 255, 255, 0.8)'
    const margin = decoration.margin || 30

    this.ctx.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.lineCap = 'round'

    // 左上角
    this.ctx.beginPath()
    this.ctx.moveTo(margin + cornerSize, margin)
    this.ctx.lineTo(margin, margin)
    this.ctx.lineTo(margin, margin + cornerSize)
    this.ctx.stroke()

    // 右上角
    this.ctx.beginPath()
    this.ctx.moveTo(size.width - margin - cornerSize, margin)
    this.ctx.lineTo(size.width - margin, margin)
    this.ctx.lineTo(size.width - margin, margin + cornerSize)
    this.ctx.stroke()

    // 左下角
    this.ctx.beginPath()
    this.ctx.moveTo(margin, size.height - margin - cornerSize)
    this.ctx.lineTo(margin, size.height - margin)
    this.ctx.lineTo(margin + cornerSize, size.height - margin)
    this.ctx.stroke()

    // 右下角
    this.ctx.beginPath()
    this.ctx.moveTo(size.width - margin, size.height - margin - cornerSize)
    this.ctx.lineTo(size.width - margin, size.height - margin)
    this.ctx.lineTo(size.width - margin - cornerSize, size.height - margin)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 创建强调焦点的默认配置
   * @returns {Object} 默认配置
   */
  static getDefaultConfig() {
    return {
      visual: {
        background: {
          type: 'radial',
          colors: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.95)'],
          center: { x: 0.5, y: 0.5 }
        },
        overlay: {
          color: 'rgba(0, 0, 0, 0.2)'
        },
        decoration: {
          type: 'corners',
          size: 50,
          width: 3,
          color: 'rgba(255, 255, 255, 0.8)',
          margin: 30
        },
        animation: {
          type: 'fade-in-text',
          duration: 800,
          easing: 'easeOutCubic'
        }
      },
      content: {
        title: {
          font: 'bold 48px Arial',
          color: '#ffffff',
          shadow: {
            color: 'rgba(0, 0, 0, 0.5)',
            blur: 10,
            offsetX: 0,
            offsetY: 4
          },
          decoration: {
            type: 'underline',
            color: '#FFD700',
            width: 4
          }
        },
        subtitle: {
          font: '24px Arial',
          color: 'rgba(255, 255, 255, 0.9)',
          underline: true,
          underlineColor: 'rgba(255, 255, 255, 0.5)'
        }
      }
    }
  }
}

export default EmphasisFocusRenderer
