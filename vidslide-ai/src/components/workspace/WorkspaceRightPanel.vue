<!--
  WorkspaceRightPanel.vue - 右侧属性面板
  包含多个标签页：属性、特效、动画、监控
-->
<template>
  <aside class="workspace-right-panel" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <button v-if="!isCollapsed" class="collapse-toggle" title="折叠面板" @click="toggleCollapse">
      ▶
    </button>
    <button v-else class="collapse-toggle collapsed" title="展开面板" @click="toggleCollapse">
      ◀
    </button>

    <!-- 面板内容 -->
    <div v-if="!isCollapsed" class="panel-container">
      <!-- 标签页导航 -->
      <div class="panel-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="panel-tab"
          :class="{ active: activeTab === tab.id }"
          :title="tab.label"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="panel-content">
        <!-- 属性标签页 -->
        <div v-if="activeTab === 'properties'" class="tab-pane">
          <div class="properties-section">
            <h3 class="section-title">视频属性</h3>
            <div class="property-item">
              <span class="property-label">分辨率:</span>
              <span class="property-value">{{ videoResolution }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">时长:</span>
              <span class="property-value">{{ videoDuration }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">格式:</span>
              <span class="property-value">{{ videoFormat }}</span>
            </div>
          </div>
        </div>

        <!-- 特效标签页 -->
        <div v-if="activeTab === 'effects'" class="tab-pane">
          <div class="effects-section">
            <h3 class="section-title">视觉特效</h3>
            <div class="effects-grid">
              <div class="effect-item">
                <div class="effect-preview">🎨</div>
                <div class="effect-name">滤镜</div>
              </div>
              <div class="effect-item">
                <div class="effect-preview">✨</div>
                <div class="effect-name">转场</div>
              </div>
              <div class="effect-item">
                <div class="effect-preview">🌟</div>
                <div class="effect-name">叠加</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 动画标签页 -->
        <div v-if="activeTab === 'animation'" class="tab-pane">
          <div class="animation-section">
            <h3 class="section-title">动画效果</h3>
            <div class="animation-list">
              <div class="animation-item">
                <span class="animation-icon">🎭</span>
                <span class="animation-name">淡入淡出</span>
              </div>
              <div class="animation-item">
                <span class="animation-icon">🎪</span>
                <span class="animation-name">缩放</span>
              </div>
              <div class="animation-item">
                <span class="animation-icon">🎨</span>
                <span class="animation-name">旋转</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 监控标签页 -->
        <div v-if="activeTab === 'monitor'" class="tab-pane monitor-pane">
          <WorkflowMonitor
            :steps="workflowSteps"
            :current-step-index="currentStepIndex"
            :is-running="isRunning"
            :is-paused="isPaused"
            :is-completed="isCompleted"
            :has-error="hasError"
            :statistics="statistics"
            @pause="$emit('workflow-pause')"
            @resume="$emit('workflow-resume')"
            @cancel="$emit('workflow-cancel')"
            @clear-logs="$emit('clear-logs')"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import WorkflowMonitor from '../WorkflowMonitor.vue'

const props = defineProps({
  workflowSteps: {
    type: Array,
    default: () => []
  },
  currentStepIndex: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  statistics: {
    type: Object,
    default: null
  },
  videoResolution: {
    type: String,
    default: '1920x1080'
  },
  videoDuration: {
    type: String,
    default: '0:00'
  },
  videoFormat: {
    type: String,
    default: 'MP4'
  }
})

defineEmits(['workflow-pause', 'workflow-resume', 'workflow-cancel', 'clear-logs'])

const isCollapsed = ref(false)
const activeTab = ref('properties')

const tabs = [
  { id: 'properties', icon: '⚙️', label: '属性' },
  { id: 'effects', icon: '✨', label: '特效' },
  { id: 'animation', icon: '🎭', label: '动画' },
  { id: 'monitor', icon: '📊', label: '监控' }
]

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.workspace-right-panel {
  position: relative;
  width: 320px;
  background: #1e1e1e;
  border-left: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.workspace-right-panel.collapsed {
  width: 48px;
}

.collapse-toggle {
  position: absolute;
  top: 12px;
  left: 8px;
  width: 32px;
  height: 32px;
  border: 1px solid #3a3a3a;
  background: #2a2a2a;
  border-radius: 6px;
  color: #d4d4d4;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.collapse-toggle:hover {
  background: #3a3a3a;
  border-color: #4a4a4a;
}

.collapse-toggle.collapsed {
  left: auto;
  right: 8px;
}

.panel-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}

.panel-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #8a8a8a;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.panel-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #d4d4d4;
}

.panel-tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-pane {
  padding: 16px;
}

.monitor-pane {
  padding: 0;
  height: 100%;
}

/* 属性部分 */
.properties-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
}

.property-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #2a2a2a;
}

.property-label {
  font-size: 13px;
  color: #8a8a8a;
}

.property-value {
  font-size: 13px;
  color: #d4d4d4;
  font-weight: 500;
}

/* 特效部分 */
.effects-section {
  margin-bottom: 16px;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.effect-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.effect-item:hover {
  background: #3a3a3a;
  transform: translateY(-2px);
}

.effect-preview {
  font-size: 32px;
}

.effect-name {
  font-size: 12px;
  color: #d4d4d4;
}

/* 动画部分 */
.animation-section {
  margin-bottom: 16px;
}

.animation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.animation-item:hover {
  background: #3a3a3a;
}

.animation-icon {
  font-size: 24px;
}

.animation-name {
  font-size: 13px;
  color: #d4d4d4;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #4e4e52;
}

@media (max-width: 1024px) {
  .workspace-right-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .workspace-right-panel {
    width: 240px;
  }

  .tab-label {
    display: none;
  }
}
</style>
