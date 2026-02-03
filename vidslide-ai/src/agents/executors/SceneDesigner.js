/**
 * SceneDesigner - 场景设计师（v4.0 - 规则驱动版本）
 *
 * 继承BaseAgent，获得以下最佳实践支持：
 * - 契约验证（输入/输出）
 * - 熔断器保护
 * - 分布式追踪
 * - 断点续传
 * - ⭐ 规则引擎验证（新增）
 *
 * 职责：
 * 1. 基于关键词时间戳生成场景
 * 2. 使用TimelineEvent系统管理多层内容
 * 3. 原视频占比控制（≤20%）
 * 4. ⭐ 规则验证和自动修复
 *
 * 架构：
 * - 使用TimelineEvent替代固定时间规则
 * - 关键词时间戳驱动场景分配
 * - 统一管理多层画中画结构
 * - ⭐ 集成RuleEngine进行规则验证
 */

import { BaseAgent } from '../../core/BaseAgent.js';
import {
  SequenceDefinition,
  TimelineConstraintSolver,
  PlaylistGenerator
} from '../../core/TimelineConstraintSystem.js';

import MultiLayerTimelineManager from '../../core/TimelineEventSystem.js';

// ⭐ 导入规则引擎
import { globalRuleEngine } from '../../core/RuleEngine.js';

// ⭐ 导入全局风格配置
import { getStyleConfig } from '../../config/GlobalStyleConfig.js';

// ⭐ 导入视频制作知识库
import { VideoProductionKnowledge, SceneDecisionEngine } from '../../knowledge/VideoProductionKnowledge.js';

// ⭐ 导入编辑规则知识库（从模板学习）
import EditingKnowledgeBase from '../../knowledge/EditingKnowledgeBase.js';

// ⭐ 导入文心一言API（用于LLM语义决策）
import { getWenxinAPI } from '../../services/WenxinAPI.js';

// ⭐ 导入布局优化器（状态转移矩阵）
import { mergeToCardGroups as mergeToCardGroupsWithOptimizer } from './SceneDesigner/cardGroups.js';

class SceneDesigner extends BaseAgent {
  constructor(options = {}) {
    super({
      name: 'SceneDesigner',
      enableTracing: options.enableTracing !== false,
      enableCircuitBreaker: options.enableCircuitBreaker !== false,
      enableCheckpoint: options.enableCheckpoint !== false,
      validateContracts: options.validateContracts !== false,
      ...options
    });

    // ⭐ 规则引擎（核心新增）
    this.ruleEngine = options.ruleEngine || globalRuleEngine;

    // 全局风格配置
    this.stylePreset = options.stylePreset || 'douyin_modern';
    this.globalStyle = getStyleConfig(this.stylePreset);

    // ⭐ 知识库和场景决策引擎
    this.knowledge = VideoProductionKnowledge;
    this.sceneEngine = new SceneDecisionEngine(this.knowledge);

    // ⭐ 编辑规则知识库（从模板学习）
    this.editingKnowledge = new EditingKnowledgeBase({ logger: this.logger });

    this.log('info', `✅ SceneDesigner 使用风格预设: ${this.globalStyle.name}`);
    this.log('info', `✅ SceneDesigner 已加载视频制作知识库`);
    this.log('info', `✅ SceneDesigner 已加载编辑规则知识库 (${this.editingKnowledge.rules.length}条规则)`);
    this.log('info', `✅ SceneDesigner 已集成规则引擎 (${this.ruleEngine.hardRules.size}条硬性规则, ${this.ruleEngine.softRules.size}条软性规则)`);

    // TimelineEvent管理器
    this.timelineManager = new MultiLayerTimelineManager({
      logger: this.logger
    });

    // 初始化约束系统
    this.constraintSolver = new TimelineConstraintSolver({
      minCardDuration: 3,
      maxCardDuration: 8,
      minSpacing: 0.5,
      groupingThreshold: 10,
      transitionOverlap: 0.5
    });

    this.playlistGenerator = new PlaylistGenerator();

    // 场景拆解规则 - v5.2 优化场景分布和时长
    // ⭐ 修复：增加组合画面时长，减少原视频过渡
    this.rules = {
      maxOriginalRatio: 20,           // 原视频最大占比降到20%（与H001一致）
      transitionDuration: 0.8,        // 过渡时间优化到0.8秒（更流畅）

      // ⭐⭐⭐ 新增：场景类型目标分布（v5.2）
      sceneTypeDistribution: {
        'original': { min: 10, max: 20, target: 15 },           // 原视频10-20%
        'card-group': { min: 30, max: 40, target: 35 },         // 卡片组30-40%（主力）
        'video-with-card': { min: 15, max: 25, target: 20 },    // 单卡片15-25%
        'multi-layer-composition': { min: 25, max: 35, target: 30 } // 多层25-35%
      },

      // ⭐⭐⭐ 新增：动态时长范围（v5.2）
      sceneDuration: {
        'original': { min: 2, max: 5, default: 3 },
        'card-group': { min: 4, max: 8, default: 6 },
        'video-with-card': { min: 3, max: 6, default: 4 },
        'multi-layer-composition': { min: 5, max: 10, default: 7 }
      },

      // 兼容旧配置
      cardDuration: 6.0,              // 卡片场景从3秒增加到6秒（与H003一致）
      multiLayerDuration: 8.0,        // 多层场景从4秒增加到8秒
      openingDuration: 2.0,
      endingDuration: 2.0,

      // ⭐ 多卡片配置
      maxCardsPerScene: 3,            // 每个场景最多3张卡片
      cardGroupMinKeywords: 2,        // 至少2个关键词才合并成卡片组
      skipTransitionBetweenCards: true, // 连续卡片场景之间不插入过渡

      // ⭐⭐⭐ 新增：场景轮换配置（v5.2）
      sceneRotation: {
        enabled: true,                // 启用场景轮换
        maxConsecutiveSameType: 2,    // 同类型场景最多连续2个
        preferAlternating: true,      // 优先交替排布
        transitionBetweenTypes: true  // 不同类型间插入过渡
      }
    };
  }

  /**
   * ⭐⭐⭐ LLM 语义决策方法（v5.0 - 真正理解规则）
   *
   * 使用文心一言进行语义分析，让智能体真正理解规则的意义
   *
   * @param {Array} keywords - 关键词列表
   * @param {string} transcript - 完整文本
   * @param {number} videoDuration - 视频时长
   * @returns {Promise<Object>} 决策结果
   */
  async decideWithLLM(keywords, transcript, videoDuration) {
    const wenxin = getWenxinAPI();

    try {
      this.log('info', '  → 尝试使用 LLM 语义决策...');

      // 2. 构建 Prompt
      const prompt = this.buildSceneDecisionPrompt(keywords, transcript, videoDuration);
      this.log('debug', `  → Prompt 长度: ${prompt.length} 字符`);

      // 3. 调用 LLM（带超时，ERNIE 4.5 思考模型需要更长时间）
      const response = await Promise.race([
        wenxin.chat(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('LLM 调用超时')), 60000)
        )
      ]);

      // 4. 解析 JSON 响应
      const decisions = this.parseLLMResponse(response.content);
      if (!decisions) {
        this.log('warn', '  ⚠️ LLM 返回格式错误，使用规则匹配');
        return { success: false, fallbackToRules: true };
      }

      // 5. 验证决策合理性
      const validation = this.validateLLMDecisions(decisions, videoDuration);
      if (!validation.valid) {
        this.log('warn', `  ⚠️ LLM 决策不合理: ${validation.reason}，使用规则匹配`);
        return { success: false, fallbackToRules: true };
      }

      // 6. 成功返回
      this.log('info', '  ✅ LLM 语义决策成功');
      this.log('info', `    - 决策数量: ${decisions.decisions.length}个`);

      // 计算场景类型分布
      const stats = {
        original: decisions.decisions.filter(d => d.sceneType === 'original').length,
        card: decisions.decisions.filter(d => d.sceneType === 'video-with-card').length,
        multiLayer: decisions.decisions.filter(d => d.sceneType === 'multi-layer-composition').length
      };
      const total = decisions.decisions.length;
      this.log('info', `    - 原视频占比: ${(stats.original / total * 100).toFixed(0)}%`);
      this.log('info', `    - 卡片占比: ${(stats.card / total * 100).toFixed(0)}%`);
      this.log('info', `    - 多层占比: ${(stats.multiLayer / total * 100).toFixed(0)}%`);

      return {
        success: true,
        decisions: decisions.decisions,
        reasoning: decisions.reasoning
      };

    } catch (error) {
      this.log('warn', `  ⚠️ LLM 决策失败: ${error.message}，使用规则匹配`);
      return { success: false, fallbackToRules: true };
    }
  }

  /**
   * ⭐ 构建场景决策 Prompt
   * @param {Array} keywords - 关键词列表
   * @param {string} transcript - 完整文本
   * @param {number} videoDuration - 视频时长
   * @returns {string} Prompt
   */
  buildSceneDecisionPrompt(keywords, transcript, videoDuration) {
    return `# 角色
你是一个专业的抖音视频编辑师，有5年短视频制作经验。

# 任务
根据视频内容和编辑规则，为每个关键词决定应该使用什么场景类型。

# 硬性约束（必须遵守，违反任何一条都是错误的）
1. 原视频(original)占比 ≤ 20%（仅用于开场、结尾、短暂过渡）
2. ⭐ 卡片组(card-group)占比 ≈ 40%（最常用，多张卡片叠加展示，丰富页面质感）
3. 多层场景(multi-layer-composition)占比 ≈ 35%（需要素材辅助时使用）
4. 单一卡片(video-with-card)占比 ≈ 5-10%（仅用于简单强调）
5. 同类型场景最多连续3个
6. 开场（前3秒）使用 original
7. 结尾（最后3秒）使用 original

# 场景类型说明
- **original**: 纯原视频，无叠加效果
  用途: 开场建立连接、结尾情感升华、话题转换过渡

- **card-group**: 原视频 + 多张卡片叠加（⭐主力形式）
  用途: 展示主关键词+次关键词，丰富页面质感，强调多个相关概念

- **video-with-card**: 原视频 + 单一卡片叠加
  用途: 简单强调单个关键词（仅在无法组成卡片组时使用）

- **multi-layer-composition**: 原视频 + 素材图片 + 卡片
  用途: 解释说明、案例展示、需要视觉辅助的复杂内容

# 视频信息
- 时长: ${videoDuration}秒
- 完整文本:
${transcript.substring(0, 500)}

- 关键词列表（按时间顺序）:
${keywords.map((kw, i) => `  ${i + 1}. "${kw.text}" (${(kw.startTime || 0).toFixed(1)}s - ${(kw.endTime || 0).toFixed(1)}s)`).join('\n')}

# 输出格式（严格JSON，不要输出其他内容）
{
  "decisions": [
    {
      "keywordIndex": 0,
      "keyword": "关键词文本",
      "sceneType": "video-with-card",
      "reason": "决策理由（一句话）"
    }
  ],
  "reasoning": "整体决策说明（一句话）"
}`;
  }

  /**
   * ⭐ 解析 LLM 响应
   * @param {string} content - LLM 响应内容
   * @returns {Object|null} 解析后的决策对象
   */
  parseLLMResponse(content) {
    try {
      // 调试：打印原始响应
      this.log('debug', `  LLM 原始响应: ${content?.substring(0, 500)}...`);

      // 处理可能的 markdown 代码块
      let jsonStr = content.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.match(/```json\n([\s\S]*?)\n```/)?.[1] || jsonStr;
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.match(/```\n([\s\S]*?)\n```/)?.[1] || jsonStr;
      }

      // 尝试提取 JSON 对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return JSON.parse(jsonStr);
    } catch (error) {
      this.log('warn', `  JSON 解析失败: ${error.message}`);
      this.log('warn', `  原始内容: ${content?.substring(0, 200)}`);
      return null;
    }
  }

  /**
   * ⭐ 验证 LLM 决策
   * @param {Object} decisions - LLM 决策对象
   * @param {number} videoDuration - 视频时长
   * @returns {Object} 验证结果
   */
  validateLLMDecisions(decisions, videoDuration) {
    // 检查必需字段
    if (!decisions.decisions || !Array.isArray(decisions.decisions)) {
      return { valid: false, reason: '缺少 decisions 数组' };
    }

    // 检查每个决策的场景类型是否有效
    const validTypes = ['original', 'video-with-card', 'multi-layer-composition', 'card-group'];
    for (const d of decisions.decisions) {
      if (!validTypes.includes(d.sceneType)) {
        return { valid: false, reason: `无效的场景类型: ${d.sceneType}` };
      }
    }

    // 检查原视频占比（宽松检查，允许一定偏差）
    const originalCount = decisions.decisions.filter(d => d.sceneType === 'original').length;
    const originalRatio = (originalCount / decisions.decisions.length) * 100;
    if (originalRatio > 40) {  // 允许一定偏差
      return { valid: false, reason: `原视频占比过高: ${originalRatio.toFixed(0)}%` };
    }

    return { valid: true };
  }

  /**
   * ⭐ 使用学习到的规则决定场景类型
   * @param {Object} contentFeatures - 内容特征
   * @param {string} contentFeatures.text - 文本内容
   * @param {Array} contentFeatures.keywords - 关键词
   * @param {string} contentFeatures.contentType - 内容类型
   * @param {Object} contentFeatures.position - 位置信息
   * @returns {Object} 场景类型决策
   */
  decideSceneTypeByRules(contentFeatures) {
    // 尝试从学习到的规则中匹配
    const match = this.editingKnowledge.matchRule(contentFeatures);

    if (match && match.score > 0.3) {
      // 规则匹配成功
      const rule = match.rule;
      this.log('debug', `  → 规则匹配: ${rule.name} (置信度: ${(match.score * 100).toFixed(0)}%)`);

      // ⭐ 兼容新旧规则格式
      // 新格式: rule.guidance.prefer
      // 旧格式: rule.action.sceneType
      const preferredType = rule.guidance?.prefer || rule.action?.sceneType;
      const ruleParams = rule.guidance || rule.action?.params || {};

      // 将规则的sceneType映射到项目的场景类型
      const sceneTypeMap = {
        'original': 'original',
        'card': 'video-with-card',
        'video-with-card': 'video-with-card',
        'multi-layer': 'multi-layer-composition',
        'multi-layer-composition': 'multi-layer-composition',
        'pip': 'multi-layer-composition',
        'card-group': 'video-with-card'  // CardGroup由后续逻辑处理
      };

      return {
        type: sceneTypeMap[preferredType] || 'video-with-card',
        params: ruleParams,
        reason: rule.description || rule.reason || '规则匹配',
        ruleId: rule.id,
        confidence: match.score
      };
    }

    // 无匹配规则，使用默认逻辑
    return this.decideSceneTypeByDefault(contentFeatures);
  }

  /**
   * 默认场景类型决策（无学习规则时使用）
   */
  decideSceneTypeByDefault(contentFeatures) {
    const { contentType, position, keywords } = contentFeatures;

    // 开场和结尾使用原视频
    if (position?.isOpening || position?.isEnding) {
      return {
        type: 'original',
        params: {},
        reason: position.isOpening ? '开场建立连接' : '结尾情感升华',
        confidence: 0.9
      };
    }

    // 有关键词的使用卡片
    if (keywords && keywords.length > 0) {
      return {
        type: 'video-with-card',
        params: { position: 'bottom' },
        reason: '强调关键概念',
        confidence: 0.8
      };
    }

    // 解释类内容使用多层
    if (contentType === 'explanation') {
      return {
        type: 'multi-layer-composition',
        params: { needMaterial: true },
        reason: '视觉辅助说明',
        confidence: 0.75
      };
    }

    // 默认使用卡片
    return {
      type: 'video-with-card',
      params: {},
      reason: '默认处理',
      confidence: 0.5
    };
  }

  /**
   * 核心执行逻辑（实现BaseAgent.run）
   * @param {Object} input - 输入参数
   * @param {Object} input.task_1_2 - 内容分析结果
   * @param {number} input.videoDuration - 视频时长
   * @param {Object} resumeData - 恢复数据（如果有）
   * @returns {Promise<Object>} 包含scenes和stats
   */
  async run(input, resumeData = null) {
    const { task_1_2, videoDuration } = input;
    const understanding = task_1_2.understanding;

    // 如果有恢复数据，直接返回
    if (resumeData?.scenes) {
      this.log('info', '  → 从检查点恢复场景规划结果');
      return {
        scenes: resumeData.scenes,
        stats: resumeData.stats,
        uiTimeline: resumeData.uiTimeline
      };
    }

    this.log('info', '🎬 SceneDesigner: 开始场景拆解');
    this.log('info', `  视频时长: ${videoDuration.toFixed(2)}秒`);

    // ⭐⭐⭐ 优先尝试 LLM 语义决策
    const keywords = understanding.keywords || [];
    const transcript = understanding.transcript?.text || understanding.summary || '';

    if (keywords.length > 0) {
      this._llmDecisions = await this.decideWithLLM(keywords, transcript, videoDuration);
    } else {
      this._llmDecisions = { success: false, fallbackToRules: true };
    }

    // 规划场景（会使用 _llmDecisions）
    let scenes = this.planScenes(understanding, videoDuration);

    // ⭐⭐⭐ 预处理：确保场景符合硬性规则（在规则引擎验证之前）
    this.log('info', '  → 预处理：确保场景符合硬性规则...');
    scenes = this.ensureHardRulesCompliance(scenes, videoDuration);

    // ⭐⭐⭐ 使用规则引擎验证和自动修复（v4.0 核心改进）
    this.log('info', '  → 使用规则引擎验证场景...');
    const ruleValidation = this.ruleEngine.validateAndFix(scenes, videoDuration);

    if (!ruleValidation.success) {
      // 硬性规则违反，记录详细警告但不阻止执行
      this.log('warn', `  ⚠️ 规则验证有问题: ${ruleValidation.message}`);
      for (const violation of ruleValidation.validation?.hardViolations || []) {
        this.log('warn', `    - ${violation.ruleName}: ${violation.message}`);
      }
      // ⭐ 改为警告而不是抛出错误，允许继续执行
      // 这样可以避免规则冲突导致的死循环
      this.log('warn', '  ⚠️ 继续执行，忽略规则验证错误');
    } else {
      this.log('info', '  ✅ 所有规则验证通过');
    }

    // 旧的验证方法（保留兼容性，但规则引擎优先）
    this.validateScenes(scenes, videoDuration);

    // 计算统计信息
    const stats = this.calculateStats(scenes, videoDuration);

    this.log('info', '  ✅ 场景拆解完成');
    this.log('info', `    - 总场景数: ${scenes.length}个`);
    this.log('info', `    - 原视频占比: ${stats.originalRatio}%`);
    this.log('info', `    - 卡片场景: ${stats.cardScenes}个`);
    this.log('info', `    - 多层场景: ${stats.multiLayerScenes}个`);

    // 生成UI时间轴
    const uiTimeline = this.createSimpleUITimeline(scenes, understanding, videoDuration);

    // ⭐ 构建符合契约的Timeline对象
    const timeline = {
      version: '2.0',
      duration: videoDuration,
      clips: scenes,
      stats: stats
    };

    // ⭐ 构建layerManifest（汇总所有场景的层信息）
    const layerManifest = {};
    scenes.forEach((scene, index) => {
      if (scene.layerManifest) {
        Object.entries(scene.layerManifest).forEach(([layerKey, layerConfig]) => {
          const uniqueKey = `scene_${index}_${layerKey}`;
          layerManifest[uniqueKey] = {
            ...layerConfig,
            sceneIndex: index,
            sceneId: scene.id
          };
        });
      }
    });

    // 保存检查点
    await this.saveCheckpoint('scenes_completed', { scenes, stats, uiTimeline, timeline, layerManifest });

    // ⭐ 返回符合契约的格式
    return {
      timeline: timeline,
      scenes: scenes,
      layerManifest: layerManifest,
      stats: stats,
      uiTimeline: uiTimeline
    };
  }

  /**
   * 场景拆解（兼容旧接口）
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 包含scenes和stats
   */
  async decomposeScenes(input) {
    return this.execute(input);
  }

  /**
   * 规划场景（v3.0 - LLM语义决策 + 规则匹配降级）
   * @param {Object} understanding - 内容理解结果（包含带时间戳的关键词）
   * @param {number} videoDuration - 视频时长
   * @param {Object} styleConfig - 风格配置对象（可选）
   * @returns {Array} 场景列表
   */
  planScenes(understanding, videoDuration, styleConfig = null) {
    this.log('info', '🎬 SceneDesigner: 场景规划（v3.0 - LLM语义决策）');

    if (styleConfig) {
      this.log('info', '  → 使用模板风格配置');
    }

    // ⭐ 新架构：使用TimelineEvent系统
    const keywords = understanding.keywords || [];
    const transcript = understanding.transcript?.text || understanding.summary || '';

    if (keywords.length === 0) {
      this.log('warn', '  ⚠️  没有关键词，使用降级方案');
      return this.planScenesLegacy(understanding, videoDuration, styleConfig);
    }

    // 1. 创建Timeline事件并生成场景列表
    this.timelineManager.createEventsFromKeywords(keywords);
    const scenes = this.timelineManager.generateScenes(videoDuration);

    // 2. ⭐⭐⭐ 核心改进：始终先进行交替排布，确保场景类型分布合理
    // 无论 LLM 是否可用，都要先调用 mergeToCardGroups 进行交替排布
    this.log('info', '  → 应用交替排布策略（卡片组 ↔ 多层场景）');
    this.mergeToCardGroups(scenes, videoDuration);

    // 3. LLM 语义决策只用于微调，不覆盖已设置的交替排布
    if (this._llmDecisions && this._llmDecisions.success) {
      this.log('info', '  → LLM 语义决策可用，但保持交替排布');
      // 不再调用 applyLLMDecisions，因为它会破坏交替排布
      // 只记录 LLM 的建议作为参考
      for (const decision of this._llmDecisions.decisions) {
        const sceneIndex = decision.keywordIndex;
        if (sceneIndex >= 0 && sceneIndex < scenes.length) {
          scenes[sceneIndex].llmSuggestion = decision.sceneType;
          scenes[sceneIndex].llmReason = decision.reason;
        }
      }
    }

    // 4. 应用规则匹配决策（只处理未被交替排布设置的场景）
    this.log('info', '  → 应用规则匹配决策（补充处理）');
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      // 跳过已经被 mergeToCardGroups 处理过的场景
      if (scene.type === 'card-group' ||
          scene.type === 'multi-layer-composition' ||
          scene.decisionSource === 'transition' ||
          scene.decisionSource === 'merge' ||
          scene.decisionSource === 'sub_keywords') {
        continue;
      }

      // 只处理 original 和 video-with-card 类型的场景
      const contentFeatures = {
        text: scene.keywordObj?.text || scene.description || '',
        keywords: scene.keywordObj ? [scene.keywordObj.text] : [],
        contentType: this.inferContentType(scene, i, scenes.length),
        position: {
          isOpening: i === 0 || scene.startTime < 5,
          isEnding: i === scenes.length - 1 || scene.endTime > videoDuration - 5,
          relativePosition: scene.startTime / videoDuration
        }
      };

      const decision = this.decideSceneTypeByRules(contentFeatures);
      if (decision.confidence > 0.6 && decision.type !== scene.type) {
        this.log('debug', `    场景${i + 1}: ${scene.type} → ${decision.type} (${decision.reason})`);
        scene.type = decision.type;
        scene.ruleApplied = decision.ruleId;
        scene.ruleReason = decision.reason;
        scene.decisionSource = 'rule';
      }
    }

    // 5. 为每个场景初始化LayerManifest和过渡效果
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      // 使用知识库验证场景配置
      const validation = this.sceneEngine.validateScene({
        duration: scene.endTime - scene.startTime,
        elements: scene.layerManifest ? Object.keys(scene.layerManifest).length : 0
      });

      if (!validation.valid) {
        this.log('warn', `  ⚠️  场景${i + 1}验证问题: ${validation.issues.map(issue => issue.message).join(', ')}`);
      }

      // 为场景添加过渡效果（基于知识库）
      if (i > 0) {
        const prevScene = scenes[i - 1];
        const transition = this.sceneEngine.recommendTransition(
          this.mapSceneTypeToKnowledge(prevScene.type),
          this.mapSceneTypeToKnowledge(scene.type)
        );
        scene.transition = transition;
      }

      // 初始化LayerManifest
      scene.layerManifest = this.initializeLayerManifest(scene, styleConfig);
    }

    // 5. 统计信息
    const stats = {
      total: scenes.length,
      original: scenes.filter(s => s.type === 'original').length,
      cardOnly: scenes.filter(s => s.type === 'video-with-card').length,
      multiLayer: scenes.filter(s => s.type === 'multi-layer-composition').length
    };

    this.log('info', `  ✅ 场景规划完成`);
    this.log('info', `    - 总场景数: ${stats.total}个`);
    this.log('info', `    - 原视频: ${stats.original}个`);
    this.log('info', `    - 卡片场景: ${stats.cardOnly}个`);
    this.log('info', `    - 多层场景: ${stats.multiLayer}个`);

    // 6. 验证原视频占比
    const originalDuration = scenes
      .filter(s => s.type === 'original')
      .reduce((sum, s) => sum + s.duration, 0);
    const originalRatio = (originalDuration / videoDuration) * 100;

    this.log('info', `    - 原视频占比: ${originalRatio.toFixed(1)}%`);

    if (originalRatio > this.rules.maxOriginalRatio) {
      this.log('warn', `    ⚠️  原视频占比超过${this.rules.maxOriginalRatio}%`);
    }

    return scenes;
  }

  /**
   * ⭐ 应用 LLM 决策到场景列表
   * @param {Array} scenes - 场景列表
   * @param {Array} decisions - LLM 决策数组
   */
  applyLLMDecisions(scenes, decisions) {
    for (const decision of decisions) {
      const sceneIndex = decision.keywordIndex;
      if (sceneIndex >= 0 && sceneIndex < scenes.length) {
        const scene = scenes[sceneIndex];
        const oldType = scene.type;
        scene.type = decision.sceneType;
        scene.llmReason = decision.reason;
        scene.decisionSource = 'llm';

        if (oldType !== decision.sceneType) {
          this.log('info', `    场景${sceneIndex + 1}: ${oldType} → ${decision.sceneType} (${decision.reason})`);
        }
      }
    }
  }

  /**
   * ⭐ 应用规则匹配决策到场景列表（v4.0 - 优先卡片组）
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   */
  applyRuleBasedDecisions(scenes, videoDuration) {
    // 显示编辑规则知识库状态
    const ruleStats = this.editingKnowledge.getStats();
    this.log('info', `  → 编辑规则知识库: ${ruleStats.totalRules}条规则, 平均置信度${ruleStats.averageConfidence}`);

    // ⭐⭐⭐ 第一步：将相邻关键词合并为卡片组（优先策略）
    this.mergeToCardGroups(scenes, videoDuration);

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      // ⭐⭐⭐ 跳过已经被 mergeToCardGroups 处理过的场景
      // 这些场景的类型已经按照交替排布策略设置好了，不应该被规则覆盖
      if (scene.type === 'card-group' ||
          scene.type === 'multi-layer-composition' ||
          scene.decisionSource === 'transition') {
        continue;
      }

      // 构建内容特征，用于规则匹配
      const contentFeatures = {
        text: scene.keywordObj?.text || scene.description || '',
        keywords: scene.keywordObj ? [scene.keywordObj.text] : [],
        contentType: this.inferContentType(scene, i, scenes.length),
        position: {
          isOpening: i === 0 || scene.startTime < 5,
          isEnding: i === scenes.length - 1 || scene.endTime > videoDuration - 5,
          relativePosition: scene.startTime / videoDuration
        }
      };

      // 使用学习到的规则决定场景类型
      const decision = this.decideSceneTypeByRules(contentFeatures);

      // 如果规则建议的类型与当前不同，且置信度足够高，则更新
      if (decision.confidence > 0.6 && decision.type !== scene.type) {
        this.log('debug', `  → 场景${i + 1}: ${scene.type} → ${decision.type} (${decision.reason})`);
        scene.type = decision.type;
        scene.ruleApplied = decision.ruleId;
        scene.ruleReason = decision.reason;
        scene.decisionSource = 'rule';
      }
    }
  }

  /**
   * ⭐⭐⭐ 使用状态转移矩阵优化场景布局（v6.0）
   *
   * 策略：
   * - 使用状态转移矩阵实现自由组合布局
   * - 避免机械化的固定交替模式
   * - 基于内容密度动态调整场景时长
   * - 支持4种场景类型的自由组合
   *
   * 目标占比：
   * - 卡片组(card-group): ~30%
   * - 多层场景(multi-layer-composition): ~30%
   * - 原视频(original): ~25%
   * - 单卡片(video-with-card): ~15%
   *
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   */
  mergeToCardGroups(scenes, videoDuration) {
    this.log('info', '  → 优化：使用状态转移矩阵生成自由组合布局 v6.0');

    // 调用导入的优化器函数（函数会直接修改scenes数组）
    mergeToCardGroupsWithOptimizer(scenes, videoDuration, {
      rules: this.rules,
      log: (level, message) => this.log(level, message),
      useOptimizer: true
    });

    this.log('info', `    ✅ 布局优化完成，共生成 ${scenes.length} 个场景`);
  }

  /**
   * ⭐ 从多个场景创建卡片组
   * @param {Array} scenes - 场景列表
   * @returns {Object} 卡片组场景
   */
  createCardGroupScene(scenes) {
    const cards = scenes.map(s => ({
      text: s.keywordObj?.text || s.keyword || '',
      english: s.keywordObj?.english || '',
      subtitle: s.keywordObj?.english || ''
    }));

    return {
      id: `card_group_${scenes[0].id}`,
      type: 'card-group',
      startTime: scenes[0].startTime,
      endTime: scenes[scenes.length - 1].endTime,
      duration: scenes[scenes.length - 1].endTime - scenes[0].startTime,
      cards: cards,
      cardGroupConfig: {
        cards: cards,
        layout: cards.length <= 2 ? 'horizontal' : 'vertical',
        position: 'center',
        enterDelay: 0.35
      },
      keywordObj: scenes[0].keywordObj,
      decisionSource: 'merge'
    };
  }

  /**
   * ⭐ 从次关键词创建卡片组
   * @param {Object} scene - 场景对象
   * @returns {Object} 卡片组场景
   */
  createCardGroupFromSubKeywords(scene) {
    const mainKeyword = scene.keywordObj;
    const subKeywords = mainKeyword.subKeywords || [];

    const cards = [
      {
        text: mainKeyword.text,
        english: mainKeyword.english || '',
        subtitle: mainKeyword.english || '',
        isMain: true
      },
      ...subKeywords.slice(0, 2).map(sk => ({
        text: sk.text,
        english: sk.english || '',
        subtitle: sk.english || '',
        isMain: false
      }))
    ];

    return {
      id: `card_group_sub_${scene.id}`,
      type: 'card-group',
      startTime: scene.startTime,
      endTime: scene.endTime,
      duration: scene.endTime - scene.startTime,
      cards: cards,
      cardGroupConfig: {
        cards: cards,
        layout: 'vertical',
        position: 'center',
        enterDelay: 0.35
      },
      keywordObj: mainKeyword,
      decisionSource: 'sub_keywords'
    };
  }

  /**
   * ⭐ 初始化LayerManifest（为LayerOrchestrator准备）
   * @param {Object} scene - 场景对象
   * @param {Object} styleConfig - 风格配置对象（可选，来自TemplateStyleAnalyzer）
   * @returns {Object} LayerManifest对象
   */
  initializeLayerManifest(scene, styleConfig = null) {
    const manifest = {};

    if (scene.type === 'original') {
      // 原视频场景：无层
      return {};
    }

    // 使用风格配置或默认值
    const style = styleConfig || this.getDefaultStyleConfig();

    if (scene.type === 'video-with-card') {
      // 卡片场景：只有卡片层
      manifest.layer4_card = {
        type: 'card',
        enabled: true,
        agent: 'ProfessionalCardGenerator',
        status: 'pending',
        path: null,
        zIndex: 3,
        config: {
          style: style.card.style,
          width: style.card.width,
          height: style.card.height,
          position: style.card.position,
          backgroundColor: style.card.backgroundColor,
          textColor: style.card.textColor,
          borderRadius: style.card.borderRadius,
          hasShadow: style.card.hasShadow,
          animation: {
            enabled: style.card.animation.enabled,
            type: style.card.animation.type,
            duration: style.card.animation.duration,
            delay: style.card.animation.delay,
            easing: style.card.animation.easing
          },
          typography: style.card.typography
        }
      };
    }

    // ⭐⭐⭐ 新增：卡片组场景
    if (scene.type === 'card-group') {
      // 卡片组场景：多张卡片叠加
      manifest.layer4_card_group = {
        type: 'card-group',
        enabled: true,
        agent: 'ProfessionalCardGenerator',
        status: 'pending',
        path: null,
        zIndex: 3,
        config: {
          cards: scene.cards || scene.cardGroupConfig?.cards || [],
          layout: scene.cardGroupConfig?.layout || 'vertical',
          position: scene.cardGroupConfig?.position || 'center',
          enterDelay: scene.cardGroupConfig?.enterDelay || 0.35,
          style: style.card.style,
          backgroundColor: style.card.backgroundColor,
          textColor: style.card.textColor,
          borderRadius: style.card.borderRadius,
          hasShadow: style.card.hasShadow,
          animation: {
            enabled: true,
            type: 'slideInUp',
            duration: 0.5,
            staggerDelay: 0.35,
            easing: style.card.animation.easing
          },
          typography: style.card.typography
        }
      };
    }

    if (scene.type === 'multi-layer-composition') {
      // 多层场景：完整5层结构

      // Layer 1: 背景层
      manifest.layer1_background = {
        type: 'background',
        enabled: true,
        agent: 'BackgroundGeneratorService',
        status: 'pending',
        path: null,
        zIndex: 0,
        config: {
          style: style.background.style,
          color: style.background.color,
          width: style.background.width,
          height: style.background.height
        }
      };

      // Layer 2: 素材层（⭐⭐⭐ 阶段2：启用素材轮播）
      manifest.layer2_material = {
        type: 'material',
        enabled: true,
        agent: 'MaterialSearchService',
        status: 'pending',
        path: null,
        zIndex: 1,
        config: {
          position: style.material.position,
          opacity: style.material.opacity,
          // ⭐⭐⭐ 阶段2：启用素材轮播
          enableCarousel: true,      // 启用素材轮播
          carouselCount: 4,          // 每个关键词4个素材
          durationPerMaterial: 1.5,  // 每个素材1.5秒
          transitionDuration: 0.3,   // 过渡0.3秒
          transitionType: 'fade'     // 淡入淡出
        }
      };

      // Layer 3: 遮罩层（磨砂玻璃效果）
      manifest.layer3_mask = {
        type: 'mask',
        enabled: true,
        agent: 'ServerVideoCompositionService',
        status: 'pending',
        path: null,
        zIndex: 2,
        config: {
          enabled: style.mask.enabled,
          blurStrength: style.mask.blurStrength,
          opacity: style.mask.opacity,
          color: style.mask.color
        }
      };

      // Layer 4: 卡片层
      manifest.layer4_card = {
        type: 'card',
        enabled: true,
        agent: 'ProfessionalCardGenerator',
        status: 'pending',
        path: null,
        zIndex: 3,
        config: {
          style: style.card.style,
          width: style.card.width,
          height: style.card.height,
          position: style.card.position,
          backgroundColor: style.card.backgroundColor,
          textColor: style.card.textColor,
          borderRadius: style.card.borderRadius,
          hasShadow: style.card.hasShadow,
          animation: {
            enabled: style.card.animation.enabled,
            type: style.card.animation.type,
            duration: style.card.animation.duration,
            delay: style.card.animation.delay,
            easing: style.card.animation.easing
          },
          typography: style.card.typography
        }
      };

      // Layer 5: PIP层
      manifest.layer5_pip = {
        type: 'pip',
        enabled: true,
        agent: 'FaceVideoExtractorServiceV2',
        status: 'pending',
        path: null,
        zIndex: 4,
        config: {
          position: style.pip.position,
          width: style.pip.width,
          height: style.pip.height
        }
      };
    }

    return manifest;
  }

  /**
   * 获取默认风格配置（当没有模板分析时使用）
   * @returns {Object} 默认风格配置
   */
  getDefaultStyleConfig() {
    // ⭐ 使用全局风格配置
    const style = this.globalStyle;

    return {
      video: {
        width: 1284,
        height: 2778,
        fps: 30,
        orientation: 'vertical'
      },
      background: {
        style: 'dark',
        color: style.colors.background,
        width: 1284,
        height: 2778
      },
      material: {
        position: 'center',
        opacity: 0.7
      },
      mask: {
        enabled: true,
        blurStrength: style.effects.blur.large,
        opacity: 0.15,
        color: 'white'
      },
      card: {
        style: 'bright',
        // ⭐ 关键改进：卡片尺寸适配竖屏（600x300 → 1100x500）
        width: style.layout.card.width,    // 1100
        height: style.layout.card.height,  // 500
        position: 'bottom',
        // ⭐ 使用全局颜色配置
        backgroundColor: style.colors.primary,    // #FF2D55 (抖音红)
        textColor: style.colors.text,             // #FFFFFF
        borderRadius: style.effects.borderRadius.large,  // 20
        hasShadow: true,
        // ⭐ 使用全局动画配置
        animation: {
          enabled: true,
          type: style.animation.transitions.cardEnter.type,  // slideInUp
          duration: style.animation.duration.normal,         // 0.5
          delay: 0,
          easing: style.animation.easing.default             // cubic-bezier(0.4, 0, 0.2, 1)
        },
        // ⭐ 使用全局字体配置
        typography: {
          fontSize: style.typography.title.fontSize,      // 72
          fontWeight: style.typography.title.fontWeight,  // bold
          fontFamily: style.typography.fontFamily,        // PingFang SC
          lineHeight: style.typography.title.lineHeight,  // 1.2
          textAlign: 'center'
        }
      },
      pip: {
        position: 'bottom-right',
        // ⭐ 使用全局PIP配置
        width: style.layout.pip.width,   // '35%'
        height: style.layout.pip.height, // '25%'
        borderRadius: style.effects.borderRadius.medium,  // 15
        borderWidth: style.effects.border.width,          // 4
        borderColor: style.effects.border.color          // #FFFFFF
      },
      colors: {
        theme: 'dark',
        contrast: 'high',
        background: style.colors.background,
        cardBackground: style.colors.primary,
        cardText: style.colors.text
      }
    };
  }

  /**
   * 降级方案：使用旧的固定规则（当没有关键词时）
   * @param {Object} understanding - 内容理解结果
   * @param {number} videoDuration - 视频时长
   * @param {Object} styleConfig - 风格配置对象（可选）
   * @returns {Array} 场景列表
   */
  planScenesLegacy(understanding, videoDuration, styleConfig = null) {
    const scenes = [];
    let currentTime = 0;
    let sceneId = 1;

    // 1. 开场（原视频）
    scenes.push({
      id: `scene_${sceneId++}`,
      type: 'original',
      startTime: currentTime,
      endTime: currentTime + this.rules.openingDuration,
      description: '开场',
      needMaterial: false
    });
    currentTime += this.rules.openingDuration;

    // 2. 观点场景
    const viewpoints = understanding.viewpoints || [];
    const keywords = understanding.keywords || [];

    for (let i = 0; i < viewpoints.length; i++) {
      const vp = viewpoints[i];

      // 从关键词中找到最相关的关键词对象
      const relatedKeyword = this.findRelatedKeyword(vp.text, keywords);

      // 2.1 过渡（原视频）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'original',
        startTime: currentTime,
        endTime: currentTime + this.rules.transitionDuration,
        description: `过渡到观点${i + 1}`,
        needMaterial: false
      });
      currentTime += this.rules.transitionDuration;

      // 2.2 观点卡片
      if (vp.importance === 'high') {
        // 高重要性：多层场景
        scenes.push({
          id: `scene_${sceneId++}`,
          type: 'multi-layer-composition',
          startTime: currentTime,
          endTime: currentTime + this.rules.multiLayerDuration,
          description: `观点${i + 1}（重点）`,
          keywordObj: relatedKeyword,  // 使用关键词对象
          needMaterial: true,
          importance: 'high'
        });
        currentTime += this.rules.multiLayerDuration;

      } else {
        // 中低重要性：卡片场景
        scenes.push({
          id: `scene_${sceneId++}`,
          type: 'video-with-card',
          startTime: currentTime,
          endTime: currentTime + this.rules.cardDuration,
          description: `观点${i + 1}`,
          keywordObj: relatedKeyword,  // 使用关键词对象
          needMaterial: false,
          importance: vp.importance
        });
        currentTime += this.rules.cardDuration;
      }
    }

    // 3. 解释场景
    const explanations = understanding.explanations || [];
    for (let i = 0; i < Math.min(explanations.length, 2); i++) {
      const exp = explanations[i];

      // 从关键词中找到匹配的关键词对象
      const relatedKeyword = this.findRelatedKeyword(exp.keyword, keywords);

      // 3.1 过渡（原视频）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'original',
        startTime: currentTime,
        endTime: currentTime + this.rules.transitionDuration,
        description: `过渡到解释${i + 1}`,
        needMaterial: false
      });
      currentTime += this.rules.transitionDuration;

      // 3.2 解释场景（多层）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'multi-layer-composition',
        startTime: currentTime,
        endTime: currentTime + this.rules.multiLayerDuration,
        description: `解释：${exp.keyword}`,
        keywordObj: relatedKeyword,  // 使用关键词对象
        explanationText: exp.explanation,  // 保留解释文本用于多层场景
        needMaterial: true,
        importance: 'high'
      });
      currentTime += this.rules.multiLayerDuration;
    }

    // 4. 结尾（原视频）
    scenes.push({
      id: `scene_${sceneId++}`,
      type: 'original',
      startTime: currentTime,
      endTime: currentTime + this.rules.endingDuration,
      description: '结尾',
      needMaterial: false
    });
    currentTime += this.rules.endingDuration;

    // 5. 调整时间轴以适应视频时长
    const adjustedScenes = this.adjustTimeline(scenes, videoDuration);

    // 6. ⭐ 为每个场景初始化LayerManifest（使用风格配置）
    for (const scene of adjustedScenes) {
      scene.layerManifest = this.initializeLayerManifest(scene, styleConfig);
    }

    return adjustedScenes;
  }

  /**
   * ⭐ 从文本中提取有意义的词（用于卡片内容）
   * @param {string} text - 文本
   * @param {string} excludeWord - 要排除的词
   * @returns {Array<string>} 有意义的词数组
   */
  extractMeaningfulWords(text, excludeWord = '') {
    if (!text) return [];

    // 无意义词列表
    const meaninglessWords = new Set([
      '详解', '解析', '分析', '介绍', '说明', '讲解', '解读',
      '什么', '怎么', '如何', '为什么', '哪些', '哪个', '哪里',
      '这个', '那个', '这些', '那些', '这里', '那里',
      '就是', '可以', '能够', '应该', '需要', '必须',
      '一个', '一些', '一种', '一下', '一起',
      '非常', '特别', '十分', '很', '太', '最',
      '今天', '明天', '昨天', '现在', '以后', '之前',
      '大家', '我们', '你们', '他们', '自己',
      '其实', '所以', '因为', '但是', '而且', '或者',
      '第一', '第二', '第三', '首先', '然后', '最后',
      '内容', '详情', '要点', '重点'
    ]);

    // 简单分词（按标点和空格分割，然后提取2-4字的词）
    const words = [];
    const segments = text.split(/[，。！？、；：\s]+/);

    for (const segment of segments) {
      // 提取2-4字的中文词
      for (let len = 4; len >= 2; len--) {
        for (let i = 0; i <= segment.length - len; i++) {
          const word = segment.substring(i, i + len);
          if (/^[\u4e00-\u9fa5]+$/.test(word) &&
              !meaninglessWords.has(word) &&
              word !== excludeWord &&
              !word.includes(excludeWord) &&
              !excludeWord.includes(word)) {
            words.push(word);
          }
        }
      }
    }

    // 去重并返回前3个
    return [...new Set(words)].slice(0, 3);
  }

  /**
   * 调整时间轴
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Array} 调整后的场景列表
   */
  adjustTimeline(scenes, videoDuration) {
    const totalPlannedDuration = scenes[scenes.length - 1].endTime;

    if (totalPlannedDuration > videoDuration) {
      // 超出视频时长，按比例缩短
      const ratio = videoDuration / totalPlannedDuration;

      for (const scene of scenes) {
        scene.startTime *= ratio;
        scene.endTime *= ratio;
      }

    } else if (totalPlannedDuration < videoDuration) {
      // 未用完视频时长，延长结尾
      const lastScene = scenes[scenes.length - 1];
      lastScene.endTime = videoDuration;
    }

    return scenes;
  }

  /**
   * ⭐ 推断场景的内容类型
   * @param {Object} scene - 场景对象
   * @param {number} index - 场景索引
   * @param {number} totalScenes - 总场景数
   * @returns {string} 内容类型
   */
  inferContentType(scene, index, totalScenes) {
    const text = scene.keywordObj?.text || scene.description || '';

    // 位置判断
    if (index === 0) return 'opening';
    if (index === totalScenes - 1) return 'summary';

    // 关键词判断
    if (/第[一二三四五六七八九十]|首先|其次|另外|还有/.test(text)) {
      return 'argument';
    }

    if (/因为|所以|原因|解释|说明/.test(text)) {
      return 'explanation';
    }

    if (/比如|例如|案例|举例/.test(text)) {
      return 'example';
    }

    if (/重要|关键|核心|必须|一定/.test(text)) {
      return 'highlight';
    }

    if (/总结|综上|最后|总之/.test(text)) {
      return 'summary';
    }

    // 根据场景类型推断
    if (scene.type === 'original') {
      return 'transition';
    }

    return 'general';
  }

  /**
   * 将内部场景类型映射到知识库场景类型
   * @param {string} sceneType - 内部场景类型
   * @returns {string} 知识库场景类型
   */
  mapSceneTypeToKnowledge(sceneType) {
    const mapping = {
      'original': 'ORIGINAL_VIDEO',
      'video-with-card': 'VIDEO_WITH_CARDS',
      'multi-layer-composition': 'MULTI_LAYER'
    };
    return mapping[sceneType] || 'ORIGINAL_VIDEO';
  }

  /**
   * 从关键词列表中找到与文本最相关的关键词
   * @param {string} text - 文本（观点或解释）
   * @param {Array} keywords - 关键词对象数组
   * @returns {Object} 关键词对象
   */
  findRelatedKeyword(text, keywords) {
    if (!keywords || keywords.length === 0) {
      // 如果没有关键词，返回默认对象
      return {
        text: text.substring(0, 6),
        english: 'Keyword',
        category: 'concept'
      };
    }

    // 查找文本中包含的关键词
    for (const keyword of keywords) {
      if (text.includes(keyword.text)) {
        return keyword;
      }
    }

    // 如果没有找到匹配的，返回第一个关键词
    return keywords[0];
  }

  /**
   * ⭐⭐⭐ 确保场景符合硬性规则（预处理）
   * 在规则引擎验证之前调用，自动修复常见问题
   *
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Array} 修复后的场景列表
   */
  ensureHardRulesCompliance(scenes, videoDuration) {
    if (!scenes || scenes.length === 0) {
      this.log('warn', '    ⚠️ 场景列表为空，创建默认场景');
      return this.createDefaultScenes(videoDuration);
    }

    let fixedScenes = [...scenes];
    let fixCount = 0;

    // 配置
    const MAX_ORIGINAL_RATIO = 0.20;  // H001: 原视频最大占比 20%
    const maxOriginalDuration = videoDuration * MAX_ORIGINAL_RATIO;

    // 最小时长配置
    const minDurations = {
      'original': 1.0,
      'video-with-card': 3.0,
      'card-group': 6.0,
      'multi-layer-composition': 4.0
    };

    // ===== 1. 确保开场是 original 类型 (H004) =====
    // 但限制开场 original 的时长为 2-3 秒
    const OPENING_DURATION = 2.0;
    const ENDING_DURATION = 2.0;

    if (fixedScenes[0].type !== 'original') {
      this.log('info', `    🔧 修复开场类型: ${fixedScenes[0].type} → original`);
      // 插入一个短的开场 original 场景
      fixedScenes.unshift({
        id: 'scene_opening_fix',
        type: 'original',
        startTime: 0,
        endTime: OPENING_DURATION,
        duration: OPENING_DURATION,
        description: '开场'
      });
      fixCount++;
    } else {
      // 如果开场已经是 original，限制其时长
      if (fixedScenes[0].duration > OPENING_DURATION * 2) {
        this.log('info', `    🔧 限制开场时长: ${fixedScenes[0].duration.toFixed(1)}s → ${OPENING_DURATION}s`);
        fixedScenes[0].duration = OPENING_DURATION;
        fixedScenes[0].endTime = fixedScenes[0].startTime + OPENING_DURATION;
        fixCount++;
      }
    }

    // ===== 2. 确保结尾是 original 类型 (H004) =====
    // ⭐⭐⭐ 关键修复：检查最后一个场景，如果不是 original 或时长过长，需要修复
    const lastIdx = fixedScenes.length - 1;
    const lastScene = fixedScenes[lastIdx];

    // 检查最后一个场景是否需要修复
    const needsEndingFix = lastScene.type !== 'original' ||
                           lastScene.duration > ENDING_DURATION * 3 ||
                           lastScene.id === 'scene_original_final';  // 内部标识符

    if (needsEndingFix) {
      this.log('info', `    🔧 修复结尾场景: type=${lastScene.type}, duration=${lastScene.duration?.toFixed(1)}s`);

      // 如果最后一个场景时长过长（超过10秒），需要拆分
      if (lastScene.duration > 10) {
        // 将最后一个场景的时长限制为合理范围
        const newEndTime = lastScene.startTime + Math.min(lastScene.duration, 8);
        lastScene.endTime = newEndTime;
        lastScene.duration = newEndTime - lastScene.startTime;

        // 如果是内部标识符，转换为 card-group
        if (lastScene.id === 'scene_original_final' || lastScene.keyword === 'scene_original_final') {
          lastScene.type = 'card-group';
          lastScene.keyword = '总结';
          lastScene.cardText = '总结';
          lastScene.cards = [
            { text: '总结', subtitle: 'Summary', english: 'Summary' },
            { text: '回顾', subtitle: 'Review', english: 'Review' }
          ];
        }

        // 添加一个短的结尾 original 场景
        fixedScenes.push({
          id: 'scene_ending_fix',
          type: 'original',
          startTime: newEndTime,
          endTime: videoDuration,
          duration: videoDuration - newEndTime,
          description: '结尾'
        });
        this.log('info', `    🔧 拆分结尾场景，添加 ${(videoDuration - newEndTime).toFixed(1)}s 的 original 结尾`);
        fixCount++;
      } else if (lastScene.type !== 'original') {
        // 如果时长合理但类型不对，添加一个短的结尾
        fixedScenes.push({
          id: 'scene_ending_fix',
          type: 'original',
          startTime: videoDuration - ENDING_DURATION,
          endTime: videoDuration,
          duration: ENDING_DURATION,
          description: '结尾'
        });
        // 调整前一个场景的结束时间
        lastScene.endTime = videoDuration - ENDING_DURATION;
        lastScene.duration = lastScene.endTime - lastScene.startTime;
        this.log('info', `    🔧 添加 ${ENDING_DURATION}s 的 original 结尾`);
        fixCount++;
      }
    } else {
      // 如果结尾已经是 original，限制其时长
      if (lastScene.duration > ENDING_DURATION * 2) {
        this.log('info', `    🔧 限制结尾时长: ${lastScene.duration.toFixed(1)}s → ${ENDING_DURATION}s`);
        lastScene.startTime = videoDuration - ENDING_DURATION;
        lastScene.duration = ENDING_DURATION;
        lastScene.endTime = videoDuration;
        fixCount++;
      }
    }

    // ===== 3. 确保卡片组数据完整性 (H005) =====
    for (let i = 0; i < fixedScenes.length; i++) {
      const scene = fixedScenes[i];
      if (scene.type === 'card-group') {
        if (!scene.cards || !Array.isArray(scene.cards) || scene.cards.length < 2) {
          this.log('info', `    🔧 修复场景${i + 1}卡片组数据`);
          const keyword = scene.keywordObj?.text || scene.keyword || '关键词';
          const english = scene.keywordObj?.english || scene.english || '';

          // ⭐⭐⭐ 使用次关键词而不是硬编码的"详解"
          const subKeywords = scene.keywordObj?.subKeywords || [];
          const cards = [{ text: keyword, subtitle: english, english: english }];

          // 添加次关键词作为额外卡片
          for (const sk of subKeywords.slice(0, 2)) {
            cards.push({
              text: sk.text,
              subtitle: sk.english || '',
              english: sk.english || ''
            });
          }

          // 如果没有次关键词，使用上下文中的词
          if (cards.length < 2) {
            const context = scene.keywordObj?.context || scene.description || '';
            const contextWords = this.extractMeaningfulWords(context, keyword);
            for (const word of contextWords.slice(0, 2 - cards.length + 1)) {
              cards.push({
                text: word,
                subtitle: '',
                english: ''
              });
            }
          }

          scene.cards = cards;
          fixCount++;
        }
      }
    }

    // ===== 4. 检查并限制原视频占比 (H001) =====
    // 计算当前原视频总时长
    let originalDuration = fixedScenes
      .filter(s => s.type === 'original')
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    if (originalDuration > maxOriginalDuration) {
      this.log('info', `    🔧 原视频占比过高 (${(originalDuration / videoDuration * 100).toFixed(1)}% > 20%)，转换中间的 original 场景`);

      // 将中间的 original 场景转换为 multi-layer-composition（而不是 card-group）
      for (let i = 1; i < fixedScenes.length - 1; i++) {
        if (fixedScenes[i].type === 'original' && originalDuration > maxOriginalDuration) {
          this.log('info', `    🔧 转换场景${i + 1}: original → multi-layer-composition`);
          fixedScenes[i].type = 'multi-layer-composition';
          // 多层场景不需要 cards，使用关键词作为素材搜索依据
          fixedScenes[i].keyword = fixedScenes[i].keywordObj?.text || fixedScenes[i].keyword || '内容';
          // ⭐⭐⭐ 关键修复：初始化LayerManifest（启用素材轮播）
          fixedScenes[i].layerManifest = this.initializeLayerManifest(fixedScenes[i], null);
          originalDuration -= fixedScenes[i].duration || 0;
          fixCount++;
        }
      }
    }

    // ===== 5. 重新分配时间，确保所有场景满足最小时长 (H002 + H003) =====
    this.log('info', '    🔧 重新分配场景时间...');

    // 5.1 计算每个场景需要的时长
    const requiredDurations = fixedScenes.map((scene, index) => {
      const minDuration = minDurations[scene.type] || 2.0;

      // 开场和结尾的 original 场景使用固定短时长
      if (scene.type === 'original') {
        if (index === 0) return OPENING_DURATION;
        if (index === fixedScenes.length - 1) return ENDING_DURATION;
        // 中间的 original 场景（过渡）使用最小时长
        return Math.min(scene.duration || minDuration, 2.0);
      }

      // 其他场景使用当前时长和最小时长中的较大值
      const currentDuration = scene.duration || 0;
      return Math.max(minDuration, currentDuration > 0 ? currentDuration : minDuration);
    });

    // 5.2 计算总需求时长
    const totalRequired = requiredDurations.reduce((sum, d) => sum + d, 0);

    // 5.3 如果总需求超过视频时长，需要压缩非 original 场景
    if (totalRequired > videoDuration) {
      const nonOriginalTotal = requiredDurations.reduce((sum, d, i) =>
        fixedScenes[i].type !== 'original' ? sum + d : sum, 0);
      const originalTotal = requiredDurations.reduce((sum, d, i) =>
        fixedScenes[i].type === 'original' ? sum + d : sum, 0);
      const availableForNonOriginal = videoDuration - originalTotal;

      if (availableForNonOriginal > 0 && nonOriginalTotal > 0) {
        const scaleFactor = availableForNonOriginal / nonOriginalTotal;
        this.log('info', `    🔧 压缩非原视频场景，比例: ${scaleFactor.toFixed(2)}`);

        for (let i = 0; i < requiredDurations.length; i++) {
          if (fixedScenes[i].type !== 'original') {
            const minDuration = minDurations[fixedScenes[i].type] || 2.0;
            requiredDurations[i] = Math.max(minDuration, requiredDurations[i] * scaleFactor);
          }
        }
      }
    }

    // 5.4 重新分配时间
    let currentTime = 0;
    for (let i = 0; i < fixedScenes.length; i++) {
      const scene = fixedScenes[i];
      const duration = requiredDurations[i];

      scene.startTime = currentTime;
      scene.endTime = currentTime + duration;
      scene.duration = duration;

      currentTime = scene.endTime;
    }

    // 5.5 确保最后一个场景正好结束于视频时长
    const finalLastScene = fixedScenes[fixedScenes.length - 1];
    if (Math.abs(finalLastScene.endTime - videoDuration) > 0.01) {
      finalLastScene.endTime = videoDuration;
      finalLastScene.duration = finalLastScene.endTime - finalLastScene.startTime;
    }

    // 5.6 确保第一个场景从0开始
    if (fixedScenes[0].startTime !== 0) {
      fixedScenes[0].startTime = 0;
      fixedScenes[0].duration = fixedScenes[0].endTime;
    }

    // ===== 6. 最终验证 =====
    const finalOriginalDuration = fixedScenes
      .filter(s => s.type === 'original')
      .reduce((sum, s) => sum + s.duration, 0);
    const finalOriginalRatio = finalOriginalDuration / videoDuration;

    const totalDuration = fixedScenes.reduce((sum, s) => sum + s.duration, 0);

    this.log('info', `    ✅ 预处理完成，修复了 ${fixCount} 个问题`);
    this.log('info', `    📊 场景数: ${fixedScenes.length}, 总时长: ${totalDuration.toFixed(1)}s / ${videoDuration.toFixed(1)}s`);
    this.log('info', `    📊 原视频占比: ${(finalOriginalRatio * 100).toFixed(1)}% (目标: ≤20%)`);

    return fixedScenes;
  }

  /**
   * 合并短场景
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @param {Object} minDurations - 最小时长配置
   * @returns {Array} 合并后的场景列表
   */
  mergeShortScenes(scenes, videoDuration, minDurations) {
    const result = [];
    let i = 0;

    while (i < scenes.length) {
      const scene = scenes[i];
      const minDuration = minDurations[scene.type] || 2.0;

      // 如果场景太短，尝试与相邻场景合并
      if (scene.duration < minDuration && i < scenes.length - 1) {
        const nextScene = scenes[i + 1];

        // 合并到下一个场景
        this.log('info', `    🔧 合并场景${i + 1}到场景${i + 2}`);
        nextScene.startTime = scene.startTime;
        nextScene.duration = nextScene.endTime - nextScene.startTime;

        // 如果当前场景有关键词，保留到下一个场景
        if (scene.keywordObj && !nextScene.keywordObj) {
          nextScene.keywordObj = scene.keywordObj;
        }

        i++; // 跳过当前场景
      } else {
        result.push(scene);
        i++;
      }
    }

    // 确保开场和结尾是 original
    if (result.length > 0 && result[0].type !== 'original') {
      result[0].type = 'original';
    }
    if (result.length > 0 && result[result.length - 1].type !== 'original') {
      result[result.length - 1].type = 'original';
    }

    // 重新计算时间
    let currentTime = 0;
    for (const scene of result) {
      scene.startTime = currentTime;
      scene.endTime = currentTime + scene.duration;
      currentTime = scene.endTime;
    }

    // 确保最后一个场景结束于视频时长
    if (result.length > 0) {
      const last = result[result.length - 1];
      last.endTime = videoDuration;
      last.duration = last.endTime - last.startTime;
    }

    return result;
  }

  /**
   * 创建默认场景（当场景列表为空时）
   * @param {number} videoDuration - 视频时长
   * @returns {Array} 默认场景列表
   */
  createDefaultScenes(videoDuration) {
    const scenes = [];
    const segmentDuration = videoDuration / 3;

    // 开场 original
    scenes.push({
      id: 'scene_default_1',
      type: 'original',
      startTime: 0,
      endTime: segmentDuration,
      duration: segmentDuration,
      description: '开场'
    });

    // 中间 card-group
    scenes.push({
      id: 'scene_default_2',
      type: 'card-group',
      startTime: segmentDuration,
      endTime: segmentDuration * 2,
      duration: segmentDuration,
      description: '主体内容',
      cards: [
        { text: '内容1', subtitle: 'Content 1', english: 'Content 1' },
        { text: '内容2', subtitle: 'Content 2', english: 'Content 2' }
      ]
    });

    // 结尾 original
    scenes.push({
      id: 'scene_default_3',
      type: 'original',
      startTime: segmentDuration * 2,
      endTime: videoDuration,
      duration: videoDuration - segmentDuration * 2,
      description: '结尾'
    });

    return scenes;
  }

  /**
   * 验证场景
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   */
  validateScenes(scenes, videoDuration) {
    // 1. 自动修复时间轴连续性
    for (let i = 0; i < scenes.length - 1; i++) {
      const current = scenes[i];
      const next = scenes[i + 1];

      const gap = next.startTime - current.endTime;
      if (Math.abs(gap) > 0.01) {
        // 自动填补间隙：将当前场景的endTime延长到下一个场景的startTime
        this.log('warn', `  ⚠️  场景${i}和${i + 1}之间有${gap.toFixed(2)}秒间隙，自动修复`);
        current.endTime = next.startTime;
      }
    }

    // 2. 检查总时长
    const totalDuration = scenes[scenes.length - 1].endTime;
    if (Math.abs(totalDuration - videoDuration) > 0.1) {
      // 自动调整最后一个场景的endTime
      this.log('warn', `  ⚠️  总时长不匹配: ${totalDuration.toFixed(2)}s vs ${videoDuration.toFixed(2)}s，自动修复`);
      scenes[scenes.length - 1].endTime = videoDuration;
    }

    // 3. 检查原视频占比（仅警告，不抛出错误）
    const stats = this.calculateStats(scenes, videoDuration);
    if (stats.originalRatio > this.rules.maxOriginalRatio) {
      this.log('warn', `  ⚠️  原视频占比过高: ${stats.originalRatio.toFixed(1)}% > ${this.rules.maxOriginalRatio}%`);
    }

    // 4. 检查开场和结尾（仅警告，不抛出错误）
    if (scenes[0].type !== 'original') {
      this.log('warn', '  ⚠️  开场不是原视频');
    }
    if (scenes[scenes.length - 1].type !== 'original') {
      this.log('warn', '  ⚠️  结尾不是原视频');
    }
  }

  /**
   * 计算统计信息
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Object} 统计信息
   */
  calculateStats(scenes, videoDuration) {
    let originalDuration = 0;
    let cardScenes = 0;
    let multiLayerScenes = 0;

    for (const scene of scenes) {
      const duration = scene.endTime - scene.startTime;

      if (scene.type === 'original') {
        originalDuration += duration;
      } else if (scene.type === 'video-with-card') {
        cardScenes++;
      } else if (scene.type === 'multi-layer-composition') {
        multiLayerScenes++;
      }
    }

    return {
      totalScenes: scenes.length,
      originalScenes: scenes.filter(s => s.type === 'original').length,
      cardScenes: cardScenes,
      multiLayerScenes: multiLayerScenes,
      originalDuration: originalDuration,
      originalRatio: (originalDuration / videoDuration) * 100,
      avgSceneDuration: videoDuration / scenes.length
    };
  }

  /**
   * 创建简单的UI时间轴（从scenes生成）
   * @param {Array} scenes - 场景列表
   * @param {Object} understanding - 内容理解结果
   * @param {number} videoDuration - 视频时长
   * @returns {Object} UI时间轴
   */
  createSimpleUITimeline(scenes, understanding, videoDuration) {
    // 创建4个轨道
    const tracks = [
      { id: 'track_original', name: '原视频轨道', clips: [] },
      { id: 'track_cards', name: '卡片轨道', clips: [] },
      { id: 'track_pip', name: '画中画轨道', clips: [] },
      { id: 'track_material', name: '素材轨道', clips: [] }
    ];

    // ⭐ 新增：检测并分组连续的卡片场景为CardGroup
    const cardGroupScenes = this.detectCardGroupScenes(scenes);

    // 从scenes中提取clips
    scenes.forEach((scene, index) => {
      // ⭐ 检查是否属于CardGroup
      const cardGroupInfo = cardGroupScenes.get(scene.id);

      if (scene.type === 'video-with-card') {
        // 卡片场景：添加到卡片轨道
        const keywordText = scene.keywordObj?.text || '关键词';
        const keywordEnglish = scene.keywordObj?.english || 'Keyword';
        const cardText = keywordText.substring(0, 5);

        // ⭐ 如果是CardGroup的一部分
        if (cardGroupInfo && cardGroupInfo.isCardGroup) {
          // 只在组的第一个场景时创建CardGroup clip
          if (cardGroupInfo.isFirst) {
            tracks[1].clips.push({
              id: `card_group_${cardGroupInfo.groupId}`,
              type: 'card-group',  // ⭐ 新类型：卡片组
              startTime: cardGroupInfo.groupStartTime,
              endTime: cardGroupInfo.groupEndTime,
              content: {
                cards: cardGroupInfo.cards,  // 所有卡片内容
                layout: this.selectCardGroupLayout(cardGroupInfo.cards.length),
                position: 'center'
              },
              cardGroupConfig: {
                cards: cardGroupInfo.cards,
                layout: this.selectCardGroupLayout(cardGroupInfo.cards.length),
                position: 'center',
                enterDelay: 0.35,
                exitDuration: 0.4
              },
              metadata: {
                importance: 'high',
                sceneId: scene.id,
                isCardGroup: true,
                groupSize: cardGroupInfo.cards.length
              }
            });
            this.log('info', `  → 创建CardGroup: ${cardGroupInfo.cards.length}张卡片 [${cardGroupInfo.cards.map(c => c.text).join(', ')}]`);
          }
          // 非第一个场景不创建clip（已合并到CardGroup中）
        } else {
          // 普通单卡片场景
          tracks[1].clips.push({
            id: `card_${index}`,
            type: 'card',
            startTime: scene.startTime,
            endTime: scene.endTime,
            content: {
              keyword: cardText,
              english: keywordEnglish,
              text: cardText,
              fullText: keywordText,
              priority: 'medium'
            },
            metadata: {
              importance: 'medium',
              sceneId: scene.id
            },
            groupSize: 1,
            groupIndex: 0
          });
        }
      } else if (scene.type === 'multi-layer-composition') {
        // ⭐ 多层场景也支持CardGroup
        const keywordText = scene.keywordObj?.text || '素材';
        const keywordEnglish = scene.keywordObj?.english || 'Material';
        const cardText = keywordText.substring(0, 5);

        // ⭐ 如果是CardGroup的一部分
        if (cardGroupInfo && cardGroupInfo.isCardGroup) {
          if (cardGroupInfo.isFirst) {
            tracks[1].clips.push({
              id: `card_group_multi_${cardGroupInfo.groupId}`,
              type: 'card-group',
              startTime: cardGroupInfo.groupStartTime,
              endTime: cardGroupInfo.groupEndTime,
              content: {
                cards: cardGroupInfo.cards,
                layout: this.selectCardGroupLayout(cardGroupInfo.cards.length),
                position: 'center'
              },
              cardGroupConfig: {
                cards: cardGroupInfo.cards,
                layout: this.selectCardGroupLayout(cardGroupInfo.cards.length),
                position: 'center',
                enterDelay: 0.35,
                exitDuration: 0.4
              },
              metadata: {
                importance: 'high',
                sceneId: scene.id,
                isCardGroup: true,
                isMultiLayer: true,
                groupSize: cardGroupInfo.cards.length
              }
            });
            this.log('info', `  → 创建多层CardGroup: ${cardGroupInfo.cards.length}张卡片`);
          }
        } else {
          // 普通多层场景
          tracks[1].clips.push({
            id: `card_multi_${index}`,
            type: 'card',
            startTime: scene.startTime,
            endTime: scene.endTime,
            content: {
              keyword: cardText,
              english: keywordEnglish,
              text: cardText,
              fullText: keywordText,
              priority: 'high'
            },
            metadata: {
              importance: 'high',
              sceneId: scene.id,
              isMultiLayer: true
            },
            groupSize: 1,
            groupIndex: 0
          });
        }

        // 2. 添加素材到素材轨道（无论是否CardGroup都需要）
        tracks[3].clips.push({
          id: `material_${index}`,
          type: 'material',
          startTime: scene.startTime,
          endTime: scene.endTime,
          content: {
            keyword: keywordText,
            text: keywordText,
            english: keywordEnglish
          },
          metadata: {
            sceneId: scene.id
          }
        });
      }
    });

    return {
      version: '1.0',
      duration: videoDuration,
      fps: 30,
      tracks: tracks,
      markers: []
    };
  }

  /**
   * ⭐ 检测连续的卡片场景并分组为CardGroup
   *
   * 分组规则：
   * 1. 连续的卡片场景（video-with-card 或 multi-layer-composition）
   * 2. 场景之间的时间间隔小于阈值（默认2秒）
   * 3. 至少2个场景才能组成CardGroup
   *
   * @param {Array} scenes - 场景列表
   * @returns {Map} 场景ID到CardGroup信息的映射
   */
  detectCardGroupScenes(scenes) {
    const cardGroupMap = new Map();
    const groupingThreshold = 2.0;  // 场景间隔阈值（秒）
    const minGroupSize = 2;         // 最小分组大小
    const maxGroupSize = 5;         // 最大分组大小

    // 筛选出卡片相关场景
    const cardScenes = scenes.filter(s =>
      s.type === 'video-with-card' || s.type === 'multi-layer-composition'
    );

    if (cardScenes.length < minGroupSize) {
      return cardGroupMap;
    }

    // 检测连续场景组
    let currentGroup = [];
    let groupId = 0;

    for (let i = 0; i < cardScenes.length; i++) {
      const scene = cardScenes[i];
      const prevScene = i > 0 ? cardScenes[i - 1] : null;

      // 检查是否与前一个场景连续
      const isConsecutive = prevScene &&
        (scene.startTime - prevScene.endTime) < groupingThreshold;

      if (isConsecutive && currentGroup.length < maxGroupSize) {
        // 继续当前组
        currentGroup.push(scene);
      } else {
        // 结束当前组，开始新组
        if (currentGroup.length >= minGroupSize) {
          this.registerCardGroup(cardGroupMap, currentGroup, groupId++);
        }
        currentGroup = [scene];
      }
    }

    // 处理最后一组
    if (currentGroup.length >= minGroupSize) {
      this.registerCardGroup(cardGroupMap, currentGroup, groupId);
    }

    return cardGroupMap;
  }

  /**
   * ⭐ 注册CardGroup到映射表
   * @param {Map} cardGroupMap - CardGroup映射表
   * @param {Array} groupScenes - 组内场景列表
   * @param {number} groupId - 组ID
   */
  registerCardGroup(cardGroupMap, groupScenes, groupId) {
    const groupStartTime = groupScenes[0].startTime;
    const groupEndTime = groupScenes[groupScenes.length - 1].endTime;

    // 提取所有卡片内容
    const cards = groupScenes.map((scene, idx) => ({
      text: scene.keywordObj?.text?.substring(0, 8) || `观点${idx + 1}`,
      subtitle: scene.keywordObj?.english || null
    }));

    // 为每个场景注册信息
    groupScenes.forEach((scene, idx) => {
      cardGroupMap.set(scene.id, {
        isCardGroup: true,
        groupId: groupId,
        isFirst: idx === 0,
        isLast: idx === groupScenes.length - 1,
        groupIndex: idx,
        groupSize: groupScenes.length,
        groupStartTime: groupStartTime,
        groupEndTime: groupEndTime,
        cards: cards
      });
    });

    this.log('info', `  ✅ 检测到CardGroup #${groupId}: ${cards.length}张卡片 (${groupStartTime.toFixed(1)}s - ${groupEndTime.toFixed(1)}s)`);
  }

  /**
   * ⭐ 根据卡片数量选择最佳布局
   * @param {number} cardCount - 卡片数量
   * @returns {string} 布局类型
   */
  selectCardGroupLayout(cardCount) {
    if (cardCount <= 2) {
      return 'horizontal';  // 2张卡片水平排列
    } else if (cardCount <= 4) {
      return 'vertical';    // 3-4张卡片垂直排列
    } else {
      return 'stacked';     // 5张以上堆叠排列
    }
  }

  /**
   * 生成UI时间轴（新方法，基于约束系统）
   * @param {Object} input - 输入参数
   * @param {Object} input.task_0 - TimelineBuilder的输出
   * @param {Object} input.task_1_2 - ContentAnalyst的输出（已映射）
   * @returns {Promise<Object>} UI时间轴
   */
  async generateUITimeline(input) {
    const { task_0, task_1_2 } = input;
    const baseTimeline = task_0.baseTimeline;
    const understanding = task_1_2.understanding;

    this.log('info', '🎬 SceneDesigner: 生成UI时间轴（基于约束系统）');
    this.log('info', `  视频时长: ${baseTimeline.videoInfo.duration}秒`);
    this.log('info', `  插入点: ${baseTimeline.insertionPoints.length}个`);

    try {
      // 步骤1: 收集所有序列（声明式）
      const sequences = this.collectSequences(understanding);
      this.log('info', `  收集到 ${sequences.length} 个序列`);

      // 步骤2: 使用约束求解器计算最优布局
      const { layouts, groups, statistics } = this.constraintSolver.solve(sequences);
      this.log('info', `  约束求解完成:`);
      this.log('info', `    - 分组数: ${groups.length}个`);
      this.log('info', `    - 布局数: ${layouts.length}个`);
      this.log('info', `    - 独立序列: ${statistics.singleCount}个`);
      this.log('info', `    - 组合序列: ${statistics.groupedCount}个`);
      this.log('info', `    - 平均时长: ${statistics.avgDuration}秒`);

      // 步骤3: 生成playlist（MLT风格）
      const uiTimeline = this.playlistGenerator.generate(layouts, baseTimeline);

      this.log('info', '  ✅ UI时间轴生成完成');
      this.log('info', `    - 轨道数: ${uiTimeline.tracks.length}个`);
      this.log('info', `    - 总clips: ${uiTimeline.tracks.reduce((sum, t) => sum + t.clips.length, 0)}个`);

      return { uiTimeline };

    } catch (error) {
      this.log('error', '❌ UI时间轴生成失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 收集所有序列（声明式定义，使用关键词）
   * @param {Object} understanding - 内容理解结果
   * @returns {Array<SequenceDefinition>} 序列列表
   */
  collectSequences(understanding) {
    const sequences = [];

    // 优先使用keywordResults（包含精炼的关键词）
    if (understanding.keywordResults && understanding.keywordResults.length > 0) {
      this.log('info', '  使用关键词结果生成序列');

      // 按组ID分组
      const groups = new Map();
      for (const result of understanding.keywordResults) {
        if (!groups.has(result.groupId)) {
          groups.set(result.groupId, []);
        }
        groups.get(result.groupId).push(result);
      }

      // 为每组生成卡片序列
      for (const [groupId, groupResults] of groups) {
        // 按groupIndex排序
        groupResults.sort((a, b) => a.groupIndex - b.groupIndex);

        // 为每个关键词创建序列
        for (let i = 0; i < groupResults.length; i++) {
          const result = groupResults[i];
          const isFirst = i === 0;
          const isLast = i === groupResults.length - 1;

          sequences.push(
            new SequenceDefinition({
              type: result.type === 'viewpoint' && result.importance === 'high'
                ? 'pip'
                : 'card',
              content: {
                text: result.keyword,         // 单个关键词
                keyword: result.keyword,      // 精炼的关键词（2-4字）
                english: result.english,      // 英文翻译
                fullText: result.fullText,    // 完整文本（备用）
                insertionPoint: result.insertionPoint
              },
              insertionPoint: result.insertionPoint.time,
              minDuration: 4,      // TikTok 2026: 最少4秒
              maxDuration: 10,     // 最多10秒
              preferredDuration: 6, // 优先6秒
              canGroup: true,
              priority: result.importance,
              importance: result.importance,
              category: result.type,
              keywords: [result.keyword],
              // 卡片序列元数据
              groupId: groupId,
              groupIndex: i,
              groupSize: groupResults.length,
              isFirstInGroup: isFirst,
              isLastInGroup: isLast
            })
          );
        }

        this.log('info', `  → 卡片序列组: ${groupResults.map(r => r.keyword).join(' → ')} (${groupResults.length}张)`);
      }
    } else {
      // 降级：使用原始viewpoints和explanations
      this.log('info', '  使用原始观点和解释生成序列（降级）');

      // 1. 收集观点序列
      for (const viewpoint of understanding.viewpoints || []) {
        if (viewpoint.insertionPoint) {
          sequences.push(
            new SequenceDefinition({
              type: viewpoint.importance === 'high' ? 'pip' : 'card',
              content: {
                text: viewpoint.text,
                insertionPoint: viewpoint.insertionPoint
              },
              insertionPoint: viewpoint.insertionPoint.time,
              minDuration: 4,
              maxDuration: 10,
              preferredDuration: 6,
              canGroup: true,
              priority: viewpoint.importance,
              importance: viewpoint.importance,
              category: 'viewpoint',
              keywords: [viewpoint.text]
            })
          );
        }
      }

      // 2. 收集解释序列
      for (const explanation of understanding.explanations || []) {
        if (explanation.insertionPoint) {
          sequences.push(
            new SequenceDefinition({
              type: 'card',
              content: {
                text: explanation.explanation,
                keyword: explanation.keyword,
                insertionPoint: explanation.insertionPoint
              },
              insertionPoint: explanation.insertionPoint.time,
              minDuration: 4,
              maxDuration: 10,
              preferredDuration: 6,
              canGroup: true,
              priority: 'medium',
              importance: 'medium',
              category: 'explanation',
              keywords: [explanation.keyword, ...explanation.relatedKeywords]
            })
          );
        }
      }
    }

    // 按插入点时间排序
    sequences.sort((a, b) => a.constraints.insertionPoint - b.constraints.insertionPoint);

    return sequences;
  }

  /**
   * 创建轨道
   * @param {string} id - 轨道ID
   * @param {string} name - 轨道名称
   * @param {string} type - 轨道类型
   * @param {number} zIndex - z-index
   * @returns {Object} 轨道对象
   */
  createTrack(id, name, type, zIndex) {
    return {
      id: id,
      name: name,
      type: type,
      visible: true,
      locked: false,
      zIndex: zIndex,
      clips: []
    };
  }

  /**
   * 添加卡片clip（包含完整的特效配置）
   * @param {Array} tracks - 轨道数组
   * @param {Object} viewpoint - 观点对象
   * @param {number} clipId - clip ID
   */
  addCardClip(tracks, viewpoint, clipId) {
    const cardTrack = tracks.find(t => t.id === 'track_cards');
    const point = viewpoint.insertionPoint;

    cardTrack.clips.push({
      id: `clip_card_${clipId}`,
      name: `卡片: ${viewpoint.text.substring(0, 10)}...`,
      type: 'card',
      startTime: point.time,
      endTime: point.time + point.duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        text: viewpoint.text,
        style: 'blue',
        position: { x: 100, y: 800 },
        size: { width: 800, height: 200 },
        // 视觉特效配置（由VisualDesigner自动生成）
        effects: {
          borderRadius: 20,
          borderWidth: 0,
          borderColor: '#ffffff',
          shadow: {
            enabled: true,
            offsetX: 0,
            offsetY: 4,
            blur: 12,
            color: 'rgba(0, 0, 0, 0.3)'
          },
          // CSS样式（用于前端TimelineEditor渲染）
          css: {
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)'
          }
        }
      },
      keyframes: this.generateCardKeyframes(point.time, point.duration)
    });
  }

  /**
   * 添加多层组合clips
   * @param {Array} tracks - 轨道数组
   * @param {Object} viewpoint - 观点对象
   * @param {number} clipId - clip ID
   */
  addMultiLayerClips(tracks, viewpoint, clipId) {
    const point = viewpoint.insertionPoint;
    const duration = Math.max(point.duration, 4.0);  // 至少4秒

    // 添加素材clip
    const materialTrack = tracks.find(t => t.id === 'track_material');
    materialTrack.clips.push({
      id: `clip_material_${clipId}`,
      name: `素材: ${viewpoint.text.substring(0, 10)}...`,
      type: 'material',
      startTime: point.time,
      endTime: point.time + duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        keyword: viewpoint.text,
        materialPath: '',  // 将由MaterialExpert生成
        backgroundPath: '',
        maskPath: ''
      },
      keyframes: []
    });

    // 添加画中画clip（包含完整的特效配置）
    const pipTrack = tracks.find(t => t.id === 'track_pip');
    pipTrack.clips.push({
      id: `clip_pip_${clipId}`,
      name: `画中画: ${viewpoint.text.substring(0, 10)}...`,
      type: 'pip',
      startTime: point.time,
      endTime: point.time + duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        source: 'face_pip.mp4',
        position: { x: 340, y: 100 },
        size: { width: 400, height: 400 },
        // 视觉特效配置（由VisualDesigner自动生成）
        effects: {
          borderRadius: 200,  // 圆形
          borderWidth: 4,
          borderColor: '#ffffff',
          shadow: {
            enabled: true,
            offsetX: 0,
            offsetY: 4,
            blur: 16,
            color: 'rgba(0, 0, 0, 0.4)'
          },
          // CSS样式（用于前端TimelineEditor渲染）
          css: {
            borderRadius: '50%',  // 圆形
            border: '4px solid #ffffff',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.4)'
          }
        }
      },
      keyframes: []
    });
  }

  /**
   * 填充原视频片段
   * @param {Array} tracks - 轨道数组
   * @param {Object} baseTimeline - 基础时间轴
   */
  fillOriginalVideoClips(tracks, baseTimeline) {
    const originalTrack = tracks.find(t => t.id === 'track_original');
    const duration = baseTimeline.videoInfo.duration;

    // 获取所有已占用的时间段
    const occupiedRanges = [];
    for (const track of tracks) {
      for (const clip of track.clips) {
        occupiedRanges.push({ start: clip.startTime, end: clip.endTime });
      }
    }

    // 排序
    occupiedRanges.sort((a, b) => a.start - b.start);

    // 填充空白时间段
    let currentTime = 0;
    let clipId = 1;

    for (const range of occupiedRanges) {
      if (currentTime < range.start) {
        // 添加原视频片段
        originalTrack.clips.push({
          id: `clip_original_${clipId++}`,
          name: `原视频 ${currentTime.toFixed(1)}s-${range.start.toFixed(1)}s`,
          type: 'original',
          startTime: currentTime,
          endTime: range.start,
          linkedTo: {
            speechSegmentId: null,
            insertionPointId: null
          },
          source: {
            type: 'original_video',
            path: 'input.mp4',
            trimStart: currentTime,
            trimEnd: range.start
          },
          keyframes: []
        });
      }
      currentTime = range.end;
    }

    // 添加最后一段
    if (currentTime < duration) {
      originalTrack.clips.push({
        id: `clip_original_${clipId++}`,
        name: `原视频 ${currentTime.toFixed(1)}s-${duration.toFixed(1)}s`,
        type: 'original',
        startTime: currentTime,
        endTime: duration,
        linkedTo: {
          speechSegmentId: null,
          insertionPointId: null
        },
        source: {
          type: 'original_video',
          path: 'input.mp4',
          trimStart: currentTime,
          trimEnd: duration
        },
        keyframes: []
      });
    }
  }

  /**
   * 生成卡片关键帧（淡入淡出动画）
   * @param {number} startTime - 开始时间
   * @param {number} duration - 持续时间
   * @returns {Array} 关键帧数组
   */
  generateCardKeyframes(startTime, duration) {
    const fadeInDuration = 0.3;
    const fadeOutDuration = 0.3;

    return [
      {
        time: startTime,
        property: 'opacity',
        value: 0,
        easing: 'ease-in'
      },
      {
        time: startTime + fadeInDuration,
        property: 'opacity',
        value: 1,
        easing: 'ease-out'
      },
      {
        time: startTime + duration - fadeOutDuration,
        property: 'opacity',
        value: 1
      },
      {
        time: startTime + duration,
        property: 'opacity',
        value: 0
      }
    ];
  }

  /**
   * 创建标记
   * @param {Array} insertionPoints - 插入点数组
   * @returns {Array} 标记数组
   */
  createMarkers(insertionPoints) {
    return insertionPoints.map((point, index) => ({
      id: `marker_${index + 1}`,
      time: point.time,
      label: `插入点 ${index + 1}`,
      color: point.suitability === 'high' ? '#00ff00' : '#ffff00',
      type: 'insertion_point'
    }));
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
      rules: this.rules
    };
  }
}

export default SceneDesigner;
