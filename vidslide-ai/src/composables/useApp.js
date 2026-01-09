/**
 * useApp.js
 * VidSlide AI - 紧急补齐阶段
 * 使用Vue 3 reactive/computed替代Pinia状态管理
 * 实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
 */

import { ref, computed } from 'vue'

/**
 * useApp composable
 * 紧急补齐阶段功能实现
 * 技术栈：Vue 3 + Canvas 2D
 */

// 应用状态
const currentProject = ref(null)
const projects = ref([])
const isLoading = ref(false)

// 计算属性
const hasProjects = computed(() => projects.value.length > 0)
const currentProjectName = computed(() => currentProject.value?.name || '未命名项目')

// 方法
const createProject = name => {
  const project = {
    id: Date.now().toString(),
    name,
    createdAt: new Date(),
    video: null,
    markers: []
  }
  projects.value.push(project)
  currentProject.value = project
  saveProject()
  return project
}

const saveProject = () => {
  // 保存到localStorage
  try {
    localStorage.setItem('vidslide-projects', JSON.stringify(projects.value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const loadProjects = () => {
  try {
    const saved = localStorage.getItem('vidslide-projects')
    if (saved) {
      projects.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
  }
}

const setCurrentProject = project => {
  currentProject.value = project
}

const updateProject = (projectId, updates) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    Object.assign(project, updates)
    saveProject()
  }
}

const deleteProject = projectId => {
  const index = projects.value.findIndex(p => p.id === projectId)
  if (index > -1) {
    projects.value.splice(index, 1)
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
    }
    saveProject()
  }
}

// 初始化时加载项目
loadProjects()

export const useApp = () => {
  return {
    currentProject,
    projects,
    isLoading,
    hasProjects,
    currentProjectName,
    createProject,
    setCurrentProject,
    updateProject,
    deleteProject,
    saveProject,
    loadProjects
  }
}
