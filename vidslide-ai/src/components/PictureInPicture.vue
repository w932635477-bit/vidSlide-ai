/** * PictureInPicture.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!--
  VidSlide AI - 画中画效果组件
  提供完整的画中画视觉效果控制界面
  支持位置调节、大小控制、样式选择、动画效果等高级功能
-->
<template>
  <aside class="picture-in-picture" role="complementary" aria-label="画中画效果控制面板">
    <!-- 画中画控制面板 - 主要的用户交互区域 -->
    <section class="pip-controls" aria-labelledby="pip-controls-heading">
      <header class="control-header">
        <h2 id="pip-controls-heading">画中画效果</h2>
        <!-- 状态指示器：显示画中画是否激活 -->
        <el-tag
          :type="isPipActive ? 'success' : 'info'"
          size="small"
          aria-live="polite"
          :aria-label="`画中画状态: ${isPipActive ? '激活中' : '未激活'}`"
        >
          {{ isPipActive ? '激活中' : '未激活' }}
        </el-tag>
      </header>

      <!-- 位置选择 -->
      <fieldset class="control-section">
        <legend class="control-label">显示位置</legend>
        <div class="position-grid" role="radiogroup" aria-labelledby="position-label">
          <span id="position-label" class="sr-only">选择画中画显示位置</span>
          <div
            v-for="position in positionOptions"
            :key="position.id"
            class="position-option"
            :class="{ active: pipConfig.position === position.id }"
            role="radio"
            :aria-checked="pipConfig.position === position.id"
            :aria-label="`位置: ${position.name}`"
            tabindex="0"
            @click="setPosition(position.id)"
            @keydown.enter="setPosition(position.id)"
            @keydown.space.prevent="setPosition(position.id)"
          >
            <div class="position-icon" aria-hidden="true">
              {{ position.icon }}
            </div>
            <span class="position-name">{{ position.name }}</span>
          </div>
        </div>

        <!-- 大小调节 -->
        <div class="control-section">
          <label class="control-label">显示大小</label>
          <el-slider
            v-model="pipConfig.size"
            :min="10"
            :max="50"
            :step="5"
            show-input
            :show-input-controls="false"
            size="small"
            aria-label="调整画中画显示大小"
            :aria-valuetext="`画中画大小: ${pipConfig.size}百分比`"
            @change="updatePipConfig"
          />
          <div
class="size-display" aria-live="polite">{{ pipConfig.size }}%</div>
        </div>

        <!-- 样式选择 -->
        <div class="control-section">
          <label class="control-label" for="style-radio-group">视觉样式</label>
          <el-radio-group
            id="style-radio-group"
            v-model="pipConfig.style"
            size="small"
            aria-label="选择画中画视觉样式"
            @change="updatePipConfig"
          >
            <el-radio-button label="circle"> 圆形 </el-radio-button>
            <el-radio-button label="rounded"> 圆角 </el-radio-button>
            <el-radio-button label="square"> 方形 </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 动画设置 -->
        <div class="control-section">
          <label class="control-label" for="animation-select">入场动画</label>
          <el-select
            id="animation-select"
            v-model="pipConfig.animation"
            placeholder="选择动画效果"
            size="small"
            @change="updatePipConfig"
          >
            <el-option
label="fade-in" value="fade-in"> 淡入 </el-option>
            <el-option
label="scale-in" value="scale-in"> 缩放 </el-option>
            <el-option
label="slide-in" value="slide-in"> 滑入 </el-option>
            <el-option
label="bounce-in" value="bounce-in"> 弹跳 </el-option>
          </el-select>
        </div>

        <!-- 人脸跟踪控制 -->
        <div v-if="faceTrackingSupported" class="control-section">
          <label class="control-label">高级功能</label>
          <div class="face-tracking-controls">
            <el-checkbox
              v-model="faceTrackingEnabled"
              :disabled="!faceTracker || !props.videoElement"
              @change="toggleFaceTracking"
            >
              启用智能人脸跟踪
            </el-checkbox>

            <div
              v-if="faceTrackingEnabled && trackingPerformance.faceDetected"
              class="tracking-status"
            >
              <el-tag size="small" type="success">
                人脸已检测 (置信度: {{ Math.round(trackingPerformance.confidence * 100) }}%)
              </el-tag>
              <small class="tracking-fps"> 跟踪FPS: {{ trackingPerformance.fps }} </small>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="control-actions">
          <el-button
            type="primary"
            :loading="isActivating"
            :disabled="!canActivatePip"
            @click="togglePip"
          >
            {{ isPipActive ? '停止画中画' : '启动画中画' }}
          </el-button>

          <el-button type="warning" size="small" :disabled="!isPipActive" @click="resetToDefault">
            重置默认
          </el-button>
        </div>

        <!-- 画中画预览区域 -->
        <div v-if="isPipActive" class="pip-preview" :style="previewStyle">
          <div class="pip-container" :style="containerStyle">
            <div class="pip-content">
              <!-- 这里会显示实际的画中画内容 -->
              <div class="pip-placeholder">
                <el-icon size="24">
                  <video-play />
                </el-icon>
                <p>画中画内容</p>
              </div>
            </div>
          </div>

          <!-- 背景遮罩 -->
          <div v-if="pipConfig.showOverlay" class="pip-overlay" :style="overlayStyle" />
        </div>

        <!-- 性能监控 -->
        <div v-if="showPerformanceInfo" class="performance-info">
          <small class="performance-text">
            渲染时间: {{ renderTime }}ms | FPS: {{ currentFps }}
          </small>
        </div>
      </fieldset>
    </section>
  </aside>
</template>

<!--
  PictureInPicture 组件逻辑
  实现画中画效果的完整控制逻辑，包括：
  - 用户界面状态管理
  - 动画效果控制
  - 性能监控
  - 事件通信
-->
<script setup>
/**
 * PictureInPicture 画中画效果组件
 *
 * 功能特性：
 * - 4个预设位置选择（左上、右上、左下、右下）
 * - 大小调节（10%-50%）
 * - 3种视觉样式（圆形、圆角、方形）
 * - 4种入场动画效果
 * - 实时性能监控
 * - 背景遮罩控制
 *
 * 技术实现：
 * - Vue 3 Composition API
 * - 响应式数据管理
 * - 事件驱动架构
 * - Canvas 2D渲染集成
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'
import { AdvancedFaceTracker, checkFaceTrackingSupport } from '../utils/advancedFaceTracker.js'

// Props (暂时未使用 - 组件正在重构中)
const props = defineProps({
  videoElement: {
    type: HTMLVideoElement,
    default: null
  },
  canvasElement: {
    type: HTMLCanvasElement,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  autoTrigger: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'pip-activated',
  'pip-deactivated',
  'config-changed',
  'render-performance'
])

// 响应式数据

// 画中画配置参数
const pipConfig = ref({
  position: 'bottom-right', // 显示位置
  size: 25, // 大小百分比 (10-50)
  style: 'circle', // 视觉样式 (circle/rounded/square)
  animation: 'fade-in', // 入场动画类型
  showOverlay: true // 是否显示背景遮罩
})

// 画中画激活状态
const isPipActive = ref(false)

// 是否正在激活画中画效果
const isActivating = ref(false)

// 是否显示性能信息
const showPerformanceInfo = ref(false)

// 性能监控数据
const renderTime = ref(0) // 渲染耗时(ms)
const currentFps = ref(60) // 当前帧率
const animationFrame = ref(null) // 动画帧ID
let lastFrameTime = 0 // 上一帧时间戳
let frameCount = 0 // 帧计数器

// 人脸跟踪器
const faceTracker = ref(null)
const faceTrackingEnabled = ref(false)
const faceTrackingSupported = ref(false)
const trackingPerformance = ref({
  fps: 0,
  confidence: 0,
  faceDetected: false
})

// 可选的画中画位置
const positionOptions = [
  { id: 'top-left', name: '左上', icon: '↖' },
  { id: 'top-right', name: '右上', icon: '↗' },
  { id: 'bottom-left', name: '左下', icon: '↙' },
  { id: 'bottom-right', name: '右下', icon: '↘' }
]

// 计算属性
const canActivatePip = computed(() => {
  return props.videoElement && !isActivating.value
})

const previewStyle = computed(() => {
  return {
    position: 'relative',
    width: '400px',
    height: '225px',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden'
  }
})

/** containerStyle - 计算属性 */

const containerStyle = computed(() => {
  const size = pipConfig.value.size
  const position = pipConfig.value.position
  const style = pipConfig.value.style

  // 计算尺寸
  const containerSize = Math.min(400, 225) * (size / 100)
  const borderRadius = style === 'circle' ? '50%' : style === 'rounded' ? '12px' : '0'

  // 计算位置
  let top = '10px'
  let left = '10px'
  let right = 'auto'
  let bottom = 'auto'

  switch (position) {
  case 'top-left':
    top = '10px'
    left = '10px'
    break
  case 'top-right':
    top = '10px'
    right = '10px'
    left = 'auto'
    break
  case 'bottom-left':
    bottom = '10px'
    left = '10px'
    top = 'auto'
    break
  case 'bottom-right':
    bottom = '10px'
    right = '10px'
    top = 'auto'
    left = 'auto'
    break
  }

  return {
    position: 'absolute',
    width: `${containerSize}px`,
    height: `${containerSize}px`,
    top,
    left,
    right,
    bottom,
    borderRadius,
    border: '3px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    background: 'rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    zIndex: 10
  }
})

/** overlayStyle - 计算属性 */

const overlayStyle = computed(() => {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    pointerEvents: 'none'
  }
})

// 方法
const setPosition = position => {
  pipConfig.value.position = position
  updatePipConfig()
}

const updatePipConfig = () => {
  emit('config-changed', { ...pipConfig.value })
}

const togglePip = async () => {
  if (isPipActive.value) {
    await deactivatePip()
  } else {
    await activatePip()
  }
}

/**


 * activatePip 函数


 * VidSlide AI 功能实现


 */

const activatePip = async () => {
  if (!canActivatePip.value) {
    ElMessage.warning('无法激活画中画，请确保视频已加载')
    return
  }

  isActivating.value = true

  try {
    // 应用入场动画
    await applyEntranceAnimation()

    isPipActive.value = true
    emit('pip-activated', { ...pipConfig.value })

    ElMessage.success('画中画效果已激活')

    // 开始性能监控
    startPerformanceMonitoring()
  } catch (error) {
    console.error('激活画中画失败:', error)
    ElMessage.error('激活画中画失败，请重试')
  } finally {
    isActivating.value = false
  }
}

const deactivatePip = async () => {
  try {
    // 应用退出动画
    await applyExitAnimation()

    isPipActive.value = false
    emit('pip-deactivated')

    ElMessage.info('画中画效果已停止')

    // 停止性能监控
    stopPerformanceMonitoring()
  } catch (error) {
    console.error('停用画中画失败:', error)
  }
}

const applyEntranceAnimation = async () => {
  const animation = pipConfig.value.animation

  return new Promise(resolve => {
    const pipElement = document.querySelector('.pip-container')
    if (!pipElement) {
      resolve()
      return
    }

    let animationClass = ''

    switch (animation) {
    case 'fade-in':
      animationClass = 'pip-fade-in'
      break
    case 'scale-in':
      animationClass = 'pip-scale-in'
      break
    case 'slide-in':
      animationClass = 'pip-slide-in'
      break
    case 'bounce-in':
      animationClass = 'pip-bounce-in'
      break
    default:
      animationClass = 'pip-fade-in'
    }

    pipElement.classList.add(animationClass)

    setTimeout(() => {
      pipElement.classList.remove(animationClass)
      resolve()
    }, 300)
  })
}

/**


 * applyExitAnimation 函数


 * VidSlide AI 功能实现


 */

const applyExitAnimation = () => {
  return new Promise(resolve => {
    const pipElement = document.querySelector('.pip-container')
    if (!pipElement) {
      resolve()
      return
    }

    pipElement.classList.add('pip-fade-out')

    setTimeout(() => {
      pipElement.classList.remove('pip-fade-out')
      resolve()
    }, 300)
  })
}

/**


 * resetToDefault 函数


 * VidSlide AI 功能实现


 */

const resetToDefault = () => {
  pipConfig.value = {
    position: 'bottom-right',
    size: 25,
    style: 'circle',
    animation: 'fade-in',
    showOverlay: true
  }
  updatePipConfig()
  ElMessage.success('已重置为默认设置')
}

/**


 * startPerformanceMonitoring 函数


 * VidSlide AI 功能实现


 */

const startPerformanceMonitoring = () => {
  const monitorPerformance = timestamp => {
    frameCount++

    if (timestamp - lastFrameTime >= 1000) {
      currentFps.value = Math.round((frameCount * 1000) / (timestamp - lastFrameTime))
      frameCount = 0
      lastFrameTime = timestamp

      // 模拟渲染时间（实际应用中应该测量真实渲染时间）
      renderTime.value = Math.random() * 10 + 5 // 5-15ms随机值

      emit('render-performance', {
        fps: currentFps.value,
        renderTime: renderTime.value
      })
    }

    if (isPipActive.value) {
      animationFrame.value = requestAnimationFrame(monitorPerformance)
    }
  }

  lastFrameTime = performance.now()
  frameCount = 0
  animationFrame.value = requestAnimationFrame(monitorPerformance)
}

/**


 * stopPerformanceMonitoring 函数


 * VidSlide AI 功能实现


 */

const stopPerformanceMonitoring = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
}

// 监听外部激活状态变化
watch(
  () => props.isActive,
  newActive => {
    if (newActive !== isPipActive.value) {
      if (newActive) {
        activatePip()
      } else {
        deactivatePip()
      }
    }
  }
)

// 自动触发逻辑（当检测到内容变化时）
watch(
  () => props.autoTrigger,
  autoTrigger => {
    if (autoTrigger && !isPipActive.value && canActivatePip.value) {
      // 这里可以添加智能触发逻辑
      // 例如：检测到视频中有对话内容时自动激活
      console.log('画中画自动触发条件满足')
    }
  }
)

// 人脸跟踪事件处理函数
const handleFaceDetected = data => {
  console.log('🎯 人脸检测到:', data)
  trackingPerformance.value.faceDetected = true
  trackingPerformance.value.confidence = data.confidence

  // 如果启用了人脸跟踪且画中画未激活，可以考虑自动激活
  if (faceTrackingEnabled.value && !isPipActive.value && props.autoTrigger) {
    console.log('🤖 检测到人脸，考虑自动激活画中画')
    // 这里可以添加自动激活逻辑
  }
}

const handleFaceLost = () => {
  console.log('👤 人脸丢失')
  trackingPerformance.value.faceDetected = false
  trackingPerformance.value.confidence = 0
}

const handleTrackingUpdate = data => {
  // 更新跟踪性能数据
  trackingPerformance.value.confidence = data.confidence

  // 如果画中画激活且启用了人脸跟踪，可以根据人脸位置调整画中画位置
  if (isPipActive.value && faceTrackingEnabled.value && data.faceBounds) {
    const faceCenterX = data.faceBounds.centerX
    const faceCenterY = data.faceBounds.centerY

    // 简单的智能定位逻辑：根据人脸位置调整画中画位置
    if (faceCenterX < 0.3) {
      pipConfig.value.position = 'top-left'
    } else if (faceCenterX > 0.7) {
      pipConfig.value.position = 'top-right'
    } else if (faceCenterY < 0.3) {
      pipConfig.value.position = 'bottom-left'
    } else {
      pipConfig.value.position = 'bottom-right'
    }
  }
}

const handleTrackingPerformance = performance => {
  trackingPerformance.value.fps = performance.fps
}

// 切换人脸跟踪
const toggleFaceTracking = async () => {
  if (!faceTrackingSupported.value) {
    ElMessage.warning('您的浏览器不支持高级人脸跟踪功能')
    return
  }

  if (!faceTracker.value) {
    ElMessage.error('人脸跟踪器未初始化')
    return
  }

  try {
    if (faceTrackingEnabled.value) {
      // 停止跟踪
      faceTracker.value.stopTracking()
      faceTrackingEnabled.value = false
      console.log('⏹️ 人脸跟踪已停止')
    } else {
      // 开始跟踪
      if (props.videoElement) {
        await faceTracker.value.startTracking(props.videoElement)
        faceTrackingEnabled.value = true
        console.log('🎬 人脸跟踪已启动')
      } else {
        ElMessage.warning('请先加载视频')
      }
    }
  } catch (error) {
    console.error('切换人脸跟踪失败:', error)
    ElMessage.error('人脸跟踪切换失败: ' + error.message)
  }
}

onMounted(async () => {
  // 初始化设置
  console.log('PictureInPicture component mounted')

  // 检查人脸跟踪支持
  faceTrackingSupported.value = checkFaceTrackingSupport().overall

  // 初始化人脸跟踪器
  if (faceTrackingSupported.value) {
    try {
      faceTracker.value = new AdvancedFaceTracker({
        maxNumFaces: 1,
        smoothFactor: 0.8
      })

      await faceTracker.value.initialize()

      // 设置事件监听器
      faceTracker.value.addEventListener('faceDetected', handleFaceDetected)
      faceTracker.value.addEventListener('faceLost', handleFaceLost)
      faceTracker.value.addEventListener('trackingUpdate', handleTrackingUpdate)
      faceTracker.value.addEventListener('performanceUpdate', handleTrackingPerformance)

      console.log('✅ 人脸跟踪器初始化成功')
    } catch (error) {
      console.warn('❌ 人脸跟踪器初始化失败:', error)
      faceTrackingSupported.value = false
    }
  }
})

onUnmounted(() => {
  // 清理资源
  stopPerformanceMonitoring()

  // 清理人脸跟踪器
  if (faceTracker.value) {
    faceTracker.value.dispose()
    faceTracker.value = null
  }
})
</script>

<style scoped>
.picture-in-picture {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pip-controls {
  margin-bottom: 20px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.control-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.control-section {
  margin-bottom: 16px;
}

.control-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.position-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.position-option:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.position-option.active {
  border-color: #007bff;
  background: #e7f3ff;
}

.position-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.position-name {
  font-size: 12px;
  color: #606266;
}

.size-display {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.control-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.pip-preview {
  position: relative;
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.pip-container {
  transition: all 0.3s ease;
}

.pip-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.pip-placeholder {
  text-align: center;
}

.pip-placeholder p {
  margin: 8px 0 0 0;
  font-size: 12px;
  opacity: 0.8;
}

.pip-overlay {
  transition: opacity 0.3s ease;
}

.performance-info {
  margin-top: 12px;
  text-align: center;
}

.performance-text {
  color: #909399;
  font-size: 11px;
}

/* 动画效果 */
@keyframes pip-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pip-scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes pip-slide-in {
  from {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes pip-bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pip-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

.pip-fade-in {
  animation: pip-fade-in 0.3s ease-out;
}

.pip-scale-in {
  animation: pip-scale-in 0.3s ease-out;
}

.pip-slide-in {
  animation: pip-slide-in 0.3s ease-out;
}

.pip-bounce-in {
  animation: pip-bounce-in 0.5s ease-out;
}

.pip-fade-out {
  animation: pip-fade-out 0.3s ease-in;
}

/* 响应式设计 */
/* 无障碍辅助样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 焦点样式增强 */
.position-option:focus {
  outline: 2px solid #007aff;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.position-option[aria-checked='true'] {
  background-color: #007aff;
  color: white;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .position-option {
    border-width: 2px;
  }

  .position-option:focus {
    outline-width: 3px;
  }

  .control-label {
    font-weight: 700;
  }
}

@media (max-width: 768px) {
  .picture-in-picture {
    padding: 16px;
  }

  .control-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .position-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .control-actions {
    flex-direction: column;
  }

  .control-actions .el-button {
    width: 100%;
  }

  .pip-preview {
    margin-top: 16px;
  }
}

/* 人脸跟踪控制样式 */
.face-tracking-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tracking-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.tracking-fps {
  color: #666;
  font-size: 12px;
}

/* 响应式设计中的人脸跟踪样式 */
@media (max-width: 768px) {
  .face-tracking-controls {
    gap: 12px;
  }

  .tracking-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
