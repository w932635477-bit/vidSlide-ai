/**
 * PromptOptimizer - 提示词优化器
 *
 * 功能：
 * 1. 优化图片生成提示词
 * 2. 根据场景类型调整提示词
 * 3. 提高生成质量
 */
class PromptOptimizer {
  constructor() {
    this.styleKeywords = {
      educational: ['专业', '清晰', '简洁', '教育性'],
      marketing: ['吸引人', '商业', '现代', '高端'],
      entertainment: ['有趣', '生动', '活泼', '创意'],
      news: ['真实', '严肃', '新闻感', '纪实']
    };

    this.toneKeywords = {
      formal: ['正式', '专业', '严谨'],
      casual: ['轻松', '随意', '亲切'],
      professional: ['专业', '精致', '高质量'],
      humorous: ['幽默', '有趣', '轻松']
    };
  }

  /**
   * 优化提示词
   * @param {string} keyword - 关键词
   * @param {Object} context - 上下文信息
   * @returns {string} 优化后的提示词
   */
  optimize(keyword, context = {}) {
    const { intent = 'educational', tone = 'professional', style = '现代简约' } = context;

    // 基础提示词
    let prompt = keyword;

    // 添加风格关键词
    const styleWords = this.styleKeywords[intent] || this.styleKeywords.educational;
    prompt += `，${styleWords.join('、')}风格`;

    // 添加语气关键词
    const toneWords = this.toneKeywords[tone] || this.toneKeywords.professional;
    prompt += `，${toneWords.join('、')}氛围`;

    // 添加质量要求
    prompt += '，高质量，竖版构图，1080x1920';

    return prompt;
  }

  /**
   * 简化提示词（用于重试）
   * @param {string} keyword - 关键词
   * @returns {string} 简化的提示词
   */
  simplify(keyword) {
    return `${keyword}，简洁风格，纯色背景，图标化，竖版，1080x1920`;
  }

  /**
   * 为卡片优化提示词
   * @param {string} text - 卡片文本
   * @param {string} style - 卡片样式
   * @returns {string} 优化后的提示词
   */
  optimizeForCard(text, style = 'modern') {
    const styleMap = {
      modern: '现代简约',
      colorful: '色彩丰富',
      minimal: '极简主义',
      business: '商务专业'
    };

    const selectedStyle = styleMap[style] || styleMap.modern;
    return `${text}，${selectedStyle}，卡片设计，扁平化，竖版，1080x1920`;
  }

  /**
   * 为背景优化提示词
   * @param {string} keyword - 关键词
   * @param {string} mood - 氛围
   * @returns {string} 优化后的提示词
   */
  optimizeForBackground(keyword, mood = 'neutral') {
    const moodMap = {
      neutral: '中性色调',
      warm: '温暖色调',
      cool: '冷色调',
      vibrant: '鲜艳色彩'
    };

    const selectedMood = moodMap[mood] || moodMap.neutral;
    return `${keyword}，${selectedMood}，模糊背景，渐变效果，竖版，1080x1920`;
  }
}

export default PromptOptimizer;
