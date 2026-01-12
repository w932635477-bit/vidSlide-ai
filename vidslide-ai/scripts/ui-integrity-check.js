#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UIIntegrityChecker {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.configPath = path.join(this.projectRoot, '.ui-protection.json');
    this.loadConfig();
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('❌ 无法加载UI保护配置:', error.message);
      process.exit(1);
    }
  }

  checkFileIntegrity(filePath, config) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`❌ 文件不存在: ${filePath}`);
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      let isValid = true;

      // 检查关键元素
      if (config.criticalElements) {
        for (const element of config.criticalElements) {
          if (!content.includes(element)) {
            console.error(`🚨 缺少关键元素: ${element} in ${filePath}`);
            isValid = false;
          }
        }
      }

      // 检查必需的CSS类
      if (config.requiredClasses) {
        for (const className of config.requiredClasses) {
          if (!content.includes(className)) {
            console.error(`🚨 缺少必需CSS类: ${className} in ${filePath}`);
            isValid = false;
          }
        }
      }

      return isValid;
    } catch (error) {
      console.error(`❌ 检查文件失败 ${filePath}:`, error.message);
      return false;
    }
  }

  runIntegrityCheck() {
    console.log('🔍 开始UI完整性检查...\n');

    const checks = this.config.uiIntegrityChecks;
    let allValid = true;

    for (const [fileName, config] of Object.entries(checks)) {
      console.log(`📄 检查文件: ${fileName}`);
      const isValid = this.checkFileIntegrity(`src/views/${fileName}`, config);

      if (isValid) {
        console.log(`✅ ${fileName} 完整性正常`);
      } else {
        console.log(`❌ ${fileName} 完整性异常`);
        allValid = false;
      }
      console.log('');
    }

    if (allValid) {
      console.log('🎉 所有UI文件完整性检查通过！');
    } else {
      console.log('🚨 发现UI文件完整性问题，请检查上述错误！');
    }
    return allValid;
  }

  createIntegritySnapshot() {
    const snapshot = {};
    const checks = this.config.uiIntegrityChecks;

    for (const [fileName, config] of Object.entries(checks)) {
      const fullPath = path.join(this.projectRoot, 'src/views', fileName);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        snapshot[fileName] = {
          checksum: crypto.createHash('sha256').update(content).digest('hex'),
          size: content.length,
          lastModified: fs.statSync(fullPath).mtime.toISOString()
        };
      }
    }

    const snapshotPath = path.join(this.projectRoot, '.ui-snapshot.json');
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    console.log('📸 已创建UI完整性快照');
  }
}

// CLI接口 - 简单的方式检查是否直接运行
if (process.argv.length > 2) {
  const checker = new UIIntegrityChecker();
  const command = process.argv[2];

  switch (command) {
    case 'check':
      const result = checker.runIntegrityCheck();
      process.exit(result ? 0 : 1);
      break;
    case 'snapshot':
      checker.createIntegritySnapshot();
      break;
    default:
      console.log('用法:');
      console.log('  node ui-integrity-check.js check    - 检查UI完整性');
      console.log('  node ui-integrity-check.js snapshot - 创建完整性快照');
  }
}

export default UIIntegrityChecker;