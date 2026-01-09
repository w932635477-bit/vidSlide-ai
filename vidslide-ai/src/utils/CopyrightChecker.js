/**
 * VidSlide AI - 版权检查模块
 * 检查素材的版权状态和使用许可
 */

/**
 * 版权检查和许可证验证管理器
 * 提供全面的素材版权状态检查功能
 * 支持多种许可证类型识别、风险评估和使用建议
 */
export class CopyrightChecker {
  /**
   * 创建版权检查器实例
   * 初始化许可证数据库和缓存系统
   */
  constructor() {
    this.licenseDatabase = this.initializeLicenseDatabase()
    this.cache = new Map()
    this.cacheExpiry = 24 * 60 * 60 * 1000 // 24小时缓存
  }

  /**
   * 初始化许可证数据库
   * @returns {Object} 许可证数据库
   */
  /**

   * initializeLicenseDatabase 方法

   * VidSlide AI 功能实现

   */

  initializeLicenseDatabase() {
    return {
      // 免费商业使用许可证
      'Unsplash License': {
        name: 'Unsplash License',
        type: 'free',
        commercial: true,
        attribution: true,
        modification: true,
        redistribution: true,
        private: true,
        description: '可免费用于商业和个人用途，需要署名',
        restrictions: ['必须保留Unsplash署名']
      },
      'Pexels License': {
        name: 'Pexels License',
        type: 'free',
        commercial: true,
        attribution: false,
        modification: true,
        redistribution: true,
        private: true,
        description: '可免费用于商业和个人用途，无需署名',
        restrictions: []
      },
      'Pixabay License': {
        name: 'Pixabay License',
        type: 'free',
        commercial: true,
        attribution: false,
        modification: true,
        redistribution: true,
        private: true,
        description: '可免费用于商业和个人用途，无需署名',
        restrictions: []
      },

      // 创意共享许可证
      CC0: {
        name: 'Creative Commons Zero (CC0)',
        type: 'cc',
        commercial: true,
        attribution: false,
        modification: true,
        redistribution: true,
        private: true,
        description: '完全开放，无任何限制',
        restrictions: []
      },
      'CC BY': {
        name: 'Creative Commons Attribution (CC BY)',
        type: 'cc',
        commercial: true,
        attribution: true,
        modification: true,
        redistribution: true,
        private: true,
        description: '可商业使用，需要署名',
        restrictions: ['必须署名原作者']
      },
      'CC BY-SA': {
        name: 'Creative Commons Attribution-ShareAlike (CC BY-SA)',
        type: 'cc',
        commercial: true,
        attribution: true,
        modification: true,
        redistribution: true,
        private: true,
        description: '可商业使用，需要署名，相同方式共享',
        restrictions: ['必须署名原作者', '衍生作品必须使用相同许可证']
      },
      'CC BY-ND': {
        name: 'Creative Commons Attribution-NoDerivs (CC BY-ND)',
        type: 'cc',
        commercial: true,
        attribution: true,
        modification: false,
        redistribution: true,
        private: true,
        description: '可商业使用，需要署名，不可修改',
        restrictions: ['必须署名原作者', '不得修改原作品']
      },
      'CC BY-NC': {
        name: 'Creative Commons Attribution-NonCommercial (CC BY-NC)',
        type: 'cc',
        commercial: false,
        attribution: true,
        modification: true,
        redistribution: true,
        private: true,
        description: '仅限非商业使用，需要署名',
        restrictions: ['仅限非商业使用', '必须署名原作者']
      },
      'CC BY-NC-SA': {
        name: 'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)',
        type: 'cc',
        commercial: false,
        attribution: true,
        modification: true,
        redistribution: true,
        private: true,
        description: '仅限非商业使用，需要署名，相同方式共享',
        restrictions: ['仅限非商业使用', '必须署名原作者', '衍生作品必须使用相同许可证']
      },
      'CC BY-NC-ND': {
        name: 'Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)',
        type: 'cc',
        commercial: false,
        attribution: true,
        modification: false,
        redistribution: true,
        private: true,
        description: '仅限非商业使用，需要署名，不可修改',
        restrictions: ['仅限非商业使用', '必须署名原作者', '不得修改原作品']
      },

      // 付费许可证
      'Adobe Stock': {
        name: 'Adobe Stock License',
        type: 'paid',
        commercial: true,
        attribution: false,
        modification: true,
        redistribution: false,
        private: true,
        description: '付费商业许可证',
        restrictions: ['需要购买许可证']
      },
      Shutterstock: {
        name: 'Shutterstock License',
        type: 'paid',
        commercial: true,
        attribution: false,
        modification: true,
        redistribution: false,
        private: true,
        description: '付费商业许可证',
        restrictions: ['需要购买许可证']
      },

      // 版权保护
      'All Rights Reserved': {
        name: 'All Rights Reserved',
        type: 'copyrighted',
        commercial: false,
        attribution: false,
        modification: false,
        redistribution: false,
        private: false,
        description: '版权所有，未经许可不得使用',
        restrictions: ['未经许可不得使用', '可能侵犯版权']
      }
    }
  }

  /**
   * 检查单个素材的版权状态和使用许可
   * 根据素材来源和元数据信息确定版权状态
   * 提供详细的使用建议和风险警告
   * @param {Object} asset - 要检查的素材对象
   * @param {string} asset.source - 素材来源 ('unsplash'/'pexels'等)
   * @param {Object} asset.metadata - 素材元数据信息
   * @param {string} asset.metadata.license - 许可证类型
   * @returns {Promise<Object>} 版权检查结果对象
   * @returns {string} result.assetId - 素材ID
   * @returns {string} result.status - 版权状态 ('free'/'cc'/'paid'/'copyrighted'/'unknown')
   * @returns {Object} result.license - 许可证详细信息 (如果识别出)
   * @returns {boolean} result.isSafe - 是否可以安全使用
   * @returns {Array} result.warnings - 警告信息数组
   * @returns {Array} result.recommendations - 使用建议数组
   * @returns {string} result.lastChecked - 最后检查时间
   * @throws {Error} 当检查过程中发生严重错误时抛出
   */
  async /**
  * checkCopyright 方法
  * VidSlide AI 功能实现
  */
 checkCopyright(asset) {
    const cacheKey = `copyright_${asset.id}`
    const cached = this.getFromCache(cacheKey)

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(cached) {
      return cached
    }

    const result = {
      assetId: asset.id,
      status: 'unknown',
      license: null,
      isSafe: false,
      warnings: [],
      recommendations: [],
      lastChecked: new Date().toISOString()
    }

    try {
      // 根据素材来源确定检查策略
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(asset.source === 'unsplash') {
        result.license = this.licenseDatabase['Unsplash License']
        result.status = 'free'
        result.isSafe = true
      } else /**
  * if 方法
  * VidSlide AI 功能实现
  */
 if(asset.source === 'pexels') {
        result.license = this.licenseDatabase['Pexels License']
        result.status = 'free'
        result.isSafe = true
      } else /**
  * if 方法
  * VidSlide AI 功能实现
  */
 if(asset.metadata && asset.metadata.license) {
        // 检查已知的许可证
        const knownLicense = this.licenseDatabase[asset.metadata.license]
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(knownLicense) {
          result.license = knownLicense
          result.status = knownLicense.type
          result.isSafe = this.isLicenseSafeForUse(knownLicense)
        } else {
          // 未知许可证，标记为需要检查
          result.status = 'unknown'
          result.warnings.push('未知许可证类型，建议手动检查')
          result.recommendations.push('请查看素材原始来源确认使用许可')
        }
      } else {
        // 没有许可证信息
        result.status = 'unknown'
        result.warnings.push('缺少许可证信息')
        result.recommendations.push('请确认素材来源和使用许可')
        result.recommendations.push('建议使用知名免费素材网站')
      }

      // 基于使用场景的额外检查
      this.addUsageWarnings(result, asset)

      // 缓存结果
      this.setCache(cacheKey, result)
    } /**
  * catch 方法
  * VidSlide AI 功能实现
  */
 catch(error) {
      console.error('版权检查失败:', error)
      result.status = 'error'
      result.warnings.push('版权检查过程中发生错误')
      result.recommendations.push('建议手动验证素材使用许可')
    }

    return result
  }

  /**
   * 批量检查版权状态
   * @param {Array} assets - 素材数组
   * @returns {Promise<Array>} 版权检查结果数组
   */
  async /**
  * checkCopyrightBatch 方法
  * VidSlide AI 功能实现
  */
 checkCopyrightBatch(assets) {
    const results = []

    /**


     * for 方法


     * VidSlide AI 功能实现


     */


    for(const asset of assets) {
      try {
        const result = await this.checkCopyright(asset)
        results.push(result)
      } /**
  * catch 方法
  * VidSlide AI 功能实现
  */
 catch(error) {
        console.error(`检查素材 ${asset.id} 版权失败:`, error)
        results.push({
          assetId: asset.id,
          status: 'error',
          isSafe: false,
          warnings: ['版权检查失败'],
          recommendations: ['请手动检查版权状态']
        })
      }
    }

    return results
  }

  /**
   * 判断许可证是否安全使用
   * @param {Object} license - 许可证对象
   * @returns {boolean} 是否安全
   */
  /**

   * isLicenseSafeForUse 方法

   * VidSlide AI 功能实现

   */

  isLicenseSafeForUse(license) {
    // 免费许可证且支持商业使用
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(license.type === 'free' && license.commercial) {
      return true
    }

    // CC0完全开放
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(license.type === 'cc' && license.name === 'CC0') {
      return true
    }

    // CC BY系列（需要署名但可商业使用）
    if (license.type === 'cc' && license.name.includes('CC BY') && !license.name.includes('NC')) {
      return true
    }

    // 付费许可证（假设已购买）
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(license.type === 'paid') {
      return true // 在实际应用中需要验证购买状态
    }

    return false
  }

  /**
   * 添加使用场景相关的警告
   * @param {Object} result - 检查结果
   * @param {Object} asset - 素材对象
   */
  /**

   * addUsageWarnings 方法

   * VidSlide AI 功能实现

   */

  addUsageWarnings(result, asset) {
    // 检查是否用于商业用途
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(result.license && !result.license.commercial) {
      result.warnings.push('此许可证不允许商业使用')
      result.isSafe = false
    }

    // 检查是否需要署名
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(result.license && result.license.attribution) {
      result.warnings.push('使用时需要署名原作者')
    }

    // 检查是否禁止修改
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(result.license && !result.license.modification) {
      result.warnings.push('不得修改原作品')
    }

    // 基于素材类型的特殊提醒
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(asset.type === 'image' && asset.category === 'portrait') {
      result.warnings.push('肖像作品请确认获得肖像权许可')
    }

    // 时间相关的提醒
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(asset.metadata && asset.metadata.createdAt) {
      const createdDate = new Date(asset.metadata.createdAt)
      const now = new Date()
      const age = now.getFullYear() - createdDate.getFullYear()

      /**


       * if 方法


       * VidSlide AI 功能实现


       */


      if(age > 10) {
        result.warnings.push('作品年代较久远，请确认版权状态')
      }
    }
  }

  /**
   * 获取许可证信息
   * @param {string} licenseName - 许可证名称
   * @returns {Object|null} 许可证信息
   */
  /**

   * getLicenseInfo 方法

   * VidSlide AI 功能实现

   */

  getLicenseInfo(licenseName) {
    return this.licenseDatabase[licenseName] || null
  }

  /**
   * 获取所有支持的许可证
   * @returns {Array} 许可证列表
   */
  /**

   * getSupportedLicenses 方法

   * VidSlide AI 功能实现

   */

  getSupportedLicenses() {
    return Object.values(this.licenseDatabase)
  }

  /**
   * 获取安全的许可证类型
   * @returns {Array} 安全许可证列表
   */
  /**

   * getSafeLicenses 方法

   * VidSlide AI 功能实现

   */

  getSafeLicenses() {
    return Object.values(this.licenseDatabase).filter(license => this.isLicenseSafeForUse(license))
  }

  /**
   * 生成版权声明文本
   * @param {Object} asset - 素材对象
   * @param {Object} copyrightInfo - 版权信息
   * @returns {string} 版权声明文本
   */
  /**

   * generateAttributionText 方法

   * VidSlide AI 功能实现

   */

  generateAttributionText(asset, copyrightInfo) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(!copyrightInfo.license || !copyrightInfo.license.attribution) {
      return ''
    }

    const author = asset.author
    const source = asset.source
    const license = copyrightInfo.license

    let attribution = ''

    /**


     * switch 方法


     * VidSlide AI 功能实现


     */


    switch(source) {
      case 'unsplash':
        attribution = `Photo by ${author.name} on Unsplash`
        break
      case 'pexels':
        attribution = `Photo by ${author.name} on Pexels`
        break
      default:
        attribution = `© ${author.name}`
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(license.name) {
          attribution += ` (${license.name})`
        }
    }

    return attribution
  }

  /**
   * 检查是否可以用于特定用途
   * @param {Object} license - 许可证对象
   * @param {string} usage - 使用用途 (commercial, personal, web, print)
   * @returns {boolean} 是否允许
   */
  /**

   * canUseFor 方法

   * VidSlide AI 功能实现

   */

  canUseFor(license, usage) {
    if (!license) return false

    /**


     * switch 方法


     * VidSlide AI 功能实现


     */


    switch(usage) {
      case 'commercial':
        return license.commercial
      case 'personal':
        return license.private
      case 'web':
        return license.redistribution
      case 'print':
        return license.redistribution
      case 'modification':
        return license.modification
      default:
        return false
    }
  }

  /**
   * 获取版权风险等级
   * @param {Object} copyrightInfo - 版权信息
   * @returns {string} 风险等级 (low, medium, high, critical)
   */
  /**

   * getRiskLevel 方法

   * VidSlide AI 功能实现

   */

  getRiskLevel(copyrightInfo) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(copyrightInfo.status === 'error') {
      return 'critical'
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(copyrightInfo.status === 'unknown') {
      return 'high'
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(copyrightInfo.warnings.length > 2) {
      return 'high'
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(copyrightInfo.warnings.length > 0) {
      return 'medium'
    }

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(copyrightInfo.isSafe) {
      return 'low'
    }

    return 'medium'
  }

  /**
   * 验证素材是否可以安全使用
   * @param {Object} asset - 素材对象
   * @param {string} intendedUse - 预期用途
   * @returns {Promise<Object>} 验证结果
   */
  async /**
  * validateAssetUsage 方法
  * VidSlide AI 功能实现
  */
 validateAssetUsage(asset, intendedUse = 'commercial') {
    const copyrightInfo = await this.checkCopyright(asset)

    const validation = {
      assetId: asset.id,
      canUse: false,
      riskLevel: this.getRiskLevel(copyrightInfo),
      issues: [],
      requirements: []
    }

    // 检查基本使用许可
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(!copyrightInfo.isSafe) {
      validation.issues.push('素材可能存在版权风险')
    }

    // 检查特定用途
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(copyrightInfo.license) {
      const canUseForIntended = this.canUseFor(copyrightInfo.license, intendedUse)
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(!canUseForIntended) {
        const useTypeText = intendedUse === 'commercial' ? '商业' : intendedUse
        validation.issues.push(`此许可证不允许${useTypeText}使用`)
      }

      // 检查署名要求
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(copyrightInfo.license.attribution) {
        validation.requirements.push('使用时必须署名原作者')
        validation.attributionText = this.generateAttributionText(asset, copyrightInfo)
      }

      // 检查修改限制
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(!copyrightInfo.license.modification) {
        validation.requirements.push('不得修改原作品')
      }
    }

    // 添加警告信息（警告不阻止使用，只需要注意）
    validation.warnings = copyrightInfo.warnings
    validation.requirements.push(...copyrightInfo.recommendations)

    // 确定最终是否可以使用（只检查真正的阻止性问题）
    validation.canUse = copyrightInfo.isSafe

    return validation
  }

  /**
   * 从缓存获取数据
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存的数据
   */
  /**

   * getFromCache 方法

   * VidSlide AI 功能实现

   */

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {Object} data - 要缓存的数据
   */
  /**

   * setCache 方法

   * VidSlide AI 功能实现

   */

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除缓存
   */
  /**

   * clearCache 方法

   * VidSlide AI 功能实现

   */

  clearCache() {
    this.cache.clear()
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  /**

   * getCacheStats 方法

   * VidSlide AI 功能实现

   */

  getCacheStats() {
    return {
      size: this.cache.size,
      expiryTime: this.cacheExpiry
    }
  }
}

export default CopyrightChecker
