import axios from 'axios';
import fs from 'fs';

/**
 * BaiduOCR - 百度OCR服务
 *
 * 功能：识别图片中的文字
 * API文档：https://ai.baidu.com/ai-doc/OCR/zk3h7xz52
 */
class BaiduOCR {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.BAIDU_OCR_API_KEY || process.env.WENXIN_API_KEY;
    this.secretKey = options.secretKey || process.env.BAIDU_OCR_SECRET_KEY || process.env.WENXIN_SECRET_KEY;

    // API配置
    this.tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    this.ocrUrl = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic';

    // 缓存access_token
    this.accessToken = null;
    this.tokenExpireTime = 0;

    this.logger = options.logger || console;
  }

  /**
   * 获取Access Token
   * @returns {Promise<string>} Access Token
   */
  async getAccessToken() {
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
      this.tokenExpireTime = Date.now() + (29 * 24 * 60 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error(`获取OCR Access Token失败: ${error.message}`);
    }
  }

  /**
   * 识别图片中的文字
   * @param {string} imagePath - 图片路径
   * @returns {Promise<Object>} OCR结果
   */
  async recognizeText(imagePath) {
    try {
      const token = await this.getAccessToken();

      // 读取图片并转base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // 调用OCR API
      const response = await axios.post(
        `${this.ocrUrl}?access_token=${token}`,
        `image=${encodeURIComponent(imageBase64)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.error_code) {
        throw new Error(`百度OCR错误: ${response.data.error_msg}`);
      }

      this.logger.info(`  OCR识别成功: 检测到${response.data.words_result.length}行文字`);

      return response.data;

    } catch (error) {
      throw new Error(`OCR识别失败: ${error.message}`);
    }
  }

  /**
   * 提取所有文字内容
   * @param {string} imagePath - 图片路径
   * @returns {Promise<string>} 文字内容
   */
  async extractText(imagePath) {
    const result = await this.recognizeText(imagePath);
    const text = result.words_result.map(item => item.words).join('');
    return text;
  }
}

export default BaiduOCR;
