<template>
  <view v-if="hasAnyReminder" class="today-reminders">
    <!-- 简化版本测试 -->
    <view class="test-card">
      <view class="reminders-header">
        <text class="header-title">📋 今日提醒</text>
        <text class="header-date">{{ formatDate(Date.now(), 'YYYY年MM月DD日') }}</text>
      </view>

      <!-- 天气信息 -->
      <view class="weather-section" v-if="weatherInfo">
        <view class="weather-card">
          <text class="weather-emoji">{{ weatherInfo.emoji }}</text>
          <view class="weather-info">
            <text class="weather-desc">{{ weatherInfo.desc }} {{ weatherInfo.temp }}</text>
            <text class="weather-tip">{{ weatherInfo.tip }}</text>
          </view>
        </view>
      </view>

      <!-- 待办事项提醒 -->
      <view class="reminder-section" v-if="pendingTodos && pendingTodos.length > 0">
        <text class="section-title">✅ 待办事项 ({{ pendingTodos.length }}项)</text>
        <view class="todo-list">
          <view
            v-for="todo in pendingTodos.slice(0, 3)"
            :key="todo.recordId"
            class="todo-item"
            @click="goToTodoDetail(todo.recordId)"
          >
            <text class="todo-icon">{{ todo.urgency === 'overdue' ? '⚠️' : '📝' }}</text>
            <view class="todo-content">
              <text class="todo-text">{{ todo.content }}</text>
              <text class="todo-message">{{ todo.message }}</text>
            </view>
            <view class="todo-action" @click.stop="handleTodoComplete(todo)">
              <text class="action-text">✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 生日提醒 -->
      <view class="reminder-section" v-if="upcomingBirthdays && upcomingBirthdays.length > 0">
        <text class="section-title">🎂 生日提醒</text>
        <view class="birthday-list">
          <view
            v-for="birthday in upcomingBirthdays.slice(0, 3)"
            :key="birthday.recordId"
            class="birthday-item"
            @click="goToBirthdayDetail(birthday.recordId)"
          >
            <text class="birthday-icon">{{ birthday.daysUntil === 0 ? '🎉' : '🎂' }}</text>
            <view class="birthday-content">
              <text class="birthday-name">{{ birthday.name }}</text>
              <text class="birthday-message">{{ birthday.message }}</text>
            </view>
            <text class="birthday-days">{{ birthday.daysUntil === 0 ? '今天' : birthday.daysUntil + '天' }}</text>
          </view>
        </view>
      </view>

      <!-- 节日提醒 -->
      <view class="reminder-section" v-if="upcomingHolidays && upcomingHolidays.length > 0">
        <text class="section-title">🎊 节日提醒</text>
        <view class="holiday-list">
          <view
            v-for="(holiday, index) in upcomingHolidays.slice(0, 3)"
            :key="index"
            class="holiday-item"
          >
            <text class="holiday-icon">{{ holiday.emoji }}</text>
            <view class="holiday-content">
              <text class="holiday-name">{{ holiday.name }}</text>
              <text class="holiday-message">{{ holiday.message }}</text>
            </view>
            <text class="holiday-days">{{ holiday.daysUntil === 0 ? '今天' : holiday.daysUntil + '天' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils";

const props = defineProps({
  weatherInfo: Object,
  menstruationReminder: Object,
  pendingTodos: Array,
  upcomingBirthdays: Array,
  upcomingHolidays: Array,
});

const emit = defineEmits(["todo-complete"]);

// 计算属性
const hasAnyReminder = computed(() => {
  const hasReminder = (
    props.weatherInfo ||
    (props.upcomingHolidays && props.upcomingHolidays.length > 0) ||
    (props.upcomingBirthdays && props.upcomingBirthdays.length > 0) ||
    (props.pendingTodos && props.pendingTodos.length > 0) ||
    props.menstruationReminder
  );

  console.log('TodayReminders hasAnyReminder:', {
    weather: !!props.weatherInfo,
    holidays: props.upcomingHolidays?.length || 0,
    birthdays: props.upcomingBirthdays?.length || 0,
    todos: props.pendingTodos?.length || 0,
    menstruation: !!props.menstruationReminder,
    result: hasReminder
  });

  return hasReminder;
});

// 方法
const goToMenstruationRecord = () => {
  uni.navigateTo({
    url: `/pages/record/add?type=menstruation`,
  });
};

const goToTodoDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${recordId}`,
  });
};

const goToTodoList = () => {
  uni.navigateTo({
    url: "/pages/todo/list",
  });
};

const goToBirthdayList = () => {
  uni.navigateTo({
    url: "/pages/birthday/list",
  });
};

const goToBirthdayDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/birthday/detail?id=${recordId}`,
  });
};

const handleTodoComplete = (todo) => {
  emit("todo-complete", todo);
};
</script>

<style lang="scss" scoped>
.today-reminders {
  margin-bottom: 20rpx;
  padding: 0 20rpx;

  .test-card {
    background: white;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    margin-bottom: 20rpx;
  }

  .reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #eee;

    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff6b9d;
    }

    .header-date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .weather-section {
    margin-bottom: 24rpx;

    .weather-card {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 20rpx;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 16rpx;

      .weather-emoji {
        font-size: 48rpx;
      }

      .weather-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .weather-desc {
          font-size: 32rpx;
          font-weight: bold;
          color: white;
        }

        .weather-tip {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .reminder-section {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 16rpx;
      display: block;
    }
  }

  .todo-list, .birthday-list, .holiday-list {
    .todo-item, .birthday-item, .holiday-item {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .todo-icon, .birthday-icon, .holiday-icon {
        font-size: 28rpx;
        margin-right: 16rpx;
        width: 40rpx;
        text-align: center;
      }

      .todo-content, .birthday-content, .holiday-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4rpx;

        .todo-text, .birthday-name, .holiday-name {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }

        .todo-message, .birthday-message, .holiday-message {
          font-size: 24rpx;
          color: #666;
        }
      }

      .todo-action {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: #34c759;
        display: flex;
        align-items: center;
        justify-content: center;

        .action-text {
          color: white;
          font-size: 24rpx;
          font-weight: bold;
        }
      }

      .birthday-days, .holiday-days {
        font-size: 26rpx;
        color: #ff6b9d;
        font-weight: bold;
        margin-left: 16rpx;
      }
    }
  }
}
</style>