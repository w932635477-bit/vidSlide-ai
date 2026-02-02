import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
import { execSync } from 'child_process';
import FormData from 'form-data';
import https from 'https';

/**
 * XunfeiASRService - 讯飞极速录音转写服务
 *
 * 使用讯飞极速录音转写大模型API
 * API文档: https://www.xfyun.cn/doc/asr/ost/API.html
 *
 * 功能：
 * 1. 从视频中提取音频
 * 2. 上传音频文件到讯飞
 * 3. 创建转写任务
 * 4. 轮询获取识别结果
 * 5. 返回带时间戳的文本
 *
 * 优势：
 * - 中文识别准确率98%+（业界最高）
 * - 支持22种方言和202种方言免切识别
 * - 极速转写：1小时音频约1分钟完成
 * - 支持词级时间戳
 */
class XunfeiASRService {
  constructor(options = {}) {
    this.appId = options.appId || process.env.XUNFEI_APP_ID;
    this.apiKey = options.apiKey || process.env.XUNFEI_API_KEY;
    this.apiSecret = options.apiSecret || process.env.XUNFEI_SECRET_KEY;

    // API配置
    this.uploadHost = 'upload-ost-api.xfyun.cn';
    this.uploadUrl = `https://${this.uploadHost}/file/upload`;

    this.taskHost = 'ost-api.xfyun.cn';
    this.createTaskUrl = `https://${this.taskHost}/v2/ost/pro_create`;
    this.queryTaskUrl = `https://${this.taskHost}/v2/ost/query`;

    // 轮询配置
    this.maxPollingTime = 300000; // 最大轮询时间5分钟
    this.pollingInterval = 2000;  // 每2秒查询一次
  }

  /**
   * 生成RFC1123格式的日期
   * @returns {string} RFC1123格式的日期
   */
  generateRFC1123Date() {
    return new Date().toUTCString();
  }

  /**
   * 生成Digest
   * @returns {string} Digest
   */
  generateDigest() {
    const sha256 = crypto.createHash('sha256').update('').digest();
    return 'SHA-256=' + sha256.toString('base64');
  }

  /**
   * 生成签名
   * @param {string} host - 主机名
   * @param {string} date - RFC1123格式的日期
   * @param {string} requestLine - 请求行
   * @param {string} digest - Digest
   * @returns {string} 签名
   */
  generateSignature(host, date, requestLine, digest) {
    // 1. 拼接signature_origin
    const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}\ndigest: ${digest}`;

    // 2. 使用HMAC-SHA256算法，结合APISecret进行签名
    const hmac = crypto.createHmac('sha256', this.apiSecret);
    hmac.update(signatureOrigin);
    const signatureSha = hmac.digest();

    // 3. 使用base64编码
    return signatureSha.toString('base64');
  }

  /**
   * 生成Authorization
   * @param {string} host - 主机名
   * @param {string} date - RFC1123格式的日期
   * @param {string} requestLine - 请求行
   * @param {string} digest - Digest
   * @returns {string} Authorization
   */
  generateAuthorization(host, date, requestLine, digest) {
    const signature = this.generateSignature(host, date, requestLine, digest);
    return `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`;
  }

  /**
   * 从视频中提取音频
   * @param {string} videoPath - 视频路径
   * @returns {Promise<string>} 音频文件路径
   */
  async extractAudio(videoPath) {
    const audioPath = videoPath.replace(/\.[^.]+$/, '_audio.wav');

    try {
      // 使用FFmpeg提取音频，转换为16k采样率的WAV格式
      const cmd = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`;
      execSync(cmd, { stdio: 'pipe' });

      if (!fs.existsSync(audioPath)) {
        throw new Error('音频提取失败');
      }

      return audioPath;

    } catch (error) {
      throw new Error(`提取音频失败: ${error.message}`);
    }
  }

  /**
   * 上传音频文件
   * @param {string} audioPath - 音频文件路径
   * @returns {Promise<string>} 音频URL
   */
  async uploadAudio(audioPath) {
    return new Promise((resolve, reject) => {
      try {
        const date = this.generateRFC1123Date();
        const digest = this.generateDigest();
        const requestLine = 'POST /file/upload HTTP/1.1';
        const authorization = this.generateAuthorization(this.uploadHost, date, requestLine, digest);

        // 创建表单数据
        const formData = new FormData();
        const requestId = Date.now().toString();

        formData.append('app_id', this.appId);
        formData.append('request_id', requestId);
        formData.append('data', fs.createReadStream(audioPath));

        console.log(`  → 上传参数:`);
        console.log(`    - AppID: ${this.appId}`);
        console.log(`    - RequestID: ${requestId}`);

        // ⭐ 修复：使用原生https模块替代axios
        const options = {
          hostname: this.uploadHost,
          port: 443,
          path: '/file/upload',
          method: 'POST',
          headers: {
            ...formData.getHeaders(),
            'date': date,
            'digest': digest,
            'authorization': authorization
          },
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const responseData = JSON.parse(data);
              console.log(`  → 上传响应:`, JSON.stringify(responseData, null, 2));

              if (responseData.code !== 0) {
                reject(new Error(`上传失败: ${responseData.message} (错误码: ${responseData.code})`));
                return;
              }

              const audioUrl = responseData.data.url;
              console.log(`  → 音频URL: ${audioUrl.substring(0, 50)}...`);
              resolve(audioUrl);

            } catch (parseError) {
              console.error(`  → 解析响应失败:`, data);
              reject(new Error(`解析响应失败: ${parseError.message}`));
            }
          });
        });

        req.on('error', (error) => {
          console.error(`  → 请求错误:`, error.message);
          reject(new Error(`上传失败: ${error.message}`));
        });

        // 发送表单数据
        formData.pipe(req);

      } catch (error) {
        reject(new Error(`上传失败: ${error.message}`));
      }
    });
  }

  /**
   * 创建转写任务
   * @param {string} audioUrl - 音频URL
   * @returns {Promise<string>} 任务ID
   */
  async createTask(audioUrl) {
    return new Promise((resolve, reject) => {
      try {
        const date = this.generateRFC1123Date();
        const digest = this.generateDigest();
        const requestLine = 'POST /v2/ost/pro_create HTTP/1.1';
        const authorization = this.generateAuthorization(this.taskHost, date, requestLine, digest);

        const requestId = Date.now().toString();
        const requestBody = {
          common: {
            app_id: this.appId
          },
          business: {
            request_id: requestId,
            language: 'zh_cn',
            domain: 'pro_ost_ed',
            accent: 'mandarin'
          },
          data: {
            audio_url: audioUrl,
            audio_src: 'http',
            format: 'audio/L16;rate=16000',
            encoding: 'raw'
          }
        };

        console.log(`  → 创建任务参数:`, JSON.stringify(requestBody, null, 2));

        const bodyString = JSON.stringify(requestBody);

        // ⭐ 使用原生https模块替代axios
        const options = {
          hostname: this.taskHost,
          port: 443,
          path: '/v2/ost/pro_create',
          method: 'POST',
          headers: {
            'date': date,
            'digest': digest,
            'authorization': authorization,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString)
          },
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const responseData = JSON.parse(data);
              console.log(`  → 创建任务响应:`, JSON.stringify(responseData, null, 2));

              if (responseData.code !== 0) {
                reject(new Error(`创建任务失败: ${responseData.message} (错误码: ${responseData.code})`));
                return;
              }

              const taskId = responseData.data.task_id;
              console.log(`  → 任务ID: ${taskId}`);
              resolve(taskId);

            } catch (parseError) {
              console.error(`  → 解析响应失败:`, data);
              reject(new Error(`解析响应失败: ${parseError.message}`));
            }
          });
        });

        req.on('error', (error) => {
          console.error(`  → 请求错误:`, error.message);
          reject(new Error(`创建任务失败: ${error.message}`));
        });

        req.write(bodyString);
        req.end();

      } catch (error) {
        reject(new Error(`创建任务失败: ${error.message}`));
      }
    });
  }

  /**
   * 查询任务结果
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 任务结果
   */
  async queryTask(taskId) {
    return new Promise((resolve, reject) => {
      try {
        const date = this.generateRFC1123Date();
        const digest = this.generateDigest();
        const requestLine = 'POST /v2/ost/query HTTP/1.1';
        const authorization = this.generateAuthorization(this.taskHost, date, requestLine, digest);

        const requestBody = {
          common: {
            app_id: this.appId
          },
          business: {
            task_id: taskId
          }
        };

        const bodyString = JSON.stringify(requestBody);

        // ⭐ 使用原生https模块替代axios
        const options = {
          hostname: this.taskHost,
          port: 443,
          path: '/v2/ost/query',
          method: 'POST',
          headers: {
            'date': date,
            'digest': digest,
            'authorization': authorization,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(bodyString)
          },
          rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const responseData = JSON.parse(data);

              if (responseData.code !== 0) {
                reject(new Error(`查询任务失败: ${responseData.message}`));
                return;
              }

              resolve(responseData.data);

            } catch (parseError) {
              console.error(`  → 解析响应失败:`, data);
              reject(new Error(`解析响应失败: ${parseError.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`查询任务失败: ${error.message}`));
        });

        req.write(bodyString);
        req.end();

      } catch (error) {
        reject(new Error(`查询任务失败: ${error.message}`));
      }
    });
  }

  /**
   * 轮询等待任务完成
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 识别结果
   */
  async waitForResult(taskId) {
    const startTime = Date.now();

    while (Date.now() - startTime < this.maxPollingTime) {
      const taskData = await this.queryTask(taskId);

      // 任务状态：1-待处理，2-处理中，3-处理完成，4-回调完成
      const status = parseInt(taskData.task_status);

      if (status === 3 || status === 4) {
        // 任务完成
        console.log(`  → 识别完成`);
        return taskData.result;
      } else {
        // 任务进行中
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const statusText = ['', '待处理', '处理中', '处理完成', '回调完成'][status] || '未知';
        console.log(`  → 识别中... (${elapsed}秒, 状态: ${statusText})`);
        await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
      }
    }

    throw new Error('识别超时');
  }

  /**
   * 解析识别结果，提取文本和时间戳
   * @param {Object} result - 讯飞返回的结果
   * @returns {Object} 包含transcript和words的对象
   */
  parseResult(result) {
    try {
      let transcript = '';
      const words = [];

      // 使用lattice（经过后处理的结果）
      const lattice = result.lattice || [];

      for (const segment of lattice) {
        const json1best = segment.json_1best;
        if (!json1best || !json1best.st || !json1best.st.rt) continue;

        for (const rt of json1best.st.rt) {
          if (!rt.ws) continue;

          for (const ws of rt.ws) {
            if (!ws.cw || ws.cw.length === 0) continue;

            const wordText = ws.cw[0].w;
            const beginTime = (parseInt(json1best.st.bg) + parseInt(ws.wb) * 10) / 1000; // 转换为秒
            const endTime = (parseInt(json1best.st.bg) + parseInt(ws.we) * 10) / 1000;

            // 跳过标点符号
            if (ws.cw[0].wp === 'p') {
              transcript += wordText;
              continue;
            }

            transcript += wordText;

            words.push({
              text: wordText,
              beginTime: beginTime,
              endTime: endTime,
              duration: endTime - beginTime
            });
          }
        }
      }

      return {
        transcript: transcript,
        words: words,
        wordCount: words.length
      };

    } catch (error) {
      throw new Error(`解析结果失败: ${error.message}`);
    }
  }

  /**
   * 语音识别（主方法）
   * @param {string} videoPath - 视频路径
   * @returns {Promise<Object>} 识别结果
   */
  async transcribe(videoPath) {
    let audioPath = null;

    try {
      console.log('  → 提取音频...');
      audioPath = await this.extractAudio(videoPath);

      const audioSize = fs.statSync(audioPath).size;
      console.log(`  → 音频大小: ${(audioSize / 1024 / 1024).toFixed(2)}MB`);

      console.log('  → 上传音频到讯飞...');
      const audioUrl = await this.uploadAudio(audioPath);

      console.log('  → 创建转写任务...');
      const taskId = await this.createTask(audioUrl);

      console.log('  → 等待识别完成...');
      const result = await this.waitForResult(taskId);

      console.log('  → 解析识别结果...');
      const parsed = this.parseResult(result);

      // 清理临时音频文件
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      return parsed;

    } catch (error) {
      // 清理临时文件
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      throw new Error(`语音识别失败: ${error.message}`);
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      service: 'Xunfei ASR (极速版)',
      configured: !!(this.appId && this.apiKey && this.apiSecret),
      appId: this.appId ? `${this.appId.substring(0, 8)}...` : 'Not configured'
    };
  }
}

export default XunfeiASRService;
