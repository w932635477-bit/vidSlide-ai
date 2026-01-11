/**
 * 简单的API连接测试
 */

import https from 'https'

const API_KEYS = {
  unsplash: 'zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30',
  pexels: 'LnDV3UqDXRD71HMtGzXByhFF1mwwuHdU4RKXsMKtjgHOaCOV1iwrA0Xz',
  pixabay: '52722038-7ac4769e00433c06f9c6333bc'
}

function testAPI(name, url) {
  return new Promise(resolve => {
    console.log(`🔍 测试 ${name} API...`)

    const req = https.get(url, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (res.statusCode === 200) {
            console.log(`✅ ${name}: 连接成功 (${json.total || json.total_results || 'OK'})`)
            resolve(true)
          } else {
            console.log(`❌ ${name}: HTTP ${res.statusCode}`)
            resolve(false)
          }
        } catch (e) {
          console.log(`❌ ${name}: 解析失败`)
          resolve(false)
        }
      })
    })

    req.on('error', err => {
      console.log(`❌ ${name}: 连接失败 - ${err.message}`)
      resolve(false)
    })

    req.setTimeout(10000, () => {
      console.log(`⏰ ${name}: 请求超时`)
      req.destroy()
      resolve(false)
    })
  })
}

async function runTests() {
  console.log('🧪 开始API连接测试...\n')

  const results = await Promise.all([
    testAPI(
      'Unsplash',
      `https://api.unsplash.com/search/photos?query=test&per_page=1&client_id=${API_KEYS.unsplash}`
    ),
    testAPI('Pexels', 'https://api.pexels.com/v1/search?query=test&per_page=1').then(
      async success => {
        if (success) return true
        // Pexels需要Authorization header
        return new Promise(resolve => {
          const url = 'https://api.pexels.com/v1/search?query=test&per_page=1'
          const req = https.get(
            url,
            {
              headers: { Authorization: API_KEYS.pexels }
            },
            res => {
              if (res.statusCode === 200) {
                console.log('✅ Pexels: 连接成功 (with auth)')
                resolve(true)
              } else {
                console.log(`❌ Pexels: HTTP ${res.statusCode}`)
                resolve(false)
              }
            }
          )
          req.on('error', () => resolve(false))
        })
      }
    ),
    testAPI('Pixabay', `https://pixabay.com/api/?key=${API_KEYS.pixabay}&q=test&per_page=1`)
  ])

  const successCount = results.filter(Boolean).length
  console.log(`\n📊 测试结果: ${successCount}/3 个API连接成功`)

  if (successCount === 3) {
    console.log('🎉 所有API都正常工作，可以运行完整素材获取脚本！')
    console.log('💡 运行命令: npm run fetch-materials')
  } else {
    console.log('⚠️ 部分API连接失败，请检查网络或API密钥')
  }
}

runTests().catch(console.error)
