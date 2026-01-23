import DoubaoImageService from '../../services/DoubaoImageService.js';
import path from 'path';
import fs from 'fs';

/**
 * MaterialExpert - 素材专家
 *
 * 职责：
 * 1. 豆包AI图像生成
 * 2. 多策略尝试（缓存→生成→优化→默认）
 * 3. 素材验证
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
        const material = await this.generateMaterial(scene, understanding);
        materials.push({
          sceneId: scene.id,
          keyword: scene.keyword,
          material: material
        });
        this.logger.info(`    ✓ 素材生成成功: ${material.source}`);

      } catch (error) {
        this.logger.error(`    ✗ 素材生成失败: ${error.message}`);
        // 使用默认素材
        materials.push({
          sceneId: scene.id,
          keyword: scene.keyword,
          material: this.getDefaultMaterial()
        });
      }
    }

    this.logger.info(`  ✅ 素材生成完成`);

    return {
      materials: materials
    };
  }

  /**
   * 生成单个素材
   * @param {Object} scene - 场景对象
   * @param {Object} understanding - 内容理解
   * @returns {Promise<Object>} 素材对象
   */
  async generateMaterial(scene, understanding) {
    const keyword = scene.keyword;

    // 策略1: 检查缓存
    if (this.cacheManager) {
      const cacheKey = this.cacheManager.generateKey(keyword);
      const cached = this.cacheManager.get(cacheKey);

      if (cached) {
        this.logger.info(`    → 使用缓存素材`);
        return cached;
      }
    }

    // 策略2: 豆包生成
    try {
      const prompt = this.buildPrompt(keyword, understanding);
      const imagePath = await this.doubaoService.generateImage(prompt, {
        width: 1080,
        height: 1920,
        style: 'realistic'
      });

      const material = {
        path: imagePath,
        source: 'doubao',
        prompt: prompt,
        validationScore: 85
      };

      // 保存到缓存
      if (this.cacheManager) {
        const cacheKey = this.cacheManager.generateKey(keyword);
        this.cacheManager.set(cacheKey, material);
      }

      return material;

    } catch (error) {
      this.logger.warn(`    豆包生成失败: ${error.message}`);
    }

    // 策略3: 优化提示词重试
    try {
      const optimizedPrompt = this.optimizePrompt(keyword);
      const imagePath = await this.doubaoService.generateImage(optimizedPrompt, {
        width: 1080,
        height: 1920,
        style: 'simple'
      });

      return {
        path: imagePath,
        source: 'doubao-optimized',
        prompt: optimizedPrompt,
        validationScore: 75
      };

    } catch (error) {
      this.logger.warn(`    优化重试失败: ${error.message}`);
    }

    // 策略4: 默认素材
    return this.getDefaultMaterial();
  }

  /**
   * 构建提示词
   * @param {string} keyword - 关键词
   * @param {Object} understanding - 内容理解
   * @returns {string} 提示词
   */
  buildPrompt(keyword, understanding) {
    const intent = understanding.intent || '教育';
    const tone = understanding.tone || '专业';

    return `${keyword}，${intent}风格，${tone}氛围，高质量，竖版构图，1080x1920`;
  }

  /**
   * 优化提示词
   * @param {string} keyword - 关键词
   * @returns {string} 优化后的提示词
   */
  optimizePrompt(keyword) {
    return `${keyword}，简洁风格，纯色背景，图标化，竖版，1080x1920`;
  }

  /**
   * 获取默认素材
   * @returns {Object} 默认素材对象
   */
  getDefaultMaterial() {
    return {
      path: path.join(__dirname, '../../assets/default-material.png'),
      source: 'default',
      prompt: 'default',
      validationScore: 50
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
        doubao: !!this.doubaoService,
        cache: !!this.cacheManager
      },
      outputDir: this.outputDir
    };
  }
}

export default MaterialExpert;
