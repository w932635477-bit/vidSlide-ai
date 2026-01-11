/** * KeywordAnalyzer.test.js * VidSlide AI 关键词分析器测试 */

import { describe, it, expect, beforeEach } from 'vitest'
import KeywordAnalyzer from './KeywordAnalyzer.js'

describe('KeywordAnalyzer', () => {
  let analyzer

  beforeEach(() => {
    analyzer = new KeywordAnalyzer()
  })

  describe('基本分析功能', () => {
    it('应该分析中文关键词', () => {
      const result = analyzer.analyze('春节')

      expect(result.original).toBe('春节')
      expect(result.normalized).toBe('春节')
      expect(result.length).toBe(2)
      expect(result.chineseChars).toBe(2)
      expect(result.englishChars).toBe(0)
      expect(result.language).toBe('chinese')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该分析英文关键词', () => {
      const result = analyzer.analyze('nature')

      expect(result.original).toBe('nature')
      expect(result.language).toBe('english')
      expect(result.englishChars).toBe(6)
      expect(result.chineseChars).toBe(0)
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该分析混合关键词', () => {
      const result = analyzer.analyze('人工智能AI')

      expect(result.language).toBe('mixed')
      expect(result.chineseChars).toBeGreaterThan(0)
      expect(result.englishChars).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('应该分析纯英文句子', () => {
      const result = analyzer.analyze('beautiful landscape')

      expect(result.language).toBe('english')
      expect(result.category).toBe('english_dominant')
    })

    it('应该处理空字符串', () => {
      expect(() => analyzer.analyze('')).toThrow('关键词必须是非空字符串')
    })

    it('应该处理null值', () => {
      expect(() => analyzer.analyze(null)).toThrow('关键词必须是非空字符串')
    })
  })

  describe('模式匹配', () => {
    it('应该识别中文节日模式', () => {
      const result = analyzer.analyze('春节快乐')

      expect(result.patterns.some(p => p.type === 'chinese')).toBe(true)
      expect(result.category).toBe('chinese_dominant')
    })

    it('应该识别科技相关关键词', () => {
      const result = analyzer.analyze('人工智能')

      expect(result.patterns.some(p => p.type === 'chinese')).toBe(true)
      expect(result.category).toBe('chinese_dominant')
    })

    it('应该识别英文自然风景关键词', () => {
      const result = analyzer.analyze('mountain landscape')

      expect(result.patterns.some(p => p.type === 'english')).toBe(true)
      expect(result.category).toBe('english_dominant')
    })

    it('应该处理无匹配的关键词', () => {
      const result = analyzer.analyze('xyz123')

      expect(result.patterns.length).toBe(0)
      expect(result.category).toBe('neutral')
    })
  })

  describe('语言比例计算', () => {
    it('应该正确计算中文比例', () => {
      const result = analyzer.analyze('春节')

      expect(result.chineseRatio).toBe(1.0)
      expect(result.englishRatio).toBe(0)
    })

    it('应该正确计算英文比例', () => {
      const result = analyzer.analyze('hello')

      expect(result.englishRatio).toBe(1.0)
      expect(result.chineseRatio).toBe(0)
    })

    it('应该正确计算混合比例', () => {
      const result = analyzer.analyze('AI人工智能')

      expect(result.chineseRatio).toBeGreaterThan(0)
      expect(result.englishRatio).toBeGreaterThan(0)
      expect(result.chineseRatio + result.englishRatio).toBeLessThanOrEqual(1)
    })
  })

  describe('特征提取', () => {
    it('应该提取长度特征', () => {
      const shortResult = analyzer.analyze('春')
      const longResult = analyzer.analyze('人工智能技术发展')

      expect(shortResult.features.length.short).toBe(true)
      expect(longResult.features.length.long).toBe(true)
    })

    it('应该评估专业度', () => {
      const professional = analyzer.analyze('人工智能')
      const casual = analyzer.analyze('你好')

      expect(professional.features.professionalism).toBe('high')
      expect(casual.features.professionalism).toBe('low')
    })

    it('应该评估时效性', () => {
      const timely = analyzer.analyze('最新科技')
      const normal = analyzer.analyze('风景')

      expect(timely.features.timeliness).toBe('high')
      expect(normal.features.timeliness).toBe('low')
    })

    it('应该评估情感倾向', () => {
      const positive = analyzer.analyze('优秀')
      const negative = analyzer.analyze('问题')
      const neutral = analyzer.analyze('天气')

      expect(positive.features.sentiment).toBe('positive')
      expect(negative.features.sentiment).toBe('negative')
      expect(neutral.features.sentiment).toBe('neutral')
    })
  })

  describe('缓存功能', () => {
    it('应该缓存分析结果', () => {
      const result1 = analyzer.analyze('春节')
      const result2 = analyzer.analyze('春节')

      expect(result1).toEqual(result2)
      expect(result1).toBe(result2) // 应该返回同一个对象
    })

    it('应该处理缓存过期', () => {
      // 由于缓存没有过期逻辑，这里主要测试缓存存储
      analyzer.analyze('测试关键词')
      expect(analyzer.analysisCache.size).toBeGreaterThan(0)
    })

    it('应该控制缓存大小', () => {
      // 填充缓存
      for (let i = 0; i < analyzer.cacheMaxSize + 10; i++) {
        analyzer.analyze(`关键词${i}`)
      }

      expect(analyzer.analysisCache.size).toBeLessThanOrEqual(analyzer.cacheMaxSize)
    })

    it('应该能够清空调存', () => {
      analyzer.analyze('春节')
      expect(analyzer.analysisCache.size).toBeGreaterThan(0)

      analyzer.clearCache()
      expect(analyzer.analysisCache.size).toBe(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊字符', () => {
      const result = analyzer.analyze('Hello, 世界！')

      expect(result.language).toBe('mixed')
      expect(result.chineseChars).toBe(2)
      expect(result.englishChars).toBe(5)
    })

    it('应该处理数字和符号', () => {
      const result = analyzer.analyze('AI2023!')

      expect(result.language).toBe('english')
      expect(result.category).toBe('neutral')
    })

    it('应该处理重复关键词', () => {
      const result1 = analyzer.analyze('测试')
      const result2 = analyzer.analyze('测试')

      expect(result1).toEqual(result2)
    })

    it('应该处理大小写差异', () => {
      const result1 = analyzer.analyze('Nature')
      const result2 = analyzer.analyze('nature')

      expect(result1.language).toBe(result2.language)
      expect(result1.category).toBe(result2.category)
    })
  })

  describe('性能和稳定性', () => {
    it('应该快速分析关键词', () => {
      const startTime = Date.now()
      analyzer.analyze('这是一个测试关键词用于性能测试')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })

    it('应该处理长文本', () => {
      const longText = '人工智能技术正在快速发展，包括机器学习深度学习自然语言处理计算机视觉等领域'
      const result = analyzer.analyze(longText)

      expect(result.length).toBe(longText.length)
      expect(result.language).toBe('chinese')
    })

    it('应该处理包含空格的文本', () => {
      const result = analyzer.analyze('  人工智能技术  ')

      expect(result.normalized).toBe('  人工智能技术  ') // 保留原始空格
      expect(result.language).toBe('chinese')
    })
  })

  describe('分类准确性', () => {
    it('应该正确分类中文主导内容', () => {
      const testCases = ['春节', '人工智能', '传统文化', '北京']

      testCases.forEach(keyword => {
        const result = analyzer.analyze(keyword)
        expect(result.category).toBe('chinese_dominant')
        expect(result.language).toBe('chinese')
      })
    })

    it('应该正确分类英文主导内容', () => {
      const testCases = ['nature', 'technology', 'business']

      testCases.forEach(keyword => {
        const result = analyzer.analyze(keyword)
        expect(result.category).toBe('english_dominant')
        expect(result.language).toBe('english')
      })
    })

    it('应该正确分类混合内容', () => {
      const testCases = ['AI人工智能', '机器学习ML', '春节festival']

      testCases.forEach(keyword => {
        const result = analyzer.analyze(keyword)
        expect(['mixed', 'mixed_with_patterns'].includes(result.category)).toBe(true)
      })
    })
  })
})
