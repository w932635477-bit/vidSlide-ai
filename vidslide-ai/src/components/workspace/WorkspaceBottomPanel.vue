<template>
  <div class="workspace-bottom-panel" :class="{ collapsed: isPanelCollapsed }">
    <!-- 标签导航 -->
    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>

      <!-- 折叠按钮 -->
      <button class="collapse-btn" @click="toggleCollapse" title="折叠/展开">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="isPanelCollapsed ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
        </svg>
      </button>
    </div>

    <!-- 标签内容区域 -->
    <div v-show="!isPanelCollapsed" class="panel-content">
      <component
        :is="currentTabComponent"
        v-if="currentTabComponent"
        v-bind="currentTabProps"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const store = useWorkspaceStore()

// 计算属性
const activeTab = computed(() => store.ui.activeTab)
const isPanelCollapsed = computed(() => store.ui.isPanelCollapsed)

// 标签配置
const tabs = [
  { id: 'analysis', label: 'AI分析', icon: '🧠' },
  { id: 'materials', label: '素材需求', icon: '📦' },
  { id: 'templates', label: '模板', icon: '📋' },
  { id: 'smart-tools', label: '智能工具', icon: '🛠️' },
  { id: 'pip', label: '画中画', icon: '📺' },
  { id: 'animations', label: '动画', icon: '✨' },
  { id: 'adjust', label: '调整', icon: '⚙️' },
  { id: 'ai', label: 'AI助手', icon: '🤖' }
]

// 动态加载标签页组件
const tabComponents = {
  'analysis': defineAsyncComponent(() => import('./tabs/AnalysisTab.vue')),
  'materials': defineAsyncComponent(() => import('./tabs/MaterialsTab.vue')),
  'templates': defineAsyncComponent(() => import('./tabs/TemplatesTab.vue')),
  'smart-tools': defineAsyncComponent(() => import('./tabs/SmartToolsTab.vue')),
  'pip': defineAsyncComponent(() => import('./tabs/PipTab.vue')),
  'animations': defineAsyncComponent(() => import('./tabs/AnimationsTab.vue')),
  'adjust': defineAsyncComponent(() => import('./tabs/AdjustTab.vue')),
  'ai': defineAsyncComponent(() => import('./tabs/AiTab.vue'))
}

// 当前标签组件
const currentTabComponent = computed(() => {
  return tabComponents[activeTab.value] || null
})

// 当前标签props
const currentTabProps = computed(() => {
  // 根据不同标签页返回不同的props
  return {}
})

// 切换标签
const setActiveTab = (tabId) => {
  store.setActiveTab(tabId)
}

// 切换折叠状态
const toggleCollapse = () => {
  store.togglePanelCollapse()
}
</script>

<style scoped>
.workspace-bottom-panel {
  height: 400px;
  background: #ffffff;
  border-top: 1px solid #e5e5e7;
  display: flex;
  flex-direction: column;
  transition: height 0.3s ease;
}

.workspace-bottom-panel.collapsed {
  height: 48px;
}

/* 标签导航 */
.panel-tabs {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e7;
  overflow-x: auto;
  overflow-y: hidden;
}

.panel-tabs::-webkit-scrollbar {
  height: 4px;
}

.panel-tabs::-webkit-scrollbar-thumb {
  background: #d1d1d6;
  border-radius: 2px;
}

.tab-btn {
  height: 36px;
  padding: 0 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #86868b;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

.tab-btn.active {
  background: #007aff;
  color: #ffffff;
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
}

.collapse-btn {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

/* 内容区域 */
.panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

@media (max-width: 768px) {
  .workspace-bottom-panel {
    height: 350px;
  }

  .tab-label {
    display: none;
  }

  .tab-btn {
    padding: 0 12px;
  }
}
</style>
