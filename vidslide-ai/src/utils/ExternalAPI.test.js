/**
 * ExternalAPI 单元测试
 * 测试外部API集成核心功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

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

describe('ExternalAPI', () => {
  let externalAPI

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import to avoid hoisting issues
    const { ExternalAPI } = await import('./ExternalAPI.js')
    externalAPI = new ExternalAPI()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化ExternalAPI实例', () => {
      expect(externalAPI).toBeDefined()
      expect(typeof externalAPI.searchAssets).toBe('function')
      expect(typeof externalAPI.downloadAsset).toBe('function')
      expect(typeof externalAPI.checkCopyright).toBe('function')
    })

    it('应该加载API配置', () => {
      expect(externalAPI.apiKeys).toBeDefined()
      expect(externalAPI.rateLimits).toBeDefined()
    })
  })

  describe('素材搜索', () => {
    const mockSearchResponse = {
      results: [
        {
          id: 'unsplash-1',
          urls: { regular: 'https://example.com/image1.jpg' },
          alt_description: 'Test image 1',
          user: { name: 'Test User' },
          width: 1920,
          height: 1080
        }
      ],
      total: 1,
      total_pages: 1
    }

    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse)
      })
    })

    it('应该能够搜索Unsplash素材', async () => {
      const result = await externalAPI.searchFromAPI('nature', 'unsplash', 1, 10)

      expect(result.success).toBe(true)
      expect(result.assets).toHaveLength(1)
      expect(result.assets[0].name).toContain('Test image')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('unsplash.com'),
        expect.any(Object)
      )
    })

    it('应该能够搜索Pexels素材', async () => {
      const result = await externalAPI.searchFromAPI('ocean', 'pexels', 1, 10)

      expect(result.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pexels.com'),
        expect.any(Object)
      )
    })

    it('应该处理搜索失败', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('应该处理API限制', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API rate limit')
    })
  })

  describe('素材下载', () => {
    const mockAsset = {
      id: 'test-asset',
      name: 'Test Asset',
      url: 'https://example.com/test.jpg',
      source: 'unsplash',
      type: 'image'
    }

    it('应该能够下载素材', async () => {
      const blob = new Blob(['test image data'], { type: 'image/jpeg' })
      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blob)
      })

      const result = await externalAPI.downloadAsset(mockAsset)

      expect(result.success).toBe(true)
      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.blob.type).toBe('image/jpeg')
    })

    it('应该处理下载失败', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Download failed'))

      const result = await externalAPI.downloadAsset(mockAsset)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Download failed')
    })

    it('应该处理版权检查', async () => {
      const result = await externalAPI.checkCopyright(mockAsset)

      expect(result).toHaveProperty('isAllowed')
      expect(result).toHaveProperty('license')
      expect(result).toHaveProperty('warnings')
    })
  })

  describe('关键词翻译', () => {
    it('应该能够翻译关键词', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            trans_result: [{ dst: 'nature', src: '自然' }]
          })
      })

      const result = await externalAPI.translateKeyword('自然')

      expect(result.success).toBe(true)
      expect(result.translation).toBe('nature')
    })

    it('应该处理翻译失败', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Translation failed'))

      const result = await externalAPI.translateKeyword('测试')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Translation failed')
    })

    it('应该缓存翻译结果', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            trans_result: [{ dst: 'mountain', src: '山' }]
          })
      })

      // 第一次翻译
      await externalAPI.translateKeyword('山')

      // 第二次应该使用缓存
      const result = await externalAPI.translateKeyword('山')

      expect(result.success).toBe(true)
      expect(result.translation).toBe('mountain')
      // fetch 应该只被调用一次
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('API密钥管理', () => {
    it('应该能够设置API密钥', () => {
      externalAPI.setApiKey('unsplash', 'test-key-123')

      expect(localStorage.setItem).toHaveBeenCalledWith('vidslide-unsplash-key', 'test-key-123')
    })

    it('应该能够获取API密钥', () => {
      localStorageMock.getItem.mockReturnValue('stored-key-456')

      const key = externalAPI.getApiKey('unsplash')

      expect(key).toBe('stored-key-456')
      expect(localStorage.getItem).toHaveBeenCalledWith('vidslide-unsplash-key')
    })

    it('应该验证API密钥有效性', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      const isValid = await externalAPI.validateApiKey('unsplash', 'test-key')

      expect(typeof isValid).toBe('boolean')
    })
  })

  describe('速率限制', () => {
    it('应该遵守API速率限制', async () => {
      // Mock rate limit exceeded
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429
      })

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).toContain('rate limit')
    })

    it('应该实现请求队列', async () => {
      const promises = []

      // 模拟并发请求
      for (let i = 0; i < 5; i++) {
        promises.push(externalAPI.searchFromAPI(`query${i}`, 'unsplash', 1, 10))
      }

      const results = await Promise.all(promises)

      // 所有请求都应该成功或按预期失败
      results.forEach(result => {
        expect(result).toHaveProperty('success')
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理网络超时', async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: false,
                  status: 408,
                  statusText: 'Request Timeout'
                }),
              100
            )
          )
      )

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('应该处理无效响应', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
    })

    it('应该提供用户友好的错误消息', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network is unreachable'))

      const result = await externalAPI.searchFromAPI('test', 'unsplash', 1, 10)

      expect(result.success).toBe(false)
      expect(result.error).not.toBe('Network is unreachable') // Should be user-friendly
    })
  })
})
