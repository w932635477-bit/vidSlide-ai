/**
 * SmartPromptGenerator - 智能Prompt生成器
 *
 * 功能：
 * 1. 生成高质量的AI绘图Prompt
 * 2. 针对不同类型素材优化Prompt
 */

class SmartPromptGenerator {
  constructor() {
    this.baseStyle = '3D isometric style, clean background, professional design'
    this.quality = 'high quality, detailed, 4k'
  }

  /**
   * 生成横幅Prompt
   */
  generateBannerPrompt(topic) {
    return `Create a modern banner design for "${topic}".
Style: Horizontal banner, gradient background (blue to purple),
centered text with bold typography, minimalist design.
${this.quality}, ${this.baseStyle}`
  }

  /**
   * 生成问号卡片Prompt
   */
  generateQuestionCardsPrompt(count) {
    return `Create ${count} identical cards with large question marks (?).
Style: 3D card design, white background, centered question mark,
shadow effect, arranged side by side.
${this.quality}, ${this.baseStyle}`
  }

  /**
   * 生成概念卡片Prompt
   */
  generateConceptCardPrompt(concept, conceptInfo) {
    const { description, style, color, mood } = conceptInfo

    return `Create a card design for the concept "${concept}".
Visual: ${description}
Style: ${style}, ${color}
Mood: ${mood}
Layout: Centered icon/illustration, clean white card background, subtle shadow.
${this.quality}`
  }
}

export default SmartPromptGenerator
