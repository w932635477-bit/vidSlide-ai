<template>
  <div class="preview-content">
    <div class="preview-controls">
      <button class="prev-slide-btn" @click="$emit('prev-slide')" :disabled="currentSlideIndex === 0">
        ← 上一页
      </button>
      <span class="slide-counter">{{ currentSlideIndex + 1 }} / {{ slides.length }}</span>
      <button class="next-slide-btn" @click="$emit('next-slide')" :disabled="currentSlideIndex === slides.length - 1">
        下一页 →
      </button>
    </div>

    <div class="preview-canvas">
      <div
        class="preview-slide"
        v-for="(slide, index) in slides"
        :key="index"
        :style="{ background: slide.background }"
        v-show="index === currentSlideIndex"
      >
        <div
          v-for="(element, elementIndex) in slide.elements"
          :key="elementIndex"
          class="preview-element"
          :style="getElementStyles(element)"
        >
          <div class="element-content" v-html="renderElementContent(element)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  slides: { type: Array, default: () => [] },
  currentSlideIndex: { type: Number, default: 0 }
})

defineEmits(['prev-slide', 'next-slide'])

const getElementStyles = (element) => {
  return {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
    color: element.color || undefined,
    fontWeight: element.fontWeight || undefined,
    textAlign: element.textAlign || undefined,
    background: element.fill || undefined,
    border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : undefined,
    borderRadius: element.borderRadius || undefined,
    objectFit: element.objectFit || undefined
  }
}

const renderElementContent = (element) => {
  switch (element.type) {
    case 'text':
      return element.content || '文本内容'
    case 'image':
      return element.src ? `<img src="${element.src}" alt="${element.alt || '图片'}" style="width: 100%; height: 100%; object-fit: ${element.objectFit || 'cover'};">` : '📷 图片占位符'
    case 'shape':
      return getShapeSVG(element)
    case 'chart':
      return '📊 图表占位符'
    default:
      return '未知元素'
  }
}

const getShapeSVG = (element) => {
  const fill = element.fill || '#007aff'
  const stroke = element.stroke || '#007aff'
  const strokeWidth = element.strokeWidth || 2

  switch (element.shape) {
    case 'circle':
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
    case 'triangle':
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
    default:
      return `<svg width="100%" height="100%" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>`
  }
}
</script>

<style scoped>
.preview-content {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.preview-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.prev-slide-btn,
.next-slide-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prev-slide-btn:hover:not(:disabled),
.next-slide-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.prev-slide-btn:disabled,
.next-slide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-counter {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.preview-canvas {
  flex: 1;
  background: #f5f5f7;
  border-radius: 8px;
  overflow: hidden;
}

.preview-slide {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-element {
  position: absolute;
}

.element-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  overflow: hidden;
}
</style>
