# VidSlide AI - Agents规范

> **版本**: v1.0
> **创建日期**: 2026-01-24
> **最后更新**: 2026-01-24

---

## 📋 目录

1. [总体架构](#总体架构)
2. [质量标准](#质量标准)
3. [验证流程](#验证流程)
4. [各Agent职责](#各agent职责)
5. [数据流转规范](#数据流转规范)
6. [错误处理](#错误处理)

---

## 🏗️ 总体架构

### Multi-Agent协作模式

VidSlide AI采用多智能体协作架构，遵循GitHub最佳实践：

```
ProjectManager (协调器)
    ↓
ContentAnalyst → SceneDesigner → MaterialExpert → VisualDesigner → VideoEngineer
                                      ↓
                              QualityDirector (监督者)
                                      ↓
                          Reference-based Validation (基于理想效果视频的验证)
```

**核心原则** (来自GitHub Multi-Agent Best Practices):
- ✅ **Human-in-the-loop** - AI提议，人类拥有最终决策权
- ✅ **Multi-stage quality gates** - 多阶段质量门，不是批量检查
- ✅ **Task decomposition** - 分解任务，防止错误累积
- ✅ **Context sharing** - 完整的上下文传递

---

## 🎯 质量标准

### 1. 卡片生成标准

基于理想效果视频：`/reference/ideal_card_reference.mp4`

#### 规范性要求

| 检查项 | 标准 | 来源 |
|-------|------|------|
| **位置** | y坐标约1200，避开抖音底部400px安全区域 | douyinSpecs.js + 理想视频 |
| **尺寸** | 600x300 (宽x高) | 理想视频 |
| **文字长度** | 最多5个字符（3-5个最佳） | 用户要求 + 理想视频 |
| **样式** | 双边框（8px深色 + 3px亮色） | 代码实现 + 理想视频 |
| **背景** | 蓝色渐变 | 理想视频 |
| **字体** | 白色，粗体，清晰可读 | 理想视频 |

#### 内容正确性要求

| 检查项 | 标准 | 数据来源 |
|-------|------|---------|
| **关键词匹配** | 卡片显示的文字必须与场景关联的关键词一致 | `scene.keywordObj.text` (来自ContentAnalyst) |
| **时间准确性** | 卡片出现在正确的时间点 | `scene.startTime / endTime` (来自SceneDesigner) |
| **语义一致性** | 关键词与视频内容相关 | ContentAnalyst验证 |

### 2. 视频合成标准

| 检查项 | 标准 | 说明 |
|-------|------|------|
| **分辨率** | 1080x1920 | 抖音竖屏标准 |
| **格式** | MP4, H.264/H.265 | 兼容性 |
| **文件大小** | ≤ 100MB | 性能要求 |
| **原视频占比** | ≥ 25% | 避免过度编辑 |
| **时间轴连续性** | 无间隙，无重叠 | 流畅观看体验 |

### 3. 抖音平台规范

来自：`src/utils/douyinSpecs.js`

```javascript
DOUYIN_SPECS = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',

  safeArea: {
    top: 120,      // 顶部状态栏和返回按钮
    bottom: 400,   // 底部文字、点赞、评论、分享按钮 ⭐ 关键
    left: 40,      // 左侧边距
    right: 40      // 右侧边距（头像和按钮）
  }
}
```

**⚠️ 关键注意事项**：
- 卡片**不能**放在底部400px区域内（会被UI遮挡）
- 推荐卡片y坐标：1200 (1920 - 300 - 400 - 20)

---

## 🔍 验证流程

### 两层验证体系

#### 第1层：规范性验证（对比理想效果视频）

**工具**: MLLM-as-a-Judge (文心一言视觉模型 / GPT-4V)

**方法**: Pair Comparison（配对比较）

```javascript
// 提取关键帧
const referenceFrame = extractFrame(ideal_reference.mp4, timestamp);
const generatedFrame = extractFrame(generated.mp4, timestamp);

// MLLM对比
const complianceCheck = await MLLM.compare(referenceFrame, generatedFrame, {
  checkItems: ['position', 'size', 'textLength', 'visualStyle']
});

// 输出示例
{
  position: { passed: false, difference: "卡片位置y=1524，应该在y=1200附近" },
  size: { passed: true },
  textLength: { passed: false, difference: "显示10个字，超过5个字限制" },
  visualStyle: { passed: true }
}
```

**泛化能力**: ✅ 所有视频都适用（规范是通用的）

#### 第2层：内容正确性验证（对比上游数据）

**工具**: 百度OCR + 数据匹配

```javascript
// OCR识别卡片文字
const detectedText = await BaiduOCR.recognize(generatedFrame);

// 获取期望的关键词（来自ContentAnalyst）
const expectedKeyword = scene.keywordObj.text;

// 验证匹配
const contentCheck = {
  passed: detectedText.includes(expectedKeyword),
  expected: expectedKeyword,
  detected: detectedText
};

// 输出示例
{
  passed: false,
  expected: "强化学习",
  detected: "未知"
}
```

**数据来源**: 上游Agent的输出（ContentAnalyst, SceneDesigner）

### 验证时机

遵循GitHub最佳实践的**Multi-stage Quality Gates**：

```
阶段1: 内容理解 → QualityDirector.checkUnderstanding()
阶段2: 场景设计 → QualityDirector.checkSceneDesign()
阶段3: 素材生成 → QualityDirector.checkMaterialAccuracy()
阶段3: 视觉设计 → QualityDirector.checkVisualQuality()
阶段5: 视频合成 → QualityDirector.finalCheck() ⭐ 包含视觉验证
```

**原则**: 每个阶段完成后立即验证，防止错误累积

---

## 👥 各Agent职责

### 1. ContentAnalyst（内容分析师）

**输入**: 原视频

**输出**:
```javascript
{
  transcript: "完整文案",
  keywords: [
    { text: "强化学习", english: "RL", category: "tech" }
  ],
  viewpoints: [...],
  explanations: [...],
  intent: "教育"
}
```

**质量保证**:
- 关键词数量：3-5个
- 关键词来源：`scene.keywordObj.text` ⚠️ 不是 `scene.keyword`
- 所有字段必须填写

### 2. SceneDesigner（场景设计师）

**输入**: ContentAnalyst输出

**输出**:
```javascript
{
  scenes: [
    {
      id: "scene_1",
      type: "video-with-card",
      startTime: 9,
      endTime: 12,
      keywordObj: { text: "强化学习", english: "RL" },  // ⚠️ 使用keywordObj
      // ...
    }
  ],
  stats: {
    originalRatio: "30%",
    cardScenes: 2,
    multiLayerScenes: 1
  }
}
```

**质量保证**:
- 原视频占比 ≥ 25%
- 时间轴连续，无间隙
- 开场和结尾必须是原视频
- **关键词必须存储在`keywordObj`中，不是`keyword`**

### 3. MaterialExpert（素材专家）

**职责**: 生成精准的内容素材

**验证**: OCR + 图像识别（验证准确性 ≥ 70分）

### 4. VisualDesigner（视觉设计师）

**职责**: 设计卡片、背景、遮罩

**关键实现**:
```javascript
// ⚠️ 正确的关键词提取
const keywordText = scene.keywordObj?.text || '关键词';

// ⚠️ 字数限制
const cardText = keywordText.substring(0, 5);

// 生成卡片
await ProfessionalCardGenerator.generate({
  keyword: cardText,  // 最多5个字
  // ...
});
```

### 5. VideoEngineer（视频工程师）

**职责**: 合成最终视频

**卡片位置计算**:
```javascript
const douyinBottomSafeArea = DOUYIN_SPECS.safeArea.bottom;  // 400px
const bottomMargin = 20;
const y = videoHeight - cardHeight - douyinBottomSafeArea - bottomMargin;
// 结果: y = 1920 - 300 - 400 - 20 = 1200
```

### 6. QualityDirector（质量总监）⭐ 增强版

**新增能力**: 基于理想效果视频的视觉验证

**完整上下文**:
```javascript
{
  contentAnalysis: ContentAnalyst输出,
  sceneDesign: SceneDesigner输出,
  materials: MaterialExpert输出,
  visuals: VisualDesigner输出,
  referenceVideo: "/reference/ideal_card_reference.mp4",
  generatedVideo: 待检查视频
}
```

**验证方法**:
1. 规范性检查（对比理想视频）→ 判断HOW（如何展示）
2. 内容正确性检查（对比上游数据）→ 判断WHAT（展示什么）

---

## 🔄 数据流转规范

### Context Sharing (上下文共享)

遵循GitHub最佳实践，**所有上游数据必须传递给下游Agent**：

```javascript
// ProjectManager.prepareTaskInput()
if (task.method === 'finalCheck') {
  input.context = {
    contentAnalysis: previousResults.task_1_2?.understanding,
    sceneDesign: previousResults.task_2_1,
    materials: previousResults.task_3_1,
    visuals: previousResults.task_3_2,
    videoPath: plan.videoPath
  };
}
```

**为什么需要完整上下文？**

| 验证内容 | 需要的数据 | 来源 |
|---------|-----------|------|
| 卡片内容是否正确 | 期望的关键词 | ContentAnalyst.keywords |
| 卡片位置是否合规 | 理想位置标准 | 理想效果视频 |
| 卡片时机是否准确 | 场景时间轴 | SceneDesigner.scenes |

### 关键数据字段

**⚠️ 常见错误**：访问 `scene.keyword`（undefined）

**✅ 正确方式**：访问 `scene.keywordObj.text`

```javascript
// ❌ 错误
const keyword = scene.keyword;  // undefined!

// ✅ 正确
const keyword = scene.keywordObj?.text || '默认值';
```

---

## ⚠️ 错误处理

### 常见问题和解决方案

#### 问题1: 卡片显示"未知"

**原因**: 访问了错误的数据字段

**解决**:
```javascript
// SceneDesigner.js
const keywordText = scene.keywordObj?.text || '关键词';  // ✅
const cardText = keywordText.substring(0, 5);  // 限制5个字
```

#### 问题2: 卡片被抖音UI遮挡

**原因**: 未使用抖音安全区域规范

**解决**:
```javascript
// ServerVideoCompositionService.js
const y = 1920 - 300 - DOUYIN_SPECS.safeArea.bottom - 20;
// y = 1200 (避开底部400px)
```

#### 问题3: 卡片文字过多

**原因**: 未限制字数

**解决**:
```javascript
const cardText = keywordText.substring(0, 5);  // 强制限制
```

### 质量门禁失败处理

```
验证失败 → 返回对应阶段重新执行（最多3次）
              ↓
         仍然失败 → 标记失败，生成详细报告
```

---

## 📊 性能指标

### 验证通过标准

| 检查阶段 | 通过分数 | 关键指标 |
|---------|---------|---------|
| 内容理解 | ≥ 95分 | 关键词3-5个，观点简洁 |
| 场景设计 | ≥ 95分 | 原视频≥25%，时间轴连续 |
| 素材准确性 | ≥ 90分 | 验证分数≥70分 |
| 视觉质量 | ≥ 90分 | 卡片数量≥1 |
| 最终检查 | ≥ 90分 | 视觉验证通过 |

### 视觉验证评分

```javascript
penaltyScore = 0;
- 位置错误: -10分
- 尺寸错误: -5分
- 文字长度错误: -10分
- 样式差异: -5分
- 内容错误: -15分

finalScore = 100 - penaltyScore;
```

---

## 🔧 配置文件

### 关键配置位置

- **抖音规范**: `src/utils/douyinSpecs.js`
- **理想效果视频**: `reference/ideal_card_reference.mp4`
- **质量标准**: `src/agents/quality/QualityDirector.js` (this.standards)
- **验证服务**: `src/services/VisualValidationService.js`

---

## 📚 参考资料

### GitHub最佳实践来源

1. [GitHub Multi-Agent Best Practices](https://github.com/orgs/community/discussions/182197)
2. [MLLM-as-a-Judge](https://mllm-judge.github.io/)
3. [Awesome-LLM-as-a-judge](https://github.com/llm-as-a-judge/Awesome-LLM-as-a-judge)
4. [Microsoft Video Call MOS (Reference-based Validation)](https://github.com/microsoft/Video_Call_MOS)
5. [Netflix VMAF](https://github.com/Netflix/vmaf)

### 关键论文

- **MLLM-as-a-Judge** (ICML 2024 Oral) - GPT-4V在视觉评估中达到0.557的人类相似度
- **DOVER** (ICCV 2023) - 从美学和技术角度评估视频质量

---

## 🔄 版本历史

### v1.0 (2026-01-24)

**新增功能**:
- ✅ Reference-based Validation（基于理想效果视频的验证）
- ✅ MLLM-as-a-Judge集成
- ✅ 完整上下文传递（Context Sharing）
- ✅ 两层验证体系（规范性 + 内容正确性）

**修复问题**:
- ✅ 卡片内容错误（scene.keyword → scene.keywordObj.text）
- ✅ 卡片位置被遮挡（添加安全区域检查）
- ✅ 文字长度超限（强制5字符限制）

---

**文档维护**: 由ProjectManager和QualityDirector共同维护
**问题反馈**: 请提交至项目issue tracker
