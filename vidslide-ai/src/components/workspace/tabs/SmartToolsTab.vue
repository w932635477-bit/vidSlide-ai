<template>
  <div class="smart-tools-tab">
    <div class="tools-grid">
      <button
        v-for="tool in tools"
        :key="tool.id"
        :class="['tool-card', { active: activeTool === tool.id }]"
        @click="selectTool(tool.id)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
        <span class="tool-name">{{ tool.name }}</span>
      </button>
    </div>

    <div class="tool-content">
      <component :is="currentToolComponent" v-if="currentToolComponent" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const store = useWorkspaceStore()

// 计算属性
const activeTool = computed(() => store.ui.activeSmartTool)

// 工具列表
const tools = [
  { id: 'crop', name: '智能裁切', icon: '✂️' },
  { id: 'background', name: '背景移除', icon: '🎭' },
  { id: 'color', name: '色彩匹配', icon: '🎨' },
  { id: 'keyframe', name: '关键帧提取', icon: '🎬' },
  { id: 'ppt', name: 'PPT生成', icon: '📊' }
]

// 工具组件映射
const toolComponents = {
  crop: defineAsyncComponent(() => import('@/components/SmartCropTool.vue')),
  background: defineAsyncComponent(() => import('@/components/BackgroundRemover.vue')),
  color: defineAsyncComponent(() => import('@/components/ColorMatcher.vue')),
  keyframe: defineAsyncComponent(() => import('@/components/KeyframeExtractor.vue')),
  ppt: defineAsyncComponent(() => import('@/components/PptGenerator.vue'))
}

// 当前工具组件
const currentToolComponent = computed(() => {
  return toolComponents[activeTool.value] || null
})

// 选择工具
const selectTool = toolId => {
  store.setActiveSmartTool(toolId)
}
</script>

<style scoped>
.smart-tools-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tools-grid {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e5e5e7;
  overflow-x: auto;
}

.tool-card {
  padding: 12px 20px;
  border: 1px solid #e5e5e7;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.tool-card:hover {
  border-color: #007aff;
  background: #f8f9fa;
}

.tool-card.active {
  border-color: #007aff;
  background: #007aff;
  color: #ffffff;
}

.tool-icon {
  font-size: 20px;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
}

.tool-content {
  flex: 1;
  overflow: auto;
}
</style>
