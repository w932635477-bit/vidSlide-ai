# VidSlide AI 工作区设计保护规范

## 🔒 设计保护级别：最高权限

**重要声明**：本文档定义的工作区设计为**核心UI架构**，任何修改都必须经过项目负责人明确批准。

---

## 📋 受保护的核心组件

### 1. 工作区布局结构（不可修改）

#### 主要组件
- `WorkspaceView.vue` - 主工作区容器
- `WorkspaceSidebar.vue` - 左侧边栏
- `WorkspaceMainArea.vue` - 中间视频编辑区
- `WorkspaceRightPanel.vue` - 右侧属性/监控面板
- `GeneratedPreview.vue` - 生成结果预览组件

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│                        顶部工具栏                              │
├──────┬──────────────────────────────────────┬───────────────┤
│      │                                      │               │
│ 左侧 │         中间视频区域                   │   右侧面板     │
│ 边栏 │  ┌──────────────────────────┐        │  ┌─────────┐ │
│      │  │                          │        │  │ 属性    │ │
│ 素材 │  │    视频播放器/预览区       │        │  │ PPT     │ │
│ 库   │  │                          │        │  │ 特效    │ │
│      │  └──────────────────────────┘        │  │ 动画    │ │
│      │                                      │  │ 监控 ⭐ │ │
│      ├──────────────────────────────────────┤  └─────────┘ │
│      │         时间轴（始终显示）             │               │
│      └──────────────────────────────────────┘               │
└──────┴──────────────────────────────────────┴───────────────┘
```

**保护原因**：这是剪映风格的核心布局，经过精心设计和优化。

---

### 2. 关键功能位置（不可修改）

#### 2.1 一键生成按钮
- **位置**：视频区域右下角
- **样式**：红色渐变，带闪烁动画
- **显示条件**：仅在原始视频模式下显示
- **文件**：`WorkspaceMainArea.vue:20-29`

#### 2.2 预览操作按钮组
- **位置**：视频区域右下角（垂直排列）
- **按钮**：
  1. 🔙 返回原视频
  2. 📥 下载PPT
  3. 🎬 导出视频
- **显示条件**：仅在预览模式下显示
- **文件**：`WorkspaceMainArea.vue:95-107`

#### 2.3 时间轴
- **位置**：视频区域下方
- **显示条件**：始终显示（`v-if="videoSrc"`）
- **功能**：播放控制、时间显示、缩放控制
- **文件**：`WorkspaceMainArea.vue:110-160`

#### 2.4 右侧面板
- **默认标签页**：监控（`activeTab: 'monitor'`）
- **标签页顺序**：属性 → PPT → 特效 → 动画 → 监控
- **显示条件**：始终显示
- **文件**：`WorkspaceRightPanel.vue`

---

## 🚫 禁止的修改行为

### 严格禁止（需要明确批准）

1. **修改布局结构**
   - ❌ 改变三栏布局（左侧边栏 + 中间区域 + 右侧面板）
   - ❌ 移除或隐藏任何主要区域
   - ❌ 改变区域的相对位置

2. **修改核心组件显示逻辑**
   - ❌ 改变时间轴的显示条件（必须始终显示）
   - ❌ 改变右侧面板的显示条件（必须始终显示）
   - ❌ 改变按钮的显示/隐藏逻辑

3. **修改按钮位置**
   - ❌ 移动"一键生成"按钮位置
   - ❌ 移动预览操作按钮组位置
   - ❌ 改变按钮的排列方式（垂直/水平）

4. **修改关键样式**
   - ❌ 改变布局的 flexbox 结构
   - ❌ 改变按钮的视觉风格（渐变色、圆角等）
   - ❌ 改变时间轴的高度和样式

---

## ✅ 允许的修改行为

### 无需批准的修改

1. **内容增强**
   - ✅ 在现有区域内添加新功能（不改变布局）
   - ✅ 添加新的标签页到右侧面板
   - ✅ 在时间轴中添加新的轨道

2. **样式微调**
   - ✅ 调整颜色、字体大小（不改变整体风格）
   - ✅ 优化动画效果
   - ✅ 改进响应式设计

3. **功能实现**
   - ✅ 实现按钮的具体功能逻辑
   - ✅ 添加新的事件处理
   - ✅ 优化性能

---

## 📝 修改审批流程

### 需要审批的修改

如果需要修改受保护的设计，必须遵循以下流程：

#### 1. 提交修改申请
```markdown
## 设计修改申请

**申请人**：[姓名]
**日期**：[YYYY-MM-DD]
**修改类型**：[布局/组件/样式/功能]

### 修改内容
- 要修改的组件：[组件名称]
- 修改原因：[详细说明]
- 影响范围：[列出受影响的文件和功能]

### 修改方案
- 修改前：[当前设计]
- 修改后：[新设计]
- 替代方案：[如果有]

### 风险评估
- 用户体验影响：[说明]
- 技术风险：[说明]
- 回滚方案：[说明]
```

#### 2. 等待批准
- 项目负责人审核
- 必要时进行设计评审会议
- 获得明确的书面/口头批准

#### 3. 实施修改
- 创建新的 Git 分支
- 实施修改
- 充分测试
- 提交 Pull Request

#### 4. 验收
- 项目负责人验收
- 确认符合预期
- 合并到主分支

---

## 🔍 代码审查检查清单

### 在代码审查时，必须检查以下内容：

#### 布局结构检查
- [ ] 三栏布局是否保持不变？
- [ ] 左侧边栏是否正常显示？
- [ ] 右侧面板是否始终可见？
- [ ] 时间轴是否始终显示？

#### 组件显示逻辑检查
- [ ] `WorkspaceMainArea` 的 `v-if` 条件是否被修改？
- [ ] `WorkspaceRightPanel` 是否有条件隐藏？
- [ ] 时间轴的 `v-if="videoSrc"` 是否保持不变？

#### 按钮位置检查
- [ ] "一键生成"按钮是否在视频右下角？
- [ ] 预览操作按钮是否在视频右下角？
- [ ] 按钮是否垂直排列？

#### 样式检查
- [ ] `.workspace-main-area` 的 flex 布局是否保持？
- [ ] `.embedded-timeline` 是否保持原有样式？
- [ ] 按钮的渐变色和圆角是否保持？

---

## 🛡️ 技术保护措施

### 1. Git 保护

#### 创建受保护的分支规则
```bash
# 在 GitHub/GitLab 中设置分支保护规则
# 保护 main 分支，要求：
# - 至少 1 个审批者
# - 通过所有 CI 检查
# - 禁止强制推送
```

#### 关键文件保护
在 `.gitattributes` 中标记关键文件：
```
# 核心工作区组件 - 需要特别审查
vidslide-ai/src/views/WorkspaceView.vue merge=ours
vidslide-ai/src/components/workspace/WorkspaceMainArea.vue merge=ours
vidslide-ai/src/components/workspace/WorkspaceRightPanel.vue merge=ours
vidslide-ai/src/components/workspace/WorkspaceSidebar.vue merge=ours
vidslide-ai/src/components/workspace/GeneratedPreview.vue merge=ours
```

### 2. 代码注释保护

在关键代码位置添加警告注释：

```vue
<!--
  ⚠️ 设计保护区域 - 请勿修改
  此布局结构为核心设计，任何修改需要项目负责人批准
  参考文档：WORKSPACE_DESIGN_PROTECTION.md
-->
<div class="workspace-main-area">
  <!-- 受保护的内容 -->
</div>
```

### 3. ESLint 规则（可选）

创建自定义 ESLint 规则，检测关键文件的修改：

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-workspace-layout-change': 'error'
  }
}
```

### 4. Pre-commit Hook

创建 Git pre-commit hook，检查关键文件的修改：

```bash
#!/bin/bash
# .git/hooks/pre-commit

PROTECTED_FILES=(
  "vidslide-ai/src/views/WorkspaceView.vue"
  "vidslide-ai/src/components/workspace/WorkspaceMainArea.vue"
  "vidslide-ai/src/components/workspace/WorkspaceRightPanel.vue"
)

for file in "${PROTECTED_FILES[@]}"; do
  if git diff --cached --name-only | grep -q "$file"; then
    echo "⚠️  警告：你正在修改受保护的文件：$file"
    echo "请确保已获得项目负责人的批准"
    echo "参考文档：WORKSPACE_DESIGN_PROTECTION.md"
    read -p "是否继续提交？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
done
```

---

## 📚 设计文档

### 当前设计的关键决策

#### 1. 为什么时间轴必须始终显示？
- 用户需要随时查看视频进度
- 时间轴是视频编辑的核心工具
- 隐藏时间轴会严重影响用户体验

#### 2. 为什么右侧面板必须始终显示？
- 监控面板需要实时显示生成进度
- 用户需要随时访问属性和设置
- 隐藏面板会导致功能不可用

#### 3. 为什么按钮在视频右下角？
- 符合用户操作习惯（右手操作）
- 不遮挡视频内容
- 与剪映等主流软件一致

#### 4. 为什么预览按钮垂直排列？
- 避免水平空间不足
- 清晰的视觉层次
- 易于点击（移动端友好）

---

## 🔄 设计演进记录

### 版本 1.0 - 初始设计（2026-01-18）

**设计目标**：
- 剪映风格的三栏布局
- 清晰的功能分区
- 始终可见的核心工具

**关键组件**：
- 左侧边栏：素材库
- 中间区域：视频编辑 + 时间轴
- 右侧面板：属性 + 监控

**设计原则**：
1. 核心功能始终可见
2. 操作按钮位置固定
3. 布局结构不可变

---

## 📞 联系方式

如有任何关于设计修改的问题，请联系：

**项目负责人**：[你的名字]
**审批流程**：参考本文档第 4 节

---

## 📄 附录

### A. 受保护文件清单

```
vidslide-ai/src/views/
  └── WorkspaceView.vue ⚠️ 核心布局

vidslide-ai/src/components/workspace/
  ├── WorkspaceMainArea.vue ⚠️ 视频编辑区
  ├── WorkspaceRightPanel.vue ⚠️ 右侧面板
  ├── WorkspaceSidebar.vue ⚠️ 左侧边栏
  └── GeneratedPreview.vue ⚠️ 预览组件
```

### B. 关键样式类

```css
/* 不可修改的核心样式 */
.workspace
.main-container
.workspace-main
.workspace-main-area
.embedded-timeline
.workspace-right-panel
.auto-generate-btn
.preview-action-buttons
```

### C. 关键状态变量

```javascript
// WorkspaceMainArea.vue
showGeneratedPreview  // 控制预览模式
isPlaying            // 播放状态
videoSrc             // 视频源

// WorkspaceRightPanel.vue
activeTab            // 当前标签页（默认：'monitor'）
isCollapsed          // 面板折叠状态
```

---

**最后更新**：2026-01-18
**文档版本**：1.0
**维护者**：VidSlide AI 开发团队
