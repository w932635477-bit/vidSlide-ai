/**
 * index.js
 * VidSlide AI - 紧急补齐阶段
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

/**
 * router 函数
 * 紧急补齐阶段功能实现
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/WorkspaceView.vue') // 重定向到统一的工作页面
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('../views/WorkspaceView.vue')
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue')
    },
    {
      path: '/wegic-showcase',
      name: 'wegic-showcase',
      component: () => import('../components/WegicDesignShowcase.vue')
    }
  ]
})

export default router
