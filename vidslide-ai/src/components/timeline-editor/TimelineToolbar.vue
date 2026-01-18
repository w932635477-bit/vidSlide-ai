<template>
  <div class="timeline-toolbar" role="toolbar" aria-label="时间轴工具栏">
    <!-- 播放控制 -->
    <div class="toolbar-section playback-controls">
      <el-button-group>
        <el-button
          :icon="isPlaying ? 'VideoPause' : 'VideoPlay'"
          :aria-label="isPlaying ? '暂停' : '播放'"
          @click="$emit('toggle-play')"
        >
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button icon="RefreshLeft" aria-label="重置" @click="$emit('reset')"> 重置 </el-button>
      </el-button-group>
    </div>

    <!-- 时间显示和输入 -->
    <div class="toolbar-section time-display">
      <label for="current-time-input">当前时间:</label>
      <el-input-number
        id="current-time-input"
        :model-value="currentTime"
        :min="0"
        :max="duration"
        :step="0.1"
        :precision="2"
        size="small"
        style="width: 120px"
        @update:model-value="$emit('update:currentTime', $event)"
      />
      <span class="time-separator">/</span>
      <span class="duration-display">{{ formatTime(duration) }}s</span>
    </div>

    <!-- 缩放控制 -->
    <div class="toolbar-section zoom-controls">
      <label for="zoom-slider">缩放:</label>
      <el-slider
        id="zoom-slider"
        :model-value="zoom"
        :min="0.5"
        :max="3"
        :step="0.1"
        style="width: 150px"
        @update:model-value="$emit('update:zoom', $event)"
      />
      <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
    </div>

    <!-- 轨道控制 -->
    <div class="toolbar-section track-controls">
      <el-button type="primary" icon="Plus" size="small" @click="$emit('add-track')">
        添加轨道
      </el-button>
      <el-button
        :disabled="!canDeleteTrack"
        type="danger"
        icon="Delete"
        size="small"
        @click="$emit('delete-track')"
      >
        删除轨道
      </el-button>
    </div>

    <!-- 吸附控制 -->
    <div class="toolbar-section snap-controls">
      <el-checkbox
        :model-value="snapEnabled"
        @update:model-value="$emit('update:snapEnabled', $event)"
      >
        吸附对齐
      </el-checkbox>
      <el-input-number
        v-if="snapEnabled"
        :model-value="snapInterval"
        :min="0.1"
        :max="1"
        :step="0.1"
        :precision="1"
        size="small"
        style="width: 100px"
        @update:model-value="$emit('update:snapInterval', $event)"
      >
        <template #suffix>s</template>
      </el-input-number>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 10
  },
  zoom: {
    type: Number,
    default: 1
  },
  snapEnabled: {
    type: Boolean,
    default: true
  },
  snapInterval: {
    type: Number,
    default: 0.5
  },
  canDeleteTrack: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'toggle-play',
  'reset',
  'update:currentTime',
  'update:zoom',
  'add-track',
  'delete-track',
  'update:snapEnabled',
  'update:snapInterval'
])

const formatTime = time => {
  return time.toFixed(2)
}
</script>

<style scoped>
.timeline-toolbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-section label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-separator {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.duration-display {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 60px;
}

.zoom-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 45px;
}

.snap-controls {
  margin-left: auto;
}
</style>
