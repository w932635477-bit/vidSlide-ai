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

// 设计系统集成 - 顺序很重要!后导入的会覆盖前面的
// import './styles/wegic-design-system.css' // 旧的设计系统 - 已弃用，仅保留用于 WegicDesignShowcase 组件
import './styles/theme.css' // 新的设计系统
import './styles/jianying-theme.css' // 剪映风格(最后应用)
import './styles/jianying-dark-theme.css' // 剪映深色主题全局覆盖(最高优先级)
import './styles/compat.css' // 兼容层(确保变量正确映射)
console.log('✅ CSS 导入成功')

import App from './App.vue'
console.log('✅ App.vue 导入成功')

import router from './router'
console.log('✅ Router 导入成功')

import i18n from './i18n'
console.log('✅ i18n 导入成功')

import { createPinia } from 'pinia'
console.log('✅ Pinia 导入成功')

/**
 * app 函数
 * 紧急补齐阶段功能实现
 * 技术栈：Vue 3 + Canvas 2D
 */
console.log('🚀 创建Vue应用实例')
const app = createApp(App)
console.log('✅ Vue应用实例创建成功')

console.log('🚀 创建Pinia实例')
const pinia = createPinia()
console.log('✅ Pinia实例创建成功')

console.log('🚀 安装Pinia')
app.use(pinia)
console.log('✅ Pinia安装成功')

console.log('🚀 安装路由器')
app.use(router)
console.log('✅ 路由器安装成功')

console.log('🚀 安装ElementPlus')
app.use(ElementPlus)
console.log('✅ ElementPlus安装成功')

console.log('🚀 安装i18n')
app.use(i18n)
console.log('✅ i18n安装成功')

console.log('🚀 挂载应用到#app')
app.mount('#app')
console.log('🎉 Vue应用挂载完成！')
