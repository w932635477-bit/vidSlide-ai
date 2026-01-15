/**
 * VidSlide AI - 工作流验证 Agent
 * 轻量级验证框架，用于确保开发质量和功能完整性
 */

import { readFileSync, existsSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================
// 配置定义
// ============================================

/**
 * 必需模块列表
 */
const REQUIRED_MODULES = {
  services: [
    {
      path: 'src/services/UnifiedFaceTracker.js',
      description: '统一人脸跟踪服务',
      interfaces: [
        'export const TrackerEngine',
        'async initialize(',
        'async startTracking(',
        'stopTracking(',
        'getTrackingState('
      ]
    },
    {
      path: 'src/services/MaterialService.js',
      description: '素材服务',
      interfaces: ['searchMaterials', 'downloadMaterial', 'initialize']
    },
    {
      path: 'src/services/IntelligentDispatcher.js',
      description: '智能素材调度器',
      interfaces: [
        'async initialize(',
        'async dispatch(',
        'selectStrategy(',
        'selectPlatforms('
      ]
    },
    {
      path: 'src/services/TemplateRecommender.js',
      description: '模板推荐服务',
      interfaces: ['recommend', 'analyzeContent']
    },
    {
      path: 'src/services/SpeechRecognitionService.js',
      description: '语音识别服务',
      interfaces: ['start', 'stop', 'extractKeywords']
    }
  ],
  utils: [
    {
      path: 'src/utils/sceneDetection.js',
      description: '场景检测工具',
      interfaces: [
        'export class SceneDetection',
        'initialize(',
        'analyzeVideoFrames(',
        'detectImageDifference(',
        'dispose('
      ]
    },
    {
      path: 'src/services/utils/IntelligentDispatcher/KeywordAnalyzer.js',
      description: '关键词分析器',
      interfaces: [
        'analyze(',
        'countChineseChars(',
        'countEnglishChars(',
        'matchPatterns('
      ]
    },
    {
      path: 'src/services/utils/IntelligentDispatcher/PlatformEvaluator.js',
      description: '平台评估器',
      interfaces: ['calculateScores']
    },
    {
      path: 'src/services/utils/IntelligentDispatcher/TranslationService.js',
      description: '翻译服务',
      interfaces: ['translate', 'initialize']
    }
  ],
  components: [
    {
      path: 'src/components/PictureInPicture.vue',
      description: '画中画组件',
      mustImport: ['UnifiedFaceTracker', 'TrackerEngine'],
      mustHave: ['faceTrackingSupported', 'currentTrackerEngine', 'getEngineDisplayName']
    },
    {
      path: 'src/components/FaceTrackingSettings.vue',
      description: '人脸跟踪设置组件',
      mustImport: ['UnifiedFaceTracker'],
      mustHave: ['startPreview', 'currentEngine', 'drawRealFaceBox']
    },
    {
      path: 'src/components/Timeline.vue',
      description: '时间线组件',
      mustHave: ['markers', 'addMarker']
    },
    {
      path: 'src/components/MaterialRequirementAnalyzer.vue',
      description: '素材需求分析组件',
      mustImport: ['MaterialService', 'IntelligentDispatcher'],
      mustHave: [
        'analyzeRequirements',
        'searchMaterial',
        'materialRequirements',
        'handleSearch'
      ]
    },
    {
      path: 'src/components/DispatcherStatus.vue',
      description: '调度器状态组件',
      mustHave: ['dispatcherStats', 'platformUsage']
    }
  ],
  views: [
    {
      path: 'src/views/VideoEditorView.vue',
      description: '视频编辑器视图',
      mustImport: ['UnifiedFaceTracker', 'SceneDetection'],
      mustHave: [
        'analyzeVideoScenes',
        'startFaceTrackingForVideo',
        'handleFaceDetectedForPip',
        'sceneDetector',
        'detectedScenes'
      ]
    },
    {
      path: 'src/views/WorkspaceView.vue',
      description: '工作区视图',
      mustImport: ['MaterialRequirementAnalyzer', 'MaterialService'],
      mustHave: [
        'materialAnalyzerKeywords',
        'materialAnalyzerKeyframes',
        'handleMaterialSearchRequested',
        'extractedKeywords',
        'extractedKeyframes',
        'panelTabs'
      ]
    }
  ]
}

/**
 * 工作流定义
 */
const WORKFLOWS = {
  videoProcessing: {
    name: '视频处理工作流',
    steps: [
      { id: 'upload', description: '视频上传', handler: 'handleVideoUpload' },
      { id: 'parse', description: '视频解析', handler: 'parseVideo' },
      { id: 'sceneDetect', description: '场景检测', handler: 'analyzeVideoScenes' },
      { id: 'faceTrack', description: '人脸跟踪', handler: 'startFaceTrackingForVideo' },
      { id: 'template', description: '模板应用', handler: 'applyTemplate' },
      { id: 'export', description: '导出', handler: 'exportVideo' }
    ]
  },
  faceTracking: {
    name: '人脸跟踪工作流',
    steps: [
      { id: 'init', description: '初始化', handler: 'UnifiedFaceTracker.initialize' },
      { id: 'detectBrowser', description: '浏览器检测', handler: 'getEnginePriority' },
      { id: 'selectEngine', description: '引擎选择', handler: 'initializeEngine' },
      { id: 'startTrack', description: '开始跟踪', handler: 'startTracking' },
      { id: 'pipPosition', description: '画中画定位', handler: 'handleFaceDetectedForPip' }
    ]
  },
  sceneDetection: {
    name: '场景检测工作流',
    steps: [
      { id: 'init', description: '初始化', handler: 'SceneDetection.initialize' },
      { id: 'analyze', description: '帧分析', handler: 'analyzeVideoFrames' },
      { id: 'detect', description: '场景检测', handler: 'detectSceneChange' },
      { id: 'marker', description: '标记生成', handler: 'addSceneMarker' }
    ]
  },
  materialRequirementAnalysis: {
    name: '素材需求分析工作流',
    steps: [
      { id: 'speechRecognition', description: '语音识别', handler: 'extractKeywords' },
      { id: 'keywordAnalysis', description: '关键词分析', handler: 'KeywordAnalyzer.analyze' },
      { id: 'dispatch', description: '智能调度', handler: 'IntelligentDispatcher.dispatch' },
      { id: 'platformSelect', description: '平台选择', handler: 'selectPlatforms' },
      { id: 'translate', description: '翻译处理', handler: 'TranslationService.translate' },
      { id: 'search', description: '素材搜索', handler: 'MaterialService.searchMaterials' },
      { id: 'display', description: '结果展示', handler: 'materialRequirements' }
    ]
  },
  intelligentDispatch: {
    name: '智能调度工作流',
    steps: [
      { id: 'init', description: '初始化调度器', handler: 'IntelligentDispatcher.initialize' },
      { id: 'analyze', description: '关键词分析', handler: 'keywordAnalyzer.analyze' },
      { id: 'evaluate', description: '平台评估', handler: 'platformEvaluator.calculateScores' },
      { id: 'strategy', description: '策略选择', handler: 'selectStrategy' },
      { id: 'dispatch', description: '执行调度', handler: 'dispatch' }
    ]
  }
}

/**
 * 浏览器兼容性配置
 */
const BROWSER_COMPATIBILITY = {
  chrome: { minVersion: 80, preferredEngine: 'mediapipe', fallback: 'faceapi' },
  firefox: { minVersion: 75, preferredEngine: 'faceapi', fallback: 'mediapipe' },
  safari: { minVersion: 14, preferredEngine: 'faceapi', fallback: 'basic' },
  edge: { minVersion: 80, preferredEngine: 'mediapipe', fallback: 'faceapi' }
}

// ============================================
// 验证器类
// ============================================

class WorkflowValidator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot
    this.results = {
      timestamp: new Date().toISOString(),
      modules: { passed: 0, failed: 0, details: [] },
      interfaces: { passed: 0, failed: 0, details: [] },
      integrations: { passed: 0, failed: 0, details: [] },
      workflows: { passed: 0, failed: 0, details: [] }
    }
  }

  /**
   * 运行所有验证
   */
  async runAll() {
    console.log('🔍 VidSlide AI 工作流验证 Agent')
    console.log('='.repeat(60))

    await this.validateModules()
    await this.validateInterfaces()
    await this.validateIntegrations()
    await this.validateWorkflows()

    this.generateReport()
    return this.results
  }

  /**
   * 验证模块存在性
   */
  async validateModules() {
    console.log('\n📁 模块存在性检查')
    console.log('-'.repeat(60))

    for (const [category, modules] of Object.entries(REQUIRED_MODULES)) {
      for (const module of modules) {
        const fullPath = join(this.projectRoot, module.path)
        const exists = existsSync(fullPath)

        if (exists) {
          console.log(`✅ [${category}] ${module.description}`)
          this.results.modules.passed++
        } else {
          console.log(`❌ [${category}] ${module.description} - 文件不存在: ${module.path}`)
          this.results.modules.failed++
        }

        this.results.modules.details.push({
          category,
          path: module.path,
          description: module.description,
          exists
        })
      }
    }
  }

  /**
   * 验证接口完整性
   */
  async validateInterfaces() {
    console.log('\n🔌 接口完整性检查')
    console.log('-'.repeat(60))

    for (const [category, modules] of Object.entries(REQUIRED_MODULES)) {
      for (const module of modules) {
        if (!module.interfaces) continue

        const fullPath = join(this.projectRoot, module.path)
        if (!existsSync(fullPath)) continue

        const content = readFileSync(fullPath, 'utf-8')
        const missingInterfaces = []

        for (const iface of module.interfaces) {
          if (!content.includes(iface)) {
            missingInterfaces.push(iface)
          }
        }

        if (missingInterfaces.length === 0) {
          console.log(`✅ ${module.description} - 接口完整`)
          this.results.interfaces.passed++
        } else {
          console.log(`❌ ${module.description} - 缺少接口:`)
          missingInterfaces.forEach(i => console.log(`   - ${i}`))
          this.results.interfaces.failed++
        }

        this.results.interfaces.details.push({
          path: module.path,
          description: module.description,
          missingInterfaces
        })
      }
    }
  }

  /**
   * 验证组件集成
   */
  async validateIntegrations() {
    console.log('\n🔗 组件集成检查')
    console.log('-'.repeat(60))

    const componentsAndViews = [
      ...REQUIRED_MODULES.components,
      ...REQUIRED_MODULES.views
    ]

    for (const component of componentsAndViews) {
      const fullPath = join(this.projectRoot, component.path)
      if (!existsSync(fullPath)) continue

      const content = readFileSync(fullPath, 'utf-8')
      const issues = []

      // 检查必须导入
      if (component.mustImport) {
        for (const imp of component.mustImport) {
          if (!content.includes(imp)) {
            issues.push(`缺少导入: ${imp}`)
          }
        }
      }

      // 检查必须包含
      if (component.mustHave) {
        for (const item of component.mustHave) {
          if (!content.includes(item)) {
            issues.push(`缺少: ${item}`)
          }
        }
      }

      if (issues.length === 0) {
        console.log(`✅ ${component.description} - 集成正确`)
        this.results.integrations.passed++
      } else {
        console.log(`❌ ${component.description}:`)
        issues.forEach(i => console.log(`   - ${i}`))
        this.results.integrations.failed++
      }

      this.results.integrations.details.push({
        path: component.path,
        description: component.description,
        issues
      })
    }
  }

  /**
   * 验证工作流完整性
   */
  async validateWorkflows() {
    console.log('\n⚙️ 工作流完整性检查')
    console.log('-'.repeat(60))

    for (const [workflowId, workflow] of Object.entries(WORKFLOWS)) {
      console.log(`\n📋 ${workflow.name}`)

      const missingHandlers = []

      for (const step of workflow.steps) {
        // 在所有文件中搜索 handler
        let found = false

        for (const [category, modules] of Object.entries(REQUIRED_MODULES)) {
          for (const module of modules) {
            const fullPath = join(this.projectRoot, module.path)
            if (!existsSync(fullPath)) continue

            const content = readFileSync(fullPath, 'utf-8')
            if (content.includes(step.handler)) {
              found = true
              break
            }
          }
          if (found) break
        }

        if (found) {
          console.log(`   ✅ ${step.description} (${step.handler})`)
        } else {
          console.log(`   ❌ ${step.description} - 缺少: ${step.handler}`)
          missingHandlers.push(step)
        }
      }

      if (missingHandlers.length === 0) {
        this.results.workflows.passed++
      } else {
        this.results.workflows.failed++
      }

      this.results.workflows.details.push({
        workflowId,
        name: workflow.name,
        missingHandlers
      })
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 验证报告汇总')
    console.log('='.repeat(60))

    const categories = ['modules', 'interfaces', 'integrations', 'workflows']
    const categoryNames = {
      modules: '模块存在性',
      interfaces: '接口完整性',
      integrations: '组件集成',
      workflows: '工作流完整性'
    }

    let totalPassed = 0
    let totalFailed = 0

    for (const cat of categories) {
      const { passed, failed } = this.results[cat]
      totalPassed += passed
      totalFailed += failed
      const status = failed === 0 ? '✅' : '⚠️'
      console.log(`${status} ${categoryNames[cat]}: ${passed}/${passed + failed} 通过`)
    }

    console.log('-'.repeat(60))
    console.log(`📈 总计: ${totalPassed}/${totalPassed + totalFailed} 通过`)
    console.log(`📈 通过率: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`)

    if (totalFailed === 0) {
      console.log('\n🎉 所有验证通过！')
    } else {
      console.log('\n⚠️ 存在问题需要修复，请查看上述详情')
    }

    // 保存报告到文件
    const reportPath = join(this.projectRoot, 'reports', `workflow-validation-${Date.now()}.json`)
    try {
      writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
      console.log(`\n📄 详细报告已保存: ${reportPath}`)
    } catch (e) {
      // 忽略保存错误
    }
  }
}

// ============================================
// 指导层 - 工作流指南
// ============================================

class WorkflowGuide {
  /**
   * 获取功能开发指南
   */
  static getFeatureGuide(featureName) {
    const guides = {
      faceTracking: {
        name: '人脸跟踪功能',
        steps: [
          '1. 确保 UnifiedFaceTracker.js 已正确实现',
          '2. 在组件中导入 UnifiedFaceTracker 和 TrackerEngine',
          '3. 在 onMounted 中调用 initialize()',
          '4. 视频加载后调用 startTracking(videoElement)',
          '5. 监听 faceDetected 事件处理人脸位置',
          '6. 在 onUnmounted 中调用 stopTracking() 清理'
        ],
        checklist: [
          '[ ] 多浏览器兼容性测试',
          '[ ] 引擎降级逻辑验证',
          '[ ] 错误处理完整',
          '[ ] 资源清理正确'
        ]
      },
      sceneDetection: {
        name: '场景检测功能',
        steps: [
          '1. 确保 sceneDetection.js 已正确实现',
          '2. 创建 SceneDetection 实例并 initialize()',
          '3. 视频加载后调用 analyzeVideoFrames()',
          '4. 处理 onSceneDetected 回调',
          '5. 将检测结果添加到时间线',
          '6. 完成后调用 dispose() 清理'
        ],
        checklist: [
          '[ ] 不同类型场景切换检测',
          '[ ] 进度回调正常',
          '[ ] 长视频性能测试',
          '[ ] 资源清理正确'
        ]
      },
      pipIntegration: {
        name: '画中画集成',
        steps: [
          '1. 在 PictureInPicture.vue 中导入 UnifiedFaceTracker',
          '2. 初始化人脸跟踪服务',
          '3. 监听人脸检测事件',
          '4. 根据人脸位置计算画中画位置',
          '5. 应用智能定位逻辑'
        ],
        checklist: [
          '[ ] 人脸在左侧时画中画在右侧',
          '[ ] 人脸在右侧时画中画在左侧',
          '[ ] 位置切换平滑',
          '[ ] 无人脸时使用默认位置'
        ]
      },
      materialRequirementAnalysis: {
        name: '素材需求分析功能',
        steps: [
          '1. 确保 MaterialRequirementAnalyzer.vue 已集成到 WorkspaceView',
          '2. 确保 IntelligentDispatcher.js 和 MaterialService.js 已正确实现',
          '3. 视频分析完成后，提取关键词 (extractKeywords)',
          '4. 将关键词传递给 MaterialRequirementAnalyzer 组件',
          '5. 组件调用 IntelligentDispatcher.dispatch() 进行智能调度',
          '6. 根据关键词语言自动选择平台 (中文→百度, 英文→Unsplash)',
          '7. 调用 MaterialService.searchMaterials() 搜索素材',
          '8. 展示搜索结果，支持添加到画布'
        ],
        checklist: [
          '[ ] 中文关键词正确路由到百度平台',
          '[ ] 英文关键词正确路由到 Unsplash/Pexels',
          '[ ] 翻译服务正常工作',
          '[ ] 搜索结果正确展示',
          '[ ] 添加到画布功能正常',
          '[ ] extractKeywords 异步调用正确处理'
        ]
      },
      intelligentDispatch: {
        name: '智能调度功能',
        steps: [
          '1. 确保 KeywordAnalyzer.js 正确分析关键词语言',
          '2. 确保 PlatformEvaluator.js 正确评估平台分数',
          '3. 确保 TranslationService.js 正确翻译中文关键词',
          '4. IntelligentDispatcher 根据分析结果选择最优策略',
          '5. 支持单平台精确模式、多平台并行模式、渐进式扩展'
        ],
        checklist: [
          '[ ] 关键词语言检测准确',
          '[ ] 平台评分合理',
          '[ ] 翻译服务响应正常',
          '[ ] 策略选择正确',
          '[ ] 缓存机制有效'
        ]
      }
    }

    return guides[featureName] || null
  }

  /**
   * 获取问题排查指南
   */
  static getTroubleshootingGuide(issue) {
    const guides = {
      faceTrackingFailed: {
        issue: '人脸跟踪初始化失败',
        steps: [
          '1. 检查浏览器是否支持 (Chrome 80+, Firefox 75+, Safari 14+)',
          '2. 检查 WebGL 是否可用',
          '3. 检查 face-api.js 模型是否加载',
          '4. 查看控制台错误信息',
          '5. 尝试强制使用特定引擎: preferredEngine: "faceapi"'
        ]
      },
      sceneDetectionSlow: {
        issue: '场景检测速度慢',
        steps: [
          '1. 降低分析分辨率: initialize(320, 180)',
          '2. 降低帧率: frameRate: 1',
          '3. 检查视频时长是否过长',
          '4. 考虑分段处理长视频'
        ]
      },
      integrationBroken: {
        issue: '组件集成断裂',
        steps: [
          '1. 运行 node test-modules.js 检查模块',
          '2. 检查导入语句是否正确',
          '3. 检查接口是否匹配',
          '4. 查看构建错误信息'
        ]
      }
    }

    return guides[issue] || null
  }
}

// ============================================
// 主入口
// ============================================

async function main() {
  // 获取项目根目录 (scripts 的父目录)
  const projectRoot = join(__dirname, '..')
  const validator = new WorkflowValidator(projectRoot)

  try {
    const results = await validator.runAll()

    // 如果有失败，退出码为 1
    const totalFailed =
      results.modules.failed +
      results.interfaces.failed +
      results.integrations.failed +
      results.workflows.failed

    process.exit(totalFailed > 0 ? 1 : 0)
  } catch (error) {
    console.error('验证过程出错:', error)
    process.exit(1)
  }
}

// 导出供其他模块使用
export { WorkflowValidator, WorkflowGuide, REQUIRED_MODULES, WORKFLOWS, BROWSER_COMPATIBILITY }

// 如果直接运行此文件
main()
