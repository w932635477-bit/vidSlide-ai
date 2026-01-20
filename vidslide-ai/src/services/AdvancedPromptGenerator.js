/**
 * 高级提示词生成器
 * 生成包含详细视觉效果的豆包提示词
 *
 * 核心功能：
 * 1. 添加视觉细节（边框、圆角、阴影、发光）
 * 2. 确保风格多样性
 * 3. 针对抖音短视频优化
 */

import { getInstance as getClassifier } from './KeywordClassifier.js';

class AdvancedPromptGenerator {
  constructor() {
    this.classifier = getClassifier();

    // 视觉效果库
    this.visualEffects = {
      // 边框样式
      borders: [
        '双层边框（外层金色，内层白色）',
        '单层渐变边框（蓝紫色渐变）',
        '霓虹发光边框（青色）',
        '虚线边框（白色）',
        '金属质感边框',
        '无边框'
      ],

      // 圆角样式
      corners: [
        '圆角16px',
        '圆角24px',
        '圆角32px',
        '尖角',
        '半圆角'
      ],

      // 阴影效果
      shadows: [
        '柔和阴影（向下20px，模糊40px）',
        '强烈阴影（向下30px，模糊60px）',
        '多层阴影（3层渐变）',
        '发光阴影（蓝色光晕）',
        '无阴影'
      ],

      // 发光效果
      glows: [
        '蓝紫色发光效果',
        '金色发光效果',
        '青色霓虹发光',
        '红色强烈发光',
        '白色柔和发光',
        '无发光'
      ],

      // 背景样式
      backgrounds: [
        '纯黑背景',
        '深蓝渐变背景',
        '科技网格背景',
        '粒子效果背景',
        '深色渐变背景'
      ],

      // 构图方式
      compositions: [
        '居中构图',
        '黄金分割构图',
        '对角线构图',
        '三分法构图',
        '对称构图'
      ],

      // 质量描述
      qualities: [
        '超高清，4K画质',
        '专业摄影级别',
        '电影级渲染',
        '高质量渲染',
        '精细细节'
      ]
    };

    // 风格预设（针对不同场景）
    this.stylePresets = {
      // 科技风格
      tech: {
        colors: ['蓝紫色', '青色', '电光蓝', '科技蓝'],
        effects: ['发光', '粒子', '光束', '数字流'],
        mood: ['未来感', '科技感', '现代感', '数字化']
      },

      // 商务风格
      business: {
        colors: ['金色', '深蓝', '银灰', '商务蓝'],
        effects: ['金属质感', '渐变', '光泽', '专业感'],
        mood: ['专业', '大气', '高端', '商务']
      },

      // 数据风格
      data: {
        colors: ['青色', '绿色', '蓝色', '橙色'],
        effects: ['图表', '网格', '数据流', '可视化'],
        mood: ['清晰', '直观', '专业', '数据化']
      },

      // 强调风格
      emphasis: {
        colors: ['红色', '金色', '亮黄', '霓虹色'],
        effects: ['强烈发光', '爆炸', '闪光', '震撼'],
        mood: ['冲击力', '震撼', '强烈', '醒目']
      }
    };
  }

  /**
   * 生成高级提示词
   * @param {string} keyword - 关键词
   * @param {object} options - 选项
   * @returns {string} 优化后的提示词
   */
  generate(keyword, options = {}) {
    const {
      sceneType = 'basic',      // 场景类型：basic, emphasis, chart
      stylePreset = 'tech',     // 风格预设：tech, business, data, emphasis
      includeEffects = true,    // 是否包含视觉效果
      randomize = true          // 是否随机化样式
    } = options;

    // 1. 基础关键词
    let prompt = keyword;

    // 2. 添加风格描述
    const style = this.stylePresets[stylePreset] || this.stylePresets.tech;
    const color = this.randomPick(style.colors);
    const effect = this.randomPick(style.effects);
    const mood = this.randomPick(style.mood);

    prompt += `，${mood}，${color}主色调`;

    // 3. 添加视觉效果（这是关键！）
    if (includeEffects) {
      const border = this.randomPick(this.visualEffects.borders);
      const corner = this.randomPick(this.visualEffects.corners);
      const shadow = this.randomPick(this.visualEffects.shadows);
      const glow = this.randomPick(this.visualEffects.glows);

      prompt += `，${border}，${corner}，${shadow}，${glow}`;
    }

    // 4. 添加背景和构图
    const background = this.randomPick(this.visualEffects.backgrounds);
    const composition = this.randomPick(this.visualEffects.compositions);

    prompt += `，${background}，${composition}`;

    // 5. 添加特效
    prompt += `，${effect}`;

    // 6. 添加质量描述
    const quality = this.randomPick(this.visualEffects.qualities);
    prompt += `，${quality}`;

    // 7. 针对场景类型优化
    prompt = this.optimizeForSceneType(prompt, sceneType);

    return prompt;
  }

  /**
   * 针对场景类型优化
   */
  optimizeForSceneType(prompt, sceneType) {
    switch (sceneType) {
      case 'emphasis':
        // 强调场景：增强视觉冲击
        return prompt + '，视觉冲击力，强烈对比，醒目';

      case 'chart':
        // 图表场景：强调清晰度
        return prompt + '，清晰易读，数据可视化，专业图表';

      case 'basic':
      default:
        // 基础场景：保持简洁
        return prompt + '，简洁现代，专业设计';
    }
  }

  /**
   * 批量生成（确保多样性）
   * @param {Array<string>} keywords - 关键词列表
   * @param {object} options - 选项
   * @returns {Array<string>} 提示词列表
   */
  generateBatch(keywords, options = {}) {
    return keywords.map((keyword, index) => {
      // 为每个关键词使用不同的风格，确保多样性
      const stylePresets = ['tech', 'business', 'data', 'emphasis'];
      const stylePreset = stylePresets[index % stylePresets.length];

      return this.generate(keyword, {
        ...options,
        stylePreset,
        randomize: true
      });
    });
  }

  /**
   * 随机选择
   */
  randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 预览生成结果
   */
  preview(keyword, options = {}) {
    const prompt = this.generate(keyword, options);

    return {
      keyword,
      options,
      generatedPrompt: prompt,
      length: prompt.length
    };
  }

  /**
   * 添加自定义视觉效果
   */
  addVisualEffect(category, effect) {
    if (this.visualEffects[category]) {
      this.visualEffects[category].push(effect);
    }
  }

  /**
   * 添加自定义风格预设
   */
  addStylePreset(name, preset) {
    this.stylePresets[name] = preset;
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new AdvancedPromptGenerator();
  }
  return instance;
}

export { AdvancedPromptGenerator };
export default AdvancedPromptGenerator;
