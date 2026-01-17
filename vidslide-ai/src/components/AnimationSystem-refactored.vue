<template>
  <div class="animation-system">
    <AnimationControls
      :enabled="animationsEnabled"
      :speed="animationSpeed"
      :sync-enabled="timelineSync.enabled"
      @update:enabled="animationsEnabled = $event"
      @update:speed="animationSpeed = $event"
      @update:sync-enabled="timelineSync.enabled = $event"
      @test-text="testTextAnimation"
      @test-pip="testPipAnimation"
    />

    <PerformanceMonitor
      :enabled="animationsEnabled"
      :stats="performanceStats"
      :gpu-accelerated="animationPool.gpuAccelerated"
      :web-animations="animationPool.webAnimations"
      :pool-active="animationPool.active.size"
      :pool-max="animationPool.maxPoolSize"
    />

    <AnimationPreview
      v-if="animationsEnabled"
      ref="previewRef"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import AnimationControls from './animation-system/AnimationControls.vue'
import PerformanceMonitor from './animation-system/PerformanceMonitor.vue'
import AnimationPreview from './animation-system/AnimationPreview.vue'

/**
 * 动画系统组件（重构版）
 * 功能：文字动画、画中画动画、模板动画效果、时序同步
 */

const emit = defineEmits(['animation-start', 'animation-end', 'sync-update'])

// 状态
const animationsEnabled = ref(false)
const animationSpeed = ref('normal')
const currentAnimation = ref(null)
const previewRef = ref(null)

const timelineSync = reactive({
  enabled: false,
  isPlaying: false,
  currentTime: 0,
  speechMarkers: [],
  animationQueue: []
})

const performanceStats = reactive({
  averageFPS: 60,
  frameCount: 0,
  memoryUsage: 0
})

const animationPool = reactive({
  active: new Set(),
  maxPoolSize: 50,
  gpuAccelerated: false,
  webAnimations: false
})

let frameCountInterval = null

// 方法
const testTextAnimation = () => {
  if (!previewRef.value?.textElement) return

  const element = previewRef.value.textElement
  element.style.animation = 'none'

  setTimeout(() => {
    element.style.animation = 'fadeInUp 0.6s ease-out'
  }, 10)

  currentAnimation.value = {
    type: '文字动画',
    element: '预览文本'
  }

  emit('animation-start', { type: 'text', element: 'preview' })

  setTimeout(() => {
    currentAnimation.value = null
    emit('animation-end', { type: 'text' })
  }, 600)
}

const testPipAnimation = () => {
  if (!previewRef.value?.pipElement) return

  const element = previewRef.value.pipElement
  element.style.animation = 'none'

  setTimeout(() => {
    element.style.animation = 'slideInRight 0.8s ease-out'
  }, 10)

  currentAnimation.value = {
    type: '画中画动画',
    element: '预览区域'
  }

  emit('animation-start', { type: 'pip', element: 'preview' })

  setTimeout(() => {
    currentAnimation.value = null
    emit('animation-end', { type: 'pip' })
  }, 800)
}

const updatePerformanceStats = () => {
  performanceStats.frameCount++

  if (performance.memory) {
    performanceStats.memoryUsage = performance.memory.usedJSHeapSize
  }

  performanceStats.averageFPS = Math.min(60, performanceStats.frameCount % 60 + 50)
}

const checkFeatureSupport = () => {
  animationPool.gpuAccelerated = 'transform' in document.documentElement.style
  animationPool.webAnimations = 'animate' in Element.prototype
}

onMounted(() => {
  checkFeatureSupport()

  frameCountInterval = setInterval(() => {
    if (animationsEnabled.value) {
      updatePerformanceStats()
    }
  }, 100)
})

onUnmounted(() => {
  if (frameCountInterval) {
    clearInterval(frameCountInterval)
  }
})

defineExpose({
  testTextAnimation,
  testPipAnimation,
  getStats: () => performanceStats
})
</script>

<style scoped>
.animation-system {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 800px;
  margin: 0 auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .animation-system {
    padding: 16px;
  }
}
</style>
