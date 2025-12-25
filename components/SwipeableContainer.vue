<template>
  <view
    ref="containerRef"
    class="swipeable-container"
    :class="{
      'is-hidden': isHidden,
      'is-animating': isAnimating,
      'is-swiping': swipeState.isActive
    }"
    :style="containerStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <!-- 滑动指示器 -->
    <view
      class="swipe-indicator"
      :class="indicatorClass"
      :style="indicatorStyle"
    >
      <text class="indicator-text">{{ indicatorText }}</text>
      <text class="indicator-icon">👈</text>
    </view>

    <!-- 模块内容 -->
    <view class="module-content" :style="contentStyle">
      <slot></slot>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { vibrate } from '@/utils/hapticFeedback.js'

// Props定义
const props = defineProps({
  moduleType: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  onHide: {
    type: Function,
    required: true
  },
  onShow: {
    type: Function,
    required: true
  }
})

// 响应式数据
const swipeState = ref({
  startX: 0,
  currentX: 0,
  distance: 0,
  isActive: false,
  threshold: 100 // 滑动阈值100px
})

const isAnimating = ref(false)
const containerRef = ref(null)

// 计算属性
const containerStyle = computed(() => {
  if (props.isHidden) {
    return {
      transform: 'translateX(-100%)',
      opacity: '0'
    }
  }

  if (swipeState.value.isActive) {
    const distance = Math.min(swipeState.value.distance, swipeState.value.threshold + 50)
    return {
      transform: `translateX(-${distance}px)`,
      transition: 'none',
      '--swipe-distance': `-${distance}px`
    }
  }

  return {
    transform: 'translateX(0)',
    opacity: '1'
  }
})

const contentStyle = computed(() => {
  if (swipeState.value.isActive) {
    const progress = Math.min(swipeState.value.distance / swipeState.value.threshold, 1)
    return {
      opacity: 1 - progress * 0.3,
      transform: `scale(${1 - progress * 0.05})`
    }
  }
  return {}
})

const indicatorStyle = computed(() => {
  if (!swipeState.value.isActive) return {}

  const progress = Math.min(swipeState.value.distance / swipeState.value.threshold, 1)
  const isThresholdReached = swipeState.value.distance >= swipeState.value.threshold

  return {
    opacity: progress,
    transform: `translateY(-50%) translateX(-${swipeState.value.distance * 0.3}px) scale(${0.8 + progress * 0.2})`,
    background: isThresholdReached
      ? 'linear-gradient(135deg, #34c759, #30d158)'
      : 'linear-gradient(135deg, #ff6b9d, #ff8a80)'
  }
})

const indicatorClass = computed(() => {
  return {
    visible: swipeState.value.isActive && swipeState.value.distance > 20,
    'threshold-reached': swipeState.value.distance >= swipeState.value.threshold
  }
})

const indicatorText = computed(() => {
  if (swipeState.value.distance >= swipeState.value.threshold) {
    return '松开隐藏'
  }
  return '继续滑动隐藏'
})

// 触摸事件处理
const handleTouchStart = (event) => {
  if (props.isHidden || isAnimating.value) {
    return
  }

  const touch = event.touches[0]
  swipeState.value = {
    ...swipeState.value,
    startX: touch.clientX,
    currentX: touch.clientX,
    distance: 0,
    isActive: true
  }

  // 触觉反馈
  vibrate.light()
}

const handleTouchMove = (event) => {
  if (!swipeState.value.isActive || props.isHidden || isAnimating.value) {
    return
  }

  // 阻止页面滚动
  event.preventDefault()

  const touch = event.touches[0]
  const currentX = touch.clientX
  const distance = swipeState.value.startX - currentX

  // 只处理向左滑动
  if (distance > 0) {
    swipeState.value.currentX = currentX
    swipeState.value.distance = distance
  }
}

const handleTouchEnd = () => {
  if (!swipeState.value.isActive || props.isHidden) {
    resetSwipeState()
    return
  }

  const distance = swipeState.value.distance
  const threshold = swipeState.value.threshold

  if (distance >= threshold) {
    // 达到阈值，触发隐藏
    triggerHide()
  } else {
    // 未达到阈值，恢复原位置
    resetToOriginalPosition()
  }
}

const handleTouchCancel = () => {
  if (swipeState.value.isActive) {
    resetToOriginalPosition()
  }
}

// 触发隐藏
const triggerHide = async () => {
  // 触觉反馈
  vibrate.medium()

  // 重置滑动状态
  resetSwipeState()

  // 等待一帧确保状态更新
  await nextTick()

  try {
    // 直接应用隐藏样式，不使用动画管理器
    if (containerRef.value) {
      containerRef.value.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
      containerRef.value.style.transform = 'translateX(-100%)'
      containerRef.value.style.opacity = '0'

      // 等待动画完成
      setTimeout(async () => {
        // 调用隐藏回调
        await props.onHide()
      }, 300)
    } else {
      // 如果没有容器引用，直接调用回调
      await props.onHide()
    }
  } catch (error) {
    console.error('隐藏模块失败:', error)
    // 错误恢复
    if (containerRef.value) {
      containerRef.value.style.transform = 'translateX(0)'
      containerRef.value.style.opacity = '1'
    }
  }
}

// 恢复到原始位置
const resetToOriginalPosition = () => {
  // 添加弹性恢复动画
  if (containerRef.value) {
    containerRef.value.style.animation = 'bounceBack 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    setTimeout(() => {
      if (containerRef.value) {
        containerRef.value.style.animation = ''
      }
    }, 400)
  }

  resetSwipeState()
}

// 重置滑动状态
const resetSwipeState = () => {
  swipeState.value = {
    startX: 0,
    currentX: 0,
    distance: 0,
    isActive: false,
    threshold: 100
  }
}

// 监听隐藏状态变化
watch(() => props.isHidden, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }
})
</script>

<style lang="scss" scoped>
.swipeable-container {
  position: relative;
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
  transform-origin: left center;

  &.is-hidden {
    pointer-events: none;
    transform: translateX(-100%);
    opacity: 0;
  }

  &.is-animating {
    pointer-events: none;

    // 隐藏动画
    &.hiding {
      animation: slideOutLeft 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
    }

    // 显示动画
    &.showing {
      animation: slideInRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
    }
  }

  &.is-swiping {
    transition: none;

    .module-content {
      transition: opacity 0.1s ease-out, transform 0.1s ease-out;
    }

    .swipe-indicator {
      transition: opacity 0.1s ease-out, transform 0.1s ease-out;
    }
  }
}

// 滑出动画
@keyframes slideOutLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

// 滑入动画
@keyframes slideInRight {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

// 弹性恢复动画
@keyframes bounceBack {
  0% {
    transform: translateX(var(--swipe-distance, 0));
  }
  50% {
    transform: translateX(calc(var(--swipe-distance, 0) * -0.1));
  }
  100% {
    transform: translateX(0);
  }
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  right: 20rpx;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, #ff6b9d, #ff8a80);
  border-radius: 20rpx;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0.0, 0.2, 1),
              transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);

  &.visible {
    opacity: 1;
  }

  &.threshold-reached {
    background: linear-gradient(135deg, #34c759, #30d158);
    box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.3);

    .indicator-text {
      content: "松开隐藏";
    }

    .indicator-icon {
      animation: pulse 0.6s ease-in-out infinite alternate;
    }
  }

  .indicator-text {
    font-size: 24rpx;
    color: white;
    font-weight: 500;
    white-space: nowrap;
  }

  .indicator-icon {
    font-size: 20rpx;
    transition: transform 0.2s ease-out;
  }
}

// 指示器图标脉动动画
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
}

.module-content {
  width: 100%;
  transition: opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);

  .swipeable-container.is-swiping & {
    transform-origin: left center;
  }
}

// 性能优化：使用GPU加速
.swipeable-container,
.swipe-indicator,
.module-content {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

// 响应式设计
@media (max-width: 750rpx) {
  .swipe-indicator {
    right: 16rpx;
    padding: 10rpx 14rpx;

    .indicator-text {
      font-size: 22rpx;
    }

    .indicator-icon {
      font-size: 18rpx;
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .swipe-indicator {
    background: linear-gradient(135deg, #ff6b9d, #ff8a80);
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);

    &.threshold-reached {
      background: linear-gradient(135deg, #34c759, #30d158);
      box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.4);
    }
  }
}

// 减少动画的无障碍支持
@media (prefers-reduced-motion: reduce) {
  .swipeable-container,
  .swipe-indicator,
  .module-content {
    transition-duration: 0.1s;
    animation-duration: 0.1s;
  }

  @keyframes slideOutLeft {
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
}
</style>