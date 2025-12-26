<template>
  <view class="weight-form">
    <view class="form-item">
      <text class="form-label">体重 (kg)</text>
      <u-input
        :value="formData.weightValue"
        @input="updateFormData('weightValue', $event)"
        type="digit"
        placeholder="请输入体重"
      />
    </view>
    <view class="form-item">
      <text class="form-label">测量时间</text>
      <u-datetime-picker
        :value="formData.measureTime"
        @change="updateFormData('measureTime', $event)"
        mode="datetime"
      />
    </view>
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-input
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="空腹/饭后/运动后等"
      />
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};
</script>

<style lang="scss" scoped>
.weight-form {
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
}
</style>
