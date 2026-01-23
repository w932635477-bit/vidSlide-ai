import CacheService from '../services/CacheService.js';

/**
 * CacheManager - 缓存管理器
 *
 * 职责：
 * 1. 基于CacheService的封装
 * 2. 支持TTL（过期时间）
 * 3. 自动清理过期缓存
 * 4. 缓存统计
 */
class CacheManager {
  constructor(options = {}) {
    this.cacheService = new CacheService();
    this.cache = new Map();
    this.ttlMap = new Map(); // 存储过期时间
    this.defaultTTL = options.defaultTTL || 24 * 60 * 60 * 1000; // 默认24小时
    this.cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 默认1小时清理一次

    // 启动自动清理
    this.startAutoCleanup();

    // 统计信息
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expirations: 0
    };
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {Promise<any>}
   */
  async get(key) {
    // 检查是否过期
    if (this.isExpired(key)) {
      await this.delete(key);
      this.stats.expirations++;
      this.stats.misses++;
      return null;
    }

    // 先从内存缓存获取
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }

    // 尝试从CacheService获取
    try {
      const value = await this.cacheService.get(key);
      if (value !== null && value !== undefined) {
        // 加载到内存缓存
        this.cache.set(key, value);
        this.stats.hits++;
        return value;
      }
    } catch (error) {
      console.error(`Failed to get cache: ${key}`, error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（毫秒），默认使用defaultTTL
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = this.defaultTTL) {
    // 存储到内存缓存
    this.cache.set(key, value);

    // 设置过期时间
    if (ttl > 0) {
      this.ttlMap.set(key, Date.now() + ttl);
    }

    // 存储到CacheService
    try {
      await this.cacheService.set(key, value);
      this.stats.sets++;
    } catch (error) {
      console.error(`Failed to set cache: ${key}`, error);
    }
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    // 从内存删除
    const deleted = this.cache.delete(key);
    this.ttlMap.delete(key);

    // 从CacheService删除
    try {
      await this.cacheService.delete(key);
      if (deleted) {
        this.stats.deletes++;
      }
    } catch (error) {
      console.error(`Failed to delete cache: ${key}`, error);
    }

    return deleted;
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>}
   */
  async has(key) {
    // 检查是否过期
    if (this.isExpired(key)) {
      await this.delete(key);
      return false;
    }

    // 检查内存缓存
    if (this.cache.has(key)) {
      return true;
    }

    // 检查CacheService
    try {
      const value = await this.cacheService.get(key);
      return value !== null && value !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清空缓存
   * @param {string} pattern - 匹配模式（可选）
   * @returns {Promise<void>}
   */
  async clear(pattern = null) {
    if (pattern) {
      // 清空匹配的缓存
      const regex = new RegExp(pattern);
      const keysToDelete = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        await this.delete(key);
      }
    } else {
      // 清空所有缓存
      this.cache.clear();
      this.ttlMap.clear();

      try {
        await this.cacheService.clear();
      } catch (error) {
        console.error('Failed to clear cache service', error);
      }
    }
  }

  /**
   * 获取所有键
   * @returns {Promise<string[]>}
   */
  async keys() {
    const memoryKeys = Array.from(this.cache.keys());

    // 获取CacheService的键
    try {
      const serviceKeys = await this.cacheService.keys();
      // 合并并去重
      return [...new Set([...memoryKeys, ...serviceKeys])];
    } catch (error) {
      return memoryKeys;
    }
  }

  /**
   * 获取缓存大小
   * @returns {Promise<number>}
   */
  async size() {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * 检查是否过期
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  isExpired(key) {
    const expireTime = this.ttlMap.get(key);
    if (!expireTime) {
      return false;
    }
    return Date.now() > expireTime;
  }

  /**
   * 获取剩余TTL
   * @param {string} key - 缓存键
   * @returns {number} 剩余毫秒数，-1表示永不过期，-2表示不存在
   */
  getTTL(key) {
    if (!this.cache.has(key)) {
      return -2;
    }

    const expireTime = this.ttlMap.get(key);
    if (!expireTime) {
      return -1; // 永不过期
    }

    const remaining = expireTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * 更新TTL
   * @param {string} key - 缓存键
   * @param {number} ttl - 新的过期时间（毫秒）
   * @returns {boolean}
   */
  updateTTL(key, ttl) {
    if (!this.cache.has(key)) {
      return false;
    }

    if (ttl > 0) {
      this.ttlMap.set(key, Date.now() + ttl);
    } else {
      this.ttlMap.delete(key);
    }

    return true;
  }

  /**
   * 清理过期缓存
   * @returns {number} 清理的数量
   */
  async cleanupExpired() {
    let count = 0;
    const keysToDelete = [];

    for (const [key, expireTime] of this.ttlMap.entries()) {
      if (Date.now() > expireTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
      count++;
      this.stats.expirations++;
    }

    return count;
  }

  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.cleanupTimer = setInterval(async () => {
      const count = await this.cleanupExpired();
      if (count > 0) {
        console.log(`Cleaned up ${count} expired cache entries`);
      }
    }, this.cleanupInterval);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      expiredKeys: Array.from(this.ttlMap.entries())
        .filter(([_, expireTime]) => Date.now() > expireTime)
        .length
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expirations: 0
    };
  }

  /**
   * 导出缓存数据
   * @returns {Promise<Object>}
   */
  async exportData() {
    const data = {};
    const keys = await this.keys();

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        data[key] = {
          value: value,
          ttl: this.getTTL(key)
        };
      }
    }

    return data;
  }

  /**
   * 导入缓存数据
   * @param {Object} data - 数据对象
   * @returns {Promise<void>}
   */
  async importData(data) {
    for (const [key, item] of Object.entries(data)) {
      const ttl = item.ttl > 0 ? item.ttl : this.defaultTTL;
      await this.set(key, item.value, ttl);
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.stopAutoCleanup();
    this.cache.clear();
    this.ttlMap.clear();
  }
}

export default CacheManager;
