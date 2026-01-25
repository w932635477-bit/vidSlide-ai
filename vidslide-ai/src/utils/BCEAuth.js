/**
 * BCE V3签名工具
 */

import crypto from 'crypto';

export class BCEAuth {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  /**
   * 生成BCE V3签名
   */
  generateAuth(method, uri, params = {}, headers = {}, timestamp = null, expirationInSeconds = 1800) {
    // 1. 生成签名时间
    const authTime = timestamp || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // 2. 生成signKeyInfo
    const signKeyInfo = `bce-auth-v1/${this.accessKey}/${authTime}/${expirationInSeconds}`;

    // 3. 生成signKey (使用HMAC-SHA256)
    const signKey = crypto
      .createHmac('sha256', this.secretKey)
      .update(signKeyInfo)
      .digest('hex');

    // 4. 生成CanonicalRequest
    const canonicalUri = this.getCanonicalURIPath(uri);
    const canonicalQueryString = this.getCanonicalQueryString(params);

    // 需要签名的headers (通常只包含host和content-type)
    const headersToSign = this.getHeadersToSign(headers);
    const canonicalHeaders = this.getCanonicalHeaders(headersToSign);

    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}`;

    // 5. 生成签名
    const signature = crypto
      .createHmac('sha256', signKey)
      .update(canonicalRequest)
      .digest('hex');

    // 6. 生成Authorization header
    const signedHeaders = Object.keys(headersToSign).sort().join(';');
    const authorization = `${signKeyInfo}/${signedHeaders}/${signature}`;

    return authorization;
  }

  /**
   * 生成BCE V3格式的Bearer Token (简化版)
   */
  generateBearerToken() {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

    // 简化的签名:直接使用ACCESS_KEY和SECRET_KEY生成哈希
    const signString = `${this.accessKey}${this.secretKey}${timestamp}`;
    const signature = crypto
      .createHash('sha256')
      .update(signString)
      .digest('hex');

    return `bce-v3/${this.accessKey}/${signature}`;
  }

  getCanonicalURIPath(uri) {
    // 移除query string
    return uri.split('?')[0] || '/';
  }

  getCanonicalQueryString(params) {
    const keys = Object.keys(params).sort();
    const pairs = keys.map(key => {
      const value = params[key];
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });
    return pairs.join('&');
  }

  getHeadersToSign(headers) {
    const result = {};
    const keysToSign = ['host', 'content-type'];

    for (const key of keysToSign) {
      const lowerKey = key.toLowerCase();
      if (headers[lowerKey]) {
        result[lowerKey] = headers[lowerKey];
      }
    }

    return result;
  }

  getCanonicalHeaders(headers) {
    const keys = Object.keys(headers).sort();
    const pairs = keys.map(key => {
      const value = headers[key].toString().trim();
      return `${encodeURIComponent(key)}:${encodeURIComponent(value)}`;
    });
    return pairs.join('\n');
  }
}
