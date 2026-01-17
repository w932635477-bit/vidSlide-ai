<template>
  <div class="adjust-tab">
    <UserAdjustmentPanel
      :selected-template="selectedTemplate"
      @settings-updated="handleSettingsUpdated"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import UserAdjustmentPanel from '@/components/UserAdjustmentPanel.vue'

const store = useWorkspaceStore()

// 计算属性
const selectedTemplate = computed(() => store.template.selected)

// 事件处理
const handleSettingsUpdated = (settings) => {
  console.log('调整设置更新:', settings)
  store.updateTemplateSettings(settings)
}
</script>

<style scoped>
.adjust-tab {
  height: 100%;
  overflow: auto;
}
</style>
