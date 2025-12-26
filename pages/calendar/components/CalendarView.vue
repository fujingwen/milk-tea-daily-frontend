<template>
  <view class="calendar-view">
    <!-- 日历主体 -->
    <view class="calendar-body card">
      <!-- 星期标题 -->
      <view class="weekdays">
        <text class="weekday" v-for="day in weekdays" :key="day">{{
          day
        }}</text>
      </view>

      <!-- 日期网格 -->
      <view class="calendar-grid">
        <view
          class="date-cell"
          :class="getDateCellClasses(date)"
          v-for="date in calendarDates"
          :key="date.getTime()"
          @click="selectDate(date)"
        >
          <text class="date-number">{{ date.getDate() }}</text>
          <view class="record-dots" v-if="hasRecord(date)">
            <view
              class="record-dot"
              :style="{ backgroundColor: getModuleColor(type) }"
              v-for="type in getDateRecordTypes(date)"
              :key="type"
            />
          </view>
          <!-- 周末/节假日标记 -->
          <view v-if="getWeekendText(date)" class="weekend-mark">
            <text class="weekend-text">{{ getWeekendText(date) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 选中日期的记录 -->
    <view class="selected-records" v-if="selectedDate">
      <view class="records-header">
        <text class="records-title">
          {{ formatDate(selectedDate, "MM月DD日") }} 的记录
        </text>
        <text class="records-count">({{ selectedDateRecords.length }}条)</text>
      </view>

      <view class="records-list">
        <view
          class="record-item card"
          v-for="record in selectedDateRecords"
          :key="record.recordId"
          @click="goToRecordDetail(record)"
        >
          <view class="record-header">
            <view class="record-module">
              <text class="module-emoji">{{
                getModuleConfig(record.moduleType).icon
              }}</text>
              <text class="module-name">{{
                getModuleConfig(record.moduleType).name
              }}</text>
            </view>
            <text class="record-time">{{
              formatDate(record.createTime, "HH:mm")
            }}</text>
          </view>
          <view class="record-content">
            <text class="content-text">{{ getRecordSummary(record) }}</text>
          </view>
        </view>
      </view>

      <view v-if="selectedDateRecords.length === 0" class="empty-records">
        <text class="empty-text">这一天还没有记录</text>
        <button class="add-btn" @click="addRecord">添加记录</button>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="calendar-stats card">
      <view class="stats-title">本月统计</view>
      <view class="stats-grid">
        <view class="stat-item" v-for="(count, type) in monthStats" :key="type">
          <text class="stat-emoji">{{ getModuleConfig(type).icon }}</text>
          <text class="stat-name">{{ getModuleConfig(type).name }}</text>
          <text class="stat-count">{{ count }}条</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { MODULE_CONFIG } from "@/utils/constants";
import { formatDate } from "@/utils";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  selectedDate: {
    type: Date,
    default: null,
  },
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["date-select", "record-detail", "add-record"]);

// 星期标题 - 周一开始
const weekdays = computed(() => ["一", "二", "三", "四", "五", "六", "日"]);

// 生成日历日期 - 周一开始
const calendarDates = computed(() => {
  const year = props.currentDate.getFullYear();
  const month = props.currentDate.getMonth();

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 计算这个月第一天是星期几（0=周日，1=周一，...，6=周六）
  // 转换为以周一为0的索引（0=周一，1=周二，...，6=周日）
  let firstDayOfWeek = firstDay.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 6; // 周日转为6
  else firstDayOfWeek = firstDayOfWeek - 1; // 周一转为0

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const endDate = new Date(lastDay);
  const lastDayOfWeek = lastDay.getDay();
  const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  endDate.setDate(endDate.getDate() + daysToAdd);

  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
});

const selectedDateRecords = computed(() => {
  if (!props.selectedDate) return [];

  const dateStr = props.selectedDate.toDateString();
  return props.records.filter((record) => {
    const recordDate = new Date(record.createTime).toDateString();
    return recordDate === dateStr;
  });
});

const monthStats = computed(() => {
  const year = props.currentDate.getFullYear();
  const month = props.currentDate.getMonth();

  const monthRecords = props.records.filter((record) => {
    const recordDate = new Date(record.createTime);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  });

  const stats = {};
  monthRecords.forEach((record) => {
    stats[record.moduleType] = (stats[record.moduleType] || 0) + 1;
  });

  return stats;
});

// 获取日期单元格样式类
const getDateCellClasses = (date) => {
  const classes = [];

  // 当前月
  if (!isSameMonth(date)) {
    classes.push("other-month");
  }

  // 今天
  if (isToday(date)) {
    classes.push("today");
  }

  // 选中日期
  if (isSelected(date)) {
    classes.push("selected");
  }

  // 有记录
  if (hasRecord(date)) {
    classes.push("has-record");
  }

  // 周末处理 - 统一颜色，根据是否上班决定标记
  if (isWeekend(date)) {
    classes.push("weekend");

    // 检查是否是周末工作日
    if (isWeekendWorkday(date)) {
      classes.push("weekend-workday");
    }

    // 检查是否是节假日
    if (isHoliday(date)) {
      classes.push("holiday");
    }
  }

  return classes.join(" ");
};

const isSameMonth = (date) => {
  return date.getMonth() === props.currentDate.getMonth();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isSelected = (date) => {
  return (
    props.selectedDate &&
    date.toDateString() === props.selectedDate.toDateString()
  );
};

const hasRecord = (date) => {
  const dateStr = date.toDateString();
  return props.records.some((record) => {
    const recordDate = new Date(record.createTime).toDateString();
    return recordDate === dateStr;
  });
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 周日或周六
};

const getWeekendText = (date) => {
  // 检查是否是周末工作日
  if (isWeekendWorkday(date)) {
    return "班";
  }

  // 检查是否是节假日
  if (isHoliday(date)) {
    const holidayInfo = getHolidayInfo(date);
    return holidayInfo ? holidayInfo.name : "休";
  }

  // 普通周末不显示标记
  return "";
};

// 获取节假日信息
const getHolidayInfo = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const holidays = [
    // 新年
    { month: 1, day: 1, name: "元旦" },
    // 春节（简单判断，不考虑农历）
    { month: 2, day: 10, name: "春节" },
    { month: 2, day: 11, name: "春节" },
    { month: 2, day: 12, name: "春节" },
    // 清明节
    { month: 4, day: 4, name: "清明" },
    { month: 4, day: 5, name: "清明" },
    { month: 4, day: 6, name: "清明" },
    // 劳动节
    { month: 5, day: 1, name: "劳动节" },
    // 端午节
    { month: 6, day: 10, name: "端午" },
    // 中秋节
    { month: 9, day: 15, name: "中秋" },
    { month: 9, day: 16, name: "中秋" },
    { month: 9, day: 17, name: "中秋" },
    // 国庆节
    { month: 10, day: 1, name: "国庆" },
    { month: 10, day: 2, name: "国庆" },
    { month: 10, day: 3, name: "国庆" },
    { month: 10, day: 4, name: "国庆" },
    { month: 10, day: 5, name: "国庆" },
    { month: 10, day: 6, name: "国庆" },
    { month: 10, day: 7, name: "国庆" },
  ];

  return holidays.find(
    (holiday) => holiday.month === month && holiday.day === day
  );
};

// 检查是否是节假日
const isHoliday = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 简单节假日判断（可以扩展更多节假日）
  const holidays = [
    // 新年
    { month: 1, day: 1 },
    // 春节（简单判断，不考虑农历）
    { month: 2, day: 10 },
    { month: 2, day: 11 },
    { month: 2, day: 12 },
    // 清明节
    { month: 4, day: 4 },
    { month: 4, day: 5 },
    { month: 4, day: 6 },
    // 劳动节
    { month: 5, day: 1 },
    // 端午节
    { month: 6, day: 10 },
    // 中秋节
    { month: 9, day: 15 },
    { month: 9, day: 16 },
    { month: 9, day: 17 },
    // 国庆节
    { month: 10, day: 1 },
    { month: 10, day: 2 },
    { month: 10, day: 3 },
    { month: 10, day: 4 },
    { month: 10, day: 5 },
    { month: 10, day: 6 },
    { month: 10, day: 7 },
  ];

  return holidays.some(
    (holiday) => holiday.month === month && holiday.day === day
  );
};

// 检查是否是周末工作日（这里简单返回false，可以根据实际需求扩展）
const isWeekendWorkday = (date) => {
  // 这里可以根据实际的周末工作日安排来返回true或false
  // 暂时返回false，后续可以根据用户设置或公司政策来判断
  return false;
};

const getDateRecordTypes = (date) => {
  const dateStr = date.toDateString();
  const dayRecords = props.records.filter((record) => {
    const recordDate = new Date(record.createTime).toDateString();
    return recordDate === dateStr;
  });

  const types = [...new Set(dayRecords.map((record) => record.moduleType))];
  return types.slice(0, 3); // 最多显示3个点
};

const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
};

const getModuleColor = (type) => {
  return getModuleConfig(type).color;
};

const getRecordSummary = (record) => {
  switch (record.moduleType) {
    case "mood":
      return `心情：${record.moodType} ${record.description || ""}`;
    case "weight":
      return `体重：${record.weightValue}kg`;
    case "milkTea":
      return `${record.name} - ${record.shop}`;
    case "account":
      return `${record.type === "income" ? "收入" : "支出"}：¥${record.amount}`;
    case "todo":
      return record.content;
    case "birthday":
      return `${record.name}的生日`;
    default:
      return "记录详情";
  }
};

const selectDate = (date) => {
  emit("date-select", date);
};

const goToRecordDetail = (record) => {
  emit("record-detail", record);
};

const addRecord = () => {
  emit("add-record");
};
</script>

<style lang="scss" scoped>
.calendar-view {
  .calendar-body {
    margin-bottom: 20rpx;
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    padding: 24rpx;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
      transform: translateY(-2rpx);
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 20rpx;

      .weekday {
        text-align: center;
        font-size: 28rpx;
        color: #666;
        padding: 12rpx 0;
      }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2rpx;

      .date-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: 8rpx;
        transition: all 0.3s;

        &.other-month {
          .date-number {
            color: #ccc;
          }
        }

        &.today {
          background: rgba(102, 126, 234, 0.1);

          .date-number {
            color: #667eea;
            font-weight: bold;
          }
        }

        &.selected {
          background: #667eea;

          .date-number {
            color: white;
          }
        }

        &.has-record {
          .date-number {
            font-weight: 500;
          }
        }

        // 周末样式 - 只改变文字颜色
        &.weekend {
          .date-number {
            color: #1976d2;
            font-weight: 600;
          }

          // 周末工作日 - 保持蓝色文字
          &.weekend-workday {
            .date-number {
              color: #1976d2;
              font-weight: 600;
            }
          }

          // 节假日 - 特殊背景和文字颜色
          &.holiday {
            background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);

            .date-number {
              color: #e65100;
              font-weight: 700;
            }
          }
        }

        .date-number {
          font-size: 28rpx;
          color: #333;
        }

        .record-dots {
          display: flex;
          gap: 4rpx;
          margin-top: 4rpx;

          .record-dot {
            width: 8rpx;
            height: 8rpx;
            border-radius: 50%;
          }
        }

        .weekend-mark {
          position: absolute;
          top: 4rpx;
          right: 4rpx;

          .weekend-text {
            font-size: 16rpx;
            color: #999;
            background: rgba(255, 255, 255, 0.8);
            padding: 2rpx 4rpx;
            border-radius: 4rpx;
          }
        }
      }
    }
  }

  .selected-records {
    margin-bottom: 20rpx;
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    padding: 24rpx;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
      transform: translateY(-2rpx);
    }

    .records-header {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 20rpx;

      .records-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .records-count {
        font-size: 24rpx;
        color: #666;
      }
    }

    .record-item {
      margin-bottom: 16rpx;

      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .record-module {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .module-emoji {
            font-size: 24rpx;
          }

          .module-name {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
          }
        }

        .record-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .record-content {
        .content-text {
          font-size: 28rpx;
          color: #666;
          line-height: 1.4;
        }
      }
    }

    .empty-records {
      text-align: center;
      padding: 60rpx 0;

      .empty-text {
        display: block;
        font-size: 28rpx;
        color: #999;
        margin-bottom: 30rpx;
      }

      .add-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 20rpx 40rpx;
        border-radius: 50rpx;
        font-size: 28rpx;
      }
    }
  }

  .calendar-stats {
    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;

      .stat-item {
        text-align: center;

        .stat-emoji {
          display: block;
          font-size: 32rpx;
          margin-bottom: 8rpx;
        }

        .stat-name {
          display: block;
          font-size: 24rpx;
          color: #666;
          margin-bottom: 4rpx;
        }

        .stat-count {
          display: block;
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
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
