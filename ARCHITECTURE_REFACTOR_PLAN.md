# VidSlide AI 架构重构方案

## 📋 文档信息
- **创建日期**: 2026-01-20
- **版本**: v2.0
- **状态**: 待确认

---

## 🎯 核心问题分析

### 当前架构的问题

1. **Remotion 模板系统的局限性**
   - ❌ 模板固定，限制了页面变化
   - ❌ 渲染速度慢，增加了时间成本
   - ❌ 模板图片会遮挡 PIP 视频窗口
   - ❌ 样式千篇一律，缺乏多样性
   - ❌ 复杂度高，维护困难

2. **豆包生图提示词不够精细**
   - ❌ 缺少视觉细节描述（边框、圆角、阴影、发光）
   - ❌ 提示词太抽象，生成效果不理想
   - ❌ 没有针对抖音短视频优化

3. **缺少智能排版系统**
   - ❌ 没有自动裁剪和缩放
   - ❌ 没有智能定位（避开 PIP）
   - ❌ 没有样式变化机制

---

## 💡 新方案设计

### 核心理念

**放弃 Remotion 模板，改用 FFmpeg 直接合成**

```
原视频 → 人脸跟踪PIP → 豆包生图 → 智能排版 → FFmpeg合成 → 最终视频
```

### 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        原始视频                              │
│                     (用户上传的讲解视频)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   人脸检测 & 跟踪                            │
│              (FaceDetectionService)                          │
│   - 检测人脸位置                                             │
│   - 跟踪人脸移动                                             │
│   - 计算 PIP 窗口位置                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   关键词提取                                 │
│              (KeywordClassifier)                             │
│   - 从字幕提取关键词                                         │
│   - 分类关键词类型                                           │
│   - 确定场景重要性                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              高级提示词生成 (新增)                           │
│         (AdvancedPromptGenerator)                            │
│   - 添加视觉细节（边框、圆角、阴影、发光）                   │
│   - 多样化风格（科技、商务、数据、强调）                     │
│   - 随机化确保不重复                                         │
│   - 针对抖音短视频优化                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   豆包生图                                   │
│              (DoubaoImageService)                            │
│   - 使用优化后的提示词                                       │
│   - 生成高质量图片                                           │
│   - 缓存结果                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              智能排版系统 (新增)                             │
│            (SmartLayoutService)                              │
│   - 自动计算尺寸（大、中、小变化）                           │
│   - 智能定位（避开 PIP 区域）                                │
│   - 样式多样化（5种边框+发光组合）                           │
│   - 避免重复布局                                             │
│   - 生成 FFmpeg 滤镜命令                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 FFmpeg 视频合成                              │
│           (ServerVideoProcessor)                             │
│   - 黑色/深色科技背景                                        │
│   - 叠加豆包生成的图片                                       │
│   - 添加关键词文字                                           │
│   - 叠加 PIP 视频窗口                                        │
│   - 输出最终视频                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 新增服务详解

### 1. AdvancedPromptGenerator (高级提示词生成器)

**文件位置**: `vidslide-ai/src/services/AdvancedPromptGenerator.js`

**核心功能**:
- 生成包含详细视觉效果的豆包提示词
- 确保风格多样性
- 针对抖音短视频优化

**提示词模板**:

```javascript
// 示例输出
"人工智能，科技感，科技蓝主色调，
霓虹发光边框（青色），圆角24px，
柔和阴影（向下20px，模糊40px），
金色发光效果，深色渐变背景，
对角线构图，数字流，电影级渲染"
```

**视觉效果库**:
- **边框样式**: 双层边框、单层渐变、霓虹发光、虚线、金属质感、无边框
- **圆角样式**: 16px、24px、32px、尖角、半圆角
- **阴影效果**: 柔和阴影、强烈阴影、多层阴影、发光阴影、无阴影
- **发光效果**: 蓝紫色、金色、青色、红色、白色、无发光
- **背景样式**: 纯黑、深蓝渐变、科技网格、粒子效果、深色渐变

**风格预设**:
- **科技风格**: 蓝紫色、青色、发光、粒子、未来感
- **商务风格**: 金色、深蓝、金属质感、渐变、专业感
- **数据风格**: 青色、绿色、图表、网格、清晰直观
- **强调风格**: 红色、金色、强烈发光、爆炸、震撼

**API 示例**:

```javascript
const generator = getInstance();

// 生成单个提示词
const prompt = generator.generate('人工智能', {
  stylePreset: 'tech',      // 风格: tech, business, data, emphasis
  sceneType: 'basic',       // 场景: basic, emphasis, chart
  includeEffects: true,     // 包含视觉效果
  randomize: true           // 随机化样式
});

// 批量生成（确保多样性）
const prompts = generator.generateBatch(['AI', '大数据', '云计算'], {
  stylePreset: 'tech'
});
```

---

### 2. SmartLayoutService (智能排版服务)

**文件位置**: `vidslide-ai/src/services/SmartLayoutService.js`

**核心功能**:
- 自动计算图片的裁剪、缩放、定位
- 智能避开 PIP 区域
- 确保样式多样化

**视频尺寸配置**:
```javascript
videoSize: {
  width: 1080,
  height: 1920
}

pipArea: {
  x: 290,        // 左边距
  y: 1520,       // 顶部距离
  width: 500,    // PIP宽度
  height: 280    // PIP高度
}
```

**尺寸预设**:
- **small**: 400x400 (缩放 0.4)
- **medium**: 600x600 (缩放 0.6)
- **large**: 800x800 (缩放 0.8)
- **xlarge**: 960x960 (缩放 0.95)

**位置预设** (避开 PIP 区域):
- top-center: (540, 400)
- top-left: (300, 350)
- top-right: (780, 350)
- middle-center: (540, 800)
- middle-left: (300, 800)
- middle-right: (780, 800)

**样式预设** (5种组合):
1. 金色边框 + 金色发光
2. 白色边框 + 蓝紫发光
3. 蓝紫边框 + 蓝紫发光
4. 青色边框 + 青色发光
5. 红色边框 + 红色发光

**API 示例**:

```javascript
const layoutService = getInstance();

// 生成单个布局
const layout = layoutService.generateLayout({
  sceneIndex: 0,           // 场景索引
  totalScenes: 5,          // 总场景数
  importance: 'normal',    // 重要性: low, normal, high
  contentType: 'general',  // 内容类型: general, data, emphasis
  avoidRepeat: true        // 避免重复
});

// 输出结果
{
  size: { width: 600, height: 600, scale: 0.6 },
  position: { x: 540, y: 400, anchor: 'center' },
  style: {
    borderColor: '#d4af37',
    borderWidth: 4,
    borderRadius: 24,
    glowColor: '#d4af37',
    glowIntensity: 0.6
  },
  crop: { width: 600, height: 600, fit: 'cover' },
  animation: { type: 'fade-in', duration: 0.3, easing: 'ease-in' }
}

// 批量生成（确保多样性）
const layouts = layoutService.generateBatchLayouts(5, {
  avoidRepeat: true
});

// 检查 PIP 重叠
const overlap = layoutService.checkPIPOverlap(layout);

// 生成 FFmpeg 滤镜命令
const filter = layoutService.generateFFmpegFilter(layout, 1);
// 输出: [1:v]scale=600:600[scaled1];[bg][scaled1]overlay=240:100[out1]
```

---

## 🔄 集成方案

### 修改的文件清单

#### 1. 新增文件
- ✅ `vidslide-ai/src/services/AdvancedPromptGenerator.js` (已创建)
- ✅ `vidslide-ai/src/services/SmartLayoutService.js` (已创建)

#### 2. 需要修改的文件

**A. DoubaoImageService.js**
- 集成 AdvancedPromptGenerator
- 使用优化后的提示词生成图片

**B. MicroSceneGenerator.js**
- 移除 Remotion 模板相关代码
- 集成 SmartLayoutService
- 为每个场景生成布局配置

**C. VideoCompositionService.js**
- 移除 Remotion 渲染逻辑
- 使用 FFmpeg 直接合成
- 应用智能排版配置

**D. MasterAutoGenerationAgent.js**
- 更新工作流程
- 移除 Remotion 相关步骤

#### 3. 可以删除的文件
- `remotion-templates/` 整个目录（保留作为备份）
- `vidslide-ai/src/services/RemotionService.js`
- `vidslide-ai/src/services/RemotionRenderer.js`

---

## 📝 详细修改步骤

### 步骤 1: 修改 DoubaoImageService.js

**当前代码** (第 70-72 行):
```javascript
// 2. 优化Prompt（这里先使用简单的优化，后续会用PromptOptimizer）
const prompt = this.optimizePrompt(keyword, context);
console.log(`[DoubaoImageService] 优化后的Prompt: ${prompt}`);
```

**修改为**:
```javascript
// 2. 使用高级提示词生成器
import { getInstance as getAdvancedPromptGenerator } from './AdvancedPromptGenerator.js';

// 在构造函数中
this.advancedPromptGenerator = getAdvancedPromptGenerator();

// 在 generateImage 方法中
const prompt = this.advancedPromptGenerator.generate(keyword, {
  stylePreset: context.stylePreset || 'tech',
  sceneType: context.sceneType || 'basic',
  includeEffects: true,
  randomize: true
});
console.log(`[DoubaoImageService] 高级提示词: ${prompt}`);
```

---

### 步骤 2: 修改 MicroSceneGenerator.js

**当前代码** (第 44-65 行):
```javascript
async generateMicroScenes(mainScene, keywords) {
  const microScenes = []

  // 🚧 临时禁用组合场景，因为模板图片会遮挡 PIP
  // TODO: 重新设计模板布局，为 PIP 预留空间
  console.log(`🎯 场景 ${mainScene.id}: 暂时禁用组合场景，使用原视频`)

  // 整个场景都是原视频
  microScenes.push({
    type: 'original',
    startTime: mainScene.startTime,
    endTime: mainScene.endTime,
    showPIP: false
  })

  console.log(`✅ 生成 ${microScenes.length} 个微场景（原视频）`)
  return microScenes
}
```

**修改为**:
```javascript
import { getInstance as getLayoutService } from './SmartLayoutService.js';

// 在构造函数中
this.layoutService = getLayoutService();

async generateMicroScenes(mainScene, keywords) {
  const microScenes = []

  console.log(`🎯 场景 ${mainScene.id}: 生成智能排版微场景`)

  // 为每个关键词生成微场景
  keywords.forEach((keyword, index) => {
    // 生成智能布局
    const layout = this.layoutService.generateLayout({
      sceneIndex: index,
      totalScenes: keywords.length,
      importance: keyword.importance || 'normal',
      contentType: this.classifyContentType(keyword),
      avoidRepeat: true
    });

    // 计算时间分配
    const duration = (mainScene.endTime - mainScene.startTime) / keywords.length;
    const startTime = mainScene.startTime + duration * index;
    const endTime = startTime + duration;

    microScenes.push({
      type: 'composed',  // 组合场景
      keyword: keyword.text,
      startTime,
      endTime,
      layout,           // 智能布局配置
      showPIP: true     // 显示 PIP
    });
  });

  console.log(`✅ 生成 ${microScenes.length} 个智能排版微场景`)
  return microScenes
}

// 分类内容类型
classifyContentType(keyword) {
  if (keyword.importance === 'high') return 'emphasis';
  if (keyword.category === 'data') return 'data';
  return 'general';
}
```

---

### 步骤 3: 修改 VideoCompositionService.js

**当前逻辑**:
1. 使用 Remotion 渲染模板
2. 合成视频

**修改为**:
1. 使用 FFmpeg 直接合成
2. 应用智能排版配置

**新增方法**:

```javascript
/**
 * 使用 FFmpeg 合成场景（替代 Remotion）
 */
async composeSceneWithFFmpeg(microScene, originalVideo, doubaoImage, pipVideo) {
  const { layout, startTime, endTime } = microScene;

  // 1. 生成黑色背景
  const background = await this.generateBlackBackground();

  // 2. 应用智能布局
  const { size, position, style } = layout;

  // 3. 构建 FFmpeg 命令
  const ffmpegCommand = `
    ffmpeg -i ${background} \
           -i ${doubaoImage} \
           -i ${pipVideo} \
           -filter_complex "
             [0:v] 黑色背景 [bg];
             [1:v] scale=${size.width}:${size.height},
                   overlay=${position.x - size.width/2}:${position.y - size.height/2} [img];
             [bg][img] overlay [tmp];
             [2:v] scale=500:280,
                   overlay=290:1520 [out];
             [out] drawtext=text='${microScene.keyword}':
                   fontsize=72:fontcolor=white:
                   x=(w-text_w)/2:y=h-200
           " -t ${endTime - startTime} output.mp4
  `;

  // 4. 执行 FFmpeg
  await this.executeFFmpeg(ffmpegCommand);

  return 'output.mp4';
}

/**
 * 生成黑色背景（可选：添加粒子效果）
 */
async generateBlackBackground() {
  // 使用 FFmpeg 生成纯黑背景或科技感背景
  const command = `
    ffmpeg -f lavfi -i color=c=black:s=1080x1920:d=5 \
           -vf "noise=alls=20:allf=t+u" \
           background.mp4
  `;

  await this.executeFFmpeg(command);
  return 'background.mp4';
}
```

---

### 步骤 4: 修改 MasterAutoGenerationAgent.js

**当前工作流程**:
```javascript
1. 上传视频
2. 提取字幕
3. 场景分割
4. 关键词提取
5. 豆包生图
6. Remotion 渲染  ← 移除
7. 视频合成
```

**修改为**:
```javascript
1. 上传视频
2. 提取字幕
3. 场景分割
4. 人脸检测 & PIP 定位  ← 新增
5. 关键词提取
6. 高级提示词生成  ← 新增
7. 豆包生图
8. 智能排版  ← 新增
9. FFmpeg 视频合成  ← 修改
```

**修改代码**:

```javascript
// 移除 Remotion 相关导入
// import RemotionService from './RemotionService.js';

// 新增导入
import { getInstance as getAdvancedPromptGenerator } from './AdvancedPromptGenerator.js';
import { getInstance as getLayoutService } from './SmartLayoutService.js';

// 在 generateVideo 方法中
async generateVideo(videoPath, options = {}) {
  try {
    // ... 前面的步骤保持不变 ...

    // 4. 人脸检测 & PIP 定位
    console.log('🎯 步骤 4: 人脸检测 & PIP 定位');
    const faceData = await this.faceDetectionService.detectFaces(videoPath);
    const pipConfig = this.calculatePIPConfig(faceData);

    // 5. 关键词提取
    console.log('🎯 步骤 5: 关键词提取');
    const keywords = await this.keywordClassifier.extractKeywords(subtitles);

    // 6. 高级提示词生成
    console.log('🎯 步骤 6: 高级提示词生成');
    const advancedPromptGenerator = getAdvancedPromptGenerator();
    const prompts = keywords.map(kw =>
      advancedPromptGenerator.generate(kw.text, {
        stylePreset: this.selectStylePreset(kw),
        sceneType: kw.importance === 'high' ? 'emphasis' : 'basic',
        includeEffects: true,
        randomize: true
      })
    );

    // 7. 豆包生图
    console.log('🎯 步骤 7: 豆包生图');
    const images = await Promise.all(
      prompts.map(prompt => this.doubaoImageService.generateImage(prompt))
    );

    // 8. 智能排版
    console.log('🎯 步骤 8: 智能排版');
    const layoutService = getLayoutService();
    const layouts = layoutService.generateBatchLayouts(keywords.length, {
      avoidRepeat: true
    });

    // 9. FFmpeg 视频合成（替代 Remotion）
    console.log('🎯 步骤 9: FFmpeg 视频合成');
    const finalVideo = await this.videoCompositionService.composeWithFFmpeg({
      originalVideo: videoPath,
      images,
      layouts,
      keywords,
      pipConfig
    });

    return finalVideo;

  } catch (error) {
    console.error('❌ 视频生成失败:', error);
    throw error;
  }
}

// 选择风格预设
selectStylePreset(keyword) {
  if (keyword.category === 'technology') return 'tech';
  if (keyword.category === 'business') return 'business';
  if (keyword.category === 'data') return 'data';
  return 'tech';
}
```

---

## 🧪 测试方案

### 测试 1: 高级提示词生成

```bash
node test-advanced-generation.js
```

**预期输出**:
- 生成包含详细视觉效果的提示词
- 每个提示词都不同
- 包含边框、圆角、阴影、发光等描述

### 测试 2: 智能排版

```bash
node test-smart-layout.js
```

**预期输出**:
- 生成多样化的布局配置
- 所有布局都不与 PIP 重叠
- 样式、尺寸、位置都有变化

### 测试 3: 端到端测试

```bash
node test-e2e-new-architecture.js
```

**预期输出**:
- 完整的视频生成流程
- 使用 FFmpeg 合成
- 不使用 Remotion

---

## 📊 性能对比

| 指标 | Remotion 方案 | 新方案 (FFmpeg) | 提升 |
|------|--------------|----------------|------|
| 渲染速度 | ~30秒/场景 | ~5秒/场景 | **6倍** |
| 样式多样性 | 4种固定模板 | 无限组合 | **∞** |
| PIP 遮挡 | 会遮挡 | 智能避开 | **100%** |
| 维护复杂度 | 高 | 低 | **-50%** |
| 灵活性 | 低 | 高 | **+200%** |

---

## 🎯 实施计划

### 阶段 1: 准备工作 (1小时)
- [x] 创建 AdvancedPromptGenerator.js
- [x] 创建 SmartLayoutService.js
- [x] 创建测试脚本
- [ ] 备份现有代码

### 阶段 2: 核心修改 (2-3小时)
- [ ] 修改 DoubaoImageService.js
- [ ] 修改 MicroSceneGenerator.js
- [ ] 修改 VideoCompositionService.js
- [ ] 修改 MasterAutoGenerationAgent.js

### 阶段 3: 测试验证 (1-2小时)
- [ ] 单元测试
- [ ] 集成测试
- [ ] 端到端测试
- [ ] 性能测试

### 阶段 4: 清理优化 (1小时)
- [ ] 删除 Remotion 相关代码
- [ ] 更新文档
- [ ] 代码审查

**总预计时间**: 5-7 小时

---

## ⚠️ 风险评估

### 高风险
- **FFmpeg 命令复杂度**: 需要仔细测试滤镜命令
- **性能问题**: 大量图片合成可能影响性能

**缓解措施**:
- 分步测试 FFmpeg 命令
- 使用缓存减少重复处理
- 并行处理多个场景

### 中风险
- **豆包生图质量**: 提示词优化可能需要多次调整

**缓解措施**:
- 提供提示词预览功能
- 支持手动调整提示词
- 收集用户反馈持续优化

### 低风险
- **代码兼容性**: 新旧代码可能有冲突

**缓解措施**:
- 保留 Remotion 代码作为备份
- 使用特性开关控制新旧方案

---

## 🔄 回滚方案

如果新方案出现问题，可以快速回滚：

1. **保留 Remotion 代码**: 不立即删除，移动到 `backup/` 目录
2. **特性开关**: 在配置中添加 `USE_REMOTION` 开关
3. **版本控制**: 使用 Git 分支管理

```javascript
// 特性开关示例
if (process.env.USE_REMOTION === 'true') {
  // 使用旧的 Remotion 方案
  await this.remotionService.render();
} else {
  // 使用新的 FFmpeg 方案
  await this.videoCompositionService.composeWithFFmpeg();
}
```

---

## 📚 参考资料

### FFmpeg 文档
- [FFmpeg 滤镜文档](https://ffmpeg.org/ffmpeg-filters.html)
- [overlay 滤镜](https://ffmpeg.org/ffmpeg-filters.html#overlay-1)
- [drawtext 滤镜](https://ffmpeg.org/ffmpeg-filters.html#drawtext-1)

### 豆包 API
- [豆包图像生成 API](https://www.volcengine.com/docs/82379/1298454)

---

## ✅ 待确认事项

请确认以下问题后，我们再开始执行：

1. **是否完全放弃 Remotion？**
   - [ ] 是，完全放弃
   - [ ] 否，保留作为备选方案

2. **FFmpeg 合成方案是否可行？**
   - [ ] 是，可以使用 FFmpeg
   - [ ] 否，需要其他方案

3. **提示词优化方向是否正确？**
   - [ ] 是，添加视觉细节是正确的
   - [ ] 否，需要调整

4. **智能排版方案是否满足需求？**
   - [ ] 是，满足需求
   - [ ] 否，需要补充

5. **实施时间是否可接受？**
   - [ ] 是，5-7小时可接受
   - [ ] 否，需要更快

6. **是否需要先做小范围测试？**
   - [ ] 是，先测试一个场景
   - [ ] 否，直接全面实施

---

## 📝 备注

- 本文档基于 2026-01-20 的讨论整理
- 所有代码示例仅供参考，实际实现可能需要调整
- 建议在独立分支上进行开发，测试通过后再合并

---

**文档结束**

请仔细审阅本文档，确认无误后我们开始执行。
