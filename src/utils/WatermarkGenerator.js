/**
 * VidSlide AI - 水印生成器
 * 负责生成不同用户等级的水印，并集成到导出内容中
 */

export class WatermarkGenerator {
  constructor() {
    this.userTier = this.detectUserTier()
    this.watermarkConfig = this.getWatermarkConfig()
  }

  /**
   * 检测用户等级
   * 简化为本地存储检测，实际项目中应该从用户认证系统获取
   */
  detectUserTier() {
    try {
      // 从localStorage获取用户等级 (简化实现)
      const storedTier = localStorage.getItem('vidslide-user-tier')

      // 如果没有存储的等级，默认为免费版
      if (!storedTier) {
        return 'free'
      }

      // 验证等级有效性
      const validTiers = ['free', 'premium', 'enterprise']
      return validTiers.includes(storedTier) ? storedTier : 'free'
    } catch (error) {
      console.warn('用户等级检测失败，使用免费版:', error)
      return 'free'
    }
  }

  /**
   * 设置用户等级 (用于测试或管理员设置)
   */
  setUserTier(tier) {
    const validTiers = ['free', 'premium', 'enterprise']
    if (validTiers.includes(tier)) {
      this.userTier = tier
      this.watermarkConfig = this.getWatermarkConfig()

      // 持久化存储
      try {
        localStorage.setItem('vidslide-user-tier', tier)
      } catch (error) {
        console.warn('用户等级存储失败:', error)
      }
    } else {
      console.error('无效的用户等级:', tier)
    }
  }

  /**
   * 获取水印配置
   */
  getWatermarkConfig() {
    const configs = {
      free: {
        showWatermark: true,
        text: 'VidSlide AI - 免费版',
        opacity: 0.8,
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        position: 'bottom-right',
        margin: 20
      },
      premium: {
        showWatermark: false,
        text: null,
        opacity: 0,
        color: 'transparent'
      },
      enterprise: {
        showWatermark: false,
        text: null,
        opacity: 0,
        color: 'transparent'
      }
    }

    return configs[this.userTier] || configs.free
  }

  /**
   * 获取当前水印配置
   */
  getCurrentConfig() {
    return {
      userTier: this.userTier,
      ...this.watermarkConfig
    }
  }

  /**
   * 在Canvas上应用水印
   * @param {HTMLCanvasElement} canvas - 目标画布
   * @param {Object} options - 水印选项 (可选，用于覆盖默认配置)
   */
  applyToCanvas(canvas, options = {}) {
    if (!this.watermarkConfig.showWatermark && !options.force) {
      return // 不需要显示水印
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('无法获取Canvas上下文')
      return
    }

    // 合并配置
    const config = { ...this.watermarkConfig, ...options }

    if (!config.showWatermark) {
      return // 明确不显示水印
    }

    // 保存当前状态
    ctx.save()

    // 设置水印样式
    ctx.globalAlpha = config.opacity
    ctx.fillStyle = config.color
    ctx.font = `${config.fontSize}px ${config.fontFamily}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'

    // 计算水印位置
    const textMetrics = ctx.measureText(config.text)
    const textWidth = textMetrics.width
    const textHeight = config.fontSize

    const position = this.calculatePosition(
      config.position,
      canvas.width,
      canvas.height,
      textWidth,
      textHeight,
      config.margin
    )

    // 添加背景阴影 (增强可读性)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(
      position.x - textWidth - 5,
      position.y - textHeight - 2,
      textWidth + 10,
      textHeight + 4
    )

    // 绘制水印文字
    ctx.fillStyle = config.color
    ctx.fillText(config.text, position.x, position.y)

    // 恢复状态
    ctx.restore()
  }

  /**
   * 生成HTML水印样式和内容
   * @param {Object} options - 水印选项
   * @returns {Object} 包含样式和HTML的内容对象
   */
  generateHtmlWatermark(options = {}) {
    if (!this.watermarkConfig.showWatermark && !options.force) {
      return { style: '', html: '' }
    }

    const config = { ...this.watermarkConfig, ...options }

    if (!config.showWatermark) {
      return { style: '', html: '' }
    }

    // 生成CSS样式
    const style = `
      .vidslide-watermark {
        position: fixed;
        bottom: ${config.margin}px;
        right: ${config.margin}px;
        color: ${config.color};
        font-size: ${config.fontSize}px;
        font-family: ${config.fontFamily};
        opacity: ${config.opacity};
        pointer-events: none;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.3);
        padding: 4px 8px;
        border-radius: 4px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
    `

    // 生成HTML内容
    const html = `<div class="vidslide-watermark">${config.text}</div>`

    return { style, html }
  }

  /**
   * 计算水印位置
   */
  calculatePosition(position, canvasWidth, canvasHeight, textWidth, textHeight, margin) {
    const positions = {
      'top-left': {
        x: margin + textWidth,
        y: margin + textHeight
      },
      'top-right': {
        x: canvasWidth - margin,
        y: margin + textHeight
      },
      'bottom-left': {
        x: margin + textWidth,
        y: canvasHeight - margin
      },
      'bottom-right': {
        x: canvasWidth - margin,
        y: canvasHeight - margin
      },
      center: {
        x: canvasWidth / 2 + textWidth / 2,
        y: canvasHeight / 2 + textHeight / 2
      }
    }

    return positions[position] || positions['bottom-right']
  }

  /**
   * 检查用户是否有权移除水印
   */
  canRemoveWatermark() {
    return this.userTier !== 'free'
  }

  /**
   * 获取用户等级描述
   */
  getUserTierDescription() {
    const descriptions = {
      free: '免费版 - 显示水印',
      premium: '专业版 - 无水印',
      enterprise: '企业版 - 无水印'
    }

    return descriptions[this.userTier] || descriptions.free
  }

  /**
   * 获取升级提示
   */
  getUpgradePrompt() {
    if (this.canRemoveWatermark()) {
      return null // 无需升级
    }

    return {
      title: '升级到专业版',
      description: '移除水印，享受完整功能',
      actionText: '立即升级'
    }
  }
}

// 创建全局水印生成器实例
let watermarkGeneratorInstance = null

export function getWatermarkGenerator() {
  if (!watermarkGeneratorInstance) {
    watermarkGeneratorInstance = new WatermarkGenerator()
  }
  return watermarkGeneratorInstance
}

// 默认导出
export default WatermarkGenerator
