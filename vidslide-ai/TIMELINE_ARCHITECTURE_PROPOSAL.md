# VidSlide AI 时间轴架构改进方案

## 📋 问题分析

### 当前架构的问题：
1. **数据流分散** - materials、cards、backgrounds由不同智能体生成，缺乏统一管理
2. **责任不清** - VideoEngineer不知道哪个场景缺少哪一层
3. **调试困难** - 无法快速定位是哪个智能体没有完成工作
4. **层配置隐式** - 层的配置隐藏在各个智能体的逻辑中

### 参考业界最佳实践：

基于 **[Editly](https://github.com/mifi/editly)** 的声明式架构（见 [npm文档](https://www.npmjs.com/package/editly)），采用：
- **clips[]** 数组定义时间轴
- **layers[]** 数组定义每个片段的多层结构
- **type** 字段明确标识层的类型和负责方

---

## 🎯 新架构设计

### 1. 三种画面类型（TimelineClipType）

```javascript
const ClipTypes = {
  ORIGINAL_VIDEO: 'original',      // 原视频（无叠加）
  VIDEO_WITH_CARD: 'video-card',   // 原视频 + 卡片层
  MULTI_LAYER: 'multi-layer'       // 完整5层结构
};
```

### 2. 时间轴片段（TimelineClip）

```javascript
{
  id: 'clip_001',
  type: 'multi-layer',  // 片段类型
  startTime: 0,
  endTime: 3,
  keyword: '抖音',

  // ⭐ 核心：LayerManifest（层清单）
  layerManifest: {
    layer1_background: {
      type: 'background',
      enabled: true,
      agent: 'BackgroundGenerator',
      status: 'completed',        // pending | in_progress | completed | failed
      path: '/path/to/bg.png',
      zIndex: 0
    },
    layer2_material: {
      type: 'material',
      enabled: true,
      agent: 'MaterialSearchService',
      status: 'completed',
      path: '/path/to/material.jpg',
      zIndex: 1,
      config: { opacity: 0.7 }
    },
    layer3_mask: {
      type: 'mask',
      enabled: true,
      agent: 'ServerVideoCompositionService',  // 渲染时应用
      status: 'completed',
      zIndex: 2,
      config: {
        blurStrength: 3,
        opacity: 0.15,
        color: 'white'
      }
    },
    layer4_card: {
      type: 'card',
      enabled: true,
      agent: 'VisualDesigner',
      status: 'completed',
      path: '/path/to/card.png',
      zIndex: 3,
      config: {
        position: 'top',
        animationDelay: 0.2
      }
    },
    layer5_pip: {
      type: 'pip',
      enabled: true,
      agent: 'FaceVideoExtractor',
      status: 'completed',
      path: '/path/to/face.mp4',
      zIndex: 4,
      config: {
        position: 'bottom'
      }
    }
  }
}
```

### 3. 完整时间轴结构（Timeline）

```javascript
{
  version: '2.0',
  videoDuration: 30,

  // ⭐ 时间轴片段数组
  clips: [
    // Clip 1: 原视频（0-2秒）
    {
      id: 'clip_opening',
      type: 'original',
      startTime: 0,
      endTime: 2,
      description: '开场',
      layerManifest: {}  // 空清单 = 纯原视频
    },

    // Clip 2: 多层内容（2-5秒）
    {
      id: 'clip_keyword1',
      type: 'multi-layer',
      startTime: 2,
      endTime: 5,
      keyword: '抖音',
      layerManifest: {
        layer1_background: { ... },
        layer2_material: { ... },
        layer3_mask: { ... },
        layer4_card: { ... },
        layer5_pip: { ... }
      }
    },

    // Clip 3: 卡片内容（5-8秒）
    {
      id: 'clip_keyword2',
      type: 'video-card',
      startTime: 5,
      endTime: 8,
      keyword: '直播',
      layerManifest: {
        layer4_card: { ... }  // 只有卡片层
      }
    }
  ],

  // 全局音频轨道
  audioTracks: [
    {
      path: '/path/to/original-audio.mp3',
      start: 0,
      mixVolume: 1.0
    }
  ]
}
```

---

## 🔧 智能体职责划分

### 1. **SceneDesigner**（场景设计师）
**职责**：生成Timeline结构，初始化LayerManifest

```javascript
async decomposeScenes(input) {
  const timeline = {
    clips: []
  };

  // 分析关键词，决定每个片段的类型
  keywords.forEach(kw => {
    const clip = {
      id: `clip_${kw.text}`,
      type: kw.importance === 'high' ? 'multi-layer' : 'video-card',
      startTime: kw.startTime,
      endTime: kw.endTime,
      keyword: kw.text,

      // ⭐ 初始化LayerManifest（所有层状态为pending）
      layerManifest: this.initializeLayerManifest(clipType)
    };

    timeline.clips.push(clip);
  });

  return timeline;
}

initializeLayerManifest(clipType) {
  if (clipType === 'multi-layer') {
    return {
      layer1_background: { status: 'pending', agent: 'BackgroundGenerator', ... },
      layer2_material: { status: 'pending', agent: 'MaterialSearchService', ... },
      layer3_mask: { status: 'pending', agent: 'ServerVideoCompositionService', ... },
      layer4_card: { status: 'pending', agent: 'VisualDesigner', ... },
      layer5_pip: { status: 'pending', agent: 'FaceVideoExtractor', ... }
    };
  } else if (clipType === 'video-card') {
    return {
      layer4_card: { status: 'pending', agent: 'VisualDesigner', ... }
    };
  } else {
    return {};  // 原视频无层
  }
}
```

**输出**：完整的Timeline对象，包含所有clips和初始化的layerManifest

---

### 2. **LayerOrchestrator**（新增：层协调器）
**职责**：遍历Timeline，分配任务给各智能体，填充LayerManifest

```javascript
class LayerOrchestrator {
  async orchestrateLayers(timeline) {
    for (const clip of timeline.clips) {
      const manifest = clip.layerManifest;

      // 为每一层分配任务
      for (const [layerId, layerSpec] of Object.entries(manifest)) {
        if (!layerSpec.enabled) continue;

        // 标记为进行中
        layerSpec.status = 'in_progress';

        try {
          // 根据agent调用对应智能体
          const result = await this.executeLayerTask(clip, layerId, layerSpec);

          // 更新manifest
          layerSpec.status = 'completed';
          layerSpec.path = result.path;
          layerSpec.metadata = result.metadata;

          this.logger.info(`✅ ${clip.id}.${layerId} 完成 (${layerSpec.agent})`);

        } catch (error) {
          layerSpec.status = 'failed';
          layerSpec.error = error.message;

          this.logger.error(`❌ ${clip.id}.${layerId} 失败 (${layerSpec.agent}): ${error.message}`);
        }
      }
    }

    return timeline;  // 返回填充完整的Timeline
  }

  async executeLayerTask(clip, layerId, layerSpec) {
    switch (layerSpec.agent) {
      case 'BackgroundGenerator':
        return await this.backgroundGenerator.generate(...);

      case 'MaterialSearchService':
        return await this.materialSearch.searchMaterial(clip.keyword);

      case 'VisualDesigner':
        return await this.visualDesigner.generateCard(...);

      case 'FaceVideoExtractor':
        return await this.faceExtractor.extract(...);

      default:
        throw new Error(`Unknown agent: ${layerSpec.agent}`);
    }
  }
}
```

**优势**：
- ✅ 集中管理所有层的生成
- ✅ 清晰的状态追踪
- ✅ 失败自动标记，不会静默失败
- ✅ 易于调试（看manifest即知哪层缺失）

---

### 3. **VideoEngineer**（视频工程师）
**职责**：读取完整的Timeline，执行渲染

```javascript
async composeVideo(timeline, videoPath) {
  this.logger.info('🎬 开始渲染视频');

  // ⭐ 验证Timeline完整性
  const validation = this.validateTimeline(timeline);
  if (!validation.valid) {
    this.logger.error('Timeline验证失败:', validation.errors);
    throw new Error('Timeline不完整');
  }

  // 转换Timeline为ServerVideoCompositionService所需的格式
  const { scenes, renderData } = this.convertTimelineToRenderData(timeline);

  // 调用视频合成服务
  return await this.compositionService.composeVideoWithLayers(
    videoPath,
    scenes,
    renderData,
    'douyin'
  );
}

validateTimeline(timeline) {
  const errors = [];

  timeline.clips.forEach(clip => {
    Object.entries(clip.layerManifest).forEach(([layerId, layer]) => {
      if (layer.enabled && layer.status !== 'completed') {
        errors.push({
          clipId: clip.id,
          layerId: layerId,
          agent: layer.agent,
          status: layer.status,
          error: layer.error
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

convertTimelineToRenderData(timeline) {
  const scenes = [];
  const renderData = [];

  timeline.clips.forEach(clip => {
    // 创建scene
    scenes.push({
      id: clip.id,
      type: clip.type,
      startTime: clip.startTime,
      endTime: clip.endTime
    });

    // 从manifest提取renderData
    Object.entries(clip.layerManifest).forEach(([layerId, layer]) => {
      if (layer.enabled && layer.status === 'completed') {
        renderData.push({
          layerType: layer.type,
          path: layer.path,
          sceneId: clip.id,
          startTime: clip.startTime,
          endTime: clip.endTime,
          zIndex: layer.zIndex,
          content: layer.config
        });
      }
    });
  });

  return { scenes, renderData };
}
```

---

## 🔄 新工作流程

```
1. ContentAnalyst（内容分析）
   ↓ 提取关键词

2. SceneDesigner（场景设计）
   ↓ 生成Timeline，初始化所有clips的layerManifest（状态=pending）

3. LayerOrchestrator（层协调 - 新增）
   ↓ 遍历Timeline的每个clip
   ├─ 为layer1调用BackgroundGenerator
   ├─ 为layer2调用MaterialSearchService
   ├─ 为layer4调用VisualDesigner
   └─ 为layer5调用FaceVideoExtractor
   ↓ 填充layerManifest（状态=completed，path=实际路径）

4. QualityDirector（质量检查）
   ↓ 验证Timeline完整性
   ↓ 检查是否有status='failed'的层

5. VideoEngineer（视频合成）
   ↓ 读取完整的Timeline
   ↓ 转换为renderData
   ↓ 调用ServerVideoCompositionService
   ↓ 输出最终视频
```

---

## 📊 调试界面示例

```javascript
// 打印Timeline状态（便于调试）
function printTimelineStatus(timeline) {
  console.log('📋 Timeline Status:');

  timeline.clips.forEach((clip, i) => {
    console.log(`\n  Clip ${i + 1}: ${clip.keyword} (${clip.startTime}s - ${clip.endTime}s)`);
    console.log(`  Type: ${clip.type}`);
    console.log(`  Layers:`);

    Object.entries(clip.layerManifest).forEach(([layerId, layer]) => {
      const statusIcon = {
        'pending': '⏳',
        'in_progress': '🔄',
        'completed': '✅',
        'failed': '❌'
      }[layer.status];

      console.log(`    ${statusIcon} ${layerId} (${layer.agent}) - ${layer.status}`);
      if (layer.status === 'failed') {
        console.log(`       Error: ${layer.error}`);
      }
    });
  });
}
```

**输出示例**：
```
📋 Timeline Status:

  Clip 1: 抖音 (2s - 5s)
  Type: multi-layer
  Layers:
    ✅ layer1_background (BackgroundGenerator) - completed
    ✅ layer2_material (MaterialSearchService) - completed
    ✅ layer3_mask (ServerVideoCompositionService) - completed
    ✅ layer4_card (VisualDesigner) - completed
    ❌ layer5_pip (FaceVideoExtractor) - failed
       Error: 未检测到人脸

  → 问题定位：FaceVideoExtractor需要检查
```

---

## ✅ 优势总结

### 1. **时间轴驱动，一目了然**
- 所有clips按时间顺序排列
- 每个clip的类型清晰（original/video-card/multi-layer）
- 每个clip应该有哪些层一目了然

### 2. **责任明确，易于调试**
- 每层的agent字段标识负责方
- status字段实时追踪状态
- 哪层失败立即知道是哪个智能体的问题

### 3. **统一数据流**
- Timeline是唯一数据源（Single Source of Truth）
- 所有智能体读写同一个Timeline对象
- 不再有分散的materials、cards、backgrounds数组

### 4. **易于扩展**
- 新增Layer 6？只需在manifest添加layer6定义
- 新增智能体？在executeLayerTask添加case
- 新增clip类型？在ClipTypes添加定义

### 5. **符合业界标准**
- 参考Editly的声明式架构
- clips + layers的层次结构
- 易于序列化为JSON（可视化编辑）

---

## 🎯 实施建议

### 阶段1：创建核心类型定义
- 定义 `TimelineClip` 类型
- 定义 `LayerManifest` 结构
- 定义 `LayerSpec` 接口

### 阶段2：实现LayerOrchestrator
- 创建新的协调器智能体
- 实现层任务分发逻辑
- 实现状态追踪和错误处理

### 阶段3：修改现有智能体
- SceneDesigner：输出Timeline而非scenes数组
- VideoEngineer：输入Timeline而非分散的数组
- 其他智能体保持不变（作为LayerOrchestrator的执行者）

### 阶段4：添加调试工具
- Timeline可视化打印函数
- 状态监控面板
- 错误定位助手

---

## 📚 参考资料

- [Editly - GitHub](https://github.com/mifi/editly) - 声明式视频编辑框架
- [Editly - npm](https://www.npmjs.com/package/editly) - JSON规范文档
- [Remotion - 时间轴构建](https://www.remotion.dev/docs/building-a-timeline) - React视频编辑框架

---

## 💡 示例代码

完整的LayerOrchestrator实现见：`src/agents/coordinator/LayerOrchestrator.js`（待创建）
Timeline类型定义见：`src/types/Timeline.js`（待创建）
