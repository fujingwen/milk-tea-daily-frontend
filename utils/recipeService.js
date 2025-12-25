import { RECIPE_CATEGORIES, DIFFICULTY_LEVELS, MODULE_TYPES } from './constants'

/**
 * 菜谱服务
 */
class RecipeService {
  /**
   * 获取菜谱分类信息
   * @param {string} categoryValue 分类值
   * @returns {Object} 分类信息
   */
  getCategoryInfo(categoryValue) {
    return RECIPE_CATEGORIES.find(cat => cat.value === categoryValue) || {
      value: categoryValue,
      label: '未知分类',
      icon: '🍽️'
    }
  }

  /**
   * 获取难度等级信息
   * @param {string} difficultyValue 难度值
   * @returns {Object} 难度信息
   */
  getDifficultyInfo(difficultyValue) {
    return DIFFICULTY_LEVELS.find(level => level.value === difficultyValue) || {
      value: difficultyValue,
      label: '未知难度',
      color: '#999',
      icon: '⭐'
    }
  }

  /**
   * 验证菜谱数据
   * @param {Object} recipeData 菜谱数据
   * @returns {Object} 验证结果
   */
  validateRecipe(recipeData) {
    const errors = []

    if (!recipeData.recipeName || !recipeData.recipeName.trim()) {
      errors.push('菜谱名称不能为空')
    }

    if (!recipeData.category) {
      errors.push('请选择菜谱分类')
    }

    if (!recipeData.difficulty) {
      errors.push('请选择难度等级')
    }

    if (!recipeData.cookTime) {
      errors.push('请选择烹饪时间')
    }

    if (!recipeData.servings) {
      errors.push('请选择份量')
    }

    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      errors.push('请添加至少一个食材')
    } else {
      // 检查食材是否完整
      recipeData.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || !ingredient.name.trim()) {
          errors.push(`第${index + 1}个食材名称不能为空`)
        }
        if (!ingredient.amount || !ingredient.amount.trim()) {
          errors.push(`第${index + 1}个食材用量不能为空`)
        }
      })
    }

    if (!recipeData.steps || recipeData.steps.length === 0) {
      errors.push('请添加至少一个制作步骤')
    } else {
      // 检查步骤是否完整
      recipeData.steps.forEach((step, index) => {
        if (!step.content || !step.content.trim()) {
          errors.push(`第${index + 1}步制作说明不能为空`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 格式化菜谱数据
   * @param {Object} rawData 原始数据
   * @returns {Object} 格式化后的数据
   */
  formatRecipeData(rawData) {
    return {
      moduleType: MODULE_TYPES.RECIPE,
      recipeName: rawData.recipeName?.trim() || '',
      category: rawData.category || '',
      difficulty: rawData.difficulty || '',
      cookTime: rawData.cookTime || '',
      servings: rawData.servings || '',
      ingredients: rawData.ingredients || [],
      steps: rawData.steps || [],
      tips: rawData.tips?.trim() || '',
      tags: rawData.tags || [],
      photos: rawData.photos || [],
      createTime: rawData.createTime || Date.now(),
      updateTime: Date.now()
    }
  }

  /**
   * 生成菜谱摘要
   * @param {Object} recipe 菜谱数据
   * @returns {string} 摘要文本
   */
  generateSummary(recipe) {
    const categoryInfo = this.getCategoryInfo(recipe.category)
    const difficultyInfo = this.getDifficultyInfo(recipe.difficulty)

    return `${categoryInfo.icon} ${recipe.recipeName} | ${difficultyInfo.icon} ${difficultyInfo.label} | ⏱️ ${recipe.cookTime}分钟`
  }

  /**
   * 搜索菜谱
   * @param {Array} recipes 菜谱列表
   * @param {string} keyword 搜索关键词
   * @returns {Array} 匹配的菜谱列表
   */
  searchRecipes(recipes, keyword) {
    if (!keyword || !keyword.trim()) {
      return recipes
    }

    const searchTerm = keyword.toLowerCase().trim()

    return recipes.filter(recipe => {
      // 搜索菜谱名称
      if (recipe.recipeName.toLowerCase().includes(searchTerm)) {
        return true
      }

      // 搜索标签
      if (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        return true
      }

      // 搜索食材
      if (recipe.ingredients && recipe.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchTerm)
      )) {
        return true
      }

      // 搜索制作步骤
      if (recipe.steps && recipe.steps.some(step =>
        step.content.toLowerCase().includes(searchTerm)
      )) {
        return true
      }

      return false
    })
  }

  /**
   * 按分类筛选菜谱
   * @param {Array} recipes 菜谱列表
   * @param {string} category 分类
   * @returns {Array} 筛选后的菜谱列表
   */
  filterByCategory(recipes, category) {
    if (!category) {
      return recipes
    }

    return recipes.filter(recipe => recipe.category === category)
  }

  /**
   * 排序菜谱
   * @param {Array} recipes 菜谱列表
   * @param {string} sortBy 排序字段
   * @param {string} direction 排序方向
   * @returns {Array} 排序后的菜谱列表
   */
  sortRecipes(recipes, sortBy = 'time', direction = 'desc') {
    const sortedRecipes = [...recipes]

    sortedRecipes.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'time':
          compareValue = a.createTime - b.createTime
          break
        case 'name':
          compareValue = a.recipeName.localeCompare(b.recipeName)
          break
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
          compareValue = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0)
          break
        case 'cookTime':
          compareValue = parseInt(a.cookTime) - parseInt(b.cookTime)
          break
        default:
          compareValue = 0
      }

      return direction === 'desc' ? -compareValue : compareValue
    })

    return sortedRecipes
  }

  /**
   * 生成菜谱统计信息
   * @param {Array} recipes 菜谱列表
   * @returns {Object} 统计信息
   */
  generateStats(recipes) {
    const stats = {
      totalCount: recipes.length,
      categoryStats: {},
      difficultyStats: {},
      averageCookTime: 0,
      mostUsedIngredients: [],
      popularTags: []
    }

    if (recipes.length === 0) {
      return stats
    }

    // 分类统计
    const categoryCount = {}
    const difficultyCount = {}
    const ingredientCount = {}
    const tagCount = {}
    let totalCookTime = 0

    recipes.forEach(recipe => {
      // 分类统计
      categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1

      // 难度统计
      difficultyCount[recipe.difficulty] = (difficultyCount[recipe.difficulty] || 0) + 1

      // 烹饪时间统计
      totalCookTime += parseInt(recipe.cookTime) || 0

      // 食材统计
      if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          ingredientCount[ing.name] = (ingredientCount[ing.name] || 0) + 1
        })
      }

      // 标签统计
      if (recipe.tags) {
        recipe.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    stats.categoryStats = categoryCount
    stats.difficultyStats = difficultyCount
    stats.averageCookTime = Math.round(totalCookTime / recipes.length)

    // 最常用食材（前10个）
    stats.mostUsedIngredients = Object.entries(ingredientCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // 热门标签（前10个）
    stats.popularTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    return stats
  }

  /**
   * 导出菜谱为文本格式
   * @param {Object} recipe 菜谱数据
   * @returns {string} 文本格式的菜谱
   */
  exportToText(recipe) {
    const categoryInfo = this.getCategoryInfo(recipe.category)
    const difficultyInfo = this.getDifficultyInfo(recipe.difficulty)

    let text = `【${recipe.recipeName}】\n\n`
    text += `分类：${categoryInfo.label}\n`
    text += `难度：${difficultyInfo.label}\n`
    text += `时间：${recipe.cookTime}分钟\n`
    text += `份量：${recipe.servings}\n\n`

    if (recipe.tags && recipe.tags.length > 0) {
      text += `标签：${recipe.tags.join('、')}\n\n`
    }

    text += `食材清单：\n`
    recipe.ingredients.forEach(ing => {
      text += `• ${ing.name} ${ing.amount}\n`
    })

    text += `\n制作步骤：\n`
    recipe.steps.forEach((step, index) => {
      text += `${index + 1}. ${step.content}\n`
    })

    if (recipe.tips) {
      text += `\n小贴士：\n${recipe.tips}\n`
    }

    return text
  }
}

export default new RecipeService()