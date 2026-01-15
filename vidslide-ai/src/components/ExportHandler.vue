<template>
  <div class="export-handler">
    <!-- 导出选项面板 -->
    <div class="export-panel" v-if="showPanel">
      <div class="panel-header">
        <h3 class="panel-title">{{ t('workspace.export.title') }}</h3>
        <button class="close-btn" @click="closePanel" aria-label="关闭导出面板">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 导出格式选择 -->
      <div class="format-section">
        <h4 class="section-title">{{ t('workspace.export.format') }}</h4>
        <div class="format-grid">
          <div
            v-for="format in exportFormats"
            :key="format.id"
            class="format-card"
            :class="{ active: selectedFormat === format.id }"
            @click="selectFormat(format.id)"
          >
            <div class="format-icon">
              <component :is="format.icon" />
            </div>
            <div class="format-info">
              <h5 class="format-name">{{ format.name }}</h5>
              <p class="format-desc">{{ format.description }}</p>
              <div class="format-limits" v-if="format.limits">
                <small>{{ format.limits }}</small>
              </div>
            </div>
            <div class="format-badge" v-if="format.badge">
              <span class="badge" :class="format.badge.type">{{ format.badge.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出设置 -->
      <div class="settings-section">
        <h4 class="section-title">{{ t('workspace.export.settings') }}</h4>
        <div class="settings-grid">
          <!-- 视频质量设置 -->
          <div class="setting-item" v-if="isVideoFormat">
            <label class="setting-label">{{ t('workspace.export.quality') }}</label>
            <select v-model="exportSettings.quality" class="setting-select">
              <option value="720p">{{ t('workspace.export.quality720p') }}</option>
              <option value="1080p">{{ t('workspace.export.quality1080p') }}</option>
              <option value="4k" v-if="isPremium">{{ t('workspace.export.quality4k') }}</option>
            </select>
          </div>

          <!-- 包含音频 -->
          <div class="setting-item" v-if="isVideoFormat">
            <label class="setting-toggle">
              <input
                type="checkbox"
                v-model="exportSettings.includeAudio"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">{{ t('workspace.export.includeAudio') }}</span>
            </label>
          </div>

          <!-- 水印设置 -->
          <div class="setting-item">
            <label class="setting-label">{{ t('workspace.export.watermark') }}</label>
            <select v-model="exportSettings.watermark" class="setting-select">
              <option value="none">{{ t('workspace.export.watermarkNone') }}</option>
              <option value="light" v-if="!isPremium">{{ t('workspace.export.watermarkLight') }}</option>
              <option value="premium" v-if="isPremium">{{ t('workspace.export.watermarkPremium') }}</option>
            </select>
          </div>

          <!-- 文件名设置 -->
          <div class="setting-item">
            <label class="setting-label">{{ t('workspace.export.filename') }}</label>
            <input
              type="text"
              v-model="exportSettings.filename"
              class="setting-input"
              :placeholder="t('workspace.export.filenamePlaceholder')"
            />
          </div>
        </div>
      </div>

      <!-- 导出预览 -->
      <div class="preview-section" v-if="showPreview">
        <h4 class="section-title">{{ t('workspace.export.preview') }}</h4>
        <div class="preview-content">
          <div class="preview-video" v-if="isVideoFormat">
            <video
              ref="previewVideo"
              :src="previewSrc"
              controls
              muted
              class="preview-player"
            ></video>
          </div>
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">{{ t('workspace.export.duration') }}:</span>
              <span class="info-value">{{ formatDuration(duration) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('workspace.export.size') }}:</span>
              <span class="info-value">{{ formatFileSize(estimatedSize) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('workspace.export.format') }}:</span>
              <span class="info-value">{{ getSelectedFormatName() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="action-btn secondary" @click="closePanel">
          {{ t('workspace.export.cancel') }}
        </button>
        <button
          class="action-btn primary"
          @click="startExport"
          :disabled="isExporting"
        >
          <svg v-if="isExporting" class="animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {{ isExporting ? t('workspace.export.exporting') : t('workspace.export.startExport') }}
        </button>
      </div>
    </div>

    <!-- 导出触发按钮 -->
    <button
      v-else
      class="export-trigger"
      @click="openPanel"
      :disabled="!canExport"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      {{ t('workspace.export.export') }}
    </button>

    <!-- 导出进度覆盖层 -->
    <div class="export-progress" v-if="isExporting">
      <div class="progress-modal">
        <div class="progress-header">
          <h3>{{ t('workspace.export.exporting') }}</h3>
          <div class="progress-percent">{{ exportProgress }}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: exportProgress + '%' }"></div>
        </div>
        <div class="progress-status">{{ currentExportStep }}</div>
        <div class="progress-time">{{ t('workspace.export.remaining') }}: {{ formatTime(estimatedTimeRemaining) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup name="ExportHandler">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 0
  },
  canExport: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  previewSrc: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits([
  'export-started',
  'export-completed',
  'export-cancelled',
  'panel-closed'
])

// 响应式数据
const showPanel = ref(false)
const selectedFormat = ref('mp4')
const isExporting = ref(false)
const exportProgress = ref(0)
const estimatedTimeRemaining = ref(0)
const currentExportStep = ref('')
const showPreview = ref(true)

// 导出设置
const exportSettings = ref({
  quality: '1080p',
  includeAudio: true,
  watermark: 'light',
  filename: ''
})

// 导出格式配置
const exportFormats = ref([
  {
    id: 'mp4',
    name: 'MP4 视频',
    description: '高清视频格式，支持所有设备',
    icon: 'VideoIcon',
    limits: '免费版: 720p | 付费版: 4K',
    badge: { text: '推荐', type: 'primary' }
  },
  {
    id: 'html',
    name: 'HTML 预览',
    description: '网页格式，保持完整交互功能',
    icon: 'GlobeIcon',
    badge: { text: '免费', type: 'success' }
  },
  {
    id: 'pdf',
    name: 'PDF 文档',
    description: '静态文档格式，便于分享和打印',
    icon: 'FileIcon'
  },
  {
    id: 'pptx',
    name: 'PPTX 文件',
    description: 'PowerPoint格式，支持编辑',
    icon: 'PresentationIcon',
    limits: '付费版专属',
    badge: { text: '付费', type: 'premium' }
  }
])

// 计算属性
const isVideoFormat = computed(() => {
  return ['mp4'].includes(selectedFormat.value)
})

const estimatedSize = computed(() => {
  const baseSize = props.duration * 1024 * 1024 // 1MB per second base
  const qualityMultiplier = {
    '720p': 1,
    '1080p': 2.5,
    '4k': 8
  }
  return baseSize * (qualityMultiplier[exportSettings.value.quality] || 1)
})

const getSelectedFormatName = () => {
  const format = exportFormats.value.find(f => f.id === selectedFormat.value)
  return format ? format.name : ''
}

// 工具函数
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTime = (seconds) => {
  if (seconds <= 0) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

// 事件处理
const openPanel = () => {
  if (!props.canExport) {
    ElMessage.warning(t('workspace.export.cannotExport'))
    return
  }
  showPanel.value = true
  emit('panel-opened')
}

const closePanel = () => {
  showPanel.value = false
  emit('panel-closed')
}

const selectFormat = (formatId) => {
  selectedFormat.value = formatId
  // 根据格式调整默认设置
  if (formatId === 'html') {
    exportSettings.value.quality = '1080p' // HTML保持高质量
  }
}

const startExport = async () => {
  if (!selectedFormat.value) {
    ElMessage.error(t('workspace.export.selectFormat'))
    return
  }

  if (!exportSettings.value.filename.trim()) {
    exportSettings.value.filename = `VidSlide_${new Date().toISOString().split('T')[0]}`
  }

  isExporting.value = true
  exportProgress.value = 0
  estimatedTimeRemaining.value = Math.ceil(props.duration * 0.1) // 估算导出时间

  emit('export-started', {
    format: selectedFormat.value,
    settings: exportSettings.value,
    filename: exportSettings.value.filename
  })

  try {
    // 模拟导出过程
    const steps = [
      t('workspace.export.steps.preparing'),
      t('workspace.export.steps.processing'),
      t('workspace.export.steps.rendering'),
      t('workspace.export.steps.finalizing')
    ]

    for (let i = 0; i < steps.length; i++) {
      currentExportStep.value = steps[i]
      await new Promise(resolve => setTimeout(resolve, 1000))

      exportProgress.value = Math.round(((i + 1) / steps.length) * 100)
      estimatedTimeRemaining.value = Math.max(0, estimatedTimeRemaining.value - 1)
    }

    emit('export-completed', {
      format: selectedFormat.value,
      filename: exportSettings.value.filename,
      size: estimatedSize.value
    })

    ElMessage.success(t('workspace.export.exportSuccess'))
    closePanel()

  } catch (error) {
    ElMessage.error(t('workspace.export.exportFailed'))
    emit('export-failed', error)
  } finally {
    isExporting.value = false
    exportProgress.value = 0
    estimatedTimeRemaining.value = 0
  }
}

// 监听visible属性变化
watch(() => props.visible, (newValue) => {
  showPanel.value = newValue
})

// 监听面板关闭事件
watch(showPanel, (newValue) => {
  if (!newValue) {
    emit('panel-closed')
  }
})

// 图标组件
const VideoIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="23,7 16,12 23,17 23,7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>`
}

const GlobeIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12,2a15.3,15.3 0 0,1 4,10 15.3,15.3 0 0,1 -4,10 15.3,15.3 0 0,1 -4,-10 15.3,15.3 0 0,1 4,-10z"/>
  </svg>`
}

const FileIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14,2H6a2,2 0 0,0 -2,2v16a2,2 0 0,0 2,2h12a2,2 0 0,0 2,-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>`
}

const PresentationIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>`
}

// 暴露方法给父组件
defineExpose({
  openPanel,
  closePanel,
  startExport
})
</script>

<style scoped>
.export-handler {
  position: relative;
  display: inline-block;
}

/* 导出触发按钮 */
.export-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-trigger:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.export-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-trigger svg {
  width: 16px;
  height: 16px;
}

/* 导出面板 */
.export-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* 格式选择 */
.format-section {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.format-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.format-card:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.format-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.format-icon {
  width: 40px;
  height: 40px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.format-card.active .format-icon {
  color: #3b82f6;
}

.format-info {
  flex: 1;
}

.format-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.format-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.format-limits {
  color: #9ca3af;
}

.format-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.badge.primary {
  background: #3b82f6;
  color: white;
}

.badge.success {
  background: #10b981;
  color: white;
}

.badge.premium {
  background: #f59e0b;
  color: white;
}

/* 设置区域 */
.settings-section {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-grid {
  display: grid;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-weight: 500;
  color: #374151;
}

.setting-select,
.setting-input {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.setting-select:focus,
.setting-input:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 切换开关 */
.setting-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 36px;
  height: 20px;
  background: #d1d5db;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(16px);
}

/* 预览区域 */
.preview-section {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-content {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 16px;
}

.preview-video {
  border-radius: 8px;
  overflow: hidden;
}

.preview-player {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
}

/* 操作按钮 */
.action-section {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #d1d5db;
}

.action-btn.secondary {
  background: white;
  color: #6b7280;
}

.action-btn.secondary:hover {
  background: #f9fafb;
  color: #374151;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 6px;
}

/* 导出进度 */
.export-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.progress-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 400px;
  text-align: center;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.progress-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.progress-percent {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-status {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 8px;
}

.progress-time {
  font-size: 14px;
  color: #9ca3af;
}

/* 动画效果 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .export-panel {
    width: 95vw;
    margin: 16px;
  }

  .format-grid {
    grid-template-columns: 1fr;
  }

  .preview-content {
    grid-template-columns: 1fr;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>