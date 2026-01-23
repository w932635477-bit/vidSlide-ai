/**
 * VidSlide AI - 文心一言API服务
 * 使用百度文心一言 ERNIE 5.0 进行语义分析
 *
 * API文档: https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11
 */

import { WENXIN_CONFIG } from '../config/api-keys.js'

class WenxinAPI {
  constructor() {
    this.config = WENXIN_CONFIG
    this.accessToken = null
    this.tokenExpireTime = 0
  }

  /**
   * 获取Access Token
   * 文心一言API需要先获取token才能调用
   */
  async getAccessToken() {
    // 检查缓存的token是否有效（提前5分钟刷新）
    if (this.accessToken && Date.now() < this.tokenExpireTime - 300000) {
      return this.accessToken
    }

    const { apiKey, secretKey } = this.config

    try {
      const url = `${this.config.baseUrl}/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`API错误: ${data.error_description || data.error}`)
      }

      this.accessToken = data.access_token
      // token有效期通常是30天，这里设置过期时间
      this.tokenExpireTime = Date.now() + data.expires_in * 1000

      console.log('[WenxinAPI] Access Token获取成功')
      return this.accessToken
    } catch (error) {
      console.error('[WenxinAPI] 获取Token失败:', error)
      throw error
    }
  }

  /**
   * 调用文心一言进行语义分析
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @param {Array} options.messages - 对话历史（可选）
   * @param {number} options.temperature - 温度参数（可选）
   * @param {number} options.max_tokens - 最大token数（可选）
   * @returns {Promise<string>} API响应文本
   */
  async chat(prompt, options = {}) {
    try {
      const token = await this.getAccessToken()

      // 构建消息列表
      const messages = options.messages || [];
      const messageList = [
        ...messages,
        {
          role: 'user',
          content: prompt
        }
      ]

      // ERNIE 5.0 API endpoint
      const url = `${this.config.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${this.config.model}?access_token=${token}`

      const requestBody = {
        messages: messageList,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.8,
        penalty_score: options.penalty_score || 1.0
      };

      // 如果指定了max_tokens，添加到请求中
      if (options.max_tokens) {
        requestBody.max_output_tokens = options.max_tokens;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP错误: ${response.status} - ${errorText}`)
      }

      const result = await response.json()

      if (result.error_code) {
        throw new Error(`API错误 [${result.error_code}]: ${result.error_msg}`)
      }

      return {
        content: result.result,
        usage: result.usage,
        id: result.id
      }
    } catch (error) {
      console.error('[WenxinAPI] 调用失败:', error)
      throw error
    }
  }

  /**
   * 分析视频内容语义
   * @param {Object} transcript - 语音识别结果
   * @param {Array} keywords - 关键词列表
   * @returns {Promise<Object>} 语义分析结果
   */
  async analyzeVideoContent(transcript, keywords) {
    const prompt = `
你是一个专业的视频内容分析专家。请分析以下视频转录文本，提取关键信息。

**转录文本**：
${transcript.text}

**关键词**：
${keywords.map(k => k.text || k).join('、')}

请按照以下JSON格式返回分析结果：
{
  "mainTopic": "视频的主要话题",
  "summary": "视频内容摘要（50字以内）",
  "segments": [
    {
      "text": "段落文本",
      "type": "opening|suspense|reveal|conclusion",
      "keywords": ["关键词1", "关键词2"],
      "emotion": "neutral|positive|negative|excited",
      "importance": 0.8
    }
  ],
  "narrativeStyle": "storytelling|tutorial|presentation|conversation"
}

注意：
1. segments应该按照视频的时间顺序排列
2. type类型：opening(开场)、suspense(悬念)、reveal(揭示)、conclusion(总结)
3. importance范围：0-1，表示该段落的重要程度
4. 只返回JSON，不要有其他文字
`

    try {
      const response = await this.chat(prompt)

      // 解析JSON响应
      const content = response.content.trim()

      // 尝试提取JSON（处理可能的markdown代码块）
      let jsonStr = content
      if (content.includes('```json')) {
        jsonStr = content.match(/```json\n([\s\S]*?)\n```/)?.[1] || content
      } else if (content.includes('```')) {
        jsonStr = content.match(/```\n([\s\S]*?)\n```/)?.[1] || content
      }

      const result = JSON.parse(jsonStr)

      console.log('[WenxinAPI] 语义分析完成:', {
        mainTopic: result.mainTopic,
        segmentCount: result.segments?.length || 0
      })

      return result
    } catch (error) {
      console.error('[WenxinAPI] 语义分析失败:', error)

      // 返回默认结构
      return {
        mainTopic: keywords[0]?.text || '未知主题',
        summary: transcript.text.substring(0, 50),
        segments: [
          {
            text: transcript.text,
            type: 'opening',
            keywords: keywords.slice(0, 3).map(k => k.text || k),
            emotion: 'neutral',
            importance: 1.0
          }
        ],
        narrativeStyle: 'presentation'
      }
    }
  }

  /**
   * 检测叙事模式
   * @param {Object} semanticData - 语义分析数据
   * @returns {Promise<Object>} 叙事模式检测结果
   */
  async detectNarrativePattern(semanticData) {
    const prompt = `
你是一个视频叙事模式专家。请分析以下视频内容，判断最适合的叙事模式。

**主题**：${semanticData.mainTopic}
**摘要**：${semanticData.summary}
**段落数量**：${semanticData.segments?.length || 0}
**叙事风格**：${semanticData.narrativeStyle}

请从以下叙事模式中选择最合适的一个，并返回JSON格式：
{
  "pattern": "linear|suspense|reveal|comparison|tutorial",
  "confidence": 0.85,
  "reason": "选择该模式的原因",
  "visualStrategy": {
    "layout": "single|split|pip|overlay",
    "transitions": ["fade", "slide", "zoom"],
    "emphasis": ["text", "image", "video"]
  }
}

叙事模式说明：
- linear: 线性叙事（顺序讲述）
- suspense: 悬念叙事（先提问题后揭晓）
- reveal: 揭示叙事（逐步展开信息）
- comparison: 对比叙事（并列对比）
- tutorial: 教程叙事（步骤式讲解）

只返回JSON，不要有其他文字。
`

    try {
      const response = await this.chat(prompt)

      // 解析JSON响应
      const content = response.content.trim()
      let jsonStr = content
      if (content.includes('```json')) {
        jsonStr = content.match(/```json\n([\s\S]*?)\n```/)?.[1] || content
      } else if (content.includes('```')) {
        jsonStr = content.match(/```\n([\s\S]*?)\n```/)?.[1] || content
      }

      const result = JSON.parse(jsonStr)

      console.log('[WenxinAPI] 叙事模式检测完成:', result.pattern)

      return result
    } catch (error) {
      console.error('[WenxinAPI] 叙事模式检测失败:', error)

      // 返回默认模式
      return {
        pattern: 'linear',
        confidence: 0.5,
        reason: '默认使用线性叙事模式',
        visualStrategy: {
          layout: 'single',
          transitions: ['fade'],
          emphasis: ['text', 'video']
        }
      }
    }
  }

  /**
   * 生成视觉素材提示词
   * @param {string} keyword - 关键词
   * @param {string} context - 上下文
   * @returns {Promise<string>} 图片生成提示词
   */
  async generateImagePrompt(keyword, context = '') {
    const prompt = `
请为关键词"${keyword}"生成一个适合AI图像生成的英文提示词。

上下文：${context || '无'}

要求：
1. 提示词要简洁明确，适合豆包AI图像生成
2. 包含风格描述（如：modern, minimalist, professional等）
3. 包含色彩建议
4. 长度控制在50个单词以内
5. 只返回英文提示词，不要有其他文字

示例格式：
"modern minimalist illustration of [keyword], clean design, blue and white color scheme, professional style, high quality"
`

    try {
      const response = await this.chat(prompt)
      return response.content.trim().replace(/["""]/g, '')
    } catch (error) {
      console.error('[WenxinAPI] 生成提示词失败:', error)
      return `modern illustration of ${keyword}, clean design, professional style`
    }
  }

  /**
   * 检查服务是否可用
   */
  async checkHealth() {
    try {
      const token = await this.getAccessToken()
      return !!token
    } catch (error) {
      return false
    }
  }
}

// 单例实例
let wenxinInstance = null

export function getWenxinAPI() {
  if (!wenxinInstance) {
    wenxinInstance = new WenxinAPI()
  }
  return wenxinInstance
}

export default WenxinAPI
