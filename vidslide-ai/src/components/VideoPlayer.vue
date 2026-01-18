<template>
  <div class="video-player">
    <video
      ref="videoElement"
      :src="videoSrc"
      :controls="showControls"
      :autoplay="autoplay"
      :muted="muted"
      class="video-element"
      @loadeddata="onLoadedData"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
    >
      <track v-if="subtitleSrc" :src="subtitleSrc" kind="subtitles" srclang="zh-CN" label="中文" />
    </video>
    <div v-if="showCustomControls" class="custom-controls">
      <button :aria-label="isPlaying ? '暂停' : '播放'" @click="playPause">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <input
        v-model="currentTime"
        type="range"
        :max="duration"
        class="progress-bar"
        aria-label="视频进度"
        @input="seekToTime"
      />
      <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      <button :aria-label="isMuted ? '取消静音' : '静音'" @click="toggleMute">
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    videoSrc: {
      type: String,
      required: true
    },
    subtitleSrc: {
      type: String,
      default: null
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showCustomControls: {
      type: Boolean,
      default: false
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: false
    }
  },
  watch: {
    videoSrc() {
      // 视频源变化时重置状态
      this.isPlaying = false
      this.currentTime = 0
      this.duration = 0
    }
  },
  methods: {
    playPause() {
      const video = this.$refs.videoElement
      if (this.isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    },
    seekToTime() {
      const video = this.$refs.videoElement
      video.currentTime = this.currentTime
    },
    toggleMute() {
      const video = this.$refs.videoElement
      video.muted = !video.muted
      this.isMuted = video.muted
    },
    onLoadedData() {
      this.duration = this.$refs.videoElement.duration
      this.$emit('loaded', { duration: this.duration })
    },
    onTimeUpdate() {
      this.currentTime = this.$refs.videoElement.currentTime
      this.$emit('timeupdate', { currentTime: this.currentTime })
    },
    onEnded() {
      this.isPlaying = false
      this.$emit('ended')
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-controls button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.custom-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  color: white;
  font-size: 14px;
  font-family:
    'SF Pro Text',
    -apple-system,
    sans-serif;
  min-width: 80px;
  text-align: center;
}

@media (max-width: 768px) {
  .custom-controls {
    padding: 8px;
    gap: 8px;
  }

  .custom-controls button {
    font-size: 16px;
  }

  .time-display {
    font-size: 12px;
    min-width: 60px;
  }
}
</style>
