/**
 * 文字渲染服务
 * 在视频上渲染美化的文字（标题、关键词等）
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TextRendererService {
  constructor() {
    this.name = 'TextRendererService';
    this.cacheDir = path.join(__dirname, '../../../cache/text-renders');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // 默认字体路径（macOS 系统字体）
    this.defaultFont = '/System/Library/Fonts/PingFang.ttc';
  }

  /**
   * 在视频上添加文字
   * @param {string} videoPath - 视频路径
   * @param {Array} textLayers - 文字图层列表
   * @returns {Promise<string>} 添加文字后的视频路径
   */
  async addTextToVideo(videoPath, textLayers = []) {
    console.log(`📝 添加文字图层: ${textLayers.length} 个`);

    if (textLayers.length === 0) {
      console.log('  ⚠️ 没有文字需要添加');
      return videoPath;
    }

    const outputPath = path.join(this.cacheDir, `text_${Date.now()}.mp4`);

    try {
      // 构建 FFmpeg drawtext 滤镜
      const drawtextFilters = textLayers.map((layer, index) => {
        return this.buildDrawtextFilter(layer, index);
      }).join(',');

      const cmd = `ffmpeg -i "${videoPath}" -vf "${drawtextFilters}" -c:a copy -preset fast "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 文字添加完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 文字添加失败:', error);
      return videoPath; // 返回原视频
    }
  }

  /**
   * 构建 drawtext 滤镜字符串
   * @param {Object} layer - 文字图层配置
   * @param {number} index - 图层索引
   * @returns {string} drawtext 滤镜字符串
   */
  buildDrawtextFilter(layer, index) {
    const {
      text = '',
      x = 'center',
      y = 100,
      fontSize = 48,
      fontColor = 'white',
      shadowColor = 'black',
      shadowX = 2,
      shadowY = 2,
      borderWidth = 2,
      borderColor = 'black',
      startTime = 0,
      endTime = 999999
    } = layer;

    // 转义特殊字符
    const escapedText = text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,');

    // 构建 drawtext 参数
    const params = [
      `fontfile='${this.defaultFont}'`,
      `text='${escapedText}'`,
      `fontsize=${fontSize}`,
      `fontcolor=${fontColor}`,
      `x=(w-text_w)/2`, // 居中
      `y=${y}`,
      `shadowcolor=${shadowColor}`,
      `shadowx=${shadowX}`,
      `shadowy=${shadowY}`,
      `borderw=${borderWidth}`,
      `bordercolor=${borderColor}`,
      `enable='between(t,${startTime},${endTime})'`
    ];

    return `drawtext=${params.join(':')}`;
  }

  /**
   * 添加标题文字
   * @param {string} videoPath - 视频路径
   * @param {string} title - 标题文字
   * @param {Object} options - 选项
   * @returns {Promise<string>} 添加标题后的视频路径
   */
  async addTitle(videoPath, title, options = {}) {
    console.log(`📝 添加标题: ${title}`);

    const textLayer = {
      text: title,
      x: 'center',
      y: options.y || 100,
      fontSize: options.fontSize || 60,
      fontColor: options.fontColor || 'white',
      shadowColor: 'black',
      shadowX: 3,
      shadowY: 3,
      borderWidth: 3,
      borderColor: 'black',
      startTime: options.startTime || 0,
      endTime: options.endTime || 999999
    };

    return await this.addTextToVideo(videoPath, [textLayer]);
  }

  /**
   * 添加关键词文字
   * @param {string} videoPath - 视频路径
   * @param {Array} keywords - 关键词列表
   * @param {Object} options - 选项
   * @returns {Promise<string>} 添加关键词后的视频路径
   */
  async addKeywords(videoPath, keywords = [], options = {}) {
    console.log(`📝 添加关键词: ${keywords.join(', ')}`);

    if (keywords.length === 0) {
      return videoPath;
    }

    // 将关键词组合成一行
    const keywordsText = keywords.map(k => `#${k}`).join('  ');

    const textLayer = {
      text: keywordsText,
      x: 'center',
      y: options.y || 1700, // 底部
      fontSize: options.fontSize || 36,
      fontColor: options.fontColor || '#00d4ff', // 科技蓝色
      shadowColor: 'black',
      shadowX: 2,
      shadowY: 2,
      borderWidth: 2,
      borderColor: 'black',
      startTime: options.startTime || 0,
      endTime: options.endTime || 999999
    };

    return await this.addTextToVideo(videoPath, [textLayer]);
  }

  /**
   * 添加标题和关键词
   * @param {string} videoPath - 视频路径
   * @param {string} title - 标题
   * @param {Array} keywords - 关键词列表
   * @param {Object} options - 选项
   * @returns {Promise<string>} 添加文字后的视频路径
   */
  async addTitleAndKeywords(videoPath, title, keywords = [], options = {}) {
    console.log(`📝 添加标题和关键词`);

    const textLayers = [];

    // 标题图层
    if (title) {
      textLayers.push({
        text: title,
        x: 'center',
        y: options.titleY || 100,
        fontSize: options.titleFontSize || 60,
        fontColor: options.titleColor || 'white',
        shadowColor: 'black',
        shadowX: 3,
        shadowY: 3,
        borderWidth: 3,
        borderColor: 'black',
        startTime: options.startTime || 0,
        endTime: options.endTime || 999999
      });
    }

    // 关键词图层
    if (keywords.length > 0) {
      const keywordsText = keywords.map(k => `#${k}`).join('  ');
      textLayers.push({
        text: keywordsText,
        x: 'center',
        y: options.keywordsY || 1700,
        fontSize: options.keywordsFontSize || 36,
        fontColor: options.keywordsColor || '#00d4ff',
        shadowColor: 'black',
        shadowX: 2,
        shadowY: 2,
        borderWidth: 2,
        borderColor: 'black',
        startTime: options.startTime || 0,
        endTime: options.endTime || 999999
      });
    }

    return await this.addTextToVideo(videoPath, textLayers);
  }
}

export default TextRendererService;
