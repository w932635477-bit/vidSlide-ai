/**
 * HybridContentAnalyzer - 混合内容分析器
 *
 * 功能：
 * 1. 语音识别（百度API）
 * 2. 关键词提取（百度NLP）
 * 3. GPT语义分析（文心一言）
 */

import { getBaiduSpeechService } from './BaiduSpeechService.js'
import { getBaiduNLPService } from './BaiduNLPService.js'
import { getWenxinAPI } from './WenxinAPI.js'

class HybridContentAnalyzer {
  constructor() {
    this.speechService = getBaiduSpeechService()
    this.nlpService = getBaiduNLPService()
    this.wenxinAPI = getWenxinAPI()
  }

  /**
   * 语音识别
   * @param {string|File} audioInput - 音频文件路径或File对象
   * @returns {Object} 识别结果 { text, words }
   */
  async recognizeSpeech(audioInput) {
    try {
      // 如果是文件路径（Node.js环境），需要转换为File对象
      // 如果已经是File对象，直接使用
      let audioFile = audioInput

      if (typeof audioInput === 'string') {
        // Node.js环境：从文件路径读取
        const fs = await import('fs')
        const path = await import('path')
        const buffer = fs.readFileSync(audioInput)
        const fileName = path.basename(audioInput)
        audioFile = new File([buffer], fileName, { type: 'audio/wav' })
      }

      // 使用百度语音服务识别
      const text = await this.speechService.transcribeVideo(audioFile)

      // 解析为词语数组（简化版）
      const words = this.parseWords(text)

      return {
        text,
        words
      }
    } catch (error) {
      console.error('语音识别失败:', error)
      throw new Error(`语音识别失败: ${error.message}`)
    }
  }

  /**
   * 解析文本为词语数组（简化版）
   */
  parseWords(text) {
    const words = text.split(/[，。！？、\s]+/).filter(w => w.length > 0)
    const avgDuration = 2 // 假设每个词平均2秒

    return words.map((word, index) => ({
      word,
      start_time: index * avgDuration,
      end_time: (index + 1) * avgDuration
    }))
  }

  /**
   * 关键词提取
   * @param {string} text - 文本内容
   * @returns {Array} 关键词数组
   */
  async extractKeywords(text) {
    try {
      const keywords = await this.nlpService.extractKeywords(text, 10)

      // 转换为统一格式
      return keywords.map(item => ({
        word: item.text,
        score: item.score || item.importance || 1.0
      }))
    } catch (error) {
      console.warn('关键词提取失败，使用简单分词:', error.message)
      return this.simpleKeywordExtraction(text)
    }
  }

  /**
   * 简单关键词提取（备用方案）
   */
  simpleKeywordExtraction(text) {
    const words = text.split(/[，。！？、\s]+/).filter(w => w.length > 1)
    const wordCount = {}

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    return Object.entries(wordCount)
      .map(([word, count]) => ({ word, score: count / words.length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  /**
   * GPT语义分析
   * @param {Object} transcript - 转录文本
   * @param {Array} keywords - 关键词列表
   * @returns {Object} 分析结果
   */
  async analyzeWithGPT(transcript, keywords) {
    try {
      const result = await this.wenxinAPI.analyzeVideoContent(transcript, keywords)

      // 确保返回的segments包含所需字段
      if (result.segments) {
        result.segments = result.segments.map((segment, index) => {
          const duration = transcript.words.length > 0
            ? transcript.words[transcript.words.length - 1].end_time / result.segments.length
            : 3

          return {
            text: segment.text || '',
            startTime: segment.startTime !== undefined ? segment.startTime : index * duration,
            endTime: segment.endTime !== undefined ? segment.endTime : (index + 1) * duration,
            type: segment.type || 'reveal',
            concepts: segment.keywords || segment.concepts || keywords.slice(0, 2).map(k => k.word || k)
          }
        })
      }

      return result
    } catch (error) {
      console.error('GPT分析失败:', error.message)
      // 返回基础结构
      return this.fallbackAnalysis(transcript, keywords)
    }
  }

  /**
   * 备用分析方案（当GPT失败时）
   */
  fallbackAnalysis(transcript, keywords) {
    const sentences = transcript.text.split(/[。！？]+/).filter(s => s.length > 0)
    const avgDuration =
      transcript.words.length > 0
        ? transcript.words[transcript.words.length - 1].end_time / sentences.length
        : 3

    return {
      mainTopic: keywords[0]?.word || '未知主题',
      summary: transcript.text.substring(0, 50),
      segments: sentences.map((text, index) => ({
        text: text.trim(),
        startTime: index * avgDuration,
        endTime: (index + 1) * avgDuration,
        type: index === 0 ? 'opening' : index === sentences.length - 1 ? 'conclusion' : 'reveal',
        concepts: keywords.slice(0, 2).map(k => k.word || k)
      })),
      narrativeStyle: 'presentation'
    }
  }

  /**
   * 完整分析流程
   * @param {string|File} videoInput - 视频文件路径或File对象
   * @param {string|File} audioInput - 音频文件路径或File对象（可选，如果不提供则从视频提取）
   * @returns {Object} 完整分析结果
   */
  async analyze(videoInput, audioInput = null) {
    console.log('开始内容分析...')

    try {
      // 1. 语音识别
      console.log('步骤1: 语音识别...')
      const audioToUse = audioInput || videoInput
      const transcript = await this.recognizeSpeech(audioToUse)

      // 2. 关键词提取
      console.log('步骤2: 关键词提取...')
      const keywords = await this.extractKeywords(transcript.text)

      // 3. GPT语义分析
      console.log('步骤3: GPT语义分析...')
      const analysis = await this.analyzeWithGPT(transcript, keywords)

      // 4. 整合结果
      const result = {
        ...analysis,
        keywords: keywords,
        transcript: transcript,
        videoPath: typeof videoInput === 'string' ? videoInput : videoInput.name,
        audioPath: audioInput ? (typeof audioInput === 'string' ? audioInput : audioInput.name) : null
      }

      console.log('✅ 内容分析完成')
      return result
    } catch (error) {
      console.error('内容分析失败:', error)
      throw error
    }
  }
}

export default HybridContentAnalyzer
