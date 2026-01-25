/**
 * 素材搜索服务
 *
 * 功能：
 * 1. 根据关键词搜索相关素材（图片）
 * 2. 支持多个API源（百度图片, Unsplash, Pexels）
 * 3. 自动缓存下载的素材
 * 4. 智能降级策略
 *
 * API优先级：
 * - 百度图片搜索 (中文支持最好，免费无限制) ⭐
 * - Unsplash (高质量，艺术性强，50次/小时)
 * - Pexels (商业素材，200次/小时)
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MaterialSearchService {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.cacheDir = options.cacheDir || path.join(__dirname, '../../../cache/materials');
    this.unsplashKey = options.unsplashKey || process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsKey = options.pexelsKey || process.env.PEXELS_API_KEY;

    // 缓存索引：keyword -> localPath
    this.cacheIndex = new Map();

    // 确保缓存目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      this.logger.info('✅ MaterialSearchService: 缓存目录已创建');
    }

    // 加载缓存索引
    this.loadCacheIndex();

    this.logger.info('✅ MaterialSearchService 初始化完成');
    this.logger.info(`  缓存目录: ${this.cacheDir}`);
    this.logger.info(`  已缓存素材: ${this.cacheIndex.size}个`);
  }

  /**
   * 搜索素材（主方法）
   * @param {string} keyword - 关键词
   * @returns {Promise<string>} 素材本地路径
   */
  async searchMaterial(keyword) {
    this.logger.info(`🔍 搜索素材: "${keyword}"`);

    // 1. 检查缓存
    if (this.cacheIndex.has(keyword)) {
      const cachedPath = this.cacheIndex.get(keyword);
      if (fs.existsSync(cachedPath)) {
        this.logger.info(`  ✅ 使用缓存素材: ${path.basename(cachedPath)}`);
        return cachedPath;
      } else {
        // 缓存文件不存在，移除索引
        this.cacheIndex.delete(keyword);
      }
    }

    // 2. 调用API搜索（关键词→图片）
    let imageUrl = null;
    let source = null;

    // ⭐ 优先百度图片（中文支持最好，素材丰富，免费无限制）
    try {
      const result = await this.searchBaiduImage(keyword);
      if (result) {
        imageUrl = result.url;
        source = 'Baidu';
        this.logger.info(`  ✅ 百度图片找到素材`);
      }
    } catch (error) {
      this.logger.warn(`  ⚠️ 百度图片搜索失败: ${error.message}`);
    }

    // 备选Unsplash（高质量，艺术性强）
    if (!imageUrl && this.unsplashKey) {
      try {
        const result = await this.searchUnsplash(keyword);
        if (result) {
          imageUrl = result.url;
          source = 'Unsplash';
          this.logger.info(`  ✅ Unsplash找到素材`);
        }
      } catch (error) {
        this.logger.warn(`  ⚠️ Unsplash搜索失败: ${error.message}`);
      }
    }

    // 备选Pexels（商业素材，免费配额更高：200次/小时）
    if (!imageUrl && this.pexelsKey) {
      try {
        const result = await this.searchPexels(keyword);
        if (result) {
          imageUrl = result.url;
          source = 'Pexels';
          this.logger.info(`  ✅ Pexels找到素材`);
        }
      } catch (error) {
        this.logger.warn(`  ⚠️ Pexels搜索失败: ${error.message}`);
      }
    }

    // 3. 下载并缓存
    if (imageUrl) {
      const localPath = await this.downloadAndCache(imageUrl, keyword, source);
      this.logger.info(`  ✅ 素材已缓存: ${path.basename(localPath)}`);
      return localPath;
    }

    // 4. 降级：使用默认素材
    this.logger.warn(`  ⚠️ 所有API都失败，使用默认素材`);
    return this.getDefaultMaterial();
  }

  /**
   * ⭐ 搜索百度图片（acjson API - 关键词搜索）
   * @param {string} keyword - 关键词
   * @returns {Promise<Object>} { url, title }
   */
  async searchBaiduImage(keyword) {
    const response = await axios.get('https://image.baidu.com/search/acjson', {
      params: {
        tn: 'resultjson_com',
        ipn: 'rj',
        word: keyword,
        pn: 0, // 页码
        rn: 1 // 返回数量
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer: 'https://image.baidu.com'
      },
      timeout: 10000
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const image = response.data.data[0];
      return {
        url: image.thumbURL || image.middleURL || image.objURL, // 缩略图、中图或原图
        title: image.fromPageTitle || keyword
      };
    }

    return null;
  }

  /**
   * 搜索Unsplash
   * @param {string} keyword - 关键词
   * @returns {Promise<Object>} { url, author, description }
   */
  async searchUnsplash(keyword) {
    // 翻译中文关键词
    const searchKeyword = await this.translateKeyword(keyword);

    const response = await axios.get(
      'https://api.unsplash.com/search/photos',
      {
        params: {
          query: searchKeyword,
          per_page: 1,
          orientation: 'landscape',
          content_filter: 'high' // 高质量内容
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashKey}`
        },
        timeout: 10000
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const photo = response.data.results[0];
      return {
        url: photo.urls.regular,
        author: photo.user.name,
        description: photo.description || photo.alt_description
      };
    }

    return null;
  }

  /**
   * 搜索Pexels
   * @param {string} keyword - 关键词
   * @returns {Promise<Object>} { url, photographer }
   */
  async searchPexels(keyword) {
    // 翻译中文关键词
    const searchKeyword = await this.translateKeyword(keyword);

    const response = await axios.get(
      'https://api.pexels.com/v1/search',
      {
        params: {
          query: searchKeyword,
          per_page: 1,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': this.pexelsKey
        },
        timeout: 10000
      }
    );

    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      return {
        url: photo.src.large2x,
        photographer: photo.photographer
      };
    }

    return null;
  }

  /**
   * 下载并缓存图片
   * @param {string} imageUrl - 图片URL
   * @param {string} keyword - 关键词
   * @param {string} source - 来源（Unsplash/Pexels）
   * @returns {Promise<string>} 本地路径
   */
  async downloadAndCache(imageUrl, keyword, source) {
    // 生成文件名（使用MD5避免文件名过长）
    const hash = crypto.createHash('md5').update(keyword).digest('hex');
    const filename = `material_${hash}.jpg`;
    const localPath = path.join(this.cacheDir, filename);

    this.logger.info(`  📥 下载素材: ${source}`);

    try {
      // 下载图片
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      // 保存到本地
      fs.writeFileSync(localPath, response.data);

      // 更新缓存索引
      this.cacheIndex.set(keyword, localPath);
      this.saveCacheIndex();

      this.logger.info(`  💾 素材已保存: ${filename}`);
      return localPath;

    } catch (error) {
      this.logger.error(`  ❌ 下载失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 翻译关键词（中文→英文）
   * @param {string} keyword - 关键词
   * @returns {Promise<string>} 英文关键词
   */
  async translateKeyword(keyword) {
    // 简单的映射表
    const translations = {
      '抖音': 'tiktok social media interface',
      '流量': 'traffic data analytics',
      '获客': 'customer acquisition funnel',
      '推送': 'push notification mobile',
      '营销': 'digital marketing strategy',
      '转化': 'conversion rate optimization',
      '用户': 'user experience interface',
      '增长': 'growth chart analytics',
      '数据': 'data visualization dashboard',
      '算法': 'algorithm flowchart diagram',
      '社交': 'social media network',
      '电商': 'ecommerce online shopping',
      '品牌': 'brand identity design',
      '内容': 'content creation media',
      '视频': 'video production editing',
      '直播': 'live streaming broadcast',
      '粉丝': 'followers audience engagement',
      '运营': 'operations management system',
      '策略': 'strategy planning business',
      '分析': 'analytics report dashboard'
    };

    // 如果有精确匹配，使用映射
    if (translations[keyword]) {
      return translations[keyword];
    }

    // 尝试部分匹配
    for (const [cn, en] of Object.entries(translations)) {
      if (keyword.includes(cn)) {
        return en + ' ' + keyword.replace(cn, '');
      }
    }

    // 如果都没有匹配，返回原关键词 + 通用修饰词
    return keyword + ' business technology professional';
  }

  /**
   * 获取默认素材
   * @returns {string} 默认素材路径
   */
  getDefaultMaterial() {
    // 使用项目中的默认背景图
    const defaultPath = path.join(__dirname, '../../assets/backgrounds/bg1.jpg');

    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }

    // 如果默认背景不存在，生成一个简单的占位图
    return this.generatePlaceholder();
  }

  /**
   * 生成占位图
   * @returns {string} 占位图路径
   */
  generatePlaceholder() {
    // 这里可以用Canvas生成一个简单的占位图
    // 暂时返回null，由调用方处理
    this.logger.warn('  ⚠️ 未找到默认素材，需要生成占位图');
    return null;
  }

  /**
   * 加载缓存索引
   */
  loadCacheIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');

    if (fs.existsSync(indexPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        this.cacheIndex = new Map(Object.entries(data));
        this.logger.info(`  📚 加载缓存索引: ${this.cacheIndex.size}个素材`);
      } catch (error) {
        this.logger.warn(`  ⚠️ 缓存索引加载失败: ${error.message}`);
        this.cacheIndex = new Map();
      }
    }
  }

  /**
   * 保存缓存索引
   */
  saveCacheIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');

    try {
      const data = Object.fromEntries(this.cacheIndex);
      fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error(`  ❌ 缓存索引保存失败: ${error.message}`);
    }
  }

  /**
   * 预热常用关键词
   * @param {Array<string>} keywords - 关键词列表
   */
  async warmupCache(keywords) {
    this.logger.info(`🔥 预热缓存: ${keywords.length}个关键词`);

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      this.logger.info(`  [${i + 1}/${keywords.length}] 预热: ${keyword}`);

      try {
        await this.searchMaterial(keyword);
      } catch (error) {
        this.logger.warn(`  ⚠️ 预热失败: ${keyword} - ${error.message}`);
      }

      // 避免API限流，间隔1秒
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.logger.info(`  ✅ 预热完成，已缓存: ${this.cacheIndex.size}个素材`);
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.jpg'));
    const totalSize = files.reduce((sum, file) => {
      const stats = fs.statSync(path.join(this.cacheDir, file));
      return sum + stats.size;
    }, 0);

    return {
      count: this.cacheIndex.size,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      keywords: Array.from(this.cacheIndex.keys())
    };
  }
}

export default MaterialSearchService;
