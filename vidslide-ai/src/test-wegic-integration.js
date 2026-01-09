// Wegic设计系统集成测试脚本
console.log('🚀 开始 Wegic 设计系统集成测试...')

// 测试1: 检查CSS变量是否正确定义
function testCSSVariables() {
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)

  const variables = [
    '--wegic-primary-blue',
    '--wegic-primary-purple',
    '--wegic-success-green',
    '--wegic-error-red',
    '--wegic-font-heading',
    '--wegic-font-body'
  ]

  console.log('📊 CSS变量测试:')
  variables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim()
    const status = value ? '✅' : '❌'
    console.log(`  ${status} ${variable}: ${value || '未定义'}`)
  })
}

// 测试2: 检查组件样式类是否可用
function testComponentClasses() {
  const testElement = document.createElement('div')
  testElement.style.display = 'none'
  document.body.appendChild(testElement)

  const classes = ['wegic-btn', 'wegic-btn-primary', 'wegic-card', 'wegic-heading', 'wegic-text']

  console.log('🎨 组件样式类测试:')
  classes.forEach(className => {
    testElement.className = className
    const computed = getComputedStyle(testElement)
    const hasStyle = computed.cssText.length > 0
    const status = hasStyle ? '✅' : '❌'
    console.log(`  ${status} .${className}: ${hasStyle ? '已应用样式' : '无样式'}`)
  })

  document.body.removeChild(testElement)
}

// 测试3: 检查动画是否工作
function testAnimations() {
  console.log('🎬 动画测试:')
  const animations = ['wegic-float', 'wegic-pulse', 'wegic-glow']

  animations.forEach(animation => {
    const keyframes = `@keyframes ${animation}`
    // 检查CSS中是否存在这些动画定义
    const styleSheets = Array.from(document.styleSheets)
    let found = false

    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules)
        found = rules.some(rule => rule.type === CSSRule.KEYFRAMES_RULE && rule.name === animation)
        if (found) break
      } catch (e) {
        // 忽略跨域样式表的错误
      }
    }

    const status = found ? '✅' : '❌'
    console.log(`  ${status} ${animation} 动画: ${found ? '已定义' : '未找到'}`)
  })
}

// 运行所有测试
setTimeout(() => {
  testCSSVariables()
  console.log('')
  testComponentClasses()
  console.log('')
  testAnimations()
  console.log('')
  console.log('✨ Wegic 设计系统集成测试完成！')
  console.log('📱 访问 http://localhost:5173/#/wegic-showcase 查看设计展示')
}, 1000)
