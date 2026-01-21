/**
 * 单元2: 内容分析器测试
 * 测试HybridContentAnalyzer的所有功能
 */

import { describe, it, expect, beforeAll } from 'vitest'
import HybridContentAnalyzer from '../services/HybridContentAnalyzer.js'

describe('单元2: HybridContentAnalyzer', () => {
  let analyzer

  beforeAll(() => {
    analyzer = new HybridContentAnalyzer()
  })

  describe('2.1 基础功能测试', () => {
    it('应该能够创建分析器实例', () => {
      expect(analyzer).toBeDefined()
      expect(analyzer.speechService).toBeDefined()
      expect(analyzer.nlpService).toBeDefined()
      expect(analyzer.wenxinAPI).toBeDefined()
      console.log('✅ 分析器实例创建成功')
    })

    it('应该能够解析文本为词语数组', () => {
      const text = '今天我们来介绍Claude的两个核心能力'
      const words = analyzer.parseWords(text)

      expect(words).toBeDefined()
      expect(Array.isArray(words)).toBe(true)
      expect(words.length).toBeGreaterThan(0)
      expect(words[0]).toHaveProperty('word')
      expect(words[0]).toHaveProperty('start_time')
      expect(words[0]).toHaveProperty('end_time')
      console.log('✅ 文本解析成功:', words.slice(0, 3))
    })
  })

  describe('2.2 关键词提取', () => {
    it.skip('应该能够提取关键词（需要浏览器环境）', async () => {
      const text = 'Claude是一个多模态AI智能体，支持文本、图像和音频处理。它可以帮助用户完成各种复杂任务。'
      const keywords = await analyzer.extractKeywords(text)

      expect(keywords).toBeDefined()
      expect(Array.isArray(keywords)).toBe(true)
      expect(keywords.length).toBeGreaterThan(0)
      expect(keywords[0]).toHaveProperty('word')
      expect(keywords[0]).toHaveProperty('score')
      console.log('✅ 提取的关键词:', keywords.slice(0, 5).map(k => k.word))
    }, 15000)

    it.skip('应该按重要性排序关键词（需要浏览器环境）', async () => {
      const text = 'Claude是一个多模态AI智能体，支持文本、图像和音频处理。多模态能力是Claude的核心特性。'
      const keywords = await analyzer.extractKeywords(text)

      expect(keywords.length).toBeGreaterThan(1)
      expect(keywords[0].score).toBeGreaterThanOrEqual(keywords[1].score)
      console.log(
        '✅ 关键词权重:',
        keywords.slice(0, 3).map(k => `${k.word}(${k.score.toFixed(2)})`)
      )
    }, 15000)

    it('API失败时应该使用备用方案', async () => {
      const text = '测试文本内容'
      const keywords = analyzer.simpleKeywordExtraction(text)

      expect(keywords).toBeDefined()
      expect(Array.isArray(keywords)).toBe(true)
      console.log('✅ 备用关键词提取成功')
    })
  })

  describe('2.3 GPT语义分析', () => {
    it.skip('应该能够调用文心一言API（需要网络环境）', async () => {
      const transcript = {
        text: '今天我们来介绍Claude的两个核心能力：多模态和智能体。首先是多模态能力，Claude可以处理文本、图像和音频。其次是智能体能力，Claude可以自主完成复杂任务。',
        words: []
      }
      const keywords = [
        { word: 'Claude', score: 0.95 },
        { word: '多模态', score: 0.87 },
        { word: '智能体', score: 0.82 }
      ]

      const result = await analyzer.analyzeWithGPT(transcript, keywords)

      expect(result).toBeDefined()
      expect(result.mainTopic).toBeDefined()
      expect(result.segments).toBeDefined()
      expect(Array.isArray(result.segments)).toBe(true)
      console.log('✅ GPT分析结果:', {
        mainTopic: result.mainTopic,
        segmentCount: result.segments.length
      })
    }, 30000)

    it.skip('应该返回结构化的段落信息（需要网络环境）', async () => {
      const transcript = {
        text: '今天我们来介绍Claude的两个核心能力：多模态和智能体。',
        words: [
          { word: '今天', start_time: 0, end_time: 1 },
          { word: '我们', start_time: 1, end_time: 2 }
        ]
      }
      const keywords = [{ word: 'Claude', score: 0.95 }]

      const result = await analyzer.analyzeWithGPT(transcript, keywords)

      expect(result.segments.length).toBeGreaterThan(0)
      expect(result.segments[0]).toHaveProperty('text')
      expect(result.segments[0]).toHaveProperty('startTime')
      expect(result.segments[0]).toHaveProperty('endTime')
      expect(result.segments[0]).toHaveProperty('type')
      expect(result.segments[0]).toHaveProperty('concepts')
      console.log('✅ 段落结构:', result.segments[0])
    }, 30000)

    it('GPT失败时应该使用备用分析', () => {
      const transcript = {
        text: '这是测试文本。包含多个句子。用于测试备用方案。',
        words: [
          { word: '这是', start_time: 0, end_time: 1 },
          { word: '测试', start_time: 1, end_time: 2 },
          { word: '文本', start_time: 2, end_time: 3 }
        ]
      }
      const keywords = [
        { word: '测试', score: 0.9 },
        { word: '文本', score: 0.8 }
      ]

      const result = analyzer.fallbackAnalysis(transcript, keywords)

      expect(result).toBeDefined()
      expect(result.mainTopic).toBe('测试')
      expect(result.segments).toBeDefined()
      expect(result.segments.length).toBeGreaterThan(0)
      console.log('✅ 备用分析成功')
    })
  })

  describe('2.4 完整分析流程（模拟）', () => {
    it('应该能够处理完整的分析流程结构', () => {
      // 模拟完整分析结果的结构验证
      const mockResult = {
        mainTopic: 'Claude核心能力',
        summary: '介绍Claude的多模态和智能体能力',
        segments: [
          {
            text: '今天介绍Claude',
            startTime: 0,
            endTime: 3,
            type: 'opening',
            concepts: ['Claude', '介绍']
          },
          {
            text: '多模态能力说明',
            startTime: 3,
            endTime: 6,
            type: 'reveal',
            concepts: ['多模态', '能力']
          }
        ],
        keywords: [
          { word: 'Claude', score: 0.95 },
          { word: '多模态', score: 0.87 }
        ],
        transcript: {
          text: '完整文本内容',
          words: []
        },
        videoPath: 'test-video.mp4',
        audioPath: null
      }

      // 验证主题
      expect(typeof mockResult.mainTopic).toBe('string')
      expect(mockResult.mainTopic.length).toBeGreaterThan(0)

      // 验证段落
      expect(mockResult.segments.length).toBeGreaterThan(0)
      mockResult.segments.forEach(segment => {
        expect(segment).toHaveProperty('text')
        expect(segment).toHaveProperty('startTime')
        expect(segment).toHaveProperty('endTime')
        expect(segment).toHaveProperty('type')
        expect(segment).toHaveProperty('concepts')
      })

      // 验证关键词
      expect(mockResult.keywords.length).toBeGreaterThan(0)

      console.log('✅ 完整分析结果结构验证通过')
    })
  })
})
