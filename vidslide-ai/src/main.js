/**
 * main.js
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

console.log('🚀 main.js 开始执行')

import { createApp } from 'vue'
console.log('✅ Vue 导入成功')

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
console.log('✅ ElementPlus 导入成功')

// Wegic.ai 设计系统集成
import './styles/wegic-design-system.css'
console.log('✅ CSS 导入成功')

import App from './App.vue'
console.log('✅ App.vue 导入成功')

import router from './router'
console.log('✅ Router 导入成功')

/**
 * app 函数
 * 紧急补齐阶段功能实现
 * 技术栈：Vue 3 + Canvas 2D
 */
console.log('🚀 创建Vue应用实例')
const app = createApp(App)
console.log('✅ Vue应用实例创建成功')

console.log('🚀 安装路由器')
app.use(router)
console.log('✅ 路由器安装成功')

console.log('🚀 安装ElementPlus')
app.use(ElementPlus)
console.log('✅ ElementPlus安装成功')

console.log('🚀 挂载应用到#app')
app.mount('#app')
console.log('🎉 Vue应用挂载完成！')
