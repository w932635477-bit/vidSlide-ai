<template>
  <div class="editor-canvas">
    <div class="canvas-header">
      <h4>模板结构</h4>
      <div class="canvas-actions">
        <button class="add-slide-btn" @click="$emit('add-slide')">添加幻灯片</button>
      </div>
    </div>

    <div class="slides-container">
      <div
        v-for="(slide, slideIndex) in slides"
        :key="slideIndex"
        class="slide-item"
        :class="{ active: activeSlideIndex === slideIndex }"
        @click="$emit('select-slide', slideIndex)"
      >
        <div class="slide-header">
          <span class="slide-title">幻灯片 {{ slideIndex + 1 }}</span>
          <div class="slide-actions">
            <button
              class="move-up-btn"
              :disabled="slideIndex === 0"
              @click.stop="$emit('move-slide-up', slideIndex)"
            >
              ↑
            </button>
            <button
              class="move-down-btn"
              :disabled="slideIndex === slides.length - 1"
              @click.stop="$emit('move-slide-down', slideIndex)"
            >
              ↓
            </button>
            <button
              class="delete-slide-btn"
              :disabled="slides.length <= 1"
              @click.stop="$emit('delete-slide', slideIndex)"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="slide-canvas" @drop="$emit('drop', $event, slideIndex)" @dragover.prevent>
          <div
            v-for="(element, elementIndex) in slide.elements"
            :key="elementIndex"
            class="canvas-element"
            :class="{ selected: isElementSelected(slideIndex, elementIndex) }"
            :style="getElementStyles(element)"
            @click.stop="$emit('select-element', slideIndex, elementIndex)"
          >
            <div class="element-content" v-html="renderElementContent(element)"></div>
            <div v-if="isElementSelected(slideIndex, elementIndex)" class="element-overlay">
              <div class="element-actions">
                <button class="edit-element-btn" @click.stop="$emit('edit-element', element)">
                  编辑
                </button>
                <button
                  class="delete-element-btn"
                  @click.stop="$emit('delete-element', slideIndex, elementIndex)"
                >
                  删除
                </button>
              </div>
              <div class="resize-handles">
                <div
                  class="resize-handle nw"
                  @mousedown="$emit('start-resize', $event, element, 'nw')"
                ></div>
                <div
                  class="resize-handle ne"
                  @mousedown="$emit('start-resize', $event, element, 'ne')"
                ></div>
                <div
                  class="resize-handle sw"
                  @mousedown="$emit('start-resize', $event, element, 'sw')"
                ></div>
                <div
                  class="resize-handle se"
                  @mousedown="$emit('start-resize', $event, element, 'se')"
                ></div>
              </div>
            </div>
          </div>

          <div v-if="slide.elements.length === 0" class="drop-zone">
            <div class="drop-zone-text">拖拽元素到此处</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  slides: { type: Array, default: () => [] },
  activeSlideIndex: { type: Number, default: 0 },
  selectedElement: { type: Object, default: null }
})

defineEmits([
  'add-slide',
  'select-slide',
  'move-slide-up',
  'move-slide-down',
  'delete-slide',
  'drop',
  'select-element',
  'edit-element',
  'delete-element',
  'start-resize'
])

const isElementSelected = (slideIndex, elementIndex) => {
  return (
    props.selectedElement?.slideIndex === slideIndex &&
    props.selectedElement?.elementIndex === elementIndex
  )
}

const getElementStyles = element => {
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

const renderElementContent = element => {
  switch (element.type) {
    case 'text':
      return element.content || '文本内容'
    case 'image':
      return element.src
        ? `<img src="${element.src}" alt="${element.alt || '图片'}" style="width: 100%; height: 100%; object-fit: ${element.objectFit || 'cover'};">`
        : '📷 图片占位符'
    case 'shape':
      return getShapeSVG(element)
    case 'chart':
      return '📊 图表占位符'
    default:
      return '未知元素'
  }
}

const getShapeSVG = element => {
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
.editor-canvas {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.add-slide-btn {
  padding: 6px 12px;
  background: #007aff;
  border: 1px solid #007aff;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.add-slide-btn:hover {
  background: #0056cc;
}

.slides-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.slide-item {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slide-item:hover {
  border-color: rgba(0, 122, 255, 0.3);
}

.slide-item.active {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.slide-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.slide-actions {
  display: flex;
  gap: 4px;
}

.move-up-btn,
.move-down-btn,
.delete-slide-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.move-up-btn:hover:not(:disabled),
.move-down-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
}

.delete-slide-btn:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.move-up-btn:disabled,
.move-down-btn:disabled,
.delete-slide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-canvas {
  position: relative;
  height: 300px;
  background: white;
  overflow: hidden;
}

.canvas-element {
  position: absolute;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  overflow: hidden;
}

.canvas-element:hover {
  border-color: rgba(0, 122, 255, 0.5);
}

.canvas-element.selected {
  border-color: #007aff;
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
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

.element-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 122, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.element-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.edit-element-btn,
.delete-element-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-element-btn {
  background: #007aff;
  color: white;
}

.delete-element-btn {
  background: #ff3b30;
  color: white;
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
}

.resize-handle.nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
.resize-handle.ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}
.resize-handle.sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}
.resize-handle.se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.drop-zone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #86868b;
  pointer-events: none;
}

.drop-zone-text {
  font-size: 14px;
}
</style>
