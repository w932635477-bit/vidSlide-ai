/**
 * VidSlide AI - 快速修复启动脚本
 * 一键启动修复流程
 */

console.log('🚀 VidSlide AI快速修复启动...\n')

// 检查环境
console.log('📋 环境检查:')
console.log(`🌐 当前URL: ${window.location.href}`)
console.log(`📦 Vue版本: ${window.Vue?.version || '未知'}`)
console.log(`🎨 设计系统: ${document.querySelector('link[href*="wegic"]') ? '已加载' : '未加载'}`)

// 快速诊断
console.log('\n🔍 快速诊断:')

// 检查核心组件
const components = {
  TemplateSelector:
    document.querySelector('.template-selector') ||
    document.querySelector('[data-component*="Template"]'),
  UserAdjustmentPanel:
    document.querySelector('.adjustment-panel') ||
    document.querySelector('[data-component*="Adjustment"]'),
  PictureInPicture:
    document.querySelector('.pip-controls') || document.querySelector('[data-component*="Pip"]'),
  Canvas: document.querySelector('canvas')
}

Object.entries(components).forEach(([name, element]) => {
  console.log(`${element ? '✅' : '❌'} ${name}: ${element ? '找到' : '未找到'}`)
})

// 检查事件连接
console.log('\n🔗 事件连接检查:')
const eventElements = document.querySelectorAll(
  '[data-event], .template-card, input[type="range"], button'
)
console.log(`📊 可交互元素数量: ${eventElements.length}`)

// 检查样式系统
console.log('\n🎨 样式系统检查:')
const root = document.documentElement
const designTokens = ['--apple-blue', '--apple-gray', '--bg-primary']
designTokens.forEach(token => {
  const value = getComputedStyle(root).getPropertyValue(token)
  console.log(`${value ? '✅' : '❌'} ${token}: ${value || '未定义'}`)
})

// 提供修复指导
console.log('\n🛠️ 修复指导:')

const issues = []

// 检查服务连接
if (!window.templateRenderer) issues.push('TemplateRenderer未初始化')
if (!window.materialService) issues.push('MaterialService未初始化')

// 检查事件绑定
const templateCards = document.querySelectorAll('.template-card')
const templateCardsWithoutClick = Array.from(templateCards).filter(
  card => !card.onclick && !card.getAttribute('onclick') && !card.getAttribute('@click')
)
if (templateCardsWithoutClick.length > 0) {
  issues.push('模板卡片缺少点击事件')
}

const rangeInputs = document.querySelectorAll('input[type="range"]')
const rangeInputsWithoutInput = Array.from(rangeInputs).filter(
  input => !input.oninput && !input.getAttribute('oninput') && !input.getAttribute('@input')
)
if (rangeInputsWithoutInput.length > 0) {
  issues.push('参数控件缺少输入事件')
}

// 检查Canvas
if (!document.querySelector('canvas')) {
  issues.push('Canvas元素不存在')
}

if (issues.length === 0) {
  console.log('🎉 恭喜！未发现明显问题，请进行功能测试')
} else {
  console.log('⚠️ 发现问题:')
  issues.forEach(issue => console.log(`  - ${issue}`))
}

console.log('\n📚 修复步骤:')
console.log('1. 查看 CONNECTION_FIX_GUIDE.md 获取详细指导')
console.log('2. 运行完整诊断: import("./test-function-connections.js")')
console.log('3. 按阶段修复连接问题')
console.log('4. 运行验证: import("./validate-connections.js")')

console.log('\n🎯 立即开始修复？请访问编辑器页面: http://localhost:5173/editor')
