/**
 * NewsImageService.test.js
 * VidSlide AI - 最新时事图片服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import NewsImageService from './NewsImageService.js'

// Mock API configs
vi.mock('../config/api-keys.js', () => ({
  API_CONFIGS: {
    googleSearch: { apiKey: 'test-google-key' },
    bingSearch: { apiKey: 'test-bing-key' },
    newsapi: { apiKey: 'test-news-key' },
    twitter: { apiKey: 'test-twitter-key' }
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('NewsImageService', () => {
  let newsService

  beforeEach(() => {
    vi.clearAllMocks()
    newsService = new NewsImageService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化新闻图片服务', () => {
      expect(newsService).toBeDefined()
      expect(newsService.sources).toBeDefined()
      expect(newsService.cache).toBeDefined()
      expect(newsService.cacheTimeout).toBe(1000 * 60 * 30) // 30分钟
    })

    it('应该配置正确的数据源', () => {
      expect(newsService.sources.primary).toEqual(['googleSearch', 'bingSearch'])
      expect(newsService.sources.secondary).toEqual(['newsapi', 'twitter'])
      expect(newsService.sources.fallback).toEqual(['openai', 'pexels'])
    })
  })

  describe('图片搜索', () => {
    it('应该搜索最新时事图片', async () => {
      const mockResults = [
        {
          id: 'news1',
          url: 'https://example.com/news1.jpg',
          title: 'Breaking News',
          source: 'google',
          publishedAt: new Date().toISOString(),
          thumbnail: 'https://example.com/thumb1.jpg'
        }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockResults })
      })

      const results = await newsService.searchLatestImages('breaking news')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('应该使用缓存的搜索结果', async () => {
      const query = 'test query'
      const mockResults = [{ id: 'cached1', url: 'cached.jpg' }]

      // 第一次搜索
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ images: mockResults })
      })

      const results1 = await newsService.searchLatestImages(query)
      expect(results1).toEqual(mockResults)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // 第二次搜索应该使用缓存
      const results2 = await newsService.searchLatestImages(query)
      expect(results2).toEqual(mockResults)
      expect(global.fetch).toHaveBeenCalledTimes(1) // 不应该有额外的API调用
    })

    it('应该处理搜索选项', async () => {
      const options = {
        timeRange: '1d',
        minQuality: 'high',
        maxResults: 50,
        sources: ['google', 'bing']
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: [] })
      })

      const results = await newsService.searchLatestImages('test', options)

      expect(results).toBeDefined()
      // 验证选项是否被正确传递（通过mock调用验证）
    })

    it('应该处理API错误', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'))

      const results = await newsService.searchLatestImages('test query')

      expect(results).toEqual([])
      // 服务应该在API错误时返回空数组而不是抛出异常
    })
  })

  describe('数据源管理', () => {
    it('应该获取主要数据源', () => {
      const primarySources = newsService.getPrimarySources(['all'])
      expect(primarySources).toEqual(['googleSearch', 'bingSearch'])

      const specificSources = newsService.getPrimarySources(['google'])
      expect(specificSources).toEqual(['googleSearch'])
    })

    it('应该获取次要数据源', () => {
      const secondarySources = newsService.getSecondarySources(['all'])
      expect(secondarySources).toEqual(['newsapi', 'twitter'])
    })

    it('应该获取备用数据源', () => {
      const fallbackSources = newsService.getFallbackSources()
      expect(fallbackSources).toEqual(['openai', 'pexels'])
    })
  })

  describe('数据源搜索', () => {
    it('应该从Google搜索图片', async () => {
      const mockResults = [
        {
          id: 'google1',
          url: 'google.jpg',
          title: 'Google Result',
          source: 'google'
        }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockResults })
      })

      const results = await newsService.searchFromSource('googleSearch', 'test query')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('应该从Bing搜索图片', async () => {
      const mockResults = [
        {
          id: 'bing1',
          url: 'bing.jpg',
          title: 'Bing Result',
          source: 'bing'
        }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockResults })
      })

      const results = await newsService.searchFromSource('bingSearch', 'test query')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('应该从NewsAPI搜索图片', async () => {
      const mockResults = [
        {
          id: 'news1',
          url: 'news.jpg',
          title: 'News Result',
          source: 'newsapi'
        }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockResults })
      })

      const results = await newsService.searchFromSource('newsapi', 'test query')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('结果处理', () => {
    it('应该合并多个数据源的结果', async () => {
      const source1Results = [{ id: '1', url: 'url1.jpg', source: 'google' }]
      const source2Results = [{ id: '2', url: 'url2.jpg', source: 'bing' }]

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ images: source1Results })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ images: source2Results })
        })

      const results = await newsService.searchLatestImages('test')

      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('应该去重相同图片', async () => {
      const duplicateResults = [
        { id: '1', url: 'same.jpg', source: 'google' },
        { id: '2', url: 'same.jpg', source: 'bing' }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: duplicateResults })
      })

      const results = await newsService.searchLatestImages('test')

      // 应该去重，只返回一个结果
      const uniqueUrls = results.map(r => r.url)
      const uniqueSet = new Set(uniqueUrls)
      expect(uniqueSet.size).toBe(uniqueUrls.length)
    })

    it('应该按相关性排序结果', async () => {
      const mixedResults = [
        { id: '1', url: 'url1.jpg', relevance: 0.9, source: 'google' },
        { id: '2', url: 'url2.jpg', relevance: 0.7, source: 'bing' },
        { id: '3', url: 'url3.jpg', relevance: 0.8, source: 'newsapi' }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mixedResults })
      })

      const results = await newsService.searchLatestImages('test')

      // 结果应该按相关性降序排序
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevance || 0).toBeGreaterThanOrEqual(results[i].relevance || 0)
      }
    })

    it('应该限制结果数量', async () => {
      const manyResults = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        url: `url${i}.jpg`,
        source: 'test'
      }))

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: manyResults })
      })

      const results = await newsService.searchLatestImages('test', { maxResults: 10 })

      expect(results.length).toBeLessThanOrEqual(10)
    })
  })

  describe('质量过滤', () => {
    it('应该过滤低质量图片', async () => {
      const mixedQualityResults = [
        { id: '1', url: 'high.jpg', quality: 'high', source: 'google' },
        { id: '2', url: 'medium.jpg', quality: 'medium', source: 'bing' },
        { id: '3', url: 'low.jpg', quality: 'low', source: 'newsapi' }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mixedQualityResults })
      })

      const results = await newsService.searchLatestImages('test', { minQuality: 'medium' })

      // 应该只返回中等及以上质量的图片
      results.forEach(result => {
        expect(['medium', 'high']).toContain(result.quality)
      })
    })

    it('应该验证图片URL有效性', async () => {
      const resultsWithInvalidUrls = [
        { id: '1', url: 'valid.jpg', source: 'google' },
        { id: '2', url: '', source: 'bing' },
        { id: '3', url: null, source: 'newsapi' },
        { id: '4', url: 'http://invalid', source: 'twitter' }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: resultsWithInvalidUrls })
      })

      const results = await newsService.searchLatestImages('test')

      // 应该只返回有效URL的图片
      results.forEach(result => {
        expect(result.url).toBeTruthy()
        expect(result.url).toMatch(/^https?:\/\//)
      })
    })
  })

  describe('时间范围过滤', () => {
    it('应该过滤时间范围内的图片', async () => {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const timeRangeResults = [
        { id: '1', url: 'recent.jpg', publishedAt: now.toISOString(), source: 'google' },
        { id: '2', url: 'day.jpg', publishedAt: oneDayAgo.toISOString(), source: 'bing' },
        { id: '3', url: 'week.jpg', publishedAt: oneWeekAgo.toISOString(), source: 'newsapi' },
        { id: '4', url: 'old.jpg', publishedAt: '2020-01-01T00:00:00Z', source: 'twitter' }
      ]

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: timeRangeResults })
      })

      const results = await newsService.searchLatestImages('test', { timeRange: '7d' })

      // 应该只返回7天内的图片
      results.forEach(result => {
        const publishedDate = new Date(result.publishedAt)
        const daysDiff = (now - publishedDate) / (1000 * 60 * 60 * 24)
        expect(daysDiff).toBeLessThanOrEqual(7)
      })
    })

    it('应该支持不同时间范围', async () => {
      const timeRanges = ['1d', '7d', '30d']

      for (const timeRange of timeRanges) {
        global.fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ images: [] })
        })

        const results = await newsService.searchLatestImages('test', { timeRange })

        expect(results).toBeDefined()
        expect(Array.isArray(results)).toBe(true)
      }
    })
  })

  describe('缓存管理', () => {
    it('应该清理过期缓存', () => {
      // 添加缓存条目
      const cacheKey = 'test-key'
      const cacheData = {
        results: [{ id: '1', url: 'test.jpg' }],
        timestamp: Date.now() - newsService.cacheTimeout - 1000 // 已过期
      }

      newsService.cache.set(cacheKey, cacheData)

      expect(newsService.cache.has(cacheKey)).toBe(true)

      // 清理过期缓存
      newsService.clearExpiredCache()

      expect(newsService.cache.has(cacheKey)).toBe(false)
    })

    it('应该获取缓存统计信息', () => {
      // 添加一些缓存条目
      newsService.cache.set('key1', { results: [], timestamp: Date.now() })
      newsService.cache.set('key2', { results: [], timestamp: Date.now() })

      const stats = newsService.getCacheStats()

      expect(stats).toBeDefined()
      expect(stats.size).toBe(2)
      expect(stats.hitRate).toBeDefined()
    })

    it('应该手动清理所有缓存', () => {
      newsService.cache.set('key1', { results: [], timestamp: Date.now() })
      newsService.cache.set('key2', { results: [], timestamp: Date.now() })

      expect(newsService.cache.size).toBe(2)

      newsService.clearAllCache()

      expect(newsService.cache.size).toBe(0)
    })
  })

  describe('错误恢复', () => {
    it('应该在主要数据源失败时使用次要数据源', async () => {
      // 主要数据源失败
      global.fetch
        .mockRejectedValueOnce(new Error('Primary source failed'))
        .mockRejectedValueOnce(new Error('Primary source failed'))
        // 次要数据源成功
        .mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              images: [{ id: 'fallback', url: 'fallback.jpg', source: 'newsapi' }]
            })
        })

      const results = await newsService.searchLatestImages('test')

      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].source).toBe('newsapi')
    })

    it('应该在所有数据源失败时返回空数组', async () => {
      global.fetch.mockRejectedValue(new Error('All sources failed'))

      const results = await newsService.searchLatestImages('test')

      expect(results).toEqual([])
    })

    it('应该处理部分数据源失败的情况', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Source 1 failed')).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ images: [{ id: 'success', url: 'success.jpg', source: 'bing' }] })
      })

      const results = await newsService.searchLatestImages('test')

      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })
  })
})
