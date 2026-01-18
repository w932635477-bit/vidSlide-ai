/** * TranslationService.test.js * VidSlide AI 翻译服务测试 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import TranslationService from './TranslationService.js'

describe('TranslationService', () => {
  let translationService

  beforeEach(() => {
    translationService = new TranslationService()
    vi.clearAllMocks()
    // 默认 mock fetch 返回成功响应
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          trans_result: [{ dst: 'translated text' }],
          error_code: 0
        })
    })
  })

  describe('初始化', () => {
    it('应该正确初始化翻译服务', async () => {
      await translationService.initialize()

      expect(translationService.appId).toBeDefined()
      expect(translationService.secretKey).toBeDefined()
    })

    it('应该预加载热门翻译词汇', async () => {
      await translationService.initialize()

      expect(translationService.cache.size).toBeGreaterThan(0)
      expect(translationService.cache.has('春节')).toBe(true)
    })
  })

  describe('翻译功能', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该跳过纯英文翻译', async () => {
      const result = await translationService.translate('nature')

      expect(result).toBe('nature') // 应该返回原文
      expect(translationService.cache.size).toBeGreaterThan(0) // 预加载的缓存
    })

    it('应该使用预翻译的热门词汇', async () => {
      const result = await translationService.translate('春节')

      expect(result).toBe('Spring Festival')
      expect(translationService.cacheHits).toBeGreaterThan(0)
    })

    it('应该缓存翻译结果', async () => {
      // 第一次翻译（可能调用API）
      const result1 = await translationService.translate('测试关键词')

      // 第二次翻译（应该使用缓存）
      const result2 = await translationService.translate('测试关键词')

      expect(result1).toBe(result2)
      expect(translationService.cacheHits).toBeGreaterThan(0)
    })

    it('应该处理API调用失败', async () => {
      // Mock fetch失败
      global.fetch = vi.fn().mockRejectedValue(new Error('网络错误'))

      const result = await translationService.translate('测试关键词')

      expect(result).toBe('测试关键词') // 失败时返回原文
      expect(translationService.errorCount).toBeGreaterThan(0)
    })

    it('应该处理空关键词', async () => {
      const result = await translationService.translate('')

      expect(result).toBe('')
    })

    it('应该处理null关键词', async () => {
      const result = await translationService.translate(null)

      expect(result).toBe(null)
    })
  })

  describe('API调用', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该正确生成签名', () => {
      const appid = 'test_appid'
      const text = 'hello'
      const salt = '12345'
      const key = 'test_key'

      const sign = translationService.generateSign(appid, text, salt, key)

      expect(typeof sign).toBe('string')
      expect(sign.length).toBeGreaterThan(0)
    })

    it('应该正确调用百度翻译API', async () => {
      const mockResponse = {
        trans_result: [{ dst: '你好' }],
        error_code: 0
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await translationService.callBaiduAPI('hello')

      expect(result).toBe('你好')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fanyi-api.baidu.com'),
        expect.any(Object)
      )
    })

    it('应该处理API错误响应', async () => {
      const mockResponse = {
        error_code: 52001,
        error_msg: '翻译失败'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await expect(translationService.callBaiduAPI('test')).rejects.toThrow('百度翻译API错误')
    })

    it('应该处理网络错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('网络连接失败'))

      await expect(translationService.callBaiduAPI('test')).rejects.toThrow('网络连接失败')
    })

    it('应该处理HTTP错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(translationService.callBaiduAPI('test')).rejects.toThrow('HTTP 500')
    })
  })

  describe('批量翻译', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该支持批量翻译', async () => {
      const keywords = ['春节', '人工智能', 'nature']

      const results = await translationService.translateBatch(keywords)

      expect(results).toHaveProperty('春节')
      expect(results).toHaveProperty('人工智能')
      expect(results).toHaveProperty('nature')
      expect(results['春节']).toBe('Spring Festival')
      expect(results['nature']).toBe('nature') // 英文不翻译
    })

    it('应该处理批量翻译中的错误', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('网络错误'))

      const keywords = ['测试1', '测试2']
      const results = await translationService.translateBatch(keywords)

      expect(results['测试1']).toBe('测试1') // 失败时返回原文
      expect(results['测试2']).toBe('测试2')
    })
  })

  describe('缓存管理', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该控制缓存大小', async () => {
      // 填充缓存超过限制
      for (let i = 0; i < translationService.cacheMaxSize + 10; i++) {
        await translationService.translate(`关键词${i}`)
      }

      expect(translationService.cache.size).toBeLessThanOrEqual(translationService.cacheMaxSize)
    })

    it('应该清空调存', () => {
      translationService.cache.set('test', {
        translation: 'result',
        source: 'test',
        timestamp: Date.now()
      })
      expect(translationService.cache.size).toBeGreaterThan(0)

      translationService.clearCache()
      expect(translationService.cache.size).toBe(0)
    })

    it('应该重新加载预翻译词汇', () => {
      translationService.clearCache()
      translationService.initialize()

      expect(translationService.cache.size).toBeGreaterThan(0)
      expect(translationService.cache.has('春节')).toBe(true)
    })
  })

  describe('统计信息', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该提供翻译统计', async () => {
      await translationService.translate('春节') // 缓存命中
      await translationService.translate('新关键词') // 需要翻译

      const stats = translationService.getTranslationStats()

      expect(stats).toHaveProperty('totalRequests')
      expect(stats).toHaveProperty('apiRequests')
      expect(stats).toHaveProperty('cacheHits')
      expect(stats).toHaveProperty('errorRate')
      expect(stats).toHaveProperty('cacheSize')

      expect(stats.cacheHits).toBeGreaterThan(0)
      expect(stats.cacheSize).toBeGreaterThan(0)
    })

    it('应该正确计算缓存命中率', async () => {
      // 重置统计
      translationService.cacheHits = 0
      translationService.requestCount = 0

      await translationService.translate('春节') // 缓存命中
      await translationService.translate('另一个关键词') // 假设API调用

      const stats = translationService.getTranslationStats()
      expect(stats.cacheHitRate).toBeGreaterThan(0)
    })
  })

  describe('自定义翻译', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该允许添加自定义翻译', () => {
      translationService.addCustomTranslation('自定义', 'custom')

      const result = translationService.getFromCache('自定义')
      expect(result).toBe('custom')
    })

    it('应该返回预翻译词汇列表', () => {
      const preTranslations = translationService.getPreTranslations()

      expect(preTranslations).toHaveProperty('春节')
      expect(preTranslations['春节']).toBe('Spring Festival')
      expect(Object.keys(preTranslations).length).toBeGreaterThan(0)
    })
  })

  describe('连接测试', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该测试API连接性', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            trans_result: [{ dst: 'world' }],
            error_code: 0
          })
      })

      const result = await translationService.testConnection()

      expect(result.success).toBe(true)
      expect(result.testWord).toBe('测试')
      expect(result.result).toBeDefined()
    })

    it('应该处理连接测试失败', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('连接失败'))

      const result = await translationService.testConnection()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('边界情况', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该处理包含特殊字符的文本', async () => {
      const result = await translationService.translate('Hello, 世界！')

      expect(typeof result).toBe('string')
      // 由于mock，实际结果可能不同，但不应该抛出错误
    })

    it('应该处理长文本', async () => {
      const longText =
        '这是一个非常长的中文文本，用于测试翻译服务是否能够正确处理较长的输入内容。'.repeat(10)

      const result = await translationService.translate(longText)

      expect(typeof result).toBe('string')
    })

    it('应该处理重复请求', async () => {
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(translationService.translate('重复关键词'))
      }

      const results = await Promise.all(promises)

      // 所有结果都应该相同
      const firstResult = results[0]
      results.forEach(result => {
        expect(result).toBe(firstResult)
      })
    })
  })

  describe('性能测试', () => {
    beforeEach(async () => {
      await translationService.initialize()
    })

    it('应该快速响应缓存命中', async () => {
      // 预热缓存
      await translationService.translate('春节')

      const startTime = Date.now()
      const result = await translationService.translate('春节')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(10) // 缓存命中应该非常快
      expect(result).toBe('Spring Festival')
    })

    it('应该处理并发请求', async () => {
      const keywords = ['春节', '人工智能', '传统文化', '新能源']

      const startTime = Date.now()
      const results = await Promise.all(keywords.map(k => translationService.translate(k)))
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // 并发请求应该在1秒内完成
      expect(results.length).toBe(4)
      expect(results[0]).toBe('Spring Festival')
    })
  })
})
