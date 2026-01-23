/**
 * VidSlide AI - 画中画渲染器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PipRenderer } from './pipRenderer.js'

describe('PipRenderer', () => {
  let canvas
  let videoElement
  let renderer
  let mockContext

  beforeEach(() => {
    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn(id => clearTimeout(id))

    // 创建模拟的canvas和video元素
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600

    videoElement = document.createElement('video')
    videoElement.width = 400
    videoElement.height = 300
    // 在jsdom环境中readyState是只读的，使用defineProperty来mock
    Object.defineProperty(videoElement, 'readyState', {
      value: 4, // HAVE_ENOUGH_DATA
      writable: false
    })

    // 创建mock context
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      fillStyle: '',
      shadowBlur: 0,
      shadowColor: '',
      shadowOffsetX: 0,
      shadowOffsetY: 0
    }

    canvas.getContext = vi.fn(() => mockContext)

    renderer = new PipRenderer(canvas, videoElement)
  })

  afterEach(() => {
    if (renderer) {
      renderer.destroy()
    }
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化渲染器', () => {
      expect(renderer.canvas).toBe(canvas)
      expect(renderer.videoElement).toBe(videoElement)
      expect(renderer.isRendering).toBe(false)
      expect(renderer.pipConfig.width).toBe(100)
      expect(renderer.pipConfig.height).toBe(100)
    })

    it('应该有默认的画中画配置', () => {
      expect(renderer.pipConfig.position).toBe('bottom-right') // 默认位置
      expect(renderer.pipConfig.size).toBe(25) // 默认大小
      expect(renderer.pipConfig.style).toBe('rounded') // 默认样式
      expect(renderer.pipConfig.borderRadius).toBe(50)
      expect(renderer.pipConfig.borderColor).toBe('rgba(255, 255, 255, 0.8)')
    })
  })

  describe('渲染控制', () => {
    it('应该能够开始渲染', () => {
      const config = {
        x: 100,
        y: 100,
        width: 200,
        height: 200
      }

      renderer.startRendering(config)

      expect(renderer.isRendering).toBe(true)
      expect(renderer.pipConfig.x).toBe(100)
      expect(renderer.pipConfig.y).toBe(100)
    })

    it('应该能够停止渲染', () => {
      renderer.startRendering()
      expect(renderer.isRendering).toBe(true)

      renderer.stopRendering()
      expect(renderer.isRendering).toBe(false)
    })

    it('重复开始渲染应该停止之前的渲染', () => {
      renderer.startRendering()
      expect(renderer.isRendering).toBe(true)

      renderer.startRendering()
      expect(renderer.isRendering).toBe(true)
    })
  })

  describe('位置计算', () => {
    it('应该正确计算右下角位置', () => {
      renderer.setPosition('bottom-right')
      renderer.calculatePipPosition()

      const { x, y, width, height } = renderer.pipConfig
      expect(x).toBe(800 - width - 20) // canvas.width - pipSize - margin
      expect(y).toBe(600 - height - 20) // canvas.height - pipSize - margin
    })

    it('应该正确计算左上角位置', () => {
      renderer.setPosition('top-left')
      renderer.calculatePipPosition()

      expect(renderer.pipConfig.x).toBe(20) // margin
      expect(renderer.pipConfig.y).toBe(20) // margin
    })
  })

  describe('大小设置', () => {
    it('应该能够设置有效的大小', () => {
      renderer.setSize(30)
      expect(renderer.pipConfig.size).toBe(30)
    })

    it('应该限制大小在有效范围内', () => {
      renderer.setSize(5) // 小于最小值
      expect(renderer.pipConfig.size).toBe(10) // 最小值

      renderer.setSize(60) // 大于最大值
      expect(renderer.pipConfig.size).toBe(50) // 最大值
    })
  })

  describe('样式设置', () => {
    it('应该正确设置圆形样式', () => {
      renderer.setStyle('circle')
      renderer.calculatePipPosition()

      expect(renderer.pipConfig.borderRadius).toBe(renderer.pipConfig.width / 2)
    })

    it('应该正确设置圆角样式', () => {
      renderer.setStyle('rounded')
      renderer.calculatePipPosition()

      expect(renderer.pipConfig.borderRadius).toBeGreaterThan(0)
      expect(renderer.pipConfig.borderRadius).toBeLessThan(renderer.pipConfig.width / 2)
    })

    it('应该正确设置方形样式', () => {
      renderer.setStyle('square')
      renderer.calculatePipPosition()

      expect(renderer.pipConfig.borderRadius).toBe(0)
    })
  })

  describe('性能监控', () => {
    it('应该能够获取性能统计', () => {
      const stats = renderer.getPerformanceStats()

      expect(stats).toHaveProperty('renderTime')
      expect(stats).toHaveProperty('fps')
      expect(stats).toHaveProperty('frameCount')
      expect(stats).toHaveProperty('lastFrameTime')
    })

    it('应该在渲染时更新性能统计', () => {
      renderer.startRendering()

      // 模拟一些渲染帧
      const initialStats = renderer.getPerformanceStats()

      // 等待一小段时间
      return new Promise(resolve => {
        setTimeout(() => {
          const updatedStats = renderer.getPerformanceStats()
          expect(updatedStats.frameCount).toBeGreaterThanOrEqual(initialStats.frameCount)
          resolve()
        }, 100)
      })
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      const newConfig = {
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        borderRadius: 25
      }

      renderer.updateConfig(newConfig)

      expect(renderer.pipConfig.x).toBe(50)
      expect(renderer.pipConfig.y).toBe(50)
      expect(renderer.pipConfig.width).toBe(150)
      expect(renderer.pipConfig.height).toBe(150)
      expect(renderer.pipConfig.borderRadius).toBe(25)
    })
  })

  describe('圆角矩形绘制', () => {
    it('应该能够绘制圆角矩形', () => {
      const ctx = renderer.ctx

      // Spy on context methods
      const beginPathSpy = vi.spyOn(ctx, 'beginPath')
      const moveToSpy = vi.spyOn(ctx, 'moveTo')
      const lineToSpy = vi.spyOn(ctx, 'lineTo')
      const quadraticCurveToSpy = vi.spyOn(ctx, 'quadraticCurveTo')
      const closePathSpy = vi.spyOn(ctx, 'closePath')
      const fillSpy = vi.spyOn(ctx, 'fill')

      renderer.drawRoundedRect(10, 10, 100, 100, 10)

      expect(beginPathSpy).toHaveBeenCalled()
      expect(moveToSpy).toHaveBeenCalled()
      expect(lineToSpy).toHaveBeenCalled()
      expect(quadraticCurveToSpy).toHaveBeenCalled()
      expect(closePathSpy).toHaveBeenCalled()
      expect(fillSpy).toHaveBeenCalled()
    })
  })

  describe('视频内容绘制', () => {
    it('应该在视频准备好时绘制视频内容', () => {
      const ctx = renderer.ctx
      const drawImageSpy = vi.spyOn(ctx, 'drawImage')

      renderer.drawVideoContent(10, 10, 100, 100, 10)

      expect(drawImageSpy).toHaveBeenCalledWith(videoElement, 10, 10, 100, 100)
    })

    it('应该在视频未准备好时绘制占位符', () => {
      // 创建一个未准备的video元素
      const unpreparedVideo = document.createElement('video')
      unpreparedVideo.width = 400
      unpreparedVideo.height = 300
      Object.defineProperty(unpreparedVideo, 'readyState', {
        value: 0, // HAVE_NOTHING
        writable: false
      })

      // 创建新的renderer实例
      const unpreparedRenderer = new PipRenderer(canvas, unpreparedVideo)

      const ctx = unpreparedRenderer.ctx
      const fillTextSpy = vi.spyOn(ctx, 'fillText')

      unpreparedRenderer.drawVideoContent(10, 10, 100, 100, 10)

      expect(fillTextSpy).toHaveBeenCalledWith('画中画内容', expect.any(Number), expect.any(Number))

      unpreparedRenderer.destroy()
    })
  })

  describe('错误处理', () => {
    it('应该处理绘制错误', () => {
      const ctx = renderer.ctx
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock drawImage to throw error
      vi.spyOn(ctx, 'drawImage').mockImplementation(() => {
        throw new Error('Draw image failed')
      })

      // This should not throw
      expect(() => {
        renderer.renderFrame()
      }).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('销毁', () => {
    it('应该正确销毁渲染器', () => {
      renderer.startRendering()

      renderer.destroy()

      expect(renderer.canvas).toBeNull()
      expect(renderer.videoElement).toBeNull()
      expect(renderer.ctx).toBeNull()
      expect(renderer.isRendering).toBe(false)
    })
  })
})
