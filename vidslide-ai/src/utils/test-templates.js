/**
 * 模板加载测试脚本
 * 验证所有25个模板是否正常加载
 */

import TemplateArchitecture from './TemplateArchitecture.js'

async function testTemplates() {
  console.log('🧪 开始测试模板架构...\n')

  // 初始化
  await TemplateArchitecture.initialize()

  // 获取所有模板
  const allTemplates = TemplateArchitecture.getAllTemplates()
  console.log(`✅ 成功加载 ${allTemplates.length} 个模板\n`)

  // 验证模板数量
  if (allTemplates.length !== 25) {
    console.error(`❌ 错误：期望25个模板，实际加载了 ${allTemplates.length} 个`)
    process.exit(1)
  }

  // 按类别统计
  const stats = TemplateArchitecture.getStatistics()
  console.log('📊 模板统计:')
  console.log(`   总数: ${stats.totalTemplates}`)
  console.log(`   按类别:`)
  for (const [category, count] of Object.entries(stats.templatesByCategory)) {
    console.log(`     - ${category}: ${count}`)
  }
  console.log(`   按层级类型:`)
  for (const [type, count] of Object.entries(stats.layersByType)) {
    console.log(`     - ${type}: ${count}`)
  }

  // 测试每个模板
  console.log('\n🔍 验证每个模板:')
  const expectedTemplates = [
    // 基础模板 (12个)
    'picture-in-picture', 'info-card', 'keyword-highlight', 'timeline',
    'split-screen', 'dialog-popup', 'chart-analysis', 'document-display',
    'minimalist', 'speaker-focus', 'educational', 'product-showcase',
    // 短视频模板 (8个)
    'douyin-marketing', 'traffic-acquisition', 'ad-performance', 'personal-ip',
    'fan-engagement', 'knowledge-sharing', 'comparison-review', 'data-storytelling',
    // PPT模板 (5个)
    'ppt-title-slide', 'ppt-bullet-points', 'ppt-big-number', 'ppt-comparison', 'ppt-quote'
  ]

  let successCount = 0
  let failCount = 0

  for (const templateId of expectedTemplates) {
    const template = TemplateArchitecture.getTemplate(templateId)
    if (template) {
      console.log(`   ✅ ${templateId}`)
      successCount++
    } else {
      console.log(`   ❌ ${templateId} - 未找到`)
      failCount++
    }
  }

  console.log(`\n📈 测试结果: ${successCount} 成功, ${failCount} 失败`)

  // 测试模板推荐功能
  console.log('\n🎯 测试模板推荐:')
  const recommendations = TemplateArchitecture.recommendTemplates({
    keywords: ['演讲', '数据'],
    textDensity: 0.5,
    dataMentions: 0.4,
    hasVideo: true
  })
  console.log(`   推荐了 ${recommendations.length} 个模板:`)
  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.template.name} (评分: ${rec.score})`)
    console.log(`      原因: ${rec.reason}`)
  })

  // 测试模板实例创建
  console.log('\n🏗️  测试模板实例创建:')
  try {
    const instance = TemplateArchitecture.createTemplateInstance('picture-in-picture', {
      theme: { primaryColor: '#FF0000' }
    })
    console.log(`   ✅ 成功创建实例: ${instance.instanceId}`)
  } catch (error) {
    console.log(`   ❌ 创建实例失败: ${error.message}`)
  }

  console.log('\n✨ 所有测试完成！')

  if (failCount === 0 && allTemplates.length === 25) {
    console.log('🎉 模板架构重构成功！')
    process.exit(0)
  } else {
    console.log('⚠️  存在问题，请检查')
    process.exit(1)
  }
}

testTemplates().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
})
