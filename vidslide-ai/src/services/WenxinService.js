import axios from 'axios';
import { ChatCompletion, Image2Text, setEnvVariable } from '@baiducloud/qianfan';
import { BCEIAMClient } from '../utils/BCEIAMClient.js';

/**
 * WenxinService - 文心一言服务
 *
 * 功能：
 * 1. 调用文心一言API进行内容分析
 * 2. 支持多轮对话
 * 3. 支持视觉理解（图文多模态）
 * 4. 支持v1 OAuth2认证和v2 IAM认证
 */
class WenxinService {
  constructor(options = {}) {
    this.logger = options.logger;

    // 优先使用千帆V2配置（IAM认证）
    this.qianfanAccessKey = options.accessKey || process.env.QIANFAN_ACCESS_KEY;
    this.qianfanSecretKey = options.secretKey || process.env.QIANFAN_SECRET_KEY;

    // 兼容v1配置（OAuth2认证）
    this.apiKey = options.apiKey || process.env.WENXIN_API_KEY;
    this.secretKey = options.secretKey || process.env.WENXIN_SECRET_KEY;

    // 判断使用哪种认证方式
    this.useV2 = !!(this.qianfanAccessKey && this.qianfanSecretKey);

    if (this.useV2) {
      // V2 IAM认证 - 使用千帆SDK
      setEnvVariable('QIANFAN_ACCESS_KEY', this.qianfanAccessKey);
      setEnvVariable('QIANFAN_SECRET_KEY', this.qianfanSecretKey);
      this.client = new ChatCompletion();
      this.visionClient = new Image2Text();  // 视觉理解客户端

      // 初始化BCE IAM客户端（用于视觉API）
      this.iamClient = new BCEIAMClient(this.qianfanAccessKey, this.qianfanSecretKey);

      if (this.logger) {
        this.logger.info('使用千帆V2 IAM认证');
      }
    } else {
      // V1 OAuth2认证 - 使用传统方式
      this.tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
      this.chatUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
      this.accessToken = null;
      this.tokenExpireTime = 0;

      if (this.logger) {
        this.logger.info('使用文心一言V1 OAuth2认证');
      }
    }

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
      if (this.useV2) {
        // 使用千帆SDK V2 API
        const response = await this.client.chat({
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.8
        });

        return response.result;
      } else {
        // 使用V1 OAuth2 API
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
      }

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

  /**
   * 视觉理解（图文多模态）
   * @param {string|Array<string>} images - 图片路径或base64字符串（单张或多张）
   * @param {string} prompt - 问题或指令
   * @param {Object} options - 选项
   * @returns {Promise<string>} AI回复
   */
  async visionChat(images, prompt, options = {}) {
    try {
      // 确保images是数组
      const imageArray = Array.isArray(images) ? images : [images];

      if (this.useV2) {
        // V2 IAM认证 - 使用BCE Bearer Token直接调用REST API
        // SDK的content数组格式不支持,所以直接调用REST API

        // Step 1: 获取Bearer Token
        const bearerToken = await this.iamClient.getBearerToken(1800);

        // Step 2: 准备图片内容
        const content = [];

        for (const image of imageArray) {
          let imageUrl;

          if (image.startsWith('data:image/')) {
            imageUrl = image;
          } else if (image.startsWith('http://') || image.startsWith('https://')) {
            imageUrl = image;
          } else {
            const fs = await import('fs');
            const path = await import('path');

            const imageBuffer = fs.readFileSync(image);
            const base64Image = imageBuffer.toString('base64');
            const ext = path.extname(image).toLowerCase();
            const imageFormat = ext === '.png' ? 'png' : 'jpeg';

            imageUrl = `data:image/${imageFormat};base64,${base64Image}`;
          }

          content.push({
            type: 'image_url',
            image_url: { url: imageUrl }
          });
        }

        // 添加文本提示
        if (prompt) {
          content.push({
            type: 'text',
            text: prompt
          });
        }

        // Step 3: 调用千帆V2视觉API
        const requestBody = {
          model: options.model || 'ernie-4.5-turbo-vl',
          messages: [
            {
              role: 'user',
              content: content
            }
          ],
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.8
        };

        const response = await axios.post(
          'https://qianfan.baidubce.com/v2/chat/completions',
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        if (response.data.error) {
          throw new Error(`视觉API错误: ${response.data.error.message}`);
        }

        if (response.data.choices && response.data.choices[0]) {
          return response.data.choices[0].message.content;
        } else if (response.data.result) {
          return response.data.result;
        } else {
          throw new Error('未返回有效的响应内容');
        }

      } else {
        // V1 OAuth2认证 - 使用传统方式
        const token = await this.getAccessToken();

        // 构建content数组
        const content = [];

        for (const image of imageArray) {
          let imageUrl;

          if (image.startsWith('data:image/')) {
            imageUrl = image;
          } else if (image.startsWith('http://') || image.startsWith('https://')) {
            imageUrl = image;
          } else {
            const fs = await import('fs');
            const path = await import('path');

            const imageBuffer = fs.readFileSync(image);
            const base64Image = imageBuffer.toString('base64');
            const ext = path.extname(image).toLowerCase();
            const imageFormat = ext === '.png' ? 'png' : 'jpeg';

            imageUrl = `data:image/${imageFormat};base64,${base64Image}`;
          }

          content.push({
            type: 'image_url',
            image_url: { url: imageUrl }
          });
        }

        if (prompt) {
          content.push({
            type: 'text',
            text: prompt
          });
        }

        const messages = [
          {
            role: 'user',
            content: content
          }
        ];

        const visionChatUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-turbo-128k';

        const response = await axios.post(
          `${visionChatUrl}?access_token=${token}`,
          {
            messages: messages,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.8
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.error_code) {
          throw new Error(`文心一言视觉API错误: ${response.data.error_msg}`);
        }

        return response.data.result;
      }

    } catch (error) {
      throw new Error(`视觉理解失败: ${error.message}`);
    }
  }

  /**
   * 图片对比分析（用于质量验证）
   * @param {string} referenceImage - 理想效果图片路径
   * @param {string} generatedImage - 生成结果图片路径
   * @param {Object} checkItems - 检查项配置 { position, size, textLength, visualStyle }
   * @returns {Promise<Object>} 对比结果
   */
  async compareImages(referenceImage, generatedImage, checkItems = {}) {
    // 默认检查所有项目
    const checks = {
      position: checkItems.position !== false,
      size: checkItems.size !== false,
      textLength: checkItems.textLength !== false,
      visualStyle: checkItems.visualStyle !== false
    };

    // 构建检查项说明
    const checkItemsText = [];
    if (checks.position) {
      checkItemsText.push(`1. **卡片位置** (position)
   - 检查卡片在画面中的位置是否一致
   - 是否避开了底部UI安全区域（底部400px）`);
    }
    if (checks.size) {
      checkItemsText.push(`2. **卡片尺寸** (size)
   - 检查卡片的宽度和高度是否符合标准
   - 参考标准：约600x300像素`);
    }
    if (checks.textLength) {
      checkItemsText.push(`3. **文字长度** (textLength)
   - 检查卡片上的文字数量
   - 标准：3-5个字符最佳，不超过5个字符`);
    }
    if (checks.visualStyle) {
      checkItemsText.push(`4. **视觉样式** (visualStyle)
   - 检查卡片的背景颜色、边框样式、字体颜色
   - 参考标准：蓝色渐变背景、双边框（深色外框+亮色内框）、白色粗体文字`);
    }

    const prompt = `你是一个专业的视频质量评审专家。请对比以下两张图片：

第一张是理想效果视频的截图（参考标准）
第二张是生成视频的截图（待检查）

请从以下维度进行对比分析，并返回JSON格式的结果：

${checkItemsText.join('\n\n')}

请按照以下JSON格式返回结果（只返回JSON，不要其他内容）：

{
  "position": {
    "passed": true/false,
    "reference": "理想效果的位置描述",
    "generated": "生成结果的位置描述",
    "difference": "差异说明"
  },
  "size": {
    "passed": true/false,
    "reference": "理想效果的尺寸",
    "generated": "生成结果的尺寸",
    "difference": "差异说明"
  },
  "textLength": {
    "passed": true/false,
    "reference": "3-5个字",
    "generated": "实际字数",
    "difference": "差异说明"
  },
  "visualStyle": {
    "passed": true/false,
    "reference": "理想效果的样式描述",
    "generated": "生成结果的样式描述",
    "difference": "差异说明"
  },
  "overallPassed": true/false,
  "summary": "总体评价"
}

要求：
- 仔细观察两张图片的细节
- passed字段：true表示符合标准，false表示不符合
- 如果某个维度差异很小（可接受范围内），也应该标记为passed: true
- 提供清晰准确的差异说明`;

    try {
      const response = await this.visionChat(
        [referenceImage, generatedImage],
        prompt,
        {
          temperature: 0.3  // 降低温度以获得更稳定的输出
        }
      );

      // 提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到JSON格式的结果');
      }

      const result = JSON.parse(jsonMatch[0]);

      // 验证必需字段
      const requiredFields = ['position', 'size', 'textLength', 'visualStyle', 'overallPassed'];
      for (const field of requiredFields) {
        if (result[field] === undefined) {
          throw new Error(`缺少必需字段: ${field}`);
        }
      }

      return result;

    } catch (error) {
      throw new Error(`图片对比失败: ${error.message}`);
    }
  }
}

export default WenxinService;
