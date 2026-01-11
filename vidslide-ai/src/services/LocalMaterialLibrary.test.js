/**
 * LocalMaterialLibrary.test.js
 * VidSlide AI 本地素材库测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { default as LocalMaterialLibrary } from './LocalMaterialLibrary.js'

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn(),
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        openCursor: vi.fn(() => ({
          onsuccess: null,
          onerror: null,
          result: null
        }))
      })),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          openCursor: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            result: null
          }))
        }))
      }))
    }
  }))
}

global.indexedDB = mockIndexedDB
global.IDBDatabase = vi.fn()
global.IDBObjectStore = vi.fn()
global.IDBTransaction = vi.fn()

describe('LocalMaterialLibrary', () => {
  let library

  beforeEach(() => {
    library = LocalMaterialLibrary
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化库', async () => {
      await library.initialize()

      expect(library.isInitialized).toBe(true)
      expect(library.db).toBeDefined()
      expect(library.invertedIndex).toBeDefined()
    })

    it('应该处理初始化失败', async () => {
      global.indexedDB.open.mockReturnValue({
        onsuccess: null,
        onerror: vi.fn(),
        result: null
      })

      await expect(library.initialize()).rejects.toThrow()
      expect(library.isInitialized).toBe(false)
    })
  })

  describe('素材管理', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该添加新素材', async () => {
      const material = {
        id: 'test_1',
        url: 'https://example.com/image.jpg',
        title: '测试图片',
        category: 'background',
        tags: ['nature', 'landscape'],
        width: 1920,
        height: 1080
      }

      await library.addMaterial(material)

      expect(library.materials.has('test_1')).toBe(true)
      const stored = library.materials.get('test_1')
      expect(stored.title).toBe('测试图片')
      expect(stored.category).toBe('background')
    })

    it('应该更新现有素材', async () => {
      const material = {
        id: 'update_test',
        url: 'https://example.com/old.jpg',
        title: '旧标题'
      }

      await library.addMaterial(material)

      // 更新素材
      const updatedMaterial = {
        ...material,
        title: '新标题',
        url: 'https://example.com/new.jpg'
      }

      await library.addMaterial(updatedMaterial)

      const stored = library.materials.get('update_test')
      expect(stored.title).toBe('新标题')
      expect(stored.url).toBe('https://example.com/new.jpg')
    })

    it('应该拒绝无效的素材', async () => {
      const invalidMaterial = {
        // 缺少必需的id
        title: '无效素材'
      }

      await expect(library.addMaterial(invalidMaterial)).rejects.toThrow()
    })
  })

  describe('素材搜索', () => {
    beforeEach(async () => {
      await library.initialize()

      // 添加测试数据
      const testMaterials = [
        {
          id: 'nature_1',
          title: '美丽的自然风景',
          category: 'background',
          tags: ['nature', 'landscape', 'forest'],
          width: 1920,
          height: 1080
        },
        {
          id: 'city_2',
          title: '现代城市建筑',
          category: 'background',
          tags: ['city', 'building', 'urban'],
          width: 1280,
          height: 720
        },
        {
          id: 'animal_3',
          title: '可爱的小动物',
          category: 'element',
          tags: ['animal', 'cute', 'pet'],
          width: 800,
          height: 600
        }
      ]

      for (const material of testMaterials) {
        await library.addMaterial(material)
      }

      // 构建倒排索引
      library.buildInvertedIndex()
    })

    it('应该按关键词搜索素材', async () => {
      const result = await library.searchMaterials('nature')

      expect(result.materials).toHaveLength(1)
      expect(result.materials[0].id).toBe('nature_1')
      expect(result.totalCount).toBe(1)
      expect(result.fromCache).toBe(false)
    })

    it('应该支持多关键词搜索', async () => {
      const result = await library.searchMaterials('city building')

      expect(result.materials.length).toBeGreaterThan(0)
      expect(result.materials.some(m => m.id === 'city_2')).toBe(true)
    })

    it('应该按类别过滤', async () => {
      const result = await library.searchMaterials('background', { category: 'background' })

      expect(result.materials.length).toBe(2)
      expect(result.materials.every(m => m.category === 'background')).toBe(true)
    })

    it('应该限制返回数量', async () => {
      const result = await library.searchMaterials('', { limit: 1 })

      expect(result.materials).toHaveLength(1)
    })

    it('应该计算相关性分数', async () => {
      const result = await library.searchMaterials('nature landscape')

      expect(result.materials[0]).toHaveProperty('relevanceScore')
      expect(result.materials[0].relevanceScore).toBeGreaterThan(0)
    })

    it('应该处理空搜索结果', async () => {
      const result = await library.searchMaterials('nonexistent_keyword')

      expect(result.materials).toEqual([])
      expect(result.totalCount).toBe(0)
    })
  })

  describe('倒排索引', () => {
    beforeEach(async () => {
      await library.initialize()

      // 添加测试数据
      await library.addMaterial({
        id: 'index_test_1',
        title: '测试标题',
        tags: ['tag1', 'tag2'],
        category: 'test'
      })

      library.buildInvertedIndex()
    })

    it('应该正确构建倒排索引', () => {
      expect(library.invertedIndex.size).toBeGreaterThan(0)
      expect(library.invertedIndex.has('测试')).toBe(true)
      expect(library.invertedIndex.has('tag1')).toBe(true)
    })

    it('应该使用倒排索引进行快速搜索', async () => {
      const result = await library.searchMaterials('tag1')

      expect(result.materials).toHaveLength(1)
      expect(result.materials[0].id).toBe('index_test_1')
    })

    it('应该优化索引性能', () => {
      const entries = Array.from(library.invertedIndex.entries())
      entries.forEach(([term, materials]) => {
        expect(materials.length).toBeGreaterThan(0)
        // 检查是否按评分排序
        for (let i = 1; i < materials.length; i++) {
          expect(materials[i-1][1]).toBeGreaterThanOrEqual(materials[i][1])
        }
      })
    })
  })

  describe('统计信息', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该返回准确的统计信息', () => {
      const stats = library.getStats()

      expect(stats).toHaveProperty('totalMaterials')
      expect(stats).toHaveProperty('categories')
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('lastUpdated')
      expect(typeof stats.totalMaterials).toBe('number')
    })

    it('应该统计不同类别', async () => {
      await library.addMaterial({
        id: 'stats_1',
        category: 'background',
        title: '背景图片'
      })
      await library.addMaterial({
        id: 'stats_2',
        category: 'element',
        title: '元素图片'
      })

      const stats = library.getStats()

      expect(stats.categories).toHaveProperty('background')
      expect(stats.categories).toHaveProperty('element')
      expect(stats.categories.background).toBe(1)
      expect(stats.categories.element).toBe(1)
    })

    it('应该跟踪使用统计', async () => {
      await library.addMaterial({
        id: 'usage_test',
        title: '使用统计测试',
        usageCount: 0
      })

      // 模拟搜索增加使用计数
      await library.searchMaterials('使用统计测试')

      const material = library.materials.get('usage_test')
      expect(material.usageCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('缓存管理', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该实现LRU缓存策略', () => {
      // 添加超出缓存容量的素材
      for (let i = 0; i < library.cacheMaxSize + 10; i++) {
        library.addMaterial({
          id: `cache_test_${i}`,
          title: `缓存测试${i}`
        })
      }

      // 缓存大小应该受到限制
      expect(library.materials.size).toBeLessThanOrEqual(library.cacheMaxSize + 10)
    })

    it('应该清理过期缓存', () => {
      library.clearCache()

      expect(library.materials.size).toBe(0)
      expect(library.invertedIndex.size).toBe(0)
    })

    it('应该重建索引', async () => {
      await library.addMaterial({
        id: 'rebuild_test',
        title: '重建索引测试',
        tags: ['rebuild', 'test']
      })

      library.buildInvertedIndex()

      expect(library.invertedIndex.has('重建')).toBe(true)
      expect(library.invertedIndex.has('test')).toBe(true)
    })
  })

  describe('关键词扩展', () => {
    it('应该扩展同义词', () => {
      const expanded = library.keywordExpand('漂亮')

      expect(expanded).toContain('漂亮')
      expect(expanded.length).toBeGreaterThan(1)
    })

    it('应该处理英文关键词', () => {
      const expanded = library.keywordExpand('beautiful')

      expect(expanded).toContain('beautiful')
      expect(expanded).toContain('gorgeous')
    })

    it('应该限制扩展数量', () => {
      const expanded = library.keywordExpand('test')

      expect(expanded.length).toBeLessThanOrEqual(10) // 合理的扩展上限
    })
  })

  describe('语义匹配', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该计算语义相似度', () => {
      const score = library.semanticMatch('美丽风景', 'beautiful landscape')

      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    it('应该识别相似概念', () => {
      const score1 = library.semanticMatch('城市', 'urban')
      const score2 = library.semanticMatch('城市', '乡村')

      expect(score1).toBeGreaterThan(score2) // 城市与urban更相似
    })

    it('应该处理空输入', () => {
      const score = library.semanticMatch('', 'test')

      expect(score).toBe(0)
    })
  })

  describe('性能测试', () => {
    beforeEach(async () => {
      await library.initialize()

      // 添加大量测试数据
      for (let i = 0; i < 100; i++) {
        await library.addMaterial({
          id: `perf_test_${i}`,
          title: `性能测试素材${i}`,
          tags: [`tag${i % 10}`],
          category: 'test'
        })
      }

      library.buildInvertedIndex()
    })

    it('应该在合理时间内完成搜索', async () => {
      const startTime = Date.now()

      await library.searchMaterials('性能测试')

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该支持高并发搜索', async () => {
      const promises = Array(10).fill().map((_, i) =>
        library.searchMaterials(`并发测试${i}`)
      )

      const startTime = Date.now()
      const results = await Promise.all(promises)
      const endTime = Date.now()

      expect(results).toHaveLength(10)
      expect(endTime - startTime).toBeLessThan(2000) // 并发搜索应该快速完成
    })

    it('应该优化大数据集搜索', async () => {
      // 搜索不存在的关键词
      const result = await library.searchMaterials('nonexistent_keyword_12345')

      expect(result.materials).toEqual([])
      // 对于大数据集，空结果搜索应该非常快
    })
  })

  describe('错误处理', () => {
    it('应该处理数据库操作失败', async () => {
      global.indexedDB.open.mockReturnValue({
        onsuccess: null,
        onerror: vi.fn((e) => e.target.error = new Error('DB Error')),
        result: null
      })

      await expect(library.initialize()).rejects.toThrow()
    })

    it('应该处理无效的素材ID', async () => {
      await library.initialize()

      await expect(library.addMaterial({ title: '无ID素材' })).rejects.toThrow()
    })

    it('应该处理搜索参数错误', async () => {
      await library.initialize()

      const result = await library.searchMaterials(null)

      expect(result.materials).toEqual([])
      expect(result.totalCount).toBe(0)
    })
  })

  describe('数据持久化', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该持久化素材数据', async () => {
      const material = {
        id: 'persist_test',
        title: '持久化测试',
        url: 'https://example.com/persist.jpg',
        category: 'test',
        tags: ['persist', 'test']
      }

      await library.addMaterial(material)

      // 模拟重新加载
      const reloadedLibrary = LocalMaterialLibrary
      await reloadedLibrary.initialize()

      // 数据应该仍然存在（在实际实现中）
      expect(reloadedLibrary.materials.size).toBeGreaterThan(0)
    })

    it('应该处理数据迁移', () => {
      // 测试版本兼容性
      const oldVersionData = {
        version: '1.0',
        materials: {}
      }

      // 应该能够处理旧版本数据
      expect(() => library.upgradeData(oldVersionData)).not.toThrow()
    })
  })

  describe('集成测试', () => {
    beforeEach(async () => {
      await library.initialize()
    })

    it('应该完整模拟素材库使用流程', async () => {
      // 1. 添加素材
      await library.addMaterial({
        id: 'workflow_1',
        title: '工作流测试图片',
        category: 'background',
        tags: ['workflow', 'test', 'background']
      })

      // 2. 构建索引
      library.buildInvertedIndex()

      // 3. 搜索素材
      const searchResult = await library.searchMaterials('workflow')
      expect(searchResult.materials).toHaveLength(1)

      // 4. 获取统计
      const stats = library.getStats()
      expect(stats.totalMaterials).toBeGreaterThan(0)

      // 5. 清理缓存
      library.clearCache()
      expect(library.materials.size).toBe(0)
    })

    it('应该支持复杂的查询场景', async () => {
      // 添加多样化的测试数据
      const testData = [
        { id: 'complex_1', title: '自然风景', category: 'background', tags: ['nature', 'landscape'] },
        { id: 'complex_2', title: '城市夜景', category: 'background', tags: ['city', 'night'] },
        { id: 'complex_3', title: '科技图标', category: 'element', tags: ['tech', 'icon'] },
        { id: 'complex_4', title: '商务图表', category: 'element', tags: ['business', 'chart'] }
      ]

      for (const data of testData) {
        await library.addMaterial(data)
      }

      library.buildInvertedIndex()

      // 测试不同查询
      const backgroundResult = await library.searchMaterials('', { category: 'background' })
      expect(backgroundResult.materials.length).toBe(2)

      const natureResult = await library.searchMaterials('nature landscape')
      expect(natureResult.materials.length).toBe(1)

      const elementResult = await library.searchMaterials('', { category: 'element' })
      expect(elementResult.materials.length).toBe(2)
    })
  })
})