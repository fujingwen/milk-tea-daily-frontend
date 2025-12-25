<template>
  <view class="complete-button-container">
    <!-- 完成按钮 -->
    <view
      class="complete-button"
      :class="{ 'completed': isCompleted }"
      @click="handleComplete"
    >
      <text class="complete-icon">{{ isCompleted ? '✓' : '○' }}</text>
      <text class="complete-text">{{ isCompleted ? '已完成' : '完成' }}</text>
    </view>

    <!-- 二次确认弹窗 -->
    <view v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
      <view class="confirm-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认完成</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>

        <view class="modal-content">
          <text class="confirm-text">确定要标记为已完成吗？</text>

          <!-- 备注输入 -->
          <view class="remark-section">
            <text class="remark-label">完成备注（可选）</text>
            <textarea
              class="remark-input"
              v-model="completeRemark"
              placeholder="添加完成备注..."
              maxlength="100"
            />
            <text class="char-count">{{ completeRemark.length }}/100</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="confirmComplete">确认完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { vibrate } from '@/utils/hapticFeedback.js'

// Props定义
const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  onComplete: {
    type: Function,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const showConfirmModal = ref(false)
const completeRemark = ref('')

// 方法
const handleComplete = () => {
  if (props.disabled || props.isCompleted) {
    return
  }

  // 触觉反馈
  vibrate.light()

  // 显示确认弹窗
  showConfirmModal.value = true
}

const confirmComplete = async () => {
  try {
    // 调用完成回调
    await props.onComplete({
      isCompleted: true,
      completeRemark: completeRemark.value.trim(),
      completeTime: Date.now()
    })

    // 触觉反馈
    vibrate.success()

    // 关闭弹窗
    closeModal()

    uni.showToast({
      title: '已标记为完成',
      icon: 'success'
    })
  } catch (error) {
    console.error('完成操作失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

const closeModal = () => {
  showConfirmModal.value = false
  completeRemark.value = ''
}
</script>

<style lang="scss" scoped>
.complete-button-container {
  position: relative;
}

.complete-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #34c759, #30d158);
  border-radius: 20rpx;
  transition: all 0.3s;
  cursor: pointer;
  min-width: 120rpx;
  justify-content: center;

  &:active {
    transform: scale(0.95);
  }

  &.completed {
    background: linear-gradient(135deg, #8e8e93, #aeaeb2);

    .complete-text {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .complete-icon {
    font-size: 24rpx;
    color: white;
    font-weight: bold;
  }

  .complete-text {
    font-size: 24rpx;
    color: white;
    font-weight: 500;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.confirm-modal {
  width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  margin: 0 40rpx;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .modal-close {
      font-size: 40rpx;
      color: #999;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .modal-content {
    padding: 40rpx;

    .confirm-text {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 30rpx;
      text-align: center;
    }

    .remark-section {
      .remark-label {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .remark-input {
        width: 100%;
        min-height: 120rpx;
        padding: 20rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 12rpx;
        font-size: 26rpx;
        background: #f8f9fa;
        resize: none;
        line-height: 1.5;
      }

      .char-count {
        display: block;
        text-align: right;
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }

  .modal-actions {
    display: flex;
    gap: 20rpx;
    padding: 0 40rpx 40rpx;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    .confirm-btn {
      background: #34c759;
      color: white;
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .confirm-modal {
    width: 90%;
    margin: 0 5%;

    .modal-header {
      padding: 24rpx 30rpx;

      .modal-title {
        font-size: 28rpx;
      }
    }

    .modal-content {
      padding: 30rpx;

      .confirm-text {
        font-size: 26rpx;
      }
    }

    .modal-actions {
      padding: 0 30rpx 30rpx;

      .cancel-btn,
      .confirm-btn {
        height: 70rpx;
        font-size: 26rpx;
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .confirm-modal {
    background: #2c2c2e;

    .modal-header {
      border-bottom-color: #3a3a3c;

      .modal-title {
        color: #ffffff;
      }

      .modal-close {
        color: #8e8e93;
      }
    }

    .modal-content {
      .confirm-text {
        color: #ffffff;
      }

      .remark-section {
        .remark-label {
          color: #8e8e93;
        }

        .remark-input {
          background: #1c1c1e;
          border-color: #3a3a3c;
          color: #ffffff;
        }

        .char-count {
          color: #8e8e93;
        }
      }
    }

    .modal-actions {
      .cancel-btn {
        background: #3a3a3c;
        color: #ffffff;
      }
    }
  }
}
</style>