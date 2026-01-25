/**
 * BCE IAM Bearer Token获取工具
 * 参考: https://cloud.baidu.com/doc/Reference/s/Gm5z8ryv5
 */

import crypto from 'crypto';
import axios from 'axios';
import { BCEAuth } from './BCEAuth.js';

export class BCEIAMClient {
  constructor(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.bceAuth = new BCEAuth(accessKey, secretKey);
    this.cachedToken = null;
    this.tokenExpireTime = null;
  }

  /**
   * 获取BCE Bearer Token
   * @param {number} expireInSeconds - Token有效期(秒)
   * @returns {Promise<string>} Bearer token (格式: bce-v3/...)
   */
  async getBearerToken(expireInSeconds = 1800) {
    // 检查缓存的token是否还有效(提前5分钟刷新)
    if (this.cachedToken && this.tokenExpireTime) {
      const now = Date.now();
      if (now < this.tokenExpireTime - 300000) { // 提前5分钟
        return this.cachedToken;
      }
    }

    try {
      const host = 'iam.bj.baidubce.com';
      const uri = '/v1/BCE-BEARER/token';
      const params = { expireInSeconds };
      const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

      const headers = {
        'host': host,
        'x-bce-date': timestamp
      };

      // 生成BCE Auth V1签名
      const authorization = this.bceAuth.generateAuth(
        'GET',
        uri,
        params,
        headers,
        timestamp,
        1800
      );

      // 构建完整URL
      const queryString = new URLSearchParams(params).toString();
      const url = `https://${host}${uri}?${queryString}`;

      // 发送请求
      const response = await axios.get(url, {
        headers: {
          'Authorization': authorization,
          'x-bce-date': timestamp
        }
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        this.cachedToken = token;

        // 计算过期时间
        if (response.data.expireTime) {
          this.tokenExpireTime = new Date(response.data.expireTime).getTime();
        } else {
          this.tokenExpireTime = Date.now() + (expireInSeconds * 1000);
        }

        return token;
      } else {
        throw new Error('响应中没有token字段');
      }
    } catch (error) {
      throw new Error(`获取BCE Bearer Token失败: ${error.message}`);
    }
  }

  /**
   * 清除缓存的token
   */
  clearCache() {
    this.cachedToken = null;
    this.tokenExpireTime = null;
  }
}
