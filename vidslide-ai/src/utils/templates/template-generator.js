/**
 * 模板生成器
 * 从备份文件中提取模板定义并生成独立文件
 */
const fs = require('fs')
const path = require('path')

// 读取备份文件
const backupFile = path.join(__dirname, '../TemplateArchitecture.js.backup')
const content = fs.readFileSync(backupFile, 'utf-8')

// 提取所有模板定义
const templateMatches = content.matchAll(/this\.templates\.set\('([^']+)',\s*(\{[\s\S]*?\n\s{4}\})\)/g)

const templates = []
for (const match of templateMatches) {
  const [, id, definition] = match
  templates.push({ id, definition })
}

console.log(`找到 ${templates.length} 个模板`)

// 模板分类
const categories = {
  basic: ['picture-in-picture', 'info-card', 'keyword-highlight', 'timeline', 'split-screen', 
          'dialog-popup', 'chart-analysis', 'document-display', 'minimalist', 'speaker-focus', 
          'educational', 'product-showcase'],
  'short-video': ['douyin-marketing', 'traffic-acquisition', 'ad-performance', 'personal-ip', 
                  'fan-engagement', 'knowledge-sharing', 'comparison-review', 'data-storytelling'],
  ppt: ['ppt-title-slide', 'ppt-bullet-points', 'ppt-big-number', 'ppt-comparison', 'ppt-quote']
}

// 生成模板文件
templates.forEach(({ id, definition }) => {
  // 确定类别
  let category = 'basic'
  for (const [cat, ids] of Object.entries(categories)) {
    if (ids.includes(id)) {
      category = cat
      break
    }
  }

  // 转换为驼峰命名
  const fileName = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Template.js'
  const filePath = path.join(__dirname, category, fileName)

  // 生成文件内容
  const fileContent = `/**
 * ${id} 模板
 */
export default ${definition}
`

  // 写入文件
  fs.writeFileSync(filePath, fileContent, 'utf-8')
  console.log(`✅ 生成: ${category}/${fileName}`)
})

console.log('🎉 所有模板文件生成完成！')
