/**
 * 离线支持服务
 *
 * 功能：
 * - 网络状态检测
 * - 离线时自动使用缓存
 * - 网络恢复时自动切换
 * - 离线提示
 */

class OfflineSupport {
  constructor() {
    this.isOnline = navigator.onLine
    this.listeners = []
    this.offlineStartTime = null
    this.isInitialized = false

    // 统计信息
    this.stats = {
      offlineCount: 0,
      totalOfflineTime: 0,
      lastOfflineTime: null,
      cacheHitsWhileOffline: 0
    }
  }

  /**
   * 初始化离线支持
   */
  initialize() {
    if (this.isInitialized) {
      return
    }

    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // 定期检查网络状态（作为备用）
    setInterval(() => {
      this.checkNetworkStatus()
    }, 30000) // 每30秒检查一次

    this.isInitialized = true
    console.log('✅ 离线支持已初始化')
    console.log(`📡 当前网络状态: ${this.isOnline ? '在线' : '离线'}`)
  }

  /**
   * 处理网络恢复
   */
  handleOnline() {
    console.log('✅ 网络已连接')

    // 计算离线时长
    if (this.offlineStartTime) {
      const offlineDuration = Date.now() - this.offlineStartTime
      this.stats.totalOfflineTime += offlineDuration
      this.offlineStartTime = null

      const minutes = Math.floor(offlineDuration / 60000)
      const seconds = Math.floor((offlineDuration % 60000) / 1000)
      console.log(`📊 离线时长: ${minutes}分${seconds}秒`)
    }

    this.isOnline = true

    // 通知所有监听器
    this.notifyListeners('online')

    // 显示提示
    this.showNotification('网络已恢复', 'success')
  }

  /**
   * 处理网络断开
   */
  handleOffline() {
    console.log('⚠️ 网络已断开，切换到离线模式')

    this.isOnline = false
    this.offlineStartTime = Date.now()
    this.stats.offlineCount++
    this.stats.lastOfflineTime = this.offlineStartTime

    // 通知所有监听器
    this.notifyListeners('offline')

    // 显示提示
    this.showNotification('网络已断开，将使用缓存素材', 'warning')
  }

  /**
   * 检查网络状态（备用方法）
   */
  async checkNetworkStatus() {
    // 使用 navigator.onLine 作为主要检测方式
    // 不再使用外部URL请求，避免CSP违规
    const currentOnlineStatus = navigator.onLine

    const wasOffline = !this.isOnline
    const wasOnline = this.isOnline

    // 更新状态
    this.isOnline = currentOnlineStatus

    // 如果之前是离线状态，现在恢复了
    if (wasOffline && currentOnlineStatus) {
      this.handleOnline()
    }
    // 如果之前是在线状态，现在断开了
    else if (wasOnline && !currentOnlineStatus) {
      this.handleOffline()
    }
  }

  /**
   * 添加网络状态监听器
   * @param {Function} callback - 回调函数
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback)
    }
  }

  /**
   * 移除网络状态监听器
   * @param {Function} callback - 回调函数
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 通知所有监听器
   * @param {string} status - 网络状态 ('online' | 'offline')
   */
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status, this.isOnline)
      } catch (error) {
        console.error('监听器回调失败:', error)
      }
    })
  }

  /**
   * 显示通知
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 ('success' | 'warning' | 'error')
   */
  showNotification(message, type = 'info') {
    // 如果页面中有Element Plus，使用ElMessage
    if (typeof ElMessage !== 'undefined') {
      ElMessage[type](message)
    } else {
      // 否则使用console
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }

  /**
   * 获取当前网络状态
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      offlineStartTime: this.offlineStartTime,
      currentOfflineDuration: this.offlineStartTime ? Date.now() - this.offlineStartTime : 0
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const totalMinutes = Math.floor(this.stats.totalOfflineTime / 60000)
    const totalSeconds = Math.floor((this.stats.totalOfflineTime % 60000) / 1000)

    return {
      isOnline: this.isOnline,
      offlineCount: this.stats.offlineCount,
      totalOfflineTime: `${totalMinutes}分${totalSeconds}秒`,
      lastOfflineTime: this.stats.lastOfflineTime
        ? new Date(this.stats.lastOfflineTime).toLocaleString()
        : '从未离线',
      cacheHitsWhileOffline: this.stats.cacheHitsWhileOffline
    }
  }

  /**
   * 记录离线期间的缓存命中
   */
  recordCacheHit() {
    if (!this.isOnline) {
      this.stats.cacheHitsWhileOffline++
    }
  }

  /**
   * 判断是否应该使用缓存
   */
  shouldUseCache() {
    return !this.isOnline
  }

  /**
   * 判断是否可以使用外部API
   */
  canUseExternalAPI() {
    return this.isOnline
  }

  /**
   * 获取搜索选项（根据网络状态）
   */
  getSearchOptions() {
    return {
      forceLocal: !this.isOnline,
      enableExternalSearch: this.isOnline
    }
  }
}

// 导出单例实例
export default new OfflineSupport()
