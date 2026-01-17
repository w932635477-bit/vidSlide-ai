<template>
  <div class="preview-section">
    <div class="preview-container">
      <!-- 原始图片预览 -->
      <div class="preview-panel">
        <h4>原始图片</h4>
        <div class="canvas-wrapper">
          <canvas
            ref="originalCanvas"
            :width="canvasSize.width"
            :height="canvasSize.height"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
          ></canvas>
          
          <!-- 取色器指示器 -->
          <div
            v-if="showPicker"
            class="color-picker-indicator"
            :style="{ left: pickerPosition.x + 'px', top: pickerPosition.y + 'px' }"
          >
            <div class="picker-ring" :style="{ borderColor: pickedColor }"></div>
            <div class="picker-color" :style="{ backgroundColor: pickedColor }"></div>
          </div>
        </div>
      </div>

      <!-- 校正后图片预览 -->
      <div v-if="correctedImageUrl" class="preview-panel">
        <h4>色彩校正后</h4>
        <div class="canvas-wrapper">
          <img :src="correctedImageUrl" alt="校正后的图片" class="corrected-image" />
        </div>
      </div>
    </div>

    <!-- 取色信息 -->
    <div v-if="pickedColor" class="picked-color-info">
      <div class="picked-color-swatch" :style="{ backgroundColor: pickedColor }"></div>
      <div class="picked-color-details">
        <span class="color-value">{{ pickedColor }}</span>
        <el-button size="small" @click="copyPickedColor">复制</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  image: {
    type: Object,
    default: null
  },
  canvasSize: {
    type: Object,
    default: () => ({ width: 400, height: 300 })
  },
  correctedImageUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['color-picked'])

const originalCanvas = ref(null)
const showPicker = ref(false)
const pickerPosition = ref({ x: 0, y: 0 })
const pickedColor = ref('')

// 绘制图片到canvas
const drawImage = () => {
  if (!props.image || !originalCanvas.value) return
  
  nextTick(() => {
    const ctx = originalCanvas.value.getContext('2d')
    ctx.drawImage(props.image, 0, 0, props.canvasSize.width, props.canvasSize.height)
  })
}

// 监听图片变化
watch(() => props.image, drawImage, { immediate: true })
watch(() => props.canvasSize, drawImage)

// 处理canvas点击取色
const handleCanvasClick = (event) => {
  if (!originalCanvas.value) return
  
  const rect = originalCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const ctx = originalCanvas.value.getContext('2d')
  const pixel = ctx.getImageData(x, y, 1, 1).data
  
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
  pickedColor.value = hex
  pickerPosition.value = { x, y }
  showPicker.value = true
  
  emit('color-picked', {
    hex,
    rgb: { r: pixel[0], g: pixel[1], b: pixel[2] },
    position: { x, y }
  })
}

// 处理鼠标移动
const handleCanvasMove = (event) => {
  if (!showPicker.value) return
  
  const rect = originalCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  pickerPosition.value = { x, y }
}

// RGB转HEX
const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// 复制颜色
const copyPickedColor = async () => {
  if (!pickedColor.value) return
  
  try {
    await navigator.clipboard.writeText(pickedColor.value)
    ElMessage.success(`已复制颜色 ${pickedColor.value}`)
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 暴露canvas引用给父组件
defineExpose({
  canvas: originalCanvas,
  drawImage
})
</script>

<style scoped>
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.preview-panel {
  flex: 1;
  min-width: 300px;
}

.preview-panel h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.canvas-wrapper canvas {
  display: block;
  cursor: crosshair;
}

.corrected-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.color-picker-indicator {
  position: absolute;
  width: 40px;
  height: 40px;
  margin-left: -20px;
  margin-top: -20px;
  pointer-events: none;
}

.picker-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
}

.picker-color {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.picked-color-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.picked-color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.picked-color-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-value {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
}
</style>
