import fs from 'fs';
import path from 'path';

/**
 * ErrorMemory - 错误记忆系统
 *
 * 功能：
 * 1. 持久化错误和修正方案到JSON文件
 * 2. 自动更新AGENTS.md文档
 * 3. 统计错误趋势
 * 4. 提供修正建议
 */
class ErrorMemory {
  constructor(options = {}) {
    this.logger = options.logger || console;
    // ⭐ 修复Bug #4: 修正路径，避免嵌套vidslide-ai目录
    this.memoryFile = options.memoryFile || path.join(process.cwd(), 'ERROR_MEMORY.json');
    this.memory = this.load();
  }

  /**
   * 加载记忆
   * @returns {Object} 记忆数据
   */
  load() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.warn(`加载错误记忆失败: ${error.message}`);
    }

    // 返回默认结构
    return {
      errors: [],
      corrections: {},
      statistics: {
        totalErrors: 0,
        fixedErrors: 0,
        unfixedErrors: 0
      }
    };
  }

  /**
   * 保存记忆到文件
   */
  save() {
    try {
      // 确保目录存在
      const dir = path.dirname(this.memoryFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.memoryFile,
        JSON.stringify(this.memory, null, 2),
        'utf-8'
      );

      this.logger.info(`  💾 错误记忆已保存: ${this.memoryFile}`);
    } catch (error) {
      this.logger.error(`保存错误记忆失败: ${error.message}`);
    }
  }

  /**
   * 记录错误
   * @param {Object|string} violation - 违规对象或字符串
   * @param {string} category - 错误类别
   * @param {boolean} fixed - 是否已修复
   * @returns {string} 错误记录ID
   */
  recordError(violation, category, fixed = false) {
    const errorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      category: category,
      violation: violation.originalMessage || violation,
      severity: violation.severity || 'UNKNOWN',
      sceneId: violation.sceneId,
      fixed: fixed
    };

    this.memory.errors.push(errorRecord);
    this.memory.statistics.totalErrors++;

    if (fixed) {
      this.memory.statistics.fixedErrors++;
    } else {
      this.memory.statistics.unfixedErrors++;
    }

    this.save();
    return errorRecord.id;
  }

  /**
   * 记录修正方案
   * @param {string} category - 错误类别
   * @param {string} issue - 问题描述
   * @param {string} solution - 解决方案
   */
  recordCorrection(category, issue, solution) {
    if (!this.memory.corrections[category]) {
      this.memory.corrections[category] = [];
    }

    this.memory.corrections[category].push({
      issue: issue,
      solution: solution,
      timestamp: Date.now(),
      successCount: 0
    });

    this.save();
  }

  /**
   * 获取修正建议
   * @param {string} category - 错误类别
   * @returns {Array<Object>} 修正建议列表
   */
  getCorrections(category) {
    return this.memory.corrections[category] || [];
  }

  /**
   * 更新AGENTS.md文档
   * @param {string} agentsPath - AGENTS.md文件路径
   */
  updateAgentsDoc(agentsPath = 'vidslide-ai/AGENTS.md') {
    try {
      // 读取现有AGENTS.md
      let agentsContent = '';
      if (fs.existsSync(agentsPath)) {
        agentsContent = fs.readFileSync(agentsPath, 'utf-8');
      } else {
        this.logger.warn(`AGENTS.md 不存在: ${agentsPath}`);
        return;
      }

      // 生成错误修正章节
      const correctionSection = this.generateCorrectionSection();

      // 更新或追加
      if (agentsContent.includes('## 常见错误和修正')) {
        // 替换现有章节
        agentsContent = agentsContent.replace(
          /## 常见错误和修正[\s\S]*?(?=\n##|$)/,
          correctionSection
        );
      } else {
        // 追加新章节
        agentsContent += '\n\n' + correctionSection;
      }

      fs.writeFileSync(agentsPath, agentsContent, 'utf-8');
      this.logger.info(`  ✅ AGENTS.md 已更新: ${agentsPath}`);

    } catch (error) {
      this.logger.error(`更新AGENTS.md失败: ${error.message}`);
    }
  }

  /**
   * 生成修正章节内容
   * @returns {string} Markdown格式的章节内容
   */
  generateCorrectionSection() {
    let section = '## 常见错误和修正\n\n';
    section += '> 此章节由ErrorMemory系统自动生成和更新\n';
    section += `> **最后更新**: ${new Date().toISOString()}\n\n`;

    // 统计信息
    section += `### 错误统计\n\n`;
    section += `- 总错误数: ${this.memory.statistics.totalErrors}\n`;
    section += `- 已修复: ${this.memory.statistics.fixedErrors}\n`;
    section += `- 未修复: ${this.memory.statistics.unfixedErrors}\n`;

    if (this.memory.statistics.totalErrors > 0) {
      const fixRate = (this.memory.statistics.fixedErrors / this.memory.statistics.totalErrors * 100).toFixed(1);
      section += `- 自动修复率: ${fixRate}%\n`;
    }

    section += '\n';

    // 修正方案
    if (Object.keys(this.memory.corrections).length > 0) {
      section += `### 修正方案\n\n`;

      for (const [category, corrections] of Object.entries(this.memory.corrections)) {
        section += `#### ${category}\n\n`;

        corrections.forEach((correction, index) => {
          section += `${index + 1}. **${correction.issue}**\n`;
          section += `   - 解决方案: ${correction.solution}\n`;
          section += `   - 成功次数: ${correction.successCount}\n\n`;
        });
      }
    }

    // 高频错误
    const topErrors = this.getTopErrors();
    if (topErrors.length > 0) {
      section += `### 高频错误\n\n`;
      section += `| 错误类别 | 出现次数 |\n`;
      section += `|---------|----------|\n`;

      topErrors.forEach(item => {
        section += `| ${item.category} | ${item.count} |\n`;
      });

      section += '\n';
    }

    return section;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    return {
      ...this.memory.statistics,
      topErrors: this.getTopErrors(),
      recentErrors: this.memory.errors.slice(-10)
    };
  }

  /**
   * 获取高频错误
   * @returns {Array<Object>} 错误类别和计数
   */
  getTopErrors() {
    const counts = {};

    this.memory.errors.forEach(error => {
      const key = error.category;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * 清理旧错误记录
   * @param {number} daysToKeep - 保留天数
   */
  cleanOldErrors(daysToKeep = 30) {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const beforeCount = this.memory.errors.length;

    this.memory.errors = this.memory.errors.filter(
      error => error.timestamp > cutoffTime
    );

    const afterCount = this.memory.errors.length;
    const removed = beforeCount - afterCount;

    if (removed > 0) {
      this.logger.info(`  🗑️ 清理了 ${removed} 条旧错误记录（保留 ${daysToKeep} 天内的）`);
      this.save();
    }
  }

  /**
   * 导出错误报告
   * @param {string} outputPath - 输出文件路径
   */
  exportReport(outputPath) {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        statistics: this.memory.statistics,
        topErrors: this.getTopErrors(),
        corrections: this.memory.corrections,
        recentErrors: this.memory.errors.slice(-50)
      };

      fs.writeFileSync(
        outputPath,
        JSON.stringify(report, null, 2),
        'utf-8'
      );

      this.logger.info(`  📊 错误报告已导出: ${outputPath}`);
    } catch (error) {
      this.logger.error(`导出报告失败: ${error.message}`);
    }
  }
}

export default ErrorMemory;
