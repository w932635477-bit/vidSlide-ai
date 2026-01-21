/**
 * VisualAssetGenerator - 视觉素材生成器
 *
 * 功能：
 * 1. 豆包AI生图
 * 2. 智能Prompt生成
 * 3. 概念词典管理
 */

import https from 'https'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import SmartPromptGenerator from './SmartPromptGenerator.js'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class VisualAssetGenerator {
  constructor() {
    this.doubaoApiKey = process.env.DOUBAO_API_KEY
    this.doubaoEndpoint =
      process.env.DOUBAO_API_ENDPOINT ||
      'https://ark.cn-beijing.volces.com/api/v3/images/generations'
    this.doubaoModel = process.env.DOUBAO_MODEL || 'doubao-seedream-4-5-251128'

    this.promptGenerator = new SmartPromptGenerator()
    this.conceptLibrary = this.loadConceptLibrary()
  }

  /**
   * 加载概念词典
   */
  loadConceptLibrary() {
    const libraryPath = path.join(__dirname, '../data/conceptLibrary.json')

    if (fs.existsSync(libraryPath)) {
      const data = fs.readFileSync(libraryPath, 'utf-8')
      return JSON.parse(data)
    }

    // 默认概念库
    return {
      多模态: {
        description: 'multimodal AI system with text, image, and audio icons',
        style: '3D isometric',
        color: 'blue and purple gradient',
        mood: 'futuristic, tech'
      },
      智能体: {
        description: 'AI agent robot with thinking circuits',
        style: '3D isometric',
        color: 'orange and yellow gradient',
        mood: 'intelligent, autonomous'
      },
      AI: {
        description: 'artificial intelligence brain with neural network',
        style: '3D isometric',
        color: 'cyan and blue gradient',
        mood: 'smart, digital'
      },
      Claude: {
        description: 'Claude AI logo with modern design',
        style: 'flat design',
        color: 'orange brand color',
        mood: 'professional, friendly'
      }
    }
  }

  /**
   * 获取概念信息
   */
  getConcept(conceptName) {
    return (
      this.conceptLibrary[conceptName] || {
        description: conceptName,
        style: '3D isometric',
        color: 'colorful gradient',
        mood: 'modern, clean'
      }
    )
  }

  /**
   * 生成横幅Prompt
   */
  generateBannerPrompt(topic) {
    return this.promptGenerator.generateBannerPrompt(topic)
  }

  /**
   * 生成问号卡片Prompt
   */
  generateQuestionCardsPrompt(count) {
    return this.promptGenerator.generateQuestionCardsPrompt(count)
  }

  /**
   * 生成概念卡片Prompt
   */
  generateConceptCardPrompt(concept) {
    const conceptInfo = this.getConcept(concept)
    return this.promptGenerator.generateConceptCardPrompt(concept, conceptInfo)
  }

  /**
   * 调用豆包API生成图片
   */
  async generateImage(prompt, outputPath) {
    console.log('生成图片:', prompt.substring(0, 50) + '...')

    try {
      // 使用https模块调用豆包API
      const url = new URL(this.doubaoEndpoint)
      const postData = JSON.stringify({
        model: this.doubaoModel,
        prompt: prompt,
        n: 1,
        size: '1920x1920',
        quality: 'standard',
        style: 'vivid'
      })

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.doubaoApiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }

      const response = await new Promise((resolve, reject) => {
        const req = https.request(requestOptions, res => {
          let data = ''

          res.on('data', chunk => {
            data += chunk
          })

          res.on('end', () => {
            try {
              const jsonData = JSON.parse(data)

              if (res.statusCode === 200) {
                resolve(jsonData)
              } else {
                reject(new Error(`API错误 (${res.statusCode}): ${JSON.stringify(jsonData)}`))
              }
            } catch (e) {
              reject(new Error(`解析响应失败: ${e.message}, 响应内容: ${data}`))
            }
          })
        })

        req.on('error', error => {
          reject(new Error(`网络错误: ${error.message}`))
        })

        req.setTimeout(60000, () => {
          req.destroy()
          reject(new Error('请求超时'))
        })

        req.write(postData)
        req.end()
      })

      if (response.data && response.data[0] && response.data[0].url) {
        const imageUrl = response.data[0].url

        // 下载图片
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer'
        })

        // 确保输出目录存在
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

        // 保存图片
        fs.writeFileSync(outputPath, imageResponse.data)
        console.log('✅ 图片已保存:', outputPath)

        return outputPath
      } else {
        throw new Error('API返回数据格式错误')
      }
    } catch (error) {
      console.error('生成图片失败:', error.message)

      // 生成占位图片
      return this.generatePlaceholder(outputPath, prompt)
    }
  }

  /**
   * 生成占位图片（当API失败时）
   */
  generatePlaceholder(outputPath, text) {
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 创建简单的占位图片
    const textStr = typeof text === 'string' ? text : String(text)
    const placeholderData = Buffer.from(`Placeholder for: ${textStr.substring(0, 50)}`)
    fs.writeFileSync(outputPath, placeholderData)
    console.log('⚠️ 使用占位图片:', outputPath)
    return outputPath
  }

  /**
   * 生成横幅
   */
  async generateBanner(topic, outputDir) {
    const prompt = this.generateBannerPrompt(topic)
    const outputPath = path.join(outputDir, 'banner.png')
    return await this.generateImage(prompt, outputPath)
  }

  /**
   * 生成问号卡片
   */
  async generateQuestionCards(count, outputDir) {
    const prompt = this.generateQuestionCardsPrompt(count)
    const outputPath = path.join(outputDir, 'question-cards.png')
    return await this.generateImage(prompt, outputPath)
  }

  /**
   * 生成概念卡片
   */
  async generateConceptCard(concept, outputDir, index = 0) {
    const prompt = this.generateConceptCardPrompt(concept)
    const outputPath = path.join(outputDir, `concept-${index}-${concept}.png`)
    return await this.generateImage(prompt, outputPath)
  }

  /**
   * 批量生成所有素材
   */
  async generateAll(analysisResult, pattern, preprocessed, outputDir) {
    console.log('开始批量生成素材...')

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 1. 生成横幅
    console.log('生成横幅...')
    const bannerPath = await this.generateBanner(analysisResult.mainTopic, outputDir)

    // 2. 提取概念
    const concepts = this.extractConcepts(analysisResult)
    console.log('提取到概念:', concepts)

    // 3. 生成问号卡片
    console.log('生成问号卡片...')
    const questionCardsPath = await this.generateQuestionCards(concepts.length, outputDir)

    // 4. 生成概念卡片
    console.log('生成概念卡片...')
    const conceptCards = []
    for (let i = 0; i < concepts.length; i++) {
      const cardPath = await this.generateConceptCard(concepts[i], outputDir, i)
      conceptCards.push({
        concept: concepts[i],
        path: cardPath
      })
    }

    const assets = {
      bannerPath,
      questionCardsPath,
      conceptCards,
      duration: preprocessed.duration || 10
    }

    console.log('✅ 所有素材生成完成')
    return assets
  }

  /**
   * 从分析结果中提取概念
   */
  extractConcepts(analysisResult) {
    const conceptSet = new Set()

    analysisResult.segments.forEach(segment => {
      if (segment.concepts && Array.isArray(segment.concepts)) {
        segment.concepts.forEach(concept => {
          if (concept && concept.length > 0) {
            conceptSet.add(concept)
          }
        })
      }
    })

    return Array.from(conceptSet).slice(0, 4) // 最多4个概念
  }
}

export default VisualAssetGenerator
