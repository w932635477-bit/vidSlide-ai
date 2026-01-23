import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * CacheManager - 缓存管理器
 *
 * 职责：
 * 1. 缓存素材生成结果
 * 2. 避免重复生成
 * 3. 管理缓存生命周期
 */
class CacheManager {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache');
    this.maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000; // 7天
    this.maxSize = options.maxSize || 1024 * 1024 * 1024; // 1GB

    // 确保缓存目录存在
    this.ensureCacheDir();
  }

  /**
   * 确保缓存目录存在
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成缓存键
   * @param {string} prompt - 提示词
   * @param {Object} options - 选项
   * @returns {string} 缓存键
   */
  generateKey(prompt, options = {}) {
    const data = JSON.stringify({ prompt, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存数据
   */
  get(key) {
    const cachePath = path.join(this.cacheDir, `${key}.json`);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    try {
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

      // 检查是否过期
      if (Date.now() - data.timestamp > this.maxAge) {
        this.delete(key);
        return null;
      }

      return data.value;

    } catch (error) {
      console.error(`读取缓存失败: ${key}`, error.message);
      return null;
    }
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   */
  set(key, value) {
    const cachePath = path.join(this.cacheDir, `${key}.json`);

    const data = {
      key: key,
      value: value,
      timestamp: Date.now()
    };

    try {
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`写入缓存失败: ${key}`, error.message);
    }
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    const cachePath = path.join(this.cacheDir, `${key}.json`);

    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    }
  }

  /**
   * 获取缓存统计
   * @returns {Object}
   */
  getStats() {
    if (!fs.existsSync(this.cacheDir)) {
      return {
        count: 0,
        size: 0
      };
    }

    const files = fs.readdirSync(this.cacheDir);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    return {
      count: files.length,
      size: totalSize,
      sizeInMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    if (!fs.existsSync(this.cacheDir)) {
      return;
    }

    const files = fs.readdirSync(this.cacheDir);
    let cleaned = 0;

    for (const file of files) {
      const filePath = path.join(this.cacheDir, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (Date.now() - data.timestamp > this.maxAge) {
          fs.unlinkSync(filePath);
          cleaned++;
        }

      } catch (error) {
        // 删除损坏的缓存文件
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }

    console.log(`清理了 ${cleaned} 个过期缓存`);
  }
}

export default CacheManager;
