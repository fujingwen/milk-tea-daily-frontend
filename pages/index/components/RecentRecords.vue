<template>
  <view class="recent-records">
    <view class="section-header">
      <text class="section-title">最近记录</text>
      <text class="section-more" @click="goToRecordList">查看全部</text>
    </view>

    <view class="record-list" v-if="recentRecords.length > 0">
      <view
        class="record-item"
        v-for="record in recentRecords"
        :key="record.recordId"
        @click="goToRecordDetail(record)"
      >
        <view class="record-header">
          <view class="record-module">
            <text class="module-emoji">{{ getModuleConfig(record.moduleType).icon }}</text>
            <text class="module-text">{{ getModuleConfig(record.moduleType).name }}</text>
          </view>
          <text class="record-time">{{ formatRelativeTime(record.createTime) }}</text>
        </view>
        <view class="record-content">
          <text class="content-text">{{ getRecordSummary(record) }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-text">暂无记录，开始记录你的生活吧～</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { MODULE_CONFIG } from '@/utils/constants';
import { formatRelativeTime } from '@/utils';

const props = defineProps({
  records: Array
});

// 计算属性
const recentRecords = computed(() => {
  return props.records.slice(0, 5);
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
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
    case "food":
      return `${record.foodName}${
        record.restaurant ? ` - ${record.restaurant}` : ""
      }`;
    case "keyword":
      return `关键字：${record.keywords?.join("、") || ""}`;
    case "exercise":
      return `${record.exerciseType} ${record.duration}分钟`;
    default:
      return "记录详情";
  }
};

const goToRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${record.recordId}`,
  });
};

const goToRecordList = () => {
  uni.switchTab({
    url: "/pages/modules/modules",
  });
};
</script>

<style lang="scss" scoped>
.recent-records {
  padding: 0 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 28rpx;
      color: #667eea;
    }
  }

  .record-list {
    .record-item {
      background: white;
      border-radius: 20rpx;
      padding: 24rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
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

          .module-text {
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
  }

  .empty-state {
    text-align: center;
    padding: 80rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>