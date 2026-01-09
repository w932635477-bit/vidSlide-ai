#!/usr/bin/env node

/**
 * VidSlide AI 约束检查器
 * 检查代码是否符合.cursor-constraints.md约束文档
 */

const fs = require('fs')
const path = require('path')

class ConstraintChecker {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..')
    this.violations = []
    this.warnings = []
  }

  /**
   * 执行完整约束检查
   */
  async checkAll() {
    console.log('🔍 VidSlide AI 约束检查器启动...\n')

    // 1. 检查技术栈合规性
    await this.checkTechStack()

    // 2. 检查测试覆盖率
    await this.checkTestCoverage()

    // 3. 检查代码质量
    await this.checkCodeQuality()

    // 4. 检查功能范围
    await this.checkFeatureScope()

    // 5. 检查开发阶段合规性
    await this.checkDevelopmentStage()

    // 输出结果
    this.printResults()

    return this.violations.length === 0
  }

  /**
   * 检查技术栈合规性
   */
  async checkTechStack() {
    console.log('📦 检查技术栈合规性...')

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      )

      const forbiddenDeps = ['react', 'angular', 'vuex', 'redux', 'firebase']

      // 检查禁止的依赖
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      for (const dep of Object.keys(allDeps)) {
        if (forbiddenDeps.some(forbidden => dep.includes(forbidden))) {
          this.violations.push({
            type: 'TECH_STACK',
            severity: 'ERROR',
            message: `发现禁止的依赖: ${dep}`,
            suggestion: '移除该依赖，使用技术文档允许的替代方案'
          })
        }
      }

      console.log('✅ 技术栈合规性检查完成')
    } catch (error) {
      this.warnings.push({
        type: 'FILE_READ',
        message: '无法读取package.json文件',
        error: error.message
      })
    }
  }

  /**
   * 检查测试覆盖率
   */
  async checkTestCoverage() {
    console.log('🧪 检查测试覆盖率...')

    const srcDir = path.join(this.projectRoot, 'src')
    const testFiles = this.findFiles(srcDir, /\.test\.js$/)

    if (testFiles.length === 0) {
      this.warnings.push({
        type: 'TEST_COVERAGE',
        message: '未发现任何测试文件',
        suggestion: '请编写对应的单元测试文件'
      })
      return
    }

    // 检查主要组件是否有测试
    const components = this.findFiles(path.join(srcDir, 'components'), /\.vue$/)
    const componentTests = components.filter(comp => {
      const testFile = comp.replace(/\.vue$/, '.test.js')
      return fs.existsSync(testFile)
    })

    const coverage = ((componentTests.length / components.length) * 100).toFixed(1)
    console.log(`📊 测试覆盖率: ${coverage}% (${componentTests.length}/${components.length})`)

    if (parseFloat(coverage) < 80) {
      this.violations.push({
        type: 'TEST_COVERAGE',
        severity: 'ERROR',
        message: `测试覆盖率不足: ${coverage}% (要求≥80%)`,
        suggestion: '为未测试的组件编写单元测试'
      })
    }

    console.log('✅ 测试覆盖率检查完成')
  }

  /**
   * 检查代码质量
   */
  async checkCodeQuality() {
    console.log('💅 检查代码质量...')

    const srcDir = path.join(this.projectRoot, 'src')
    const jsFiles = this.findFiles(srcDir, /\.(js|vue)$/)

    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8')

      // 检查异步操作错误处理
      const asyncOps = content.match(/await\s+\w+\./g)
      if (asyncOps && !content.includes('try') && !content.includes('catch')) {
        this.violations.push({
          type: 'ERROR_HANDLING',
          severity: 'WARNING',
          file: path.relative(this.projectRoot, file),
          message: '发现异步操作缺少错误处理',
          suggestion: '为异步操作添加try/catch或.catch()处理'
        })
      }

      // 检查代码注释率
      const lines = content.split('\n').filter(line => line.trim())
      const commentLines = lines.filter(
        line => line.trim().startsWith('//') || line.trim().startsWith('/*')
      )
      const commentRate = ((commentLines.length / lines.length) * 100).toFixed(1)

      if (parseFloat(commentRate) < 20) {
        this.warnings.push({
          type: 'COMMENT_RATE',
          file: path.relative(this.projectRoot, file),
          message: `代码注释率低: ${commentRate}% (建议≥20%)`
        })
      }
    }

    console.log('✅ 代码质量检查完成')
  }

  /**
   * 检查功能范围
   */
  async checkFeatureScope() {
    console.log('🎯 检查功能范围合规性...')

    // 检查是否实现了技术文档外的功能
    const srcDir = path.join(this.projectRoot, 'src')
    const components = this.findFiles(path.join(srcDir, 'components'), /\.vue$/)

    // 当前阶段允许的组件
    const allowedComponents = [
      'VideoUploader',
      'VideoPlayer',
      'Timeline',
      'MarkerEditor',
      'Transcriber',
      'FaceTracker',
      'SmartRecommender',
      'CompatibilityChecker'
    ]

    for (const component of components) {
      const componentName = path.basename(component, '.vue')
      if (!allowedComponents.includes(componentName)) {
        this.warnings.push({
          type: 'FEATURE_SCOPE',
          file: path.relative(this.projectRoot, component),
          message: `发现可能超出范围的组件: ${componentName}`,
          suggestion: '确认该组件是否在技术文档允许范围内'
        })
      }
    }

    // 检查V0设计文件是否符合约束
    await this.checkV0DesignCompliance()

    console.log('✅ 功能范围检查完成')
  }

  /**
   * 检查V0设计合规性
   */
  async checkV0DesignCompliance() {
    const designDir = path.join(this.projectRoot, 'design')

    if (!fs.existsSync(designDir)) {
      return // 没有设计目录，跳过检查
    }

    const designFiles = this.findFiles(designDir, /\.(figma|sketch|xd)$/)

    for (const designFile of designFiles) {
      // 检查设计文件名是否符合规范
      const fileName = path.basename(designFile)
      const allowedPatterns = [
        /^user-adjustment-panel-v\d+\.figma$/,
        /^template-selector-v\d+\.figma$/,
        /^pip-controls-v\d+\.figma$/
      ]

      const isValidName = allowedPatterns.some(pattern => pattern.test(fileName))
      if (!isValidName) {
        this.violations.push({
          type: 'V0_DESIGN',
          severity: 'WARNING',
          file: path.relative(this.projectRoot, designFile),
          message: `V0设计文件名不符合规范: ${fileName}`,
          suggestion: '使用规范的命名格式，如: user-adjustment-panel-v1.figma'
        })
      }

      // 检查是否提供了对应的实现规范文档
      const specFile = designFile.replace(/\.(figma|sketch|xd)$/, '-spec.md')
      if (!fs.existsSync(specFile)) {
        this.warnings.push({
          type: 'V0_DESIGN',
          file: path.relative(this.projectRoot, designFile),
          message: '缺少对应的实现规范文档',
          suggestion: '为每个V0设计文件创建对应的spec.md文档'
        })
      }
    }
  }

  /**
   * 检查开发阶段合规性
   */
  async checkDevelopmentStage() {
    console.log('📅 检查开发阶段合规性...')

    // 检查当前是否在紧急补齐阶段
    const currentStage = this.getCurrentStage()
    console.log(`📍 当前开发阶段: ${currentStage}`)

    // 检查是否实现了阶段外的功能
    if (currentStage === 'emergency-fill' && this.hasCommercialFeatures()) {
      this.violations.push({
        type: 'STAGE_COMPLIANCE',
        severity: 'ERROR',
        message: '在紧急补齐阶段发现商业化功能实现',
        suggestion: '暂停商业化功能开发，优先补齐核心功能'
      })
    }

    console.log('✅ 开发阶段检查完成')
  }

  /**
   * 获取当前开发阶段
   */
  getCurrentStage() {
    // 基于时间或其他标记判断当前阶段
    // 这里简化处理，默认在紧急补齐阶段
    return 'emergency-fill'
  }

  /**
   * 检查是否有商业化功能
   */
  hasCommercialFeatures() {
    // 检查是否有明确的水印、使用限制、用户等级等商业化功能
    const srcDir = path.join(this.projectRoot, 'src')
    const files = this.findFiles(srcDir, /\.(js|vue)$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      // 检查明确的商业化功能模式
      if (
        // 水印功能
        (content.includes('watermark') && content.includes('addWatermark')) ||
        // 使用限制
        (content.includes('exportLimit') && content.includes('maxExports')) ||
        // 用户等级系统
        (content.includes('USER_TIERS') && content.includes('PREMIUM')) ||
        // 4K导出
        (content.includes('4K') && content.includes('resolution')) ||
        // PPTX导出
        (content.includes('PptxGenJS') && content.includes('writeFile'))
      ) {
        return true
      }
    }
    return false
  }

  /**
   * 查找文件
   */
  findFiles(dir, pattern) {
    const files = []

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        // 跳过备份目录和隐藏目录
        if (item.includes('backup') || item.startsWith('.')) {
          continue
        }

        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory() && item !== 'node_modules') {
          traverse(fullPath)
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath)
        }
      }
    }

    traverse(dir)
    return files
  }

  /**
   * 输出检查结果
   */
  printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📋 VidSlide AI 约束检查结果')
    console.log('='.repeat(60))

    if (this.violations.length > 0) {
      console.log(`❌ 发现 ${this.violations.length} 个违反约束的问题:`)
      this.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.type} - ${violation.severity}`)
        console.log(`   ${violation.message}`)
        if (violation.file) console.log(`   文件: ${violation.file}`)
        if (violation.suggestion) console.log(`   建议: ${violation.suggestion}`)
      })
    } else {
      console.log('✅ 未发现约束违反问题')
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  发现 ${this.warnings.length} 个警告:`)
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type}`)
        console.log(`   ${warning.message}`)
        if (warning.file) console.log(`   文件: ${warning.file}`)
        if (warning.suggestion) console.log(`   建议: ${warning.suggestion}`)
      })
    }

    console.log('\n' + '='.repeat(60))

    if (this.violations.length > 0) {
      console.log('🚫 请修复上述违反约束的问题后再继续开发')
      process.exit(1)
    } else {
      console.log('🎉 约束检查通过，可以继续开发')
    }
  }
}

// 执行检查
if (require.main === module) {
  const checker = new ConstraintChecker()
  checker.checkAll().catch(error => {
    console.error('约束检查失败:', error)
    process.exit(1)
  })
}

module.exports = ConstraintChecker
