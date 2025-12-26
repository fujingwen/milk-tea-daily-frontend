<template>
  <view class="shopping-form">
    <view class="form-section">
      <view class="section-title">🛍️ 商品信息</view>

      <!-- 商品名称 -->
      <view class="form-item">
        <text class="item-label">商品名称 *</text>
        <input
          class="item-input"
          v-model="formData.productName"
          placeholder="请输入商品名称"
          maxlength="50"
        />
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <text class="item-label">价格</text>
        <input
          class="item-input"
          v-model="formData.price"
          placeholder="请输入价格"
          type="digit"
        />
      </view>

      <!-- 优先级 -->
      <view class="form-item">
        <text class="item-label">优先级 *</text>
        <view class="priority-options">
          <view
            v-for="priority in priorityTypes"
            :key="priority.value"
            class="priority-option"
            :class="{ active: formData.priority === priority.value }"
            @click="selectPriority(priority.value)"
          >
            <text class="priority-emoji">{{ priority.emoji }}</text>
            <text class="priority-label">{{ priority.label }}</text>
          </view>
        </view>
      </view>

      <!-- 链接 -->
      <view class="form-item">
        <text class="item-label">商品链接</text>
        <input
          class="item-input"
          v-model="formData.link"
          placeholder="请输入商品链接（可选）"
        />
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="item-label">备注</text>
        <textarea
          class="item-textarea"
          v-model="formData.remark"
          placeholder="添加备注信息（可选）"
          maxlength="200"
          :show-count="true"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="form-actions">
      <button class="submit-btn" @click="handleSubmit" :disabled="!canSubmit">
        <text class="btn-text">{{ isEdit ? "更新" : "添加到购物清单" }}</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { SHOPPING_PRIORITY_TYPES } from "@/utils/constants";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit"]);

// 响应式数据
const formData = ref({
  productName: "",
  price: "",
  priority: "must_buy",
  status: "pending",
  link: "",
  remark: "",
});

const priorityTypes = SHOPPING_PRIORITY_TYPES;

// 计算属性
const canSubmit = computed(() => {
  return formData.value.productName.trim() && formData.value.priority;
});

// 监听初始数据变化
watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      formData.value = {
        productName: newData.productName || "",
        price: newData.price || "",
        priority: newData.priority || "must_buy",
        status: newData.status || "pending",
        link: newData.link || "",
        remark: newData.remark || "",
      };
    }
  },
  { immediate: true }
);

// 方法
const selectPriority = (priority) => {
  formData.value.priority = priority;
};

const handleSubmit = () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: "请填写必填项",
      icon: "none",
    });
    return;
  }

  // 验证价格格式
  if (formData.value.price && isNaN(parseFloat(formData.value.price))) {
    uni.showToast({
      title: "请输入正确的价格",
      icon: "none",
    });
    return;
  }

  const submitData = {
    ...formData.value,
    price: formData.value.price
      ? parseFloat(formData.value.price).toFixed(2)
      : "",
    productName: formData.value.productName.trim(),
    remark: formData.value.remark.trim(),
  };

  emit("submit", submitData);
};

// 重置表单
const resetForm = () => {
  formData.value = {
    productName: "",
    price: "",
    priority: "must_buy",
    status: "pending",
    link: "",
    remark: "",
  };
};

// 暴露方法给父组件
defineExpose({
  resetForm,
});
</script>

<style lang="scss" scoped>
.shopping-form {
  .form-section {
    background: white;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 24rpx;
      padding-bottom: 12rpx;
      border-bottom: 2rpx solid #f0f0f0;
    }

    .form-item {
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .item-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 12rpx;
        font-weight: 500;
      }

      .item-input {
        width: 100%;
        padding: 16rpx 20rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333;
        background: #fafafa;
        transition: all 0.3s;

        &:focus {
          border-color: #ff3b30;
          background: white;
        }
      }

      .item-textarea {
        width: 100%;
        min-height: 120rpx;
        padding: 16rpx 20rpx;
        border: 2rpx solid #e8e8e8;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333;
        background: #fafafa;
        resize: none;
        transition: all 0.3s;

        &:focus {
          border-color: #ff3b30;
          background: white;
        }
      }

      .priority-options {
        display: flex;
        gap: 12rpx;

        .priority-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20rpx 12rpx;
          border: 2rpx solid #e8e8e8;
          border-radius: 12rpx;
          background: #fafafa;
          transition: all 0.3s;

          &.active {
            border-color: #ff3b30;
            background: rgba(255, 59, 48, 0.1);

            .priority-label {
              color: #ff3b30;
              font-weight: 600;
            }
          }

          .priority-emoji {
            font-size: 32rpx;
            margin-bottom: 8rpx;
          }

          .priority-label {
            font-size: 24rpx;
            color: #666;
            text-align: center;
          }
        }
      }
    }
  }

  .form-actions {
    padding: 0 4rpx;

    .submit-btn {
      width: 100%;
      padding: 20rpx;
      background: linear-gradient(135deg, #ff3b30, #ff6b9d);
      color: white;
      border: none;
      border-radius: 16rpx;
      font-size: 32rpx;
      font-weight: 600;
      transition: all 0.3s;

      &:disabled {
        background: #e8e8e8;
        color: #8e8e93;
      }

      &:not(:disabled):active {
        transform: scale(0.98);
      }

      .btn-text {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
