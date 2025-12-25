<template>
  <view class="recipe-detail-page" v-if="recipe">
    <!-- 头部图片 -->
    <view class="recipe-header">
      <swiper
        v-if="recipe.photos && recipe.photos.length > 0"
        class="recipe-swiper"
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#32cd32"
      >
        <swiper-item v-for="(photo, index) in recipe.photos" :key="index">
          <image :src="photo" class="recipe-image" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view v-else class="recipe-placeholder">
        <text class="placeholder-icon">👨‍🍳</text>
      </view>

      <view class="recipe-overlay">
        <view class="recipe-title">{{ recipe.recipeName }}</view>
        <view class="recipe-meta">
          <view class="meta-item">
            <text class="meta-icon">{{
              getCategoryIcon(recipe.category)
            }}</text>
            <text class="meta-text">{{
              getCategoryLabel(recipe.category)
            }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">{{
              getDifficultyIcon(recipe.difficulty)
            }}</text>
            <text class="meta-text">{{
              getDifficultyLabel(recipe.difficulty)
            }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="header-actions">
        <view class="action-btn" @click="editRecipe">
          <text class="action-icon">✏️</text>
        </view>
        <view class="action-btn" @click="deleteRecipe">
          <text class="action-icon">🗑️</text>
        </view>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section card">
      <view class="info-grid">
        <view class="info-item">
          <text class="info-icon">⏱️</text>
          <text class="info-label">烹饪时间</text>
          <text class="info-value">{{ recipe.cookTime }}分钟</text>
        </view>
        <view class="info-item">
          <text class="info-icon">👥</text>
          <text class="info-label">份量</text>
          <text class="info-value">{{ recipe.servings }}</text>
        </view>
      </view>
    </view>

    <!-- 标签 -->
    <view
      class="tags-section card"
      v-if="recipe.tags && recipe.tags.length > 0"
    >
      <view class="section-title">标签</view>
      <view class="tags-list">
        <text v-for="tag in recipe.tags" :key="tag" class="recipe-tag">
          {{ tag }}
        </text>
      </view>
    </view>

    <!-- 食材清单 -->
    <view class="ingredients-section card">
      <view class="section-title">
        <text>食材清单</text>
        <text class="ingredient-count"
          >({{ recipe.ingredients.length }}种)</text
        >
      </view>
      <view class="ingredients-list">
        <view
          v-for="(ingredient, index) in recipe.ingredients"
          :key="index"
          class="ingredient-item"
        >
          <view class="ingredient-dot"></view>
          <text class="ingredient-name">{{ ingredient.name }}</text>
          <text class="ingredient-amount">{{ ingredient.amount }}</text>
        </view>
      </view>
    </view>

    <!-- 制作步骤 -->
    <view class="steps-section card">
      <view class="section-title">
        <text>制作步骤</text>
        <text class="step-count">({{ recipe.steps.length }}步)</text>
      </view>
      <view class="steps-list">
        <view
          v-for="(step, index) in recipe.steps"
          :key="index"
          class="step-item"
        >
          <view class="step-number">{{ index + 1 }}</view>
          <view class="step-content">
            <text class="step-text">{{ step.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 小贴士 -->
    <view class="tips-section card" v-if="recipe.tips">
      <view class="section-title">💡 小贴士</view>
      <text class="tips-content">{{ recipe.tips }}</text>
    </view>

    <!-- 制作记录 -->
    <view class="record-section card">
      <view class="section-title">制作记录</view>
      <view class="record-info">
        <view class="record-item">
          <text class="record-label">创建时间</text>
          <text class="record-value">{{
            formatDate(recipe.createTime, "YYYY-MM-DD HH:mm")
          }}</text>
        </view>
        <view
          class="record-item"
          v-if="recipe.updateTime !== recipe.createTime"
        >
          <text class="record-label">更新时间</text>
          <text class="record-value">{{
            formatDate(recipe.updateTime, "YYYY-MM-DD HH:mm")
          }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="action-button cook-btn" @click="startCooking">
        <text class="btn-icon">👨‍🍳</text>
        <text class="btn-text">开始制作</text>
      </button>
      <button class="action-button share-btn" @click="shareRecipe">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享菜谱</text>
      </button>
    </view>
  </view>

  <view v-else class="empty-state">
    <text class="empty-text">菜谱不存在</text>
    <button class="empty-btn" @click="goBack">返回</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import { RECIPE_CATEGORIES, DIFFICULTY_LEVELS } from "@/utils/constants";
import { formatDate, showConfirm, showToast } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const recipe = ref(null);

// 方法
const getCategoryIcon = (category) => {
  const cat = RECIPE_CATEGORIES.find((c) => c.value === category);
  return cat ? cat.icon : "🍽️";
};

const getCategoryLabel = (category) => {
  const cat = RECIPE_CATEGORIES.find((c) => c.value === category);
  return cat ? cat.label : "未知分类";
};

const getDifficultyIcon = (difficulty) => {
  const level = DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
  return level ? level.icon : "⭐";
};

const getDifficultyLabel = (difficulty) => {
  const level = DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
  return level ? level.label : "未知难度";
};

const editRecipe = () => {
  uni.navigateTo({
    url: `/pages/recipe/add?id=${recipe.value.recordId}&edit=true`,
  });
};

const deleteRecipe = async () => {
  const confirmed = await showConfirm(
    `确定要删除菜谱"${recipe.value.recipeName}"吗？`
  );
  if (confirmed) {
    recordStore.deleteRecord(recipe.value.recordId);
    showToast("删除成功", "success");
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
};

const startCooking = () => {
  uni.showModal({
    title: "开始制作",
    content: "是否要记录这次制作过程？",
    confirmText: "记录",
    cancelText: "直接制作",
    success: (res) => {
      if (res.confirm) {
        // 跳转到制作记录页面（未来功能）
        showToast("制作记录功能开发中", "none");
      } else {
        showToast("开始制作吧！", "success");
      }
    },
  });
};

const shareRecipe = () => {
  // 生成分享内容
  const shareContent =
    `【${recipe.value.recipeName}】\n` +
    `难度：${getDifficultyLabel(recipe.value.difficulty)}\n` +
    `时间：${recipe.value.cookTime}分钟\n` +
    `份量：${recipe.value.servings}\n\n` +
    `食材：\n${recipe.value.ingredients
      .map((ing) => `• ${ing.name} ${ing.amount}`)
      .join("\n")}\n\n` +
    `制作步骤：\n${recipe.value.steps
      .map((step, index) => `${index + 1}. ${step.content}`)
      .join("\n")}`;

  uni.setClipboardData({
    data: shareContent,
    success: () => {
      showToast("菜谱已复制到剪贴板", "success");
    },
    fail: () => {
      showToast("分享失败", "none");
    },
  });
};

const goBack = () => {
  uni.navigateBack();
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.id) {
    const foundRecord = recordStore.records.find(
      (r) => r.recordId === options.id
    );
    if (foundRecord) {
      recipe.value = foundRecord;
    }
  }
});
</script>

<style lang="scss" scoped>
.recipe-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.recipe-header {
  position: relative;
  height: 500rpx;

  .recipe-swiper {
    width: 100%;
    height: 100%;

    .recipe-image {
      width: 100%;
      height: 100%;
    }
  }

  .recipe-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #32cd32, #228b22);

    .placeholder-icon {
      font-size: 120rpx;
      color: white;
    }
  }

  .recipe-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 60rpx 30rpx 30rpx;

    .recipe-title {
      font-size: 40rpx;
      font-weight: bold;
      color: white;
      margin-bottom: 16rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
    }

    .recipe-meta {
      display: flex;
      gap: 30rpx;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .meta-icon {
          font-size: 24rpx;
        }

        .meta-text {
          font-size: 26rpx;
          color: white;
        }
      }
    }
  }

  .header-actions {
    position: absolute;
    top: 60rpx;
    right: 30rpx;
    display: flex;
    gap: 16rpx;

    .action-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;

      .action-icon {
        font-size: 28rpx;
        color: white;
      }
    }
  }
}

.info-section {
  margin: 20rpx;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;

    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .info-icon {
        font-size: 40rpx;
        margin-bottom: 12rpx;
      }

      .info-label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .info-value {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }
}

.tags-section {
  margin: 0 20rpx 20rpx;

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .recipe-tag {
      font-size: 22rpx;
      color: #32cd32;
      background: rgba(50, 205, 50, 0.1);
      padding: 8rpx 16rpx;
      border-radius: 16rpx;
      border: 1rpx solid rgba(50, 205, 50, 0.3);
    }
  }
}

.ingredients-section,
.steps-section,
.tips-section,
.record-section {
  margin: 0 20rpx 20rpx;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;

    .ingredient-count,
    .step-count {
      font-size: 24rpx;
      color: #666;
      font-weight: normal;
    }
  }

  .ingredients-list {
    .ingredient-item {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .ingredient-dot {
        width: 12rpx;
        height: 12rpx;
        background: #32cd32;
        border-radius: 50%;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .ingredient-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }

      .ingredient-amount {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
      }
    }
  }

  .steps-list {
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 20rpx;
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .step-number {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #32cd32;
        color: white;
        border-radius: 50%;
        font-size: 24rpx;
        font-weight: bold;
        flex-shrink: 0;
      }

      .step-content {
        flex: 1;
        padding-top: 8rpx;

        .step-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
        }
      }
    }
  }

  .tips-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    background: #f8f9fa;
    padding: 24rpx;
    border-radius: 12rpx;
    border-left: 6rpx solid #32cd32;
  }

  .record-info {
    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .record-label {
        font-size: 26rpx;
        color: #666;
      }

      .record-value {
        font-size: 26rpx;
        color: #333;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 80rpx;
    border: none;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: bold;

    .btn-icon {
      font-size: 24rpx;
    }

    &.cook-btn {
      background: #32cd32;
      color: white;
    }

    &.share-btn {
      background: #f8f8f8;
      color: #333;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 40rpx;
  }

  .empty-btn {
    padding: 20rpx 40rpx;
    background: #32cd32;
    color: white;
    border: none;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}
</style>
