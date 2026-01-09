/**
 * setup.js
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

// 测试环境设置
import { beforeAll } from 'vitest'

// 设置全局变量
global.matchMedia =
  global.matchMedia ||
  /**

   * function 方法

   * VidSlide AI 功能实现

   */

  function () {
    return {
      matches: false,
      /**
       * function 方法
       * VidSlide AI 功能实现
       */
      addListener: function () {},
      /**
       * function 方法
       * VidSlide AI 功能实现
       */
      removeListener: function () {}
    }
  }

global.requestAnimationFrame =
  global.requestAnimationFrame ||
  /**

   * function 方法

   * VidSlide AI 功能实现

   */

  function (callback) {
    return setTimeout(callback, 0)
  }

global.cancelAnimationFrame =
  global.cancelAnimationFrame ||
  /**

   * function 方法

   * VidSlide AI 功能实现

   */

  function (id) {
    clearTimeout(id)
  }
