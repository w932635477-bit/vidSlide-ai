/**
 * 千帆平台V2协议服务（Bearer Token认证）
 * 支持千帆平台v2协议的Bearer Token认证方式
 *
 * 认证方式：Authorization: Bearer bce-v3/{AccessKey}/{SecretKey}
 * API地址：https://qianfan.baidubce.com/v2/chat/completions
 */

class QianfanV2BearerService {
  constructor() {
    // BCE IAM认证密钥
    this.accessKey = 'ALTAK-rcrLqDcwe4h2DuEqNK5CK';
    this.secretKey = '916a0a8f85d4354539b00ffcfac9c59a18188396';

    // V2协议配置
    this.baseUrl = 'https://qianfan.baidubce.com';
    this.apiPath = '/v2/chat/completions';
    this.model = 'ernie-3.5-8k';
  }

  /**
   * 生成Bearer Token
   * @returns {string} Bearer Token
   */
  getBearerToken() {
    return `bce-v3/${this.accessKey}/${this.secretKey}`;
  }

  /**
   * 调用千帆V2协议API
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<string>} 响应文本
   */
  async chat(prompt, options = {}) {
    try {
      console.log('[QianfanV2Bearer] 开始调用文心一言API...');

      // 1. 生成Bearer Token
      const bearerToken = this.getBearerToken();

      // 2. 构建请求体
      const messages = options.messages || [];
      const messageList = [
        ...messages,
        { role: 'user', content: prompt }
      ];

      const requestBody = {
        model: this.model,
        messages: messageList,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.8
      };

      if (options.max_tokens) {
        requestBody.max_tokens = options.max_tokens;
      }

      console.log('[QianfanV2Bearer] 请求信息:');
      console.log(`  URL: ${this.baseUrl}${this.apiPath}`);
      console.log(`  模型: ${this.model}`);
      console.log(`  提示词长度: ${prompt.length}字符`);
      console.log(`  Bearer Token: ${bearerToken.substring(0, 30)}...`);

      // 3. 发送请求
      const response = await fetch(`${this.baseUrl}${this.apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('[QianfanV2Bearer] 响应状态:', response.status);

      if (!response.ok) {
        console.error('[QianfanV2Bearer] 错误响应:', responseText);
        throw new Error(`API调用失败 [${response.status}]: ${responseText}`);
      }

      const result = JSON.parse(responseText);

      // 4. 处理响应（v2协议的响应格式）
      if (result.error) {
        console.error('[QianfanV2Bearer] API错误:', result);
        throw new Error(`API错误: ${result.error.message || result.error}`);
      }

      // v2协议的响应格式：result.choices[0].message.content
      const content = result.choices?.[0]?.message?.content || result.result;

      if (!content) {
        console.error('[QianfanV2Bearer] 响应格式异常:', result);
        throw new Error('响应中未找到内容');
      }

      console.log('[QianfanV2Bearer] ✅ 调用成功');
      console.log(`  响应长度: ${content.length}字符`);

      return content;

    } catch (error) {
      console.error('[QianfanV2Bearer] ❌ 调用失败:', error);
      throw error;
    }
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} 是否成功
   */
  async test() {
    try {
      console.log('[QianfanV2Bearer] 测试API连接...');
      const response = await this.chat('你好，请用一句话介绍你自己。');
      console.log('[QianfanV2Bearer] ✅ API连接正常');
      console.log(`  响应: ${response.substring(0, 100)}...`);
      return true;
    } catch (error) {
      console.error('[QianfanV2Bearer] ❌ API连接失败:', error.message);
      return false;
    }
  }
}

export default QianfanV2BearerService;
