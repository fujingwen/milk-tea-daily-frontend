import { FOOD_RECOMMENDATIONS, MEAL_TYPES } from './constants'

/**
 * 食物推荐服务
 */
class FoodService {
  /**
   * 根据餐次获取推荐食物
   * @param {string} mealType 餐次类型
   * @returns {Array} 食物列表
   */
  getFoodsByMeal(mealType) {
    return FOOD_RECOMMENDATIONS[mealType] || []
  }

  /**
   * 获取随机食物
   * @param {string} mealType 餐次类型
   * @returns {string} 随机食物名称
   */
  getRandomFood(mealType) {
    const foods = this.getFoodsByMeal(mealType)
    if (foods.length === 0) return ''

    const randomIndex = Math.floor(Math.random() * foods.length)
    return foods[randomIndex]
  }

  /**
   * 获取转盘食物列表（限制数量）
   * @param {string} mealType 餐次类型
   * @param {number} count 数量限制
   * @returns {Array} 食物列表
   */
  getWheelFoods(mealType, count = 8) {
    const foods = this.getFoodsByMeal(mealType)
    return foods.slice(0, count)
  }

  /**
   * 根据当前时间推荐餐次
   * @returns {string} 推荐的餐次类型
   */
  getRecommendedMealType() {
    const hour = new Date().getHours()

    if (hour >= 6 && hour < 10) {
      return 'breakfast'
    } else if (hour >= 10 && hour < 14) {
      return 'lunch'
    } else if (hour >= 14 && hour < 18) {
      return 'snack'
    } else {
      return 'dinner'
    }
  }

  /**
   * 获取餐次信息
   * @param {string} mealType 餐次类型
   * @returns {Object} 餐次信息
   */
  getMealInfo(mealType) {
    return MEAL_TYPES.find(meal => meal.value === mealType) || {
      value: mealType,
      label: '未知',
      emoji: '🍽️'
    }
  }

  /**
   * 搜索食物
   * @param {string} keyword 关键词
   * @param {string} mealType 餐次类型（可选）
   * @returns {Array} 匹配的食物列表
   */
  searchFoods(keyword, mealType = null) {
    let allFoods = []

    if (mealType) {
      allFoods = this.getFoodsByMeal(mealType)
    } else {
      // 搜索所有餐次的食物
      Object.values(FOOD_RECOMMENDATIONS).forEach(foods => {
        allFoods = allFoods.concat(foods)
      })
    }

    // 去重
    allFoods = [...new Set(allFoods)]

    // 搜索匹配
    return allFoods.filter(food =>
      food.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * 获取食物表情符号
   * @param {string} foodName 食物名称
   * @returns {string} 表情符号
   */
  getFoodEmoji(foodName) {
    const emojiMap = {
      '火锅': '🍲', '烧烤': '🍖', '寿司': '🍣', '拉面': '🍜',
      '汉堡': '🍔', '披萨': '🍕', '意大利面': '🍝', '牛排': '🥩',
      '炸鸡': '🍗', '薯条': '🍟', '三明治': '🥪', '沙拉': '🥗',
      '包子': '🥟', '饺子': '🥟', '面条': '🍜', '米饭': '🍚',
      '粥': '🍚', '豆浆': '🥛', '油条': '🥖', '煎饼': '🥞',
      '蛋糕': '🍰', '冰淇淋': '🍦', '奶茶': '🧋', '咖啡': '☕'
    }

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (foodName.includes(key)) return emoji
    }

    return '🍽️'
  }

  /**
   * 生成食物统计
   * @param {Array} foodRecords 食物记录列表
   * @returns {Object} 统计信息
   */
  generateFoodStats(foodRecords) {
    const stats = {
      totalCount: foodRecords.length,
      mealTypeStats: {},
      favoriteFood: '',
      averageRating: 0,
      totalSpent: 0
    }

    if (foodRecords.length === 0) return stats

    // 餐次统计
    const mealCounts = {}
    const foodCounts = {}
    let totalRating = 0
    let ratingCount = 0

    foodRecords.forEach(record => {
      // 餐次统计
      mealCounts[record.mealType] = (mealCounts[record.mealType] || 0) + 1

      // 食物统计
      foodCounts[record.foodName] = (foodCounts[record.foodName] || 0) + 1

      // 评分统计
      if (record.rating) {
        totalRating += record.rating
        ratingCount++
      }

      // 消费统计
      if (record.price) {
        stats.totalSpent += parseFloat(record.price) || 0
      }
    })

    // 餐次统计
    stats.mealTypeStats = mealCounts

    // 最喜欢的食物
    let maxCount = 0
    for (const [food, count] of Object.entries(foodCounts)) {
      if (count > maxCount) {
        maxCount = count
        stats.favoriteFood = food
      }
    }

    // 平均评分
    if (ratingCount > 0) {
      stats.averageRating = (totalRating / ratingCount).toFixed(1)
    }

    return stats
  }
}

export default new FoodService()