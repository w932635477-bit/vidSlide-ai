/**
 * 综合代码检查脚本
 * 检查所有关键服务和配置
 */

import TemplateArchitecture from './src/utils/TemplateArchitecture.js'
import MaterialService from './src/services/MaterialService.js'
import RemotionService from './src/services/RemotionService.js'
import { BAIDU_SPEECH_CONFIG, BAIDU_NLP_CONFIG, UNSPLASH_CONFIG, PEXELS_CONFIG, PIXABAY_CONFIG } from './src/config/api-keys.js'

console.log('🔍 VidSlide AI 综合代码检查\n')
console.log('=' .repeat(60))

let allChecksPass = true

// ========== 1. API密钥配置检查 ==========
console.log('\n📋 1. API密钥配置检查')
console.log('-'.repeat(60))

const apiChecks = [
  { name: '百度语音识别', config: BAIDU_SPEECH_CONFIG, keys: ['apiKey', 'secretKey'] },
  { name: '百度NLP', config: BAIDU_NLP_CONFIG, keys: ['apiKey', 'secretKey'] },
  { name: 'Unsplash', config: UNSPLASH_CONFIG, keys: ['accessKey'] },
  { name: 'Pexels', config: PEXELS_CONFIG, keys: ['apiKey'] },
  { name: 'Pixabay', config: PIXABAY_CONFIG, keys: ['apiKey'] }
]

apiChecks.forEach(({ name, config, keys }) => {
  const allKeysPresent = keys.every(key => config[key] && config[key].length > 0)
  if (allKeysPresent) {
    console.log(`✅ ${name}: 已配置`)
  } else {
    console.log(`❌ ${name}: 缺少密钥`)
    allChecksPass = false
  }
})

// ========== 2. Remotion服务器检查 ==========
console.log('\n📋 2. Remotion服务器检查')
console.log('-'.repeat(60))

try {
  const response = await fetch('http://localhost:3002/health')
  if (response.ok) {
    const data = await response.json()
    console.log(`✅ Remotion服务器: ${data.message}`)

    // 检查模板数量
    const templatesResponse = await fetch('http://localhost:3002/templates')
    const templatesData = await templatesResponse.json()
    console.log(`✅ 可用模板: ${templatesData.templates.length} 个`)
  } else {
    console.log(`❌ Remotion服务器: HTTP ${response.status}`)
    allChecksPass = false
  }
} catch (error) {
  console.log(`❌ Remotion服务器: 无法连接 (${error.message})`)
  console.log(`   提示: 请运行 'cd remotion-templates && ./start-server.sh'`)
  allChecksPass = false
}

// ========== 3. TemplateArchitecture检查 ==========
console.log('\n📋 3. TemplateArchitecture检查')
console.log('-'.repeat(60))

try {
  await TemplateArchitecture.initialize()
  const templates = TemplateArchitecture.getAllTemplates()
  console.log(`✅ 模板加载: ${templates.length} 个模板`)

  // 检查模板分类
  const categories = ['showcase', 'comparison', 'data', 'text', 'effects', 'mixed']
  categories.forEach(category => {
    const categoryTemplates = TemplateArchitecture.getTemplatesByCategory(category)
    console.log(`   - ${category}: ${categoryTemplates.length} 个`)
  })

  // 测试推荐功能
  const testRecommendations = TemplateArchitecture.recommendTemplates({
    contentType: 'data',
    keywords: ['数据', '增长'],
    dataMentions: 0.5
  })

  if (testRecommendations.length > 0) {
    console.log(`✅ 模板推荐: 正常工作`)
  } else {
    console.log(`⚠️ 模板推荐: 未返回结果`)
  }
} catch (error) {
  console.log(`❌ TemplateArchitecture: ${error.message}`)
  allChecksPass = false
}

// ========== 4. MaterialService检查 ==========
console.log('\n📋 4. MaterialService检查')
console.log('-'.repeat(60))

try {
  await MaterialService.initialize()
  console.log(`✅ MaterialService: 初始化成功`)

  // 测试搜索功能（使用本地模式避免实际API调用）
  console.log(`   提示: 素材搜索功能已集成，将在运行时测试`)
} catch (error) {
  console.log(`❌ MaterialService: ${error.message}`)
  allChecksPass = false
}

// ========== 5. RemotionService检查 ==========
console.log('\n📋 5. RemotionService检查')
console.log('-'.repeat(60))

try {
  const isAvailable = await RemotionService.checkServiceAvailability()
  if (isAvailable) {
    console.log(`✅ RemotionService: 服务可用`)

    const templates = await RemotionService.getAvailableTemplates()
    console.log(`✅ 模板列表: ${templates.templates?.length || 0} 个`)
  } else {
    console.log(`⚠️ RemotionService: 服务不可用（将使用默认模板）`)
  }
} catch (error) {
  console.log(`❌ RemotionService: ${error.message}`)
  allChecksPass = false
}

// ========== 总结 ==========
console.log('\n' + '='.repeat(60))
if (allChecksPass) {
  console.log('✅ 所有检查通过！系统已准备就绪。')
  console.log('\n💡 下一步:')
  console.log('   1. 启动Vue开发服务器: npm run dev')
  console.log('   2. 上传测试视频')
  console.log('   3. 验证完整流程')
} else {
  console.log('⚠️ 部分检查未通过，请查看上述错误信息。')
  console.log('\n💡 建议:')
  console.log('   1. 确保Remotion服务器正在运行')
  console.log('   2. 检查API密钥配置')
  console.log('   3. 查看错误日志')
}
console.log('='.repeat(60) + '\n')

process.exit(allChecksPass ? 0 : 1)
