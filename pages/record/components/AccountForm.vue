<template>
  <view class="account-form">
    <view class="form-item">
      <text class="form-label">收支类型</text>
      <u-radio-group
        :value="formData.type"
        @change="updateFormData('type', $event)"
      >
        <u-radio
          v-for="type in accountTypes"
          :key="type.value"
          :name="type.value"
          :label="type.label"
        />
      </u-radio-group>
    </view>
    <view class="form-item">
      <text class="form-label">金额 (元)</text>
      <u-input
        :value="formData.amount"
        @input="updateFormData('amount', $event)"
        type="digit"
        placeholder="请输入金额"
      />
    </view>
    <view class="form-item">
      <text class="form-label">分类</text>
      <u-picker
        :value="formData.category"
        @change="updateFormData('category', $event)"
        :range="currentCategories"
        placeholder="请选择分类"
      />
    </view>
    <view class="form-item">
      <text class="form-label">支付方式</text>
      <u-radio-group
        :value="formData.payType"
        @change="updateFormData('payType', $event)"
      >
        <u-radio
          v-for="pay in payTypes"
          :key="pay.value"
          :name="pay.value"
          :label="pay.label"
        />
      </u-radio-group>
    </view>
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-input
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="备注信息"
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import {
  ACCOUNT_TYPES,
  PAY_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

const accountTypes = computed(() => ACCOUNT_TYPES);
const payTypes = computed(() => PAY_TYPES);

const currentCategories = computed(() => {
  if (props.formData.type === "income") {
    return INCOME_CATEGORIES;
  } else {
    return EXPENSE_CATEGORIES;
  }
});

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};
</script>

<style lang="scss" scoped>
.account-form {
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
