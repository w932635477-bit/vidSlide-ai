/**
 * TemplateRenderer.test.js
 * 模板渲染器管理器单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import TemplateRenderer from './TemplateRenderer.js'

describe('TemplateRenderer', () => {
  let renderer
  let mockCanvas

  beforeEach(() => {
    mockCanvas = { width: 800, height: 600 }
    renderer = new TemplateRenderer(mockCanvas)
  })

  afterEach(() => {
    renderer.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化渲染器管理器', () => {
      expect(renderer.canvas).toBe(mockCanvas)
      expect(renderer.currentRenderer).toBeNull()
      expect(renderer.isInitialized).toBe(false)
    })

    it('应该检查WebGL支持', () => {
      const isSupported = renderer.checkWebGLSupport()
      expect(typeof isSupported).toBe('boolean')
    })

    it('应该初始化并选择渲染器', async () => {
      // Mock WebGL support
      vi.spyOn(renderer, 'checkWebGLSupport').mockReturnValue(true)

      // Mock WebGL renderer
      const mockWebGL = {
        initialize: vi.fn().mockResolvedValue(),
        renderTemplate: vi.fn().mockResolvedValue({ success: true })
      }
      renderer.webglRenderer = mockWebGL

      await renderer.initialize()

      expect(renderer.isInitialized).toBe(true)
      expect(renderer.currentRenderer).toBe(mockWebGL)
    })

    it('应该在WebGL失败时降级到Canvas 2D', async () => {
      // Mock WebGL not supported
      vi.spyOn(renderer, 'checkWebGLSupport').mockReturnValue(false)

      // Mock Canvas 2D renderer
      const mockCanvas2D = {
        initialize: vi.fn(),
        renderTemplate: vi.fn().mockResolvedValue({ success: true })
      }
      renderer.canvasRenderer = mockCanvas2D

      await renderer.initialize()

      expect(renderer.currentRenderer).toBe(mockCanvas2D)
    })
  })

  describe('渲染器切换', () => {
    beforeEach(async () => {
      vi.spyOn(renderer, 'checkWebGLSupport').mockReturnValue(true)
      await renderer.initialize()
    })

    it('应该切换到WebGL渲染器', async () => {
      const result = await renderer.switchRenderer('webgl')
      expect(result).toBe(true)
    })

    it('应该切换到Canvas 2D渲染器', async () => {
      const result = await renderer.switchRenderer('canvas2d')
      expect(result).toBe(true)
    })
  })

  describe('模板渲染', () => {
    beforeEach(async () => {
      vi.spyOn(renderer, 'checkWebGLSupport').mockReturnValue(false)
      vi.spyOn(renderer, 'initialize').mockResolvedValue()

      // Mock Canvas 2D renderer
      renderer.canvasRenderer = {
        renderTemplate: vi.fn().mockResolvedValue({
          success: true,
          renderer: 'canvas2d',
          fps: () => 30
        })
      }
      renderer.currentRenderer = renderer.canvasRenderer
      renderer.isInitialized = true
    })

    it('应该渲染模板', async () => {
      const template = { id: 'test-template' }
      const data = {}
      const options = {}

      const result = await renderer.renderTemplate(template, data, options)

      expect(result.success).toBe(true)
      expect(result.renderer).toBe('canvas2d')
    })
  })

  describe('性能统计', () => {
    it('应该提供性能统计', () => {
      renderer.isInitialized = true
      renderer.currentRenderer = {
        getPerformanceStats: () => ({ fps: 60, isWebGL: true })
      }

      const stats = renderer.getPerformanceStats()

      expect(stats).toHaveProperty('rendererType')
      expect(stats).toHaveProperty('rendererSwitched')
      expect(stats).toHaveProperty('webglAvailable')
    })
  })

  describe('健康状态', () => {
    it('应该提供健康状态', () => {
      const health = renderer.getHealthStatus()

      expect(health).toHaveProperty('initialized')
      expect(health).toHaveProperty('currentRenderer')
      expect(health).toHaveProperty('webglSupported')
    })
  })

  describe('资源清理', () => {
    it('应该正确清理所有渲染器', () => {
      renderer.webglRenderer = { cleanup: vi.fn() }
      renderer.canvasRenderer = { cleanup: vi.fn() }
      renderer.currentRenderer = renderer.canvasRenderer
      renderer.isInitialized = true

      renderer.cleanup()

      expect(renderer.webglRenderer.cleanup).toHaveBeenCalled()
      expect(renderer.canvasRenderer.cleanup).toHaveBeenCalled()
      expect(renderer.isInitialized).toBe(false)
    })
  })
})
