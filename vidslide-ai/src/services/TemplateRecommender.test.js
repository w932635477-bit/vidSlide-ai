/**
 * TemplateRecommender.test.js
 * 模板推荐服务单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import TemplateRecommender from './TemplateRecommender.js'

describe('TemplateRecommender', () => {
  let recommender

  beforeEach(() => {
    recommender = new TemplateRecommender()
  })

  describe('初始化', () => {
    it('应该正确初始化推荐服务', () => {
      expect(recommender.architecture).toBeDefined()
      expect(recommender.recommendationCache).toBeInstanceOf(Map)
      expect(recommender.initialized).toBe(false)
    })

    it('应该异步初始化服务', async () => {
      // Mock architecture initialization
      vi.spyOn(recommender.architecture, 'initialize').mockResolvedValue()

      await recommender.initialize()

      expect(recommender.initialized).toBe(true)
    })
  })

  describe('模板推荐', () => {
    beforeEach(async () => {
      // Mock architecture
      vi.spyOn(recommender.architecture, 'initialize').mockResolvedValue()
      vi.spyOn(recommender.architecture, 'getTemplate').mockImplementation((id) => ({
        id,
        name: `${id} template`,
        category: 'test',
        layers: { fixed: [], dynamic: [], adjustable: [] },
        metadata: { version: '1.0' }
      }))

      await recommender.initialize()
    })

    it('应该生成模板推荐', async () => {
      const contentAnalysis = {
        contentType: 'video',
        keywords: ['演讲', '演示'],
        textDensity: 0.3,
        dataMentions: 0.1
      }

      const recommendations = await recommender.generateRecommendations(contentAnalysis)

      expect(recommendations).toBeInstanceOf(Array)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0]).toHaveProperty('template')
      expect(recommendations[0]).toHaveProperty('score')
      expect(recommendations[0]).toHaveProperty('reason')
      expect(recommendations[0]).toHaveProperty('confidence')
    })

    it('应该应用用户偏好', async () => {
      const contentAnalysis = { keywords: ['test'] }
      const options = {
        userPreferences: {
          favoriteTemplates: ['picture-in-picture']
        }
      }

      const recommendations = await recommender.generateRecommendations(contentAnalysis, options)

      // 应该包含个性化标记
      expect(recommendations.some(r => r.personalized)).toBe(true)
    })

    it('应该限制推荐数量', async () => {
      const contentAnalysis = { keywords: ['演讲', '演示', '视频'] }

      const recommendations = await recommender.generateRecommendations(contentAnalysis, { maxRecommendations: 2 })

      expect(recommendations.length).toBeLessThanOrEqual(2)
    })

    it('应该按分数排序', async () => {
      const contentAnalysis = { contentType: 'video' }

      const recommendations = await recommender.generateRecommendations(contentAnalysis)

      // 检查是否按分数降序排序
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].finalScore).toBeGreaterThanOrEqual(recommendations[i].finalScore)
      }
    })
  })

  describe('内容分析', () => {
    beforeEach(async () => {
      vi.spyOn(recommender.architecture, 'initialize').mockResolvedValue()
      vi.spyOn(recommender.architecture, 'getTemplate').mockReturnValue({
        id: 'test-template',
        name: 'Test Template'
      })
      await recommender.initialize()
    })

    it('应该分析内容类型', () => {
      const analysis = { contentType: 'video', confidence: 0.8 }
      const recs = recommender.analyzeContentType(analysis)

      expect(recs).toBeInstanceOf(Array)
      expect(recs[0].source).toBe('content-type')
    })

    it('应该分析关键词', () => {
      const keywords = [
        { text: '演讲', importance: 0.9 },
        { text: '演示', importance: 0.7 }
      ]

      const recs = recommender.analyzeKeywords(keywords)

      expect(recs).toBeInstanceOf(Array)
      expect(recs.some(r => r.source === 'keywords')).toBe(true)
    })

    it('应该分析内容密度', () => {
      const analysis = { textDensity: 0.8 }
      const recs = recommender.analyzeContentDensity(analysis)

      expect(recs).toBeInstanceOf(Array)
      expect(recs[0].source).toBe('content-density')
    })

    it('应该分析数据提及', () => {
      const analysis = { dataMentions: 0.4 }
      const recs = recommender.analyzeDataMentions(analysis)

      expect(recs).toBeInstanceOf(Array)
      expect(recs[0].source).toBe('data-mentions')
    })

    it('应该分析情感倾向', () => {
      const analysis = { sentiment: 'positive' }
      const recs = recommender.analyzeSentiment(analysis)

      expect(recs).toBeInstanceOf(Array)
      expect(recs[0].source).toBe('sentiment')
    })
  })

  describe('推荐去重和评分', () => {
    it('应该去重相同模板的推荐', () => {
      const recommendations = [
        { template: { id: 'template1' }, score: 0.8, reasons: ['reason1'] },
        { template: { id: 'template1' }, score: 0.7, reasons: ['reason2'] },
        { template: { id: 'template2' }, score: 0.6, reasons: ['reason3'] }
      ]

      const deduplicated = recommender.deduplicateAndScore(recommendations)

      expect(deduplicated.length).toBe(2)
      expect(deduplicated.find(r => r.template.id === 'template1')).toBeDefined()
      expect(deduplicated.find(r => r.template.id === 'template2')).toBeDefined()
    })

    it('应该计算最终分数', () => {
      const data = {
        totalScore: 2.0,
        sources: ['type1', 'type2'],
        maxScore: 0.9
      }

      const finalScore = recommender.calculateFinalScore(data)

      expect(finalScore).toBeGreaterThanOrEqual(0)
      expect(finalScore).toBeLessThanOrEqual(1)
    })
  })

  describe('缓存管理', () => {
    it('应该使用缓存的推荐结果', async () => {
      const contentAnalysis = { test: 'data' }
      const cachedResult = [{ template: 'cached', score: 1.0 }]

      // 手动设置缓存
      recommender.recommendationCache.set('test-key', cachedResult)

      // Mock cache key generation
      vi.spyOn(recommender, 'generateCacheKey').mockReturnValue('test-key')

      const result = await recommender.generateRecommendations(contentAnalysis)

      expect(result).toEqual(cachedResult)
    })

    it('应该生成缓存键', () => {
      const contentAnalysis = { contentType: 'video', keywords: [{ text: 'test' }] }
      const options = {}

      const key = recommender.generateCacheKey(contentAnalysis, options)

      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })
  })

  describe('学习和反馈', () => {
    it('应该学习用户反馈', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      recommender.learnFromFeedback('template-id', true, {})

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('用户反馈')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('统计信息', () => {
    it('应该提供统计信息', () => {
      const stats = recommender.getStatistics()

      expect(stats).toHaveProperty('cacheSize')
      expect(stats).toHaveProperty('maxCacheSize')
      expect(stats).toHaveProperty('availableTemplates')
    })
  })

  describe('预热缓存', () => {
    it('应该预热常用关键词缓存', async () => {
      recommender.initialized = false

      await recommender.warmupCache(['测试', '关键词'])

      // 初始化后应该可以预热
      expect(recommender.initialized).toBe(false) // 没有真正初始化
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      recommender.initialized = true
      recommender.recommendationCache.set('test', {})

      recommender.cleanup()

      expect(recommender.recommendationCache.size).toBe(0)
      expect(recommender.initialized).toBe(false)
    })
  })
})