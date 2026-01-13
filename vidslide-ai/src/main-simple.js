// 超级简单的测试main.js
console.log('🚀 main-simple.js 开始执行')

// 测试基础功能
console.log('✅ 脚本执行成功')
alert('JavaScript执行正常！')

// 测试Vue导入
try {
  import { createApp } from 'vue'
  console.log('✅ Vue导入成功')
} catch (error) {
  console.error('❌ Vue导入失败:', error)
}