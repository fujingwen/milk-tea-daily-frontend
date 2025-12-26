<template>
  <view class="shopping-list-page">
    <!-- 头部 -->
    <view class="page-header">
      <text class="page-title">🛍️ 买买买</text>
      <view class="header-actions">
        <button class="add-btn" @click="goToAdd">
          <text class="add-icon">+</text>
          <text class="add-text">新增</text>
        </button>
      </view>
    </view>

    <!-- 筛选器 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          class="filter-tab"
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          <text class="tab-text">全部 ({{ allItems.length }})</text>
        </view>
        <view
          class="filter-tab"
          :class="{ active: currentFilter === 'pending' }"
          @click="setFilter('pending')"
        >
          <text class="tab-text">待购买 ({{ pendingItems.length }})</text>
        </view>
        <view
          class="filter-tab"
          :class="{ active: currentFilter === 'bought' }"
          @click="setFilter('bought')"
        >
          <text class="tab-text">已买 ({{ boughtItems.length }})</text>
        </view>
        <view
          class="filter-tab"
          :class="{ active: currentFilter === 'cancelled' }"
          @click="setFilter('cancelled')"
        >
          <text class="tab-text">不买了 ({{ cancelledItems.length }})</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="shopping-list">
      <view
        v-for="item in filteredItems"
        :key="item.recordId"
        class="shopping-item"
        :class="getItemClass(item)"
        @click="goToDetail(item.recordId)"
      >
        <view class="item-header">
          <view class="item-priority">
            <text class="priority-emoji">{{
              getPriorityConfig(item.priority).emoji
            }}</text>
            <text class="priority-text">{{
              getPriorityConfig(item.priority).label
            }}</text>
          </view>
          <view class="item-status">
            <text class="status-emoji">{{
              getStatusConfig(item.status).emoji
            }}</text>
            <text class="status-text">{{
              getStatusConfig(item.status).label
            }}</text>
          </view>
        </view>

        <view class="item-content">
          <text class="item-name">{{ item.productName }}</text>
          <view class="item-details">
            <text class="item-price" v-if="item.price">¥{{ item.price }}</text>
            <text class="item-date">{{
              formatDate(item.createTime, "MM-DD")
            }}</text>
          </view>
        </view>

        <view class="item-actions" v-if="item.status === 'pending'">
          <button
            class="action-btn bought-btn"
            @click.stop="markAsBought(item)"
          >
            <text class="btn-text">已买</text>
          </button>
          <button
            class="action-btn cancel-btn"
            @click.stop="markAsCancelled(item)"
          >
            <text class="btn-text">不买了</text>
          </button>
        </view>

        <view class="item-remark" v-if="item.remark">
          <text class="remark-text">{{ item.remark }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredItems.length === 0" class="empty-state">
        <text class="empty-icon">🛒</text>
        <text class="empty-text">{{ getEmptyText() }}</text>
        <button
          v-if="currentFilter === 'all'"
          class="empty-btn"
          @click="goToAdd"
        >
          <text class="btn-text">添加第一个商品</text>
        </button>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section" v-if="allItems.length > 0">
      <view class="stats-title">📊 统计信息</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-emoji">💰</text>
          <text class="stat-label">总金额</text>
          <text class="stat-value">¥{{ totalAmount }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">✅</text>
          <text class="stat-label">已购买</text>
          <text class="stat-value">{{ boughtItems.length }}件</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">⏳</text>
          <text class="stat-label">待购买</text>
          <text class="stat-value">{{ pendingItems.length }}件</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">🔥</text>
          <text class="stat-label">早晚要买</text>
          <text class="stat-value">{{ mustBuyItems.length }}件</text>
        </view>
      </view>
    </view>

    <!-- 新增表单弹窗 -->
    <u-popup v-model="showAddForm" mode="bottom" height="80%">
      <view class="add-form-container">
        <view class="form-header">
          <text class="form-title">新增商品</text>
          <button class="close-btn" @click="closeAddForm">
            <text class="close-text">✕</text>
          </button>
        </view>

        <ShoppingForm ref="shoppingFormRef" @submit="handleAddSubmit" />
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import {
  SHOPPING_PRIORITY_TYPES,
  SHOPPING_STATUS_TYPES,
} from "@/utils/constants";
import { formatDate } from "@/utils";
import ShoppingForm from "@/pages/record/components/ShoppingForm.vue";

const recordStore = useRecordStore();

// 响应式数据
const currentFilter = ref("all");
const showAddForm = ref(false);
const shoppingFormRef = ref(null);

// 计算属性
const allItems = computed(() => {
  return recordStore.records
    .filter((record) => record.moduleType === "wish")
    .sort((a, b) => b.createTime - a.createTime);
});

const pendingItems = computed(() => {
  return allItems.value.filter(
    (item) => item.status === "pending" || !item.status
  );
});

const boughtItems = computed(() => {
  return allItems.value.filter((item) => item.status === "bought");
});

const cancelledItems = computed(() => {
  return allItems.value.filter((item) => item.status === "cancelled");
});

const mustBuyItems = computed(() => {
  return allItems.value.filter((item) => item.priority === "must_buy");
});

const filteredItems = computed(() => {
  switch (currentFilter.value) {
    case "pending":
      return pendingItems.value;
    case "bought":
      return boughtItems.value;
    case "cancelled":
      return cancelledItems.value;
    default:
      return allItems.value;
  }
});

const totalAmount = computed(() => {
  return boughtItems.value
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    .toFixed(2);
});

// 方法
const setFilter = (filter) => {
  currentFilter.value = filter;
};

const getPriorityConfig = (priority) => {
  return (
    SHOPPING_PRIORITY_TYPES.find((p) => p.value === priority) ||
    SHOPPING_PRIORITY_TYPES[0]
  );
};

const getStatusConfig = (status) => {
  return (
    SHOPPING_STATUS_TYPES.find((s) => s.value === (status || "pending")) ||
    SHOPPING_STATUS_TYPES[0]
  );
};

const getItemClass = (item) => {
  const classes = ["shopping-item"];

  if (item.status === "bought") {
    classes.push("bought");
  } else if (item.status === "cancelled") {
    classes.push("cancelled");
  }

  if (item.priority === "must_buy") {
    classes.push("must-buy");
  }

  return classes.join(" ");
};

const getEmptyText = () => {
  switch (currentFilter.value) {
    case "pending":
      return "暂无待购买商品";
    case "bought":
      return "还没有购买任何商品";
    case "cancelled":
      return "没有取消的商品";
    default:
      return "还没有添加任何商品";
  }
};

const goToAdd = () => {
  showAddForm.value = true;
};

const closeAddForm = () => {
  showAddForm.value = false;
  if (shoppingFormRef.value) {
    shoppingFormRef.value.resetForm();
  }
};

const handleAddSubmit = (formData) => {
  const shoppingRecord = {
    recordId: Date.now().toString(),
    moduleType: "wish",
    ...formData,
    createTime: Date.now(),
    updateTime: Date.now(),
  };

  recordStore.addRecord(shoppingRecord);

  uni.showToast({
    title: "添加成功",
    icon: "success",
  });

  closeAddForm();
};

const goToDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${recordId}`,
  });
};

const markAsBought = (item) => {
  uni.showModal({
    title: "确认购买",
    content: `确认已购买"${item.productName}"吗？`,
    success: (res) => {
      if (res.confirm) {
        recordStore.updateRecord(item.recordId, {
          ...item,
          status: "bought",
          boughtTime: Date.now(),
          updateTime: Date.now(),
        });

        uni.showToast({
          title: "已标记为已购买",
          icon: "success",
        });
      }
    },
  });
};

const markAsCancelled = (item) => {
  uni.showModal({
    title: "确认取消",
    content: `确认不买"${item.productName}"了吗？`,
    success: (res) => {
      if (res.confirm) {
        recordStore.updateRecord(item.recordId, {
          ...item,
          status: "cancelled",
          cancelledTime: Date.now(),
          updateTime: Date.now(),
        });

        uni.showToast({
          title: "已标记为不买了",
          icon: "success",
        });
      }
    },
  });
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.shopping-list-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 20rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 4rpx;

  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .header-actions {
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: linear-gradient(135deg, #ff3b30, #ff6b9d);
      color: white;
      border: none;
      border-radius: 20rpx;
      padding: 12rpx 20rpx;
      font-size: 26rpx;

      .add-icon {
        font-size: 24rpx;
        font-weight: bold;
      }
    }
  }
}

.filter-section {
  margin-bottom: 20rpx;

  .filter-tabs {
    display: flex;
    background: white;
    border-radius: 12rpx;
    padding: 6rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx 8rpx;
      border-radius: 8rpx;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #ff3b30, #ff6b9d);

        .tab-text {
          color: white;
          font-weight: 600;
        }
      }

      .tab-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.shopping-list {
  .shopping-item {
    background: white;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
    position: relative;

    &.bought {
      opacity: 0.7;

      .item-name {
        text-decoration: line-through;
        color: #8e8e93;
      }
    }

    &.cancelled {
      opacity: 0.5;

      .item-name {
        text-decoration: line-through;
        color: #8e8e93;
      }
    }

    &.must-buy {
      border-left: 4rpx solid #ff3b30;
    }

    &:active {
      transform: scale(0.98);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .item-priority {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .priority-emoji {
          font-size: 20rpx;
        }

        .priority-text {
          font-size: 24rpx;
          color: #666;
        }
      }

      .item-status {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .status-emoji {
          font-size: 20rpx;
        }

        .status-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    .item-content {
      margin-bottom: 16rpx;

      .item-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
        line-height: 1.4;
      }

      .item-details {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-price {
          font-size: 28rpx;
          color: #ff3b30;
          font-weight: 600;
        }

        .item-date {
          font-size: 24rpx;
          color: #8e8e93;
        }
      }
    }

    .item-actions {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .action-btn {
        flex: 1;
        padding: 12rpx 16rpx;
        border: none;
        border-radius: 8rpx;
        font-size: 26rpx;

        &.bought-btn {
          background: #34c759;
          color: white;
        }

        &.cancel-btn {
          background: #8e8e93;
          color: white;
        }
      }
    }

    .item-remark {
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;

      .remark-text {
        font-size: 26rpx;
        color: #8e8e93;
        line-height: 1.4;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 80rpx 20rpx;
    background: white;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

    .empty-icon {
      font-size: 80rpx;
      display: block;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #8e8e93;
      margin-bottom: 30rpx;
      display: block;
    }

    .empty-btn {
      background: linear-gradient(135deg, #ff3b30, #ff6b9d);
      color: white;
      border: none;
      border-radius: 20rpx;
      padding: 16rpx 32rpx;
      font-size: 28rpx;
    }
  }
}

.stats-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .stats-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .stat-item {
      text-align: center;
      padding: 20rpx;
      background: #f8f8f8;
      border-radius: 12rpx;

      .stat-emoji {
        font-size: 32rpx;
        display: block;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
        display: block;
        margin-bottom: 4rpx;
      }

      .stat-value {
        font-size: 28rpx;
        color: #ff3b30;
        font-weight: 600;
      }
    }
  }
}

.add-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    background: white;
    border-bottom: 1rpx solid #eee;

    .form-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: #f5f5f5;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;

      .close-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
