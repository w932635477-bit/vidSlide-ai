<template>
  <div class="editor-properties">
    <div class="properties-panel">
      <h4>属性面板</h4>

      <!-- 幻灯片属性 -->
      <div v-if="activeSlideIndex !== null && !selectedElement" class="property-section">
        <h5>幻灯片属性</h5>
        <div class="property-group">
          <label class="property-label">背景</label>
          <input
            type="color"
            :value="slide?.background"
            @input="$emit('update-slide', activeSlideIndex, 'background', $event.target.value)"
          />
        </div>
        <div class="property-group">
          <label class="property-label">过渡效果</label>
          <select
            :value="slide?.transition"
            @change="$emit('update-slide', activeSlideIndex, 'transition', $event.target.value)"
          >
            <option value="fade">淡入淡出</option>
            <option value="slide">滑动</option>
            <option value="zoom">缩放</option>
            <option value="none">无</option>
          </select>
        </div>
      </div>

      <!-- 元素属性 -->
      <div v-if="selectedElement" class="property-section">
        <h5>元素属性</h5>
        <div class="property-group">
          <label class="property-label">类型</label>
          <span class="property-value">{{ selectedElement.element.type }}</span>
        </div>

        <div class="property-group">
          <label class="property-label">位置 X</label>
          <input
            type="number"
            :value="selectedElement.element.x"
            min="0"
            max="100"
            @input="$emit('update-element', 'x', Number($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">位置 Y</label>
          <input
            type="number"
            :value="selectedElement.element.y"
            min="0"
            max="100"
            @input="$emit('update-element', 'y', Number($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">宽度</label>
          <input
            type="number"
            :value="selectedElement.element.width"
            min="10"
            max="100"
            @input="$emit('update-element', 'width', Number($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">高度</label>
          <input
            type="number"
            :value="selectedElement.element.height"
            min="10"
            max="100"
            @input="$emit('update-element', 'height', Number($event.target.value))"
          />
        </div>

        <!-- 文本元素特有属性 -->
        <template v-if="selectedElement.element.type === 'text'">
          <div class="property-group">
            <label class="property-label">文本内容</label>
            <textarea
              :value="selectedElement.element.content"
              rows="3"
              @input="$emit('update-element', 'content', $event.target.value)"
            ></textarea>
          </div>

          <div class="property-group">
            <label class="property-label">字体大小</label>
            <input
              type="number"
              :value="selectedElement.element.fontSize"
              min="12"
              max="72"
              @input="$emit('update-element', 'fontSize', Number($event.target.value))"
            />
          </div>

          <div class="property-group">
            <label class="property-label">字体颜色</label>
            <input
              type="color"
              :value="selectedElement.element.color"
              @input="$emit('update-element', 'color', $event.target.value)"
            />
          </div>
        </template>

        <!-- 图片元素特有属性 -->
        <template v-if="selectedElement.element.type === 'image'">
          <div class="property-group">
            <label class="property-label">图片URL</label>
            <input
              type="text"
              :value="selectedElement.element.src"
              placeholder="输入图片URL"
              @input="$emit('update-element', 'src', $event.target.value)"
            />
          </div>

          <div class="property-group">
            <label class="property-label">适应方式</label>
            <select
              :value="selectedElement.element.objectFit"
              @change="$emit('update-element', 'objectFit', $event.target.value)"
            >
              <option value="cover">覆盖</option>
              <option value="contain">包含</option>
              <option value="fill">填充</option>
            </select>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeSlideIndex: { type: Number, default: null },
  slide: { type: Object, default: null },
  selectedElement: { type: Object, default: null }
})

defineEmits(['update-slide', 'update-element'])
</script>

<style scoped>
.editor-properties {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow-y: auto;
}

.properties-panel h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.property-label {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
}

.property-value {
  font-size: 13px;
  color: #1d1d1f;
}

.property-group input,
.property-group select,
.property-group textarea {
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 13px;
}

.property-group textarea {
  resize: vertical;
  min-height: 60px;
}
</style>
