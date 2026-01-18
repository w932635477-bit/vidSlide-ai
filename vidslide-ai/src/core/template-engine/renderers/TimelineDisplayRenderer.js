/**
 * VidSlide AI - 时间线显示渲染器
 * 专门处理时间线展示模板的渲染
 *
 * @module TimelineDisplayRenderer
 * @description 渲染时间轴、历史事件、流程步骤等时间线内容
 */

import BaseRenderer from './BaseRenderer.js'

/**
 * TimelineDisplayRenderer 时间线显示渲染器类
 * 继承自BaseRenderer，实现时间线的具体渲染逻辑
 */
export class TimelineDisplayRenderer extends BaseRenderer {
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
   * 渲染时间线显示
   * @param {Object} config - 模板配置对象
   * @param {Object} config.visual - 视觉配置
   * @param {Object} config.content - 内容配置
   * @param {Object} data - 渲染数据
   * @param {Object} data.content - 数据内容
   * @param {Array} data.content.years - 年份数组
   * @param {Array} data.content.events - 事件数组
   * @param {Object} options - 渲染选项
   * @param {boolean} options.animate - 是否启用动画，默认true
   * @returns {Object} 渲染结果 {position, size, type, data}
   */
  render(config, data, options = {}) {
    const { visual, content } = config
    const { width, height } = this.calculateElementSize(visual.size)

    // 安全获取数据内容
    const dataContent = this.safeGetContent(data, { years: [], events: [] })

    // 计算位置
    const position = this.calculateElementPosition(visual.position, width, height)

    // 绘制背景
    if (visual.background) {
      this.drawTimelineBackground(position, { width, height }, visual)
    }

    // 准备时间线数据
    const timelineData = this.prepareTimelineData(dataContent)

    // 绘制时间线
    this.drawTimeline(position, { width, height }, content, timelineData)

    // 应用动画
    if (visual.animation && options.animate !== false) {
      this.applyAnimation(visual.animation, {
        element: { x: position.x, y: position.y, width, height },
        type: 'timeline'
      })
    }

    return {
      position,
      size: { width, height },
      type: 'timeline',
      data: timelineData
    }
  }

  /**
   * 绘制时间线背景
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawTimelineBackground(position, size, visual) {
    if (visual.background.type === 'linear' || visual.background.type === 'radial') {
      // 渐变背景
      this.visualEffects.drawGradientBackground(
        position.x,
        position.y,
        size.width,
        size.height,
        visual.background
      )
    } else {
      // 纯色背景
      this.ctx.save()
      this.ctx.fillStyle = visual.background
      this.ctx.fillRect(position.x, position.y, size.width, size.height)
      this.ctx.restore()
    }
  }

  /**
   * 准备时间线数据
   * @param {Object} content - 内容数据
   * @returns {Array} 时间线事件数组
   */
  prepareTimelineData(content) {
    const events = []

    if (content.years && content.events) {
      content.years.forEach((year, index) => {
        events.push({
          year: year,
          label: content.events[index] || '',
          position: index / Math.max(1, content.years.length - 1)
        })
      })
    }

    return events
  }

  /**
   * 绘制时间线
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {Array} timelineData - 时间线数据
   */
  drawTimeline(position, size, content, timelineData) {
    if (!timelineData || timelineData.length === 0) {
      return
    }

    const padding = 50
    const lineY = position.y + size.height / 2
    const lineStartX = position.x + padding
    const lineEndX = position.x + size.width - padding
    const lineWidth = lineEndX - lineStartX

    // 1. 绘制时间线主线
    this.drawTimelineMainLine(lineStartX, lineY, lineWidth, content)

    // 2. 绘制时间点和事件
    timelineData.forEach((event, index) => {
      const eventX = lineStartX + lineWidth * event.position
      this.drawTimelineEvent(eventX, lineY, event, content, index)
    })

    // 3. 绘制连接线
    this.drawTimelineConnectors(lineStartX, lineY, lineWidth, timelineData, content)
  }

  /**
   * 绘制时间线主线
   * @param {number} startX - 起始X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 线宽度
   * @param {Object} content - 内容配置
   */
  drawTimelineMainLine(startX, y, width, content) {
    const lineConfig = content.connectors || {}

    this.ctx.save()
    this.ctx.strokeStyle = lineConfig.color || '#cccccc'
    this.ctx.lineWidth = lineConfig.width || 3

    this.ctx.beginPath()
    this.ctx.moveTo(startX, y)
    this.ctx.lineTo(startX + width, y)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制时间线事件
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {Object} event - 事件数据
   * @param {Object} content - 内容配置
   * @param {number} index - 事件索引
   */
  drawTimelineEvent(x, y, event, content, index) {
    const dotRadius = 10
    const yearConfig = content.years || {}
    const eventConfig = content.events || {}

    // 1. 绘制时间点圆圈
    this.drawTimelineDot(x, y, dotRadius, content)

    // 2. 绘制年份（在时间线下方）
    if (event.year) {
      this.visualEffects.drawText(String(event.year), x, y + 30, {
        font: yearConfig.font || 'bold 14px Arial',
        color: yearConfig.color || '#333333',
        textAlign: 'center',
        textBaseline: 'top'
      })
    }

    // 3. 绘制事件标签（交替显示在时间线上方和下方）
    if (event.label) {
      const isAbove = index % 2 === 0
      const labelY = isAbove ? y - 30 : y + 60
      const maxWidth = 120

      this.visualEffects.drawMultilineText(event.label, x, labelY, maxWidth, 16, {
        font: eventConfig.font || '12px Arial',
        color: eventConfig.color || '#666666',
        textAlign: 'center',
        textBaseline: isAbove ? 'bottom' : 'top'
      })

      // 绘制连接线（从圆点到标签）
      this.drawEventConnector(x, y, labelY, isAbove, content)
    }
  }

  /**
   * 绘制时间点圆圈
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} radius - 半径
   * @param {Object} content - 内容配置
   */
  drawTimelineDot(x, y, radius, content) {
    const dotConfig = content.dots || {}

    this.ctx.save()

    // 绘制外圈
    this.ctx.fillStyle = dotConfig.fillColor || '#4CAF50'
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()

    // 绘制内圈（白色）
    this.ctx.fillStyle = '#ffffff'
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius - 3, 0, Math.PI * 2)
    this.ctx.fill()

    // 绘制边框
    this.ctx.strokeStyle = dotConfig.strokeColor || '#4CAF50'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制事件连接线
   * @param {number} x - X坐标
   * @param {number} dotY - 圆点Y坐标
   * @param {number} labelY - 标签Y坐标
   * @param {boolean} isAbove - 是否在上方
   * @param {Object} content - 内容配置
   */
  drawEventConnector(x, dotY, labelY, isAbove, content) {
    const connectorConfig = content.connectors || {}

    this.ctx.save()
    this.ctx.strokeStyle = connectorConfig.color || '#cccccc'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([3, 3])

    this.ctx.beginPath()
    this.ctx.moveTo(x, dotY + (isAbove ? -10 : 10))
    this.ctx.lineTo(x, labelY + (isAbove ? 5 : -5))
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制时间线连接器
   * @param {number} startX - 起始X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {Array} timelineData - 时间线数据
   * @param {Object} content - 内容配置
   */
  drawTimelineConnectors(startX, y, width, timelineData, content) {
    // 此方法可用于绘制额外的连接效果
    // 当前实现中，主线已经在drawTimelineMainLine中绘制
  }

  /**
   * 应用进度条动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   */
  applyProgressBarAnimation(target, duration, easing) {
    const { element } = target

    this.animationController.start(
      `progress_bar_${Date.now()}`,
      progress => {
        // 绘制进度条效果
        this.ctx.save()

        // 裁剪区域，只显示进度部分
        this.ctx.beginPath()
        this.ctx.rect(element.x, element.y, element.width * progress, element.height)
        this.ctx.clip()

        // 重新渲染时间线
        // 注意：这里需要外部提供渲染回调
        // 实际使用时应该通过回调函数来重新渲染

        this.ctx.restore()
      },
      duration,
      { easing }
    )
  }

  /**
   * 创建时间线的默认配置
   * @returns {Object} 默认配置
   */
  static getDefaultConfig() {
    return {
      visual: {
        size: { width: 0.9, height: 0.4 },
        position: 'center',
        background: {
          type: 'linear',
          colors: ['rgba(240, 240, 240, 0.9)', 'rgba(255, 255, 255, 0.9)'],
          direction: 'vertical'
        },
        animation: {
          type: 'progress-bar',
          duration: 1000,
          easing: 'easeOutCubic'
        }
      },
      content: {
        connectors: {
          color: '#cccccc',
          width: 3
        },
        dots: {
          fillColor: '#4CAF50',
          strokeColor: '#4CAF50'
        },
        years: {
          font: 'bold 14px Arial',
          color: '#333333'
        },
        events: {
          font: '12px Arial',
          color: '#666666'
        }
      }
    }
  }
}

export default TimelineDisplayRenderer
