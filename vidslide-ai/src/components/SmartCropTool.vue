<template>
  <div class="smart-crop-tool" role="region" aria-labelledby="crop-tool-heading">
    <!-- 智能裁切工具标题区域 -->
    <header class="tool-header" role="banner">
      <h2 id="crop-tool-heading">✂️ 智能裁切工具</h2>
      <p class="tool-description">AI智能分析图片构图，推荐最佳裁切比例和位置</p>

      <!-- 工具状态显示 -->
      <div v-if="isProcessing" class="processing-status" role="status" aria-live="polite">
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>{{ processingMessage }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
        </div>
      </div>
    </header>

    <!-- 图片上传区域 -->
    <section class="upload-section" role="main" aria-labelledby="upload-heading">
      <h3 id="upload-heading" class="sr-only">图片上传</h3>

      <div
        v-if="!currentImage"
        class="upload-area"
        role="button"
        tabindex="0"
        aria-label="点击或拖拽上传图片"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
        @keydown.enter="$refs.fileInput.click()"
        @keydown.space="$refs.fileInput.click()"
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
        <h3>上传图片开始智能裁切</h3>
        <p>支持 JPG、PNG 格式，最大 10MB</p>
        <button class="upload-btn primary">选择图片</button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="file-input"
          aria-label="选择图片文件"
          @change="handleFileSelect"
        />
      </div>

      <!-- 图片预览和裁切区域 -->
      <div v-else class="crop-workspace">
        <!-- 工具栏 -->
        <div class="crop-toolbar">
          <div class="aspect-controls">
            <label for="aspect-select" class="sr-only">裁切比例</label>
            <select
              id="aspect-select"
              v-model="selectedAspectRatio"
              class="aspect-select"
              @change="applyAspectRatio"
            >
              <option value="free">自由裁切</option>
              <option value="1:1">1:1 (正方形)</option>
              <option value="4:3">4:3 (传统)</option>
              <option value="16:9">16:9 (宽屏)</option>
              <option value="3:4">3:4 (竖版)</option>
              <option value="9:16">9:16 (故事)</option>
            </select>
          </div>

          <div class="tool-actions">
            <button
              class="tool-btn"
              :disabled="isProcessing"
              aria-label="AI智能裁切"
              @click="autoCrop"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14.7 6.3a1 1 0 0 0-1.4 0l-4 4a1 1 0 0 0 0 1.4l4 4a1 1 0 0 0 1.4-1.4L11.42 11H19a1 1 0 0 0 0-2h-7.58l3.3-3.3a1 1 0 0 0 0-1.4Z"
                />
              </svg>
              智能裁切
            </button>

            <button
              class="tool-btn"
              :disabled="!cropArea"
              aria-label="重置裁切区域"
              @click="resetCrop"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              重置
            </button>

            <button
              class="tool-btn primary"
              :disabled="!cropArea"
              aria-label="应用裁切"
              @click="applyCrop"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              应用裁切
            </button>
          </div>
        </div>

        <!-- 图片容器 -->
        <div class="image-container">
          <canvas
            ref="imageCanvas"
            :width="canvasSize.width"
            :height="canvasSize.height"
            class="crop-canvas"
            tabindex="0"
            role="img"
            :aria-label="`图片裁切画布，尺寸 ${canvasSize.width}x${canvasSize.height}`"
            @mousedown="startCrop"
            @mousemove="updateCrop"
            @mouseup="endCrop"
            @mouseleave="endCrop"
          ></canvas>

          <!-- 裁切遮罩 -->
          <div v-if="cropArea" class="crop-overlay">
            <!-- 遮罩区域 -->
            <div class="crop-mask top" :style="{ height: cropArea.y + 'px' }"></div>
            <div
              class="crop-mask bottom"
              :style="{ height: canvasSize.height - cropArea.y - cropArea.height + 'px' }"
            ></div>
            <div
              class="crop-mask left"
              :style="{
                width: cropArea.x + 'px',
                height: cropArea.height + 'px',
                top: cropArea.y + 'px'
              }"
            ></div>
            <div
              class="crop-mask right"
              :style="{
                width: canvasSize.width - cropArea.x - cropArea.width + 'px',
                height: cropArea.height + 'px',
                top: cropArea.y + 'px',
                left: cropArea.x + cropArea.width + 'px'
              }"
            ></div>

            <!-- 裁切边框 -->
            <div
              class="crop-border"
              :style="{
                left: cropArea.x + 'px',
                top: cropArea.y + 'px',
                width: cropArea.width + 'px',
                height: cropArea.height + 'px'
              }"
            >
              <!-- 边框手柄 -->
              <div class="crop-handle nw" @mousedown="startResize('nw')"></div>
              <div class="crop-handle ne" @mousedown="startResize('ne')"></div>
              <div class="crop-handle sw" @mousedown="startResize('sw')"></div>
              <div class="crop-handle se" @mousedown="startResize('se')"></div>
              <div class="crop-handle n" @mousedown="startResize('n')"></div>
              <div class="crop-handle s" @mousedown="startResize('s')"></div>
              <div class="crop-handle w" @mousedown="startResize('w')"></div>
              <div class="crop-handle e" @mousedown="startResize('e')"></div>
            </div>
          </div>

          <!-- 裁切信息显示 -->
          <div v-if="cropArea" class="crop-info">
            <span>{{ cropArea.width }} × {{ cropArea.height }} 像素</span>
            <span>{{ selectedAspectRatio }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="workspace-actions">
          <button class="action-btn secondary" aria-label="清除图片重新上传" @click="clearImage">
            🗑️ 清除图片
          </button>

          <button
            class="action-btn primary"
            :disabled="!croppedImageUrl"
            aria-label="下载裁切后的图片"
            @click="downloadCroppedImage"
          >
            💾 下载图片
          </button>
        </div>
      </div>
    </section>

    <!-- 裁切结果预览 -->
    <section
      v-if="croppedImageUrl"
      class="result-section"
      role="complementary"
      aria-labelledby="result-heading"
    >
      <h3 id="result-heading">裁切结果预览</h3>

      <div class="result-preview">
        <img
          :src="croppedImageUrl"
          :alt="`裁切结果，尺寸 ${cropArea?.width || 0} x ${cropArea?.height || 0}`"
          class="result-image"
        />

        <div class="result-info">
          <div class="info-item">
            <span class="info-label">原始尺寸:</span>
            <span class="info-value">{{ originalSize.width }} × {{ originalSize.height }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">裁切尺寸:</span>
            <span class="info-value">{{ cropArea?.width || 0 }} × {{ cropArea?.height || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">裁切比例:</span>
            <span class="info-value">{{ selectedAspectRatio }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import SmartCropService from '../services/SmartCropService.js'
import ImageQualityOptimizer from '../services/ImageQualityOptimizer.js'

// Props
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

// Emits
const emit = defineEmits(['image-loaded', 'crop-applied', 'image-cleared'])

// Reactive data
const currentImage = ref(null)
const imageCanvas = ref(null)
const canvasSize = ref({ width: 800, height: 600 })
const originalSize = ref({ width: 0, height: 0 })
const cropArea = ref(null)
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')
const selectedAspectRatio = ref('free')
const croppedImageUrl = ref('')
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const resizeHandle = ref(null)

// AI服务状态
const aiServicesReady = ref(false)
const smartCropService = ref(null)
const imageOptimizer = ref(null)

// Computed properties
const aspectRatioMap = computed(() => ({
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '3:4': 3 / 4,
  '9:16': 9 / 16
}))

// Methods
const handleFileSelect = event => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

const handleDrop = event => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processImageFile(file)
  }
}

const processImageFile = async file => {
  // 验证文件
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

    // 自动执行智能裁剪分析
    if (aiServicesReady.value) {
      await performSmartCropAnalysis(file)
    }
  } catch (error) {
    console.error('图片处理失败:', error)
    alert('图片处理失败，请重试')
  }
}

const loadImage = imageUrl => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      currentImage.value = img
      originalSize.value = { width: img.width, height: img.height }

      // 计算canvas尺寸（保持宽高比）
      const maxWidth = 800
      const maxHeight = 600
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)

      canvasSize.value = {
        width: img.width * ratio,
        height: img.height * ratio
      }

      // 绘制图片到canvas
      nextTick(() => {
        if (imageCanvas.value) {
          const ctx = imageCanvas.value.getContext('2d')
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

const autoCrop = async () => {
  if (!currentImage.value) return

  // 如果AI服务可用，使用智能裁剪；否则使用手动模式
  if (aiServicesReady.value && smartCropService.value) {
    // 使用AI智能裁剪
    await triggerSmartCrop()
  } else {
    // 降级到手动模式
    isProcessing.value = true
    processingMessage.value = '正在生成裁切建议...'
    processingProgress.value = 20

    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      processingProgress.value = 60

      await new Promise(resolve => setTimeout(resolve, 1000))
      processingProgress.value = 90

      // 生成居中裁切建议
      const centerX = canvasSize.value.width / 2
      const centerY = canvasSize.value.height / 2
      const cropSize = Math.min(canvasSize.value.width, canvasSize.value.height) * 0.8

      cropArea.value = {
        x: centerX - cropSize / 2,
        y: centerY - cropSize / 2,
        width: cropSize,
        height: cropSize,
        confidence: 0.5 // 手动模式的置信度较低
      }

      selectedAspectRatio.value = '1:1'
      processingProgress.value = 100

      processingMessage.value = '裁切建议生成完成（手动模式）'
      emit('crop-applied', { aiAnalysis: false })
    } catch (error) {
      console.error('裁切建议生成失败:', error)
      processingMessage.value = '裁切建议生成失败，请手动调整'
    } finally {
      isProcessing.value = false
      processingProgress.value = 0
    }
  }
}

const startCrop = event => {
  if (isProcessing.value) return

  const rect = imageCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  isDragging.value = true
  dragStart.value = { x, y }

  // 如果没有裁切区域，创建新的
  if (!cropArea.value) {
    cropArea.value = {
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100
    }
  }
}

const updateCrop = event => {
  if (!isDragging.value || !cropArea.value) return

  const rect = imageCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const deltaX = x - dragStart.value.x
  const deltaY = y - dragStart.value.y

  if (resizeHandle.value) {
    // 调整大小
    resizeCropArea(deltaX, deltaY)
  } else {
    // 移动裁切区域
    cropArea.value.x += deltaX
    cropArea.value.y += deltaY

    // 限制在canvas范围内
    cropArea.value.x = Math.max(
      0,
      Math.min(cropArea.value.x, canvasSize.value.width - cropArea.value.width)
    )
    cropArea.value.y = Math.max(
      0,
      Math.min(cropArea.value.y, canvasSize.value.height - cropArea.value.height)
    )
  }

  dragStart.value = { x, y }
}

const endCrop = () => {
  isDragging.value = false
  resizeHandle.value = null
}

const startResize = handle => {
  resizeHandle.value = handle
  isDragging.value = true
}

const resizeCropArea = (deltaX, deltaY) => {
  const area = cropArea.value
  const canvas = canvasSize.value

  switch (resizeHandle.value) {
    case 'nw':
      area.x = Math.max(0, area.x + deltaX)
      area.y = Math.max(0, area.y + deltaY)
      area.width = Math.max(20, area.width - deltaX)
      area.height = Math.max(20, area.height - deltaY)
      break
    case 'ne':
      area.y = Math.max(0, area.y + deltaY)
      area.width = Math.max(20, area.width + deltaX)
      area.height = Math.max(20, area.height - deltaY)
      break
    case 'sw':
      area.x = Math.max(0, area.x + deltaX)
      area.width = Math.max(20, area.width - deltaX)
      area.height = Math.max(20, area.height + deltaY)
      break
    case 'se':
      area.width = Math.max(20, area.width + deltaX)
      area.height = Math.max(20, area.height + deltaY)
      break
    case 'n':
      area.y = Math.max(0, area.y + deltaY)
      area.height = Math.max(20, area.height - deltaY)
      break
    case 's':
      area.height = Math.max(20, area.height + deltaY)
      break
    case 'w':
      area.x = Math.max(0, area.x + deltaX)
      area.width = Math.max(20, area.width - deltaX)
      break
    case 'e':
      area.width = Math.max(20, area.width + deltaX)
      break
  }

  // 应用宽高比约束
  if (selectedAspectRatio.value !== 'free') {
    const ratio = aspectRatioMap.value[selectedAspectRatio.value]
    if (ratio) {
      area.height = area.width / ratio
    }
  }

  // 限制在canvas范围内
  area.x = Math.max(0, Math.min(area.x, canvas.width - area.width))
  area.y = Math.max(0, Math.min(area.y, canvas.height - area.height))
  area.width = Math.min(area.width, canvas.width - area.x)
  area.height = Math.min(area.height, canvas.height - area.y)
}

const applyAspectRatio = () => {
  if (!cropArea.value || selectedAspectRatio.value === 'free') return

  const ratio = aspectRatioMap.value[selectedAspectRatio.value]
  if (ratio) {
    const centerX = cropArea.value.x + cropArea.value.width / 2
    const centerY = cropArea.value.y + cropArea.value.height / 2

    if (ratio > 1) {
      // 宽大于高
      cropArea.value.width = Math.min(cropArea.value.height * ratio, canvasSize.value.width)
      cropArea.value.height = cropArea.value.width / ratio
    } else {
      // 高大于宽
      cropArea.value.height = Math.min(cropArea.value.width / ratio, canvasSize.value.height)
      cropArea.value.width = cropArea.value.height * ratio
    }

    cropArea.value.x = centerX - cropArea.value.width / 2
    cropArea.value.y = centerY - cropArea.value.height / 2

    // 限制在canvas范围内
    cropArea.value.x = Math.max(
      0,
      Math.min(cropArea.value.x, canvasSize.value.width - cropArea.value.width)
    )
    cropArea.value.y = Math.max(
      0,
      Math.min(cropArea.value.y, canvasSize.value.height - cropArea.value.height)
    )
  }
}

const applyCrop = () => {
  if (!cropArea.value || !imageCanvas.value) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 计算原始图片中的裁切区域
    const scaleX = originalSize.value.width / canvasSize.value.width
    const scaleY = originalSize.value.height / canvasSize.value.height

    const sourceX = cropArea.value.x * scaleX
    const sourceY = cropArea.value.y * scaleY
    const sourceWidth = cropArea.value.width * scaleX
    const sourceHeight = cropArea.value.height * scaleY

    canvas.width = sourceWidth
    canvas.height = sourceHeight

    ctx.drawImage(
      currentImage.value,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    )

    croppedImageUrl.value = canvas.toDataURL('image/jpeg', 0.9)
    emit('crop-applied', {
      imageUrl: croppedImageUrl.value,
      cropArea: cropArea.value,
      originalSize: originalSize.value,
      croppedSize: { width: sourceWidth, height: sourceHeight }
    })
  } catch (error) {
    console.error('应用裁切失败:', error)
    alert('裁切失败，请重试')
  }
}

const resetCrop = () => {
  cropArea.value = null
}

const clearImage = () => {
  currentImage.value = null
  cropArea.value = null
  croppedImageUrl.value = ''
  canvasSize.value = { width: 800, height: 600 }
  originalSize.value = { width: 0, height: 0 }

  if (imageCanvas.value) {
    const ctx = imageCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  }

  emit('image-cleared')
}

const downloadCroppedImage = () => {
  if (!croppedImageUrl.value) return

  const link = document.createElement('a')
  link.href = croppedImageUrl.value
  link.download = `cropped-image-${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lifecycle
onMounted(async () => {
  // 初始化canvas
  nextTick(() => {
    if (imageCanvas.value) {
      const ctx = imageCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)
    }
  })

  // 初始化AI服务
  try {
    processingMessage.value = '正在初始化AI服务...'
    isProcessing.value = true

    // 初始化智能裁剪服务
    smartCropService.value = SmartCropService
    await smartCropService.value.initialize()

    // 初始化图像优化器
    imageOptimizer.value = ImageQualityOptimizer
    imageOptimizer.value.initialize()

    aiServicesReady.value = true
    processingMessage.value = 'AI服务初始化完成'
  } catch (error) {
    console.error('AI服务初始化失败:', error)
    processingMessage.value = 'AI服务初始化失败，使用手动模式'
  } finally {
    isProcessing.value = false
  }
})

// 智能裁剪分析
const performSmartCropAnalysis = async file => {
  if (!aiServicesReady.value || !smartCropService.value) {
    console.log('AI服务未就绪，跳过智能分析')
    return
  }

  try {
    isProcessing.value = true
    processingProgress.value = 0
    processingMessage.value = '正在分析图像构图...'

    // 步骤1: 智能裁剪分析
    processingProgress.value = 25
    processingMessage.value = '正在检测图像主体...'

    const cropResult = await smartCropService.value.smartCrop(file)
    console.log('智能裁剪结果:', cropResult)

    // 步骤2: 应用裁剪区域
    processingProgress.value = 50
    processingMessage.value = '正在应用智能裁剪...'

    if (cropResult.croppedBlob) {
      // 创建裁剪后的图像URL
      const croppedUrl = URL.createObjectURL(cropResult.croppedBlob)
      croppedImageUrl.value = croppedUrl

      // 更新裁剪区域建议
      cropArea.value = {
        x: cropResult.cropRect.x,
        y: cropResult.cropRect.y,
        width: cropResult.cropRect.width,
        height: cropResult.cropRect.height,
        confidence: cropResult.confidence || 0.8
      }
    }

    // 步骤3: 质量优化
    processingProgress.value = 75
    processingMessage.value = '正在优化图像质量...'

    if (imageOptimizer.value && cropResult.croppedBlob) {
      const optimizedResult = await imageOptimizer.value.optimizeImage(
        new File([cropResult.croppedBlob], 'optimized.png', { type: 'image/png' }),
        {
          targetResolution: { width: 1920, height: 1080 },
          brightness: 5,
          contrast: 10,
          saturation: 5
        }
      )

      if (optimizedResult.optimizedBlob) {
        const optimizedUrl = URL.createObjectURL(optimizedResult.optimizedBlob)
        croppedImageUrl.value = optimizedUrl
      }
    }

    processingProgress.value = 100
    processingMessage.value = '智能裁剪完成！'

    // 触发裁剪应用事件
    emit('crop-applied', {
      originalFile: file,
      croppedUrl: croppedImageUrl.value,
      cropArea: cropArea.value,
      aiAnalysis: true
    })
  } catch (error) {
    console.error('智能裁剪分析失败:', error)
    processingMessage.value = '智能分析失败，使用手动模式'

    // 降级到手动模式，设置默认裁剪区域
    const defaultCropArea = {
      x: originalSize.value.width * 0.1,
      y: originalSize.value.height * 0.1,
      width: originalSize.value.width * 0.8,
      height: originalSize.value.height * 0.8,
      confidence: 0.5
    }
    cropArea.value = defaultCropArea
  } finally {
    isProcessing.value = false
  }
}

// 手动触发智能裁剪
const triggerSmartCrop = async () => {
  if (!currentImage.value) {
    alert('请先加载图片')
    return
  }

  // 创建一个模拟的文件对象来触发分析
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = currentImage.value.width
  canvas.height = currentImage.value.height
  ctx.drawImage(currentImage.value, 0, 0)

  canvas.toBlob(async blob => {
    const mockFile = new File([blob], 'smart-crop-analysis.png', { type: 'image/png' })
    await performSmartCropAnalysis(mockFile)
  })
}

// Expose methods for parent component
defineExpose({
  loadImage,
  applyCrop,
  clearImage,
  triggerSmartCrop,
  getCurrentImage: () => currentImage.value,
  getCropArea: () => cropArea.value,
  getCroppedImageUrl: () => croppedImageUrl.value,
  isAIServicesReady: () => aiServicesReady.value
})
</script>

<style scoped>
/* ===========================================
   智能裁切工具 - 苹果设计风格
   =========================================== */

.smart-crop-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 头部区域 */
.tool-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.tool-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 处理状态 */
.processing-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 122, 255, 0.9);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 上传区域 */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.01);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: rgba(0, 122, 255, 0.5);
  background: rgba(0, 122, 255, 0.05);
}

.upload-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.upload-area h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.upload-area p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.upload-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.1);
  color: rgba(0, 122, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.upload-btn:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 裁切工作区 */
.crop-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 工具栏 */
.crop-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.aspect-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.aspect-select {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.aspect-select:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.tool-actions {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.tool-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.tool-btn.primary:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

/* 图片容器 */
.image-container {
  position: relative;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.crop-canvas {
  display: block;
  cursor: crosshair;
  border-radius: 8px;
}

.crop-canvas:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

/* 裁切遮罩 */
.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-mask {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
}

.crop-mask.top {
  top: 0;
  left: 0;
  right: 0;
}

.crop-mask.bottom {
  bottom: 0;
  left: 0;
  right: 0;
}

.crop-mask.left {
  left: 0;
}

.crop-mask.right {
  right: 0;
}

/* 裁切边框 */
.crop-border {
  position: absolute;
  border: 2px solid rgba(0, 122, 255, 0.8);
  background: rgba(0, 122, 255, 0.1);
  pointer-events: auto;
}

/* 裁切手柄 */
.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(0, 122, 255, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
}

.crop-handle.nw {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}
.crop-handle.ne {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}
.crop-handle.sw {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}
.crop-handle.se {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}
.crop-handle.n {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}
.crop-handle.s {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}
.crop-handle.w {
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
  cursor: w-resize;
}
.crop-handle.e {
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
  cursor: e-resize;
}

/* 裁切信息 */
.crop-info {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  font-size: 12px;
  color: white;
}

.crop-info span {
  display: block;
  font-weight: 500;
}

/* 工作区操作 */
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

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
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

/* 结果预览 */
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

.result-preview {
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

/* 无障碍支持 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-crop-tool {
    padding: 16px;
    gap: 16px;
  }

  .crop-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tool-actions {
    justify-content: center;
  }

  .image-container {
    overflow-x: auto;
  }

  .crop-canvas {
    min-width: 300px;
  }

  .workspace-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .result-preview {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .result-info {
    width: 100%;
  }
}
</style>
