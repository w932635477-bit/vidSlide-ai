/**
 * 精选素材服务
 * 负责管理和提供精选素材配方库
 */

import CacheService from './CacheService.js'
import {
  findRecipe,
  searchRecipes,
  searchRecipesByKeyword,
  getRecommendedRecipes,
  getAllRecipes,
  getRecipeStats
} from '../data/curatedMaterialRecipes.js'

class CuratedService {
  constructor() {
    this.cacheService = CacheService
    this.stats = {
      curatedRequests: 0,
      cacheHits: 0,
      apiCalls: 0
    }
  }

  /**
   * 获取精选素材（使用配方）
   * @param {string} recipeId - 配方ID
   * @param {Function} searchMaterials - 搜索素材函数
   * @returns {Promise<Object>} 素材对象
   */
  async getCuratedMaterial(recipeId, searchMaterials) {
    this.stats.curatedRequests++

    const recipe = findRecipe(recipeId)
    if (!recipe) {
      throw new Error(`配方不存在: ${recipeId}`)
    }

    console.log(`💎 获取精选素材: ${recipe.name}`)

    // 1. 先查SmartCache
    const cached = await this.cacheService.searchCache(recipe.searchQuery, {
      limit: 1
    })

    if (cached.length > 0) {
      console.log(`💾 使用缓存的精选素材: ${recipe.name}`)
      this.stats.cacheHits++
      return {
        ...cached[0],
        recipe: recipe,
        isCurated: true,
        source: 'cache'
      }
    }

    // 2. 使用配方从外部API获取
    console.log(`🔍 使用配方获取素材: ${recipe.name}`)
    this.stats.apiCalls++

    const results = await searchMaterials(recipe.searchQuery, {
      limit: 5,
      platforms: recipe.platforms,
      filters: recipe.filters
    })

    if (results.materials.length === 0) {
      throw new Error(`未找到符合配方的素材: ${recipe.name}`)
    }

    // 3. 返回最佳匹配
    return {
      ...results.materials[0],
      recipe: recipe,
      isCurated: true,
      source: results.source
    }
  }

  /**
   * 获取推荐的精选素材
   * @param {Object} context - 上下文信息
   * @param {number} limit - 返回数量限制
   * @param {Function} searchMaterials - 搜索素材函数
   * @returns {Promise<Array>} 精选素材数组
   */
  async getRecommendedCuratedMaterials(context, limit, searchMaterials) {
    console.log('💎 获取推荐的精选素材...')

    const recipes = getRecommendedRecipes(context)
    const materials = []

    for (const recipe of recipes.slice(0, limit)) {
      try {
        const material = await this.getCuratedMaterial(recipe.id, searchMaterials)
        materials.push(material)
      } catch (error) {
        console.warn(`获取精选素材失败: ${recipe.name}`, error)
      }
    }

    console.log(`✅ 获取到 ${materials.length} 个精选素材`)
    return materials
  }

  /**
   * 浏览精选素材库
   * @param {string|null} category - 类别名称（可选）
   * @returns {Array} 配方数组
   */
  browseCuratedLibrary(category = null) {
    if (category) {
      const allRecipes = getAllRecipes()
      return allRecipes[category] || []
    }

    // 返回所有配方
    const allRecipes = getAllRecipes()
    const result = []
    for (const [cat, recipes] of Object.entries(allRecipes)) {
      result.push(...recipes.map(r => ({ ...r, category: cat })))
    }

    return result
  }

  /**
   * 搜索精选配方
   * @param {string} keyword - 搜索关键词
   * @returns {Array} 匹配的配方数组
   */
  searchCuratedRecipes(keyword) {
    return searchRecipesByKeyword(keyword)
  }

  /**
   * 按标签搜索配方
   * @param {Array<string>} tags - 标签数组
   * @returns {Array} 匹配的配方数组
   */
  searchRecipesByTags(tags) {
    return searchRecipes(tags)
  }

  /**
   * 获取配方库统计信息
   * @returns {Object} 统计信息
   */
  getCuratedLibraryStats() {
    return getRecipeStats()
  }

  /**
   * 批量获取精选素材（按配方ID列表）
   * @param {Array<string>} recipeIds - 配方ID数组
   * @param {Function} searchMaterials - 搜索素材函数
   * @returns {Promise<Array>} 素材数组
   */
  async getCuratedMaterialsBatch(recipeIds, searchMaterials) {
    console.log(`💎 批量获取 ${recipeIds.length} 个精选素材...`)

    const materials = []
    for (const recipeId of recipeIds) {
      try {
        const material = await this.getCuratedMaterial(recipeId, searchMaterials)
        materials.push(material)
      } catch (error) {
        console.warn(`获取精选素材失败: ${recipeId}`, error)
      }
    }

    console.log(`✅ 成功获取 ${materials.length}/${recipeIds.length} 个精选素材`)
    return materials
  }

  /**
   * 获取精选服务统计
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheHitRate:
        this.stats.curatedRequests > 0 ? this.stats.cacheHits / this.stats.curatedRequests : 0,
      apiCallRate:
        this.stats.curatedRequests > 0 ? this.stats.apiCalls / this.stats.curatedRequests : 0
    }
  }
}

// 导出单例实例
export default new CuratedService()
