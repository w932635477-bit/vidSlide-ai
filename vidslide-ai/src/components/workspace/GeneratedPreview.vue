<template>
  <div class="generated-preview">
    <!-- 预览头部 -->
    <div class="preview-header">
      <div class="header-left">
        <h3>✨ 生成结果预览</h3>
        <span class="preview-type">{{ previewType }}</span>
      </div>
      <div class="header-right">
        <button class="header-btn" title="返回原视频" @click="$emit('switch-to-original')">
          <span>🔙</span>
          <span>返回原视频</span>
        </button>
        <button class="header-btn primary" title="下载PPT" @click="$emit('download-ppt')">
          <span>📥</span>
          <span>下载PPT</span>
        </button>
        <button class="header-btn primary" title="导出视频" @click="$emit('export-video')">
          <span>🎬</span>
          <span>导出视频</span>
        </button>
      </div>
    </div>

    <!-- 预览内容 -->
    <div class="preview-content">
      <!-- 视频预览 -->
      <div class="video-preview">
        <video
          v-if="videoSrc"
          ref="videoElement"
          :src="videoSrc"
          class="preview-video"
          controls
          @loadedmetadata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
        ></video>
        <div v-else class="preview-placeholder">
          <div class="placeholder-icon">🎬</div>
          <div class="placeholder-text">正在生成视频...</div>
        </div>
      </div>

      <!-- PPT幻灯片预览 -->
      <div v-if="pptSlides && pptSlides.length > 0" class="ppt-preview">
        <div class="ppt-header">
          <h4>📊 PPT幻灯片 ({{ pptSlides.length }}页)</h4>
          <div class="ppt-controls">
            <button class="ppt-btn" :disabled="currentSlide === 0" @click="previousSlide">
              ◀ 上一页
            </button>
            <span class="slide-counter">{{ currentSlide + 1 }} / {{ pptSlides.length }}</span>
            <button
              class="ppt-btn"
              :disabled="currentSlide === pptSlides.length - 1"
              @click="nextSlide"
            >
              下一页 ▶
            </button>
          </div>
        </div>

        <div class="ppt-slides">
          <div
            v-for="(slide, index) in pptSlides"
            :key="index"
            class="slide-item"
            :class="{ active: index === currentSlide }"
            @click="currentSlide = index"
          >
            <img v-if="slide.thumbnail" :src="slide.thumbnail" :alt="`幻灯片 ${index + 1}`" />
            <div v-else class="slide-placeholder">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="slide-title">{{ slide.title || `幻灯片 ${index + 1}` }}</div>
          </div>
        </div>

        <!-- 当前幻灯片大图 -->
        <div class="current-slide">
          <img
            v-if="pptSlides[currentSlide]?.image"
            :src="pptSlides[currentSlide].image"
            :alt="`幻灯片 ${currentSlide + 1}`"
          />
          <div v-else class="slide-placeholder-large">
            <span>幻灯片 {{ currentSlide + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成信息 -->
    <div class="generation-info">
      <div class="info-item">
        <span class="info-label">生成时间:</span>
        <span class="info-value">{{ generationTime }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">视频时长:</span>
        <span class="info-value">{{ formatDuration(videoDuration) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">PPT页数:</span>
        <span class="info-value">{{ pptSlides?.length || 0 }}页</span>
      </div>
      <div class="info-item">
        <span class="info-label">文件大小:</span>
        <span class="info-value">{{ formatFileSize(fileSize) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

defineEmits(['switch-to-original', 'download-ppt', 'export-video'])

// 状态
const videoElement = ref(null)
const videoDuration = ref(0)
const currentSlide = ref(0)

// 计算属性
const previewType = computed(() => {
  if (props.pptSlides?.length > 0) {
    return 'PPT + 视频合成'
  }
  return '视频预览'
})

// 方法
const onVideoLoaded = event => {
  videoDuration.value = event.target.duration
}

const onTimeUpdate = event => {
  // 可以根据视频时间自动切换PPT页面
  // const currentTime = event.target.currentTime
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < props.pptSlides.length - 1) {
    currentSlide.value++
  }
}

const formatDuration = seconds => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = bytes => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.generated-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  overflow: hidden;
}

/* 预览头部 */
.preview-header {
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.preview-type {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-btn {
  padding: 8px 16px;
  border: 1px solid #3a3a3a;
  background: #2a2a2a;
  border-radius: 6px;
  color: #d4d4d4;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.header-btn:hover {
  background: #3a3a3a;
  border-color: #4a4a4a;
  transform: translateY(-1px);
}

.header-btn.primary {
  background: linear-gradient(135deg, #4a9eff 0%, #4ec9b0 100%);
  border-color: transparent;
  color: white;
}

.header-btn.primary:hover {
  background: linear-gradient(135deg, #5aafff 0%, #5ed9c0 100%);
}

/* 预览内容 */
.preview-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

.video-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #8a8a8a;
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 16px;
}

/* PPT预览 */
.ppt-preview {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: #252526;
  border-radius: 8px;
  overflow: hidden;
}

.ppt-header {
  padding: 12px;
  border-bottom: 1px solid #3a3a3a;
}

.ppt-header h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #fff;
}

.ppt-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ppt-btn {
  padding: 6px 12px;
  border: 1px solid #3a3a3a;
  background: #2a2a2a;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ppt-btn:hover:not(:disabled) {
  background: #3a3a3a;
}

.ppt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-counter {
  font-size: 12px;
  color: #8a8a8a;
}

.ppt-slides {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slide-item {
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: #2a2a2a;
  cursor: pointer;
  transition: all 0.2s;
}

.slide-item:hover {
  background: #3a3a3a;
}

.slide-item.active {
  border-color: #4a9eff;
  background: #3a3a3a;
}

.slide-item img {
  width: 100%;
  border-radius: 4px;
  margin-bottom: 6px;
}

.slide-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 4px;
  font-size: 24px;
  color: #4a4a4a;
  margin-bottom: 6px;
}

.slide-title {
  font-size: 12px;
  color: #d4d4d4;
  text-align: center;
}

.current-slide {
  padding: 12px;
  border-top: 1px solid #3a3a3a;
  background: #1e1e1e;
}

.current-slide img {
  width: 100%;
  border-radius: 4px;
}

.slide-placeholder-large {
  width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border-radius: 4px;
  font-size: 32px;
  color: #4a4a4a;
}

/* 生成信息 */
.generation-info {
  padding: 12px 16px;
  background: #252526;
  border-top: 1px solid #3a3a3a;
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.info-label {
  color: #8a8a8a;
}

.info-value {
  color: #d4d4d4;
  font-weight: 500;
}

/* 滚动条样式 */
.ppt-slides::-webkit-scrollbar {
  width: 6px;
}

.ppt-slides::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.ppt-slides::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 3px;
}

.ppt-slides::-webkit-scrollbar-thumb:hover {
  background: #4e4e52;
}
</style>
