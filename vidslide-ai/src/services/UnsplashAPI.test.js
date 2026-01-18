/**
 * UnsplashAPI.test.js
 * VidSlide AI - Unsplash API服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import UnsplashAPI from './UnsplashAPI.js'

// Mock fetch
global.fetch = vi.fn()

describe('UnsplashAPI', () => {
  let unsplashAPI

  beforeEach(() => {
    vi.clearAllMocks()
    unsplashAPI = new UnsplashAPI()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化Unsplash API服务', () => {
      expect(unsplashAPI).toBeDefined()
      expect(unsplashAPI.apiKey).toBe('YOUR_UNSPLASH_ACCESS_KEY')
      expect(unsplashAPI.baseUrl).toBe('https://api.unsplash.com')
      expect(unsplashAPI.cache).toBeDefined()
    })

    it('应该初始化为空的缓存', () => {
      expect(unsplashAPI.cache.size).toBe(0)
    })
  })

  describe('照片搜索', () => {
    it('应该搜索照片', async () => {
      const mockResponse = {
        results: [
          {
            id: 'photo1',
            urls: {
              raw: 'https://images.unsplash.com/photo1_raw',
              full: 'https://images.unsplash.com/photo1_full',
              regular: 'https://images.unsplash.com/photo1_regular',
              small: 'https://images.unsplash.com/photo1_small',
              thumb: 'https://images.unsplash.com/photo1_thumb'
            },
            alt_description: 'Beautiful landscape',
            description: 'A beautiful landscape photo',
            user: {
              name: 'John Doe',
              username: 'johndoe',
              profile_image: { medium: 'https://example.com/avatar.jpg' }
            },
            width: 1920,
            height: 1080,
            likes: 42,
            tags: [{ title: 'nature' }, { title: 'landscape' }]
          }
        ],
        total: 1,
        total_pages: 1
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const results = await unsplashAPI.searchPhotos('nature')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(1)
      expect(results[0].id).toBe('photo1')
      expect(results[0].url).toBe('https://images.unsplash.com/photo1_regular')
    })

    it('应该使用缓存的搜索结果', async () => {
      const mockResponse = {
        results: [{ id: 'cached', urls: { regular: 'cached.jpg' } }],
        total: 1,
        total_pages: 1
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // 第一次搜索
      const results1 = await unsplashAPI.searchPhotos('test')
      expect(results1).toBeDefined()

      // 检查缓存
      const cacheKey = 'search_test_1_20_landscape_undefined_relevant'
      expect(unsplashAPI.cache.has(cacheKey)).toBe(true)

      // 第二次搜索应该使用缓存
      global.fetch.mockClear()
      const results2 = await unsplashAPI.searchPhotos('test')
      expect(results2).toEqual(results1)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('应该处理搜索选项', async () => {
      const mockResponse = {
        results: [{ id: 'test', urls: { regular: 'test.jpg' } }],
        total: 1,
        total_pages: 1
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const options = {
        page: 2,
        perPage: 30,
        orientation: 'portrait',
        color: 'blue',
        orderBy: 'latest'
      }

      const results = await unsplashAPI.searchPhotos('ocean', options)

      expect(results).toBeDefined()
      // 验证请求参数
      const callArgs = global.fetch.mock.calls[0][0]
      expect(callArgs).toContain('page=2')
      expect(callArgs).toContain('per_page=30')
      expect(callArgs).toContain('orientation=portrait')
      expect(callArgs).toContain('color=blue')
      expect(callArgs).toContain('order_by=latest')
    })

    it('应该处理API错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow(
        'Unsplash API error: 401 Unauthorized'
      )
    })

    it('应该处理网络错误', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow('Network error')
    })

    it('应该处理空搜索结果', async () => {
      const mockResponse = {
        results: [],
        total: 0,
        total_pages: 0
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const results = await unsplashAPI.searchPhotos('nonexistent')

      expect(results).toEqual([])
    })
  })

  describe('照片详情', () => {
    it('应该获取照片详情', async () => {
      const mockPhoto = {
        id: 'photo123',
        urls: {
          raw: 'https://images.unsplash.com/photo123_raw',
          full: 'https://images.unsplash.com/photo123_full',
          regular: 'https://images.unsplash.com/photo123_regular'
        },
        alt_description: 'Photo description',
        user: { name: 'Photographer' },
        width: 1920,
        height: 1080
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhoto)
      })

      const photo = await unsplashAPI.getPhoto('photo123')

      expect(photo).toBeDefined()
      expect(photo.id).toBe('photo123')
      expect(photo.url).toBe('https://images.unsplash.com/photo123_regular')
    })

    it('应该缓存照片详情', async () => {
      const mockPhoto = {
        id: 'photo456',
        urls: { regular: 'photo456.jpg' }
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhoto)
      })

      // 第一次获取
      const photo1 = await unsplashAPI.getPhoto('photo456')
      expect(photo1).toBeDefined()

      // 检查缓存
      expect(unsplashAPI.cache.has('photo_photo456')).toBe(true)

      // 第二次获取应该使用缓存
      global.fetch.mockClear()
      const photo2 = await unsplashAPI.getPhoto('photo456')
      expect(photo2).toEqual(photo1)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('随机照片', () => {
    it('应该获取随机照片', async () => {
      const mockPhotos = [
        {
          id: 'random1',
          urls: { regular: 'random1.jpg' },
          alt_description: 'Random photo 1'
        },
        {
          id: 'random2',
          urls: { regular: 'random2.jpg' },
          alt_description: 'Random photo 2'
        }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhotos)
      })

      const photos = await unsplashAPI.getRandomPhotos({ count: 2 })

      expect(photos).toBeDefined()
      expect(Array.isArray(photos)).toBe(true)
      expect(photos.length).toBe(2)
    })

    it('应该处理随机照片选项', async () => {
      const mockPhoto = {
        id: 'random',
        urls: { regular: 'random.jpg' }
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPhoto)
      })

      const options = {
        query: 'nature',
        orientation: 'landscape',
        count: 1
      }

      const photos = await unsplashAPI.getRandomPhotos(options)

      expect(photos).toBeDefined()
      const callArgs = global.fetch.mock.calls[0][0]
      expect(callArgs).toContain('query=nature')
      expect(callArgs).toContain('orientation=landscape')
    })
  })

  describe('照片下载', () => {
    it('应该获取下载链接', async () => {
      const mockDownloadInfo = {
        url: 'https://images.unsplash.com/download/photo123'
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDownloadInfo)
      })

      const downloadUrl = await unsplashAPI.getDownloadLink('photo123')

      expect(downloadUrl).toBe('https://images.unsplash.com/download/photo123')
    })

    it('应该处理下载链接错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403
      })

      await expect(unsplashAPI.getDownloadLink('photo123')).rejects.toThrow()
    })
  })

  describe('数据转换', () => {
    it('应该正确转换照片数据', () => {
      const rawPhoto = {
        id: 'test123',
        urls: {
          raw: 'raw.jpg',
          full: 'full.jpg',
          regular: 'regular.jpg',
          small: 'small.jpg',
          thumb: 'thumb.jpg'
        },
        alt_description: 'Test photo',
        description: 'A test photo description',
        user: {
          name: 'Test User',
          username: 'testuser',
          profile_image: { medium: 'avatar.jpg' }
        },
        width: 1920,
        height: 1080,
        likes: 42,
        tags: [{ title: 'test' }, { title: 'photo' }]
      }

      const converted = unsplashAPI.transformPhotoData(rawPhoto)

      expect(converted).toHaveProperty('id', 'test123')
      expect(converted).toHaveProperty('url', 'regular.jpg')
      expect(converted).toHaveProperty('thumbnail', 'small.jpg')
      expect(converted).toHaveProperty('title', 'Test photo')
      expect(converted).toHaveProperty('source', 'unsplash')
      expect(converted).toHaveProperty('author', 'Test User')
      expect(converted).toHaveProperty('width', 1920)
      expect(converted).toHaveProperty('height', 1080)
      expect(converted).toHaveProperty('tags', ['test', 'photo'])
    })

    it('应该处理缺失的数据', () => {
      const incompletePhoto = {
        id: 'incomplete',
        urls: { regular: 'incomplete.jpg' }
        // 缺少其他字段
      }

      const converted = unsplashAPI.transformPhotoData(incompletePhoto)

      expect(converted.id).toBe('incomplete')
      expect(converted.url).toBe('incomplete.jpg')
      expect(converted.title).toBe('') // 默认值
      expect(converted.author).toBe('Unknown') // 默认值
    })
  })

  describe('缓存管理', () => {
    it('应该设置缓存项', () => {
      const key = 'test-key'
      const data = { test: 'data' }

      unsplashAPI.setCache(key, data)

      expect(unsplashAPI.cache.has(key)).toBe(true)
      expect(unsplashAPI.cache.get(key)).toEqual(data)
    })

    it('应该获取缓存项', () => {
      const key = 'existing-key'
      const data = { cached: true }

      unsplashAPI.cache.set(key, data)

      const cached = unsplashAPI.getFromCache(key)
      expect(cached).toEqual(data)
    })

    it('应该处理不存在的缓存项', () => {
      const cached = unsplashAPI.getFromCache('non-existent')
      expect(cached).toBeNull()
    })

    it('应该清理过期缓存', () => {
      const key = 'expired-key'
      const expiredData = { data: 'expired' }

      // 模拟过期
      unsplashAPI.cache.set(key, expiredData)
      unsplashAPI.cacheTimeout = -1000 // 负值表示已过期

      const cached = unsplashAPI.getFromCache(key)
      expect(cached).toBeNull()
    })

    it('应该清空所有缓存', () => {
      unsplashAPI.cache.set('key1', 'data1')
      unsplashAPI.cache.set('key2', 'data2')

      expect(unsplashAPI.cache.size).toBe(2)

      unsplashAPI.clearCache()

      expect(unsplashAPI.cache.size).toBe(0)
    })
  })

  describe('API配置', () => {
    it('应该设置API密钥', () => {
      const newKey = 'new-api-key'
      unsplashAPI.setApiKey(newKey)

      expect(unsplashAPI.apiKey).toBe(newKey)
    })

    it('应该验证API密钥', () => {
      expect(unsplashAPI.isApiKeyValid()).toBe(false) // 默认密钥无效

      unsplashAPI.setApiKey('valid-key-12345')
      expect(unsplashAPI.isApiKeyValid()).toBe(true)
    })

    it('应该设置基础URL', () => {
      const newUrl = 'https://custom.unsplash.com'
      unsplashAPI.setBaseUrl(newUrl)

      expect(unsplashAPI.baseUrl).toBe(newUrl)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的JSON响应', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow('Invalid JSON')
    })

    it('应该处理超时错误', async () => {
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

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow(
        'Unsplash API error: 408 Request Timeout'
      )
    })

    it('应该处理服务器错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow(
        'Unsplash API error: 500 Internal Server Error'
      )
    })

    it('应该处理限流错误', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      await expect(unsplashAPI.searchPhotos('test')).rejects.toThrow(
        'Unsplash API error: 429 Too Many Requests'
      )
    })
  })

  describe('性能监控', () => {
    it('应该跟踪API调用统计', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [], total: 0, total_pages: 0 })
      })

      await unsplashAPI.searchPhotos('test1')
      await unsplashAPI.searchPhotos('test2')

      const stats = unsplashAPI.getStats()

      expect(stats).toHaveProperty('totalCalls')
      expect(stats).toHaveProperty('successfulCalls')
      expect(stats).toHaveProperty('failedCalls')
      expect(stats).toHaveProperty('averageResponseTime')
      expect(stats.totalCalls).toBe(2)
    })

    it('应该监控缓存性能', () => {
      // 添加缓存命中
      unsplashAPI.cache.set('hit-key', { data: 'cached' })

      // 模拟缓存命中
      unsplashAPI.getFromCache('hit-key')

      // 模拟缓存未命中
      unsplashAPI.getFromCache('miss-key')

      const cacheStats = unsplashAPI.getCacheStats()

      expect(cacheStats).toHaveProperty('hits')
      expect(cacheStats).toHaveProperty('misses')
      expect(cacheStats).toHaveProperty('hitRate')
      expect(cacheStats.hits).toBe(1)
      expect(cacheStats.misses).toBe(1)
    })

    it('应该重置统计数据', () => {
      // 先进行一些操作
      unsplashAPI.cache.set('test', 'data')

      unsplashAPI.resetStats()

      const stats = unsplashAPI.getStats()
      expect(stats.totalCalls).toBe(0)
    })
  })

  describe('并发控制', () => {
    it('应该处理并发请求', async () => {
      const mockResponse = {
        results: [{ id: 'concurrent', urls: { regular: 'concurrent.jpg' } }],
        total: 1,
        total_pages: 1
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const promises = [
        unsplashAPI.searchPhotos('query1'),
        unsplashAPI.searchPhotos('query2'),
        unsplashAPI.searchPhotos('query3')
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true)
      })
    })

    it('应该避免重复的API调用', async () => {
      const mockResponse = {
        results: [{ id: 'duplicate', urls: { regular: 'duplicate.jpg' } }],
        total: 1,
        total_pages: 1
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // 同时发起相同的查询
      const promises = [
        unsplashAPI.searchPhotos('duplicate'),
        unsplashAPI.searchPhotos('duplicate'),
        unsplashAPI.searchPhotos('duplicate')
      ]

      const results = await Promise.all(promises)

      // 应该只有一次API调用
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // 所有结果应该相同
      expect(results[0]).toEqual(results[1])
      expect(results[1]).toEqual(results[2])
    })
  })
})
