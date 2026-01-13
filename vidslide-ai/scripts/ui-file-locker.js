#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UIFileLocker {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.configPath = path.join(this.projectRoot, '.ui-protection.json');
    this.lockFilePath = path.join(this.projectRoot, '.ui-files-locked');
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

  lockFiles() {
    console.log('🔒 开始锁定UI文件...\n');

    const protectedFiles = this.config.protectedFiles;
    let lockedCount = 0;

    for (const filePattern of protectedFiles) {
      const files = this.expandFilePattern(filePattern);

      for (const file of files) {
        if (this.lockFile(file)) {
          lockedCount++;
        }
      }
    }

    // 创建锁定标记文件
    fs.writeFileSync(this.lockFilePath, JSON.stringify({
      lockedAt: new Date().toISOString(),
      lockedFiles: lockedCount,
      version: '1.0.0'
    }, null, 2));

    console.log(`\n✅ 已锁定 ${lockedCount} 个UI文件`);
    console.log('🔒 UI文件锁定完成 - 文件现在受到保护');
  }

  unlockFiles() {
    console.log('🔓 开始解锁UI文件...\n');

    if (!fs.existsSync(this.lockFilePath)) {
      console.log('⚠️  没有发现锁定文件');
      return;
    }

    const protectedFiles = this.config.protectedFiles;
    let unlockedCount = 0;

    for (const filePattern of protectedFiles) {
      const files = this.expandFilePattern(filePattern);

      for (const file of files) {
        if (this.unlockFile(file)) {
          unlockedCount++;
        }
      }
    }

    // 删除锁定标记文件
    fs.unlinkSync(this.lockFilePath);

    console.log(`\n✅ 已解锁 ${unlockedCount} 个UI文件`);
    console.log('🔓 UI文件解锁完成');
  }

  lockFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在，跳过: ${filePath}`);
      return false;
    }

    try {
      // 检查是否已经是只读的
      const stats = fs.statSync(fullPath);
      const isReadOnly = !(stats.mode & parseInt('200', 8)); // 检查写权限

      if (!isReadOnly) {
        // 设置为只读
        fs.chmodSync(fullPath, 0o444); // r--r--r--
        console.log(`🔒 已锁定: ${filePath}`);
        return true;
      } else {
        console.log(`ℹ️  已经锁定: ${filePath}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ 锁定失败 ${filePath}:`, error.message);
      return false;
    }
  }

  unlockFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      return false;
    }

    try {
      // 恢复写权限
      fs.chmodSync(fullPath, 0o644); // rw-r--r--
      console.log(`🔓 已解锁: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ 解锁失败 ${filePath}:`, error.message);
      return false;
    }
  }

  expandFilePattern(pattern) {
    const files = [];

    if (pattern.includes('**')) {
      // 处理通配符模式
      const baseDir = pattern.split('/')[0];
      const searchPattern = pattern.replace(baseDir + '/', '');

      const walk = (dir) => {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walk(fullPath);
          } else if (stat.isFile()) {
            const relativePath = path.relative(this.projectRoot, fullPath);
            if (this.matchesPattern(relativePath, pattern)) {
              files.push(relativePath);
            }
          }
        }
      };

      walk(path.join(this.projectRoot, baseDir));
    } else {
      // 直接文件路径
      if (fs.existsSync(path.join(this.projectRoot, pattern))) {
        files.push(pattern);
      }
    }

    return files;
  }

  matchesPattern(filePath, pattern) {
    if (pattern.includes('**')) {
      const patternParts = pattern.split('/');
      const fileParts = filePath.split('/');

      let patternIndex = 0;
      let fileIndex = 0;

      while (patternIndex < patternParts.length && fileIndex < fileParts.length) {
        if (patternParts[patternIndex] === '**') {
          // ** 匹配任意数量的目录
          patternIndex++;
          // 找到下一个匹配的模式
          if (patternIndex < patternParts.length) {
            const nextPattern = patternParts[patternIndex];
            while (fileIndex < fileParts.length && fileParts[fileIndex] !== nextPattern) {
              fileIndex++;
            }
          } else {
            return true; // ** 匹配剩余的所有
          }
        } else if (patternParts[patternIndex] === '*' || patternParts[patternIndex] === fileParts[fileIndex]) {
          patternIndex++;
          fileIndex++;
        } else {
          return false;
        }
      }

      return patternIndex === patternParts.length && fileIndex === fileParts.length;
    }

    return filePath === pattern;
  }

  getLockStatus() {
    const status = {
      isLocked: fs.existsSync(this.lockFilePath),
      lockedFiles: 0,
      totalProtectedFiles: 0
    };

    if (status.isLocked) {
      try {
        const lockData = JSON.parse(fs.readFileSync(this.lockFilePath, 'utf8'));
        status.lockedFiles = lockData.lockedFiles || 0;
        status.lockedAt = lockData.lockedAt;
      } catch (error) {
        console.error('❌ 读取锁定文件失败:', error.message);
      }
    }

    // 计算总的受保护文件数
    const protectedFiles = this.config.protectedFiles;
    for (const pattern of protectedFiles) {
      status.totalProtectedFiles += this.expandFilePattern(pattern).length;
    }

    return status;
  }
}

// CLI接口
if (process.argv.length > 2) {
  const locker = new UIFileLocker();
  const command = process.argv[2];

  switch (command) {
    case 'lock':
      locker.lockFiles();
      break;
    case 'unlock':
      locker.unlockFiles();
      break;
    case 'status':
      const status = locker.getLockStatus();
      console.log('🔍 UI文件锁定状态:');
      console.log(`锁定状态: ${status.isLocked ? '✅ 已锁定' : '❌ 未锁定'}`);
      console.log(`已锁定文件: ${status.lockedFiles}`);
      console.log(`受保护文件总数: ${status.totalProtectedFiles}`);
      if (status.lockedAt) {
        console.log(`锁定时间: ${new Date(status.lockedAt).toLocaleString()}`);
      }
      break;
    default:
      console.log('用法:');
      console.log('  node ui-file-locker.js lock    - 锁定UI文件');
      console.log('  node ui-file-locker.js unlock  - 解锁UI文件');
      console.log('  node ui-file-locker.js status  - 查看锁定状态');
  }
}

export default UIFileLocker;