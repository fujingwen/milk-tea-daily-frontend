<template>
  <view class="recipe-list-page">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="search-bar">
        <input
          class="search-input"
          placeholder="搜索菜谱..."
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">
          <text class="search-icon">🔍</text>
        </view>
      </view>
      <view class="add-btn" @click="goToAddRecipe">
        <text class="add-icon">➕</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <scroll-view class="filter-scroll" scroll-x>
        <view class="filter-options">
          <view
            class="filter-option"
            :class="{ active: selectedCategory === '' }"
            @click="selectCategory('')"
          >
            <text class="filter-text">全部</text>
          </view>
          <view
            v-for="category in recipeCategories"
            :key="category.value"
            class="filter-option"
            :class="{ active: selectedCategory === category.value }"
            @click="selectCategory(category.value)"
          >
            <text class="filter-icon">{{ category.icon }}</text>
            <text class="filter-text">{{ category.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-bar" v-if="filteredRecipes.length > 0">
      <text class="stats-text">共 {{ filteredRecipes.length }} 道菜谱</text>
      <view class="sort-btn" @click="toggleSort">
        <text class="sort-text">{{
          sortBy === "time" ? "按时间" : "按名称"
        }}</text>
        <text class="sort-icon">{{
          sortDirection === "desc" ? "↓" : "↑"
        }}</text>
      </view>
    </view>

    <!-- 菜谱列表 -->
    <view class="recipe-list">
      <view
        v-for="recipe in paginatedRecipes"
        :key="recipe.recordId"
        class="recipe-item"
        @click="goToRecipeDetail(recipe)"
      >
        <view class="recipe-image">
          <image
            v-if="recipe.photos && recipe.photos.length > 0"
            :src="recipe.photos[0]"
            class="recipe-photo"
            mode="aspectFill"
          />
          <view v-else class="recipe-placeholder">
            <text class="placeholder-icon">👨‍🍳</text>
          </view>
          <view class="recipe-difficulty">
            <text class="difficulty-text">{{
              getDifficultyLabel(recipe.difficulty)
            }}</text>
          </view>
        </view>

        <view class="recipe-info">
          <view class="recipe-header">
            <text class="recipe-name">{{ recipe.recipeName }}</text>
            <view class="recipe-category">
              <text class="category-icon">{{
                getCategoryIcon(recipe.category)
              }}</text>
            </view>
          </view>

          <view class="recipe-meta">
            <view class="meta-item">
              <text class="meta-icon">⏱️</text>
              <text class="meta-text">{{ recipe.cookTime }}分钟</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👥</text>
              <text class="meta-text">{{ recipe.servings }}</text>
            </view>
          </view>

          <view
            class="recipe-tags"
            v-if="recipe.tags && recipe.tags.length > 0"
          >
            <text
              v-for="tag in recipe.tags.slice(0, 3)"
              :key="tag"
              class="recipe-tag"
            >
              {{ tag }}
            </text>
          </view>

          <view class="recipe-footer">
            <text class="create-time">{{
              formatRelativeTime(recipe.createTime)
            }}</text>
            <view class="recipe-actions" @click.stop>
              <view class="action-btn" @click="editRecipe(recipe)">
                <text class="action-icon">✏️</text>
              </view>
              <view class="action-btn" @click="deleteRecipe(recipe)">
                <text class="action-icon">🗑️</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <button class="load-btn" @click="loadMore" :disabled="loading">
        {{ loading ? "加载中..." : "加载更多" }}
      </button>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredRecipes.length === 0" class="empty-state">
      <view class="empty-icon">👨‍🍳</view>
      <text class="empty-text">
        {{
          searchKeyword
            ? "没有找到相关菜谱"
            : "还没有菜谱，快来添加第一道菜吧！"
        }}
      </text>
      <button class="empty-btn" @click="goToAddRecipe">添加菜谱</button>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="goToAddRecipe">
      <text class="fab-icon">➕</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import {
  MODULE_TYPES,
  RECIPE_CATEGORIES,
  DIFFICULTY_LEVELS,
} from "@/utils/constants";
import { formatRelativeTime, showConfirm, showToast } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const searchKeyword = ref("");
const selectedCategory = ref("");
const sortBy = ref("time");
const sortDirection = ref("desc");
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 计算属性
const recipeCategories = computed(() => RECIPE_CATEGORIES);

const allRecipes = computed(() => {
  return recordStore.records.filter(
    (record) => record.moduleType === MODULE_TYPES.RECIPE
  );
});

const filteredRecipes = computed(() => {
  let recipes = [...allRecipes.value];

  // 分类筛选
  if (selectedCategory.value) {
    recipes = recipes.filter(
      (recipe) => recipe.category === selectedCategory.value
    );
  }

  // 搜索筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    recipes = recipes.filter((recipe) => {
      return (
        recipe.recipeName.toLowerCase().includes(keyword) ||
        (recipe.tags &&
          recipe.tags.some((tag) => tag.toLowerCase().includes(keyword)))
      );
    });
  }

  // 排序
  recipes.sort((a, b) => {
    let compareValue = 0;

    if (sortBy.value === "time") {
      compareValue = a.createTime - b.createTime;
    } else if (sortBy.value === "name") {
      compareValue = a.recipeName.localeCompare(b.recipeName);
    }

    return sortDirection.value === "desc" ? -compareValue : compareValue;
  });

  return recipes;
});

const paginatedRecipes = computed(() => {
  const start = 0;
  const end = currentPage.value * pageSize.value;
  return filteredRecipes.value.slice(start, end);
});

const hasMore = computed(() => {
  return paginatedRecipes.value.length < filteredRecipes.value.length;
});

// 方法
const selectCategory = (category) => {
  selectedCategory.value = category;
  currentPage.value = 1;
};

const toggleSort = () => {
  if (sortBy.value === "time") {
    sortBy.value = "name";
    sortDirection.value = "asc";
  } else {
    sortBy.value = "time";
    sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
  }
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const loadMore = () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  setTimeout(() => {
    currentPage.value++;
    loading.value = false;
  }, 500);
};

const getDifficultyLabel = (difficulty) => {
  const level = DIFFICULTY_LEVELS.find((d) => d.value === difficulty);
  return level ? level.icon : "⭐";
};

const getCategoryIcon = (category) => {
  const cat = RECIPE_CATEGORIES.find((c) => c.value === category);
  return cat ? cat.icon : "🍽️";
};

const goToAddRecipe = () => {
  uni.navigateTo({
    url: "/pages/recipe/add",
  });
};

const goToRecipeDetail = (recipe) => {
  uni.navigateTo({
    url: `/pages/recipe/detail?id=${recipe.recordId}`,
  });
};

const editRecipe = (recipe) => {
  uni.navigateTo({
    url: `/pages/recipe/add?id=${recipe.recordId}&edit=true`,
  });
};

const deleteRecipe = async (recipe) => {
  const confirmed = await showConfirm(
    `确定要删除菜谱"${recipe.recipeName}"吗？`
  );
  if (confirmed) {
    recordStore.deleteRecord(recipe.recordId);
    showToast("删除成功", "success");
  }
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.recipe-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: white;

  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 50rpx;
    padding: 0 20rpx;

    .search-input {
      flex: 1;
      height: 70rpx;
      font-size: 28rpx;
      background: transparent;
      border: none;
    }

    .search-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #32cd32;

      .search-icon {
        font-size: 24rpx;
        color: white;
      }
    }
  }

  .add-btn {
    width: 70rpx;
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #32cd32;

    .add-icon {
      font-size: 28rpx;
      color: white;
    }
  }
}

.filter-bar {
  background: white;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .filter-scroll {
    white-space: nowrap;

    .filter-options {
      display: flex;
      gap: 20rpx;
      padding: 0 20rpx;

      .filter-option {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 12rpx 20rpx;
        background: #f8f8f8;
        border-radius: 20rpx;
        white-space: nowrap;
        transition: all 0.3s;

        &.active {
          background: #32cd32;
          color: white;

          .filter-text {
            color: white;
          }
        }

        .filter-icon {
          font-size: 20rpx;
        }

        .filter-text {
          font-size: 24rpx;
          color: #333;
        }
      }
    }
  }
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-bottom: 1rpx solid #f0f0f0;

  .stats-text {
    font-size: 26rpx;
    color: #666;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: #f8f8f8;
    border-radius: 16rpx;

    .sort-text {
      font-size: 24rpx;
      color: #333;
    }

    .sort-icon {
      font-size: 20rpx;
      color: #666;
    }
  }
}

.recipe-list {
  padding: 20rpx;

  .recipe-item {
    display: flex;
    background: white;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
    }

    .recipe-image {
      position: relative;
      width: 200rpx;
      height: 200rpx;

      .recipe-photo {
        width: 100%;
        height: 100%;
      }

      .recipe-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #32cd32, #228b22);

        .placeholder-icon {
          font-size: 60rpx;
          color: white;
        }
      }

      .recipe-difficulty {
        position: absolute;
        top: 12rpx;
        right: 12rpx;
        background: rgba(0, 0, 0, 0.7);
        padding: 4rpx 8rpx;
        border-radius: 8rpx;

        .difficulty-text {
          font-size: 20rpx;
          color: white;
        }
      }
    }

    .recipe-info {
      flex: 1;
      padding: 20rpx;
      display: flex;
      flex-direction: column;

      .recipe-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12rpx;

        .recipe-name {
          flex: 1;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          line-height: 1.3;
        }

        .recipe-category {
          .category-icon {
            font-size: 24rpx;
          }
        }
      }

      .recipe-meta {
        display: flex;
        gap: 20rpx;
        margin-bottom: 12rpx;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;

          .meta-icon {
            font-size: 20rpx;
          }

          .meta-text {
            font-size: 24rpx;
            color: #666;
          }
        }
      }

      .recipe-tags {
        display: flex;
        gap: 8rpx;
        margin-bottom: 12rpx;
        flex-wrap: wrap;

        .recipe-tag {
          font-size: 20rpx;
          color: #32cd32;
          background: rgba(50, 205, 50, 0.1);
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
          border: 1rpx solid rgba(50, 205, 50, 0.3);
        }
      }

      .recipe-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;

        .create-time {
          font-size: 22rpx;
          color: #999;
        }

        .recipe-actions {
          display: flex;
          gap: 12rpx;

          .action-btn {
            width: 60rpx;
            height: 60rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f8f8f8;
            transition: all 0.3s;

            &:active {
              background: #e8e8e8;
            }

            .action-icon {
              font-size: 24rpx;
            }
          }
        }
      }
    }
  }
}

.load-more {
  text-align: center;
  padding: 40rpx 20rpx;

  .load-btn {
    padding: 20rpx 40rpx;
    background: #32cd32;
    color: white;
    border: none;
    border-radius: 50rpx;
    font-size: 28rpx;

    &:disabled {
      opacity: 0.6;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 40rpx;
    line-height: 1.5;
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

.fab {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #32cd32, #228b22);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(50, 205, 50, 0.4);
  z-index: 100;

  .fab-icon {
    font-size: 40rpx;
    color: white;
  }
}
</style>
