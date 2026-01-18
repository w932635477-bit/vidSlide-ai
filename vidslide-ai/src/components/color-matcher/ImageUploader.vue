<template>
  <div
    class="upload-area"
    :class="{ 'drag-over': isDragOver }"
    role="button"
    tabindex="0"
    aria-label="点击或拖拽上传图片"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
    @keydown.enter="triggerFileInput"
    @keydown.space="triggerFileInput"
  >
    <div class="upload-icon">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>
    <h3>上传图片开始色彩分析</h3>
    <p>支持 JPG、PNG 格式，最大 {{ maxFileSizeMB }}MB</p>
    <button class="upload-btn primary" @click.stop="triggerFileInput">选择图片</button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="file-input"
      aria-label="选择图片文件"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  supportedFormats: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/webp']
  }
})

const emit = defineEmits(['file-selected', 'error'])

const fileInput = ref(null)
const isDragOver = ref(false)

const maxFileSizeMB = computed(() => {
  return Math.round(props.maxFileSize / 1024 / 1024)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = event => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndEmit(file)
  }
}

const handleFileSelect = event => {
  const file = event.target.files[0]
  if (file) {
    validateAndEmit(file)
  }
}

const validateAndEmit = file => {
  // 验证文件格式
  if (!props.supportedFormats.includes(file.type)) {
    emit('error', '不支持的文件格式，请选择 JPG、PNG 或 WebP 格式的图片')
    return
  }

  // 验证文件大小
  if (file.size > props.maxFileSize) {
    emit('error', `文件过大，请选择小于 ${maxFileSizeMB.value}MB 的图片`)
    return
  }

  emit('file-selected', file)
}
</script>

<style scoped>
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover,
.upload-area.drag-over {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.4);
}

.upload-area:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.upload-icon {
  color: rgba(255, 255, 255, 0.5);
}

.upload-area h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.upload-area p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.upload-btn {
  padding: 10px 24px;
  background: rgba(0, 122, 255, 0.9);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: rgba(0, 122, 255, 1);
  transform: translateY(-1px);
}

.file-input {
  display: none;
}
</style>
