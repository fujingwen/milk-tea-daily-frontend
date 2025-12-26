<template>
  <view class="timeline-view">
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
</template>

<script setup>
import { ref, computed } from "vue";
import { MODULE_CONFIG } from "@/utils/constants";
import { formatDate } from "@/utils";

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["record-detail"]);

const scrollTop = ref(0);
const timelineDays = ref(30);
const hasMoreDays = ref(true);

// 时间轴数据
const timelineData = computed(() => {
  const today = new Date();
  const days = [];

  for (let i = 0; i < timelineDays.value; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dateStr = date.toDateString();
    const dayRecords = props.records
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
  emit("record-detail", record);
};
</script>

<style lang="scss" scoped>
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
