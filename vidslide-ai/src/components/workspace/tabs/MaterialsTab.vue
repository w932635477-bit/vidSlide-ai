<template>
  <div class="materials-tab">
    <MaterialRequirementAnalyzer
      :keywords="keywords"
      :keyframes="keyframes"
      @material-search-requested="handleMaterialSearch"
      @requirement-selected="handleRequirementSelected"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useMaterialManagement } from '@/composables/useMaterialManagement'
import MaterialRequirementAnalyzer from '@/components/MaterialRequirementAnalyzer.vue'

const store = useWorkspaceStore()
const { searchMaterials } = useMaterialManagement()

// 计算属性
const keywords = computed(() => store.analysis.keywords)
const keyframes = computed(() => store.analysis.extractedKeyframes)

// 事件处理
const handleMaterialSearch = async (requirement) => {
  await searchMaterials(requirement)
}

const handleRequirementSelected = (requirements) => {
  console.log('选中的需求:', requirements)
  store.setMaterialRequirements(requirements)
}
</script>

<style scoped>
.materials-tab {
  height: 100%;
  overflow: auto;
}
</style>
