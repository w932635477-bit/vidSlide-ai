/**
 * 简单的翻译测试脚本
 */
import TranslationService from './src/services/utils/IntelligentDispatcher/TranslationService.js'
import materialService from './src/services/MaterialService.js'

async function testTranslation() {
  console.log('🧪 开始翻译功能测试...')

  try {
    // 初始化翻译服务
    const translationService = new TranslationService()
    await translationService.initialize()

    // 测试几个关键词
    const testKeywords = ['绿色能源', '人工智能', '团队合作', '数字营销', '用户界面']

    console.log('\n📝 测试关键词翻译:')
    for (const keyword of testKeywords) {
      try {
        const translated = await translationService.translate(keyword)
        console.log(`  "${keyword}" → "${translated}"`)
      } catch (error) {
        console.error(`  ❌ "${keyword}" 翻译失败:`, error.message)
      }
    }

    console.log('\n🔍 测试素材搜索 (带翻译):')
    await materialService.initialize()

    // 测试一个关键词的搜索
    const testKeyword = '绿色能源'
    console.log(`\n搜索关键词: "${testKeyword}"`)

    const results = await materialService.searchMaterials(testKeyword, {
      limit: 2,
      includeStats: true
    })

    if (results.success) {
      console.log(`✅ 搜索成功: ${results.materials.length} 个结果`)
      console.log('搜索统计:', results.searchStats)

      if (results.materials.length > 0) {
        console.log('第一个结果:', {
          title: results.materials[0].title,
          source: results.materials[0].source,
          id: results.materials[0].id
        })
      }
    } else {
      console.error('❌ 搜索失败:', results.error)
    }
  } catch (error) {
    console.error('💥 测试过程中出错:', error)
  }
}

// 运行测试
testTranslation()
