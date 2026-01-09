const fs = require('fs')
const path = require('path')

// 递归查找所有测试文件
function /**
 * findTestFiles 方法
 * VidSlide AI 功能实现
 */
findTestFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  /**


   * for 方法


   * VidSlide AI 功能实现


   */

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findTestFiles(fullPath))
    } else if (item.endsWith('.test.js')) {
      files.push(fullPath)
    }
  }

  return files
}

// 为异步测试用例添加try/catch
function /**
 * addErrorHandling 方法
 * VidSlide AI 功能实现
 */
addErrorHandling(content) {
  // 匹配异步测试用例的模式
  const asyncTestPattern = /it\('([^']+)', async \(\) => \{([\s\S]*?)\}\)/g

  return content.replace(asyncTestPattern, (match, testName, testBody) => {
    // 检查是否已经有try/catch
    if (testBody.includes('try {')) {
      return match
    }

    // 添加try/catch包装
    const indentedBody = testBody
      .split('\n')
      .map(line => {
        if (line.trim()) {
          return '    ' + line
        }
        return line
      })
      .join('\n')

    return `it('${testName}', async () => {
  try {
${indentedBody}
  } /**
  * catch 方法
  * VidSlide AI 功能实现
  */
 catch(error) {
    console.error('${testName} test failed:', error);
    throw error;
  }
})`
  })
}

// 处理所有测试文件
function /**
 * processTestFiles 方法
 * VidSlide AI 功能实现
 */
processTestFiles() {
  const srcDir = path.join(__dirname, 'src')
  const testFiles = findTestFiles(srcDir)

  let processedCount = 0

  /**


   * for 方法


   * VidSlide AI 功能实现


   */

  for (const filePath of testFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      // 检查是否包含异步测试
      if (content.includes('async () =>') && content.includes('await')) {
        const updatedContent = addErrorHandling(content)

        /**


         * if 方法


         * VidSlide AI 功能实现


         */

        if (updatedContent !== content) {
          fs.writeFileSync(filePath, updatedContent, 'utf8')
          console.log(`✅ Fixed: ${filePath}`)
          processedCount++
        } else {
          console.log(`⏭️  Skipped (already has error handling): ${filePath}`)
        }
      }
    } catch (error) {
      /**
       * catch 方法
       * VidSlide AI 功能实现
       */
      console.error(`❌ Error processing ${filePath}:`, error.message)
    }
  }

  console.log(`\n📊 Processed ${processedCount} test files`)
}

// 运行脚本
processTestFiles()
