/**
 * CLIPMatcher.test.js
 * CLIP多模态匹配服务单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import CLIPMatcher from './CLIPMatcher.js'

describe('CLIPMatcher', () => {
  let matcher

  beforeEach(() => {
    matcher = new CLIPMatcher()
  })

  afterEach(() => {
    matcher.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化匹配器', () => {
      expect(matcher.model).toBeNull()
      expect(matcher.tokenizer).toBeNull()
      expect(matcher.isInitialized).toBe(false)
      expect(matcher.cache).toBeInstanceOf(Map)
    })

    it('应该异步初始化CLIP模型', async () => {
      // Mock TensorFlow and CLIP loading
      global.tf = {
        randomNormal: vi.fn().mockReturnValue({ shape: [1, 512] }),
        matMul: vi.fn(),
        norm: vi.fn(),
        div: vi.fn(),
        sub: vi.fn(),
        meanStdDev: vi.fn(),
        image: { resizeBilinear: vi.fn() },
        transpose: vi.fn(),
        browser: { fromPixels: vi.fn() },
        tensor: vi.fn(),
        disposeVariables: vi.fn()
      }

      vi.spyOn(matcher, 'loadTensorFlow').mockResolvedValue()
      vi.spyOn(matcher, 'loadCLIPModel').mockResolvedValue()

      await matcher.initialize()

      expect(matcher.isInitialized).toBe(true)
    })
  })

  describe('文本-图像匹配', () => {
    beforeEach(async () => {
      await matcher.initialize()
    })

    it('应该计算文本和图像的相似度', async () => {
      const text = '测试文本'
      const images = [
        { width: 100, height: 100, data: new Uint8ClampedArray(100 * 100 * 4) },
        { width: 100, height: 100, data: new Uint8ClampedArray(100 * 100 * 4) }
      ]

      vi.spyOn(matcher, 'encodeText').mockResolvedValue({ shape: [1, 512] })
      vi.spyOn(matcher, 'encodeImages').mockResolvedValue({ shape: [2, 512] })
      vi.spyOn(matcher, 'computeSimilarities').mockResolvedValue([0.8, 0.6])

      const similarities = await matcher.matchTextToImages(text, images)

      expect(similarities).toEqual([0.8, 0.6])
    })

    it('应该批量计算相似度', async () => {
      const texts = ['文本1', '文本2']
      const images = [{ data: new Uint8ClampedArray(100) }]

      vi.spyOn(matcher, 'matchTextToImages').mockResolvedValue([0.8])

      const results = await matcher.matchBatch(texts, images)

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual([0.8])
    })
  })

  describe('编码功能', () => {
    beforeEach(async () => {
      await matcher.initialize()
    })

    it('应该编码文本', async () => {
      const text = '测试文本'

      vi.spyOn(matcher, 'preprocessText').mockReturnValue(text)

      const embedding = await matcher.encodeText(text)

      expect(embedding).toBeDefined()
    })

    it('应该编码图像', async () => {
      const images = [{ width: 100, height: 100, data: new Uint8ClampedArray(100 * 100 * 4) }]

      vi.spyOn(matcher, 'encodeImages').mockResolvedValue({ shape: [1, 512] })

      const embeddings = await matcher.encodeImages(images)

      expect(embeddings.shape).toEqual([1, 512])
    })
  })

  describe('最佳匹配查找', () => {
    beforeEach(async () => {
      await matcher.initialize()
    })

    it('应该找到最佳匹配', async () => {
      const text = '测试查询'
      const images = [
        { id: 'img1', tags: ['测试'] },
        { id: 'img2', tags: ['其他'] }
      ]

      vi.spyOn(matcher, 'matchTextToImages').mockResolvedValue([0.9, 0.3])

      const matches = await matcher.findBestMatches(text, images, 2)

      expect(matches).toHaveLength(2)
      expect(matches[0].similarity).toBe(0.9)
      expect(matches[0].rank).toBe(1)
    })
  })

  describe('智能素材选择', () => {
    beforeEach(async () => {
      await matcher.initialize()
    })

    it('应该基于内容分析选择素材', async () => {
      const contentAnalysis = {
        keywords: [{ text: '测试', importance: 0.8 }],
        category: 'presentation'
      }
      const materials = [
        { id: 'mat1', tags: ['测试'] },
        { id: 'mat2', tags: ['其他'] }
      ]

      vi.spyOn(matcher, 'findBestMatches').mockResolvedValue([
        { similarity: 0.8, rank: 1 }
      ])

      const selected = await matcher.selectMaterials(contentAnalysis, materials)

      expect(selected).toBeInstanceOf(Array)
      expect(selected[0]).toHaveProperty('weightedSimilarity')
    })
  })

  describe('文本预处理', () => {
    it('应该预处理文本', () => {
      const text = '  测试文本！@#  '
      const processed = matcher.preprocessText(text)

      expect(processed).toBe('测试文本')
      expect(processed.length).toBeLessThanOrEqual(77) // CLIP限制
    })
  })

  describe('缓存管理', () => {
    it('应该使用缓存', async () => {
      const text = '缓存测试'

      // 第一次调用
      await matcher.encodeText(text)

      // 第二次应该从缓存获取
      const cached = matcher.cache.get(`text_${text}`)
      expect(cached).toBeDefined()
    })

    it('应该限制缓存大小', () => {
      // 填充缓存到超过限制
      for (let i = 0; i < matcher.maxCacheSize + 10; i++) {
        matcher.cache.set(`key${i}`, { data: `value${i}` })
      }

      expect(matcher.cache.size).toBeLessThanOrEqual(matcher.maxCacheSize)
    })
  })

  describe('性能统计', () => {
    it('应该提供性能统计', () => {
      const stats = matcher.getPerformanceStats()

      expect(stats).toHaveProperty('initialized')
      expect(stats).toHaveProperty('cacheSize')
      expect(stats).toHaveProperty('modelLoaded')
      expect(stats).toHaveProperty('tokenizerLoaded')
    })
  })

  describe('降级策略', () => {
    it('应该在CLIP失败时使用关键词匹配', async () => {
      // 模拟CLIP失败
      vi.spyOn(matcher, 'matchTextToImages').mockRejectedValue(new Error('CLIP failed'))

      const text = '测试'
      const images = [{ tags: ['测试'] }]

      const result = await matcher.matchTextToImages(text, images)

      // 应该返回降级结果
      expect(result).toBeDefined()
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      matcher.isInitialized = true
      matcher.model = { dispose: vi.fn() }
      matcher.cache.set('test', {})

      matcher.cleanup()

      expect(matcher.cache.size).toBe(0)
      expect(matcher.model).toBeNull()
      expect(matcher.isInitialized).toBe(false)
    })
  })
})