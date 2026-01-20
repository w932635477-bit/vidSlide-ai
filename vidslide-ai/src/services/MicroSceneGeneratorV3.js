/**
 * 微场景生成器 V3
 * 集成智能排版和组合单元生成
 *
 * 核心功能:
 * - 使用 CompositionUnitGeneratorV3 生成专业级组合单元
 * - 使用 SmartLayoutServiceV2 进行智能布局
 * - 支持豆包生图
 * - 智能关键词合并
 * - PIP 避让
 *
 * @author VidSlide AI Team
 * @version 3.0.0 - 集成智能排版系统
 */

// 动态导入，只在 Node.js 环境中加载
let getCompositionGenerator = null;
let getLayoutService = null;

class MicroSceneGeneratorV3 {
  constructor() {
    // 检测环境
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      console.log('⚠️ MicroSceneGenerator 运行在浏览器环境');
      this.compositionGenerator = null;
      this.layoutService = null;
    } else {
      console.log('✅ MicroSceneGenerator 运行在 Node.js 环境');
      // 在 Node.js 环境中动态导入
      this.initializeServices();
    }

    console.log('✅ MicroSceneGeneratorV3 初始化完成')
  }

  async initializeServices() {
    if (!getCompositionGenerator) {
      const compositionModule = await import('./CompositionUnitGeneratorV3.js');
      getCompositionGenerator = compositionModule.getInstance;
    }
    if (!getLayoutService) {
      const layoutModule = await import('./SmartLayoutServiceV2.js');
      getLayoutService = layoutModule.getInstance;
    }
    this.compositionGenerator = getCompositionGenerator();
    this.layoutService = getLayoutService();
  }

  /**
   * 基于关键词生成微场景（新版本）
   *
   * @param {Object} mainScene - 主场景数据
   * @param {Array} keywords - 关键词数组
   * @param {Array} images - 豆包生成的图片数组（可选）
   * @returns {Promise<Array>} 微场景数组
   */
  async generateMicroScenes(mainScene, keywords, images = []) {
    const microScenes = [];

    console.log(`\n🎯 场景 ${mainScene.id}: 生成智能排版微场景`);
    console.log(`  关键词数量: ${keywords.length}`);
    console.log(`  图片数量: ${images.length}`);

    // 如果没有关键词或图片，返回原视频
    if (keywords.length === 0 || images.length === 0) {
      console.log(`  ⚠️ 无关键词或图片，使用原视频`);
      microScenes.push({
        type: 'original',
        startTime: mainScene.startTime,
        endTime: mainScene.endTime,
        showPIP: false
      });
      return microScenes;
    }

    // 为每个关键词生成微场景
    const sceneDuration = (mainScene.endTime - mainScene.startTime) / keywords.length;

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const startTime = mainScene.startTime + sceneDuration * i;
      const endTime = startTime + sceneDuration;

      console.log(`\n  微场景 ${i + 1}/${keywords.length}:`);
      console.log(`    关键词: ${keyword.text || keyword}`);
      console.log(`    时间: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`);

      try {
        // 生成组合单元
        const compositionUnitPath = await this.generateCompositionUnit({
          keyword,
          images: images.slice(i, i + 1), // 使用对应的图片
          sceneIndex: i,
          totalScenes: keywords.length
        });

        // 如果生成成功，使用组合单元
        if (compositionUnitPath) {
          microScenes.push({
            type: 'composition',
            startTime,
            endTime,
            duration: sceneDuration,
            keyword: keyword.text || keyword,
            importance: keyword.score || 0.5,
            compositionUnitPath,  // 组合单元图片路径
            showPIP: true,
            pipConfig: {
              x: 720,
              y: 120,
              width: 320,
              height: 180,
              borderRadius: 16
            }
          });

          console.log(`    ✓ 组合单元生成成功: ${compositionUnitPath}`);
        } else {
          // 浏览器环境或生成失败，使用原视频
          microScenes.push({
            type: 'original',
            startTime,
            endTime,
            showPIP: false
          });
          console.log(`    → 使用原视频片段`);
        }

      } catch (error) {
        console.error(`    ✗ 组合单元生成失败:`, error.message);

        // 失败时使用原视频
        microScenes.push({
          type: 'original',
          startTime,
          endTime,
          showPIP: false
        });
      }
    }

    console.log(`\n✅ 生成 ${microScenes.length} 个微场景`);
    return microScenes;
  }

  /**
   * 生成组合单元
   */
  async generateCompositionUnit(config) {
    const { keyword, images, sceneIndex, totalScenes } = config;

    if (this.isBrowser) {
      // 浏览器环境：返回 null，让调用方使用原视频
      console.log('    ⚠️ 浏览器环境，跳过组合单元生成');
      return null;
    }

    // 确定风格预设
    const stylePreset = this.selectStylePreset(keyword);

    // 确定布局风格
    const layoutStyle = this.selectLayoutStyle(images.length);

    // 生成组合单元
    const outputPath = await this.compositionGenerator.generateCompositionUnit({
      mainTitle: keyword.text || keyword,
      keywords: this.extractKeywords(keyword),
      images: images,
      stylePreset,
      layoutStyle
    });

    return outputPath;
  }

  /**
   * 选择风格预设
   */
  selectStylePreset(keyword) {
    const text = keyword.text || keyword;

    // 科技类
    if (/AI|人工智能|机器学习|深度学习|算法|技术|科技/.test(text)) {
      return 'tech';
    }

    // 商务类
    if (/商业|企业|管理|战略|市场|销售|金融/.test(text)) {
      return 'business';
    }

    // 数据类
    if (/数据|统计|分析|图表|指标|增长|趋势/.test(text)) {
      return 'data';
    }

    // 默认科技风格
    return 'tech';
  }

  /**
   * 选择布局风格
   */
  selectLayoutStyle(imageCount) {
    if (imageCount === 1) return 'auto';
    if (imageCount === 2) return 'auto';
    if (imageCount === 3) return 'pyramid';
    if (imageCount === 4) return 'auto';
    return 'auto';
  }

  /**
   * 提取关键词标签
   */
  extractKeywords(keyword) {
    const text = keyword.text || keyword;

    // 简单分词（实际应该使用更复杂的分词算法）
    const words = text.split(/[，、。！？\s]+/).filter(w => w.length >= 2);

    // 返回前3个词
    return words.slice(0, 3);
  }

  /**
   * 分类场景类型
   */
  classifySceneType(keyword) {
    const text = keyword.text || keyword;
    const importance = keyword.score || 0.5;

    // 高重要性 → 强调场景
    if (importance >= 0.8) {
      return 'emphasis';
    }

    // 数据相关 → 图表场景
    if (/\d+|数据|统计|增长|下降|百分比|图表|趋势/.test(text)) {
      return 'chart';
    }

    // 默认 → 基础场景
    return 'basic';
  }

  /**
   * 从字幕中提取关键词时间点
   */
  extractKeywordTimestamps(transcript, keywords) {
    const timestamps = [];

    if (!Array.isArray(transcript) || !Array.isArray(keywords)) {
      console.warn('⚠️ transcript 或 keywords 不是数组');
      return timestamps;
    }

    if (transcript.length === 0) {
      console.warn('⚠️ transcript 为空');
      return timestamps;
    }

    console.log(`📝 字幕片段数: ${transcript.length}`);

    transcript.forEach(segment => {
      if (!segment || !segment.text) return;

      keywords.forEach(keyword => {
        const keywordText = keyword.text || keyword;

        if (segment.text.includes(keywordText)) {
          timestamps.push({
            time: segment.startTime || 0,
            text: keywordText,
            importance: keyword.score || 0.5,
            context: segment.text
          });
        }
      });
    });

    // 按时间排序
    timestamps.sort((a, b) => a.time - b.time);

    // 去重
    const uniqueTimestamps = [];
    let lastTime = -1;

    for (const ts of timestamps) {
      if (ts.time !== lastTime) {
        uniqueTimestamps.push(ts);
        lastTime = ts.time;
      }
    }

    return uniqueTimestamps;
  }

  /**
   * 智能合并距离太近的关键词
   */
  mergeCloseKeywords(keywordTimestamps) {
    if (keywordTimestamps.length === 0) {
      return [];
    }

    const mergedGroups = [];
    let currentGroup = {
      startTime: keywordTimestamps[0].time,
      endTime: keywordTimestamps[0].time + this.calculateCompositionDuration(keywordTimestamps[0]),
      keywords: [keywordTimestamps[0].text],
      importance: keywordTimestamps[0].importance,
      contexts: [keywordTimestamps[0].context]
    };

    for (let i = 1; i < keywordTimestamps.length; i++) {
      const keyword = keywordTimestamps[i];
      const timeSinceLastKeyword = keyword.time - keywordTimestamps[i - 1].time;

      // 如果距离上一个关键词 < 2秒，合并到当前组
      if (timeSinceLastKeyword < 2) {
        console.log(`🔗 合并关键词 "${keyword.text}"（距离上次 ${timeSinceLastKeyword.toFixed(2)}秒）`);

        currentGroup.endTime = keyword.time + this.calculateCompositionDuration(keyword);
        currentGroup.keywords.push(keyword.text);
        currentGroup.contexts.push(keyword.context);
        currentGroup.importance = Math.max(currentGroup.importance, keyword.importance);
      } else {
        mergedGroups.push(currentGroup);

        currentGroup = {
          startTime: keyword.time,
          endTime: keyword.time + this.calculateCompositionDuration(keyword),
          keywords: [keyword.text],
          importance: keyword.importance,
          contexts: [keyword.context]
        };
      }
    }

    mergedGroups.push(currentGroup);

    mergedGroups.forEach((group, index) => {
      console.log(`  组 ${index + 1}: [${group.keywords.join(', ')}] (${group.startTime.toFixed(1)}s - ${group.endTime.toFixed(1)}s)`);
    });

    return mergedGroups;
  }

  /**
   * 计算组合画面持续时间
   */
  calculateCompositionDuration(keyword) {
    const importance = keyword.importance || 0.5;

    if (importance >= 0.8) {
      return 5; // 高重要性：5秒
    } else if (importance >= 0.5) {
      return 4; // 中等重要性：4秒
    } else {
      return 3; // 低重要性：3秒
    }
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new MicroSceneGeneratorV3();
  }
  return instance;
}

export { MicroSceneGeneratorV3 };
export default new MicroSceneGeneratorV3();
