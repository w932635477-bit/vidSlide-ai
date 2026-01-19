import express from 'express'
import ServerVideoProcessor from './server-video-processor.js'

console.log('✅ Express 导入成功')
console.log('✅ ServerVideoProcessor 导入成功')

const processor = new ServerVideoProcessor()
console.log('✅ ServerVideoProcessor 实例化成功')

// 检查server.js是否存在必要的API路由
import fs from 'fs'
const serverCode = fs.readFileSync('./server.js', 'utf-8')

const requiredAPIs = [
  '/api/upload',
  '/api/video/split',
  '/api/video/merge',
  '/api/video/pip-compose',
  '/api/video/compress',
  '/download/file/:filename'
]

console.log('\n检查API路由:')
requiredAPIs.forEach(api => {
  if (serverCode.includes(api)) {
    console.log(`  ✅ ${api}`)
  } else {
    console.log(`  ❌ ${api} - 未找到`)
  }
})

console.log('\n验证完成!')
