<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
/**
 * App.vue
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()

    onMounted(async () => {
      // 应用启动时初始化认证状态
      try {
        await authStore.initialize()
        console.log('认证状态初始化完成:', {
          isAuthenticated: authStore.isAuthenticated,
          user: authStore.currentUser
        })
      } catch (err) {
        console.error('认证状态初始化失败:', err)
      }
    })

    return {}
  }
}
</script>

<style>
/* ===========================================
   全局重置样式 - 苹果设计标准
   =========================================== */

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 移除Element Plus默认样式影响 */
.el-container,
.el-main,
.el-header {
  margin: 0;
  padding: 0;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 选择文本样式 */
::selection {
  background: rgba(0, 122, 255, 0.3);
  color: inherit;
}

::-moz-selection {
  background: rgba(0, 122, 255, 0.3);
  color: inherit;
}
</style>
