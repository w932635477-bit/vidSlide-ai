/**
 * 单元3: 叙事检测器测试
 * 测试SimpleNarrativeDetector的模式识别能力
 */

import { describe, it, expect, beforeAll } from 'vitest'
import SimpleNarrativeDetector from '../services/SimpleNarrativeDetector.js'

describe('单元3: SimpleNarrativeDetector', () => {
  let detector

  beforeAll(() => {
    detector = new SimpleNarrativeDetector()
  })

  describe('3.1 模式识别', () => {
    it('应该识别sequential_reveal模式', () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', type: 'opening', concepts: ['Claude'] },
          { text: '第一个能力是什么呢？', type: 'suspense', concepts: [] },
          { text: '是多模态', type: 'reveal', concepts: ['多模态'] },
          { text: '第二个能力是什么呢？', type: 'suspense', concepts: [] },
          { text: '是智能体', type: 'reveal', concepts: ['智能体'] }
        ]
      }

      const pattern = detector.detect(analysisResult)

      expect(pattern.name).toBe('sequential_reveal')
      expect(pattern.confidence).toBeGreaterThan(0.7)
      console.log('✅ 识别为sequential_reveal模式，置信度:', pattern.confidence)
    })

    it('应该识别comparison模式', () => {
      const analysisResult = {
        mainTopic: 'GPT vs Claude对比',
        segments: [
          { text: '今天对比两个AI', type: 'opening', concepts: ['GPT', 'Claude'] },
          { text: 'GPT的特点', type: 'reveal', concepts: ['GPT'] },
          { text: 'Claude的特点', type: 'reveal', concepts: ['Claude'] },
          { text: '总结对比', type: 'conclusion', concepts: ['GPT', 'Claude'] }
        ]
      }

      const pattern = detector.detect(analysisResult)

      expect(pattern.name).toBe('comparison')
      expect(pattern.confidence).toBeGreaterThan(0.6)
      console.log('✅ 识别为comparison模式，置信度:', pattern.confidence)
    })

    it('应该识别timeline模式', () => {
      const analysisResult = {
        mainTopic: 'AI发展历史',
        segments: [
          { text: '2018年GPT-1发布', type: 'reveal', concepts: ['2018', 'GPT-1'] },
          { text: '2020年GPT-3发布', type: 'reveal', concepts: ['2020', 'GPT-3'] },
          { text: '2023年GPT-4发布', type: 'reveal', concepts: ['2023', 'GPT-4'] },
          { text: '2024年Claude 3发布', type: 'reveal', concepts: ['2024', 'Claude'] }
        ]
      }

      const pattern = detector.detect(analysisResult)

      expect(pattern.name).toBe('timeline')
      expect(pattern.confidence).toBeGreaterThan(0.6)
      console.log('✅ 识别为timeline模式，置信度:', pattern.confidence)
    })

    it('应该识别basic模式（默认）', () => {
      const analysisResult = {
        mainTopic: '随机内容',
        segments: [
          { text: '开始介绍内容', type: 'opening', concepts: ['主题'] },
          { text: '详细说明主题', type: 'reveal', concepts: ['主题'] },
          { text: '总结主题内容', type: 'conclusion', concepts: ['主题'] }
        ]
      }

      const pattern = detector.detect(analysisResult)

      expect(pattern.name).toBe('basic')
      console.log('✅ 识别为basic模式（默认）')
    })
  })

  describe('3.2 模式特征分析', () => {
    it('应该正确统计段落类型', () => {
      const segments = [
        { type: 'opening' },
        { type: 'suspense' },
        { type: 'reveal' },
        { type: 'suspense' },
        { type: 'reveal' }
      ]

      const stats = detector.analyzeSegments(segments)

      expect(stats.suspenseCount).toBe(2)
      expect(stats.revealCount).toBe(2)
      expect(stats.totalSegments).toBe(5)
      console.log('✅ 段落统计:', {
        suspenseCount: stats.suspenseCount,
        revealCount: stats.revealCount,
        totalSegments: stats.totalSegments
      })
    })

    it('应该正确识别时间关键词', () => {
      const segments = [
        { text: '2018年发生了什么', concepts: ['2018'] },
        { text: '2020年又发生了什么', concepts: ['2020'] },
        { text: '2023年最新进展', concepts: ['2023'] }
      ]

      const stats = detector.analyzeSegments(segments)

      expect(stats.hasTimeKeywords).toBe(true)
      console.log('✅ 检测到时间关键词')
    })

    it('应该正确识别对比关键词', () => {
      const segments = [
        { text: 'A和B的对比', concepts: ['A', 'B'] },
        { text: 'A的优势', concepts: ['A'] },
        { text: 'B的优势', concepts: ['B'] }
      ]

      const stats = detector.analyzeSegments(segments)

      expect(stats.hasComparisonKeywords).toBe(true)
      console.log('✅ 检测到对比关键词')
    })
  })
})
