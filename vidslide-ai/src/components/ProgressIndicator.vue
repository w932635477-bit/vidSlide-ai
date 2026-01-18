<template>
  <div v-if="visible" class="progress-indicator">
    <!-- 进度模态框 -->
    <div class="progress-overlay" @click.self="handleCancel">
      <div class="progress-modal">
        <!-- 头部信息 -->
        <div class="progress-header">
          <div class="progress-icon">
            <svg
              v-if="currentStage.icon === 'analyze'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16 10,8" />
            </svg>
            <svg
              v-else-if="currentStage.icon === 'template'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <svg
              v-else-if="currentStage.icon === 'render'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <svg v-else class="animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                class="opacity-25"
              />
              <path
                fill="currentColor"
                class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          <div class="progress-info">
            <h3 class="progress-title">{{ currentStage.title }}</h3>
            <p class="progress-description">{{ currentStage.description }}</p>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="progress-text">
            <span class="progress-percent">{{ progressPercent }}%</span>
            <span class="progress-time">{{ formatTime(estimatedTimeRemaining) }}</span>
          </div>
        </div>

        <!-- 阶段指示器 -->
        <div class="stages-indicator">
          <div
            v-for="(stage, index) in stages"
            :key="stage.id"
            class="stage-item"
            :class="{
              active: stage.id === currentStageId,
              completed: stage.status === 'completed',
              pending: stage.status === 'pending'
            }"
          >
            <div class="stage-dot">
              <svg
                v-if="stage.status === 'completed'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              <span v-else-if="stage.status === 'active'">{{ index + 1 }}</span>
              <span v-else class="pending-dot"></span>
            </div>
            <div class="stage-label">{{ stage.label }}</div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div v-if="showDetails" class="progress-details">
          <div class="detail-item">
            <span class="detail-label">{{ t('workspace.progress.processedFrames') }}:</span>
            <span class="detail-value">{{ processedFrames }}/{{ totalFrames }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('workspace.progress.templatesMatched') }}:</span>
            <span class="detail-value">{{ matchedTemplates }}/{{ availableTemplates }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ t('workspace.progress.materialsLoaded') }}:</span>
            <span class="detail-value">{{ loadedMaterials }}/{{ requiredMaterials }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="progress-actions">
          <button v-if="canCancel" class="action-btn secondary" @click="handleCancel">
            {{ t('workspace.progress.cancel') }}
          </button>

          <button class="action-btn primary" @click="toggleDetails">
            {{
              showDetails
                ? t('workspace.progress.hideDetails')
                : t('workspace.progress.showDetails')
            }}
          </button>

          <button v-if="canMinimize" class="action-btn secondary" @click="handleMinimize">
            {{ t('workspace.progress.minimize') }}
          </button>
        </div>

        <!-- 错误状态 -->
        <div v-if="hasError" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h4 class="error-title">{{ t('workspace.progress.errorTitle') }}</h4>
          <p class="error-message">{{ errorMessage }}</p>
          <button class="retry-btn" @click="handleRetry">
            {{ t('workspace.progress.retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 迷你进度条（最小化时显示） -->
    <div v-if="minimized" class="mini-progress">
      <div class="mini-content">
        <div class="mini-icon">
          <svg class="animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              class="opacity-25"
            />
            <path
              fill="currentColor"
              class="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div class="mini-info">
          <div class="mini-title">{{ currentStage.title }}</div>
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <button class="mini-restore-btn" @click="handleRestore">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,3 21,3 21,9" />
            <polyline points="9,21 3,21 3,15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup name="ProgressIndicator">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

// 国际化 - 必须在使用 t() 之前调用
const { t } = useI18n()

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentStageId: {
    type: String,
    default: 'analyze'
  },
  progress: {
    type: Number,
    default: 0
  },
  estimatedTimeRemaining: {
    type: Number,
    default: 0
  },
  canCancel: {
    type: Boolean,
    default: true
  },
  canMinimize: {
    type: Boolean,
    default: true
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  // 详细统计数据
  processedFrames: {
    type: Number,
    default: 0
  },
  totalFrames: {
    type: Number,
    default: 0
  },
  matchedTemplates: {
    type: Number,
    default: 0
  },
  availableTemplates: {
    type: Number,
    default: 0
  },
  loadedMaterials: {
    type: Number,
    default: 0
  },
  requiredMaterials: {
    type: Number,
    default: 0
  }
})

// 定义组件事件
const emit = defineEmits(['cancel', 'minimize', 'restore', 'retry'])

// 响应式数据
const showDetails = ref(false)
const minimized = ref(false)

// 进度阶段配置
const stages = ref([
  {
    id: 'analyze',
    label: t('workspace.progress.stages.analyze'),
    title: t('workspace.progress.stages.analyzeTitle'),
    description: t('workspace.progress.stages.analyzeDesc'),
    icon: 'analyze',
    status: 'pending'
  },
  {
    id: 'template',
    label: t('workspace.progress.stages.template'),
    title: t('workspace.progress.stages.templateTitle'),
    description: t('workspace.progress.stages.templateDesc'),
    icon: 'template',
    status: 'pending'
  },
  {
    id: 'render',
    label: t('workspace.progress.stages.render'),
    title: t('workspace.progress.stages.renderTitle'),
    description: t('workspace.progress.stages.renderDesc'),
    icon: 'render',
    status: 'pending'
  }
])

// 计算属性
const currentStage = computed(() => {
  return stages.value.find(stage => stage.id === props.currentStageId) || stages.value[0]
})

const progressPercent = computed(() => {
  return Math.min(100, Math.max(0, Math.round(props.progress)))
})

// 更新阶段状态
watch(
  () => props.currentStageId,
  newStageId => {
    stages.value.forEach(stage => {
      if (stage.id === newStageId) {
        stage.status = 'active'
      } else if (
        stages.value.findIndex(s => s.id === stage.id) <
        stages.value.findIndex(s => s.id === newStageId)
      ) {
        stage.status = 'completed'
      } else {
        stage.status = 'pending'
      }
    })
  },
  { immediate: true }
)

// 工具函数
const formatTime = seconds => {
  if (seconds <= 0) return t('workspace.progress.timeUnknown')

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${secs}s`
  }
}

// 事件处理
const handleCancel = () => {
  emit('cancel')
}

const handleMinimize = () => {
  minimized.value = true
  emit('minimize')
}

const handleRestore = () => {
  minimized.value = false
  emit('restore')
}

const handleRetry = () => {
  emit('retry')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// 暴露方法给父组件
defineExpose({
  showDetails: () => (showDetails.value = true),
  hideDetails: () => (showDetails.value = false),
  minimize: () => handleMinimize(),
  restore: () => handleRestore()
})
</script>

<style scoped>
/* 进度指示器容器 */
.progress-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

/* 进度遮罩层 */
.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

/* 进度模态框 */
.progress-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
}

/* 进度头部 */
.progress-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.progress-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-icon svg {
  width: 100%;
  height: 100%;
}

.progress-info {
  flex: 1;
}

.progress-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.progress-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

/* 进度条容器 */
.progress-bar-container {
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
}

.progress-percent {
  font-weight: 500;
  color: #1f2937;
}

/* 阶段指示器 */
.stages-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
}

.stages-indicator::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.stage-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.stage-item.pending .stage-dot {
  background: #d1d5db;
}

.stage-item.active .stage-dot {
  background: #3b82f6;
  transform: scale(1.1);
}

.stage-item.completed .stage-dot {
  background: #10b981;
}

.stage-item.completed .stage-dot svg {
  width: 12px;
  height: 12px;
}

.pending-dot {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
}

.stage-label {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  max-width: 80px;
}

.stage-item.active .stage-label {
  color: #1f2937;
  font-weight: 500;
}

/* 进度详细信息 */
.progress-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* 操作按钮 */
.progress-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary:hover {
  background: #f9fafb;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 24px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin: 0 auto 16px;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: 16px;
  line-height: 1.5;
}

.retry-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #dc2626;
}

/* 迷你进度条 */
.mini-progress {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1001;
  pointer-events: all;
}

.mini-content {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.mini-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.mini-icon svg {
  width: 100%;
  height: 100%;
}

.mini-info {
  flex: 1;
}

.mini-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.mini-progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.mini-restore-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mini-restore-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.mini-restore-btn svg {
  width: 16px;
  height: 16px;
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
  .progress-modal {
    width: 95vw;
    padding: 24px;
  }

  .progress-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .stages-indicator {
    flex-direction: column;
    gap: 16px;
  }

  .stages-indicator::before {
    left: 12px;
    right: 12px;
    top: 12px;
    height: calc(100% - 24px);
    width: 2px;
    left: 50%;
    transform: translateX(-50%);
  }

  .mini-content {
    min-width: 280px;
  }
}
</style>
