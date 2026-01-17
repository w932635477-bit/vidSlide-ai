# MaterialService 快速参考指南

## 快速开始

### 1. 导入服务
```javascript
import MaterialService from './services/MaterialService.js'
```

### 2. 初始化
```javascript
await MaterialService.initialize()
```

### 3. 搜索素材
```javascript
const result = await MaterialService.searchMaterials('科技', {
  limit: 20,
  forceLocal: false,
  enableSmartMatching: true
})
```

## 常用API

### 搜索相关

#### 搜索素材（推荐）
```javascript
const result = await MaterialService.searchMaterials(query, options)
// options: { limit, context, forceLocal, enableSmartMatching }
```

#### 仅搜索本地
```javascript
const result = await MaterialService.searchLocalMaterials(query, { limit: 20 })
```

#### 仅搜索外部
```javascript
const result = await MaterialService.searchExternalMaterials(query, { limit: 20 })
```

### 智能匹配

#### CLIP智能匹配
```javascript
const matched = await MaterialService.smartMatchMaterials(
  query,
  materials,
  contentAnalysis
)
```

#### 计算本地匹配度
```javascript
const matchRate = await MaterialService.calculateLocalMatchRate(['科技', '创新'])
// 返回: { matchRate, avgConfidence, coverageRate, matchedCount }
```

### 素材管理

#### 记录使用
```javascript
await MaterialService.recordMaterialUsage(materialId)
```

#### 获取热门素材
```javascript
const popular = await MaterialService.getPopularMaterials(10)
```

#### 获取最近素材
```javascript
const recent = await MaterialService.getRecentMaterials(10)
```

#### 个性化推荐
```javascript
const recommendations = await MaterialService.getPersonalizedRecommendations(10)
```

### 精选素材

#### 获取精选素材
```javascript
const material = await MaterialService.getCuratedMaterial('recipe-id')
```

#### 获取推荐精选
```javascript
const materials = await MaterialService.getRecommendedCuratedMaterials(
  { industry: '科技' },
  10
)
```

#### 浏览配方库
```javascript
const recipes = MaterialService.browseCuratedLibrary('科技')
```

#### 搜索配方
```javascript
const recipes = MaterialService.searchCuratedRecipes('科技')
```

### 统计信息

#### 获取服务统计
```javascript
const stats = MaterialService.getServiceStats()
// 返回: { overall, local, external, cache, matching, curated }
```

#### 获取缓存统计
```javascript
const cacheStats = await MaterialService.getCacheStats()
// 返回: { smartCache, offlineSupport, service }
```

#### 获取配方库统计
```javascript
const stats = MaterialService.getCuratedLibraryStats()
// 返回: { totalRecipes, totalCategories, categories }
```

## 模块直接访问

### LocalSearchService
```javascript
// 搜索本地素材
const result = await MaterialService.localSearch.searchLocalMaterials(query, options)

// 搜索预置素材
const preset = await MaterialService.localSearch.searchPresetMaterials(query, options)

// 获取统计
const stats = MaterialService.localSearch.getStats()
```

### ExternalSearchService
```javascript
// 获取调度决策
const decision = await MaterialService.externalSearch.getDispatchDecision(query, options)

// 搜索外部素材
const result = await MaterialService.externalSearch.searchExternalMaterials(query, options)

// 获取统计
const stats = MaterialService.externalSearch.getStats()
```

### CacheService
```javascript
// 搜索缓存
const cached = await MaterialService.cache.searchCache(query, options)

// 缓存素材
await MaterialService.cache.cacheMaterials(materials, query)

// 获取统计
const stats = await MaterialService.cache.getStats()

// 清空缓存
await MaterialService.cache.clearAll()
```

### MatchingService
```javascript
// 智能匹配
const matched = await MaterialService.matching.smartMatchMaterials(query, materials, context)

// 关键词匹配
const matched = MaterialService.matching.fallbackKeywordMatch(query, materials)

// 计算匹配度
const rate = await MaterialService.matching.calculateLocalMatchRate(keywords, searchFn)

// 获取统计
const stats = MaterialService.matching.getStats()
```

### QualityEvaluator
```javascript
// 评估搜索结果
const evaluation = MaterialService.quality.evaluateSearchResults(results, query, context)

// 基于调度器评估
const evaluation = MaterialService.quality.evaluateSearchResultsWithDispatcher(
  results, query, context, decision
)

// 评估素材质量
const evaluated = await MaterialService.quality.evaluateMaterialsMatchQuality(keywords, materials)
```

### CuratedService
```javascript
// 获取精选素材
const material = await MaterialService.curated.getCuratedMaterial(recipeId, searchFn)

// 浏览配方库
const recipes = MaterialService.curated.browseCuratedLibrary(category)

// 搜索配方
const recipes = MaterialService.curated.searchCuratedRecipes(keyword)

// 获取统计
const stats = MaterialService.curated.getStats()
```

### StatsService
```javascript
// 记录搜索
MaterialService.stats.recordSearch()

// 记录本地命中
MaterialService.stats.recordLocalHit(count)

// 记录外部调用
MaterialService.stats.recordExternalCall()

// 获取原始统计
const stats = MaterialService.stats.getRawStats()

// 获取性能指标
const metrics = MaterialService.stats.getPerformanceMetrics()
```

## 工具函数

### materialConverters
```javascript
import {
  convertImageToMaterial,
  categorizeImage,
  extractSemanticTags,
  isChineseQuery,
  generateCacheKey,
  loadImage,
  preprocessMaterialsForCLIP
} from './services/materialConverters.js'

// 转换图片为素材
const material = convertImageToMaterial(image, 'unsplash')

// 分类图片
const category = categorizeImage(image)

// 提取语义标签
const tags = extractSemanticTags(image)

// 检测中文
const isChinese = isChineseQuery('科技')

// 生成缓存键
const key = generateCacheKey(query, options)

// 加载图片
const img = await loadImage(url)

// CLIP预处理
const processed = await preprocessMaterialsForCLIP(materials)
```

## 搜索选项详解

### searchMaterials 选项
```javascript
{
  limit: 20,              // 返回数量限制
  context: {},            // 上下文信息
  forceLocal: false,      // 强制仅本地搜索
  enableSmartMatching: true, // 启用CLIP智能匹配
  platforms: [],          // 指定搜索平台
  translation: null,      // 翻译信息
  userPreferences: {}     // 用户偏好
}
```

### 搜索结果格式
```javascript
{
  success: true,          // 是否成功
  materials: [],          // 素材数组
  totalCount: 0,          // 总数量
  source: 'external',     // 来源: external/cache/preset
  platforms: [],          // 使用的平台
  cached: false,          // 是否来自缓存
  searchStats: {          // 搜索统计
    localHits: 0,
    externalHits: 0,
    strategy: 'external_first',
    smartMatching: true
  }
}
```

## 错误处理

### 初始化失败
```javascript
try {
  await MaterialService.initialize()
} catch (error) {
  console.error('初始化失败:', error)
  // 处理错误
}
```

### 搜索失败
```javascript
const result = await MaterialService.searchMaterials(query)
if (!result.success) {
  console.error('搜索失败')
  // 使用降级策略
}
```

### 网络离线
```javascript
// 服务会自动降级到本地缓存
const result = await MaterialService.searchMaterials(query)
// result.source === 'cache' 或 'preset'
```

## 性能优化建议

### 1. 使用本地优先
```javascript
// 对于常见查询，使用本地优先
const result = await MaterialService.searchMaterials(query, {
  forceLocal: true
})
```

### 2. 批量操作
```javascript
// 批量获取精选素材
const materials = await MaterialService.getCuratedMaterialsBatch(recipeIds)
```

### 3. 缓存预热
```javascript
// 预先搜索常用关键词
const commonQueries = ['科技', '商务', '教育']
for (const query of commonQueries) {
  await MaterialService.searchMaterials(query)
}
```

### 4. 定期清理
```javascript
// 定期优化缓存
await MaterialService.optimize()
```

## 调试技巧

### 1. 查看统计信息
```javascript
const stats = MaterialService.getServiceStats()
console.log('搜索统计:', stats.overall)
console.log('本地命中率:', stats.overall.localHitRate)
console.log('外部调用率:', stats.overall.externalCallRate)
```

### 2. 查看缓存状态
```javascript
const cacheStats = await MaterialService.getCacheStats()
console.log('缓存命中:', cacheStats.service.cacheHits)
console.log('外部缓存:', cacheStats.service.externalCached)
```

### 3. 查看匹配质量
```javascript
const matchRate = await MaterialService.calculateLocalMatchRate(['科技'])
console.log('匹配度:', matchRate.matchRate)
console.log('覆盖率:', matchRate.coverageRate)
console.log('未覆盖关键词:', matchRate.uncoveredKeywords)
```

## 常见问题

### Q: 如何强制使用外部搜索？
A: 设置 `forceLocal: false` 并确保网络在线

### Q: 如何禁用CLIP智能匹配？
A: 设置 `enableSmartMatching: false`

### Q: 如何清空所有缓存？
A: 调用 `await MaterialService.cache.clearAll()`

### Q: 如何查看某个查询的匹配度？
A: 调用 `await MaterialService.calculateLocalMatchRate(keywords)`

### Q: 如何添加新的搜索平台？
A: 在 `ExternalSearchService.js` 中添加新的平台支持

## 测试

### 运行测试脚本
```bash
cd /Users/weilei/VidSlide\ AI/vidslide-ai/src/services/
node test-material-service-refactor.js
```

### 测试覆盖
- ✅ 服务初始化
- ✅ 本地搜索
- ✅ 外部搜索
- ✅ 缓存管理
- ✅ 智能匹配
- ✅ 质量评估
- ✅ 精选素材
- ✅ 统计服务
- ✅ 工具函数
- ✅ API兼容性

## 文件位置

```
/Users/weilei/VidSlide AI/vidslide-ai/src/services/
├── MaterialService.js              - 核心服务
├── LocalSearchService.js           - 本地搜索
├── ExternalSearchService.js        - 外部搜索
├── CacheService.js                 - 缓存管理
├── MatchingService.js              - 智能匹配
├── QualityEvaluator.js             - 质量评估
├── CuratedService.js               - 精选素材
├── StatsService.js                 - 统计服务
├── materialConverters.js           - 工具函数
└── test-material-service-refactor.js - 测试脚本
```

## 备份恢复

### 查看备份
```bash
ls -lh /Users/weilei/VidSlide\ AI/vidslide-ai/src/services/MaterialService.js.backup
```

### 恢复备份
```bash
cp /Users/weilei/VidSlide\ AI/vidslide-ai/src/services/MaterialService.js.backup \
   /Users/weilei/VidSlide\ AI/vidslide-ai/src/services/MaterialService.js
```

## 更多资源

- 📄 [重构完成报告](../MaterialService重构完成报告.md)
- 📊 [架构图](../MaterialService架构图.md)
- 🧪 [测试脚本](./test-material-service-refactor.js)
- 💾 [备份文件](./MaterialService.js.backup)
