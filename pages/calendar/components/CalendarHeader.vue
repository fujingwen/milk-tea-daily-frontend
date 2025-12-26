<template>
  <view class="calendar-header card">
    <view class="header-controls" v-if="viewMode !== 'menstruation'">
      <view class="nav-controls" v-if="viewMode === 'calendar'">
        <view class="nav-btn" @click="prevMonth">
          <text class="nav-icon">‹</text>
        </view>
        <text class="current-month"
          >{{ currentYear }}年{{ currentMonth }}月</text
        >
        <view class="nav-btn" @click="nextMonth">
          <text class="nav-icon">›</text>
        </view>
        <view class="today-btn" @click="goToToday">
          <text class="today-text">回今天</text>
        </view>
      </view>
      <view class="timeline-controls" v-else-if="viewMode === 'timeline'">
        <text class="timeline-title">时间轴</text>
        <view class="timeline-actions">
          <view class="action-btn" @click="scrollToToday">
            <text class="action-text">今天</text>
          </view>
        </view>
      </view>
    </view>

    <view class="view-switcher">
      <view
        class="switch-item"
        :class="{ active: viewMode === 'menstruation' }"
        @click="switchToMenstruation"
      >
        🌸 月经
      </view>
      <view
        class="switch-item"
        :class="{ active: viewMode === 'calendar' }"
        @click="switchToCalendar"
      >
        📅 日历
      </view>
      <view
        class="switch-item"
        :class="{ active: viewMode === 'timeline' }"
        @click="switchToTimeline"
      >
        📋 时间轴
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  viewMode: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "prev-month",
  "next-month",
  "go-to-today",
  "scroll-to-today",
  "switch-to-menstruation",
  "switch-to-calendar",
  "switch-to-timeline",
]);

const currentYear = computed(() => props.currentDate.getFullYear());
const currentMonth = computed(() => props.currentDate.getMonth() + 1);

const prevMonth = () => emit("prev-month");
const nextMonth = () => emit("next-month");
const goToToday = () => emit("go-to-today");
const scrollToToday = () => emit("scroll-to-today");
const switchToMenstruation = () => emit("switch-to-menstruation");
const switchToCalendar = () => emit("switch-to-calendar");
const switchToTimeline = () => emit("switch-to-timeline");
</script>

<style lang="scss" scoped>
.calendar-header {
  margin-bottom: 20rpx;

  .card {
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    padding: 24rpx;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
      transform: translateY(-2rpx);
    }
  }

  .header-controls {
    margin-bottom: 20rpx;

    .nav-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20rpx;

      .nav-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
        border-radius: 50%;
        transition: all 0.3s;
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);

        &:active {
          background: linear-gradient(135deg, #e2e6ea, #b7c0d1);
          transform: scale(0.95);
        }

        .nav-icon {
          font-size: 32rpx;
          color: #333;
          font-weight: bold;
        }
      }

      .current-month {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        background: linear-gradient(90deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
      }

      .today-btn {
        padding: 8rpx 16rpx;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 20rpx;
        box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
        transition: all 0.3s;

        &:active {
          transform: scale(0.95);
          box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.2);
        }

        .today-text {
          font-size: 24rpx;
          color: white;
          font-weight: 500;
        }
      }
    }

    .timeline-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .timeline-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .timeline-actions {
        .action-btn {
          padding: 12rpx 24rpx;
          background: #667eea;
          border-radius: 20rpx;

          .action-text {
            font-size: 26rpx;
            color: white;
          }
        }
      }
    }
  }

  .view-switcher {
    display: flex;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 6rpx;

    .switch-item {
      flex: 1;
      text-align: center;
      padding: 16rpx;
      font-size: 28rpx;
      color: #666;
      border-radius: 8rpx;
      transition: all 0.3s;

      &.active {
        background: white;
        color: #667eea;
        font-weight: 500;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
