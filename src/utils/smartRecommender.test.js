/**
 * SmartRecommender 单元测试
 * 测试智能推荐功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('SmartRecommender', () => {
  let recommender

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import to avoid hoisting issues
    const { SmartRecommender } = await import('./smartRecommender.js')
    recommender = new SmartRecommender()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化SmartRecommender实例', () => {
      expect(recommender).toBeDefined()
      expect(typeof recommender.analyzeContent).toBe('function')
      expect(typeof recommender.recommendTemplates).toBe('function')
      expect(typeof recommender.recommendAssets).toBe('function')
    })

    it('应该加载推荐规则和模板数据', () => {
      expect(recommender.recommendationRules).toBeDefined()
      expect(recommender.templateDatabase).toBeDefined()
      expect(recommender.assetPatterns).toBeDefined()
    })
  })

  describe('内容分析', () => {
    const testContent = {
      text: '这是一段关于人工智能和机器学习的演讲内容',
      keywords: ['人工智能', '机器学习', '演讲'],
      duration: 300, // 5分钟
      language: 'zh-CN'
    }

    it('应该能够分析内容特征', async () => {
      const analysis = await recommender.analyzeContent(testContent)

      expect(analysis).toHaveProperty('contentType')
      expect(analysis).toHaveProperty('topics')
      expect(analysis).toHaveProperty('complexity')
      expect(analysis).toHaveProperty('audience')
      expect(analysis).toHaveProperty('style')
    })

    it('应该识别内容主题', async () => {
      const analysis = await recommender.analyzeContent(testContent)

      expect(analysis.topics).toContain('technology')
      expect(analysis.topics).toContain('education')
    })

    it('应该评估内容复杂度', async () => {
      const simpleContent = {
        text: '简单的介绍',
        keywords: ['介绍'],
        duration: 60
      }

      const complexContent = {
        text: '复杂的专业技术内容'.repeat(50),
        keywords: ['复杂', '专业', '技术'],
        duration: 1800
      }

      const simpleAnalysis = await recommender.analyzeContent(simpleContent)
      const complexAnalysis = await recommender.analyzeContent(complexContent)

      expect(simpleAnalysis.complexity).toBe('simple')
      expect(complexAnalysis.complexity).toBe('complex')
    })

    it('应该识别受众类型', async () => {
      const academicContent = {
        text: '学术研究论文内容',
        keywords: ['研究', '论文', '学术'],
        duration: 600
      }

      const businessContent = {
        text: '商业演示和营销内容',
        keywords: ['商业', '演示', '营销'],
        duration: 300
      }

      const academicAnalysis = await recommender.analyzeContent(academicContent)
      const businessAnalysis = await recommender.analyzeContent(businessContent)

      expect(academicAnalysis.audience).toBe('academic')
      expect(businessAnalysis.audience).toBe('business')
    })
  })

  describe('模板推荐', () => {
    const mockAnalysis = {
      contentType: 'presentation',
      topics: ['technology', 'education'],
      complexity: 'medium',
      audience: 'professional',
      style: 'modern'
    }

    it('应该推荐合适的模板', async () => {
      const recommendations = await recommender.recommendTemplates(mockAnalysis)

      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('templateId')
        expect(rec).toHaveProperty('name')
        expect(rec).toHaveProperty('score')
        expect(rec).toHaveProperty('reason')
        expect(rec.score).toBeGreaterThanOrEqual(0)
        expect(rec.score).toBeLessThanOrEqual(100)
      })
    })

    it('应该按匹配度排序推荐结果', async () => {
      const recommendations = await recommender.recommendTemplates(mockAnalysis)

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score)
      }
    })

    it('应该为不同内容类型推荐不同模板', async () => {
      const presentationAnalysis = {
        contentType: 'presentation',
        topics: ['business'],
        complexity: 'medium',
        audience: 'business',
        style: 'professional'
      }

      const videoAnalysis = {
        contentType: 'video',
        topics: ['entertainment'],
        complexity: 'simple',
        audience: 'general',
        style: 'casual'
      }

      const presentationRecs = await recommender.recommendTemplates(presentationAnalysis)
      const videoRecs = await recommender.recommendTemplates(videoAnalysis)

      expect(presentationRecs[0].templateId).not.toBe(videoRecs[0].templateId)
    })

    it('应该处理无效分析输入', async () => {
      const invalidAnalysis = {}

      const recommendations = await recommender.recommendTemplates(invalidAnalysis)

      expect(Array.isArray(recommendations)).toBe(true)
      // Should return default recommendations
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('素材推荐', () => {
    const mockAnalysis = {
      contentType: 'presentation',
      topics: ['nature', 'travel'],
      complexity: 'medium',
      audience: 'general',
      style: 'modern'
    }

    it('应该推荐合适的素材', async () => {
      const recommendations = await recommender.recommendAssets(mockAnalysis)

      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('assetType')
        expect(rec).toHaveProperty('keywords')
        expect(rec).toHaveProperty('priority')
        expect(rec).toHaveProperty('reason')
      })
    })

    it('应该基于主题推荐相关素材', async () => {
      const natureAnalysis = {
        contentType: 'presentation',
        topics: ['nature', 'environment'],
        complexity: 'medium',
        audience: 'general',
        style: 'modern'
      }

      const recommendations = await recommender.recommendAssets(natureAnalysis)

      const hasNatureKeywords = recommendations.some(rec =>
        rec.keywords.some(keyword =>
          ['nature', 'forest', 'mountain', 'environment'].includes(keyword)
        )
      )

      expect(hasNatureKeywords).toBe(true)
    })

    it('应该考虑受众偏好', async () => {
      const businessAnalysis = {
        contentType: 'presentation',
        topics: ['business', 'finance'],
        complexity: 'high',
        audience: 'business',
        style: 'professional'
      }

      const recommendations = await recommender.recommendAssets(businessAnalysis)

      const hasBusinessKeywords = recommendations.some(rec =>
        rec.keywords.some(keyword => ['business', 'corporate', 'professional'].includes(keyword))
      )

      expect(hasBusinessKeywords).toBe(true)
    })
  })

  describe('智能匹配算法', () => {
    it('应该计算内容与模板的匹配度', () => {
      const contentAnalysis = {
        contentType: 'presentation',
        topics: ['technology'],
        complexity: 'medium',
        audience: 'professional',
        style: 'modern'
      }

      const template = {
        id: 'tech-presentation',
        category: 'presentation',
        tags: ['technology', 'modern', 'professional'],
        complexity: 'medium',
        audience: ['professional', 'technical']
      }

      const score = recommender.calculateMatchScore(contentAnalysis, template)

      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
      expect(score).toBeGreaterThan(50) // Should be a good match
    })

    it('应该正确计算标签匹配', () => {
      const analysis = { topics: ['technology', 'innovation'] }
      const template = { tags: ['technology', 'modern', 'design'] }

      const tagScore = recommender.calculateTagMatch(analysis, template)

      expect(typeof tagScore).toBe('number')
      expect(tagScore).toBeGreaterThan(0)
      expect(tagScore).toBeLessThanOrEqual(50) // Tag score max 50
    })

    it('应该正确计算复杂度匹配', () => {
      const complexityPairs = [
        { content: 'simple', template: 'simple', expected: 20 },
        { content: 'medium', template: 'medium', expected: 20 },
        { content: 'complex', template: 'simple', expected: 5 }
      ]

      complexityPairs.forEach(({ content, template, expected }) => {
        const score = recommender.calculateComplexityMatch(content, template)
        expect(score).toBe(expected)
      })
    })

    it('应该正确计算受众匹配', () => {
      const audienceMatch = recommender.calculateAudienceMatch('professional', [
        'professional',
        'technical'
      ])
      const audienceMismatch = recommender.calculateAudienceMatch('general', ['academic'])

      expect(audienceMatch).toBeGreaterThan(audienceMismatch)
      expect(audienceMatch).toBe(15)
      expect(audienceMismatch).toBe(5)
    })
  })

  describe('学习和适应', () => {
    it('应该能够学习用户偏好', () => {
      const userPreferences = {
        favoriteTemplates: ['modern-presentation', 'tech-showcase'],
        preferredStyles: ['modern', 'minimal'],
        dislikedTags: ['colorful', 'busy']
      }

      recommender.learnUserPreferences(userPreferences)

      expect(recommender.userPreferences).toEqual(userPreferences)
    })

    it('应该根据用户偏好调整推荐', async () => {
      // Set user preferences
      recommender.learnUserPreferences({
        favoriteTemplates: ['modern-presentation'],
        preferredStyles: ['modern']
      })

      const analysis = {
        contentType: 'presentation',
        topics: ['business'],
        complexity: 'medium',
        audience: 'business',
        style: 'modern'
      }

      const recommendations = await recommender.recommendTemplates(analysis)

      // Should prioritize modern templates
      const modernTemplates = recommendations.filter(rec => rec.templateId.includes('modern'))

      expect(modernTemplates.length).toBeGreaterThan(0)
    })

    it('应该避免推荐用户不喜欢的选项', async () => {
      // Set user dislikes
      recommender.learnUserPreferences({
        dislikedTags: ['colorful', 'busy']
      })

      const analysis = {
        contentType: 'presentation',
        topics: ['general'],
        complexity: 'medium',
        audience: 'general',
        style: 'colorful' // This should be avoided
      }

      const recommendations = await recommender.recommendTemplates(analysis)

      // Should not recommend colorful templates highly
      const colorfulTemplates = recommendations.filter(
        rec => rec.templateId.includes('colorful') && rec.score > 50
      )

      expect(colorfulTemplates.length).toBe(0)
    })
  })

  describe('性能监控', () => {
    it('应该监控推荐性能', async () => {
      const analysis = {
        contentType: 'presentation',
        topics: ['technology'],
        complexity: 'medium',
        audience: 'professional',
        style: 'modern'
      }

      const startTime = performance.now()

      await recommender.recommendTemplates(analysis)

      const endTime = performance.now()
      const duration = endTime - startTime

      // 推荐应该在合理时间内完成
      expect(duration).toBeLessThan(1000) // Less than 1 second
    })

    it('应该提供性能统计', () => {
      const stats = recommender.getPerformanceStats()

      expect(stats).toHaveProperty('averageRecommendationTime')
      expect(stats).toHaveProperty('totalRecommendations')
      expect(stats).toHaveProperty('cacheHitRate')
    })

    it('应该缓存推荐结果', async () => {
      const analysis = {
        contentType: 'presentation',
        topics: ['technology'],
        complexity: 'medium',
        audience: 'professional',
        style: 'modern'
      }

      // First recommendation
      const startTime1 = performance.now()
      await recommender.recommendTemplates(analysis)
      const endTime1 = performance.now()

      // Second recommendation (should use cache)
      const startTime2 = performance.now()
      await recommender.recommendTemplates(analysis)
      const endTime2 = performance.now()

      // Second should be faster due to caching
      expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效内容分析', async () => {
      const invalidAnalysis = null

      await expect(recommender.recommendTemplates(invalidAnalysis)).rejects.toThrow()
    })

    it('应该处理模板数据库错误', async () => {
      // Temporarily break template database
      const originalDb = recommender.templateDatabase
      recommender.templateDatabase = null

      const analysis = {
        contentType: 'presentation',
        topics: ['general'],
        complexity: 'medium',
        audience: 'general',
        style: 'modern'
      }

      const recommendations = await recommender.recommendTemplates(analysis)

      expect(Array.isArray(recommendations)).toBe(true)
      // Should return fallback recommendations
      expect(recommendations.length).toBeGreaterThan(0)

      // Restore
      recommender.templateDatabase = originalDb
    })

    it('应该处理素材推荐错误', async () => {
      const analysis = {
        contentType: 'invalid',
        topics: [],
        complexity: 'invalid',
        audience: 'invalid',
        style: 'invalid'
      }

      const recommendations = await recommender.recommendAssets(analysis)

      expect(Array.isArray(recommendations)).toBe(true)
      // Should handle gracefully and return some recommendations
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('配置管理', () => {
    it('应该允许自定义推荐规则', () => {
      const customRules = {
        weightFactors: {
          contentType: 0.3,
          topics: 0.4,
          complexity: 0.2,
          audience: 0.1
        },
        minScoreThreshold: 30
      }

      recommender.updateRecommendationRules(customRules)

      expect(recommender.recommendationRules.weightFactors).toEqual(customRules.weightFactors)
      expect(recommender.recommendationRules.minScoreThreshold).toBe(30)
    })

    it('应该验证配置有效性', () => {
      const invalidRules = {
        weightFactors: {
          contentType: 2.0, // Invalid: > 1.0
          topics: 0.5
        }
      }

      expect(() => recommender.updateRecommendationRules(invalidRules)).toThrow()
    })

    it('应该重置为默认配置', () => {
      recommender.resetToDefaults()

      expect(recommender.recommendationRules).toBeDefined()
      expect(recommender.userPreferences).toEqual({})
    })
  })
})
