#!/usr/bin/env node

/**
 * VidSlide AI - 工作流监控系统端到端测试
 *
 * 这个脚本会执行完整的工作流测试，验证所有组件是否正常工作
 */

import { WorkflowOrchestrator } from '../src/services/WorkflowOrchestrator.js'
import { MasterAutoGenerationAgent } from '../src/services/MasterAutoGenerationAgentV2.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60) + '\n')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
}

// 测试函数
async function runTest(name, testFn) {
  testResults.total++

  try {
    log(`\n🧪 测试: ${name}`, 'cyan')
    await testFn()
    testResults.passed++
    logSuccess(`通过: ${name}`)
    return true
  } catch (error) {
    testResults.failed++
    logError(`失败: ${name}`)
    logError(`错误: ${error.message}`)
    if (error.stack) {
      console.log(error.stack)
    }
    return false
  }
}

// 创建模拟视频文件
function createMockVideoFile() {
  const buffer = Buffer.from('mock video data')
  return new File([buffer], 'test-video.mp4', { type: 'video/mp4' })
}

// 测试1: WorkflowEngine 基础功能
async function testWorkflowEngine() {
  const { WorkflowEngine } = await import('../src/services/WorkflowEngine.js')
  const engine = new WorkflowEngine()

  // 注册测试步骤
  engine.registerStep({
    id: 'test-step',
    name: '测试步骤',
    execute: async input => {
      return { ...input, result: 'success' }
    },
    validate: output => output.result === 'success'
  })

  // 执行工作流
  const result = await engine.executeWorkflow({ test: true })

  // 验证结果
  if (!result.result || result.result !== 'success') {
    throw new Error('工作流执行结果不正确')
  }

  // 验证统计信息
  const stats = engine.getStatistics()
  if (stats.totalSteps !== 1 || stats.completedSteps !== 1) {
    throw new Error('统计信息不正确')
  }

  logInfo(`统计: ${stats.completedSteps}/${stats.totalSteps} 步骤完成`)
}

// 测试2: WorkflowOrchestrator 完整流程
async function testWorkflowOrchestrator() {
  const orchestrator = new WorkflowOrchestrator()
  const mockVideoFile = createMockVideoFile()

  // 执行工作流
  const result = await orchestrator.executeWorkflow(mockVideoFile)

  // 验证必需的输出
  const requiredFields = [
    'transcript',
    'keywords',
    'selectedTemplate',
    'scenes',
    'renderedScenes',
    'canExport'
  ]

  for (const field of requiredFields) {
    if (!result[field]) {
      throw new Error(`缺少必需字段: ${field}`)
    }
  }

  logInfo(`生成了 ${result.scenes.length} 个场景`)
  logInfo(`关键词数量: ${result.keywords.length}`)
  logInfo(`选择的模板: ${result.selectedTemplate.id || result.selectedTemplate.name}`)
}

// 测试3: MasterAutoGenerationAgent 集成
async function testMasterAutoGenerationAgent() {
  const agent = new MasterAutoGenerationAgent()
  const mockVideoFile = createMockVideoFile()

  // 监听事件
  const events = []
  agent.on('workflow:start', data => events.push('start'))
  agent.on('step:start', data => events.push(`step:${data.stepName}`))
  agent.on('workflow:complete', data => events.push('complete'))

  // 执行自动生成
  const result = await agent.autoGenerate(mockVideoFile)

  // 验证事件触发
  if (!events.includes('start')) {
    throw new Error('未触发 workflow:start 事件')
  }

  if (!events.includes('complete')) {
    throw new Error('未触发 workflow:complete 事件')
  }

  // 验证结果
  if (!result.canExport) {
    throw new Error('生成结果不可导出')
  }

  logInfo(`触发了 ${events.length} 个事件`)
  logInfo(`执行时间: ${result.executionTime}ms`)
}

// 测试4: 错误处理和重试
async function testErrorHandling() {
  const { WorkflowEngine } = await import('../src/services/WorkflowEngine.js')
  const engine = new WorkflowEngine()

  let attemptCount = 0

  // 注册会失败的步骤
  engine.registerStep({
    id: 'failing-step',
    name: '失败步骤',
    execute: async input => {
      attemptCount++
      if (attemptCount < 3) {
        throw new Error('暂时失败')
      }
      return { ...input, success: true }
    }
  })

  // 执行工作流
  const result = await engine.executeWorkflow({})

  // 验证重试次数
  if (attemptCount !== 3) {
    throw new Error(`重试次数不正确: ${attemptCount}，期望: 3`)
  }

  if (!result.success) {
    throw new Error('重试后仍然失败')
  }

  logInfo(`重试了 ${attemptCount - 1} 次后成功`)
}

// 测试5: 事件系统
async function testEventSystem() {
  const { WorkflowEngine } = await import('../src/services/WorkflowEngine.js')
  const engine = new WorkflowEngine()

  const eventLog = []

  // 监听所有事件
  engine.on('workflow:start', () => eventLog.push('workflow:start'))
  engine.on('step:start', () => eventLog.push('step:start'))
  engine.on('step:complete', () => eventLog.push('step:complete'))
  engine.on('workflow:complete', () => eventLog.push('workflow:complete'))
  engine.on('log', () => eventLog.push('log'))

  // 注册步骤
  engine.registerStep({
    id: 'test',
    name: '测试',
    execute: async input => input
  })

  // 执行
  await engine.executeWorkflow({})

  // 验证事件
  const requiredEvents = ['workflow:start', 'step:start', 'step:complete', 'workflow:complete']
  for (const event of requiredEvents) {
    if (!eventLog.includes(event)) {
      throw new Error(`未触发事件: ${event}`)
    }
  }

  logInfo(`触发了 ${eventLog.length} 个事件`)
}

// 测试6: 暂停和恢复
async function testPauseResume() {
  const { WorkflowEngine } = await import('../src/services/WorkflowEngine.js')
  const engine = new WorkflowEngine()

  let step2Executed = false

  engine.registerStep({
    id: 'step-1',
    name: '步骤1',
    execute: async input => {
      engine.pause()
      return input
    }
  })

  engine.registerStep({
    id: 'step-2',
    name: '步骤2',
    execute: async input => {
      step2Executed = true
      return input
    }
  })

  // 开始执行
  const promise = engine.executeWorkflow({})

  // 等待步骤1执行
  await new Promise(resolve => setTimeout(resolve, 100))

  // 验证暂停
  if (!engine.isPaused) {
    throw new Error('引擎未暂停')
  }

  if (step2Executed) {
    throw new Error('步骤2不应该在暂停时执行')
  }

  logInfo('工作流已暂停')

  // 恢复执行
  engine.resume()
  await promise

  // 验证恢复后执行
  if (!step2Executed) {
    throw new Error('恢复后步骤2未执行')
  }

  logInfo('工作流已恢复并完成')
}

// 测试7: 数据验证
async function testDataValidation() {
  const orchestrator = new WorkflowOrchestrator()

  // 测试有效输出
  const validOutput = {
    transcript: '测试文本',
    keywords: [{ text: '关键词', weight: 1.0 }],
    contentType: 'tech'
  }

  const stepDef = orchestrator.workflowKnowledge.steps.find(s => s.id === 'video-analysis')

  if (!orchestrator.validateOutput(stepDef, validOutput)) {
    throw new Error('有效输出验证失败')
  }

  // 测试无效输出
  const invalidOutput = {
    transcript: '测试文本'
    // 缺少必需字段
  }

  if (orchestrator.validateOutput(stepDef, invalidOutput)) {
    throw new Error('无效输出应该验证失败')
  }

  logInfo('数据验证正常工作')
}

// 测试8: 降级策略
async function testFallbackStrategies() {
  const orchestrator = new WorkflowOrchestrator()

  // 测试各种降级策略
  const strategies = [
    'use-mock-data',
    'use-default-template',
    'skip',
    'simplify-scenes',
    'reduce-quality'
  ]

  for (const strategy of strategies) {
    const stepDef = {
      id: 'test',
      name: '测试',
      fallbackStrategy: strategy
    }

    const result = await orchestrator.executeFallback(stepDef, {}, () => {})

    if (result === null && strategy !== 'skip') {
      throw new Error(`降级策略 ${strategy} 返回了 null`)
    }

    logInfo(`降级策略 ${strategy} 正常工作`)
  }
}

// 测试9: 性能测试
async function testPerformance() {
  const orchestrator = new WorkflowOrchestrator()
  const mockVideoFile = createMockVideoFile()

  const startTime = Date.now()
  const result = await orchestrator.executeWorkflow(mockVideoFile)
  const endTime = Date.now()

  const executionTime = endTime - startTime

  logInfo(`执行时间: ${executionTime}ms`)

  // 验证性能（应该在合理时间内完成）
  if (executionTime > 10000) {
    testResults.warnings++
    logWarning(`执行时间过长: ${executionTime}ms`)
  }

  // 验证统计信息
  if (result.statistics) {
    logInfo(`总步骤: ${result.statistics.totalSteps}`)
    logInfo(`完成步骤: ${result.statistics.completedSteps}`)
    logInfo(`成功率: ${result.statistics.successRate.toFixed(2)}%`)
  }
}

// 测试10: 日志系统
async function testLoggingSystem() {
  const { WorkflowEngine } = await import('../src/services/WorkflowEngine.js')
  const engine = new WorkflowEngine()

  engine.registerStep({
    id: 'test',
    name: '测试',
    execute: async (input, log) => {
      log('测试日志1')
      log('测试日志2', { data: 'test' })
      return input
    }
  })

  await engine.executeWorkflow({})

  const logs = engine.getAllLogs()

  // 验证日志
  if (logs.length === 0) {
    throw new Error('没有记录日志')
  }

  const testLogs = logs.filter(log => log.message.includes('测试日志'))
  if (testLogs.length !== 2) {
    throw new Error(`日志数量不正确: ${testLogs.length}`)
  }

  logInfo(`记录了 ${logs.length} 条日志`)

  // 测试清空日志
  engine.clearLogs()
  if (engine.getAllLogs().length !== 0) {
    throw new Error('清空日志失败')
  }

  logInfo('日志清空成功')
}

// 主测试函数
async function runAllTests() {
  logSection('🚀 VidSlide AI 工作流监控系统 - 端到端测试')

  logInfo('开始执行测试套件...\n')

  // 执行所有测试
  await runTest('WorkflowEngine 基础功能', testWorkflowEngine)
  await runTest('WorkflowOrchestrator 完整流程', testWorkflowOrchestrator)
  await runTest('MasterAutoGenerationAgent 集成', testMasterAutoGenerationAgent)
  await runTest('错误处理和重试', testErrorHandling)
  await runTest('事件系统', testEventSystem)
  await runTest('暂停和恢复', testPauseResume)
  await runTest('数据验证', testDataValidation)
  await runTest('降级策略', testFallbackStrategies)
  await runTest('性能测试', testPerformance)
  await runTest('日志系统', testLoggingSystem)

  // 输出测试结果
  logSection('📊 测试结果汇总')

  log(`总测试数: ${testResults.total}`, 'bright')
  logSuccess(`通过: ${testResults.passed}`)

  if (testResults.failed > 0) {
    logError(`失败: ${testResults.failed}`)
  }

  if (testResults.warnings > 0) {
    logWarning(`警告: ${testResults.warnings}`)
  }

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2)
  log(`\n成功率: ${successRate}%`, successRate === '100.00' ? 'green' : 'yellow')

  // 返回退出码
  return testResults.failed === 0 ? 0 : 1
}

// 执行测试
runAllTests()
  .then(exitCode => {
    logSection('✨ 测试完成')
    process.exit(exitCode)
  })
  .catch(error => {
    logError('测试执行失败')
    console.error(error)
    process.exit(1)
  })
