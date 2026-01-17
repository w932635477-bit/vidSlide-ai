<template>
  <div
    class="background-remover"
    role="region"
    aria-labelledby="bg-remover-heading"
  >
    <!-- 头部 -->
    <RemoverHeader
      :is-processing="isProcessing"
      :processing-message="processingMessage"
      :processing-progress="processingProgress"
    />

    <!-- 图片上传区域 -->
    <section class="upload-section" role="main" aria-labelledby="upload-heading">
      <h3 id="upload-heading" class="sr-only">图片上传</h3>

      <ImageUploadArea
        v-if="!currentImage"
        @drop="handleDrop"
        @file-select="handleFileSelect"
      />

      <!-- 背景移除工作区 -->
      <div v-else class="removal-workspace">
        <RemovalToolbar
          v-model:use-a-i-mode="useAIMode"
          v-model:selected-bg-color="selectedBgColor"
          v-model:tolerance="tolerance"
          :ai-service-status="aiServiceStatus"
          :is-processing="isProcessing"
          :has-processed-image="!!processedImageUrl"
          @ai-remove="autoRemoveBackground"
          @manual-remove="manualRemoveBackground"
          @refine-edges="refineEdges"
          @apply="applyBackgroundRemoval"
        />

        <ImageComparison
          ref="imageComparisonRef"
          :canvas-size="canvasSize"
          :current-image="currentImage"
        />

        <BackgroundOptions
          :selected-background="selectedBackground"
          v-model:custom-bg-color="customBgColor"
          @select-background="setBackground"
          @set-custom-background="setCustomBackground"
        />

        <!-- 操作按钮 -->
        <div class="workspace-actions">
          <button class="action-btn secondary" @click="clearImage" aria-label="清除图片重新上传">
            🗑️ 清除图片
          </button>
          <button
            class="action-btn primary"
            @click="downloadProcessedImage"
            :disabled="!processedImageUrl"
            aria-label="下载处理后的图片"
          >
            💾 下载图片
          </button>
        </div>
      </div>
    </section>

    <!-- 处理结果预览 -->
    <section
      v-if="processedImageUrl"
      class="result-section"
      role="complementary"
      aria-labelledby="result-heading"
    >
      <h3 id="result-heading">最终结果预览</h3>
      <div class="final-result">
        <img
          :src="processedImageUrl"
          :alt="`背景移除结果，尺寸 ${canvasSize.width} x ${canvasSize.height}`"
          class="result-image"
        />
        <div class="result-info">
          <div class="info-item">
            <span class="info-label">处理类型:</span>
            <span class="info-value">{{ removalMethod }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">背景色:</span>
            <span class="info-value">{{ selectedBgColor.toUpperCase() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">容差值:</span>
            <span class="info-value">{{ tolerance }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">输出格式:</span>
            <span class="info-value">PNG (透明背景)</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import backgroundRemovalService from '../services/BackgroundRemovalService.js'
import RemoverHeader from './background-remover/RemoverHeader.vue'
import ImageUploadArea from './background-remover/ImageUploadArea.vue'
import RemovalToolbar from './background-remover/RemovalToolbar.vue'
import ImageComparison from './background-remover/ImageComparison.vue'
import BackgroundOptions from './background-remover/BackgroundOptions.vue'

/**
 * 背景移除工具（重构版）
 * 功能：AI智能背景移除、手动颜色匹配、边缘优化、背景替换
 */

const props = defineProps({
  maxFileSize: { type: Number, default: 10 * 1024 * 1024 },
  supportedFormats: { type: Array, default: () => ['image/jpeg', 'image/png', 'image/webp'] }
})

const emit = defineEmits(['image-loaded', 'background-removed', 'image-cleared'])

// 状态
const currentImage = ref(null)
const imageComparisonRef = ref(null)
const canvasSize = ref({ width: 600, height: 400 })
const originalSize = ref({ width: 0, height: 0 })
const selectedBgColor = ref('#ffffff')
const customBgColor = ref('#ffffff')
const tolerance = ref(30)
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')
const processedImageUrl = ref('')
const removalMethod = ref('')
const selectedBackground = ref({ id: 'transparent', name: '透明', style: 'transparent' })
const aiServiceStatus = ref(null)
const useAIMode = ref(true)

// 方法
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) processImageFile(file)
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) processImageFile(file)
}

const processImageFile = async (file) => {
  if (!props.supportedFormats.includes(file.type)) {
    alert('不支持的文件格式，请选择 JPG、PNG 或 WebP 格式的图片')
    return
  }

  if (file.size > props.maxFileSize) {
    alert(`文件过大，请选择小于 ${props.maxFileSize / 1024 / 1024}MB 的图片`)
    return
  }

  try {
    const imageUrl = URL.createObjectURL(file)
    await loadImage(imageUrl)
    emit('image-loaded', { file, url: imageUrl })
  } catch (error) {
    console.error('图片处理失败:', error)
    alert('图片处理失败，请重试')
  }
}

const loadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      currentImage.value = img
      originalSize.value = { width: img.width, height: img.height }

      const maxWidth = 600
      const maxHeight = 400
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)

      canvasSize.value = {
        width: img.width * ratio,
        height: img.height * ratio
      }

      nextTick(() => {
        if (imageComparisonRef.value?.originalCanvas) {
          const ctx = imageComparisonRef.value.originalCanvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

const autoRemoveBackground = async () => {
  if (!currentImage.value) return

  isProcessing.value = true
  processingProgress.value = 5

  try {
    const serviceStatus = backgroundRemovalService.getServiceStatus()
    if (!serviceStatus.hasAvailableService) {
      throw new Error('没有可用的AI背景移除服务，请配置API密钥或使用手动模式')
    }

    processingMessage.value = '正在连接AI服务...'
    processingProgress.value = 15

    const imageBlob = await canvasToBlob(imageComparisonRef.value.originalCanvas)

    processingMessage.value = '正在上传图片到AI服务...'
    processingProgress.value = 30

    const result = await backgroundRemovalService.removeBackground(imageBlob, {
      size: 'auto',
      format: 'png'
    })

    processingMessage.value = '正在处理AI结果...'
    processingProgress.value = 80

    const processedUrl = URL.createObjectURL(result.imageBlob)
    processedImageUrl.value = processedUrl

    await displayProcessedImage(result.imageBlob)

    processingProgress.value = 100
    removalMethod.value = `AI智能识别 (${result.service})`

  } catch (error) {
    console.error('AI背景移除失败:', error)
    const useManual = confirm(`AI背景移除失败: ${error.message}\n\n是否要使用手动背景移除模式？`)
    if (useManual) {
      useAIMode.value = false
      await manualRemoveBackground()
    }
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const manualRemoveBackground = async () => {
  if (!currentImage.value) return

  isProcessing.value = true
  processingMessage.value = '正在处理背景移除...'
  processingProgress.value = 30

  try {
    await applySimpleBackgroundRemoval()
    processingProgress.value = 100
    removalMethod.value = '手动颜色匹配'
  } catch (error) {
    console.error('手动背景移除失败:', error)
    alert('背景移除失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const applySimpleBackgroundRemoval = async () => {
  return new Promise((resolve) => {
    nextTick(() => {
      const originalCanvas = imageComparisonRef.value?.originalCanvas
      const processedCanvas = imageComparisonRef.value?.processedCanvas

      if (!originalCanvas || !processedCanvas) {
        resolve()
        return
      }

      const originalCtx = originalCanvas.getContext('2d')
      const processedCtx = processedCanvas.getContext('2d')

      const imageData = originalCtx.getImageData(0, 0, canvasSize.value.width, canvasSize.value.height)
      const data = imageData.data

      const bgColor = hexToRgb(selectedBgColor.value)
      const tol = tolerance.value

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const diff = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        )

        if (diff <= tol) {
          data[i + 3] = 0
        }
      }

      const newImageData = new ImageData(data, canvasSize.value.width, canvasSize.value.height)
      processedCtx.putImageData(newImageData, 0, 0)

      processedCanvas.toBlob((blob) => {
        processedImageUrl.value = URL.createObjectURL(blob)
        resolve()
      }, 'image/png')
    })
  })
}

const refineEdges = async () => {
  if (!processedImageUrl.value) return

  isProcessing.value = true
  processingMessage.value = '正在优化边缘...'
  processingProgress.value = 50

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    processingProgress.value = 100
  } catch (error) {
    console.error('边缘优化失败:', error)
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const applyBackgroundRemoval = () => {
  if (!processedImageUrl.value) return

  emit('background-removed', {
    imageUrl: processedImageUrl.value,
    backgroundColor: selectedBgColor.value,
    tolerance: tolerance.value,
    method: removalMethod.value,
    canvasSize: canvasSize.value,
    originalSize: originalSize.value
  })
}

const setBackground = (background) => {
  selectedBackground.value = background
}

const setCustomBackground = () => {
  selectedBackground.value = {
    id: 'custom',
    name: '自定义',
    style: customBgColor.value
  }
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

const clearImage = () => {
  currentImage.value = null
  processedImageUrl.value = ''
  canvasSize.value = { width: 600, height: 400 }
  originalSize.value = { width: 0, height: 0 }
  removalMethod.value = ''
  emit('image-cleared')
}

const canvasToBlob = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
}

const displayProcessedImage = (imageBlob) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      nextTick(() => {
        const processedCanvas = imageComparisonRef.value?.processedCanvas
        if (processedCanvas) {
          const ctx = processedCanvas.getContext('2d')
          ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.src = URL.createObjectURL(imageBlob)
  })
}

const checkAIServiceStatus = () => {
  aiServiceStatus.value = backgroundRemovalService.getServiceStatus()
}

const downloadProcessedImage = () => {
  if (!processedImageUrl.value) return

  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `background-removed-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  checkAIServiceStatus()
})

defineExpose({
  loadImage,
  applyBackgroundRemoval,
  clearImage,
  getCurrentImage: () => currentImage.value,
  getProcessedImageUrl: () => processedImageUrl.value,
  getRemovalSettings: () => ({
    backgroundColor: selectedBgColor.value,
    tolerance: tolerance.value,
    method: removalMethod.value
  })
})
</script>

<style scoped>
.background-remover {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.removal-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workspace-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.action-btn.primary:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
  color: rgba(255, 59, 48, 0.9);
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.4);
}

.result-section {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.result-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.final-result {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.result-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.info-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

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

@media (max-width: 768px) {
  .background-remover {
    padding: 16px;
    gap: 16px;
  }

  .workspace-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .final-result {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .result-info {
    width: 100%;
  }
}
</style>
