<!--
  WorkspaceSidebar.vue - 左侧素材库边栏
  包装 AssetPanel 组件，添加折叠功能
-->
<template>
  <aside class="workspace-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <button v-if="!isCollapsed" class="collapse-toggle" title="折叠侧边栏" @click="toggleCollapse">
      ◀
    </button>
    <button v-else class="collapse-toggle collapsed" title="展开侧边栏" @click="toggleCollapse">
      ▶
    </button>

    <!-- 侧边栏内容 -->
    <div v-if="!isCollapsed" class="sidebar-content">
      <AssetPanel
        :projects="projects"
        :videos="videos"
        :images="images"
        :audios="audios"
        :can-generate="canGenerate"
        @auto-generate="$emit('auto-generate')"
        @select-asset="$emit('select-asset', $event)"
      />
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import AssetPanel from './AssetPanel.vue'

defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  videos: {
    type: Array,
    default: () => []
  },
  images: {
    type: Array,
    default: () => []
  },
  audios: {
    type: Array,
    default: () => []
  },
  canGenerate: {
    type: Boolean,
    default: false
  }
})

defineEmits(['auto-generate', 'select-asset'])

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.workspace-sidebar {
  position: relative;
  width: 280px;
  background: #1e1e1e;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.workspace-sidebar.collapsed {
  width: 48px;
}

.collapse-toggle {
  position: absolute;
  top: 12px;
  right: 8px;
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
  right: auto;
  left: 8px;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .workspace-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .workspace-sidebar {
    width: 200px;
  }
}
</style>
