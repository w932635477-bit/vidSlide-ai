/**
 * VidSlide AI 网络诊断工具
 * 全面检查网络连接状态和相关服务
 */

console.log('🔍 VidSlide AI 网络诊断工具')
console.log('================================\n')

// 检查结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
}

function checkResult(name, success, message = '', warning = false) {
  results.total++
  if (success) {
    results.passed++
    console.log(`✅ ${name}`)
  } else if (warning) {
    results.warnings++
    console.log(`⚠️  ${name}`)
  } else {
    results.failed++
    console.log(`❌ ${name}`)
  }

  if (message) {
    console.log(`   ${message}`)
  }
  console.log('')
}

/**
 * 检查本地服务状态
 */
async function checkLocalServices() {
  console.log('🌐 本地服务检查:')
  console.log('-'.repeat(30))

  // 检查Vite开发服务器
  try {
    const response = await fetch('http://localhost:5173/')
    checkResult('Vite开发服务器 (5173)', response.ok, `状态: ${response.status}`)
  } catch (error) {
    checkResult('Vite开发服务器 (5173)', false, `错误: ${error.message}`)
  }

  // 检查HTTP静态服务器
  try {
    const response = await fetch('http://localhost:8080/')
    checkResult('HTTP静态服务器 (8080)', response.ok, `状态: ${response.status}`)
  } catch (error) {
    checkResult('HTTP静态服务器 (8080)', false, `错误: ${error.message}`)
  }

  // 检查其他可能的端口
  const ports = [8083, 8087]
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/`)
      checkResult(`HTTP服务器 (${port})`, true, `状态: ${response.status}`, true)
    } catch (error) {
      // 忽略未使用的端口
    }
  }
}

/**
 * 检查网络连接
 */
async function checkNetworkConnectivity() {
  console.log('🌍 网络连接检查:')
  console.log('-'.repeat(30))

  const testUrls = [
    { name: '本地回环', url: 'http://127.0.0.1:8080/' },
    { name: '百度', url: 'https://www.baidu.com/', timeout: 10000 },
    { name: 'Google', url: 'https://www.google.com/', timeout: 5000 },
    { name: 'GitHub', url: 'https://github.com/', timeout: 5000 }
  ]

  for (const test of testUrls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), test.timeout || 5000)

      const response = await fetch(test.url, {
        method: 'HEAD',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      checkResult(test.name, response.ok, `响应时间: ${response.status}`)
    } catch (error) {
      if (error.name === 'AbortError') {
        checkResult(test.name, false, '请求超时')
      } else {
        checkResult(test.name, false, `错误: ${error.message}`)
      }
    }
  }
}

/**
 * 检查代理状态
 */
async function checkProxyStatus() {
  console.log('🔗 代理服务检查:')
  console.log('-'.repeat(30))

  // 检查SOCKS5代理端口
  try {
    // 这里可以尝试连接到本地SOCKS5代理
    // 暂时只检查端口是否监听
    checkResult('SOCKS5代理 (1080)', false, '需要外部检查', true)
  } catch (error) {
    checkResult('SOCKS5代理 (1080)', false, '未运行')
  }

  // 检查HTTP代理端口
  try {
    checkResult('HTTP代理 (1081)', false, '需要外部检查', true)
  } catch (error) {
    checkResult('HTTP代理 (1081)', false, '未运行')
  }
}

/**
 * 检查DNS解析
 */
async function checkDNSResolution() {
  console.log('🔤 DNS解析检查:')
  console.log('-'.repeat(30))

  const domains = ['google.com', 'github.com', 'baidu.com']

  for (const domain of domains) {
    try {
      // 使用Node.js的dns模块进行解析
      const dns = await import('dns')
      const addresses = await new Promise((resolve, reject) => {
        dns.lookup(domain, (err, address) => {
          if (err) reject(err)
          else resolve(address)
        })
      })
      checkResult(`${domain} DNS`, true, `解析到: ${addresses}`)
    } catch (error) {
      checkResult(`${domain} DNS`, false, `解析失败: ${error.message}`)
    }
  }
}

/**
 * 生成诊断报告
 */
function generateReport() {
  console.log('📊 诊断报告汇总:')
  console.log('='.repeat(50))
  console.log(`总检查项: ${results.total}`)
  console.log(`✅ 通过: ${results.passed}`)
  console.log(`❌ 失败: ${results.failed}`)
  console.log(`⚠️  警告: ${results.warnings}`)
  console.log(`📈 通过率: ${((results.passed / results.total) * 100).toFixed(1)}%`)
  console.log('')

  // 提供修复建议
  if (results.failed > 0) {
    console.log('🔧 修复建议:')
    if (results.failed > 0) {
      console.log('1. 检查相关服务是否正常启动')
      console.log('2. 确认网络连接和防火墙设置')
      console.log('3. 重启相关服务或网络设备')
    }
    console.log('')
  }

  if (results.passed === results.total) {
    console.log('🎉 网络诊断全部通过！所有服务运行正常。')
  } else {
    console.log('⚠️  发现网络问题，请根据上述建议进行修复。')
  }
}

// 主执行流程
async function runDiagnostics() {
  try {
    await checkLocalServices()
    await checkNetworkConnectivity()
    await checkProxyStatus()
    await checkDNSResolution()
    generateReport()
  } catch (error) {
    console.error('诊断过程中发生错误:', error)
  }
}

// 运行诊断
runDiagnostics()