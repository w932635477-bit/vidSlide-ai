import ProjectManager from './agents/coordinator/ProjectManager.js';

/**
 * VidSlide AI - 多智能体蜂群系统入口
 *
 * 使用示例：
 *
 * import { generateVideo } from './src/index.js';
 *
 * const result = await generateVideo('/path/to/video.mp4', {
 *   allowRework: true,
 *   cacheDir: '.cache',
 *   outputDir: 'output'
 * });
 *
 * if (result.success) {
 *   console.log('视频生成成功:', result.videoPath);
 *   console.log('质量评分:', result.qualityScore);
 * }
 */

/**
 * 生成视频（主入口函数）
 * @param {string} videoPath - 输入视频路径
 * @param {Object} options - 配置选项
 * @param {boolean} options.allowRework - 是否允许返工（默认false）
 * @param {string} options.cacheDir - 缓存目录（默认.cache）
 * @param {string} options.outputDir - 输出目录（默认output）
 * @param {string} options.logLevel - 日志级别（默认info）
 * @returns {Promise<Object>} 执行结果
 */
export async function generateVideo(videoPath, options = {}) {
  // 创建项目经理实例
  const pm = new ProjectManager({
    cacheManager: {
      cacheDir: options.cacheDir || '.cache'
    },
    logger: {
      logLevel: options.logLevel || 'info'
    }
  });

  // 执行视频生成
  const result = await pm.execute(videoPath, {
    allowRework: options.allowRework || false
  });

  return result;
}

/**
 * 获取系统状态
 * @returns {Object} 系统状态
 */
export function getSystemStatus() {
  const pm = new ProjectManager();
  return pm.getStatus();
}

// 导出ProjectManager供高级用户使用
export { ProjectManager };

// 默认导出
export default {
  generateVideo,
  getSystemStatus,
  ProjectManager
};
