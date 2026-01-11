/**
 * VidSlide AI 本地素材库服务
 * 实现零成本的本地优先素材策略
 */

class LocalMaterialLibrary {
  constructor() {
    this.dbName = 'VidSlideMaterials'
    this.dbVersion = 2
    this.db = null
    this.materials = new Map()
    this.synonymDictionary = this.buildSynonymDictionary()
    this.invertedIndex = new Map() // 倒排索引: term -> [materialId, score]
    this.materialTerms = new Map() // materialId -> [terms]
    this.isInitialized = false
  }

  /**
   * 初始化素材库
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      await this.openDatabase()
      await this.loadMaterials()
      await this.buildInvertedIndex()
      this.isInitialized = true
      console.log('🎨 本地素材库初始化完成')
    } catch (error) {
      console.error('❌ 本地素材库初始化失败:', error)
      throw error
    }
  }

  /**
   * 打开IndexedDB数据库
   */
  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = event.target.result

        // 素材存储
        if (!db.objectStoreNames.contains('materials')) {
          const materialStore = db.createObjectStore('materials', { keyPath: 'id' })
          materialStore.createIndex('category', 'category', { unique: false })
          materialStore.createIndex('subcategory', 'subcategory', { unique: false })
          materialStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
          materialStore.createIndex('usageCount', 'usageCount', { unique: false })
        }

        // 搜索索引存储
        if (!db.objectStoreNames.contains('searchIndex')) {
          const indexStore = db.createObjectStore('searchIndex', { keyPath: 'term' })
          indexStore.createIndex('materials', 'materialIds', { unique: false, multiEntry: true })
        }

        // 元数据存储
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * 加载所有素材
   */
  async loadMaterials() {
    const materials = await this.getAllMaterials()

    if (materials.length === 0) {
      // 首次运行，加载预置素材
      await this.loadPresetMaterials()
    } else {
      // 加载现有素材到内存
      materials.forEach(material => {
        this.materials.set(material.id, material)
      })
    }

    console.log(`📚 已加载 ${this.materials.size} 个本地素材`)
  }

  /**
   * 加载预置素材数据
   */
  async loadPresetMaterials() {
    const presetMaterials = this.generatePresetMaterials()
    const batchSize = 50

    for (let i = 0; i < presetMaterials.length; i += batchSize) {
      const batch = presetMaterials.slice(i, i + batchSize)
      await this.addMaterialsBatch(batch)
    }

    console.log(`✨ 已加载 ${presetMaterials.length} 个预置素材`)
  }

  /**
   * 生成预置素材数据
   */
  generatePresetMaterials() {
    const materials = []

    // 图标素材 (开源图标库)
    const iconCategories = {
      feather: [
        'home',
        'user',
        'settings',
        'search',
        'heart',
        'star',
        'check',
        'x',
        'plus',
        'minus'
      ],
      hero: ['academic-cap', 'adjustments', 'annotation', 'archive', 'arrow-circle-down'],
      lucide: ['activity', 'airplay', 'alarm-clock', 'align-center', 'align-justify']
    }

    Object.entries(iconCategories).forEach(([library, icons]) => {
      icons.forEach(icon => {
        materials.push({
          id: `${library}-${icon}`,
          category: 'icons',
          subcategory: library,
          name: icon,
          type: 'svg',
          tags: [icon, library],
          keywords: [icon, library, '图标'],
          dataUrl: this.generateIconDataUrl(icon, library),
          thumbnailUrl: this.generateIconDataUrl(icon, library),
          dimensions: { width: 24, height: 24 },
          usageCount: 0,
          lastUsed: null,
          createdAt: Date.now()
        })
      })
    })

    // 图表素材
    const chartTypes = ['bar', 'line', 'pie', 'area', 'scatter']
    chartTypes.forEach(type => {
      materials.push({
        id: `chart-${type}`,
        category: 'charts',
        subcategory: 'basic',
        name: `${type} chart`,
        type: 'svg',
        tags: [type, 'chart', '图表'],
        keywords: [type, 'chart', '图表', '数据', '统计'],
        dataUrl: this.generateChartDataUrl(type),
        thumbnailUrl: this.generateChartDataUrl(type),
        dimensions: { width: 200, height: 150 },
        usageCount: 0,
        lastUsed: null,
        createdAt: Date.now()
      })
    })

    // 几何形状
    const shapes = ['circle', 'square', 'triangle', 'star', 'hexagon']
    shapes.forEach(shape => {
      materials.push({
        id: `shape-${shape}`,
        category: 'decorative',
        subcategory: 'shapes',
        name: shape,
        type: 'svg',
        tags: [shape, 'shape', '形状'],
        keywords: [shape, '形状', '几何', '图形'],
        dataUrl: this.generateShapeDataUrl(shape),
        thumbnailUrl: this.generateShapeDataUrl(shape),
        dimensions: { width: 100, height: 100 },
        usageCount: 0,
        lastUsed: null,
        createdAt: Date.now()
      })
    })

    // 颜色块
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    colors.forEach(color => {
      materials.push({
        id: `color-${color}`,
        category: 'decorative',
        subcategory: 'colors',
        name: color,
        type: 'svg',
        tags: [color, 'color', '颜色'],
        keywords: [color, '颜色', '色彩'],
        dataUrl: this.generateColorDataUrl(color),
        thumbnailUrl: this.generateColorDataUrl(color),
        dimensions: { width: 100, height: 100 },
        usageCount: 0,
        lastUsed: null,
        createdAt: Date.now()
      })
    })

    // 数字和符号
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    const symbols = ['+', '-', '×', '÷', '=', '>', '<', '?', '!']

    ;[...numbers, ...symbols].forEach(symbol => {
      materials.push({
        id: `symbol-${symbol}`,
        category: 'education',
        subcategory: 'symbols',
        name: symbol,
        type: 'svg',
        tags: [symbol, 'symbol', '符号'],
        keywords: [symbol, '符号', '数学', '数字'],
        dataUrl: this.generateSymbolDataUrl(symbol),
        thumbnailUrl: this.generateSymbolDataUrl(symbol),
        dimensions: { width: 60, height: 80 },
        usageCount: 0,
        lastUsed: null,
        createdAt: Date.now()
      })
    })

    return materials
  }

  /**
   * 生成图标的Data URL (简化实现)
   */
  generateIconDataUrl(_icon, _library) {
    // 这里应该是实际的SVG数据
    // 为了演示，我们生成简单的占位符
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>'
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * 生成图表的Data URL
   */
  generateChartDataUrl(type) {
    // 简化的图表SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">${type} chart</text></svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * 生成形状的Data URL
   */
  generateShapeDataUrl(shape) {
    let svg = ''
    switch (shape) {
      case 'circle':
        svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#4A90E2"/></svg>'
        break
      case 'square':
        svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="80" height="80" x="10" y="10" fill="#7ED321"/></svg>'
        break
      case 'triangle':
        svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#F5A623"/></svg>'
        break
      case 'star':
        svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><polygon points="50,10 61,35 88,35 69,57 78,82 50,69 22,82 31,57 12,35 39,35" fill="#D0021B"/></svg>'
        break
      default:
        svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="80" height="80" x="10" y="10" fill="#9B9B9B"/></svg>'
    }
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * 生成颜色的Data URL
   */
  generateColorDataUrl(color) {
    const colorMap = {
      red: '#FF6B6B',
      blue: '#4A90E2',
      green: '#7ED321',
      yellow: '#F5A623',
      purple: '#9013FE',
      orange: '#FF9500'
    }
    const hexColor = colorMap[color] || '#9B9B9B'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${hexColor}"/></svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * 生成符号的Data URL
   */
  generateSymbolDataUrl(symbol) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80"><text x="30" y="50" text-anchor="middle" font-family="Arial" font-size="36" fill="#333">${symbol}</text></svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * 构建同义词词典
   */
  buildSynonymDictionary() {
    return {
      // 商业关键词
      增长: ['上涨', '增加', '提升', '发展', '进步'],
      销售: ['营销', '推广', '市场', '客户', '业绩'],
      利润: ['收益', '收入', '回报', '盈利', '获利'],
      成本: ['费用', '开支', '支出', '花费'],

      // 科技关键词
      创新: ['创造', '突破', '变革', '技术', '研发'],
      数字: ['数字化', '在线', '网络', '互联网', '智能'],
      效率: ['效能', '生产力', '优化', '改进', '提升'],
      数据: ['信息', '资料', '统计', '分析'],

      // 教育关键词
      学习: ['教育', '培训', '知识', '技能', '能力'],
      学生: ['学员', '学者', '学习者', '受教育者'],
      教师: ['老师', '导师', '教员', '教育工作者'],
      课程: ['科目', '学科', '教程', '教学内容'],

      // 生活关键词
      健康: ['保健', '养生', '医疗', '疾病', '治疗'],
      运动: ['体育', '健身', '锻炼', '活动'],
      美食: ['食物', '菜肴', '烹饪', '饮食'],
      旅行: ['旅游', '出行', '度假', '出游'],

      // 通用关键词
      好: ['优秀', '优质', '良好', '出色', '卓越'],
      快: ['快速', '迅速', '高效', '敏捷', '即时'],
      多: ['众多', '大量', '丰富', '充足'],
      新: ['最新', '新型', '创新', '现代'],

      // 形状关键词
      圆形: ['圆圈', '圆', '球形', '环形'],
      方形: ['正方形', '矩形', '四边形', '方块'],
      三角形: ['三角', '三边形'],
      星形: ['星星', '星号', '五角星'],

      // 颜色关键词
      红色: ['红', '朱红', '鲜红', '大红'],
      蓝色: ['蓝', '湛蓝', '天蓝', '深蓝'],
      绿色: ['绿', '翠绿', '墨绿', '浅绿'],
      黄色: ['黄', '金黄', '明黄', '淡黄'],
      黑色: ['黑', '乌黑', '深黑'],
      白色: ['白', '雪白', '纯白']
    }
  }

  /**
   * 扩展关键词
   */
  expandKeywords(keywords) {
    const expanded = new Set()

    keywords.forEach(keyword => {
      // 添加原始关键词
      expanded.add(keyword.toLowerCase())

      // 添加同义词
      const synonyms = this.synonymDictionary[keyword] || []
      synonyms.forEach(synonym => expanded.add(synonym.toLowerCase()))

      // 添加部分匹配
      if (keyword.length > 2) {
        Object.entries(this.synonymDictionary).forEach(([key, values]) => {
          if (key.includes(keyword) || keyword.includes(key)) {
            expanded.add(key.toLowerCase())
            values.forEach(value => expanded.add(value.toLowerCase()))
          }
        })
      }
    })

    return Array.from(expanded)
  }

  /**
   * 构建倒排索引
   */
  async buildInvertedIndex() {
    this.invertedIndex.clear()
    this.materialTerms.clear()

    for (const [id, material] of this.materials) {
      const terms = await this.extractTerms(material)
      this.materialTerms.set(id, terms)

      terms.forEach(term => {
        if (!this.invertedIndex.has(term)) {
          this.invertedIndex.set(term, [])
        }

        const score = this.calculateRelevanceScore(term, material)
        this.invertedIndex.get(term).push([id, score])
      })
    }

    // 排序优化查询性能
    for (const [term, entries] of this.invertedIndex) {
      entries.sort((a, b) => b[1] - a[1]) // 按评分降序
    }

    console.log(`🔍 已构建倒排索引，包含 ${this.invertedIndex.size} 个搜索词`)
  }

  /**
   * 提取素材的搜索词
   */
  async extractTerms(material) {
    const terms = new Set()

    // 添加基本信息
    ;[material.name, material.category, material.subcategory].filter(Boolean).forEach(text => {
      text.split(/[\s\-_]/).forEach(word => {
        if (word.length > 1) terms.add(word.toLowerCase())
      })
    })

    // 添加标签
    material.tags?.forEach(tag => {
      tag.split(/[\s\-_]/).forEach(word => {
        if (word.length > 1) terms.add(word.toLowerCase())
      })
    })

    // 添加关键词
    material.keywords?.forEach(keyword => {
      keyword.split(/[\s\-_]/).forEach(word => {
        if (word.length > 1) terms.add(word.toLowerCase())
      })
    })

    return Array.from(terms)
  }

  /**
   * 计算相关度评分
   */
  calculateRelevanceScore(term, material) {
    let score = 0

    // 名称匹配 (最高权重)
    if (material.name?.toLowerCase().includes(term)) {
      score += 1.0
    }

    // 关键词匹配
    if (material.keywords?.some(k => k.toLowerCase().includes(term))) {
      score += 0.8
    }

    // 标签匹配
    if (material.tags?.some(t => t.toLowerCase().includes(term))) {
      score += 0.6
    }

    // 分类匹配
    if (
      material.category?.toLowerCase().includes(term) ||
      material.subcategory?.toLowerCase().includes(term)
    ) {
      score += 0.4
    }

    // 使用频率加成
    if (material.usageCount > 0) {
      score += Math.min(material.usageCount / 100, 0.2)
    }

    // 最近使用加成
    if (material.lastUsed) {
      const daysSinceUsed = (Date.now() - material.lastUsed) / (1000 * 60 * 60 * 24)
      if (daysSinceUsed < 7) {
        score += 0.1
      } else if (daysSinceUsed < 30) {
        score += 0.05
      }
    }

    return score
  }

  /**
   * 智能搜索素材
   */
  async searchMaterials(query, options = {}) {
    const { limit = 20, minScore = 0.1, category = null, context: _context = {} } = options

    if (!query || query.trim().length === 0) {
      return { materials: [], totalCount: 0, fromCache: false }
    }

    // 扩展关键词
    const keywords = query.split(/[\s,，]+/).filter(k => k.length > 0)
    const expandedKeywords = this.expandKeywords(keywords)

    console.log(`🔍 搜索关键词: "${query}" -> 扩展为: [${expandedKeywords.join(', ')}]`)

    // 搜索匹配的素材
    const materialScores = new Map()

    for (const keyword of expandedKeywords) {
      if (!this.invertedIndex.has(keyword)) continue

      const entries = this.invertedIndex.get(keyword)
      for (const [materialId, score] of entries) {
        if (category && this.materials.get(materialId)?.category !== category) {
          continue // 分类过滤
        }

        const currentScore = materialScores.get(materialId) || 0
        materialScores.set(materialId, currentScore + score)
      }
    }

    // 转换为结果数组
    const results = Array.from(materialScores.entries())
      .filter(([, score]) => score >= minScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, score]) => ({
        ...this.materials.get(id),
        relevanceScore: score,
        matchReason: this.getMatchReason(id, expandedKeywords)
      }))

    console.log(`📊 搜索完成，找到 ${results.length} 个匹配素材`)

    return {
      materials: results,
      totalCount: results.length,
      expandedKeywords,
      fromCache: false
    }
  }

  /**
   * 获取匹配原因
   */
  getMatchReason(materialId, keywords) {
    const material = this.materials.get(materialId)
    if (!material) return '未知'

    const reasons = []

    keywords.forEach(keyword => {
      if (material.name?.toLowerCase().includes(keyword)) {
        reasons.push(`名称匹配: ${material.name}`)
      }
      if (material.keywords?.some(k => k.toLowerCase().includes(keyword))) {
        reasons.push(`关键词匹配: ${keyword}`)
      }
      if (material.tags?.some(t => t.toLowerCase().includes(keyword))) {
        reasons.push(`标签匹配: ${keyword}`)
      }
    })

    return reasons.length > 0 ? reasons[0] : '扩展匹配'
  }

  /**
   * 记录素材使用
   */
  async recordUsage(materialId) {
    const material = this.materials.get(materialId)
    if (!material) return

    material.usageCount++
    material.lastUsed = Date.now()

    await this.updateMaterial(material)
  }

  /**
   * 获取热门素材
   */
  async getPopularMaterials(limit = 10) {
    const materials = Array.from(this.materials.values())
      .filter(m => m.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)

    return materials
  }

  /**
   * 获取最近使用的素材
   */
  async getRecentMaterials(limit = 10) {
    const materials = Array.from(this.materials.values())
      .filter(m => m.lastUsed)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit)

    return materials
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    const stats = {
      totalMaterials: this.materials.size,
      categoryBreakdown: {},
      usageStats: {
        totalUsage: 0,
        mostUsed: null,
        recentlyUsed: null
      },
      searchIndex: {
        totalTerms: this.invertedIndex.size,
        avgTermsPerMaterial: 0
      }
    }

    // 分类统计
    for (const material of this.materials.values()) {
      const category = material.category
      stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1

      stats.usageStats.totalUsage += material.usageCount || 0

      if (
        !stats.usageStats.mostUsed ||
        material.usageCount > stats.usageStats.mostUsed.usageCount
      ) {
        stats.usageStats.mostUsed = material
      }

      if (
        !stats.usageStats.recentlyUsed ||
        (material.lastUsed &&
          (!stats.usageStats.recentlyUsed.lastUsed ||
            material.lastUsed > stats.usageStats.recentlyUsed.lastUsed))
      ) {
        stats.usageStats.recentlyUsed = material
      }
    }

    // 搜索索引统计
    if (this.materials.size > 0) {
      const totalTerms = Array.from(this.materialTerms.values()).reduce(
        (sum, terms) => sum + terms.length,
        0
      )
      stats.searchIndex.avgTermsPerMaterial = totalTerms / this.materials.size
    }

    return stats
  }

  // 数据库操作方法
  async getAllMaterials() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['materials'], 'readonly')
      const store = transaction.objectStore('materials')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addMaterialsBatch(materials) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['materials'], 'readwrite')
      const store = transaction.objectStore('materials')

      let completed = 0
      const total = materials.length

      materials.forEach(material => {
        const request = store.add(material)
        request.onsuccess = () => {
          this.materials.set(material.id, material)
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async updateMaterial(material) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['materials'], 'readwrite')
      const store = transaction.objectStore('materials')
      const request = store.put(material)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// 导出单例实例
export default new LocalMaterialLibrary()
