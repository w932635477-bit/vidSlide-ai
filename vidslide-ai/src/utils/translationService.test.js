/**
 * translationService.test.js
 * VidSlide AI - 翻译服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { TranslationService } from './translationService.js'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('TranslationService', () => {
  let translationService

  beforeEach(() => {
    vi.clearAllMocks()
    translationService = new TranslationService({
      appid: 'test-appid',
      key: 'test-key'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化翻译服务', () => {
      expect(translationService).toBeDefined()
      expect(translationService.config).toBeDefined()
      expect(translationService.cache).toBeDefined()
    })

    it('应该有默认配置', () => {
      expect(translationService.config.appid).toBe('test-appid')
      expect(translationService.config.key).toBe('test-key')
      expect(translationService.config.from).toBe('zh')
      expect(translationService.config.to).toBe('en')
    })

    it('应该初始化空的缓存', () => {
      expect(translationService.cache.size).toBe(0)
    })
  })

  describe('文本翻译', () => {
    it('应该处理空文本', async () => {
      const result = await translationService.translate('')
      expect(result).toBe('')

      const result2 = await translationService.translate(null)
      expect(result2).toBe(null)
    })

    it('应该翻译文本', async () => {
      const mockResponse = {
        trans_result: [
          {
            src: '你好',
            dst: 'Hello'
          }
        ]
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await translationService.translate('你好')

      expect(result).toBe('Hello')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('应该处理翻译API错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      })

      await expect(translationService.translate('test')).rejects.toThrow()
    })

    it('应该处理网络错误', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await expect(translationService.translate('test')).rejects.toThrow('Network error')
    })
  })

  describe('缓存功能', () => {
    it('应该使用缓存的翻译结果', async () => {
      // 第一次调用
      const mockResponse = {
        trans_result: [{ src: 'hello', dst: '你好' }]
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result1 = await translationService.translate('hello')
      expect(result1).toBe('你好')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // 第二次调用应该使用缓存
      const result2 = await translationService.translate('hello')
      expect(result2).toBe('你好')
      expect(global.fetch).toHaveBeenCalledTimes(1) // 没有额外的API调用
    })

    it('应该清理过期缓存', () => {
      const cacheKey = 'test-key'
      const cacheValue = 'test-value'

      translationService.setCache(cacheKey, cacheValue)

      expect(translationService.getFromCache(cacheKey)).toBe(cacheValue)

      // 模拟缓存过期
      translationService.cacheExpiry = -1
      expect(translationService.getFromCache(cacheKey)).toBeNull()
    })

    it('应该手动清理缓存', () => {
      translationService.setCache('key1', 'value1')
      translationService.setCache('key2', 'value2')

      expect(translationService.cache.size).toBe(2)

      translationService.clearCache()
      expect(translationService.cache.size).toBe(0)
    })
  })

  describe('语言检测', () => {
    it('应该检测中文文本', () => {
      expect(translationService.detectLanguage('你好世界')).toBe('zh')
      expect(translationService.detectLanguage('这是一个测试')).toBe('zh')
    })

    it('应该检测英文文本', () => {
      expect(translationService.detectLanguage('Hello world')).toBe('en')
      expect(translationService.detectLanguage('This is a test')).toBe('en')
    })

    it('应该检测混合文本', () => {
      expect(translationService.detectLanguage('Hello 你好')).toBe('auto')
    })
  })

  describe('翻译选项', () => {
    it('应该支持自定义源语言', async () => {
      const mockResponse = {
        trans_result: [{ src: 'Hello', dst: 'Hola' }]
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await translationService.translate('Hello', {
        from: 'en',
        to: 'es'
      })

      expect(result).toBe('Hola')
      // 验证API调用包含正确的参数
      const callArgs = global.fetch.mock.calls[0][0]
      expect(callArgs).toContain('from=en')
      expect(callArgs).toContain('to=es')
    })

    it('应该支持多种目标语言', async () => {
      const languages = ['en', 'ja', 'ko', 'fr', 'de']

      for (const lang of languages) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            trans_result: [{ src: '测试', dst: `translated-${lang}` }]
          })
        })

        const result = await translationService.translate('测试', { to: lang })
        expect(result).toBe(`translated-${lang}`)
      }
    })
  })

  describe('错误处理', () => {
    it('应该处理API限制错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      await expect(translationService.translate('test')).rejects.toThrow()
    })

    it('应该处理无效的JSON响应', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(translationService.translate('test')).rejects.toThrow()
    })

    it('应该处理超时错误', async () => {
      global.fetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: false,
          status: 408,
          statusText: 'Request Timeout'
        }), 100))
      )

      await expect(translationService.translate('test')).rejects.toThrow()
    })
  })

  describe('批量翻译', () => {
    it('应该支持批量翻译', async () => {
      const texts = ['Hello', 'World', 'Test']
      const mockResponses = texts.map((text, index) => ({
        trans_result: [{ src: text, dst: `翻译${index + 1}` }]
      }))

      mockResponses.forEach(response => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response)
        })
      })

      const results = await translationService.translateBatch(texts)

      expect(results).toHaveLength(3)
      expect(results[0]).toBe('翻译1')
      expect(results[1]).toBe('翻译2')
      expect(results[2]).toBe('翻译3')
    })

    it('应该并发处理批量翻译', async () => {
      const texts = ['text1', 'text2', 'text3']

      // Mock concurrent responses
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          trans_result: [{ src: 'text', dst: '翻译' }]
        })
      })

      const startTime = Date.now()
      await translationService.translateBatch(texts, { concurrency: 3 })
      const endTime = Date.now()

      // 并发处理应该比顺序处理快
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('性能监控', () => {
    it('应该跟踪翻译统计', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          trans_result: [{ src: 'test', dst: '测试' }]
        })
      })

      await translationService.translate('test')
      await translationService.translate('another test')

      const stats = translationService.getStats()
      expect(stats).toHaveProperty('totalRequests')
      expect(stats).toHaveProperty('cacheHits')
      expect(stats).toHaveProperty('cacheMisses')
      expect(stats.totalRequests).toBeGreaterThan(0)
    })

    it('应该监控响应时间', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          trans_result: [{ src: 'test', dst: '测试' }]
        })
      })

      await translationService.translate('performance test')

      const stats = translationService.getStats()
      expect(stats).toHaveProperty('averageResponseTime')
      expect(stats.averageResponseTime).toBeGreaterThan(0)
    })
  })
})