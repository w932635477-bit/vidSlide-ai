import BackgroundGeneratorService from '../../services/BackgroundGeneratorService.js';
import CardFlipAnimationGenerator from '../../services/CardFlipAnimationGenerator.js';
import path from 'path';
import fs from 'fs';
import { createCanvas } from 'canvas';

/**
 * VisualDesigner - 视觉设计师
 *
 * 职责：
 * 1. 设计观点卡片（蓝色/黄色）
 * 2. 设计重点强调卡片（亮色）
 * 3. 生成背景遮罩
 * 4. 创建动画效果
 */
class VisualDesigner {
  constructor(options = {}) {
    this.name = 'VisualDesigner';
    this.backgroundService = new BackgroundGeneratorService();
    this.animationGenerator = new CardFlipAnimationGenerator();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output', 'visuals');

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
    const scenes = task_2_1.scenes;

    this.logger.info('🎨 VisualDesigner: 开始设计卡片');

    // 找出需要卡片的场景
    const cardScenes = scenes.filter(s =>
      s.type === 'video-with-card' || s.type === 'multi-layer-composition'
    );

    this.logger.info(`  → 需要设计 ${cardScenes.length} 个卡片`);

    const cards = [];

    for (let i = 0; i < cardScenes.length; i++) {
      const scene = cardScenes[i];
      this.logger.info(`  [${i + 1}/${cardScenes.length}] 设计卡片: ${scene.cardText || scene.keyword}`);

      try {
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
   * 创建卡片
   * @param {Object} scene - 场景对象
   * @returns {Promise<Object>} 卡片对象
   */
  async createCard(scene) {
    const text = scene.cardText || scene.keyword;
    const style = this.selectCardStyle(scene);

    // 创建卡片图像
    const cardPath = await this.generateCardImage(text, style, scene.id);

    return {
      sceneId: scene.id,
      style: style,
      text: text,
      path: cardPath,
      animation: this.selectAnimation(scene)
    };
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
   * 生成卡片图像
   * @param {string} text - 文本内容
   * @param {string} styleName - 样式名称
   * @param {string} sceneId - 场景ID
   * @returns {Promise<string>} 图像路径
   */
  async generateCardImage(text, styleName, sceneId) {
    const style = this.cardStyles[styleName];
    const width = 800;
    const height = 200;

    // 创建Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 绘制背景
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // 绘制边框
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);

    // 绘制文字
    ctx.fillStyle = style.text;
    ctx.font = 'bold 48px Arial, "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 文字换行处理
    const lines = this.wrapText(ctx, text, width - 80);
    const lineHeight = 60;
    const startY = (height - lines.length * lineHeight) / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
    }

    // 保存图像
    const filename = `card_${sceneId}_${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    return filepath;
  }

  /**
   * 文字换行
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {string} text - 文本
   * @param {number} maxWidth - 最大宽度
   * @returns {Array<string>} 行数组
   */
  wrapText(ctx, text, maxWidth) {
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
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
    // 使用BackgroundGeneratorService生成深色科技背景
    const backgroundPath = await this.backgroundService.generateBackground({
      width: 1080,
      height: 1920,
      style: 'tech',
      colors: ['#1a1f3a', '#2d1b4e']
    });

    return {
      sceneId: scene.id,
      path: backgroundPath,
      type: 'tech-gradient'
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
        // 使用CardFlipAnimationGenerator创建翻转动画
        const animationPath = await this.animationGenerator.generateFlipAnimation({
          cardPath: card.path,
          duration: 0.5
        });

        animations.push({
          sceneId: card.sceneId,
          type: 'flip',
          path: animationPath
        });
      } else {
        // 简单的淡入动画（不需要额外文件）
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
        backgroundService: !!this.backgroundService,
        animationGenerator: !!this.animationGenerator
      },
      outputDir: this.outputDir,
      cardStyles: Object.keys(this.cardStyles)
    };
  }
}

export default VisualDesigner;
