<template>
  <div class="preview-quality-control">
    <div class="control-header">
      <h3>预览质量控制</h3>
      <div class="status-indicator">
        <span class="status-dot" :class="currentStatusClass"></span>
        <span class="status-text">{{ currentStatusText }}</span>
      </div>
    </div>

    <div class="control-sections">
      <!-- 分辨率控制 -->
      <div class="control-section">
        <label class="section-label">预览分辨率</label>
        <div class="resolution-options">
          <button
            v-for="option in resolutionOptions"
            :key="option.value"
            class="resolution-btn"
            :class="{ active: currentResolution === option.value }"
            @click="setResolution(option.value)"
            :disabled="!option.available"
          >
            {{ option.label }}
            <span v-if="!option.available" class="unavailable-hint">(不可用)</span>
          </button>
        </div>
      </div>

      <!-- 质量控制 -->
      <div class="control-section">
        <label class="section-label">
          渲染质量
          <span class="quality-value">{{ currentQuality }}%</span>
        </label>
        <div class="quality-slider">
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            v-model="currentQuality"
            @input="updateQuality"
            class="quality-range"
            aria-label="渲染质量调节滑块"
          />
          <div class="quality-marks">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
      </div>

      <!-- 性能监控 -->
      <div class="control-section">
        <label class="section-label">性能监控</label>
        <div class="performance-metrics">
          <div class="metric-item">
            <span class="metric-label">帧率:</span>
            <span class="metric-value" :class="fpsClass">{{ performanceMetrics.fps }}</span>
            <span class="metric-unit">FPS</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">内存:</span>
            <span class="metric-value" :class="memoryClass">{{ performanceMetrics.memory }}</span>
            <span class="metric-unit">MB</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CPU:</span>
            <span class="metric-value" :class="cpuClass">{{ performanceMetrics.cpu }}</span>
            <span class="metric-unit">%</span>
          </div>
        </div>
      </div>

      <!-- 优化选项 -->
      <div class="control-section">
        <label class="section-label">优化设置</label>
        <div class="optimization-options">
          <label class="option-item">
          <input
            type="checkbox"
            v-model="optimizations.hardwareAcceleration"
            @change="updateOptimizations"
            aria-label="硬件加速"
          />
            <span class="option-label">硬件加速</span>
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="optimizations.multithreaded"
              @change="updateOptimizations"
              aria-label="多线程渲染"
            />
            <span class="option-label">多线程渲染</span>
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="optimizations.memoryOptimization"
              @change="updateOptimizations"
              aria-label="内存优化"
            />
            <span class="option-label">内存优化</span>
          </label>
        </div>
      </div>

      <!-- 预设配置 -->
      <div class="control-section">
        <label class="section-label">预设配置</label>
        <div class="preset-options">
          <button
            v-for="preset in qualityPresets"
            :key="preset.id"
            class="preset-btn"
            :class="{ active: currentPreset === preset.id }"
            @click="applyPreset(preset)"
          >
            <div class="preset-icon">{{ preset.icon }}</div>
            <div class="preset-info">
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-desc">{{ preset.description }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="control-section">
        <label class="section-label">高级设置</label>
        <div class="advanced-settings">
          <div class="setting-item">
            <label class="setting-label">缓存大小:</label>
            <select v-model="advancedSettings.cacheSize" @change="updateAdvancedSettings" aria-label="缓存大小设置">
              <option value="64">64MB</option>
              <option value="128">128MB</option>
              <option value="256">256MB</option>
              <option value="512">512MB</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">渲染线程数:</label>
            <select v-model="advancedSettings.renderThreads" @change="updateAdvancedSettings" aria-label="渲染线程数设置">
              <option value="1">1个</option>
              <option value="2">2个</option>
              <option value="4">4个</option>
              <option value="8">8个</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="control-footer">
      <button class="reset-btn" @click="resetToDefaults">
        重置为默认设置
      </button>
      <button class="apply-btn" @click="applySettings" :disabled="!hasChanges">
        应用设置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 组件状态
const currentResolution = ref('1080p')
const currentQuality = ref(80)
const currentPreset = ref('balanced')
const hasChanges = ref(false)

// 分辨率选项
const resolutionOptions = ref([
  { value: '480p', label: '480p', available: true },
  { value: '720p', label: '720p', available: true },
  { value: '1080p', label: '1080p', available: true },
  { value: '1440p', label: '1440p', available: navigator.hardwareConcurrency >= 4 },
  { value: '4k', label: '4K', available: navigator.hardwareConcurrency >= 8 }
])

// 质量预设
const qualityPresets = ref([
  {
    id: 'performance',
    name: '性能优先',
    description: '流畅播放，较低质量',
    icon: '⚡',
    settings: { resolution: '720p', quality: 60, optimizations: { hardwareAcceleration: true, multithreaded: false, memoryOptimization: true } }
  },
  {
    id: 'balanced',
    name: '平衡模式',
    description: '质量与性能平衡',
    icon: '⚖️',
    settings: { resolution: '1080p', quality: 80, optimizations: { hardwareAcceleration: true, multithreaded: true, memoryOptimization: true } }
  },
  {
    id: 'quality',
    name: '质量优先',
    description: '最佳画质，高性能需求',
    icon: '🎯',
    settings: { resolution: '1440p', quality: 100, optimizations: { hardwareAcceleration: true, multithreaded: true, memoryOptimization: false } }
  }
])

// 优化设置
const optimizations = ref({
  hardwareAcceleration: true,
  multithreaded: true,
  memoryOptimization: true
})

// 高级设置
const advancedSettings = ref({
  cacheSize: '128',
  renderThreads: navigator.hardwareConcurrency > 4 ? '4' : '2'
})

// 性能监控数据
const performanceMetrics = ref({
  fps: 0,
  memory: 0,
  cpu: 0
})

// 性能监控定时器
let performanceMonitor = null

// 计算属性
const currentStatusClass = computed(() => {
  const fps = performanceMetrics.value.fps
  if (fps >= 50) return 'status-good'
  if (fps >= 25) return 'status-warning'
  return 'status-error'
})

const currentStatusText = computed(() => {
  const fps = performanceMetrics.value.fps
  if (fps >= 50) return '流畅'
  if (fps >= 25) return '一般'
  return '卡顿'
})

const fpsClass = computed(() => {
  const fps = performanceMetrics.value.fps
  if (fps >= 50) return 'metric-good'
  if (fps >= 25) return 'metric-warning'
  return 'metric-error'
})

const memoryClass = computed(() => {
  const memory = performanceMetrics.value.memory
  if (memory <= 256) return 'metric-good'
  if (memory <= 512) return 'metric-warning'
  return 'metric-error'
})

const cpuClass = computed(() => {
  const cpu = performanceMetrics.value.cpu
  if (cpu <= 50) return 'metric-good'
  if (cpu <= 80) return 'metric-warning'
  return 'metric-error'
})

// 方法
const setResolution = (resolution) => {
  if (currentResolution.value !== resolution) {
    currentResolution.value = resolution
    hasChanges.value = true
    emit('resolution-change', resolution)
  }
}

const updateQuality = () => {
  hasChanges.value = true
  emit('quality-change', parseInt(currentQuality.value))
}

const updateOptimizations = () => {
  hasChanges.value = true
  emit('optimizations-change', { ...optimizations.value })
}

const updateAdvancedSettings = () => {
  hasChanges.value = true
  emit('advanced-settings-change', { ...advancedSettings.value })
}

const applyPreset = (preset) => {
  currentPreset.value = preset.id
  currentResolution.value = preset.settings.resolution
  currentQuality.value = preset.settings.quality
  Object.assign(optimizations.value, preset.settings.optimizations)
  hasChanges.value = true

  emit('preset-applied', preset)
}

const resetToDefaults = () => {
  currentResolution.value = '1080p'
  currentQuality.value = 80
  currentPreset.value = 'balanced'
  Object.assign(optimizations.value, {
    hardwareAcceleration: true,
    multithreaded: true,
    memoryOptimization: true
  })
  Object.assign(advancedSettings.value, {
    cacheSize: '128',
    renderThreads: navigator.hardwareConcurrency > 4 ? '4' : '2'
  })
  hasChanges.value = false

  emit('reset-defaults')
}

const applySettings = () => {
  const settings = {
    resolution: currentResolution.value,
    quality: currentQuality.value,
    optimizations: { ...optimizations.value },
    advanced: { ...advancedSettings.value }
  }

  emit('settings-applied', settings)
  hasChanges.value = false
}

// 性能监控
const startPerformanceMonitoring = () => {
  if (performanceMonitor) return

  performanceMonitor = setInterval(() => {
    // 模拟性能数据采集
    performanceMetrics.value = {
      fps: Math.floor(Math.random() * 60) + 20, // 20-80 FPS
      memory: Math.floor(Math.random() * 300) + 100, // 100-400 MB
      cpu: Math.floor(Math.random() * 60) + 10 // 10-70%
    }
  }, 1000)
}

const stopPerformanceMonitoring = () => {
  if (performanceMonitor) {
    clearInterval(performanceMonitor)
    performanceMonitor = null
  }
}

// 监听变化
watch([currentResolution, currentQuality, optimizations, advancedSettings], () => {
  hasChanges.value = true
}, { deep: true })

// 生命周期
onMounted(() => {
  startPerformanceMonitoring()
})

onUnmounted(() => {
  stopPerformanceMonitoring()
})

// 事件定义
const emit = defineEmits([
  'resolution-change',
  'quality-change',
  'optimizations-change',
  'advanced-settings-change',
  'preset-applied',
  'reset-defaults',
  'settings-applied'
])
</script>

<style scoped>
.preview-quality-control {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.control-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.status-good {
  background: #34c759;
}

.status-dot.status-warning {
  background: #ff9f0a;
}

.status-dot.status-error {
  background: #ff3b30;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
}

.control-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-value {
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
}

.resolution-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.resolution-btn {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.resolution-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.resolution-btn.active {
  background: #007aff;
  color: white;
  border-color: #007aff;
}

.resolution-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unavailable-hint {
  display: block;
  font-size: 10px;
  opacity: 0.7;
  margin-top: 2px;
}

.quality-slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quality-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.quality-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.quality-marks {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86868b;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-label {
  font-size: 13px;
  color: #86868b;
  min-width: 60px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.metric-value.metric-good {
  color: #34c759;
}

.metric-value.metric-warning {
  color: #ff9f0a;
}

.metric-value.metric-error {
  color: #ff3b30;
}

.metric-unit {
  font-size: 12px;
  color: #86868b;
  margin-left: 4px;
}

.optimization-options,
.advanced-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item,
.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.option-label,
.setting-label {
  font-size: 13px;
  color: #1d1d1f;
  flex: 1;
}

.setting-item select {
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 13px;
  min-width: 80px;
}

.preset-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-btn {
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

.preset-btn:hover {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.3);
}

.preset-btn.active {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.preset-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.preset-desc {
  font-size: 12px;
  color: #86868b;
}

.control-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.reset-btn,
.apply-btn {
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
  .preview-quality-control {
    padding: 16px;
    max-width: none;
  }

  .control-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .resolution-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .control-footer {
    flex-direction: column;
  }
}
</style>