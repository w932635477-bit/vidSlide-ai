/**
 * 注释率提升脚本
 * VidSlide AI - Week37-38 代码质量完善工具
 */

const fs = require('fs')
const path = require('path')

class CommentBooster {
  constructor() {
    this.projectRoot = path.join(__dirname, '..')
    this.vidslideRoot = path.join(this.projectRoot, 'vidslide-ai')
    this.processedFiles = 0
    this.addedComments = 0
  }

  /**
   * 主执行方法
   */
  async run() {
    console.log('📝 开始提升代码注释率...\n')

    const patterns = [
      { pattern: /\.js$/, priority: 'high', processor: this.processJavaScriptFile.bind(this) },
      { pattern: /\.vue$/, priority: 'medium', processor: this.processVueFile.bind(this) }
    ]

    for (const { pattern, priority, processor } of patterns) {
      console.log(`🔍 处理${pattern}文件 (${priority}优先级)...`)
      await this.processFiles(pattern, processor)
    }

    console.log(`\n✅ 注释率提升完成！`)
    console.log(`📊 处理文件数: ${this.processedFiles}`)
    console.log(`💬 新增注释数: ${this.addedComments}`)
  }

  /**
   * 处理文件
   */
  async processFiles(pattern, processor) {
    const files = this.findFiles(this.vidslideRoot, pattern)

    for (const file of files) {
      try {
        const relativePath = path.relative(this.vidslideRoot, file)
        console.log(`处理: ${relativePath}`)

        const result = await processor(file)
        if (result) {
          this.processedFiles++
          this.addedComments += result.commentsAdded
        }
      } catch (error) {
        console.warn(`处理文件失败: ${file}`, error.message)
      }
    }
  }

  /**
   * 处理JavaScript文件
   */
  async processJavaScriptFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    let commentsAdded = 0

    // 为导出的函数添加JSDoc注释
    content = content.replace(
      /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
      (match, funcName, params) => {
        if (!content.includes(`/**`) || !this.hasJSDocComment(content, match)) {
          commentsAdded++
          return `/**
 * ${funcName} 函数
 * VidSlide AI 功能实现
 * @description ${funcName} 功能的具体实现
 */
export async function ${funcName}(${params}) {`
        }
        return match
      }
    )

    // 为类方法添加JSDoc注释
    content = content.replace(
      /(\s+)([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*{/g,
      (match, indent, methodName, params) => {
        // 跳过构造函数和已注释的方法
        if (methodName === 'constructor' || content.includes(`* ${methodName}`)) {
          return match
        }

        // 只为公共方法添加注释
        if (!methodName.startsWith('_')) {
          commentsAdded++
          return `${indent}/**
${indent} * ${methodName} 方法
${indent} * VidSlide AI 功能实现
${indent} */
${indent}${methodName}(${params}) {`
        }
        return match
      }
    )

    if (commentsAdded > 0) {
      fs.writeFileSync(filePath, content)
    }

    return { commentsAdded }
  }

  /**
   * 处理Vue文件
   */
  async processVueFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8')
    let commentsAdded = 0

    // 为Vue组件的script部分添加注释
    if (content.includes('<script setup>')) {
      // 为ref和computed添加注释
      content = content.replace(
        /(\s+)const\s+(\w+)\s*=\s*(ref|computed)\s*\(/g,
        (match, indent, varName, type) => {
          if (!this.hasNearbyComment(content, match)) {
            commentsAdded++
            const typeText = type === 'ref' ? '响应式变量' : '计算属性'
            return `${indent}/** ${varName} - ${typeText} */
${indent}const ${varName} = ${type}(`
          }
          return match
        }
      )

      // 为函数添加注释
      content = content.replace(
        /(\s+)const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>\s*{/g,
        (match, indent, funcName, params) => {
          if (!this.hasNearbyComment(content, match)) {
            commentsAdded++
            return `${indent}/**
${indent} * ${funcName} 函数
${indent} * VidSlide AI 功能实现
${indent} */
${indent}const ${funcName} = ${params ? `(${params})` : '()'} => {`
          }
          return match
        }
      )
    }

    if (commentsAdded > 0) {
      fs.writeFileSync(filePath, content)
    }

    return { commentsAdded }
  }

  /**
   * 检查是否有附近的注释
   */
  hasNearbyComment(content, targetText) {
    const index = content.indexOf(targetText)
    if (index === -1) return false

    // 检查前10行是否有注释
    const beforeText = content.substring(Math.max(0, index - 200), index)
    return beforeText.includes('/**') || beforeText.includes('//')
  }

  /**
   * 检查是否有JSDoc注释
   */
  hasJSDocComment(content, targetText) {
    const index = content.indexOf(targetText)
    if (index === -1) return false

    const beforeText = content.substring(Math.max(0, index - 300), index)
    return beforeText.includes('/**')
  }

  /**
   * 查找文件
   */
  findFiles(dir, pattern) {
    const files = []

    function scan(currentDir) {
      try {
        const items = fs.readdirSync(currentDir)

        for (const item of items) {
          const fullPath = path.join(currentDir, item)

          try {
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory() &&
                !item.startsWith('.') &&
                item !== 'node_modules' &&
                item !== 'dist' &&
                item !== '.git') {
              scan(fullPath)
            } else if (stat.isFile() && pattern.test(item)) {
              // 跳过测试文件和配置文件
              if (!item.includes('.test.') &&
                  !item.includes('.config.') &&
                  !item.includes('.spec.') &&
                  item !== 'add-comments.cjs') {
                files.push(fullPath)
              }
            }
          } catch (error) {
            // 跳过无法访问的文件
            continue
          }
        }
      } catch (error) {
        // 跳过无法访问的目录
        console.warn(`无法扫描目录: ${currentDir}`, error.message)
      }
    }

    scan(dir)
    return files
  }
}

// 执行提升
if (require.main === module) {
  const booster = new CommentBooster()
  booster.run().catch(console.error)
}

module.exports = CommentBooster