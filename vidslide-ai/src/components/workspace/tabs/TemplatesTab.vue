<template>
  <div class="templates-tab">
    <TemplateSelector
      :content-type="contentType"
      :video-duration="videoDuration"
      @template-selected="handleTemplateSelected"
      @template-confirmed="handleTemplateConfirmed"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import TemplateSelector from '@/components/TemplateSelector.vue'

const store = useWorkspaceStore()

// 计算属性
const contentType = computed(() => store.template.contentType)
const videoDuration = computed(() => store.video.duration)

// 事件处理
const handleTemplateSelected = (template) => {
  console.log('选择模板:', template)
}

const handleTemplateConfirmed = (template) => {
  console.log('确认使用模板:', template)
  store.setTemplate(template)
  ElMessage.success(`已选择模板: ${template.name}`)

  // 切换到下一步
  store.setWorkflowStep('effect')
  store.setActiveTab('adjust')
}
</script>

<style scoped>
.templates-tab {
  height: 100%;
  overflow: auto;
  padding: 20px;
}
</style>
