/**
 * VidSlide AI 素材获取器测试脚本
 * 测试自动素材获取功能
 */

import MaterialFetcher from './auto-material-fetcher.js'

async function testMaterialFetcher() {
  console.log('🧪 开始测试VidSlide AI素材获取器...\n')

  const fetcher = new MaterialFetcher()

  try {
    // 测试1: API连接测试
    console.log('1️⃣ 测试API连接...')

    // 测试Unsplash
    try {
      const unsplashResults = await fetcher.fetchFromUnsplash('test', 1)
      console.log(`✅ Unsplash API: ${unsplashResults.length} 个结果`)
    } catch (error) {
      console.log(`❌ Unsplash API: ${error.message}`)
    }

    // 测试Pexels
    try {
      const pexelsResults = await fetcher.fetchFromPexels('test', 1)
      console.log(`✅ Pexels API: ${pexelsResults.length} 个结果`)
    } catch (error) {
      console.log(`❌ Pexels API: ${error.message}`)
    }

    // 测试Pixabay
    try {
      const pixabayResults = await fetcher.fetchFromPixabay('test', 1)
      console.log(`✅ Pixabay API: ${pixabayResults.length} 个结果`)
    } catch (error) {
      console.log(`❌ Pixabay API: ${error.message}`)
    }

    // 测试2: 质量筛选测试
    console.log('\n2️⃣ 测试质量筛选...')

    const testMaterials = [
      { width: 1920, height: 1080, sourceUrl: 'test1' }, // 合格
      { width: 500, height: 500, sourceUrl: 'test2' }, // 尺寸太小
      { width: 10000, height: 100, sourceUrl: 'test3' }, // 比例异常
      { width: 800, height: 600, sourceUrl: 'test4' } // 合格
    ]

    const filtered = testMaterials.filter(material => fetcher.filterImage(material))
    console.log(`✅ 质量筛选: ${filtered.length}/${testMaterials.length} 个素材通过`)

    // 测试3: 小规模下载测试
    console.log('\n3️⃣ 测试小规模下载...')

    const downloaded = await fetcher.fetchCategoryMaterials(
      'icons',
      'technology',
      ['computer', 'software'],
      3 // 只下载3个测试
    )

    console.log(`✅ 小规模下载: ${downloaded} 个素材下载成功`)

    // 测试4: 元数据保存测试
    console.log('\n4️⃣ 测试元数据保存...')

    fetcher.saveMetadataFile()
    console.log('✅ 元数据保存测试完成')

    console.log('\n🎉 素材获取器测试完成！')
    console.log('💡 如需完整运行，请执行: npm run fetch-materials')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 启动测试脚本...')
  testMaterialFetcher().catch(error => {
    console.error('❌ 测试脚本执行失败:', error)
    process.exit(1)
  })
}

export default testMaterialFetcher
