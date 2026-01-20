/**
 * Prompt优化器
 * 将关键词优化为完整的图像生成Prompt
 */

import { getInstance as getClassifier } from './KeywordClassifier.js';

class PromptOptimizer {
  constructor() {
    this.classifier = getClassifier();

    // Prompt模板库
    this.templates = {
      // 基础模板（80%场景）
      basic: {
        abstract: '{keyword}，科技感，光效流动，几何图形，深色背景，简约设计，蓝紫色调',
        technology: '{keyword}，未来科技，数字化，电路板纹理，蓝色光效，黑色背景，现代感',
        business: '{keyword}，商务风格，专业感，简洁大气，渐变背景，现代设计',
        data: '{keyword}，数据可视化，图表元素，科技感，深色背景，蓝色主色调',
        concrete: '{keyword}，产品展示，居中构图，简洁背景，高质量渲染，专业摄影',
        unknown: '{keyword}，科技感，蓝紫色调，简洁现代，纯色背景，居中构图，高质量'
      },

      // 强调模板（15%场景）
      emphasis: {
        abstract: '{keyword}，视觉冲击力，强烈光效，霓虹发光，纯黑背景，未来科技，震撼效果',
        technology: '{keyword}，科技爆炸，粒子特效，强烈光束，电光效果，黑色背景，高对比度',
        business: '{keyword}，商业冲击，金色光效，大气磅礴，黑色背景，高端质感',
        data: '{keyword}，数据爆炸，图表动态，强烈对比，霓虹色彩，黑色背景',
        concrete: '{keyword}，产品特写，戏剧性光效，强烈对比，黑色背景，高端质感',
        unknown: '{keyword}，视觉冲击力，未来科技，强烈光效，霓虹发光，纯黑背景，高对比度'
      },

      // 图表模板（5%场景）
      chart: {
        abstract: '{keyword}，抽象图表，几何图形，数据可视化，科技感，深色背景',
        technology: '{keyword}，技术图表，数据流，网络拓扑，蓝色光效，黑色背景',
        business: '{keyword}，商业图表，柱状图，饼图，专业设计，深色背景',
        data: '{keyword}，数据图表，统计可视化，清晰易读，科技感，深色背景',
        concrete: '{keyword}，产品数据，对比图表，清晰展示，专业设计，深色背景',
        unknown: '{keyword}，数据可视化，图表设计，科技感，简洁现代，深色背景'
      }
    };

    // 后处理规则
    this.postProcessRules = [
      // 确保有背景描述
      { pattern: /背景/, replacement: '', ensure: '纯黑背景' },
      // 确保有质量描述
      { pattern: /质量|高清|4K/, replacement: '', ensure: '高质量' },
      // 去除重复词
      { pattern: /(\S+)，.*\1/, replacement: '$1' }
    ];
  }

  /**
   * 优化关键词为Prompt
   * @param {string} keyword - 原始关键词
   * @param {object} context - 上下文信息
   * @returns {string} 优化后的Prompt
   */
  optimize(keyword, context = {}) {
    if (!keyword || typeof keyword !== 'string') {
      throw new Error('关键词不能为空');
    }

    const { sceneType = 'basic', importance = 'normal', customTemplate } = context;

    // 1. 如果提供了自定义模板，直接使用
    if (customTemplate) {
      return this.applyTemplate(customTemplate, keyword);
    }

    // 2. 分类关键词
    const category = this.classifier.classify(keyword);

    // 3. 选择模板
    const template = this.selectTemplate(sceneType, category);

    // 4. 应用模板
    let prompt = this.applyTemplate(template, keyword);

    // 5. 后处理
    prompt = this.postProcess(prompt);

    // 6. 添加通用后缀
    prompt = this.addCommonSuffix(prompt, context);

    return prompt;
  }

  /**
   * 批量优化
   * @param {Array<{keyword: string, context: object}>} requests - 请求列表
   * @returns {Array<string>} 优化后的Prompt列表
   */
  optimizeBatch(requests) {
    return requests.map(req => this.optimize(req.keyword, req.context));
  }

  /**
   * 选择模板
   * @param {string} sceneType - 场景类型
   * @param {string} category - 关键词类别
   * @returns {string} 模板字符串
   */
  selectTemplate(sceneType, category) {
    const templates = this.templates[sceneType] || this.templates.basic;
    return templates[category] || templates.unknown;
  }

  /**
   * 应用模板
   * @param {string} template - 模板字符串
   * @param {string} keyword - 关键词
   * @returns {string} 应用后的字符串
   */
  applyTemplate(template, keyword) {
    return template.replace(/{keyword}/g, keyword);
  }

  /**
   * 后处理
   * @param {string} prompt - Prompt
   * @returns {string} 处理后的Prompt
   */
  postProcess(prompt) {
    let result = prompt;

    // 应用后处理规则
    for (const rule of this.postProcessRules) {
      if (rule.ensure && !rule.pattern.test(result)) {
        result += `，${rule.ensure}`;
      }
    }

    // 去除多余的逗号和空格
    result = result.replace(/，+/g, '，').replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * 添加通用后缀
   * @param {string} prompt - Prompt
   * @param {object} context - 上下文
   * @returns {string} 添加后缀后的Prompt
   */
  addCommonSuffix(prompt, context = {}) {
    const { style, quality } = context;

    let result = prompt;

    // 添加风格
    if (style) {
      result += `，${style}风格`;
    }

    // 添加质量
    if (quality === 'high') {
      result += '，超高清，4K画质';
    }

    return result;
  }

  /**
   * 添加自定义模板
   * @param {string} sceneType - 场景类型
   * @param {string} category - 类别
   * @param {string} template - 模板字符串
   */
  addTemplate(sceneType, category, template) {
    if (!this.templates[sceneType]) {
      this.templates[sceneType] = {};
    }
    this.templates[sceneType][category] = template;
  }

  /**
   * 获取所有场景类型
   * @returns {Array<string>} 场景类型列表
   */
  getSceneTypes() {
    return Object.keys(this.templates);
  }

  /**
   * 预览优化结果
   * @param {string} keyword - 关键词
   * @param {string} sceneType - 场景类型
   * @returns {object} 预览信息
   */
  preview(keyword, sceneType = 'basic') {
    const category = this.classifier.classify(keyword);
    const template = this.selectTemplate(sceneType, category);
    const prompt = this.optimize(keyword, { sceneType });

    return {
      keyword,
      category,
      sceneType,
      template,
      optimizedPrompt: prompt
    };
  }

  /**
   * 批量预览
   * @param {Array<string>} keywords - 关键词列表
   * @param {string} sceneType - 场景类型
   * @returns {Array<object>} 预览信息列表
   */
  previewBatch(keywords, sceneType = 'basic') {
    return keywords.map(keyword => this.preview(keyword, sceneType));
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new PromptOptimizer();
  }
  return instance;
}

export { PromptOptimizer };
export default PromptOptimizer;
