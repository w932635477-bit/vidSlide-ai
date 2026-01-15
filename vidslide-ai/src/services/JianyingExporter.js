/**
 * JianyingExporter - 剪映草稿导出服务
 *
 * 将VidSlide AI的模板转换为剪映兼容的草稿格式
 * 用户可以直接在剪映中打开和编辑
 */

import { v4 as uuidv4 } from 'uuid'

class JianyingExporter {
  constructor() {
    // 剪映画布配置 - 竖屏短视频标准尺寸
    this.canvasConfig = {
      width: 1080,
      height: 1920,
      ratio: '9:16'
    }

    // 默认时长（微秒）
    this.defaultDuration = 5000000 // 5秒

    // 颜色映射表 - CSS颜色转剪映RGBA
    this.colorCache = new Map()
  }

  /**
   * 生成唯一ID（剪映格式）
   */
  generateId() {
    return uuidv4().replace(/-/g, '').toUpperCase()
  }

  /**
   * 生成材料ID
   */
  generateMaterialId() {
    return `${this.generateId()}-${Date.now()}`
  }

  /**
   * CSS颜色转剪映RGBA格式
   * @param {string} cssColor - CSS颜色值
   * @returns {Array} [r, g, b, a] 0-1范围
   */
  cssColorToRGBA(cssColor) {
    if (this.colorCache.has(cssColor)) {
      return this.colorCache.get(cssColor)
    }

    let r = 0, g = 0, b = 0, a = 1

    // 处理 hex 颜色
    if (cssColor.startsWith('#')) {
      const hex = cssColor.slice(1)
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255
        g = parseInt(hex[1] + hex[1], 16) / 255
        b = parseInt(hex[2] + hex[2], 16) / 255
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16) / 255
        g = parseInt(hex.slice(2, 4), 16) / 255
        b = parseInt(hex.slice(4, 6), 16) / 255
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16) / 255
        g = parseInt(hex.slice(2, 4), 16) / 255
        b = parseInt(hex.slice(4, 6), 16) / 255
        a = parseInt(hex.slice(6, 8), 16) / 255
      }
    }
    // 处理 rgb/rgba 颜色
    else if (cssColor.startsWith('rgb')) {
      const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) {
        r = parseInt(match[1]) / 255
        g = parseInt(match[2]) / 255
        b = parseInt(match[3]) / 255
        a = match[4] ? parseFloat(match[4]) : 1
      }
    }

    const result = [r, g, b, a]
    this.colorCache.set(cssColor, result)
    return result
  }

  /**
   * 解析CSS渐变为剪映渐变格式
   * @param {string} gradient - CSS渐变字符串
   * @returns {Object} 剪映渐变配置
   */
  parseGradient(gradient) {
    const result = {
      type: 'linear',
      angle: 180,
      colors: []
    }

    // 解析角度
    const angleMatch = gradient.match(/(\d+)deg/)
    if (angleMatch) {
      result.angle = parseInt(angleMatch[1])
    }

    // 解析颜色停止点
    const colorStops = gradient.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s*(\d+%)?/g)
    if (colorStops) {
      colorStops.forEach((stop, index) => {
        const colorMatch = stop.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
        const posMatch = stop.match(/(\d+)%/)

        if (colorMatch) {
          const rgba = this.cssColorToRGBA(colorMatch[1])
          const position = posMatch ? parseInt(posMatch[1]) / 100 : index / (colorStops.length - 1)

          result.colors.push({
            color: rgba,
            position: position
          })
        }
      })
    }

    return result
  }

  /**
   * 创建剪映草稿基础结构
   * @param {Object} options - 配置选项
   * @returns {Object} 草稿基础结构
   */
  createDraftBase(options = {}) {
    const {
      name = 'VidSlide AI 导出',
      width = this.canvasConfig.width,
      height = this.canvasConfig.height,
      duration = this.defaultDuration
    } = options

    return {
      // 草稿元信息
      id: this.generateId(),
      name: name,
      create_time: Date.now(),
      update_time: Date.now(),

      // 画布配置
      canvas_config: {
        width: width,
        height: height,
        ratio: `${width}:${height}`
      },

      // 轨道列表
      tracks: [],

      // 素材库
      materials: {
        videos: [],
        audios: [],
        texts: [],
        stickers: [],
        effects: [],
        transitions: [],
        canvases: [],
        sound_channel_mappings: []
      },

      // 封面设置
      cover: null,

      // 时长
      duration: duration,

      // 版本信息
      version: '5.0.0',
      platform: 'all',

      // 关键帧
      keyframes: {
        adjusts: [],
        audios: [],
        effects: [],
        filters: [],
        handwrites: [],
        stickers: [],
        texts: [],
        videos: []
      }
    }
  }

  /**
   * 创建视频轨道
   * @param {number} index - 轨道索引
   * @returns {Object} 轨道对象
   */
  createVideoTrack(index = 0) {
    return {
      id: this.generateId(),
      type: 'video',
      attribute: 0,
      flag: 0,
      segments: []
    }
  }

  /**
   * 创建文字轨道
   * @param {number} index - 轨道索引
   * @returns {Object} 轨道对象
   */
  createTextTrack(index = 0) {
    return {
      id: this.generateId(),
      type: 'text',
      attribute: 0,
      flag: 0,
      segments: []
    }
  }

  /**
   * 创建贴纸/图形轨道
   * @param {number} index - 轨道索引
   * @returns {Object} 轨道对象
   */
  createStickerTrack(index = 0) {
    return {
      id: this.generateId(),
      type: 'sticker',
      attribute: 0,
      flag: 0,
      segments: []
    }
  }

  /**
   * 创建文字片段
   * @param {Object} config - 文字配置
   * @returns {Object} 文字片段和材料
   */
  createTextSegment(config) {
    const {
      text = '',
      startTime = 0,
      duration = this.defaultDuration,
      x = 0.5,
      y = 0.5,
      fontSize = 48,
      fontFamily = 'System',
      color = '#FFFFFF',
      bold = false,
      italic = false,
      alignment = 'center',
      animation = null
    } = config

    const materialId = this.generateMaterialId()
    const segmentId = this.generateId()
    const rgba = this.cssColorToRGBA(color)

    // 文字材料
    const material = {
      id: materialId,
      type: 'text',
      content: text,
      font_id: '',
      font_name: fontFamily,
      font_path: '',
      font_size: fontSize,
      font_title: fontFamily,
      font_url: '',
      fonts: [],
      has_shadow: false,
      is_rich_text: false,
      italic: italic,
      ktv_color: '',
      letter_spacing: 0,
      line_spacing: 1.0,
      shadow_alpha: 0.8,
      shadow_angle: -45,
      shadow_color: '',
      shadow_distance: 8,
      shadow_point: { x: 0.0, y: 0.0 },
      shadow_smoothing: 1.0,
      shape_clip_x: false,
      shape_clip_y: false,
      style_name: '',
      sub_type: 0,
      text_alpha: 1.0,
      text_color: `rgba(${Math.round(rgba[0]*255)},${Math.round(rgba[1]*255)},${Math.round(rgba[2]*255)},${rgba[3]})`,
      text_preset_resource_id: '',
      text_size: fontSize,
      text_to_audio_ids: [],
      tts_auto_update: false,
      type: 'text',
      typesetting: alignment === 'center' ? 1 : (alignment === 'left' ? 0 : 2),
      underline: false,
      use_effect_default_color: false,
      words: {
        end_time: [],
        start_time: [],
        text: []
      }
    }

    // 文字片段
    const segment = {
      id: segmentId,
      material_id: materialId,
      target_timerange: {
        start: startTime,
        duration: duration
      },
      source_timerange: {
        start: 0,
        duration: duration
      },
      enable_adjust: true,
      enable_color_curves: true,
      enable_color_wheels: true,
      enable_lut: true,
      enable_smart_color_adjust: false,
      extra_material_refs: [],
      group_id: '',
      hdr_settings: null,
      intensifies_audio: false,
      is_placeholder: false,
      is_tone_modify: false,
      keyframe_refs: [],
      last_nonzero_volume: 1.0,
      render_index: 0,
      responsive_layout: {
        enable: false,
        horizontal_pos_layout: 0,
        size_layout: 0,
        target_follow: '',
        vertical_pos_layout: 0
      },
      reverse: false,
      speed: 1.0,
      template_id: '',
      template_scene: 'default',
      track_attribute: 0,
      track_render_index: 0,
      uniform_scale: {
        on: true,
        value: 1.0
      },
      visible: true,
      volume: 1.0,
      // 位置和变换
      clip: {
        alpha: 1.0,
        flip: { horizontal: false, vertical: false },
        rotation: 0,
        scale: { x: 1.0, y: 1.0 },
        transform: {
          x: (x - 0.5) * this.canvasConfig.width,
          y: (0.5 - y) * this.canvasConfig.height
        }
      }
    }

    return { material, segment }
  }

  /**
   * 创建形状/背景片段
   * @param {Object} config - 形状配置
   * @returns {Object} 形状片段和材料
   */
  createShapeSegment(config) {
    const {
      type = 'rectangle',
      startTime = 0,
      duration = this.defaultDuration,
      x = 0.5,
      y = 0.5,
      width = 1.0,
      height = 1.0,
      color = '#000000',
      opacity = 1.0,
      borderRadius = 0,
      gradient = null
    } = config

    const materialId = this.generateMaterialId()
    const segmentId = this.generateId()

    // 形状材料
    const material = {
      id: materialId,
      type: 'canvas_color',
      color: this.cssColorToRGBA(color),
      gradient: gradient ? this.parseGradient(gradient) : null
    }

    // 形状片段
    const segment = {
      id: segmentId,
      material_id: materialId,
      target_timerange: {
        start: startTime,
        duration: duration
      },
      source_timerange: {
        start: 0,
        duration: duration
      },
      enable_adjust: true,
      extra_material_refs: [],
      render_index: 0,
      visible: true,
      clip: {
        alpha: opacity,
        flip: { horizontal: false, vertical: false },
        rotation: 0,
        scale: {
          x: width,
          y: height
        },
        transform: {
          x: (x - 0.5) * this.canvasConfig.width,
          y: (0.5 - y) * this.canvasConfig.height
        }
      }
    }

    return { material, segment }
  }

  /**
   * 将VidSlide模板转换为剪映草稿
   * @param {Object} template - VidSlide模板对象
   * @param {Object} options - 转换选项
   * @returns {Object} 剪映草稿对象
   */
  convertTemplate(template, options = {}) {
    const {
      duration = this.defaultDuration,
      texts = [],
      customColors = {}
    } = options

    // 创建草稿基础
    const draft = this.createDraftBase({
      name: `${template.name} - VidSlide AI`,
      duration: duration
    })

    // 创建轨道
    const videoTrack = this.createVideoTrack(0)
    const textTrack = this.createTextTrack(1)
    const stickerTrack = this.createStickerTrack(2)

    // 处理模板层级
    if (template.layers) {
      // 处理固定层 - 背景等
      if (template.layers.fixed) {
        template.layers.fixed.forEach((layer, index) => {
          const layerResult = this.convertLayer(layer, {
            startTime: 0,
            duration: duration,
            zIndex: layer.zIndex || index
          })

          if (layerResult) {
            if (layerResult.material) {
              draft.materials.canvases.push(layerResult.material)
            }
            if (layerResult.segment) {
              videoTrack.segments.push(layerResult.segment)
            }
          }
        })
      }

      // 处理动态层 - 文字、图表等
      if (template.layers.dynamic) {
        template.layers.dynamic.forEach((layer, index) => {
          // 动态层需要根据实际内容填充
          // 这里创建占位符
          if (layer.properties?.fontSize) {
            const textConfig = {
              text: texts[index] || layer.name || '示例文字',
              startTime: 0,
              duration: duration,
              fontSize: layer.properties.fontSize,
              color: layer.properties.color || '#FFFFFF',
              x: this.parsePosition(layer.properties.position, 'x'),
              y: this.parsePosition(layer.properties.position, 'y')
            }

            const { material, segment } = this.createTextSegment(textConfig)
            draft.materials.texts.push(material)
            textTrack.segments.push(segment)
          }
        })
      }
    }

    // 添加轨道到草稿
    draft.tracks.push(videoTrack)
    draft.tracks.push(textTrack)
    draft.tracks.push(stickerTrack)

    return draft
  }

  /**
   * 转换单个图层
   * @param {Object} layer - 图层对象
   * @param {Object} options - 转换选项
   * @returns {Object} 转换结果
   */
  convertLayer(layer, options = {}) {
    const { startTime = 0, duration = this.defaultDuration } = options
    const props = layer.properties || {}

    // 处理背景层
    if (props.background || props.backgroundColor) {
      const bgValue = props.background || props.backgroundColor

      // 检查是否是渐变
      if (bgValue.includes('gradient')) {
        return this.createShapeSegment({
          type: 'rectangle',
          startTime,
          duration,
          x: 0.5,
          y: 0.5,
          width: 1.0,
          height: 1.0,
          gradient: bgValue,
          opacity: props.opacity || 1.0
        })
      } else {
        return this.createShapeSegment({
          type: 'rectangle',
          startTime,
          duration,
          x: 0.5,
          y: 0.5,
          width: 1.0,
          height: 1.0,
          color: bgValue,
          opacity: props.opacity || 1.0
        })
      }
    }

    return null
  }

  /**
   * 解析位置值
   * @param {any} position - 位置配置
   * @param {string} axis - 轴向 'x' 或 'y'
   * @returns {number} 0-1范围的位置值
   */
  parsePosition(position, axis) {
    if (!position) return 0.5

    if (typeof position === 'string') {
      const posMap = {
        'center': 0.5,
        'top': axis === 'y' ? 0.2 : 0.5,
        'bottom': axis === 'y' ? 0.8 : 0.5,
        'left': axis === 'x' ? 0.2 : 0.5,
        'right': axis === 'x' ? 0.8 : 0.5,
        'top-left': axis === 'x' ? 0.2 : 0.2,
        'top-right': axis === 'x' ? 0.8 : 0.2,
        'bottom-left': axis === 'x' ? 0.2 : 0.8,
        'bottom-right': axis === 'x' ? 0.8 : 0.8,
        'center-left': axis === 'x' ? 0.25 : 0.5,
        'center-right': axis === 'x' ? 0.75 : 0.5
      }
      return posMap[position] || 0.5
    }

    if (typeof position === 'object') {
      if (axis === 'x') {
        return position.x === 'center' ? 0.5 :
               position.x === 'left' ? 0.2 :
               position.x === 'right' ? 0.8 : 0.5
      } else {
        return position.y === 'center' ? 0.5 :
               position.y === 'top' ? 0.2 :
               position.y === 'bottom' ? 0.8 : 0.5
      }
    }

    return 0.5
  }

  /**
   * 导出为剪映草稿文件
   * @param {Object} template - VidSlide模板
   * @param {Object} options - 导出选项
   * @returns {Object} 包含草稿内容和文件信息
   */
  async exportToDraft(template, options = {}) {
    const draft = this.convertTemplate(template, options)

    // 生成草稿文件内容
    const draftContent = JSON.stringify(draft, null, 2)

    // 创建下载信息
    const fileName = `${template.name || 'vidslide'}_draft.json`
    const blob = new Blob([draftContent], { type: 'application/json' })

    return {
      draft,
      content: draftContent,
      fileName,
      blob,
      // 使用说明
      instructions: this.getImportInstructions()
    }
  }

  /**
   * 获取导入说明
   * @returns {Object} 导入说明
   */
  getImportInstructions() {
    return {
      title: '如何导入到剪映',
      steps: [
        '1. 打开剪映专业版',
        '2. 找到剪映草稿文件夹：',
        '   - Windows: C:\\Users\\用户名\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft\\',
        '   - Mac: ~/Library/Containers/com.lemon.lvpro/Data/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/',
        '3. 创建新文件夹，将下载的 draft_content.json 放入',
        '4. 重启剪映，即可在草稿列表中看到导入的项目'
      ],
      tips: [
        '建议先备份原有草稿',
        '导入后可在剪映中自由编辑',
        '支持添加更多素材和特效'
      ]
    }
  }

  /**
   * 批量导出多个模板
   * @param {Array} templates - 模板数组
   * @param {Object} options - 导出选项
   * @returns {Array} 导出结果数组
   */
  async batchExport(templates, options = {}) {
    const results = []

    for (const template of templates) {
      try {
        const result = await this.exportToDraft(template, options)
        results.push({
          success: true,
          templateId: template.id,
          templateName: template.name,
          ...result
        })
      } catch (error) {
        results.push({
          success: false,
          templateId: template.id,
          templateName: template.name,
          error: error.message
        })
      }
    }

    return results
  }
}

// 导出单例
export default new JianyingExporter()
