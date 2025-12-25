<template>
  <view class="food-recommend-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">今天吃什么？</text>
      <text class="subtitle">让转盘帮你解决选择困难症</text>
    </view>

    <!-- 餐次选择 -->
    <view class="meal-selector card">
      <view class="selector-title">选择餐次</view>
      <view class="meal-options">
        <view
          v-for="meal in mealTypes"
          :key="meal.value"
          class="meal-option"
          :class="{ active: selectedMeal === meal.value }"
          @click="selectMeal(meal.value)"
        >
          <text class="meal-emoji">{{ meal.emoji }}</text>
          <text class="meal-label">{{ meal.label }}</text>
        </view>
      </view>
    </view>

    <!-- 转盘抽取 -->
    <view class="roulette-section card">
      <view class="roulette-header">
        <text class="roulette-title">🎯 美食转盘</text>
        <text class="roulette-subtitle">让转盘帮你决定吃什么</text>
      </view>

      <view class="roulette-container">
        <view
          class="roulette-wheel"
          :class="{ spinning: isSpinning }"
          :style="{ transform: `rotate(${rotation}deg)` }"
        >
          <view
            v-for="(food, index) in wheelFoods"
            :key="index"
            class="roulette-item"
            :style="{
              transform: `rotate(${index * (360 / wheelFoods.length)}deg)`,
              backgroundColor: getItemColor(index),
            }"
          >
            <text class="food-text">{{ food }}</text>
          </view>
        </view>
        <view class="roulette-pointer">📍</view>
      </view>

      <view class="roulette-actions">
        <button
          class="spin-btn"
          :class="{ spinning: isSpinning }"
          @click="spinWheel"
          :disabled="isSpinning"
        >
          <text class="spin-text">{{
            isSpinning ? "转盘转动中..." : "开始转盘"
          }}</text>
        </button>
      </view>
    </view>

    <!-- 推荐结果 -->
    <view v-if="recommendedFood" class="recommendation card">
      <view class="recommendation-header">
        <text class="recommendation-title">🎉 今天就吃这个</text>
        <view class="refresh-btn" @click="spinWheel">
          <text class="refresh-icon">🎲</text>
          <text class="refresh-text">再转一次</text>
        </view>
      </view>

      <view class="food-result">
        <view class="food-icon">{{ getFoodEmoji(recommendedFood) }}</view>
        <text class="food-name">{{ recommendedFood }}</text>
        <view class="food-actions">
          <button class="btn btn-primary" @click="recordFood">记录这餐</button>
          <button class="btn btn-secondary" @click="searchNearby">
            附近餐厅
          </button>
        </view>
      </view>
    </view>

    <!-- 快速选择 -->
    <view class="quick-actions">
      <button
        class="quick-btn random-btn"
        @click="quickRandom"
        :disabled="!selectedMeal"
      >
        <text class="btn-icon">🎲</text>
        <text class="btn-text">快速随机</text>
      </button>

      <button class="quick-btn history-btn" @click="goToHistory">
        <text class="btn-icon">📋</text>
        <text class="btn-text">用餐记录</text>
      </button>
    </view>

    <!-- 最近记录 -->
    <view v-if="recentFoodRecords.length > 0" class="recent-records">
      <view class="section-header">
        <text class="section-title">最近用餐</text>
        <text class="section-more" @click="goToHistory">查看全部</text>
      </view>

      <view class="record-list">
        <view
          v-for="record in recentFoodRecords.slice(0, 3)"
          :key="record.recordId"
          class="record-item card"
          @click="goToRecordDetail(record)"
        >
          <view class="record-header">
            <view class="meal-info">
              <text class="meal-emoji">{{
                getMealEmoji(record.mealType)
              }}</text>
              <text class="meal-name">{{ record.foodName }}</text>
            </view>
            <text class="record-time">{{
              formatRelativeTime(record.createTime)
            }}</text>
          </view>
          <view class="record-details">
            <text v-if="record.restaurant" class="restaurant"
              >📍 {{ record.restaurant }}</text
            >
            <view v-if="record.rating" class="rating">
              <text
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= record.rating }"
                >⭐</text
              >
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 食物分类快捷入口 -->
    <view class="food-categories">
      <view class="section-header">
        <text class="section-title">按分类选择</text>
      </view>

      <view class="category-grid">
        <view
          v-for="category in foodCategories"
          :key="category.name"
          class="category-item"
          @click="selectCategory(category)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import {
  MEAL_TYPES,
  FOOD_RECOMMENDATIONS,
  MODULE_TYPES,
} from "@/utils/constants";
import { formatRelativeTime } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const selectedMeal = ref("lunch");
const recommendedFood = ref("");
const isSpinning = ref(false);
const rotation = ref(0);

// 计算属性
const mealTypes = computed(() => MEAL_TYPES);

const recentFoodRecords = computed(() => {
  return recordStore.records
    .filter((record) => record.moduleType === MODULE_TYPES.FOOD)
    .slice(0, 5);
});

const wheelFoods = computed(() => {
  if (!selectedMeal.value) return [];
  const foods = FOOD_RECOMMENDATIONS[selectedMeal.value] || [];
  return foods.slice(0, 8); // 转盘显示8个选项
});

const foodCategories = computed(() => [
  {
    name: "中餐",
    icon: "🥢",
    foods: ["宫保鸡丁", "红烧肉", "麻婆豆腐", "糖醋里脊", "鱼香肉丝"],
  },
  {
    name: "西餐",
    icon: "🍝",
    foods: ["意大利面", "牛排", "汉堡", "披萨", "沙拉"],
  },
  {
    name: "日料",
    icon: "🍣",
    foods: ["寿司", "拉面", "天妇罗", "日式咖喱", "鳗鱼饭"],
  },
  {
    name: "韩料",
    icon: "🍲",
    foods: ["韩式拌饭", "烤肉", "泡菜汤", "炸鸡", "冷面"],
  },
  {
    name: "快餐",
    icon: "🍔",
    foods: ["汉堡", "炸鸡", "薯条", "热狗", "三明治"],
  },
  {
    name: "火锅",
    icon: "🍲",
    foods: ["四川火锅", "清汤火锅", "麻辣烫", "关东煮", "小火锅"],
  },
]);

// 方法
const selectMeal = (mealType) => {
  selectedMeal.value = mealType;
  recommendedFood.value = "";
};

const spinWheel = () => {
  if (isSpinning.value || !selectedMeal.value || wheelFoods.value.length === 0)
    return;

  isSpinning.value = true;

  // 随机旋转角度 (至少转3圈)
  const randomAngle = Math.random() * 360;
  const spins = 3 + Math.random() * 2; // 3-5圈
  const totalRotation = spins * 360 + randomAngle;

  rotation.value += totalRotation;

  // 计算最终停在哪个食物上
  const finalAngle = rotation.value % 360;
  const itemAngle = 360 / wheelFoods.value.length;
  const selectedIndex =
    Math.floor((360 - finalAngle + itemAngle / 2) / itemAngle) %
    wheelFoods.value.length;

  setTimeout(() => {
    isSpinning.value = false;
    recommendedFood.value = wheelFoods.value[selectedIndex];

    // 震动反馈
    uni.vibrateShort();

    // 显示结果提示
    uni.showToast({
      title: `🎉 ${recommendedFood.value}`,
      icon: "none",
      duration: 2000,
    });
  }, 3000);
};

const quickRandom = () => {
  if (!selectedMeal.value) return;

  const foods = FOOD_RECOMMENDATIONS[selectedMeal.value];
  if (foods && foods.length > 0) {
    const randomIndex = Math.floor(Math.random() * foods.length);
    recommendedFood.value = foods[randomIndex];

    uni.showToast({
      title: `🎲 ${recommendedFood.value}`,
      icon: "none",
    });
  }
};

const selectCategory = (category) => {
  const randomIndex = Math.floor(Math.random() * category.foods.length);
  recommendedFood.value = category.foods[randomIndex];

  uni.showToast({
    title: `${category.icon} ${recommendedFood.value}`,
    icon: "none",
  });
};

const getItemColor = (index) => {
  const colors = [
    "#ff6b9d",
    "#ff9f43",
    "#10ac84",
    "#5f27cd",
    "#00d2d3",
    "#ff3838",
    "#2e86de",
    "#f368e0",
  ];
  return colors[index % colors.length];
};

const getFoodEmoji = (foodName) => {
  const emojiMap = {
    火锅: "🍲",
    烧烤: "🍖",
    寿司: "🍣",
    拉面: "🍜",
    汉堡: "🍔",
    披萨: "🍕",
    意大利面: "🍝",
    牛排: "🥩",
    炸鸡: "🍗",
    薯条: "🍟",
    三明治: "🥪",
    沙拉: "🥗",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (foodName.includes(key)) return emoji;
  }

  return "🍽️";
};

const recordFood = () => {
  if (!recommendedFood.value) return;

  uni.navigateTo({
    url: `/pages/record/add?type=${
      MODULE_TYPES.FOOD
    }&foodName=${encodeURIComponent(recommendedFood.value)}&mealType=${
      selectedMeal.value
    }`,
  });
};

const searchNearby = () => {
  if (!recommendedFood.value) return;

  uni.showToast({
    title: "正在搜索附近餐厅...",
    icon: "loading",
  });

  setTimeout(() => {
    uni.showModal({
      title: "附近餐厅",
      content: `为您找到3家提供"${recommendedFood.value}"的餐厅`,
      confirmText: "查看",
      success: (res) => {
        if (res.confirm) {
          uni.showToast({
            title: "功能开发中",
            icon: "none",
          });
        }
      },
    });
  }, 1000);
};

const goToHistory = () => {
  uni.navigateTo({
    url: `/pages/record/list?type=${MODULE_TYPES.FOOD}`,
  });
};

const goToRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${record.recordId}`,
  });
};

const getMealEmoji = (mealType) => {
  const meal = MEAL_TYPES.find((m) => m.value === mealType);
  return meal ? meal.emoji : "🍽️";
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  // 根据当前时间自动选择餐次
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) {
    selectedMeal.value = "breakfast";
  } else if (hour >= 10 && hour < 14) {
    selectedMeal.value = "lunch";
  } else if (hour >= 14 && hour < 18) {
    selectedMeal.value = "snack";
  } else {
    selectedMeal.value = "dinner";
  }
});
</script>

<style lang="scss" scoped>
.food-recommend-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #ff6347, #ff7f50);
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  color: white;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .subtitle {
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.meal-selector {
  margin: 20rpx;

  .selector-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .meal-options {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;

    .meal-option {
      flex: 1;
      min-width: 120rpx;
      padding: 20rpx 16rpx;
      background: #f8f8f8;
      border-radius: 16rpx;
      text-align: center;
      transition: all 0.3s;

      &.active {
        background: #ff6347;
        color: white;
      }

      .meal-emoji {
        display: block;
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }

      .meal-label {
        font-size: 24rpx;
      }
    }
  }
}

.roulette-section {
  margin: 20rpx;
  text-align: center;

  .roulette-header {
    margin-bottom: 30rpx;

    .roulette-title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .roulette-subtitle {
      font-size: 26rpx;
      color: #666;
    }
  }

  .roulette-container {
    position: relative;
    width: 500rpx;
    height: 500rpx;
    margin: 0 auto 40rpx;

    .roulette-wheel {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      border: 8rpx solid #333;
      transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);

      &.spinning {
        transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
      }

      .roulette-item {
        position: absolute;
        width: 50%;
        height: 50%;
        top: 50%;
        left: 50%;
        transform-origin: 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        clip-path: polygon(0 0, 100% 0, 50% 100%);

        .food-text {
          font-size: 24rpx;
          color: white;
          font-weight: bold;
          text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
          transform: rotate(-22.5deg);
          margin-top: -60rpx;
        }
      }
    }

    .roulette-pointer {
      position: absolute;
      top: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      font-size: 40rpx;
      z-index: 10;
    }
  }

  .roulette-actions {
    .spin-btn {
      width: 300rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #ff6347, #ff7f50);
      color: white;
      border: none;
      border-radius: 40rpx;
      font-size: 32rpx;
      font-weight: bold;
      transition: all 0.3s;

      &:disabled {
        opacity: 0.6;
        background: #ccc;
      }

      &.spinning {
        animation: pulse 1s infinite;
      }

      .spin-text {
        color: white;
      }
    }
  }
}

.recommendation {
  margin: 20rpx;

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .recommendation-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 20rpx;
      background: #ff6347;
      color: white;
      border-radius: 20rpx;
      font-size: 24rpx;
    }
  }

  .food-result {
    text-align: center;
    padding: 40rpx 20rpx;

    .food-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }

    .food-name {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 30rpx;
    }

    .food-actions {
      display: flex;
      gap: 20rpx;
      justify-content: center;

      .btn {
        padding: 20rpx 40rpx;
        border-radius: 50rpx;
        border: none;
        font-size: 28rpx;
        transition: all 0.3s;

        &.btn-primary {
          background: #ff6347;
          color: white;
        }

        &.btn-secondary {
          background: #f8f8f8;
          color: #333;
        }
      }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  margin-bottom: 40rpx;

  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx 20rpx;
    background: white;
    border-radius: 20rpx;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:disabled {
      opacity: 0.5;
    }

    .btn-icon {
      font-size: 40rpx;
      margin-bottom: 12rpx;
    }

    .btn-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .random-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;

    .btn-text {
      color: white;
    }
  }
}

.recent-records,
.food-categories {
  margin: 0 20rpx 40rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 28rpx;
      color: #ff6347;
    }
  }

  .record-item {
    margin-bottom: 16rpx;

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .meal-info {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .meal-emoji {
          font-size: 24rpx;
        }

        .meal-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }
      }

      .record-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .record-details {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .restaurant {
        font-size: 26rpx;
        color: #666;
      }

      .rating {
        .star {
          font-size: 20rpx;
          color: #ddd;

          &.filled {
            color: #ffd700;
          }
        }
      }
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .category-item {
    background: white;
    padding: 30rpx 20rpx;
    border-radius: 16rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
    }

    .category-icon {
      display: block;
      font-size: 40rpx;
      margin-bottom: 12rpx;
    }

    .category-name {
      font-size: 26rpx;
      color: #333;
    }
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
