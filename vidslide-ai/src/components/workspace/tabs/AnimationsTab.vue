<template>
  <div class="animations-tab">
    <AnimationSystem
      :animations="animations"
      @animation-added="handleAnimationAdded"
      @animation-removed="handleAnimationRemoved"
      @animations-cleared="handleAnimationsCleared"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import AnimationSystem from '@/components/AnimationSystem.vue'

const store = useWorkspaceStore()

// 计算属性
const animations = computed(() => store.animations.list)

// 事件处理
const handleAnimationAdded = animation => {
  console.log('添加动画:', animation)
  store.addAnimation(animation)
}

const handleAnimationRemoved = animationId => {
  console.log('移除动画:', animationId)
  store.removeAnimation(animationId)
}

const handleAnimationsCleared = () => {
  console.log('清除所有动画')
  store.clearAnimations()
}
</script>

<style scoped>
.animations-tab {
  height: 100%;
  overflow: auto;
}
</style>
