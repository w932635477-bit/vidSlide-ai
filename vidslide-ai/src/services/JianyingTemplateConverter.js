/**
 * JianyingTemplateConverter - 模板转换器
 *
 * 将VidSlide AI的20个模板转换为剪映兼容格式
 * 包含预设的剪映风格模板映射
 */

import JianyingExporter from './JianyingExporter.js'
import TemplateArchitecture from '../utils/TemplateArchitecture.js'

class JianyingTemplateConverter {
  constructor() {
    this.exporter = JianyingExporter

    // 剪映预设模板映射 - 将VidSlide模板映射到剪映风格
    this.jianyingPresets = {
      // 抖音营销 -> 剪映"热门营销"风格
      'douyin-marketing': {
        jianyingStyle: 'hot-marketing',
        textPresets: [
          { position: 'top', fontSize: 72, color: '#FFFFFF', bold: true },
          { position: 'center', fontSize: 48, color: '#FFD700' },
          { position: 'bottom', fontSize: 36, color: '#FFFFFF' }
        ],
        animations: ['fade-in', 'scale-up', 'slide-left'],
        filters: ['vibrant', 'contrast-boost'],
        music: 'upbeat'
      },

      // 流量获客 -> 剪映"商务科技"风格
      'traffic-acquisition': {
        jianyingStyle: 'business-tech',
        textPresets: [
          { position: 'top', fontSize: 64, color: '#2DD4BF', bold: true },
          { position: 'center', fontSize: 96, color: '#FFFFFF' },
          { position: 'bottom', fontSize: 32, color: '#94A3B8' }
        ],
        animations: ['typewriter', 'number-count', 'progress-bar'],
        filters: ['cool-tone', 'tech-glow'],
        music: 'corporate'
      },

      // 投放效果 -> 剪映"数据展示"风格
      'ad-performance': {
        jianyingStyle: 'data-dashboard',
        textPresets: [
          { position: 'top-left', fontSize: 48, color: '#A78BFA' },
          { position: 'center', fontSize: 120, color: '#FFD700', bold: true },
          { position: 'bottom', fontSize: 36, color: '#FFFFFF' }
        ],
        animations: ['count-up', 'gauge-fill', 'chart-draw'],
        filters: ['dark-mode', 'neon-glow'],
        music: 'electronic'
      },

      // IP打造 -> 剪映"个人品牌"风格
      'personal-ip': {
        jianyingStyle: 'personal-brand',
        textPresets: [
          { position: 'center-top', fontSize: 56, color: '#FFFFFF', bold: true },
          { position: 'center', fontSize: 72, color: '#B84E8C' },
          { position: 'bottom', fontSize: 32, color: '#FFD700' }
        ],
        animations: ['spotlight', 'glow-pulse', 'tag-pop'],
        filters: ['glamour', 'soft-focus'],
        music: 'inspiring'
      },

      // 粉丝互动 -> 剪映"互动引导"风格
      'fan-engagement': {
        jianyingStyle: 'engagement',
        textPresets: [
          { position: 'top', fontSize: 64, color: '#FFFFFF', bold: true },
          { position: 'center', fontSize: 48, color: '#FF6B6B' },
          { position: 'bottom', fontSize: 40, color: '#FFFFFF' }
        ],
        animations: ['heart-burst', 'like-pop', 'comment-slide'],
        filters: ['warm-pink', 'soft-glow'],
        music: 'cheerful'
      },

      // 干货分享 -> 剪映"知识分享"风格
      'knowledge-sharing': {
        jianyingStyle: 'knowledge',
        textPresets: [
          { position: 'top', fontSize: 56, color: '#1D1D1F', bold: true },
          { position: 'center', fontSize: 36, color: '#333333' },
          { position: 'bottom', fontSize: 28, color: '#666666' }
        ],
        animations: ['list-reveal', 'highlight-underline', 'check-mark'],
        filters: ['clean', 'bright'],
        music: 'calm'
      },

      // 对比种草 -> 剪映"产品对比"风格
      'comparison-review': {
        jianyingStyle: 'comparison',
        textPresets: [
          { position: 'center', fontSize: 72, color: '#FF6B6B', bold: true },
          { position: 'left', fontSize: 48, color: '#FFFFFF' },
          { position: 'right', fontSize: 48, color: '#FFFFFF' }
        ],
        animations: ['split-reveal', 'vs-bounce', 'winner-highlight'],
        filters: ['vibrant', 'contrast'],
        music: 'energetic'
      },

      // 数据故事 -> 剪映"数据可视化"风格
      'data-storytelling': {
        jianyingStyle: 'data-story',
        textPresets: [
          { position: 'center', fontSize: 144, color: '#FFD700', bold: true },
          { position: 'center-bottom', fontSize: 48, color: '#FFFFFF' },
          { position: 'bottom', fontSize: 32, color: '#4ECDC4' }
        ],
        animations: ['number-roll', 'trend-arrow', 'chart-animate'],
        filters: ['dark-elegant', 'data-glow'],
        music: 'dramatic'
      },

      // 画中画 -> 剪映"演讲者"风格
      'picture-in-picture': {
        jianyingStyle: 'speaker',
        textPresets: [
          { position: 'bottom', fontSize: 36, color: '#FFFFFF' }
        ],
        animations: ['pip-slide', 'fade-in'],
        filters: ['natural'],
        music: 'background'
      },

      // 信息卡片 -> 剪映"信息展示"风格
      'info-card': {
        jianyingStyle: 'info-card',
        textPresets: [
          { position: 'top', fontSize: 48, color: '#FFD700', bold: true },
          { position: 'center', fontSize: 32, color: '#FFFFFF' }
        ],
        animations: ['card-flip', 'text-reveal'],
        filters: ['dark-overlay'],
        music: 'neutral'
      },

      // 时间线 -> 剪映"历程展示"风格
      'timeline': {
        jianyingStyle: 'timeline',
        textPresets: [
          { position: 'left', fontSize: 64, color: '#FFD700', bold: true },
          { position: 'right', fontSize: 36, color: '#FFFFFF' }
        ],
        animations: ['timeline-progress', 'node-pop', 'connector-draw'],
        filters: ['vintage', 'warm'],
        music: 'nostalgic'
      },

      // 分屏对比 -> 剪映"对比展示"风格
      'split-screen': {
        jianyingStyle: 'split',
        textPresets: [
          { position: 'left-top', fontSize: 36, color: '#FFFFFF' },
          { position: 'right-top', fontSize: 36, color: '#FFFFFF' }
        ],
        animations: ['split-slide', 'sync-reveal'],
        filters: ['balanced'],
        music: 'neutral'
      }
    }
  }

  /**
   * 初始化转换器
   */
  async initialize() {
    await TemplateArchitecture.initialize()
  }

  /**
   * 获取模板的剪映预设
   * @param {string} templateId - 模板ID
   * @returns {Object} 剪映预设配置
   */
  getJianyingPreset(templateId) {
    return this.jianyingPresets[templateId] || this.jianyingPresets['info-card']
  }

  /**
   * 转换模板为剪映草稿
   * @param {string} templateId - 模板ID
   * @param {Object} content - 内容数据
   * @param {Object} options - 转换选项
   * @returns {Object} 剪映草稿
   */
  async convertToJianying(templateId, content = {}, options = {}) {
    await this.initialize()

    const template = TemplateArchitecture.getTemplate(templateId)
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`)
    }

    const preset = this.getJianyingPreset(templateId)
    const {
      duration = 5000000, // 5秒
      texts = [],
      title = '',
      subtitle = ''
    } = content

    // 创建草稿基础
    const draft = this.exporter.createDraftBase({
      name: `${template.name} - VidSlide AI`,
      duration: duration
    })

    // 创建轨道
    const tracks = {
      video: this.exporter.createVideoTrack(0),
      text: this.exporter.createTextTrack(1),
      sticker: this.exporter.createStickerTrack(2)
    }

    // 1. 添加背景层
    this.addBackgroundLayers(draft, tracks, template, duration)

    // 2. 添加文字层
    this.addTextLayers(draft, tracks, preset, content, duration)

    // 3. 添加动画效果
    this.addAnimations(draft, preset)

    // 添加轨道
    draft.tracks.push(tracks.video)
    draft.tracks.push(tracks.text)
    draft.tracks.push(tracks.sticker)

    return draft
  }

  /**
   * 添加背景层
   */
  addBackgroundLayers(draft, tracks, template, duration) {
    if (!template.layers?.fixed) return

    template.layers.fixed.forEach((layer, index) => {
      const props = layer.properties || {}
      const bgValue = props.background || props.backgroundColor

      if (bgValue) {
        const { material, segment } = this.exporter.createShapeSegment({
          type: 'rectangle',
          startTime: 0,
          duration: duration,
          x: 0.5,
          y: 0.5,
          width: 1.0,
          height: 1.0,
          gradient: bgValue.includes('gradient') ? bgValue : null,
          color: bgValue.includes('gradient') ? '#000000' : bgValue,
          opacity: props.opacity || 1.0
        })

        draft.materials.canvases.push(material)
        tracks.video.segments.push(segment)
      }
    })
  }

  /**
   * 添加文字层
   */
  addTextLayers(draft, tracks, preset, content, duration) {
    const { title = '', subtitle = '', texts = [], keywords = [] } = content

    // 添加标题
    if (title && preset.textPresets[0]) {
      const titlePreset = preset.textPresets[0]
      const { material, segment } = this.exporter.createTextSegment({
        text: title,
        startTime: 0,
        duration: duration,
        fontSize: titlePreset.fontSize,
        color: titlePreset.color,
        bold: titlePreset.bold || false,
        x: this.positionToX(titlePreset.position),
        y: this.positionToY(titlePreset.position)
      })

      draft.materials.texts.push(material)
      tracks.text.segments.push(segment)
    }

    // 添加副标题
    if (subtitle && preset.textPresets[1]) {
      const subPreset = preset.textPresets[1]
      const { material, segment } = this.exporter.createTextSegment({
        text: subtitle,
        startTime: 500000, // 0.5秒后出现
        duration: duration - 500000,
        fontSize: subPreset.fontSize,
        color: subPreset.color,
        x: this.positionToX(subPreset.position),
        y: this.positionToY(subPreset.position)
      })

      draft.materials.texts.push(material)
      tracks.text.segments.push(segment)
    }

    // 添加关键词标签
    if (keywords.length > 0 && preset.textPresets[2]) {
      const kwPreset = preset.textPresets[2]
      keywords.slice(0, 4).forEach((kw, index) => {
        const { material, segment } = this.exporter.createTextSegment({
          text: typeof kw === 'string' ? kw : kw.text,
          startTime: 1000000 + index * 300000, // 依次出现
          duration: duration - 1000000 - index * 300000,
          fontSize: kwPreset.fontSize,
          color: kwPreset.color,
          x: 0.2 + index * 0.2,
          y: this.positionToY(kwPreset.position)
        })

        draft.materials.texts.push(material)
        tracks.text.segments.push(segment)
      })
    }
  }

  /**
   * 添加动画效果
   */
  addAnimations(draft, preset) {
    // 剪映动画效果需要在 keyframes 中定义
    // 这里添加基础的入场动画配置
    if (preset.animations) {
      draft.keyframes.texts = draft.materials.texts.map((text, index) => ({
        material_id: text.id,
        keyframes: [
          {
            time: 0,
            alpha: 0,
            scale: 0.8
          },
          {
            time: 300000, // 0.3秒
            alpha: 1,
            scale: 1.0
          }
        ]
      }))
    }
  }

  /**
   * 位置字符串转X坐标
   */
  positionToX(position) {
    const map = {
      'left': 0.2,
      'center': 0.5,
      'right': 0.8,
      'top': 0.5,
      'bottom': 0.5,
      'top-left': 0.2,
      'top-right': 0.8,
      'bottom-left': 0.2,
      'bottom-right': 0.8,
      'center-top': 0.5,
      'center-bottom': 0.5,
      'left-top': 0.2,
      'right-top': 0.8
    }
    return map[position] || 0.5
  }

  /**
   * 位置字符串转Y坐标
   */
  positionToY(position) {
    const map = {
      'top': 0.15,
      'center': 0.5,
      'bottom': 0.85,
      'left': 0.5,
      'right': 0.5,
      'top-left': 0.15,
      'top-right': 0.15,
      'bottom-left': 0.85,
      'bottom-right': 0.85,
      'center-top': 0.3,
      'center-bottom': 0.7,
      'left-top': 0.15,
      'right-top': 0.15
    }
    return map[position] || 0.5
  }

  /**
   * 导出为可下载的草稿文件
   * @param {string} templateId - 模板ID
   * @param {Object} content - 内容数据
   * @returns {Object} 导出结果
   */
  async exportDraft(templateId, content = {}) {
    const draft = await this.convertToJianying(templateId, content)

    const draftContent = JSON.stringify(draft, null, 2)
    const fileName = `${templateId}_jianying_draft.json`
    const blob = new Blob([draftContent], { type: 'application/json' })

    return {
      draft,
      content: draftContent,
      fileName,
      blob,
      downloadUrl: URL.createObjectURL(blob),
      instructions: this.exporter.getImportInstructions()
    }
  }

  /**
   * 获取所有可导出的模板列表
   */
  async getExportableTemplates() {
    await this.initialize()

    const templates = TemplateArchitecture.getAllTemplates()
    return templates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      hasJianyingPreset: !!this.jianyingPresets[t.id],
      jianyingStyle: this.jianyingPresets[t.id]?.jianyingStyle || 'default'
    }))
  }
}

export default new JianyingTemplateConverter()
