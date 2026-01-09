# VidSlide AI 开发工具脚本

本目录包含VidSlide AI项目的各种开发工具脚本，用于项目管理和质量控制。

## 📋 脚本清单

### 工作计划脚本

#### `next-phase-work-plan.js`
**功能**: 生成详细的工作计划和任务分解
**使用方法**:
```bash
node scripts/next-phase-work-plan.js
```

**输出文件**:
- `scripts/work-plan-optimization-phase.json` - JSON格式的工作计划
- `scripts/work-plan-optimization-phase.md` - Markdown格式的工作计划

**功能特性**:
- 自动生成4周优化完善阶段的详细工作计划
- 包含任务分解、时间估算、依赖关系
- 风险评估和质量指标
- 支持多格式输出

### 项目检测脚本

#### `phase-completion-checker.js`
**功能**: 全面检测当前阶段的开发内容完成度
**使用方法**:
```bash
node scripts/phase-completion-checker.js
```

**输出文件**:
- `reports/phase-completion-check-{timestamp}.json` - 详细检测结果

**检测维度**:
- ✅ **功能完整性**: P0+P1功能实现状态
- ✅ **代码质量**: 注释率、ESLint错误、代码风格
- ✅ **性能指标**: 动画性能、内存管理、缓存效率
- ✅ **用户体验**: 错误处理、可访问性、响应式设计
- ✅ **合规性**: 约束文档合规检查
- ✅ **测试覆盖**: 单元测试覆盖率

### 约束检查脚本

#### `constraint-checker.cjs`
**功能**: 检查代码是否符合约束文档要求
**使用方法**:
```bash
cd vidslide-ai && npm run check-constraints
```

## 🚀 使用示例

### 生成工作计划
```bash
# 生成优化完善阶段的工作计划
node scripts/next-phase-work-plan.js

# 查看生成的Markdown报告
cat scripts/work-plan-optimization-phase.md
```

### 执行项目检测
```bash
# 执行全面的项目完成度检测
node scripts/phase-completion-checker.js

# 查看检测结果
ls -la reports/
cat reports/phase-completion-check-*.json | jq .summary
```

### 约束合规检查
```bash
# 切换到项目目录
cd vidslide-ai

# 执行约束检查
npm run check-constraints

# 查看详细的约束检查报告
node scripts/constraint-metrics.js report
```

## 📊 输出示例

### 工作计划输出
```
🚀 生成优化完善阶段工作计划...
✅ 工作计划已保存到: ./scripts/work-plan-optimization-phase.json
✅ 工作计划生成完成！
📁 输出文件:
  - ./scripts/work-plan-optimization-phase.json
  - ./scripts/work-plan-optimization-phase.md
```

### 项目检测输出
```
🔍 开始优化完善阶段完成度检测...

📋 检查功能完整性...
💅 检查代码质量...
⚡ 检查性能指标...
👤 检查用户体验...
📜 检查合规性...
🧪 检查测试覆盖...

============================================================
📋 优化完善阶段完成度检测报告
============================================================

🎯 总体得分: 70.8/100
📊 总体状态: 👌 可接受
✅ 通过检查: 10/1
...
```

## 🎯 脚本目标

这些脚本旨在：

1. **规范化开发流程**: 提供标准化的项目管理和质量检查流程
2. **提升开发效率**: 自动化生成工作计划和检测报告
3. **确保质量标准**: 全面检查功能完整性、代码质量、性能指标等
4. **合规性保障**: 确保项目严格按照约束文档要求开发

## 📝 注意事项

- 所有脚本都在项目根目录运行
- 检测脚本会自动创建`reports/`目录存储结果
- 工作计划脚本会覆盖之前生成的文件
- 建议在每次开发迭代后运行检测脚本

## 🔧 维护说明

如需修改脚本逻辑，请确保：
- 保持向后兼容性
- 更新相应的文档
- 测试脚本在不同环境下的表现
- 遵循项目的代码质量标准