/**
 * 精选素材配方库
 *
 * 核心理念：不存储素材文件，只存储"素材配方"（搜索策略）
 *
 * 优势：
 * - 零存储成本（< 50KB）
 * - 始终最新（每次从外部API获取）
 * - 易于维护（只需调整配方）
 * - 配合SmartCache实现离线可用
 */

export const materialRecipes = {
  // 科技类（10个配方）
  technology: [
    {
      id: 'tech-bg-001',
      name: '科技背景 - 蓝色电路',
      description: '适合科技、IT、创新主题的PPT背景',
      searchQuery: 'technology circuit board blue',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        color: 'blue',
        minWidth: 1920,
        minHeight: 1080
      },
      tags: ['科技', '背景', '蓝色', '电路', '现代'],
      useCases: ['PPT背景', '封面', '科技主题'],
      priority: 'high'
    },
    {
      id: 'tech-ai-001',
      name: 'AI人工智能',
      description: 'AI、机器学习、深度学习相关素材',
      searchQuery: 'artificial intelligence neural network',
      platforms: ['unsplash', 'pixabay'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['AI', '人工智能', '神经网络', '机器学习'],
      useCases: ['AI主题PPT', '技术演示'],
      priority: 'high'
    },
    {
      id: 'tech-code-001',
      name: '编程代码',
      description: '编程、代码、开发相关场景',
      searchQuery: 'programming code developer screen',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['编程', '代码', '开发', '程序员'],
      useCases: ['技术分享', '开发文档', '编程教程'],
      priority: 'medium'
    },
    {
      id: 'tech-network-001',
      name: '网络连接',
      description: '网络、连接、互联网相关',
      searchQuery: 'network connection internet digital',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['网络', '连接', '互联网', '数字化'],
      useCases: ['网络主题', '互联网PPT'],
      priority: 'medium'
    },
    {
      id: 'tech-data-001',
      name: '数据中心',
      description: '服务器、数据中心、云计算',
      searchQuery: 'data center server cloud computing',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['数据中心', '服务器', '云计算', '基础设施'],
      useCases: ['云计算PPT', '基础设施介绍'],
      priority: 'medium'
    }
  ],

  // 商务类（10个配方）
  business: [
    {
      id: 'biz-meeting-001',
      name: '商务会议',
      description: '团队会议、讨论、协作场景',
      searchQuery: 'business meeting team discussion',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['商务', '会议', '团队', '协作'],
      useCases: ['商务PPT', '团队介绍', '公司文化'],
      priority: 'high'
    },
    {
      id: 'biz-office-001',
      name: '现代办公室',
      description: '办公环境、工作空间',
      searchQuery: 'modern office workspace professional',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['办公室', '工作空间', '现代', '专业'],
      useCases: ['公司介绍', '办公环境展示'],
      priority: 'high'
    },
    {
      id: 'biz-handshake-001',
      name: '商务握手',
      description: '合作、协议、伙伴关系',
      searchQuery: 'business handshake partnership agreement',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['握手', '合作', '伙伴', '协议'],
      useCases: ['合作介绍', '商务合作PPT'],
      priority: 'medium'
    },
    {
      id: 'biz-presentation-001',
      name: '商务演示',
      description: '演讲、展示、汇报场景',
      searchQuery: 'business presentation speaker audience',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['演示', '演讲', '汇报', '展示'],
      useCases: ['演讲PPT', '汇报材料'],
      priority: 'medium'
    },
    {
      id: 'biz-growth-001',
      name: '业务增长',
      description: '增长、成功、上升趋势',
      searchQuery: 'business growth success chart upward',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['增长', '成功', '上升', '业绩'],
      useCases: ['业绩报告', '增长分析'],
      priority: 'high'
    }
  ],

  // 数据可视化（10个配方）
  dataVisualization: [
    {
      id: 'data-chart-001',
      name: '数据图表',
      description: '数据分析、图表、统计相关',
      searchQuery: 'data visualization chart analytics dashboard',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['数据', '图表', '分析', '统计'],
      useCases: ['数据报告', '分析PPT', '业绩展示'],
      priority: 'high'
    },
    {
      id: 'data-graph-001',
      name: '统计图形',
      description: '图形、曲线、趋势展示',
      searchQuery: 'statistics graph trend line chart',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['统计', '图形', '趋势', '曲线'],
      useCases: ['趋势分析', '统计报告'],
      priority: 'medium'
    },
    {
      id: 'data-dashboard-001',
      name: '数据仪表盘',
      description: '仪表盘、监控、实时数据',
      searchQuery: 'dashboard monitor real-time data screen',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['仪表盘', '监控', '实时', '数据'],
      useCases: ['监控展示', '实时数据PPT'],
      priority: 'medium'
    }
  ],

  // 背景纹理（10个配方）
  backgrounds: [
    {
      id: 'bg-minimal-001',
      name: '简约白色背景',
      description: '干净、简约、专业的白色背景',
      searchQuery: 'minimal white background clean simple',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        color: 'white',
        minWidth: 1920
      },
      tags: ['背景', '简约', '白色', '干净'],
      useCases: ['PPT背景', '通用背景'],
      priority: 'high'
    },
    {
      id: 'bg-gradient-001',
      name: '渐变背景',
      description: '现代渐变色背景',
      searchQuery: 'gradient background modern colorful',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1920
      },
      tags: ['背景', '渐变', '现代', '彩色'],
      useCases: ['PPT背景', '封面'],
      priority: 'high'
    },
    {
      id: 'bg-abstract-001',
      name: '抽象背景',
      description: '抽象艺术背景',
      searchQuery: 'abstract background art pattern',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1920
      },
      tags: ['背景', '抽象', '艺术', '图案'],
      useCases: ['创意PPT', '艺术主题'],
      priority: 'medium'
    },
    {
      id: 'bg-texture-001',
      name: '纹理背景',
      description: '纹理、材质背景',
      searchQuery: 'texture background material surface',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1920
      },
      tags: ['背景', '纹理', '材质', '表面'],
      useCases: ['PPT背景', '设计素材'],
      priority: 'medium'
    }
  ],

  // 教育类（5个配方）
  education: [
    {
      id: 'edu-classroom-001',
      name: '教室课堂',
      description: '教室、学习、教育场景',
      searchQuery: 'classroom education learning students',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['教育', '课堂', '学习', '学生'],
      useCases: ['教育PPT', '课程介绍'],
      priority: 'high'
    },
    {
      id: 'edu-books-001',
      name: '书籍学习',
      description: '书籍、阅读、知识',
      searchQuery: 'books reading knowledge library',
      platforms: ['unsplash', 'pexels'],
      filters: {
        orientation: 'landscape',
        minWidth: 1200
      },
      tags: ['书籍', '阅读', '知识', '图书馆'],
      useCases: ['教育PPT', '知识分享'],
      priority: 'medium'
    }
  ],

  // 应急素材（5个配方）
  emergency: [
    {
      id: 'placeholder-001',
      name: '占位图 - 抽象',
      description: '临时占位使用',
      searchQuery: 'abstract pattern minimal geometric',
      platforms: ['unsplash'],
      filters: {
        orientation: 'landscape',
        minWidth: 800
      },
      tags: ['占位', '抽象', '通用', '几何'],
      useCases: ['临时占位', '测试'],
      priority: 'low'
    },
    {
      id: 'placeholder-002',
      name: '占位图 - 纯色',
      description: '纯色背景占位',
      searchQuery: 'solid color background simple',
      platforms: ['unsplash'],
      filters: {
        orientation: 'landscape',
        minWidth: 800
      },
      tags: ['占位', '纯色', '简单'],
      useCases: ['临时占位', '测试'],
      priority: 'low'
    }
  ]
}

/**
 * 快速查找配方
 * @param {string} id - 配方ID
 * @returns {Object|null} 配方对象
 */
export function findRecipe(id) {
  for (const category of Object.values(materialRecipes)) {
    const recipe = category.find(r => r.id === id)
    if (recipe) return recipe
  }
  return null
}

/**
 * 按标签搜索配方
 * @param {Array<string>} tags - 标签数组
 * @returns {Array<Object>} 匹配的配方数组
 */
export function searchRecipes(tags) {
  const results = []
  for (const category of Object.values(materialRecipes)) {
    for (const recipe of category) {
      if (tags.some(tag => recipe.tags.includes(tag))) {
        results.push(recipe)
      }
    }
  }
  return results
}

/**
 * 按关键词搜索配方
 * @param {string} keyword - 搜索关键词
 * @returns {Array<Object>} 匹配的配方数组
 */
export function searchRecipesByKeyword(keyword) {
  const results = []
  const lowerKeyword = keyword.toLowerCase()

  for (const [categoryName, recipes] of Object.entries(materialRecipes)) {
    for (const recipe of recipes) {
      // 搜索名称、描述、标签
      const matchName = recipe.name.toLowerCase().includes(lowerKeyword)
      const matchDesc = recipe.description.toLowerCase().includes(lowerKeyword)
      const matchTags = recipe.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
      const matchQuery = recipe.searchQuery.toLowerCase().includes(lowerKeyword)

      if (matchName || matchDesc || matchTags || matchQuery) {
        results.push({
          ...recipe,
          category: categoryName
        })
      }
    }
  }

  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  results.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return results
}

/**
 * 获取推荐配方
 * @param {Object} context - 上下文信息
 * @param {string} context.type - 素材类型
 * @param {string} context.scene - 使用场景
 * @param {Array<string>} context.keywords - 关键词数组
 * @returns {Array<Object>} 推荐的配方数组
 */
export function getRecommendedRecipes(context) {
  const { type, scene, keywords = [] } = context

  // 简单的推荐逻辑
  let category = 'technology'

  // 根据关键词判断类别
  const keywordStr = keywords.join(' ').toLowerCase()

  if (
    keywordStr.includes('商务') ||
    keywordStr.includes('business') ||
    keywordStr.includes('会议')
  ) {
    category = 'business'
  } else if (
    keywordStr.includes('数据') ||
    keywordStr.includes('data') ||
    keywordStr.includes('图表')
  ) {
    category = 'dataVisualization'
  } else if (
    keywordStr.includes('教育') ||
    keywordStr.includes('education') ||
    keywordStr.includes('学习')
  ) {
    category = 'education'
  } else if (keywordStr.includes('背景') || keywordStr.includes('background')) {
    category = 'backgrounds'
  } else if (
    keywordStr.includes('科技') ||
    keywordStr.includes('technology') ||
    keywordStr.includes('ai')
  ) {
    category = 'technology'
  }

  // 返回该类别的配方
  const recipes = materialRecipes[category] || []

  // 如果该类别配方不足，添加背景类配方
  if (recipes.length < 5) {
    return [...recipes, ...materialRecipes.backgrounds.slice(0, 5 - recipes.length)]
  }

  return recipes
}

/**
 * 获取所有配方（按类别）
 * @returns {Object} 所有配方
 */
export function getAllRecipes() {
  return materialRecipes
}

/**
 * 获取配方统计信息
 * @returns {Object} 统计信息
 */
export function getRecipeStats() {
  let total = 0
  const categoryStats = {}

  for (const [category, recipes] of Object.entries(materialRecipes)) {
    categoryStats[category] = recipes.length
    total += recipes.length
  }

  return {
    total,
    categories: Object.keys(materialRecipes).length,
    breakdown: categoryStats
  }
}
