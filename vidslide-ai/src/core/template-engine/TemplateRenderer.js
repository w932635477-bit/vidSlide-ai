/**
 * VidSlide AI - 模板渲染引擎（重构版）
 * 核心渲染引擎，整合解析、视觉效果和约束验证
 *
 * @module TemplateRenderer
 * @description 重构后的核心渲染器，作为调度器协调各个专用渲染器
 */

import TemplateParser from './TemplateParser.js'
import VisualEffects from './VisualEffects.js'
import ConstraintSystem from './ConstraintSystem.js'
import { TEMPLATE_TYPES, TEMPLATE_CONFIGS } from './TemplateDefinitions.js'

// 导入专用渲染器
import DialogPopupRenderer from './renderers/DialogPopupRenderer.js'
import TimelineDisplayRenderer from './renderers/TimelineDisplayRenderer.js'
import SplitScreenRenderer from './renderers/SplitScreenRenderer.js'
import ChartAnalysisRenderer from './renderers/ChartAnalysisRenderer.js'
import EmphasisFocusRenderer from './renderers/EmphasisFocusRenderer.js'

/**
 * TemplateRenderer 类
 * 核心渲染调度器，负责协调各个专用渲染器
 */
export class TemplateRenderer {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {CanvasRenderingContext2D} context - Canvas上下文
   */
  constructor(canvas, context) {
    this.canvas = canvas
    this.ctx = context
    this.width = canvas.width
    this.height = canvas.height

    // 初始化核心组件
    this.parser = new TemplateParser()
    this.visualEffects = new VisualEffects(canvas, context)
    this.constraintSystem = new ConstraintSystem()

    // 初始化专用渲染器
    this.renderers = this.initializeRenderers()

    // 渲染状态
    this.currentTemplate = null
    this.renderQueue = []
    this.isRendering = false

    // 性能统计
    this.renderStats = {
      lastRenderTime: 0,
      totalRenders: 0,
      averageRenderTime: 0
    }

    // 性能监控
    this.performanceMonitor = this.initializePerformanceMonitor()
  }

  /**
   * 初始化专用渲染器
   * @returns {Object} 渲染器映射表
   */
  initializeRenderers() {
    return {
      [TEMPLATE_TYPES.DIALOG_POPUP]: new DialogPopupRenderer(this.canvas, this.ctx, this.visualEffects),
      [TEMPLATE_TYPES.TIMELINE_DISPLAY]: new TimelineDisplayRenderer(this.canvas, this.ctx, this.visualEffects),
      [TEMPLATE_TYPES.SPLIT_SCREEN]: new SplitScreenRenderer(this.canvas, this.ctx, this.visualEffects),
      [TEMPLATE_TYPES.CHART_ANALYSIS]: new ChartAnalysisRenderer(this.canvas, this.ctx, this.visualEffects),
      [TEMPLATE_TYPES.EMPHASIS_FOCUS]: new EmphasisFocusRenderer(this.canvas, this.ctx, this.visualEffects)
    }
  }

  /**
   * 初始化性能监控
   * @returns {Object} 性能监控对象
   */
  initializePerformanceMonitor() {
    return {
      renderTimes: [],
      memoryUsage: [],
      maxSamples: 100,

      recordRenderTime: time => {
        this.performanceMonitor.renderTimes.push(time)
        if (this.performanceMonitor.renderTimes.length > this.performanceMonitor.maxSamples) {
          this.performanceMonitor.renderTimes.shift()
        }
      },

      getAverageRenderTime: () => {
        const times = this.performanceMonitor.renderTimes
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
      },

      recordMemoryUsage: () => {
        if (performance.memory) {
          this.performanceMonitor.memoryUsage.push(performance.memory.usedJSHeapSize / 1024 / 1024)
          if (this.performanceMonitor.memoryUsage.length > this.performanceMonitor.maxSamples) {
            this.performanceMonitor.memoryUsage.shift()
          }
        }
      },

      getAverageMemoryUsage: () => {
        const usage = this.performanceMonitor.memoryUsage
        return usage.length > 0 ? usage.reduce((a, b) => a + b, 0) / usage.length : 0
      }
    }
  }

  /**
   * 渲染模板（主入口方法）
   * @param {string} content - 内容文本
   * @param {Object} options - 渲染选项
   * @returns {Promise<Object>} 渲染结果
   */
  async renderTemplate(content, options = {}) {
    const startTime = performance.now()

    try {
      // 1. 解析内容并选择模板
      const parsedResult = this.parser.parseContent(content, options.context, options.constraints)

      // 2. 验证约束
      const validationResult = this.constraintSystem.validateAdjustments(
        options.adjustments || {},
        parsedResult.template.type,
        options.context
      )

      // 3. 应用约束调整
      const adjustedTemplate = this.applyValidationAdjustments(parsedResult, validationResult)

      // 4. 渲染模板
      const renderResult = await this.renderTemplateContent(adjustedTemplate, options)

      // 5. 性能统计
      const renderTime = performance.now() - startTime
      this.updateRenderStats(renderTime)

      return {
        success: true,
        template: adjustedTemplate,
        validation: validationResult,
        renderResult,
        performance: {
          renderTime,
          averageRenderTime: this.renderStats.averageRenderTime,
          totalRenders: this.renderStats.totalRenders
        }
      }
    } catch (error) {
      console.error('Template rendering failed:', error)
      return {
        success: false,
        error: error.message,
        template: null,
        performance: {
          renderTime: performance.now() - startTime
        }
      }
    }
  }

  /**
   * 渲染模板内容（调度到专用渲染器）
   * @param {Object} template - 模板对象
   * @param {Object} options - 渲染选项
   * @returns {Promise<Object>} 渲染结果
   */
  renderTemplateContent(template, options) {
    const { type, config, data } = template

    // 清空画布
    this.clearCanvas()

    // 获取对应的渲染器
    const renderer = this.renderers[type]

    if (!renderer) {
      throw new Error(`Unsupported template type: ${type}`)
    }

    // 保存当前模板
    this.currentTemplate = template

    // 调用专用渲染器
    return renderer.render(config, data, options)
  }

  /**
   * 应用验证调整
   * @param {Object} parsedResult - 解析结果
   * @param {Object} validationResult - 验证结果
   * @returns {Object} 调整后的模板
   */
  applyValidationAdjustments(parsedResult, validationResult) {
    const template = {
      ...parsedResult.template,
      data: parsedResult.data
    }

    // 如果有违反项，应用自动修复
    if (validationResult.violations && validationResult.violations.length > 0) {
      validationResult.violations.forEach(violation => {
        this.autoFixViolation(template, violation)
      })
    }

    return template
  }

  /**
   * 自动修复违反项
   * @param {Object} template - 模板对象
   * @param {Object} violation - 违反项
   */
  autoFixViolation(template, violation) {
    switch (violation.type) {
      case 'TEXT_LENGTH':
        if (violation.field === 'text' && template.data.content) {
          template.data.content = template.data.content.substring(0, violation.limit)
        }
        break

      case 'POSITION_INVALID':
        if (violation.allowed && violation.allowed.length > 0) {
          template.config.visual.position = violation.allowed[0]
        }
        break

      case 'SIZE_TOO_SMALL':
        if (violation.minimum) {
          template.config.visual.size = { ...violation.minimum }
        }
        break

      case 'SIZE_TOO_LARGE':
        if (violation.maximum) {
          template.config.visual.size = { ...violation.maximum }
        }
        break

      case 'CONTRAST_RATIO':
        this.adjustColorsForContrast(template)
        break

      default:
        console.warn(`No auto-fix available for violation type: ${violation.type}`)
    }
  }

  /**
   * 调整颜色以提高对比度
   * @param {Object} template - 模板对象
   */
  adjustColorsForContrast(template) {
    if (template.config.content) {
      template.config.content.text = template.config.content.text || {}
      template.config.content.text.color = '#ffffff'
      template.config.visual.background = 'rgba(0,0,0,0.8)'
    }
  }

  /**
   * 清空画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  /**
   * 更新渲染统计
   * @param {number} renderTime - 渲染时间
   */
  updateRenderStats(renderTime) {
    this.renderStats.lastRenderTime = renderTime
    this.renderStats.totalRenders++

    const totalTime = this.renderStats.averageRenderTime * (this.renderStats.totalRenders - 1) + renderTime
    this.renderStats.averageRenderTime = totalTime / this.renderStats.totalRenders

    this.performanceMonitor.recordRenderTime(renderTime)
    this.performanceMonitor.recordMemoryUsage()
  }

  /**
   * 获取渲染统计
   * @returns {Object} 统计信息
   */
  getRenderStats() {
    return {
      ...this.renderStats,
      averageMemoryUsage: this.performanceMonitor.getAverageMemoryUsage()
    }
  }

  /**
   * 调整画布尺寸
   * @param {number} width - 新宽度
   * @param {number} height - 新高度
   */
  resizeCanvas(width, height) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height

    // 更新所有渲染器的尺寸
    Object.values(this.renderers).forEach(renderer => {
      renderer.width = width
      renderer.height = height
    })
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    // 销毁视觉效果
    if (this.visualEffects) {
      this.visualEffects.destroy()
    }

    // 销毁所有专用渲染器
    Object.values(this.renderers).forEach(renderer => {
      if (renderer.destroy) {
        renderer.destroy()
      }
    })

    // 清理状态
    this.clearCanvas()
    this.currentTemplate = null
    this.renderQueue = []

    // 清理性能监控
    this.performanceMonitor.renderTimes = []
    this.performanceMonitor.memoryUsage = []
  }
}

export default TemplateRenderer
