<template>
  <div class="analysis-tab">
    <!-- AI分析结果展示 -->
    <div class="analysis-results">
      <div v-if="keywords.length > 0" class="result-section">
        <h4>🔑 关键词</h4>
        <div class="keywords-list">
          <span v-for="keyword in keywords" :key="keyword" class="keyword-tag">
            {{ keyword }}
          </span>
        </div>
      </div>

      <div v-if="scenes.length > 0" class="result-section">
        <h4>🎬 场景分析</h4>
        <div class="scenes-list">
          <div v-for="(scene, index) in scenes" :key="index" class="scene-item">
            <span class="scene-time"
              >{{ formatTime(scene.start) }} - {{ formatTime(scene.end) }}</span
            >
            <span class="scene-desc">{{ scene.description }}</span>
          </div>
        </div>
      </div>

      <div v-if="transcript" class="result-section">
        <h4>📝 转录文本</h4>
        <div class="transcript-text">{{ transcript }}</div>
      </div>

      <div v-if="!hasAnalysisData" class="empty-state">
        <div class="empty-icon">🤖</div>
        <p>上传视频后将自动进行AI分析</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const store = useWorkspaceStore()

// 计算属性
const keywords = computed(() => store.analysis.keywords || [])
const keyframes = computed(() => store.analysis.keyframes || [])
const transcript = computed(() => store.analysis.transcript || '')
const scenes = computed(() => store.analysis.scenes || [])

const hasAnalysisData = computed(() => {
  return keywords.value.length > 0 || scenes.value.length > 0 || transcript.value
})

// 格式化时间
const formatTime = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.analysis-tab {
  height: 100%;
  overflow: auto;
  background: #ffffff;
  padding: 16px;
}

.analysis-results {
  max-width: 800px;
}

.result-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e5e7;
}

.result-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 6px 12px;
  background: #007aff;
  color: white;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.scenes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scene-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  font-size: 13px;
}

.scene-time {
  color: #007aff;
  font-weight: 600;
  min-width: 80px;
}

.scene-desc {
  color: #1d1d1f;
  flex: 1;
}

.transcript-text {
  padding: 12px;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #1d1d1f;
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
