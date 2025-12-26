<template>
  <view v-if="hasAnyReminder" class="today-reminders">
    <!-- 今日提醒卡片 -->
    <view class="reminders-card">
      <view class="reminders-header">
        <view class="header-left">
          <text class="header-icon">📋</text>
          <text class="header-title">今日提醒</text>
        </view>
        <text class="header-date">{{
          formatDate(Date.now(), "YYYY年MM月DD日")
        }}</text>
      </view>

      <!-- 天气信息和今日语录 -->
      <view class="weather-card" v-if="weatherInfo">
        <!-- 天气信息行 -->
        <view class="weather-row">
          <text class="weather-icon">{{ weatherInfo.emoji }}</text>
          <view class="weather-content">
            <text class="weather-temp">{{ weatherInfo.desc }} {{ weatherInfo.temp }}</text>
            <text class="weather-desc">{{ weatherInfo.tip }}</text>
          </view>
        </view>

        <!-- 今日语录 -->
        <view class="quote-section" v-if="dailyQuote">
          <view class="quote-divider"></view>
          <view class="quote-content">
            <text class="quote-icon">今日语录：</text>
            <text class="quote-text">{{ dailyQuote }}</text>
          </view>
        </view>
      </view>

      <!-- 待办事项提醒 -->
      <view class="todo-section" v-if="pendingTodos && pendingTodos.length > 0">
        <view class="section-header">
          <text class="section-icon">✅</text>
          <text class="section-title"
            >待办事项 ({{ pendingTodos.length }}项)</text
          >
        </view>
        <view class="todo-list">
          <view
            v-for="todo in pendingTodos.slice(0, 3)"
            :key="todo.recordId"
            class="todo-item"
            @click="goToTodoDetail(todo.recordId)"
          >
            <text class="todo-icon">📄</text>
            <view class="todo-content">
              <text class="todo-text">{{ todo.content }}</text>
              <text class="todo-days">{{ getTodoDaysText(todo) }}</text>
            </view>
            <view class="todo-status">
              <view class="action-buttons">
                <!-- 完成按钮 -->
                <view
                  class="action-button complete-button"
                  @click.stop="handleTodoComplete(todo)"
                >
                  <text class="action-icon">✓</text>
                </view>
                <!-- 关闭按钮 -->
                <view
                  class="action-button close-button"
                  @click.stop="handleTodoClose(todo)"
                >
                  <text class="action-icon">✕</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 显示更多提示 -->
        <view
          v-if="pendingTodos.length > 3"
          class="more-todos"
          @click="goToTodoList"
        >
          <text class="more-text"
            >还有 {{ pendingTodos.length - 3 }} 项待办事项</text
          >
          <text class="more-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 经期提醒卡片 -->
    <view class="menstruation-card" v-if="menstruationReminder">
      <text class="card-title">经期提醒</text>
      <view class="menstruation-item">
        <text class="menstruation-icon">{{ menstruationReminder.emoji }}</text>
        <view class="menstruation-content">
          <text class="menstruation-message">{{
            menstruationReminder.message
          }}</text>
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
            <text class="birthday-text"
              >{{ birthday.name }}的{{ birthday.age }}岁生日还有{{
                birthday.daysUntil
              }}天</text
            >
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
            <text class="holiday-text"
              >还有{{ holiday.daysUntil }}天就是{{ holiday.name
              }}{{ holiday.holiday ? "（放假）" : "" }}</text
            >
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 自定义确认弹窗 -->
  <view v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ modalData.title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-message">{{ modalData.message }}</text>
        <view class="note-section">
          <text class="note-label">备注：</text>
          <textarea
            v-model="noteInput"
            class="note-textarea"
            :placeholder="modalData.placeholder"
            maxlength="200"
          />
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-button cancel-button" @click="closeModal">取消</button>
        <button class="modal-button confirm-button" @click="confirmAction">{{ modalData.confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { formatDate } from "@/utils";

const props = defineProps({
  weatherInfo: Object,
  dailyQuote: String,
  menstruationReminder: Object,
  pendingTodos: Array,
  upcomingBirthdays: Array,
  upcomingHolidays: Array,
});

const emit = defineEmits(["todo-complete", "todo-close"]);

// 弹窗相关数据
const showConfirmModal = ref(false);
const noteInput = ref('');
const modalData = ref({});
const currentTodo = ref(null);
const currentAction = ref('');

// 关闭弹窗
const closeModal = () => {
  showConfirmModal.value = false;
  noteInput.value = '';
  modalData.value = {};
  currentTodo.value = null;
  currentAction.value = '';
};

// 确认操作
const confirmAction = () => {
  if (currentAction.value === 'complete') {
    const completeData = {
      ...currentTodo.value,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      completionNote: noteInput.value || '',
      status: 'completed'
    };
    emit("todo-complete", completeData);
    uni.showToast({
      title: '已完成',
      icon: 'success',
      duration: 1500
    });
  } else if (currentAction.value === 'close') {
    const closeData = {
      ...currentTodo.value,
      isCompleted: false,
      closedAt: new Date().toISOString(),
      closeNote: noteInput.value || '',
      status: 'closed'
    };
    emit("todo-close", closeData);
    uni.showToast({
      title: '已关闭',
      icon: 'success',
      duration: 1500
    });
  }
  closeModal();
};

// 计算属性
const hasAnyReminder = computed(() => {
  const hasReminder =
    props.weatherInfo ||
    props.dailyQuote ||
    (props.upcomingHolidays && props.upcomingHolidays.length > 0) ||
    (props.upcomingBirthdays && props.upcomingBirthdays.length > 0) ||
    (props.pendingTodos && props.pendingTodos.length > 0) ||
    props.menstruationReminder;

  console.log("TodayReminders hasAnyReminder:", {
    weather: !!props.weatherInfo,
    quote: !!props.dailyQuote,
    holidays: props.upcomingHolidays?.length || 0,
    birthdays: props.upcomingBirthdays?.length || 0,
    todos: props.pendingTodos?.length || 0,
    menstruation: !!props.menstruationReminder,
    result: hasReminder,
  });

  return hasReminder;
});

// 获取待办事项天数文本
const getTodoDaysText = (todo) => {
  if (todo.urgency === "overdue") {
    // 计算逾期天数
    if (todo.deadline) {
      const deadline = new Date(todo.deadline);
      const today = new Date();
      const daysDiff = Math.ceil(
        (today.getTime() - deadline.getTime()) / (1000 * 3600 * 24)
      );
      return `已逾期${daysDiff}天`;
    }
    return "已逾期";
  } else if (todo.urgency === "today") {
    return "今天截止";
  } else if (todo.urgency === "urgent") {
    if (todo.deadline) {
      const deadline = new Date(todo.deadline);
      const today = new Date();
      const daysDiff = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );
      return `${daysDiff}天后截止`;
    }
    return "即将截止";
  } else if (todo.deadline) {
    const deadline = new Date(todo.deadline);
    const today = new Date();
    const daysDiff = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
    return `${daysDiff}天后截止`;
  }
  return "无截止日期";
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
  console.log('handleTodoComplete called', todo);
  currentTodo.value = todo;
  currentAction.value = 'complete';
  modalData.value = {
    title: '完成待办事项',
    message: `确定要完成"${todo.content}"吗？`,
    placeholder: '输入完成备注（可选）...',
    confirmText: '完成'
  };
  showConfirmModal.value = true;
  console.log('showConfirmModal set to true');
};

const handleTodoClose = (todo) => {
  console.log('handleTodoClose called', todo);
  currentTodo.value = todo;
  currentAction.value = 'close';
  modalData.value = {
    title: '关闭待办事项',
    message: `确定要关闭"${todo.content}"吗？`,
    placeholder: '输入关闭原因（可选）...',
    confirmText: '关闭'
  };
  showConfirmModal.value = true;
  console.log('showConfirmModal set to true');
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
    padding: 20rpx;
    background: linear-gradient(135deg, #ffe4e6, #e6f3ff);
    border-radius: 16rpx;
    margin-bottom: 12rpx;

    .weather-row {
      display: flex;
      align-items: center;
      gap: 16rpx;

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

    .quote-section {
      .quote-divider {
        height: 1rpx;
        background: rgba(255, 255, 255, 0.3);
        margin: 16rpx 0 12rpx 0;
      }

      .quote-content {
        display: flex;
        align-items: flex-start;
        gap: 12rpx;

        .quote-icon {
          font-size: 24rpx;
          margin-top: 2rpx;
        }

        .quote-text {
          flex: 1;
          font-size: 26rpx;
          color: #555;
          line-height: 1.4;
          font-style: italic;
        }
      }
    }
  }

  .todo-section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 16rpx;

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
        align-items: flex-start;
        gap: 12rpx;
        padding: 12rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .todo-icon {
          font-size: 24rpx;
          margin-top: 4rpx;
        }

        .todo-content {
          flex: 1;

          .todo-text {
            font-size: 28rpx;
            color: #333;
            display: block;
            line-height: 1.4;
            margin-bottom: 4rpx;
          }

          .todo-days {
            font-size: 24rpx;
            color: #999;
            display: block;
            line-height: 1.2;
          }
        }

        .todo-status {
          display: flex;
          align-items: flex-start;
          margin-top: 4rpx;

          .action-buttons {
            display: flex;
            gap: 8rpx;

            .action-button {
              width: 32rpx;
              height: 32rpx;
              border-radius: 6rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s;
              cursor: pointer;

              .action-icon {
                font-size: 18rpx;
                font-weight: bold;
              }

              &:active {
                transform: scale(0.95);
              }

              &.complete-button {
                background: #4caf50;
                border: 2rpx solid #4caf50;

                .action-icon {
                  color: white;
                }

                &:hover {
                  background: #45a049;
                  border-color: #45a049;
                }
              }

              &.close-button {
                background: #f44336;
                border: 2rpx solid #f44336;

                .action-icon {
                  color: white;
                }

                &:hover {
                  background: #da190b;
                  border-color: #da190b;
                }
              }
            }
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

// 经期提醒卡片
.menstruation-card {
  background: linear-gradient(135deg, #ffe4e6, #f8e6ff);
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

  .menstruation-item {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .menstruation-icon {
      font-size: 32rpx;
    }

    .menstruation-content {
      flex: 1;

      .menstruation-message {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }

      .menstruation-info {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .calendar-icon {
          font-size: 20rpx;
        }

        .days-text {
          font-size: 24rpx;
          color: #ff2d92;
          font-weight: 600;
        }
      }
    }
  }
}

// 生日提醒卡片
.birthday-card {
  background: linear-gradient(135deg, #e6f3ff, #e6ffe6);
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
  background: linear-gradient(135deg, #ffe4e6, #f0e6ff);
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

// 自定义弹窗样式
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
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 32rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}

.modal-body {
  padding: 24rpx 32rpx;

  .modal-message {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 24rpx;
    white-space: pre-line;
  }

  .note-section {
    .note-label {
      font-size: 26rpx;
      color: #333;
      margin-bottom: 12rpx;
      display: block;
    }

    .note-textarea {
      width: 100%;
      min-height: 120rpx;
      padding: 16rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 8rpx;
      font-size: 26rpx;
      color: #333;
      background: #fafafa;
      resize: none;
      box-sizing: border-box;

      &:focus {
        border-color: #667eea;
        background: white;
        outline: none;
      }

      &::placeholder {
        color: #999;
      }
    }
  }
}

.modal-footer {
  padding: 16rpx 32rpx 32rpx;
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;

  .modal-button {
    padding: 16rpx 32rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    &.cancel-button {
      background: #f5f5f5;
      color: #666;

      &:hover {
        background: #e0e0e0;
      }

      &:active {
        background: #d0d0d0;
      }
    }

    &.confirm-button {
      background: #667eea;
      color: white;

      &:hover {
        background: #5a6fd8;
      }

      &:active {
        background: #4c63d2;
      }
    }
  }
}
</style>