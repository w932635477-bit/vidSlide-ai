/**
 * SmartCacheService.test.js
 * VidSlide AI - 智能缓存服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import SmartCacheService from './SmartCacheService.js'

describe('SmartCacheService', () => {
  let cacheService

  beforeEach(() => {
    vi.clearAllMocks()
    cacheService = new SmartCacheService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化缓存服务', () => {
      expect(cacheService).toBeDefined()
      expect(cacheService.cache).toBeDefined()
      expect(cacheService.hotTopics).toBeDefined()
      expect(Array.isArray(cacheService.hotTopics)).toBe(true)
    })

    it('应该包含热门话题列表', () => {
      expect(cacheService.hotTopics.length).toBeGreaterThan(0)
      expect(cacheService.hotTopics).toContain('AI')
      expect(cacheService.hotTopics).toContain('Technology')
      expect(cacheService.hotTopics).toContain('Business')
    })

    it('应该初始化为空的缓存', () => {
      expect(cacheService.cache.size).toBe(0)
    })
  })

  describe('缓存操作', () => {
    it('应该能够存储和检索数据', () => {
      const testKey = 'test-key'
      const testData = { images: [{ id: '1', url: 'test.jpg' }] }

      cacheService.set(testKey, testData)
      const retrieved = cacheService.get(testKey)

      expect(retrieved).toEqual(testData)
    })

    it('应该检查缓存中是否存在数据', () => {
      const testKey = 'existing-key'

      expect(cacheService.has(testKey)).toBe(false)

      cacheService.set(testKey, 'test data')
      expect(cacheService.has(testKey)).toBe(true)
    })

    it('应该删除缓存数据', () => {
      const testKey = 'delete-key'
      cacheService.set(testKey, 'test data')

      expect(cacheService.has(testKey)).toBe(true)

      cacheService.delete(testKey)
      expect(cacheService.has(testKey)).toBe(false)
    })

    it('应该清空所有缓存', () => {
      cacheService.set('key1', 'data1')
      cacheService.set('key2', 'data2')
      cacheService.set('key3', 'data3')

      expect(cacheService.cache.size).toBe(3)

      cacheService.clear()
      expect(cacheService.cache.size).toBe(0)
    })
  })

  describe('缓存大小管理', () => {
    it('应该限制缓存大小', () => {
      // 设置小的缓存限制来测试
      cacheService.maxCacheSize = 2

      cacheService.set('key1', 'data1')
      cacheService.set('key2', 'data2')
      cacheService.set('key3', 'data3') // 应该触发清理

      expect(cacheService.cache.size).toBeLessThanOrEqual(2)
    })

    it('应该根据使用频率清理缓存', () => {
      cacheService.maxCacheSize = 3

      cacheService.set('key1', 'data1')
      cacheService.set('key2', 'data2')
      cacheService.set('key3', 'data3')
      cacheService.set('key4', 'data4') // 应该触发LRU清理

      // 最近使用的应该保留
      cacheService.get('key1') // 标记为最近使用
      cacheService.set('key5', 'data5') // 再次触发清理

      expect(cacheService.cache.size).toBeLessThanOrEqual(3)
    })
  })

  describe('热门话题缓存', () => {
    it('应该预加载热门话题', () => {
      cacheService.preloadHotTopics()

      // 预加载应该添加一些缓存条目
      expect(cacheService.cache.size).toBeGreaterThan(0)
    })

    it('应该智能选择热门话题进行缓存', () => {
      const selectedTopics = cacheService.selectTopicsForCaching()

      expect(selectedTopics).toBeDefined()
      expect(Array.isArray(selectedTopics)).toBe(true)
      expect(selectedTopics.length).toBeGreaterThan(0)
      expect(selectedTopics.length).toBeLessThanOrEqual(10) // 限制数量
    })

    it('应该基于使用频率选择话题', () => {
      // 模拟使用频率
      cacheService.topicUsage = {
        'AI': 100,
        'Technology': 50,
        'Business': 25
      }

      const selectedTopics = cacheService.selectTopicsForCaching()

      // 高频使用的应该被优先选择
      expect(selectedTopics).toContain('AI')
    })
  })

  describe('缓存策略', () => {
    it('应该实现LRU（最近最少使用）策略', () => {
      cacheService.set('key1', 'data1')
      cacheService.set('key2', 'data2')
      cacheService.set('key3', 'data3')

      // 访问key1，使其变为最近使用
      cacheService.get('key1')

      // 当缓存满时，应该优先删除key2和key3
      cacheService.maxCacheSize = 2
      cacheService.set('key4', 'data4')

      expect(cacheService.has('key1')).toBe(true) // 最近使用的应该保留
      expect(cacheService.cache.size).toBeLessThanOrEqual(2)
    })

    it('应该基于内容重要性进行缓存', () => {
      const importantContent = { priority: 'high', images: [] }
      const normalContent = { priority: 'normal', images: [] }

      cacheService.set('important', importantContent, { priority: 'high' })
      cacheService.set('normal', normalContent, { priority: 'normal' })

      // 重要内容应该有更长的TTL
      expect(cacheService.has('important')).toBe(true)
      expect(cacheService.has('normal')).toBe(true)
    })
  })

  describe('性能监控', () => {
    it('应该跟踪缓存命中率', () => {
      cacheService.set('test-key', 'test-data')

      // 命中
      cacheService.get('test-key')
      cacheService.get('test-key')

      // 未命中
      cacheService.get('non-existent-key')

      const stats = cacheService.getCacheStats()
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('hitRate')
      expect(stats.hitRate).toBeGreaterThan(0)
    })

    it('应该监控缓存性能', () => {
      const startTime = Date.now()
      cacheService.set('perf-test', 'data')
      cacheService.get('perf-test')
      const endTime = Date.now()

      const stats = cacheService.getCacheStats()
      expect(stats).toHaveProperty('avgResponseTime')
      expect(stats.avgResponseTime).toBeGreaterThan(0)
    })
  })

  describe('缓存过期', () => {
    it('应该支持TTL（生存时间）', async () => {
      vi.useFakeTimers()

      cacheService.set('ttl-test', 'data', { ttl: 1000 }) // 1秒TTL

      expect(cacheService.has('ttl-test')).toBe(true)

      // 快进时间
      vi.advanceTimersByTime(1500)

      expect(cacheService.has('ttl-test')).toBe(false)

      vi.useRealTimers()
    })

    it('应该清理过期条目', async () => {
      vi.useFakeTimers()

      cacheService.set('expired', 'data', { ttl: 500 })
      cacheService.set('valid', 'data', { ttl: 2000 })

      vi.advanceTimersByTime(1000)

      cacheService.cleanupExpired()

      expect(cacheService.has('expired')).toBe(false)
      expect(cacheService.has('valid')).toBe(true)

      vi.useRealTimers()
    })
  })
})