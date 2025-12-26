<template>
  <view class="menstruation-view">
    <view class="menstruation-calendar-wrapper">
      <MenstruationCalendar
        class="menstruation-calendar"
        :current-date="currentDate"
        :records="records"
        @date-click="onMenstruationDateClick"
        @add-record="addMenstruationRecord"
        @edit-record="editMenstruationRecord"
        @mark-period-start="markPeriodStart"
        @mark-period-end="markPeriodEnd"
      />
    </view>

    <!-- 录入功能 -->
    <view class="menstruation-actions card">
      <view class="actions-title">
        <text class="title-text">快速录入</text>
        <text class="selected-date" v-if="selectedDate">
          已选择：{{ formatDate(selectedDate, "MM月DD日") }}
        </text>
      </view>
      <view class="action-buttons">
        <view
          class="action-btn period-start"
          :class="{ disabled: !canMarkPeriodStart }"
          @click="quickMarkPeriodStart"
        >
          <text class="btn-icon">🌸</text>
          <text class="btn-text">月经来了</text>
        </view>
        <view
          class="action-btn period-end"
          :class="{ disabled: !canMarkPeriodEnd }"
          @click="quickMarkPeriodEnd"
        >
          <text class="btn-icon">✨</text>
          <text class="btn-text">月经走了</text>
        </view>
      </view>
      <view class="date-hint">
        <text class="hint-text">点击日历选择日期</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { formatDate } from "@/utils";
import MenstruationCalendar from "./MenstruationCalendar.vue";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "date-click",
  "add-record",
  "edit-record",
  "mark-period-start",
  "mark-period-end",
]);

const selectedDate = ref(null);

// 获取月经记录
const menstruationRecords = computed(() => {
  return props.records
    .filter((record) => record.moduleType === "menstruation")
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

// 检查是否可以标记月经开始
const canMarkPeriodStart = computed(() => {
  if (!selectedDate.value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 不能设置今天之后的日期
  if (selectedDate.value > today) return false;

  // 检查是否已经在10天内设置过月经开始
  const selectedDateStr = formatDate(selectedDate.value, "YYYY-MM-DD");
  const recentRecords = menstruationRecords.value.filter((record) => {
    const recordDate = new Date(record.startDate);
    const daysDiff = Math.abs(
      (selectedDate.value - recordDate) / (1000 * 3600 * 24)
    );
    return daysDiff <= 10;
  });

  return recentRecords.length === 0;
});

// 检查是否可以标记月经结束
const canMarkPeriodEnd = computed(() => {
  if (!selectedDate.value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 不能设置今天之后的日期
  if (selectedDate.value > today) return false;

  // 必须有未结束的月经记录
  const ongoingPeriod = menstruationRecords.value.find(
    (record) => !record.endDate || record.endDate === null
  );

  return !!ongoingPeriod;
});

const onMenstruationDateClick = (date) => {
  selectedDate.value = date;
  emit("date-click", date);
};

const addMenstruationRecord = (date) => {
  emit("add-record", date);
};

const editMenstruationRecord = (date) => {
  emit("edit-record", date);
};

const markPeriodStart = (date) => {
  emit("mark-period-start", date);
};

const markPeriodEnd = (date) => {
  emit("mark-period-end", date);
};

const quickMarkPeriodStart = () => {
  if (!canMarkPeriodStart.value) {
    if (!selectedDate.value) {
      uni.showToast({
        title: "请先在日历中选择日期",
        icon: "none",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate.value > today) {
      uni.showToast({
        title: "不能设置今天之后的日期",
        icon: "none",
      });
      return;
    }

    // 检查10天内是否有记录
    const selectedDateStr = formatDate(selectedDate.value, "YYYY-MM-DD");
    const recentRecords = menstruationRecords.value.filter((record) => {
      const recordDate = new Date(record.startDate);
      const daysDiff = Math.abs(
        (selectedDate.value - recordDate) / (1000 * 3600 * 24)
      );
      return daysDiff <= 10;
    });

    if (recentRecords.length > 0) {
      uni.showModal({
        title: "提示",
        content: `在${selectedDateStr}的10天内已有月经记录，是否要修改？`,
        success: (res) => {
          if (res.confirm) {
            markPeriodStart(selectedDate.value);
          }
        },
      });
      return;
    }

    return;
  }

  const targetDateStr = formatDate(selectedDate.value, "YYYY-MM-DD");

  uni.showModal({
    title: "开始经期",
    content: `确认 ${targetDateStr} 月经来了吗？`,
    success: (res) => {
      if (res.confirm) {
        markPeriodStart(selectedDate.value);
      }
    },
  });
};

const quickMarkPeriodEnd = () => {
  if (!canMarkPeriodEnd.value) {
    if (!selectedDate.value) {
      uni.showToast({
        title: "请先在日历中选择日期",
        icon: "none",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate.value > today) {
      uni.showToast({
        title: "不能设置今天之后的日期",
        icon: "none",
      });
      return;
    }

    const ongoingPeriod = menstruationRecords.value.find(
      (record) => !record.endDate || record.endDate === null
    );

    if (!ongoingPeriod) {
      uni.showToast({
        title: "没有进行中的月经记录",
        icon: "none",
      });
      return;
    }

    return;
  }

  const targetDateStr = formatDate(selectedDate.value, "YYYY-MM-DD");

  uni.showModal({
    title: "结束经期",
    content: `确认 ${targetDateStr} 月经走了吗？`,
    success: (res) => {
      if (res.confirm) {
        markPeriodEnd(selectedDate.value);
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.menstruation-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140rpx);

  .menstruation-calendar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 20rpx;

    .menstruation-calendar {
      max-height: 60vh;
      overflow: hidden;
    }
  }

  .menstruation-actions {
    flex-shrink: 0;
    margin-bottom: 20rpx;

    .actions-title {
      margin-bottom: 20rpx;

      .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }

      .selected-date {
        font-size: 26rpx;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 8rpx 16rpx;
        border-radius: 12rpx;
        display: inline-block;
      }
    }

    .action-buttons {
      display: flex;
      gap: 20rpx;

      .action-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30rpx 20rpx;
        border-radius: 16rpx;
        transition: all 0.3s;

        &.period-start {
          background: linear-gradient(135deg, #ff6b9d, #ff2d92);

          .btn-icon {
            font-size: 32rpx;
            margin-bottom: 8rpx;
          }

          .btn-text {
            font-size: 26rpx;
            color: white;
            font-weight: 500;
          }

          &.disabled {
            background: #e8e8e8;

            .btn-icon,
            .btn-text {
              color: #999;
            }
          }
        }

        &.period-end {
          background: linear-gradient(135deg, #667eea, #764ba2);

          .btn-icon {
            font-size: 32rpx;
            margin-bottom: 8rpx;
          }

          .btn-text {
            font-size: 26rpx;
            color: white;
            font-weight: 500;
          }

          &.disabled {
            background: #e8e8e8;

            .btn-icon,
            .btn-text {
              color: #999;
            }
          }
        }

        &:not(.disabled):active {
          transform: scale(0.95);
          opacity: 0.8;
        }

        &.disabled:active {
          transform: none;
        }
      }
    }

    .date-hint {
      margin-top: 16rpx;
      text-align: center;

      .hint-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

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
</style>
