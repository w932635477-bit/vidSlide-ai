# ConstraintSystem 重构架构说明

## 模块依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                     ConstraintSystem                         │
│                      (核心系统)                               │
│  - validateAdjustments()                                     │
│  - generateComplianceReport()                                │
│  - calculateComplianceScore()                                │
│  - getConstraints() / updateConstraints()                    │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 依赖
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────────────────────────────┐
│ Config  │      │        Validators                 │
│ Module  │      │                                   │
└─────────┘      └──────────────────────────────────┘
    │                        │
    │                        │
    ▼                        ▼
┌──────────────────┐    ┌──────────────────────────────────────┐
│constraintConfig  │    │         BaseValidator                 │
│                  │    │         (抽象基类)                     │
│ - TEXT           │    │  - validate()                         │
│ - POSITION       │    │  - addViolation()                     │
│ - SIZE           │    │  - addWarning()                       │
│ - COLOR          │    │  - addSuggestion()                    │
│ - LAYOUT         │    └──────────┬───────────────────────────┘
│ - PERFORMANCE    │               │
│ - PROFESSIONALISM│               │ 继承
│ - TYPOGRAPHY     │               │
│ - HIERARCHY      │    ┌──────────┴───────────────────────────┐
│ - BRANDING       │    │                                       │
│ - UX             │    ▼                                       ▼
└──────────────────┘  ┌──────────────┐                  ┌──────────────┐
                      │TextValidator │                  │ColorValidator│
                      │              │                  │              │
                      │- validate()  │                  │- validate()  │
                      │- validateText│                  │- validateCon-│
                      │  Content()   │                  │  trast()     │
                      │- validateFont│                  │- validateCol-│
                      │  Size()      │                  │  orCombo()   │
                      │- validateLine│                  │- calculate   │
                      │  Height()    │                  │  Contrast()  │
                      └──────────────┘                  └──────────────┘
                             │                                 │
                             │                                 │
                             ▼                                 ▼
                      ┌──────────────┐                  ┌──────────────┐
                      │SizeValidator │                  │UXValidator   │
                      │              │                  │              │
                      │- validate()  │                  │- validate()  │
                      │- validateSize│                  │- validateTou-│
                      │- validatePosi│                  │  chTarget()  │
                      │  tion()      │                  │- validateRea-│
                      │- validateCoor│                  │  dability()  │
                      │  dinates()   │                  │- validateAcc-│
                      └──────────────┘                  │  essibility()│
                                                        └──────────────┘
```

## 数据流图

```
用户调整数据 (adjustments)
         │
         ▼
┌─────────────────────────────────────┐
│   ConstraintSystem.validateAdjust-  │
│   ments(adjustments, templateType)  │
└─────────────────────────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ TextValidator    │                  │ ColorValidator   │
│ .validate()      │                  │ .validate()      │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         │  violations, warnings, suggestions  │
         │                                     │
         ├─────────────────────────────────────┤
         │                                     │
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│ SizeValidator    │                  │ UXValidator      │
│ .validate()      │                  │ .validate()      │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  汇总验证结果    │
                  │  - violations   │
                  │  - warnings     │
                  │  - suggestions  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ 计算合规分数     │
                  │ calculateCompli-│
                  │ anceScore()     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  返回验证结果    │
                  │  {              │
                  │   isValid,      │
                  │   violations,   │
                  │   warnings,     │
                  │   suggestions,  │
                  │   score         │
                  │  }              │
                  └─────────────────┘
```

## 模块职责说明

### 1. ConstraintSystem (核心系统)
**职责**:
- 作为约束系统的入口点
- 协调所有验证器的执行
- 汇总验证结果
- 生成合规性报告
- 管理约束配置

**关键方法**:
- `validateAdjustments()`: 执行完整验证流程
- `generateComplianceReport()`: 生成详细报告
- `calculateComplianceScore()`: 计算合规分数
- `getConstraints()`: 获取约束配置
- `updateConstraints()`: 更新约束配置

### 2. constraintConfig (配置模块)
**职责**:
- 集中管理所有约束规则
- 提供约束配置的访问接口
- 支持按类别获取约束
- 支持按模板类型获取约束

**导出内容**:
- 11 个约束常量
- `getAllConstraints()`: 获取所有约束
- `getConstraintsByCategory()`: 按类别获取
- `getTemplateConstraint()`: 按模板获取

### 3. BaseValidator (基础验证器)
**职责**:
- 定义验证器的通用接口
- 提供通用的验证辅助方法
- 统一违规、警告、建议的添加方式

**关键方法**:
- `validate()`: 抽象验证方法（子类实现）
- `addViolation()`: 添加违规项
- `addWarning()`: 添加警告项
- `addSuggestion()`: 添加建议项
- `isInRange()`: 范围检查
- `validateRequiredFields()`: 必填字段验证

### 4. TextValidator (文字验证器)
**职责**:
- 验证文字内容和长度
- 验证字体大小、行高、字重
- 检查文字质量

**验证项**:
- 文字长度（最小/最大）
- 允许的字符类型
- 字体大小范围
- 行高范围
- 字重有效性
- 文字重复度
- 空白字符

### 5. ColorValidator (颜色验证器)
**职责**:
- 验证颜色对比度
- 验证颜色组合
- 验证颜色亮度
- 提供颜色计算工具

**验证项**:
- 对比度比率（WCAG 标准）
- 避免的颜色组合
- 颜色亮度范围

**工具方法**:
- `calculateContrastRatio()`: 计算对比度
- `calculateLuminance()`: 计算相对亮度
- `hexToRgb()`: 颜色格式转换
- `isDarkColor()`: 判断深浅色

### 6. SizeValidator (尺寸验证器)
**职责**:
- 验证元素尺寸
- 验证宽高比
- 验证位置和坐标

**验证项**:
- 尺寸范围（最小/最大）
- 宽高比范围
- 位置有效性
- 边界距离

**工具方法**:
- `calculateAspectRatio()`: 计算宽高比
- `isSizeInRange()`: 尺寸范围检查
- `suggestSize()`: 建议合适尺寸
- `adjustSizeToRatio()`: 调整尺寸

### 7. UXValidator (用户体验验证器)
**职责**:
- 验证触摸目标尺寸
- 验证可读性
- 验证无障碍功能
- 验证布局规范
- 验证专业性要求

**验证项**:
- 触摸目标尺寸
- 行长度
- 替代文本
- 焦点指示器
- 对齐方式
- 边距和间距
- 必需元素
- 模板特定规则

## 扩展指南

### 添加新的验证器

1. 创建新的验证器类，继承 `BaseValidator`
```javascript
import { BaseValidator } from './BaseValidator.js'

export class CustomValidator extends BaseValidator {
  constructor(constraints) {
    super(constraints)
  }

  validate(adjustments, templateType, violations, warnings, suggestions) {
    // 实现验证逻辑
  }
}
```

2. 在 `ConstraintSystem` 中初始化新验证器
```javascript
initializeValidators() {
  // ... 现有验证器
  this.customValidator = new CustomValidator(this.constraints.custom)
}
```

3. 在 `validateAdjustments` 中调用新验证器
```javascript
validateAdjustments(adjustments, templateType, context = {}) {
  // ... 现有代码
  this.customValidator.validate(adjustments, templateType, violations, warnings, suggestions)
  // ...
}
```

### 添加新的约束规则

1. 在 `constraintConfig.js` 中添加新的约束常量
```javascript
export const CUSTOM_CONSTRAINTS = {
  // 约束规则定义
}
```

2. 在 `getAllConstraints()` 中包含新约束
```javascript
export function getAllConstraints() {
  return {
    // ... 现有约束
    custom: CUSTOM_CONSTRAINTS
  }
}
```

### 自定义验证逻辑

可以通过继承现有验证器来扩展功能：
```javascript
import { TextValidator } from './validators/TextValidator.js'

export class EnhancedTextValidator extends TextValidator {
  validate(adjustments, templateType, violations, warnings, suggestions) {
    // 调用父类验证
    super.validate(adjustments, templateType, violations, warnings, suggestions)

    // 添加自定义验证
    this.customValidation(adjustments, violations)
  }

  customValidation(adjustments, violations) {
    // 自定义验证逻辑
  }
}
```

## 最佳实践

1. **单一职责**: 每个验证器只负责特定类型的验证
2. **配置分离**: 约束规则与验证逻辑分离
3. **错误分级**: 使用 violations、warnings、suggestions 三级分类
4. **详细信息**: 提供清晰的错误消息和修复建议
5. **可测试性**: 每个验证器可独立测试
6. **向后兼容**: 保持公共 API 的稳定性

## 性能考虑

1. **验证器复用**: 验证器在构造函数中初始化，避免重复创建
2. **配置缓存**: 约束配置在初始化时加载并缓存
3. **按需验证**: 只验证提供的调整项
4. **早期返回**: 在发现严重违规时可以提前返回

## 维护建议

1. **定期更新约束**: 根据设计规范更新约束配置
2. **添加测试用例**: 为新功能添加测试
3. **文档同步**: 保持代码和文档的同步
4. **性能监控**: 监控验证性能，优化慢速验证
5. **用户反馈**: 收集用户反馈，改进验证规则
