/**
 * 单元4: 素材生成器测试
 * 测试VisualAssetGenerator的图片生成能力
 */

import { describe, it, expect, beforeAll } from 'vitest'
import VisualAssetGenerator from '../services/VisualAssetGenerator.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('单元4: VisualAssetGenerator', () => {
  let generator
  const outputDir = path.join(__dirname, '../output/test-assets')

  beforeAll(() => {
    generator = new VisualAssetGenerator()

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  describe('4.1 概念词典', () => {
    it('应该加载概念词典', () => {
      const library = generator.conceptLibrary

      expect(library).toBeDefined()
      expect(Object.keys(library).length).toBeGreaterThan(0)
      console.log('✅ 概念词典包含', Object.keys(library).length, '个概念')
    })

    it('应该包含核心概念', () => {
      const library = generator.conceptLibrary

      expect(library['多模态']).toBeDefined()
      expect(library['智能体']).toBeDefined()
      expect(library['AI']).toBeDefined()
      console.log('✅ 核心概念示例:', library['多模态'])
    })

    it('应该能够查询概念', () => {
      const concept = generator.getConcept('多模态')

      expect(concept).toBeDefined()
      expect(concept.description).toBeDefined()
      expect(concept.style).toBeDefined()
      console.log('✅ 查询到概念:', concept)
    })
  })

  describe('4.2 Prompt生成', () => {
    it('应该生成横幅Prompt', () => {
      const prompt = generator.generateBannerPrompt('Claude的核心能力')

      expect(prompt).toBeDefined()
      expect(prompt.length).toBeGreaterThan(50)
      expect(prompt).toContain('banner')
      console.log('✅ 横幅Prompt:', prompt.substring(0, 100) + '...')
    })

    it('应该生成问号卡片Prompt', () => {
      const prompt = generator.generateQuestionCardsPrompt(2)

      expect(prompt).toBeDefined()
      expect(prompt).toContain('question mark')
      expect(prompt).toContain('2')
      console.log('✅ 问号卡片Prompt:', prompt.substring(0, 100) + '...')
    })

    it('应该生成概念卡片Prompt', () => {
      const prompt = generator.generateConceptCardPrompt('多模态')

      expect(prompt).toBeDefined()
      expect(prompt).toContain('multimodal')
      console.log('✅ 概念卡片Prompt:', prompt.substring(0, 100) + '...')
    })

    it('应该使用概念词典优化Prompt', () => {
      const prompt1 = generator.generateConceptCardPrompt('多模态')
      const prompt2 = generator.generateConceptCardPrompt('未知概念')

      expect(prompt1).toContain('multimodal')
      expect(prompt1.length).toBeGreaterThan(prompt2.length)
      console.log('✅ 词典优化有效')
    })
  })

  describe('4.3 图片生成', () => {
    it('应该能够调用豆包API生成图片', async () => {
      const prompt = 'A simple blue banner with text "Test"'
      const imagePath = await generator.generateImage(
        prompt,
        path.join(outputDir, 'test-banner.png')
      )

      expect(fs.existsSync(imagePath)).toBe(true)
      const stats = fs.statSync(imagePath)
      expect(stats.size).toBeGreaterThan(0)
      console.log('✅ 生成图片:', imagePath, '大小:', stats.size, 'bytes')
    }, 60000)

    it('应该生成横幅图片', async () => {
      const bannerPath = await generator.generateBanner('Claude的核心能力', outputDir)

      expect(fs.existsSync(bannerPath)).toBe(true)
      console.log('✅ 生成横幅:', bannerPath)
    }, 60000)

    it('应该生成问号卡片', async () => {
      const cardsPath = await generator.generateQuestionCards(2, outputDir)

      expect(fs.existsSync(cardsPath)).toBe(true)
      console.log('✅ 生成问号卡片:', cardsPath)
    }, 60000)

    it('应该生成概念卡片', async () => {
      const cardPath = await generator.generateConceptCard('多模态', outputDir)

      expect(fs.existsSync(cardPath)).toBe(true)
      console.log('✅ 生成概念卡片:', cardPath)
    }, 60000)
  })

  describe('4.4 批量生成', () => {
    it('应该批量生成所有素材', async () => {
      const analysisResult = {
        mainTopic: 'Claude的核心能力',
        segments: [{ concepts: ['多模态'] }, { concepts: ['智能体'] }]
      }

      const pattern = {
        name: 'sequential_reveal',
        stats: { conceptCount: 2 }
      }

      const assets = await generator.generateAll(
        analysisResult,
        pattern,
        { duration: 10 },
        outputDir
      )

      expect(assets.bannerPath).toBeDefined()
      expect(fs.existsSync(assets.bannerPath)).toBe(true)
      expect(assets.questionCardsPath).toBeDefined()
      expect(fs.existsSync(assets.questionCardsPath)).toBe(true)
      expect(assets.conceptCards.length).toBe(2)

      console.log('✅ 批量生成完成:', {
        banner: assets.bannerPath,
        questionCards: assets.questionCardsPath,
        conceptCards: assets.conceptCards.length
      })
    }, 180000)
  })
})
