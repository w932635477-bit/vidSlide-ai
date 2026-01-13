<template>
  <div
    class="keyframe-extractor"
    role="region"
    aria-labelledby="keyframe-heading"
  >
    <!-- 关键帧提取标题区域 -->
    <header
      class="extractor-header"
      role="banner"
    >
      <h2 id="keyframe-heading">🎬 关键帧提取</h2>
      <p class="extractor-description">
        智能检测视频中的重要帧，提取关键视觉内容用于PPT制作
      </p>

      <!-- 提取状态显示 -->
      <div
        v-if="isExtracting"
        class="extraction-status"
        role="status"
        aria-live="polite"
      >
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>正在分析关键帧...</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: extractionProgress + '%' }"
          ></div>
        </div>
        <div class="extraction-stats">
          <span>已检测: {{ detectedFramesCount }} 帧</span>
          <span>关键帧: {{ keyframes.length }} 个</span>
        </div>
      </div>
    </header>

    <!-- 关键帧展示区域 -->
    <section
      class="keyframes-section"
      role="main"
      aria-labelledby="keyframes-list-heading"
    >
      <h3 id="keyframes-list-heading" class="sr-only">关键帧列表</h3>

      <!-- 关键帧统计信息 -->
      <div class="keyframes-stats">
        <div class="stat-item">
          <span class="stat-label">关键帧总数:</span>
          <span class="stat-value">{{ keyframes.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">覆盖时长:</span>
          <span class="stat-value">{{ totalCoverageTime }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均间隔:</span>
          <span class="stat-value">{{ averageInterval }}</span>
        </div>
      </div>

      <!-- 关键帧网格布局 -->
      <div class="keyframes-grid">
        <div
          v-for="keyframe in sortedKeyframes"
          :key="keyframe.id"
          class="keyframe-item"
          :class="{
            'selected': selectedKeyframes.includes(keyframe),
            'processing': keyframe.isProcessing
          }"
          @click="selectKeyframe(keyframe)"
          @keydown.enter="selectKeyframe(keyframe)"
          @keydown.space="selectKeyframe(keyframe)"
          role="button"
          tabindex="0"
          :aria-label="`选择关键帧 ${keyframe.id}，时间 ${formatTime(keyframe.timestamp)}，重要性 ${(keyframe.importance * 100).toFixed(1)}%`"
        >
          <!-- 关键帧缩略图 -->
          <div class="thumbnail-container">
            <img
              v-if="keyframe.thumbnailUrl"
              :src="keyframe.thumbnailUrl"
              :alt="`关键帧 ${keyframe.id} 在 ${formatTime(keyframe.timestamp)}`"
              class="keyframe-thumbnail"
              @error="handleThumbnailError(keyframe)"
              loading="lazy"
            />
            <div
              v-else
              class="thumbnail-placeholder"
              aria-hidden="true"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>

            <!-- 处理中指示器 -->
            <div
              v-if="keyframe.isProcessing"
              class="processing-overlay"
              aria-hidden="true"
            >
              <div class="processing-spinner"></div>
            </div>
          </div>

          <!-- 关键帧信息 -->
          <div class="keyframe-info">
            <div class="timestamp">{{ formatTime(keyframe.timestamp) }}</div>
            <div class="detection-method">
              <span class="method-badge" :class="getMethodClass(keyframe.detectionMethod)">
                {{ getMethodLabel(keyframe.detectionMethod) }}
              </span>
            </div>
            <div class="importance-bar">
              <div
                class="importance-fill"
                :style="{ width: (keyframe.importance * 100) + '%' }"
              ></div>
            </div>
            <div class="importance-value">
              {{ (keyframe.importance * 100).toFixed(1) }}%
            </div>
          </div>

          <!-- 关键帧操作按钮 -->
          <div class="keyframe-actions">
            <button
              class="action-btn preview-btn"
              @click.stop="previewKeyframe(keyframe)"
              :aria-label="`预览关键帧 ${keyframe.id}`"
              title="预览关键帧"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            <button
              class="action-btn create-card-btn"
              @click.stop="createTextCard(keyframe)"
              :aria-label="`从关键帧 ${keyframe.id} 创建文字卡片`"
              title="创建文字卡片"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </button>

            <button
              class="action-btn delete-btn"
              @click.stop="removeKeyframe(keyframe)"
              :aria-label="`删除关键帧 ${keyframe.id}`"
              title="删除关键帧"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>

          <!-- 选中状态指示器 -->
          <div
            v-if="selectedKeyframes.includes(keyframe)"
            class="selection-indicator"
            aria-hidden="true"
          >
            ✓
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="keyframes.length === 0 && !isExtracting"
        class="empty-state"
        role="status"
      >
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <h3>暂无关键帧</h3>
        <p>请先上传视频开始关键帧检测</p>
      </div>
    </section>

    <!-- 关键帧操作面板 -->
    <section
      v-if="selectedKeyframes.length > 0"
      class="keyframe-actions-panel"
      role="complementary"
      aria-labelledby="actions-panel-heading"
    >
      <h3 id="actions-panel-heading" class="sr-only">关键帧操作</h3>

      <div class="selected-keyframes-summary">
        <span class="summary-label">已选择 {{ selectedKeyframes.length }} 个关键帧:</span>
        <div class="selected-keyframes-list">
          <span
            v-for="keyframe in selectedKeyframes"
            :key="keyframe.id"
            class="selected-keyframe-tag"
          >
            帧{{ keyframe.id }} ({{ formatTime(keyframe.timestamp) }})
            <button
              @click="deselectKeyframe(keyframe)"
              :aria-label="`取消选择关键帧 ${keyframe.id}`"
              class="tag-remove-btn"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="bulk-actions">
        <button
          class="bulk-action-btn primary"
          @click="createMultipleTextCards"
          :disabled="selectedKeyframes.length === 0"
        >
          📝 批量创建文字卡片
        </button>

        <button
          class="bulk-action-btn secondary"
          @click="exportKeyframes"
          :disabled="selectedKeyframes.length === 0"
        >
          📤 导出关键帧
        </button>

        <button
          class="bulk-action-btn danger"
          @click="clearSelection"
        >
          🗑️ 清空选择
        </button>
      </div>
    </section>

    <!-- 关键帧预览模态框 -->
    <div
      v-if="previewKeyframeData"
      class="keyframe-preview-modal"
      role="dialog"
      aria-labelledby="preview-modal-title"
      aria-modal="true"
      @click="closePreview"
    >
      <div
        class="preview-content"
        @click.stop
      >
        <header class="preview-header">
          <h3 id="preview-modal-title">关键帧预览</h3>
          <button
            @click="closePreview"
            class="close-btn"
            aria-label="关闭预览"
          >
            ✕
          </button>
        </header>

        <div class="preview-body">
          <img
            v-if="previewKeyframeData.thumbnailUrl"
            :src="previewKeyframeData.thumbnailUrl"
            :alt="`关键帧 ${previewKeyframeData.id} 预览`"
            class="preview-image"
          />
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">时间戳:</span>
              <span class="info-value">{{ formatTime(previewKeyframeData.timestamp) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">重要性:</span>
              <span class="info-value">{{ (previewKeyframeData.importance * 100).toFixed(1) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">帧编号:</span>
              <span class="info-value">{{ previewKeyframeData.id }}</span>
            </div>
          </div>
        </div>

        <footer class="preview-footer">
          <button
            @click="createTextCard(previewKeyframeData)"
            class="preview-action-btn primary"
          >
            📝 创建文字卡片
          </button>
          <button
            @click="closePreview"
            class="preview-action-btn secondary"
          >
            关闭
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { SceneDetection, FaceRecognitionValidator } from '../utils/sceneDetection.js'

// Props
const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  videoDuration: {
    type: Number,
    default: 0
  },
  autoExtract: {
    type: Boolean,
    default: false
  },
  detectionInterval: {
    type: Number,
    default: 30 // 每30秒检测一次关键帧
  }
})

// Emits
const emit = defineEmits([
  'keyframe-selected',
  'keyframe-removed',
  'text-card-created',
  'extraction-started',
  'extraction-completed'
])

// Reactive data
const keyframes = ref([])
const selectedKeyframes = ref([])
const isExtracting = ref(false)
const extractionProgress = ref(0)
const detectedFramesCount = ref(0)
const previewKeyframeData = ref(null)

// 场景检测器
const sceneDetector = ref(null)
const faceValidator = ref(null)

// 检测选项
const detectionOptions = ref({
  useSceneDetection: true,
  useMotionDetection: true,
  useFaceDetection: true,
  frameRate: 1, // 每秒检测帧数
  minImportance: 0.3 // 最小重要性阈值
})

// Computed properties
const sortedKeyframes = computed(() => {
  return [...keyframes.value].sort((a, b) => a.timestamp - b.timestamp)
})

const totalCoverageTime = computed(() => {
  if (keyframes.value.length === 0) return '0秒'
  const timestamps = keyframes.value.map(k => k.timestamp).sort((a, b) => a - b)
  const totalSeconds = timestamps[timestamps.length - 1] - timestamps[0]
  return formatTime(totalSeconds)
})

const averageInterval = computed(() => {
  if (keyframes.value.length <= 1) return 'N/A'
  const timestamps = keyframes.value.map(k => k.timestamp).sort((a, b) => a - b)
  const intervals = []
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1])
  }
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  return formatTime(avgInterval)
})

// Methods
const startKeyframeExtraction = async () => {
  if (!props.videoSrc || props.videoDuration <= 0) {
    console.warn('没有可分析的视频内容')
    return
  }

  isExtracting.value = true
  extractionProgress.value = 0
  detectedFramesCount.value = 0
  emit('extraction-started')

  try {
    // 初始化场景检测器
    if (!sceneDetector.value) {
      sceneDetector.value = new SceneDetection({
        diffThreshold: 0.15,
        motionThreshold: 0.05,
        cutThreshold: 0.3
      })
      sceneDetector.value.initialize(640, 360)
    }

    // 验证人脸识别功能
    if (!faceValidator.value) {
      faceValidator.value = new FaceRecognitionValidator()
    }

    const faceValidation = await faceValidator.value.validateFaceRecognition()
    console.log('人脸识别功能验证结果:', faceValidation)

    // 创建视频元素用于帧提取
    const videoElement = document.createElement('video')
    videoElement.src = props.videoSrc
    videoElement.preload = 'metadata'

    await new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = resolve
      videoElement.onerror = reject
      videoElement.load()
    })

    // 使用场景检测算法分析视频
    const sceneChanges = await sceneDetector.value.analyzeVideoFrames(videoElement, {
      startTime: 0,
      endTime: props.videoDuration,
      frameRate: detectionOptions.value.frameRate,
      onProgress: (progress, processed, total) => {
        extractionProgress.value = progress
        detectedFramesCount.value = processed
      },
      onSceneDetected: (sceneChange) => {
        console.log('检测到场景切换:', sceneChange)
      }
    })

    // 基于场景检测结果生成关键帧
    const extractedKeyframes = []

    // 添加视频开始帧
    extractedKeyframes.push({
      id: 1,
      timestamp: 0,
      importance: 0.9,
      thumbnailUrl: generateThumbnailUrl(0),
      isProcessing: false,
      detectionMethod: 'video-start',
      confidence: 1.0
    })

    // 处理场景切换检测结果
    sceneChanges.forEach((sceneChange, index) => {
      if (sceneChange.isSceneChange &&
          sceneChange.confidence > detectionOptions.value.minImportance) {

        const keyframe = {
          id: extractedKeyframes.length + 1,
          timestamp: sceneChange.timestamp,
          importance: sceneChange.confidence,
          thumbnailUrl: generateThumbnailUrl(sceneChange.timestamp),
          isProcessing: false,
          detectionMethod: sceneChange.changeType,
          confidence: sceneChange.confidence,
          metrics: sceneChange.metrics
        }

        extractedKeyframes.push(keyframe)
      }
    })

    // 添加视频结束帧
    if (props.videoDuration > 0) {
      extractedKeyframes.push({
        id: extractedKeyframes.length + 1,
        timestamp: props.videoDuration,
        importance: 0.8,
        thumbnailUrl: generateThumbnailUrl(props.videoDuration),
        isProcessing: false,
        detectionMethod: 'video-end',
        confidence: 1.0
      })
    }

    // 如果没有检测到足够的场景切换，使用时间间隔备选方案
    if (extractedKeyframes.length < 3) {
      console.log('场景检测结果不足，使用时间间隔备选方案')
      const interval = Math.max(30, props.videoDuration / 10) // 最少10个关键帧

      for (let time = 0; time < props.videoDuration; time += interval) {
        const exists = extractedKeyframes.some(kf =>
          Math.abs(kf.timestamp - time) < interval / 2
        )

        if (!exists) {
          extractedKeyframes.push({
            id: extractedKeyframes.length + 1,
            timestamp: time,
            importance: 0.6,
            thumbnailUrl: generateThumbnailUrl(time),
            isProcessing: false,
            detectionMethod: 'time-interval',
            confidence: 0.5
          })
        }
      }
    }

    // 按时间排序并重新编号
    extractedKeyframes.sort((a, b) => a.timestamp - b.timestamp)
    extractedKeyframes.forEach((kf, index) => {
      kf.id = index + 1
    })

    keyframes.value = extractedKeyframes
    extractionProgress.value = 100

    console.log(`关键帧提取完成，共检测到 ${extractedKeyframes.length} 个关键帧`)
    console.log('检测方法统计:', extractedKeyframes.reduce((acc, kf) => {
      acc[kf.detectionMethod] = (acc[kf.detectionMethod] || 0) + 1
      return acc
    }, {}))

    emit('extraction-completed', extractedKeyframes)

  } catch (error) {
    console.error('关键帧提取失败:', error)
    // 降级到基础时间间隔方法
    console.log('使用降级方案：时间间隔检测')
    await fallbackTimeIntervalExtraction()
  } finally {
    isExtracting.value = false
    extractionProgress.value = 0
    detectedFramesCount.value = keyframes.value.length
  }
}

// 降级方案：时间间隔检测
const fallbackTimeIntervalExtraction = async () => {
  try {
    const interval = Math.max(30, props.videoDuration / 8) // 8个关键帧
    const fallbackKeyframes = []

    for (let time = 0; time <= props.videoDuration; time += interval) {
      if (time > props.videoDuration) time = props.videoDuration

      fallbackKeyframes.push({
        id: fallbackKeyframes.length + 1,
        timestamp: time,
        importance: 0.5,
        thumbnailUrl: generateThumbnailUrl(time),
        isProcessing: false,
        detectionMethod: 'fallback-interval',
        confidence: 0.3
      })

      extractionProgress.value = (time / props.videoDuration) * 100
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    keyframes.value = fallbackKeyframes
    console.log(`降级方案完成，生成 ${fallbackKeyframes.length} 个关键帧`)

  } catch (error) {
    console.error('降级方案也失败:', error)
    keyframes.value = []
  }
}

const generateThumbnailUrl = (timestamp) => {
  // 在实际项目中，这里会生成真实的缩略图URL
  // 现在返回一个占位符URL
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="90" fill="#1a1a1a"/>
      <rect x="10" y="10" width="140" height="70" fill="#333" stroke="#666" stroke-width="1"/>
      <text x="80" y="45" text-anchor="middle" fill="#999" font-size="12">${formatTime(timestamp)}</text>
    </svg>
  `)}`
}

const selectKeyframe = (keyframe) => {
  const index = selectedKeyframes.value.findIndex(k => k.id === keyframe.id)
  if (index === -1) {
    selectedKeyframes.value.push(keyframe)
  } else {
    selectedKeyframes.value.splice(index, 1)
  }
  emit('keyframe-selected', selectedKeyframes.value)
}

const deselectKeyframe = (keyframe) => {
  const index = selectedKeyframes.value.findIndex(k => k.id === keyframe.id)
  if (index !== -1) {
    selectedKeyframes.value.splice(index, 1)
    emit('keyframe-selected', selectedKeyframes.value)
  }
}

const previewKeyframe = (keyframe) => {
  previewKeyframeData.value = keyframe
}

const closePreview = () => {
  previewKeyframeData.value = null
}

const createTextCard = (keyframe) => {
  emit('text-card-created', {
    type: 'text-card',
    source: 'keyframe',
    keyframeId: keyframe.id,
    timestamp: keyframe.timestamp,
    thumbnailUrl: keyframe.thumbnailUrl,
    content: `关键帧 ${keyframe.id} (${formatTime(keyframe.timestamp)})`
  })
}

const createMultipleTextCards = () => {
  selectedKeyframes.value.forEach(keyframe => {
    createTextCard(keyframe)
  })
  clearSelection()
}

const removeKeyframe = (keyframe) => {
  const index = keyframes.value.findIndex(k => k.id === keyframe.id)
  if (index !== -1) {
    keyframes.value.splice(index, 1)

    // 如果被删除的关键帧在选中列表中，也要移除
    const selectedIndex = selectedKeyframes.value.findIndex(k => k.id === keyframe.id)
    if (selectedIndex !== -1) {
      selectedKeyframes.value.splice(selectedIndex, 1)
      emit('keyframe-selected', selectedKeyframes.value)
    }

    emit('keyframe-removed', keyframe)
  }
}

const exportKeyframes = () => {
  const dataStr = JSON.stringify(selectedKeyframes.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = `keyframes-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const clearSelection = () => {
  selectedKeyframes.value = []
  emit('keyframe-selected', [])
}

const handleThumbnailError = (keyframe) => {
  console.warn(`关键帧 ${keyframe.id} 缩略图加载失败`)
  keyframe.thumbnailUrl = null
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取检测方法显示标签
const getMethodLabel = (method) => {
  const labels = {
    'video-start': '视频开始',
    'video-end': '视频结束',
    'hard-cut': '硬剪辑',
    'content-change': '内容切换',
    'motion-change': '运动切换',
    'fade-in': '淡入',
    'fade-out': '淡出',
    'time-interval': '时间间隔',
    'fallback-interval': '降级检测'
  }
  return labels[method] || method
}

// 获取检测方法样式类
const getMethodClass = (method) => {
  const classes = {
    'video-start': 'method-start',
    'video-end': 'method-end',
    'hard-cut': 'method-cut',
    'content-change': 'method-content',
    'motion-change': 'method-motion',
    'fade-in': 'method-fade',
    'fade-out': 'method-fade',
    'time-interval': 'method-interval',
    'fallback-interval': 'method-fallback'
  }
  return classes[method] || 'method-unknown'
}

// Watchers
watch(() => props.videoSrc, (newSrc) => {
  if (newSrc && props.autoExtract) {
    startKeyframeExtraction()
  }
})

watch(() => props.videoDuration, (newDuration) => {
  if (newDuration > 0 && props.videoSrc && props.autoExtract) {
    startKeyframeExtraction()
  }
})

// Lifecycle
onMounted(async () => {
  // 初始化场景检测器
  try {
    sceneDetector.value = new SceneDetection({
      diffThreshold: 0.15,
      motionThreshold: 0.05,
      cutThreshold: 0.3
    })
    sceneDetector.value.initialize(640, 360)

    // 验证人脸识别功能
    faceValidator.value = new FaceRecognitionValidator()
    const validationResult = await faceValidator.value.validateFaceRecognition()
    console.log('人脸识别功能验证结果:', validationResult)

    if (!validationResult.isAvailable) {
      console.warn('人脸识别功能不可用，将使用场景检测降级模式')
    }
  } catch (error) {
    console.error('场景检测器初始化失败:', error)
  }

  // 自动开始提取
  if (props.autoExtract && props.videoSrc && props.videoDuration > 0) {
    startKeyframeExtraction()
  }
})

// 清理资源
const cleanup = () => {
  if (sceneDetector.value) {
    sceneDetector.value.dispose()
    sceneDetector.value = null
  }
  faceValidator.value = null
}

// Expose methods for parent component
defineExpose({
  startKeyframeExtraction,
  clearKeyframes: () => { keyframes.value = [] },
  getSelectedKeyframes: () => selectedKeyframes.value,
  getAllKeyframes: () => keyframes.value,
  selectKeyframe,
  createTextCard
})
</script>

<style scoped>
/* ===========================================
   关键帧提取器 - 苹果设计风格
   =========================================== */

.keyframe-extractor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 头部区域 */
.extractor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.extractor-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.extractor-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 提取状态 */
.extraction-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 122, 255, 0.9);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.extraction-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(0, 122, 255, 0.7);
}

/* 关键帧统计 */
.keyframes-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* 关键帧网格 */
.keyframes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

/* 关键帧项 */
.keyframe-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.keyframe-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.keyframe-item:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.keyframe-item.selected {
  border-color: rgba(0, 122, 255, 0.5);
  background: rgba(0, 122, 255, 0.05);
}

/* 缩略图容器 */
.thumbnail-container {
  position: relative;
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

.keyframe-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 关键帧信息 */
.keyframe-info {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timestamp {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.importance-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.importance-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(52, 199, 89, 0.6) 0%, rgba(52, 199, 89, 0.8) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.importance-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-weight: 500;
}

.detection-method {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.method-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method-start {
  background: rgba(52, 199, 89, 0.8);
  color: white;
}

.method-end {
  background: rgba(142, 142, 147, 0.8);
  color: white;
}

.method-cut {
  background: rgba(255, 59, 48, 0.8);
  color: white;
}

.method-content {
  background: rgba(88, 86, 214, 0.8);
  color: white;
}

.method-motion {
  background: rgba(255, 149, 0, 0.8);
  color: white;
}

.method-fade {
  background: rgba(175, 82, 222, 0.8);
  color: white;
}

.method-interval {
  background: rgba(142, 142, 147, 0.6);
  color: rgba(255, 255, 255, 0.9);
}

.method-fallback {
  background: rgba(255, 59, 48, 0.6);
  color: rgba(255, 255, 255, 0.9);
}

.method-unknown {
  background: rgba(142, 142, 147, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

/* 关键帧操作按钮 */
.keyframe-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.keyframe-item:hover .keyframe-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: rgba(255, 255, 255, 0.6);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.action-btn:active {
  transform: scale(0.95);
}

.preview-btn:hover {
  color: rgba(0, 122, 255, 0.9);
}

.create-card-btn:hover {
  color: rgba(52, 199, 89, 0.9);
}

.delete-btn:hover {
  color: rgba(255, 59, 48, 0.9);
}

/* 选中状态指示器 */
.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  z-index: 10;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* 关键帧操作面板 */
.keyframe-actions-panel {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.selected-keyframes-summary {
  margin-bottom: 16px;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  display: block;
}

.selected-keyframes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-keyframe-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(0, 122, 255, 0.9);
}

.tag-remove-btn {
  background: none;
  border: none;
  color: rgba(0, 122, 255, 0.7);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin-left: 2px;
}

.tag-remove-btn:hover {
  color: rgba(0, 122, 255, 0.9);
}

/* 批量操作按钮 */
.bulk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bulk-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.bulk-action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.bulk-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bulk-action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.bulk-action-btn.primary:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.bulk-action-btn.danger {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
  color: rgba(255, 59, 48, 0.9);
}

.bulk-action-btn.danger:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.4);
}

/* 预览模态框 */
.keyframe-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: scale(0.9) translateY(-20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.8);
}

.preview-body {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.preview-image {
  max-width: 400px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.info-value {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-action-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.3);
}

.preview-action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.preview-action-btn.primary:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

/* 无障碍支持 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .keyframe-extractor {
    padding: 16px;
    gap: 16px;
  }

  .keyframes-stats {
    flex-direction: column;
    gap: 12px;
  }

  .keyframes-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .keyframe-item {
    max-width: 180px;
  }

  .thumbnail-container {
    height: 100px;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .bulk-action-btn {
    width: 100%;
    justify-content: center;
  }

  .preview-body {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 200px;
  }
}
</style>