/**
 * DataManager - 数据管理器（简化版，用于测试）
 *
 * 职责：
 * 1. 管理智能体之间的数据传递
 * 2. 存储中间结果
 * 3. 提供数据查询接口
 */
class DataManager {
  constructor(options = {}) {
    this.storage = new Map();
    this.metadata = new Map();
  }

  /**
   * 存储数据
   * @param {string} key - 键
   * @param {any} value - 值
   * @param {Object} meta - 元数据
   */
  set(key, value, meta = {}) {
    this.storage.set(key, value);
    this.metadata.set(key, {
      ...meta,
      timestamp: Date.now(),
      type: typeof value
    });
  }

  /**
   * 获取数据
   * @param {string} key - 键
   * @returns {any} 值
   */
  get(key) {
    return this.storage.get(key);
  }

  /**
   * 检查是否存在
   * @param {string} key - 键
   * @returns {boolean}
   */
  has(key) {
    return this.storage.has(key);
  }

  /**
   * 删除数据
   * @param {string} key - 键
   */
  delete(key) {
    this.storage.delete(key);
    this.metadata.delete(key);
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.storage.clear();
    this.metadata.clear();
  }

  /**
   * 获取所有键
   * @returns {Array<string>}
   */
  keys() {
    return Array.from(this.storage.keys());
  }

  /**
   * 获取元数据
   * @param {string} key - 键
   * @returns {Object}
   */
  getMetadata(key) {
    return this.metadata.get(key);
  }

  /**
   * 导出所有数据
   * @returns {Object}
   */
  export() {
    const data = {};
    for (const [key, value] of this.storage.entries()) {
      data[key] = {
        value: value,
        metadata: this.metadata.get(key)
      };
    }
    return data;
  }

  /**
   * 导入数据
   * @param {Object} data - 数据对象
   */
  import(data) {
    for (const [key, item] of Object.entries(data)) {
      this.storage.set(key, item.value);
      this.metadata.set(key, item.metadata);
    }
  }
}

export default DataManager;
