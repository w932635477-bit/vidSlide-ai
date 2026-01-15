/**
 * Canvas2DRenderer.test.js
 * Canvas 2D渲染器单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import Canvas2DRenderer from './Canvas2DRenderer.js'

describe('Canvas2DRenderer', () => {
  let renderer
  let mockCanvas

  beforeEach(() => {
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: vi.fn().mockReturnValue({
        clearRect: vi.fn(),
        fillStyle: '',
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn()
      })
    }
    renderer = new Canvas2DRenderer(mockCanvas)
  })

  afterEach(() => {
    renderer.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化渲染器', () => {
      expect(renderer.canvas).toBe(mockCanvas)
      expect(renderer.ctx).toBeDefined()
      expect(renderer.isInitialized).toBe(false)
    })

    it('应该初始化Canvas 2D上下文', () => {
      renderer.initialize()

      expect(renderer.isInitialized).toBe(true)
      expect(renderer.ctx).toBeDefined()
    })
  })

  describe('模板渲染', () => {
    beforeEach(() => {
      renderer.initialize()
    })

    it('应该渲染模板', async () => {
      const template = {
        id: 'test-template',
        layers: { fixed: [], dynamic: [], adjustable: [] }
      }
      const data = {}

      vi.spyOn(renderer, 'renderTemplateLayers').mockResolvedValue()

      const result = await renderer.renderTemplate(template, data)

      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('renderer', 'canvas2d')
      expect(result).toHaveProperty('fps')
    })
  })

  describe('边界计算', () => {
    beforeEach(() => {
      renderer.initialize()
    })

    it('应该计算全屏边界', () => {
      const props = { position: 'fullscreen' }
      const bounds = renderer.calculateBounds(props)

      expect(bounds.x).toBe(0)
      expect(bounds.y).toBe(0)
      expect(bounds.width).toBe(800)
      expect(bounds.height).toBe(600)
    })

    it('应该计算居中边界', () => {
      const props = {
        position: 'center',
        size: { width: 400, height: 300 }
      }
      const bounds = renderer.calculateBounds(props)

      expect(bounds.x).toBe(200) // (800 - 400) / 2
      expect(bounds.y).toBe(150) // (600 - 300) / 2
      expect(bounds.width).toBe(400)
      expect(bounds.height).toBe(300)
    })
  })

  describe('图像处理', () => {
    beforeEach(() => {
      renderer.initialize()
    })

    it('应该加载图像', async () => {
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          onload: null,
          onerror: null,
          src: '',
          width: 100,
          height: 100
        }
        setTimeout(() => img.onload(), 10)
        return img
      })

      const img = await renderer.loadImage('test.jpg')

      expect(img.width).toBe(100)
      expect(img.height).toBe(100)
    })
  })

  describe('性能监控', () => {
    it('应该提供性能统计', () => {
      renderer.isInitialized = true
      renderer.fps = 30

      const stats = renderer.getPerformanceStats()

      expect(stats).toHaveProperty('fps', 30)
      expect(stats).toHaveProperty('isWebGL', false)
      expect(stats).toHaveProperty('renderer', 'Canvas 2D')
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      renderer.isInitialized = true
      renderer.animations.set('test', {})

      renderer.cleanup()

      expect(renderer.isInitialized).toBe(false)
      expect(renderer.animations.size).toBe(0)
    })
  })
})
