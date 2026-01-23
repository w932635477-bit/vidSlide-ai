import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * DataManager - 数据管理器
 *
 * 职责：
 * 1. 内存存储（Map）
 * 2. 文件持久化
 * 3. 锁机制（防止并发冲突）
 * 4. 数据访问接口
 */
class DataManager {
  constructor(options = {}) {
    this.storage = new Map();
    this.locks = new Map();
    this.dataDir = options.dataDir || path.join(process.cwd(), 'data', 'agents');

    // 确保数据目录存在
    this.ensureDataDir();
  }

  /**
   * 确保数据目录存在
   */
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * 存储数据
   * @param {string} key - 数据键
   * @param {any} value - 数据值
   * @param {Object} options - 选项
   * @param {boolean} options.persist - 是否持久化到文件
   * @param {Object} options.metadata - 元数据
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    // 获取锁
    await this.acquireLock(key);

    try {
      // 存储到内存
      this.storage.set(key, {
        value: value,
        timestamp: Date.now(),
        metadata: options.metadata || {}
      });

      // 如果需要持久化
      if (options.persist) {
        const filePath = this.getFilePath(key);
        const data = {
          value: value,
          timestamp: Date.now(),
          metadata: options.metadata || {}
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      }

    } finally {
      this.releaseLock(key);
    }
  }

  /**
   * 获取数据
   * @param {string} key - 数据键
   * @returns {Promise<any>} 数据值
   */
  async get(key) {
    const data = this.storage.get(key);

    if (!data) {
      // 尝试从文件加载
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(content);

          // 加载到内存
          this.storage.set(key, parsed);

          return parsed.value;
        } catch (error) {
          console.error(`Failed to load data from file: ${filePath}`, error);
          return null;
        }
      }
      return null;
    }

    return data.value;
  }

  /**
   * 获取数据及元数据
   * @param {string} key - 数据键
   * @returns {Promise<Object>} 包含value、timestamp、metadata的对象
   */
  async getWithMetadata(key) {
    const data = this.storage.get(key);

    if (!data) {
      // 尝试从文件加载
      const filePath = this.getFilePath(key);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(content);

          // 加载到内存
          this.storage.set(key, parsed);

          return parsed;
        } catch (error) {
          console.error(`Failed to load data from file: ${filePath}`, error);
          return null;
        }
      }
      return null;
    }

    return data;
  }

  /**
   * 删除数据
   * @param {string} key - 数据键
   * @param {Object} options - 选项
   * @param {boolean} options.deleteFile - 是否删除文件
   * @returns {Promise<boolean>} 是否成功删除
   */
  async delete(key, options = {}) {
    await this.acquireLock(key);

    try {
      // 从内存删除
      const deleted = this.storage.delete(key);

      // 如果需要删除文件
      if (options.deleteFile) {
        const filePath = this.getFilePath(key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      return deleted;
    } finally {
      this.releaseLock(key);
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 数据键
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (this.storage.has(key)) {
      return true;
    }

    // 检查文件是否存在
    const filePath = this.getFilePath(key);
    return fs.existsSync(filePath);
  }

  /**
   * 清空所有数据
   * @param {Object} options - 选项
   * @param {boolean} options.clearFiles - 是否清空文件
   * @returns {Promise<void>}
   */
  async clear(options = {}) {
    // 清空内存
    this.storage.clear();

    // 如果需要清空文件
    if (options.clearFiles) {
      const files = fs.readdirSync(this.dataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.dataDir, file));
        }
      }
    }
  }

  /**
   * 获取所有键
   * @returns {Promise<string[]>}
   */
  async keys() {
    const memoryKeys = Array.from(this.storage.keys());

    // 获取文件中的键
    const files = fs.readdirSync(this.dataDir);
    const fileKeys = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));

    // 合并并去重
    return [...new Set([...memoryKeys, ...fileKeys])];
  }

  /**
   * 获取数据数量
   * @returns {Promise<number>}
   */
  async size() {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * 获取锁
   * @param {string} key - 锁键
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<void>}
   */
  async acquireLock(key, timeout = 30000) {
    const startTime = Date.now();

    while (this.locks.get(key)) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Lock timeout for key: ${key}`);
      }
      await this.sleep(100);
    }

    this.locks.set(key, {
      acquiredAt: Date.now(),
      timeout: timeout
    });
  }

  /**
   * 释放锁
   * @param {string} key - 锁键
   */
  releaseLock(key) {
    this.locks.delete(key);
  }

  /**
   * 检查锁是否存在
   * @param {string} key - 锁键
   * @returns {boolean}
   */
  isLocked(key) {
    return this.locks.has(key);
  }

  /**
   * 获取文件路径
   * @param {string} key - 数据键
   * @returns {string}
   */
  getFilePath(key) {
    // 清理键名，确保是有效的文件名
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.dataDir, `${safeKey}.json`);
  }

  /**
   * 休眠
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 导出所有数据
   * @returns {Promise<Object>}
   */
  async exportAll() {
    const keys = await this.keys();
    const data = {};

    for (const key of keys) {
      data[key] = await this.get(key);
    }

    return data;
  }

  /**
   * 导入数据
   * @param {Object} data - 数据对象
   * @param {Object} options - 选项
   * @returns {Promise<void>}
   */
  async importData(data, options = {}) {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value, options);
    }
  }

  /**
   * 获取统计信息
   * @returns {Promise<Object>}
   */
  async getStats() {
    const keys = await this.keys();
    const memorySize = this.storage.size;
    const fileCount = fs.readdirSync(this.dataDir)
      .filter(file => file.endsWith('.json')).length;

    return {
      totalKeys: keys.length,
      memoryKeys: memorySize,
      fileKeys: fileCount,
      lockedKeys: this.locks.size,
      dataDir: this.dataDir
    };
  }
}

export default DataManager;
