# 工作区设计保护 - 快速指南

## 🎯 目的

保护 VidSlide AI 工作区的核心设计不被意外修改，确保用户体验的一致性和稳定性。

## 📋 受保护的文件

以下文件受到最高级别保护，任何修改都需要项目负责人批准：

```
vidslide-ai/src/views/WorkspaceView.vue
vidslide-ai/src/components/workspace/WorkspaceMainArea.vue
vidslide-ai/src/components/workspace/WorkspaceRightPanel.vue
vidslide-ai/src/components/workspace/WorkspaceSidebar.vue
vidslide-ai/src/components/workspace/GeneratedPreview.vue
```

## 🛡️ 保护机制

### 1. Git Pre-commit Hook

已安装 Git hook，会在提交前自动检查受保护文件的修改。

**位置**：`.git/hooks/pre-commit`

**工作方式**：
- 检测是否修改了受保护的文件
- 如果有修改，显示警告信息
- 要求确认是否继续提交

### 2. 设计文档

详细的设计保护规范文档：

**位置**：`WORKSPACE_DESIGN_PROTECTION.md`

**内容包括**：
- 受保护的组件和功能
- 禁止的修改行为
- 允许的修改行为
- 修改审批流程
- 代码审查检查清单

## 🚀 使用指南

### 开发者

#### 日常开发
1. 正常开发新功能
2. 避免修改受保护的文件
3. 如果必须修改，先阅读 `WORKSPACE_DESIGN_PROTECTION.md`

#### 需要修改受保护文件时
1. 阅读 `WORKSPACE_DESIGN_PROTECTION.md`
2. 准备修改申请（参考文档中的模板）
3. 联系项目负责人获得批准
4. 获得批准后再进行修改
5. 提交时确认 pre-commit hook 的警告

#### 提交代码时
```bash
git add .
git commit -m "your message"

# 如果修改了受保护的文件，会看到警告：
# ⚠️  设计保护警告 - 受保护的文件被修改
#
# 以下受保护的文件被修改：
#   • vidslide-ai/src/components/workspace/WorkspaceMainArea.vue
#
# 是否继续提交？(y/n)

# 输入 y 继续，或 n 取消
```

### 项目负责人

#### 审批修改申请
1. 收到修改申请
2. 评估修改的必要性和影响
3. 检查是否有替代方案
4. 做出批准或拒绝的决定
5. 记录决定和原因

#### 代码审查
使用 `WORKSPACE_DESIGN_PROTECTION.md` 中的检查清单：
- [ ] 布局结构是否保持不变？
- [ ] 关键组件是否正常显示？
- [ ] 按钮位置是否正确？
- [ ] 样式是否保持一致？

## 📝 修改申请模板

```markdown
## 设计修改申请

**申请人**：[你的名字]
**日期**：2026-01-18
**修改类型**：[布局/组件/样式/功能]

### 修改内容
- 要修改的组件：WorkspaceMainArea.vue
- 修改原因：需要添加新的视频滤镜功能
- 影响范围：仅影响视频预览区域的内部实现

### 修改方案
- 修改前：视频直接显示
- 修改后：添加滤镜层
- 替代方案：使用 CSS filter 属性

### 风险评估
- 用户体验影响：无，仅增强功能
- 技术风险：低，不改变布局结构
- 回滚方案：移除滤镜层代码
```

## 🔧 维护

### 更新受保护文件列表

如果需要添加或移除受保护的文件：

1. 编辑 `.git/hooks/pre-commit`
2. 更新 `PROTECTED_FILES` 数组
3. 更新 `WORKSPACE_DESIGN_PROTECTION.md`

### 禁用保护（不推荐）

如果需要临时禁用保护：

```bash
# 重命名 hook
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# 完成修改后，重新启用
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

**警告**：禁用保护可能导致设计被意外破坏，请谨慎使用。

## 📞 联系方式

如有任何问题，请联系项目负责人。

## 📚 相关文档

- [完整设计保护规范](WORKSPACE_DESIGN_PROTECTION.md)
- [工作流程文档](VidSlide-AI项目工作流程文档.md)

---

**最后更新**：2026-01-18
**维护者**：VidSlide AI 开发团队
