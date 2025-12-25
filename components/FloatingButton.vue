<template>
  <view
    class="floating-button"
    :class="{
      'visible': visible,
      'animating': isAnimating
    }"
    :style="buttonStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 模块图标 -->
    <view
      class="button-icon"
      :style="{ backgroundColor: moduleConfig.color }"
    >
      <text class="icon-emoji">{{ moduleConfig.icon }}</text>
    </view>

    <!-- 模块信息 -->
    <view class="button-content">
      <text class="module-name">{{ moduleConfig.name }}</text>
      <text class="module-hint">点击恢复</text>
    </view>

    <!-- 展开指示器 -->
    <view class="expand-indicator">
      <text class="indicator-icon">👆</text>
    </view>

    <!-- 背景装饰 -->
    <view class="button-decoration"></view>
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
const isPressed = ref(false)
const showTime = ref(0)

// 计算属性
const buttonStyle = computed(() => {
  const baseStyle = {
    transform: props.visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.8)',
    opacity: props.visible ? '1' : '0'
  }

  if (isPressed.value) {
    baseStyle.transform += ' scale(0.95)'
  }

  return baseStyle
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

const handleTouchStart = () => {
  if (!isAnimating.value) {
    isPressed.value = true
  }
}

const handleTouchEnd = () => {
  isPressed.value = false
}

// 监听可见性变化
watch(() => props.visible, (newValue) => {
  if (newValue) {
    showTime.value = Date.now()
    // 延迟显示动画，避免与隐藏动画冲突
    setTimeout(() => {
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 300)
    }, 100)
  }
})

// 生命周期
onMounted(() => {
  if (props.visible) {
    showTime.value = Date.now()
  }
})
</script>

<style lang="scss" scoped>
.floating-button {
  position: fixed;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%) translateX(100%) scale(0.8);
  width: 280rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 60rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  gap: 16rpx;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1000;
  cursor: pointer;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.8);

  &.visible {
    transform: translateY(-50%) translateX(0) scale(1);
    opacity: 1;
  }

  &.animating {
    pointer-events: none;
  }

  &:active {
    transform: translateY(-50%) translateX(0) scale(0.95);
  }

  // 悬停效果（仅在支持的设备上）
  @media (hover: hover) {
    &:hover {
      box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);

      .expand-indicator {
        transform: translateY(-4rpx);
      }

      .button-decoration {
        opacity: 0.8;
        transform: scale(1.2);
      }
    }
  }
}

.button-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  .icon-emoji {
    font-size: 36rpx;
  }
}

.button-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;

  .module-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .module-hint {
    font-size: 22rpx;
    color: #666;
    line-height: 1.2;
  }
}

.expand-indicator {
  flex-shrink: 0;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20rpx;
  transition: transform 0.2s ease-out;

  .indicator-icon {
    font-size: 20rpx;
    animation: bounce 2s ease-in-out infinite;
  }
}

// 背景装饰
.button-decoration {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease-out;
  pointer-events: none;
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

// 入场动画
@keyframes slideInFromRight {
  0% {
    transform: translateY(-50%) translateX(100%) scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-50%) translateX(0) scale(1);
    opacity: 1;
  }
}

// 出场动画
@keyframes slideOutToRight {
  0% {
    transform: translateY(-50%) translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50%) translateX(100%) scale(0.8);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .floating-button {
    width: 260rpx;
    height: 100rpx;
    padding: 12rpx 16rpx;
    right: 16rpx;

    .button-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 32rpx;

      .icon-emoji {
        font-size: 28rpx;
      }
    }

    .button-content {
      .module-name {
        font-size: 26rpx;
      }

      .module-hint {
        font-size: 20rpx;
      }
    }

    .expand-indicator {
      width: 32rpx;
      height: 32rpx;
      border-radius: 16rpx;

      .indicator-icon {
        font-size: 18rpx;
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .floating-button {
    background: linear-gradient(135deg, #2c2c2e, #1c1c1e);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);

    .button-content {
      .module-name {
        color: #ffffff;
      }

      .module-hint {
        color: #a0a0a0;
      }
    }

    .expand-indicator {
      background: rgba(102, 126, 234, 0.2);
    }

    .button-decoration {
      background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    }

    @media (hover: hover) {
      &:hover {
        box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.4);
      }
    }
  }
}

// 减少动画的无障碍支持
@media (prefers-reduced-motion: reduce) {
  .floating-button {
    transition-duration: 0.1s;
  }

  .expand-indicator .indicator-icon {
    animation: none;
  }

  @keyframes slideInFromRight {
    to {
      transform: translateY(-50%) translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes slideOutToRight {
    to {
      transform: translateY(-50%) translateX(100%) scale(0.8);
      opacity: 0;
    }
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .floating-button {
    border-width: 3rpx;
    border-color: #000000;

    .button-content {
      .module-name {
        color: #000000;
        font-weight: 700;
      }

      .module-hint {
        color: #333333;
        font-weight: 500;
      }
    }
  }

  @media (prefers-color-scheme: dark) {
    .floating-button {
      border-color: #ffffff;

      .button-content {
        .module-name {
          color: #ffffff;
        }

        .module-hint {
          color: #cccccc;
        }
      }
    }
  }
}
</style>