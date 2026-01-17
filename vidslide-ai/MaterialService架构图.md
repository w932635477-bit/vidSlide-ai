# MaterialService 架构图

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      MaterialService.js                          │
│                    (核心服务 - 463行)                            │
│                                                                   │
│  职责: 统一入口，协调各个子服务                                  │
│  - 初始化所有子服务                                              │
│  - 实现外部优先搜索策略                                          │
│  - 提供统一的API接口                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ 协调
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│LocalSearch   │    │ExternalSearch│    │CacheService  │
│Service       │    │Service       │    │              │
│(295行)       │    │(324行)       │    │(229行)       │
│              │    │              │    │              │
│本地素材搜索  │    │外部API搜索   │    │缓存管理      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│MatchingService│   │QualityEvaluator│  │CuratedService│
│(329行)       │    │(325行)       │    │(191行)       │
│              │    │              │    │              │
│智能匹配      │    │质量评估      │    │精选素材      │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │StatsService  │
                  │(198行)       │
                  │              │
                  │统计服务      │
                  └──────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │materialConverters│
                  │(211行)       │
                  │              │
                  │工具函数      │
                  └──────────────┘
```

## 模块依赖关系

```
MaterialService (核心)
├── LocalSearchService
│   ├── LocalMaterialLibrary (已存在)
│   ├── CacheService
│   └── OfflineSupport (已存在)
│
├── ExternalSearchService
│   ├── FreeAPIService (已存在)
│   ├── BaiduImageService (已存在)
│   ├── IntelligentDispatcher (已存在)
│   ├── CacheService
│   ├── OfflineSupport (已存在)
│   └── materialConverters
│
├── CacheService
│   ├── SmartCache (已存在)
│   ├── LocalMaterialLibrary (已存在)
│   └── materialConverters
│
├── MatchingService
│   ├── CLIPMatcher (已存在)
│   └── materialConverters
│
├── QualityEvaluator
│   └── (独立模块，无外部依赖)
│
├── CuratedService
│   ├── CacheService
│   └── curatedMaterialRecipes (已存在)
│
├── StatsService
│   └── (独立模块，无外部依赖)
│
└── OfflineSupport (已存在)
```

## 数据流图

### 搜索流程

```
用户查询
    │
    ▼
MaterialService.searchMaterials()
    │
    ├─► StatsService.recordSearch()
    │
    ├─► ExternalSearchService.getDispatchDecision()
    │       │
    │       └─► IntelligentDispatcher (智能调度)
    │
    ├─► 检查网络状态 (OfflineSupport)
    │
    ├─► [在线] ExternalSearchService.searchExternalMaterials()
    │       │
    │       ├─► 百度图片 / Unsplash / Pexels / Pixabay
    │       │
    │       ├─► CacheService.cacheExternalResults()
    │       │
    │       └─► MatchingService.smartMatchMaterials()
    │               │
    │               └─► CLIPMatcher (AI匹配)
    │
    └─► [离线/失败] LocalSearchService.searchLocalMaterials()
            │
            ├─► CacheService.searchCache()
            │
            ├─► LocalMaterialLibrary.searchMaterials()
            │
            └─► LocalSearchService.searchPresetMaterials()
```

### 缓存流程

```
外部搜索结果
    │
    ▼
CacheService.cacheExternalResults()
    │
    ├─► materialConverters.convertImageToMaterial()
    │       │
    │       ├─► categorizeImage()
    │       └─► extractSemanticTags()
    │
    ├─► LocalMaterialLibrary.addExternalMaterial()
    │
    └─► SmartCache.addBatch()
```

### 质量评估流程

```
搜索结果
    │
    ▼
QualityEvaluator.evaluateSearchResults()
    │
    ├─► 检查结果数量
    │
    ├─► 计算平均匹配质量
    │
    ├─► 检查关键词覆盖率
    │
    ├─► 判断是否特定领域
    │
    └─► 返回评估结果
        │
        ├─► shouldFetchExternal: true/false
        ├─► reason: 原因
        └─► confidence: 置信度
```

## 模块交互时序图

```
用户 -> MaterialService: searchMaterials("科技")
MaterialService -> StatsService: recordSearch()
MaterialService -> ExternalSearchService: getDispatchDecision()
ExternalSearchService -> IntelligentDispatcher: dispatch()
IntelligentDispatcher --> ExternalSearchService: 决策结果
ExternalSearchService --> MaterialService: 平台推荐
MaterialService -> OfflineSupport: canUseExternalAPI()
OfflineSupport --> MaterialService: true
MaterialService -> ExternalSearchService: searchExternalMaterials()
ExternalSearchService -> FreeAPIService: searchImages()
FreeAPIService --> ExternalSearchService: 搜索结果
ExternalSearchService -> CacheService: cacheExternalResults()
CacheService -> materialConverters: convertImageToMaterial()
materialConverters --> CacheService: 转换后的素材
CacheService -> SmartCache: addBatch()
ExternalSearchService --> MaterialService: 外部结果
MaterialService -> MatchingService: smartMatchMaterials()
MatchingService -> CLIPMatcher: findBestMatches()
CLIPMatcher --> MatchingService: 智能排序结果
MatchingService --> MaterialService: 最终结果
MaterialService --> 用户: 搜索结果
```

## 模块职责矩阵

| 模块 | 搜索 | 缓存 | 匹配 | 评估 | 统计 | 工具 |
|------|------|------|------|------|------|------|
| MaterialService | ✅ | - | - | - | - | - |
| LocalSearchService | ✅ | - | - | - | - | - |
| ExternalSearchService | ✅ | - | - | - | - | - |
| CacheService | - | ✅ | - | - | - | - |
| MatchingService | - | - | ✅ | - | - | - |
| QualityEvaluator | - | - | - | ✅ | - | - |
| CuratedService | ✅ | - | - | - | - | - |
| StatsService | - | - | - | - | ✅ | - |
| materialConverters | - | - | - | - | - | ✅ |

## 代码行数分布

```
MaterialService.js         ████████████████████████ 463行 (18.0%)
ExternalSearchService.js   ████████████████████     324行 (12.6%)
MatchingService.js         ████████████████████     329行 (12.8%)
QualityEvaluator.js        ████████████████████     325行 (12.7%)
LocalSearchService.js      ███████████████          295行 (11.5%)
CacheService.js            ███████████              229行 (8.9%)
materialConverters.js      ██████████               211行 (8.2%)
StatsService.js            █████████                198行 (7.7%)
CuratedService.js          ████████                 191行 (7.4%)
                           ─────────────────────────────────
                           总计: 2565行 (100%)
```

## 性能优化点

### 1. 缓存层次
```
请求 -> SmartCache (内存) -> LocalMaterialLibrary (IndexedDB) -> 外部API
         ↑ 最快              ↑ 较快                            ↑ 最慢
```

### 2. 并行处理
```
搜索请求
    │
    ├─► 本地搜索 (并行)
    ├─► 缓存搜索 (并行)
    └─► 外部搜索 (并行)
         │
         └─► 多平台并行搜索
```

### 3. 智能降级
```
外部API
    │ 失败
    ▼
智能缓存
    │ 未命中
    ▼
本地素材库
    │ 未找到
    ▼
预置素材
```

## 扩展点

### 1. 新增搜索平台
在 `ExternalSearchService.js` 中添加新的 case:
```javascript
case 'new_platform':
  results = await this.newPlatformAPI.search(query)
  break
```

### 2. 新增匹配算法
在 `MatchingService.js` 中添加新方法:
```javascript
async newMatchingAlgorithm(query, materials) {
  // 实现新算法
}
```

### 3. 新增评估规则
在 `QualityEvaluator.js` 中添加新规则:
```javascript
// 规则N: 新的评估标准
if (newCondition) {
  return { shouldFetchExternal: true, reason: 'new_rule' }
}
```

## 总结

重构后的架构具有以下特点：

1. **清晰的层次结构**: 核心服务 -> 功能服务 -> 工具函数
2. **低耦合高内聚**: 每个模块职责单一，依赖明确
3. **易于扩展**: 新增功能只需修改对应模块
4. **便于测试**: 独立模块便于单元测试
5. **性能优化**: 多层缓存 + 并行处理 + 智能降级
