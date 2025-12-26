<template>
  <view v-if="hasAnyReminder" class="today-reminders">
    <!-- 今日提醒卡片 -->
    <view class="reminders-card">
      <view class="reminders-header">
        <view class="header-left">
          <text class="header-icon">📋</text>
          <text class="header-title">今日提醒</text>
        </view>
        <text class="header-date">{{ formatDate(Date.now(), 'YYYY年MM月DD日') }}</text>
      </view>

      <!-- 天气信息 -->
      <view class="weather-card" v-if="weatherInfo">
        <text class="weather-icon">{{ weatherInfo.emoji }}</text>
        <view class="weather-content">
          <text class="weather-temp">{{ weatherInfo.desc }} {{ weatherInfo.temp }}</text>
          <text class="weather-desc">{{ weatherInfo.tip }}</text>
        </view>
      </view>

      <!-- 待办事项提醒 -->
      <view class="todo-section" v-if="pendingTodos && pendingTodos.length > 0">
        <view class="section-header">
          <text class="section-icon">✅</text>
          <text class="section-title">待办事项 ({{ pendingTodos.length }}项)</text>
        </view>
        <view class="todo-list">
          <view
            v-for="todo in pendingTodos.slice(0, 3)"
            :key="todo.recordId"
            class="todo-item"
            @click="goToTodoDetail(todo.recordId)"
          >
            <text class="todo-icon">📄</text>
            <text class="todo-text">{{ todo.content }}</text>
            <view class="todo-status">
              <view
                class="status-circle"
                :class="{ completed: todo.isCompleted }"
                @click.stop="handleTodoComplete(todo)"
              >
                <text v-if="todo.isCompleted" class="check-icon">✓</text>
              </view>
              <text class="todo-days">{{ getTodoDaysText(todo) }}</text>
            </view>
          </view>
        </view>
        <!-- 显示更多提示 -->
        <view v-if="pendingTodos.length > 3" class="more-todos" @click="goToTodoList">
          <text class="more-text">还有 {{ pendingTodos.length - 3 }} 项待办事项</text>
          <text class="more-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 生日提醒卡片 -->
    <view
      class="birthday-card"
      v-if="upcomingBirthdays && upcomingBirthdays.length > 0"
    >
      <text class="card-title">生日提醒</text>
      <view
        v-for="birthday in upcomingBirthdays.slice(0, 1)"
        :key="birthday.recordId"
        class="birthday-item"
        @click="goToBirthdayDetail(birthday.recordId)"
      >
        <text class="birthday-icon">🎂</text>
        <view class="birthday-content">
          <text class="birthday-name">{{ birthday.name }}</text>
          <view class="birthday-info">
            <text class="calendar-icon">📅</text>
            <text class="birthday-text">{{ birthday.name }}的{{ birthday.age }}岁生日还有{{ birthday.daysUntil }}天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 节日提醒卡片 -->
    <view
      class="holiday-card"
      v-if="upcomingHolidays && upcomingHolidays.length > 0"
    >
      <text class="card-title">节日提醒</text>
      <view
        v-for="(holiday, index) in upcomingHolidays.slice(0, 1)"
        :key="index"
        class="holiday-item"
      >
        <text class="holiday-icon">{{ holiday.emoji }}</text>
        <view class="holiday-content">
          <text class="holiday-name">{{ holiday.name }}</text>
          <view class="holiday-info">
            <text class="calendar-icon">📅</text>
            <text class="holiday-text">还有{{ holiday.daysUntil }}天就是{{ holiday.name }}{{ holiday.holiday ? '（放假）' : '' }}</text>
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

// 获取待办事项天数文本
const getTodoDaysText = (todo) => {
  if (todo.urgency === 'overdue') {
    // 计算逾期天数
    if (todo.deadline) {
      const deadline = new Date(todo.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - deadline.getTime()) / (1000 * 3600 * 24));
      return `已逾期${daysDiff}天`;
    }
    return '已逾期';
  } else if (todo.urgency === 'today') {
    return '今天截止';
  } else if (todo.urgency === 'urgent') {
    if (todo.deadline) {
      const deadline = new Date(todo.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return `${daysDiff}天后截止`;
    }
    return '即将截止';
  } else if (todo.deadline) {
    const deadline = new Date(todo.deadline);
    const today = new Date();
    const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return `${daysDiff}天后截止`;
  }
  return '无截止日期';
};

// 方法
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
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

// 今日提醒主卡片
.reminders-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .header-icon {
        font-size: 24rpx;
      }

      .header-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .header-date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .weather-card {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, #FFE4E6, #E6F3FF);
    border-radius: 16rpx;
    margin-bottom: 20rpx;

    .weather-icon {
      font-size: 48rpx;
    }

    .weather-content {
      flex: 1;

      .weather-temp {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 4rpx;
      }

      .weather-desc {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .todo-section {
    .section-header {

      margin-bottom: 16rpx;

      .section-left {
        display: flex;
        align-items: center;
        gap: 8rpx;
      }

      .section-icon {
        font-size: 24rpx;
      }

      .section-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .todo-list {
      .todo-item {
        display: flex;
        align-items: center;
        gap: 12rpx;
        padding: 12rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .todo-icon {
          font-size: 24rpx;
        }

        .todo-text {
          flex: 1;
          font-size: 28rpx;
          color: #333;
        }

        .todo-status {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .status-circle {
            width: 32rpx;
            height: 32rpx;
            border: 2rpx solid #ddd;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;

            &.completed {
              background: #4CAF50;
              border-color: #4CAF50;

              .check-icon {
                color: white;
                font-size: 20rpx;
                font-weight: bold;
              }
            }
          }

          .todo-days {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }

    .more-todos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 16rpx;
      margin-top: 12rpx;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12rpx;
      border: 1rpx dashed rgba(102, 126, 234, 0.3);
      transition: all 0.3s;

      &:active {
        background: rgba(102, 126, 234, 0.1);
      }

      .more-text {
        font-size: 26rpx;
        color: #667eea;
      }

      .more-arrow {
        font-size: 20rpx;
        color: #667eea;
      }
    }
  }
}

// 生日提醒卡片
.birthday-card {
  background: linear-gradient(135deg, #E6F3FF, #E6FFE6);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }

  .birthday-item {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .birthday-icon {
      font-size: 32rpx;
    }

    .birthday-content {
      flex: 1;

      .birthday-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }

      .birthday-info {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .calendar-icon {
          font-size: 20rpx;
        }

        .birthday-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

// 节日提醒卡片
.holiday-card {
  background: linear-gradient(135deg, #FFE4E6, #F0E6FF);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }

  .holiday-item {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .holiday-icon {
      font-size: 32rpx;
    }

    .holiday-content {
      flex: 1;

      .holiday-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }

      .holiday-info {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .calendar-icon {
          font-size: 20rpx;
        }

        .holiday-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}
</style>