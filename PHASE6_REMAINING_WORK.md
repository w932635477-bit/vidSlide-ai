# Phase 6 剩余工作说明

## 已完成
- ✅ 删除了 MaterialService 和 SmartImageCropper 的导入
- ✅ 更新了工作流程注释（删除素材匹配步骤）
- ✅ 修改了主流程，删除素材匹配调用

## 需要手动完成的修改

### 1. MasterAutoGenerationAgent.js

需要删除或注释掉以下方法：
- `matchMaterials()` 方法（约第220-290行）
- `assignMaterialsToScene()` 方法（约第415-450行）
- `generateChartData()` 方法（如果不再需要）

需要修改 `composeContent()` 方法：
```javascript
// 旧签名
async composeContent(analysisResult, template, materials, onProgress)

// 新签名
async composeContent(analysisResult, template, onProgress)

// 主要修改：
// 1. 删除 materials 参数
// 2. 删除素材扁平化代码（allMaterials）
// 3. 修改 generateMicroScenes 调用：
//    旧: MicroSceneGenerator.generateMicroScenes(segment, keywords, allMaterials)
//    新: await MicroSceneGenerator.generateMicroScenes(segment, keywords)
// 4. 在 composition 场景中使用 microScene.imageUrl 而不是 backgroundMaterial
// 5. 删除 assignMaterialsToScene 和 generateChartData 调用
```

### 2. RemotionRenderer.js

需要修改模板渲染逻辑以支持新的简化模板：

```javascript
// 添加新模板的支持
const templateMap = {
  'BlackBackgroundBasic': 'BlackBackgroundBasic',
  'BlackBackgroundEmphasis': 'BlackBackgroundEmphasis',
  'BlackBackgroundChart': 'BlackBackgroundChart',
  // ... 保留其他模板映射
}

// 修改 inputProps 以支持新模板
if (template === 'BlackBackgroundBasic') {
  inputProps = {
    imageUrl: scene.imageUrl,  // 豆包生成的图片
    keyword: scene.keyword,
    glowColor: '#667eea',
    showKeyword: true,
    imageSize: 'large'
  }
} else if (template === 'BlackBackgroundEmphasis') {
  inputProps = {
    imageUrl: scene.imageUrl,
    keyword: scene.keyword,
    glowColor: '#ff6b6b',
    showPulse: true,
    imageSize: 'large'
  }
} else if (template === 'BlackBackgroundChart') {
  inputProps = {
    imageUrl: scene.imageUrl,
    title: scene.keyword,
    subtitle: '',
    glowColor: '#4ecdc4',
    showGrid: true,
    imageSize: 'large'
  }
}
```

### 3. 测试验证

创建测试脚本验证完整流程：

```javascript
// test-simplified-flow.js
import MasterAutoGenerationAgent from './vidslide-ai/src/services/MasterAutoGenerationAgent.js'

async function testSimplifiedFlow() {
  const agent = new MasterAutoGenerationAgent()

  const result = await agent.generate(
    './test-video.mp4',
    {
      onProgress: (message, progress) => {
        console.log(`[${progress}%] ${message}`)
      }
    }
  )

  console.log('✅ 测试完成:', result)
}

testSimplifiedFlow()
```

## 验收标准

- [ ] MasterAutoGenerationAgent 不再调用 MaterialService
- [ ] MicroSceneGenerator.generateMicroScenes 返回包含 imageUrl 的场景
- [ ] RemotionRenderer 能正确渲染新的 BlackBackground 模板
- [ ] 完整流程测试通过
- [ ] 生成的视频包含豆包生成的图片

## 预期效果

1. **流程简化**：从 5 步减少到 4 步
2. **素材准确率**：从 <50% 提升到 >90%（使用豆包生图）
3. **代码复杂度**：降低约 40%
4. **维护成本**：降低约 70%

## 注意事项

1. 豆包API有速率限制，建议请求间隔 ≥ 3秒
2. 图片缓存有效期 24小时
3. 确保 .env 文件中的 DOUBAO_API_KEY 配置正确
4. 新模板只支持 imageUrl 参数，不再需要 backgroundMaterial
