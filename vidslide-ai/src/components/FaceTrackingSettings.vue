<template>
  <div class="face-tracking-settings">
    <div class="settings-header">
      <h3>人脸跟踪设置</h3>
      <div class="tracking-status">
        <span class="status-indicator" :class="trackingStatusClass"></span>
        <span class="status-text">{{ trackingStatusText }}</span>
      </div>
    </div>

    <div class="settings-content">
      <!-- 跟踪模式选择 -->
      <div class="setting-group">
        <label class="group-label">跟踪模式</label>
        <div class="mode-options">
          <button
            v-for="mode in trackingModes"
            :key="mode.id"
            class="mode-btn"
            :class="{ active: currentMode === mode.id }"
            @click="setTrackingMode(mode.id)"
            :disabled="!mode.available"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-info">
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-desc">{{ mode.description }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 灵敏度调节 -->
      <div class="setting-group">
        <label class="group-label">
          跟踪灵敏度
          <span class="sensitivity-value">{{ currentSensitivity }}%</span>
        </label>
        <div class="sensitivity-control">
          <input
            type="range"
            min="1"
            max="100"
            v-model="currentSensitivity"
            @input="updateSensitivity"
            class="sensitivity-slider"
            aria-label="跟踪灵敏度调节滑块"
          />
          <div class="sensitivity-labels">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
        <div class="sensitivity-description">
          {{ sensitivityDescription }}
        </div>
      </div>

      <!-- 边界保护设置 -->
      <div class="setting-group">
        <label class="group-label">边界保护</label>
        <div class="boundary-settings">
          <div class="boundary-item">
            <label class="boundary-label">
              <input
                type="checkbox"
                v-model="boundaryProtection.enabled"
                @change="updateBoundaryProtection"
                aria-label="启用边界保护"
              />
              <span class="boundary-text">启用边界保护</span>
            </label>
          </div>

          <div class="boundary-item" v-if="boundaryProtection.enabled">
            <label class="boundary-label">
              保护区域:
              <select
                v-model="boundaryProtection.margin"
                @change="updateBoundaryProtection"
                aria-label="边界保护区域设置"
              >
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
                <option value="50">50%</option>
              </select>
            </label>
          </div>

          <div class="boundary-item" v-if="boundaryProtection.enabled">
            <label class="boundary-label">
              <input
                type="checkbox"
                v-model="boundaryProtection.keepInFrame"
                @change="updateBoundaryProtection"
                aria-label="保持人脸在画面内"
              />
              <span class="boundary-text">保持人脸在画面内</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 性能参数 -->
      <div class="setting-group">
        <label class="group-label">性能参数</label>
        <div class="performance-params">
          <div class="param-item">
            <label class="param-label">检测间隔:</label>
            <select
              v-model="performanceParams.detectionInterval"
              @change="updatePerformanceParams"
              aria-label="人脸检测间隔设置"
            >
              <option value="100">100ms (高性能)</option>
              <option value="200">200ms (平衡)</option>
              <option value="500">500ms (省电)</option>
              <option value="1000">1000ms (极省电)</option>
            </select>
          </div>

          <div class="param-item">
            <label class="param-label">跟踪精度:</label>
            <select
              v-model="performanceParams.trackingAccuracy"
              @change="updatePerformanceParams"
              aria-label="跟踪精度设置"
            >
              <option value="low">低精度 (快速)</option>
              <option value="medium">中精度 (平衡)</option>
              <option value="high">高精度 (准确)</option>
              <option value="ultra">超高精度 (最准)</option>
            </select>
          </div>

          <div class="param-item">
            <label class="param-label">最大跟踪目标:</label>
            <select
              v-model="performanceParams.maxTargets"
              @change="updatePerformanceParams"
              aria-label="最大跟踪目标数量设置"
            >
              <option value="1">1个</option>
              <option value="3">3个</option>
              <option value="5">5个</option>
              <option value="10">10个</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="setting-group">
        <label class="group-label">高级设置</label>
        <div class="advanced-settings">
          <div class="advanced-item">
            <label class="advanced-label">
              <input
                type="checkbox"
                v-model="advancedSettings.smoothTracking"
                @change="updateAdvancedSettings"
                aria-label="启用平滑跟踪"
              />
              <span class="advanced-text">平滑跟踪 (减少抖动)</span>
            </label>
          </div>

          <div class="advanced-item">
            <label class="advanced-label">
              <input
                type="checkbox"
                v-model="advancedSettings.poseEstimation"
                @change="updateAdvancedSettings"
                aria-label="启用姿态估计"
              />
              <span class="advanced-text">姿态估计 (检测头部角度)</span>
            </label>
          </div>

          <div class="advanced-item">
            <label class="advanced-label">
              <input
                type="checkbox"
                v-model="advancedSettings.expressionDetection"
                @change="updateAdvancedSettings"
                aria-label="启用表情检测"
              />
              <span class="advanced-text">表情检测 (识别面部表情)</span>
            </label>
          </div>

          <div class="advanced-item">
            <label class="advanced-label">
              <input
                type="checkbox"
                v-model="advancedSettings.ageGenderDetection"
                @change="updateAdvancedSettings"
                aria-label="启用年龄性别检测"
              />
              <span class="advanced-text">年龄性别检测</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 实时预览 -->
      <div class="setting-group">
        <label class="group-label">实时预览</label>
        <div class="preview-section">
          <div class="preview-canvas-container">
            <canvas
              ref="previewCanvas"
              class="preview-canvas"
              width="320"
              height="240"
            ></canvas>
            <div class="preview-overlay" v-if="isPreviewActive">
              <div class="tracking-info">
                <div class="info-item">
                  <span class="info-label">跟踪目标:</span>
                  <span class="info-value">{{ previewData.targetCount }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">置信度:</span>
                  <span class="info-value">{{ previewData.confidence }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">FPS:</span>
                  <span class="info-value">{{ previewData.fps }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-controls">
            <button
              class="preview-btn"
              :class="{ active: isPreviewActive }"
              @click="togglePreview"
              :disabled="!canPreview"
            >
              {{ isPreviewActive ? '停止预览' : '开始预览' }}
            </button>

            <div class="preview-status" v-if="!canPreview">
              <span class="status-warning">需要摄像头权限</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 调试信息 -->
      <div class="setting-group" v-if="showDebugInfo">
        <label class="group-label">调试信息</label>
        <div class="debug-info">
          <div class="debug-item">
            <span class="debug-label">检测耗时:</span>
            <span class="debug-value">{{ debugInfo.detectionTime }}ms</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">跟踪耗时:</span>
            <span class="debug-value">{{ debugInfo.trackingTime }}ms</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">内存使用:</span>
            <span class="debug-value">{{ debugInfo.memoryUsage }}MB</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">模型版本:</span>
            <span class="debug-value">{{ debugInfo.modelVersion }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置操作 -->
    <div class="settings-footer">
      <button class="reset-btn" @click="resetToDefaults">
        重置默认
      </button>
      <button class="apply-btn" @click="applySettings" :disabled="!hasChanges">
        应用设置
      </button>
      <button class="debug-btn" @click="toggleDebugInfo" v-if="debugMode">
        {{ showDebugInfo ? '隐藏调试' : '显示调试' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

// 组件状态
const currentMode = ref('single')
const currentSensitivity = ref(70)
const hasChanges = ref(false)
const isPreviewActive = ref(false)
const showDebugInfo = ref(false)
const debugMode = ref(false) // 在生产环境中设为false

// 跟踪模式
const trackingModes = ref([
  {
    id: 'single',
    name: '单人跟踪',
    description: '跟踪单个主要人脸',
    icon: '👤',
    available: true
  },
  {
    id: 'multi',
    name: '多人跟踪',
    description: '同时跟踪多个目标',
    icon: '👥',
    available: true
  },
  {
    id: 'gesture',
    name: '手势跟踪',
    description: '跟踪手势和肢体动作',
    icon: '👋',
    available: navigator.hardwareConcurrency >= 4
  },
  {
    id: 'fullbody',
    name: '全身跟踪',
    description: '跟踪完整身体姿态',
    icon: '🧍',
    available: navigator.hardwareConcurrency >= 8
  }
])

// 边界保护设置
const boundaryProtection = ref({
  enabled: true,
  margin: '20',
  keepInFrame: true
})

// 性能参数
const performanceParams = ref({
  detectionInterval: '200',
  trackingAccuracy: 'medium',
  maxTargets: '3'
})

// 高级设置
const advancedSettings = ref({
  smoothTracking: true,
  poseEstimation: false,
  expressionDetection: false,
  ageGenderDetection: false
})

// 实时预览数据
const previewData = ref({
  targetCount: 0,
  confidence: 0,
  fps: 0
})

// 调试信息
const debugInfo = ref({
  detectionTime: 0,
  trackingTime: 0,
  memoryUsage: 0,
  modelVersion: '1.2.0'
})

// DOM引用
const previewCanvas = ref(null)

// 计算属性
const trackingStatusClass = computed(() => {
  if (!isPreviewActive.value) return 'status-inactive'
  if (previewData.value.targetCount > 0) return 'status-active'
  return 'status-searching'
})

const trackingStatusText = computed(() => {
  if (!isPreviewActive.value) return '未启动'
  if (previewData.value.targetCount > 0) return `跟踪中 (${previewData.value.targetCount}个目标)`
  return '搜索中...'
})

const sensitivityDescription = computed(() => {
  const sensitivity = parseInt(currentSensitivity.value)
  if (sensitivity < 30) return '低灵敏度：减少误检，适合安静环境'
  if (sensitivity < 70) return '中灵敏度：平衡检测率和准确性'
  return '高灵敏度：提高检测率，适合运动场景'
})

const canPreview = computed(() => {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia
})

// 方法
const setTrackingMode = (mode) => {
  if (currentMode.value !== mode) {
    currentMode.value = mode
    hasChanges.value = true
    emit('mode-change', mode)
  }
}

const updateSensitivity = () => {
  hasChanges.value = true
  emit('sensitivity-change', parseInt(currentSensitivity.value))
}

const updateBoundaryProtection = () => {
  hasChanges.value = true
  emit('boundary-protection-change', { ...boundaryProtection.value })
}

const updatePerformanceParams = () => {
  hasChanges.value = true
  emit('performance-params-change', { ...performanceParams.value })
}

const updateAdvancedSettings = () => {
  hasChanges.value = true
  emit('advanced-settings-change', { ...advancedSettings.value })
}

const togglePreview = async () => {
  if (isPreviewActive.value) {
    stopPreview()
  } else {
    await startPreview()
  }
}

const startPreview = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' }
    })

    const video = document.createElement('video')
    video.srcObject = stream
    video.play()

    await nextTick()

    if (previewCanvas.value) {
      const ctx = previewCanvas.value.getContext('2d')
      const drawFrame = () => {
        if (!isPreviewActive.value) return

        ctx.drawImage(video, 0, 0, 320, 240)

        // 模拟人脸检测结果
        const faces = simulateFaceDetection()
        drawFaceBoxes(ctx, faces)

        // 更新预览数据
        previewData.value = {
          targetCount: faces.length,
          confidence: faces.length > 0 ? Math.floor(Math.random() * 20) + 80 : 0,
          fps: Math.floor(Math.random() * 10) + 25
        }

        requestAnimationFrame(drawFrame)
      }

      drawFrame()
      isPreviewActive.value = true
    }
  } catch (error) {
    console.error('无法启动摄像头预览:', error)
  }
}

const stopPreview = () => {
  isPreviewActive.value = false
  previewData.value = {
    targetCount: 0,
    confidence: 0,
    fps: 0
  }

  // 停止所有媒体流
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop())
      })
      .catch(() => {})
  }
}

const simulateFaceDetection = () => {
  // 模拟人脸检测结果
  const faceCount = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0
  const faces = []

  for (let i = 0; i < faceCount; i++) {
    faces.push({
      x: Math.random() * 200 + 60,
      y: Math.random() * 120 + 60,
      width: Math.random() * 60 + 40,
      height: Math.random() * 60 + 60,
      confidence: Math.random() * 0.3 + 0.7
    })
  }

  return faces
}

const drawFaceBoxes = (ctx, faces) => {
  ctx.strokeStyle = '#007aff'
  ctx.lineWidth = 2

  faces.forEach(face => {
    ctx.strokeRect(face.x, face.y, face.width, face.height)

    // 绘制置信度文本
    ctx.fillStyle = '#007aff'
    ctx.font = '12px Arial'
    ctx.fillText(`${Math.round(face.confidence * 100)}%`, face.x, face.y - 5)
  })
}

const resetToDefaults = () => {
  currentMode.value = 'single'
  currentSensitivity.value = 70
  Object.assign(boundaryProtection.value, {
    enabled: true,
    margin: '20',
    keepInFrame: true
  })
  Object.assign(performanceParams.value, {
    detectionInterval: '200',
    trackingAccuracy: 'medium',
    maxTargets: '3'
  })
  Object.assign(advancedSettings.value, {
    smoothTracking: true,
    poseEstimation: false,
    expressionDetection: false,
    ageGenderDetection: false
  })
  hasChanges.value = false

  emit('reset-defaults')
}

const applySettings = () => {
  const settings = {
    mode: currentMode.value,
    sensitivity: currentSensitivity.value,
    boundaryProtection: { ...boundaryProtection.value },
    performanceParams: { ...performanceParams.value },
    advancedSettings: { ...advancedSettings.value }
  }

  emit('settings-applied', settings)
  hasChanges.value = false
}

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value
}

// 监听变化
watch([currentMode, currentSensitivity, boundaryProtection, performanceParams, advancedSettings], () => {
  hasChanges.value = true
}, { deep: true })

// 生命周期
onMounted(() => {
  // 初始化调试信息更新
  if (debugMode.value) {
    const updateDebugInfo = () => {
      debugInfo.value = {
        detectionTime: Math.floor(Math.random() * 50) + 10,
        trackingTime: Math.floor(Math.random() * 30) + 5,
        memoryUsage: Math.floor(Math.random() * 50) + 100,
        modelVersion: '1.2.0'
      }
    }

    updateDebugInfo()
    const debugInterval = setInterval(updateDebugInfo, 2000)

    onUnmounted(() => {
      clearInterval(debugInterval)
    })
  }
})

onUnmounted(() => {
  stopPreview()
})

// 事件定义
const emit = defineEmits([
  'mode-change',
  'sensitivity-change',
  'boundary-protection-change',
  'performance-params-change',
  'advanced-settings-change',
  'reset-defaults',
  'settings-applied'
])
</script>

<style scoped>
.face-tracking-settings {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 500px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.tracking-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.status-inactive {
  background: #86868b;
}

.status-indicator.status-active {
  background: #34c759;
}

.status-indicator.status-searching {
  background: #ff9f0a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensitivity-value {
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.3);
}

.mode-btn.active {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.mode-desc {
  font-size: 12px;
  color: #86868b;
}

.sensitivity-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sensitivity-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.sensitivity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.sensitivity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86868b;
}

.sensitivity-description {
  font-size: 12px;
  color: #86868b;
  font-style: italic;
}

.boundary-settings,
.performance-params,
.advanced-settings,
.debug-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.boundary-item,
.param-item,
.advanced-item,
.debug-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.boundary-label,
.param-label,
.advanced-label,
.debug-label {
  font-size: 13px;
  color: #1d1d1f;
  min-width: 100px;
}

.boundary-text,
.advanced-text {
  flex: 1;
}

.boundary-settings input[type="checkbox"],
.advanced-settings input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.boundary-settings select,
.performance-params select {
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 13px;
  min-width: 120px;
}

.debug-value {
  font-weight: 600;
  color: #007aff;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-canvas-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.preview-canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.tracking-info {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  opacity: 0.8;
}

.info-value {
  font-weight: 600;
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.preview-btn.active {
  background: #007aff;
  color: white;
  border-color: #007aff;
}

.preview-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-warning {
  color: #ff9f0a;
  font-size: 12px;
  font-style: italic;
}

.settings-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.reset-btn,
.apply-btn,
.debug-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: #1d1d1f;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.apply-btn {
  background: #007aff;
  border: 1px solid #007aff;
  color: white;
}

.apply-btn:hover:not(:disabled) {
  background: #0056cc;
  border-color: #0056cc;
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.debug-btn {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #856404;
}

.debug-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .face-tracking-settings {
    padding: 16px;
    max-width: none;
  }

  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .mode-options {
    grid-template-columns: 1fr;
  }

  .preview-canvas-container {
    max-width: 100%;
  }

  .settings-footer {
    flex-direction: column;
  }
}
</style>