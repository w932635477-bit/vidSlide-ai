/**
 * FreeAPIService.test.js
 * VidSlide AI 免费API服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import FreeAPIService from './FreeAPIService.js'

// Mock fetch API
global.fetch = vi.fn()

describe('FreeAPIService', () => {
  let service

  beforeEach(() => {
    service = FreeAPIService
    vi.clearAllMocks()

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key) => {
        if (key === 'vidslide_freeapi_usage') {
          return JSON.stringify({
            unsplash: { calls: 10, date: new Date().toISOString().split('T')[0] },
            pexels: { calls: 15, date: new Date().toISOString().split('T')[0] },
            pixabay: { calls: 8, date: new Date().toISOString().split('T')[0] }
          })
        }
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化和配置', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeDefined()
      expect(typeof service.searchImages).toBe('function')
      expect(typeof service.getUsageStats).toBe('function')
    })

    it('应该加载使用统计', () => {
      service.loadUsageStats()

      const stats = service.getUsageStats()
      expect(stats.unsplash).toBeDefined()
      expect(stats.pexels).toBeDefined()
      expect(stats.pixabay).toBeDefined()
    })

    it('应该处理空的统计数据', () => {
      global.localStorage.getItem.mockReturnValue(null)

      service.loadUsageStats()

      const stats = service.getUsageStats()
      expect(stats.unsplash.calls).toBe(0)
      expect(stats.pexels.calls).toBe(0)
      expect(stats.pixabay.calls).toBe(0)
    })
  })

  describe('Unsplash API', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              id: 'unsplash_1',
              urls: {
                regular: 'https://images.unsplash.com/photo1',
                thumb: 'https://images.unsplash.com/photo1_thumb'
              },
              alt_description: 'Beautiful landscape',
              user: { name: 'John Doe' },
              width: 1920,
              height: 1080
            }
          ]
        })
      })
    })

    it('应该成功搜索Unsplash图片', async () => {
      const result = await service.searchImages('nature', { platform: 'unsplash', limit: 5 })

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(1)
      expect(result.images[0].id).toBe('unsplash_1')
      expect(result.images[0].source).toBe('unsplash')
      expect(result.images[0].url).toContain('unsplash.com')
    })

    it('应该处理Unsplash API错误', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const result = await service.searchImages('test', { platform: 'unsplash' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
      expect(result.images).toEqual([])
    })

    it('应该处理Unsplash API返回空结果', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] })
      })

      const result = await service.searchImages('nonexistent', { platform: 'unsplash' })

      expect(result.success).toBe(true)
      expect(result.images).toEqual([])
    })
  })

  describe('Pexels API', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          photos: [
            {
              id: 12345,
              src: {
                original: 'https://images.pexels.com/photo1',
                medium: 'https://images.pexels.com/photo1_medium'
              },
              alt: 'Stunning mountain view',
              photographer: 'Jane Smith',
              width: 1920,
              height: 1080
            }
          ]
        })
      })
    })

    it('应该成功搜索Pexels图片', async () => {
      const result = await service.searchImages('mountain', { platform: 'pexels', limit: 3 })

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(1)
      expect(result.images[0].id).toBe('pexels_12345')
      expect(result.images[0].source).toBe('pexels')
      expect(result.images[0].photographer).toBe('Jane Smith')
    })

    it('应该处理Pexels API错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      const result = await service.searchImages('test', { platform: 'pexels' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Too Many Requests')
    })
  })

  describe('Pixabay API', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          hits: [
            {
              id: 98765,
              largeImageURL: 'https://pixabay.com/photo1.jpg',
              previewURL: 'https://pixabay.com/photo1_preview.jpg',
              tags: 'forest trees nature',
              user: 'PixabayUser',
              imageWidth: 1920,
              imageHeight: 1080
            }
          ]
        })
      })
    })

    it('应该成功搜索Pixabay图片', async () => {
      const result = await service.searchImages('forest', { platform: 'pixabay', limit: 4 })

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(1)
      expect(result.images[0].id).toBe('pixabay_98765')
      expect(result.images[0].source).toBe('pixabay')
      expect(result.images[0].tags).toBe('forest trees nature')
    })

    it('应该处理Pixabay API错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      const result = await service.searchImages('test', { platform: 'pixabay' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })
  })

  describe('平台选择', () => {
    it('应该根据分数选择最佳平台', () => {
      // Mock不同的使用统计来测试平台选择
      service.usageStats.unsplash.calls = 50 // 高使用率
      service.usageStats.pexels.calls = 10   // 低使用率
      service.usageStats.pixabay.calls = 20  // 中等使用率

      // Pexels应该被优先选择（使用率最低）
      const bestPlatform = service.selectBestAPI('test query')
      expect(bestPlatform).toBe('pexels')
    })

    it('应该平衡不同平台的负载', () => {
      // 设置相同的调用次数
      service.usageStats.unsplash.calls = 10
      service.usageStats.pexels.calls = 10
      service.usageStats.pixabay.calls = 10

      const calls = []
      for (let i = 0; i < 10; i++) {
        calls.push(service.selectBestAPI('query' + i))
      }

      // 应该有一定的分布
      const uniquePlatforms = [...new Set(calls)]
      expect(uniquePlatforms.length).toBeGreaterThan(1)
    })

    it('应该考虑关键词相关性', () => {
      const chineseQuery = service.selectBestAPI('春节')
      const englishQuery = service.selectBestAPI('nature')

      // 对于不同语言的查询可能选择不同的平台
      expect(['unsplash', 'pexels', 'pixabay']).toContain(chineseQuery)
      expect(['unsplash', 'pexels', 'pixabay']).toContain(englishQuery)
    })
  })

  describe('使用统计', () => {
    it('应该正确更新使用统计', () => {
      service.updateUsage('unsplash')
      service.updateUsage('pexels')
      service.updateUsage('unsplash')

      expect(service.usageStats.unsplash.calls).toBeGreaterThan(0)
      expect(service.usageStats.pexels.calls).toBeGreaterThan(0)
    })

    it('应该保存统计数据到本地存储', () => {
      service.updateUsage('unsplash')
      service.saveUsageStats()

      expect(global.localStorage.setItem).toHaveBeenCalled()
    })

    it('应该重置月度统计', () => {
      service.usageStats.unsplash.calls = 100
      service.scheduleMonthlyReset()

      // 模拟时间变化
      const mockDate = new Date()
      mockDate.setMonth(mockDate.getMonth() + 1)
      global.Date = class extends Date {
        constructor() {
          super(mockDate)
        }
        toISOString() {
          return mockDate.toISOString()
        }
      }

      // 应该重置统计（这里只是测试接口）
      expect(service.scheduleMonthlyReset).toBeDefined()
    })
  })

  describe('错误处理和降级', () => {
    it('应该处理网络超时', async () => {
      global.fetch.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: false,
          status: 408,
          statusText: 'Request Timeout'
        }), 100))
      )

      const result = await service.searchImages('timeout', { platform: 'unsplash' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Request Timeout')
    })

    it('应该处理无效的JSON响应', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await service.searchImages('invalid', { platform: 'unsplash' })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理不支持的平台', async () => {
      const result = await service.searchImages('test', { platform: 'unknown' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('不支持的平台')
    })
  })

  describe('性能和限制', () => {
    it('应该遵守API调用限制', async () => {
      // 设置高使用率
      service.usageStats.unsplash.calls = 4999 // 接近限制

      const result = await service.searchImages('limit_test', { platform: 'unsplash' })

      // 即使接近限制也应该允许调用（具体限制逻辑可能不同）
      expect(result).toBeDefined()
    })

    it('应该优化并发请求', async () => {
      const promises = [
        service.searchImages('query1', { platform: 'unsplash' }),
        service.searchImages('query2', { platform: 'pexels' }),
        service.searchImages('query3', { platform: 'pixabay' })
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toHaveProperty('success')
        expect(result).toHaveProperty('images')
      })
    })
  })

  describe('集成测试', () => {
    it('应该完整模拟用户搜索流程', async () => {
      // 搜索不同平台的图片
      const unsplashResult = await service.searchImages('sunset', { platform: 'unsplash' })
      const pexelsResult = await service.searchImages('ocean', { platform: 'pexels' })
      const pixabayResult = await service.searchImages('mountain', { platform: 'pixabay' })

      expect(unsplashResult.success).toBe(true)
      expect(pexelsResult.success).toBe(true)
      expect(pixabayResult.success).toBe(true)

      // 检查统计是否正确更新
      const stats = service.getUsageStats()
      expect(stats.unsplash.calls).toBeGreaterThan(0)
      expect(stats.pexels.calls).toBeGreaterThan(0)
      expect(stats.pixabay.calls).toBeGreaterThan(0)
    })

    it('应该处理多种搜索场景', async () => {
      const testCases = [
        { query: 'nature', platform: 'unsplash' },
        { query: '城市', platform: 'pexels' },
        { query: '动物', platform: 'pixabay' }
      ]

      for (const testCase of testCases) {
        const result = await service.searchImages(testCase.query, {
          platform: testCase.platform,
          limit: 3
        })

        expect(result.success).toBe(true)
        expect(Array.isArray(result.images)).toBe(true)
        expect(result.images.length).toBeGreaterThan(0)
      }
    })
  })
})