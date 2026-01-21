/**
 * 单元1: 环境验证测试
 * 验证所有依赖和API是否正常工作
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { BAIDU_SPEECH_CONFIG, BAIDU_NLP_CONFIG, WENXIN_CONFIG } from '../config/api-keys.js';

dotenv.config();
const execAsync = promisify(exec);

describe('单元1: 环境验证', () => {

  describe('1.1 系统依赖检查', () => {

    it('应该安装了Node.js v18+', async () => {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim().replace('v', '');
      const major = parseInt(version.split('.')[0]);

      expect(major).toBeGreaterThanOrEqual(18);
      console.log('✅ Node.js版本:', stdout.trim());
    });

    it('应该安装了FFmpeg v4.4+', async () => {
      const { stdout } = await execAsync('ffmpeg -version');
      const versionMatch = stdout.match(/ffmpeg version (\d+\.\d+)/);

      expect(versionMatch).toBeTruthy();
      const version = parseFloat(versionMatch[1]);
      expect(version).toBeGreaterThanOrEqual(4.4);
      console.log('✅ FFmpeg版本:', versionMatch[1]);
    });
  });

  describe('1.2 API配置检查', () => {

    it('应该配置了百度语音识别API密钥', () => {
      expect(BAIDU_SPEECH_CONFIG.apiKey).toBeDefined();
      expect(BAIDU_SPEECH_CONFIG.secretKey).toBeDefined();
      expect(BAIDU_SPEECH_CONFIG.apiKey.length).toBeGreaterThan(0);
      console.log('✅ 百度语音识别API密钥已配置');
    });

    it('应该配置了百度NLP API密钥', () => {
      expect(BAIDU_NLP_CONFIG.apiKey).toBeDefined();
      expect(BAIDU_NLP_CONFIG.secretKey).toBeDefined();
      expect(BAIDU_NLP_CONFIG.apiKey.length).toBeGreaterThan(0);
      console.log('✅ 百度NLP API密钥已配置');
    });

    it('应该配置了文心一言API密钥', () => {
      expect(WENXIN_CONFIG.apiKey).toBeDefined();
      expect(WENXIN_CONFIG.secretKey).toBeDefined();
      expect(WENXIN_CONFIG.apiKey.length).toBeGreaterThan(0);
      console.log('✅ 文心一言API密钥已配置');
    });

    it('应该配置了豆包API密钥', () => {
      expect(process.env.DOUBAO_API_KEY).toBeDefined();
      console.log('✅ 豆包API密钥已配置');
    });
  });
});
