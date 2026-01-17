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
      <div
v-if="animationsEnabled" class="control-group"
>
        <label>动画速度：</label>
        <select v-model="animationSpeed">
          <option value="slow">慢速 (1.0x)</option>
          <option value="normal">正常 (1.0x)</option>
          <option value="fast">快速 (1.5x)</option>
        </select>
      </div>

      <!-- 时序同步控制 -->
      <div
v-if="animationsEnabled" class="control-group"
>
        <label>
          <input
v-model="timelineSync.enabled" type="checkbox" />
          启用时序同步
        </label>
      </div>

      <div
v-if="animationsEnabled && timelineSync.enabled" class="control-group"
>
        <h5>语音同步设置：</h5>

        <label>
          <input
v-model="speechSyncConfig.keywordHighlight.enabled" type="checkbox" />
          关键词高亮同步
        </label>

        <label>
          <input
v-model="speechSyncConfig.textAnimation.enabled" type="checkbox" />
          文字渐入同步
        </label>

        <label>
          <input
v-model="speechSyncConfig.pipSync.enabled" type="checkbox" />
          画中画同步
        </label>
      </div>

      <!-- 同步状态显示 -->
      <div
v-if="timelineSync.enabled" class="control-group"
>
        <label>同步状态：</label>
        <div class="sync-status">
          <span
            class="status-indicator"
            :style="{ backgroundColor: timelineSync.isPlaying ? '#27ae60' : '#bdc3c7' }"
          />
          {{ timelineSync.isPlaying ? '播放中' : '暂停' }} | 时间:
          {{ (timelineSync.currentTime / 1000).toFixed(1) }}s | 标记:
          {{ timelineSync.speechMarkers.length }} | 动画: {{ timelineSync.animationQueue.length }}
        </div>
      </div>

      <!-- 性能监控显示 -->
      <div
v-if="animationsEnabled" class="control-group"
>
        <label>性能监控：</label>
        <div class="performance-status">
          FPS: {{ performanceStats.averageFPS.toFixed(1) }} | 帧数:
          {{ performanceStats.frameCount }} | GPU:
          {{ animationPool.gpuAccelerated ? '✅' : '❌' }} | WAAPI:
          {{ animationPool.webAnimations ? '✅' : '❌' }}<br>
          内存: {{ (performanceStats.memoryUsage / 1024 / 1024).toFixed(1) }}MB | 池大小:
          {{ animationPool.active.size }}/{{ animationPool.maxPoolSize }}
        </div>
      </div>

      <!-- 动画类型选择 -->
      <div
v-if="animationsEnabled" class="control-group"
>
        <label>当前动画：</label>
        <div class="animation-status">
          <span
v-if="currentAnimation" class="active-animation"
>
            {{ currentAnimation.type }} - {{ currentAnimation.element }}
          </span>
          <span
v-else class="no-animation"
>无活跃动画</span>
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
    <div
v-if="animationsEnabled" class="animation-preview"
>
      <div
ref="textElement" class="preview-text"
>
        <span ref="keywordElement">关键词</span>
        动画演示
      </div>
      <div
ref="pipElement" class="preview-pip">画中画动画演示</div>
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

// 时序同步系统 - 语音动画精确同步
const timelineSync = ref({
  enabled: true,
  speechMarkers: [], // 语音时间标记
  animationQueue: [], // 待执行动画队列
  currentTime: 0, // 当前同步时间
  syncOffset: 0, // 同步偏移量(ms)
  isPlaying: false
})

// 语音同步配置
const speechSyncConfig = ref({
  keywordHighlight: {
    enabled: true,
    advanceTime: 200, // 提前触发时间(ms)
    holdTime: 800, // 高亮持续时间(ms)
    fadeTime: 300 // 淡出时间(ms)
  },
  textAnimation: {
    enabled: true,
    wordDelay: 50, // 单词间隔(ms)
    sentenceDelay: 200 // 句子间隔(ms)
  },
  pipSync: {
    enabled: true,
    triggerOffset: 100, // 触发偏移(ms)
    followDelay: 50 // 跟随延迟(ms)
  }
})

// 动画池管理 - 高性能优化
const animationPool = ref({
  active: new Map(), // 活跃动画
  pool: new Map(), // 动画对象池
  maxPoolSize: 50, // 最大池大小
  gpuAccelerated: false, // GPU加速支持
  webAnimations: false // Web Animations API支持
})

// 性能监控扩展
const performanceStats = ref({
  frameCount: 0,
  averageFPS: 0,
  lastFrameTime: 0,
  droppedFrames: 0,
  memoryUsage: 0,
  gpuUtilization: 0
})

// 动画队列管理 - 性能优化
const animationQueue = ref([])
let animationFrameId = null
let lastFrameTime = 0
const targetFPS = 60
const frameInterval = 1000 / targetFPS

// 性能监控已在上方声明

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

// 处理动画队列 (使用动画池优化)
const processAnimationQueue = currentTime => {
  // 处理传统动画队列
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

  // 处理动画池中的活跃动画
  const completedAnimations = []
  animationPool.value.active.forEach((animation, id) => {
    if (!animation.isActive) return

    const elapsed = currentTime - animation.startTime
    const progress = Math.min(elapsed / animation.duration, 1)

    // 更新动画进度
    if (animation.onUpdate) {
      animation.onUpdate(progress)
    }

    if (progress >= 1) {
      // 动画完成
      if (animation.onComplete) {
        animation.onComplete()
      }
      animation.isActive = false
      completedAnimations.push(id)
    }
  })

  // 清理完成的动画
  completedAnimations.forEach(id => {
    const animation = animationPool.value.active.get(id)
    if (animation) {
      animationPool.value.active.delete(id)
      releaseAnimationToPool(animation)
    }
  })
}

// 文字动画 - 关键词强调 (性能优化版本)
const animateKeyword = (element, text) => {
  if (!animationsEnabled.value) return

  const config = animationConfig.value.text.keyword
  const duration = getAnimationDuration(config.duration) * 1000 // 转换为毫秒

  currentAnimation.value = { type: '关键词强调', element: text }

  // 从动画池获取动画对象
  const animation = acquireAnimationFromPool('keyword-highlight')
  animation.element = element
  animation.startTime = performance.now()
  animation.duration = duration
  animation.config = config
  animation.isActive = true

  // GPU加速动画实现
  if (animation.webAnimations && animation.gpuAccelerated) {
    // 使用Web Animations API + GPU加速
    animateKeywordGPU(element, config, duration)
  } else {
    // 使用传统requestAnimationFrame
    animateKeywordTraditional(animation, duration)
  }

  // 添加到活跃动画集合
  animationPool.value.active.set(animation.id, animation)

  emit('animation-start', { type: 'keyword', element: text })

  // 启动优化动画循环
  startAnimationLoop()
}

/**
 * GPU加速关键词动画 (Web Animations API)
 */
const animateKeywordGPU = (element, config, duration) => {
  try {
    // 使用Web Animations API实现GPU加速动画
    const keyframes = [
      {
        transform: 'scale(1)',
        color: 'inherit',
        filter: 'brightness(1)'
      },
      {
        transform: `scale(${config.scale})`,
        color: config.color,
        filter: 'brightness(1.3)',
        offset: 0.5
      },
      {
        transform: 'scale(1)',
        color: 'inherit',
        filter: 'brightness(1)'
      }
    ]

    const options = {
      duration: duration,
      easing: config.easing,
      fill: 'forwards'
    }

    const webAnimation = element.animate(keyframes, options)

    // 动画完成处理
    webAnimation.addEventListener('finish', () => {
      currentAnimation.value = null
      emit('animation-end', { type: 'keyword', element: element.textContent })
    })
  } catch (error) {
    console.warn('GPU animation failed, falling back to traditional:', error)
    // 降级到传统动画
    const animation = acquireAnimationFromPool('keyword-highlight')
    animation.element = element
    animation.startTime = performance.now()
    animation.duration = duration
    animation.config = config
    animation.isActive = true
    animateKeywordTraditional(animation, duration)
  }
}

/**
 * 传统关键词动画 (requestAnimationFrame)
 */
const animateKeywordTraditional = (animation, duration) => {
  const config = animation.config
  const element = animation.element

  animation.onUpdate = progress => {
    const easedProgress = easingFunctions[config.easing](progress)

    // 缩放动画
    const scale = 1 + (config.scale - 1) * easedProgress
    element.style.transform = `scale(${scale})`

    // 颜色动画 - 使用CSS自定义属性优化性能
    const hue = easedProgress * 60
    element.style.setProperty('--animation-hue', hue)
    element.style.color = config.color
  }

  animation.onComplete = () => {
    // 清理样式
    element.style.transform = ''
    element.style.color = ''
    element.style.removeProperty('--animation-hue')
    currentAnimation.value = null
    emit('animation-end', { type: 'keyword', element: element.textContent })
  }

  // 使用优化后的动画队列系统
  const legacyAnimation = {
    startTime: animation.startTime,
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

// 时序同步系统实现

/**
 * 初始化时序同步
 */
const initializeTimelineSync = () => {
  if (!timelineSync.value.enabled) return

  // 监听视频时间更新
  if (props.videoElement) {
    const video = props.videoElement
    const syncUpdate = () => {
      timelineSync.value.currentTime = video.currentTime * 1000 // 转换为毫秒
      processTimelineSync()
      if (!video.paused && !video.ended) {
        requestAnimationFrame(syncUpdate)
      }
    }

    video.addEventListener('play', () => {
      timelineSync.value.isPlaying = true
      syncUpdate()
    })

    video.addEventListener('pause', () => {
      timelineSync.value.isPlaying = false
    })

    video.addEventListener('seeked', () => {
      timelineSync.value.currentTime = video.currentTime * 1000
      processTimelineSync()
    })
  }
}

/**
 * 处理时序同步
 */
const processTimelineSync = () => {
  if (!timelineSync.value.enabled || !timelineSync.value.isPlaying) return

  const currentTime = timelineSync.value.currentTime + timelineSync.value.syncOffset

  // 处理语音标记同步
  processSpeechMarkers(currentTime)

  // 处理动画队列同步
  processAnimationQueueSync(currentTime)
}

/**
 * 处理语音标记同步
 */
const processSpeechMarkers = currentTime => {
  const markers = timelineSync.value.speechMarkers
  const config = speechSyncConfig.value

  if (!config.keywordHighlight.enabled) return

  // 查找需要触发的标记
  const activeMarkers = markers.filter(marker => {
    const triggerTime = marker.timestamp - config.keywordHighlight.advanceTime
    const endTime = marker.timestamp + marker.duration + config.keywordHighlight.holdTime

    return currentTime >= triggerTime && currentTime <= endTime
  })

  activeMarkers.forEach(marker => {
    if (!marker.triggered) {
      triggerSpeechAnimation(marker, currentTime)
      marker.triggered = true
    }
  })
}

/**
 * 处理动画队列同步
 */
const processAnimationQueueSync = currentTime => {
  const queue = timelineSync.value.animationQueue

  // 移除已过期动画
  timelineSync.value.animationQueue = queue.filter(animation => {
    if (currentTime >= animation.endTime) {
      // 清理动画
      if (animation.cleanup) {
        animation.cleanup()
      }
      return false
    }
    return true
  })

  // 触发新动画
  queue.forEach(animation => {
    if (currentTime >= animation.triggerTime && !animation.triggered) {
      executeSyncedAnimation(animation)
      animation.triggered = true
    }
  })
}

/**
 * 触发语音动画
 */
const triggerSpeechAnimation = (marker, currentTime) => {
  const config = speechSyncConfig.value

  if (marker.type === 'keyword' && config.keywordHighlight.enabled) {
    // 关键词高亮动画
    const elements = document.querySelectorAll(`[data-keyword="${marker.keyword}"]`)
    elements.forEach(element => {
      animateKeyword(element, marker.keyword)
    })
  } else if (marker.type === 'text' && config.textAnimation.enabled) {
    // 文字渐入动画
    const textElement = document.querySelector(`[data-text-id="${marker.textId}"]`)
    if (textElement) {
      animateTextSync(textElement, marker)
    }
  }
}

/**
 * 执行同步动画
 */
const executeSyncedAnimation = animation => {
  switch (animation.type) {
    case 'keyword-highlight':
      animateKeyword(animation.element, animation.keyword)
      break
    case 'text-reveal':
      animateTextSync(animation.element, animation)
      break
    case 'pip-enter':
      animatePipEnter(animation.element)
      break
    case 'pip-follow':
      animatePipFollow(animation.element, animation.targetPosition)
      break
    case 'pip-exit':
      animatePipExit(animation.element)
      break
  }
}

/**
 * 文字同步动画
 */
const animateTextSync = (element, marker) => {
  if (!speechSyncConfig.value.textAnimation.enabled) return

  const config = speechSyncConfig.value.textAnimation
  const words = marker.text.split(' ')
  let wordIndex = 0

  const animateWord = () => {
    if (wordIndex < words.length) {
      const word = words[wordIndex]

      // 创建单词元素
      const wordElement = document.createElement('span')
      wordElement.textContent = word + ' '
      wordElement.style.opacity = '0'
      wordElement.style.transform = 'translateY(10px)'

      element.appendChild(wordElement)

      // 单词动画
      const duration = getAnimationDuration(0.3)
      animateElement(
        wordElement,
        {
          opacity: { from: 0, to: 1 },
          transform: { from: 'translateY(10px)', to: 'translateY(0)' }
        },
        duration
      )

      wordIndex++

      // 单词间隔
      setTimeout(animateWord, config.wordDelay)
    }
  }

  animateWord()
}

/**
 * 画中画跟随动画 (同步版本)
 */
const animatePipFollow = (element, targetPosition) => {
  if (!speechSyncConfig.value.pipSync.enabled) return

  const config = animationConfig.value.pip.follow
  const duration = getAnimationDuration(config.duration)

  animateElement(
    element,
    {
      transform: {
        from: `translate(${element.offsetLeft}px, ${element.offsetTop}px)`,
        to: `translate(${targetPosition.x}px, ${targetPosition.y}px)`
      }
    },
    duration,
    config.easing
  )
}

/**
 * 通用元素动画
 */
const animateElement = (element, properties, duration, easing = 'ease-out') => {
  const startTime = performance.now()
  const startValues = {}

  // 获取初始值
  Object.keys(properties).forEach(prop => {
    if (prop === 'opacity') {
      startValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0
    } else if (prop === 'transform') {
      startValues[prop] = element.style.transform || ''
    }
  })

  const animate = currentTime => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFunctions[easing](progress)

    // 应用属性
    Object.keys(properties).forEach(prop => {
      const config = properties[prop]
      if (prop === 'opacity') {
        const value = startValues[prop] + (config.to - config.from) * easedProgress
        element.style.opacity = value
      } else if (prop === 'transform') {
        element.style.transform = config.to
      }
    })

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

/**
 * 添加语音标记
 */
const addSpeechMarker = (timestamp, type, data) => {
  const marker = {
    timestamp: timestamp, // 毫秒
    type: type, // 'keyword', 'text', 'pip'
    triggered: false,
    duration: data.duration || 1000,
    ...data
  }

  timelineSync.value.speechMarkers.push(marker)
  timelineSync.value.speechMarkers.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * 添加同步动画
 */
const addSyncedAnimation = (triggerTime, type, element, data = {}) => {
  const animation = {
    triggerTime: triggerTime, // 毫秒
    endTime: triggerTime + (data.duration || 1000),
    type: type,
    element: element,
    triggered: false,
    ...data
  }

  timelineSync.value.animationQueue.push(animation)
}

/**
 * 设置同步偏移
 */
const setSyncOffset = offset => {
  timelineSync.value.syncOffset = offset
}

/**
 * 清除所有同步数据
 */
const clearTimelineSync = () => {
  timelineSync.value.speechMarkers = []
  timelineSync.value.animationQueue = []
  timelineSync.value.currentTime = 0
}

/**
 * 获取同步状态
 */
const getSyncStatus = () => {
  return {
    enabled: timelineSync.value.enabled,
    currentTime: timelineSync.value.currentTime,
    isPlaying: timelineSync.value.isPlaying,
    markerCount: timelineSync.value.speechMarkers.length,
    animationCount: timelineSync.value.animationQueue.length,
    syncOffset: timelineSync.value.syncOffset
  }
}

/**
 * 初始化性能优化
 */
const initializePerformanceOptimizations = () => {
  // 检测GPU加速支持
  detectGPUAcceleration()

  // 检测Web Animations API支持
  detectWebAnimationsSupport()

  // 初始化动画对象池
  initializeAnimationPool()

  // 启动增强性能监控
  startEnhancedPerformanceMonitoring()

  console.log('AnimationSystem performance optimizations initialized')
}

/**
 * 检测GPU加速支持
 */
const detectGPUAcceleration = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        animationPool.value.gpuAccelerated =
          renderer &&
          (renderer.includes('NVIDIA') ||
            renderer.includes('AMD') ||
            renderer.includes('Intel') ||
            renderer.includes('Apple'))
      }
    }

    // CSS transform3d检测
    const testElement = document.createElement('div')
    testElement.style.transform = 'translate3d(0, 0, 0)'
    const has3D = testElement.style.transform !== ''
    animationPool.value.gpuAccelerated = animationPool.value.gpuAccelerated || has3D
  } catch (error) {
    console.warn('GPU acceleration detection failed:', error)
    animationPool.value.gpuAccelerated = false
  }
}

/**
 * 检测Web Animations API支持
 */
const detectWebAnimationsSupport = () => {
  animationPool.value.webAnimations =
    typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function'
}

/**
 * 初始化动画对象池
 */
const initializeAnimationPool = () => {
  // 预创建常用动画对象
  const commonAnimations = [
    'keyword-highlight',
    'text-reveal',
    'pip-enter',
    'pip-exit',
    'number-scroll'
  ]

  commonAnimations.forEach(type => {
    animationPool.value.pool.set(type, [])
  })
}

/**
 * 从对象池获取动画对象
 */
const acquireAnimationFromPool = type => {
  const pool = animationPool.value.pool.get(type) || []
  if (pool.length > 0) {
    return pool.pop()
  }

  // 创建新的动画对象
  return createAnimationObject(type)
}

/**
 * 将动画对象返回对象池
 */
const releaseAnimationToPool = animation => {
  const pool = animationPool.value.pool.get(animation.type) || []
  if (pool.length < animationPool.value.maxPoolSize) {
    // 重置动画对象状态
    resetAnimationObject(animation)
    pool.push(animation)
    animationPool.value.pool.set(animation.type, pool)
  }
}

/**
 * 创建动画对象
 */
const createAnimationObject = type => {
  const baseAnimation = {
    type: type,
    id: generateAnimationId(),
    startTime: 0,
    duration: 0,
    progress: 0,
    element: null,
    config: {},
    easing: 'ease-out',
    onUpdate: null,
    onComplete: null,
    isActive: false,
    gpuAccelerated: animationPool.value.gpuAccelerated,
    webAnimations: animationPool.value.webAnimations
  }

  return baseAnimation
}

/**
 * 重置动画对象
 */
const resetAnimationObject = animation => {
  animation.startTime = 0
  animation.progress = 0
  animation.element = null
  animation.onUpdate = null
  animation.onComplete = null
  animation.isActive = false
}

/**
 * 生成动画ID
 */
const generateAnimationId = () => {
  return 'anim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 启动增强性能监控
 */
const startEnhancedPerformanceMonitoring = () => {
  // 扩展性能监控
  if (typeof performance.memory !== 'undefined') {
    setInterval(() => {
      performanceStats.value.memoryUsage = performance.memory.usedJSHeapSize
    }, 1000)
  }

  // GPU利用率估算 (通过帧率变化)
  let lastFrameCount = 0
  setInterval(() => {
    const currentFrameCount = performanceStats.value.frameCount
    const frameDelta = currentFrameCount - lastFrameCount
    performanceStats.value.gpuUtilization = Math.min(100, (frameDelta / 60) * 100)
    lastFrameCount = currentFrameCount
  }, 1000)
}

// 初始化时序同步
onMounted(() => {
  initializeTimelineSync()
  initializePerformanceOptimizations()
})

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
  triggerSmartAnimation,
  // 时序同步API
  addSpeechMarker,
  addSyncedAnimation,
  setSyncOffset,
  clearTimelineSync,
  getSyncStatus,
  // 测试函数
  testTextAnimation,
  testPipAnimation
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

/* 时序同步样式 */
.control-group h5 {
  margin: 10px 0 5px 0;
  color: #2c5aa0;
  font-size: 14px;
  font-weight: 600;
}

.control-group label input[type='checkbox'] {
  margin-right: 8px;
}

.sync-status {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.active-animation {
  color: #27ae60;
  font-weight: bold;
}

.no-animation {
  color: #95a5a6;
  font-style: italic;
}

.performance-status {
  font-size: 11px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
