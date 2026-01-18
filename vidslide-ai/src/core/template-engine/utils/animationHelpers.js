/**
 * VidSlide AI - 动画辅助函数模块
 * 提供各种动画效果的辅助函数和缓动函数
 *
 * @module animationHelpers
 * @description 动画辅助工具集，包含缓动函数、动画控制器和常用动画效果
 */

/**
 * 缓动函数集合
 * 提供各种常用的缓动效果
 */
export const EasingFunctions = {
  /**
   * 线性缓动
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  linear: t => t,

  /**
   * 二次方缓入
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeInQuad: t => t * t,

  /**
   * 二次方缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeOutQuad: t => t * (2 - t),

  /**
   * 二次方缓入缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  /**
   * 三次方缓入
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeInCubic: t => t * t * t,

  /**
   * 三次方缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeOutCubic: t => --t * t * t + 1,

  /**
   * 三次方缓入缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  /**
   * 弹性缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },

  /**
   * 回弹缓出
   * @param {number} t - 进度值 (0-1)
   * @returns {number} 缓动后的值
   */
  easeOutBack: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }
}

/**
 * 动画控制器类
 * 管理动画的执行、暂停、恢复和取消
 */
export class AnimationController {
  constructor() {
    this.animations = new Map()
    this.animationId = 0
  }

  /**
   * 启动动画
   * @param {string} name - 动画名称
   * @param {Function} callback - 动画回调函数，接收进度值(0-1)
   * @param {number} duration - 动画持续时间(毫秒)
   * @param {Object} options - 动画选项
   * @param {string} options.easing - 缓动函数名称
   * @param {Function} options.onComplete - 完成回调
   * @returns {number} 动画ID
   */
  start(name, callback, duration, options = {}) {
    const id = ++this.animationId
    const startTime = performance.now()
    const easing = EasingFunctions[options.easing] || EasingFunctions.linear

    const animate = currentTime => {
      const animation = this.animations.get(id)
      if (!animation || animation.cancelled) {
        return
      }

      if (animation.paused) {
        animation.rafId = requestAnimationFrame(animate)
        return
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      callback(easedProgress)

      if (progress < 1) {
        animation.rafId = requestAnimationFrame(animate)
      } else {
        this.animations.delete(id)
        if (options.onComplete) {
          options.onComplete()
        }
      }
    }

    const rafId = requestAnimationFrame(animate)
    this.animations.set(id, {
      name,
      rafId,
      paused: false,
      cancelled: false
    })

    return id
  }

  /**
   * 暂停动画
   * @param {number} id - 动画ID
   */
  pause(id) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.paused = true
    }
  }

  /**
   * 恢复动画
   * @param {number} id - 动画ID
   */
  resume(id) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.paused = false
    }
  }

  /**
   * 取消动画
   * @param {number} id - 动画ID
   */
  cancel(id) {
    const animation = this.animations.get(id)
    if (animation) {
      animation.cancelled = true
      if (animation.rafId) {
        cancelAnimationFrame(animation.rafId)
      }
      this.animations.delete(id)
    }
  }

  /**
   * 取消所有动画
   */
  cancelAll() {
    this.animations.forEach((animation, id) => {
      this.cancel(id)
    })
  }

  /**
   * 获取活动动画数量
   * @returns {number} 活动动画数量
   */
  getActiveCount() {
    return this.animations.size
  }
}

/**
 * 创建淡入淡出动画配置
 * @param {number} duration - 持续时间(毫秒)
 * @param {string} easing - 缓动函数名称
 * @returns {Object} 动画配置
 */
export function createFadeAnimation(duration = 500, easing = 'easeOutQuad') {
  return {
    type: 'fade',
    duration,
    easing,
    from: 0,
    to: 1
  }
}

/**
 * 创建缩放动画配置
 * @param {number} duration - 持续时间(毫秒)
 * @param {string} easing - 缓动函数名称
 * @param {number} fromScale - 起始缩放比例
 * @param {number} toScale - 结束缩放比例
 * @returns {Object} 动画配置
 */
export function createScaleAnimation(
  duration = 500,
  easing = 'easeOutBack',
  fromScale = 0.8,
  toScale = 1.0
) {
  return {
    type: 'scale',
    duration,
    easing,
    from: fromScale,
    to: toScale
  }
}

/**
 * 创建滑动动画配置
 * @param {number} duration - 持续时间(毫秒)
 * @param {string} direction - 滑动方向 ('left', 'right', 'top', 'bottom')
 * @param {number} distance - 滑动距离(像素)
 * @param {string} easing - 缓动函数名称
 * @returns {Object} 动画配置
 */
export function createSlideAnimation(
  duration = 500,
  direction = 'left',
  distance = 50,
  easing = 'easeOutCubic'
) {
  return {
    type: 'slide',
    duration,
    easing,
    direction,
    distance
  }
}

/**
 * 应用淡入淡出效果
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} progress - 动画进度(0-1)
 * @param {Function} drawCallback - 绘制回调函数
 */
export function applyFadeEffect(ctx, progress, drawCallback) {
  ctx.save()
  ctx.globalAlpha = progress
  drawCallback()
  ctx.restore()
}

/**
 * 应用缩放效果
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} progress - 动画进度(0-1)
 * @param {Object} element - 元素信息 {x, y, width, height}
 * @param {number} fromScale - 起始缩放比例
 * @param {number} toScale - 结束缩放比例
 * @param {Function} drawCallback - 绘制回调函数
 */
export function applyScaleEffect(ctx, progress, element, fromScale, toScale, drawCallback) {
  const scale = fromScale + (toScale - fromScale) * progress
  const centerX = element.x + element.width / 2
  const centerY = element.y + element.height / 2

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
  drawCallback()
  ctx.restore()
}

/**
 * 应用滑动效果
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} progress - 动画进度(0-1)
 * @param {string} direction - 滑动方向
 * @param {number} distance - 滑动距离
 * @param {Function} drawCallback - 绘制回调函数
 */
export function applySlideEffect(ctx, progress, direction, distance, drawCallback) {
  const offset = distance * (1 - progress)
  let translateX = 0
  let translateY = 0

  switch (direction) {
    case 'left':
      translateX = -offset
      break
    case 'right':
      translateX = offset
      break
    case 'top':
      translateY = -offset
      break
    case 'bottom':
      translateY = offset
      break
  }

  ctx.save()
  ctx.translate(translateX, translateY)
  drawCallback()
  ctx.restore()
}

/**
 * 组合多个动画效果
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} progress - 动画进度(0-1)
 * @param {Array<Object>} effects - 效果配置数组
 * @param {Function} drawCallback - 绘制回调函数
 */
export function applyCombinedEffects(ctx, progress, effects, drawCallback) {
  ctx.save()

  effects.forEach(effect => {
    switch (effect.type) {
      case 'fade':
        ctx.globalAlpha *= progress
        break
      case 'scale':
        if (effect.element) {
          const scale = effect.from + (effect.to - effect.from) * progress
          const centerX = effect.element.x + effect.element.width / 2
          const centerY = effect.element.y + effect.element.height / 2
          ctx.translate(centerX, centerY)
          ctx.scale(scale, scale)
          ctx.translate(-centerX, -centerY)
        }
        break
      case 'slide':
        const offset = effect.distance * (1 - progress)
        const translateX =
          effect.direction === 'left' ? -offset : effect.direction === 'right' ? offset : 0
        const translateY =
          effect.direction === 'top' ? -offset : effect.direction === 'bottom' ? offset : 0
        ctx.translate(translateX, translateY)
        break
    }
  })

  drawCallback()
  ctx.restore()
}

/**
 * 默认导出动画控制器实例
 */
export default new AnimationController()
