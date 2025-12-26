<template>
  <view v-if="hasAnyReminder" class="today-reminders card">
    <view class="reminders-header">
      <text class="reminders-title">📋 今日提醒</text>
      <text class="reminders-date">{{
        formatDate(Date.now(), "YYYY年MM月DD日")
      }}</text>
    </view>

    <!-- 天气信息 -->
    <view class="weather-section" v-if="weatherInfo">
      <view class="weather-main">
        <text class="weather-emoji">{{ weatherInfo.emoji }}</text>
        <view class="weather-info">
          <text class="weather-desc"
            >{{ weatherInfo.desc }} {{ weatherInfo.temp }}</text
          >
          <text class="weather-tip">{{ weatherInfo.tip }}</text>
        </view>
      </view>
    </view>

    <!-- 姨妈期提醒 -->
    <view
      class="reminder-section menstruation-reminder"
      v-if="menstruationReminder"
    >
      <view class="reminder-item" @click="goToMenstruationRecord">
        <view class="reminder-icon menstruation">
          <text class="icon-emoji">{{ menstruationReminder.emoji }}</text>
        </view>
        <view class="reminder-content">
          <text class="reminder-text">{{ menstruationReminder.message }}</text>
        </view>
        <view class="reminder-arrow">›</view>
      </view>
    </view>

    <!-- 待办事项提醒 -->
    <view class="reminder-section todo-reminder" v-if="pendingTodos.length > 0">
      <view class="section-label">
        <text class="label-icon">✅</text>
        <text class="label-text">待办事项</text>
        <text class="label-count">{{ pendingTodos.length }}项</text>
        <text class="view-more" @click="goToTodoList">查看全部</text>
      </view>
      <view class="reminder-list">
        <view
          v-for="todo in pendingTodos.slice(0, 3)"
          :key="todo.recordId"
          class="reminder-item todo-item"
          :class="todo.urgency"
        >
          <view class="reminder-icon todo" :class="todo.urgency">
            <text class="icon-emoji">{{
              todo.urgency === "overdue" ? "⚠️" : "📝"
            }}</text>
          </view>
          <view class="reminder-content" @click="goToTodoDetail(todo.recordId)">
            <text class="reminder-text">{{ todo.content }}</text>
            <text class="reminder-sub" v-if="todo.deadline">{{
              todo.message
            }}</text>
          </view>
          <view class="todo-actions">
            <view class="complete-btn" @click.stop="handleTodoComplete(todo)">
              <text class="complete-icon">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 生日提醒 -->
    <view
      class="reminder-section birthday-reminder"
      v-if="upcomingBirthdays.length > 0"
    >
      <view class="section-label">
        <text class="label-icon">🎂</text>
        <text class="label-text">生日提醒</text>
        <text class="view-more" @click="goToBirthdayList">查看全部</text>
      </view>
      <view class="reminder-list">
        <view
          v-for="birthday in upcomingBirthdays.slice(0, 3)"
          :key="birthday.recordId"
          class="reminder-item"
          :class="{ today: birthday.daysUntil === 0 }"
          @click="goToBirthdayDetail(birthday.recordId)"
        >
          <view
            class="reminder-icon birthday"
            :class="{ today: birthday.daysUntil === 0 }"
          >
            <text class="icon-emoji">{{
              birthday.daysUntil === 0 ? "🎉" : "🎂"
            }}</text>
          </view>
          <view class="reminder-content">
            <text class="reminder-text">{{ birthday.name }}</text>
            <text class="reminder-sub">{{ birthday.message }}</text>
          </view>
          <view class="reminder-days">
            <text v-if="birthday.daysUntil === 0" class="days-today">今天</text>
            <text v-else class="days-count">{{ birthday.daysUntil }}天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 节日提醒 -->
    <view
      class="reminder-section holiday-reminder"
      v-if="upcomingHolidays.length > 0"
    >
      <view class="section-label">
        <text class="label-icon">🎊</text>
        <text class="label-text">节日提醒</text>
      </view>
      <view class="reminder-list">
        <view
          v-for="(holiday, index) in upcomingHolidays.slice(0, 3)"
          :key="index"
          class="reminder-item"
          :class="{ today: holiday.daysUntil === 0, holiday: holiday.holiday }"
        >
          <view
            class="reminder-icon holiday"
            :class="{ today: holiday.daysUntil === 0 }"
          >
            <text class="icon-emoji">{{ holiday.emoji }}</text>
          </view>
          <view class="reminder-content">
            <text class="reminder-text">{{ holiday.name }}</text>
            <text class="reminder-sub">{{ holiday.message }}</text>
          </view>
          <view class="reminder-days">
            <text v-if="holiday.daysUntil === 0" class="days-today">今天</text>
            <text v-else class="days-count">{{ holiday.daysUntil }}天</text>
          </view>
          <view v-if="holiday.holiday" class="holiday-badge">放假</view>
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
  return (
    props.weatherInfo ||
    props.upcomingHolidays.length > 0 ||
    props.upcomingBirthdays.length > 0 ||
    props.pendingTodos.length > 0 ||
    props.menstruationReminder
  );
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
  margin: 0 20rpx 20rpx;

  .reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .reminders-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .reminders-date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .weather-section {
    margin-bottom: 24rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 16rpx;

    .weather-main {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .weather-emoji {
        font-size: 48rpx;
      }

      .weather-info {
        flex: 1;

        .weather-desc {
          display: block;
          font-size: 32rpx;
          font-weight: bold;
          color: white;
          margin-bottom: 8rpx;
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

    .section-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 16rpx;

      .label-icon {
        font-size: 24rpx;
      }

      .label-text {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }

      .label-count {
        font-size: 22rpx;
        color: #999;
        margin-left: auto;
      }

      .view-more {
        font-size: 24rpx;
        color: #667eea;
        margin-left: auto;
      }
    }

    .reminder-list {
      .reminder-item {
        display: flex;
        align-items: center;
        gap: 16rpx;
        padding: 16rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        margin-bottom: 12rpx;
        transition: all 0.3s;

        &:last-child {
          margin-bottom: 0;
        }

        &:active {
          background: #f0f0f0;
        }

        &.today {
          background: linear-gradient(135deg, #ff6b9d, #ff8a80);

          .reminder-text,
          .reminder-sub {
            color: white;
          }

          .days-today {
            background: white;
            color: #ff6b9d;
          }
        }

        &.overdue {
          background: #fff5f5;
          border-left: 4rpx solid #ff4757;
        }

        &.urgent {
          background: #fff8e6;
          border-left: 4rpx solid #ffa502;
        }

        &.todo-item {
          .reminder-content {
            cursor: pointer;

            &:hover {
              opacity: 0.8;
            }
          }

          .todo-actions {
            flex-shrink: 0;

            .complete-btn {
              width: 56rpx;
              height: 56rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #34c759, #30d158);
              border-radius: 50%;
              transition: all 0.3s;
              cursor: pointer;

              &:hover {
                transform: scale(1.1);
                box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.3);
              }

              &:active {
                transform: scale(0.9);
              }

              .complete-icon {
                font-size: 24rpx;
                color: white;
                font-weight: bold;
              }
            }
          }
        }

        .reminder-icon {
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;

          &.todo {
            background: #e8f5e9;

            &.overdue {
              background: #ffebee;
            }

            &.urgent {
              background: #fff3e0;
            }
          }

          &.birthday {
            background: #fce4ec;

            &.today {
              background: rgba(255, 255, 255, 0.3);
            }
          }

          &.holiday {
            background: #e3f2fd;

            &.today {
              background: rgba(255, 255, 255, 0.3);
            }
          }

          &.menstruation {
            background: #fce4ec;
          }

          .icon-emoji {
            font-size: 28rpx;
          }
        }

        .reminder-content {
          flex: 1;
          min-width: 0;

          .reminder-text {
            display: block;
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .reminder-sub {
            font-size: 24rpx;
            color: #666;
          }
        }

        .reminder-days {
          flex-shrink: 0;

          .days-today {
            background: #ff6b9d;
            color: white;
            padding: 6rpx 12rpx;
            border-radius: 16rpx;
            font-size: 22rpx;
            font-weight: 500;
          }

          .days-count {
            font-size: 26rpx;
            color: #667eea;
            font-weight: bold;
          }
        }

        .reminder-arrow {
          font-size: 28rpx;
          color: #ccc;
          flex-shrink: 0;
        }

        .holiday-badge {
          background: #ff6b9d;
          color: white;
          padding: 4rpx 10rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          flex-shrink: 0;
        }
      }
    }
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}
</style>
