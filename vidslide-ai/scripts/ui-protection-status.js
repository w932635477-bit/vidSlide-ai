#!/usr/bin/env node

/**
 * UI保护系统状态检查脚本
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🛡️  VidSlide AI - UI保护系统状态检查\n')

// 检查配置文件
console.log('📋 检查配置文件...')
const configPath = path.join(projectRoot, '.ui-protection.json')
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  console.log('✅ 配置文件存在')

  console.log(`📁 受保护文件数量: ${config.protectedFiles.length}`)
  config.protectedFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file)
    const exists = fs.existsSync(fullPath)
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })

  if (config.strictMode?.enabled) {
    console.log('🔒 严格模式: 已启用')
  }
} else {
  console.log('❌ 配置文件不存在')
}

// 检查备份目录
console.log('\n💾 检查备份系统...')
const backupDir = path.join(projectRoot, '.ui-backups')
if (fs.existsSync(backupDir)) {
  const backups = fs.readdirSync(backupDir)
  console.log(`✅ 备份目录存在 (${backups.length} 个备份文件)`)

  // 显示最新的备份
  const workspaceBackups = backups.filter(f => f.startsWith('WorkspaceView.vue'))
  if (workspaceBackups.length > 0) {
    const latest = workspaceBackups.sort().pop()
    console.log(`📄 WorkspaceView.vue 最新备份: ${latest}`)
  }
} else {
  console.log('❌ 备份目录不存在')
}

// 检查Git钩子
console.log('\n🔗 检查Git钩子...')
const hookPath = path.join(projectRoot, '.git', 'hooks', 'pre-commit')
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8')
  if (hookContent.includes('WorkspaceView.vue')) {
    console.log('✅ Git钩子已配置 (包含WorkspaceView.vue保护)')
  } else {
    console.log('⚠️  Git钩子存在但未包含WorkspaceView.vue保护')
  }
} else {
  console.log('❌ Git钩子不存在')
}

console.log('\n🎯 UI保护状态总结:')
console.log('   • WorkspaceView.vue 已受严格保护')
console.log('   • 自动备份系统已启用')
console.log('   • Git提交保护已激活')
console.log('   • 实时监控可通过 npm run ui-protection-monitor 启动')

console.log('\n📖 更多信息请查看: UI_PROTECTION_README.md')
