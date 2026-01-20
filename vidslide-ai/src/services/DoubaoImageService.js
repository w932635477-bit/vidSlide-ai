/**
 * 豆包图像生成服务
 * 调用豆包API生成图片，替代素材搜索
 *
 * 注意：此服务仅在 Node.js 环境中可用
 */

// 检测环境
const isBrowser = typeof window !== 'undefined';

class DoubaoImageService {
  constructor() {
    // 检测环境
    this.isBrowser = isBrowser;
    this.initialized = false;

    if (this.isBrowser) {
      console.log('⚠️ DoubaoImageService 运行在浏览器环境，所有功能不可用');
    }

    // 统计信息
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      cacheHits: 0,
      totalTokens: 0
    };
  }

  /**
   * 初始化 Node.js 环境（延迟加载）
   */
  async initialize() {
    if (this.isBrowser || this.initialized) {
      return;
    }

    try {
      // 动态导入 Node.js 模块 - 使用 @vite-ignore 避免 Vite 扫描
      const importModule = (name) => import(/* @vite-ignore */ name).catch(() => null);

      const modules = await Promise.all([
        importModule('https'),
        importModule('fs'),
        importModule('path'),
        importModule('crypto'),
        importModule('url')
      ]);

      if (modules.some(m => !m)) {
        console.warn('⚠️ 部分 Node.js 模块加载失败，DoubaoImageService 功能受限');
        return;
      }

      this.https = modules[0].default;
      this.fs = modules[1].default;
      this.path = modules[2].default;
      this.crypto = modules[3].default;

      // 导入其他服务
      const { getInstance: getPromptOptimizer } = await import('./PromptOptimizer.js');
      const { getInstance: getAdvancedPromptGenerator } = await import('./AdvancedPromptGenerator.js');

      this.promptOptimizer = getPromptOptimizer();
      this.advancedPromptGenerator = getAdvancedPromptGenerator();

      // 从环境变量读取配置
      this.apiKey = process.env.DOUBAO_API_KEY;
      this.endpoint = process.env.DOUBAO_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
      this.model = process.env.DOUBAO_MODEL || 'doubao-seedream-4-5-251128';

      // 缓存目录
      const __filename = modules[4].fileURLToPath(import.meta.url);
      const __dirname = this.path.dirname(__filename);
      this.cacheDir = this.path.join(__dirname, '../../cache/doubao-images');
      this.ensureCacheDir();

      this.initialized = true;
      console.log('✅ DoubaoImageService 初始化完成');
    } catch (error) {
      console.error('❌ DoubaoImageService 初始化失败:', error.message);
    }
  }

  /**
   * 确保缓存目录存在
   */
  ensureCacheDir() {
    if (this.isBrowser || !this.fs) return;

    if (!this.fs.existsSync(this.cacheDir)) {
      this.fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成图片
   * @param {string} keyword - 关键词
   * @param {object} context - 上下文信息
   * @returns {Promise<string>} 图片URL
   */
  async generateImage(keyword, context = {}) {
    if (this.isBrowser) {
      console.log('⚠️ 浏览器环境不支持豆包生图');
      return null;
    }

    // 确保已初始化
    await this.initialize();

    this.stats.totalRequests++;

    try {
      console.log(`[DoubaoImageService] 开始生成图片: ${keyword}`);

      // 1. 检查缓存
      const cacheKey = this.getCacheKey(keyword, context);
      const cachedUrl = this.getFromCache(cacheKey);
      if (cachedUrl) {
        console.log(`[DoubaoImageService] 缓存命中: ${keyword}`);
        this.stats.cacheHits++;
        return cachedUrl;
      }

      // 2. 优化Prompt（使用AdvancedPromptGenerator生成高质量提示词）
      const useAdvanced = context.useAdvancedPrompt !== false; // 默认使用高级生成器
      const prompt = useAdvanced
        ? this.advancedPromptGenerator.generate(keyword, {
            stylePreset: context.stylePreset || 'tech',
            sceneType: context.sceneType || 'basic',
            includeEffects: context.includeEffects !== false,
            randomize: context.randomize !== false
          })
        : this.optimizePrompt(keyword, context);
      console.log(`[DoubaoImageService] 优化后的Prompt (${useAdvanced ? 'Advanced' : 'Basic'}): ${prompt}`);

      // 3. 调用豆包API
      const response = await this.callDoubaoAPI(prompt, {
        size: context.size || '1920x1920',
        quality: context.quality || 'standard',
        style: context.style || 'vivid'
      });

      // 4. 提取图片URL
      const imageUrl = response.data[0].url;
      console.log(`[DoubaoImageService] 图片生成成功: ${imageUrl.substring(0, 100)}...`);

      // 5. 缓存结果
      this.saveToCache(cacheKey, imageUrl);

      // 6. 更新统计
      this.stats.successCount++;
      if (response.usage) {
        this.stats.totalTokens += response.usage.total_tokens || 0;
      }

      return imageUrl;

    } catch (error) {
      this.stats.failureCount++;
      console.error(`[DoubaoImageService] 图片生成失败:`, error.message);
      throw error;
    }
  }

  /**
   * 批量生成图片
   * @param {Array<{keyword: string, context: object}>} requests - 请求列表
   * @returns {Promise<Array<string>>} 图片URL列表
   */
  async generateImages(requests) {
    if (this.isBrowser) {
      console.log('⚠️ 浏览器环境不支持豆包生图');
      return requests.map(() => null);
    }

    console.log(`[DoubaoImageService] 批量生成 ${requests.length} 张图片`);

    const results = [];
    for (const request of requests) {
      try {
        const imageUrl = await this.generateImage(request.keyword, request.context);
        results.push(imageUrl);
      } catch (error) {
        console.error(`[DoubaoImageService] 批量生成失败: ${request.keyword}`, error.message);
        results.push(null);
      }
    }

    return results;
  }

  /**
   * 优化Prompt（使用PromptOptimizer，用于简单场景）
   * 注意：默认情况下会使用AdvancedPromptGenerator，这个方法作为备用
   * @param {string} keyword - 关键词
   * @param {object} context - 上下文
   * @returns {string} 优化后的Prompt
   */
  optimizePrompt(keyword, context = {}) {
    return this.promptOptimizer.optimize(keyword, context);
  }

  /**
   * 调用豆包API
   * @param {string} prompt - Prompt
   * @param {object} options - 选项
   * @returns {Promise<object>} API响应
   */
  async callDoubaoAPI(prompt, options = {}) {
    if (this.isBrowser) {
      throw new Error('浏览器环境不支持调用豆包API');
    }

    if (!this.apiKey) {
      throw new Error('DOUBAO_API_KEY 未配置');
    }

    const url = new URL(this.endpoint);
    const postData = JSON.stringify({
      model: this.model,
      prompt: prompt,
      n: 1,
      size: options.size || '1920x1920',
      quality: options.quality || 'standard',
      style: options.style || 'vivid'
    });

    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = this.https.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);

            if (res.statusCode === 200) {
              resolve(jsonData);
            } else {
              reject(new Error(`API错误 (${res.statusCode}): ${JSON.stringify(jsonData)}`));
            }
          } catch (e) {
            reject(new Error(`解析响应失败: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`网络错误: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * 获取缓存键
   * @param {string} keyword - 关键词
   * @param {object} context - 上下文
   * @returns {string} 缓存键
   */
  getCacheKey(keyword, context = {}) {
    if (this.isBrowser || !this.crypto) {
      return '';
    }

    const key = `${keyword}_${context.sceneType || 'basic'}_${context.size || '1920x1920'}`;
    return this.crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * 从缓存获取
   * @param {string} cacheKey - 缓存键
   * @returns {string|null} 图片URL或null
   */
  getFromCache(cacheKey) {
    if (this.isBrowser || !this.fs || !this.path) {
      return null;
    }

    const cacheFile = this.path.join(this.cacheDir, `${cacheKey}.json`);

    if (this.fs.existsSync(cacheFile)) {
      try {
        const data = JSON.parse(this.fs.readFileSync(cacheFile, 'utf-8'));

        // 检查缓存是否过期（24小时）
        const age = Date.now() - data.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          return data.imageUrl;
        }
      } catch (error) {
        console.error(`[DoubaoImageService] 读取缓存失败:`, error.message);
      }
    }

    return null;
  }

  /**
   * 保存到缓存
   * @param {string} cacheKey - 缓存键
   * @param {string} imageUrl - 图片URL
   */
  saveToCache(cacheKey, imageUrl) {
    if (this.isBrowser || !this.fs || !this.path) {
      return;
    }

    const cacheFile = this.path.join(this.cacheDir, `${cacheKey}.json`);

    try {
      const data = {
        imageUrl: imageUrl,
        timestamp: Date.now()
      };
      this.fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`[DoubaoImageService] 保存缓存失败:`, error.message);
    }
  }

  /**
   * 获取统计信息
   * @returns {object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheHitRate: this.stats.totalRequests > 0
        ? (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      successRate: this.stats.totalRequests > 0
        ? (this.stats.successCount / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * 清空缓存
   */
  clearCache() {
    if (this.isBrowser || !this.fs || !this.path) {
      console.log('[DoubaoImageService] 浏览器环境不支持清空缓存');
      return;
    }

    try {
      const files = this.fs.readdirSync(this.cacheDir);
      for (const file of files) {
        this.fs.unlinkSync(this.path.join(this.cacheDir, file));
      }
      console.log(`[DoubaoImageService] 缓存已清空`);
    } catch (error) {
      console.error(`[DoubaoImageService] 清空缓存失败:`, error.message);
    }
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new DoubaoImageService();
  }
  return instance;
}

export { DoubaoImageService };
export default DoubaoImageService;
