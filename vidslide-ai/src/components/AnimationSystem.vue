/** * AnimationSystem.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!--
  VidSlide AI - 动画系统组件
  统一管理文字动画、画中画动画、模板动画效果

  核心功能：
  - 文字动画：关键词强调、数字滚动、标题渐入
  - 画中画动画：入场/跟随/退出效果
  - 模板动画：预设动画效果管理
  - 时序同步：与视频内容同步
  - 配置管理：动画参数调整

  技术实现：
  - CSS动画 + JavaScript控制
  - requestAnimationFrame优化性能
  - 缓动函数库
-->
<template>
  <div class="animation-system">
    <!-- 动画控制面板 -->
    <div class="animation-controls">
      <h4>🎬 动画系统控制</h4>

      <!-- 动画开关 -->
      <div class="control-group">
        <label>
          <input
v-model="animationsEnabled" type="checkbox" />
          启用动画效果
        </label>
      </div>

      <!-- 动画速度设置 -->
      <div v-if="animationsEnabled" class="control-group">
        <label>动画速度：</label>
        <select v-model="animationSpeed">
          <option value="slow">慢速 (1.0x)</option>
          <option value="normal">正常 (1.0x)</option>
          <option value="fast">快速 (1.5x)</option>
        </select>
      </div>

      <!-- 动画类型选择 -->
      <div v-if="animationsEnabled" class="control-group">
        <label>当前动画：</label>
        <div class="animation-status">
          <span v-if="currentAnimation"
class="active-animation">
            {{ currentAnimation.type }} - {{ currentAnimation.element }}
          </span>
          <span v-else
class="no-animation">无活跃动画</span>
        </div>
      </div>

      <!-- 测试按钮 -->
      <div class="control-group">
        <button
class="test-btn" @click="testTextAnimation">测试文字动画</button>
        <button
class="test-btn" @click="testPipAnimation">测试画中画动画</button>
      </div>
    </div>

    <!-- 动画预览区域 -->
    <div v-if="animationsEnabled" class="animation-preview">
      <div ref="textElement" class="preview-text">
        <span ref="keywordElement">关键词</span>
        动画演示
      </div>
      <div ref="pipElement"
class="preview-pip"
>
画中画动画演示
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  videoElement: {
    type: HTMLVideoElement,
    default: null
  },
  pipElement: {
    type: HTMLElement,
    default: null
  },
  textElements: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['animation-start', 'animation-end', 'animation-config-change'])

// 响应式状态
const animationsEnabled = ref(true)
const animationSpeed = ref('normal')
const currentAnimation = ref(null)

// DOM引用
const textElement = ref(null)
const keywordElement = ref(null)
const pipElement = ref(null)

// 动画配置
const animationConfig = ref({
  text: {
    keyword: {
      duration: 0.6,
      easing: 'ease-out',
      scale: 1.2,
      color: '#ff6b6b'
    },
    number: {
      duration: 1.0,
      easing: 'ease-in-out'
    },
    title: {
      duration: 0.8,
      easing: 'ease-out',
      translateY: -10
    }
  },
  pip: {
    enter: {
      duration: 0.3,
      delay: 0.2,
      scale: { from: 0.8, to: 1.0 },
      opacity: { from: 0, to: 1 }
    },
    follow: {
      duration: 0.2,
      easing: 'ease-out'
    },
    exit: {
      duration: 0.3,
      scale: { from: 1.0, to: 0.8 },
      opacity: { from: 1, to: 0 }
    }
  }
})

// 动画队列管理 - 性能优化
const animationQueue = ref([])
let animationFrameId = null
let lastFrameTime = 0
const targetFPS = 60
const frameInterval = 1000 / targetFPS

// 性能监控
const performanceStats = ref({
  frameCount: 0,
  droppedFrames: 0,
  averageFPS: 0,
  lastFrameTime: 0
})

// 缓动函数 - 优化版本
const easingFunctions = {
  'ease-out': t => 1 - Math.pow(1 - t, 3),
  'ease-in': t => t * t * t,
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  linear: t => t
}

// 计算动画持续时间 - 支持性能调整
const getAnimationDuration = baseDuration => {
  const multipliers = { slow: 1.5, normal: 1.0, fast: 0.7 }

  // 在低性能设备上自动调整动画速度
  const performanceMultiplier = detectDevicePerformance()
  return baseDuration * multipliers[animationSpeed.value] * performanceMultiplier
}

// 设备性能检测
const detectDevicePerformance = () => {
  // 基于硬件并发性和内存检测
  const cores = navigator.hardwareConcurrency || 2
  const memory = navigator.deviceMemory || 4

  if (cores >= 8 && memory >= 8) return 0.8 // 高性能设备，稍微加快
  if (cores <= 2 || memory <= 2) return 1.3 // 低性能设备，减慢动画
  return 1.0 // 中等性能
}

// 优化的动画循环
const startAnimationLoop = () => {
  if (animationFrameId) return

  const animate = currentTime => {
    // 帧率控制 - 避免过度渲染
    const deltaTime = currentTime - lastFrameTime
    if (deltaTime < frameInterval) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    lastFrameTime = currentTime

    // 更新性能统计
    performanceStats.value.frameCount++
    const fps = 1000 / deltaTime
    performanceStats.value.averageFPS = performanceStats.value.averageFPS * 0.9 + fps * 0.1

    // 执行动画队列
    processAnimationQueue(currentTime)

    // 检测丢帧
    if (deltaTime > frameInterval * 1.5) {
      performanceStats.value.droppedFrames++
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  animationFrameId = requestAnimationFrame(animate)
}

// stopAnimationLoop 函数暂时不需要实现

// stopAnimationLoop 函数暂时不需要实现

// 处理动画队列
const processAnimationQueue = currentTime => {
  animationQueue.value = animationQueue.value.filter(animation => {
    const { startTime, duration, update, complete } = animation
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    update(progress)

    if (progress >= 1) {
      complete()
      return false
    }

    return true
  })
}

// 文字动画 - 关键词强调 (性能优化版本)
const animateKeyword = (element, text) => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.text.keyword
  const duration = getAnimationDuration(config.duration) * 1000 // 转换为毫秒

  currentAnimation.value = { type: '关键词强调', element: text }

  // 使用优化后的动画队列系统
  const animation = {
    startTime: performance.now(),
    duration,
    update: progress => {
      const easedProgress = easingFunctions[config.easing](progress)

      // 缩放动画
      const scale = 1 + (config.scale - 1) * easedProgress
      element.style.transform = `scale(${scale})`

      // 颜色动画 - 使用CSS自定义属性优化性能
      const hue = easedProgress * 60
      element.style.setProperty('--animation-hue', hue)
      element.style.color = 'hsl(var(--animation-hue), 100%, 60%)'
    },
    complete: () => {
      // 清理样式
      element.style.transform = ''
      element.style.color = ''
      element.style.removeProperty('--animation-hue')
      currentAnimation.value = null
      emit('animation-end', { type: 'keyword', element: text })
    }
  }

  emit('animation-start', { type: 'keyword', element: text })
  animationQueue.value.push(animation)

  // 启动优化动画循环
  startAnimationLoop()
}

// 文字动画 - 数字滚动
const animateNumber = (element, from, to) => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.text.number
  const duration = getAnimationDuration(config.duration)
  const startTime = performance.now()
  const diff = to - from

  currentAnimation.value = { type: '数字滚动', element: `${from}→${to}` }

  const animate = currentTime => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFunctions[config.easing](progress)

    const current = Math.round(from + diff * easedProgress)
    element.textContent = current.toLocaleString()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      element.textContent = to.toLocaleString()
      currentAnimation.value = null
      emit('animation-end', { type: 'number', element: `${from}→${to}` })
    }
  }

  emit('animation-start', { type: 'number', element: `${from}→${to}` })
  requestAnimationFrame(animate)
}

// 文字动画 - 标题渐入上浮
const animateTitle = element => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.text.title
  const duration = getAnimationDuration(config.duration)
  const startTime = performance.now()

  currentAnimation.value = { type: '标题渐入', element: element.textContent }

  element.style.opacity = '0'
  element.style.transform = `translateY(${config.translateY}px)`

  const animate = currentTime => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFunctions[config.easing](progress)

    element.style.opacity = easedProgress.toString()
    element.style.transform = `translateY(${config.translateY * (1 - easedProgress)}px)`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
      currentAnimation.value = null
      emit('animation-end', { type: 'title', element: element.textContent })
    }
  }

  emit('animation-start', { type: 'title', element: element.textContent })
  requestAnimationFrame(animate)
}

// 画中画动画 - 入场效果
const animatePipEnter = element => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.pip.enter
  const duration = getAnimationDuration(config.duration)
  const startTime = performance.now()

  currentAnimation.value = { type: '画中画入场', element: 'pip' }

  // 初始状态
  element.style.opacity = '0'
  element.style.transform = `scale(${config.scale.from})`

  setTimeout(() => {
    const animate = currentTime => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunctions['ease-out'](progress)

      const opacity =
        config.opacity.from + (config.opacity.to - config.opacity.from) * easedProgress
      const scale = config.scale.from + (config.scale.to - config.scale.from) * easedProgress

      element.style.opacity = opacity.toString()
      element.style.transform = `scale(${scale})`

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.style.opacity = '1'
        element.style.transform = 'scale(1)'
        currentAnimation.value = null
        emit('animation-end', { type: 'pip-enter', element: 'pip' })
      }
    }

    emit('animation-start', { type: 'pip-enter', element: 'pip' })
    requestAnimationFrame(animate)
  }, config.delay * 1000)
}

// 画中画动画 - 退出效果
const animatePipExit = element => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.pip.exit
  const duration = getAnimationDuration(config.duration)
  const startTime = performance.now()

  currentAnimation.value = { type: '画中画退出', element: 'pip' }

  const animate = currentTime => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFunctions['ease-in'](progress)

    const opacity = config.opacity.from + (config.opacity.to - config.opacity.from) * easedProgress
    const scale = config.scale.from + (config.scale.to - config.scale.from) * easedProgress

    element.style.opacity = opacity.toString()
    element.style.transform = `scale(${scale})`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      element.style.opacity = '0'
      element.style.transform = `scale(${config.scale.to})`
      currentAnimation.value = null
      emit('animation-end', { type: 'pip-exit', element: 'pip' })
    }
  }

  emit('animation-start', { type: 'pip-exit', element: 'pip' })
  requestAnimationFrame(animate)
}

// 智能动画触发器
const triggerSmartAnimation = (content, element) => {
  if (!animationsEnabled.value) return

  // 检测关键词
  if (content.includes('重要') || content.includes('关键') || content.includes('强调')) {
    animateKeyword(element, content)
  }
  // 检测数字
  else if (/\d+/.test(content)) {
    const numbers = content.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const targetNumber = parseInt(numbers[0])
      animateNumber(element, 0, targetNumber)
    }
  }
  // 检测标题
  else if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
    animateTitle(element)
  }
}

// 测试函数
const testTextAnimation = () => {
  if (keywordElement.value) {
    animateKeyword(keywordElement.value, '测试关键词')
  }
}

const testPipAnimation = () => {
  if (pipElement.value) {
    animatePipEnter(pipElement.value)
    setTimeout(() => animatePipExit(pipElement.value), 2000)
  }
}

// 监听配置变化
watch([animationsEnabled, animationSpeed], () => {
  emit('animation-config-change', {
    enabled: animationsEnabled.value,
    speed: animationSpeed.value
  })
})

// 暴露方法给父组件
defineExpose({
  animateKeyword,
  animateNumber,
  animateTitle,
  animatePipEnter,
  animatePipExit,
  triggerSmartAnimation
})

// 清理动画帧
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.animation-system {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #b8d4f0;
}

.animation-controls {
  margin-bottom: 20px;
}

.animation-controls h4 {
  margin: 0 0 15px 0;
  color: #2c5aa0;
}

.control-group {
  margin-bottom: 12px;
}

.control-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #2c5aa0;
}

.control-group select {
  padding: 6px 12px;
  border: 1px solid #b8d4f0;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.animation-status {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  font-size: 14px;
}

.active-animation {
  color: #52c41a;
  font-weight: bold;
}

.no-animation {
  color: #8c8c8c;
  font-style: italic;
}

.test-btn {
  padding: 8px 16px;
  margin-right: 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.test-btn:hover {
  background: #40a9ff;
}

.animation-preview {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #d9d9d9;
}

.preview-text {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #2c5aa0;
}

.preview-pip {
  width: 200px;
  height: 150px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-align: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}
</style>
