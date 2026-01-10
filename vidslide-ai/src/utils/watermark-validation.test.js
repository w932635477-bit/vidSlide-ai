/**
 * WatermarkValidation 单元测试
 * 测试水印功能的技术验证工具
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WatermarkValidator } from './watermark-validation.js'

// Mock Canvas API
const mockCanvasContext = {
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  save: vi.fn(),
  restore: vi.fn(),
  globalAlpha: 1,
  font: '16px Arial',
  fillStyle: '#000000'
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
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('WatermarkValidator', () => {
  let validator

  beforeEach(() => {
    vi.clearAllMocks()
    validator = new WatermarkValidator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化WatermarkValidator实例', () => {
      expect(validator).toBeInstanceOf(WatermarkValidator)
      expect(validator.results).toBeDefined()
      expect(typeof validator.results).toBe('object')
    })

    it('应该初始化水印验证的结果结构', () => {
      expect(validator.results.canvasWatermark).toBeDefined()
      expect(validator.results.dynamicWatermark).toBeDefined()
      expect(validator.results.performanceImpact).toBeDefined()
      expect(validator.results.crossBrowserCompatibility).toBeDefined()
    })
  })

  describe('validateCanvasWatermark方法', () => {
    it('应该验证Canvas文字渲染功能', async () => {
      const result = await validator.validateCanvasWatermark()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证Canvas文字渲染'))
    })

    it('应该测试不同字体和样式的渲染', async () => {
      const result = await validator.validateCanvasWatermark()

      expect(mockCanvasContext.fillText).toHaveBeenCalled()
      expect(mockCanvasContext.measureText).toHaveBeenCalled()
    })

    it('应该处理Canvas上下文获取失败', async () => {
      global.HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      const result = await validator.validateCanvasWatermark()

      expect(result).toBe(false)
      expect(_consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Canvas上下文不可用'))
    })
  })

  describe('validateDynamicWatermark方法', () => {
    it('应该验证动态水印生成功能', async () => {
      localStorageMock.getItem.mockReturnValue('free')

      const result = await validator.validateDynamicWatermark()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证动态水印生成'))
    })

    it('应该测试不同用户等级的水印生成', async () => {
      const userTiers = ['free', 'premium', 'enterprise']

      for (const tier of userTiers) {
        vi.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(tier)

        await validator.validateDynamicWatermark()

        expect(localStorageMock.getItem).toHaveBeenCalledWith('vidslide-user-tier')
      }
    })

    it('应该处理localStorage访问错误', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage错误')
      })

      const result = await validator.validateDynamicWatermark()

      expect(result).toBe(true) // 应该降级处理
      expect(_consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('localStorage访问失败'))
    })
  })

  describe('validatePerformanceImpact方法', () => {
    it('应该验证水印的性能影响', async () => {
      const result = await validator.validatePerformanceImpact()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证性能影响'))
    })

    it('应该测量水印渲染时间', async () => {
      const startTime = Date.now()
      await validator.validatePerformanceImpact()
      const endTime = Date.now()

      // 验证应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it('应该检查内存使用情况', async () => {
      await validator.validatePerformanceImpact()

      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('内存使用'))
    })
  })

  describe('validateCrossBrowserCompatibility方法', () => {
    it('应该验证跨浏览器兼容性', async () => {
      const result = await validator.validateCrossBrowserCompatibility()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证跨浏览器兼容性'))
    })

    it('应该测试不同的Canvas特性支持', async () => {
      await validator.validateCrossBrowserCompatibility()

      expect(mockCanvasContext.fillText).toHaveBeenCalled()
      expect(mockCanvasContext.measureText).toHaveBeenCalled()
    })
  })

  describe('validateIntegrationFeasibility方法', () => {
    it('应该验证集成可行性', async () => {
      const result = await validator.validateIntegrationFeasibility()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证集成可行性'))
    })

    it('应该测试与导出系统的集成', async () => {
      await validator.validateIntegrationFeasibility()

      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('导出系统'))
    })
  })

  describe('validateAll方法', () => {
    it('应该运行所有水印验证项目', async () => {
      const result = await validator.validateAll()

      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('overallScore')
      expect(result).toHaveProperty('recommendations')
      expect(result).toHaveProperty('nextSteps')

      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('开始全面水印功能验证'))
    })

    it('应该计算总体兼容性评分', async () => {
      const result = await validator.validateAll()

      expect(typeof result.overallScore).toBe('number')
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
    })

    it('应该提供实施建议', async () => {
      const result = await validator.validateAll()

      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(Array.isArray(result.nextSteps)).toBe(true)
    })
  })

  describe('辅助方法', () => {
    it('应该提供水印样式配置', () => {
      const styles = validator.getWatermarkStyles()

      expect(typeof styles).toBe('object')
      expect(styles).toHaveProperty('free')
      expect(styles).toHaveProperty('premium')
      expect(styles).toHaveProperty('enterprise')
    })

    it('应该提供性能基准', () => {
      const benchmarks = validator.getPerformanceBenchmarks()

      expect(typeof benchmarks).toBe('object')
      expect(benchmarks).toHaveProperty('renderingTime')
      expect(benchmarks).toHaveProperty('memoryUsage')
      expect(benchmarks).toHaveProperty('cpuUsage')
    })

    it('应该提供浏览器支持矩阵', () => {
      const matrix = validator.getBrowserSupportMatrix()

      expect(typeof matrix).toBe('object')
      expect(matrix).toHaveProperty('chrome')
      expect(matrix).toHaveProperty('firefox')
      expect(matrix).toHaveProperty('safari')
      expect(matrix).toHaveProperty('edge')
    })
  })

  describe('错误处理', () => {
    it('应该处理Canvas操作异常', async () => {
      mockCanvasContext.fillText.mockImplementation(() => {
        throw new Error('Canvas操作失败')
      })

      const result = await validator.validateCanvasWatermark()

      expect(result).toBe(false)
      expect(_consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas水印验证失败'),
        expect.any(Error)
      )
    })

    it('应该处理多重验证失败', async () => {
      validator.validateCanvasWatermark = vi.fn().mockRejectedValue(new Error('Canvas失败'))
      validator.validateDynamicWatermark = vi.fn().mockRejectedValue(new Error('动态水印失败'))

      const result = await validator.validateAll()

      expect(result).toBeDefined()
      expect(result.overallScore).toBeLessThan(50) // 应该有较低的分数
    })
  })

  describe('资源清理', () => {
    it('应该正确清理验证资源', () => {
      validator.dispose()

      expect(validator.results).toEqual({})
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('清理水印验证资源'))
    })
  })

  describe('用户等级处理', () => {
    it('应该正确处理不同用户等级', () => {
      const tiers = ['free', 'premium', 'enterprise']

      tiers.forEach(tier => {
        const config = validator.getTierConfig(tier)
        expect(typeof config).toBe('object')
        expect(config).toHaveProperty('text')
        expect(config).toHaveProperty('opacity')
        expect(config).toHaveProperty('fontSize')
      })
    })

    it('应该处理无效用户等级', () => {
      const config = validator.getTierConfig('invalid')

      expect(config).toEqual(validator.getTierConfig('free')) // 应该降级到免费版
    })
  })
})
