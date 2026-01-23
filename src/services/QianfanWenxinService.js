/**
 * 千帆平台文心一言API服务（使用IAM认证）
 * 支持千帆平台的v2协议和IAM安全认证
 */

class QianfanWenxinService {
  constructor() {
    this.accessKey = 'ALTAK-rcrLqDcwe4h2DuEqNK5CK';
    this.secretKey = '916a0a8f85d4354539b00ffcfac9c59a18188396';
    this.baseUrl = 'https://aip.baidubce.com';
    this.model = 'ernie-3.5-8k';

    // IAM认证相关
    this.iamToken = null;
    this.iamTokenExpireTime = 0;
  }

  /**
   * 生成IAM签名（备用方法，实际使用简化OAuth流程）
   * @param {string} method - HTTP方法
   * @param {string} path - 请求路径
   * @param {Object} params - 查询参数
   * @param {string} body - 请求体
   * @returns {string} 签名
   */
  generateSignature(method, path, params, body) {
    // 千帆平台v2协议实际上使用简化的OAuth 2.0流程
    // 这个方法保留用于未来可能的复杂签名需求
    console.log('[QianfanWenxin] 使用简化的OAuth 2.0认证流程');
    return null;
  }

  /**
   * 获取IAM认证Token
   * @returns {Promise<string>} Access Token
   */
  async getIAMToken() {
    // 检查缓存
    if (this.iamToken && Date.now() < this.iamTokenExpireTime) {
      return this.iamToken;
    }

    try {
      // 使用OAuth 2.0获取token（千帆平台兼容此方式）
      const url = `${this.baseUrl}/oauth/2.0/token`;
      const params = {
        grant_type: 'client_credentials',
        client_id: this.accessKey,
        client_secret: this.secretKey
      };

      const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`获取Token失败 [${response.status}]: ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`认证错误: ${data.error_description || data.error}`);
      }

      this.iamToken = data.access_token;
      // Token有效期通常30天，提前1天刷新
      this.iamTokenExpireTime = Date.now() + (data.expires_in - 86400) * 1000;

      console.log('[QianfanWenxin] IAM Token获取成功');
      return this.iamToken;

    } catch (error) {
      console.error('[QianfanWenxin] 获取IAM Token失败:', error);
      throw error;
    }
  }

  /**
   * 调用千帆文心一言API（使用简化版，不需要复杂签名）
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<string>} 响应文本
   */
  async chat(prompt, options = {}) {
    try {
      const token = await this.getIAMToken();

      // 千帆平台chat endpoint
      const url = `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${this.model}?access_token=${token}`;

      const messages = options.messages || [];
      const messageList = [
        ...messages,
        { role: 'user', content: prompt }
      ];

      const requestBody = {
        messages: messageList,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.8,
        penalty_score: 1.0,
        stream: false
      };

      if (options.max_tokens) {
        requestBody.max_output_tokens = options.max_tokens;
      }

      console.log('[QianfanWenxin] 发送请求...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API调用失败 [${response.status}]: ${errorText}`);
      }

      const result = await response.json();

      if (result.error_code) {
        throw new Error(`API错误 [${result.error_code}]: ${result.error_msg}`);
      }

      console.log('[QianfanWenxin] 调用成功');
      return result.result;

    } catch (error) {
      console.error('[QianfanWenxin] 调用失败:', error);
      throw error;
    }
  }
}

export default QianfanWenxinService;
