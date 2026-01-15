/**
 * VidSlide AI - 语音识别服务
 * 使用Web Speech API进行实时语音识别
 *
 * 重要说明：
 * Web Speech API 只能识别麦克风输入，不能直接识别视频文件中的音频。
 * 要识别视频中的语音，需要：
 * 1. 播放视频让扬声器发出声音
 * 2. 使用麦克风捕获扬声器的声音
 * 3. 或者使用后端服务（如Whisper API）
 *
 * 本服务提供两种模式：
 * 1. 实时识别模式：用户播放视频时，通过麦克风捕获并识别
 * 2. 手动输入模式：用户手动输入视频内容
 */

import { getBaiduNLPService } from './BaiduNLPService.js'

export class SpeechRecognitionService {
  constructor() {
    this.recognition = null
    this.isRecognizing = false
    this.isSupported = this.checkSupport()
    this.onResultCallback = null
    this.onEndCallback = null
    this.finalTranscript = ''
    this.interimTranscript = ''
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  checkSupport() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * 初始化语音识别
   */
  init() {
    if (!this.isSupported) {
      throw new Error('您的浏览器不支持语音识别功能，请使用Chrome浏览器')
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    // 配置
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'zh-CN'
    this.recognition.maxAlternatives = 1

    // 处理结果
    this.recognition.onresult = (event) => {
      this.interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          this.finalTranscript += transcript
        } else {
          this.interimTranscript += transcript
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          final: this.finalTranscript,
          interim: this.interimTranscript,
          fullText: this.finalTranscript + this.interimTranscript
        })
      }
    }

    // 处理错误
    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error)

      // no-speech 错误可以忽略
      if (event.error === 'no-speech') {
        return
      }

      // aborted 错误表示用户主动停止
      if (event.error === 'aborted') {
        return
      }

      if (this.onEndCallback) {
        this.onEndCallback({
          error: event.error,
          text: this.finalTranscript
        })
      }
    }

    // 处理结束
    this.recognition.onend = async () => {
      // 如果还在识别状态，自动重启（continuous模式有时会意外停止）
      if (this.isRecognizing) {
        try {
          this.recognition.start()
        } catch (e) {
          this.isRecognizing = false
          if (this.onEndCallback) {
            const keywords = await this.extractKeywords(this.finalTranscript)
            this.onEndCallback({
              text: this.finalTranscript,
              keywords
            })
          }
        }
      } else {
        if (this.onEndCallback) {
          const keywords = await this.extractKeywords(this.finalTranscript)
          this.onEndCallback({
            text: this.finalTranscript,
            keywords
          })
        }
      }
    }
  }

  /**
   * 开始语音识别
   * @param {Function} onResult - 实时结果回调
   * @param {Function} onEnd - 结束回调
   */
  start(onResult, onEnd) {
    if (!this.recognition) {
      this.init()
    }

    this.finalTranscript = ''
    this.interimTranscript = ''
    this.onResultCallback = onResult
    this.onEndCallback = onEnd
    this.isRecognizing = true

    try {
      this.recognition.start()
      return true
    } catch (e) {
      console.error('启动语音识别失败:', e)
      this.isRecognizing = false
      return false
    }
  }

  /**
   * 停止语音识别
   */
  stop() {
    this.isRecognizing = false
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (e) {
        // 忽略停止错误
      }
    }
  }

  /**
   * 获取当前识别的文本
   */
  getText() {
    return this.finalTranscript
  }

  /**
   * 清空识别结果
   */
  clear() {
    this.finalTranscript = ''
    this.interimTranscript = ''
  }

  /**
   * 从文本中提取关键词（使用百度NLP API）
   * @param {string} text - 文本内容
   * @returns {Promise<Array>} 关键词列表
   */
  async extractKeywords(text) {
    if (!text || text.length < 5) return []

    try {
      const nlpService = getBaiduNLPService()
      const keywords = await nlpService.extractKeywords(text, 15)
      return keywords
    } catch (error) {
      console.error('关键词提取失败，使用本地算法:', error)
      return this.localExtractKeywords(text)
    }
  }

  /**
   * 本地关键词提取算法（作为备用）
   * @param {string} text - 文本内容
   * @returns {Array} 关键词列表
   */
  localExtractKeywords(text) {
    if (!text || text.length < 5) return []

    // 停用词列表
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
      '自己', '这', '那', '他', '她', '它', '们', '这个', '那个', '什么', '怎么',
      '可以', '能', '但是', '因为', '所以', '如果', '虽然', '而且', '或者', '还是',
      '啊', '呢', '吧', '吗', '哦', '嗯', '呀', '哈', '嘿', '喂', '然后', '就是',
      '那么', '这样', '那样', '这里', '那里', '现在', '已经', '还有', '比较', '非常'
    ])

    // 使用简单的中文分词（按2-4字切分）
    const words = []
    const cleanText = text.replace(/[，。！？、；：""''（）【】《》\s\n]+/g, '')

    // 提取2-4字的词组
    for (let len = 4; len >= 2; len--) {
      for (let i = 0; i <= cleanText.length - len; i++) {
        const word = cleanText.substring(i, i + len)
        if (!stopWords.has(word) && !/^\d+$/.test(word)) {
          words.push(word)
        }
      }
    }

    // 统计词频
    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    // 过滤掉只出现一次的词，按词频排序
    const keywords = Object.entries(wordCount)
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count], index) => ({
        text: word,
        count,
        importance: Math.max(0.5, 1 - index * 0.03)
      }))

    return keywords
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stop()
    this.recognition = null
    this.onResultCallback = null
    this.onEndCallback = null
  }
}

// 单例实例
let speechServiceInstance = null

export function getSpeechRecognitionService() {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechRecognitionService()
  }
  return speechServiceInstance
}

export default SpeechRecognitionService
