/**
 * FreeRSSImageService.test.js
 * VidSlide AI - 免费RSS图片服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import FreeRSSImageService from './FreeRSSImageService.js'

// Mock fetch for RSS requests
global.fetch = vi.fn()

// Mock DOMParser for XML parsing
global.DOMParser = vi.fn().mockImplementation(() => ({
  parseFromString: vi.fn(xmlString => {
    // Mock XML parsing - return a simple object
    const mockDoc = {
      querySelectorAll: vi.fn(selector => {
        if (selector === 'item') {
          return [
            {
              querySelector: vi.fn(subSelector => {
                const mockElements = {
                  title: { textContent: 'Test Article' },
                  link: { textContent: 'https://example.com/article' },
                  description: {
                    textContent: 'Test description with <img src="test.jpg" alt="test">'
                  },
                  pubDate: { textContent: 'Wed, 01 Jan 2024 00:00:00 GMT' }
                }
                return mockElements[subSelector] || null
              })
            }
          ]
        }
        return []
      })
    }
    return mockDoc
  })
}))

describe('FreeRSSImageService', () => {
  let rssService

  beforeEach(() => {
    vi.clearAllMocks()
    rssService = new FreeRSSImageService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化RSS图片服务', () => {
      expect(rssService).toBeDefined()
      expect(rssService.cache).toBeDefined()
      expect(rssService.newsSources).toBeDefined()
      expect(rssService.cacheTimeout).toBe(1000 * 60 * 15) // 15分钟
    })

    it('应该配置正确的新闻源', () => {
      expect(rssService.newsSources.tech).toBeDefined()
      expect(rssService.newsSources.business).toBeDefined()
      expect(rssService.newsSources.general).toBeDefined()

      expect(rssService.newsSources.tech.length).toBeGreaterThan(0)
      expect(rssService.newsSources.business.length).toBeGreaterThan(0)
      expect(rssService.newsSources.general.length).toBeGreaterThan(0)
    })

    it('应该每个新闻源都有必需的属性', () => {
      Object.values(rssService.newsSources).forEach(category => {
        category.forEach(source => {
          expect(source).toHaveProperty('name')
          expect(source).toHaveProperty('rss')
          expect(source).toHaveProperty('category')
          expect(typeof source.name).toBe('string')
          expect(typeof source.rss).toBe('string')
          expect(typeof source.category).toBe('string')
        })
      })
    })
  })

  describe('RSS源搜索', () => {
    it('应该搜索指定类别的RSS源', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      const results = await rssService.searchRSSImages('tech', { limit: 5 })

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('应该处理RSS解析失败', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const results = await rssService.searchRSSImages('tech')

      expect(results).toEqual([])
    })

    it('应该限制搜索结果数量', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      const results = await rssService.searchRSSImages('tech', { limit: 3 })

      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('应该支持多类别搜索', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      const results = await rssService.searchRSSImages(['tech', 'business'])

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('图片提取', () => {
    it('应该从RSS内容中提取图片', () => {
      const rssContent = `
        <item>
          <title>Test Article</title>
          <description><![CDATA[Description with <img src="image1.jpg" alt="alt1"> and <img src="image2.png">]]></description>
          <pubDate>Wed, 01 Jan 2024 00:00:00 GMT</pubDate>
        </item>
      `

      const images = rssService.extractImagesFromContent(rssContent)

      expect(images).toBeDefined()
      expect(Array.isArray(images)).toBe(true)
      expect(images.length).toBeGreaterThan(0)
    })

    it('应该验证图片URL的有效性', () => {
      const validImages = [
        { src: 'https://example.com/image.jpg', alt: 'Valid image' },
        { src: 'http://example.com/image.png', alt: 'Valid PNG' },
        { src: 'invalid-url', alt: 'Invalid' },
        { src: '', alt: 'Empty' }
      ]

      const filteredImages = rssService.validateImageUrls(validImages)

      expect(filteredImages.length).toBe(2)
      filteredImages.forEach(img => {
        expect(img.src).toMatch(/^https?:\/\//)
      })
    })

    it('应该去重相同的图片URL', () => {
      const duplicateImages = [
        { src: 'https://example.com/image.jpg', alt: 'Image 1' },
        { src: 'https://example.com/image.jpg', alt: 'Image 2' },
        { src: 'https://example.com/different.jpg', alt: 'Different' }
      ]

      const uniqueImages = rssService.deduplicateImages(duplicateImages)

      expect(uniqueImages.length).toBe(2)
      const urls = uniqueImages.map(img => img.src)
      expect(new Set(urls).size).toBe(urls.length)
    })
  })

  describe('缓存管理', () => {
    it('应该缓存搜索结果', async () => {
      const query = 'test query'
      const mockResults = [{ url: 'test.jpg', title: 'Test' }]

      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      // 第一次搜索
      const results1 = await rssService.searchRSSImages(query)
      expect(results1).toBeDefined()

      // 检查是否缓存
      const cacheKey = `rss_${query}`
      expect(rssService.cache.has(cacheKey)).toBe(true)

      // 第二次搜索应该使用缓存
      global.fetch.mockClear()
      const results2 = await rssService.searchRSSImages(query)
      expect(results2).toBeDefined()
      // fetch 应该没有被调用
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('应该清理过期缓存', () => {
      const cacheKey = 'test-key'
      const expiredData = {
        results: [{ url: 'test.jpg' }],
        timestamp: Date.now() - rssService.cacheTimeout - 1000 // 已过期
      }

      rssService.cache.set(cacheKey, expiredData)
      expect(rssService.cache.has(cacheKey)).toBe(true)

      rssService.clearExpiredCache()
      expect(rssService.cache.has(cacheKey)).toBe(false)
    })

    it('应该获取缓存统计', () => {
      rssService.cache.set('key1', { results: [], timestamp: Date.now() })
      rssService.cache.set('key2', { results: [], timestamp: Date.now() })

      const stats = rssService.getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats.size).toBe(2)
    })
  })

  describe('并发搜索', () => {
    it('应该支持并发搜索多个RSS源', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      const categories = ['tech', 'business', 'general']
      const promises = categories.map(category => rssService.searchRSSImages(category))

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true)
      })
    })

    it('应该处理部分RSS源失败的情况', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Source 1 failed')).mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      const results = await rssService.searchRSSImages(['tech', 'business'])

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      // 即使有源失败，也应该返回结果
    })
  })

  describe('内容过滤', () => {
    it('应该过滤包含关键词的内容', () => {
      const articles = [
        { title: 'AI Technology News', content: 'Artificial Intelligence advances' },
        { title: 'Sports Update', content: 'Football match results' },
        { title: 'Business Report', content: 'Market analysis' }
      ]

      const filtered = rssService.filterContentByKeywords(articles, ['AI', 'technology'])

      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('AI Technology News')
    })

    it('应该按时间排序结果', () => {
      const articles = [
        { title: 'Old Article', pubDate: '2024-01-01T00:00:00Z' },
        { title: 'New Article', pubDate: '2024-01-02T00:00:00Z' },
        { title: 'Medium Article', pubDate: '2024-01-01T12:00:00Z' }
      ]

      const sorted = rssService.sortByDate(articles)

      expect(sorted[0].title).toBe('New Article')
      expect(sorted[2].title).toBe('Old Article')
    })

    it('应该限制时间范围', () => {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const articles = [
        { title: 'Recent', pubDate: now.toISOString() },
        { title: 'Day Old', pubDate: oneDayAgo.toISOString() },
        { title: 'Week Old', pubDate: oneWeekAgo.toISOString() },
        { title: 'Old', pubDate: '2020-01-01T00:00:00Z' }
      ]

      const filtered = rssService.filterByTimeRange(articles, '7d')

      expect(filtered.length).toBe(3) // 不包括2020年的文章
      filtered.forEach(article => {
        const pubDate = new Date(article.pubDate)
        const daysDiff = (now - pubDate) / (1000 * 60 * 60 * 24)
        expect(daysDiff).toBeLessThanOrEqual(7)
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的RSS格式', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid xml content')
      })

      const results = await rssService.searchRSSImages('tech')

      expect(results).toEqual([])
    })

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

      const results = await rssService.searchRSSImages('tech')

      expect(results).toEqual([])
    })

    it('应该处理解析错误', async () => {
      global.DOMParser.mockImplementationOnce(() => ({
        parseFromString: () => {
          throw new Error('Parse error')
        }
      }))

      global.fetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<xml>content</xml>')
      })

      const results = await rssService.searchRSSImages('tech')

      expect(results).toEqual([])
    })
  })

  describe('性能监控', () => {
    it('应该跟踪搜索统计', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<rss><channel><item><title>Test</title></item></channel></rss>')
      })

      await rssService.searchRSSImages('tech')
      await rssService.searchRSSImages('business')

      const stats = rssService.getSearchStats()

      expect(stats).toHaveProperty('totalSearches')
      expect(stats).toHaveProperty('successfulSearches')
      expect(stats).toHaveProperty('averageResponseTime')
      expect(stats.totalSearches).toBeGreaterThan(0)
    })

    it('应该监控缓存性能', () => {
      // 添加缓存命中
      const cacheKey = 'test-cache'
      rssService.cache.set(cacheKey, {
        results: [{ url: 'cached.jpg' }],
        timestamp: Date.now()
      })

      // 模拟缓存命中
      rssService.getCachedResults(cacheKey)

      const stats = rssService.getCacheStats()

      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats.hits).toBeGreaterThan(0)
    })
  })

  describe('配置管理', () => {
    it('应该支持自定义新闻源', () => {
      const customSources = {
        custom: [{ name: 'Custom News', rss: 'https://custom.com/rss', category: 'custom' }]
      }

      rssService.addCustomSources(customSources)

      expect(rssService.newsSources.custom).toBeDefined()
      expect(rssService.newsSources.custom).toEqual(customSources.custom)
    })

    it('应该验证新闻源URL', () => {
      const validUrls = ['https://example.com/rss', 'http://example.com/feed.xml']

      const invalidUrls = ['not-a-url', '', 'ftp://example.com']

      validUrls.forEach(url => {
        expect(rssService.isValidRSSUrl(url)).toBe(true)
      })

      invalidUrls.forEach(url => {
        expect(rssService.isValidRSSUrl(url)).toBe(false)
      })
    })

    it('应该更新缓存超时设置', () => {
      const newTimeout = 1000 * 60 * 30 // 30分钟
      rssService.setCacheTimeout(newTimeout)

      expect(rssService.cacheTimeout).toBe(newTimeout)
    })
  })
})
