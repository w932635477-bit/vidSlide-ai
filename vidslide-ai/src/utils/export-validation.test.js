/**
 * ExportValidation 单元测试
 * 测试导出功能的技术验证工具
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExportValidator } from './export-validation.js'

// Mock DOM APIs
global.document = {
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 }))
    })),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    width: 1920,
    height: 1080
  })),
  createElementNS: vi.fn()
}

global.window = {
  MediaRecorder: vi.fn(),
  VideoEncoder: vi.fn(),
  VideoDecoder: vi.fn(),
  Blob: vi.fn(),
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url')
  }
}

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('ExportValidator', () => {
  let validator

  beforeEach(() => {
    vi.clearAllMocks()
    validator = new ExportValidator()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化ExportValidator实例', () => {
      expect(validator).toBeInstanceOf(ExportValidator)
      expect(validator.results).toBeDefined()
      expect(typeof validator.results).toBe('object')
    })

    it('应该初始化所有验证项目的结果', () => {
      expect(validator.results.webCodecs).toBeDefined()
      expect(validator.results.mediaRecorder).toBeDefined()
      expect(validator.results.htmlExport).toBeDefined()
      expect(validator.results.pdfGeneration).toBeDefined()
      expect(validator.results.pptxExport).toBeDefined()
    })
  })

  describe('validateWebCodecs方法', () => {
    it('应该在支持WebCodecs时返回true', async () => {
      global.window.VideoEncoder = vi.fn()
      global.window.VideoDecoder = vi.fn()

      const _result = await validator.validateWebCodecs()

      expect(result).toBe(true)
      expect(validator.results.webCodecs.supported).toBe(true)
    })

    it('应该在不支持WebCodecs时返回false', async () => {
      delete global.window.VideoEncoder
      delete global.window.VideoDecoder

      const _result = await validator.validateWebCodecs()

      expect(result).toBe(false)
      expect(validator.results.webCodecs.supported).toBe(false)
    })
  })

  describe('validateMediaRecorder方法', () => {
    it('应该验证MediaRecorder的基本功能', async () => {
      const _result = await validator.validateMediaRecorder()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证MediaRecorder支持'))
    })

    it('应该处理MediaRecorder不可用的情况', async () => {
      delete global.window.MediaRecorder

      const _result = await validator.validateMediaRecorder()

      expect(result).toBe(false)
      expect(validator.results.mediaRecorder.supported).toBe(false)
    })
  })

  describe('validateHtmlExport方法', () => {
    it('应该验证HTML导出的基本功能', async () => {
      const _result = await validator.validateHtmlExport()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证HTML导出支持'))
    })

    it('应该测试DataURL生成功能', async () => {
      const _result = await validator.validateHtmlExport()

      // 验证是否测试了DataURL功能
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('DataURL'))
    })
  })

  describe('validatePdfGeneration方法', () => {
    it('应该验证PDF生成功能', async () => {
      const _result = await validator.validatePdfGeneration()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证PDF生成支持'))
    })
  })

  describe('validatePptxExport方法', () => {
    it('应该验证PPTX导出功能', async () => {
      const _result = await validator.validatePptxExport()

      expect(typeof result).toBe('boolean')
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证PPTX导出支持'))
    })
  })

  describe('validateAll方法', () => {
    it('应该运行所有验证项目', async () => {
      const _result = await validator.validateAll()

      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('overallScore')
      expect(result).toHaveProperty('recommendations')
      expect(result).toHaveProperty('nextSteps')

      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('开始全面导出功能验证'))
    })

    it('应该计算总体得分', async () => {
      const _result = await validator.validateAll()

      expect(typeof result.overallScore).toBe('number')
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
    })

    it('应该提供实施建议', async () => {
      const _result = await validator.validateAll()

      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(Array.isArray(result.nextSteps)).toBe(true)
    })
  })

  describe('辅助方法', () => {
    it('应该提供支持检测结果', () => {
      const support = validator.getSupportSummary()

      expect(typeof support).toBe('object')
      expect(support).toHaveProperty('webCodecs')
      expect(support).toHaveProperty('mediaRecorder')
      expect(support).toHaveProperty('htmlExport')
    })

    it('应该提供性能基准', () => {
      const benchmarks = validator.getPerformanceBenchmarks()

      expect(typeof benchmarks).toBe('object')
      expect(benchmarks).toHaveProperty('encodingSpeed')
      expect(benchmarks).toHaveProperty('fileSize')
      expect(benchmarks).toHaveProperty('memoryUsage')
    })
  })

  describe('错误处理', () => {
    it('应该处理验证过程中的错误', async () => {
      // Mock一个会失败的验证方法
      validator.validateWebCodecs = vi.fn().mockRejectedValue(new Error('验证失败'))

      const _result = await validator.validateAll()

      expect(result).toBeDefined()
      expect(_consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('验证失败'),
        expect.any(Error)
      )
    })

    it('应该在部分验证失败时继续其他验证', async () => {
      validator.validateWebCodecs = vi.fn().mockRejectedValue(new Error('WebCodecs失败'))

      const _result = await validator.validateAll()

      expect(result).toBeDefined()
      // 其他验证应该仍然运行
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('验证MediaRecorder'))
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      validator.dispose()

      expect(validator.results).toEqual({})
      expect(_consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('清理验证资源'))
    })
  })
})
