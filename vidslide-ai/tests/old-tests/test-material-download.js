/**
 * VidSlide AI 素材下载测试脚本
 * 验证翻译和多平台下载功能
 */

import TranslationService from './src/services/utils/IntelligentDispatcher/TranslationService.js'
import materialService from './src/services/MaterialService.js'

async function testMaterialDownload() {
  console.log('🧪 开始素材下载功能测试...\n')

  try {
    // 初始化服务
    console.log('🔧 初始化翻译服务...')
    const translationService = new TranslationService()
    await translationService.initialize()

    console.log('🔧 初始化素材服务...')
    // MaterialService是单例，直接使用
    await materialService.initialize()

    console.log('✅ 服务初始化完成\n')

    // 测试关键词
    const testKeywords = [
      '绿色能源', // 环保类
      '人工智能', // 科技类
      '团队合作', // 商务类
      '创意设计' // 创意类
    ]

    console.log('📋 测试关键词列表:')
    testKeywords.forEach((keyword, index) => {
      console.log(`  ${index + 1}. ${keyword}`)
    })
    console.log()

    let totalDownloaded = 0
    let totalSuccess = 0

    // 测试每个关键词
    for (const keyword of testKeywords) {
      console.log(`🔍 测试关键词: "${keyword}"`)

      try {
        // 1. 测试翻译
        const translated = await translationService.translate(keyword)
        console.log(`  🌐 翻译结果: "${keyword}" → "${translated}"`)

        // 2. 测试素材搜索
        console.log('  📥 开始搜索素材...')
        const startTime = Date.now()

        const results = await materialService.searchMaterials(keyword, {
          limit: 3, // 每关键词3张，控制规模
          includeStats: true
        })

        const duration = Date.now() - startTime

        if (results.success && results.materials.length > 0) {
          console.log(`  ✅ 搜索成功 (${duration}ms)`)
          console.log(`    📊 找到 ${results.materials.length} 个素材`)
          console.log(`    🔗 来源: ${results.materials.map(m => m.source).join(', ')}`)

          // 统计信息
          if (results.searchStats) {
            console.log(`    📈 本地命中: ${results.searchStats.localHits}`)
            console.log(`    🌐 外部命中: ${results.searchStats.externalHits}`)
          }

          totalDownloaded += results.materials.length
          totalSuccess++

          // 显示前3个素材的标题
          results.materials.slice(0, 3).forEach((material, index) => {
            console.log(`    ${index + 1}. ${material.title || '无标题'} (${material.source})`)
          })
        } else {
          console.log(`  ❌ 搜索失败: ${results.error || '无可用素材'}`)
        }
      } catch (error) {
        console.log(`  💥 测试失败: ${error.message}`)
      }

      console.log() // 空行分隔
    }

    // 最终统计
    console.log('📊 测试结果统计:')
    console.log(`  🎯 测试关键词: ${testKeywords.length} 个`)
    console.log(`  ✅ 成功下载: ${totalSuccess} 个关键词`)
    console.log(`  📸 总素材数: ${totalDownloaded} 张`)
    console.log(`  📈 成功率: ${Math.round((totalSuccess / testKeywords.length) * 100)}%`)

    if (totalDownloaded > 0) {
      console.log('\n🎉 测试成功！翻译和多平台下载功能正常工作。')
      console.log('💡 建议: 可以开始正式的素材库构建了。')
    } else {
      console.log('\n⚠️ 测试发现问题，请检查网络连接或API配置。')
    }
  } catch (error) {
    console.error('💥 测试脚本执行失败:', error)
    process.exit(1)
  }
}

// 运行测试
testMaterialDownload().catch(console.error)
