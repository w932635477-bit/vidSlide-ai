<template>
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
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  canvasSize: { type: Object, default: () => ({ width: 600, height: 400 }) },
  currentImage: { type: Object, default: null }
})

const originalCanvas = ref(null)
const processedCanvas = ref(null)

const drawOriginalImage = () => {
  if (originalCanvas.value && props.currentImage) {
    const ctx = originalCanvas.value.getContext('2d')
    ctx.drawImage(props.currentImage, 0, 0, props.canvasSize.width, props.canvasSize.height)
  }
}

watch(() => props.currentImage, () => {
  nextTick(() => {
    drawOriginalImage()
  })
})

onMounted(() => {
  nextTick(() => {
    if (originalCanvas.value) {
      const ctx = originalCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, props.canvasSize.width, props.canvasSize.height)
    }

    if (processedCanvas.value) {
      const ctx = processedCanvas.value.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, props.canvasSize.width, props.canvasSize.height)
    }
  })
})

defineExpose({
  originalCanvas,
  processedCanvas
})
</script>

<style scoped>
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

@media (max-width: 768px) {
  .image-comparison {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
