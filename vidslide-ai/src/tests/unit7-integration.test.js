/**
 * 单元7: 主流程集成测试
 * 测试MasterPipeline的完整流程
 */

import { describe, it, expect, beforeAll } from 'vitest'
import MasterPipeline from '../services/MasterPipeline.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('单元7: MasterPipeline', () => {
  let pipeline
  const outputDir = path.join(__dirname, '../output/integration')

  beforeAll(() => {
    pipeline = new MasterPipeline()

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  describe('7.1 流程初始化', () => {
    it('应该正确初始化所有模块', () => {
      expect(pipeline.contentAnalyzer).toBeDefined()
      expect(pipeline.narrativeDetector).toBeDefined()
      expect(pipeline.assetGenerator).toBeDefined()
      expect(pipeline.timelineGenerator).toBeDefined()
      expect(pipeline.videoRenderer).toBeDefined()
      console.log('✅ 所有模块初始化成功')
    })

    it('应该设置默认配置', () => {
      const config = pipeline.getConfig()

      expect(config).toBeDefined()
      expect(config.outputDir).toBeDefined()
      expect(config.enableCache).toBeDefined()
      console.log('✅ 默认配置:', config)
    })
  })

  describe('7.2 阶段执行', () => {
    it('应该执行阶段2: 叙事检测', () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [
          { text: '今天介绍Claude', type: 'opening', concepts: ['Claude'] },
          { text: '第一个能力是什么呢？', type: 'suspense', concepts: [] },
          { text: '是多模态', type: 'reveal', concepts: ['多模态'] }
        ]
      }

      const pattern = pipeline.executePhase2(analysisResult)

      expect(pattern).toBeDefined()
      expect(pattern.name).toBeDefined()
      expect(pattern.confidence).toBeGreaterThan(0)
      console.log('✅ 阶段2完成:', pattern.name)
    })

    it('应该执行阶段4: 时间轴生成', () => {
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
        bannerPath: path.join(outputDir, 'banner.png'),
        questionCardsPath: path.join(outputDir, 'question-cards.png'),
        conceptCards: [{ concept: '多模态', path: path.join(outputDir, 'concept-0.png') }],
        duration: 10
      }

      const timeline = pipeline.executePhase4(analysisResult, pattern, assets)

      expect(timeline).toBeDefined()
      expect(timeline.duration).toBe(10)
      expect(timeline.layers.length).toBeGreaterThan(0)
      console.log('✅ 阶段4完成:', {
        duration: timeline.duration,
        layerCount: timeline.layers.length
      })
    })
  })

  describe('7.3 错误处理', () => {
    it('应该支持重试机制', () => {
      pipeline.setConfig({ maxRetries: 3 })

      const retryCount = pipeline.getConfig().maxRetries
      expect(retryCount).toBe(3)
      console.log('✅ 重试机制配置成功')
    })

    it('应该验证输入参数', () => {
      const result = pipeline.validateInput(null, null, null)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      console.log('✅ 输入验证工作正常')
    })
  })

  describe('7.4 配置管理', () => {
    it('应该更新配置', () => {
      pipeline.setConfig({
        outputDir: '/custom/output',
        enableCache: false,
        maxRetries: 5
      })

      const config = pipeline.getConfig()

      expect(config.outputDir).toBe('/custom/output')
      expect(config.enableCache).toBe(false)
      expect(config.maxRetries).toBe(5)
      console.log('✅ 配置更新成功')
    })

    it('应该验证配置', () => {
      const validConfig = {
        outputDir: outputDir,
        enableCache: true,
        maxRetries: 3
      }

      const result = pipeline.validateConfig(validConfig)

      expect(result.valid).toBe(true)
      console.log('✅ 配置验证通过')
    })

    it('应该拒绝无效配置', () => {
      const invalidConfig = {
        outputDir: '',
        maxRetries: -1
      }

      const result = pipeline.validateConfig(invalidConfig)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      console.log('✅ 检测到无效配置')
    })
  })

  describe('7.5 缓存机制', () => {
    it('应该清除缓存', () => {
      pipeline.clearCache()
      const cacheSize = pipeline.getCacheSize()

      expect(cacheSize).toBe(0)
      console.log('✅ 缓存已清除')
    })

    it('应该获取缓存统计', () => {
      const stats = pipeline.getCacheStats()

      expect(stats).toBeDefined()
      expect(stats.size).toBeDefined()
      expect(stats.hits).toBeDefined()
      expect(stats.misses).toBeDefined()
      console.log('✅ 缓存统计:', stats)
    })
  })

  describe('7.6 进度跟踪', () => {
    it('应该初始化进度跟踪', () => {
      pipeline.initProgress()

      const progress = pipeline.getProgress()

      expect(progress).toBeDefined()
      expect(progress.phase).toBe(0)
      expect(progress.percentage).toBe(0)
      console.log('✅ 进度跟踪初始化成功')
    })

    it('应该更新进度', () => {
      pipeline.updateProgress(1, 50, '内容分析中...')

      const progress = pipeline.getProgress()

      expect(progress.phase).toBe(1)
      expect(progress.percentage).toBe(50)
      expect(progress.message).toBe('内容分析中...')
      console.log('✅ 进度更新成功:', progress)
    })
  })

  describe('7.7 辅助功能', () => {
    it('应该生成唯一ID', () => {
      const id1 = pipeline.generateId()
      const id2 = pipeline.generateId()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      console.log('✅ 生成唯一ID:', id1)
    })

    it('应该格式化时间', () => {
      const formatted = pipeline.formatDuration(125)

      expect(formatted).toBe('2:05')
      console.log('✅ 时间格式化:', formatted)
    })

    it('应该计算文件大小', () => {
      const size = pipeline.formatFileSize(1024 * 1024 * 5.5)

      expect(size).toBe('5.50 MB')
      console.log('✅ 文件大小格式化:', size)
    })
  })
})
