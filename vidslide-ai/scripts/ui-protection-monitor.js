#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UIProtectionMonitor {
  constructor() {
    this.configPath = path.join(__dirname, '..', '.ui-protection.json');
    this.backupDir = path.join(__dirname, '..', '.ui-backups');
    this.checksums = new Map();
    this.loadConfig();
    this.initializeBackupDir();
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('❌ 无法加载UI保护配置文件:', error.message);
      process.exit(1);
    }
  }

  initializeBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  calculateFileChecksum(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupName = `${fileName}.${timestamp}.backup`;
    const backupPath = path.join(this.backupDir, backupName);

    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 已创建UI备份: ${backupName}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ 备份失败 ${fileName}:`, error.message);
      return null;
    }
  }

  checkFileIntegrity(filePath) {
    const config = this.config.uiIntegrityChecks[path.basename(filePath)];
    if (!config) return true;

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // 检查关键元素
      for (const element of config.criticalElements) {
        if (!content.includes(element)) {
          console.warn(`⚠️  缺少关键元素: ${element} in ${filePath}`);
          return false;
        }
      }

      // 检查必需的CSS类
      for (const className of config.requiredClasses) {
        if (!content.includes(className)) {
          console.warn(`⚠️  缺少必需CSS类: ${className} in ${filePath}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ 检查文件完整性失败 ${filePath}:`, error.message);
      return false;
    }
  }

  monitorFiles() {
    const protectedFiles = this.config.protectedFiles;

    for (const pattern of protectedFiles) {
      const files = this.globSync(pattern);
      for (const file of files) {
        const checksum = this.calculateFileChecksum(file);

        if (this.checksums.has(file)) {
          const oldChecksum = this.checksums.get(file);
          if (oldChecksum !== checksum) {
            console.log(`🔄 UI文件已修改: ${file}`);
            this.createBackup(file);

            if (!this.checkFileIntegrity(file)) {
              console.error(`🚨 UI文件完整性受损: ${file}`);
              this.restoreFromBackup(file);
            }
          }
        }

        this.checksums.set(file, checksum);
      }
    }
  }

  globSync(pattern) {
    // 简单的glob实现
    const files = [];

    const walk = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && this.matchesPattern(fullPath, pattern)) {
          files.push(fullPath);
        }
      }
    };

    walk(path.join(__dirname, '..'));
    return files;
  }

  matchesPattern(filePath, pattern) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    return relativePath.includes(pattern.replace('**/', '').replace('*.', '.').replace('/', path.sep));
  }

  restoreFromBackup(filePath) {
    const fileName = path.basename(filePath);
    const backups = fs.readdirSync(this.backupDir)
      .filter(f => f.startsWith(fileName) && f.endsWith('.backup'))
      .sort()
      .reverse();

    if (backups.length > 0) {
      const latestBackup = path.join(this.backupDir, backups[0]);
      try {
        fs.copyFileSync(latestBackup, filePath);
        console.log(`🔄 已从备份恢复: ${fileName}`);
        return true;
      } catch (error) {
        console.error(`❌ 恢复失败:`, error.message);
      }
    }

    return false;
  }

  startMonitoring() {
    console.log('🛡️  UI保护监控已启动...');

    // 初始扫描
    this.monitorFiles();

    // 定期监控
    setInterval(() => {
      this.monitorFiles();
    }, 5000); // 每5秒检查一次
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new UIProtectionMonitor();
  monitor.startMonitoring();
}

export default UIProtectionMonitor;