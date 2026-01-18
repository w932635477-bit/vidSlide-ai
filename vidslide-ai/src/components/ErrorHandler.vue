<template>
  <div class="error-handler">
    <!-- 全局错误覆盖层 -->
    <div v-if="hasGlobalError" class="error-overlay" @click.self="clearGlobalError">
      <div class="error-modal">
        <div class="error-header">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div class="error-info">
            <h3 class="error-title">{{ globalError.title || t('workspace.error.title') }}</h3>
            <p class="error-message">{{ globalError.message }}</p>
          </div>
        </div>

        <div v-if="globalError.details" class="error-details">
          <details>
            <summary>{{ t('workspace.error.showDetails') }}</summary>
            <pre class="error-stack">{{ globalError.details }}</pre>
          </details>
        </div>

        <div class="error-actions">
          <button class="action-btn secondary" @click="clearGlobalError">
            {{ t('workspace.error.close') }}
          </button>
          <button v-if="globalError.canRetry" class="action-btn primary" @click="retryLastAction">
            {{ t('workspace.error.retry') }}
          </button>
          <button v-if="globalError.showReport" class="action-btn secondary" @click="reportError">
            {{ t('workspace.error.report') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 内联错误提示 -->
    <div
      v-else-if="inlineErrors.length > 0"
      class="inline-errors"
      :class="{ 'has-multiple': inlineErrors.length > 1 }"
    >
      <div
        v-for="(error, index) in inlineErrors"
        :key="error.id || index"
        class="inline-error"
        :class="`severity-${error.severity || 'error'}`"
      >
        <div class="error-icon">
          <svg
            v-if="error.severity === 'warning'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <div class="error-content">
          <div class="error-title">{{ error.title || getErrorTitle(error.type) }}</div>
          <div class="error-message">{{ error.message }}</div>
          <div v-if="error.actions" class="error-actions">
            <button
              v-for="action in error.actions"
              :key="action.id"
              class="action-btn"
              :class="action.type || 'secondary'"
              @click="executeAction(action, error)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <button class="dismiss-btn" aria-label="关闭错误提示" @click="dismissError(error)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 错误历史记录 -->
    <div v-if="showErrorHistory && errorHistory.length > 0" class="error-history">
      <div class="history-header">
        <h4>{{ t('workspace.error.history') }}</h4>
        <button class="close-history" @click="showErrorHistory = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="history-list">
        <div
          v-for="error in errorHistory"
          :key="error.id"
          class="history-item"
          :class="`severity-${error.severity || 'error'}`"
        >
          <div class="history-time">{{ formatTime(error.timestamp) }}</div>
          <div class="history-content">
            <div class="history-title">{{ error.title }}</div>
            <div class="history-message">{{ error.message }}</div>
          </div>
          <div class="history-actions">
            <button @click="retryError(error)">{{ t('workspace.error.retry') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误统计面板 -->
    <div v-if="showStats" class="error-stats">
      <div class="stats-header">
        <h4>{{ t('workspace.error.stats') }}</h4>
        <button class="close-stats" @click="showStats = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">{{ t('workspace.error.totalErrors') }}:</span>
          <span class="stat-value">{{ errorStats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('workspace.error.criticalErrors') }}:</span>
          <span class="stat-value critical">{{ errorStats.critical }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('workspace.error.resolvedErrors') }}:</span>
          <span class="stat-value success">{{ errorStats.resolved }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('workspace.error.recoveryRate') }}:</span>
          <span class="stat-value">{{ Math.round(errorStats.recoveryRate * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ErrorHandler">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义组件属性
const props = defineProps({
  autoHide: {
    type: Boolean,
    default: true
  },
  maxInlineErrors: {
    type: Number,
    default: 3
  },
  enableStats: {
    type: Boolean,
    default: true
  }
})

// 定义组件事件
const emit = defineEmits(['error-added', 'error-resolved', 'error-retried', 'stats-requested'])

// 响应式数据
const globalError = ref(null)
const inlineErrors = ref([])
const errorHistory = ref([])
const showErrorHistory = ref(false)
const showStats = ref(false)

// 错误统计
const errorStats = ref({
  total: 0,
  critical: 0,
  resolved: 0,
  recoveryRate: 0
})

// 计算属性
const hasGlobalError = computed(() => !!globalError.value)

// 错误类型映射
const errorTypes = {
  network: {
    title: t('workspace.error.network.title'),
    severity: 'error',
    canRetry: true
  },
  upload: {
    title: t('workspace.error.upload.title'),
    severity: 'error',
    canRetry: true
  },
  processing: {
    title: t('workspace.error.processing.title'),
    severity: 'warning',
    canRetry: true
  },
  export: {
    title: t('workspace.error.export.title'),
    severity: 'error',
    canRetry: true
  },
  validation: {
    title: t('workspace.error.validation.title'),
    severity: 'warning',
    canRetry: false
  },
  permission: {
    title: t('workspace.error.permission.title'),
    severity: 'error',
    canRetry: false
  }
}

// 工具函数
const getErrorTitle = type => {
  return errorTypes[type]?.title || t('workspace.error.unknown.title')
}

const formatTime = timestamp => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const generateErrorId = () => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 主要方法
const addError = errorConfig => {
  const error = {
    id: generateErrorId(),
    timestamp: Date.now(),
    type: errorConfig.type || 'unknown',
    title: errorConfig.title,
    message: errorConfig.message,
    details: errorConfig.details,
    severity: errorConfig.severity || errorTypes[errorConfig.type]?.severity || 'error',
    canRetry:
      errorConfig.canRetry !== undefined
        ? errorConfig.canRetry
        : errorTypes[errorConfig.type]?.canRetry,
    actions: errorConfig.actions,
    autoHide: errorConfig.autoHide !== undefined ? errorConfig.autoHide : props.autoHide,
    showReport: errorConfig.showReport || false
  }

  // 更新统计
  errorStats.value.total++
  if (error.severity === 'error') {
    errorStats.value.critical++
  }

  // 添加到历史记录
  errorHistory.value.unshift(error)

  // 限制历史记录数量
  if (errorHistory.value.length > 50) {
    errorHistory.value = errorHistory.value.slice(0, 50)
  }

  // 根据严重程度决定显示方式
  if (error.severity === 'error' && !globalError.value) {
    // 严重错误显示全局模态框
    globalError.value = error
  } else {
    // 其他错误显示内联提示
    inlineErrors.value.unshift(error)

    // 限制内联错误数量
    if (inlineErrors.value.length > props.maxInlineErrors) {
      inlineErrors.value = inlineErrors.value.slice(0, props.maxInlineErrors)
    }

    // 自动隐藏
    if (error.autoHide) {
      setTimeout(() => {
        dismissError(error)
      }, 5000)
    }
  }

  emit('error-added', error)
  return error
}

const clearGlobalError = () => {
  if (globalError.value) {
    errorHistory.value.unshift(globalError.value)
    globalError.value = null
  }
}

const dismissError = error => {
  const index = inlineErrors.value.findIndex(e => e.id === error.id)
  if (index > -1) {
    inlineErrors.value.splice(index, 1)
    errorStats.value.resolved++
    emit('error-resolved', error)
  }
}

const retryLastAction = () => {
  if (globalError.value) {
    emit('error-retried', globalError.value)
    clearGlobalError()
  }
}

const retryError = error => {
  emit('error-retried', error)
}

const executeAction = (action, error) => {
  if (action.handler) {
    action.handler(error)
  }
  dismissError(error)
}

const reportError = () => {
  if (globalError.value) {
    const reportData = {
      error: globalError.value,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      stats: errorStats.value
    }

    // 这里可以发送错误报告到服务器
    console.log('Error Report:', reportData)
    ElMessage.success(t('workspace.error.reportSent'))

    clearGlobalError()
  }
}

// 预定义错误处理方法
const handleNetworkError = () => {
  addError({
    type: 'network',
    title: t('workspace.error.network.title'),
    message: t('workspace.error.network.message'),
    canRetry: true,
    actions: [
      {
        id: 'retry',
        label: t('workspace.error.retry'),
        type: 'primary',
        handler: () => emit('retry-network')
      }
    ]
  })
}

const handleUploadError = (fileName, reason) => {
  addError({
    type: 'upload',
    title: t('workspace.error.upload.title'),
    message: `${t('workspace.error.upload.message')}: ${fileName} - ${reason}`,
    canRetry: true
  })
}

const handleProcessingError = (stage, details) => {
  addError({
    type: 'processing',
    title: t('workspace.error.processing.title'),
    message: `${t('workspace.error.processing.message')}: ${stage}`,
    details: details,
    canRetry: true
  })
}

const handleValidationError = (field, message) => {
  addError({
    type: 'validation',
    title: t('workspace.error.validation.title'),
    message: `${field}: ${message}`,
    canRetry: false
  })
}

// 统计更新
const updateStats = () => {
  const total = errorHistory.value.length
  const resolved = errorHistory.value.filter(e => e.resolved).length
  errorStats.value.recoveryRate = total > 0 ? resolved / total : 0
}

// 监听错误历史变化
watch(() => errorHistory.value.length, updateStats)

// 全局错误监听器
const handleGlobalError = event => {
  addError({
    type: 'runtime',
    title: t('workspace.error.runtime.title'),
    message: event.message || t('workspace.error.runtime.message'),
    details: event.stack,
    severity: 'error'
  })
}

const handleUnhandledRejection = event => {
  addError({
    type: 'promise',
    title: t('workspace.error.promise.title'),
    message: event.reason?.message || t('workspace.error.promise.message'),
    details: event.reason?.stack,
    severity: 'error'
  })
}

// 生命周期
onMounted(() => {
  // 添加全局错误监听器
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onUnmounted(() => {
  // 移除全局错误监听器
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})

// 暴露方法给父组件
defineExpose({
  addError,
  clearGlobalError,
  dismissError,
  handleNetworkError,
  handleUploadError,
  handleProcessingError,
  handleValidationError,
  showHistory: () => (showErrorHistory.value = true),
  showStats: () => (showStats.value = true),
  getStats: () => errorStats.value,
  getHistory: () => errorHistory.value
})
</script>

<style scoped>
.error-handler {
  position: relative;
  z-index: 1000;
}

/* 全局错误覆盖层 */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.error-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 80vh;
  overflow-y: auto;
}

.error-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-info {
  flex: 1;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
}

.error-message {
  color: #7f1d1d;
  line-height: 1.5;
}

.error-details {
  margin-bottom: 24px;
}

.error-details details {
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fef2f2;
}

.error-details summary {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 500;
  color: #dc2626;
}

.error-details summary:hover {
  background: #fee2e2;
}

.error-stack {
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #fecaca;
  font-family: monospace;
  font-size: 12px;
  color: #991b1b;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 内联错误提示 */
.inline-errors {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1500;
  max-width: 400px;
}

.inline-errors.has-multiple {
  max-width: 450px;
}

.inline-error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.inline-error.severity-error {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.inline-error.severity-warning {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.inline-error.severity-info {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.inline-error.severity-error .error-title {
  color: #dc2626;
}

.inline-error.severity-warning .error-title {
  color: #d97706;
}

.inline-error.severity-info .error-title {
  color: #1d4ed8;
}

.error-message {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.inline-error.severity-error .error-message {
  color: #7f1d1d;
}

.inline-error.severity-warning .error-message {
  color: #92400e;
}

.inline-error.severity-info .error-message {
  color: #1e40af;
}

.error-actions {
  display: flex;
  gap: 8px;
}

.dismiss-btn {
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
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.dismiss-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.dismiss-btn svg {
  width: 16px;
  height: 16px;
}

/* 错误历史记录 */
.error-history {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 350px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.history-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-history {
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
}

.close-history:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-history svg {
  width: 16px;
  height: 16px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.history-item:hover {
  background: #f9fafb;
}

.history-item.severity-error {
  border-left: 3px solid #ef4444;
}

.history-item.severity-warning {
  border-left: 3px solid #f59e0b;
}

.history-item.severity-info {
  border-left: 3px solid #3b82f6;
}

.history-time {
  font-size: 12px;
  color: #9ca3af;
  min-width: 60px;
}

.history-content {
  flex: 1;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.history-message {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}

.history-actions {
  display: flex;
  align-items: center;
}

.history-actions button {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-actions button:hover {
  border-color: #9ca3af;
  color: #374151;
}

/* 错误统计面板 */
.error-stats {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1500;
  overflow: hidden;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.stats-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-stats {
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
}

.close-stats:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-stats svg {
  width: 16px;
  height: 16px;
}

.stats-content {
  padding: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.stat-value.critical {
  color: #dc2626;
}

.stat-value.success {
  color: #059669;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.secondary:hover {
  border-color: #9ca3af;
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

/* 动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .error-modal {
    width: 95vw;
    padding: 24px;
  }

  .error-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .error-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .inline-errors {
    left: 10px;
    right: 10px;
    max-width: none;
  }

  .error-history,
  .error-stats {
    left: 10px;
    right: 10px;
    width: auto;
  }
}
</style>
