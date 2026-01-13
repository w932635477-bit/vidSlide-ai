/**
 * VidSlide AI - 约束验证脚本
 *
 * 验证项目是否符合技术栈和开发规范要求
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ConstraintValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.projectRoot = path.resolve(__dirname)
  }

  /**
   * 验证Vue组件是否符合约束
   */
  validateVueComponent(componentPath) {
    console.log(`🔍 验证Vue组件: ${componentPath}`)

    try {
      const content = fs.readFileSync(componentPath, 'utf8')

      // 检查是否使用Vue 3 Composition API
      if (!content.includes('import {') || !content.includes('from \'vue\'')) {
        this.errors.push(`${componentPath}: 未使用Vue 3 Composition API`)
      }

      // 检查是否使用了禁止的技术栈
      const forbiddenImports = ['vuex', 'vue-router', 'react', 'angular']
      for (const forbidden of forbiddenImports) {
        if (content.includes(`from '${forbidden}'`)) {
          this.errors.push(`${componentPath}: 使用了禁止的技术栈: ${forbidden}`)
        }
      }

      // 检查是否使用了Canvas 2D
      if (
        content.includes('CanvasRenderingContext2D') ||
        content.includes('canvas.getContext(\'2d\')')
      ) {
        console.log('  ✅ 使用了Canvas 2D API')
      }

      // 检查响应式设计
      if (content.includes('@media')) {
        console.log('  ✅ 包含响应式设计')
      }

      // 检查无障碍支持
      if (content.includes('aria-') || content.includes('role=')) {
        console.log('  ✅ 包含无障碍支持')
      }

      console.log('  ✅ Vue组件验证完成')
    } catch (error) {
      this.errors.push(`${componentPath}: 文件读取失败 - ${error.message}`)
    }
  }

  /**
   * 验证测试文件
   */
  validateTestFile(testPath) {
    console.log(`🧪 验证测试文件: ${testPath}`)

    try {
      const content = fs.readFileSync(testPath, 'utf8')

      // 检查是否使用了Vitest
      if (!content.includes('vitest') && !content.includes('from \'vitest\'')) {
        this.warnings.push(`${testPath}: 未明确使用Vitest`)
      }

      // 检查测试覆盖率要求
      if (content.includes('describe(') && content.includes('it(')) {
        console.log('  ✅ 包含测试用例')
      }

      console.log('  ✅ 测试文件验证完成')
    } catch (error) {
      this.errors.push(`${testPath}: 文件读取失败 - ${error.message}`)
    }
  }

  /**
   * 验证组合式函数
   */
  validateComposable(composablePath) {
    console.log(`🔧 验证组合式函数: ${composablePath}`)

    try {
      const content = fs.readFileSync(composablePath, 'utf8')

      // 检查是否返回响应式对象
      if (!content.includes('return {') || !content.includes('ref(')) {
        this.warnings.push(`${composablePath}: 可能未正确使用响应式API`)
      }

      console.log('  ✅ 组合式函数验证完成')
    } catch (error) {
      this.errors.push(`${composablePath}: 文件读取失败 - ${error.message}`)
    }
  }

  /**
   * 执行完整验证
   */
  async validate() {
    console.log('🚀 开始VidSlide AI约束验证')
    console.log('='.repeat(50))

    // 验证AIContentAnalyzer组件
    this.validateVueComponent('./src/components/AIContentAnalyzer.vue')
    this.validateTestFile('./src/components/AIContentAnalyzer.test.js')
    this.validateComposable('./src/composables/useContentAnalysis.js')

    // 输出结果
    this.printResults()

    return this.errors.length === 0
  }

  /**
   * 打印验证结果
   */
  printResults() {
    console.log('\n📊 验证结果:')
    console.log('='.repeat(30))

    if (this.errors.length > 0) {
      console.log('❌ 错误:')
      this.errors.forEach(error => console.log(`  • ${error}`))
    } else {
      console.log('✅ 没有发现错误')
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:')
      this.warnings.forEach(warning => console.log(`  • ${warning}`))
    }

    console.log(`\n🎯 验证状态: ${this.errors.length === 0 ? '通过' : '失败'}`)
  }
}

// 执行验证
async function main() {
  const validator = new ConstraintValidator()
  const passed = await validator.validate()

  if (!passed) {
    console.log('\n❌ 约束验证失败，请修复上述问题')
    process.exit(1)
  } else {
    console.log('\n✅ 约束验证通过')
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default ConstraintValidator
