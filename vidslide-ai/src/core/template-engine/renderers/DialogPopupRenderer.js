/**
 * VidSlide AI - 对话弹窗渲染器
 * 专门处理对话弹窗模板的渲染
 *
 * @module DialogPopupRenderer
 * @description 渲染对话框、提示框等弹窗式内容
 */

import BaseRenderer from './BaseRenderer.js'

/**
 * DialogPopupRenderer 对话弹窗渲染器类
 * 继承自BaseRenderer，实现对话弹窗的具体渲染逻辑
 */
export class DialogPopupRenderer extends BaseRenderer {
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
   * 渲染对话弹窗
   * @param {Object} config - 模板配置对象
   * @param {Object} config.visual - 视觉配置
   * @param {Object} config.content - 内容配置
   * @param {Object} data - 渲染数据
   * @param {Object} data.content - 数据内容
   * @param {string} data.content.title - 标题文本
   * @param {string} data.content.text - 正文文本
   * @param {Object} options - 渲染选项
   * @param {boolean} options.animate - 是否启用动画，默认true
   * @returns {Object} 渲染结果 {position, size, type}
   */
  render(config, data, options = {}) {
    const { visual, content } = config
    const { width, height } = this.calculateElementSize(visual.size)

    // 安全获取数据内容
    const dataContent = this.safeGetContent(data, { title: '', text: '' })

    // 计算位置
    const position = this.calculateElementPosition(visual.position, width, height)

    // 绘制弹窗主体
    this.drawDialogBox(position, { width, height }, visual, content, dataContent)

    // 应用动画
    if (visual.animation && options.animate !== false) {
      this.applyAnimation(visual.animation, {
        element: { x: position.x, y: position.y, width, height },
        type: 'dialog-popup'
      })
    }

    return {
      position,
      size: { width, height },
      type: 'dialog-popup',
      content: dataContent
    }
  }

  /**
   * 绘制对话框主体
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   * @param {Object} content - 内容配置
   * @param {Object} dataContent - 数据内容
   */
  drawDialogBox(position, size, visual, content, dataContent) {
    // 1. 绘制阴影（先绘制，在最底层）
    this.drawShadow(position, size, visual)

    // 2. 绘制背景
    this.drawDialogBackground(position, size, visual)

    // 3. 绘制边框
    if (visual.border) {
      this.drawDialogBorder(position, size, visual)
    }

    // 4. 绘制标题
    if (dataContent.title) {
      this.drawDialogTitle(position, size, content, dataContent.title)
    }

    // 5. 绘制内容文本
    if (dataContent.text) {
      this.drawDialogText(position, size, content, dataContent.text, dataContent.title)
    }

    // 6. 绘制装饰元素（可选）
    if (visual.decoration) {
      this.drawDialogDecoration(position, size, visual.decoration)
    }
  }

  /**
   * 绘制对话框背景
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawDialogBackground(position, size, visual) {
    const borderRadius = visual.borderRadius || 12

    if (visual.background) {
      if (typeof visual.background === 'string') {
        // 纯色背景
        this.visualEffects.drawRoundedRect(
          position.x,
          position.y,
          size.width,
          size.height,
          borderRadius,
          visual.background
        )
      } else if (visual.background.type === 'linear' || visual.background.type === 'radial') {
        // 渐变背景
        this.visualEffects.drawGradientBackground(
          position.x,
          position.y,
          size.width,
          size.height,
          visual.background
        )
      }
    }
  }

  /**
   * 绘制对话框边框
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawDialogBorder(position, size, visual) {
    const borderRadius = visual.borderRadius || 12
    const borderWidth = visual.borderWidth || 2

    this.ctx.save()
    this.ctx.strokeStyle = visual.border
    this.ctx.lineWidth = borderWidth

    // 绘制圆角矩形边框
    this.ctx.beginPath()
    this.ctx.roundRect(position.x, position.y, size.width, size.height, borderRadius)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制对话框标题
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {string} title - 标题文本
   */
  drawDialogTitle(position, size, content, title) {
    const titleConfig = content.title || {}
    const padding = 20
    const titleY = position.y + 25

    // 绘制标题文本
    this.visualEffects.drawText(title, position.x + padding, titleY, {
      font: titleConfig.font || 'bold 18px Arial',
      color: titleConfig.color || '#333333',
      textAlign: 'left',
      textBaseline: 'top'
    })

    // 绘制标题下划线（可选）
    if (titleConfig.underline) {
      const titleWidth = this.ctx.measureText(title).width
      this.ctx.save()
      this.ctx.strokeStyle = titleConfig.underlineColor || titleConfig.color || '#333333'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.moveTo(position.x + padding, titleY + 22)
      this.ctx.lineTo(position.x + padding + titleWidth, titleY + 22)
      this.ctx.stroke()
      this.ctx.restore()
    }
  }

  /**
   * 绘制对话框文本内容
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {string} text - 文本内容
   * @param {string} title - 标题（用于计算偏移）
   */
  drawDialogText(position, size, content, text, title) {
    const textConfig = content.text || {}
    const padding = 20
    const textY = title ? position.y + 60 : position.y + 30
    const maxWidth = size.width - padding * 2
    const lineHeight = textConfig.lineHeight || 20

    // 绘制多行文本
    this.visualEffects.drawMultilineText(text, position.x + padding, textY, maxWidth, lineHeight, {
      font: textConfig.font || '14px Arial',
      color: textConfig.color || '#666666',
      textAlign: 'left',
      textBaseline: 'top'
    })
  }

  /**
   * 绘制装饰元素
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawDialogDecoration(position, size, decoration) {
    if (decoration.type === 'icon') {
      // 绘制图标装饰
      this.drawIconDecoration(position, size, decoration)
    } else if (decoration.type === 'corner') {
      // 绘制角落装饰
      this.drawCornerDecoration(position, size, decoration)
    }
  }

  /**
   * 绘制图标装饰
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawIconDecoration(position, size, decoration) {
    const iconSize = decoration.size || 24
    const iconX = position.x + (decoration.offsetX || 20)
    const iconY = position.y + (decoration.offsetY || 20)

    this.ctx.save()
    this.ctx.fillStyle = decoration.color || '#4CAF50'

    // 绘制简单的圆形图标
    this.ctx.beginPath()
    this.ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.restore()
  }

  /**
   * 绘制角落装饰
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} decoration - 装饰配置
   */
  drawCornerDecoration(position, size, decoration) {
    const cornerSize = decoration.size || 10

    this.ctx.save()
    this.ctx.fillStyle = decoration.color || '#FFD700'

    // 绘制四个角的装饰
    const corners = [
      { x: position.x, y: position.y }, // 左上
      { x: position.x + size.width - cornerSize, y: position.y }, // 右上
      { x: position.x, y: position.y + size.height - cornerSize }, // 左下
      { x: position.x + size.width - cornerSize, y: position.y + size.height - cornerSize } // 右下
    ]

    corners.forEach(corner => {
      this.ctx.fillRect(corner.x, corner.y, cornerSize, cornerSize)
    })

    this.ctx.restore()
  }

  /**
   * 创建对话弹窗的默认配置
   * @returns {Object} 默认配置
   */
  static getDefaultConfig() {
    return {
      visual: {
        size: { width: 0.6, height: 0.3 },
        position: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        borderRadius: 12,
        shadow: {
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 10,
          offsetX: 0,
          offsetY: 4
        },
        animation: {
          type: 'fade-in-scale',
          duration: 500,
          easing: 'easeOutBack'
        }
      },
      content: {
        title: {
          font: 'bold 18px Arial',
          color: '#333333',
          underline: false
        },
        text: {
          font: '14px Arial',
          color: '#666666',
          lineHeight: 20
        }
      }
    }
  }
}

export default DialogPopupRenderer
