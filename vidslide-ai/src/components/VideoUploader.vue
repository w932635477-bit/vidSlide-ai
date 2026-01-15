<template>
  <div class="video-uploader">
    <!-- 上传区域 -->
    <div
      v-if="!videoFile"
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileSelect"
    >
      <div class="upload-content">
        <!-- 上传图标 -->
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <path d="M10 12l2 2 4-4"/>
          </svg>
        </div>

        <!-- 上传标题 -->
        <h3 class="upload-title">{{ t('workspace.upload.title') }}</h3>

        <!-- 上传描述 -->
        <p class="upload-description">{{ t('workspace.upload.desc') }}</p>

        <!-- 选择文件按钮 -->
        <div class="upload-actions">
          <button class="upload-btn primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ t('workspace.upload.button') }}
          </button>
        </div>

        <!-- 支持格式提示 -->
        <div class="format-hint">
          <small>{{ t('workspace.upload.supportedFormats') }}: MP4, AVI, MOV, WMV</small>
          <br>
          <small>{{ t('workspace.upload.maxSize') }}: 500MB</small>
        </div>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept="video/*"
        @change="handleFileSelect"
        style="display: none;"
      />
    </div>

    <!-- 上传进度区域 -->
    <div v-else-if="isUploading" class="upload-progress">
      <div class="progress-content">
        <div class="progress-icon">
          <svg class="animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>

        <h4 class="progress-title">{{ t('workspace.upload.uploading') }}</h4>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>

        <div class="progress-text">
          {{ uploadProgress }}% {{ t('workspace.upload.completed') }}
        </div>

        <button
          v-if="canCancel"
          class="cancel-btn"
          @click="cancelUpload"
        >
          {{ t('workspace.upload.cancel') }}
        </button>
      </div>
    </div>

    <!-- 上传完成区域 -->
    <div v-else class="upload-success">
      <div class="success-content">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <h4 class="success-title">{{ t('workspace.upload.uploadSuccess') }}</h4>

        <div class="file-info">
          <div class="file-name">{{ videoFile.name }}</div>
          <div class="file-size">{{ formatFileSize(videoFile.size) }}</div>
        </div>

        <div class="success-actions">
          <button class="action-btn secondary" @click="clearUpload">
            {{ t('workspace.upload.uploadAnother') }}
          </button>
          <button class="action-btn primary" @click="$emit('video-uploaded', videoFile)">
            {{ t('workspace.upload.startAnalysis') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="upload-error">
      <div class="error-content">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <h4 class="error-title">{{ t('workspace.upload.uploadError') }}</h4>
        <p class="error-message">{{ error }}</p>

        <button class="retry-btn" @click="clearUpload">
          {{ t('workspace.upload.tryAgain') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup name="VideoUploader">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()

// 定义组件属性
const props = defineProps({
  maxSize: {
    type: Number,
    default: 500 * 1024 * 1024 // 500MB
  },
  acceptedFormats: {
    type: Array,
    default: () => ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo']
  }
})

// 定义组件事件
const emit = defineEmits(['video-uploaded', 'upload-cancelled'])

// 响应式数据
const fileInput = ref(null)
const videoFile = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const canCancel = ref(true)

// 计算属性
const supportedFormatsText = computed(() => {
  return props.acceptedFormats.map(format => {
    switch(format) {
      case 'video/mp4': return 'MP4'
      case 'video/avi': return 'AVI'
      case 'video/quicktime': return 'MOV'
      case 'video/x-msvideo': return 'WMV'
      default: return format.split('/')[1].toUpperCase()
    }
  }).join(', ')
})

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 验证文件
const validateFile = (file) => {
  // 检查文件类型
  if (!props.acceptedFormats.includes(file.type)) {
    return t('workspace.upload.errors.invalidFormat')
  }

  // 检查文件大小
  if (file.size > props.maxSize) {
    return t('workspace.upload.errors.fileTooLarge', { maxSize: formatFileSize(props.maxSize) })
  }

  return null
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 处理文件
const processFile = async (file) => {
  // 验证文件
  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError
    ElMessage.error(validationError)
    return
  }

  // 清空错误
  error.value = ''

  // 开始上传
  videoFile.value = file
  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value += Math.random() * 15
      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100
        clearInterval(progressInterval)

        // 上传完成
        setTimeout(() => {
          isUploading.value = false
          ElMessage.success(t('workspace.upload.uploadSuccess'))
        }, 500)
      }
    }, 200)

  } catch (err) {
    error.value = t('workspace.upload.errors.uploadFailed')
    isUploading.value = false
    ElMessage.error(error.value)
  }
}

// 取消上传
const cancelUpload = () => {
  isUploading.value = false
  videoFile.value = null
  uploadProgress.value = 0
  emit('upload-cancelled')
  ElMessage.info(t('workspace.upload.uploadCancelled'))
}

// 清空上传
const clearUpload = () => {
  videoFile.value = null
  isUploading.value = false
  uploadProgress.value = 0
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 暴露方法给父组件
defineExpose({
  clearUpload,
  cancelUpload
})
</script>

<style scoped>
.video-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #10b981;
  background: #f0fdf4;
  transform: scale(1.02);
}

/* 上传内容 */
.upload-content {
  max-width: 400px;
  margin: 0 auto;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #6b7280;
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}

.upload-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.upload-description {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* 上传操作 */
.upload-actions {
  margin-bottom: 16px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.upload-btn.primary {
  background: #3b82f6;
  color: white;
}

.upload-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.upload-btn svg {
  width: 20px;
  height: 20px;
}

/* 格式提示 */
.format-hint {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.4;
}

.format-hint small {
  display: block;
}

/* 上传进度样式 */
.upload-progress {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: #ffffff;
}

.progress-content {
  max-width: 400px;
  margin: 0 auto;
}

.progress-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  color: #3b82f6;
}

.progress-icon svg {
  width: 100%;
  height: 100%;
}

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

.progress-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

/* 上传成功样式 */
.upload-success {
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  background: #f0fdf4;
}

.success-content {
  max-width: 400px;
  margin: 0 auto;
}

.success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  color: #10b981;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 16px;
}

.file-info {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #d1fae5;
}

.file-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  font-size: 14px;
  color: #6b7280;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
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
  border-color: #9ca3af;
  color: #374151;
}

.action-btn.primary {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.action-btn.primary:hover {
  background: #059669;
}

/* 错误提示样式 */
.upload-error {
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  background: #fef2f2;
}

.error-content {
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  color: #ef4444;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 8px;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.retry-btn {
  padding: 10px 20px;
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

/* 响应式设计 */
@media (max-width: 640px) {
  .upload-area {
    padding: 24px 16px;
  }

  .upload-title {
    font-size: 20px;
  }

  .upload-description {
    font-size: 14px;
  }

  .upload-btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .success-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>