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
   * 聊天（单轮，带重试）
   * @param {string} message - 用户消息
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async chat(message, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 2000; // 2秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.chat({
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          // 使用ERNIE-Lite-8K模型（更快更稳定）
          model: 'ERNIE-Lite-8K',
          // 增加超时时间到60秒
          timeout: 60000
        });

        if (!response || !response.result) {
          throw new Error('响应中未找到结果');
        }

        return response.result;

      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isTimeout = error.message.includes('timeout') || error.message.includes('timed out');
        const isNetworkError = error.message.includes('socket hang up') || error.message.includes('ECONNRESET');

        // 如果是超时或网络错误，且不是最后一次尝试
        if ((isTimeout || isNetworkError) && !isLastAttempt) {
          console.log(`  ⚠️  千帆API调用失败（第${attempt}次尝试）: ${error.message}`);
          console.log(`  🔄 ${retryDelay / 1000}秒后重试...`);
          await this.sleep(retryDelay);
          continue;
        }

        // 其他错误或最后一次尝试失败
        throw new Error(`千帆调用失败: ${error.message}`);
      }
    }
  }

  /**
   * 延迟函数
   * @param {number} ms - 毫秒
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  "keywords": [
    {
      "text": "关键词1",
      "english": "Keyword 1",
      "category": "platform/technology/concept/method"
    }
  ],
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

关键要求：
1. 关键词提取（最重要）：
   - 必须从原文中精确提取，不要改写、总结或意译
   - 如果原文是"巨量ad"，就提取"巨量ad"，不要改成"质量ad"或其他
   - 提取3-5个核心关键词
   - 每个关键词长度2-6个字
   - 必须是名词或名词短语
   - 提供准确的英文翻译
   - 标注类别：platform（平台）、technology（技术）、concept（概念）、method（方法）

2. 观点提取：
   - 1-3个核心观点
   - 简洁明了，不超过15字
   - 标注重要程度

3. 解释说明：
   - 针对专业术语或重要概念
   - 详细解释20-30字

4. 所有字段必须填写，不能为空`;

    try {
      const response = await this.chat(prompt);

      // 提取JSON（尝试多种模式）
      let jsonMatch = response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('响应中未找到JSON');
      }

      let jsonString = jsonMatch[0];

      // 修复常见的JSON格式问题
      // 1. 移除注释
      jsonString = jsonString.replace(/\/\/.*$/gm, '');
      jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');

      // 2. 修复属性名（如果是单引号或无引号）
      jsonString = jsonString.replace(/(\w+):/g, '"$1":');
      jsonString = jsonString.replace(/'([^']+)':/g, '"$1":');

      // 3. 修复字符串（单引号改为双引号）
      jsonString = jsonString.replace(/'([^']*)'/g, '"$1"');

      // 4. 移除尾随逗号
      jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

      // 5. 修复多余的逗号
      jsonString = jsonString.replace(/,+/g, ',');

      // 6. 修复控制字符
      jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, '');

      console.log('  → 解析JSON...');

      const result = JSON.parse(jsonString);

      // 验证必需字段
      const requiredFields = ['keywords', 'viewpoints', 'explanations', 'intent'];
      for (const field of requiredFields) {
        if (!result[field]) {
          throw new Error(`缺少必需字段: ${field}`);
        }
      }

      // 验证keywords格式（现在是对象数组）
      if (!Array.isArray(result.keywords) || result.keywords.length === 0) {
        throw new Error('keywords必须是非空数组');
      }

      // 验证每个关键词对象的结构
      for (const keyword of result.keywords) {
        if (!keyword.text || !keyword.english) {
          throw new Error('每个关键词必须包含text和english字段');
        }
      }

      return result;

    } catch (error) {
      // 如果JSON解析失败，尝试简单的降级处理
      if (error.message.includes('JSON')) {
        console.log('  ⚠️  JSON解析失败，使用降级方案...');
        return this.getFallbackAnalysis(transcript);
      }
      throw new Error(`内容分析失败: ${error.message}`);
    }
  }

  /**
   * 降级分析（当API返回的JSON格式错误时使用）
   * @param {string} transcript - 文本
   * @returns {Object} 简单的分析结果
   */
  getFallbackAnalysis(transcript) {
    console.log('  → 使用降级分析方案...');

    // 简单的关键词提取（基于常见词）
    const commonWords = ['抖音', '流量', '短视频', 'AI', '智能', '平台', '玩法', '策略'];
    const keywords = commonWords
      .filter(word => transcript.includes(word))
      .slice(0, 5)
      .map(word => ({
        text: word,
        english: this.translateToEnglish(word),
        category: 'concept'
      }));

    // 简单的观点提取（基于句子分割）
    const sentences = transcript.split(/[，。！？、]/);
    const viewpoints = sentences
      .filter(s => s.length > 5 && s.length < 20)
      .slice(0, 3)
      .map((text, i) => ({
        text: text.trim(),
        timestamp: (i * 10).toString(),
        importance: 'medium'
      }));

    // 简单的解释
    const explanations = keywords.slice(0, 3).map(k => ({
      keyword: k.text,
      explanation: `${k.text}是一个重要的概念`,
      relatedKeywords: []
    }));

    return {
      keywords,
      viewpoints,
      explanations,
      intent: '教育',
      tone: '轻松',
      targetAudience: '短视频创作者'
    };
  }

  /**
   * 简单的中文翻译（仅用于降级）
   * @param {string} chinese - 中文词
   * @returns {string} 英文翻译
   */
  translateToEnglish(chinese) {
    const dictionary = {
      '抖音': 'Douyin',
      '流量': 'Traffic',
      '短视频': 'Short Video',
      'AI': 'AI',
      '智能': 'Intelligent',
      '平台': 'Platform',
      '玩法': 'Strategy',
      '策略': 'Strategy',
      '创作': 'Creation',
      '运营': 'Operation'
    };
    return dictionary[chinese] || 'Keyword';
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
