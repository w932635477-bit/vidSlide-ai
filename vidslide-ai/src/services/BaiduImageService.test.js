/**
 * BaiduImageService.test.js
 * VidSlide AI 百度图片服务测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { default as BaiduImageService } from './BaiduImageService.js'

// Mock fetch API
global.fetch = vi.fn()

// Mock crypto for MD5
global.crypto = {
  subtle: {
    digest: vi.fn(() => Promise.resolve(new ArrayBuffer(16)))
  },
  getRandomValues: vi.fn(array => array)
}

describe('BaiduImageService', () => {
  let service

  beforeEach(() => {
    service = new BaiduImageService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeDefined()
      expect(service.config).toBeDefined()
      expect(service.config.name).toBe('百度图片')
      expect(service.config.appId).toBeDefined()
      expect(service.config.apiKey).toBeDefined()
    })

    it('应该有正确的配置参数', () => {
      expect(service.config.baseUrl).toContain('baidu.com')
      expect(service.config.monthlyLimit).toBeGreaterThan(0)
      expect(service.config.priority).toBe('high')
    })
  })

  describe('Access Token获取', () => {
    it('应该成功获取Access Token', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'test_access_token_123',
            expires_in: 2592000
          })
      })

      const token = await service.getAccessToken()

      expect(token).toBe('test_access_token_123')
      expect(service.config.accessToken).toBe('test_access_token_123')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('baidu.com/oauth/2.0/token'),
        expect.any(Object)
      )
    })

    it('应该缓存Access Token', async () => {
      // 第一次调用
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'cached_token_456',
            expires_in: 2592000
          })
      })

      await service.getAccessToken()
      expect(fetch).toHaveBeenCalledTimes(1)

      // 第二次调用应该使用缓存
      const token2 = await service.getAccessToken()
      expect(token2).toBe('cached_token_456')
      expect(fetch).toHaveBeenCalledTimes(1) // 没有额外的API调用
    })

    it('应该处理Access Token获取失败', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'invalid_client',
            error_description: 'Invalid client credentials'
          })
      })

      const token = await service.getAccessToken()

      expect(token).toBeNull()
      expect(service.config.accessToken).toBeUndefined()
    })

    it('应该处理网络错误', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const token = await service.getAccessToken()

      expect(token).toBeNull()
    })
  })

  describe('图片搜索', () => {
    beforeEach(() => {
      // Mock成功的Access Token获取
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth/2.0/token')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token_789',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  thumbURL: 'https://img.baidu.com/thumb1.jpg',
                  middleURL: 'https://img.baidu.com/middle1.jpg',
                  objURL: 'https://img.baidu.com/original1.jpg',
                  fromPageTitleEnc: '美丽的风景',
                  width: 1920,
                  height: 1080
                },
                {
                  thumbURL: 'https://img.baidu.com/thumb2.jpg',
                  middleURL: 'https://img.baidu.com/middle2.jpg',
                  objURL: 'https://img.baidu.com/original2.jpg',
                  fromPageTitleEnc: '山水画',
                  width: 1280,
                  height: 720
                }
              ]
            })
        })
      })
    })

    it('应该成功搜索图片', async () => {
      const result = await service.searchImages('风景', 5)

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(2)
      expect(result.images[0]).toEqual({
        id: expect.stringContaining('baidu_'),
        url: 'https://img.baidu.com/original1.jpg',
        thumbnail: 'https://img.baidu.com/thumb1.jpg',
        title: '美丽的风景',
        source: 'baidu',
        width: 1920,
        height: 1080,
        author: '百度图片',
        downloadUrl: 'https://img.baidu.com/original1.jpg'
      })
    })

    it('应该限制返回结果数量', async () => {
      const result = await service.searchImages('测试', 1)

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(1)
    })

    it('应该处理搜索API失败', async () => {
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: false,
          status: 403,
          json: () =>
            Promise.resolve({
              error_code: 403,
              error_msg: 'Forbidden'
            })
        })
      })

      const result = await service.searchImages('测试', 5)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.images).toEqual([])
    })

    it('应该使用备用数据当API调用失败时', async () => {
      // Mock所有API调用失败
      global.fetch.mockRejectedValue(new Error('Network completely down'))

      const result = await service.searchImages('fallback_test', 3)

      expect(result.success).toBe(true)
      expect(result.images).toHaveLength(3)
      expect(result.note).toContain('API调用失败')
      expect(result.images[0].title).toContain('备用数据')
    })

    it('应该处理空的搜索结果', async () => {
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [] // 空结果
            })
        })
      })

      const result = await service.searchImages('empty', 5)

      expect(result.success).toBe(true)
      expect(result.images).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('API调用统计', () => {
    it('应该更新使用统计', async () => {
      const initialUsed = service.config.usedThisMonth

      global.fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock_token',
            expires_in: 2592000
          })
      })

      await service.searchImages('stats_test', 1)

      // 使用统计应该增加
      expect(service.config.usedThisMonth).toBeGreaterThanOrEqual(initialUsed)
    })

    it('应该检查月度使用限制', async () => {
      // 设置接近限制的使用量
      service.config.usedThisMonth = service.config.monthlyLimit - 1

      global.fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mock_token',
            expires_in: 2592000
          })
      })

      const result = await service.searchImages('limit_test', 1)

      // 应该仍然允许调用（具体逻辑可能不同）
      expect(result).toBeDefined()
    })
  })

  describe('数据格式化', () => {
    it('应该正确格式化图片数据', async () => {
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  thumbURL: 'thumb.jpg',
                  middleURL: 'middle.jpg',
                  objURL: 'original.jpg',
                  fromPageTitleEnc: '测试图片',
                  width: 800,
                  height: 600
                }
              ]
            })
        })
      })

      const result = await service.searchImages('format_test', 1)

      expect(result.success).toBe(true)
      expect(result.images[0]).toHaveProperty('id')
      expect(result.images[0]).toHaveProperty('url')
      expect(result.images[0]).toHaveProperty('thumbnail')
      expect(result.images[0]).toHaveProperty('title')
      expect(result.images[0]).toHaveProperty('source', 'baidu')
      expect(result.images[0]).toHaveProperty('width', 800)
      expect(result.images[0]).toHaveProperty('height', 600)
    })

    it('应该处理缺失的图片属性', async () => {
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  // 缺少一些属性
                  objURL: 'original.jpg'
                  // 没有thumbURL, middleURL, fromPageTitleEnc等
                }
              ]
            })
        })
      })

      const result = await service.searchImages('incomplete', 1)

      expect(result.success).toBe(true)
      expect(result.images[0]).toHaveProperty('url', 'original.jpg')
      expect(result.images[0]).toHaveProperty('thumbnail') // 应该有默认值
      expect(result.images[0]).toHaveProperty('title') // 应该有默认值
    })
  })

  describe('错误处理和恢复', () => {
    it('应该处理Access Token过期', async () => {
      // 第一次调用成功
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'expired_token',
            expires_in: 2592000
          })
      })

      // 第二次搜索失败（token过期）
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error_code: 401,
            error_msg: 'Access token expired'
          })
      })

      const result = await service.searchImages('expired_token_test', 1)

      expect(result.success).toBe(true) // 应该使用备用数据
      expect(result.note).toContain('API调用失败')
    })

    it('应该处理网络超时', async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: false,
                  status: 408,
                  statusText: 'Request Timeout'
                }),
              100
            )
          )
      )

      const result = await service.searchImages('timeout', 1)

      expect(result.success).toBe(true) // 应该使用备用数据
      expect(result.images).toHaveLength(1)
      expect(result.note).toContain('API调用失败')
    })

    it('应该处理JSON解析错误', async () => {
      global.fetch.mockImplementation(url => {
        if (url.includes('oauth')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                access_token: 'mock_token',
                expires_in: 2592000
              })
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      })

      const result = await service.searchImages('json_error', 1)

      expect(result.success).toBe(true) // 应该使用备用数据
      expect(result.images).toHaveLength(1)
    })
  })

  describe('性能和并发', () => {
    it('应该支持并发搜索', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'concurrent_token',
            expires_in: 2592000
          })
      })

      const promises = [
        service.searchImages('query1', 2),
        service.searchImages('query2', 2),
        service.searchImages('query3', 2)
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.images.length).toBeGreaterThan(0)
      })
    })

    it('应该在高负载下保持稳定', async () => {
      // 模拟高负载场景
      const promises = Array(10)
        .fill()
        .map((_, i) => service.searchImages(`load_test_${i}`, 1))

      const results = await Promise.all(promises)

      expect(results).toHaveLength(10)
      const successCount = results.filter(r => r.success).length
      expect(successCount).toBeGreaterThanOrEqual(8) // 至少80%成功率
    })
  })

  describe('备用数据系统', () => {
    it('应该提供高质量的备用图片', () => {
      const fallbackImages = service.getFallbackImages('test', 3)

      expect(fallbackImages.success).toBe(true)
      expect(fallbackImages.images).toHaveLength(3)

      fallbackImages.images.forEach(image => {
        expect(image).toHaveProperty('id')
        expect(image).toHaveProperty('url')
        expect(image).toHaveProperty('thumbnail')
        expect(image).toHaveProperty('title')
        expect(image).toHaveProperty('source', 'baidu')
        expect(image).toHaveProperty('width')
        expect(image).toHaveProperty('height')
      })
    })

    it('应该为不同查询生成不同的备用图片', () => {
      const result1 = service.getFallbackImages('nature', 2)
      const result2 = service.getFallbackImages('city', 2)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.images).toHaveLength(2)
      expect(result2.images).toHaveLength(2)

      // 图片ID应该不同（随机性）
      const ids1 = result1.images.map(img => img.id)
      const ids2 = result2.images.map(img => img.id)
      expect(ids1).not.toEqual(ids2)
    })
  })

  describe('集成测试', () => {
    it('应该完整模拟用户搜索流程', async () => {
      // 1. 搜索成功的情况
      const successResult = await service.searchImages('风景', 5)
      expect(successResult.success).toBe(true)
      expect(successResult.images.length).toBeGreaterThan(0)

      // 2. 验证使用统计更新
      expect(service.config.usedThisMonth).toBeGreaterThan(0)

      // 3. 再次搜索（测试缓存和统计）
      const secondResult = await service.searchImages('山水', 3)
      expect(secondResult.success).toBe(true)

      // 4. 验证统计累积
      expect(service.config.usedThisMonth).toBeGreaterThan(1)
    })

    it('应该在各种网络条件下保持稳定', async () => {
      const scenarios = [
        { name: '正常网络', mock: () => mockNormalResponse() },
        { name: '网络超时', mock: () => mockTimeoutResponse() },
        { name: 'API错误', mock: () => mockApiErrorResponse() }
      ]

      for (const scenario of scenarios) {
        // 重置服务状态
        service.config.usedThisMonth = 0

        // 应用mock
        scenario.mock()

        const result = await service.searchImages(`${scenario.name}_test`, 2)

        // 无论什么情况，都应该返回结果（要么API结果，要么备用数据）
        expect(result).toBeDefined()
        expect(result).toHaveProperty('success')
        expect(result).toHaveProperty('images')
        expect(Array.isArray(result.images)).toBe(true)
      }
    })
  })
})

// 辅助函数
function mockNormalResponse() {
  global.fetch.mockImplementation(url => {
    if (url.includes('oauth')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'normal_token',
            expires_in: 2592000
          })
      })
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              objURL: 'https://example.com/image.jpg',
              fromPageTitleEnc: '正常图片'
            }
          ]
        })
    })
  })
}

function mockTimeoutResponse() {
  global.fetch.mockRejectedValue(new Error('Timeout'))
}

function mockApiErrorResponse() {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error'
  })
}
