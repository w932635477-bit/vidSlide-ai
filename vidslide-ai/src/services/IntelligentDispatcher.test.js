/** * IntelligentDispatcher.test.js * VidSlide AI 智能调度器服务测试 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import dispatcher from './IntelligentDispatcher.js'

// Mock 依赖的服务
vi.mock('./utils/IntelligentDispatcher/KeywordAnalyzer.js', () => ({
  default: class KeywordAnalyzer {
    analyze(keyword) {
      if (keyword === '春节') {
        return {
          language: 'chinese',
          confidence: 1.0,
          patterns: [{ type: 'chinese', matched: true }],
          category: 'chinese_dominant'
        }
      } else if (keyword === 'nature') {
        return {
          language: 'english',
          confidence: 1.0,
          patterns: [{ type: 'english', matched: true }],
          category: 'english_dominant'
        }
      } else if (keyword === '人工智能AI') {
        return {
          language: 'mixed',
          confidence: 0.8,
          patterns: [
            { type: 'chinese', matched: true },
            { type: 'english', matched: true }
          ],
          category: 'mixed_with_patterns'
        }
      }
      return {
        language: 'unknown',
        confidence: 0.5,
        patterns: [],
        category: 'neutral'
      }
    }
  }
}))

vi.mock('./utils/IntelligentDispatcher/PlatformEvaluator.js', () => ({
  default: class PlatformEvaluator {
    calculateScores(keyword, analysis) {
      if (analysis.language === 'chinese') {
        return {
          baidu: 0.85,
          unsplash: 0.6,
          pexels: 0.55,
          pixabay: 0.5
        }
      } else if (analysis.language === 'english') {
        return {
          baidu: 0.4,
          unsplash: 0.82,
          pexels: 0.78,
          pixabay: 0.8
        }
      } else if (analysis.language === 'mixed') {
        return {
          baidu: 0.75,
          unsplash: 0.7,
          pexels: 0.65,
          pixabay: 0.68
        }
      }
      return {
        baidu: 0.5,
        unsplash: 0.7,
        pexels: 0.65,
        pixabay: 0.68
      }
    }
  }
}))

vi.mock('./utils/IntelligentDispatcher/TranslationService.js', () => ({
  default: class TranslationService {
    async initialize() {}
    async translate(keyword) {
      // 模拟翻译失败的情况
      if (keyword === 'force_error') {
        throw new Error('翻译失败')
      }
      if (keyword === 'analysis_error') {
        throw new Error('分析失败')
      }
      if (keyword === '春节') return 'Spring Festival'
      if (keyword === '人工智能AI') return 'artificial intelligence AI'
      return keyword
    }
  }
}))

describe('IntelligentDispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 清空调度器的缓存和统计
    dispatcher.clearCache()
  })

  describe('初始化', () => {
    it('应该正确初始化调度器', async () => {
      await dispatcher.initialize()
      expect(dispatcher.isInitialized).toBe(true)
    })

    it('重复初始化应该安全', async () => {
      await dispatcher.initialize()
      await dispatcher.initialize()
      expect(dispatcher.isInitialized).toBe(true)
    })
  })

  describe('调度决策', () => {
    beforeEach(async () => {
      await dispatcher.initialize()
    })

    it('应该为中文关键词推荐百度平台', async () => {
      const result = await dispatcher.dispatch('春节')

      expect(result.keyword).toBe('春节')
      expect(result.strategy.name).toBe('single_platform')
      expect(result.platforms[0].name).toBe('baidu')
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(result.translation).toBeDefined()
      expect(result.translation.translated).toBe('Spring Festival')
    })

    it('应该为英文关键词推荐国外平台', async () => {
      const result = await dispatcher.dispatch('nature')

      expect(result.keyword).toBe('nature')
      expect(result.strategy.name).toBe('single_platform')
      expect(result.platforms[0].name).toBe('unsplash') // 最高分平台(0.82)
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(result.translation).toBeNull() // 英文不需要翻译
    })

    it('应该为混合关键词使用并行策略', async () => {
      const result = await dispatcher.dispatch('人工智能AI')

      expect(result.keyword).toBe('人工智能AI')
      expect(result.strategy.name).toBe('parallel_platforms')
      expect(result.platforms.length).toBe(2) // parallel_platforms选2个
      expect(result.platforms[0].name).toBe('baidu')
      expect(result.confidence).toBeGreaterThan(0.7)
      expect(result.translation).toBeDefined()
    })

    it('应该根据用户偏好调整策略', async () => {
      const result = await dispatcher.dispatch('春节', {
        userPreferences: { strategy: 'speed' }
      })

      expect(result.strategy.name).toBe('single_platform') // speed策略对应single_platform
    })

    it('应该返回缓存的结果', async () => {
      // 第一次调用
      const result1 = await dispatcher.dispatch('春节')
      expect(result1.cacheHit).toBeUndefined() // 第一次不应该命中缓存

      // 第二次调用（应该命中缓存）
      const result2 = await dispatcher.dispatch('春节')
      expect(result2.cacheHit).toBe(true)
      expect(result2.keyword).toBe(result1.keyword)
      expect(result2.strategy.name).toBe(result1.strategy.name)
    })

    it('应该计算正确的预估时间', async () => {
      const result = await dispatcher.dispatch('春节')

      expect(result.estimatedTime).toBeGreaterThan(0)
      expect(typeof result.estimatedTime).toBe('number')
    })
  })

  describe('策略选择', () => {
    it('应该根据分析结果选择正确策略', () => {
      const analysis = { language: 'chinese', confidence: 1.0, patterns: [] }

      const strategy = dispatcher.selectStrategy(analysis, {})
      expect(strategy.name).toBe('single_platform')
      expect(strategy.translation).toBe(true)
    })

    it('应该为高质量分析选择速度优先策略', () => {
      const analysis = { language: 'chinese', confidence: 0.95, patterns: [] }

      const strategy = dispatcher.selectStrategy(analysis, {})
      expect(strategy.name).toBe('single_platform')
    })

    it('应该为复杂关键词选择并行策略', () => {
      const analysis = { language: 'mixed', confidence: 0.6, patterns: [{ matched: true }], category: 'mixed_with_patterns' }

      const strategy = dispatcher.selectStrategy(analysis, {})
      expect(strategy.name).toBe('parallel_platforms')
    })

    it('应该响应用户速度偏好', () => {
      const analysis = { language: 'chinese', confidence: 0.8, patterns: [] }

      const strategy = dispatcher.selectStrategy(analysis, { speedPriority: true })
      expect(strategy.name).toBe('single_platform')
    })
  })

  describe('平台选择', () => {
    it('应该为单平台策略选择最高分平台', () => {
      const strategy = { name: 'single_platform', platforms: 1 }
      const scores = { baidu: 0.8, unsplash: 0.7, pexels: 0.6 }

      const platforms = dispatcher.selectPlatforms(strategy, scores, 'test')

      expect(platforms.length).toBe(1)
      expect(platforms[0].name).toBe('baidu')
      expect(platforms[0].score).toBe(0.8)
    })

    it('应该为并行策略选择前两名平台', () => {
      const strategy = { name: 'parallel_platforms', platforms: 2 }
      const scores = { baidu: 0.8, unsplash: 0.7, pexels: 0.6, pixabay: 0.5 }

      const platforms = dispatcher.selectPlatforms(strategy, scores, 'test')

      expect(platforms.length).toBe(2)
      expect(platforms[0].name).toBe('baidu')
      expect(platforms[1].name).toBe('unsplash')
    })

    it('应该为渐进策略选择一个主平台', () => {
      const strategy = { name: 'progressive_expansion', platforms: 'adaptive' }
      const scores = { baidu: 0.8, unsplash: 0.7, pexels: 0.6 }

      const platforms = dispatcher.selectPlatforms(strategy, scores, 'test')

      expect(platforms.length).toBe(1)
      expect(platforms[0].name).toBe('baidu')
      expect(platforms[0].backup).toBeDefined()
      expect(platforms[0].backup.name).toBe('unsplash')
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await dispatcher.initialize()
    })

    it('应该收集性能统计', async () => {
      await dispatcher.dispatch('春节')
      await dispatcher.dispatch('nature')

      const stats = dispatcher.getPerformanceStats()

      expect(stats.totalTime.count).toBeGreaterThanOrEqual(2)
      expect(stats.totalTime.avg).toBeGreaterThan(0)
      expect(stats.cacheSize).toBeGreaterThanOrEqual(0)
    })

    it('应该提供优化建议', async () => {
      // 模拟一些操作
      for (let i = 0; i < 5; i++) {
        await dispatcher.dispatch(`test${i}`)
      }

      const suggestions = dispatcher.getOptimizationSuggestions()
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('应该正确统计平台使用情况', async () => {
      await dispatcher.dispatch('春节') // 使用baidu
      await dispatcher.dispatch('nature') // 使用pixabay

      const stats = dispatcher.getPerformanceStats()

      expect(stats.platformUsage.baidu).toBeDefined()
      expect(stats.platformUsage.pixabay).toBeDefined()
    })
  })

  describe('缓存管理', () => {
    beforeEach(async () => {
      await dispatcher.initialize()
    })

    it('应该正确管理缓存大小', async () => {
      // 填充缓存超过限制
      for (let i = 0; i < dispatcher.cacheMaxSize + 5; i++) {
        await dispatcher.dispatch(`keyword${i}`)
      }

      expect(dispatcher.resultCache.size).toBeLessThanOrEqual(dispatcher.cacheMaxSize)
    })

    it('应该能够清空调存', async () => {
      await dispatcher.dispatch('春节')
      expect(dispatcher.resultCache.size).toBeGreaterThan(0)

      dispatcher.clearCache()
      expect(dispatcher.resultCache.size).toBe(0)
    })

    it('应该正确生成缓存键', () => {
      const key1 = dispatcher.generateCacheKey('test', {})
      const key2 = dispatcher.generateCacheKey('test', {})
      const key3 = dispatcher.generateCacheKey('test', { param: 'value' })

      expect(typeof key1).toBe('string')
      expect(key1.length).toBeGreaterThan(0)
      expect(key1).toBe(key2) // 相同参数应该生成相同键
      expect(key1).not.toBe(key3) // 不同参数应该生成不同键
    })
  })

  describe('错误处理', () => {
    beforeEach(async () => {
      await dispatcher.initialize()
    })

    it('应该在关键词分析失败时返回错误结果', async () => {
      // 使用mock中预设的错误关键词
      const result = await dispatcher.dispatch('analysis_error')

      expect(result.error).toBeDefined()
      expect(result.strategy).toBeNull()
    })

    it('应该在翻译失败时继续执行', async () => {
      // 使用mock中预设的错误关键词
      const result = await dispatcher.dispatch('force_error')

      expect(result.error).toBeUndefined() // 翻译失败不应该导致整体错误
      expect(result.strategy).toBeDefined() // 应该有策略
      expect(result.translation).toBeUndefined() // 翻译失败
    })

    it('应该处理空的关键词', async () => {
      const result = await dispatcher.dispatch('')

      expect(result.error).toBeDefined()
      expect(result.keyword).toBe('')
    })

    it('应该处理null关键词', async () => {
      const result = await dispatcher.dispatch(null)

      expect(result.error).toBeDefined()
      expect(result.keyword).toBeNull()
    })
  })

  describe('推理生成', () => {
    it('应该为中文关键词生成正确的推理', async () => {
      const result = await dispatcher.dispatch('春节')

      expect(result.reasoning).toContain('中文关键词')
      expect(result.reasoning).toContain('百度平台')
    })

    it('应该为英文关键词生成正确的推理', async () => {
      const result = await dispatcher.dispatch('nature')

      expect(result.reasoning).toContain('英文关键词')
    })

    it('应该为策略选择生成推理说明', async () => {
      const result = await dispatcher.dispatch('人工智能AI')

      expect(result.reasoning).toContain('渐进式扩展')
    })
  })
})
