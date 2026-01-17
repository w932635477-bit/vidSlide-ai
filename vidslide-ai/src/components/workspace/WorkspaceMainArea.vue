<template>
  <div class="workspace-main-area">
    <!-- 视频预览区 -->
    <div class="video-section" :class="{ 'vertical-video': isVerticalVideo }">
      <div class="editor-canvas">
        <video
          v-if="videoSrc"
          ref="videoElement"
          :src="videoSrc"
          class="preview-video"
          :class="{ 'vertical': isVerticalVideo }"
          controls
          @loadedmetadata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
          @play="onPlay"
          @pause="onPause"
        ></video>

        <!-- 画中画预览 -->
        <div v-if="pipEnabled && videoSrc" class="pip-overlay">
          <div class="pip-window" :style="pipStyle">
            <video
              :src="videoSrc"
              class="pip-video"
              muted
            ></video>
          </div>
        </div>

        <!-- 质量控制按钮 -->
        <button
          v-if="videoSrc"
          class="quality-control-toggle"
          @click="toggleQualityControl"
          title="质量控制"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m-5.2-9.8l4.2 4.2m4.2 4.2l4.2 4.2m-16.8 0l4.2-4.2m4.2-4.2l4.2-4.2"/>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import PreviewQualityControl from '../PreviewQualityControl.vue'

const store = useWorkspaceStore()
const videoElement = ref(null)

// 计算属性
const videoSrc = computed(() => store.video.src)
const isVerticalVideo = computed(() => store.isVerticalVideo)
const pipEnabled = computed(() => store.pip.enabled)
const showQualityControl = computed(() => store.ui.showQualityControl)
const previewResolution = computed(() => store.preview.resolution)
const previewQuality = computed(() => store.preview.quality)
const previewOptimizations = computed(() => store.preview.optimizations)

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

// 视频加载完成
const onVideoLoaded = (event) => {
  const video = event.target
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
const onTimeUpdate = (event) => {
  store.updateVideoTime(event.target.currentTime)
}

// 播放
const onPlay = () => {
  store.video.isPlaying = true
}

// 暂停
const onPause = () => {
  store.video.isPlaying = false
}

// 切换质量控制
const toggleQualityControl = () => {
  store.ui.showQualityControl = !store.ui.showQualityControl
}

// 更新分辨率
const updateResolution = (resolution) => {
  store.preview.resolution = resolution
}

// 更新质量
const updateQuality = (quality) => {
  store.preview.quality = quality
}

// 更新优化选项
const updateOptimizations = (optimizations) => {
  store.preview.optimizations = optimizations
}

// 监听视频源变化，更新视频元素
watch(videoSrc, (newSrc) => {
  if (videoElement.value && newSrc) {
    videoElement.value.load()
  }
})
</script>

<style scoped>
.workspace-main-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #000000;
}

.video-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
}

.video-section.vertical-video {
  padding: 20px 60px;
}

.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.preview-video.vertical {
  max-width: 50%;
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
}
</style>
