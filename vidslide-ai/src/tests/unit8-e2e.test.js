/**
 * 单元8: 端到端测试
 * 完整的系统集成测试（简化版）
 */

import { describe, it, expect, beforeAll } from 'vitest'
import MasterPipeline from '../services/MasterPipeline.js'
import HybridContentAnalyzer from '../services/HybridContentAnalyzer.js'
import SimpleNarrativeDetector from '../services/SimpleNarrativeDetector.js'
import VisualAssetGenerator from '../services/VisualAssetGenerator.js'
import PracticalTimelineGenerator from '../services/PracticalTimelineGenerator.js'
import EnhancedVideoRenderer from '../services/EnhancedVideoRenderer.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('单元8: 端到端测试', () => {
  let pipeline
  const outputDir = path.join(__dirname, '../output/e2e')

  beforeAll(() => {
    pipeline = new MasterPipeline()
    pipeline.setConfig({
      outputDir: outputDir,
      enableCache: true
    })

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  describe('8.1 模块集成测试', () => {
    it('应该正确集成所有5个核心模块', () => {
      expect(pipeline.contentAnalyzer).toBeInstanceOf(HybridContentAnalyzer)
      expect(pipeline.narrativeDetector).toBeInstanceOf(SimpleNarrativeDetector)
      expect(pipeline.assetGenerator).toBeInstanceOf(VisualAssetGenerator)
      expect(pipeline.timelineGenerator).toBeInstanceOf(PracticalTimelineGenerator)
      expect(pipeline.videoRenderer).toBeInstanceOf(EnhancedVideoRenderer)
      console.log('✅ 所有5个核心模块集成成功')
    })

    it('应该支持模块间数据传递', () => {
      // 模拟数据流
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', startTime: 0, endTime: 3, type: 'opening', concepts: ['Claude'] },
          { text: '第一个能力是什么呢？', startTime: 3, endTime: 6, type: 'suspense', concepts: [] },
          { text: '是多模态', startTime: 6, endTime: 9, type: 'reveal', concepts: ['多模态'] }
        ],
        duration: 10
      }

      // 阶段2: 叙事检测
      const pattern = pipeline.executePhase2(analysisResult)
      expect(pattern).toBeDefined()
      expect(pattern.name).toBeDefined()

      // 阶段4: 时间轴生成
      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [{ concept: '多模态', path: '/path/to/concept-0.png' }],
        duration: 10
      }

      const timeline = pipeline.executePhase4(analysisResult, pattern, assets)
      expect(timeline).toBeDefined()
      expect(timeline.layers.length).toBeGreaterThan(0)

      console.log('✅ 模块间数据传递正常:', {
        pattern: pattern.name,
        timelineLayers: timeline.layers.length
      })
    })
  })

  describe('8.2 Sequential Reveal模式端到端', () => {
    it('应该处理sequential_reveal模式的完整流程', () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', startTime: 0, endTime: 3, type: 'opening', concepts: ['Claude'] },
          { text: '第一个能力是什么呢？', startTime: 3, endTime: 6, type: 'suspense', concepts: [] },
          { text: '是多模态', startTime: 6, endTime: 9, type: 'reveal', concepts: ['多模态'] },
          { text: '第二个能力是什么呢？', startTime: 9, endTime: 12, type: 'suspense', concepts: [] },
          { text: '是智能体', startTime: 12, endTime: 15, type: 'reveal', concepts: ['智能体'] }
        ],
        duration: 15
      }

      // 检测叙事模式
      const pattern = pipeline.executePhase2(analysisResult)
      expect(pattern.name).toBe('sequential_reveal')

      // 生成时间轴
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

      const timeline = pipeline.executePhase4(analysisResult, pattern, assets)

      // 验证时间轴结构
      expect(timeline.layers.length).toBeGreaterThan(5)

      // 验证问号卡片层
      const questionLayers = timeline.layers.filter(l => l.name === 'question-cards')
      expect(questionLayers.length).toBeGreaterThan(0)

      // 验证概念卡片层
      const conceptLayers = timeline.layers.filter(l => l.name && l.name.startsWith('concept-'))
      expect(conceptLayers.length).toBe(2)

      console.log('✅ Sequential Reveal模式端到端测试通过:', {
        pattern: pattern.name,
        confidence: pattern.confidence,
        totalLayers: timeline.layers.length,
        questionLayers: questionLayers.length,
        conceptLayers: conceptLayers.length
      })
    })
  })

  describe('8.3 Comparison模式端到端', () => {
    it('应该处理comparison模式的完整流程', () => {
      const analysisResult = {
        mainTopic: 'Claude vs GPT',
        segments: [
          { text: '今天对比两个AI', startTime: 0, endTime: 3, type: 'opening', concepts: [] },
          { text: 'Claude的优势', startTime: 3, endTime: 6, type: 'reveal', concepts: ['Claude'] },
          { text: 'GPT的优势', startTime: 6, endTime: 9, type: 'reveal', concepts: ['GPT'] }
        ],
        duration: 10
      }

      // 检测叙事模式
      const pattern = pipeline.executePhase2(analysisResult)
      expect(pattern.name).toBe('comparison')

      // 生成时间轴
      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [
          { concept: 'Claude', path: '/path/to/concept-0.png' },
          { concept: 'GPT', path: '/path/to/concept-1.png' }
        ],
        duration: 10
      }

      const timeline = pipeline.executePhase4(analysisResult, pattern, assets)

      // 验证时间轴结构
      expect(timeline.layers.length).toBeGreaterThan(0)

      console.log('✅ Comparison模式端到端测试通过:', {
        pattern: pattern.name,
        confidence: pattern.confidence,
        totalLayers: timeline.layers.length
      })
    })
  })

  describe('8.4 Timeline模式端到端', () => {
    it('应该处理timeline模式的完整流程', () => {
      const analysisResult = {
        mainTopic: 'AI发展历程',
        segments: [
          { text: '2020年GPT-3发布', startTime: 0, endTime: 3, type: 'reveal', concepts: ['GPT-3'] },
          { text: '2022年ChatGPT发布', startTime: 3, endTime: 6, type: 'reveal', concepts: ['ChatGPT'] },
          { text: '2023年Claude发布', startTime: 6, endTime: 9, type: 'reveal', concepts: ['Claude'] }
        ],
        duration: 10
      }

      // 检测叙事模式
      const pattern = pipeline.executePhase2(analysisResult)
      expect(pattern.name).toBe('timeline')

      // 生成时间轴
      const assets = {
        videoPath: '/path/to/video.mp4',
        bannerPath: '/path/to/banner.png',
        questionCardsPath: '/path/to/questions.png',
        conceptCards: [
          { concept: 'GPT-3', path: '/path/to/concept-0.png' },
          { concept: 'ChatGPT', path: '/path/to/concept-1.png' },
          { concept: 'Claude', path: '/path/to/concept-2.png' }
        ],
        duration: 10
      }

      const timeline = pipeline.executePhase4(analysisResult, pattern, assets)

      // 验证时间轴结构
      expect(timeline.layers.length).toBeGreaterThan(0)

      console.log('✅ Timeline模式端到端测试通过:', {
        pattern: pattern.name,
        confidence: pattern.confidence,
        totalLayers: timeline.layers.length
      })
    })
  })

  describe('8.5 错误处理和恢复', () => {
    it('应该处理无效输入', () => {
      const result = pipeline.validateInput(null, null, null)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      console.log('✅ 无效输入处理正常')
    })

    it('应该处理空数据', () => {
      const analysisResult = {
        mainTopic: '',
        segments: [],
        duration: 0
      }

      const pattern = pipeline.executePhase2(analysisResult)

      expect(pattern).toBeDefined()
      expect(pattern.name).toBe('basic')
      console.log('✅ 空数据处理正常，使用默认basic模式')
    })

    it('应该支持缓存机制', () => {
      pipeline.clearCache()
      expect(pipeline.getCacheSize()).toBe(0)

      // 模拟缓存
      const cacheKey = pipeline.generateCacheKey('test', 'data')
      expect(cacheKey).toBeDefined()
      expect(cacheKey.length).toBe(32) // MD5 hash长度

      console.log('✅ 缓存机制工作正常')
    })
  })

  describe('8.6 配置和状态管理', () => {
    it('应该支持动态配置更新', () => {
      const originalConfig = pipeline.getConfig()

      pipeline.setConfig({
        maxRetries: 5,
        timeout: 600000
      })

      const newConfig = pipeline.getConfig()

      expect(newConfig.maxRetries).toBe(5)
      expect(newConfig.timeout).toBe(600000)
      expect(newConfig.outputDir).toBe(originalConfig.outputDir) // 保留原有配置

      console.log('✅ 动态配置更新成功')
    })

    it('应该跟踪进度状态', () => {
      pipeline.initProgress()
      expect(pipeline.getProgress().phase).toBe(0)

      pipeline.updateProgress(1, 50, '测试中...')
      const progress = pipeline.getProgress()

      expect(progress.phase).toBe(1)
      expect(progress.percentage).toBe(50)
      expect(progress.message).toBe('测试中...')

      console.log('✅ 进度跟踪正常:', progress)
    })

    it('应该支持事件监听', () => {
      let eventFired = false

      pipeline.on('progress', progress => {
        eventFired = true
      })

      pipeline.updateProgress(2, 75, '事件测试')

      expect(eventFired).toBe(true)
      console.log('✅ 事件监听机制正常')
    })
  })

  describe('8.7 辅助功能测试', () => {
    it('应该生成唯一ID', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(pipeline.generateId())
      }

      expect(ids.size).toBe(100)
      console.log('✅ 生成100个唯一ID，无重复')
    })

    it('应该正确格式化时长', () => {
      expect(pipeline.formatDuration(0)).toBe('0:00')
      expect(pipeline.formatDuration(59)).toBe('0:59')
      expect(pipeline.formatDuration(60)).toBe('1:00')
      expect(pipeline.formatDuration(125)).toBe('2:05')
      expect(pipeline.formatDuration(3661)).toBe('61:01')

      console.log('✅ 时长格式化正确')
    })

    it('应该正确格式化文件大小', () => {
      expect(pipeline.formatFileSize(500)).toBe('500 B')
      expect(pipeline.formatFileSize(1024)).toBe('1.00 KB')
      expect(pipeline.formatFileSize(1024 * 1024)).toBe('1.00 MB')
      expect(pipeline.formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
      expect(pipeline.formatFileSize(1024 * 1024 * 5.5)).toBe('5.50 MB')

      console.log('✅ 文件大小格式化正确')
    })
  })

  describe('8.8 系统稳定性测试', () => {
    it('应该处理多次连续调用', () => {
      const analysisResult = {
        mainTopic: '测试主题',
        segments: [
          { text: '测试段落', startTime: 0, endTime: 3, type: 'opening', concepts: ['测试'] }
        ],
        duration: 5
      }

      // 连续调用10次
      for (let i = 0; i < 10; i++) {
        const pattern = pipeline.executePhase2(analysisResult)
        expect(pattern).toBeDefined()
      }

      console.log('✅ 连续调用10次，系统稳定')
    })

    it('应该正确管理缓存', () => {
      pipeline.clearCache()

      const stats1 = pipeline.getCacheStats()
      expect(stats1.size).toBe(0)
      expect(stats1.hits).toBe(0)
      expect(stats1.misses).toBe(0)

      console.log('✅ 缓存管理正常:', stats1)
    })
  })
})
