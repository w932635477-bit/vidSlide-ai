/** * App.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 全局状态
// const isDark = ref(false) // 暂时不需要暗色模式
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
  height: 100%;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
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
