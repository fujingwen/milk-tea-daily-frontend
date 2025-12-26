<template>
  <view class="food-form">
    <view class="form-item">
      <text class="form-label">餐次类型</text>
      <view class="meal-options">
        <view
          class="meal-option"
          :class="{ active: formData.mealType === meal.value }"
          v-for="meal in mealTypes"
          :key="meal.value"
          @click="updateFormData('mealType', meal.value)"
        >
          <text class="meal-emoji">{{ meal.emoji }}</text>
          <text class="meal-label">{{ meal.label }}</text>
        </view>
      </view>
    </view>
    <view class="form-item">
      <text class="form-label">食物名称</text>
      <u-input
        :value="formData.foodName"
        @input="updateFormData('foodName', $event)"
        placeholder="请输入食物名称"
      />
    </view>
    <view class="form-item">
      <text class="form-label">餐厅/地点</text>
      <u-input
        :value="formData.restaurant"
        @input="updateFormData('restaurant', $event)"
        placeholder="在哪里吃的？"
      />
    </view>
    <view class="form-item">
      <text class="form-label">价格 (元)</text>
      <u-input
        :value="formData.price"
        @input="updateFormData('price', $event)"
        type="digit"
        placeholder="请输入价格"
      />
    </view>
    <view class="form-item">
      <text class="form-label">评分</text>
      <view class="rating-options">
        <view
          class="rating-option"
          :class="{ active: formData.rating === rating.value }"
          v-for="rating in ratingOptions"
          :key="rating.value"
          @click="updateFormData('rating', rating.value)"
        >
          <text class="rating-emoji">{{ rating.emoji }}</text>
          <text class="rating-label">{{ rating.label }}</text>
        </view>
      </view>
    </view>
    <view class="form-item">
      <text class="form-label">标签</text>
      <view class="tag-options">
        <view
          class="tag-option"
          :class="{ active: formData.tags.includes(tag) }"
          v-for="tag in foodTags"
          :key="tag"
          @click="toggleTag(tag)"
        >
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-textarea
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="口感、推荐度、和谁一起吃等..."
        maxlength="200"
        count
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { MEAL_TYPES, FOOD_TAGS, RATING_OPTIONS } from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

const mealTypes = computed(() => MEAL_TYPES);
const foodTags = computed(() => FOOD_TAGS);
const ratingOptions = computed(() => RATING_OPTIONS);

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};

const toggleTag = (tag) => {
  const tags = [...props.formData.tags];
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
  } else {
    tags.push(tag);
  }
  updateFormData("tags", tags);
};
</script>

<style lang="scss" scoped>
.food-form {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }
  }

  .meal-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .meal-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      border-radius: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;
      min-width: 100rpx;

      &.active {
        border-color: #ff6347;
        background: rgba(255, 99, 71, 0.1);
      }

      .meal-emoji {
        font-size: 24rpx;
        margin-bottom: 6rpx;
      }

      .meal-label {
        font-size: 22rpx;
        color: #333;
      }
    }
  }

  .rating-options {
    display: flex;
    gap: 12rpx;

    .rating-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      border-radius: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;
      flex: 1;

      &.active {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
      }

      .rating-emoji {
        font-size: 24rpx;
        margin-bottom: 6rpx;
      }

      .rating-label {
        font-size: 20rpx;
        color: #333;
      }
    }
  }

  .tag-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .tag-option {
      padding: 12rpx 16rpx;
      border-radius: 20rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;
      background: white;

      &.active {
        border-color: #ff6347;
        background: rgba(255, 99, 71, 0.1);
      }

      .tag-text {
        font-size: 24rpx;
        color: #333;
      }
    }
  }
}
</style>
