/**
 * main.js
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Wegic.ai 设计系统集成
import './styles/wegic-design-system.css'

import App from './App.vue'
import router from './router'

/**
 * app 函数
 * 紧急补齐阶段功能实现
 * 技术栈：Vue 3 + Canvas 2D
 */
const app = createApp(App)

app.use(router)
app.use(ElementPlus)

app.mount('#app')
