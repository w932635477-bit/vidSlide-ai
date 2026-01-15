#!/usr/bin/env node

/**
 * UI紧急恢复脚本
 * 在文件被破坏时快速恢复到最后的安全状态
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🚨 VidSlide AI - UI紧急恢复系统\n')

// 检查备份目录
const backupDir = path.join(projectRoot, '.ui-backups')
if (!fs.existsSync(backupDir)) {
  console.log('❌ 备份目录不存在，无法恢复')
  process.exit(1)
}

// 首先尝试使用快照恢复
const snapshotPath = path.join(projectRoot, '.ui-snapshot.json')
let snapshotData = null

if (fs.existsSync(snapshotPath)) {
  try {
    snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
    console.log('📸 发现UI完整性快照，将使用快照进行恢复')
  } catch (error) {
    console.log('⚠️  快照文件损坏，将尝试使用备份文件')
  }
}

// 如果没有快照，查找备份文件
let backups = []
let useBackupFile = null

if (!snapshotData) {
  backups = fs
    .readdirSync(backupDir)
    .filter(f => f.startsWith('WorkspaceView.vue'))
    .sort()
    .reverse() // 最新的排在前面

  if (backups.length === 0) {
    console.log('❌ 没有找到WorkspaceView.vue的备份文件')
    process.exit(1)
  }
}

let restoreSource = ''
let restoreMethod = ''

if (
  snapshotData &&
  snapshotData['WorkspaceView.vue'] &&
  snapshotData['WorkspaceView.vue'].backupFile
) {
  // 优先使用快照关联的备份文件
  const backupFile = snapshotData['WorkspaceView.vue'].backupFile
  const backupPath = path.join(backupDir, backupFile)

  if (fs.existsSync(backupPath)) {
    console.log('📋 快照信息:')
    console.log(`  文件大小: ${snapshotData['WorkspaceView.vue'].size} 字符`)
    console.log(
      `  修改时间: ${new Date(snapshotData['WorkspaceView.vue'].lastModified).toLocaleString()}`
    )
    console.log(`  备份文件: ${backupFile}`)

    restoreSource = '快照备份'
    restoreMethod = backupFile
    useBackupFile = backupPath
  } else {
    console.log('⚠️  快照关联的备份文件不存在，转而查找其他备份')
    snapshotData = null // 清除快照数据，使用备份文件列表
  }
}

if (!snapshotData && backups.length > 0) {
  console.log('📋 可用备份文件:')
  backups.slice(0, 5).forEach((backup, index) => {
    const backupPath = path.join(backupDir, backup)
    const stats = fs.statSync(backupPath)
    const mtime = stats.mtime.toLocaleString()
    console.log(`  ${index + 1}. ${backup} (${mtime})`)
  })

  restoreSource = backups[0]
  restoreMethod = '备份文件'
}

console.log(`\n🔄 自动恢复到最新${restoreSource}...`)
const targetPath = path.join(projectRoot, 'src/views/WorkspaceView.vue')

// 创建当前文件的备份
const currentBackupName = `WorkspaceView.vue.before-restore.${new Date().toISOString().replace(/[:.]/g, '-')}.vue`
const currentBackupPath = path.join(backupDir, currentBackupName)

console.log('💾 备份当前文件...')
fs.copyFileSync(targetPath, currentBackupPath)

// 从备份文件恢复
let backupPath
if (useBackupFile) {
  backupPath = useBackupFile
  console.log(`🔄 从${restoreSource}恢复: ${restoreMethod}`)
} else {
  backupPath = path.join(backupDir, backups[0])
  console.log(`🔄 从${restoreMethod}恢复: ${backups[0]}`)
}

if (fs.existsSync(backupPath)) {
  fs.copyFileSync(backupPath, targetPath)
  console.log('✅ 文件恢复成功！')
} else {
  console.log('❌ 备份文件不存在，无法恢复')
  process.exit(1)
}

console.log('✅ 恢复完成！')
console.log(`📁 当前文件已备份到: .ui-backups/${currentBackupName}`)

// 验证恢复的文件
console.log('\n🔍 验证恢复的文件...')
try {
  const content = fs.readFileSync(targetPath, 'utf8')
  const hasTemplate = content.includes('<template>')
  const hasWorkspace = content.includes('class="workspace"')
  const hasTimeline = content.includes('class="timeline"')

  console.log(`  Template: ${hasTemplate ? '✅' : '❌'}`)
  console.log(`  Workspace: ${hasWorkspace ? '✅' : '❌'}`)
  console.log(`  Timeline: ${hasTimeline ? '✅' : '❌'}`)

  if (hasTemplate && hasWorkspace && hasTimeline) {
    console.log('\n🎉 文件恢复成功！UI保护系统正常工作。')
  } else {
    console.log('\n⚠️ 恢复的文件可能有问题，请手动检查。')
  }
} catch (error) {
  console.error('❌ 验证失败:', error.message)
  process.exit(1)
}

console.log('\n🛡️ 建议操作:')
console.log('  1. 运行 npm run ui-integrity-check 验证文件')
console.log('  2. 检查界面是否正常显示')
console.log('  3. 如果仍有问题，请联系开发团队')
