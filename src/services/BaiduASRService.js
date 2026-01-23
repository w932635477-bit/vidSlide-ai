import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { BAIDU_SPEECH_CONFIG } from '../config/api-keys.js';

/**
 * BaiduASRService - 百度语音识别服务（Node.js版本）
 *
 * 功能：
 * 1. 从视频中提取音频
 * 2. 调用百度ASR API进行语音识别
 * 3. 返回识别的文本
 */
class BaiduASRService {
  constructor(options = {}) {
    // 从配置文件读取API密钥
    this.config = BAIDU_SPEECH_CONFIG;
    this.apiKey = options.apiKey || this.config.apiKey;
    this.secretKey = options.secretKey || this.config.secretKey;

    // API配置
    this.tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    this.asrUrl = 'https://vop.baidu.com/server_api';

    // 缓存access_token
    this.accessToken = null;
    this.tokenExpireTime = 0;
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
      const url = `${this.tokenUrl}?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API错误: ${data.error_description || data.error}`);
      }

      this.accessToken = data.access_token;
      // token有效期30天，提前1天刷新
      this.tokenExpireTime = Date.now() + (29 * 24 * 60 * 60 * 1000);

      return this.accessToken;

    } catch (error) {
      throw new Error(`获取Access Token失败: ${error.message}`);
    }
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
   * 语音识别
   * @param {string} audioPath - 音频文件路径（WAV格式）
   * @returns {Promise<string>} 识别的文本
   */
  async recognizeSpeech(audioPath) {
    try {
      // 1. 检查文件是否存在
      if (!fs.existsSync(audioPath)) {
        throw new Error(`音频文件不存在: ${audioPath}`);
      }

      // 2. 读取音频文件
      const audioData = fs.readFileSync(audioPath);

      // 提取PCM数据（跳过WAV头部44字节）
      const pcmData = audioData.slice(44);
      const audioBase64 = pcmData.toString('base64');

      // 3. 获取Access Token
      const token = await this.getAccessToken();

      // 4. 调用百度ASR API
      const response = await fetch(this.asrUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'pcm',
          rate: 16000,
          channel: 1,
          cuid: this.config.cuid || 'vidslide_ai_client',
          token: token,
          dev_pid: this.config.devPid || 1537,
          speech: audioBase64,
          len: pcmData.length
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败 [${response.status}]: ${errorText}`);
      }

      const result = await response.json();

      // 5. 处理响应
      if (result.err_no === 0) {
        const transcript = result.result.join('');
        return transcript;
      } else {
        throw new Error(`ASR识别失败 [${result.err_no}]: ${result.err_msg}`);
      }

    } catch (error) {
      throw new Error(`语音识别失败: ${error.message}`);
    }
  }

  /**
   * 语音识别（兼容旧接口）
   * @param {string} videoPath - 视频路径
   * @returns {Promise<string>} 识别的文本
   */
  async transcribe(videoPath) {
    try {
      // 1. 提取音频
      console.log('提取音频...');
      const audioPath = await this.extractAudio(videoPath);

      // 2. 识别语音
      console.log('调用百度ASR API...');
      const transcript = await this.recognizeSpeech(audioPath);

      // 3. 清理临时音频文件
      fs.unlinkSync(audioPath);

      return transcript;

    } catch (error) {
      throw new Error(`语音识别失败: ${error.message}`);
    }
  }

  /**
   * 长音频识别（分段处理）
   * @param {string} videoPath - 视频路径
   * @param {number} segmentDuration - 每段时长（秒）
   * @returns {Promise<string>} 识别的文本
   */
  async transcribeLong(videoPath, segmentDuration = 60) {
    try {
      // 1. 提取音频
      const audioPath = await this.extractAudio(videoPath);

      // 2. 获取音频时长
      const duration = this.getAudioDuration(audioPath);

      // 3. 分段识别
      const segments = Math.ceil(duration / segmentDuration);
      const transcripts = [];

      for (let i = 0; i < segments; i++) {
        const startTime = i * segmentDuration;
        const segmentPath = await this.extractAudioSegment(
          audioPath,
          startTime,
          segmentDuration
        );

        const segmentTranscript = await this.recognizeSpeech(segmentPath);
        transcripts.push(segmentTranscript);

        // 清理临时文件
        fs.unlinkSync(segmentPath);
      }

      // 清理临时音频文件
      fs.unlinkSync(audioPath);

      return transcripts.join('');

    } catch (error) {
      throw new Error(`长音频识别失败: ${error.message}`);
    }
  }

  /**
   * 获取音频时长
   * @param {string} audioPath - 音频路径
   * @returns {number} 时长（秒）
   */
  getAudioDuration(audioPath) {
    try {
      const cmd = `ffprobe -v quiet -print_format json -show_format "${audioPath}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const info = JSON.parse(output);
      return parseFloat(info.format.duration);
    } catch (error) {
      throw new Error(`获取音频时长失败: ${error.message}`);
    }
  }

  /**
   * 提取音频片段
   * @param {string} audioPath - 音频路径
   * @param {number} startTime - 开始时间（秒）
   * @param {number} duration - 时长（秒）
   * @returns {Promise<string>} 片段路径
   */
  async extractAudioSegment(audioPath, startTime, duration) {
    const segmentPath = audioPath.replace('.wav', `_segment_${startTime}.wav`);

    try {
      const cmd = `ffmpeg -i "${audioPath}" -ss ${startTime} -t ${duration} -acodec copy "${segmentPath}" -y`;
      execSync(cmd, { stdio: 'pipe' });

      return segmentPath;

    } catch (error) {
      throw new Error(`提取音频片段失败: ${error.message}`);
    }
  }
}

export default BaiduASRService;
