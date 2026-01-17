<template>
  <div class="analysis-tab">
    <AIContentAnalyzer
      :keywords="keywords"
      :keyframes="keyframes"
      :transcript="transcript"
      :scenes="scenes"
      @analysis-complete="handleAnalysisComplete"
      @keywords-updated="handleKeywordsUpdated"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import AIContentAnalyzer from '@/components/AIContentAnalyzer.vue'

const store = useWorkspaceStore()

// 计算属性
const keywords = computed(() => store.analysis.keywords)
const keyframes = computed(() => store.analysis.keyframes)
const transcript = computed(() => store.analysis.transcript)
const scenes = computed(() => store.analysis.scenes)

// 事件处理
const handleAnalysisComplete = (results) => {
  console.log('分析完成:', results)
  store.setAnalysisResults(results)
}

const handleKeywordsUpdated = (keywords) => {
  console.log('关键词更新:', keywords)
  store.updateKeywords(keywords)
}
</script>

<style scoped>
.analysis-tab {
  height: 100%;
  overflow: auto;
}
</style>
