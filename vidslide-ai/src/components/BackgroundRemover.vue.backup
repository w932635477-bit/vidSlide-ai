<template>
  <div
    class="background-remover"
    role="region"
    aria-labelledby="bg-remover-heading"
  >
    <!-- 背景移除工具标题区域 -->
    <header
      class="tool-header"
      role="banner"
    >
      <h2 id="bg-remover-heading">🎭 背景移除工具</h2>
      <p class="tool-description">
        智能识别并移除图片背景，保留主体内容
      </p>

      <!-- 处理状态显示 -->
      <div
        v-if="isProcessing"
        class="processing-status"
        role="status"
        aria-live="polite"
      >
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>{{ processingMessage }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: processingProgress + '%' }"
          ></div>
        </div>
      </div>
    </header>

    <!-- 图片上传区域 -->
    <section
      class="upload-section"
      role="main"
      aria-labelledby="upload-heading"
    >
      <h3 id="upload-heading" class="sr-only">图片上传</h3>

      <div
        v-if="!currentImage"
        class="upload-area"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
        role="button"
        tabindex="0"
        @keydown.enter="$refs.fileInput.click()"
        @keydown.space="$refs.fileInput.click()"
        aria-label="点击或拖拽上传图片"
      >
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <h3>上传图片开始背景移除</h3>
        <p>支持 JPG、PNG 格式，最大 10MB</p>
        <button class="upload-btn primary">
          选择图片
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="file-input"
          aria-label="选择图片文件"
        />
      </div>

      <!-- 背景移除工作区 -->
      <div
        v-else
        class="removal-workspace"
      >
        <!-- 工具栏 -->
        <div class="removal-toolbar">
          <!-- 模式切换 -->
          <div class="mode-controls">
            <div class="mode-toggle">
              <button
                @click="useAIMode = true"
                :class="{ active: useAIMode }"
                class="mode-btn ai-mode"
                aria-label="切换到AI自动模式"
              >
                🤖 AI自动
              </button>
              <button
                @click="useAIMode = false"
                :class="{ active: !useAIMode }"
                class="mode-btn manual-mode"
                aria-label="切换到手动模式"
              >
                🎨 手动调整
              </button>
            </div>

            <!-- AI服务状态 -->
            <div
              v-if="aiServiceStatus"
              class="service-status"
              :class="{ available: aiServiceStatus.hasAvailableService, unavailable: !aiServiceStatus.hasAvailableService }"
            >
              <span class="status-icon">{{ aiServiceStatus.hasAvailableService ? '🟢' : '🔴' }}</span>
              <span class="status-text">
                {{ aiServiceStatus.hasAvailableService ? `可用服务: ${aiServiceStatus.availableServices.join(', ')}` : 'AI服务不可用' }}
              </span>
            </div>
          </div>

          <!-- 手动模式控制 -->
          <div v-if="!useAIMode" class="manual-controls">
            <div class="background-controls">
              <label for="bg-color-picker" class="control-label">
                背景色选择:
              </label>
              <input
                id="bg-color-picker"
                v-model="selectedBgColor"
                type="color"
                class="color-picker"
                @change="updateBackgroundColor"
                aria-label="选择要移除的背景颜色"
              />
              <span class="color-value">{{ selectedBgColor.toUpperCase() }}</span>
            </div>

            <div class="tolerance-controls">
              <label for="tolerance-slider" class="control-label">
                容差范围: {{ tolerance }}
              </label>
              <input
                id="tolerance-slider"
                v-model="tolerance"
                type="range"
                min="0"
                max="255"
                step="5"
                class="tolerance-slider"
                @input="updateTolerance"
                aria-label="调整颜色匹配容差"
              />
              <div class="tolerance-presets">
                <button
                  v-for="preset in tolerancePresets"
                  :key="preset.value"
                  @click="setTolerance(preset.value)"
                  class="preset-btn"
                  :class="{ active: tolerance === preset.value }"
                  :aria-label="`设置容差为${preset.label}`"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="tool-actions">
            <button
              v-if="useAIMode"
              class="tool-btn ai-btn"
              @click="autoRemoveBackground"
              :disabled="isProcessing || !aiServiceStatus?.hasAvailableService"
              aria-label="AI智能背景移除"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0-1.4 0l-4 4a1 1 0 0 0 0 1.4l4 4a1 1 0 0 0 1.4-1.4L11.42 11H19a1 1 0 0 0 0-2h-7.58l3.3-3.3a1 1 0 0 0 0-1.4Z"/>
              </svg>
              AI智能移除
            </button>

            <button
              v-if="!useAIMode"
              class="tool-btn"
              @click="manualRemoveBackground"
              :disabled="isProcessing"
              aria-label="手动背景移除"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              手动移除
            </button>

            <button
              class="tool-btn"
              @click="refineEdges"
              :disabled="isProcessing || !processedImageUrl"
              aria-label="优化边缘"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              优化边缘
            </button>

            <button
              class="tool-btn primary"
              @click="applyBackgroundRemoval"
              :disabled="isProcessing || !processedImageUrl"
              aria-label="应用背景移除"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              应用移除
            </button>
          </div>
        </div>

        <!-- 图片对比显示 -->
        <div class="image-comparison">
          <!-- 原始图片 -->
          <div class="image-panel original-panel">
            <h4>原始图片</h4>
            <div class="image-container">
              <canvas
                ref="originalCanvas"
                :width="canvasSize.width"
                :height="canvasSize.height"
                class="comparison-canvas"
                role="img"
                :aria-label="`原始图片，尺寸 ${canvasSize.width}x${canvasSize.height}`"
              ></canvas>
            </div>
          </div>

          <!-- 处理后图片 -->
          <div class="image-panel processed-panel">
            <h4>处理结果</h4>
            <div class="image-container">
              <canvas
                ref="processedCanvas"
                :width="canvasSize.width"
                :height="canvasSize.height"
                class="comparison-canvas"
                role="img"
                :aria-label="`处理后图片，尺寸 ${canvasSize.width}x${canvasSize.height}`"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- 背景选项 -->
        <div class="background-options">
          <h4>背景设置</h4>
          <div class="background-presets">
            <button
              v-for="bg in backgroundPresets"
              :key="bg.id"
              @click="setBackground(bg)"
              class="bg-preset-btn"
              :class="{ active: selectedBackground.id === bg.id }"
              :aria-label="`设置为${bg.name}背景`"
            >
              <div class="bg-content">
                <div
                  class="bg-preview"
                  :style="{ background: bg.style }"
                ></div>
                <span>{{ bg.name }}</span>
              </div>
            </button>
          </div>

          <div class="custom-background">
            <label for="custom-bg-color" class="control-label">
              自定义背景色:
            </label>
            <input
              id="custom-bg-color"
              v-model="customBgColor"
              type="color"
              class="color-picker small"
              @change="setCustomBackground"
              aria-label="选择自定义背景颜色"
            />
            <span class="color-value">{{ customBgColor.toUpperCase() }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="workspace-actions">
          <button
            class="action-btn secondary"
            @click="clearImage"
            aria-label="清除图片重新上传"
          >
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
import { ref, computed, onMounted, nextTick } from 'vue'
import backgroundRemovalService from '../services/BackgroundRemovalService.js'

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
const emit = defineEmits([
  'image-loaded',
  'background-removed',
  'image-cleared'
])

// Reactive data
const currentImage = ref(null)
const originalCanvas = ref(null)
const processedCanvas = ref(null)
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
const useAIMode = ref(true) // 默认使用AI模式

// Computed properties
const tolerancePresets = computed(() => [
  { value: 10, label: '精确' },
  { value: 30, label: '标准' },
  { value: 50, label: '宽松' },
  { value: 80, label: '粗略' }
])

const backgroundPresets = computed(() => [
  { id: 'transparent', name: '透明', style: 'transparent' },
  { id: 'white', name: '白色', style: '#ffffff' },
  { id: 'black', name: '黑色', style: '#000000' },
  { id: 'blue', name: '蓝色', style: '#007aff' },
  { id: 'green', name: '绿色', style: '#34c759' },
  { id: 'red', name: '红色', style: '#ff3b30' },
  { id: 'gradient', name: '渐变', style: 'linear-gradient(45deg, #007aff, #34c759)' }
])

// Methods
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processImageFile(file)
  }
}

const processImageFile = async (file) => {
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

      // 计算canvas尺寸（保持宽高比）
      const maxWidth = 600
      const maxHeight = 400
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)

      canvasSize.value = {
        width: img.width * ratio,
        height: img.height * ratio
      }

      // 绘制到原始canvas
      nextTick(() => {
        if (originalCanvas.value) {
          const ctx = originalCanvas.value.getContext('2d')
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

const updateBackgroundColor = () => {
  // 背景色更新时可以预览
  if (processedCanvas.value && processedImageUrl.value) {
    applyBackgroundToCanvas()
  }
}

const updateTolerance = () => {
  // 容差更新时可以实时预览
  if (processedCanvas.value && currentImage.value) {
    manualRemoveBackground()
  }
}

const setTolerance = (value) => {
  tolerance.value = value
  updateTolerance()
}

const autoRemoveBackground = async () => {
  if (!currentImage.value) return

  isProcessing.value = true
  processingProgress.value = 5

  try {
    // 检查AI服务状态
    const serviceStatus = backgroundRemovalService.getServiceStatus()
    if (!serviceStatus.hasAvailableService) {
      throw new Error('没有可用的AI背景移除服务，请配置API密钥或使用手动模式')
    }

    processingMessage.value = '正在连接AI服务...'
    processingProgress.value = 15

    // 将Canvas图片转换为Blob
    const imageBlob = await canvasToBlob(originalCanvas.value)

    processingMessage.value = '正在上传图片到AI服务...'
    processingProgress.value = 30

    // 调用AI API进行背景移除
    const result = await backgroundRemovalService.removeBackground(imageBlob, {
      size: 'auto',
      format: 'png'
    })

    processingMessage.value = '正在处理AI结果...'
    processingProgress.value = 80

    // 处理结果
    const processedUrl = URL.createObjectURL(result.imageBlob)
    processedImageUrl.value = processedUrl

    // 显示在processed canvas上
    await displayProcessedImage(result.imageBlob)

    processingProgress.value = 100
    removalMethod.value = `AI智能识别 (${result.service})`

    console.log('背景移除成功:', {
      service: result.service,
      credits: result.credits,
      processingTime: result.processingTime
    })

  } catch (error) {
    console.error('AI背景移除失败:', error)

    // 如果AI失败，提示用户使用手动模式
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
      if (!originalCanvas.value || !processedCanvas.value) {
        resolve()
        return
      }

      const originalCtx = originalCanvas.value.getContext('2d')
      const processedCtx = processedCanvas.value.getContext('2d')

      // 获取原始图片数据
      const imageData = originalCtx.getImageData(0, 0, canvasSize.value.width, canvasSize.value.height)
      const data = imageData.data

      // 转换背景色为RGB
      const bgColor = hexToRgb(selectedBgColor.value)
      const tol = tolerance.value

      // 处理每个像素
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // 计算颜色差异
        const diff = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        )

        // 如果在容差范围内，设置为透明
        if (diff <= tol) {
          data[i + 3] = 0 // 设置alpha为0（透明）
        }
      }

      // 应用背景
      applyBackgroundToCanvas(data)

      // 创建结果图片URL
      processedCanvas.value.toBlob((blob) => {
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
    // 这里可以实现边缘优化算法
    // 目前只是简单的延迟模拟
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
  if (background.id === 'transparent') {
    applyTransparentBackground()
  } else {
    applySolidBackground(background.style)
  }
}

const setCustomBackground = () => {
  selectedBackground.value = {
    id: 'custom',
    name: '自定义',
    style: customBgColor.value
  }
  applySolidBackground(customBgColor.value)
}

const applyTransparentBackground = () => {
  if (!processedCanvas.value) return

  const ctx = processedCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)

  // 重新应用背景移除
  if (currentImage.value) {
    manualRemoveBackground()
  }
}

const applySolidBackground = (bgStyle) => {
  if (!processedCanvas.value) return

  const ctx = processedCanvas.value.getContext('2d')

  // 填充背景色
  ctx.fillStyle = bgStyle
  ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)

  // 重新绘制处理后的图片
  if (processedImageUrl.value) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
      processedCanvas.value.toBlob((blob) => {
        processedImageUrl.value = URL.createObjectURL(blob)
      }, 'image/png')
    }
    img.src = processedImageUrl.value
  }
}

const applyBackgroundToCanvas = (imageData = null) => {
  if (!processedCanvas.value) return

  const ctx = processedCanvas.value.getContext('2d')

  if (selectedBackground.value.id === 'transparent') {
    // 透明背景
    if (imageData) {
      const newImageData = new ImageData(imageData, canvasSize.value.width, canvasSize.value.height)
      ctx.putImageData(newImageData, 0, 0)
    }
  } else {
    // 实色背景
    ctx.fillStyle = selectedBackground.value.style
    ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)

    if (imageData) {
      // 创建临时canvas来处理透明度
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvasSize.value.width
      tempCanvas.height = canvasSize.value.height
      const tempCtx = tempCanvas.getContext('2d')

      const newImageData = new ImageData(imageData, canvasSize.value.width, canvasSize.value.height)
      tempCtx.putImageData(newImageData, 0, 0)

      ctx.drawImage(tempCanvas, 0, 0)
    }
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

  // 清除canvas
  if (originalCanvas.value) {
    const ctx = originalCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  }

  if (processedCanvas.value) {
    const ctx = processedCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  }

  emit('image-cleared')
}

// 辅助方法
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
        if (processedCanvas.value) {
          const ctx = processedCanvas.value.getContext('2d')
          ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.src = URL.createObjectURL(imageBlob)
  })
}

// 检查AI服务状态
const checkAIServiceStatus = () => {
  aiServiceStatus.value = backgroundRemovalService.getServiceStatus()
}

// 切换AI/手动模式
const toggleMode = () => {
  useAIMode.value = !useAIMode.value
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

// Lifecycle
onMounted(() => {
  // 检查AI服务状态
  checkAIServiceStatus()

  // 初始化canvas
  nextTick(() => {
    if (originalCanvas.value) {
      const ctx = originalCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)
    }

    if (processedCanvas.value) {
      const ctx = processedCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)
    }
  })
})

// Expose methods for parent component
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
/* ===========================================
   背景移除工具 - 苹果设计风格
   =========================================== */

.background-remover {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 移除工作区 */
.removal-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 工具栏 */
.removal-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

/* 模式控制 */
.mode-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.mode-btn.active {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.ai-mode.active {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
  color: rgba(52, 199, 89, 0.9);
}

.manual-mode.active {
  background: rgba(255, 149, 0, 0.2);
  border-color: rgba(255, 149, 0, 0.4);
  color: rgba(255, 149, 0, 0.9);
}

/* 服务状态 */
.service-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.service-status.available {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.2);
  color: rgba(52, 199, 89, 0.8);
}

.service-status.unavailable {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: rgba(255, 59, 48, 0.8);
}

.status-icon {
  font-size: 14px;
}

.status-text {
  flex: 1;
}

.background-controls,
.tolerance-controls,
.custom-background {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.color-picker {
  width: 50px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.color-picker.small {
  width: 40px;
  height: 28px;
}

.color-value {
  font-size: 12px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.tolerance-slider {
  flex: 1;
  max-width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.tolerance-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
}

.tolerance-presets {
  display: flex;
  gap: 8px;
}

.preset-btn {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.preset-btn.active {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.tool-btn.ai-btn {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.tool-btn.ai-btn:hover:not(:disabled) {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
}

/* 图片对比 */
.image-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.image-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-panel h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.image-container {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.comparison-canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* 背景选项 */
.background-options {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.background-options h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.background-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.bg-preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bg-preset-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.bg-preset-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.bg-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  .background-remover {
    padding: 16px;
    gap: 16px;
  }

  .removal-toolbar {
    gap: 12px;
  }

  .background-controls,
  .tolerance-controls,
  .tool-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tolerance-slider {
    max-width: none;
    width: 100%;
  }

  .image-comparison {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .background-presets {
    grid-template-columns: repeat(4, 1fr);
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