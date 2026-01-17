<template>
  <div class="pip-tab">
    <PictureInPicture
      :pip-enabled="pipEnabled"
      :pip-settings="pipSettings"
      @settings-changed="handleSettingsChanged"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import PictureInPicture from '@/components/PictureInPicture.vue'

const store = useWorkspaceStore()

// 计算属性
const pipEnabled = computed(() => store.pip.enabled)
const pipSettings = computed(() => store.pip.settings)

// 事件处理
const handleSettingsChanged = (settings) => {
  console.log('画中画设置更新:', settings)
  store.updatePipSettings(settings)
}
</script>

<style scoped>
.pip-tab {
  height: 100%;
  overflow: auto;
}
</style>
