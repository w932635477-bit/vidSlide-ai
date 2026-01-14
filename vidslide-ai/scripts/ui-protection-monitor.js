#!/usr/bin/env node

/**
 * VidSlide AI - UI保护监控系统
 * 实时监控UI文件修改并自动备份
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UIProtectionMonitor {
  constructor() {
    this.protectedFiles = [
      'src/views/HomeView.vue',
      'src/views/VideoEditorView.vue',
      'src/views/WorkspaceView.vue'
    ];

    this.backupDir = '.ui-backups';
    this.checkInterval = 5000; // 5秒检查一次（更频繁）
    this.lastModified = new Map();
    this.monitoring = false;
    this.alertOnModification = true; // 检测到修改时发出警报
    this.autoRecover = false; // 自动恢复（默认关闭，需要手动确认）
  }

  /**
   * 初始化监控系统
   */
  async initialize() {
    console.log('🛡️ 初始化UI保护监控系统...');

    // 确保备份目录存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('✅ 创建备份目录:', this.backupDir);
    }

    // 记录初始文件状态
    await this.recordInitialState();

    console.log('✅ UI保护监控系统初始化完成');
    console.log('📊 受保护文件数量:', this.protectedFiles.length);
    console.log('⏰ 检查间隔:', this.checkInterval / 1000, '秒');
  }

  /**
   * 记录初始文件状态
   */
  async recordInitialState() {
    for (const filePath of this.protectedFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          this.lastModified.set(filePath, stats.mtime.getTime());
          console.log('📝 记录文件状态:', filePath);
        }
      } catch (error) {
        console.warn('⚠️ 无法记录文件状态:', filePath, error.message);
      }
    }
  }

  /**
   * 开始监控
   */
  startMonitoring() {
    if (this.monitoring) {
      console.log('⚠️ 监控已在运行中');
      return;
    }

    this.monitoring = true;
    console.log('🔍 开始UI文件监控...');
    console.log(`📊 监控间隔: ${this.checkInterval / 1000}秒`);
    console.log('💡 按 Ctrl+C 停止监控');

    this.intervalId = setInterval(async () => {
      try {
        await this.checkFiles();
      } catch (error) {
        console.error('❌ 检查文件时出错:', error.message);
      }
    }, this.checkInterval);

    // 定期报告状态
    this.statusIntervalId = setInterval(() => {
      console.log(`🔄 UI监控运行中... (${new Date().toLocaleTimeString()})`);
    }, 60000); // 每分钟报告一次

    // 监听进程退出事件
    process.on('SIGINT', () => {
      console.log('\n🛑 收到停止信号，正在停止监控...');
      this.stopMonitoring();
      console.log('✅ UI监控已停止');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 收到终止信号，正在停止监控...');
      this.stopMonitoring();
      console.log('✅ UI监控已停止');
      process.exit(0);
    });
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.monitoring) return;

    this.monitoring = false;
    clearInterval(this.intervalId);
    if (this.statusIntervalId) {
      clearInterval(this.statusIntervalId);
    }
    console.log('🛑 UI文件监控已停止');
  }

  /**
   * 检查文件变化
   */
  async checkFiles() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const filePath of this.protectedFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
          console.warn('⚠️ 受保护文件不存在:', filePath);
          continue;
        }

        const stats = fs.statSync(fullPath);
        const currentModified = stats.mtime.getTime();
        const lastModified = this.lastModified.get(filePath);

        if (lastModified && currentModified > lastModified) {
          // 文件被修改，创建备份
          await this.createBackup(filePath, timestamp);
          this.lastModified.set(filePath, currentModified);

          console.log('🚨 检测到UI文件修改:', filePath);
          console.log('💾 已自动创建备份:', `${filePath}.${timestamp}.backup`);
        }

      } catch (error) {
        console.error('❌ 检查文件失败:', filePath, error.message);
      }
    }
  }

  /**
   * 创建文件备份
   */
  async createBackup(filePath, timestamp) {
    try {
      const sourcePath = path.join(process.cwd(), filePath);
      const backupFileName = `${path.basename(filePath)}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // 读取原文件内容
      const content = fs.readFileSync(sourcePath, 'utf8');

      // 写入备份文件
      fs.writeFileSync(backupPath, content, 'utf8');

      console.log('✅ 备份创建成功:', backupPath);

    } catch (error) {
      console.error('❌ 创建备份失败:', filePath, error.message);
    }
  }

  /**
   * 验证UI文件完整性
   */
  async validateIntegrity() {
    console.log('🔍 开始UI文件完整性验证...');

    const results = {
      total: this.protectedFiles.length,
      valid: 0,
      invalid: 0,
      missing: 0,
      errors: []
    };

    for (const filePath of this.protectedFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);

        if (!fs.existsSync(fullPath)) {
          results.missing++;
          results.errors.push({
            file: filePath,
            type: 'missing',
            message: '文件不存在'
          });
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const issues = this.checkFileIntegrity(filePath, content);

        if (issues.length === 0) {
          results.valid++;
          console.log('✅ 文件完整:', filePath);
        } else {
          results.invalid++;
          results.errors.push({
            file: filePath,
            type: 'integrity',
            issues: issues
          });
          console.log('❌ 文件不完整:', filePath, `(${issues.length}个问题)`);
        }

      } catch (error) {
        results.invalid++;
        results.errors.push({
          file: filePath,
          type: 'error',
          message: error.message
        });
        console.error('❌ 验证失败:', filePath, error.message);
      }
    }

    // 输出验证结果
    console.log('\n📊 UI完整性验证结果:');
    console.log('📁 总文件数:', results.total);
    console.log('✅ 完整文件:', results.valid);
    console.log('❌ 有问题的文件:', results.invalid);
    console.log('🔍 缺失文件:', results.missing);

    if (results.errors.length > 0) {
      console.log('\n⚠️ 发现的问题:');
      results.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.message || error.issues?.length + '个完整性问题'}`);
      });
    }

    return results;
  }

  /**
   * 检查单个文件的完整性
   */
  checkFileIntegrity(filePath, content) {
    const issues = [];

    // 检查关键元素是否存在
    const criticalElements = {
      'VideoEditorView.vue': [
        'title-bar',
        'workspace',
        'toolbar',
        'main-canvas',
        'properties-panel',
        'timeline'
      ]
    };

    const fileElements = criticalElements[path.basename(filePath)];
    if (fileElements) {
      for (const element of fileElements) {
        if (!content.includes(element)) {
          issues.push(`缺少关键元素: ${element}`);
        }
      }
    }

    // 检查关键CSS类
    const criticalClasses = {
      'VideoEditorView.vue': [
        '.title-bar',
        '.workspace',
        '.toolbar',
        '.main-canvas',
        '.properties-panel',
        '.timeline'
      ]
    };

    const fileClasses = criticalClasses[path.basename(filePath)];
    if (fileClasses) {
      for (const className of fileClasses) {
        if (!content.includes(className)) {
          issues.push(`缺少关键CSS类: ${className}`);
        }
      }
    }

    return issues;
  }

  /**
   * 从备份恢复文件
   */
  async restoreFromBackup(filePath, backupTimestamp) {
    try {
      const backupFileName = `${path.basename(filePath)}.${backupTimestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        throw new Error(`备份文件不存在: ${backupPath}`);
      }

      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const targetPath = path.join(process.cwd(), filePath);

      // 创建当前文件的备份（以防万一）
      const currentBackupName = `${path.basename(filePath)}.${new Date().toISOString().replace(/[:.]/g, '-')}.pre-restore.backup`;
      const currentBackupPath = path.join(this.backupDir, currentBackupName);

      if (fs.existsSync(targetPath)) {
        const currentContent = fs.readFileSync(targetPath, 'utf8');
        fs.writeFileSync(currentBackupPath, currentContent, 'utf8');
        console.log('💾 创建恢复前备份:', currentBackupName);
      }

      // 恢复文件
      fs.writeFileSync(targetPath, backupContent, 'utf8');
      console.log('✅ 文件恢复成功:', filePath);
      console.log('📁 使用备份:', backupFileName);

    } catch (error) {
      console.error('❌ 文件恢复失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取备份列表
   */
  getBackupList(filePath = null) {
    try {
      const backups = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.backup'))
        .filter(file => !filePath || file.startsWith(path.basename(filePath)))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(this.backupDir, a));
          const statB = fs.statSync(path.join(this.backupDir, b));
          return statB.mtime - statA.mtime; // 最新优先
        });

      return backups;
    } catch (error) {
      console.error('❌ 获取备份列表失败:', error.message);
      return [];
    }
  }
}

// CLI接口
async function main() {
  const monitor = new UIProtectionMonitor();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await monitor.initialize();
      monitor.startMonitoring();
      break;

    case 'check':
      await monitor.initialize();
      const results = await monitor.validateIntegrity();
      process.exit(results.invalid > 0 ? 1 : 0);
      break;

    case 'restore':
      const filePath = process.argv[3];
      const backupTimestamp = process.argv[4];

      if (!filePath || !backupTimestamp) {
        console.error('用法: node ui-protection-monitor.js restore <filePath> <backupTimestamp>');
        process.exit(1);
      }

      await monitor.initialize();
      await monitor.restoreFromBackup(filePath, backupTimestamp);
      break;

    case 'list':
      const targetFile = process.argv[3];
      const backups = monitor.getBackupList(targetFile);
      console.log('📋 备份文件列表:');
      backups.forEach(backup => {
        const stat = fs.statSync(path.join(monitor.backupDir, backup));
        console.log(`  ${backup} (${stat.mtime.toLocaleString()})`);
      });
      break;

    default:
      console.log('🛡️ VidSlide AI UI保护监控系统');
      console.log('');
      console.log('用法:');
      console.log('  node ui-protection-monitor.js start    # 开始监控');
      console.log('  node ui-protection-monitor.js check    # 完整性检查');
      console.log('  node ui-protection-monitor.js restore <file> <timestamp>  # 从备份恢复');
      console.log('  node ui-protection-monitor.js list [file]  # 列出备份');
      break;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default UIProtectionMonitor;