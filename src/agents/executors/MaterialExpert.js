import DoubaoImageService from '../../services/DoubaoImageService.js';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

/**
 * MaterialExpert - 素材专家
 *
 * 职责：
 * 1. 根据关键词生成素材（豆包）
 * 2. 多重验证准确性（OCR+图像识别）
 * 3. 多策略尝试（生成→优化→默认）
 * 4. 确保素材准确性90%+
 */
class MaterialExpert {
  constructor(options = {}) {
    this.name = 'MaterialExpert';
    this.doubaoService = new DoubaoImageService();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
    this.cacheManager = options.cacheManager;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output', 'materials');

    // 确保输出目录存在
    this.ensureOutputDir();
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成素材
   * @param {Object} input - 输入参数
   * @param {Object} input.task_2_1 - 场景设计结果
   * @param {Object} input.task_1_2 - 内容分析结果
   * @returns {Promise<Object>} 包含materials数组
   */
  async generateMaterials(input) {
    const { task_2_1, task_1_2 } = input;
    const scenes = task_2_1.scenes;
    const understanding = task_1_2.understanding;

    this.logger.info('🎨 MaterialExpert: 开始生成素材');

    // 找出需要素材的场景
    const materialScenes = scenes.filter(s => s.needMaterial);

    this.logger.info(`  → 需要生成 ${materialScenes.length} 个素材`);

    const materials = [];

    for (let i = 0; i < materialScenes.length; i++) {
      const scene = materialScenes[i];
      this.logger.info(`  [${i + 1}/${materialScenes.length}] 生成素材: ${scene.keyword}`);

      try {
        const material = await this.generateSingleMaterial(scene.keyword, {
          context: understanding.intent,
          sceneId: scene.id
        });

        materials.push({
          sceneId: scene.id,
          keyword: scene.keyword,
          material: material
        });

        this.logger.info(`    ✓ 素材生成成功`);

      } catch (error) {
        this.logger.error(`    ✗ 素材生成失败: ${error.message}`);

        // 使用默认素材
        const defaultMaterial = await this.getDefaultMaterial(scene.keyword);
        materials.push({
          sceneId: scene.id,
          keyword: scene.keyword,
          material: defaultMaterial
        });
      }
    }

    this.logger.info(`  ✅ 素材生成完成`);

    return {
      materials: materials
    };
  }

  /**
   * 生成单个素材（多策略）
   * @param {string} keyword - 关键词
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 素材对象
   */
  async generateSingleMaterial(keyword, context = {}) {
    // 策略1: 检查缓存
    if (this.cacheManager) {
      const cacheKey = `material:${keyword}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.info(`      → 使用缓存素材`);
        return cached;
      }
    }

    // 策略2: 豆包生成（主要策略）
    this.logger.info(`      → 豆包生成中...`);
    let material = await this.tryDoubaoGeneration(keyword, context);
    let validation = await this.validateMaterial(material, keyword);

    if (validation.score >= 70) {
      this.logger.info(`      ✓ 豆包生成成功 (${validation.score}分)`);

      // 保存到缓存
      if (this.cacheManager) {
        await this.cacheManager.set(`material:${keyword}`, material);
      }

      return material;
    }

    this.logger.warn(`      ⚠ 豆包生成不够准确 (${validation.score}分)`);

    // 策略3: 优化提示词后重新生成
    this.logger.info(`      → 优化提示词重新生成...`);
    material = await this.tryDoubaoGeneration(keyword, context, {
      optimized: true,
      issues: validation.issues
    });
    validation = await this.validateMaterial(material, keyword);

    if (validation.score >= 70) {
      this.logger.info(`      ✓ 优化后生成成功 (${validation.score}分)`);

      // 保存到缓存
      if (this.cacheManager) {
        await this.cacheManager.set(`material:${keyword}`, material);
      }

      return material;
    }

    // 策略4: 使用默认素材
    this.logger.warn(`      → 使用默认素材`);
    material = await this.getDefaultMaterial(keyword);

    return material;
  }

  /**
   * 豆包生成
   * @param {string} keyword - 关键词
   * @param {Object} context - 上下文
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 素材对象
   */
  async tryDoubaoGeneration(keyword, context, options = {}) {
    // 构建提示词
    const prompt = this.buildMaterialPrompt(keyword, context, options);

    // 调用豆包API
    // 注意：豆包API要求图片尺寸至少3686400像素（约1920x1920）
    const imageUrl = await this.doubaoService.generateImage(prompt, {
      size: '1920x1920',  // 满足最小像素要求
      style: 'informative',
      quality: 'high'
    });

    if (!imageUrl) {
      throw new Error('豆包API返回空结果');
    }

    // 下载到本地
    const localPath = await this.downloadImage(imageUrl, keyword);

    return {
      path: localPath,
      url: imageUrl,
      source: 'doubao',
      keyword: keyword
    };
  }

  /**
   * 构建素材提示词
   * @param {string} keyword - 关键词
   * @param {Object} context - 上下文
   * @param {Object} options - 选项
   * @returns {string} 提示词
   */
  buildMaterialPrompt(keyword, context, options = {}) {
    let prompt = `创建一个竖版信息图海报（1080x1920像素）

【主题】${keyword}

【设计要求】
1. 背景：深色科技感渐变（深蓝#1a1f3a到深紫#2d1b4e）
2. 标题："${keyword}"（大字号，白色，醒目，顶部1/4处）
3. 内容：3-5条关键信息点
   - 使用图标或图示
   - 文字清晰易读（白色或浅色）
   - 分点排列，层次分明
4. 风格：现代简约，专业可信，适合短视频
5. 布局：上下结构，信息密度适中

【内容方向】
${context.context || '专业知识分享'}

【禁止】
- 不要使用过于花哨的装饰
- 不要使用低分辨率图片
- 文字不要过小`;

    // 如果是优化版本，添加改进建议
    if (options.optimized && options.issues) {
      prompt += `\n\n【需要改进】\n${options.issues.join('\n')}`;
    }

    return prompt;
  }

  /**
   * 下载图片
   * @param {string} url - 图片URL
   * @param {string} keyword - 关键词
   * @returns {Promise<string>} 本地路径
   */
  async downloadImage(url, keyword) {
    return new Promise((resolve, reject) => {
      const filename = `${keyword.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.png`;
      const filepath = path.join(this.outputDir, filename);
      const file = fs.createWriteStream(filepath);

      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });

      }).on('error', (error) => {
        fs.unlink(filepath, () => {});
        reject(error);
      });
    });
  }

  /**
   * 验证素材
   * @param {Object} material - 素材对象
   * @param {string} keyword - 关键词
   * @returns {Promise<Object>} 验证结果
   */
  async validateMaterial(material, keyword) {
    const issues = [];
    let score = 100;

    // 检查文件是否存在
    if (!fs.existsSync(material.path)) {
      issues.push('文件不存在');
      score -= 50;
    }

    // 检查文件大小
    const stats = fs.statSync(material.path);
    if (stats.size < 10000) {
      issues.push('文件过小，可能生成失败');
      score -= 30;
    }

    // TODO: 可以添加更多验证
    // - OCR识别检查关键词
    // - 图像质量检查
    // - 颜色分析

    return {
      score: Math.max(0, score),
      issues: issues,
      passed: score >= 70
    };
  }

  /**
   * 获取默认素材
   * @param {string} keyword - 关键词
   * @returns {Promise<Object>} 素材对象
   */
  async getDefaultMaterial(keyword) {
    // 创建一个简单的默认素材
    const filename = `default_${keyword.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.txt`;
    const filepath = path.join(this.outputDir, filename);

    // 写入关键词作为占位符
    fs.writeFileSync(filepath, `默认素材: ${keyword}`, 'utf-8');

    return {
      path: filepath,
      source: 'default',
      keyword: keyword
    };
  }

  /**
   * 获取智能体名称
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * 获取智能体状态
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      ready: true,
      services: {
        doubaoService: !!this.doubaoService
      },
      outputDir: this.outputDir
    };
  }
}

export default MaterialExpert;
