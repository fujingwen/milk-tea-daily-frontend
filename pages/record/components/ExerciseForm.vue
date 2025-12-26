<template>
  <view class="exercise-form">
    <view class="form-item">
      <text class="form-label">运动类型</text>
      <view class="exercise-options">
        <view
          v-for="exercise in exerciseTypes"
          :key="exercise.value"
          class="exercise-option"
          :class="{ active: formData.exerciseType === exercise.value }"
          @click="updateFormData('exerciseType', exercise.value)"
        >
          <text class="exercise-emoji">{{ exercise.emoji }}</text>
          <text class="exercise-label">{{ exercise.label }}</text>
        </view>
      </view>
    </view>
    <view class="form-item">
      <text class="form-label">运动时长 (分钟)</text>
      <u-input
        :value="formData.duration"
        @input="updateFormData('duration', $event)"
        type="number"
        placeholder="请输入运动时长"
      />
    </view>
    <view class="form-item">
      <text class="form-label">消耗热量 (千卡)</text>
      <u-input
        :value="formData.calories"
        @input="updateFormData('calories', $event)"
        type="number"
        placeholder="可选，输入消耗热量"
      />
    </view>
    <view
      class="form-item"
      v-if="
        ['running', 'walking', 'cycling', 'swimming', 'hiking'].includes(
          formData.exerciseType
        )
      "
    >
      <text class="form-label"
        >运动距离 ({{ getExerciseUnit(formData.exerciseType) }})</text
      >
      <u-input
        :value="formData.distance"
        @input="updateFormData('distance', $event)"
        type="digit"
        placeholder="可选，输入运动距离"
      />
    </view>
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-textarea
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="运动感受、身体状态等..."
        maxlength="200"
        count
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { EXERCISE_TYPES } from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

const exerciseTypes = computed(() => EXERCISE_TYPES);

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};

const getExerciseUnit = (exerciseType) => {
  const exercise = EXERCISE_TYPES.find((e) => e.value === exerciseType);
  return exercise ? exercise.unit : "km";
};
</script>

<style lang="scss" scoped>
.exercise-form {
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

  .exercise-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;

    .exercise-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      border-radius: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;

      &.active {
        border-color: #34c759;
        background: rgba(52, 199, 89, 0.1);
      }

      .exercise-emoji {
        font-size: 24rpx;
        margin-bottom: 6rpx;
      }

      .exercise-label {
        font-size: 22rpx;
        color: #333;
        text-align: center;
      }
    }
  }
}
</style>
