<template>
  <view
    class="show-all-button"
    :class="{
      'visible': visible,
      'animating': isAnimating,
      'processing': isProcessing
    }"
    :style="buttonStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 按钮内容 -->
    <view class="button-content">
      <!-- 图标 -->
      <view class="button-icon">
        <text class="icon-emoji" v-if="!isProcessing">👁️</text>
        <view class="loading-spinner" v-else></view>
      </view>

      <!-- 文本 -->
      <view class="button-text">
        <text class="main-text">{{ buttonText }}</text>
        <text class="sub-text">{{ hiddenCount }}个隐藏模块</text>
      </view>

      <!-- 进度指示器 -->
      <view class="progress-indicator" v-if="isProcessing">
        <view
          class="progress-bar"
          :style="{ width: `${progress}%` }"
        ></view>
      </view>
    </view>

    <!-- 背景装饰 -->
    <view class="button-decoration">
      <view class="decoration-circle decoration-1"></view>
      <view class="decoration-circle decoration-2"></view>
      <view class="decoration-circle decoration-3"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { vibrate } from '@/utils/hapticFeedback.js'

// Props定义
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  hiddenCount: {
    type: Number,
    default: 0
  },
  onClick: {
    type: Function,
    required: true
  }
})

// 响应式数据
const isAnimating = ref(false)
const isProcessing = ref(false)
const isPressed = ref(false)
const progress = ref(0)

// 计算属性
const buttonStyle = computed(() => {
  const baseStyle = {
    transform: props.visible ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.9)',
    opacity: props.visible ? '1' : '0'
  }

  if (isPressed.value && !isProcessing.value) {
    baseStyle.transform += ' scale(0.95)'
  }

  return baseStyle
})

const buttonText = computed(() => {
  if (isProcessing.value) {
    return '正在恢复...'
  }
  return '显示所有模块'
})

// 方法
const handleClick = async (event) => {
  if (isAnimating.value || isProcessing.value) {
    return
  }

  // 触觉反馈
  try {
    // #ifdef APP-PLUS
    plus.device.vibrate(40)
    // #endif

    // #ifdef MP-WEIXIN
    wx.vibrateShort({
      type: 'heavy'
    })
    // #endif
  } catch (error) {
    // 忽略触觉反馈错误
  }

  isProcessing.value = true
  progress.value = 0

  try {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 20
      }
    }, 100)

    // 调用点击回调
    await props.onClick()

    // 完成进度
    progress.value = 100
    clearInterval(progressInterval)

    // 等待一小段时间显示完成状态
    await new Promise(resolve => setTimeout(resolve, 300))

  } catch (error) {
    console.error('显示所有模块失败:', error)

    // 显示错误状态
    progress.value = 0

    // 可以在这里添加错误提示
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isProcessing.value = false
    progress.value = 0
  }
}

const handleTouchStart = () => {
  if (!isAnimating.value && !isProcessing.value) {
    isPressed.value = true
  }
}

const handleTouchEnd = () => {
  isPressed.value = false
}

// 监听可见性变化
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // 延迟显示动画，确保平滑过渡
    setTimeout(() => {
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 400)
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
.show-all-button {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%) translateY(100%) scale(0.9);
  width: 320rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 60rpx;
  box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1001;
  cursor: pointer;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.2);

  &.visible {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }

  &.animating {
    pointer-events: none;
  }

  &.processing {
    pointer-events: none;

    .button-decoration {
      animation: processingPulse 2s ease-in-out infinite;
    }
  }

  &:active:not(.processing) {
    transform: translateX(-50%) translateY(0) scale(0.95);
  }

  // 悬停效果（仅在支持的设备上）
  @media (hover: hover) {
    &:hover:not(.processing) {
      box-shadow: 0 16rpx 40rpx rgba(102, 126, 234, 0.5);

      .button-decoration {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }
}

.button-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 0 24rpx;
  position: relative;
  z-index: 2;
  width: 100%;
}

.button-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  flex-shrink: 0;

  .icon-emoji {
    font-size: 32rpx;
  }

  .loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
    border-top: 3rpx solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.button-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  color: white;

  .main-text {
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1.2;
  }

  .sub-text {
    font-size: 22rpx;
    opacity: 0.8;
    line-height: 1.2;
  }
}

.progress-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0 0 60rpx 60rpx;
  overflow: hidden;

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ffffff, #f0f0f0);
    transition: width 0.3s ease-out;
    border-radius: 0 0 60rpx 60rpx;
  }
}

.button-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.6;
  transition: all 0.3s ease-out;
  pointer-events: none;

  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);

    &.decoration-1 {
      width: 80rpx;
      height: 80rpx;
      top: -20rpx;
      right: 20rpx;
      animation: float1 3s ease-in-out infinite;
    }

    &.decoration-2 {
      width: 60rpx;
      height: 60rpx;
      bottom: -10rpx;
      left: 30rpx;
      animation: float2 4s ease-in-out infinite;
    }

    &.decoration-3 {
      width: 40rpx;
      height: 40rpx;
      top: 50%;
      left: -10rpx;
      transform: translateY(-50%);
      animation: float3 2.5s ease-in-out infinite;
    }
  }
}

// 动画定义
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes processingPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes float1 {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10rpx) rotate(180deg);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(8rpx) rotate(-180deg);
  }
}

@keyframes float3 {
  0%, 100% {
    transform: translateY(-50%) translateX(0);
  }
  50% {
    transform: translateY(-50%) translateX(6rpx);
  }
}

// 入场动画
@keyframes slideUpFromBottom {
  0% {
    transform: translateX(-50%) translateY(100%) scale(0.9);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }
}

// 出场动画
@keyframes slideDownToBottom {
  0% {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(100%) scale(0.9);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .show-all-button {
    width: 280rpx;
    height: 100rpx;
    bottom: 30rpx;

    .button-content {
      padding: 0 20rpx;
      gap: 12rpx;
    }

    .button-icon {
      width: 48rpx;
      height: 48rpx;
      border-radius: 24rpx;

      .icon-emoji {
        font-size: 26rpx;
      }

      .loading-spinner {
        width: 26rpx;
        height: 26rpx;
        border-width: 2rpx;
      }
    }

    .button-text {
      .main-text {
        font-size: 26rpx;
      }

      .sub-text {
        font-size: 20rpx;
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .show-all-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.6);

    @media (hover: hover) {
      &:hover:not(.processing) {
        box-shadow: 0 16rpx 40rpx rgba(102, 126, 234, 0.7);
      }
    }
  }
}

// 减少动画的无障碍支持
@media (prefers-reduced-motion: reduce) {
  .show-all-button {
    transition-duration: 0.1s;
  }

  .button-decoration .decoration-circle {
    animation: none;
  }

  .loading-spinner {
    animation-duration: 2s;
  }

  @keyframes slideUpFromBottom {
    to {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes slideDownToBottom {
    to {
      transform: translateX(-50%) translateY(100%) scale(0.9);
      opacity: 0;
    }
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .show-all-button {
    border-width: 4rpx;
    border-color: #ffffff;

    .button-text {
      .main-text {
        font-weight: 700;
      }

      .sub-text {
        opacity: 1;
        font-weight: 500;
      }
    }
  }
}
</style>