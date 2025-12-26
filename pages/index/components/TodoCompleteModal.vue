<template>
  <view v-if="visible" class="modal-overlay" @click="handleClose">
    <view class="complete-modal" @click.stop>
      <view class="modal-header">
        <text class="modal-title">确认完成</text>
        <text class="modal-close" @click="handleClose">×</text>
      </view>

      <view class="modal-content">
        <view class="todo-info">
          <text class="todo-title">{{ todo?.content }}</text>
        </view>

        <view class="remark-section">
          <text class="remark-label">完成备注（可选）</text>
          <textarea
            class="remark-input"
            v-model="remark"
            placeholder="添加完成备注..."
            maxlength="100"
          />
          <text class="char-count">{{ remark.length }}/100</text>
        </view>
      </view>

      <view class="modal-actions">
        <button class="cancel-btn" @click="handleClose">取消</button>
        <button class="confirm-btn" @click="handleConfirm">确认完成</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  todo: Object
});

const emit = defineEmits(['close', 'confirm']);

const remark = ref('');

// 监听弹窗显示状态，重置备注
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    remark.value = '';
  }
});

const handleClose = () => {
  emit('close');
};

const handleConfirm = () => {
  emit('confirm', remark.value.trim());
};
</script>

<style lang="scss" scoped>
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

.complete-modal {
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

    .todo-info {
      margin-bottom: 30rpx;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;

      .todo-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        line-height: 1.4;
      }
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
  .complete-modal {
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

      .todo-info {
        .todo-title {
          font-size: 26rpx;
        }
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
  .complete-modal {
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
      .todo-info {
        background: #1c1c1e;

        .todo-title {
          color: #ffffff;
        }
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