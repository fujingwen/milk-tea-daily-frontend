<template>
  <view class="calendar-page">
    <!-- 日历头部 -->
    <view class="calendar-header card">
      <view class="header-controls">
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
        </view>
        <view class="timeline-controls" v-else>
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

    <!-- 日历视图 -->
    <view v-if="viewMode === 'calendar'" class="calendar-view">
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
            :class="{
              'other-month': !isSameMonth(date),
              today: isToday(date),
              selected: isSelected(date),
              'has-record': hasRecord(date),
            }"
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
          </view>
        </view>
      </view>

      <!-- 选中日期的记录 -->
      <view class="selected-records" v-if="selectedDate">
        <view class="records-header">
          <text class="records-title">
            {{ formatDate(selectedDate, "MM月DD日") }} 的记录
          </text>
          <text class="records-count"
            >({{ selectedDateRecords.length }}条)</text
          >
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
          <view
            class="stat-item"
            v-for="(count, type) in monthStats"
            :key="type"
          >
            <text class="stat-emoji">{{ getModuleConfig(type).icon }}</text>
            <text class="stat-name">{{ getModuleConfig(type).name }}</text>
            <text class="stat-count">{{ count }}条</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间轴视图 -->
    <view v-else class="timeline-view">
      <scroll-view
        class="timeline-scroll"
        scroll-y
        :scroll-top="scrollTop"
        @scroll="onTimelineScroll"
        :scroll-with-animation="true"
      >
        <view class="timeline-container">
          <view
            v-for="dayData in timelineData"
            :key="dayData.date"
            class="timeline-day"
            :class="{ 'is-today': dayData.isToday }"
            :id="`day-${dayData.dateStr}`"
          >
            <!-- 日期标题 -->
            <view class="day-header">
              <view class="date-info">
                <text class="date-main">{{ dayData.dayText }}</text>
                <text class="date-sub">{{ dayData.weekText }}</text>
              </view>
              <view class="day-stats">
                <text class="record-count"
                  >{{ dayData.records.length }}条记录</text
                >
              </view>
            </view>

            <!-- 记录列表 -->
            <view class="day-records" v-if="dayData.records.length > 0">
              <view
                v-for="record in dayData.records"
                :key="record.recordId"
                class="timeline-record"
                @click="goToRecordDetail(record)"
              >
                <view class="record-time-line">
                  <view
                    class="time-dot"
                    :style="{
                      backgroundColor: getModuleColor(record.moduleType),
                    }"
                  ></view>
                  <view class="time-text">{{
                    formatDate(record.createTime, "HH:mm")
                  }}</view>
                </view>
                <view class="record-card">
                  <view class="record-header">
                    <view class="record-module">
                      <text class="module-emoji">{{
                        getModuleConfig(record.moduleType).icon
                      }}</text>
                      <text class="module-name">{{
                        getModuleConfig(record.moduleType).name
                      }}</text>
                    </view>
                  </view>
                  <view class="record-content">
                    <text class="content-text">{{
                      getRecordSummary(record)
                    }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 空记录 -->
            <view v-else class="day-empty">
              <text class="empty-text">这一天没有记录</text>
            </view>
          </view>

          <!-- 加载更多 -->
          <view class="timeline-footer">
            <view v-if="hasMoreDays" class="load-more" @click="loadMoreDays">
              <text class="load-text">加载更多</text>
            </view>
            <view v-else class="no-more">
              <text class="no-more-text">没有更多记录了</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRecordStore } from "@/stores";
import { MODULE_CONFIG } from "@/utils/constants";
import { formatDate } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const currentDate = ref(new Date());
const selectedDate = ref(new Date());
const viewMode = ref("calendar"); // 'calendar' 或 'timeline'
const scrollTop = ref(0);
const timelineDays = ref(30); // 时间轴显示的天数
const hasMoreDays = ref(true);

// 计算属性
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth() + 1);

const weekdays = computed(() => ["日", "一", "二", "三", "四", "五", "六"]);

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 获取日历显示的开始和结束日期
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
});

const selectedDateRecords = computed(() => {
  if (!selectedDate.value) return [];

  const dateStr = selectedDate.value.toDateString();
  return recordStore.records.filter((record) => {
    const recordDate = new Date(record.createTime).toDateString();
    return recordDate === dateStr;
  });
});

const monthStats = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const monthRecords = recordStore.records.filter((record) => {
    const recordDate = new Date(record.createTime);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  });

  const stats = {};
  monthRecords.forEach((record) => {
    stats[record.moduleType] = (stats[record.moduleType] || 0) + 1;
  });

  return stats;
});

// 时间轴数据
const timelineData = computed(() => {
  const today = new Date();
  const days = [];

  for (let i = 0; i < timelineDays.value; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dateStr = date.toDateString();
    const dayRecords = recordStore.records
      .filter((record) => {
        const recordDate = new Date(record.createTime).toDateString();
        return recordDate === dateStr;
      })
      .sort((a, b) => b.createTime - a.createTime); // 按时间倒序

    const isToday = date.toDateString() === today.toDateString();
    const dayText = isToday ? "今天" : formatDate(date.getTime(), "MM月DD日");
    const weekText = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
      date.getDay()
    ];

    days.push({
      date: date.getTime(),
      dateStr: date.toDateString(),
      dayText,
      weekText,
      isToday,
      records: dayRecords,
    });
  }

  return days;
});

// 方法
const isSameMonth = (date) => {
  return date.getMonth() === currentDate.value.getMonth();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isSelected = (date) => {
  return (
    selectedDate.value &&
    date.toDateString() === selectedDate.value.toDateString()
  );
};

const hasRecord = (date) => {
  const dateStr = date.toDateString();
  return recordStore.records.some((record) => {
    const recordDate = new Date(record.createTime).toDateString();
    return recordDate === dateStr;
  });
};

const getDateRecordTypes = (date) => {
  const dateStr = date.toDateString();
  const dayRecords = recordStore.records.filter((record) => {
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

const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const switchToCalendar = () => {
  viewMode.value = "calendar";
};

const switchToTimeline = () => {
  viewMode.value = "timeline";
};

const scrollToToday = () => {
  nextTick(() => {
    scrollTop.value = 0;
  });
};

const onTimelineScroll = (e) => {
  // 可以在这里处理滚动事件，比如懒加载
};

const loadMoreDays = () => {
  if (timelineDays.value >= 365) {
    hasMoreDays.value = false;
    return;
  }

  timelineDays.value += 30;

  if (timelineDays.value >= 365) {
    hasMoreDays.value = false;
  }
};

const goToRecordDetail = (record) => {
  if (record.moduleType === "birthday") {
    uni.navigateTo({
      url: `/pages/birthday/detail?id=${record.recordId}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/record/detail?id=${record.recordId}`,
    });
  }
};

const addRecord = () => {
  uni.navigateTo({
    url: "/pages/record/add",
  });
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.calendar-header {
  margin-bottom: 20rpx;

  .header-controls {
    margin-bottom: 20rpx;

    .nav-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .nav-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 50%;
        transition: all 0.3s;

        &:active {
          background: #e8e8e8;
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

// 日历视图样式
.calendar-view {
  .calendar-body {
    margin-bottom: 20rpx;

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
      }
    }
  }

  .selected-records {
    margin-bottom: 20rpx;

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

// 时间轴视图样式
.timeline-view {
  height: calc(100vh - 200rpx);

  .timeline-scroll {
    height: 100%;
  }

  .timeline-container {
    padding-bottom: 40rpx;
  }

  .timeline-day {
    margin-bottom: 40rpx;
    position: relative;

    &.is-today {
      .day-header {
        .date-info {
          .date-main {
            color: #667eea;
            font-weight: bold;
          }
        }
      }
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 0 20rpx;

      .date-info {
        display: flex;
        align-items: baseline;
        gap: 12rpx;

        .date-main {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }

        .date-sub {
          font-size: 24rpx;
          color: #666;
        }
      }

      .day-stats {
        .record-count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .day-records {
      position: relative;
      padding-left: 80rpx;

      &::before {
        content: "";
        position: absolute;
        left: 30rpx;
        top: 0;
        bottom: 0;
        width: 2rpx;
        background: #e0e0e0;
      }

      .timeline-record {
        display: flex;
        margin-bottom: 24rpx;
        position: relative;

        .record-time-line {
          display: flex;
          align-items: center;
          gap: 16rpx;
          min-width: 120rpx;
          position: absolute;
          left: -80rpx;
          top: 20rpx;

          .time-dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            border: 3rpx solid white;
            box-shadow: 0 0 0 2rpx #e0e0e0;
            position: relative;
            z-index: 2;
          }

          .time-text {
            font-size: 24rpx;
            color: #666;
            font-weight: 500;
          }
        }

        .record-card {
          flex: 1;
          background: white;
          border-radius: 16rpx;
          padding: 24rpx;
          box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
          transition: all 0.3s;

          &:active {
            transform: scale(0.98);
            box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.12);
          }

          .record-header {
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
          }

          .record-content {
            .content-text {
              font-size: 28rpx;
              color: #666;
              line-height: 1.5;
            }
          }
        }
      }
    }

    .day-empty {
      padding-left: 80rpx;
      text-align: center;
      padding-top: 40rpx;
      padding-bottom: 40rpx;

      .empty-text {
        font-size: 26rpx;
        color: #ccc;
      }
    }
  }

  .timeline-footer {
    text-align: center;
    padding: 40rpx 0;

    .load-more {
      padding: 20rpx 40rpx;
      background: #f5f5f5;
      border-radius: 50rpx;
      display: inline-block;

      .load-text {
        font-size: 28rpx;
        color: #666;
      }
    }

    .no-more {
      .no-more-text {
        font-size: 26rpx;
        color: #ccc;
      }
    }
  }
}
</style>
