<template>
  <div class="generated-preview">
    <!-- 生成的视频预览 -->
    <video
      v-if="videoSrc"
      ref="videoElement"
      :src="videoSrc"
      class="preview-video"
      controls
      @loadedmetadata="onVideoLoaded"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
    ></video>
    <div v-else class="preview-placeholder">
      <div class="placeholder-icon">🎬</div>
      <div class="placeholder-text">正在生成视频...</div>
    </div>

    <!-- 生成信息提示 -->
    <div class="generation-badge">
      <span class="badge-icon">✨</span>
      <span class="badge-text">生成结果预览</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  pptSlides: {
    type: Array,
    default: () => []
  },
  generationTime: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['switch-to-original', 'download-ppt', 'export-video', 'play', 'pause'])

// 状态
const videoElement = ref(null)

// 方法
const onVideoLoaded = () => {
  // 视频加载完成
}

const onTimeUpdate = () => {
  // 视频时间更新
}

const onPlay = () => {
  emit('play')
}

const onPause = () => {
  emit('pause')
}
</script>

<style scoped>
.generated-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 视频预览 */
.preview-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

/* 占位符 */
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #888;
}

.placeholder-icon {
  font-size: 64px;
}

.placeholder-text {
  font-size: 16px;
  color: #d4d4d4;
}

/* 生成标识 */
.generation-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.badge-icon {
  font-size: 16px;
}
</style>
