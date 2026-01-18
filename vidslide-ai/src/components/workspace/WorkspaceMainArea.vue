<template>
  <div class="workspace-main-area">
    <!-- 视频预览区 -->
    <div
      v-if="!showGeneratedPreview"
      class="video-section"
      :class="{ 'vertical-video': isVerticalVideo }"
    >
      <div class="editor-canvas">
        <video
          v-if="videoSrc"
          ref="videoElement"
          :src="videoSrc"
          class="preview-video"
          :class="{ vertical: isVerticalVideo }"
          controls
          @loadedmetadata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
          @play="onPlay"
          @pause="onPause"
        ></video>

        <!-- 一键生成按钮（剪映风格） -->
        <button
          v-if="videoSrc && !isGenerating"
          class="auto-generate-btn"
          title="一键生成视频"
          @click="$emit('auto-generate')"
        >
          <span class="btn-icon">✨</span>
          <span class="btn-text">一键生成</span>
        </button>

        <!-- 生成中提示 -->
        <div v-if="isGenerating" class="generating-overlay">
          <div class="generating-content">
            <div class="generating-spinner"></div>
            <div class="generating-text">正在生成中...</div>
            <div class="generating-tip">请在右侧监控台查看进度</div>
          </div>
        </div>

        <!-- 画中画预览 -->
        <div v-if="pipEnabled && videoSrc" class="pip-overlay">
          <div class="pip-window" :style="pipStyle">
            <video :src="videoSrc" class="pip-video" muted></video>
          </div>
        </div>

        <!-- 质量控制按钮 -->
        <button
          v-if="videoSrc"
          class="quality-control-toggle"
          title="质量控制"
          @click="toggleQualityControl"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M12 1v6m0 6v6m-5.2-9.8l4.2 4.2m4.2 4.2l4.2 4.2m-16.8 0l4.2-4.2m4.2-4.2l4.2-4.2"
            />
          </svg>
        </button>

        <!-- 质量控制面板 -->
        <PreviewQualityControl
          v-if="showQualityControl"
          :resolution="previewResolution"
          :quality="previewQuality"
          :optimizations="previewOptimizations"
          @update:resolution="updateResolution"
          @update:quality="updateQuality"
          @update:optimizations="updateOptimizations"
          @close="toggleQualityControl"
        />
      </div>
    </div>

    <!-- 生成预览区 -->
    <GeneratedPreview
      v-if="showGeneratedPreview"
      :video-src="generatedVideoSrc"
      :ppt-slides="generatedPptSlides"
      :generation-time="generationTime"
      :file-size="generatedFileSize"
      @switch-to-original="showGeneratedPreview = false"
      @download-ppt="handleDownloadPpt"
      @export-video="handleExportVideo"
    />

    <!-- 内嵌时间轴 -->
    <div v-if="videoSrc && !showGeneratedPreview" class="embedded-timeline">
      <div class="timeline-header">
        <div class="timeline-controls">
          <button class="timeline-btn" title="播放/暂停" @click="togglePlayPause">
            <span>{{ isPlaying ? '⏸' : '▶' }}</span>
          </button>
          <span class="time-display"
            >{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span
          >
        </div>
        <div class="timeline-zoom">
          <button class="zoom-btn" title="缩小" @click="zoomOut">−</button>
          <span class="zoom-level">{{ zoomLevel }}%</span>
          <button class="zoom-btn" title="放大" @click="zoomIn">+</button>
        </div>
      </div>

      <div class="timeline-track">
        <div class="timeline-ruler">
          <div
            v-for="mark in timeMarks"
            :key="mark.time"
            class="time-mark"
            :style="{ left: mark.position + '%' }"
          >
            <span class="mark-label">{{ formatTime(mark.time) }}</span>
          </div>
        </div>

        <div class="timeline-content">
          <div class="video-track">
            <div class="track-label">视频</div>
            <div class="track-items">
              <div class="track-item video-item" :style="{ width: '100%' }">
                <span class="item-name">{{ videoFileName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="playhead" :style="{ left: playheadPosition + '%' }">
          <div class="playhead-line"></div>
          <div class="playhead-handle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import PreviewQualityControl from '../PreviewQualityControl.vue'
import GeneratedPreview from './GeneratedPreview.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false
  }
})

defineEmits(['auto-generate'])

const store = useWorkspaceStore()
const videoElement = ref(null)

// 时间轴状态
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const zoomLevel = ref(100)
const videoFileName = ref('当前视频')

// 生成预览状态
const showGeneratedPreview = ref(false)
const generatedVideoSrc = ref('')
const generatedPptSlides = ref([])
const generationTime = ref('')
const generatedFileSize = ref(0)

// 计算属性
const videoSrc = computed(() => store.video.src)
const isVerticalVideo = computed(() => store.isVerticalVideo)
const pipEnabled = computed(() => store.pip.enabled)
const showQualityControl = computed(() => store.ui.showQualityControl)
const previewResolution = computed(() => store.preview.resolution)
const previewQuality = computed(() => store.preview.quality)
const previewOptimizations = computed(() => store.preview.optimizations)
const isGenerating = computed(() => store.isGenerating || false)

// 播放头位置
const playheadPosition = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 时间刻度
const timeMarks = computed(() => {
  const marks = []
  const totalSeconds = duration.value
  const interval = totalSeconds > 60 ? 10 : 5 // 根据视频长度调整间隔

  for (let i = 0; i <= totalSeconds; i += interval) {
    marks.push({
      time: i,
      position: (i / totalSeconds) * 100
    })
  }

  return marks
})

// 画中画样式
const pipStyle = computed(() => {
  const settings = store.pip.settings
  const position = settings.position || 'top-right'
  const size = settings.size || 25

  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  }

  return {
    ...positions[position],
    width: `${size}%`,
    aspectRatio: '16/9'
  }
})

// 格式化时间
const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 时间轴缩放
const zoomIn = () => {
  if (zoomLevel.value < 200) {
    zoomLevel.value += 25
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 50) {
    zoomLevel.value -= 25
  }
}

// 切换播放/暂停
const togglePlayPause = () => {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }
}

// 视频加载完成
const onVideoLoaded = event => {
  const video = event.target
  duration.value = video.duration
  videoFileName.value = store.video.name || '当前视频'

  store.setVideo({
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    element: video
  })
  console.log('✅ 视频加载完成:', {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight
  })
}

// 时间更新
const onTimeUpdate = event => {
  currentTime.value = event.target.currentTime
  store.updateVideoTime(event.target.currentTime)
}

// 播放
const onPlay = () => {
  isPlaying.value = true
  store.video.isPlaying = true
}

// 暂停
const onPause = () => {
  isPlaying.value = false
  store.video.isPlaying = false
}

// 切换质量控制
const toggleQualityControl = () => {
  store.ui.showQualityControl = !store.ui.showQualityControl
}

// 更新分辨率
const updateResolution = resolution => {
  store.preview.resolution = resolution
}

// 更新质量
const updateQuality = quality => {
  store.preview.quality = quality
}

// 更新优化选项
const updateOptimizations = optimizations => {
  store.preview.optimizations = optimizations
}

// 下载PPT
const handleDownloadPpt = () => {
  ElMessage.info('PPT下载功能开发中...')
  // TODO: 实现PPT下载逻辑
}

// 导出视频
const handleExportVideo = () => {
  ElMessage.info('视频导出功能开发中...')
  // TODO: 实现视频导出逻辑
}

// 显示生成预览（供外部调用）
const showPreview = (videoSrc, pptSlides = [], time = '', fileSize = 0) => {
  generatedVideoSrc.value = videoSrc
  generatedPptSlides.value = pptSlides
  generationTime.value = time
  generatedFileSize.value = fileSize
  showGeneratedPreview.value = true
}

// 暴露方法给父组件
defineExpose({
  showPreview
})

// 监听视频源变化，更新视频元素
watch(videoSrc, newSrc => {
  if (videoElement.value && newSrc) {
    videoElement.value.load()
  }
})
</script>

<style scoped>
.workspace-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a1a1a;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.video-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px; /* 减小 padding，参考剪映 */
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.video-section.vertical-video {
  padding: 16px 40px; /* 竖版视频稍微增加左右 padding */
}

.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* 确保视频完整显示 */
  border-radius: 4px; /* 减小圆角，参考剪映 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.preview-video.vertical {
  max-width: 45%; /* 竖版视频限制宽度，参考剪映 */
  max-height: 100%;
}

/* 画中画预览 */
.pip-overlay {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}

.pip-window {
  position: absolute;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  pointer-events: auto;
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 一键生成按钮（剪映风格） */
.auto-generate-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  border-radius: 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 15;
  user-select: none;
}

.auto-generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.5);
  background: linear-gradient(135deg, #ff7b7b 0%, #ff5767 100%);
}

.auto-generate-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}

.auto-generate-btn .btn-icon {
  font-size: 16px;
  animation: sparkle 2s ease-in-out infinite;
}

.auto-generate-btn .btn-text {
  letter-spacing: 0.5px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
}

/* 生成中遮罩 */
.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.generating-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(74, 158, 255, 0.2);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generating-text {
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.generating-tip {
  font-size: 14px;
  color: #8a8a8a;
}

/* 质量控制按钮 */
.quality-control-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 20;
}

.quality-control-toggle:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .video-section {
    padding: 10px;
  }

  .video-section.vertical-video {
    padding: 10px 20px;
  }

  .preview-video.vertical {
    max-width: 70%;
  }

  .quality-control-toggle {
    top: 10px;
    right: 10px;
  }

  .auto-generate-btn {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 13px;
  }

  .auto-generate-btn .btn-icon {
    font-size: 14px;
  }
}

/* 内嵌时间轴 */
.embedded-timeline {
  height: 150px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.timeline-header {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #252525;
  border-bottom: 1px solid #3a3a3a;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #3a3a3a;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.timeline-btn:hover {
  background: #4a4a4a;
}

.time-display {
  font-size: 13px;
  color: #d4d4d4;
  font-family: monospace;
}

.timeline-zoom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #3a3a3a;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.zoom-btn:hover {
  background: #4a4a4a;
}

.zoom-level {
  font-size: 12px;
  color: #d4d4d4;
  min-width: 45px;
  text-align: center;
}

.timeline-track {
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  background: #1e1e1e;
}

.timeline-ruler {
  height: 24px;
  background: #252525;
  border-bottom: 1px solid #3a3a3a;
  position: relative;
}

.time-mark {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 4px;
}

.time-mark::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 1px;
  height: 8px;
  background: #5a5a5a;
  transform: translateY(-50%);
}

.mark-label {
  font-size: 10px;
  color: #8a8a8a;
  font-family: monospace;
}

.timeline-content {
  padding: 8px 0;
}

.video-track {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 16px;
}

.track-label {
  width: 60px;
  font-size: 12px;
  color: #d4d4d4;
  font-weight: 500;
}

.track-items {
  flex: 1;
  height: 40px;
  position: relative;
}

.track-item {
  position: absolute;
  height: 100%;
  background: #4a9eff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.track-item:hover {
  background: #5aafff;
}

.video-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.video-item:hover {
  background: linear-gradient(135deg, #7c8ff0 0%, #8a5bb8 100%);
}

.item-name {
  font-size: 12px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  pointer-events: none;
  z-index: 10;
}

.playhead-line {
  width: 2px;
  height: 100%;
  background: #ff4444;
  box-shadow: 0 0 4px rgba(255, 68, 68, 0.5);
}

.playhead-handle {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #ff4444;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
