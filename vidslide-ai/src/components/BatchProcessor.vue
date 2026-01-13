<template>
  <div class="batch-processor">
    <div class="processor-header">
      <h3>批量处理</h3>
      <div class="processing-status">
        <span class="status-indicator" :class="overallStatusClass"></span>
        <span class="status-text">{{ overallStatusText }}</span>
        <span class="progress-summary" v-if="totalFiles > 0">
          {{ completedFiles }}/{{ totalFiles }} 已完成
        </span>
      </div>
    </div>

    <div class="processor-content">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <div class="upload-area" :class="{ 'drag-over': isDragOver }" @dragover.prevent @dragleave.prevent @drop.prevent="handleDrop">
          <div class="upload-content">
            <div class="upload-icon">📁</div>
            <div class="upload-text">
              <p>拖拽视频文件到此处，或 <label for="file-input" class="upload-link">点击选择文件</label></p>
              <p class="upload-hint">支持 MP4、AVI、MOV、MKV 等格式，单个文件最大 500MB</p>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept="video/*"
              @change="handleFileSelect"
              class="file-input"
              ref="fileInput"
            />
          </div>
        </div>

        <!-- 已选择的文件列表 -->
        <div class="file-list" v-if="files.length > 0">
          <div class="file-list-header">
            <span>已选择的文件 ({{ files.length }})</span>
            <button class="clear-btn" @click="clearFiles" :disabled="isProcessing">
              清空列表
            </button>
          </div>
          <div class="file-items">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="file-item"
              :class="{ 'processing': file.status === 'processing', 'completed': file.status === 'completed', 'error': file.status === 'error' }"
            >
              <div class="file-info">
                <div class="file-icon">🎬</div>
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <div class="file-status">
                <div class="status-icon" :class="file.status">
                  <span v-if="file.status === 'pending'">⏳</span>
                  <span v-else-if="file.status === 'processing'">⚙️</span>
                  <span v-else-if="file.status === 'completed'">✅</span>
                  <span v-else-if="file.status === 'error'">❌</span>
                </div>
                <div class="progress-bar" v-if="file.status === 'processing'">
                  <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
                </div>
                <button
                  class="remove-btn"
                  @click="removeFile(index)"
                  :disabled="isProcessing"
                  v-if="file.status !== 'processing'"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理设置 -->
      <div class="settings-section">
        <label class="settings-label">处理设置</label>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">输出格式:</label>
            <select v-model="processingSettings.outputFormat" :disabled="isProcessing" aria-label="输出格式选择">
              <option value="mp4">MP4 (推荐)</option>
              <option value="webm">WebM</option>
              <option value="avi">AVI</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">分辨率:</label>
            <select v-model="processingSettings.resolution" :disabled="isProcessing" aria-label="分辨率选择">
              <option value="original">保持原分辨率</option>
              <option value="1080p">1080p (全高清)</option>
              <option value="720p">720p (高清)</option>
              <option value="480p">480p (标清)</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">质量:</label>
            <select v-model="processingSettings.quality" :disabled="isProcessing" aria-label="质量选择">
              <option value="high">高质量 (大文件)</option>
              <option value="medium">中等质量 (平衡)</option>
              <option value="low">低质量 (小文件)</option>
            </select>
          </div>

          <div class="setting-item">
            <label class="setting-label">并发处理:</label>
            <select v-model="processingSettings.concurrency" :disabled="isProcessing" aria-label="并发处理数量选择">
              <option value="1">1个文件 (稳定)</option>
              <option value="2">2个文件</option>
              <option value="3">3个文件 (推荐)</option>
              <option value="5">5个文件 (快速)</option>
            </select>
          </div>
        </div>

        <div class="settings-options">
          <label class="option-item">
            <input
              type="checkbox"
              v-model="processingSettings.extractAudio"
              :disabled="isProcessing"
              aria-label="提取音频轨道"
            />
            <span class="option-label">提取音频轨道</span>
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="processingSettings.generateThumbnails"
              :disabled="isProcessing"
              aria-label="生成缩略图"
            />
            <span class="option-label">生成缩略图</span>
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="processingSettings.optimizeForWeb"
              :disabled="isProcessing"
              aria-label="Web优化 (H.264编码)"
            />
            <span class="option-label">Web优化 (H.264编码)</span>
          </label>
        </div>
      </div>

      <!-- 总体进度 -->
      <div class="progress-section" v-if="isProcessing || completedFiles > 0">
        <div class="overall-progress">
          <div class="progress-info">
            <span class="progress-label">总体进度</span>
            <span class="progress-percentage">{{ overallProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <div class="progress-details">
            <span>已完成: {{ completedFiles }}</span>
            <span>处理中: {{ processingFiles }}</span>
            <span>失败: {{ failedFiles }}</span>
            <span>剩余: {{ remainingFiles }}</span>
          </div>
        </div>
      </div>

      <!-- 错误汇总 -->
      <div class="errors-section" v-if="errors.length > 0">
        <div class="errors-header">
          <span class="errors-title">处理错误 ({{ errors.length }})</span>
          <button class="clear-errors-btn" @click="clearErrors">清空错误</button>
        </div>
        <div class="error-list">
          <div v-for="(error, index) in errors" :key="index" class="error-item">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <div class="error-file">{{ error.fileName }}</div>
              <div class="error-message">{{ error.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="processor-footer">
      <div class="stats-info" v-if="files.length > 0">
        <span>总大小: {{ formatFileSize(totalSize) }}</span>
        <span>预计时间: {{ estimatedTime }}</span>
      </div>
      <div class="action-buttons">
        <button class="cancel-btn" @click="cancelProcessing" v-if="isProcessing">
          取消处理
        </button>
        <button
          class="start-btn"
          @click="startProcessing"
          :disabled="!canStartProcessing"
        >
          {{ isProcessing ? '处理中...' : '开始处理' }}
        </button>
        <button
          class="export-btn"
          @click="exportResults"
          :disabled="!canExportResults"
          v-if="completedFiles > 0"
        >
          导出结果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 组件状态
const files = ref([])
const isProcessing = ref(false)
const isDragOver = ref(false)
const errors = ref([])
const processingSettings = ref({
  outputFormat: 'mp4',
  resolution: 'original',
  quality: 'medium',
  concurrency: '3',
  extractAudio: false,
  generateThumbnails: true,
  optimizeForWeb: true
})

// DOM引用
const fileInput = ref(null)

// 计算属性
const totalFiles = computed(() => files.value.length)
const completedFiles = computed(() => files.value.filter(f => f.status === 'completed').length)
const processingFiles = computed(() => files.value.filter(f => f.status === 'processing').length)
const failedFiles = computed(() => files.value.filter(f => f.status === 'error').length)
const remainingFiles = computed(() => totalFiles.value - completedFiles.value - processingFiles.value - failedFiles.value)

const overallProgress = computed(() => {
  if (totalFiles.value === 0) return 0
  const totalProgress = files.value.reduce((sum, file) => {
    if (file.status === 'completed') return sum + 100
    if (file.status === 'processing') return sum + (file.progress || 0)
    return sum
  }, 0)
  return Math.round(totalProgress / totalFiles.value)
})

const overallStatusClass = computed(() => {
  if (isProcessing.value) return 'status-processing'
  if (failedFiles.value > 0) return 'status-error'
  if (completedFiles.value === totalFiles.value && totalFiles.value > 0) return 'status-completed'
  return 'status-idle'
})

const overallStatusText = computed(() => {
  if (isProcessing.value) return '处理中'
  if (failedFiles.value > 0) return '部分失败'
  if (completedFiles.value === totalFiles.value && totalFiles.value > 0) return '全部完成'
  return '等待开始'
})

const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0))

const estimatedTime = computed(() => {
  if (totalFiles.value === 0) return '未知'
  // 估算每个文件处理时间（根据文件大小和设置）
  const avgSize = totalSize.value / totalFiles.value
  const baseTimePerMB = 2 // 2秒/MB
  const settingsMultiplier = getSettingsMultiplier()
  const avgTimePerFile = (avgSize / (1024 * 1024)) * baseTimePerMB * settingsMultiplier
  const totalTime = avgTimePerFile * totalFiles.value / parseInt(processingSettings.value.concurrency)
  return formatTime(totalTime)
})

const canStartProcessing = computed(() => {
  return files.value.length > 0 &&
         files.value.some(f => f.status === 'pending') &&
         !isProcessing.value
})

const canExportResults = computed(() => {
  return completedFiles.value > 0 && !isProcessing.value
})

// 方法
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
  // 重置input值，允许选择相同文件
  event.target.value = ''
}

const handleDrop = (event) => {
  isDragOver.value = false
  const droppedFiles = Array.from(event.dataTransfer.files)
  const videoFiles = droppedFiles.filter(file => file.type.startsWith('video/'))
  if (videoFiles.length > 0) {
    addFiles(videoFiles)
  } else {
    emit('error', '请只拖拽视频文件')
  }
}

const addFiles = (newFiles) => {
  const validFiles = newFiles.filter(file => {
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      emit('error', `${file.name} 不是有效的视频文件`)
      return false
    }
    // 检查文件大小 (500MB)
    if (file.size > 500 * 1024 * 1024) {
      emit('error', `${file.name} 文件过大，请选择小于500MB的文件`)
      return false
    }
    // 检查是否已存在
    if (files.value.some(f => f.name === file.name && f.size === file.size)) {
      emit('error', `${file.name} 已存在于列表中`)
      return false
    }
    return true
  })

  const fileObjects = validFiles.map(file => ({
    file,
    name: file.name,
    size: file.size,
    status: 'pending',
    progress: 0,
    result: null,
    error: null
  }))

  files.value.push(...fileObjects)
  emit('files-added', fileObjects)
}

const removeFile = (index) => {
  if (!isProcessing.value) {
    files.value.splice(index, 1)
    emit('file-removed', index)
  }
}

const clearFiles = () => {
  if (!isProcessing.value) {
    files.value = []
    errors.value = []
    emit('files-cleared')
  }
}

const startProcessing = async () => {
  if (!canStartProcessing.value) return

  isProcessing.value = true
  errors.value = []

  const concurrency = parseInt(processingSettings.value.concurrency)
  const pendingFiles = files.value.filter(f => f.status === 'pending')

  // 分批处理文件
  for (let i = 0; i < pendingFiles.length; i += concurrency) {
    const batch = pendingFiles.slice(i, i + concurrency)
    const promises = batch.map(file => processFile(file))

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('批处理出错:', error)
    }
  }

  isProcessing.value = false
  emit('processing-completed', {
    completed: completedFiles.value,
    failed: failedFiles.value,
    total: totalFiles.value
  })
}

const processFile = async (fileObj) => {
  fileObj.status = 'processing'
  fileObj.progress = 0

  try {
    // 模拟处理过程
    const totalSteps = 10
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
      fileObj.progress = (step / totalSteps) * 100

      // 随机模拟错误
      if (Math.random() < 0.1) { // 10%错误率
        throw new Error('处理过程中出现未知错误')
      }
    }

    fileObj.status = 'completed'
    fileObj.result = {
      outputPath: `/processed/${fileObj.name}`,
      duration: Math.floor(Math.random() * 3600), // 随机时长
      size: Math.floor(fileObj.size * 0.8) // 压缩后大小
    }

    emit('file-processed', { file: fileObj, success: true })

  } catch (error) {
    fileObj.status = 'error'
    fileObj.error = error.message
    errors.value.push({
      fileName: fileObj.name,
      message: error.message
    })

    emit('file-processed', { file: fileObj, success: false, error: error.message })
  }
}

const cancelProcessing = () => {
  isProcessing.value = false
  // 重置所有处理中的文件
  files.value.forEach(file => {
    if (file.status === 'processing') {
      file.status = 'pending'
      file.progress = 0
    }
  })
  emit('processing-cancelled')
}

const exportResults = () => {
  const results = files.value.filter(f => f.status === 'completed').map(f => ({
    originalName: f.name,
    outputPath: f.result.outputPath,
    duration: f.result.duration,
    size: f.result.size
  }))

  emit('results-exported', results)
}

const clearErrors = () => {
  errors.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`
  return `${Math.ceil(seconds / 3600)}小时`
}

const getSettingsMultiplier = () => {
  let multiplier = 1

  // 根据质量设置调整
  if (processingSettings.value.quality === 'high') multiplier *= 1.5
  else if (processingSettings.value.quality === 'low') multiplier *= 0.7

  // 根据分辨率调整
  if (processingSettings.value.resolution !== 'original') multiplier *= 1.2

  // 根据额外选项调整
  if (processingSettings.value.extractAudio) multiplier *= 1.1
  if (processingSettings.value.generateThumbnails) multiplier *= 1.05
  if (processingSettings.value.optimizeForWeb) multiplier *= 1.3

  return multiplier
}

// 拖拽事件处理
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

// 生命周期
onMounted(() => {
  // 添加拖拽事件监听
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('dragleave', handleDragLeave)
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('dragover', handleDragOver)
  document.removeEventListener('dragleave', handleDragLeave)
})

// 事件定义
const emit = defineEmits([
  'files-added',
  'file-removed',
  'files-cleared',
  'file-processed',
  'processing-completed',
  'processing-cancelled',
  'results-exported',
  'error'
])
</script>

<style scoped>
.batch-processor {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 800px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.processor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.processor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.status-idle {
  background: #86868b;
}

.status-indicator.status-processing {
  background: #007aff;
  animation: pulse 2s infinite;
}

.status-indicator.status-completed {
  background: #34c759;
}

.status-indicator.status-error {
  background: #ff3b30;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.progress-summary {
  font-size: 12px;
  color: #86868b;
}

.processor-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  transition: all 0.2s ease;
  background: rgba(0, 122, 255, 0.02);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text p {
  margin: 0;
  color: #1d1d1f;
}

.upload-link {
  color: #007aff;
  cursor: pointer;
  text-decoration: underline;
}

.upload-link:hover {
  color: #0056cc;
}

.upload-hint {
  font-size: 12px !important;
  color: #86868b !important;
}

.file-input {
  display: none;
}

.file-list {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.clear-btn {
  padding: 4px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-items {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item.processing {
  background: rgba(0, 122, 255, 0.05);
}

.file-item.completed {
  background: rgba(52, 199, 89, 0.05);
}

.file-item.error {
  background: rgba(255, 59, 48, 0.05);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 20px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 2px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #86868b;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon {
  font-size: 16px;
}

.progress-bar {
  width: 80px;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007aff;
  transition: width 0.3s ease;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.remove-btn:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  color: #1d1d1f;
  font-weight: 500;
}

.setting-item select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 13px;
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.option-label {
  font-size: 13px;
  color: #1d1d1f;
}

.progress-section {
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.overall-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 700;
  color: #007aff;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #34c759);
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86868b;
}

.errors-section {
  padding: 16px;
  background: rgba(255, 59, 48, 0.05);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 8px;
}

.errors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.errors-title {
  font-size: 14px;
  font-weight: 600;
  color: #ff3b30;
}

.clear-errors-btn {
  padding: 4px 8px;
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 4px;
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  cursor: pointer;
  font-size: 12px;
}

.clear-errors-btn:hover {
  background: rgba(255, 59, 48, 0.2);
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border-left: 3px solid #ff3b30;
}

.error-icon {
  font-size: 16px;
  margin-top: 2px;
}

.error-content {
  flex: 1;
}

.error-file {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.error-message {
  font-size: 12px;
  color: #ff3b30;
}

.processor-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86868b;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.start-btn,
.export-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}

.cancel-btn:hover {
  background: rgba(255, 59, 48, 0.2);
}

.start-btn {
  background: #007aff;
  border: 1px solid #007aff;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: #0056cc;
  border-color: #0056cc;
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn {
  background: #34c759;
  border: 1px solid #34c759;
  color: white;
}

.export-btn:hover:not(:disabled) {
  background: #28a745;
  border-color: #28a745;
}

.export-btn:disabled {
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
@media (max-width: 640px) {
  .batch-processor {
    padding: 16px;
    max-width: none;
  }

  .processor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .processor-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }

  .stats-info {
    justify-content: center;
  }
}
</style>