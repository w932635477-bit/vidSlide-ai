<template>
  <div class="user-adjustment-panel">
    <AdjustmentHeader :active-tab="activeTab" @change-tab="activeTab = $event" />

    <component
      :is="currentTabComponent"
      :settings="settings"
      @update="updateSettings"
    />

    <AdjustmentActions
      :has-changes="hasChanges"
      @apply="applyAdjustments"
      @reset="resetAdjustments"
      @preview="togglePreview"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdjustmentHeader from './user-adjustment/AdjustmentHeader.vue'
import VideoAdjustments from './user-adjustment/VideoAdjustments.vue'
import AudioAdjustments from './user-adjustment/AudioAdjustments.vue'
import TemplateAdjustments from './user-adjustment/TemplateAdjustments.vue'
import AdjustmentActions from './user-adjustment/AdjustmentActions.vue'

/**
 * 用户调整面板（重构版）
 * 功能：视频调整、音频调整、模板调整
 */

const emit = defineEmits(['adjustments-applied', 'preview-toggled'])

const activeTab = ref('video')
const settings = ref({
  video: {},
  audio: {},
  template: {}
})
const hasChanges = ref(false)

const currentTabComponent = computed(() => {
  const components = {
    video: VideoAdjustments,
    audio: AudioAdjustments,
    template: TemplateAdjustments
  }
  return components[activeTab.value]
})

const updateSettings = (updates) => {
  settings.value[activeTab.value] = { ...settings.value[activeTab.value], ...updates }
  hasChanges.value = true
}

const applyAdjustments = () => {
  emit('adjustments-applied', settings.value)
  hasChanges.value = false
}

const resetAdjustments = () => {
  settings.value = {
    video: {},
    audio: {},
    template: {}
  }
  hasChanges.value = false
}

const togglePreview = () => {
  emit('preview-toggled')
}
</script>

<style scoped>
.user-adjustment-panel {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
