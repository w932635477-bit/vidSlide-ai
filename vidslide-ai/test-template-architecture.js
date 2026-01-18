/**
 * 测试TemplateArchitecture加载Remotion模板
 */

import TemplateArchitecture from './src/utils/TemplateArchitecture.js'

async function testTemplateArchitecture() {
  console.log('🧪 开始测试TemplateArchitecture...\n')

  try {
    // 1. 初始化
    console.log('1️⃣ 测试初始化...')
    await TemplateArchitecture.initialize()
    console.log('✅ 初始化成功\n')

    // 2. 获取所有模板
    console.log('2️⃣ 测试获取所有模板...')
    const allTemplates = TemplateArchitecture.getAllTemplates()
    console.log(`✅ 获取到 ${allTemplates.length} 个模板`)
    console.log('模板列表:')
    allTemplates.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name} (${t.id}) - ${t.category}`)
    })
    console.log('')

    // 3. 按类别获取模板
    console.log('3️⃣ 测试按类别获取模板...')
    const categories = ['showcase', 'comparison', 'data', 'text', 'effects', 'mixed']
    categories.forEach(category => {
      const templates = TemplateArchitecture.getTemplatesByCategory(category)
      console.log(`   ${category}: ${templates.length} 个模板`)
    })
    console.log('')

    // 4. 测试模板推荐
    console.log('4️⃣ 测试模板推荐...')
    const testCases = [
      {
        name: '数据展示类内容',
        analysis: {
          contentType: 'data',
          dataMentions: 0.5,
          keywords: ['数据', '增长', '统计']
        }
      },
      {
        name: '对比分析类内容',
        analysis: {
          contentType: 'comparison',
          keywords: ['对比', '区别', 'vs']
        }
      },
      {
        name: '产品展示类内容',
        analysis: {
          contentType: 'showcase',
          keywords: ['产品', '展示', '介绍']
        }
      }
    ]

    testCases.forEach(testCase => {
      console.log(`\n   测试场景: ${testCase.name}`)
      const recommendations = TemplateArchitecture.recommendTemplates(testCase.analysis)
      console.log(`   推荐结果: ${recommendations.length} 个模板`)
      recommendations.forEach((rec, i) => {
        console.log(`      ${i + 1}. ${rec.template.name} (评分: ${rec.score}) - ${rec.reason}`)
      })
    })
    console.log('')

    // 5. 获取统计信息
    console.log('5️⃣ 测试统计信息...')
    const stats = TemplateArchitecture.getStatistics()
    console.log('   统计信息:')
    console.log(`   - 总模板数: ${stats.totalTemplates}`)
    console.log(`   - 渲染器: ${stats.renderer}`)
    console.log('   - 按类别分布:')
    Object.entries(stats.templatesByCategory).forEach(([category, count]) => {
      console.log(`      ${category}: ${count} 个`)
    })
    console.log('')

    console.log('✅ 所有测试通过！\n')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error(error.stack)
    return false
  }
}

// 运行测试
testTemplateArchitecture()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ 测试异常:', error)
    process.exit(1)
  })
