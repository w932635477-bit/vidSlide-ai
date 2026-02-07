/**
 * 认证状态管理 Store
 * 管理用户登录状态、token 和用户信息
 * 改进版：支持持久化登录、更好的错误处理
 */

import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'http://localhost:3002/api/auth'

// 本地存储键
const STORAGE_KEYS = {
  TOKEN: 'vidslide_token',
  USER: 'vidslide_user',
  REMEMBER_ME: 'vidslide_remember_me'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
    isLoading: false,
    error: null,
    initialized: false,
    rememberMe: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || 'false')
  }),

  getters: {
    /**
     * 是否已认证
     */
    isAuthenticated: state => !!state.token && !!state.user,

    /**
     * 当前用户
     */
    currentUser: state => state.user,

    /**
     * 用户名（显示用）
     */
    displayName: state => {
      if (!state.user) return '游客'
      return state.user.username || state.user.email?.split('@')[0] || '用户'
    },

    /**
     * 用户头像
     */
    avatarUrl: state => {
      if (!state.user?.avatar_url) {
        // 默认头像（使用首字母）
        const name = state.user?.username || state.user?.email || 'U'
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=0A84FF&color=fff&size=128`
      }
      return state.user.avatar_url
    }
  },

  actions: {
    /**
     * 初始化认证状态
     * 在应用启动时调用，尝试从本地存储恢复用户信息
     */
    async initialize() {
      if (this.initialized) return

      // 从 localStorage 恢复用户信息
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const savedRememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME)

      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser)
        } catch {
          this.user = null
        }
      }

      if (savedRememberMe) {
        try {
          this.rememberMe = JSON.parse(savedRememberMe)
        } catch {
          this.rememberMe = false
        }
      }

      // 如果有 token，验证有效性
      if (savedToken && this.user) {
        this.token = savedToken
        try {
          // 尝试验证 token 是否仍然有效
          await this.fetchCurrentUser()
        } catch (err) {
          // Token 无效，清除本地数据
          console.log('Token 验证失败，清除本地数据')
          this.clearLocalData()
        }
      }

      this.initialized = true
    },

    /**
     * 用户登录（改进版：带重试机制）
     */
    async login(email, password, rememberMe = false) {
      this.isLoading = true
      this.error = null

      // 创建 axios 实例，配置超时和重试
      const axiosInstance = axios.create({
        timeout: 15000, // 15秒超时
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // 重试配置
      const maxRetries = 3
      let lastError = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`登录尝试 ${attempt}/${maxRetries}...`)

          const { data } = await axiosInstance.post(`${API_BASE}/login`, {
            email,
            password
          })

          if (data.success && data.token) {
            // 登录成功
            this.token = data.token
            this.user = data.user
            this.rememberMe = rememberMe

            // 持久化到 localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
            localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(rememberMe))

            // 配置 axios 默认请求头
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            console.log('登录成功:', data.user)
            return { success: true, user: data.user }
          } else {
            throw new Error(data.message || '登录失败，服务器返回异常')
          }
        } catch (err) {
          lastError = err

          // 网络错误或超时，尝试重试
          if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED' || !err.response) {
            if (attempt < maxRetries) {
              console.log(`连接失败，${2000}ms 后重试...`)
              await new Promise(resolve => setTimeout(resolve, 2000))
              continue
            }
          }

          // 服务器返回的错误（4xx, 5xx），不重试
          if (err.response) {
            break
          }
        }
      }

      // 所有尝试都失败
      const message = lastError?.response?.data?.message ||
                     lastError?.message ||
                     '登录失败，请检查网络连接或稍后重试'

      this.error = message
      throw new Error(message)
    },

    /**
     * 用户注册
     */
    async register(email, password, username = null) {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await axios.post(`${API_BASE}/register`, {
          email,
          password,
          username
        })

        if (data.success) {
          return { success: true, user: data.user }
        } else {
          throw new Error(data.message || '注册失败')
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || '注册失败'
        this.error = message
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 清除本地存储数据
     */
    clearLocalData() {
      this.token = null
      this.user = null
      this.rememberMe = false
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
      delete axios.defaults.headers.common['Authorization']
    },

    /**
     * 用户登出
     */
    async logout() {
      try {
        if (this.token) {
          await axios.post(
            `${API_BASE}/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${this.token}` },
              timeout: 5000
            }
          )
        }
      } catch {
        // 忽略登出 API 错误，继续清除本地数据
        console.log('登出 API 调用失败，继续清除本地数据')
      }

      this.clearLocalData()
    },

    /**
     * 获取当前用户信息（改进版）
     */
    async fetchCurrentUser() {
      if (!this.token) {
        throw new Error('未登录')
      }

      try {
        const { data } = await axios.get(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${this.token}` },
          timeout: 10000
        })

        if (data.success && data.user) {
          this.user = data.user
          // 同步到 localStorage
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
          return data.user
        } else {
          throw new Error(data.message || '获取用户信息失败')
        }
      } catch (err) {
        // Token 可能已过期
        if (err.response?.status === 401) {
          this.clearLocalData()
        }
        throw err
      }
    },

    /**
     * 更新用户资料
     */
    async updateProfile(updates) {
      if (!this.token) {
        throw new Error('未登录')
      }

      this.isLoading = true
      this.error = null

      try {
        const { data } = await axios.put(`${API_BASE}/profile`, updates, {
          headers: { Authorization: `Bearer ${this.token}` },
          timeout: 10000
        })

        if (data.success) {
          this.user = { ...this.user, ...data.user }
          // 同步到 localStorage
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user))
          return { success: true, user: this.user }
        } else {
          throw new Error(data.message || '更新失败')
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || '更新失败'
        this.error = message
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 修改密码
     */
    async changePassword(currentPassword, newPassword) {
      if (!this.token) {
        throw new Error('未登录')
      }

      this.isLoading = true
      this.error = null

      try {
        const { data } = await axios.post(
          `${API_BASE}/change-password`,
          {
            currentPassword,
            newPassword
          },
          {
            headers: { Authorization: `Bearer ${this.token}` },
            timeout: 10000
          }
        )

        if (data.success) {
          return { success: true }
        } else {
          throw new Error(data.message || '修改密码失败')
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || '修改密码失败'
        this.error = message
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 清除错误
     */
    clearError() {
      this.error = null
    }
  }
})
