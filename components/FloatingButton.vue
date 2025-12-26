<template>
  <view
    class="floating-button"
    :class="{
      'visible': visible,
      'animating': isAnimating
    }"
    :style="buttonStyle"
    @click="handleClick"
  >
    <view class="button-container" :style="customButtonStyle">
      <view class="button-content">
        <!-- 模块图标 -->
        <view
          class="button-icon"
          :style="{ backgroundColor: moduleConfig.color }"
        >
          <text class="icon-text">{{ moduleConfig.icon }}</text>
        </view>

        <!-- 模块信息 -->
        <view class="button-text">
          <text class="name-text">{{ moduleConfig.name }}</text>
          <text class="desc-text">点击恢复</text>
        </view>

        <!-- 展开指示器 -->
        <view class="expand-indicator">
          <text class="indicator-text">👆</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { vibrate } from '@/utils/hapticFeedback.js'

// Props定义
const props = defineProps({
  moduleConfig: {
    type: Object,
    required: true,
    validator: (config) => {
      return config &&
             typeof config.type === 'string' &&
             typeof config.name === 'string' &&
             typeof config.icon === 'string' &&
             typeof config.color === 'string'
    }
  },
  visible: {
    type: Boolean,
    default: false
  },
  onClick: {
    type: Function,
    required: true
  }
})

// 响应式数据
const isAnimating = ref(false)

// 计算属性
const buttonStyle = computed(() => {
  return {
    transform: props.visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.8)',
    opacity: props.visible ? '1' : '0'
  }
})

const customButtonStyle = computed(() => {
  return {
    background: `linear-gradient(135deg, ${props.moduleConfig.color}, #764ba2)`,
    border: 'none',
    boxShadow: '0 8rpx 24rpx rgba(0, 0, 0, 0.15)',
    height: '120rpx',
    width: '280rpx'
  }
})

// 方法
const handleClick = async () => {
  if (isAnimating.value) {
    return
  }

  // 触觉反馈
  vibrate.medium()

  isAnimating.value = true

  try {
    // 调用点击回调
    await props.onClick()
  } catch (error) {
    console.error('悬浮按钮点击处理失败:', error)
  } finally {
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
}

// 监听可见性变化
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // 延迟显示动画，避免与隐藏动画冲突
    setTimeout(() => {
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 300)
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
.floating-button {
  position: fixed;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%) translateX(100%) scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1000;

  &.visible {
    transform: translateY(-50%) translateX(0) scale(1);
    opacity: 1;
  }

  &.animating {
    pointer-events: none;
  }

  .button-container {
    width: 280rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 60rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }
  }

  .button-content {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 20rpx;
    width: 100%;
    height: 100%;

    .button-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

      .icon-text {
        font-size: 36rpx;
      }
    }

    .button-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;
      min-width: 0;

      .name-text {
        font-size: 28rpx;
        font-weight: bold;
        color: white;
      }

      .desc-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .expand-indicator {
      flex-shrink: 0;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20rpx;
      animation: bounce 2s ease-in-out infinite;

      .indicator-text {
        font-size: 20rpx;
      }
    }
  }
}

// 弹跳动画
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6rpx);
  }
  60% {
    transform: translateY(-3rpx);
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .floating-button {
    right: 16rpx;

    .button-content {
      padding: 12rpx 16rpx;

      .button-icon {
        width: 64rpx;
        height: 64rpx;
        border-radius: 32rpx;
      }

      .expand-indicator {
        width: 32rpx;
        height: 32rpx;
        border-radius: 16rpx;
      }
    }
  }
}

// 减少动画的无障碍支持
@media (prefers-reduced-motion: reduce) {
  .floating-button {
    transition-duration: 0.1s;
  }

  .expand-indicator {
    animation: none !important;
  }
}
</style>