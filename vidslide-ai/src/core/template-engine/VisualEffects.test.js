/**
 * VisualEffects.test.js
 * VidSlide AI - 视觉效果库测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { VisualEffects } from './VisualEffects.js'

describe('VisualEffects', () => {
  let canvas
  let ctx
  let visualEffects

  beforeEach(() => {
    // Mock canvas and context
    canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => ctx)
    }

    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      drawImage: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      setTransform: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '16px Arial'
    }

    visualEffects = new VisualEffects(canvas, ctx)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化视觉效果库', () => {
      expect(visualEffects).toBeDefined()
      expect(visualEffects.canvas).toBe(canvas)
      expect(visualEffects.ctx).toBe(ctx)
      expect(visualEffects.animations).toBeDefined()
      expect(visualEffects.effects).toBeDefined()
    })

    it('应该初始化空的动画和效果集合', () => {
      expect(visualEffects.animations.size).toBe(0)
      expect(visualEffects.effects.size).toBe(0)
    })
  })

  describe('圆角矩形绘制', () => {
    it('应该绘制圆角矩形', () => {
      visualEffects.drawRoundedRect(10, 10, 100, 50, 5)

      expect(ctx.save).toHaveBeenCalled()
      expect(ctx.restore).toHaveBeenCalled()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(15, 10)
      expect(ctx.closePath).toHaveBeenCalled()
    })

    it('应该使用填充样式', () => {
      visualEffects.drawRoundedRect(10, 10, 100, 50, 5, 'red')

      expect(ctx.fillStyle).toBe('red')
      expect(ctx.fill).toHaveBeenCalled()
    })

    it('应该使用边框样式', () => {
      visualEffects.drawRoundedRect(10, 10, 100, 50, 5, null, 'blue', 2)

      expect(ctx.strokeStyle).toBe('blue')
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('应该处理零圆角', () => {
      visualEffects.drawRoundedRect(10, 10, 100, 50, 0)

      expect(ctx.moveTo).toHaveBeenCalledWith(10, 10)
    })

    it('应该处理负数坐标', () => {
      visualEffects.drawRoundedRect(-10, -10, 100, 50, 5)

      expect(ctx.moveTo).toHaveBeenCalledWith(-5, -10)
    })
  })

  describe('阴影效果', () => {
    it('应该应用阴影效果', () => {
      const shadowConfig = {
        offsetX: 2,
        offsetY: 2,
        blur: 5,
        color: 'rgba(0,0,0,0.3)'
      }

      visualEffects.applyShadow(shadowConfig)

      expect(ctx.shadowOffsetX).toBe(2)
      expect(ctx.shadowOffsetY).toBe(2)
      expect(ctx.shadowBlur).toBe(5)
      expect(ctx.shadowColor).toBe('rgba(0,0,0,0.3)')
    })

    it('应该清除阴影效果', () => {
      visualEffects.clearShadow()

      expect(ctx.shadowOffsetX).toBe(0)
      expect(ctx.shadowOffsetY).toBe(0)
      expect(ctx.shadowBlur).toBe(0)
      expect(ctx.shadowColor).toBe('transparent')
    })

    it('应该处理默认阴影配置', () => {
      visualEffects.applyShadow()

      expect(ctx.shadowOffsetX).toBe(0)
      expect(ctx.shadowOffsetY).toBe(0)
      expect(ctx.shadowBlur).toBe(0)
      expect(ctx.shadowColor).toBe('transparent')
    })
  })

  describe('渐变效果', () => {
    it('应该创建线性渐变', () => {
      const gradient = visualEffects.createLinearGradient(0, 0, 100, 100, ['#fff', '#000'])

      expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 100)
      expect(gradient.addColorStop).toHaveBeenCalledWith(0, '#fff')
      expect(gradient.addColorStop).toHaveBeenCalledWith(1, '#000')
    })

    it('应该创建径向渐变', () => {
      const gradient = visualEffects.createRadialGradient(50, 50, 0, 50, 50, 50, ['red', 'blue'])

      expect(ctx.createRadialGradient).toHaveBeenCalledWith(50, 50, 0, 50, 50, 50)
      expect(gradient.addColorStop).toHaveBeenCalledWith(0, 'red')
      expect(gradient.addColorStop).toHaveBeenCalledWith(1, 'blue')
    })

    it('应该处理多个颜色停止点', () => {
      const colors = ['red', 'green', 'blue']
      visualEffects.createLinearGradient(0, 0, 100, 0, colors)

      expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 0)
      expect(gradient.addColorStop).toHaveBeenCalledTimes(3)
    })
  })

  describe('动画系统', () => {
    it('应该启动动画', () => {
      const animationId = 'test-animation'
      const target = { x: 0, y: 0 }
      const duration = 1000
      const easing = 'linear'

      vi.useFakeTimers()
      const animateSpy = vi.fn()

      visualEffects.startAnimation(animationId, target, { x: 100 }, duration, easing, animateSpy)

      expect(visualEffects.animations.has(animationId)).toBe(true)

      vi.advanceTimersByTime(duration)
      vi.useRealTimers()
    })

    it('应该停止动画', () => {
      const animationId = 'test-animation'

      visualEffects.animations.set(animationId, { id: 123 })
      visualEffects.stopAnimation(animationId)

      expect(visualEffects.animations.has(animationId)).toBe(false)
    })

    it('应该停止所有动画', () => {
      visualEffects.animations.set('anim1', { id: 1 })
      visualEffects.animations.set('anim2', { id: 2 })

      visualEffects.stopAllAnimations()

      expect(visualEffects.animations.size).toBe(0)
    })
  })

  describe('变换操作', () => {
    it('应该应用缩放变换', () => {
      visualEffects.applyTransform('scale', 1.5, 2.0)

      expect(ctx.scale).toHaveBeenCalledWith(1.5, 2.0)
    })

    it('应该应用平移变换', () => {
      visualEffects.applyTransform('translate', 10, 20)

      expect(ctx.translate).toHaveBeenCalledWith(10, 20)
    })

    it('应该应用旋转变换', () => {
      const angle = Math.PI / 4
      visualEffects.applyTransform('rotate', angle)

      expect(ctx.rotate).toHaveBeenCalledWith(angle)
    })

    it('应该处理未知变换类型', () => {
      visualEffects.applyTransform('unknown', 1, 2, 3)

      // 应该不调用任何变换方法
      expect(ctx.scale).not.toHaveBeenCalled()
      expect(ctx.translate).not.toHaveBeenCalled()
      expect(ctx.rotate).not.toHaveBeenCalled()
    })
  })

  describe('文本渲染', () => {
    it('应该渲染文本', () => {
      visualEffects.drawText('Hello World', 50, 50, {
        fontSize: 24,
        fontFamily: 'Arial',
        color: 'black',
        align: 'left'
      })

      expect(ctx.font).toBe('24px Arial')
      expect(ctx.fillStyle).toBe('black')
      expect(ctx.textAlign).toBe('left')
      expect(ctx.fillText).toHaveBeenCalledWith('Hello World', 50, 50)
    })

    it('应该测量文本宽度', () => {
      const width = visualEffects.measureText('test text', '16px Arial')

      expect(width).toBe(100) // Mocked value
      expect(ctx.font).toBe('16px Arial')
    })

    it('应该处理文本对齐', () => {
      visualEffects.drawText('Center', 100, 100, { align: 'center' })

      expect(ctx.textAlign).toBe('center')
    })
  })

  describe('图像操作', () => {
    it('应该绘制图像', () => {
      const image = { width: 100, height: 100 }
      visualEffects.drawImage(image, 10, 10, 50, 50)

      expect(ctx.drawImage).toHaveBeenCalledWith(image, 10, 10, 50, 50)
    })

    it('应该处理图像裁剪', () => {
      const image = { width: 200, height: 200 }
      visualEffects.drawImageWithCrop(image, 0, 0, 100, 100, 10, 10, 50, 50)

      expect(ctx.drawImage).toHaveBeenCalledWith(image, 0, 0, 100, 100, 10, 10, 50, 50)
    })

    it('应该应用图像滤镜', () => {
      visualEffects.applyImageFilter('blur(5px)')

      expect(ctx.filter).toBe('blur(5px)')
    })
  })

  describe('效果管理', () => {
    it('应该注册效果', () => {
      const effectName = 'glow'
      const effectFunction = vi.fn()

      visualEffects.registerEffect(effectName, effectFunction)

      expect(visualEffects.effects.has(effectName)).toBe(true)
      expect(visualEffects.effects.get(effectName)).toBe(effectFunction)
    })

    it('应该应用注册的效果', () => {
      const effectFunction = vi.fn()
      visualEffects.registerEffect('testEffect', effectFunction)

      visualEffects.applyEffect('testEffect', 'param1', 'param2')

      expect(effectFunction).toHaveBeenCalledWith('param1', 'param2')
    })

    it('应该处理未注册的效果', () => {
      expect(() => {
        visualEffects.applyEffect('nonExistentEffect')
      }).not.toThrow()
    })

    it('应该移除效果', () => {
      visualEffects.registerEffect('tempEffect', vi.fn())
      expect(visualEffects.effects.has('tempEffect')).toBe(true)

      visualEffects.removeEffect('tempEffect')
      expect(visualEffects.effects.has('tempEffect')).toBe(false)
    })
  })

  describe('性能优化', () => {
    it('应该批量渲染操作', () => {
      visualEffects.beginBatch()

      visualEffects.drawRoundedRect(0, 0, 100, 100, 5)
      visualEffects.drawRoundedRect(110, 0, 100, 100, 5)

      visualEffects.endBatch()

      expect(ctx.save).toHaveBeenCalledTimes(1)
      expect(ctx.restore).toHaveBeenCalledTimes(1)
    })

    it('应该缓存复杂路径', () => {
      const pathId = 'complex-path'

      visualEffects.beginPathCache(pathId)
      visualEffects.drawRoundedRect(0, 0, 100, 100, 10)
      visualEffects.endPathCache()

      expect(visualEffects.pathCache).toBeDefined()
      expect(visualEffects.pathCache.has(pathId)).toBe(true)
    })

    it('应该重用缓存的路径', () => {
      const pathId = 'cached-path'

      visualEffects.beginPathCache(pathId)
      visualEffects.drawRoundedRect(0, 0, 50, 50, 5)
      visualEffects.endPathCache()

      // 重置mock调用计数
      ctx.beginPath.mockClear()

      visualEffects.useCachedPath(pathId)

      expect(ctx.beginPath).not.toHaveBeenCalled() // 应该使用缓存
    })
  })

  describe('清理操作', () => {
    it('应该清理画布区域', () => {
      visualEffects.clearRect(10, 10, 100, 100)

      expect(ctx.clearRect).toHaveBeenCalledWith(10, 10, 100, 100)
    })

    it('应该重置上下文状态', () => {
      visualEffects.resetContext()

      expect(ctx.globalAlpha).toBe(1)
      expect(ctx.globalCompositeOperation).toBe('source-over')
      expect(ctx.fillStyle).toBe('#000000')
      expect(ctx.strokeStyle).toBe('#000000')
      expect(ctx.lineWidth).toBe(1)
      expect(ctx.font).toBe('16px Arial')
    })

    it('应该清理所有资源', () => {
      visualEffects.animations.set('anim1', {})
      visualEffects.effects.set('effect1', {})

      visualEffects.cleanup()

      expect(visualEffects.animations.size).toBe(0)
      expect(visualEffects.effects.size).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的画布上下文', () => {
      const invalidEffects = new VisualEffects(canvas, null)

      expect(() => {
        invalidEffects.drawRoundedRect(0, 0, 100, 100, 5)
      }).not.toThrow()
    })

    it('应该处理无效的变换参数', () => {
      expect(() => {
        visualEffects.applyTransform('scale', 'invalid', 'invalid')
      }).not.toThrow()

      expect(ctx.scale).toHaveBeenCalledWith(1, 1) // 默认值
    })

    it('应该处理无效的图像参数', () => {
      expect(() => {
        visualEffects.drawImage(null, 0, 0)
      }).not.toThrow()

      expect(ctx.drawImage).not.toHaveBeenCalled()
    })
  })
})
