/**
 * 单元5: 时间轴生成器测试
 * 测试PracticalTimelineGenerator的时间轴编排能力
 */

import { describe, it, expect, beforeAll } from 'vitest'
import PracticalTimelineGenerator from '../services/PracticalTimelineGenerator.js'

describe('单元5: PracticalTimelineGenerator', () => {
  let generator

  beforeAll(() => {
    generator = new PracticalTimelineGenerator()
  })

  describe('5.1 时间轴结构', () => {
    it('应该创建基础时间轴结构', () => {
      const timeline = generator.createBaseTimeline(10)

      expect(timeline).toBeDefined()
      expect(timeline.duration).toBe(10)
      expect(timeline.layers).toBeDefined()
      expect(Array.isArray(timeline.layers)).toBe(true)
      console.log('✅ 基础时间轴结构:', timeline)
    })

    it('应该创建固定层（主视频+横幅）', () => {
      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        duration: 10
      }

      const layers = generator.createFixedLayers(assets)

      expect(layers.length).toBe(2)
      expect(layers[0].type).toBe('video')
      expect(layers[1].type).toBe('image')
      expect(layers[1].name).toBe('banner')
      console.log('✅ 固定层:', layers)
    })

    it('应该创建动态层（问号卡片+概念卡片）', () => {
      const analysisResult = {
        segments: [
          { startTime: 3, endTime: 6, type: 'suspense' },
          { startTime: 6, endTime: 9, type: 'reveal', concepts: ['多模态'] }
        ]
      }

      const assets = {
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [{ concept: '多模态', path: '/path/to/concept-0.png' }]
      }

      const layers = generator.createSequentialRevealLayers(analysisResult, assets)

      expect(layers.length).toBeGreaterThan(0)
      expect(layers[0].type).toBe('image')
      console.log('✅ 动态层:', layers)
    })

    it('应该创建字幕层', () => {
      const analysisResult = {
        segments: [
          { text: '第一段', startTime: 0, endTime: 3 },
          { text: '第二段', startTime: 3, endTime: 6 }
        ]
      }

      const layer = generator.createSubtitleLayer(analysisResult)

      expect(layer).toBeDefined()
      expect(layer.type).toBe('subtitle')
      expect(layer.subtitles.length).toBe(2)
      console.log('✅ 字幕层:', layer)
    })
  })

  describe('5.2 Sequential Reveal模式', () => {
    it('应该正确编排sequential_reveal时间轴', () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', startTime: 0, endTime: 3, type: 'opening' },
          { text: '第一个能力是什么呢？', startTime: 3, endTime: 6, type: 'suspense' },
          { text: '是多模态', startTime: 6, endTime: 9, type: 'reveal', concepts: ['多模态'] },
          { text: '第二个能力是什么呢？', startTime: 9, endTime: 12, type: 'suspense' },
          { text: '是智能体', startTime: 12, endTime: 15, type: 'reveal', concepts: ['智能体'] }
        ]
      }

      const pattern = { name: 'sequential_reveal' }

      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [
          { concept: '多模态', path: '/path/to/concept-0.png' },
          { concept: '智能体', path: '/path/to/concept-1.png' }
        ],
        duration: 15
      }

      const timeline = generator.generate(analysisResult, pattern, assets)

      expect(timeline.duration).toBe(15)
      expect(timeline.layers.length).toBeGreaterThan(5)

      // 验证问号卡片层
      const questionLayer = timeline.layers.find(l => l.name === 'question-cards')
      expect(questionLayer).toBeDefined()
      expect(questionLayer.startTime).toBe(3)
      expect(questionLayer.endTime).toBe(6)

      // 验证概念卡片层
      const conceptLayers = timeline.layers.filter(l => l.name && l.name.startsWith('concept-'))
      expect(conceptLayers.length).toBe(2)

      console.log('✅ Sequential Reveal时间轴:', {
        duration: timeline.duration,
        layerCount: timeline.layers.length,
        questionLayer: questionLayer,
        conceptLayers: conceptLayers.length
      })
    })
  })

  describe('5.3 动画效果', () => {
    it('应该定义淡入淡出效果', () => {
      const effect = generator.createFadeEffect(3, 6)

      expect(effect).toBeDefined()
      expect(effect.type).toBe('fade')
      expect(effect.startTime).toBe(3)
      expect(effect.endTime).toBe(6)
      console.log('✅ 淡入淡出效果:', effect)
    })

    it('应该定义翻转效果', () => {
      const effect = generator.createFlipEffect(6, 7)

      expect(effect).toBeDefined()
      expect(effect.type).toBe('flip')
      expect(effect.duration).toBe(1)
      console.log('✅ 翻转效果:', effect)
    })

    it('应该定义缩放效果', () => {
      const effect = generator.createScaleEffect(0, 1, 0.8, 1.0)

      expect(effect).toBeDefined()
      expect(effect.type).toBe('scale')
      expect(effect.from).toBe(0.8)
      expect(effect.to).toBe(1.0)
      console.log('✅ 缩放效果:', effect)
    })
  })

  describe('5.4 时间计算', () => {
    it('应该正确计算层的持续时间', () => {
      const layer = {
        startTime: 3,
        endTime: 6
      }

      const duration = generator.calculateDuration(layer)

      expect(duration).toBe(3)
      console.log('✅ 持续时间:', duration)
    })

    it('应该检测时间重叠', () => {
      const layer1 = { startTime: 3, endTime: 6 }
      const layer2 = { startTime: 5, endTime: 8 }
      const layer3 = { startTime: 7, endTime: 10 }

      expect(generator.hasOverlap(layer1, layer2)).toBe(true)
      expect(generator.hasOverlap(layer1, layer3)).toBe(false)
      console.log('✅ 时间重叠检测正常')
    })

    it('应该验证时间轴完整性', () => {
      const timeline = {
        duration: 10,
        layers: [
          { startTime: 0, endTime: 10 },
          { startTime: 3, endTime: 6 },
          { startTime: 6, endTime: 9 }
        ]
      }

      const isValid = generator.validateTimeline(timeline)

      expect(isValid).toBe(true)
      console.log('✅ 时间轴验证通过')
    })
  })

  describe('5.5 完整生成流程', () => {
    it('应该生成完整的时间轴', () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', startTime: 0, endTime: 3, type: 'opening' },
          { text: '第一个能力是什么呢？', startTime: 3, endTime: 6, type: 'suspense' },
          { text: '是多模态', startTime: 6, endTime: 9, type: 'reveal', concepts: ['多模态'] }
        ]
      }

      const pattern = { name: 'sequential_reveal' }

      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [{ concept: '多模态', path: '/path/to/concept-0.png' }],
        duration: 10
      }

      const timeline = generator.generate(analysisResult, pattern, assets)

      expect(timeline).toBeDefined()
      expect(timeline.duration).toBe(10)
      expect(timeline.layers.length).toBeGreaterThan(0)

      // 验证必要的层
      const videoLayer = timeline.layers.find(l => l.type === 'video')
      const bannerLayer = timeline.layers.find(l => l.name === 'banner')
      const subtitleLayer = timeline.layers.find(l => l.type === 'subtitle')

      expect(videoLayer).toBeDefined()
      expect(bannerLayer).toBeDefined()
      expect(subtitleLayer).toBeDefined()

      console.log('✅ 完整时间轴生成成功:', {
        duration: timeline.duration,
        layerCount: timeline.layers.length,
        hasVideo: !!videoLayer,
        hasBanner: !!bannerLayer,
        hasSubtitle: !!subtitleLayer
      })
    })
  })
})
