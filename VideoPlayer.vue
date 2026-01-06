<template>
  <div class="video-player">
    <video
      ref="videoRef"
      class="video-element"
      :src="videoSrc"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onError"
      controls
      preload="metadata"
    ></video>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <div class="loading-text">视频加载中...</div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <el-icon size="48" color="#f56c6c">
          <Warning />
        </el-icon>
        <h3 class="error-title">视频加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <el-button @click="retryLoad" type="primary">
          重试
        </el-button>
      </div>
    </div>

    <!-- 播放控制覆盖层 -->
    <div v-if="!isPlaying && !isLoading && !error" class="play-overlay">
      <el-button
        type="primary"
        size="large"
        circle
        @click="play"
      >
        <el-icon size="24">
          <VideoPlay />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VideoPlay, Loading, Warning } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'loaded',
  'timeupdate',
  'play',
  'pause',
  'ended',
  'error'
])

// 响应式数据
const videoRef = ref(null)
const isLoading = ref(true)
const isPlaying = ref(false)
const error = ref('')
const currentTime = ref(0)
const duration = ref(0)

// 计算属性
const videoSrc = computed(() => props.src)

// 视频事件处理
const onLoadedMetadata = () => {
  try {
    if (videoRef.value) {
      duration.value = videoRef.value.duration
      isLoading.value = false

      emit('loaded', {
        duration: duration.value,
        width: videoRef.value.videoWidth,
        height: videoRef.value.videoHeight
      })

      if (props.autoplay) {
        play()
      }
    }
  } catch (err) {
    handleError('视频元数据加载失败')
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    emit('timeupdate', {
      currentTime: currentTime.value,
      duration: duration.value
    })
  }
}

const onPlay = () => {
  isPlaying.value = true
  emit('play')
}

const onPause = () => {
  isPlaying.value = false
  emit('pause')
}

const onEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const onError = () => {
  const videoElement = videoRef.value
  let errorMessage = '未知错误'

  if (videoElement && videoElement.error) {
    switch (videoElement.error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        errorMessage = '视频播放被中止'
        break
      case MediaError.MEDIA_ERR_NETWORK:
        errorMessage = '网络错误，无法加载视频'
        break
      case MediaError.MEDIA_ERR_DECODE:
        errorMessage = '视频解码失败'
        break
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = '不支持的视频格式'
        break
      default:
        errorMessage = '视频加载失败'
    }
  }

  handleError(errorMessage)
}

// 控制方法
const play = async () => {
  try {
    if (videoRef.value) {
      await videoRef.value.play()
    }
  } catch (err) {
    handleError('播放失败：' + err.message)
  }
}

const pause = () => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
}

const seek = (time) => {
  if (videoRef.value && typeof time === 'number') {
    videoRef.value.currentTime = Math.max(0, Math.min(time, duration.value))
  }
}

const setVolume = (volume) => {
  if (videoRef.value) {
    videoRef.value.volume = Math.max(0, Math.min(1, volume))
  }
}

const retryLoad = () => {
  error.value = ''
  isLoading.value = true
  if (videoRef.value) {
    videoRef.value.load()
  }
}

const handleError = (message) => {
  error.value = message
  isLoading.value = false
  emit('error', { message, code: videoRef.value?.error?.code })
}

// 监听源变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    error.value = ''
    isLoading.value = true
    isPlaying.value = false
  }
})

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  seek,
  setVolume,
  getVideoElement: () => videoRef.value,
  getCurrentTime: () => currentTime.value,
  getDuration: () => duration.value,
  isPlaying: () => isPlaying.value
})
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-overlay,
.error-overlay,
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.loading-overlay {
  flex-direction: column;
  color: white;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1rem;
}

.error-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}

.error-content {
  text-align: center;
  color: white;
  max-width: 300px;
  padding: 2rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
}

.error-message {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.play-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.play-overlay:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
