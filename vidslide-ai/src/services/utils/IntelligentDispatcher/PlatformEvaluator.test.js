/** * PlatformEvaluator.test.js * VidSlide AI 平台评估器测试 */

import { describe, it, expect, beforeEach } from 'vitest'
import PlatformEvaluator from './PlatformEvaluator.js'

describe('PlatformEvaluator', () => {
  let evaluator

  beforeEach(() => {
    evaluator = new PlatformEvaluator()
  })

  describe('平台评分计算', () => {
    it('应该为中文关键词给出较高百度评分', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0, englishRatio: 0 }
      const scores = evaluator.calculateScores('春节', analysis)

      expect(scores.baidu).toBeGreaterThan(0.8)
      expect(scores.unsplash).toBeLessThan(scores.baidu)
      expect(scores.pexels).toBeLessThan(scores.baidu)
      expect(scores.pixabay).toBeLessThan(scores.baidu)
    })

    it('应该为英文关键词给出较高国外平台评分', () => {
      const analysis = { language: 'english', chineseRatio: 0, englishRatio: 1.0 }
      const scores = evaluator.calculateScores('nature', analysis)

      expect(scores.unsplash).toBeGreaterThan(0.7)
      expect(scores.pexels).toBeGreaterThan(0.7)
      expect(scores.pixabay).toBeGreaterThan(0.7)
      expect(scores.baidu).toBeLessThan(0.5)
    })

    it('应该考虑内容相关性', () => {
      const analysis = { language: 'english', chineseRatio: 0, englishRatio: 1.0, patterns: [] }
      const scores = evaluator.calculateScores('photography', analysis)

      // photography应该获得更高的评分
      expect(scores.unsplash).toBeGreaterThan(scores.baidu)
    })

    it('应该返回所有平台的评分', () => {
      const analysis = { language: 'english', chineseRatio: 0, englishRatio: 1.0 }
      const scores = evaluator.calculateScores('test', analysis)

      expect(scores).toHaveProperty('baidu')
      expect(scores).toHaveProperty('unsplash')
      expect(scores).toHaveProperty('pexels')
      expect(scores).toHaveProperty('pixabay')

      // 所有评分都应该在0-1范围内
      Object.values(scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('语言匹配度', () => {
    it('应该完美匹配中文平台和中文内容', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0 }
      const score = evaluator.calculateLanguageMatch(analysis, evaluator.platforms.baidu)

      expect(score).toBeGreaterThan(0.9)
    })

    it('应该完美匹配英文平台和英文内容', () => {
      const analysis = { language: 'english', englishRatio: 1.0 }
      const score = evaluator.calculateLanguageMatch(analysis, evaluator.platforms.unsplash)

      expect(score).toBeGreaterThan(0.9)
    })

    it('应该为不匹配的语言组合给出较低评分', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0 }
      const score = evaluator.calculateLanguageMatch(analysis, evaluator.platforms.unsplash)

      expect(score).toBeLessThan(0.3)
    })
  })

  describe('内容相关性', () => {
    it('应该识别摄影相关关键词', () => {
      expect(evaluator.isPhotographyKeyword('摄影')).toBe(true)
      expect(evaluator.isPhotographyKeyword('photography')).toBe(true)
      expect(evaluator.isPhotographyKeyword('风景')).toBe(false)
    })

    it('应该识别文化相关关键词', () => {
      const analysis = { chineseRatio: 0.8 }
      expect(evaluator.isCulturalKeyword('传统文化', analysis)).toBe(true)
      expect(evaluator.isCulturalKeyword('cultural', analysis)).toBe(true)
      expect(evaluator.isCulturalKeyword('random', analysis)).toBe(false)
    })

    it('应该识别视频相关关键词', () => {
      expect(evaluator.isVideoKeyword('视频')).toBe(true)
      expect(evaluator.isVideoKeyword('movie')).toBe(true)
      expect(evaluator.isVideoKeyword('文本')).toBe(false)
    })
  })

  describe('性能评估', () => {
    it('应该基于响应时间给出性能评分', () => {
      const fastPlatform = { responseTime: 1000 }
      const slowPlatform = { responseTime: 3000 }

      const fastScore = evaluator.calculatePerformance(fastPlatform)
      const slowScore = evaluator.calculatePerformance(slowPlatform)

      expect(fastScore).toBeGreaterThan(slowScore)
      expect(fastScore).toBeGreaterThan(0.5)
      expect(slowScore).toBeGreaterThan(0.2)
    })

    it('应该为免费平台给出较高可靠性评分', () => {
      const freePlatform = { cost: 0, apiLimit: 1000, accuracy: 0.85, reliability: 0.9 }
      const paidPlatform = { cost: 10, apiLimit: 100, accuracy: 0.8, reliability: 0.8 }

      const freeScore = evaluator.calculateReliability(freePlatform)
      const paidScore = evaluator.calculateReliability(paidPlatform)

      expect(freeScore).toBeGreaterThan(paidScore)
    })
  })

  describe('文化适应度', () => {
    it('应该为中文平台给出高文化适应度评分', () => {
      const analysis = { chineseRatio: 0.9 }
      const score = evaluator.calculateCulturalFit('春节', analysis, evaluator.platforms.baidu)

      expect(score).toBeGreaterThan(0.8)
    })

    it('应该为英文平台在中文内容上给出较低文化适应度评分', () => {
      const analysis = { chineseRatio: 0.9 }
      const score = evaluator.calculateCulturalFit('春节', analysis, evaluator.platforms.unsplash)

      expect(score).toBeLessThan(0.5)
    })
  })

  describe('缓存功能', () => {
    it('应该缓存评估结果', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0 }
      const scores1 = evaluator.calculateScores('春节', analysis)
      const scores2 = evaluator.calculateScores('春节', analysis)

      expect(scores1).toEqual(scores2)
      expect(scores1).toBe(scores2) // 应该返回缓存的结果
    })

    it('应该控制缓存大小', () => {
      const analysis = { language: 'english', englishRatio: 1.0 }

      // 填充缓存超过限制
      for (let i = 0; i < evaluator.cacheMaxSize + 10; i++) {
        evaluator.calculateScores(`keyword${i}`, analysis)
      }

      expect(evaluator.evaluationCache.size).toBeLessThanOrEqual(evaluator.cacheMaxSize)
    })

    it('应该能够清空调存', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0 }
      evaluator.calculateScores('春节', analysis)
      expect(evaluator.evaluationCache.size).toBeGreaterThan(0)

      evaluator.clearCache()
      expect(evaluator.evaluationCache.size).toBe(0)
    })
  })

  describe('平台管理', () => {
    it('应该返回所有平台详情', () => {
      const platforms = evaluator.getAllPlatforms()

      expect(platforms).toHaveProperty('baidu')
      expect(platforms).toHaveProperty('unsplash')
      expect(platforms).toHaveProperty('pexels')
      expect(platforms).toHaveProperty('pixabay')

      expect(platforms.baidu.name).toBe('百度图片')
      expect(platforms.unsplash.name).toBe('Unsplash')
    })

    it('应该能够获取单个平台详情', () => {
      const baidu = evaluator.getPlatformDetails('baidu')
      expect(baidu.name).toBe('百度图片')
      expect(baidu.language).toBe('chinese')

      const unknown = evaluator.getPlatformDetails('unknown')
      expect(unknown).toBeNull()
    })

    it('应该能够更新平台状态', () => {
      evaluator.updatePlatformStatus('baidu', { apiLimit: 200 })
      const baidu = evaluator.getPlatformDetails('baidu')
      expect(baidu.apiLimit).toBe(200)
    })
  })

  describe('统计功能', () => {
    it('应该提供评估统计', () => {
      // 先进行一些评估
      const analysis = { language: 'chinese', chineseRatio: 1.0 }
      evaluator.calculateScores('春节', analysis)
      evaluator.calculateScores('端午', analysis)

      const stats = evaluator.getEvaluationStats()

      expect(stats.totalEvaluations).toBeGreaterThan(0)
      expect(stats.cacheSize).toBeGreaterThan(0)
      expect(stats.platformUsage).toBeDefined()
    })

    it('应该统计平台使用情况', () => {
      const chineseAnalysis = { language: 'chinese', chineseRatio: 1.0 }
      const englishAnalysis = { language: 'english', englishRatio: 1.0 }

      evaluator.calculateScores('春节', chineseAnalysis) // 应该选择baidu
      evaluator.calculateScores('nature', englishAnalysis) // 应该选择国外平台

      const stats = evaluator.getEvaluationStats()

      // 应该记录了平台使用情况
      expect(Object.keys(stats.platformUsage).length).toBeGreaterThan(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的关键词', () => {
      const analysis = { language: 'unknown', chineseRatio: 0, englishRatio: 0 }
      const scores = evaluator.calculateScores('', analysis)

      expect(scores).toBeDefined()
      Object.values(scores).forEach(score => {
        expect(typeof score).toBe('number')
      })
    })

    it('应该处理null分析结果', () => {
      expect(() => {
        evaluator.calculateScores('test', null)
      }).toThrow()
    })

    it('应该处理不完整的分析结果', () => {
      const incompleteAnalysis = { language: 'english' } // 缺少ratio属性
      const scores = evaluator.calculateScores('test', incompleteAnalysis)

      expect(scores).toBeDefined()
    })
  })

  describe('评分范围验证', () => {
    it('所有评分都应该在0-1范围内', () => {
      const testCases = [
        { language: 'chinese', chineseRatio: 1.0, englishRatio: 0 },
        { language: 'english', chineseRatio: 0, englishRatio: 1.0 },
        { language: 'mixed', chineseRatio: 0.5, englishRatio: 0.5 },
        { language: 'unknown', chineseRatio: 0, englishRatio: 0 }
      ]

      testCases.forEach(analysis => {
        const scores = evaluator.calculateScores('test', analysis)
        Object.values(scores).forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(1)
        })
      })
    })
  })

  describe('性能测试', () => {
    it('应该快速完成评估', () => {
      const analysis = { language: 'chinese', chineseRatio: 1.0 }

      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        evaluator.calculateScores(`keyword${i}`, analysis)
      }
      const endTime = Date.now()

      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(1000) // 100次评估应该在1秒内完成
    })
  })
})
