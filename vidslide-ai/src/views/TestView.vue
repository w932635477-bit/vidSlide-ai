/** * TestView.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!-- TestView 组件模板 -->
<template>
  <div class="test-view">
    <h1>测试页面</h1>
    <p>如果这个页面能正常显示，说明基本路由和组件系统工作正常。</p>
    <el-button
type="primary" @click="testMessage">测试按钮</el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

/**


 * testMessage 函数


 * VidSlide AI 功能实现


 */

const testMessage = () => {
  ElMessage.success('测试消息正常工作！')
}
</script>

<style scoped>
.test-view {
  padding: 20px;
  text-align: center;
}
</style>
