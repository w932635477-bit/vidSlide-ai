/**
 * Remotion视频渲染服务
 * 负责与Remotion渲染服务器通信，生成专业视频
 */

class RemotionService {
  constructor() {
    this.baseURL = 'http://localhost:3002' // Remotion服务器地址
    this.templates = null // 缓存模板列表
  }

  /**
   * 获取所有可用模板
   * @returns {Promise<Array>} 模板列表
   */
  async getAvailableTemplates() {
    if (this.templates) {
      return this.templates
    }

    try {
      const response = await fetch(`${this.baseURL}/templates`)
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      this.templates = await response.json()
      return this.templates
    } catch (error) {
      console.error('获取模板列表失败:', error)
      // 返回默认模板列表
      return this.getDefaultTemplates()
    }
  }

  /**
   * 渲染视频
   * @param {string} templateId - 模板ID
   * @param {object} props - 模板参数
   * @param {object} options - 渲染选项
   * @returns {Promise<object>} 渲染结果
   */
  async renderVideo(templateId, props, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          composition: templateId,
          props: props,
          options: {
            codec: options.codec || 'h264',
            fps: options.fps || 30,
            width: options.width || 1920,
            height: options.height || 1080,
            ...options
          }
        })
      })

      if (!response.ok) {
        throw new Error('Render request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('视频渲染失败:', error)
      throw error
    }
  }

  /**
   * 获取渲染进度
   * @param {string} renderId - 渲染任务ID
   * @returns {Promise<object>} 进度信息
   */
  async getRenderProgress(renderId) {
    try {
      const response = await fetch(`${this.baseURL}/progress/${renderId}`)
      if (!response.ok) {
        throw new Error('Failed to get render progress')
      }
      return await response.json()
    } catch (error) {
      console.error('获取渲染进度失败:', error)
      throw error
    }
  }

  /**
   * 取消渲染任务
   * @param {string} renderId - 渲染任务ID
   */
  async cancelRender(renderId) {
    try {
      const response = await fetch(`${this.baseURL}/cancel/${renderId}`, {
        method: 'POST'
      })
      return await response.json()
    } catch (error) {
      console.error('取消渲染失败:', error)
      throw error
    }
  }

  /**
   * 下载渲染的视频
   * @param {string} videoUrl - 视频URL
   * @param {string} filename - 文件名
   */
  async downloadVideo(videoUrl, filename = 'video.mp4') {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('下载视频失败:', error)
      throw error
    }
  }

  /**
   * 获取默认模板列表（当服务器不可用时）
   */
  getDefaultTemplates() {
    return {
      templates: [
        // 基础展示类
        { id: 'GlassmorphismStack', name: '磨砂玻璃3D堆叠', category: 'showcase', description: '3D卡片堆叠、旋转动画、多层光晕' },
        { id: 'LuxuryProductShowcase', name: '奢华金色卡片', category: 'showcase', description: '黑金配色、金色边框、四角装饰' },
        { id: 'NeumorphismSoft', name: '新拟态柔和', category: 'showcase', description: '浅色背景、柔和内外阴影、凸起效果' },
        { id: 'HolographicRainbow', name: '全息彩虹', category: 'showcase', description: '彩虹渐变边框、全息光泽、动态粒子' },
        { id: 'MinimalWhiteSpace', name: '极简留白', category: 'showcase', description: '大量留白、细线边框、黑白配色' },
        
        // 对比分析类
        { id: 'SplitComparison', name: '分屏对比', category: 'comparison', description: '垂直分割线、左右不同颜色、VS标识' },
        { id: 'BeforeAfterSlider', name: '前后滑动对比', category: 'comparison', description: '滑动遮罩、拖动手柄、Before/After标签' },
        { id: 'DiagonalSplit', name: '对角线分割', category: 'comparison', description: '45度对角线、三角形遮罩、动态分割' },
        { id: 'CircularReveal', name: '圆形揭示', category: 'comparison', description: '圆形遮罩扩散、涟漪效果、发光边框' },
        { id: 'FlipCard', name: '3D翻转卡片', category: 'comparison', description: '3D翻转180度、正反面内容、透视效果' },
        
        // 数据可视化类
        { id: 'AnimatedBarChart', name: '动态柱状图', category: 'data', description: '柱状图生长动画、渐变填充、网格背景' },
        { id: 'CircularProgress', name: '环形进度图', category: 'data', description: 'SVG圆环绘制、渐变描边、中心百分比' },
        { id: 'LineChartFlow', name: '流动曲线图', category: 'data', description: '简化曲线图、渐变填充、动态数据点' },
        { id: 'RadarChart', name: '雷达图展示', category: 'data', description: '六边形雷达图、多维度数据、渐变填充' },
        { id: 'InfographicGrid', name: '信息图表网格', category: 'data', description: '4宫格布局、图标+数据、渐变卡片' },
        
        // 文字动画类
        { id: 'KineticTypography', name: '动态字体分解', category: 'text', description: '字母分离动画、弹性效果、渐变色彩' },
        { id: 'NeonGlowText', name: '霓虹发光文字', category: 'text', description: '霓虹灯效果、多层发光、闪烁动画' },
        { id: 'LiquidMorphText', name: '液态变形文字', category: 'text', description: '流体形态、波浪效果、渐变色彩' },
        { id: 'GlitchText', name: '故障艺术文字', category: 'text', description: 'RGB分离、扫描线、随机位移' },
        { id: 'ThreeDExtrudeText', name: '3D挤出文字', category: 'text', description: '3D立体效果、阴影层次、透视变换' },
        
        // 创意特效类
        { id: 'ParticleExplosion', name: '粒子爆炸', category: 'effects', description: '50个粒子、径向扩散、渐变色彩' },
        { id: 'RippleWave', name: '涟漪波纹', category: 'effects', description: '同心圆扩散、波纹动画、渐变透明' },
        { id: 'LightBeamScan', name: '光束扫描', category: 'effects', description: '扫描光束、科技感、渐变光效' },
        { id: 'MorphShapeTransition', name: '形态变换', category: 'effects', description: '圆形到方形、流体动画、渐变色彩' },
        { id: 'FloatingIslands', name: '漂浮岛屿', category: 'effects', description: '3D浮动卡片、上下浮动、透视效果' },
        
        // 混合效果类
        { id: 'MagneticCards', name: '磁吸卡片', category: 'mixed', description: '卡片相互吸引、弹性动画、磁场线条' },
        { id: 'PerspectiveGallery', name: '透视画廊', category: 'mixed', description: '3D透视空间、画廊排列、深度景深' },
        { id: 'SplitFlap', name: '翻页显示屏', category: 'mixed', description: '机场翻页屏、上下翻转、机械感' },
        { id: 'CrystalPrism', name: '水晶棱镜', category: 'mixed', description: '多面体设计、折射光效、彩虹色散' },
        { id: 'InkSpread', name: '墨水扩散', category: 'mixed', description: '墨水扩散效果、有机形态、流体模拟' }
      ]
    }
  }

  /**
   * 根据类别获取模板
   * @param {string} category - 类别名称
   */
  async getTemplatesByCategory(category) {
    const { templates } = await this.getAvailableTemplates()
    return templates.filter(t => t.category === category)
  }

  /**
   * 检查Remotion服务是否可用
   */
  async checkServiceAvailability() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 3000
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}

// 导出单例
export default new RemotionService()
