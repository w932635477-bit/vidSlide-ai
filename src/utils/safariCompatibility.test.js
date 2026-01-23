/**
 * SafariCompatibility 单元测试
 * 测试Safari兼容性检测和降级方案
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSafariCompatibilityChecker } from './safariCompatibility.js'

// Mock Web APIs
global.WebAssembly = {
  instantiate: vi.fn(() => Promise.resolve({ instance: { exports: { main: () => 42 } } }))
}

global.VideoEncoder = vi.fn()
global.VideoDecoder = vi.fn()
global.AudioEncoder = vi.fn()
global.AudioDecoder = vi.fn()

global.WebGLRenderingContext = vi.fn()
global.AudioContext = vi.fn()
global.webkitAudioContext = vi.fn()

global.SharedArrayBuffer = vi.fn()

// Mock navigator
const originalNavigator = navigator
const mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  vendor: 'Apple Computer, Inc.',
  hardwareConcurrency: 8,
  deviceMemory: 8
}

// Mock performance.memory
const originalPerformance = performance
const mockPerformance = {
  ...performance,
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 200 * 1024 * 1024
  }
}

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('SafariCompatibility', () => {
  let checker

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock global objects
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true
    })

    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true
    })

    checker = getSafariCompatibilityChecker()
  })

  afterEach(() => {
    vi.restoreAllMocks()

    // Restore original objects
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true
    })

    Object.defineProperty(window, 'performance', {
      value: originalPerformance,
      writable: true
    })
  })

  describe('浏览器检测', () => {
    it('应该正确检测Safari浏览器', () => {
      expect(checker.isSafari).toBe(true)
      expect(checker.safariVersion).toBe(15)
    })

    it('应该正确检测不同版本的Safari', () => {
      const testCases = [
        {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
          expectedVersion: 14
        },
        {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15',
          expectedVersion: 13
        },
        {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15',
          expectedVersion: 12
        }
      ]

      testCases.forEach(({ userAgent, expectedVersion }) => {
        Object.defineProperty(window, 'navigator', {
          value: { ...mockNavigator, userAgent },
          writable: true
        })

        const testChecker = getSafariCompatibilityChecker()
        expect(testChecker.safariVersion).toBe(expectedVersion)
      })
    })

    it('应该正确检测非Safari浏览器', () => {
      const nonSafariUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      ]

      nonSafariUserAgents.forEach(userAgent => {
        Object.defineProperty(window, 'navigator', {
          value: { ...mockNavigator, userAgent },
          writable: true
        })

        const testChecker = getSafariCompatibilityChecker()
        expect(testChecker.isSafari).toBe(false)
      })
    })
  })

  describe('WebAssembly支持检测', () => {
    it('应该检测WebAssembly支持', async () => {
      const result = await checker.checkWebAssemblySupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('performance')
    })

    it('应该处理WebAssembly不支持的情况', async () => {
      delete global.WebAssembly

      const result = await checker.checkWebAssemblySupport()

      expect(result.supported).toBe(false)
      expect(result.reason).toContain('WebAssembly API not available')
    })
  })

  describe('WebCodecs API检测', () => {
    it('应该检测WebCodecs API支持', () => {
      const result = checker.checkWebCodecsSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('videoEncoder')
      expect(result).toHaveProperty('videoDecoder')
      expect(result).toHaveProperty('note')
    })

    it('应该在Safari中返回不支持', () => {
      const result = checker.checkWebCodecsSupport()

      expect(result.supported).toBe(false)
      expect(result.note).toContain('Safari does not support WebCodecs API')
    })
  })

  describe('WebGL支持检测', () => {
    it('应该检测WebGL支持', () => {
      const result = checker.checkWebGLSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('renderer')
      expect(result).toHaveProperty('version')
    })

    it('应该处理WebGL上下文创建失败', () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      const result = checker.checkWebGLSupport()

      expect(result.supported).toBe(false)
      expect(result.reason).toContain('WebGL context not available')

      // Restore
      HTMLCanvasElement.prototype.getContext = originalGetContext
    })
  })

  describe('SharedArrayBuffer检测', () => {
    it('应该检测SharedArrayBuffer支持', () => {
      const result = checker.checkSharedArrayBufferSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('hasSharedArrayBuffer')
      expect(result).toHaveProperty('isCrossOriginIsolated')
    })

    it('应该处理跨域隔离未启用', () => {
      Object.defineProperty(window, 'crossOriginIsolated', {
        value: false,
        writable: true
      })

      const result = checker.checkSharedArrayBufferSupport()

      expect(result.supported).toBe(false)
      expect(result.note).toContain('Cross-Origin-Embedder-Policy')
    })
  })

  describe('MediaRecorder检测', () => {
    it('应该检测MediaRecorder支持', () => {
      global.MediaRecorder = {
        isTypeSupported: vi.fn(() => true)
      }

      const result = checker.checkMediaRecorderSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('supportedFormats')
      expect(result).toHaveProperty('preferredFormat')
    })

    it('应该处理MediaRecorder不支持的情况', () => {
      delete global.MediaRecorder

      const result = checker.checkMediaRecorderSupport()

      expect(result.supported).toBe(false)
      expect(result.reason).toContain('MediaRecorder not available')
    })
  })

  describe('Web Audio API检测', () => {
    it('应该检测Web Audio API支持', () => {
      const result = checker.checkWebAudioSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('audioContext')
      expect(result).toHaveProperty('sampleRate')
    })

    it('应该处理Web Audio API不支持的情况', () => {
      delete global.AudioContext
      delete global.webkitAudioContext

      const result = checker.checkWebAudioSupport()

      expect(result.supported).toBe(false)
      expect(result.reason).toContain('Web Audio API not available')
    })
  })

  describe('IndexedDB检测', () => {
    it('应该检测IndexedDB支持', () => {
      const result = checker.checkIndexedDBSupport()

      expect(result).toHaveProperty('supported')
      expect(result).toHaveProperty('version')
    })

    it('应该处理IndexedDB不支持的情况', () => {
      const originalIndexedDB = global.indexedDB
      delete global.indexedDB

      const result = checker.checkIndexedDBSupport()

      expect(result.supported).toBe(false)

      // Restore
      global.indexedDB = originalIndexedDB
    })
  })

  describe('全面兼容性检查', () => {
    it('应该运行完整的兼容性检查', async () => {
      const results = await checker.runCompatibilityCheck()

      expect(results).toHaveProperty('browser')
      expect(results).toHaveProperty('webassembly')
      expect(results).toHaveProperty('webcodecs')
      expect(results).toHaveProperty('webgl')
      expect(results).toHaveProperty('sharedArrayBuffer')
      expect(results).toHaveProperty('mediaRecorder')
      expect(results).toHaveProperty('webAudio')
      expect(results).toHaveProperty('indexedDB')
    })

    it('应该生成降级策略', async () => {
      await checker.runCompatibilityCheck()
      checker.generateFallbackStrategies()

      expect(checker.fallbackStrategies).toHaveProperty('videoExport')
      expect(checker.fallbackStrategies).toHaveProperty('audioProcessing')
      expect(checker.fallbackStrategies).toHaveProperty('imageProcessing')
      expect(checker.fallbackStrategies).toHaveProperty('storage')
      expect(checker.fallbackStrategies).toHaveProperty('performance')
    })
  })

  describe('兼容性摘要', () => {
    it('应该生成兼容性摘要', async () => {
      await checker.runCompatibilityCheck()

      const summary = checker.getCompatibilitySummary()

      expect(summary).toHaveProperty('browser')
      expect(summary).toHaveProperty('overallScore')
      expect(summary).toHaveProperty('supportedFeatures')
      expect(summary).toHaveProperty('unsupportedFeatures')
      expect(summary).toHaveProperty('recommendations')
    })

    it('应该提供有用的建议', async () => {
      await checker.runCompatibilityCheck()

      const summary = checker.getCompatibilitySummary()

      expect(Array.isArray(summary.recommendations)).toBe(true)
      expect(summary.recommendations.length).toBeGreaterThan(0)
      expect(summary.recommendations.every(rec => typeof rec === 'string')).toBe(true)
    })
  })

  describe('降级策略', () => {
    it('应该提供视频导出降级策略', async () => {
      await checker.runCompatibilityCheck()

      const videoStrategy = checker.fallbackStrategies.videoExport

      expect(videoStrategy).toHaveProperty('primary')
      expect(videoStrategy).toHaveProperty('note')
    })

    it('应该提供音频处理降级策略', async () => {
      await checker.runCompatibilityCheck()

      const audioStrategy = checker.fallbackStrategies.audioProcessing

      expect(audioStrategy).toHaveProperty('primary')
      expect(typeof audioStrategy.primary).toBe('string')
    })

    it('应该提供图像处理降级策略', async () => {
      await checker.runCompatibilityCheck()

      const imageStrategy = checker.fallbackStrategies.imageProcessing

      expect(imageStrategy).toHaveProperty('primary')
      expect(typeof imageStrategy.primary).toBe('string')
    })

    it('应该提供存储降级策略', async () => {
      await checker.runCompatibilityCheck()

      const storageStrategy = checker.fallbackStrategies.storage

      expect(storageStrategy).toHaveProperty('primary')
      expect(typeof storageStrategy.primary).toBe('string')
    })

    it('应该提供性能优化策略', async () => {
      await checker.runCompatibilityCheck()

      const performanceStrategy = checker.fallbackStrategies.performance

      expect(performanceStrategy).toHaveProperty('animationFrame')
      expect(Array.isArray(performanceStrategy.recommendations)).toBe(true)
    })
  })

  describe('全局函数', () => {
    it('应该提供全局兼容性检查函数', async () => {
      const { checkSafariCompatibility } = await import('./safariCompatibility.js')
      const results = await checkSafariCompatibility()

      expect(results).toHaveProperty('browser')
      expect(results).toHaveProperty('webassembly')
    })

    it('应该提供全局兼容性摘要函数', () => {
      const { getSafariCompatibilitySummary } = require('./safariCompatibility.js')
      const summary = getSafariCompatibilitySummary()

      expect(summary).toHaveProperty('error') // Since no check has been run
    })

    it('应该提供全局降级策略函数', () => {
      const { getSafariFallbackStrategies } = require('./safariCompatibility.js')
      const strategies = getSafariFallbackStrategies()

      expect(typeof strategies).toBe('object')
    })
  })

  describe('自动检测', () => {
    it('应该在Safari浏览器中自动运行检测', () => {
      // This would normally happen on page load
      // We just verify the checker is properly initialized
      expect(checker.isSafari).toBe(true)
      expect(typeof checker.safariVersion).toBe('number')
    })
  })
})
