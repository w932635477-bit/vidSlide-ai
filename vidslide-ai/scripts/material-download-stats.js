/**
 * VidSlide AI 本地素材库下载统计工具
 * 准确统计已下载的素材数量和状态
 */

import LocalMaterialLibrary from '../src/services/LocalMaterialLibrary.js'

class MaterialDownloadStats {
  constructor() {
    this.stats = {
      totalMaterials: 0,
      externalMaterials: 0,
      localMaterials: 0,
      bySource: {},
      byCategory: {},
      downloadedKeywords: [],
      downloadProgress: 0
    }
  }

  async initialize() {
    console.log('🔍 初始化素材统计工具...')
    await LocalMaterialLibrary.initialize()
    console.log('✅ 素材库初始化完成')
  }

  async getDetailedStats() {
    console.log('📊 开始统计素材详情...')

    const libraryStats = LocalMaterialLibrary.getStatistics()
    console.log('📈 基础统计:', libraryStats)

    // 获取所有素材进行详细分析
    const allMaterials = LocalMaterialLibrary.getAllMaterials()

    this.stats.totalMaterials = allMaterials.length

    console.log(`\n🎯 总素材数量: ${this.stats.totalMaterials}`)

    // 按来源统计
    allMaterials.forEach(material => {
      const source = material.source || 'local'

      if (!this.stats.bySource[source]) {
        this.stats.bySource[source] = 0
      }
      this.stats.bySource[source]++

      if (source !== 'local') {
        this.stats.externalMaterials++
      } else {
        this.stats.localMaterials++
      }

      // 按分类统计
      const category = material.category || 'unknown'
      if (!this.stats.byCategory[category]) {
        this.stats.byCategory[category] = 0
      }
      this.stats.byCategory[category]++
    })

    return this.stats
  }

  async analyzeDownloadProgress() {
    console.log('\n📋 分析下载进度...')

    const popularKeywords = [
      '团队合作',
      '商务会议',
      '公司发展',
      '市场分析',
      '战略规划',
      '知识学习',
      '技能培训',
      '在线教育',
      '教学互动',
      '课程设计',
      '人工智能',
      '大数据',
      '云计算',
      '物联网',
      '区块链',
      '健康生活',
      '家庭和谐',
      '品质生活',
      '休闲娱乐',
      '运动健身',
      '成功',
      '目标',
      '挑战',
      '机遇',
      '改变'
    ]

    const downloadedKeywords = []
    let totalExpectedMaterials = 0

    for (const keyword of popularKeywords) {
      const searchResults = LocalMaterialLibrary.searchMaterials(keyword, { limit: 100 })
      const externalCount = searchResults.filter(m => m.source !== 'local').length

      if (externalCount > 0) {
        downloadedKeywords.push({
          keyword,
          externalMaterials: externalCount,
          totalMaterials: searchResults.length
        })
        totalExpectedMaterials += externalCount
      }
    }

    this.stats.downloadedKeywords = downloadedKeywords
    this.stats.expectedTotalDownloads = totalExpectedMaterials

    return downloadedKeywords
  }

  printReport() {
    console.log('\n' + '='.repeat(60))
    console.log('🎨 VidSlide AI 本地素材库下载统计报告')
    console.log('='.repeat(60))

    console.log('\n📊 总体统计:')
    console.log(`   • 总素材数量: ${this.stats.totalMaterials}`)
    console.log(`   • 外部素材: ${this.stats.externalMaterials}`)
    console.log(`   • 本地素材: ${this.stats.localMaterials}`)
    console.log(`   • 预期下载总数: ${this.stats.expectedTotalDownloads || '未知'}`)

    console.log('\n🔍 按来源分布:')
    Object.entries(this.stats.bySource).forEach(([source, count]) => {
      console.log(`   • ${source}: ${count} 张`)
    })

    console.log('\n📂 按分类分布:')
    Object.entries(this.stats.byCategory).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} 张`)
    })

    if (this.stats.downloadedKeywords.length > 0) {
      console.log('\n✅ 已下载关键词统计:')
      this.stats.downloadedKeywords.forEach(item => {
        console.log(
          `   • "${item.keyword}": ${item.externalMaterials} 张外部素材 (${item.totalMaterials} 张总计)`
        )
      })
    }

    const actualDownloads = this.stats.externalMaterials
    const expectedDownloads = this.stats.expectedTotalDownloads || 0

    console.log('\n🎯 下载完成度:')
    console.log(`   • 实际下载: ${actualDownloads} 张`)
    console.log(`   • 预期下载: ${expectedDownloads} 张`)
    console.log(
      `   • 完成率: ${expectedDownloads > 0 ? ((actualDownloads / expectedDownloads) * 100).toFixed(1) : 'N/A'}%`
    )

    console.log('\n' + '='.repeat(60))

    if (actualDownloads >= 50) {
      console.log('🎉 恭喜！素材库下载成功，已有足够素材供使用')
    } else if (actualDownloads > 0) {
      console.log('⚡ 素材下载中，请继续等待...')
    } else {
      console.log('❌ 未检测到下载的素材，可能下载过程出现问题')
    }
  }

  async run() {
    try {
      await this.initialize()
      await this.getDetailedStats()
      await this.analyzeDownloadProgress()
      this.printReport()
    } catch (error) {
      console.error('❌ 统计分析失败:', error)
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const stats = new MaterialDownloadStats()
  stats.run()
}

export default MaterialDownloadStats
