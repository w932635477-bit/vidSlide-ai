/**
 * HtmlExporter 单元测试
 * 测试HTML演示文稿导出功能，包括水印集成和模板渲染
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HtmlExporter } from './htmlExporter.js'

// Mock DOM APIs
global.document = {
  createElement: vi.fn(() => ({
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    },
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })),
  createTextNode: vi.fn(() => ({})),
  head: {
    appendChild: vi.fn()
  },
  body: {
    appendChild: vi.fn()
  }
}

global.window = {
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn()
  },
  Blob: vi.fn().mockImplementation((chunks, options) => ({
    size: chunks ? chunks.reduce((acc, chunk) => acc + chunk.length, 0) : 0,
    type: options?.type || '',
    arrayBuffer: vi.fn(),
    text: vi.fn(),
    slice: vi.fn()
  }))
}

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('HtmlExporter', () => {
  let exporter

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock localStorage返回免费用户
    localStorageMock.getItem.mockReturnValue('free')

    exporter = new HtmlExporter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化HtmlExporter实例', () => {
      expect(exporter).toBeInstanceOf(HtmlExporter)
      expect(exporter.watermarkGenerator).toBeDefined()
    })
  })

  describe('exportToHtml方法', () => {
    const mockProjectData = {
      title: '测试项目',
      slides: [
        {
          id: 'slide1',
          content: '第一张幻灯片内容',
          backgroundColor: '#ffffff',
          elements: [
            {
              type: 'text',
              content: '标题文本',
              position: { x: 100, y: 100 },
              style: { fontSize: '24px', color: '#000000' }
            }
          ]
        },
        {
          id: 'slide2',
          content: '第二张幻灯片内容',
          backgroundColor: '#f0f0f0',
          elements: []
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        author: '测试用户'
      }
    }

    it('应该成功导出HTML演示文稿', async () => {
      const options = {
        includeWatermark: true,
        theme: 'default'
      }

      const _result = await exporter.exportToHtml(mockProjectData, options)

      expect(typeof result).toBe('string')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('<html>')
      expect(result).toContain('<head>')
      expect(result).toContain('<body>')
      expect(result).toContain('测试项目')
      expect(result).toContain('第一张幻灯片内容')
      expect(result).toContain('VidSlide AI') // 水印文本
    })

    it('应该支持无水印导出', async () => {
      const options = {
        includeWatermark: false,
        theme: 'minimal'
      }

      const _result = await exporter.exportToHtml(mockProjectData, options)

      expect(typeof result).toBe('string')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).not.toContain('VidSlide AI')
    })

    it('应该处理空的幻灯片数据', async () => {
      const emptyProjectData = {
        title: '空项目',
        slides: []
      }

      const _result = await exporter.exportToHtml(emptyProjectData)

      expect(typeof result).toBe('string')
      expect(result).toContain('空项目')
    })

    it('应该处理导出错误', async () => {
      // Mock一个会导致错误的情况
      const invalidProjectData = null

      await expect(exporter.exportToHtml(invalidProjectData)).rejects.toThrow('导出失败')
    })
  })

  describe('generateSlidesHtml方法', () => {
    it('应该生成正确的幻灯片HTML', () => {
      const slides = [
        {
          id: 'slide1',
          content: '测试内容',
          backgroundColor: '#ffffff',
          elements: [
            {
              type: 'text',
              content: '标题',
              position: { x: 50, y: 50 },
              style: { fontSize: '20px', color: '#333' }
            }
          ]
        }
      ]

      const _result = exporter.generateSlidesHtml(slides)

      expect(typeof result).toBe('string')
      expect(result).toContain('slide1')
      expect(result).toContain('测试内容')
      expect(result).toContain('background-color: #ffffff')
      expect(result).toContain('标题')
    })

    it('应该处理没有元素的幻灯片', () => {
      const slides = [
        {
          id: 'slide2',
          content: '纯文本幻灯片',
          backgroundColor: '#f0f0f0',
          elements: []
        }
      ]

      const _result = exporter.generateSlidesHtml(slides)

      expect(result).toContain('slide2')
      expect(result).toContain('纯文本幻灯片')
    })
  })

  describe('generateStyles方法', () => {
    it('应该生成基础CSS样式', () => {
      const _result = exporter.generateStyles('default')

      expect(typeof result).toBe('string')
      expect(result).toContain('.slide')
      expect(result).toContain('.presentation')
      expect(result).toContain('position: relative')
    })

    it('应该支持不同的主题', () => {
      const _result = exporter.generateStyles('dark')

      expect(result).toContain('dark-theme')
    })

    it('应该处理无效主题', () => {
      const _result = exporter.generateStyles('invalid-theme')

      expect(result).toContain('default-theme') // 降级到默认主题
    })
  })

  describe('generateNavigation方法', () => {
    it('应该生成导航控件', () => {
      const slideCount = 3
      const _result = exporter.generateNavigation(slideCount)

      expect(typeof result).toBe('string')
      expect(result).toContain('prev-slide')
      expect(result).toContain('next-slide')
      expect(result).toContain('slide-indicator')
    })

    it('应该处理单张幻灯片', () => {
      const slideCount = 1
      const _result = exporter.generateNavigation(slideCount)

      expect(result).toContain('disabled') // 单张幻灯片时禁用导航
    })
  })

  describe('水印集成', () => {
    it('应该为免费用户添加水印', async () => {
      localStorageMock.getItem.mockReturnValue('free')

      const mockProjectData = {
        title: '免费用户项目',
        slides: [{ id: 'slide1', content: '内容' }]
      }

      const _result = await exporter.exportToHtml(mockProjectData, { includeWatermark: true })

      expect(result).toContain('VidSlide AI')
      expect(result).toContain('免费版')
    })

    it('应该为付费用户添加不同水印', async () => {
      localStorageMock.getItem.mockReturnValue('premium')

      const mockProjectData = {
        title: '付费用户项目',
        slides: [{ id: 'slide1', content: '内容' }]
      }

      const _result = await exporter.exportToHtml(mockProjectData, { includeWatermark: true })

      expect(result).toContain('VidSlide AI')
      expect(result).toContain('专业版')
    })

    it('应该处理用户等级检测失败', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage错误')
      })

      const mockProjectData = {
        title: '测试项目',
        slides: [{ id: 'slide1', content: '内容' }]
      }

      const _result = await exporter.exportToHtml(mockProjectData, { includeWatermark: true })

      expect(result).toContain('VidSlide AI') // 应该降级到免费版水印
      expect(result).toContain('免费版')
    })
  })

  describe('资源管理', () => {
    it('应该正确嵌入CSS和JavaScript', async () => {
      const mockProjectData = {
        title: '测试项目',
        slides: [{ id: 'slide1', content: '内容' }]
      }

      const _result = await exporter.exportToHtml(mockProjectData)

      expect(result).toContain('<style>')
      expect(result).toContain('<script>')
      expect(result).toContain('DOMContentLoaded')
    })

    it('应该生成可下载的blob URL', async () => {
      const mockProjectData = {
        title: '测试项目',
        slides: [{ id: 'slide1', content: '内容' }]
      }

      const _result = await exporter.exportToHtml(mockProjectData)

      expect(global.window.Blob).toHaveBeenCalled()
      expect(global.window.URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的项目数据', async () => {
      await expect(exporter.exportToHtml(null)).rejects.toThrow()
      await expect(exporter.exportToHtml(undefined)).rejects.toThrow()
      await expect(exporter.exportToHtml({})).rejects.toThrow()
    })

    it('应该处理样式生成错误', () => {
      // Mock一个会导致样式生成错误的情况
      exporter.generateStyles = vi.fn(() => {
        throw new Error('样式生成失败')
      })

      expect(() => exporter.generateSlidesHtml([])).toThrow('样式生成失败')
    })

    it('应该处理导航生成错误', () => {
      exporter.generateNavigation = vi.fn(() => {
        throw new Error('导航生成失败')
      })

      expect(() => exporter.generateSlidesHtml([])).toThrow('导航生成失败')
    })
  })

  describe('性能优化', () => {
    it('应该高效处理大量幻灯片', () => {
      const largeSlides = Array.from({ length: 100 }, (_, i) => ({
        id: `slide${i}`,
        content: `幻灯片 ${i} 内容`,
        backgroundColor: '#ffffff',
        elements: []
      }))

      const startTime = Date.now()
      const _result = exporter.generateSlidesHtml(largeSlides)
      const endTime = Date.now()

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
    })
  })
})
