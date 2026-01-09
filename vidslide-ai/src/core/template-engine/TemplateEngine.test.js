/**
 * VidSlide AI - 模板引擎单元测试
 * 测试模板渲染引擎的核心功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TemplateRenderer, TemplateParser, VisualEffects, ConstraintSystem } from './index.js'
import { TEMPLATE_TYPES } from './TemplateDefinitions.js'

// Mock canvas and context for testing
const createMockCanvas = () => {
  const canvas = {
    width: 800,
    height: 600,
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      stroke: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      translate: vi.fn(),
      scale: vi.fn(),
      setLineDash: vi.fn()
    }))
  }
  return canvas
}

describe('TemplateEngine', () => {
  let canvas, ctx, renderer, parser, visualEffects, constraintSystem

  beforeEach(() => {
    canvas = createMockCanvas()
    ctx = canvas.getContext('2d')
    renderer = new TemplateRenderer(canvas, ctx)
    parser = new TemplateParser()
    visualEffects = new VisualEffects(canvas, ctx)
    constraintSystem = new ConstraintSystem()
  })

  afterEach(() => {
    renderer.destroy()
    visualEffects.destroy()
  })

  describe('TemplateParser', () => {
    it('应该能够解析对话弹窗内容', () => {
      const content = '重要提醒：会议将于下午3点开始'
      const result = parser.parseContent(content)

      expect(result.template.type).toBe(TEMPLATE_TYPES.DIALOG_POPUP)
      expect(result.data.content.title).toBe('重要提醒：会议将于下午3点开始')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('应该能够解析时间线内容', () => {
      const content = '2010年公司成立，2015年产品发布，2020年上市'
      const result = parser.parseContent(content)

      expect(result.template.type).toBe(TEMPLATE_TYPES.TIMELINE_DISPLAY)
      expect(result.data.content.years).toContain('2010')
      expect(result.data.content.years).toContain('2015')
      expect(result.data.content.years).toContain('2020')
    })

    it('应该能够解析分屏对比内容', () => {
      const content = '传统方法 vs 创新方法：效率大幅提升'
      const result = parser.parseContent(content)

      expect(result.template.type).toBe(TEMPLATE_TYPES.SPLIT_SCREEN)
      expect(result.data.content.left.content).toContain('传统方法')
      expect(result.data.content.right.content).toContain('创新方法')
    })

    it('应该能够解析图表内容', () => {
      const content = '销售额增长：第一季度100万，第二季度150万，第三季度200万'
      const result = parser.parseContent(content)

      expect(result.template.type).toBe(TEMPLATE_TYPES.CHART_ANALYSIS)
      expect(result.data.content.data).toBeDefined()
      expect(result.data.content.data.length).toBeGreaterThan(0)
    })

    it('应该能够解析强调内容', () => {
      const content = '核心要点：创新是企业发展的灵魂'
      const result = parser.parseContent(content)

      expect(result.template.type).toBe(TEMPLATE_TYPES.EMPHASIS_FOCUS)
      expect(result.data.content.title).toContain('核心要点')
    })
  })

  describe('ConstraintSystem', () => {
    it('应该验证文字长度约束', () => {
      const adjustments = {
        text: '这是一段非常非常非常非常非常非常非常非常非常长的文字，超过了普通弹窗的显示限制'
      }

      const result = constraintSystem.validateAdjustments(adjustments, TEMPLATE_TYPES.DIALOG_POPUP)

      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0].type).toBe('TEXT_LENGTH')
    })

    it('应该验证位置约束', () => {
      const adjustments = {
        position: 'invalid-position'
      }

      const result = constraintSystem.validateAdjustments(adjustments, TEMPLATE_TYPES.DIALOG_POPUP)

      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0].type).toBe('POSITION_INVALID')
    })

    it('应该验证颜色对比度', () => {
      const adjustments = {
        colors: {
          background: '#ffffff', // 白色背景
          text: '#ffffff' // 白色文字
        }
      }

      const result = constraintSystem.validateAdjustments(adjustments, TEMPLATE_TYPES.DIALOG_POPUP)

      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0].type).toBe('CONTRAST_RATIO')
    })

    it('应该计算合规分数', () => {
      const adjustments = {
        text: '正常的文字内容',
        position: 'bottom-right'
      }

      const result = constraintSystem.validateAdjustments(adjustments, TEMPLATE_TYPES.DIALOG_POPUP)

      expect(result.score).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })

  describe('VisualEffects', () => {
    it('应该能够绘制圆角矩形', () => {
      visualEffects.drawRoundedRect(10, 10, 100, 50, 8, '#000000')

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('应该能够绘制文字', () => {
      visualEffects.drawText('测试文字', 50, 50, { fontSize: 16, color: '#000000' })

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.fillText).toHaveBeenCalledWith('测试文字', 50, 50)
      expect(ctx.restore).toHaveBeenCalled()
    })

    it('应该能够构建字体字符串', () => {
      const fontString = visualEffects.buildFontString({
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      })

      expect(fontString).toBe('bold 18px Arial')
    })

    it('应该支持动画', () => {
      const animateFunction = vi.fn()
      visualEffects.startAnimation('test', animateFunction, 1000)

      // 等待一帧
      return new Promise(resolve => {
        setTimeout(() => {
          expect(animateFunction).toHaveBeenCalled()
          resolve()
        }, 50)
      })
    })
  })

  describe('TemplateRenderer', () => {
    it('应该能够渲染对话弹窗', async () => {
      try {
        const content = '重要通知：会议延期'
        const result = await renderer.renderTemplate(content)

        expect(result.success).toBe(true)
        expect(result.template.type).toBe(TEMPLATE_TYPES.DIALOG_POPUP)
        expect(result.performance.renderTime).toBeDefined()
      } catch (error) {
        console.error('应该能够渲染对话弹窗 test failed:', error)
        throw error
      }
    })

    it('应该能够渲染时间线', async () => {
      try {
        const content = '2020年成立公司，2023年推出产品'
        const result = await renderer.renderTemplate(content)

        expect(result.success).toBe(true)
        expect(result.template.type).toBe(TEMPLATE_TYPES.TIMELINE_DISPLAY)
      } catch (error) {
        console.error('应该能够渲染时间线 test failed:', error)
        throw error
      }
    })

    it('应该能够渲染分屏对比', async () => {
      try {
        const content = '传统方式 vs 新方法：效率提升300%'
        const result = await renderer.renderTemplate(content)

        expect(result.success).toBe(true)
        expect(result.template.type).toBe(TEMPLATE_TYPES.SPLIT_SCREEN)
      } catch (error) {
        console.error('应该能够渲染分屏对比 test failed:', error)
        throw error
      }
    })

    it('应该能够渲染图表', async () => {
      try {
        const content = '数据分析：Q1销售额100万，Q2销售额150万'
        const result = await renderer.renderTemplate(content)

        expect(result.success).toBe(true)
        expect(result.template.type).toBe(TEMPLATE_TYPES.CHART_ANALYSIS)
      } catch (error) {
        console.error('应该能够渲染图表 test failed:', error)
        throw error
      }
    })

    it('应该能够渲染强调内容', async () => {
      try {
        const content = '核心理念：用户至上'
        const result = await renderer.renderTemplate(content)

        expect(result.success).toBe(true)
        expect(result.template.type).toBe(TEMPLATE_TYPES.EMPHASIS_FOCUS)
      } catch (error) {
        console.error('应该能够渲染强调内容 test failed:', error)
        throw error
      }
    })

    it('应该提供渲染统计', () => {
      const stats = renderer.getRenderStats()

      expect(stats).toHaveProperty('lastRenderTime')
      expect(stats).toHaveProperty('totalRenders')
      expect(stats).toHaveProperty('averageRenderTime')
    })

    it('应该处理约束验证', async () => {
      try {
        const content = '短内容'
        const options = {
          adjustments: {
            position: 'invalid-position'
          }
        }

        const result = await renderer.renderTemplate(content, options)

        expect(result.validation).toBeDefined()
        expect(result.validation.violations.length).toBeGreaterThan(0)
      } catch (error) {
        console.error('应该处理约束验证 test failed:', error)
        throw error
      }
    })

    it('应该支持画布调整大小', () => {
      renderer.resizeCanvas(1024, 768)

      expect(renderer.width).toBe(1024)
      expect(renderer.height).toBe(768)
    })
  })

  describe('TemplateEngine Integration', () => {
    it('应该完整处理模板渲染流程', async () => {
      try {
        const content = '重要提醒：系统维护通知'
        const options = {
          context: {
            videoDuration: 120,
            contentType: 'announcement'
          },
          adjustments: {
            position: 'bottom-right',
            size: { width: 0.3, height: 0.25 }
          },
          animate: true
        }

        const result = await renderer.renderTemplate(content, options)

        expect(result.success).toBe(true)
        expect(result.template).toBeDefined()
        expect(result.validation).toBeDefined()
        expect(result.renderResult).toBeDefined()
        expect(result.performance).toBeDefined()

        // 验证模板选择
        expect([TEMPLATE_TYPES.DIALOG_POPUP, TEMPLATE_TYPES.EMPHASIS_FOCUS]).toContain(
          result.template.type
        )

        // 验证验证结果
        expect(result.validation.isValid).toBeDefined()
        expect(result.validation.score).toBeDefined()

        // 验证性能数据
        expect(result.performance.renderTime).toBeGreaterThan(0)
      } catch (error) {
        console.error('应该完整处理模板渲染流程 test failed:', error)
        throw error
      }
    })

    it('应该处理错误情况', async () => {
      try {
        // 测试空内容
        const result = await renderer.renderTemplate('')

        expect(result.success).toBe(true) // 应该使用默认模板
        expect(result.template.type).toBe(TEMPLATE_TYPES.DIALOG_POPUP)
      } catch (error) {
        console.error('应该处理错误情况 test failed:', error)
        throw error
      }
    })
  })
})
