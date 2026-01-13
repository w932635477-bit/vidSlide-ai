<template>
  <div
    class="color-matcher"
    role="region"
    aria-labelledby="color-matcher-heading"
  >
    <!-- 色彩匹配工具标题区域 -->
    <header
      class="tool-header"
      role="banner"
    >
      <h2 id="color-matcher-heading">🎨 色彩匹配工具</h2>
      <p class="tool-description">
        智能分析图片色彩，生成协调的配色方案和调色建议
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
        <h3>上传图片开始色彩分析</h3>
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

      <!-- 色彩分析工作区 -->
      <div
        v-else
        class="matcher-workspace"
      >
        <!-- 工具栏 -->
        <div class="matcher-toolbar">
          <div class="analysis-controls">
            <button
              class="tool-btn ai-btn"
              @click="analyzeColors"
              :disabled="isProcessing"
              aria-label="AI智能色彩分析"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0-1.4 0l-4 4a1 1 0 0 0 0 1.4l4 4a1 1 0 0 0 1.4-1.4L11.42 11H19a1 1 0 0 0 0-2h-7.58l3.3-3.3a1 1 0 0 0 0-1.4Z"/>
              </svg>
              AI色彩分析
            </button>

            <button
              class="tool-btn"
              @click="generatePalette"
              :disabled="isProcessing || colorPalette.length === 0"
              aria-label="生成配色方案"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              生成配色
            </button>

            <button
              class="tool-btn"
              @click="applyColorCorrection"
              :disabled="isProcessing || colorPalette.length === 0"
              aria-label="应用色彩校正"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              色彩校正
            </button>
          </div>

          <div class="export-controls">
            <button
              class="tool-btn secondary"
              @click="exportPalette"
              :disabled="harmonizedPalette.length === 0"
              aria-label="导出配色方案"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              导出配色
            </button>
          </div>
        </div>

        <!-- 色彩分析结果 -->
        <div class="color-analysis-results">
          <!-- 原始色彩分布 -->
          <div class="color-section">
            <h4>原始色彩分析</h4>
            <div class="color-palette original-palette">
              <div
                v-for="(color, index) in colorPalette"
                :key="'original-' + index"
                class="color-swatch"
                :style="{ backgroundColor: color.hex }"
                @click="selectColor(color)"
                :class="{ selected: selectedColor && selectedColor.hex === color.hex }"
                role="button"
                tabindex="0"
                :aria-label="`选择颜色 ${color.hex}，占比 ${color.percentage}%`"
              >
                <span class="color-info">
                  <span class="color-hex">{{ color.hex }}</span>
                  <span class="color-percentage">{{ color.percentage }}%</span>
                </span>
              </div>
            </div>

            <!-- 色彩统计 -->
            <div
              v-if="colorStats"
              class="color-statistics"
            >
              <div class="stat-item">
                <span class="stat-label">主色调:</span>
                <span class="stat-value">{{ colorStats.dominantHue }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">色彩丰富度:</span>
                <span class="stat-value">{{ colorStats.colorfulness }}/100</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">亮度范围:</span>
                <span class="stat-value">{{ colorStats.brightnessRange }}</span>
              </div>
            </div>
          </div>

          <!-- 协调配色方案 -->
          <div
            v-if="harmonizedPalette.length > 0"
            class="color-section"
          >
            <h4>协调配色方案</h4>
            <div class="harmonized-palettes">
              <div
                v-for="(scheme, index) in harmonizedPalette"
                :key="'scheme-' + index"
                class="palette-scheme"
              >
                <h5>{{ scheme.name }}</h5>
                <div class="scheme-colors">
                  <div
                    v-for="(color, colorIndex) in scheme.colors"
                    :key="'scheme-' + index + '-' + colorIndex"
                    class="scheme-color"
                    :style="{ backgroundColor: color }"
                    :title="color"
                  ></div>
                </div>
                <button
                  class="apply-scheme-btn"
                  @click="applyColorScheme(scheme)"
                  :aria-label="`应用 ${scheme.name} 配色方案`"
                >
                  应用此方案
                </button>
              </div>
            </div>
          </div>

          <!-- 色彩校正预览 -->
          <div
            v-if="correctedImageUrl"
            class="color-section"
          >
            <h4>色彩校正预览</h4>
            <div class="correction-preview">
              <div class="preview-item">
                <h5>原始图片</h5>
                <canvas
                  ref="originalPreviewCanvas"
                  class="preview-canvas"
                  role="img"
                  :aria-label="`原始图片预览`"
                ></canvas>
              </div>
              <div class="preview-item">
                <h5>校正后图片</h5>
                <img
                  :src="correctedImageUrl"
                  :alt="`色彩校正后的图片`"
                  class="preview-image"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 图片预览 -->
        <div class="image-preview-section">
          <div class="preview-container">
            <canvas
              ref="previewCanvas"
              class="preview-canvas"
              role="img"
              :aria-label="`色彩分析图片预览`"
            ></canvas>

            <!-- 选色器 -->
            <div
              v-if="selectedColor"
              class="color-picker-overlay"
              @click="pickColorFromImage"
            >
              <div
                class="color-picker-cursor"
                :style="{ left: pickerPosition.x + 'px', top: pickerPosition.y + 'px' }"
              ></div>
            </div>
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
            @click="downloadCorrectedImage"
            :disabled="!correctedImageUrl"
            aria-label="下载色彩校正后的图片"
          >
            💾 下载图片
          </button>
        </div>
      </div>
    </section>

    <!-- 配色方案导出 -->
    <section
      v-if="exportData"
      class="export-section"
      role="complementary"
      aria-labelledby="export-heading"
    >
      <h3 id="export-heading">配色方案导出</h3>

      <div class="export-content">
        <div class="export-preview">
          <div
            v-for="color in exportData.colors"
            :key="color.hex"
            class="export-color-swatch"
            :style="{ backgroundColor: color.hex }"
          >
            <span class="export-color-hex">{{ color.hex }}</span>
            <span class="export-color-name">{{ color.name }}</span>
          </div>
        </div>

        <div class="export-formats">
          <button
            class="export-format-btn"
            @click="exportAsJSON"
            aria-label="导出为JSON格式"
          >
            📄 JSON
          </button>
          <button
            class="export-format-btn"
            @click="exportAsCSS"
            aria-label="导出为CSS变量"
          >
            🎨 CSS
          </button>
          <button
            class="export-format-btn"
            @click="exportAsPNG"
            aria-label="导出为PNG图片"
          >
            🖼️ PNG
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  supportedFormats: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/webp']
  },
  maxColors: {
    type: Number,
    default: 8 // 最多提取8种主要颜色
  }
})

// Emits
const emit = defineEmits([
  'image-loaded',
  'colors-analyzed',
  'palette-generated',
  'correction-applied',
  'image-cleared'
])

// Reactive data
const currentImage = ref(null)
const previewCanvas = ref(null)
const originalPreviewCanvas = ref(null)
const canvasSize = ref({ width: 400, height: 300 })
const originalSize = ref({ width: 0, height: 0 })
const colorPalette = ref([])
const harmonizedPalette = ref([])
const selectedColor = ref(null)
const correctedImageUrl = ref('')
const exportData = ref(null)
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')
const pickerPosition = ref({ x: 0, y: 0 })
const colorStats = ref(null)

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
      const maxWidth = 400
      const maxHeight = 300
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)

      canvasSize.value = {
        width: img.width * ratio,
        height: img.height * ratio
      }

      // 绘制到预览canvas
      nextTick(() => {
        if (previewCanvas.value) {
          const ctx = previewCanvas.value.getContext('2d')
          ctx.drawImage(img, 0, 0, canvasSize.value.width, canvasSize.value.height)
          resolve()
        }
      })
    }
    img.onerror = reject
    img.src = imageUrl
  })
}

const analyzeColors = async () => {
  if (!currentImage.value || !previewCanvas.value) return

  isProcessing.value = true
  processingMessage.value = '正在分析图片色彩...'
  processingProgress.value = 10

  try {
    const ctx = previewCanvas.value.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvasSize.value.width, canvasSize.value.height)
    const data = imageData.data

    processingMessage.value = '正在提取颜色...'
    processingProgress.value = 30

    // 提取颜色
    const colors = extractColors(data, props.maxColors)
    colorPalette.value = colors

    processingMessage.value = '正在分析色彩统计...'
    processingProgress.value = 60

    // 计算色彩统计
    colorStats.value = calculateColorStats(colors)

    processingMessage.value = '正在生成配色方案...'
    processingProgress.value = 80

    // 生成协调配色方案
    harmonizedPalette.value = generateHarmonizedPalette(colors)

    processingProgress.value = 100

    emit('colors-analyzed', {
      palette: colors,
      stats: colorStats.value,
      harmonized: harmonizedPalette.value
    })

  } catch (error) {
    console.error('色彩分析失败:', error)
    alert('色彩分析失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const extractColors = (imageData, maxColors) => {
  const colorMap = new Map()
  const data = imageData

  // 采样像素（每10个像素采样一次以提高性能）
  for (let i = 0; i < data.length; i += 40) { // 10 * 4 (RGBA)
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const alpha = data[i + 3]

    // 跳过透明像素
    if (alpha < 128) continue

    const hex = rgbToHex(r, g, b)
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
  }

  // 转换为颜色对象数组
  const colorArray = Array.from(colorMap.entries()).map(([hex, count]) => ({
    hex,
    rgb: hexToRgb(hex),
    hsl: rgbToHsl(hexToRgb(hex)),
    count,
    percentage: 0 // 稍后计算
  }))

  // 计算百分比
  const totalPixels = Array.from(colorMap.values()).reduce((sum, count) => sum + count, 0)
  colorArray.forEach(color => {
    color.percentage = Math.round((color.count / totalPixels) * 100)
  })

  // 按数量排序并限制数量
  return colorArray
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
}

const calculateColorStats = (colors) => {
  if (colors.length === 0) return null

  // 计算主色调（最常见的颜色）
  const dominantColor = colors[0]

  // 计算色彩丰富度（基于颜色的多样性）
  const uniqueHues = new Set(colors.map(c => Math.round(c.hsl.h)))
  const colorfulness = Math.min(uniqueHues.size * 12.5, 100)

  // 计算亮度范围
  const brightnesses = colors.map(c => c.hsl.l)
  const minBrightness = Math.min(...brightnesses)
  const maxBrightness = Math.max(...brightnesses)
  const brightnessRange = `${Math.round(minBrightness * 100)}-${Math.round(maxBrightness * 100)}`

  return {
    dominantHue: dominantColor.hex,
    colorfulness: Math.round(colorfulness),
    brightnessRange,
    totalColors: colors.length
  }
}

const generateHarmonizedPalette = (colors) => {
  if (colors.length === 0) return []

  const baseColor = colors[0] // 使用主要颜色作为基准

  return [
    {
      name: '互补色',
      colors: generateComplementaryPalette(baseColor)
    },
    {
      name: '类似色',
      colors: generateAnalogousPalette(baseColor)
    },
    {
      name: '三色组',
      colors: generateTriadicPalette(baseColor)
    },
    {
      name: '分裂互补',
      colors: generateSplitComplementaryPalette(baseColor)
    }
  ]
}

const generateComplementaryPalette = (baseColor) => {
  const hsl = baseColor.hsl
  const complementH = (hsl.h + 180) % 360

  return [
    baseColor.hex,
    hslToHex({ h: complementH, s: hsl.s, l: hsl.l }),
    hslToHex({ h: complementH, s: hsl.s, l: Math.max(hsl.l - 0.2, 0.1) }),
    hslToHex({ h: complementH, s: hsl.s, l: Math.min(hsl.l + 0.2, 0.9) })
  ]
}

const generateAnalogousPalette = (baseColor) => {
  const hsl = baseColor.hsl

  return [
    hslToHex({ h: hsl.h, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 60) % 360, s: Math.max(hsl.s - 0.1, 0), l: hsl.l })
  ]
}

const generateTriadicPalette = (baseColor) => {
  const hsl = baseColor.hsl

  return [
    hslToHex({ h: hsl.h, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: Math.max(hsl.l - 0.1, 0.1) })
  ]
}

const generateSplitComplementaryPalette = (baseColor) => {
  const hsl = baseColor.hsl
  const complementH = (hsl.h + 180) % 360

  return [
    hslToHex({ h: hsl.h, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (complementH + 30) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (complementH - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: complementH, s: Math.max(hsl.s - 0.1, 0), l: Math.min(hsl.l + 0.1, 0.9) })
  ]
}

const applyColorCorrection = async () => {
  if (!currentImage.value || colorPalette.value.length === 0) return

  isProcessing.value = true
  processingMessage.value = '正在应用色彩校正...'
  processingProgress.value = 30

  try {
    // 创建校正后的图片
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize.value.width
    canvas.height = canvasSize.value.height
    const ctx = canvas.getContext('2d')

    // 绘制原始图片
    ctx.drawImage(currentImage.value, 0, 0, canvasSize.value.width, canvasSize.value.height)

    // 应用色彩校正（这里使用简单的对比度和亮度调整）
    const imageData = ctx.getImageData(0, 0, canvasSize.value.width, canvasSize.value.height)
    const data = imageData.data

    // 简单的色彩增强
    for (let i = 0; i < data.length; i += 4) {
      // 增加对比度
      data[i] = Math.min(255, data[i] * 1.2)     // R
      data[i + 1] = Math.min(255, data[i + 1] * 1.2) // G
      data[i + 2] = Math.min(255, data[i + 2] * 1.2) // B
    }

    ctx.putImageData(imageData, 0, 0)

    processingProgress.value = 100
    correctedImageUrl.value = canvas.toDataURL('image/jpeg', 0.9)

    emit('correction-applied', { correctedImageUrl: correctedImageUrl.value })

  } catch (error) {
    console.error('色彩校正失败:', error)
    alert('色彩校正失败，请重试')
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

const generatePalette = () => {
  if (colorPalette.value.length === 0) return

  exportData.value = {
    colors: colorPalette.value.map((color, index) => ({
      ...color,
      name: `Color ${index + 1}`
    })),
    stats: colorStats.value,
    generatedAt: new Date().toISOString()
  }

  emit('palette-generated', exportData.value)
}

const selectColor = (color) => {
  selectedColor.value = color
}

const pickColorFromImage = (event) => {
  if (!previewCanvas.value) return

  const rect = previewCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  pickerPosition.value = { x, y }

  const ctx = previewCanvas.value.getContext('2d')
  const imageData = ctx.getImageData(x, y, 1, 1)
  const [r, g, b] = imageData.data

  const hex = rgbToHex(r, g, b)
  selectedColor.value = {
    hex,
    rgb: { r, g, b },
    hsl: rgbToHsl({ r, g, b }),
    percentage: 0
  }
}

const applyColorScheme = (scheme) => {
  // 这里可以实现应用配色方案到图片的逻辑
  console.log('应用配色方案:', scheme)
}

// 导出功能
const exportPalette = () => {
  generatePalette()
}

const exportAsJSON = () => {
  if (!exportData.value) return

  const dataStr = JSON.stringify(exportData.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadBlob(dataBlob, 'color-palette.json')
}

const exportAsCSS = () => {
  if (!exportData.value) return

  let css = ':root {\n'
  exportData.value.colors.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color.hex};\n`
  })
  css += '}\n'

  const dataBlob = new Blob([css], { type: 'text/css' })
  downloadBlob(dataBlob, 'color-palette.css')
}

const exportAsPNG = () => {
  if (!exportData.value) return

  // 创建配色卡片PNG
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 200
  const ctx = canvas.getContext('2d')

  // 绘制背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制颜色块
  const colors = exportData.value.colors
  const blockWidth = canvas.width / colors.length

  colors.forEach((color, index) => {
    ctx.fillStyle = color.hex
    ctx.fillRect(index * blockWidth, 0, blockWidth, 150)

    // 绘制颜色信息
    ctx.fillStyle = '#000000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(color.hex, index * blockWidth + blockWidth / 2, 170)
  })

  canvas.toBlob((blob) => {
    downloadBlob(blob, 'color-palette.png')
  })
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 工具函数
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHsl = ({ r, g, b }) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s, l }
}

const hslToHex = ({ h, s, l }) => {
  h /= 360
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

const clearImage = () => {
  currentImage.value = null
  colorPalette.value = []
  harmonizedPalette.value = []
  selectedColor.value = null
  correctedImageUrl.value = ''
  exportData.value = null
  colorStats.value = null
  canvasSize.value = { width: 400, height: 300 }
  originalSize.value = { width: 0, height: 0 }

  // 清除canvas
  if (previewCanvas.value) {
    const ctx = previewCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  }

  emit('image-cleared')
}

const downloadCorrectedImage = () => {
  if (!correctedImageUrl.value) return

  const link = document.createElement('a')
  link.href = correctedImageUrl.value
  link.download = `color-corrected-${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lifecycle
onMounted(() => {
  // 初始化canvas
  nextTick(() => {
    if (previewCanvas.value) {
      const ctx = previewCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)
    }
  })
})

// Expose methods for parent component
defineExpose({
  loadImage,
  analyzeColors,
  generatePalette,
  applyColorCorrection,
  clearImage,
  getColorPalette: () => colorPalette.value,
  getColorStats: () => colorStats.value,
  getHarmonizedPalette: () => harmonizedPalette.value,
  getCorrectedImageUrl: () => correctedImageUrl.value
})
</script>

<style scoped>
/* ===========================================
   色彩匹配工具 - 苹果设计风格
   =========================================== */

.color-matcher {
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

/* 匹配工作区 */
.matcher-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 工具栏 */
.matcher-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.analysis-controls,
.export-controls {
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

.tool-btn.ai-btn {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.tool-btn.ai-btn:hover:not(:disabled) {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
}

.tool-btn.secondary {
  background: rgba(142, 142, 147, 0.1);
  border-color: rgba(142, 142, 147, 0.3);
  color: rgba(142, 142, 147, 0.9);
}

.tool-btn.secondary:hover:not(:disabled) {
  background: rgba(142, 142, 147, 0.2);
  border-color: rgba(142, 142, 147, 0.4);
}

/* 色彩分析结果 */
.color-analysis-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.color-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* 色彩调色板 */
.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  border: 2px solid transparent;
}

.color-swatch:hover {
  transform: scale(1.05);
}

.color-swatch.selected {
  border-color: rgba(0, 122, 255, 0.8);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 4px;
  border-radius: 0 0 6px 6px;
  font-size: 10px;
  color: white;
  text-align: center;
}

.color-hex {
  display: block;
  font-family: monospace;
}

.color-percentage {
  display: block;
  opacity: 0.8;
}

/* 色彩统计 */
.color-statistics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* 协调配色方案 */
.harmonized-palettes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.palette-scheme {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.palette-scheme h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.scheme-colors {
  display: flex;
  gap: 4px;
}

.scheme-color {
  flex: 1;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.apply-scheme-btn {
  padding: 6px 12px;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 122, 255, 0.1);
  color: rgba(0, 122, 255, 0.9);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.apply-scheme-btn:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

/* 色彩校正预览 */
.correction-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.preview-canvas,
.preview-image {
  width: 100%;
  height: auto;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 图片预览 */
.image-preview-section {
  display: flex;
  justify-content: center;
}

.preview-container {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.preview-canvas {
  display: block;
  border-radius: 8px;
}

/* 选色器 */
.color-picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: crosshair;
}

.color-picker-cursor {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 122, 255, 0.8);
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
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

/* 导出部分 */
.export-section {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.export-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.export-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.export-color-swatch {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.export-color-hex {
  font-family: monospace;
}

.export-color-name {
  opacity: 0.8;
}

.export-formats {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.export-format-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.export-format-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
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
  .color-matcher {
    padding: 16px;
    gap: 16px;
  }

  .matcher-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .analysis-controls,
  .export-controls {
    justify-content: center;
  }

  .color-palette {
    justify-content: center;
  }

  .harmonized-palettes {
    grid-template-columns: 1fr;
  }

  .correction-preview {
    grid-template-columns: 1fr;
  }

  .workspace-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .export-preview {
    justify-content: center;
  }

  .export-formats {
    flex-direction: column;
  }

  .export-format-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>