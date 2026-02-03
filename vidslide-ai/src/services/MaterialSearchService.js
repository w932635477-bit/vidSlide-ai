/**
 * 素材搜索服务 (v2.0 - 智能优化版)
 *
 * 功能：
 * 1. 根据关键词搜索相关素材（图片）
 * 2. 支持多个API源（百度图片, Unsplash, Pexels）
 * 3. 自动缓存下载的素材
 * 4. 智能降级策略
 * 5. ⭐ 关键词智能优化（扩展、精炼、多语言）
 * 6. ⭐ 素材智能评分（质量、相关性、新鲜度）
 * 7. ⭐ 多候选素材择优选择
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

// ⭐ 导入优化系统
import KeywordOptimizer from './KeywordOptimizer.js';
import MaterialScorer from './MaterialScorer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MaterialSearchService {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.cacheDir = options.cacheDir || path.join(__dirname, '../../../cache/materials');
    this.unsplashKey = options.unsplashKey || process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsKey = options.pexelsKey || process.env.PEXELS_API_KEY;

    // ⭐ 初始化优化系统
    this.keywordOptimizer = new KeywordOptimizer({ logger: this.logger });
    this.materialScorer = new MaterialScorer({ logger: this.logger });

    // 缓存索引：keyword -> localPath
    this.cacheIndex = new Map();

    // ⭐ 搜索配置（恢复合理的质量要求）
    this.searchConfig = {
      maxCandidates: options.maxCandidates || 8,      // 保持8个候选
      minScore: options.minScore || 60,               // 恢复到60分（提高成功率）
      enableScoring: options.enableScoring !== false  // 是否启用评分
    };

    // 确保缓存目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      this.logger.info('✅ MaterialSearchService: 缓存目录已创建');
    }

    // 加载缓存索引
    this.loadCacheIndex();

    this.logger.info('✅ MaterialSearchService v2.0 初始化完成');
    this.logger.info(`  缓存目录: ${this.cacheDir}`);
    this.logger.info(`  已缓存素材: ${this.cacheIndex.size}个`);
    this.logger.info(`  智能优化: 已启用`);
  }

  /**
   * 搜索素材（主方法 v2.0 - 智能优化版）
   * @param {string} keyword - 关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<string>} 素材本地路径
   */
  async searchMaterial(keyword, options = {}) {
    this.logger.info(`🔍 搜索素材: "${keyword}"`);

    // 合并搜索配置
    const searchOptions = { ...this.searchConfig, ...options };

    // ⭐ 1. 关键词优化
    const optimized = this.keywordOptimizer.optimize(keyword);
    this.logger.info(`  📝 关键词优化: ${optimized.refined} (分类: ${optimized.category.name})`);
    this.logger.info(`  📊 关键词评分: ${optimized.score.total} (${optimized.score.grade})`);

    // 2. 检查缓存（使用原始关键词和精炼关键词）
    const cacheKeys = [keyword, optimized.refined, ...optimized.expanded.slice(0, 3)];
    for (const cacheKey of cacheKeys) {
      if (this.cacheIndex.has(cacheKey)) {
        const cachedPath = this.cacheIndex.get(cacheKey);
        if (fs.existsSync(cachedPath)) {
          this.logger.info(`  ✅ 使用缓存素材: ${path.basename(cachedPath)}`);

          // ⭐ 评分缓存素材
          let validationScore = 0;
          let scoreDetails = null;
          if (searchOptions.enableScoring) {
            try {
              const scoreResult = await this.materialScorer.score(cachedPath, keyword, {
                title: cacheKey,
                category: optimized.category.name,
                visualStyle: optimized.visualStyle.style
              });
              validationScore = scoreResult.scores.overall;
              scoreDetails = scoreResult;
              this.logger.info(`  📊 素材评分: ${scoreResult.scores.overall} (${scoreResult.grade})`);
            } catch (error) {
              this.logger.warn(`  ⚠️ 评分失败: ${error.message}`);
              validationScore = 50;
            }
          }

          // ⭐ 返回包含评分信息的对象
          return {
            path: cachedPath,
            source: 'Cache',
            validationScore: validationScore,
            scoreDetails: scoreDetails,
            searchQuery: keyword,
            cached: true
          };
        } else {
          this.cacheIndex.delete(cacheKey);
        }
      }
    }

    // ⭐ 3. 多候选搜索
    const candidates = [];
    const searchQueries = this.generateSearchQueries(keyword, optimized);

    this.logger.info(`  🔎 搜索查询: ${searchQueries.length}个`);

    // ⭐ 4. 调用API搜索（优化版 - 优先高质量API）
    for (const query of searchQueries.slice(0, 3)) {
      // ✅ 优先Unsplash（高质量艺术图片）
      if (this.unsplashKey && candidates.length < searchOptions.maxCandidates) {
        try {
          const result = await this.searchUnsplash(query.english || keyword);
          if (result) {
            candidates.push({
              ...result,
              source: 'Unsplash',
              query: query.english
            });
          }
        } catch (error) {
          this.logger.warn(`  ⚠️ Unsplash搜索失败: ${error.message}`);
        }
      }

      // ✅ 备选Pexels（商业素材，版权清晰）
      if (this.pexelsKey && candidates.length < searchOptions.maxCandidates) {
        try {
          const result = await this.searchPexels(query.english || keyword);
          if (result) {
            candidates.push({
              ...result,
              source: 'Pexels',
              query: query.english
            });
          }
        } catch (error) {
          this.logger.warn(`  ⚠️ Pexels搜索失败: ${error.message}`);
        }
      }

      // ❌ 降级：百度图片搜索（最后选择）
      if (candidates.length < searchOptions.maxCandidates) {
        try {
          const results = await this.searchBaiduImageMultiple(query.chinese, searchOptions.maxCandidates);
          for (const result of results) {
            candidates.push({
              ...result,
              source: 'Baidu',
              query: query.chinese
            });
          }
        } catch (error) {
          this.logger.warn(`  ⚠️ 百度图片搜索失败: ${error.message}`);
        }
      }

      // 如果候选足够，停止搜索
      if (candidates.length >= searchOptions.maxCandidates) break;
    }

    this.logger.info(`  📦 找到候选素材: ${candidates.length}个`);

    // ⭐ 5. 下载并评分候选素材
    if (candidates.length > 0) {
      const bestCandidate = await this.selectBestCandidate(candidates, keyword, optimized);

      if (bestCandidate) {
        // ⭐ 如果已经有缓存路径（在selectBestCandidate中下载），直接使用
        const localPath = bestCandidate.cachedPath || await this.downloadAndCache(bestCandidate.url, keyword, bestCandidate.source);
        this.logger.info(`  ✅ 素材已缓存: ${path.basename(localPath)}`);

        // ⭐ 返回包含评分信息的对象
        return {
          path: localPath,
          source: bestCandidate.source,
          validationScore: bestCandidate.validationScore || 0,
          scoreDetails: bestCandidate.scoreDetails,
          searchQuery: searchQueries[0]?.chinese || keyword,
          cached: true
        };
      }
    }

    // 6. 降级：使用默认素材
    this.logger.warn(`  ⚠️ 所有API都失败，使用默认素材`);
    const defaultPath = this.getDefaultMaterial();

    // ⭐ 返回统一的对象格式
    return {
      path: defaultPath,
      source: 'Default',
      validationScore: 0,
      scoreDetails: null,
      searchQuery: keyword,
      cached: false
    };
  }

  /**
   * ⭐⭐⭐ 搜索多个素材（阶段2 - 素材轮播）
   * @param {string} keyword - 关键词
   * @param {Object} options - 搜索选项
   * @returns {Promise<Array>} 素材数组
   */
  async searchMultipleMaterials(keyword, options = {}) {
    const count = options.count || 4;  // 默认4个素材
    this.logger.info(`🔍 搜索多个素材: "${keyword}" (目标: ${count}个)`);

    // 合并搜索配置
    const searchOptions = { ...this.searchConfig, ...options };

    // 1. 关键词优化
    const optimized = this.keywordOptimizer.optimize(keyword);
    this.logger.info(`  📝 关键词优化: ${optimized.refined} (分类: ${optimized.category.name})`);

    // 2. 检查缓存（收集已缓存的素材）
    const cachedMaterials = [];
    const addedPaths = new Set();  // ⭐⭐⭐ 关键修复：记录已添加的路径，避免重复
    const cacheKeys = [keyword, optimized.refined, ...optimized.expanded.slice(0, 3)];

    for (const cacheKey of cacheKeys) {
      if (this.cacheIndex.has(cacheKey)) {
        const cachedPath = this.cacheIndex.get(cacheKey);

        // ⭐⭐⭐ 关键修复：检查是否已经添加过这个路径
        if (addedPaths.has(cachedPath)) {
          continue;  // 跳过重复的素材
        }

        if (fs.existsSync(cachedPath)) {
          // 评分缓存素材
          let validationScore = 0;
          if (searchOptions.enableScoring) {
            try {
              const scoreResult = await this.materialScorer.score(cachedPath, keyword, {
                title: cacheKey,
                category: optimized.category.name,
                visualStyle: optimized.visualStyle.style
              });
              validationScore = scoreResult.scores.overall;
            } catch (error) {
              validationScore = 50;
            }
          }

          cachedMaterials.push({
            path: cachedPath,
            source: 'Cache',
            validationScore: validationScore,
            index: cachedMaterials.length
          });

          addedPaths.add(cachedPath);  // ⭐⭐⭐ 关键修复：记录已添加的路径

          if (cachedMaterials.length >= count) {
            this.logger.info(`  ✅ 使用${cachedMaterials.length}个不同的缓存素材`);
            return cachedMaterials;
          }
        }
      }
    }

    // 3. 搜索更多候选（需要 count * 2 个候选以便筛选）
    const candidates = [];
    const searchQueries = this.generateSearchQueries(keyword, optimized);
    const targetCandidates = (count - cachedMaterials.length) * 2;

    this.logger.info(`  🔎 需要搜索 ${targetCandidates} 个候选素材`);

    // 4. 调用API搜索
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const results = await this.searchBaiduImageMultiple(query.chinese, Math.ceil(targetCandidates / 2));
        for (const result of results) {
          candidates.push({
            ...result,
            source: 'Baidu',
            query: query.chinese
          });
        }
      } catch (error) {
        this.logger.warn(`  ⚠️ 百度图片搜索失败: ${error.message}`);
      }

      if (candidates.length >= targetCandidates) break;
    }

    // 备选Unsplash
    if (candidates.length < targetCandidates && this.unsplashKey) {
      try {
        const result = await this.searchUnsplash(searchQueries[0]?.english || keyword);
        if (result) {
          candidates.push({ ...result, source: 'Unsplash' });
        }
      } catch (error) {
        this.logger.warn(`  ⚠️ Unsplash搜索失败: ${error.message}`);
      }
    }

    this.logger.info(`  📦 找到候选素材: ${candidates.length}个`);

    // 5. 评分并选择top N
    const scored = await this.scoreCandidates(candidates, keyword, optimized);
    const topN = scored.slice(0, count - cachedMaterials.length);

    // 6. 下载并缓存
    const newMaterials = [];
    for (let i = 0; i < topN.length; i++) {
      const candidate = topN[i];
      try {
        const localPath = await this.downloadAndCache(candidate.url, keyword, candidate.source);
        newMaterials.push({
          path: localPath,
          source: candidate.source,
          validationScore: candidate.validationScore || 0,
          index: cachedMaterials.length + i
        });
        this.logger.info(`  ✅ 素材 ${i + 1}/${topN.length} 已缓存`);
      } catch (error) {
        this.logger.warn(`  ⚠️ 下载失败: ${error.message}`);
      }
    }

    // 7. 合并缓存素材和新素材
    const allMaterials = [...cachedMaterials, ...newMaterials];
    this.logger.info(`  🎉 共获得 ${allMaterials.length} 个素材`);

    return allMaterials;
  }

  /**
   * ⭐ 评分候选素材（辅助方法）
   * @param {Array} candidates - 候选素材列表
   * @param {string} keyword - 关键词
   * @param {Object} optimized - 优化结果
   * @returns {Promise<Array>} 评分后的候选列表
   */
  async scoreCandidates(candidates, keyword, optimized) {
    const avoidKeywords = optimized.disambiguation?.isAmbiguous
      ? optimized.disambiguation.avoidKeywords || []
      : [];

    const scoredCandidates = [];

    for (const candidate of candidates) {
      let score = 50; // 基础分

      // 检查避免关键词
      if (candidate.title && avoidKeywords.length > 0) {
        const titleLower = candidate.title.toLowerCase();
        let shouldSkip = false;
        for (const avoidKw of avoidKeywords) {
          if (titleLower.includes(avoidKw.toLowerCase())) {
            shouldSkip = true;
            break;
          }
        }
        if (shouldSkip) continue; // 跳过包含错误含义的素材
      }

      // 分辨率评分
      if (candidate.width && candidate.height) {
        const isVertical = candidate.height > candidate.width;
        if (isVertical) score += 20;

        const resolution = candidate.width * candidate.height;
        if (resolution >= 1920 * 1080) score += 15;
        else if (resolution >= 1280 * 720) score += 10;
      }

      // 来源评分
      if (candidate.source === 'Unsplash') score += 10;
      else if (candidate.source === 'Pexels') score += 8;

      // 标题相关性评分
      if (candidate.title) {
        const titleLower = candidate.title.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        if (titleLower.includes(keywordLower)) score += 15;
      }

      scoredCandidates.push({ ...candidate, validationScore: score });
    }

    // 按评分排序
    scoredCandidates.sort((a, b) => b.validationScore - a.validationScore);

    return scoredCandidates;
  }

  /**
   * ⭐ 生成搜索查询列表
   * @param {string} keyword - 原始关键词
   * @param {Object} optimized - 优化结果
   * @returns {Array} 搜索查询列表
   */
  generateSearchQueries(keyword, optimized) {
    const queries = [];

    // ⭐⭐⭐ 如果是多义词，优先使用消歧后的查询
    if (optimized.disambiguation && optimized.disambiguation.isAmbiguous) {
      this.logger.info(`  ⚠️ 多义词检测: "${keyword}" → 使用消歧搜索`);

      // 消歧后的主查询（最高优先级）
      queries.push({
        chinese: optimized.disambiguation.searchReplacement + ' 商务 高清',
        english: optimized.disambiguation.english + ' professional',
        priority: 0,  // 最高优先级
        isDisambiguated: true
      });

      // 消歧后的视觉关键词查询
      if (optimized.disambiguation.visualKeywords) {
        for (const visualKw of optimized.disambiguation.visualKeywords.slice(0, 2)) {
          queries.push({
            chinese: visualKw + ' 商务',
            english: visualKw + ' professional',
            priority: 1,
            isDisambiguated: true
          });
        }
      }
    }

    // 主查询
    queries.push({
      chinese: optimized.searchQuery.chinese,
      english: optimized.searchQuery.english,
      priority: 2
    });

    // 精炼关键词查询
    if (optimized.refined !== keyword) {
      queries.push({
        chinese: `${optimized.refined} 高清 商务`,
        english: `${optimized.category.englishTerms[0] || 'business'} professional`,
        priority: 3
      });
    }

    // 视觉风格查询
    if (optimized.visualStyle.visualKeywords) {
      queries.push({
        chinese: `${keyword} ${optimized.visualStyle.name === 'data' ? '数据图表' : '商务'}`,
        english: optimized.visualStyle.visualKeywords.join(' '),
        priority: 4
      });
    }

    // 备选查询
    for (const alt of optimized.searchQuery.alternatives.slice(0, 2)) {
      queries.push({
        chinese: alt.query,
        english: alt.query,
        priority: 5
      });
    }

    // 按优先级排序
    queries.sort((a, b) => a.priority - b.priority);

    return queries;
  }

  /**
   * ⭐ 选择最佳候选素材
   * @param {Array} candidates - 候选素材列表
   * @param {string} keyword - 关键词
   * @param {Object} optimized - 优化结果
   * @returns {Promise<Object>} 最佳候选
   */
  async selectBestCandidate(candidates, keyword, optimized) {
    if (!this.searchConfig.enableScoring || candidates.length === 1) {
      // 不启用评分或只有一个候选，直接返回第一个
      return candidates[0];
    }

    this.logger.info(`  🎯 评估候选素材...`);

    // ⭐⭐⭐ 获取需要避免的关键词
    const avoidKeywords = optimized.disambiguation?.isAmbiguous
      ? optimized.disambiguation.avoidKeywords || []
      : [];

    // 为每个候选计算预评分（基于元数据）
    const scoredCandidates = candidates.map(candidate => {
      let score = 50; // 基础分

      // ⭐⭐⭐ 检查是否包含需要避免的关键词（严重扣分）
      if (candidate.title && avoidKeywords.length > 0) {
        const titleLower = candidate.title.toLowerCase();
        for (const avoidKw of avoidKeywords) {
          if (titleLower.includes(avoidKw.toLowerCase())) {
            score -= 100; // 严重扣分，基本排除
            this.logger.warn(`    ❌ 素材包含错误含义关键词: "${avoidKw}" - 排除`);
          }
        }
      }

      // 分辨率评分
      if (candidate.width && candidate.height) {
        const isVertical = candidate.height > candidate.width;
        if (isVertical) score += 20; // 竖版加分

        const resolution = candidate.width * candidate.height;
        if (resolution >= 1920 * 1080) score += 15;
        else if (resolution >= 1280 * 720) score += 10;
      }

      // 来源评分
      if (candidate.source === 'Unsplash') score += 10; // 高质量来源
      else if (candidate.source === 'Pexels') score += 8;

      // 标题相关性评分
      if (candidate.title) {
        const titleLower = candidate.title.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        if (titleLower.includes(keywordLower)) score += 15;
      }

      // ⭐ 视觉风格匹配加分
      if (optimized.visualStyle && candidate.title) {
        const visualKeywords = optimized.visualStyle.visualKeywords || [];
        for (const vk of visualKeywords) {
          if (candidate.title.toLowerCase().includes(vk.toLowerCase())) {
            score += 10;
            break;
          }
        }
      }

      return { ...candidate, preScore: score };
    });

    // 按预评分排序
    scoredCandidates.sort((a, b) => b.preScore - a.preScore);

    this.logger.info(`  📊 候选评分: ${scoredCandidates.slice(0, 3).map(c => `${c.source}:${c.preScore}`).join(', ')}`);

    // ⭐ 新增：过滤掉被排除的候选（preScore < 0）
    const validCandidates = scoredCandidates.filter(c => c.preScore >= 0);

    if (validCandidates.length === 0) {
      this.logger.warn('  ⚠️ 所有候选都被排除，尝试降级搜索');
      // 使用更宽泛的搜索词重新搜索
      return await this.searchWithFallback(keyword, optimized);
    }

    // 获取最高分候选
    const bestCandidate = validCandidates[0];

    // ⭐ 新增：为最佳候选添加详细评分
    if (bestCandidate && this.searchConfig.enableScoring) {
      try {
        // 先下载素材以便评分
        const tempPath = await this.downloadAndCache(bestCandidate.url, keyword, bestCandidate.source);

        const scoreResult = await this.materialScorer.score(
          tempPath,
          keyword,
          {
            title: bestCandidate.title,
            category: optimized.category?.name,
            visualStyle: optimized.visualStyle?.style
          }
        );

        // ⭐ 保存评分到候选对象
        bestCandidate.validationScore = scoreResult.scores.overall;
        bestCandidate.scoreDetails = scoreResult;
        bestCandidate.cachedPath = tempPath;

        this.logger.info(`  → 素材评分: ${scoreResult.scores.overall}分`);
      } catch (error) {
        this.logger.warn(`  ⚠️ 评分失败: ${error.message}`);
        bestCandidate.validationScore = 50; // 默认评分
      }
    }

    // 返回最高分候选
    return bestCandidate;
  }

  /**
   * ⭐ 新增：降级搜索方法
   * @param {string} keyword - 原始关键词
   * @param {Object} optimized - 优化结果
   * @returns {Promise<Object>} 降级搜索结果
   */
  async searchWithFallback(keyword, optimized) {
    this.logger.info('  → 使用降级搜索策略');

    // 策略1: 使用分类词搜索
    if (optimized.category) {
      const categoryQuery = `${optimized.category.name} 商务 高清`;
      this.logger.info(`  → 尝试分类搜索: ${categoryQuery}`);
      try {
        const results = await this.searchBaiduImageMultiple(categoryQuery, 10);
        if (results.length > 0) {
          this.logger.info(`  ✅ 分类搜索成功，找到${results.length}个结果`);
          // ⭐ 返回完整的对象格式
          return {
            ...results[0],
            source: 'Baidu',
            validationScore: 0,
            scoreDetails: null,
            searchQuery: categoryQuery,
            cached: false
          };
        }
      } catch (error) {
        this.logger.warn(`  ⚠️ 分类搜索失败: ${error.message}`);
      }
    }

    // 策略2: 使用通用商务图片
    const genericQuery = '商务 办公 高清';
    this.logger.info(`  → 尝试通用搜索: ${genericQuery}`);
    try {
      const results = await this.searchBaiduImageMultiple(genericQuery, 10);
      if (results.length > 0) {
        this.logger.info(`  ✅ 通用搜索成功，找到${results.length}个结果`);
        // ⭐ 返回完整的对象格式
        return {
          ...results[0],
          source: 'Baidu',
          validationScore: 0,
          scoreDetails: null,
          searchQuery: genericQuery,
          cached: false
        };
      }
    } catch (error) {
      this.logger.warn(`  ⚠️ 通用搜索失败: ${error.message}`);
    }

    // 策略3: 返回null，让上层处理
    this.logger.warn('  ⚠️ 所有降级搜索策略都失败');
    return null;
  }

  /**
   * ⭐ 搜索百度图片（多结果版本）
   * @param {string} keyword - 关键词
   * @param {number} count - 返回数量
   * @returns {Promise<Array>} 图片列表
   */
  async searchBaiduImageMultiple(keyword, count = 5) {
    const response = await axios.get('https://image.baidu.com/search/acjson', {
      params: {
        tn: 'resultjson_com',
        ipn: 'rj',
        word: keyword,
        pn: 0,
        rn: count * 2, // 请求更多以便筛选
        width: 0,
        height: 0,
        ic: 0,
        s: 0,
        st: -1,
        face: 0
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer: 'https://image.baidu.com'
      },
      timeout: 10000,
      proxy: false  // ⭐⭐⭐ 关键修复：禁用代理，避免503错误
    });

    const results = [];

    if (response.data && response.data.data && response.data.data.length > 0) {
      // 筛选有效图片
      const validImages = response.data.data.filter(img => img && img.thumbURL);

      // 优先竖版图片
      const sortedImages = validImages.sort((a, b) => {
        const aRatio = (parseInt(a.height) || 0) / (parseInt(a.width) || 1);
        const bRatio = (parseInt(b.height) || 0) / (parseInt(b.width) || 1);
        return bRatio - aRatio; // 高宽比大的排前面
      });

      for (const img of sortedImages.slice(0, count)) {
        results.push({
          url: img.thumbURL || img.middleURL || img.objURL,
          title: img.fromPageTitle || keyword,
          width: parseInt(img.width) || 0,
          height: parseInt(img.height) || 0
        });
      }
    }

    return results;
  }

  /**
   * ⭐ 搜索百度图片（acjson API - 关键词搜索）
   * 优先搜索竖版图片（适合抖音竖屏格式）
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
        rn: 10, // ⭐ 增加返回数量，以便筛选竖版图片
        width: 0, // 宽度筛选（0表示不限）
        height: 0, // 高度筛选（0表示不限）
        ic: 0, // 颜色筛选
        s: 0, // 尺寸筛选
        st: -1, // 类型筛选
        face: 0 // 人脸筛选
      },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer: 'https://image.baidu.com'
      },
      timeout: 10000
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      // ⭐ 筛选竖版图片（高度 > 宽度）
      const verticalImages = response.data.data.filter(img => {
        const width = parseInt(img.width) || 0;
        const height = parseInt(img.height) || 0;
        // 竖版图片：高度至少是宽度的1.2倍
        return height > width * 1.2;
      });

      // 如果找到竖版图片，优先使用
      const image = verticalImages.length > 0 ? verticalImages[0] : response.data.data[0];

      this.logger.info(`  📐 图片尺寸: ${image.width}x${image.height} (${verticalImages.length > 0 ? '竖版' : '横版'})`);

      return {
        url: image.thumbURL || image.middleURL || image.objURL, // 缩略图、中图或原图
        title: image.fromPageTitle || keyword,
        width: parseInt(image.width) || 0,
        height: parseInt(image.height) || 0
      };
    }

    return null;
  }

  /**
   * 搜索Unsplash
   * 优先搜索竖版图片（适合抖音竖屏格式）
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
          orientation: 'portrait', // ⭐ 改为竖版（portrait）
          content_filter: 'high' // 高质量内容
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashKey}`
        },
        timeout: 10000,
        proxy: false  // ⭐⭐⭐ 关键修复：禁用代理，避免503错误
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
   * 优先搜索竖版图片（适合抖音竖屏格式）
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
          orientation: 'portrait' // ⭐ 改为竖版（portrait）
        },
        headers: {
          'Authorization': this.pexelsKey
        },
        timeout: 10000,
        proxy: false  // ⭐⭐⭐ 关键修复：禁用代理，避免503错误
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
    // ⭐⭐⭐ 关键修复：使用imageUrl生成唯一文件名，避免覆盖
    // 使用URL的MD5哈希确保每个不同的图片都有唯一的文件名
    const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const filename = `material_${urlHash}.jpg`;
    const localPath = path.join(this.cacheDir, filename);

    this.logger.info(`  📥 下载素材: ${source}`);

    try {
      // 下载图片
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        proxy: false  // ⭐⭐⭐ 关键修复：禁用代理，避免下载失败
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
