<template>
  <div
    class="upload-area"
    @dragover.prevent
    @drop.prevent="$emit('drop', $event)"
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
      @change="$emit('file-select', $event)"
      class="file-input"
      aria-label="选择图片文件"
    />
  </div>
</template>

<script setup>
defineEmits(['drop', 'file-select'])
</script>

<style scoped>
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
</style>
