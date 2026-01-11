/**
 * MaterialService.test.js
 * VidSlide AI 素材服务统一入口测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import MaterialService from './MaterialService.js'

// Mock 依赖服务
vi.mock('./LocalMaterialLibrary.js', () => ({
  default: {
    initialize: vi.fn(),
    searchMaterials: vi.fn(() => ({ materials: [], totalCount: 0, fromCache: false })),
    getStats: vi.fn(() => ({ totalMaterials: 100, categories: 5 })),
    clearCache: vi.fn()
  }
}))

vi.mock('./FreeAPIService.js', () => ({
  default: {
    loadUsageStats: vi.fn(),
    searchImages: vi.fn(() => ({ success: true, images: [] })),
    getUsageStats: vi.fn(() => ({ totalCalls: 50, remainingQuota: 950 })),
    saveUsageStats: vi.fn()
  }
}))

vi.mock('./BaiduImageService.js', () => ({
  default: class {
    searchImages(query, limit) {
      return Promise.resolve({
        success: true,
        images: [
          {
            id: 'baidu_1',
            url: 'https://example.com/baidu1.jpg',
            thumbnail: 'https://example.com/baidu1_thumb.jpg',
            title: `${query} - 百度图片`,
            source: 'baidu',
            width: 800,
            height: 600
          }
        ],
        total: 1
      })
    }
  }
}))

vi.mock('./IntelligentDispatcher.js', () => ({
  default: {
    initialize: vi.fn(),
    dispatch: vi.fn((keyword) => {
      if (keyword === '春节') {
        return {
          strategy: { name: 'single_platform' },
          platforms: [{ name: 'baidu', score: 0.85 }],
          confidence: 0.9,
          translation: {
            original: '春节',
            translated: 'Spring Festival'
          },
          reasoning: '检测到中文关键词，优先选择百度平台'
        }
      } else if (keyword === 'nature') {
        return {
          strategy: { name: 'single_platform' },
          platforms: [{ name: 'unsplash', score: 0.82 }],
          confidence: 0.85,
          reasoning: '检测到英文关键词，选择国外平台资源'
        }
      } else {
        return {
          strategy: { name: 'parallel_platforms' },
          platforms: [
            { name: 'unsplash', score: 0.7 },
            { name: 'pexels', score: 0.65 }
          ],
          confidence: 0.75,
          reasoning: '采用多平台并行以提升结果质量'
        }
      }
    }),
    getPerformanceStats: vi.fn(() => ({
      totalTime: { count: 10, avg: 150 },
      cacheHitRate: 0.3,
      platformUsage: { baidu: 3, unsplash: 4, pexels: 3 }
    })),
    clearCache: vi.fn()
  }
}))

describe('MaterialService', () => {
  let service

  beforeEach(() => {
    service = new MaterialService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化服务', async () => {
      await service.initialize()

      expect(service.isInitialized).toBe(true)
      expect(service.localLibrary.initialize).toHaveBeenCalled()
      expect(service.freeAPI.loadUsageStats).toHaveBeenCalled()
      expect(service.intelligentDispatcher.initialize).toHaveBeenCalled()
    })

    it('重复初始化应该安全', async () => {
      await service.initialize()
      await service.initialize()

      expect(service.isInitialized).toBe(true)
      expect(service.localLibrary.initialize).toHaveBeenCalledTimes(1)
    })
  })

  describe('素材搜索', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('应该为中文关键词使用百度服务', async () => {
      const result = await service.searchMaterials('春节', { limit: 5 })

      expect(result.success).toBe(true)
      expect(result.query).toBe('春节')
      expect(result.searchStats.chineseDetected).toBe(true)
      expect(result.searchStats.baiduUsed).toBe(true)
      expect(result.materials.length).toBeGreaterThan(0)
      expect(result.materials[0].source).toBe('baidu')
    })

    it('应该为英文关键词使用免费API', async () => {
      const result = await service.searchMaterials('nature', { limit: 3 })

      expect(result.success).toBe(true)
      expect(result.query).toBe('nature')
      expect(result.searchStats.chineseDetected).toBe(false)
      expect(result.searchStats.externalUsed).toBe(true)
    })

    it('应该处理空的搜索结果', async () => {
      // Mock空结果
      service.localLibrary.searchMaterials.mockResolvedValueOnce({
        materials: [],
        totalCount: 0,
        fromCache: false
      })

      const result = await service.searchMaterials('nonexistent', { limit: 5 })

      expect(result.success).toBe(true)
      expect(result.materials.length).toBe(0)
      expect(result.searchStats.localHits).toBe(0)
    })

    it('应该正确统计搜索数据', async () => {
      await service.searchMaterials('测试关键词')

      const stats = service.getServiceStats()
      expect(stats.overall.totalSearches).toBeGreaterThan(0)
      expect(typeof stats.overall.localHitRate).toBe('number')
      expect(typeof stats.overall.externalCallRate).toBe('number')
    })

    it('应该处理搜索错误', async () => {
      // Mock搜索错误
      service.intelligentDispatcher.dispatch.mockRejectedValueOnce(
        new Error('调度器错误')
      )

      const result = await service.searchMaterials('error')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.materials).toEqual([])
    })
  })

  describe('服务统计', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('应该返回完整的服务统计', () => {
      const stats = service.getServiceStats()

      expect(stats).toHaveProperty('overall')
      expect(stats).toHaveProperty('local')
      expect(stats).toHaveProperty('external')
      expect(stats).toHaveProperty('dispatcher')
      expect(stats.overall).toHaveProperty('totalSearches')
      expect(stats.overall).toHaveProperty('localHitRate')
      expect(stats.overall).toHaveProperty('externalCallRate')
    })

    it('应该正确计算命中率', async () => {
      // 执行几次搜索
      await service.searchMaterials('春节')
      await service.searchMaterials('nature')
      await service.searchMaterials('test')

      const stats = service.getServiceStats()

      expect(stats.overall.totalSearches).toBe(3)
      expect(stats.overall.localHitRate).toBeGreaterThanOrEqual(0)
      expect(stats.overall.localHitRate).toBeLessThanOrEqual(1)
    })

    it('应该包含调度器统计信息', () => {
      const stats = service.getServiceStats()

      expect(stats.dispatcher).toBeDefined()
      expect(stats.dispatcher.totalTime).toBeDefined()
      expect(stats.dispatcher.cacheHitRate).toBeDefined()
      expect(stats.dispatcher.platformUsage).toBeDefined()
    })
  })

  describe('缓存管理', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('应该能够清空调存', () => {
      service.clearCache()

      expect(service.localLibrary.clearCache).toHaveBeenCalled()
      expect(service.intelligentDispatcher.clearCache).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该在未初始化时抛出错误', async () => {
      await expect(service.searchMaterials('test')).rejects.toThrow()
    })

    it('应该处理空关键词', async () => {
      await service.initialize()

      const result = await service.searchMaterials('', { limit: 5 })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理null关键词', async () => {
      await service.initialize()

      const result = await service.searchMaterials(null, { limit: 5 })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理初始化失败', async () => {
      service.localLibrary.initialize.mockRejectedValueOnce(
        new Error('本地库初始化失败')
      )

      await expect(service.initialize()).rejects.toThrow('本地库初始化失败')
      expect(service.isInitialized).toBe(false)
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('应该记录搜索性能数据', async () => {
      const startTime = Date.now()
      await service.searchMaterials('performance_test')
      const endTime = Date.now()

      // 验证有性能数据记录
      const stats = service.getServiceStats()
      expect(stats.overall.totalSearches).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(5000) // 应该在合理时间内完成
    })

    it('应该正确统计不同类型的搜索', async () => {
      // 中文搜索
      await service.searchMaterials('春节')
      // 英文搜索
      await service.searchMaterials('nature')

      const stats = service.getServiceStats()

      expect(stats.overall.chineseQueries).toBeGreaterThan(0)
      expect(stats.overall.baiduCalls).toBeGreaterThan(0)
      expect(stats.overall.dispatcherCalls).toBeGreaterThan(0)
    })
  })

  describe('集成测试', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('应该完整模拟用户搜索流程', async () => {
      // 1. 搜索中文关键词
      const chineseResult = await service.searchMaterials('春节', { limit: 10 })
      expect(chineseResult.success).toBe(true)
      expect(chineseResult.searchStats.chineseDetected).toBe(true)

      // 2. 搜索英文关键词
      const englishResult = await service.searchMaterials('sunset', { limit: 5 })
      expect(englishResult.success).toBe(true)
      expect(englishResult.searchStats.chineseDetected).toBe(false)

      // 3. 检查统计数据
      const stats = service.getServiceStats()
      expect(stats.overall.totalSearches).toBe(2)
      expect(stats.overall.chineseQueries).toBe(1)
      expect(stats.overall.externalCalls).toBe(1)
    })

    it('应该支持不同的搜索选项', async () => {
      const result = await service.searchMaterials('test', {
        limit: 20,
        category: 'background',
        quality: 'high'
      })

      expect(result.success).toBe(true)
      expect(result.query).toBe('test')
    })
  })
})