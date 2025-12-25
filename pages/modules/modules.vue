<template>
  <view class="modules-page">
    <!-- 模块列表 -->
    <view class="modules-list">
      <view
        class="module-card card"
        v-for="(config, type) in moduleConfig"
        :key="type"
        @click="goToModuleRecords(type)"
      >
        <view class="module-header">
          <view class="module-info">
            <view
              class="module-icon"
              :style="{ backgroundColor: config.color }"
            >
              <text class="icon-emoji">{{ config.icon }}</text>
            </view>
            <view class="module-details">
              <text class="module-name">{{ config.name }}</text>
              <text class="module-count"
                >{{ getModuleRecordCount(type) }}条记录</text
              >
            </view>
          </view>
          <u-icon name="arrow-right" color="#ccc" />
        </view>

        <view class="module-stats" v-if="getModuleRecordCount(type) > 0">
          <text class="last-record">
            最近记录：{{ getLastRecordTime(type) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="data-stats card">
      <view class="stats-header">
        <text class="stats-title">数据统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-label">总记录数</text>
          <text class="stat-value">{{ totalRecords }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">今日记录</text>
          <text class="stat-value">{{ todayRecords }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">本周记录</text>
          <text class="stat-value">{{ weekRecords }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">本月记录</text>
          <text class="stat-value">{{ monthRecords }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions card">
      <view class="actions-header">
        <text class="actions-title">快捷操作</text>
      </view>
      <view class="actions-content">
        <u-button type="primary" icon="plus" @click="goToAddRecord">
          新增记录
        </u-button>
        <u-button type="default" icon="search" @click="goToSearch">
          搜索记录
        </u-button>
        <u-button type="default" icon="download" @click="exportData">
          导出数据
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import { MODULE_CONFIG } from "@/utils/constants";
import {
  formatRelativeTime,
  getTodayRange,
  getWeekRange,
  getMonthRange,
  showToast,
} from "@/utils";

const recordStore = useRecordStore();

// 计算属性
const moduleConfig = computed(() => MODULE_CONFIG);

const totalRecords = computed(() => recordStore.records.length);

const todayRecords = computed(() => {
  const { start, end } = getTodayRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

const weekRecords = computed(() => {
  const { start, end } = getWeekRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

const monthRecords = computed(() => {
  const { start, end } = getMonthRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

// 方法
const getModuleRecordCount = (type) => {
  return recordStore.records.filter((record) => record.moduleType === type)
    .length;
};

const getLastRecordTime = (type) => {
  const moduleRecords = recordStore.records.filter(
    (record) => record.moduleType === type
  );
  if (moduleRecords.length === 0) return "暂无记录";

  const lastRecord = moduleRecords.sort(
    (a, b) => b.createTime - a.createTime
  )[0];
  return formatRelativeTime(lastRecord.createTime);
};

const goToModuleRecords = (type) => {
  uni.navigateTo({
    url: `/pages/record/list?module=${type}`,
  });
};

const goToAddRecord = () => {
  uni.navigateTo({
    url: "/pages/record/add",
  });
};

const goToSearch = () => {
  uni.navigateTo({
    url: "/pages/record/list?search=true",
  });
};

const exportData = () => {
  showToast("导出功能开发中...", "none");
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.modules-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.modules-list {
  margin-bottom: 20rpx;

  .module-card {
    margin-bottom: 16rpx;

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .module-info {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .module-icon {
          width: 60rpx;
          height: 60rpx;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-emoji {
            font-size: 28rpx;
          }
        }

        .module-details {
          .module-name {
            display: block;
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
          }

          .module-count {
            display: block;
            font-size: 24rpx;
            color: #666;
          }
        }
      }
    }

    .module-stats {
      .last-record {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.data-stats {
  margin-bottom: 20rpx;

  .stats-header {
    margin-bottom: 20rpx;

    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .stat-item {
      text-align: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;

      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .stat-value {
        display: block;
        font-size: 36rpx;
        color: #333;
        font-weight: bold;
      }
    }
  }
}

.quick-actions {
  .actions-header {
    margin-bottom: 20rpx;

    .actions-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .actions-content {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
}
</style>
