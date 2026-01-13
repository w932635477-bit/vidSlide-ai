/**
 * VidSlide AI 大批量素材下载器
 * 目标：下载1500+张高质量素材
 * 策略：多线程并发 + 分批处理 + 智能重试
 */

import LocalMaterialLibrary from '../src/services/LocalMaterialLibrary.js'
import MaterialService from '../src/services/MaterialService.js'
import BaiduImageDownloader from '../src/services/BaiduImageDownloader.js'

class BulkMaterialDownloader {
  constructor() {
    this.targetCount = 1500
    this.currentCount = 0
    this.downloadedCount = 0
    this.failedCount = 0
    this.batchSize = 50 // 每批处理50个关键词
    this.concurrentLimit = 5 // 同时处理5个关键词
    this.imagesPerKeyword = 10 // 每个关键词下载10张图片
    this.retryLimit = 3 // 失败重试次数

    // 扩展关键词库 - 覆盖更多场景
    this.extendedKeywords = {
      // 商务办公类
      business: [
        '团队合作',
        '商务会议',
        '公司发展',
        '市场分析',
        '战略规划',
        '企业文化',
        '领导力',
        '创新科技',
        '客户服务',
        '绩效考核',
        '项目管理',
        '数据分析',
        '商业智能',
        '数字化转型',
        '创业创新',
        '企业管理',
        '组织架构',
        '人力资源',
        '财务管理',
        '供应链',
        '品牌建设',
        '市场营销',
        '销售策略',
        '客户关系',
        '竞争分析',
        '风险管理',
        '质量控制',
        '运营效率',
        '成本控制',
        '利润增长'
      ],

      // 教育培训类
      education: [
        '知识学习',
        '技能培训',
        '在线教育',
        '教学互动',
        '课程设计',
        '学生成长',
        '教师发展',
        '教育科技',
        '学习方法',
        '考试系统',
        '学术研究',
        '知识分享',
        '能力提升',
        '专业培训',
        '继续教育',
        '职业教育',
        '学历教育',
        '素质教育',
        '教育公平',
        '教学改革',
        '学习资源',
        '教学工具',
        '教育评价',
        '学生管理',
        '教学质量',
        '教育创新',
        '学习体验',
        '知识体系',
        '教育投资',
        '终身学习'
      ],

      // 科技产品类
      technology: [
        '人工智能',
        '大数据',
        '云计算',
        '物联网',
        '区块链',
        '移动应用',
        '用户体验',
        '产品设计',
        '技术创新',
        '研发团队',
        '软件开发',
        '系统架构',
        '网络安全',
        '数据挖掘',
        '机器学习',
        '深度学习',
        '计算机视觉',
        '自然语言处理',
        '智能硬件',
        '5G技术',
        '量子计算',
        '虚拟现实',
        '增强现实',
        '机器人技术',
        '自动化',
        '智能家居',
        '智慧城市',
        '工业互联网',
        '数字孪生',
        '边缘计算'
      ],

      // 生活方式类
      lifestyle: [
        '健康生活',
        '家庭和谐',
        '品质生活',
        '休闲娱乐',
        '运动健身',
        '美食文化',
        '旅游度假',
        '环境保护',
        '可持续发展',
        '生活品质',
        '家居生活',
        '时尚潮流',
        '美容护肤',
        '心理健康',
        '人际关系',
        '时间管理',
        '生活技能',
        '兴趣爱好',
        '文化艺术',
        '社交活动',
        '家庭教育',
        '亲子关系',
        '老年生活',
        '社区生活',
        '生活智慧'
      ],

      // 创意设计类
      creative: [
        '创意设计',
        '视觉艺术',
        '平面设计',
        'UI设计',
        'UX设计',
        '品牌设计',
        '包装设计',
        '插画设计',
        '摄影艺术',
        '视频制作',
        '动画设计',
        '3D建模',
        '色彩搭配',
        '字体设计',
        '图标设计',
        '海报设计',
        '宣传册',
        '网站设计',
        '移动端设计',
        '交互设计',
        '用户界面',
        '信息架构',
        '原型设计',
        '设计趋势',
        '创意灵感'
      ],

      // 营销推广类
      marketing: [
        '数字营销',
        '内容营销',
        '社交媒体',
        '搜索引擎优化',
        '付费广告',
        '品牌营销',
        '公关推广',
        '活动策划',
        '媒体传播',
        '客户获取',
        '转化率优化',
        '用户增长',
        '营销策略',
        '市场调研',
        '竞争情报',
        '品牌定位',
        '营销渠道',
        '广告创意',
        '推广效果',
        '营销预算',
        '营销工具',
        '数据驱动营销',
        '个性化营销',
        '全渠道营销',
        '营销自动化'
      ],

      // 医疗健康类
      healthcare: [
        '医疗健康',
        '疾病预防',
        '健康管理',
        '医疗科技',
        '远程医疗',
        '中医养生',
        '营养健康',
        '心理健康',
        '康复治疗',
        '医疗设备',
        '健康监测',
        '疫苗接种',
        '医疗保险',
        '健康教育',
        '慢病管理',
        '急诊急救',
        '医疗服务',
        '健康数据',
        '基因检测',
        '精准医疗',
        '医疗AI',
        '智慧医院',
        '健康生活方式',
        '养生之道',
        '医疗创新'
      ],

      // 金融理财类
      finance: [
        '金融理财',
        '投资理财',
        '股票投资',
        '基金投资',
        '债券投资',
        '保险规划',
        '税务筹划',
        '资产配置',
        '风险管理',
        '财务规划',
        '财富管理',
        '货币基金',
        '指数基金',
        '量化投资',
        '价值投资',
        '创业投资',
        '天使投资',
        '风险投资',
        '财务分析',
        '投资策略',
        '金融科技',
        '数字货币',
        '区块链金融',
        '互联网金融',
        '普惠金融'
      ],

      // 环保可持续发展类
      environment: [
        '环境保护',
        '可持续发展',
        '生态环保',
        '绿色能源',
        '碳中和',
        '气候变化',
        '环境保护',
        '生态系统',
        '生物多样性',
        '资源回收',
        '循环经济',
        '绿色建筑',
        '可持续交通',
        '清洁能源',
        '环境监测',
        '污染防治',
        '生态修复',
        '绿色生活',
        '环境教育',
        '可持续发展目标',
        '气候行动',
        '海洋保护',
        '森林保护',
        '野生动物保护',
        '生态旅游'
      ],

      // 文化艺术类
      culture: [
        '文化艺术',
        '传统文化',
        '现代艺术',
        '艺术创作',
        '艺术教育',
        '音乐艺术',
        '舞蹈艺术',
        '戏剧表演',
        '电影艺术',
        '美术展览',
        '文化遗产',
        '非物质文化遗产',
        '艺术收藏',
        '艺术市场',
        '艺术评论',
        '文化交流',
        '艺术创新',
        '数字艺术',
        '街头艺术',
        '当代艺术',
        '艺术史',
        '艺术理论',
        '艺术批评',
        '艺术教育',
        '艺术欣赏'
      ]
    }

    this.stats = {
      startTime: null,
      endTime: null,
      totalKeywords: 0,
      processedKeywords: 0,
      successfulDownloads: 0,
      failedDownloads: 0,
      averageTimePerKeyword: 0,
      estimatedTimeRemaining: 0
    }
  }

  async initialize() {
    console.log('🚀 初始化大批量素材下载器...')
    console.log(`🎯 目标下载: ${this.targetCount} 张素材`)
    console.log(`📊 关键词分类: ${Object.keys(this.extendedKeywords).length} 个`)
    console.log(`🔄 并发处理: ${this.concurrentLimit} 个关键词同时`)
    console.log(`📦 每关键词: ${this.imagesPerKeyword} 张图片`)
    console.log(`🔁 重试次数: ${this.retryLimit} 次`)

    // 计算总关键词数
    this.stats.totalKeywords = Object.values(this.extendedKeywords).reduce(
      (sum, keywords) => sum + keywords.length,
      0
    )
    console.log(`📈 总关键词数: ${this.stats.totalKeywords}`)

    await LocalMaterialLibrary.initialize()
    console.log('✅ 本地素材库初始化完成')
  }

  async startBulkDownload() {
    console.log('\n' + '='.repeat(60))
    console.log('🎬 开始大批量素材下载')
    console.log('='.repeat(60))

    this.stats.startTime = Date.now()

    try {
      // 按分类分批处理
      const categories = Object.keys(this.extendedKeywords)
      let globalProgress = 0

      for (const category of categories) {
        const keywords = this.extendedKeywords[category]
        console.log(`\n📂 处理分类: ${category} (${keywords.length}个关键词)`)

        // 分批处理关键词
        for (let i = 0; i < keywords.length; i += this.batchSize) {
          const batch = keywords.slice(i, i + this.batchSize)
          console.log(
            `\n🔄 处理第 ${Math.floor(i / this.batchSize) + 1} 批 (${batch.length}个关键词)`
          )

          // 并发处理批次内的关键词
          await this.processBatch(batch)

          globalProgress += batch.length
          this.updateProgress(globalProgress)
        }
      }

      this.stats.endTime = Date.now()
      this.printFinalReport()
    } catch (error) {
      console.error('❌ 大批量下载失败:', error)
      this.printErrorReport(error)
    }
  }

  async processBatch(keywords) {
    const promises = []
    const semaphore = new Semaphore(this.concurrentLimit)

    for (const keyword of keywords) {
      promises.push(
        semaphore.acquire().then(async release => {
          try {
            await this.processKeyword(keyword)
          } finally {
            release()
          }
        })
      )
    }

    await Promise.allSettled(promises)
  }

  async processKeyword(keyword) {
    const startTime = Date.now()

    for (let attempt = 1; attempt <= this.retryLimit; attempt++) {
      try {
        console.log(`📥 下载"${keyword}"相关素材 (尝试 ${attempt}/${this.retryLimit})`)

        // 使用MaterialService搜索并缓存素材
        const results = await this.searchAndCacheMaterial(keyword)

        if (results && results.success && results.materials && results.materials.length > 0) {
          const downloaded = results.materials.length
          this.downloadedCount += downloaded
          this.stats.successfulDownloads += downloaded
          this.stats.processedKeywords++

          const duration = (Date.now() - startTime) / 1000
          console.log(`✅ "${keyword}" 下载成功: ${downloaded}张素材 (${duration.toFixed(1)}s)`)

          // 检查是否达到目标
          if (this.downloadedCount >= this.targetCount) {
            console.log(`🎯 已达到目标下载量: ${this.downloadedCount}/${this.targetCount}`)
            return true
          }

          return true
        } else {
          throw new Error('搜索结果为空')
        }
      } catch (error) {
        console.warn(`⚠️ "${keyword}" 第${attempt}次尝试失败:`, error.message)

        if (attempt === this.retryLimit) {
          this.failedCount++
          this.stats.failedDownloads++
          console.error(`❌ "${keyword}" 下载失败，已重试${this.retryLimit}次`)
        } else {
          // 等待后重试
          await this.delay(1000 * attempt)
        }
      }
    }

    return false
  }

  async searchAndCacheMaterial(keyword) {
    try {
      // 导入MaterialService单例实例
      const { default: materialService } = await import('../src/services/MaterialService.js')

      // 搜索素材 - 强制从外部获取
      const results = await materialService.searchMaterials(keyword, {
        limit: this.imagesPerKeyword,
        forceExternal: true,
        source: 'baidu'
      })

      return results
    } catch (error) {
      console.error(`搜索"${keyword}"失败:`, error)
      return null
    }
  }

  updateProgress(processed) {
    const percentage = ((processed / this.stats.totalKeywords) * 100).toFixed(1)
    const elapsed = (Date.now() - this.stats.startTime) / 1000
    const avgTimePerKeyword = elapsed / processed
    const remaining = (this.stats.totalKeywords - processed) * avgTimePerKeyword

    console.log(`📊 总体进度: ${percentage}% (${processed}/${this.stats.totalKeywords})`)
    console.log(`⏱️ 已用时间: ${Math.floor(elapsed / 60)}分${Math.floor(elapsed % 60)}秒`)
    console.log(`🎯 下载素材: ${this.downloadedCount} 张`)
    console.log(`⏳ 预计剩余: ${Math.floor(remaining / 60)}分${Math.floor(remaining % 60)}秒`)

    this.stats.averageTimePerKeyword = avgTimePerKeyword
    this.stats.estimatedTimeRemaining = remaining
  }

  printFinalReport() {
    const totalTime = (this.stats.endTime - this.stats.startTime) / 1000
    const successRate = (
      (this.stats.successfulDownloads /
        (this.stats.successfulDownloads + this.stats.failedDownloads)) *
      100
    ).toFixed(1)

    console.log('\n' + '='.repeat(60))
    console.log('🎉 大批量素材下载完成报告')
    console.log('='.repeat(60))

    console.log('📊 下载统计:')
    console.log(`   • 目标数量: ${this.targetCount} 张`)
    console.log(`   • 实际下载: ${this.downloadedCount} 张`)
    console.log(`   • 成功率: ${successRate}%`)
    console.log(`   • 处理关键词: ${this.stats.processedKeywords}/${this.stats.totalKeywords}`)
    console.log(`   • 失败关键词: ${this.stats.failedDownloads}`)

    console.log('⏱️ 时间统计:')
    console.log(`   • 总耗时: ${Math.floor(totalTime / 60)}分${Math.floor(totalTime % 60)}秒`)
    console.log(`   • 平均每关键词: ${this.stats.averageTimePerKeyword.toFixed(1)}秒`)
    console.log(`   • 下载速度: ${((this.downloadedCount / totalTime) * 60).toFixed(1)} 张/分钟`)

    console.log('💾 存储统计:')
    const libraryStats = LocalMaterialLibrary.getStatistics()
    console.log(`   • 缓存素材: ${libraryStats.cachedMaterials || 0} 张`)
    console.log(`   • 缓存大小: ${((libraryStats.cacheSize || 0) / (1024 * 1024)).toFixed(2)} MB`)

    if (this.downloadedCount >= this.targetCount) {
      console.log('\n🎊 恭喜！成功达到下载目标！')
    } else {
      console.log(`\n⚠️ 未完全达到目标，还需下载 ${this.targetCount - this.downloadedCount} 张素材`)
    }

    console.log('='.repeat(60))
  }

  printErrorReport(error) {
    console.log('\n❌ 下载过程出现错误')
    console.log(`错误信息: ${error.message}`)
    console.log(`当前进度: ${this.downloadedCount}/${this.targetCount}`)
    console.log('建议: 检查网络连接或API配额')
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 信号量类 - 控制并发数量
class Semaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent
    this.currentConcurrent = 0
    this.waitQueue = []
  }

  async acquire() {
    return new Promise(resolve => {
      if (this.currentConcurrent < this.maxConcurrent) {
        this.currentConcurrent++
        resolve(this.release.bind(this))
      } else {
        this.waitQueue.push(resolve)
      }
    })
  }

  release() {
    this.currentConcurrent--
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()
      this.currentConcurrent++
      resolve(this.release.bind(this))
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const downloader = new BulkMaterialDownloader()
  downloader
    .initialize()
    .then(() => downloader.startBulkDownload())
    .catch(console.error)
}

export default BulkMaterialDownloader
