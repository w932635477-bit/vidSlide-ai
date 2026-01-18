<template>
  <div class="keyframe-extractor" role="region" aria-labelledby="keyframe-heading">
    <ExtractorHeader
      :is-extracting="isExtracting"
      :extraction-progress="extractionProgress"
      :detected-frames-count="detectedFramesCount"
      :keyframes-count="keyframes.length"
    />

    <section class="keyframes-section" role="main">
      <KeyframesStats
        :keyframes-count="keyframes.length"
        :total-coverage-time="totalCoverageTime"
        :average-interval="averageInterval"
      />

      <KeyframesGrid
        :keyframes="sortedKeyframes"
        :selected-keyframes="selectedKeyframes"
        @select-keyframe="selectKeyframe"
        @preview-keyframe="previewKeyframe"
        @create-card="createTextCard"
        @remove-keyframe="removeKeyframe"
      />
    </section>

    <ExtractionControls
      :has-keyframes="keyframes.length > 0"
      :is-extracting="isExtracting"
      @start-extraction="startExtraction"
      @stop-extraction="stopExtraction"
      @export-keyframes="exportKeyframes"
      @clear-all="clearAll"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ExtractorHeader from './keyframe-extractor/ExtractorHeader.vue'
import KeyframesStats from './keyframe-extractor/KeyframesStats.vue'
import KeyframesGrid from './keyframe-extractor/KeyframesGrid.vue'
import ExtractionControls from './keyframe-extractor/ExtractionControls.vue'

/**
 * 关键帧提取器组件（重构版）
 * 功能：视频关键帧检测、提取、预览、导出
 */

const props = defineProps({
  videoSource: { type: String, default: '' },
  extractionMethod: { type: String, default: 'auto' }
})

const emit = defineEmits([
  'keyframes-extracted',
  'keyframe-selected',
  'card-created',
  'extraction-completed'
])

// 状态
const keyframes = ref([])
const selectedKeyframes = ref([])
const isExtracting = ref(false)
const extractionProgress = ref(0)
const detectedFramesCount = ref(0)

// 计算属性
const sortedKeyframes = computed(() => {
  return [...keyframes.value].sort((a, b) => a.timestamp - b.timestamp)
})

const totalCoverageTime = computed(() => {
  if (keyframes.value.length === 0) return '0:00'
  const maxTime = Math.max(...keyframes.value.map(kf => kf.timestamp))
  const mins = Math.floor(maxTime / 60)
  const secs = Math.floor(maxTime % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const averageInterval = computed(() => {
  if (keyframes.value.length < 2) return '0.0s'
  const sorted = sortedKeyframes.value
  let totalInterval = 0
  for (let i = 1; i < sorted.length; i++) {
    totalInterval += sorted[i].timestamp - sorted[i - 1].timestamp
  }
  const avg = totalInterval / (sorted.length - 1)
  return `${avg.toFixed(1)}s`
})

// 方法
const startExtraction = async () => {
  isExtracting.value = true
  extractionProgress.value = 0
  detectedFramesCount.value = 0

  // 模拟提取过程
  const mockKeyframes = []
  const totalFrames = 30

  for (let i = 0; i < totalFrames; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))

    detectedFramesCount.value = i + 1
    extractionProgress.value = ((i + 1) / totalFrames) * 100

    if (Math.random() > 0.7) {
      mockKeyframes.push({
        id: `kf_${Date.now()}_${i}`,
        timestamp: i * 2,
        thumbnailUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect fill="%23${Math.floor(Math.random() * 16777215).toString(16)}" width="320" height="180"/></svg>`,
        importance: Math.random(),
        detectionMethod: ['scene-change', 'motion', 'face', 'text'][Math.floor(Math.random() * 4)],
        isProcessing: false
      })
    }
  }

  keyframes.value = mockKeyframes
  isExtracting.value = false

  emit('keyframes-extracted', mockKeyframes)
  emit('extraction-completed', {
    total: mockKeyframes.length,
    duration: totalFrames * 2
  })
}

const stopExtraction = () => {
  isExtracting.value = false
}

const selectKeyframe = keyframe => {
  const index = selectedKeyframes.value.findIndex(kf => kf.id === keyframe.id)
  if (index > -1) {
    selectedKeyframes.value.splice(index, 1)
  } else {
    selectedKeyframes.value.push(keyframe)
  }
  emit('keyframe-selected', selectedKeyframes.value)
}

const previewKeyframe = keyframe => {
  console.log('Preview keyframe:', keyframe)
}

const createTextCard = keyframe => {
  emit('card-created', keyframe)
}

const removeKeyframe = keyframe => {
  const index = keyframes.value.findIndex(kf => kf.id === keyframe.id)
  if (index > -1) {
    keyframes.value.splice(index, 1)
  }
  selectedKeyframes.value = selectedKeyframes.value.filter(kf => kf.id !== keyframe.id)
}

const exportKeyframes = () => {
  const data = {
    keyframes: keyframes.value,
    exportTime: new Date().toISOString(),
    totalCount: keyframes.value.length
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `keyframes-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearAll = () => {
  keyframes.value = []
  selectedKeyframes.value = []
  detectedFramesCount.value = 0
  extractionProgress.value = 0
}

defineExpose({
  startExtraction,
  stopExtraction,
  getKeyframes: () => keyframes.value,
  getSelectedKeyframes: () => selectedKeyframes.value
})
</script>

<style scoped>
.keyframe-extractor {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 1400px;
  margin: 0 auto;
}

.keyframes-section {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .keyframe-extractor {
    padding: 16px;
  }
}
</style>
