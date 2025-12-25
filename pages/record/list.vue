<template>
  <view class="record-list-page">
    <!-- 筛选栏 -->
    <view class="filter-bar card">
      <view class="filter-item">
        <u-picker
          v-model="filterModule"
          :range="moduleOptions"
          range-key="name"
          placeholder="选择模块"
          @change="handleFilterChange"
        />
      </view>
      <view class="filter-item">
        <u-picker
          v-model="filterTime"
          :range="timeOptions"
          range-key="name"
          placeholder="选择时间"
          @change="handleFilterChange"
        />
      </view>
      <view class="filter-item">
        <u-button size="small" type="default" @click="resetFilter">
          重置
        </u-button>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar card" v-if="showSearch">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索记录内容..."
        @search="handleSearch"
        @clear="handleSearch"
      />
    </view>

    <!-- 排序栏 -->
    <view class="sort-bar">
      <view class="sort-options">
        <view
          class="sort-option"
          :class="{ active: sortBy === 'time' }"
          @click="setSortBy('time')"
        >
          按时间排序
        </view>
        <view
          class="sort-option"
          :class="{ active: sortBy === 'module' }"
          @click="setSortBy('module')"
        >
          按模块排序
        </view>
      </view>
      <view class="sort-direction" @click="toggleSortDirection">
        <u-icon
          :name="sortDirection === 'desc' ? 'arrow-down' : 'arrow-up'"
          size="16"
        />
        <text class="direction-text">
          {{ sortDirection === "desc" ? "降序" : "升序" }}
        </text>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="records-container">
      <view class="records-count" v-if="filteredRecords.length > 0">
        <text class="count-text">共 {{ filteredRecords.length }} 条记录</text>
      </view>

      <view class="records-list">
        <view
          class="record-item card"
          v-for="record in paginatedRecords"
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
            <view class="record-actions">
              <text class="record-time">{{
                formatRelativeTime(record.createTime)
              }}</text>
              <u-icon
                name="more-dot-fill"
                size="16"
                color="#ccc"
                @click.stop="showRecordMenu(record)"
              />
            </view>
          </view>

          <view class="record-content">
            <text class="content-text">{{ getRecordSummary(record) }}</text>
          </view>

          <view class="record-meta">
            <text class="meta-date">{{
              formatDate(record.createTime, "MM-DD HH:mm")
            }}</text>
            <view
              class="record-tags"
              v-if="record.tags && record.tags.length > 0"
            >
              <text
                class="tag"
                v-for="tag in record.tags.slice(0, 3)"
                :key="tag"
              >
                {{ tag }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <u-button
          type="default"
          size="small"
          :loading="loading"
          @click="loadMore"
        >
          {{ loading ? "加载中..." : "加载更多" }}
        </u-button>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <text class="empty-text">
          {{ searchKeyword ? "没有找到相关记录" : "暂无记录" }}
        </text>
        <u-button type="primary" size="small" @click="goToAddRecord">
          添加记录
        </u-button>
      </view>
    </view>

    <!-- 记录操作菜单 -->
    <u-action-sheet
      v-model="showActionSheet"
      :actions="actionSheetActions"
      @click="handleActionClick"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import { MODULE_CONFIG } from "@/utils/constants";
import {
  formatDate,
  formatRelativeTime,
  showConfirm,
  showToast,
} from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const filterModule = ref("");
const filterTime = ref("");
const searchKeyword = ref("");
const sortBy = ref("time");
const sortDirection = ref("desc");
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const showSearch = ref(false);
const showActionSheet = ref(false);
const selectedRecord = ref(null);

// 计算属性
const moduleOptions = computed(() => {
  const options = [{ value: "", name: "全部模块" }];
  Object.entries(MODULE_CONFIG).forEach(([key, config]) => {
    options.push({ value: key, name: config.name });
  });
  return options;
});

const timeOptions = computed(() => [
  { value: "", name: "全部时间" },
  { value: "today", name: "今天" },
  { value: "week", name: "本周" },
  { value: "month", name: "本月" },
  { value: "custom", name: "自定义" },
]);

const filteredRecords = computed(() => {
  let records = [...recordStore.records];

  // 模块筛选
  if (filterModule.value) {
    records = records.filter(
      (record) => record.moduleType === filterModule.value
    );
  }

  // 时间筛选
  if (filterTime.value) {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekStart = today - new Date().getDay() * 24 * 60 * 60 * 1000;
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime();

    switch (filterTime.value) {
      case "today":
        records = records.filter((record) => record.createTime >= today);
        break;
      case "week":
        records = records.filter((record) => record.createTime >= weekStart);
        break;
      case "month":
        records = records.filter((record) => record.createTime >= monthStart);
        break;
    }
  }

  // 搜索筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    records = records.filter((record) => {
      const summary = getRecordSummary(record).toLowerCase();
      return summary.includes(keyword);
    });
  }

  // 排序
  records.sort((a, b) => {
    let compareValue = 0;

    if (sortBy.value === "time") {
      compareValue = a.createTime - b.createTime;
    } else if (sortBy.value === "module") {
      compareValue = a.moduleType.localeCompare(b.moduleType);
    }

    return sortDirection.value === "desc" ? -compareValue : compareValue;
  });

  return records;
});

const paginatedRecords = computed(() => {
  const start = 0;
  const end = currentPage.value * pageSize.value;
  return filteredRecords.value.slice(start, end);
});

const hasMore = computed(() => {
  return paginatedRecords.value.length < filteredRecords.value.length;
});

const actionSheetActions = computed(() => [
  { name: "查看详情", value: "detail" },
  { name: "编辑记录", value: "edit" },
  { name: "删除记录", value: "delete", color: "#ff3b30" },
]);

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓" };
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
    case "essay":
      return (
        record.content.substring(0, 50) +
        (record.content.length > 50 ? "..." : "")
      );
    case "keyword":
      return `关键字：${record.keywords?.join("、") || ""}`;
    case "exercise":
      return `运动：${record.exerciseType} ${record.duration}分钟`;
    default:
      return "记录详情";
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const resetFilter = () => {
  filterModule.value = "";
  filterTime.value = "";
  searchKeyword.value = "";
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const setSortBy = (type) => {
  if (sortBy.value === type) {
    toggleSortDirection();
  } else {
    sortBy.value = type;
    sortDirection.value = "desc";
  }
  currentPage.value = 1;
};

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
  currentPage.value = 1;
};

const loadMore = () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  setTimeout(() => {
    currentPage.value++;
    loading.value = false;
  }, 500);
};

const goToRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${record.recordId}`,
  });
};

const goToAddRecord = () => {
  uni.navigateTo({
    url: "/pages/record/add",
  });
};

const showRecordMenu = (record) => {
  selectedRecord.value = record;
  showActionSheet.value = true;
};

const handleActionClick = async (action) => {
  if (!selectedRecord.value) return;

  switch (action.value) {
    case "detail":
      goToRecordDetail(selectedRecord.value);
      break;
    case "edit":
      uni.navigateTo({
        url: `/pages/record/add?id=${selectedRecord.value.recordId}&edit=true`,
      });
      break;
    case "delete":
      const confirmed = await showConfirm("确定要删除这条记录吗？");
      if (confirmed) {
        recordStore.deleteRecord(selectedRecord.value.recordId);
        showToast("删除成功", "success");
      }
      break;
  }

  selectedRecord.value = null;
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  const pages = getCurrentPages();
  const currentPageInstance = pages[pages.length - 1];
  const options = currentPageInstance.options;

  if (options.type) {
    filterModule.value = options.type;
  }

  if (options.search === "true") {
    showSearch.value = true;
  }

  if (options.search && options.search !== "true") {
    searchKeyword.value = decodeURIComponent(options.search);
    showSearch.value = true;
  }
});
</script>

<style lang="scss" scoped>
.record-list-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.filter-bar {
  display: flex;
  gap: 12rpx;
  margin: 20rpx;

  .filter-item {
    flex: 1;

    &:last-child {
      flex: 0 0 auto;
    }
  }
}

.search-bar {
  margin: 0 20rpx 20rpx;
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
  margin-bottom: 20rpx;

  .sort-options {
    display: flex;
    gap: 20rpx;

    .sort-option {
      font-size: 28rpx;
      color: #666;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      transition: all 0.3s;

      &.active {
        background: #667eea;
        color: white;
      }
    }
  }

  .sort-direction {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #666;

    .direction-text {
      font-size: 24rpx;
    }
  }
}

.records-container {
  padding: 0 20rpx;

  .records-count {
    margin-bottom: 20rpx;

    .count-text {
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

      .record-actions {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .record-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .record-content {
      margin-bottom: 12rpx;

      .content-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.4;
      }
    }

    .record-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .meta-date {
        font-size: 24rpx;
        color: #999;
      }

      .record-tags {
        display: flex;
        gap: 8rpx;

        .tag {
          font-size: 20rpx;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 40rpx 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 40rpx;
    }
  }
}
</style>
