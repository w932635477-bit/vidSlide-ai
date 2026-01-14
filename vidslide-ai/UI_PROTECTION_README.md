# VidSlide AI - UI保护系统

## 🛡️ 概述

UI保护系统确保VidSlide AI的工作界面样式不会被随意修改，保护用户体验的一致性和专业性。

## 🔒 保护机制

### 1. 实时监控
- 自动监控受保护UI文件的修改
- 实时备份文件变更
- 防止意外的样式破坏

### 2. 完整性检查
- 验证关键UI元素的完整性
- 检查必需的CSS类是否存在
- 确保苹果设计风格的一致性

### 3. Git集成保护
- Pre-commit钩子自动检查UI文件
- 阻止不符合规范的提交
- 强制备份重要修改

## 📁 受保护文件

当前受保护的UI文件：
- `src/views/HomeView.vue` - 首页
- `src/views/VideoEditorView.vue` - 视频编辑器
- `src/views/WorkspaceView.vue` - **工作空间** ⭐

## ⚙️ 配置

UI保护配置位于 `.ui-protection.json`：

```json
{
  "protectedFiles": ["src/views/WorkspaceView.vue"],
  "uiIntegrityChecks": {
    "WorkspaceView.vue": {
      "criticalElements": ["workspace", "workspace-header", "timeline"],
      "requiredClasses": [".workspace", ".header-btn", ".timeline-track"]
    }
  },
  "autoBackup": {
    "enabled": true,
    "interval": "30m",
    "retention": "30d"
  },
  "strictMode": {
    "enabled": true,
    "blockUnauthorizedChanges": true
  }
}
```

## 🚀 使用方法

### 启动UI保护监控
```bash
# 启动实时监控
npm run ui-protection-monitor

# 检查当前状态
node scripts/ui-protection-monitor.js status

# 停止监控
node scripts/ui-protection-monitor.js stop
```

### 运行完整性检查
```bash
# 检查所有受保护文件
npm run ui-integrity-check

# 创建完整性快照
node scripts/ui-integrity-check.js snapshot

# 验证特定文件
node scripts/ui-integrity-check.js verify src/views/WorkspaceView.vue
```

### Git提交保护
每次提交时会自动：
1. 检查UI文件修改
2. 创建自动备份
3. 运行完整性验证
4. 阻止不符合规范的提交

## 🔧 管理UI保护

### 添加新的受保护文件
1. 编辑 `.ui-protection.json`
2. 在 `protectedFiles` 数组中添加文件路径
3. 配置相应的 `uiIntegrityChecks` 规则

### 修改保护规则
更新 `.ui-protection.json` 中的完整性检查规则：
- `criticalElements`: 必须存在的HTML元素ID
- `requiredClasses`: 必须存在的CSS类

## 📊 监控和报告

### 查看备份文件
```bash
ls -la .ui-backups/
```

### 检查监控日志
```bash
tail -f ui-protection-monitor.log
```

## ⚠️ 重要提醒

1. **WorkspaceView.vue 被严格保护** - 这是您认可的工作界面样式
2. **修改需要审批** - 任何样式修改都会被监控和备份
3. **自动备份** - 每30分钟自动备份一次，保留30天
4. **Git钩子生效** - 提交时会自动验证UI完整性

## 🆘 故障排除

### UI监控不启动
```bash
# 检查Node.js版本
node --version

# 重新安装依赖
npm install

# 手动启动
node scripts/ui-protection-monitor.js start
```

### 完整性检查失败
```bash
# 查看详细错误
node scripts/ui-integrity-check.js --verbose

# 恢复到最新备份
cp .ui-backups/WorkspaceView.vue.latest src/views/WorkspaceView.vue
```

### 紧急恢复
```bash
# 自动紧急恢复（推荐）
npm run ui-emergency-restore

# 或者手动从备份恢复
cp .ui-backups/WorkspaceView.vue.latest src/views/WorkspaceView.vue
```

### Git提交被阻止
```bash
# 强制提交（仅在确认安全时使用）
git commit --no-verify -m "紧急修复"
```

## 📞 技术支持

如果遇到UI保护相关问题，请：
1. 检查 `.ui-protection.json` 配置
2. 查看UI监控日志
3. 确认Node.js环境正常
4. 联系开发团队获取帮助

---

**🎯 目标**: 确保VidSlide AI的工作界面始终保持专业、优雅的苹果设计风格！