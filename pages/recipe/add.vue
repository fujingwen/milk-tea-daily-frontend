<template>
  <view class="add-recipe-page">
    <view class="form-container">
      <!-- 基本信息 -->
      <view class="form-section card">
        <view class="section-title">基本信息</view>

        <view class="form-item">
          <text class="form-label">菜谱名称 *</text>
          <input
            class="form-input"
            v-model="formData.recipeName"
            placeholder="请输入菜谱名称"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="form-label">菜谱分类 *</text>
          <view class="category-options">
            <view
              v-for="category in recipeCategories"
              :key="category.value"
              class="category-option"
              :class="{ active: formData.category === category.value }"
              @click="formData.category = category.value"
            >
              <text class="category-icon">{{ category.icon }}</text>
              <text class="category-label">{{ category.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">难度等级 *</text>
          <view class="difficulty-options">
            <view
              v-for="level in difficultyLevels"
              :key="level.value"
              class="difficulty-option"
              :class="{ active: formData.difficulty === level.value }"
              @click="formData.difficulty = level.value"
            >
              <text class="difficulty-icon">{{ level.icon }}</text>
              <text class="difficulty-label">{{ level.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-row">
          <view class="form-item half">
            <text class="form-label">烹饪时间 *</text>
            <picker
              :range="cookTimeOptions"
              range-key="label"
              :value="cookTimeIndex"
              @change="onCookTimeChange"
            >
              <view class="picker-display">
                <text class="picker-text">
                  {{ cookTimeOptions[cookTimeIndex]?.label || "请选择" }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="form-item half">
            <text class="form-label">份量 *</text>
            <picker
              :range="servingOptions"
              range-key="label"
              :value="servingIndex"
              @change="onServingChange"
            >
              <view class="picker-display">
                <text class="picker-text">
                  {{ servingOptions[servingIndex]?.label || "请选择" }}
                </text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 食材清单 -->
      <view class="form-section card">
        <view class="section-title">
          <text>食材清单</text>
          <view class="add-ingredient-btn" @click="addIngredient">
            <text class="add-icon">➕</text>
          </view>
        </view>

        <view class="ingredients-list">
          <view
            v-for="(ingredient, index) in formData.ingredients"
            :key="index"
            class="ingredient-item"
          >
            <input
              class="ingredient-name"
              v-model="ingredient.name"
              placeholder="食材名称"
            />
            <input
              class="ingredient-amount"
              v-model="ingredient.amount"
              placeholder="用量"
            />
            <view class="remove-btn" @click="removeIngredient(index)">
              <text class="remove-icon">✖️</text>
            </view>
          </view>
        </view>

        <view
          v-if="formData.ingredients.length === 0"
          class="empty-ingredients"
        >
          <text class="empty-text">点击右上角 ➕ 添加食材</text>
        </view>
      </view>

      <!-- 制作步骤 -->
      <view class="form-section card">
        <view class="section-title">
          <text>制作步骤</text>
          <view class="add-step-btn" @click="addStep">
            <text class="add-icon">➕</text>
          </view>
        </view>

        <view class="steps-list">
          <view
            v-for="(step, index) in formData.steps"
            :key="index"
            class="step-item"
          >
            <view class="step-number">{{ index + 1 }}</view>
            <textarea
              class="step-content"
              v-model="step.content"
              :placeholder="`第${index + 1}步操作说明...`"
              maxlength="200"
            />
            <view class="step-actions">
              <view
                class="move-btn"
                @click="moveStepUp(index)"
                v-if="index > 0"
              >
                <text class="move-icon">⬆️</text>
              </view>
              <view
                class="move-btn"
                @click="moveStepDown(index)"
                v-if="index < formData.steps.length - 1"
              >
                <text class="move-icon">⬇️</text>
              </view>
              <view class="remove-btn" @click="removeStep(index)">
                <text class="remove-icon">✖️</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="formData.steps.length === 0" class="empty-steps">
          <text class="empty-text">点击右上角 ➕ 添加制作步骤</text>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="form-section card">
        <view class="section-title">小贴士</view>
        <textarea
          class="form-textarea"
          v-model="formData.tips"
          placeholder="分享一些制作技巧或注意事项..."
          maxlength="300"
        />
      </view>

      <!-- 标签 -->
      <view class="form-section card">
        <view class="section-title">标签</view>
        <view class="tags-container">
          <view class="available-tags">
            <view
              v-for="tag in recipeTags"
              :key="tag"
              class="tag-option"
              :class="{ active: formData.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              <text class="tag-text">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 照片 -->
      <view class="form-section card">
        <view class="section-title">照片</view>
        <view class="photo-container">
          <view class="photo-list">
            <view
              v-for="(photo, index) in formData.photos"
              :key="index"
              class="photo-item"
            >
              <image :src="photo" class="photo-image" mode="aspectFill" />
              <view class="photo-remove" @click="removePhoto(index)">
                <text class="remove-icon">✖️</text>
              </view>
            </view>
            <view
              class="photo-add"
              @click="addPhoto"
              v-if="formData.photos.length < 6"
            >
              <text class="add-icon">📷</text>
              <text class="add-text">添加照片</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn btn-cancel" @click="handleCancel">取消</button>
      <button class="btn btn-save" @click="handleSave">保存</button>
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
  COOK_TIME_OPTIONS,
  SERVING_OPTIONS,
  RECIPE_TAGS,
} from "@/utils/constants";
import { showToast } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const formData = ref({
  moduleType: MODULE_TYPES.RECIPE,
  recipeName: "",
  category: "",
  difficulty: "",
  cookTime: "",
  servings: "",
  ingredients: [],
  steps: [],
  tips: "",
  tags: [],
  photos: [],
});

const cookTimeIndex = ref(0);
const servingIndex = ref(0);
const isEdit = ref(false);
const editId = ref("");

// 计算属性
const recipeCategories = computed(() => RECIPE_CATEGORIES);
const difficultyLevels = computed(() => DIFFICULTY_LEVELS);
const cookTimeOptions = computed(() => COOK_TIME_OPTIONS);
const servingOptions = computed(() => SERVING_OPTIONS);
const recipeTags = computed(() => RECIPE_TAGS);

// 方法
const onCookTimeChange = (e) => {
  cookTimeIndex.value = e.detail.value;
  formData.value.cookTime = cookTimeOptions.value[e.detail.value].value;
};

const onServingChange = (e) => {
  servingIndex.value = e.detail.value;
  formData.value.servings = servingOptions.value[e.detail.value].value;
};

const addIngredient = () => {
  formData.value.ingredients.push({
    name: "",
    amount: "",
  });
};

const removeIngredient = (index) => {
  formData.value.ingredients.splice(index, 1);
};

const addStep = () => {
  formData.value.steps.push({
    content: "",
  });
};

const removeStep = (index) => {
  formData.value.steps.splice(index, 1);
};

const moveStepUp = (index) => {
  if (index > 0) {
    const steps = formData.value.steps;
    const temp = steps[index];
    steps[index] = steps[index - 1];
    steps[index - 1] = temp;
  }
};

const moveStepDown = (index) => {
  const steps = formData.value.steps;
  if (index < steps.length - 1) {
    const temp = steps[index];
    steps[index] = steps[index + 1];
    steps[index + 1] = temp;
  }
};

const toggleTag = (tag) => {
  const tags = formData.value.tags;
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
  } else {
    tags.push(tag);
  }
};

const addPhoto = () => {
  uni.chooseImage({
    count: 6 - formData.value.photos.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      formData.value.photos.push(...res.tempFilePaths);
    },
    fail: () => {
      showToast("选择照片失败", "none");
    },
  });
};

const removePhoto = (index) => {
  formData.value.photos.splice(index, 1);
};

const validateForm = () => {
  if (!formData.value.recipeName.trim()) {
    showToast("请输入菜谱名称", "none");
    return false;
  }

  if (!formData.value.category) {
    showToast("请选择菜谱分类", "none");
    return false;
  }

  if (!formData.value.difficulty) {
    showToast("请选择难度等级", "none");
    return false;
  }

  if (!formData.value.cookTime) {
    showToast("请选择烹饪时间", "none");
    return false;
  }

  if (!formData.value.servings) {
    showToast("请选择份量", "none");
    return false;
  }

  if (formData.value.ingredients.length === 0) {
    showToast("请添加至少一个食材", "none");
    return false;
  }

  // 检查食材是否填写完整
  for (let i = 0; i < formData.value.ingredients.length; i++) {
    const ingredient = formData.value.ingredients[i];
    if (!ingredient.name.trim() || !ingredient.amount.trim()) {
      showToast(`请完善第${i + 1}个食材信息`, "none");
      return false;
    }
  }

  if (formData.value.steps.length === 0) {
    showToast("请添加至少一个制作步骤", "none");
    return false;
  }

  // 检查步骤是否填写完整
  for (let i = 0; i < formData.value.steps.length; i++) {
    const step = formData.value.steps[i];
    if (!step.content.trim()) {
      showToast(`请填写第${i + 1}步制作说明`, "none");
      return false;
    }
  }

  return true;
};

const handleSave = () => {
  if (!validateForm()) return;

  try {
    if (isEdit.value) {
      recordStore.updateRecord(editId.value, formData.value);
      showToast("更新成功", "success");
    } else {
      recordStore.addRecord(formData.value);
      showToast("保存成功", "success");
    }

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    showToast("保存失败", "none");
  }
};

const handleCancel = () => {
  uni.navigateBack();
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.id && options.edit) {
    isEdit.value = true;
    editId.value = options.id;

    const record = recordStore.records.find((r) => r.recordId === options.id);
    if (record) {
      formData.value = { ...record };

      // 设置选择器索引
      const cookTimeIdx = cookTimeOptions.value.findIndex(
        (opt) => opt.value === record.cookTime
      );
      if (cookTimeIdx > -1) cookTimeIndex.value = cookTimeIdx;

      const servingIdx = servingOptions.value.findIndex(
        (opt) => opt.value === record.servings
      );
      if (servingIdx > -1) servingIndex.value = servingIdx;
    }
  } else {
    // 初始化默认数据
    addIngredient();
    addStep();
  }
});
</script>

<style lang="scss" scoped>
.add-recipe-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-container {
  padding: 20rpx;
}

.form-section {
  margin-bottom: 20rpx;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;

    .add-ingredient-btn,
    .add-step-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #32cd32;
      border-radius: 50%;

      .add-icon {
        font-size: 24rpx;
        color: white;
      }
    }
  }
}

.form-item {
  margin-bottom: 30rpx;

  &.half {
    width: 48%;
  }

  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
    border: 2rpx solid transparent;

    &:focus {
      border-color: #32cd32;
      background: white;
    }
  }

  .form-textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
    border: 2rpx solid transparent;

    &:focus {
      border-color: #32cd32;
      background: white;
    }
  }

  .picker-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;

    .picker-text {
      font-size: 28rpx;
      color: #333;
    }

    .picker-arrow {
      font-size: 20rpx;
      color: #666;
    }
  }
}

.form-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.category-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .category-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;

    &.active {
      border-color: #32cd32;
      background: rgba(50, 205, 50, 0.1);
    }

    .category-icon {
      font-size: 32rpx;
      margin-bottom: 8rpx;
    }

    .category-label {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.difficulty-options {
  display: flex;
  gap: 16rpx;

  .difficulty-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;

    &.active {
      border-color: #32cd32;
      background: rgba(50, 205, 50, 0.1);
    }

    .difficulty-icon {
      font-size: 28rpx;
      margin-bottom: 8rpx;
    }

    .difficulty-label {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.ingredients-list {
  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .ingredient-name {
      flex: 2;
      height: 70rpx;
      padding: 0 16rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      font-size: 26rpx;
    }

    .ingredient-amount {
      flex: 1;
      height: 70rpx;
      padding: 0 16rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      font-size: 26rpx;
    }

    .remove-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ff4757;
      border-radius: 50%;

      .remove-icon {
        font-size: 20rpx;
        color: white;
      }
    }
  }
}

.steps-list {
  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    margin-bottom: 20rpx;

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
      min-height: 100rpx;
      padding: 16rpx;
      background: #f8f8f8;
      border-radius: 8rpx;
      font-size: 26rpx;
      line-height: 1.5;
    }

    .step-actions {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .move-btn,
      .remove-btn {
        width: 50rpx;
        height: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        .move-icon,
        .remove-icon {
          font-size: 18rpx;
        }
      }

      .move-btn {
        background: #3742fa;

        .move-icon {
          color: white;
        }
      }

      .remove-btn {
        background: #ff4757;

        .remove-icon {
          color: white;
        }
      }
    }
  }
}

.empty-ingredients,
.empty-steps {
  text-align: center;
  padding: 60rpx 20rpx;

  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

.tags-container {
  .available-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .tag-option {
      padding: 12rpx 20rpx;
      background: #f8f8f8;
      border-radius: 20rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;

      &.active {
        background: #32cd32;
        border-color: #32cd32;

        .tag-text {
          color: white;
        }
      }

      .tag-text {
        font-size: 24rpx;
        color: #333;
      }
    }
  }
}

.photo-container {
  .photo-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12rpx;
      overflow: hidden;

      .photo-image {
        width: 100%;
        height: 100%;
      }

      .photo-remove {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 40rpx;
        height: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;

        .remove-icon {
          font-size: 16rpx;
          color: white;
        }
      }
    }

    .photo-add {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8f8f8;
      border: 2rpx dashed #ccc;
      border-radius: 12rpx;

      .add-icon {
        font-size: 40rpx;
        margin-bottom: 8rpx;
        opacity: 0.6;
      }

      .add-text {
        font-size: 22rpx;
        color: #666;
      }
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);

  .btn {
    flex: 1;
    height: 80rpx;
    border: none;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: bold;

    &.btn-cancel {
      background: #f8f8f8;
      color: #666;
    }

    &.btn-save {
      background: #32cd32;
      color: white;
    }
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}
</style>
