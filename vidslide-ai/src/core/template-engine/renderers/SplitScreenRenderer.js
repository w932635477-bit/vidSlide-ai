/**
 * VidSlide AI - 分屏显示渲染器
 * 专门处理分屏对比模板的渲染
 *
 * @module SplitScreenRenderer
 * @description 渲染左右分屏、上下分屏等对比展示内容
 */

import BaseRenderer from './BaseRenderer.js'

/**
 * SplitScreenRenderer 分屏显示渲染器类
 * 继承自BaseRenderer，实现分屏对比的具体渲染逻辑
 */
export class SplitScreenRenderer extends BaseRenderer {
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
   * 渲染分屏显示
   * @param {Object} config - 模板配置对象
   * @param {Object} config.visual - 视觉配置
   * @param {Object} config.content - 内容配置
   * @param {Object} data - 渲染数据
   * @param {Object} data.content - 数据内容
   * @param {Object} data.content.left - 左侧内容 {label, content}
   * @param {Object} data.content.right - 右侧内容 {label, content}
   * @param {Object} options - 渲染选项
   * @param {boolean} options.animate - 是否启用动画，默认true
   * @returns {Object} 渲染结果 {position, size, type, panels}
   */
  render(config, data, options = {}) {
    const { visual, content } = config
    const { width, height } = this.calculateElementSize(visual.size)

    // 安全获取数据内容
    const dataContent = this.safeGetContent(data, {
      left: { label: '', content: '' },
      right: { label: '', content: '' }
    })

    // 计算位置
    const position = this.calculateElementPosition(visual.position, width, height)

    // 计算面板尺寸
    const panels = this.calculatePanels(position, { width, height }, visual)

    // 绘制分屏内容
    this.drawSplitScreen(panels, visual, content, dataContent)

    // 应用动画
    if (visual.animation && options.animate !== false) {
      this.applyAnimation(visual.animation, {
        element: { x: position.x, y: position.y, width, height },
        type: 'split-screen'
      })
    }

    return {
      position,
      size: { width, height },
      type: 'split-screen',
      panels
    }
  }

  /**
   * 计算面板布局
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   * @returns {Object} 面板信息 {left, right, divider}
   */
  calculatePanels(position, size, visual) {
    const dividerWidth = visual.divider?.width || 4
    const splitRatio = visual.splitRatio || 0.5 // 默认50/50分割

    // 计算左右面板
    const leftWidth = size.width * splitRatio - dividerWidth / 2
    const rightWidth = size.width * (1 - splitRatio) - dividerWidth / 2

    return {
      left: {
        x: position.x,
        y: position.y,
        width: leftWidth,
        height: size.height
      },
      right: {
        x: position.x + leftWidth + dividerWidth,
        y: position.y,
        width: rightWidth,
        height: size.height
      },
      divider: {
        x: position.x + leftWidth,
        y: position.y,
        width: dividerWidth,
        height: size.height
      }
    }
  }

  /**
   * 绘制分屏内容
   * @param {Object} panels - 面板信息
   * @param {Object} visual - 视觉配置
   * @param {Object} content - 内容配置
   * @param {Object} dataContent - 数据内容
   */
  drawSplitScreen(panels, visual, content, dataContent) {
    // 1. 绘制左面板
    this.drawPanel(panels.left, visual, content.leftPanel, dataContent.left, 'left')

    // 2. 绘制右面板
    this.drawPanel(panels.right, visual, content.rightPanel, dataContent.right, 'right')

    // 3. 绘制分割线
    this.drawDivider(panels.divider, visual.divider)
  }

  /**
   * 绘制单个面板
   * @param {Object} panel - 面板信息 {x, y, width, height}
   * @param {Object} visual - 视觉配置
   * @param {Object} panelConfig - 面板配置
   * @param {Object} panelData - 面板数据 {label, content}
   * @param {string} side - 面板位置 ('left' 或 'right')
   */
  drawPanel(panel, visual, panelConfig, panelData, side) {
    const borderRadius = visual.borderRadius || 8
    const padding = 20

    // 1. 绘制面板背景
    this.drawPanelBackground(panel, borderRadius, panelConfig)

    // 2. 绘制面板边框
    if (panelConfig.border) {
      this.drawPanelBorder(panel, borderRadius, panelConfig)
    }

    // 3. 绘制标签
    if (panelData && panelData.label) {
      this.drawPanelLabel(panel, padding, panelConfig, panelData.label)
    }

    // 4. 绘制内容
    if (panelData && panelData.content) {
      this.drawPanelContent(panel, padding, panelConfig, panelData.content, panelData.label)
    }

    // 5. 绘制装饰（可选）
    if (panelConfig.decoration) {
      this.drawPanelDecoration(panel, panelConfig.decoration, side)
    }
  }

  /**
   * 绘制面板背景
   * @param {Object} panel - 面板信息
   * @param {number} borderRadius - 圆角半径
   * @param {Object} panelConfig - 面板配置
   */
  drawPanelBackground(panel, borderRadius, panelConfig) {
    if (panelConfig.background) {
      if (typeof panelConfig.background === 'string') {
        // 纯色背景
        this.visualEffects.drawRoundedRect(
          panel.x,
          panel.y,
          panel.width,
          panel.height,
          borderRadius,
          panelConfig.background
        )
      } else if (
        panelConfig.background.type === 'linear' ||
        panelConfig.background.type === 'radial'
      ) {
        // 渐变背景
        this.visualEffects.drawGradientBackground(
          panel.x,
          panel.y,
          panel.width,
          panel.height,
          panelConfig.background
        )
      }
    }
  }

  /**
   * 绘制面板边框
   * @param {Object} panel - 面板信息
   * @param {number} borderRadius - 圆角半径
   * @param {Object} panelConfig - 面板配置
   */
  drawPanelBorder(panel, borderRadius, panelConfig) {
    this.ctx.save()
    this.ctx.strokeStyle = panelConfig.border || 'rgba(255,255,255,0.3)'
    this.ctx.lineWidth = panelConfig.borderWidth || 1

    this.ctx.beginPath()
    this.ctx.roundRect(panel.x, panel.y, panel.width, panel.height, borderRadius)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制面板标签
   * @param {Object} panel - 面板信息
   * @param {number} padding - 内边距
   * @param {Object} panelConfig - 面板配置
   * @param {string} label - 标签文本
   */
  drawPanelLabel(panel, padding, panelConfig, label) {
    const labelConfig = panelConfig.label || {}

    this.visualEffects.drawText(label, panel.x + padding, panel.y + 30, {
      font: labelConfig.font || 'bold 16px Arial',
      color: labelConfig.color || '#333333',
      textAlign: 'left',
      textBaseline: 'top'
    })
  }

  /**
   * 绘制面板内容
   * @param {Object} panel - 面板信息
   * @param {number} padding - 内边距
   * @param {Object} panelConfig - 面板配置
   * @param {string} content - 内容文本
   * @param {string} label - 标签（用于计算偏移）
   */
  drawPanelContent(panel, padding, panelConfig, content, label) {
    const textConfig = panelConfig.text || {}
    const contentY = label ? panel.y + 60 : panel.y + 30
    const maxWidth = panel.width - padding * 2
    const lineHeight = textConfig.lineHeight || 18

    this.visualEffects.drawMultilineText(
      content,
      panel.x + padding,
      contentY,
      maxWidth,
      lineHeight,
      {
        font: textConfig.font || '14px Arial',
        color: textConfig.color || '#666666',
        textAlign: 'left',
        textBaseline: 'top'
      }
    )
  }

  /**
   * 绘制面板装饰
   * @param {Object} panel - 面板信息
   * @param {Object} decoration - 装饰配置
   * @param {string} side - 面板位置
   */
  drawPanelDecoration(panel, decoration, side) {
    if (decoration.type === 'corner-accent') {
      this.drawCornerAccent(panel, decoration, side)
    } else if (decoration.type === 'side-stripe') {
      this.drawSideStripe(panel, decoration, side)
    }
  }

  /**
   * 绘制角落强调
   * @param {Object} panel - 面板信息
   * @param {Object} decoration - 装饰配置
   * @param {string} side - 面板位置
   */
  drawCornerAccent(panel, decoration, side) {
    const size = decoration.size || 30
    const color = decoration.color || '#4CAF50'

    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.globalAlpha = 0.3

    // 绘制三角形装饰
    this.ctx.beginPath()
    if (side === 'left') {
      this.ctx.moveTo(panel.x, panel.y)
      this.ctx.lineTo(panel.x + size, panel.y)
      this.ctx.lineTo(panel.x, panel.y + size)
    } else {
      this.ctx.moveTo(panel.x + panel.width, panel.y)
      this.ctx.lineTo(panel.x + panel.width - size, panel.y)
      this.ctx.lineTo(panel.x + panel.width, panel.y + size)
    }
    this.ctx.closePath()
    this.ctx.fill()

    this.ctx.restore()
  }

  /**
   * 绘制侧边条纹
   * @param {Object} panel - 面板信息
   * @param {Object} decoration - 装饰配置
   * @param {string} side - 面板位置
   */
  drawSideStripe(panel, decoration, side) {
    const width = decoration.width || 5
    const color = decoration.color || '#2196F3'

    this.ctx.save()
    this.ctx.fillStyle = color

    if (side === 'left') {
      this.ctx.fillRect(panel.x, panel.y, width, panel.height)
    } else {
      this.ctx.fillRect(panel.x + panel.width - width, panel.y, width, panel.height)
    }

    this.ctx.restore()
  }

  /**
   * 绘制分割线
   * @param {Object} divider - 分割线信息 {x, y, width, height}
   * @param {Object} dividerConfig - 分割线配置
   */
  drawDivider(divider, dividerConfig = {}) {
    const centerX = divider.x + divider.width / 2

    this.ctx.save()
    this.ctx.strokeStyle = dividerConfig.color || 'rgba(255, 255, 255, 0.5)'
    this.ctx.lineWidth = dividerConfig.width || 4

    // 设置虚线样式（如果配置了）
    if (dividerConfig.dash) {
      this.ctx.setLineDash(dividerConfig.dash)
    }

    // 绘制垂直分割线
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, divider.y)
    this.ctx.lineTo(centerX, divider.y + divider.height)
    this.ctx.stroke()

    this.ctx.restore()

    // 绘制分割线装饰（可选）
    if (dividerConfig.decoration) {
      this.drawDividerDecoration(centerX, divider.y + divider.height / 2, dividerConfig.decoration)
    }
  }

  /**
   * 绘制分割线装饰
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} decoration - 装饰配置
   */
  drawDividerDecoration(x, y, decoration) {
    const size = decoration.size || 20

    this.ctx.save()
    this.ctx.fillStyle = decoration.color || '#ffffff'

    // 绘制菱形装饰
    this.ctx.beginPath()
    this.ctx.moveTo(x, y - size / 2)
    this.ctx.lineTo(x + size / 2, y)
    this.ctx.lineTo(x, y + size / 2)
    this.ctx.lineTo(x - size / 2, y)
    this.ctx.closePath()
    this.ctx.fill()

    this.ctx.restore()
  }

  /**
   * 应用同步滑入动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   * @param {Function} renderCallback - 渲染回调
   */
  applySlideInSyncAnimation(target, duration, easing, renderCallback) {
    const slideDistance = 50

    // 左面板动画
    this.animationController.start(
      `slide_left_${Date.now()}`,
      progress => {
        const offset = slideDistance * (1 - progress)

        this.ctx.save()
        this.ctx.translate(-offset, 0)

        if (renderCallback) {
          renderCallback('left')
        }

        this.ctx.restore()
      },
      duration / 2,
      { easing }
    )

    // 右面板延迟动画
    setTimeout(() => {
      this.animationController.start(
        `slide_right_${Date.now()}`,
        progress => {
          const offset = slideDistance * (1 - progress)

          this.ctx.save()
          this.ctx.translate(offset, 0)

          if (renderCallback) {
            renderCallback('right')
          }

          this.ctx.restore()
        },
        duration / 2,
        { easing }
      )
    }, duration / 4)
  }

  /**
   * 创建分屏的默认配置
   * @returns {Object} 默认配置
   */
  static getDefaultConfig() {
    return {
      visual: {
        size: { width: 0.9, height: 0.6 },
        position: 'center',
        splitRatio: 0.5,
        borderRadius: 8,
        divider: {
          color: 'rgba(255, 255, 255, 0.5)',
          width: 4,
          dash: [10, 5]
        },
        animation: {
          type: 'slide-in-sync',
          duration: 800,
          easing: 'easeOutCubic'
        }
      },
      content: {
        leftPanel: {
          background: 'rgba(33, 150, 243, 0.1)',
          border: 'rgba(33, 150, 243, 0.3)',
          label: {
            font: 'bold 16px Arial',
            color: '#1976D2'
          },
          text: {
            font: '14px Arial',
            color: '#666666',
            lineHeight: 18
          }
        },
        rightPanel: {
          background: 'rgba(76, 175, 80, 0.1)',
          border: 'rgba(76, 175, 80, 0.3)',
          label: {
            font: 'bold 16px Arial',
            color: '#388E3C'
          },
          text: {
            font: '14px Arial',
            color: '#666666',
            lineHeight: 18
          }
        }
      }
    }
  }
}

export default SplitScreenRenderer
