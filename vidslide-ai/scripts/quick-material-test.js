/**
 * VidSlide AI 快速素材测试脚本
 * 获取少量测试素材验证完整流程
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// API配置
const API_CONFIGS = {
  unsplash: {
    baseUrl: 'https://api.unsplash.com',
    accessKey: 'zPjqHo_L8Vx-gckbifgYM1bJxnYbFRgFXLXFwWcAN30'
  },
  pexels: {
    baseUrl: 'https://api.pexels.com/v1',
    apiKey: 'LnDV3UqDXRD71HMtGzXByhFF1mwwuHdU4RKXsMKtjgHOaCOV1iwrA0Xz'
  }
}

// 测试关键词
const TEST_KEYWORDS = ['computer', 'business', 'education', 'technology']
const OUTPUT_DIR = path.join(__dirname, '../public/materials-test')

class QuickMaterialTest {
  constructor() {
    this.downloadedCount = 0
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        headers: {
          'User-Agent': 'VidSlide-AI-Test/1.0.0',
          ...options.headers
        },
        ...options
      }

      https
        .get(url, requestOptions, res => {
          let data = ''

          res.on('data', chunk => {
            data += chunk
          })

          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(data))
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${data}`))
              }
            } catch (error) {
              reject(new Error(`解析响应失败: ${error.message}`))
            }
          })
        })
        .on('error', error => {
          reject(error)
        })
        .setTimeout(15000, function () {
          this.destroy()
          reject(new Error('请求超时'))
        })
    })
  }

  async fetchFromUnsplash(keyword) {
    try {
      const url = `${API_CONFIGS.unsplash.baseUrl}/search/photos?query=${encodeURIComponent(keyword)}&per_page=2&client_id=${API_CONFIGS.unsplash.accessKey}`
      const response = await this.makeRequest(url)
      return response.results.slice(0, 1).map(photo => ({
        id: photo.id,
        title: photo.description || keyword,
        sourceUrl: photo.urls.regular,
        source: 'unsplash',
        author: photo.user.name
      }))
    } catch (error) {
      console.log(`❌ Unsplash (${keyword}): ${error.message}`)
      return []
    }
  }

  async fetchFromPexels(keyword) {
    try {
      const url = `${API_CONFIGS.pexels.baseUrl}/search?query=${encodeURIComponent(keyword)}&per_page=2`
      const response = await this.makeRequest(url, {
        headers: { Authorization: API_CONFIGS.pexels.apiKey }
      })
      return response.photos.slice(0, 1).map(photo => ({
        id: photo.id.toString(),
        title: photo.alt || keyword,
        sourceUrl: photo.src.large,
        source: 'pexels',
        author: photo.photographer
      }))
    } catch (error) {
      console.log(`❌ Pexels (${keyword}): ${error.message}`)
      return []
    }
  }

  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(filepath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const file = fs.createWriteStream(filepath)
      let downloaded = 0

      https
        .get(url, response => {
          if (response.statusCode !== 200) {
            reject(new Error(`下载失败: HTTP ${response.statusCode}`))
            return
          }

          const total = parseInt(response.headers['content-length'], 10)
          console.log(`📥 下载中: ${filepath}`)

          response.on('data', chunk => {
            downloaded += chunk.length
            if (total) {
              const percent = Math.round((downloaded / total) * 100)
              process.stdout.write(`\r📥 ${percent}% `)
            }
          })

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            console.log(`✅ ${filepath}`)
            resolve()
          })

          file.on('error', error => {
            fs.unlink(filepath, () => {})
            reject(error)
          })
        })
        .on('error', error => {
          fs.unlink(filepath, () => {})
          reject(error)
        })
        .setTimeout(30000, function () {
          this.destroy()
          reject(new Error('下载超时'))
        })
    })
  }

  async run() {
    console.log('🚀 开始VidSlide AI快速素材测试...\n')

    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const results = {
      totalAttempted: 0,
      totalDownloaded: 0,
      bySource: { unsplash: 0, pexels: 0 },
      errors: []
    }

    // 测试每个关键词
    for (const keyword of TEST_KEYWORDS) {
      console.log(`\n🔍 测试关键词: "${keyword}"`)

      // 从两个平台获取素材
      const [unsplashMaterials, pexelsMaterials] = await Promise.all([
        this.fetchFromUnsplash(keyword),
        this.fetchFromPexels(keyword)
      ])

      const allMaterials = [...unsplashMaterials, ...pexelsMaterials]
      results.totalAttempted += allMaterials.length

      console.log(`📋 找到 ${allMaterials.length} 个素材`)

      // 下载素材
      for (const material of allMaterials) {
        try {
          const ext = path.extname(material.sourceUrl) || '.jpg'
          const filename = `${material.source}_${material.id}${ext}`
          const categoryDir = path.join(OUTPUT_DIR, keyword)
          const filepath = path.join(categoryDir, filename)

          await this.downloadImage(material.sourceUrl, filepath)

          results.totalDownloaded++
          results.bySource[material.source]++

          // 保存元数据
          const metadata = {
            ...material,
            localPath: path.relative(OUTPUT_DIR, filepath),
            downloadTime: new Date().toISOString(),
            keyword: keyword
          }

          const metadataPath = path.join(categoryDir, `${material.id}.json`)
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
        } catch (error) {
          console.log(`❌ 下载失败: ${material.sourceUrl}`)
          results.errors.push(`${material.source}: ${error.message}`)
        }

        // 避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 保存汇总报告
    const reportPath = path.join(OUTPUT_DIR, 'test-report.json')
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          ...results,
          testTime: new Date().toISOString(),
          keywords: TEST_KEYWORDS,
          outputDir: OUTPUT_DIR
        },
        null,
        2
      )
    )

    // 输出总结
    console.log('\n' + '='.repeat(50))
    console.log('📊 测试结果总结')
    console.log('='.repeat(50))
    console.log(`🎯 测试关键词: ${TEST_KEYWORDS.join(', ')}`)
    console.log(`📥 素材获取: ${results.totalAttempted} 个`)
    console.log(`✅ 下载成功: ${results.totalDownloaded} 个`)
    console.log(`❌ 下载失败: ${results.errors.length} 个`)
    console.log(`📁 输出目录: ${OUTPUT_DIR}`)
    console.log('\n📈 数据来源:')
    Object.entries(results.bySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} 个`)
    })

    if (results.totalDownloaded > 0) {
      console.log('\n🎉 素材获取测试成功！')
      console.log('💡 运行完整脚本: npm run fetch-materials')
    } else {
      console.log('\n⚠️ 素材获取测试失败，请检查网络或API配置')
    }

    console.log('\n📋 查看结果:')
    console.log(`ls -la "${OUTPUT_DIR}"`)
    console.log(`cat "${reportPath}"`)
  }
}

// 运行测试
const tester = new QuickMaterialTest()
tester.run().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
})
