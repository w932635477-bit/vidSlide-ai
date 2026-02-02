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

        <!-- PPT标签页 -->
        <div v-if="activeTab === 'ppt'" class="tab-pane ppt-pane">
          <div class="ppt-section">
            <h3 class="section-title">PPT幻灯片 ({{ pptSlides?.length || 0 }}页)</h3>

            <!-- PPT控制按钮 -->
            <div class="ppt-controls">
              <button class="ppt-btn" :disabled="currentSlide === 0" @click="previousSlide">
                ◀ 上一页
              </button>
              <span class="slide-counter"
                >{{ currentSlide + 1 }} / {{ pptSlides?.length || 0 }}</span
              >
              <button
                class="ppt-btn"
                :disabled="currentSlide >= (pptSlides?.length || 1) - 1"
                @click="nextSlide"
              >
                下一页 ▶
              </button>
            </div>

            <!-- 当前幻灯片大图 -->
            <div class="current-slide">
              <img
                v-if="pptSlides?.[currentSlide]?.image"
                :src="pptSlides[currentSlide].image"
                :alt="`幻灯片 ${currentSlide + 1}`"
                class="slide-image"
              />
              <div v-else class="slide-placeholder">
                <span>幻灯片 {{ currentSlide + 1 }}</span>
              </div>
            </div>

            <!-- 幻灯片缩略图列表 -->
            <div class="ppt-slides">
              <div
                v-for="(slide, index) in pptSlides"
                :key="index"
                class="slide-item"
                :class="{ active: index === currentSlide }"
                @click="currentSlide = index"
              >
                <img v-if="slide.thumbnail" :src="slide.thumbnail" :alt="`幻灯片 ${index + 1}`" />
                <div v-else class="slide-placeholder-small">
                  <span>{{ index + 1 }}</span>
                </div>
                <div class="slide-title">{{ slide.title || `幻灯片 ${index + 1}` }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 执行面板标签页 (V0风格) -->
        <div v-if="activeTab === 'monitor'" class="tab-pane monitor-pane">
          <AgentExecutionPanel
            :steps="executionSteps"
            :current-step-index="currentStepIndex"
            :is-running="isRunning"
            :is-completed="isCompleted"
            :has-error="hasError"
            :progress="multiAgentProgress"
            :current-step="multiAgentCurrentStep"
            :elapsed-time="elapsedTime"
            @clear="$emit('clear-logs')"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import AgentExecutionPanel from '../execution/AgentExecutionPanel.vue'

const props = defineProps({
  // 执行步骤（V0风格）
  executionSteps: {
    type: Array,
    default: () => []
  },
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
  },
  pptSlides: {
    type: Array,
    default: () => []
  },
  showPptTab: {
    type: Boolean,
    default: false
  },
  // 多智能体进度相关props
  multiAgentProgress: {
    type: Number,
    default: 0
  },
  multiAgentCurrentStep: {
    type: String,
    default: ''
  },
  showMultiAgentProgress: {
    type: Boolean,
    default: false
  },
  // 已用时间
  elapsedTime: {
    type: Number,
    default: 0
  }
})

defineEmits(['workflow-pause', 'workflow-resume', 'workflow-cancel', 'clear-logs'])

const isCollapsed = ref(false)
const activeTab = ref('monitor') // 默认显示监控标签页
const currentSlide = ref(0)

const tabs = computed(() => {
  const baseTabs = [
    { id: 'properties', icon: '⚙️', label: '属性' },
    { id: 'effects', icon: '✨', label: '特效' },
    { id: 'animation', icon: '🎭', label: '动画' },
    { id: 'monitor', icon: '⚡', label: '执行' }
  ]

  if (props.showPptTab && props.pptSlides?.length > 0) {
    baseTabs.splice(1, 0, { id: 'ppt', icon: '📄', label: 'PPT' })
  }

  return baseTabs
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < props.pptSlides.length - 1) {
    currentSlide.value++
  }
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

/* PPT标签页样式 */
.ppt-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ppt-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.ppt-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #252526;
  border-radius: 6px;
}

.ppt-btn {
  padding: 6px 12px;
  border: 1px solid #3a3a3a;
  background: #2a2a2a;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ppt-btn:hover:not(:disabled) {
  background: #3a3a3a;
  border-color: #4a4a4a;
}

.ppt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-counter {
  font-size: 12px;
  color: #8a8a8a;
}

.current-slide {
  flex-shrink: 0;
  background: #252526;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slide-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8a8a8a;
  font-size: 24px;
}

.ppt-slides {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 4px;
}

.slide-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #252526;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.slide-item:hover {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

.slide-item.active {
  border-color: #4a9eff;
  background: #2a2a2a;
}

.slide-item img {
  width: 60px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.slide-placeholder-small {
  width: 60px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e1e;
  border-radius: 4px;
  color: #8a8a8a;
  font-size: 12px;
  flex-shrink: 0;
}

.slide-title {
  flex: 1;
  font-size: 12px;
  color: #d4d4d4;
  display: flex;
  align-items: center;
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
