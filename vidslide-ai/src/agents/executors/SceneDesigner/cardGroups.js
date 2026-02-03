/**
 * SceneDesigner - 卡片组合并模块
 * v6.0 - 使用状态转移矩阵优化布局，打破机械化
 */

import { SimpleLayoutOptimizer } from '../../services/SimpleLayoutOptimizer.js';

/**
 * 从多个场景创建卡片组
 */
export function createCardGroupScene(scenes) {
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
    cards,
    cardGroupConfig: {
      cards,
      layout: cards.length <= 2 ? 'horizontal' : 'vertical',
      position: 'center',
      enterDelay: 0.35
    },
    keywordObj: scenes[0].keywordObj,
    decisionSource: 'merge'
  };
}

/**
 * 从次关键词创建卡片组
 */
export function createCardGroupFromSubKeywords(scene) {
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
    cards,
    cardGroupConfig: {
      cards,
      layout: 'vertical',
      position: 'center',
      enterDelay: 0.35
    },
    keywordObj: mainKeyword,
    decisionSource: 'sub_keywords'
  };
}

/**
 * 智能布局优化（核心优化 v6.0）
 *
 * ⭐ 新特性：使用状态转移矩阵替代简单交替逻辑
 *
 * 改进点：
 * 1. 打破机械化：不再是固定的 卡片组 ↔ 多层 交替
 * 2. 内容感知：根据关键词密度动态调整场景类型
 * 3. 概率驱动：使用转移矩阵实现自然的场景切换
 * 4. 约束保证：同类型场景不超过2次连续
 *
 * 策略：开场(原视频) → 智能选择(基于概率+密度) → 结尾(原视频)
 */
export function mergeToCardGroups(scenes, videoDuration, options = {}) {
  const { rules = {}, log = () => {}, useOptimizer = true } = options;
  const maxCardsPerScene = rules.maxCardsPerScene || 3;

  // ⭐ 新增：使用优化器（默认启用）
  if (useOptimizer) {
    return mergeWithOptimizer(scenes, videoDuration, { rules, log, maxCardsPerScene });
  }

  // 降级：使用原有的交替逻辑
  return mergeWithAlternating(scenes, videoDuration, { rules, log, maxCardsPerScene });
}

/**
 * 使用状态转移矩阵优化器（新方法）
 */
function mergeWithOptimizer(scenes, videoDuration, options) {
  const { rules = {}, log = () => {}, maxCardsPerScene = 3 } = options;

  log('info', '  → 🎯 优化：状态转移矩阵（智能布局）');

  // 创建优化器实例
  const optimizer = new SimpleLayoutOptimizer({ log });

  // 第1步：使用优化器生成场景类型序列
  const optimizedScenes = optimizer.generateOptimizedSequence(scenes, videoDuration, {
    rules,
    enableDynamicDuration: false // 暂时不启用动态时长
  });

  // 第2步：处理卡片组合并（保留原有逻辑）
  const mergedScenes = [];
  let i = 0;

  while (i < optimizedScenes.length) {
    const scene = optimizedScenes[i];

    // 如果是卡片组类型，尝试合并多个关键词
    if (scene.type === 'card-group') {
      const groupCandidates = [scene];
      let k = i + 1;

      // 尝试合并后续的卡片场景
      while (k < optimizedScenes.length &&
             optimizedScenes[k].type === 'card-group' &&
             groupCandidates.length < maxCardsPerScene) {
        const nextScene = optimizedScenes[k];
        const timeDiff = nextScene.startTime - groupCandidates[groupCandidates.length - 1].endTime;
        if (timeDiff < 5) {
          groupCandidates.push(nextScene);
          k++;
        } else break;
      }

      // 如果有多个卡片，创建卡片组
      if (groupCandidates.length >= 2) {
        const cardGroup = createCardGroupScene(groupCandidates);
        mergedScenes.push(cardGroup);
        log('info', `    → 卡片组: ${cardGroup.cards.map(c => c.text).join(' + ')}`);
        i = k;
        continue;
      } else if (scene.keywordObj?.subKeywords?.length > 0) {
        // 使用次关键词创建卡片组
        const cardGroup = createCardGroupFromSubKeywords(scene);
        mergedScenes.push(cardGroup);
        log('info', `    → 卡片组(次关键词): ${cardGroup.cards.map(c => c.text).join(' + ')}`);
        i++;
        continue;
      }
    }

    // 单个场景直接添加
    mergedScenes.push(scene);
    const typeLabel = {
      'original': '原视频',
      'card-group': '卡片组',
      'video-with-card': '单卡片',
      'multi-layer-composition': '多层场景'
    }[scene.type] || scene.type;
    log('info', `    → ${typeLabel}: ${scene.keywordObj?.text || scene.keyword || ''}`);
    i++;
  }

  // 第3步：插入过渡场景（如果需要）
  const finalScenes = [];
  for (let i = 0; i < mergedScenes.length; i++) {
    finalScenes.push(mergedScenes[i]);

    if (i < mergedScenes.length - 1) {
      const currentScene = mergedScenes[i];
      const nextScene = mergedScenes[i + 1];
      const gap = nextScene.startTime - currentScene.endTime;

      // 如果间隙较大，插入过渡场景
      if (gap >= 1.5) {
        const transitionScene = {
          id: `transition_${i}`,
          type: 'original',
          startTime: currentScene.endTime,
          endTime: Math.min(currentScene.endTime + 2, nextScene.startTime),
          duration: Math.min(2, gap),
          description: '过渡原视频',
          decisionSource: 'transition'
        };
        finalScenes.push(transitionScene);
        log('debug', `    → 过渡: ${transitionScene.startTime.toFixed(1)}s - ${transitionScene.endTime.toFixed(1)}s`);
      }
    }
  }

  // 第4步：验证序列合理性
  const validation = optimizer.validateSequence(finalScenes);
  if (!validation.valid) {
    log('warn', '  ⚠️ 场景序列验证发现问题:');
    validation.issues.forEach(issue => log('warn', `    - ${issue}`));
  }

  // 更新原数组
  scenes.length = 0;
  scenes.push(...finalScenes);

  return scenes;
}

/**
 * 使用交替逻辑（原有方法，作为降级方案）
 */
function mergeWithAlternating(scenes, videoDuration, options) {
  const { rules = {}, log = () => {}, maxCardsPerScene = 3 } = options;

  log('info', '  → 优化：交替排布场景类型（卡片组 ↔ 多层场景）');

  const mergedScenes = [];
  let i = 0;

  const openingDuration = Math.min(3, videoDuration * 0.03);
  const endingDuration = Math.min(3, videoDuration * 0.03);
  const middleScenes = [];

  while (i < scenes.length) {
    const scene = scenes[i];

    if (scene.startTime < openingDuration) {
      scene.type = 'original';
      scene.description = '开场原视频';
      mergedScenes.push(scene);
      i++;
      continue;
    }

    if (scene.endTime > videoDuration - endingDuration) break;

    middleScenes.push(scene);
    i++;
  }

  const sceneTypes = ['card-group', 'multi-layer-composition'];
  let typeIndex = 0;
  let cardGroupCount = 0;
  let multiLayerCount = 0;

  for (let j = 0; j < middleScenes.length; j++) {
    const scene = middleScenes[j];
    const currentType = sceneTypes[typeIndex % 2];

    if (currentType === 'card-group') {
      const groupCandidates = [scene];
      let k = j + 1;

      while (k < middleScenes.length && groupCandidates.length < maxCardsPerScene) {
        const nextScene = middleScenes[k];
        const timeDiff = nextScene.startTime - groupCandidates[groupCandidates.length - 1].endTime;
        if (timeDiff < 5) {
          groupCandidates.push(nextScene);
          k++;
        } else break;
      }

      if (groupCandidates.length >= 2) {
        const cardGroup = createCardGroupScene(groupCandidates);
        mergedScenes.push(cardGroup);
        cardGroupCount++;
        log('info', `    → 卡片组: ${cardGroup.cards.map(c => c.text).join(' + ')}`);
        j = k - 1;
      } else if (scene.keywordObj?.subKeywords?.length > 0) {
        const cardGroup = createCardGroupFromSubKeywords(scene);
        mergedScenes.push(cardGroup);
        cardGroupCount++;
        log('info', `    → 卡片组(次关键词): ${cardGroup.cards.map(c => c.text).join(' + ')}`);
      } else {
        scene.type = 'video-with-card';
        mergedScenes.push(scene);
        log('info', `    → 单卡片: ${scene.keywordObj?.text || scene.keyword}`);
      }
    } else {
      scene.type = 'multi-layer-composition';
      scene.description = `多层场景: ${scene.keywordObj?.text || scene.keyword}`;
      mergedScenes.push(scene);
      multiLayerCount++;
      log('info', `    → 多层场景: ${scene.keywordObj?.text || scene.keyword}`);
    }

    if (j < middleScenes.length - 1) {
      const currentScene = mergedScenes[mergedScenes.length - 1];
      const nextMiddleScene = middleScenes[j + 1];
      const gap = nextMiddleScene.startTime - currentScene.endTime;

      if (gap >= 1.5) {
        const transitionScene = {
          id: `transition_${j}`,
          type: 'original',
          startTime: currentScene.endTime,
          endTime: Math.min(currentScene.endTime + 2, nextMiddleScene.startTime),
          duration: Math.min(2, gap),
          description: '过渡原视频',
          decisionSource: 'transition'
        };
        mergedScenes.push(transitionScene);
        log('debug', `    → 过渡: ${transitionScene.startTime.toFixed(1)}s - ${transitionScene.endTime.toFixed(1)}s`);
      }
    }

    typeIndex++;
  }

  while (i < scenes.length) {
    const scene = scenes[i];
    scene.type = 'original';
    scene.description = '结尾原视频';
    mergedScenes.push(scene);
    i++;
  }

  scenes.length = 0;
  scenes.push(...mergedScenes);

  log('info', `    → 场景分布: 卡片组${cardGroupCount}个, 多层场景${multiLayerCount}个`);

  return scenes;
}
