<template>
  <div class="animation-preview">
    <h5>动画预览</h5>

    <div class="preview-area">
      <div ref="textElement" class="preview-text">
        <span ref="keywordElement">关键词</span>
        动画演示
      </div>

      <div ref="pipElement" class="preview-pip">画中画动画演示</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const textElement = ref(null)
const keywordElement = ref(null)
const pipElement = ref(null)

defineExpose({
  textElement,
  keywordElement,
  pipElement
})
</script>

<style scoped>
.animation-preview {
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  margin-top: 20px;
}

.animation-preview h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.preview-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-text {
  padding: 20px;
  background: white;
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-text span {
  color: #007aff;
  font-weight: 600;
}

.preview-pip {
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
