/**
 * VidSlide AI - 版权检查模块单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CopyrightChecker } from './CopyrightChecker.js'

describe('CopyrightChecker', () => {
  let checker

  beforeEach(() => {
    checker = new CopyrightChecker()
  })

  afterEach(() => {
    checker.clearCache()
  })

  describe('初始化', () => {
    it('应该正确初始化版权检查器', () => {
      expect(checker.licenseDatabase).toBeDefined()
      expect(checker.cache).toBeDefined()
      expect(checker.cacheExpiry).toBeGreaterThan(0)
    })

    it('应该包含预定义的许可证数据库', () => {
      expect(checker.licenseDatabase['Unsplash License']).toBeDefined()
      expect(checker.licenseDatabase['CC BY']).toBeDefined()
      expect(checker.licenseDatabase['All Rights Reserved']).toBeDefined()
    })
  })

  describe('版权检查', () => {
    it('应该识别Unsplash免费许可证', async () => {
      try {
        const asset = {
          id: 'unsplash_test',
          source: 'unsplash',
          name: '测试图片'
        }

        const result = await checker.checkCopyright(asset)

        expect(result.status).toBe('free')
        expect(result.isSafe).toBe(true)
        expect(result.license.name).toBe('Unsplash License')
        expect(result.warnings).toEqual(['使用时需要署名原作者'])
      } catch (error) {
        console.error('应该识别Unsplash免费许可证 test failed:', error)
        throw error
      }
    })

    it('应该识别Pexels免费许可证', async () => {
      try {
        const asset = {
          id: 'pexels_test',
          source: 'pexels',
          name: '测试图片'
        }

        const result = await checker.checkCopyright(asset)

        expect(result.status).toBe('free')
        expect(result.isSafe).toBe(true)
        expect(result.license.name).toBe('Pexels License')
      } catch (error) {
        console.error('应该识别Pexels免费许可证 test failed:', error)
        throw error
      }
    })

    it('应该识别已知的许可证类型', async () => {
      try {
        const asset = {
          id: 'test_asset',
          name: '测试素材',
          metadata: {
            license: 'CC BY'
          }
        }

        const result = await checker.checkCopyright(asset)

        expect(result.license.name).toBe('Creative Commons Attribution (CC BY)')
        expect(result.status).toBe('cc')
        expect(result.isSafe).toBe(true)
      } catch (error) {
        console.error('应该识别已知的许可证类型 test failed:', error)
        throw error
      }
    })

    it('应该处理未知许可证', async () => {
      try {
        const asset = {
          id: 'test_asset',
          name: '测试素材',
          metadata: {
            license: 'Unknown License 2023'
          }
        }

        const result = await checker.checkCopyright(asset)

        expect(result.status).toBe('unknown')
        expect(result.isSafe).toBe(false)
        expect(result.warnings).toContain('未知许可证类型，建议手动检查')
      } catch (error) {
        console.error('应该处理未知许可证 test failed:', error)
        throw error
      }
    })

    it('应该处理没有许可证信息的素材', async () => {
      try {
        const asset = {
          id: 'test_asset',
          name: '测试素材'
        }

        const result = await checker.checkCopyright(asset)

        expect(result.status).toBe('unknown')
        expect(result.isSafe).toBe(false)
        expect(result.warnings).toContain('缺少许可证信息')
      } catch (error) {
        console.error('应该处理没有许可证信息的素材 test failed:', error)
        throw error
      }
    })

    it('应该使用缓存避免重复检查', async () => {
      try {
        const asset = {
          id: 'cached_asset',
          source: 'unsplash'
        }

        // 第一次检查
        const result1 = await checker.checkCopyright(asset)
        expect(result1.status).toBe('free')

        // 第二次检查（应该使用缓存）
        const result2 = await checker.checkCopyright(asset)
        expect(result2).toEqual(result1)
      } catch (error) {
        console.error('应该使用缓存避免重复检查 test failed:', error)
        throw error
      }
    })
  })

  describe('批量版权检查', () => {
    it('应该批量检查多个素材的版权', async () => {
      try {
        const assets = [
          { id: 'asset1', source: 'unsplash' },
          { id: 'asset2', source: 'pexels' },
          { id: 'asset3', metadata: { license: 'CC BY' } }
        ]

        const results = await checker.checkCopyrightBatch(assets)

        expect(results.length).toBe(3)
        expect(results[0].status).toBe('free')
        expect(results[1].status).toBe('free')
        expect(results[2].license.name).toContain('CC BY')
      } catch (error) {
        console.error('应该批量检查多个素材的版权 test failed:', error)
        throw error
      }
    })

    it('应该处理批量检查中的错误', async () => {
      try {
        const assets = [
          { id: 'asset1', source: 'unsplash' },
          { id: 'asset2', source: 'invalid_source' } // 可能导致错误的源
        ]

        const results = await checker.checkCopyrightBatch(assets)

        expect(results.length).toBe(2)
        expect(results[0].status).toBe('free')
        // 第二个结果应该有错误状态或处理了错误
      } catch (error) {
        console.error('应该处理批量检查中的错误 test failed:', error)
        throw error
      }
    })
  })

  describe('许可证验证', () => {
    it('应该验证许可证是否安全使用', () => {
      const unsplashLicense = checker.licenseDatabase['Unsplash License']
      const ccByLicense = checker.licenseDatabase['CC BY']
      const allRightsReserved = checker.licenseDatabase['All Rights Reserved']

      expect(checker.isLicenseSafeForUse(unsplashLicense)).toBe(true)
      expect(checker.isLicenseSafeForUse(ccByLicense)).toBe(true)
      expect(checker.isLicenseSafeForUse(allRightsReserved)).toBe(false)
    })

    it('应该检查特定用途的许可', () => {
      const commercialLicense = checker.licenseDatabase['Unsplash License']
      const nonCommercialLicense = checker.licenseDatabase['CC BY-NC']

      expect(checker.canUseFor(commercialLicense, 'commercial')).toBe(true)
      expect(checker.canUseFor(nonCommercialLicense, 'commercial')).toBe(false)
      expect(checker.canUseFor(commercialLicense, 'personal')).toBe(true)
      expect(checker.canUseFor(commercialLicense, 'modification')).toBe(true)
    })
  })

  describe('使用场景警告', () => {
    it('应该为商业用途添加警告', async () => {
      try {
        const asset = {
          id: 'test',
          metadata: {
            license: 'CC BY-NC' // 非商业许可证
          }
        }

        const result = await checker.checkCopyright(asset)

        expect(result.warnings).toContain('此许可证不允许商业使用')
        expect(result.isSafe).toBe(false)
      } catch (error) {
        console.error('应该为商业用途添加警告 test failed:', error)
        throw error
      }
    })

    it('应该为署名要求添加警告', async () => {
      try {
        const asset = {
          id: 'test',
          metadata: {
            license: 'CC BY'
          }
        }

        const result = await checker.checkCopyright(asset)

        expect(result.warnings).toContain('使用时需要署名原作者')
      } catch (error) {
        console.error('应该为署名要求添加警告 test failed:', error)
        throw error
      }
    })

    it('应该为肖像作品添加特殊警告', async () => {
      try {
        const asset = {
          id: 'test',
          type: 'image',
          category: 'portrait',
          metadata: {
            license: 'CC BY'
          }
        }

        const result = await checker.checkCopyright(asset)

        expect(result.warnings).toContain('肖像作品请确认获得肖像权许可')
      } catch (error) {
        console.error('应该为肖像作品添加特殊警告 test failed:', error)
        throw error
      }
    })
  })

  describe('风险等级评估', () => {
    it('应该正确评估风险等级', () => {
      const safeResult = {
        status: 'free',
        isSafe: true,
        warnings: []
      }

      const warningResult = {
        status: 'cc',
        isSafe: true,
        warnings: ['需要署名']
      }

      const highRiskResult = {
        status: 'unknown',
        isSafe: false,
        warnings: ['未知许可证']
      }

      const criticalResult = {
        status: 'error',
        isSafe: false,
        warnings: ['检查失败']
      }

      expect(checker.getRiskLevel(safeResult)).toBe('low')
      expect(checker.getRiskLevel(warningResult)).toBe('medium')
      expect(checker.getRiskLevel(highRiskResult)).toBe('high')
      expect(checker.getRiskLevel(criticalResult)).toBe('critical')
    })
  })

  describe('使用验证', () => {
    it('应该验证素材商业使用许可', async () => {
      try {
        const commercialAsset = {
          id: 'commercial',
          source: 'unsplash',
          author: { name: 'Test Author' }
        }

        const nonCommercialAsset = {
          id: 'non_commercial',
          metadata: {
            license: 'CC BY-NC'
          },
          author: { name: 'Test Author 2' }
        }

        const commercialValidation = await checker.validateAssetUsage(commercialAsset, 'commercial')
        const nonCommercialValidation = await checker.validateAssetUsage(
          nonCommercialAsset,
          'commercial'
        )

        expect(commercialValidation.canUse).toBe(true)
        expect(commercialValidation.issues).toEqual([])

        expect(nonCommercialValidation.canUse).toBe(false)
        expect(nonCommercialValidation.issues).toContain('此许可证不允许商业使用')
      } catch (error) {
        console.error('应该验证素材商业使用许可 test failed:', error)
        throw error
      }
    })

    it('应该生成署名文本', () => {
      const unsplashAsset = {
        id: 'unsplash_test',
        source: 'unsplash',
        author: { name: 'Test User' }
      }

      const copyrightInfo = {
        license: { attribution: true }
      }

      const attribution = checker.generateAttributionText(unsplashAsset, copyrightInfo)

      expect(attribution).toContain('Photo by Test User on Unsplash')
    })
  })

  describe('许可证信息查询', () => {
    it('应该获取许可证信息', () => {
      const license = checker.getLicenseInfo('CC BY')

      expect(license).toBeDefined()
      expect(license.name).toContain('CC BY')
      expect(license.commercial).toBe(true)
      expect(license.attribution).toBe(true)
    })

    it('应该返回所有支持的许可证', () => {
      const licenses = checker.getSupportedLicenses()

      expect(Array.isArray(licenses)).toBe(true)
      expect(licenses.length).toBeGreaterThan(0)
      expect(licenses.some(l => l.name.includes('Unsplash'))).toBe(true)
    })

    it('应该返回安全的许可证列表', () => {
      const safeLicenses = checker.getSafeLicenses()

      expect(Array.isArray(safeLicenses)).toBe(true)
      expect(safeLicenses.every(license => checker.isLicenseSafeForUse(license))).toBe(true)
    })
  })

  describe('缓存管理', () => {
    it('应该存储和获取缓存数据', () => {
      const testData = { status: 'free', isSafe: true }
      const key = 'test_copyright_check'

      checker.setCache(key, testData)
      const cached = checker.getFromCache(key)

      expect(cached).toEqual(testData)
    })

    it('应该在过期后清除缓存', () => {
      const testData = { status: 'free' }
      const key = 'test_cache'

      // 设置非常短的过期时间
      checker.cacheExpiry = 0
      checker.setCache(key, testData)

      const cached = checker.getFromCache(key)
      expect(cached).toBeNull()
    })

    it('应该清除所有缓存', () => {
      checker.setCache('key1', 'data1')
      checker.setCache('key2', 'data2')

      expect(checker.cache.size).toBeGreaterThan(0)

      checker.clearCache()

      expect(checker.cache.size).toBe(0)
    })

    it('应该获取缓存统计信息', () => {
      checker.setCache('test', 'data')

      const stats = checker.getCacheStats()

      expect(stats.size).toBe(1)
      expect(stats.expiryTime).toBe(checker.cacheExpiry)
    })
  })

  describe('错误处理', () => {
    it('应该处理检查过程中的错误', async () => {
      try {
        // Mock一个会导致错误的素材
        const problematicAsset = {
          id: 'problematic',
          metadata: null // 可能导致错误
        }

        const result = await checker.checkCopyright(problematicAsset)

        expect(result).toHaveProperty('status')
        expect(result).toHaveProperty('isSafe')
        expect(result).toHaveProperty('warnings')
      } catch (error) {
        console.error('应该处理检查过程中的错误 test failed:', error)
        throw error
      }
    })

    it('应该处理批量检查中的部分失败', async () => {
      try {
        const assets = [
          { id: 'good', source: 'unsplash' },
          { id: 'bad', source: 'invalid' }
        ]

        const results = await checker.checkCopyrightBatch(assets)

        expect(results.length).toBe(2)
        expect(results[0].status).toBe('free')
        // 第二个结果应该被妥善处理
      } catch (error) {
        console.error('应该处理批量检查中的部分失败 test failed:', error)
        throw error
      }
    })
  })
})
