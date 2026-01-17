/**
 * VidSlide AI - 基础渲染器
 * 提供所有渲染器的基础功能和通用方法
 *
 * @module BaseRenderer
 * @description 抽象基类，定义渲染器的通用接口和辅助方法
 */

import animationController from '../utils/animationHelpers.js'

/**
 * BaseRenderer 基础渲染器类
 * 所有具体渲染器的父类，提供通用功能
 */
export class BaseRenderer {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {CanvasRenderingContext2D} context - Canvas上下文
   * @param {VisualEffects} visualEffects - 视觉效果实例
   */
  constructor(canvas, context, visualEffects) {
    this.canvas = canvas
    this.ctx = context
    this.visualEffects = visualEffects
    this.width = canvas.width
    this.height = canvas.height
    this.animationController = animationController
  }

  /**
   * 渲染方法（抽象方法，子类必须实现）
   * @param {Object} config - 模板配置
   * @param {Object} data - 渲染数据
   * @param {Object} options - 渲染选项
   * @returns {Object} 渲染结果
   * @throws {Error} 子类未实现此方法时抛出错误
   */
  render(config, data, options) {
    throw new Error('render() method must be implemented by subclass')
  }

  /**
   * 计算元素尺寸
   * @param {Object} sizeConfig - 尺寸配置
   * @param {number} sizeConfig.width - 宽度比例 (0-1)
   * @param {number} sizeConfig.height - 高度比例 (0-1)
   * @returns {Object} 实际尺寸 {width, height}
   */
  calculateElementSize(sizeConfig) {
    return {
      width: sizeConfig.width * this.width,
      height: sizeConfig.height * this.height
    }
  }

  /**
   * 计算元素位置
   * @param {string} position - 位置配置
   * @param {number} width - 元素宽度
   * @param {number} height - 元素高度
   * @returns {Object} 实际位置 {x, y}
   */
  calculateElementPosition(position, width, height) {
    const margin = 20
    const centerX = (this.width - width) / 2
    const centerY = (this.height - height) / 2

    switch (position) {
      case 'center':
        return { x: centerX, y: centerY }

      case 'top-left':
        return { x: margin, y: margin }

      case 'top-right':
        return { x: this.width - width - margin, y: margin }

      case 'bottom-left':
        return { x: margin, y: this.height - height - margin }

      case 'bottom-right':
        return { x: this.width - width - margin, y: this.height - height - margin }

      case 'bottom':
        return { x: centerX, y: this.height - height - margin }

      case 'left-to-right':
        return { x: margin, y: centerY }

      case 'top':
        return { x: centerX, y: margin }

      default:
        return { x: centerX, y: centerY }
    }
  }

  /**
   * 安全获取数据内容
   * @param {Object} data - 数据对象
   * @param {Object} defaultContent - 默认内容
   * @returns {Object} 数据内容
   */
  safeGetContent(data, defaultContent = {}) {
    return data?.content || defaultContent
  }

  /**
   * 绘制背景
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawBackground(position, size, visual) {
    if (visual.background) {
      if (visual.background.type === 'linear' || visual.background.type === 'radial') {
        // 渐变背景
        this.visualEffects.drawGradientBackground(
          position.x,
          position.y,
          size.width,
          size.height,
          visual.background
        )
      } else {
        // 纯色背景
        this.visualEffects.drawRoundedRect(
          position.x,
          position.y,
          size.width,
          size.height,
          visual.borderRadius || 12,
          visual.background,
          visual.border,
          visual.borderWidth || 2
        )
      }
    }
  }

  /**
   * 绘制阴影
   * @param {Object} position - 位置 {x, y}
   * @param {Object} size - 尺寸 {width, height}
   * @param {Object} visual - 视觉配置
   */
  drawShadow(position, size, visual) {
    if (visual.shadow) {
      this.visualEffects.drawWithShadow(
        () =>
          this.visualEffects.drawRoundedRect(
            position.x,
            position.y,
            size.width,
            size.height,
            visual.borderRadius || 12
          ),
        visual.shadow
      )
    }
  }

  /**
   * 应用动画效果
   * @param {Object} animation - 动画配置
   * @param {Object} target - 动画目标
   * @param {Function} renderCallback - 渲染回调函数
   */
  applyAnimation(animation, target, renderCallback) {
    if (!animation) return

    const { type, duration, easing } = animation

    switch (type) {
      case 'fade-in-scale':
        this.applyFadeInScaleAnimation(target, duration, easing, renderCallback)
        break

      case 'progress-bar':
        this.applyProgressBarAnimation(target, duration, easing)
        break

      case 'slide-in-sync':
        this.applySlideInSyncAnimation(target, duration, easing, renderCallback)
        break

      case 'data-animation':
        this.applyDataAnimation(target, duration, easing)
        break

      case 'fade-in-text':
        this.applyFadeInTextAnimation(target, duration, easing)
        break

      default:
        console.warn(`Unsupported animation type: ${type}`)
    }
  }

  /**
   * 淡入缩放动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   * @param {Function} renderCallback - 渲染回调
   */
  applyFadeInScaleAnimation(target, duration, easing, renderCallback) {
    const { element } = target
    const startScale = 0.8
    const endScale = 1.0

    this.animationController.start(
      `fade_scale_${Date.now()}`,
      progress => {
        const scale = startScale + (endScale - startScale) * progress
        const alpha = progress

        this.ctx.save()
        this.ctx.globalAlpha = alpha
        this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2)
        this.ctx.scale(scale, scale)
        this.ctx.translate(-element.width / 2, -element.height / 2)

        if (renderCallback) {
          renderCallback()
        }

        this.ctx.restore()
      },
      duration,
      { easing }
    )
  }

  /**
   * 进度条动画（由子类实现具体逻辑）
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   */
  applyProgressBarAnimation(target, duration, easing) {
    console.log('Progress bar animation applied')
  }

  /**
   * 同步滑入动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   * @param {Function} renderCallback - 渲染回调
   */
  applySlideInSyncAnimation(target, duration, easing, renderCallback) {
    const slideDistance = 50

    this.animationController.start(
      `slide_sync_${Date.now()}`,
      progress => {
        const offset = slideDistance * (1 - progress)

        this.ctx.save()
        this.ctx.translate(-offset, 0)

        if (renderCallback) {
          renderCallback()
        }

        this.ctx.restore()
      },
      duration / 2,
      { easing }
    )
  }

  /**
   * 数据动画（由子类实现具体逻辑）
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   */
  applyDataAnimation(target, duration, easing) {
    console.log('Data animation applied')
  }

  /**
   * 文字淡入动画
   * @param {Object} target - 动画目标
   * @param {number} duration - 持续时间
   * @param {string} easing - 缓动函数
   */
  applyFadeInTextAnimation(target, duration, easing) {
    console.log('Text fade-in animation applied')
  }

  /**
   * 清理资源
   */
  destroy() {
    // 子类可以重写此方法以清理特定资源
  }
}

export default BaseRenderer
