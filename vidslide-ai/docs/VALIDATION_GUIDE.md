# VidSlide AI 验证框架使用指南

## 快速开始

### 运行验证

```bash
# 进入项目目录
cd vidslide-ai

# 运行工作流验证
node scripts/workflow-validator.js

# 运行模块集成测试
node test-modules.js

# 运行交互式测试
npm run dev
# 然后打开 http://localhost:5174/test-integration.html
```

## 验证框架结构

```
vidslide-ai/
├── scripts/
│   └── workflow-validator.js    # 工作流验证 Agent
├── docs/
│   └── WORKFLOW_AGENT.md        # 工作流设计文档
├── test-modules.js              # 模块集成测试
├── test-integration.html        # 交互式测试页面
└── reports/                     # 验证报告输出目录
```

## 验证类型

### 1. 模块存在性检查

验证所有必需的模块文件是否存在。

**检查项：**
- 服务模块 (services/)
- 工具模块 (utils/)
- 组件模块 (components/)
- 视图模块 (views/)

### 2. 接口完整性检查

验证模块是否实现了所有必需的接口。

**示例：UnifiedFaceTracker 必需接口**
```javascript
- export const TrackerEngine
- async initialize()
- async startTracking()
- stopTracking()
- getTrackingState()
```

### 3. 组件集成检查

验证组件是否正确导入和使用依赖服务。

**示例：PictureInPicture.vue 检查项**
```javascript
mustImport: ['UnifiedFaceTracker', 'TrackerEngine']
mustHave: ['faceTrackingSupported', 'currentTrackerEngine']
```

### 4. 工作流完整性检查

验证完整的业务工作流是否可执行。

**定义的工作流：**
- 视频处理工作流
- 人脸跟踪工作流
- 场景检测工作流

## 开发流程指南

### 新功能开发

```
1. 开发前
   └── 运行 workflow-validator.js 了解当前状态

2. 开发中
   ├── 遵循接口契约定义
   ├── 确保错误处理完整
   └── 添加必要的日志

3. 开发后
   ├── 运行 workflow-validator.js 验证
   ├── 运行 test-modules.js 测试
   ├── npm run build 构建验证
   └── 交互测试 test-integration.html
```

### 功能开发检查清单

#### 人脸跟踪功能
```
[ ] UnifiedFaceTracker.js 实现完整
[ ] 组件正确导入 UnifiedFaceTracker
[ ] onMounted 中调用 initialize()
[ ] 视频加载后调用 startTracking()
[ ] 监听 faceDetected 事件
[ ] onUnmounted 中调用 stopTracking()
[ ] 多浏览器兼容性测试
[ ] 引擎降级逻辑验证
```

#### 场景检测功能
```
[ ] SceneDetection 类实现完整
[ ] 正确初始化 initialize()
[ ] 调用 analyzeVideoFrames()
[ ] 处理 onSceneDetected 回调
[ ] 结果添加到时间线
[ ] 调用 dispose() 清理资源
[ ] 长视频性能测试
```

#### 画中画集成
```
[ ] 导入 UnifiedFaceTracker
[ ] 初始化人脸跟踪服务
[ ] 监听人脸检测事件
[ ] 智能定位逻辑正确
[ ] 位置切换平滑
```

## 问题排查

### 人脸跟踪初始化失败

```
1. 检查浏览器版本
   - Chrome 80+
   - Firefox 75+
   - Safari 14+
   - Edge 80+

2. 检查 WebGL 支持
   - 打开 chrome://gpu 查看

3. 检查模型加载
   - 查看 Network 面板
   - 确认模型文件存在

4. 尝试强制引擎
   initialize({ preferredEngine: 'faceapi' })
```

### 场景检测速度慢

```
1. 降低分辨率
   detector.initialize(320, 180)

2. 降低帧率
   analyzeVideoFrames(video, { frameRate: 1 })

3. 分段处理
   - 将长视频分成多段
   - 分别处理后合并结果
```

### 组件集成断裂

```
1. 运行验证
   node scripts/workflow-validator.js

2. 检查导入
   - 确认 import 语句正确
   - 确认路径正确

3. 检查接口
   - 确认方法名匹配
   - 确认参数格式正确

4. 查看构建错误
   npm run build
```

## 验证报告解读

### 报告格式

```json
{
  "timestamp": "2026-01-15T...",
  "modules": {
    "passed": 9,
    "failed": 0,
    "details": [...]
  },
  "interfaces": {
    "passed": 3,
    "failed": 1,
    "details": [...]
  },
  "integrations": {
    "passed": 4,
    "failed": 1,
    "details": [...]
  },
  "workflows": {
    "passed": 1,
    "failed": 2,
    "details": [...]
  }
}
```

### 状态说明

| 状态 | 说明 |
|------|------|
| ✅ 通过 | 验证项完全符合要求 |
| ⚠️ 警告 | 部分验证项未通过，需要关注 |
| ❌ 失败 | 关键验证项未通过，需要修复 |

## 扩展验证规则

### 添加新模块检查

编辑 `scripts/workflow-validator.js`:

```javascript
const REQUIRED_MODULES = {
  services: [
    // 添加新服务
    {
      path: 'src/services/NewService.js',
      description: '新服务描述',
      interfaces: ['method1', 'method2']
    }
  ]
}
```

### 添加新工作流

```javascript
const WORKFLOWS = {
  newWorkflow: {
    name: '新工作流名称',
    steps: [
      { id: 'step1', description: '步骤1', handler: 'handlerName' },
      { id: 'step2', description: '步骤2', handler: 'handlerName' }
    ]
  }
}
```

## 持续集成

### 添加到 package.json

```json
{
  "scripts": {
    "validate": "node scripts/workflow-validator.js",
    "test:modules": "node test-modules.js",
    "test:all": "npm run validate && npm run test:modules && npm run build"
  }
}
```

### 开发前运行

```bash
# 每次开发前运行完整验证
npm run test:all
```

## 渐进式完善

当前框架是轻量级版本，后续可以扩展：

### 阶段 2: 自动化测试
- [ ] 添加单元测试覆盖
- [ ] 集成 Jest/Vitest
- [ ] 添加 E2E 测试

### 阶段 3: CI/CD 集成
- [ ] GitHub Actions 配置
- [ ] 自动运行验证
- [ ] 测试报告发布

### 阶段 4: 智能诊断
- [ ] 错误自动分析
- [ ] 修复建议生成
- [ ] 性能监控
