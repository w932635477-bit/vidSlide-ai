/**
 * VidSlide AI - 图表分析渲染器
 * 专门处理图表分析模板的渲染
 *
 * @module ChartAnalysisRenderer
 * @description 渲染柱状图、折线图、饼图等数据可视化内容
 */

import BaseRenderer from './BaseRenderer.js'

/**
 * ChartAnalysisRenderer 图表分析渲染器类
 * 继承自BaseRenderer，实现图表的具体渲染逻辑
 */
export class ChartAnalysisRenderer extends BaseRenderer {
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
   * 渲染图表分析
   * @param {Object} config - 模板配置对象
   * @param {Object} config.visual - 视觉配置
   * @param {Object} config.content - 内容配置
   * @param {Object} data - 渲染数据
   * @param {Object} data.content - 数据内容
   * @param {string} data.content.title - 图表标题
   * @param {Array} data.content.data - 图表数据
   * @param {Object} options - 渲染选项
   * @param {boolean} options.animate - 是否启用动画，默认true
   * @returns {Object} 渲染结果 {position, size, type, data}
   */
  render(config, data, options = {}) {
    const { visual, content } = config
    const { width, height } = this.calculateElementSize(visual.size)

    // 安全获取数据内容
    const dataContent = this.safeGetContent(data, { title: '', data: [] })

    // 计算位置
    const position = this.calculateElementPosition(visual.position, width, height)

    // 绘制背景和边框
    this.drawChartContainer(position, { width, height }, visual)

    // 绘制标题
    if (dataContent.title) {
      this.drawChartTitle(position, { width, height }, content, dataContent.title)
    }

    // 准备图表数据
    const chartData = this.prepareChartData(dataContent)

    // 绘制图表
    if (chartData && chartData.length > 0) {
      const chartArea = this.calculateChartArea(position, { width, height }, dataContent.title)
      this.drawChart(chartArea, chartData, content, visual.chartType || 'bar')
    }

    // 应用动画
    if (visual.animation && options.animate !== false) {
      this.applyAnimation(visual.animation, {
        element: { x: position.x, y: position.y, width, height },
        type: 'chart'
      })
    }

    return {
      position,
      size: { width, height },
      type: 'chart',
      data: chartData
    }
  }

  /**
   * 绘制图表容器
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawChartContainer(position, size, visual) {
    const borderRadius = visual.borderRadius || 12

    // 绘制阴影
    this.drawShadow(position, size, visual)

    // 绘制背景
    this.drawBackground(position, size, visual)

    // 绘制边框
    if (visual.border) {
      this.ctx.save()
      this.ctx.strokeStyle = visual.border
      this.ctx.lineWidth = visual.borderWidth || 2

      this.ctx.beginPath()
      this.ctx.roundRect(position.x, position.y, size.width, size.height, borderRadius)
      this.ctx.stroke()

      this.ctx.restore()
    }
  }

  /**
   * 绘制图表标题
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} content - 内容配置
   * @param {string} title - 标题文本
   */
  drawChartTitle(position, size, content, title) {
    const titleConfig = content.title || {}

    this.visualEffects.drawText(title, position.x + size.width / 2, position.y + 30, {
      font: titleConfig.font || 'bold 18px Arial',
      color: titleConfig.color || '#333333',
      textAlign: 'center',
      textBaseline: 'top'
    })
  }

  /**
   * 计算图表绘制区域
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {string} title - 标题（用于计算偏移）
   * @returns {Object} 图表区域 {x, y, width, height}
   */
  calculateChartArea(position, size, title) {
    const padding = 40
    const topOffset = title ? 60 : 30
    const bottomOffset = 60 // 为X轴标签预留空间

    return {
      x: position.x + padding,
      y: position.y + topOffset,
      width: size.width - padding * 2,
      height: size.height - topOffset - bottomOffset
    }
  }

  /**
   * 准备图表数据
   * @param {Object} content - 内容数据
   * @returns {Array} 图表数据数组
   */
  prepareChartData(content) {
    if (!content.data || !Array.isArray(content.data)) {
      return []
    }

    return content.data.map(item => ({
      value: item.value || 0,
      label: item.label || ''
    }))
  }

  /**
   * 绘制图表
   * @param {Object} area - 图表区域 {x, y, width, height}
   * @param {Array} chartData - 图表数据
   * @param {Object} content - 内容配置
   * @param {string} chartType - 图表类型 ('bar', 'line', 'pie')
   */
  drawChart(area, chartData, content, chartType) {
    switch (chartType) {
      case 'bar':
        this.drawBarChart(area, chartData, content)
        break
      case 'line':
        this.drawLineChart(area, chartData, content)
        break
      case 'pie':
        this.drawPieChart(area, chartData, content)
        break
      default:
        this.drawBarChart(area, chartData, content)
    }
  }

  /**
   * 绘制柱状图
   * @param {Object} area - 图表区域
   * @param {Array} chartData - 图表数据
   * @param {Object} content - 内容配置
   */
  drawBarChart(area, chartData, content) {
    if (chartData.length === 0) return

    const chartConfig = content.chart || {}
    const colors = chartConfig.colors || ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0']

    // 计算最大值
    const maxValue = Math.max(...chartData.map(d => d.value))
    const barWidth = (area.width / chartData.length) * 0.7
    const barSpacing = (area.width / chartData.length) * 0.3

    // 绘制Y轴网格线
    this.drawGridLines(area, maxValue)

    // 绘制柱子
    chartData.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * area.height
      const x = area.x + index * (barWidth + barSpacing) + barSpacing / 2
      const y = area.y + area.height - barHeight

      // 绘制柱子
      this.ctx.save()
      this.ctx.fillStyle = colors[index % colors.length]
      this.ctx.fillRect(x, y, barWidth, barHeight)
      this.ctx.restore()

      // 绘制数值
      this.drawBarValue(x + barWidth / 2, y - 5, item.value, content)

      // 绘制标签
      this.drawBarLabel(x + barWidth / 2, area.y + area.height + 10, item.label, content)
    })
  }

  /**
   * 绘制折线图
   * @param {Object} area - 图表区域
   * @param {Array} chartData - 图表数据
   * @param {Object} content - 内容配置
   */
  drawLineChart(area, chartData, content) {
    if (chartData.length === 0) return

    const chartConfig = content.chart || {}
    const lineColor = chartConfig.lineColor || '#2196F3'
    const pointColor = chartConfig.pointColor || '#1976D2'

    // 计算最大值
    const maxValue = Math.max(...chartData.map(d => d.value))
    const pointSpacing = area.width / (chartData.length - 1)

    // 绘制Y轴网格线
    this.drawGridLines(area, maxValue)

    // 绘制折线
    this.ctx.save()
    this.ctx.strokeStyle = lineColor
    this.ctx.lineWidth = 3
    this.ctx.lineJoin = 'round'

    this.ctx.beginPath()
    chartData.forEach((item, index) => {
      const x = area.x + index * pointSpacing
      const y = area.y + area.height - (item.value / maxValue) * area.height

      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    this.ctx.stroke()
    this.ctx.restore()

    // 绘制数据点
    chartData.forEach((item, index) => {
      const x = area.x + index * pointSpacing
      const y = area.y + area.height - (item.value / maxValue) * area.height

      // 绘制点
      this.ctx.save()
      this.ctx.fillStyle = pointColor
      this.ctx.beginPath()
      this.ctx.arc(x, y, 5, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()

      // 绘制数值
      this.drawBarValue(x, y - 10, item.value, content)

      // 绘制标签
      this.drawBarLabel(x, area.y + area.height + 10, item.label, content)
    })
  }

  /**
   * 绘制饼图
   * @param {Object} area - 图表区域
   * @param {Array} chartData - 图表数据
   * @param {Object} content - 内容配置
   */
  drawPieChart(area, chartData, content) {
    if (chartData.length === 0) return

    const chartConfig = content.chart || {}
    const colors = chartConfig.colors || ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0']

    // 计算总值
    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    // 计算饼图中心和半径
    const centerX = area.x + area.width / 2
    const centerY = area.y + area.height / 2
    const radius = Math.min(area.width, area.height) / 2 - 20

    let currentAngle = -Math.PI / 2 // 从顶部开始

    // 绘制扇形
    chartData.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2

      this.ctx.save()
      this.ctx.fillStyle = colors[index % colors.length]

      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      this.ctx.closePath()
      this.ctx.fill()

      // 绘制边框
      this.ctx.strokeStyle = '#ffffff'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      this.ctx.restore()

      // 绘制标签和百分比
      const labelAngle = currentAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius
      const percentage = ((item.value / total) * 100).toFixed(1) + '%'

      this.visualEffects.drawText(percentage, labelX, labelY, {
        font: 'bold 14px Arial',
        color: '#ffffff',
        textAlign: 'center',
        textBaseline: 'middle'
      })

      currentAngle += sliceAngle
    })

    // 绘制图例
    this.drawPieLegend(area, chartData, colors)
  }

  /**
   * 绘制网格线
   * @param {Object} area - 图表区域
   * @param {number} maxValue - 最大值
   */
  drawGridLines(area, maxValue) {
    const gridLines = 5

    this.ctx.save()
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])

    for (let i = 0; i <= gridLines; i++) {
      const y = area.y + (area.height / gridLines) * i
      this.ctx.beginPath()
      this.ctx.moveTo(area.x, y)
      this.ctx.lineTo(area.x + area.width, y)
      this.ctx.stroke()

      // 绘制Y轴标签
      const value = maxValue * (1 - i / gridLines)
      this.visualEffects.drawText(value.toFixed(0), area.x - 10, y, {
        font: '10px Arial',
        color: '#999999',
        textAlign: 'right',
        textBaseline: 'middle'
      })
    }

    this.ctx.restore()
  }

  /**
   * 绘制柱状图数值
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} value - 数值
   * @param {Object} content - 内容配置
   */
  drawBarValue(x, y, value, content) {
    const valueConfig = content.values || {}

    this.visualEffects.drawText(value.toString(), x, y, {
      font: valueConfig.font || 'bold 12px Arial',
      color: valueConfig.color || '#333333',
      textAlign: 'center',
      textBaseline: 'bottom'
    })
  }

  /**
   * 绘制柱状图标签
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {string} label - 标签文本
   * @param {Object} content - 内容配置
   */
  drawBarLabel(x, y, label, content) {
    const labelConfig = content.labels || {}

    this.visualEffects.drawText(label, x, y, {
      font: labelConfig.font || '11px Arial',
      color: labelConfig.color || '#666666',
      textAlign: 'center',
      textBaseline: 'top'
    })
  }

  /**
   * 绘制饼图图例
   * @param {Object} area - 图表区域
   * @param {Array} chartData - 图表数据
   * @param {Array} colors - 颜色数组
   */
  drawPieLegend(area, chartData, colors) {
    const legendX = area.x + area.width + 20
    const legendY = area.y
    const legendItemHeight = 25

    chartData.forEach((item, index) => {
      const y = legendY + index * legendItemHeight

      // 绘制颜色方块
      this.ctx.save()
      this.ctx.fillStyle = colors[index % colors.length]
      this.ctx.fillRect(legendX, y, 15, 15)
      this.ctx.restore()

      // 绘制标签
      this.visualEffects.drawText(item.label, legendX + 20, y + 7, {
        font: '12px Arial',
        color: '#666666',
        textAlign: 'left',
        textBaseline: 'middle'
      })
    })
  }

  /**
   * 应用数据动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   */
  applyDataAnimation(target, duration, easing) {
    this.animationController.start(
      `data_animation_${Date.now()}`,
      progress => {
        // 数据动画效果
        // 实际使用时应该通过回调函数来重新渲染图表
        console.log(`Data animation progress: ${progress}`)
      },
      duration,
      { easing }
    )
  }

  /**
   * 创建图表的默认配置
   * @returns {Object} 默认配置
   */
  static getDefaultConfig() {
    return {
      visual: {
        size: { width: 0.7, height: 0.6 },
        position: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        borderRadius: 12,
        chartType: 'bar',
        shadow: {
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 10,
          offsetX: 0,
          offsetY: 4
        },
        animation: {
          type: 'data-animation',
          duration: 1000,
          easing: 'easeOutCubic'
        }
      },
      content: {
        title: {
          font: 'bold 18px Arial',
          color: '#333333'
        },
        chart: {
          colors: ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0'],
          lineColor: '#2196F3',
          pointColor: '#1976D2'
        },
        values: {
          font: 'bold 12px Arial',
          color: '#333333'
        },
        labels: {
          font: '11px Arial',
          color: '#666666'
        }
      }
    }
  }
}

export default ChartAnalysisRenderer
