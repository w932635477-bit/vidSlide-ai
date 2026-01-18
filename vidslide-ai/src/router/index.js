/**
 * index.js
 * VidSlide AI - 路由配置
 * 剪映风格工作区布局
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../views/VideoEditorView.vue')
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('../views/WorkspaceView.vue'),
      meta: {
        title: 'VidSlide AI - 工作区',
        description: '剪映风格的视频编辑工作区'
      }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue')
    }
  ]
})

export default router
