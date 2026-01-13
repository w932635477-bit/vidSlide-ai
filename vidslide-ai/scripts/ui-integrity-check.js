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
      const fileName = path.basename(filePath);
      let isValid = true;

      // 检查关键元素 (HTML/Vue templates)
      if (config.criticalElements) {
        for (const element of config.criticalElements) {
          if (!content.includes(element)) {
            console.error(`🚨 缺少关键元素: ${element} in ${fileName}`);
            isValid = false;
          }
        }
      }

      // 检查必需的CSS类
      if (config.requiredClasses) {
        for (const className of config.requiredClasses) {
          if (!content.includes(className)) {
            console.error(`🚨 缺少必需CSS类: ${className} in ${fileName}`);
            isValid = false;
          }
        }
      }

      // 检查必需内容
      if (config.requiredContent) {
        for (const contentStr of config.requiredContent) {
          if (!content.includes(contentStr)) {
            console.error(`🚨 缺少必需内容: "${contentStr}" in ${fileName}`);
            isValid = false;
          }
        }
      }

      // 检查必需导入 (JavaScript/TypeScript files)
      if (config.requiredImports) {
        for (const importStr of config.requiredImports) {
          if (!content.includes(importStr)) {
            console.error(`🚨 缺少必需导入: ${importStr} in ${fileName}`);
            isValid = false;
          }
        }
      }

      // 检查关键CSS规则
      if (config.criticalRules) {
        for (const rule of config.criticalRules) {
          if (!content.includes(rule)) {
            console.error(`🚨 缺少关键CSS规则: ${rule} in ${fileName}`);
            isValid = false;
          }
        }
      }

      // 额外验证规则
      if (!this.runExtraValidations(fileName, content, config)) {
        isValid = false;
      }

      return isValid;
    } catch (error) {
      console.error(`❌ 检查文件失败 ${filePath}:`, error.message);
      return false;
    }
  }

  runExtraValidations(fileName, content, config) {
    let isValid = true;

    // Vue文件验证
    if (fileName.endsWith('.vue')) {
      if (config.mustHaveTemplate !== false && !content.includes('<template>')) {
        console.error(`🚨 Vue文件缺少template: ${fileName}`);
        isValid = false;
      }
      if (config.mustHaveScript !== false && !content.includes('<script')) {
        console.error(`🚨 Vue文件缺少script: ${fileName}`);
        isValid = false;
      }

      // 检查禁止模式
      if (config.forbiddenPatterns) {
        for (const pattern of config.forbiddenPatterns) {
          if (content.includes(pattern)) {
            console.error(`🚨 发现禁止模式: ${pattern} in ${fileName}`);
            isValid = false;
          }
        }
      }
    }

    // CSS文件验证
    if (fileName.endsWith('.css')) {
      if (config.mustHaveValidSyntax && !this.isValidCSS(content)) {
        console.error(`🚨 CSS语法无效: ${fileName}`);
        isValid = false;
      }

      if (config.maxLineLength) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].length > config.maxLineLength) {
            console.error(`🚨 CSS行长度超限 (${lines[i].length} > ${config.maxLineLength}): ${fileName}:${i + 1}`);
            isValid = false;
          }
        }
      }
    }

    // JavaScript文件验证
    if (fileName.endsWith('.js')) {
      if (config.forbiddenGlobals) {
        for (const global of config.forbiddenGlobals) {
          if (content.includes(global + ' ')) {
            console.error(`🚨 发现禁止全局变量: ${global} in ${fileName}`);
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  isValidCSS(content) {
    // 基本的CSS语法检查
    try {
      // 检查括号匹配
      let braceCount = 0;
      for (const char of content) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return false;
      }
      return braceCount === 0;
    } catch {
      return false;
    }
  }

  runIntegrityCheck() {
    console.log('🔍 开始UI完整性检查...\n');

    const checks = this.config.uiIntegrityChecks;
    let allValid = true;

    for (const [fileName, config] of Object.entries(checks)) {
      console.log(`📄 检查文件: ${fileName}`);

      // fileName已经是完整路径
      const isValid = this.checkFileIntegrity(fileName, config);

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