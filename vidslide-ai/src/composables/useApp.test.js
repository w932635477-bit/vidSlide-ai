// app composable 单元测试
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApp } from '../composables/useApp'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

vi.stubGlobal('localStorage', localStorageMock)

describe('useApp', () => {
  let app

  beforeEach(() => {
    vi.clearAllMocks()
    app = useApp()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('should initialize with default values', () => {
      expect(app.currentProject.value).toBeNull()
      expect(app.projects.value).toEqual([])
      expect(app.isLoading.value).toBe(false)
      expect(app.hasProjects.value).toBe(false)
      expect(app.currentProjectName.value).toBe('未命名项目')
    })

    it('should support loading projects manually', () => {
      const mockProjects = [{ id: '1', name: '项目1', createdAt: new Date() }]

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockProjects))

      app.loadProjects()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('vidslide-projects')
      expect(app.projects.value).toEqual(mockProjects)
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      useApp() // Trigger error handling

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('项目管理', () => {
    it('should create new project', () => {
      const project = app.createProject('测试项目')

      expect(project.id).toBeDefined()
      expect(project.name).toBe('测试项目')
      expect(project.createdAt).toBeInstanceOf(Date)
      expect(project.video).toBeNull()
      expect(project.markers).toEqual([])
      expect(app.currentProject.value).toBe(project)
      expect(app.projects.value).toContain(project)
    })

    it('should set current project', () => {
      const project = { id: '1', name: '项目1' }

      app.setCurrentProject(project)

      expect(app.currentProject.value).toBe(project)
    })

    it('should update project', () => {
      const project = app.createProject('原始项目')
      const updates = { name: '更新项目', video: { name: 'test.mp4' } }

      app.updateProject(project.id, updates)

      expect(app.projects.value[0].name).toBe('更新项目')
      expect(app.projects.value[0].video).toEqual({ name: 'test.mp4' })
    })

    it('should delete project', () => {
      const project1 = app.createProject('项目1')
      const project2 = app.createProject('项目2')

      app.setCurrentProject(project1)
      app.deleteProject(project1.id)

      expect(app.projects.value).toHaveLength(1)
      expect(app.projects.value[0]).toBe(project2)
      expect(app.currentProject.value).toBeNull()
    })

    it('should not delete current project when deleting other project', () => {
      const project1 = app.createProject('项目1')
      const project2 = app.createProject('项目2')

      app.setCurrentProject(project1)
      app.deleteProject(project2.id)

      expect(app.currentProject.value).toBe(project1)
      expect(app.projects.value).toHaveLength(1)
    })
  })

  describe('数据持久化', () => {
    it('should save projects to localStorage', () => {
      app.createProject('测试项目')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('vidslide-projects', expect.any(String))
    })

    it('should handle localStorage save errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Save error')
      })

      app.createProject('测试项目')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should load projects from localStorage', () => {
      const mockProjects = [
        {
          id: '1',
          name: '项目1',
          createdAt: new Date(),
          video: null,
          markers: []
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockProjects))

      app.loadProjects()

      expect(app.projects.value).toEqual(mockProjects)
    })

    it('should handle invalid localStorage data', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      localStorageMock.getItem.mockReturnValue('invalid json')

      app.loadProjects()

      expect(consoleSpy).toHaveBeenCalled()
      expect(app.projects.value).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('计算属性', () => {
    it('should return correct hasProjects', () => {
      expect(app.hasProjects.value).toBe(false)

      app.createProject('测试项目')
      expect(app.hasProjects.value).toBe(true)
    })

    it('should return correct currentProjectName', () => {
      expect(app.currentProjectName.value).toBe('未命名项目')

      app.createProject('我的项目')
      expect(app.currentProjectName.value).toBe('我的项目')

      app.setCurrentProject(null)
      expect(app.currentProjectName.value).toBe('未命名项目')
    })
  })

  describe('错误处理', () => {
    it('should handle project creation errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const project = app.createProject('测试项目')

      expect(project).toBeDefined()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle project update for non-existent project', () => {
      app.updateProject('non-existent', { name: '更新' })

      // Should not throw error
      expect(app.projects.value).toEqual([])
    })

    it('should handle project deletion for non-existent project', () => {
      app.deleteProject('non-existent')

      // Should not throw error
      expect(app.projects.value).toEqual([])
    })
  })

  describe('数据完整性', () => {
    it('should maintain project structure', () => {
      const project = app.createProject('测试项目')

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('createdAt')
      expect(project).toHaveProperty('video')
      expect(project).toHaveProperty('markers')
      expect(Array.isArray(project.markers)).toBe(true)
    })

    it('should preserve project data during updates', () => {
      const project = app.createProject('原始名称')
      const originalCreatedAt = project.createdAt

      app.updateProject(project.id, { name: '新名称' })

      expect(app.projects.value[0].name).toBe('新名称')
      expect(app.projects.value[0].createdAt).toBe(originalCreatedAt)
      expect(app.projects.value[0].id).toBe(project.id)
    })
  })

  describe('内存管理', () => {
    it('should clean up references when deleting current project', () => {
      const project = app.createProject('测试项目')
      app.setCurrentProject(project)

      app.deleteProject(project.id)

      expect(app.currentProject.value).toBeNull()
    })

    it('should handle multiple project operations', () => {
      // Create multiple projects
      const project1 = app.createProject('项目1')
      const project2 = app.createProject('项目2')
      const project3 = app.createProject('项目3')

      expect(app.projects.value).toHaveLength(3)

      // Update one project
      app.updateProject(project2.id, { name: '更新项目2' })
      expect(app.projects.value[1].name).toBe('更新项目2')

      // Delete one project
      app.deleteProject(project1.id)
      expect(app.projects.value).toHaveLength(2)
      expect(app.projects.value.find(p => p.id === project1.id)).toBeUndefined()

      // Verify remaining projects are intact
      expect(app.projects.value.find(p => p.id === project2.id)).toBeDefined()
      expect(app.projects.value.find(p => p.id === project3.id)).toBeDefined()
    })
  })
})
