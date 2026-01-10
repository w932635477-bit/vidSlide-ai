/**
 * PptxExporter 单元测试
 * 测试PPTX演示文稿导出功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PptxExporter } from './pptxExporter.js'

// Mock PptxGenJS
const mockPptx = {
  author: '',
  company: '',
  subject: '',
  title: '',
  defineLayout: vi.fn(),
  layout: '',
  defineSlideMaster: vi.fn(() => ({
    addText: vi.fn(),
    addShape: vi.fn()
  })),
  addSlide: vi.fn(() => ({
    background: {},
    addText: vi.fn(),
    addImage: vi.fn(),
    addShape: vi.fn(),
    addChart: vi.fn()
  })),
  writeFile: vi.fn().mockResolvedValue()
}

const mockPptxGenJS = vi.fn(() => mockPptx)
global.PptxGenJS = mockPptxGenJS

// Mock window object for browser environment
global.window = global
global.document = {
  createElement: vi.fn(() => ({
    appendChild: vi.fn()
  })),
  head: {
    appendChild: vi.fn()
  }
}

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('PptxExporter', () => {
  let exporter

  beforeEach(() => {
    vi.clearAllMocks()
    exporter = new PptxExporter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化PptxExporter实例', () => {
      expect(exporter).toBeDefined()
      expect(typeof exporter.initialize).toBe('function')
      expect(typeof exporter.exportPptx).toBe('function')
      expect(exporter.isInitialized).toBe(false)
    })

    it('应该在浏览器环境中成功初始化', async () => {
      const result = await exporter.initialize()

      expect(result.success).toBe(true)
      expect(exporter.isInitialized).toBe(true)
      expect(exporter.PptxGenJS).toBeDefined()
    })

    it('应该处理PptxGenJS库加载失败', async () => {
      delete global.PptxGenJS

      const mockScript = {
        appendChild: vi.fn()
      }
      global.document.createElement.mockReturnValue(mockScript)

      const result = await exporter.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('演示文稿配置', () => {
    it('应该设置正确的演示文稿布局', () => {
      const mockPptx = mockPptxGenJS()
      exporter.setLayout(mockPptx, '16x9')

      expect(mockPptx.defineLayout).toHaveBeenCalledWith({
        name: 'CUSTOM',
        width: 10,
        height: 5.625
      })
      expect(mockPptx.layout).toBe('CUSTOM')
    })

    it('应该支持多种布局格式', () => {
      const layouts = ['16x9', '4x3', 'A4', 'wide']

      layouts.forEach(layout => {
        const mockPptx = mockPptxGenJS()
        exporter.setLayout(mockPptx, layout)
        expect(mockPptx.defineLayout).toHaveBeenCalled()
      })
    })

    it('应该定义母版幻灯片', async () => {
      const mockPptx = mockPptxGenJS()
      await exporter.defineMasterSlide(mockPptx, 'professional')

      expect(mockPptx.defineSlideMaster).toHaveBeenCalled()
    })

    it('应该为不同模板设置不同的母版', async () => {
      const templates = ['professional', 'modern', 'minimal']

      for (const template of templates) {
        const mockPptx = mockPptxGenJS()
        await exporter.defineMasterSlide(mockPptx, template)
        expect(mockPptx.defineSlideMaster).toHaveBeenCalled()
      }
    })
  })

  describe('PPTX导出', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    const mockSlides = [
      {
        background: { color: '#ffffff' },
        elements: [
          {
            type: 'text',
            content: '测试标题',
            style: { fontSize: 24, color: '#000000' },
            position: { x: 10, y: 10 },
            size: { width: 80, height: 20 }
          },
          {
            type: 'image',
            src: 'data:image/jpeg;base64,test',
            position: { x: 20, y: 30 },
            size: { width: 50, height: 30 }
          }
        ]
      }
    ]

    it('应该成功导出PPTX', async () => {
      const result = await exporter.exportPptx({
        slides: mockSlides,
        title: '测试演示'
      })

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('测试演示')
      expect(result.slideCount).toBe(1)
      expect(result.format).toBe('PPTX')
    })

    it('应该设置演示文稿属性', async () => {
      await exporter.exportPptx({
        slides: mockSlides,
        title: '测试文档',
        author: 'Test Author',
        company: 'Test Company',
        subject: 'Test Subject'
      })

      const pptxInstance = mockPptxGenJS.mock.results[0].value
      expect(pptxInstance.author).toBe('Test Author')
      expect(pptxInstance.company).toBe('Test Company')
      expect(pptxInstance.subject).toBe('Test Subject')
      expect(pptxInstance.title).toBe('测试文档')
    })

    it('应该处理多个幻灯片', async () => {
      const multiSlides = [mockSlides[0], mockSlides[0], mockSlides[0]]

      await exporter.exportPptx({ slides: multiSlides })

      expect(mockPptx.addSlide).toHaveBeenCalledTimes(3)
    })
  })

  describe('幻灯片内容', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该设置幻灯片背景', () => {
      const mockSlide = mockPptx.addSlide()
      const background = { color: '#ff0000' }

      exporter.setSlideBackground(mockSlide, background)

      expect(mockSlide.background).toEqual({ fill: { color: 'ff0000' } })
    })

    it('应该处理图片背景警告', () => {
      const mockSlide = mockPptx.addSlide()
      const background = { image: 'test.jpg' }

      exporter.setSlideBackground(mockSlide, background)

      expect(mockSlide.background).toEqual({ fill: { color: 'FFFFFF' } })
      expect(_consoleWarnSpy).toHaveBeenCalledWith('PPTX导出暂不支持图片背景，请使用纯色背景')
    })

    it('应该渲染文本元素', () => {
      const mockSlide = mockPptx.addSlide()
      const textElement = {
        type: 'text',
        content: 'Hello World',
        style: {
          fontSize: 18,
          color: '#0066cc',
          textAlign: 'center',
          fontWeight: 'bold'
        },
        position: { x: 10, y: 20 },
        size: { width: 80, height: 30 }
      }

      exporter.addTextElement(mockSlide, textElement, mockPptx)

      expect(mockSlide.addText).toHaveBeenCalledWith({
        text: 'Hello World',
        x: expect.any(Number),
        y: expect.any(Number),
        w: expect.any(Number),
        h: expect.any(Number),
        fontSize: 18,
        color: '0066cc',
        align: 'center',
        bold: true,
        italic: false,
        underline: false
      })
    })

    it('应该渲染多行文本', () => {
      const mockSlide = mockPptx.addSlide()
      const textElement = {
        type: 'text',
        content: 'Line 1\nLine 2\nLine 3',
        style: { fontSize: 14 },
        position: { x: 5, y: 5 },
        size: { width: 90, height: 40 }
      }

      exporter.addTextElement(mockSlide, textElement, mockPptx)

      expect(mockSlide.addText).toHaveBeenCalledWith({
        text: ['Line 1', 'Line 2', 'Line 3'],
        x: expect.any(Number),
        y: expect.any(Number),
        w: expect.any(Number),
        h: expect.any(Number),
        fontSize: 14,
        color: '000000',
        align: 'left',
        bold: false,
        italic: false,
        underline: false
      })
    })

    it('应该渲染图片元素', async () => {
      const mockSlide = mockPptx.addSlide()

      // Mock URL conversion
      exporter.urlToDataUrl = vi.fn().mockResolvedValue('data:image/png;base64,mockdata')

      const imageElement = {
        type: 'image',
        src: 'test-image.jpg',
        position: { x: 20, y: 30 },
        size: { width: 40, height: 25 }
      }

      await exporter.addImageElement(mockSlide, imageElement, mockPptx)

      expect(exporter.urlToDataUrl).toHaveBeenCalledWith('test-image.jpg')
      expect(mockSlide.addImage).toHaveBeenCalledWith({
        data: 'data:image/png;base64,mockdata',
        x: expect.any(Number),
        y: expect.any(Number),
        w: expect.any(Number),
        h: expect.any(Number),
        sizing: { type: 'contain', w: expect.any(Number), h: expect.any(Number) }
      })
    })

    it('应该处理图片加载失败', async () => {
      const mockSlide = mockPptx.addSlide()

      exporter.urlToDataUrl = vi.fn().mockRejectedValue(new Error('Image load failed'))

      const imageElement = {
        type: 'image',
        src: 'invalid-image.jpg',
        position: { x: 20, y: 30 },
        size: { width: 40, height: 25 }
      }

      await exporter.addImageElement(mockSlide, imageElement, mockPptx)

      // Should add placeholder text
      expect(mockSlide.addText).toHaveBeenCalledWith('图片加载失败', expect.any(Object))
    })

    it('应该渲染形状元素', () => {
      const mockSlide = mockPptx.addSlide()
      const shapeElement = {
        type: 'shape',
        shape: 'rectangle',
        style: {
          fill: '#ff6600',
          stroke: '#000000',
          strokeWidth: 2
        },
        position: { x: 15, y: 25 },
        size: { width: 30, height: 20 }
      }

      exporter.addShapeElement(mockSlide, shapeElement, mockPptx)

      expect(mockSlide.addShape).toHaveBeenCalledWith(
        mockPptx.ShapeType.rect,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number),
          fill: { color: 'ff6600' },
          line: { color: '000000', width: 2 }
        })
      )
    })

    it('应该渲染不同类型的形状', () => {
      const mockSlide = mockPptx.addSlide()
      const shapes = ['rectangle', 'circle', 'triangle']

      shapes.forEach(shape => {
        const shapeElement = {
          type: 'shape',
          shape,
          position: { x: 10, y: 10 },
          size: { width: 20, height: 20 }
        }

        exporter.addShapeElement(mockSlide, shapeElement, mockPptx)
      })

      expect(mockSlide.addShape).toHaveBeenCalledTimes(3)
    })
  })

  describe('水印功能', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该添加水印到幻灯片', async () => {
      const mockSlide = mockPptx.addSlide()

      // Mock watermark generator
      exporter.watermarkGenerator = {
        getWatermarkText: () => 'VidSlide AI'
      }

      await exporter.addWatermarkToSlide(mockSlide, mockPptx)

      expect(mockSlide.addText).toHaveBeenCalledWith('VidSlide AI', expect.any(Object))
    })

    it('应该处理水印生成失败', async () => {
      const mockSlide = mockPptx.addSlide()

      // Mock watermark generator failure
      exporter.watermarkGenerator = null

      await exporter.addWatermarkToSlide(mockSlide, mockPptx)

      // Should not throw error, just skip watermark
      expect(mockSlide.addText).not.toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该映射文本对齐方式', () => {
      expect(exporter.mapTextAlign('left')).toBe('left')
      expect(exporter.mapTextAlign('center')).toBe('center')
      expect(exporter.mapTextAlign('right')).toBe('right')
      expect(exporter.mapTextAlign('justify')).toBe('justify')
      expect(exporter.mapTextAlign('invalid')).toBe('left')
    })

    it('应该映射垂直对齐方式', () => {
      expect(exporter.mapVerticalAlign('top')).toBe('top')
      expect(exporter.mapVerticalAlign('middle')).toBe('middle')
      expect(exporter.mapVerticalAlign('bottom')).toBe('bottom')
      expect(exporter.mapVerticalAlign('invalid')).toBe('top')
    })

    it('应该估算文件大小', () => {
      const slides = [{}, {}, {}] // 3 slides

      const estimatedSize = exporter.estimateFileSize(slides)
      expect(estimatedSize).toBe(700 * 1024) // 100KB + 3 * 200KB
    })

    it('应该检查PPTX导出支持', () => {
      expect(PptxExporter.isSupported()).toBe(true)
    })

    it('应该获取功能信息', () => {
      const capabilities = PptxExporter.getCapabilities()

      expect(capabilities).toHaveProperty('supported')
      expect(capabilities).toHaveProperty('layouts')
      expect(capabilities).toHaveProperty('templates')
      expect(capabilities).toHaveProperty('features')
      expect(capabilities.layouts).toContain('16x9')
      expect(capabilities.templates).toContain('professional')
    })
  })

  describe('错误处理', () => {
    it('应该处理初始化失败', async () => {
      delete global.PptxGenJS
      global.document.createElement.mockImplementation(() => {
        throw new Error('Script loading failed')
      })

      const result = await exporter.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理导出失败', async () => {
      await exporter.initialize()

      mockPptxGenJS.mockImplementation(() => {
        throw new Error('PPTX creation failed')
      })

      await expect(exporter.exportPptx({ slides: [] })).rejects.toThrow('PPTX导出失败')
    })

    it('应该处理不支持的元素类型', async () => {
      await exporter.initialize()

      const mockSlide = mockPptx.addSlide()
      const unknownElement = {
        type: 'unknown',
        content: 'test'
      }

      await exporter.addElementToSlide(mockSlide, unknownElement, mockPptx)

      expect(_consoleWarnSpy).toHaveBeenCalledWith('PPTX导出不支持的元素类型: unknown')
    })

    it('应该处理图表数据转换失败', () => {
      const mockSlide = mockPptx.addSlide()
      const invalidChartElement = {
        type: 'chart',
        chartType: 'bar',
        data: null // Invalid data
      }

      exporter.addChartElement(mockSlide, invalidChartElement, mockPptx)

      // Should add placeholder text
      expect(mockSlide.addText).toHaveBeenCalledWith('图表生成失败', expect.any(Object))
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该监控导出性能', async () => {
      const startTime = performance.now()

      await exporter.exportPptx({
        slides: mockSlides,
        title: 'Performance Test'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // Export should complete within reasonable time
      expect(duration).toBeLessThan(5000) // Less than 5 seconds
    })

    it('应该处理大规模演示文稿', async () => {
      const largeSlides = Array(20)
        .fill()
        .map((_, i) => ({
          background: { color: '#ffffff' },
          elements: [
            {
              type: 'text',
              content: `Slide ${i + 1}`,
              style: { fontSize: 20 },
              position: { x: 10, y: 10 },
              size: { width: 80, height: 20 }
            }
          ]
        }))

      const startTime = performance.now()

      const result = await exporter.exportPptx({
        slides: largeSlides,
        title: 'Large Presentation'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(result.slideCount).toBe(20)
      expect(duration).toBeLessThan(8000) // Less than 8 seconds for 20 slides
    })
  })

  describe('图表支持', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该转换图表数据格式', () => {
      const chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: '销售额', data: [100, 150, 200, 250] },
          { label: '利润', data: [20, 30, 40, 50] }
        ]
      }

      const converted = exporter.convertChartData(chartData)

      expect(converted).toHaveLength(4)
      expect(converted[0]).toHaveProperty('name', 'Q1')
      expect(converted[0]).toHaveProperty('labels')
      expect(converted[0]).toHaveProperty('values')
    })

    it('应该处理无效的图表数据', () => {
      expect(() => exporter.convertChartData(null)).toThrow('无效的图表数据格式')
      expect(() => exporter.convertChartData({})).toThrow('无效的图表数据格式')
    })

    it('应该渲染图表元素', () => {
      const mockSlide = mockPptx.addSlide()
      const chartElement = {
        type: 'chart',
        chartType: 'bar',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [{ label: 'Data', data: [1, 2, 3] }]
        },
        position: { x: 10, y: 10 },
        size: { width: 60, height: 40 }
      }

      exporter.addChartElement(mockSlide, chartElement, mockPptx)

      expect(mockSlide.addChart).toHaveBeenCalled()
    })
  })
})
