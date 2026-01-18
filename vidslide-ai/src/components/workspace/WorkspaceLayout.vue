<!--
  WorkspaceLayout.vue - 剪映风格工作区布局
  四区域布局: Header + Asset Panel + Preview Canvas + Property Panel + Timeline
-->
<template>
  <div class="jianying-workspace">
    <!-- 顶部工具栏 -->
    <header class="jianying-header">
      <slot name="header"></slot>
    </header>

    <!-- 主要内容区 -->
    <main class="jianying-main">
      <!-- 左侧素材库 -->
      <aside
        v-if="!hideAssetPanel"
        class="jianying-asset-panel"
        :class="{ collapsed: assetPanelCollapsed }"
        :style="{ width: assetPanelWidth }"
      >
        <slot name="asset-panel"></slot>
      </aside>

      <!-- 中央预览区 -->
      <div class="jianying-preview-canvas">
        <slot name="preview-canvas"></slot>
      </div>

      <!-- 右侧属性面板 -->
      <aside
        v-if="!hidePropertyPanel"
        class="jianying-property-panel"
        :class="{ collapsed: propertyPanelCollapsed, show: showPropertyPanelMobile }"
        :style="{ width: propertyPanelWidth }"
      >
        <slot name="property-panel"></slot>
      </aside>
    </main>

    <!-- 底部时间轴 -->
    <div
      v-if="!hideTimeline"
      ref="timelineContainer"
      class="jianying-timeline"
      :style="{ height: timelineHeight }"
    >
      <slot name="timeline"></slot>
    </div>

    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="isMobile && (showAssetPanelMobile || showPropertyPanelMobile)"
      class="mobile-overlay"
      @click="closeMobilePanels"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  // 面板显示控制
  hideAssetPanel: {
    type: Boolean,
    default: false
  },
  hidePropertyPanel: {
    type: Boolean,
    default: false
  },
  hideTimeline: {
    type: Boolean,
    default: false
  },

  // 面板折叠状态
  assetPanelCollapsed: {
    type: Boolean,
    default: false
  },
  propertyPanelCollapsed: {
    type: Boolean,
    default: false
  },

  // 面板宽度 (仅桌面端有效)
  assetPanelWidth: {
    type: String,
    default: '280px'
  },
  propertyPanelWidth: {
    type: String,
    default: '320px'
  },

  // 时间轴高度
  timelineHeight: {
    type: String,
    default: '200px'
  },

  // 是否允许调整时间轴高度
  resizableTimeline: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'update:assetPanelCollapsed',
  'update:propertyPanelCollapsed',
  'update:timelineHeight',
  'panel-resize',
  'timeline-resize'
])

// Refs
const timelineContainer = ref(null)

// 响应式状态
const isMobile = ref(false)
const showAssetPanelMobile = ref(false)
const showPropertyPanelMobile = ref(false)

// 时间轴调整相关
const isResizingTimeline = ref(false)
const timelineStartHeight = ref(200)
const timelineStartY = ref(0)

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 关闭移动端面板
const closeMobilePanels = () => {
  showAssetPanelMobile.value = false
  showPropertyPanelMobile.value = false
}

// 时间轴拖拽调整
const startResizeTimeline = event => {
  if (!props.resizableTimeline) return

  isResizingTimeline.value = true
  timelineStartHeight.value = timelineContainer.value.offsetHeight
  timelineStartY.value = event.clientY

  document.addEventListener('mousemove', handleResizeTimeline)
  document.addEventListener('mouseup', stopResizeTimeline)

  // 防止文本选中
  document.body.style.userSelect = 'none'
}

const handleResizeTimeline = event => {
  if (!isResizingTimeline.value) return

  const deltaY = timelineStartY.value - event.clientY
  const newHeight = Math.max(
    150, // 最小高度
    Math.min(400, timelineStartHeight.value + deltaY) // 最大高度
  )

  emit('update:timelineHeight', `${newHeight}px`)
  emit('timeline-resize', newHeight)
}

const stopResizeTimeline = () => {
  isResizingTimeline.value = false
  document.removeEventListener('mousemove', handleResizeTimeline)
  document.removeEventListener('mouseup', stopResizeTimeline)
  document.body.style.userSelect = ''
}

// 键盘快捷键
const handleKeydown = event => {
  // Alt + 1: 切换素材库
  if (event.altKey && event.key === '1') {
    event.preventDefault()
    emit('update:assetPanelCollapsed', !props.assetPanelCollapsed)
  }

  // Alt + 2: 切换属性面板
  if (event.altKey && event.key === '2') {
    event.preventDefault()
    emit('update:propertyPanelCollapsed', !props.propertyPanelCollapsed)
  }

  // Alt + 3: 切换时间轴
  if (event.altKey && event.key === '3') {
    event.preventDefault()
    // TODO: 实现时间轴折叠
  }
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKeydown)

  // 添加时间轴调整手柄
  if (props.resizableTimeline && timelineContainer.value) {
    const resizeHandle = document.createElement('div')
    resizeHandle.className = 'timeline-resize-handle'
    resizeHandle.addEventListener('mousedown', startResizeTimeline)
    timelineContainer.value.prepend(resizeHandle)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleKeydown)
  stopResizeTimeline()
})

// 暴露方法给父组件
defineExpose({
  toggleAssetPanel: () => {
    if (isMobile.value) {
      showAssetPanelMobile.value = !showAssetPanelMobile.value
    } else {
      emit('update:assetPanelCollapsed', !props.assetPanelCollapsed)
    }
  },
  togglePropertyPanel: () => {
    if (isMobile.value) {
      showPropertyPanelMobile.value = !showPropertyPanelMobile.value
    } else {
      emit('update:propertyPanelCollapsed', !props.propertyPanelCollapsed)
    }
  },
  closeMobilePanels
})
</script>

<style scoped>
/* 使用剪映主题中定义的样式 */

/* 时间轴拖拽手柄 */
.timeline-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  cursor: ns-resize;
  z-index: 10;
  transition: background var(--duration-base) var(--ease-out);
}

.timeline-resize-handle:hover {
  background: var(--color-primary);
}

.timeline-resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 4px;
  background: var(--color-border-medium);
  border-radius: var(--radius-full);
  transition: all var(--duration-base) var(--ease-out);
}

.timeline-resize-handle:hover::after {
  background: var(--color-primary);
  width: 60px;
  height: 6px;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay-strong);
  z-index: calc(var(--z-modal) - 1);
  animation: fade-in var(--duration-base) var(--ease-out);
}

/* 移动端面板显示 */
@media (max-width: 768px) {
  .jianying-asset-panel {
    position: fixed;
    left: 0;
    top: var(--header-height);
    bottom: 0;
    z-index: var(--z-modal);
    transform: translateX(-100%);
    transition: transform var(--duration-base) var(--ease-out);
    width: 80% !important;
    max-width: 320px;
  }

  .jianying-asset-panel.show {
    transform: translateX(0);
    box-shadow: var(--shadow-2xl);
  }

  .jianying-property-panel {
    position: fixed;
    right: 0;
    top: var(--header-height);
    bottom: 0;
    z-index: var(--z-modal);
    transform: translateX(100%);
    transition: transform var(--duration-base) var(--ease-out);
    width: 80% !important;
    max-width: 320px;
  }

  .jianying-property-panel.show {
    transform: translateX(0);
    box-shadow: var(--shadow-2xl);
  }

  .jianying-timeline {
    height: 150px !important;
  }

  .timeline-resize-handle {
    display: none;
  }
}

/* 平滑过渡 */
.jianying-asset-panel,
.jianying-property-panel {
  transition:
    width var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

/* 折叠状态 */
.jianying-asset-panel.collapsed {
  width: var(--sidebar-width-collapsed) !important;
  min-width: var(--sidebar-width-collapsed);
}

.jianying-property-panel.collapsed {
  width: 0 !important;
  border-left: none;
  overflow: hidden;
}
</style>
