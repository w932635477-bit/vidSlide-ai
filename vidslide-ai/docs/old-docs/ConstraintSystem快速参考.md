# ConstraintSystem 快速参考指南

## 快速开始

### 基本使用

```javascript
import { ConstraintSystem } from './ConstraintSystem.js'
import { TEMPLATE_TYPES } from './TemplateDefinitions.js'

// 创建约束系统实例
const system = new ConstraintSystem()

// 准备用户调整数据
const adjustments = {
  text: '这是一段文字内容',
  colors: {
    background: '#ffffff',
    text: '#000000'
  },
  size: {
    width: 0.5,
    height: 0.3
  }
}

// 执行验证
const result = system.validateAdjustments(
  adjustments,
  TEMPLATE_TYPES.DIALOG_POPUP
)

// 检查结果
if (result.isValid) {
  console.log('验证通过！分数:', result.score)
} else {
  console.log('验证失败，违规项:', result.violations)
}
```

## API 参考

### ConstraintSystem 类

#### 构造函数
```javascript
const system = new ConstraintSystem()
```

#### validateAdjustments(adjustments, templateType, context)
验证用户调整数据

**参数**:
- `adjustments` (Object): 用户调整数据
- `templateType` (String): 模板类型
- `context` (Object, 可选): 验证上下文

**返回**:
```javascript
{
  isValid: Boolean,      // 是否通过验证
  violations: Array,     // 违规项列表
  warnings: Array,       // 警告项列表
  suggestions: Array,    // 建议项列表
  score: Number         // 合规分数 (0-100)
}
```

#### generateComplianceReport(adjustments, templateType, validationResult)
生成详细的合规性报告

**返回**:
```javascript
{
  timestamp: String,
  templateType: String,
  overallScore: Number,
  status: String,
  summary: {
    violations: Number,
    warnings: Number,
    suggestions: Number
  },
  details: {
    violations: Array,
    warnings: Array,
    suggestions: Array
  },
  recommendations: Array,
  metadata: {
    totalChecks: Number,
    criticalIssues: Number,
    complianceLevel: String
  }
}
```

#### getConstraints(category)
获取特定类别的约束配置

**参数**:
- `category` (String): 约束类别名称

**返回**: Object - 约束配置对象

#### updateConstraints(category, newConstraints)
更新约束配置

**参数**:
- `category` (String): 约束类别名称
- `newConstraints` (Object): 新的约束配置

#### resetToDefaults()
重置为默认约束配置

## 调整数据格式

### 文字相关
```javascript
{
  text: String,              // 文字内容
  fontSize: Number,          // 字体大小 (px)
  lineHeight: Number,        // 行高倍数
  fontWeight: Number,        // 字重 (300-700)
  typography: {              // 字体设置
    fontSize: Number,
    lineHeight: Number,
    fontWeight: Number
  }
}
```

### 颜色相关
```javascript
{
  colors: {
    background: String,      // 背景颜色 (HEX)
    text: String,           // 文字颜色 (HEX)
    accent: String          // 强调色 (HEX)
  }
}
```

### 尺寸和位置
```javascript
{
  size: {
    width: Number,          // 宽度比例 (0-1)
    height: Number          // 高度比例 (0-1)
  },
  position: String,         // 位置标识
  coordinates: {
    x: Number,             // X 坐标 (px)
    y: Number              // Y 坐标 (px)
  }
}
```

### 布局相关
```javascript
{
  layout: {
    textAlign: String,      // 对齐方式
    margins: {
      top: Number,
      right: Number,
      bottom: Number,
      left: Number
    },
    spacing: Number         // 元素间距 (px)
  }
}
```

### 用户体验
```javascript
{
  touchTargetSize: Number,  // 触摸目标尺寸 (px)
  lineLength: Number,       // 行长度 (字符)
  accessibility: {
    altText: Boolean,       // 是否有替代文本
    focusIndicator: Boolean // 是否有焦点指示器
  }
}
```

## 模板类型

```javascript
import { TEMPLATE_TYPES } from './TemplateDefinitions.js'

TEMPLATE_TYPES.DIALOG_POPUP      // 对话弹窗
TEMPLATE_TYPES.EMPHASIS_FOCUS    // 强调聚焦
TEMPLATE_TYPES.TIMELINE_DISPLAY  // 时间线展示
TEMPLATE_TYPES.SPLIT_SCREEN      // 分屏展示
TEMPLATE_TYPES.CHART_ANALYSIS    // 图表分析
```

## 约束类别

```javascript
// 可用的约束类别
'text'              // 文字内容约束
'position'          // 位置约束
'size'              // 尺寸约束
'colors'            // 颜色约束
'layout'            // 布局约束
'performance'       // 性能约束
'professionalism'   // 专业性约束
'typography'        // 字体设计规范
'hierarchy'         // 视觉层次规范
'branding'          // 品牌一致性
'ux'                // 用户体验规范
```

## 违规类型

### 文字相关
- `TEXT_LENGTH`: 文字长度超出范围
- `TEXT_CHARS`: 包含不建议的字符
- `TEXT_QUALITY`: 文字质量问题
- `FONT_SIZE_OUT_OF_RANGE`: 字体大小超出范围
- `LINE_HEIGHT_TOO_SMALL`: 行高过小
- `LINE_HEIGHT_TOO_LARGE`: 行高过大
- `FONT_WEIGHT_INVALID`: 字重无效

### 颜色相关
- `CONTRAST_RATIO`: 对比度不足
- `COLOR_COMBINATION`: 不推荐的颜色组合
- `BRIGHTNESS`: 亮度超出范围

### 尺寸相关
- `SIZE_TOO_SMALL`: 尺寸过小
- `SIZE_TOO_LARGE`: 尺寸过大
- `ASPECT_RATIO`: 宽高比超出范围
- `POSITION_INVALID`: 位置无效
- `POSITION_MARGIN`: 边距过小
- `POSITION_OUT_OF_BOUNDS`: 位置超出边界

### 用户体验相关
- `TOUCH_TARGET_TOO_SMALL`: 触摸目标过小
- `LINE_TOO_LONG`: 行长度过长
- `LINE_TOO_SHORT`: 行长度过短
- `MISSING_ALT_TEXT`: 缺少替代文本
- `MISSING_FOCUS_INDICATOR`: 缺少焦点指示器
- `ALIGNMENT_INVALID`: 对齐方式无效
- `MARGIN_TOO_SMALL`: 边距过小
- `MISSING_ELEMENT`: 缺少必需元素

## 合规等级

```javascript
score >= 90  // 'excellent' - 优秀
score >= 80  // 'good' - 良好
score >= 70  // 'acceptable' - 可接受
score >= 60  // 'needs-improvement' - 需要改进
score < 60   // 'poor' - 较差
```

## 使用独立验证器

### TextValidator
```javascript
import { TextValidator } from './validators/TextValidator.js'
import { TEXT_CONSTRAINTS, TYPOGRAPHY_CONSTRAINTS } from './config/constraintConfig.js'

const validator = new TextValidator(TEXT_CONSTRAINTS, TYPOGRAPHY_CONSTRAINTS)

const violations = []
const warnings = []
const suggestions = []

validator.validate(
  { text: '测试文字', fontSize: 16 },
  'DIALOG_POPUP',
  violations,
  warnings,
  suggestions
)
```

### ColorValidator
```javascript
import { ColorValidator } from './validators/ColorValidator.js'
import { COLOR_CONSTRAINTS, PROFESSIONALISM_CONSTRAINTS } from './config/constraintConfig.js'

const validator = new ColorValidator(COLOR_CONSTRAINTS, PROFESSIONALISM_CONSTRAINTS)

// 计算对比度
const ratio = validator.calculateContrastRatio('#ffffff', '#000000')
console.log('对比度:', ratio) // 21

// 判断深浅色
const isDark = validator.isDarkColor('#000000')
console.log('是否为深色:', isDark) // true
```

### SizeValidator
```javascript
import { SizeValidator } from './validators/SizeValidator.js'
import { SIZE_CONSTRAINTS, POSITION_CONSTRAINTS } from './config/constraintConfig.js'

const validator = new SizeValidator(SIZE_CONSTRAINTS, POSITION_CONSTRAINTS)

// 计算宽高比
const ratio = validator.calculateAspectRatio(800, 600)
console.log('宽高比:', ratio) // 1.33

// 建议尺寸
const size = validator.suggestSize('DIALOG_POPUP')
console.log('建议尺寸:', size)
```

### UXValidator
```javascript
import { UXValidator } from './validators/UXValidator.js'
import { UX_CONSTRAINTS, LAYOUT_CONSTRAINTS, PROFESSIONALISM_CONSTRAINTS } from './config/constraintConfig.js'

const validator = new UXValidator(
  UX_CONSTRAINTS,
  LAYOUT_CONSTRAINTS,
  PROFESSIONALISM_CONSTRAINTS
)
```

## 配置管理

### 获取所有约束
```javascript
import { getAllConstraints } from './config/constraintConfig.js'

const constraints = getAllConstraints()
console.log(constraints.text)
console.log(constraints.colors)
```

### 按类别获取约束
```javascript
import { getConstraintsByCategory } from './config/constraintConfig.js'

const textConstraints = getConstraintsByCategory('text')
console.log(textConstraints.minLength)
console.log(textConstraints.maxLength)
```

### 按模板获取约束
```javascript
import { getTemplateConstraint } from './config/constraintConfig.js'

const maxLength = getTemplateConstraint('DIALOG_POPUP', 'maxLength')
console.log('对话弹窗最大文字长度:', maxLength)
```

## 常见问题

### Q: 如何自定义约束规则？
```javascript
const system = new ConstraintSystem()

// 更新文字约束
system.updateConstraints('text', {
  minLength: 5,
  maxLength: {
    DIALOG_POPUP: 300
  }
})
```

### Q: 如何只验证特定类型？
```javascript
// 只验证文字
const result = system.validateAdjustments(
  { text: '测试文字' },
  TEMPLATE_TYPES.DIALOG_POPUP
)

// 只验证颜色
const result = system.validateAdjustments(
  { colors: { background: '#fff', text: '#000' } },
  TEMPLATE_TYPES.DIALOG_POPUP
)
```

### Q: 如何处理验证结果？
```javascript
const result = system.validateAdjustments(adjustments, templateType)

// 处理违规
if (result.violations.length > 0) {
  result.violations.forEach(v => {
    console.error(`违规: ${v.message}`)
    console.error(`字段: ${v.field}`)
    console.error(`类型: ${v.type}`)
  })
}

// 处理警告
if (result.warnings.length > 0) {
  result.warnings.forEach(w => {
    console.warn(`警告: ${w.message}`)
    console.warn(`建议: ${w.suggestion}`)
  })
}

// 处理建议
if (result.suggestions.length > 0) {
  result.suggestions.forEach(s => {
    console.info(`建议: ${s.message}`)
  })
}
```

## 测试

运行测试脚本：
```bash
node src/core/template-engine/test-constraint-system.js
```

## 文件位置

```
src/core/template-engine/
├── ConstraintSystem.js              # 核心系统
├── constraint-system-index.js       # 模块索引
├── test-constraint-system.js        # 测试脚本
├── config/
│   └── constraintConfig.js         # 约束配置
└── validators/
    ├── BaseValidator.js            # 基础验证器
    ├── TextValidator.js            # 文字验证器
    ├── ColorValidator.js           # 颜色验证器
    ├── SizeValidator.js            # 尺寸验证器
    └── UXValidator.js              # 用户体验验证器
```

## 更多资源

- 完整报告: `ConstraintSystem重构完成报告.md`
- 架构说明: `ConstraintSystem架构说明.md`
- 原文件备份: `ConstraintSystem.js.backup`
