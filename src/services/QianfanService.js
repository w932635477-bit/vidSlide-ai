import { ChatCompletion, setEnvVariable } from '@baiducloud/qianfan';

/**
 * QianfanService - 百度千帆平台服务（使用官方SDK）
 *
 * 功能：
 * 1. 使用官方SDK调用千帆平台API
 * 2. 支持文心一言模型
 * 3. 内容分析和对话功能
 */
class QianfanService {
  constructor(options = {}) {
    // 设置环境变量
    setEnvVariable('QIANFAN_ACCESS_KEY', options.accessKey || process.env.QIANFAN_ACCESS_KEY);
    setEnvVariable('QIANFAN_SECRET_KEY', options.secretKey || process.env.QIANFAN_SECRET_KEY);

    this.appId = options.appId || process.env.QIANFAN_APP_ID;

    // 创建客户端
    this.client = new ChatCompletion();
  }

  /**
   * 聊天（单轮）
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async chat(message, options = {}) {
    try {
      const response = await this.client.chat({
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        // 使用ERNIE-4.0-8K模型
        model: 'ERNIE-4.0-8K'
      });

      if (!response || !response.result) {
        throw new Error('响应中未找到结果');
      }

      return response.result;

    } catch (error) {
      throw new Error(`千帆调用失败: ${error.message}`);
    }
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
      const response = await this.chat(prompt);

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
      const response = await this.chat(prompt);

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
      const response = await this.chat(prompt);
      return response.trim();

    } catch (error) {
      throw new Error(`文本摘要失败: ${error.message}`);
    }
  }
}

export default QianfanService;
