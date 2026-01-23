import axios from 'axios';

/**
 * WenxinService - 文心一言服务
 *
 * 功能：
 * 1. 调用文心一言API进行内容分析
 * 2. 支持多轮对话
 * 3. 自动管理Access Token
 */
class WenxinService {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.WENXIN_API_KEY;
    this.secretKey = options.secretKey || process.env.WENXIN_SECRET_KEY;

    // API配置
    this.tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    this.chatUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';

    // 缓存access_token
    this.accessToken = null;
    this.tokenExpireTime = 0;

    // 对话历史
    this.conversationHistory = [];
  }

  /**
   * 获取Access Token
   * @returns {Promise<string>} Access Token
   */
  async getAccessToken() {
    // 检查缓存的token是否有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(this.tokenUrl, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        }
      });

      this.accessToken = response.data.access_token;
      // token有效期30天，提前1天刷新
      this.tokenExpireTime = Date.now() + (29 * 24 * 60 * 60 * 1000);

      return this.accessToken;

    } catch (error) {
      throw new Error(`获取Access Token失败: ${error.message}`);
    }
  }

  /**
   * 聊天（单轮）
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async chat(message, options = {}) {
    try {
      const token = await this.getAccessToken();

      // 构建消息
      const messages = [
        {
          role: 'user',
          content: message
        }
      ];

      // 调用API
      const response = await axios.post(
        `${this.chatUrl}?access_token=${token}`,
        {
          messages: messages,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.8,
          penalty_score: options.penalty_score || 1.0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.error_code) {
        throw new Error(`文心一言API错误: ${response.data.error_msg}`);
      }

      return response.data.result;

    } catch (error) {
      throw new Error(`文心一言调用失败: ${error.message}`);
    }
  }

  /**
   * 多轮对话
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async chatWithHistory(message, options = {}) {
    try {
      const token = await this.getAccessToken();

      // 添加用户消息到历史
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // 调用API
      const response = await axios.post(
        `${this.chatUrl}?access_token=${token}`,
        {
          messages: this.conversationHistory,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.8,
          penalty_score: options.penalty_score || 1.0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.error_code) {
        throw new Error(`文心一言API错误: ${response.data.error_msg}`);
      }

      const reply = response.data.result;

      // 添加AI回复到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: reply
      });

      return reply;

    } catch (error) {
      throw new Error(`文心一言调用失败: ${error.message}`);
    }
  }

  /**
   * 清空对话历史
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * 获取对话历史
   * @returns {Array} 对话历史
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * 内容分析（专用方法）
   * @param {string} transcript - 视频文本
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeContent(transcript) {
    const prompt = `你是一个专业的视频内容分析师。请分析以下视频文本，提取关键信息。

视频文本：
${transcript}

请按照以下JSON格式返回分析结果（只返回JSON，不要其他内容）：

{
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "viewpoints": [
    {
      "text": "观点1（不超过15字）",
      "timestamp": "大致出现时间（秒）",
      "importance": "high/medium/low"
    }
  ],
  "explanations": [
    {
      "keyword": "需要解释的关键词",
      "explanation": "详细解释（20-30字）",
      "relatedKeywords": ["相关词1", "相关词2"]
    }
  ],
  "intent": "视频的主要意图（教育/营销/娱乐/新闻等）",
  "tone": "视频的语气（正式/轻松/专业/幽默等）",
  "targetAudience": "目标受众描述"
}

要求：
1. 关键词3-5个，准确提取核心概念
2. 观点1-3个，简洁明了，不超过15字
3. 解释针对专业术语或重要概念
4. 所有字段必须填写，不能为空`;

    try {
      const response = await this.chat(prompt, {
        temperature: 0.3,  // 降低温度以获得更稳定的输出
        top_p: 0.8
      });

      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到JSON');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 验证必需字段
      const requiredFields = ['keywords', 'viewpoints', 'explanations', 'intent'];
      for (const field of requiredFields) {
        if (!result[field]) {
          throw new Error(`缺少必需字段: ${field}`);
        }
      }

      return result;

    } catch (error) {
      throw new Error(`内容分析失败: ${error.message}`);
    }
  }

  /**
   * 关键词提取（简化版）
   * @param {string} text - 文本
   * @param {number} count - 关键词数量
   * @returns {Promise<Array<string>>} 关键词列表
   */
  async extractKeywords(text, count = 5) {
    const prompt = `请从以下文本中提取${count}个最重要的关键词，只返回关键词列表，用逗号分隔：

${text}`;

    try {
      const response = await this.chat(prompt, {
        temperature: 0.3
      });

      // 解析关键词
      const keywords = response
        .split(/[,，、]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, count);

      return keywords;

    } catch (error) {
      throw new Error(`关键词提取失败: ${error.message}`);
    }
  }

  /**
   * 文本摘要
   * @param {string} text - 文本
   * @param {number} maxLength - 最大长度
   * @returns {Promise<string>} 摘要
   */
  async summarize(text, maxLength = 100) {
    const prompt = `请将以下文本总结为不超过${maxLength}字的摘要：

${text}`;

    try {
      const response = await this.chat(prompt, {
        temperature: 0.5
      });

      return response.trim();

    } catch (error) {
      throw new Error(`文本摘要失败: ${error.message}`);
    }
  }
}

export default WenxinService;
