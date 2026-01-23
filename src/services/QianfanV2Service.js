/**
 * 千帆平台V2协议API服务（使用IAM安全认证）
 * 支持千帆平台v2协议的预置推理服务
 */

class QianfanV2Service {
  constructor() {
    // BCE IAM认证密钥
    this.accessKey = 'ALTAK-rcrLqDcwe4h2DuEqNK5CK';
    this.secretKey = '916a0a8f85d4354539b00ffcfac9c59a18188396';

    // V2协议配置
    this.baseUrl = 'https://aip.baidubce.com';
    this.model = 'ernie-3.5-8k';  // 预置推理服务

    // Token缓存
    this.iamToken = null;
    this.iamTokenExpireTime = 0;
  }

  /**
   * 获取IAM认证Token
   * 使用OAuth 2.0方式获取access_token
   * @returns {Promise<string>} Access Token
   */
  async getIAMToken() {
    // 检查缓存
    if (this.iamToken && Date.now() < this.iamTokenExpireTime) {
      console.log('[QianfanV2] 使用缓存的IAM Token');
      return this.iamToken;
    }

    try {
      console.log('[QianfanV2] 获取IAM Token...');

      // 使用BCE的OAuth 2.0 endpoint
      const url = `${this.baseUrl}/oauth/2.0/token`;
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.accessKey,
        client_secret: this.secretKey
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('[QianfanV2] Token响应状态:', response.status);
      console.log('[QianfanV2] Token响应内容:', responseText.substring(0, 200));

      if (!response.ok) {
        throw new Error(`获取Token失败 [${response.status}]: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      if (data.error) {
        throw new Error(`认证错误: ${data.error_description || data.error}`);
      }

      this.iamToken = data.access_token;
      // Token有效期通常30天，提前1天刷新
      const expiresIn = (data.expires_in || 2592000) - 86400;
      this.iamTokenExpireTime = Date.now() + expiresIn * 1000;

      console.log('[QianfanV2] ✅ IAM Token获取成功');
      console.log(`   Token前缀: ${this.iamToken.substring(0, 20)}...`);
      console.log(`   有效期: ${Math.floor(expiresIn / 86400)}天`);

      return this.iamToken;

    } catch (error) {
      console.error('[QianfanV2] ❌ 获取IAM Token失败:', error);
      throw error;
    }
  }

  /**
   * 调用千帆V2协议API
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<string>} 响应文本
   */
  async chat(prompt, options = {}) {
    try {
      const token = await this.getIAMToken();

      // V2协议的chat endpoint（使用completions）
      const url = `${this.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${token}`;

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

      console.log('[QianfanV2] 发送请求...');
      console.log(`   模型: ${this.model}`);
      console.log(`   提示词长度: ${prompt.length}字符`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('[QianfanV2] 响应状态:', response.status);

      if (!response.ok) {
        console.error('[QianfanV2] 错误响应:', responseText);
        throw new Error(`API调用失败 [${response.status}]: ${responseText}`);
      }

      const result = JSON.parse(responseText);

      if (result.error_code) {
        console.error('[QianfanV2] API错误:', result);
        throw new Error(`API错误 [${result.error_code}]: ${result.error_msg}`);
      }

      console.log('[QianfanV2] ✅ 调用成功');
      console.log(`   响应长度: ${result.result?.length || 0}字符`);

      return result.result;

    } catch (error) {
      console.error('[QianfanV2] ❌ 调用失败:', error);
      throw error;
    }
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} 是否成功
   */
  async test() {
    try {
      console.log('[QianfanV2] 测试API连接...');
      const response = await this.chat('你好，请用一句话介绍你自己。');
      console.log('[QianfanV2] ✅ API连接正常');
      console.log(`   响应: ${response.substring(0, 100)}...`);
      return true;
    } catch (error) {
      console.error('[QianfanV2] ❌ API连接失败:', error.message);
      return false;
    }
  }
}

export default QianfanV2Service;
