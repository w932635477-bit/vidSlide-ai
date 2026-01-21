/**
 * useProjectManagement - 项目管理Composable
 * 处理项目的新建、打开、保存等功能
 */
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export function useProjectManagement() {
  const store = useWorkspaceStore()

  // 自动保存防抖定时器
  let autoSaveTimer = null
  const lastAutoSaveTime = ref(0)

  // 新建项目
  const newProject = async () => {
    try {
      // 如果当前项目有未保存的更改，提示用户
      if (store.project.isDirty) {
        await ElMessageBox.confirm('当前项目有未保存的更改，是否继续？', '提示', {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }

      // 重置工作区
      store.resetWorkspace()
      ElMessage.success('已创建新项目')
    } catch (error) {
      // 用户取消
      if (error === 'cancel') {
        return
      }
      console.error('创建新项目失败:', error)
      ElMessage.error('创建新项目失败')
    }
  }

  // 打开项目
  const openProject = async () => {
    try {
      // 创建文件选择器
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.vidslide,.json'

      input.onchange = async e => {
        const file = e.target.files[0]
        if (!file) return

        try {
          const text = await file.text()
          const projectData = JSON.parse(text)

          // 导入项目状态
          store.importState(projectData)
          store.setProjectData({
            title: projectData.title || '未命名项目',
            createdAt: projectData.createdAt,
            updatedAt: new Date()
          })

          ElMessage.success('项目加载成功')
        } catch (error) {
          console.error('项目加载失败:', error)
          ElMessage.error('项目文件格式错误')
        }
      }

      input.click()
    } catch (error) {
      console.error('打开项目失败:', error)
      ElMessage.error('打开项目失败')
    }
  }

  // 保存项目
  const saveProject = async () => {
    try {
      // 导出当前状态
      const state = store.exportState()

      // 创建项目数据
      const projectData = {
        title: store.projectTitle,
        version: '1.0',
        createdAt: store.project.data?.createdAt || new Date(),
        updatedAt: new Date(),
        ...state
      }

      // 转换为JSON
      const json = JSON.stringify(projectData, null, 2)

      // 创建下载链接
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${store.projectTitle}.vidslide`
      a.click()

      URL.revokeObjectURL(url)

      // 标记为已保存
      store.markProjectClean()

      ElMessage.success('项目保存成功')
    } catch (error) {
      console.error('保存项目失败:', error)
      ElMessage.error('保存项目失败')
    }
  }

  // 自动保存（带防抖）
  const autoSave = async () => {
    if (!store.project.isDirty) return

    // 防抖：如果距离上次保存不到 5 秒，则跳过
    const now = Date.now()
    if (now - lastAutoSaveTime.value < 5000) {
      return
    }

    try {
      const state = store.exportState()
      const projectData = {
        title: store.projectTitle,
        version: '1.0',
        autoSaved: true,
        savedAt: new Date(),
        ...state
      }

      // 保存到localStorage
      localStorage.setItem('vidslide_autosave', JSON.stringify(projectData))
      lastAutoSaveTime.value = now
      console.log('✅ 自动保存成功')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }

  // 带延迟的自动保存（用于替代定时器调用）
  const debouncedAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(() => {
      autoSave()
    }, 3000) // 3秒延迟
  }

  // 恢复自动保存
  const restoreAutoSave = async () => {
    try {
      const saved = localStorage.getItem('vidslide_autosave')
      if (!saved) return false

      const projectData = JSON.parse(saved)

      await ElMessageBox.confirm(
        `发现自动保存的项目（${new Date(projectData.savedAt).toLocaleString()}），是否恢复？`,
        '恢复项目',
        {
          confirmButtonText: '恢复',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      store.importState(projectData)
      ElMessage.success('项目已恢复')
      return true
    } catch (error) {
      if (error === 'cancel') {
        // 用户取消，清除自动保存
        localStorage.removeItem('vidslide_autosave')
      }
      return false
    }
  }

  return {
    // 状态
    projectTitle: computed(() => store.projectTitle),
    isDirty: computed(() => store.project.isDirty),

    // 方法
    newProject,
    openProject,
    saveProject,
    autoSave,
    debouncedAutoSave,
    restoreAutoSave
  }
}
