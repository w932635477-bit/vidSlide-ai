/**
 * PdfExporter 单元测试
 * 测试PDF演示文稿导出功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PdfExporter } from './pdfExporter.js'

// Mock jsPDF
const mockJsPDF = vi.fn(() => ({
  internal: {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297
    }
  },
  setProperties: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn(),
  setFillColor: vi.fn(),
  rect: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  getTextWidth: vi.fn(() => 50),
  addImage: vi.fn(),
  circle: vi.fn(),
  setDrawColor: vi.fn(),
  setLineWidth: vi.fn(),
  setGState: vi.fn()
}))

global.jsPDF = mockJsPDF

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

// Mock fetch for font loading
global.fetch = vi.fn()

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('PdfExporter', () => {
  let exporter

  beforeEach(() => {
    vi.clearAllMocks()
    exporter = new PdfExporter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化PdfExporter实例', () => {
      expect(exporter).toBeDefined()
      expect(typeof exporter.initialize).toBe('function')
      expect(typeof exporter.exportPdf).toBe('function')
      expect(exporter.isInitialized).toBe(false)
    })

    it('应该在浏览器环境中成功初始化', async () => {
      const result = await exporter.initialize()

      expect(result.success).toBe(true)
      expect(exporter.isInitialized).toBe(true)
      expect(exporter.jsPDF).toBeDefined()
    })

    it('应该加载中文字体', async () => {
      await exporter.initialize()

      expect(document.createElement).toHaveBeenCalledWith('link')
    })

    it('应该处理jsPDF库加载失败', async () => {
      delete global.jsPDF

      const mockScript = {
        appendChild: vi.fn()
      }
      global.document.createElement.mockReturnValue(mockScript)

      const result = await exporter.initialize()

      // Should handle the error gracefully
      expect(result).toBeDefined()
    })
  })

  describe('PDF选项配置', () => {
    it('应该为不同布局生成正确的PDF选项', () => {
      const testCases = [
        { layout: 'A4', orientation: 'portrait', expected: [210, 297] },
        { layout: 'A4', orientation: 'landscape', expected: [210, 297] },
        { layout: 'A3', orientation: 'portrait', expected: [297, 420] },
        { layout: '16:9', orientation: 'portrait', expected: [297, 167] }
      ]

      testCases.forEach(({ layout, orientation, expected }) => {
        const options = exporter.getPdfOptions(layout, orientation)
        expect(options.format).toEqual(expected)
        expect(options.orientation).toBe(orientation === 'landscape' ? 'l' : 'p')
      })
    })

    it('应该为未知布局使用默认A4', () => {
      const options = exporter.getPdfOptions('unknown', 'portrait')
      expect(options.format).toEqual([210, 297])
    })
  })

  describe('PDF导出', () => {
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
            position: { x: 10, y: 10 }
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

    it('应该成功导出PDF', async () => {
      const result = await exporter.exportPdf({
        slides: mockSlides,
        title: '测试演示'
      })

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('测试演示')
      expect(result.pageCount).toBe(1)
      expect(mockJsPDF).toHaveBeenCalled()
    })

    it('应该设置PDF文档属性', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      await exporter.exportPdf({
        slides: mockSlides,
        title: '测试文档',
        includeMetadata: true
      })

      expect(mockPdf.setProperties).toHaveBeenCalledWith({
        title: '测试文档',
        subject: 'VidSlide AI 生成的演示文稿',
        author: 'VidSlide AI',
        creator: 'VidSlide AI v1.0'
      })
    })

    it('应该处理多个幻灯片', async () => {
      const multiSlides = [mockSlides[0], mockSlides[0], mockSlides[0]]
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      await exporter.exportPdf({ slides: multiSlides })

      expect(mockPdf.addPage).toHaveBeenCalledTimes(2) // 2 additional pages
    })
  })

  describe('幻灯片渲染', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该渲染背景颜色', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      const slide = {
        background: { color: '#ff0000' },
        elements: []
      }

      await exporter.renderSlide(mockPdf, slide, {
        pageIndex: 0,
        layout: 'A4',
        orientation: 'portrait',
        applyWatermark: false,
        quality: 'high'
      })

      expect(mockPdf.setFillColor).toHaveBeenCalledWith(255, 0, 0)
      expect(mockPdf.rect).toHaveBeenCalledWith(0, 0, 210, 297, 'F')
    })

    it('应该渲染文本元素', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      const textElement = {
        type: 'text',
        content: 'Hello World',
        style: { fontSize: 16, color: '#0066cc' },
        position: { x: 10, y: 20 }
      }

      await exporter.renderElement(mockPdf, textElement, 210, 297, 'high')

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16)
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(0, 102, 204)
      expect(mockPdf.text).toHaveBeenCalledWith(
        'Hello World',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('应该渲染图片元素', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      // Mock URL to base64 conversion
      exporter.urlToBase64 = vi.fn().mockResolvedValue('data:image/jpeg;base64,mockdata')

      const imageElement = {
        type: 'image',
        src: 'test-image.jpg',
        position: { x: 20, y: 30 },
        size: { width: 40, height: 25 }
      }

      await exporter.renderElement(mockPdf, imageElement, 210, 297, 'high')

      expect(exporter.urlToBase64).toHaveBeenCalledWith('test-image.jpg')
      expect(mockPdf.addImage).toHaveBeenCalled()
    })

    it('应该渲染形状元素', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      const shapeElement = {
        type: 'shape',
        shape: 'rectangle',
        style: { fill: '#ff6600', stroke: '#000000', strokeWidth: 2 },
        position: { x: 15, y: 25 },
        size: { width: 30, height: 20 }
      }

      await exporter.renderElement(mockPdf, shapeElement, 210, 297, 'high')

      expect(mockPdf.setFillColor).toHaveBeenCalledWith(255, 102, 0)
      expect(mockPdf.setDrawColor).toHaveBeenCalledWith(0, 0, 0)
      expect(mockPdf.setLineWidth).toHaveBeenCalledWith(2)
      expect(mockPdf.rect).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'F'
      )
    })

    it('应该添加页码', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      exporter.addPageNumber(mockPdf, 5, 210, 297)

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(10)
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(100, 100, 100)
      expect(mockPdf.text).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number), {
        align: 'right'
      })
    })
  })

  describe('水印功能', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该应用水印到PDF', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      // Mock watermark generator
      exporter.watermarkGenerator = {
        getWatermarkText: () => 'VidSlide AI'
      }

      await exporter.applyWatermarkToPdf(mockPdf, 210, 297)

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(12)
      expect(mockPdf.setTextColor).toHaveBeenCalledWith(150, 150, 150)
      expect(mockPdf.text).toHaveBeenCalledTimes(4) // 4 corners
    })

    it('应该处理水印生成失败', async () => {
      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      // Mock watermark generator failure
      exporter.watermarkGenerator = null

      await exporter.applyWatermarkToPdf(mockPdf, 210, 297)

      // Should not throw error, just skip watermark
      expect(mockPdf.text).not.toHaveBeenCalled()
    })
  })

  describe('工具函数', () => {
    it('应该正确转换十六进制颜色为RGB', () => {
      expect(exporter.hexToRgb('#ff0000')).toEqual([255, 0, 0])
      expect(exporter.hexToRgb('#00ff00')).toEqual([0, 255, 0])
      expect(exporter.hexToRgb('#0000ff')).toEqual([0, 0, 255])
      expect(exporter.hexToRgb('#ffffff')).toEqual([255, 255, 255])
      expect(exporter.hexToRgb('invalid')).toEqual([0, 0, 0])
    })

    it('应该估算文件大小', () => {
      const slides = [{}, {}, {}] // 3 slides

      expect(exporter.estimateFileSize(slides, 'low')).toBe(153600) // (50 + 300) * 0.5 KB
      expect(exporter.estimateFileSize(slides, 'medium')).toBe(307200) // (50 + 300) * 1 KB
      expect(exporter.estimateFileSize(slides, 'high')).toBe(460800) // (50 + 300) * 1.5 KB
    })

    it('应该检查PDF导出支持', () => {
      expect(PdfExporter.isSupported()).toBe(true) // In browser-like environment
    })

    it('应该获取功能信息', () => {
      const capabilities = PdfExporter.getCapabilities()

      expect(capabilities).toHaveProperty('supported')
      expect(capabilities).toHaveProperty('formats')
      expect(capabilities).toHaveProperty('orientations')
      expect(capabilities).toHaveProperty('features')
      expect(capabilities.formats).toContain('A4')
      expect(capabilities.formats).toContain('16:9')
    })
  })

  describe('错误处理', () => {
    it('应该处理初始化失败', async () => {
      delete global.jsPDF
      global.document.createElement.mockImplementation(() => {
        throw new Error('Script loading failed')
      })

      const result = await exporter.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理导出失败', async () => {
      await exporter.initialize()

      mockJsPDF.mockImplementation(() => {
        throw new Error('PDF creation failed')
      })

      await expect(exporter.exportPdf({ slides: [] })).rejects.toThrow('PDF导出失败')
    })

    it('应该处理图片加载失败', async () => {
      await exporter.initialize()

      exporter.urlToBase64 = vi.fn().mockRejectedValue(new Error('Image load failed'))

      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      const imageElement = {
        type: 'image',
        src: 'invalid-image.jpg',
        position: { x: 20, y: 30 },
        size: { width: 40, height: 25 }
      }

      await exporter.renderElement(mockPdf, imageElement, 210, 297, 'high')

      // Should render placeholder instead
      expect(mockPdf.rect).toHaveBeenCalled() // Placeholder rectangle
      expect(mockPdf.text).toHaveBeenCalledWith(
        '图片加载失败',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('应该处理不支持的元素类型', async () => {
      await exporter.initialize()

      const mockPdf = mockJsPDF()
      mockJsPDF.mockReturnValue(mockPdf)

      const unknownElement = {
        type: 'unknown',
        content: 'test'
      }

      await exporter.renderElement(mockPdf, unknownElement, 210, 297, 'high')

      // Should log warning but not throw
      expect(_consoleWarnSpy).toHaveBeenCalledWith('不支持的元素类型: unknown')
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await exporter.initialize()
    })

    it('应该监控导出性能', async () => {
      const startTime = performance.now()

      await exporter.exportPdf({
        slides: mockSlides,
        title: 'Performance Test'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // Export should complete within reasonable time
      expect(duration).toBeLessThan(5000) // Less than 5 seconds
    })

    it('应该处理大规模导出', async () => {
      const largeSlides = Array(50)
        .fill()
        .map((_, i) => ({
          background: { color: '#ffffff' },
          elements: [
            {
              type: 'text',
              content: `Slide ${i + 1}`,
              style: { fontSize: 20 },
              position: { x: 10, y: 10 }
            }
          ]
        }))

      const startTime = performance.now()

      const result = await exporter.exportPdf({
        slides: largeSlides,
        title: 'Large Presentation'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(result.pageCount).toBe(50)
      expect(duration).toBeLessThan(10000) // Less than 10 seconds for 50 slides
    })
  })
})
