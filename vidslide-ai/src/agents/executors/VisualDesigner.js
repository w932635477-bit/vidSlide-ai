import path from 'path';
import fs from 'fs';
import ProfessionalCardGenerator from '../../services/ProfessionalCardGenerator.js';
import VisualEffectsService from '../../services/VisualEffectsService.js';

/**
 * VisualDesigner - 视觉设计师
 *
 * 职责：
 * 1. 设计观点卡片（使用专业卡片生成器）
 * 2. 自动应用视觉特效（圆角、边框、阴影）
 * 3. 生成背景遮罩
 * 4. 创建动画效果
 */
class VisualDesigner {
  constructor(options = {}) {
    this.name = 'VisualDesigner';
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output', 'visuals');

    // 初始化专业卡片生成器
    this.cardGenerator = new ProfessionalCardGenerator();

    // 初始化视觉特效服务（负责圆角、边框、阴影）
    this.effectsService = new VisualEffectsService({
      cacheDir: path.join(this.outputDir, 'effects-cache'),
      logger: this.logger
    });

    // 确保输出目录存在
    this.ensureOutputDir();

    // 卡片样式配置
    this.cardStyles = {
      blue: {
        background: '#2563eb',
        text: '#ffffff',
        border: '#1e40af',
        shadow: 'rgba(37, 99, 235, 0.5)'
      },
      yellow: {
        background: '#fbbf24',
        text: '#1f2937',
        border: '#f59e0b',
        shadow: 'rgba(251, 191, 36, 0.5)'
      },
      bright: {
        background: '#ec4899',
        text: '#ffffff',
        border: '#db2777',
        shadow: 'rgba(236, 72, 153, 0.5)'
      }
    };
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
   * 设计卡片
   * @param {Object} input - 输入参数
   * @param {Object} input.task_2_1 - 场景设计结果
   * @returns {Promise<Object>} 包含cards数组
   */
  async designCards(input) {
    const { task_2_1 } = input;
    const uiTimeline = task_2_1.uiTimeline;

    this.logger.info('🎨 VisualDesigner: 开始设计卡片');

    // 从UI时间轴的卡片轨道中提取需要设计的卡片
    const cardTrack = uiTimeline.tracks.find(t => t.id === 'track_cards');

    if (!cardTrack || cardTrack.clips.length === 0) {
      this.logger.info('  → 没有需要设计的卡片');
      return { cards: [] };
    }

    const cardClips = cardTrack.clips;
    this.logger.info(`  → 需要设计 ${cardClips.length} 个卡片`);

    const cards = [];

    for (let i = 0; i < cardClips.length; i++) {
      const clip = cardClips[i];
      const displayText = clip.content.text || '未知';
      this.logger.info(`  [${i + 1}/${cardClips.length}] 设计卡片: ${displayText.substring(0, 20)}...`);

      try {
        // 从clip构建scene对象
        const scene = {
          id: clip.id,
          type: clip.type,
          keywordObj: {
            text: clip.content.text,
            english: clip.content.text,
            category: 'concept'
          },
          importance: 'medium',
          priority: 'medium'
        };

        const card = await this.createCard(scene);
        cards.push(card);
        this.logger.info(`    ✓ 卡片设计完成`);

      } catch (error) {
        this.logger.error(`    ✗ 卡片设计失败: ${error.message}`);
      }
    }

    this.logger.info(`  ✅ 卡片设计完成`);

    return {
      cards: cards
    };
  }

  /**
   * 创建卡片（自动应用特效）
   * @param {Object} scene - 场景对象
   * @returns {Promise<Object>} 卡片对象（包含特效配置）
   */
  async createCard(scene) {
    // 使用关键词对象（包含中文和英文）
    const keywordObj = scene.keywordObj || {
      text: scene.cardText || scene.keyword || '关键词',
      english: 'Keyword',
      category: 'concept'
    };

    const style = this.selectCardStyle(scene);

    // 使用专业卡片生成器生成实际的卡片图片（传递关键词对象）
    const cardPath = await this.cardGenerator.generateCard(keywordObj, {
      style: style,
      width: 600,   // 增大宽度
      height: 300,  // 增大高度
      fontSize: 72, // 增大字体
      fontWeight: 'bold',
      cornerRadius: 20,
      shadowBlur: 20,
      addDecoration: true
    });

    // 基础卡片配置
    const cardConfig = {
      sceneId: scene.id,
      style: style,
      keywordObj: keywordObj,  // 保存关键词对象
      path: cardPath,  // 实际生成的卡片图片路径
      animation: this.selectAnimation(scene),
      width: 600,
      height: 300
    };

    // 自动应用视觉特效（圆角、边框、阴影）
    const cardWithEffects = this.effectsService.generateCardEffectsConfig(cardConfig);

    this.logger.info(`    ✨ 特效已自动应用: 圆角=${cardWithEffects.effects.css.borderRadius}, 阴影=${cardWithEffects.effects.css.boxShadow}`);

    return cardWithEffects;
  }

  /**
   * 选择卡片样式
   * @param {Object} scene - 场景对象
   * @returns {string} 样式名称
   */
  selectCardStyle(scene) {
    if (scene.type === 'multi-layer-composition') {
      return 'bright';  // 重点强调用亮色
    }

    if (scene.importance === 'high' || scene.priority === 'high') {
      return 'blue';  // 高重要性用蓝色
    }

    return 'yellow';  // 中等重要性用黄色
  }

  /**
   * 选择动画效果
   * @param {Object} scene - 场景对象
   * @returns {string} 动画名称
   */
  selectAnimation(scene) {
    if (scene.type === 'multi-layer-composition') {
      return 'flip';  // 多层场景用翻转动画
    }

    return 'fadeIn';  // 默认淡入
  }

  /**
   * 生成背景
   * @param {Object} input - 输入参数
   * @param {Object} input.task_2_1 - 场景设计结果
   * @returns {Promise<Object>} 包含backgrounds数组
   */
  async generateBackgrounds(input) {
    const { task_2_1 } = input;
    const scenes = task_2_1.scenes;

    this.logger.info('🎨 VisualDesigner: 开始生成背景');

    // 找出需要背景的场景
    const backgroundScenes = scenes.filter(s => s.type === 'multi-layer-composition');

    this.logger.info(`  → 需要生成 ${backgroundScenes.length} 个背景`);

    const backgrounds = [];

    for (let i = 0; i < backgroundScenes.length; i++) {
      const scene = backgroundScenes[i];
      this.logger.info(`  [${i + 1}/${backgroundScenes.length}] 生成背景: ${scene.keyword}`);

      try {
        const background = await this.createBackground(scene);
        backgrounds.push(background);
        this.logger.info(`    ✓ 背景生成完成`);

      } catch (error) {
        this.logger.error(`    ✗ 背景生成失败: ${error.message}`);
      }
    }

    this.logger.info(`  ✅ 背景生成完成`);

    return {
      backgrounds: backgrounds
    };
  }

  /**
   * 创建背景
   * @param {Object} scene - 场景对象
   * @returns {Promise<Object>} 背景对象
   */
  async createBackground(scene) {
    // 背景配置（实际生成由视频合成服务完成）
    return {
      sceneId: scene.id,
      type: 'tech-gradient',
      colors: ['#1a1f3a', '#2d1b4e'],
      width: 1080,
      height: 1920
    };
  }

  /**
   * 创建动画
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 包含animations数组
   */
  async createAnimations(input) {
    const { cards } = input;

    this.logger.info('🎨 VisualDesigner: 开始创建动画');

    const animations = [];

    for (const card of cards) {
      if (card.animation === 'flip') {
        animations.push({
          sceneId: card.sceneId,
          type: 'flip',
          duration: 0.5
        });
      } else {
        animations.push({
          sceneId: card.sceneId,
          type: 'fadeIn',
          duration: 0.3
        });
      }
    }

    this.logger.info(`  ✅ 动画创建完成`);

    return {
      animations: animations
    };
  }

  /**
   * 设计画中画（自动应用特效）
   * @param {Object} input - 输入参数
   * @param {Object} input.task_2_1 - 场景设计结果
   * @returns {Promise<Object>} 包含pips数组
   */
  async designPIPs(input) {
    const { task_2_1 } = input;
    const scenes = task_2_1.scenes;

    this.logger.info('🎨 VisualDesigner: 开始设计画中画');

    // 找出需要画中画的场景
    const pipScenes = scenes.filter(s => s.type === 'picture-in-picture');

    this.logger.info(`  → 需要设计 ${pipScenes.length} 个画中画`);

    const pips = [];

    for (let i = 0; i < pipScenes.length; i++) {
      const scene = pipScenes[i];
      this.logger.info(`  [${i + 1}/${pipScenes.length}] 设计画中画: ${scene.type}`);

      try {
        const pip = await this.createPIP(scene);
        pips.push(pip);
        this.logger.info(`    ✓ 画中画设计完成（包含自动特效）`);

      } catch (error) {
        this.logger.error(`    ✗ 画中画设计失败: ${error.message}`);
      }
    }

    this.logger.info(`  ✅ 画中画设计完成`);

    return {
      pips: pips
    };
  }

  /**
   * 创建画中画（自动应用特效）
   * @param {Object} scene - 场景对象
   * @returns {Promise<Object>} 画中画对象（包含特效配置）
   */
  async createPIP(scene) {
    // 默认画中画配置
    const pipConfig = {
      sceneId: scene.id,
      type: 'picture-in-picture',
      shape: 'circle',  // 默认圆形
      width: 400,
      height: 400,
      position: {
        x: 80,  // 左上角
        y: 200
      }
    };

    // 自动应用视觉特效（圆形边框、阴影）
    const pipWithEffects = this.effectsService.generatePIPEffectsConfig(pipConfig);

    this.logger.info(`    ✨ PIP特效已自动应用: 形状=${pipWithEffects.effects.css.borderRadius}, 边框=${pipWithEffects.effects.css.border}, 阴影=${pipWithEffects.effects.css.boxShadow}`);

    return pipWithEffects;
  }

  /**
   * 批量应用特效到现有图片
   * @param {Array} imagePaths - 图片路径数组
   * @param {string} type - 类型 (card | pip)
   * @returns {Promise<Array>} 处理后的图片路径数组
   */
  async applyEffectsToImages(imagePaths, type = 'card') {
    this.logger.info(`\n🎨 批量应用特效到 ${imagePaths.length} 张图片 (类型: ${type})`);

    const results = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      this.logger.info(`  [${i + 1}/${imagePaths.length}] 处理: ${path.basename(imagePath)}`);

      try {
        // 获取对应的特效配置
        const effects = type === 'card'
          ? this.effectsService.getCardEffects('blue')
          : this.effectsService.getPIPEffects('circle');

        // 应用特效
        const outputPath = await this.effectsService.applyEffectsToImage(imagePath, effects);
        results.push(outputPath);

        this.logger.info(`    ✓ 完成: ${path.basename(outputPath)}`);

      } catch (error) {
        this.logger.error(`    ✗ 失败: ${error.message}`);
        results.push(imagePath);  // 失败时使用原图片
      }
    }

    this.logger.info(`  ✅ 批量处理完成: ${results.length}张\n`);

    return results;
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
      outputDir: this.outputDir,
      cardStyles: Object.keys(this.cardStyles)
    };
  }
}

export default VisualDesigner;
