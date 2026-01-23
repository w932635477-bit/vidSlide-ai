/**
 * 单元1: 环境验证测试
 * 验证所有依赖和API是否正常工作
 */

import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

  describe('1.2 环境变量检查', () => {

    it('应该配置了百度API密钥', () => {
      const hasApiKey = process.env.BAIDU_API_KEY || process.env.BAIDU_APP_ID;
      const hasSecretKey = process.env.BAIDU_SECRET_KEY;

      expect(hasApiKey).toBeDefined();
      expect(hasSecretKey).toBeDefined();
      console.log('✅ 百度API密钥已配置');
    });

    it('应该配置了文心一言API密钥', () => {
      const hasApiKey = process.env.WENXIN_API_KEY;
      const hasSecretKey = process.env.WENXIN_SECRET_KEY;

      expect(hasApiKey).toBeDefined();
      expect(hasSecretKey).toBeDefined();
      console.log('✅ 文心一言API密钥已配置');
    });

    it('应该配置了豆包API密钥', () => {
      expect(process.env.DOUBAO_API_KEY).toBeDefined();
      console.log('✅ 豆包API密钥已配置');
    });
  });

  describe('1.3 目录结构检查', () => {

    it('应该存在src/services目录', () => {
      const servicesDir = path.join(process.cwd(), 'src/services');
      expect(fs.existsSync(servicesDir)).toBe(true);
      console.log('✅ src/services目录存在');
    });

    it('应该存在src/data目录', () => {
      const dataDir = path.join(process.cwd(), 'src/data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      expect(fs.existsSync(dataDir)).toBe(true);
      console.log('✅ src/data目录存在');
    });

    it('应该存在tests目录', () => {
      const testsDir = path.join(process.cwd(), 'tests');
      expect(fs.existsSync(testsDir)).toBe(true);
      console.log('✅ tests目录存在');
    });
  });
});
