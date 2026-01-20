/**
 * 关键词分类器
 * 将关键词分类为不同类型，用于选择合适的Prompt模板
 */

class KeywordClassifier {
  constructor() {
    // 关键词类别字典
    this.categories = {
      // 抽象概念
      abstract: [
        '创新', '未来', '智能', '数字化', '转型', '变革', '突破',
        '发展', '进步', '升级', '优化', '提升', '增长', '扩展'
      ],

      // 技术相关
      technology: [
        '人工智能', 'AI', '机器学习', '深度学习', '大数据', '云计算',
        '区块链', '物联网', 'IoT', '5G', '算法', '模型', '系统', '平台',
        '技术', '科技', '互联网', '网络', '数据', '计算'
      ],

      // 商业相关
      business: [
        '营销', '销售', '市场', '品牌', '客户', '用户', '服务',
        '产品', '方案', '策略', '运营', '管理', '增长', '收益',
        '成本', '效率', '价值', '竞争力'
      ],

      // 数据相关
      data: [
        '数据', '统计', '分析', '报告', '指标', '趋势', '增长率',
        '占比', '百分比', '数量', '规模', '排名', '对比'
      ],

      // 具体事物
      concrete: [
        '产品', '设备', '工具', '软件', '硬件', '应用', '功能',
        '界面', '设计', '图标', '按钮', '菜单', '页面'
      ]
    };
  }

  /**
   * 分类关键词
   * @param {string} keyword - 关键词
   * @returns {string} 类别（abstract, technology, business, data, concrete, unknown）
   */
  classify(keyword) {
    if (!keyword || typeof keyword !== 'string') {
      return 'unknown';
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    // 遍历所有类别
    for (const [category, keywords] of Object.entries(this.categories)) {
      for (const kw of keywords) {
        if (normalizedKeyword.includes(kw.toLowerCase()) ||
            kw.toLowerCase().includes(normalizedKeyword)) {
          return category;
        }
      }
    }

    // 默认返回 unknown
    return 'unknown';
  }

  /**
   * 批量分类
   * @param {Array<string>} keywords - 关键词列表
   * @returns {Array<{keyword: string, category: string}>} 分类结果
   */
  classifyBatch(keywords) {
    return keywords.map(keyword => ({
      keyword: keyword,
      category: this.classify(keyword)
    }));
  }

  /**
   * 判断是否为抽象概念
   * @param {string} keyword - 关键词
   * @returns {boolean}
   */
  isAbstract(keyword) {
    return this.classify(keyword) === 'abstract';
  }

  /**
   * 判断是否为技术相关
   * @param {string} keyword - 关键词
   * @returns {boolean}
   */
  isTechnology(keyword) {
    return this.classify(keyword) === 'technology';
  }

  /**
   * 判断是否为数据相关
   * @param {string} keyword - 关键词
   * @returns {boolean}
   */
  isData(keyword) {
    return this.classify(keyword) === 'data';
  }

  /**
   * 添加自定义类别关键词
   * @param {string} category - 类别名称
   * @param {Array<string>} keywords - 关键词列表
   */
  addCategoryKeywords(category, keywords) {
    if (!this.categories[category]) {
      this.categories[category] = [];
    }
    this.categories[category].push(...keywords);
  }

  /**
   * 获取所有类别
   * @returns {Array<string>} 类别列表
   */
  getCategories() {
    return Object.keys(this.categories);
  }

  /**
   * 获取类别的关键词数量
   * @param {string} category - 类别名称
   * @returns {number} 关键词数量
   */
  getCategorySize(category) {
    return this.categories[category]?.length || 0;
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new KeywordClassifier();
  }
  return instance;
}

export { KeywordClassifier };
export default KeywordClassifier;
