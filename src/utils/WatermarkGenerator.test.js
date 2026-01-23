/**
 * WatermarkGenerator 单元测试
 * 测试水印生成和管理功能，包括用户等级检测和Canvas渲染
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WatermarkGenerator } from './WatermarkGenerator.js'

// Mock Canvas API
const mockCanvasContext = {
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  globalAlpha: 1,
  font: '16px Arial',
  fillStyle: '#000000',
  textAlign: 'left',
  textBaseline: 'top'
}

global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock console methods
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('WatermarkGenerator', () => {
  let generator
  let mockCanvas

  beforeEach(() => {
    vi.clearAllMocks()

    mockCanvas = {
      width: 1920,
      height: 1080,
      getContext: vi.fn(() => mockCanvasContext)
    }

    generator = new WatermarkGenerator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化WatermarkGenerator实例', () => {
      expect(generator).toBeInstanceOf(WatermarkGenerator)
      expect(generator.userTier).toBe('free') // 默认免费版
      expect(generator.watermarkText).toBe('VidSlide AI - 免费版')
    })
  })

  describe('detectUserTier方法', () => {
    it('应该正确检测免费用户等级', () => {
      localStorageMock.getItem.mockReturnValue('free')

      const tier = generator.detectUserTier()

      expect(tier).toBe('free')
      expect(generator.userTier).toBe('free')
      expect(generator.watermarkText).toBe('VidSlide AI - 免费版')
    })

    it('应该正确检测专业版用户等级', () => {
      localStorageMock.getItem.mockReturnValue('premium')

      const tier = generator.detectUserTier()

      expect(tier).toBe('premium')
      expect(generator.userTier).toBe('premium')
      expect(generator.watermarkText).toBe('VidSlide AI - 专业版')
    })

    it('应该正确检测企业版用户等级', () => {
      localStorageMock.getItem.mockReturnValue('enterprise')

      const tier = generator.detectUserTier()

      expect(tier).toBe('enterprise')
      expect(generator.userTier).toBe('enterprise')
      expect(generator.watermarkText).toBe('VidSlide AI - 企业版')
    })

    it('应该处理无效的用户等级', () => {
      localStorageMock.getItem.mockReturnValue('invalid-tier')

      const tier = generator.detectUserTier()

      expect(tier).toBe('free')
      expect(generator.userTier).toBe('free')
      expect(_consoleWarnSpy).toHaveBeenCalledWith('无效的用户等级: invalid-tier，使用免费版')
    })

    it('应该处理localStorage访问错误', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage访问失败')
      })

      const tier = generator.detectUserTier()

      expect(tier).toBe('free')
      expect(_consoleWarnSpy).toHaveBeenCalledWith(
        '用户等级检测失败，使用免费版:',
        expect.any(Error)
      )
    })

    it('应该处理null返回值', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const tier = generator.detectUserTier()

      expect(tier).toBe('free')
      expect(generator.userTier).toBe('free')
    })
  })

  describe('setUserTier方法', () => {
    it('应该正确设置用户等级', () => {
      generator.setUserTier('premium')

      expect(generator.userTier).toBe('premium')
      expect(generator.watermarkText).toBe('VidSlide AI - 专业版')
    })

    it('应该处理无效等级设置', () => {
      generator.setUserTier('invalid')

      expect(generator.userTier).toBe('free')
      expect(generator.watermarkText).toBe('VidSlide AI - 免费版')
      expect(_consoleWarnSpy).toHaveBeenCalledWith('无效的用户等级: invalid，使用免费版')
    })
  })

  describe('applyToCanvas方法', () => {
    beforeEach(() => {
      generator.detectUserTier() // 初始化用户等级
    })

    it('应该在Canvas上应用水印', () => {
      const options = {
        position: 'bottom-right',
        opacity: 0.8,
        fontSize: 16
      }

      generator.applyToCanvas(mockCanvas, options)

      expect(mockCanvasContext.save).toHaveBeenCalled()
      expect(mockCanvasContext.restore).toHaveBeenCalled()
      expect(mockCanvasContext.fillText).toHaveBeenCalledWith(
        'VidSlide AI - 免费版',
        expect.any(Number),
        expect.any(Number)
      )
      expect(mockCanvasContext.globalAlpha).toBe(0.8)
    })

    it('应该处理不同的位置', () => {
      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']

      positions.forEach(position => {
        vi.clearAllMocks()
        generator.applyToCanvas(mockCanvas, { position })

        expect(mockCanvasContext.fillText).toHaveBeenCalled()
      })
    })

    it('应该处理默认选项', () => {
      generator.applyToCanvas(mockCanvas)

      expect(mockCanvasContext.fillText).toHaveBeenCalled()
      expect(mockCanvasContext.globalAlpha).toBe(0.8) // 默认透明度
    })

    it('应该处理无效位置参数', () => {
      generator.applyToCanvas(mockCanvas, { position: 'invalid' })

      // 应该使用默认位置
      expect(mockCanvasContext.fillText).toHaveBeenCalled()
    })

    it('应该处理Canvas上下文获取失败', () => {
      const canvasWithoutContext = {
        width: 1920,
        height: 1080,
        getContext: vi.fn(() => null)
      }

      expect(() => {
        generator.applyToCanvas(canvasWithoutContext)
      }).not.toThrow()

      expect(_consoleErrorSpy).toHaveBeenCalledWith('无法获取Canvas上下文，跳过水印渲染')
    })
  })

  describe('calculateWatermarkPosition方法', () => {
    it('应该正确计算右下角位置', () => {
      const position = generator.calculateWatermarkPosition(mockCanvas, 'bottom-right', 100, 20)

      expect(position.x).toBe(1920 - 100 - 20) // canvas.width - textWidth - padding
      expect(position.y).toBe(1080 - 20 - 10) // canvas.height - padding - margin
    })

    it('应该正确计算左上角位置', () => {
      const position = generator.calculateWatermarkPosition(mockCanvas, 'top-left', 100, 20)

      expect(position.x).toBe(20) // padding
      expect(position.y).toBe(30) // padding + margin
    })

    it('应该正确计算中心位置', () => {
      const position = generator.calculateWatermarkPosition(mockCanvas, 'center', 100, 20)

      expect(position.x).toBe((1920 - 100) / 2) // (canvas.width - textWidth) / 2
      expect(position.y).toBe((1080 - 20) / 2) // (canvas.height - textHeight) / 2
    })

    it('应该处理无效位置', () => {
      const position = generator.calculateWatermarkPosition(mockCanvas, 'invalid', 100, 20)

      expect(position.x).toBe(20)
      expect(position.y).toBe(30) // 降级到top-left
    })
  })

  describe('getWatermarkStyle方法', () => {
    it('应该返回免费版水印样式', () => {
      generator.setUserTier('free')

      const style = generator.getWatermarkStyle()

      expect(style.color).toBe('#666666')
      expect(style.fontSize).toBe(14)
      expect(style.opacity).toBe(0.7)
    })

    it('应该返回专业版水印样式', () => {
      generator.setUserTier('premium')

      const style = generator.getWatermarkStyle()

      expect(style.color).toBe('#999999')
      expect(style.fontSize).toBe(12)
      expect(style.opacity).toBe(0.5)
    })

    it('应该返回企业版水印样式', () => {
      generator.setUserTier('enterprise')

      const style = generator.getWatermarkStyle()

      expect(style.color).toBe('#cccccc')
      expect(style.fontSize).toBe(10)
      expect(style.opacity).toBe(0.3)
    })
  })

  describe('applyToVideoFrame方法', () => {
    it('应该在视频帧上应用水印', () => {
      const mockVideoFrame = {
        width: 1280,
        height: 720,
        getContext: vi.fn(() => mockCanvasContext)
      }

      generator.applyToVideoFrame(mockVideoFrame)

      expect(mockCanvasContext.save).toHaveBeenCalled()
      expect(mockCanvasContext.fillText).toHaveBeenCalled()
      expect(mockCanvasContext.restore).toHaveBeenCalled()
    })

    it('应该处理视频帧上下文错误', () => {
      const invalidVideoFrame = {
        width: 1280,
        height: 720,
        getContext: vi.fn(() => null)
      }

      expect(() => {
        generator.applyToVideoFrame(invalidVideoFrame)
      }).not.toThrow()

      expect(_consoleErrorSpy).toHaveBeenCalledWith('无法获取视频帧上下文，跳过水印渲染')
    })
  })

  describe('updateWatermarkText方法', () => {
    it('应该更新水印文本', () => {
      generator.updateWatermarkText('自定义水印')

      expect(generator.watermarkText).toBe('自定义水印')
    })

    it('应该处理空文本', () => {
      generator.updateWatermarkText('')

      expect(generator.watermarkText).toBe('VidSlide AI - 免费版') // 保持默认
    })

    it('应该处理null文本', () => {
      generator.updateWatermarkText(null)

      expect(generator.watermarkText).toBe('VidSlide AI - 免费版') // 保持默认
    })
  })

  describe('isWatermarkEnabled方法', () => {
    it('应该为免费用户返回true', () => {
      generator.setUserTier('free')

      expect(generator.isWatermarkEnabled()).toBe(true)
    })

    it('应该为专业版用户返回true', () => {
      generator.setUserTier('premium')

      expect(generator.isWatermarkEnabled()).toBe(true)
    })

    it('应该为企业版用户返回false', () => {
      generator.setUserTier('enterprise')

      expect(generator.isWatermarkEnabled()).toBe(false)
    })
  })

  describe('性能和资源管理', () => {
    it('应该高效处理多次水印应用', () => {
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        generator.applyToCanvas(mockCanvas, { position: 'bottom-right' })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // 100次操作应该在1秒内完成
    })

    it('应该正确清理资源', () => {
      generator.cleanup()

      expect(generator.userTier).toBe('free')
      expect(generator.watermarkText).toBe('VidSlide AI - 免费版')
    })
  })

  describe('错误处理和降级', () => {
    it('应该处理Canvas操作异常', () => {
      mockCanvasContext.fillText.mockImplementation(() => {
        throw new Error('Canvas操作失败')
      })

      expect(() => {
        generator.applyToCanvas(mockCanvas)
      }).not.toThrow()

      expect(_consoleErrorSpy).toHaveBeenCalledWith('水印渲染失败:', expect.any(Error))
    })

    it('应该处理measureText异常', () => {
      mockCanvasContext.measureText.mockImplementation(() => {
        throw new Error('measureText失败')
      })

      const position = generator.calculateWatermarkPosition(mockCanvas, 'center', 0, 20)

      expect(position.x).toBeGreaterThanOrEqual(0)
      expect(position.y).toBeGreaterThanOrEqual(0)
    })
  })
})
