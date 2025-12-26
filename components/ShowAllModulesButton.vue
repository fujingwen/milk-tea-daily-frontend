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
  >
    <view class="button-container" :style="customButtonStyle">
      <view class="button-content">
        <!-- 图标 -->
        <view class="button-icon" v-if="!isProcessing">
          <text class="icon-text">👁️</text>
        </view>

        <!-- 文本 -->
        <view class="button-text">
          <text class="title-text">{{ buttonText }}</text>
          <text class="subtitle-text">{{ hiddenCount }}个隐藏模块</text>
        </view>

        <!-- 进度指示器 -->
        <view
          v-if="isProcessing"
          class="progress-bar"
          :style="{ width: progress + '%' }"
        ></view>
      </view>
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
const progress = ref(0)

// 计算属性
const buttonStyle = computed(() => {
  return {
    transform: props.visible ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.9)',
    opacity: props.visible ? '1' : '0'
  }
})

const buttonText = computed(() => {
  if (isProcessing.value) {
    return '正在恢复...'
  }
  return '显示所有模块'
})

const customButtonStyle = computed(() => {
  return {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    boxShadow: '0 12rpx 32rpx rgba(102, 126, 234, 0.4)',
    height: '120rpx',
    width: '320rpx'
  }
})

// 方法
const handleClick = async (event) => {
  if (isAnimating.value || isProcessing.value) {
    return
  }

  // 触觉反馈
  vibrate.medium()

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
  bottom: 140rpx; /* 调整位置，避免与底部导航栏重叠 */
  left: 50%;
  transform: translateX(-50%) translateY(100%) scale(0.9);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1001;

  &.visible {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
  }

  &.animating {
    pointer-events: none;
  }

  .button-container {
    width: 320rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 60rpx;
    box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
    }
  }

  .button-content {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 0 24rpx;
    position: relative;
    width: 100%;
    height: 100%;

    .button-icon {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 30rpx;
      flex-shrink: 0;

      .icon-text {
        font-size: 32rpx;
      }
    }

    .button-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rpx;

      .title-text {
        font-size: 28rpx;
        font-weight: bold;
        color: white;
      }

      .subtitle-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4rpx;
      background: white;
      border-radius: 2rpx;
      transition: width 0.3s ease;
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .show-all-button {
    bottom: 120rpx;

    .button-content {
      padding: 0 20rpx;
      gap: 12rpx;

      .button-icon {
        width: 48rpx;
        height: 48rpx;
        border-radius: 24rpx;
      }
    }
  }
}
</style>