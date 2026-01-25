<!--
  TimelinePanel.vue - 底部时间轴面板
  集成多智能体Timeline可视化
-->
<template>
  <div class="timeline-panel">
    <!-- 如果有Timeline数据，显示可视化组件 -->
    <MultiAgentTimelineVisualization v-if="hasTimeline" />

    <!-- 如果没有Timeline数据，显示提示 -->
    <div v-else class="timeline-empty">
      <div class="empty-icon">📊</div>
      <p class="empty-text">暂无Timeline数据</p>
      <p class="empty-hint">上传视频并开始处理后，Timeline将在这里显示</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import MultiAgentTimelineVisualization from './MultiAgentTimelineVisualization.vue'

const store = useWorkspaceStore()

// 检查是否有Timeline数据
const hasTimeline = computed(() => {
  return store.multiAgent.timeline && store.multiAgent.timeline.clips && store.multiAgent.timeline.clips.length > 0
})
</script>

<style scoped>
.timeline-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--jianying-timeline-bg, #1a1a1a);
}

/* 空状态 */
.timeline-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.3;
}

.empty-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  text-align: center;
  max-width: 400px;
}
</style>
