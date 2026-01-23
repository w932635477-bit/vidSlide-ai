/**
 * 千帆平台IAM认证服务（基于BCE AK/SK签名）
 * 支持v2协议的IAM安全认证
 *
 * 认证方式：使用BCE Access Key和Secret Key进行请求签名
 * 不同于OAuth 2.0的token认证，这是基于签名的认证方式
 */

import crypto from 'crypto';

class QianfanIAMService {
  constructor() {
    // BCE IAM认证密钥（Access Key格式：ALTAK-xxx）
    this.accessKey = 'ALTAK-rcrLqDcwe4h2DuEqNK5CK';
    this.secretKey = '916a0a8f85d4354539b00ffcfac9c59a18188396';

    // API配置
    this.baseUrl = 'https://aip.baidubce.com';
    this.model = 'ernie-3.5-8k';

    // BCE签名算法配置
    this.signatureVersion = '1';
    this.expirationPeriodInSeconds = 1800; // 签名有效期30分钟
  }

  /**
   * 生成BCE IAM签名
   * @param {string} method - HTTP方法
   * @param {string} path - 请求路径
   * @param {Object} headers - 请求头
   * @param {Object} params - 查询参数
   * @returns {string} 签名后的Authorization头
   */
  generateBCESignature(method, path, headers = {}, params = {}) {
    // 1. 生成时间戳（UTC格式）
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // 2. 生成authString（认证字符串前缀）
    const authStringPrefix = `bce-auth-v${this.signatureVersion}/${this.accessKey}/${timestamp}/${this.expirationPeriodInSeconds}`;

    // 3. 生成SigningKey
    const signingKey = crypto
      .createHmac('sha256', this.secretKey)
      .update(authStringPrefix)
      .digest('hex');

    // 4. 规范化URI（不需要额外编码，保持原样）
    const canonicalUri = path;

    // 5. 规范化查询字符串
    const canonicalQueryString = this.getCanonicalQueryString(params);

    // 6. 规范化请求头（只包含host和content-type）
    const canonicalHeaders = this.getCanonicalHeaders(headers);

    // 7. 生成CanonicalRequest
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}`;

    console.log('[QianfanIAM] CanonicalRequest:');
    console.log(canonicalRequest);

    // 8. 生成签名
    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(canonicalRequest)
      .digest('hex');

    // 9. 生成Authorization头
    const signedHeaders = Object.keys(headers)
      .map(k => k.toLowerCase())
      .sort()
      .join(';');

    return `${authStringPrefix}/${signedHeaders}/${signature}`;
  }

  /**
   * URI编码（BCE规范）
   * @param {string} uri - URI
   * @returns {string} 编码后的URI
   */
  uriEncode(uri) {
    return encodeURIComponent(uri)
      .replace(/%2F/g, '/')
      .replace(/%3A/g, ':')
      .replace(/%40/g, '@')
      .replace(/%21/g, '!')
      .replace(/%24/g, '$')
      .replace(/%26/g, '&')
      .replace(/%27/g, "'")
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2A/g, '*')
      .replace(/%2B/g, '+')
      .replace(/%2C/g, ',')
      .replace(/%3B/g, ';')
      .replace(/%3D/g, '=');
  }

  /**
   * 生成规范化查询字符串
   * @param {Object} params - 查询参数
   * @returns {string} 规范化查询字符串
   */
  getCanonicalQueryString(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    return Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * 生成规范化请求头
   * @param {Object} headers - 请求头
   * @returns {string} 规范化请求头
   */
  getCanonicalHeaders(headers) {
    if (!headers || Object.keys(headers).length === 0) {
      return '';
    }

    return Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .map(key => {
        const originalKey = Object.keys(headers).find(k => k.toLowerCase() === key);
        const value = headers[originalKey];
        // BCE规范：header值需要trim，但不需要URI编码
        return `${key}:${String(value).trim()}`;
      })
      .join('\n');
  }

  /**
   * 调用千帆文心一言API
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {Promise<string>} 响应文本
   */
  async chat(prompt, options = {}) {
    try {
      console.log('[QianfanIAM] 开始调用文心一言API...');

      // 1. 构建请求路径和参数
      // 使用通用的completions endpoint，而不是模型特定的endpoint
      const path = `/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`;

      // 2. 构建请求体
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

      const bodyString = JSON.stringify(requestBody);

      // 3. 构建请求头
      const headers = {
        'Content-Type': 'application/json',
        'Host': 'aip.baidubce.com'
      };

      // 4. 生成BCE签名
      const authorization = this.generateBCESignature('POST', path, headers, {});
      headers['Authorization'] = authorization;

      console.log('[QianfanIAM] 请求信息:');
      console.log(`  路径: ${path}`);
      console.log(`  提示词长度: ${prompt.length}字符`);
      console.log(`  Authorization: ${authorization.substring(0, 50)}...`);

      // 5. 发送请求
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: bodyString
      });

      const responseText = await response.text();
      console.log('[QianfanIAM] 响应状态:', response.status);

      if (!response.ok) {
        console.error('[QianfanIAM] 错误响应:', responseText);
        throw new Error(`API调用失败 [${response.status}]: ${responseText}`);
      }

      const result = JSON.parse(responseText);

      if (result.error_code) {
        console.error('[QianfanIAM] API错误:', result);
        throw new Error(`API错误 [${result.error_code}]: ${result.error_msg}`);
      }

      console.log('[QianfanIAM] ✅ 调用成功');
      console.log(`  响应长度: ${result.result?.length || 0}字符`);

      return result.result;

    } catch (error) {
      console.error('[QianfanIAM] ❌ 调用失败:', error);
      throw error;
    }
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>} 是否成功
   */
  async test() {
    try {
      console.log('[QianfanIAM] 测试API连接...');
      const response = await this.chat('你好，请用一句话介绍你自己。');
      console.log('[QianfanIAM] ✅ API连接正常');
      console.log(`  响应: ${response.substring(0, 100)}...`);
      return true;
    } catch (error) {
      console.error('[QianfanIAM] ❌ API连接失败:', error.message);
      return false;
    }
  }
}

export default QianfanIAMService;
