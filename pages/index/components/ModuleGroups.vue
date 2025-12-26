<template>
  <view class="modules-section">
    <!-- 今日打卡 -->
    <SwipeableContainer
      v-if="!isModuleGroupCompletelyHidden('dailyCheckIn')"
      module-type="dailyCheckIn"
      :is-hidden="false"
      :on-hide="() => handleModuleHide('dailyCheckIn')"
      :on-show="() => handleModuleShow('dailyCheckIn')"
    >
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">✨</text>
            <text class="group-name">今日打卡</text>
          </view>
          <view class="header-actions">
            <view class="checkin-status">
              <text class="status-text"
                >{{ getTodayCheckInCount }}/{{
                  dailyCheckInModules.length
                }}</text
              >
            </view>
            <view
              class="hide-btn"
              @click.stop="handleModuleHideWithConfirm('dailyCheckIn')"
            >
              <text class="hide-icon">✕</text>
            </view>
          </view>
        </view>
        <view class="modules-grid checkin-grid">
          <view
            class="module-item"
            :class="{ checked: isTodayChecked(type) }"
            v-for="type in dailyCheckInModules"
            :key="type"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-emoji">{{ getModuleConfig(type).icon }}</text>
              <view v-if="isTodayChecked(type)" class="check-badge">✓</view>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </SwipeableContainer>

    <!-- 其他模块分组 -->
    <SwipeableContainer
      v-if="!isModuleGroupCompletelyHidden('lifeRecord')"
      module-type="lifeRecord"
      :is-hidden="false"
      :on-hide="() => handleModuleHide('lifeRecord')"
      :on-show="() => handleModuleShow('lifeRecord')"
    >
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">📋</text>
            <text class="group-name">生活记录</text>
          </view>
          <view class="header-actions">
            <view
              class="hide-btn"
              @click.stop="handleModuleHideWithConfirm('lifeRecord')"
            >
              <text class="hide-icon">✕</text>
            </view>
          </view>
        </view>
        <view class="modules-grid">
          <view
            class="module-item"
            v-for="type in lifeRecordModules"
            :key="type"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-emoji">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </SwipeableContainer>

    <!-- 美食相关 -->
    <SwipeableContainer
      v-if="!isModuleGroupCompletelyHidden('foodRelated')"
      module-type="foodRelated"
      :is-hidden="false"
      :on-hide="() => handleModuleHide('foodRelated')"
      :on-show="() => handleModuleShow('foodRelated')"
    >
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">🍽️</text>
            <text class="group-name">美食相关</text>
          </view>
          <view class="header-actions">
            <view
              class="hide-btn"
              @click.stop="handleModuleHideWithConfirm('foodRelated')"
            >
              <text class="hide-icon">✕</text>
            </view>
          </view>
        </view>
        <view class="modules-grid">
          <view
            class="module-item"
            v-for="type in foodRelatedModules"
            :key="type"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-emoji">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </SwipeableContainer>

    <!-- 计划提醒 -->
    <SwipeableContainer
      v-if="!isModuleGroupCompletelyHidden('planReminder')"
      module-type="planReminder"
      :is-hidden="false"
      :on-hide="() => handleModuleHide('planReminder')"
      :on-show="() => handleModuleShow('planReminder')"
    >
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">📅</text>
            <text class="group-name">计划提醒</text>
          </view>
          <view class="header-actions">
            <view
              class="hide-btn"
              @click.stop="handleModuleHideWithConfirm('planReminder')"
            >
              <text class="hide-icon">✕</text>
            </view>
          </view>
        </view>
        <view class="modules-grid">
          <view
            class="module-item"
            v-for="type in planReminderModules"
            :key="type"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-emoji">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </SwipeableContainer>

    <!-- 隐藏模块的悬浮按钮 -->
    <template
      v-for="groupKey in hiddenModuleGroups"
      :key="`floating-${groupKey}`"
    >
      <FloatingButton
        :visible="true"
        :module-config="{
          type: groupKey,
          name: MODULE_GROUPS[groupKey].name,
          icon: MODULE_GROUPS[groupKey].icon,
          color: MODULE_GROUPS[groupKey].color,
        }"
        :on-click="() => handleModuleShow(groupKey)"
      />
    </template>

    <!-- 显示所有模块按钮 -->
    <ShowAllModulesButton
      :visible="moduleVisibilityStore.hasHiddenModules"
      :hidden-count="moduleVisibilityStore.hiddenModulesCount"
      :on-click="handleShowAllModules"
    />
  </view>
</template>

<script setup>
import { computed } from "vue";
import { MODULE_CONFIG, MODULE_GROUPS } from "@/utils/constants";
import { getTodayRange } from "@/utils";
import SwipeableContainer from "@/components/SwipeableContainer.vue";
import FloatingButton from "@/components/FloatingButton.vue";
import ShowAllModulesButton from "@/components/ShowAllModulesButton.vue";
import { vibrate } from "@/utils/hapticFeedback.js";

const props = defineProps({
  records: Array,
  moduleVisibilityStore: Object,
});

const emit = defineEmits(["module-hide", "module-show", "show-all-modules"]);

// 模块分组
const dailyCheckInModules = computed(() => MODULE_GROUPS.dailyCheckIn.modules);
const lifeRecordModules = computed(() => MODULE_GROUPS.lifeRecord.modules);
const foodRelatedModules = computed(() => MODULE_GROUPS.foodRelated.modules);
const planReminderModules = computed(() => MODULE_GROUPS.planReminder.modules);

// 隐藏的模块组
const hiddenModuleGroups = computed(() => {
  return Object.keys(MODULE_GROUPS).filter((groupKey) =>
    isModuleGroupCompletelyHidden(groupKey)
  );
});

// 今日打卡状态
const todayCheckInStatus = computed(() => {
  const { start, end } = getTodayRange();
  const status = {};

  dailyCheckInModules.value.forEach((moduleType) => {
    const hasRecord = props.records.some(
      (record) =>
        record.moduleType === moduleType &&
        record.createTime >= start &&
        record.createTime <= end
    );
    status[moduleType] = hasRecord;
  });

  return status;
});

// 今日打卡数量
const getTodayCheckInCount = computed(() => {
  return Object.values(todayCheckInStatus.value).filter(Boolean).length;
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
};

const isTodayChecked = (moduleType) => {
  return todayCheckInStatus.value[moduleType] || false;
};

const isModuleGroupCompletelyHidden = (groupKey) => {
  return props.moduleVisibilityStore.isModuleHidden(groupKey);
};

const goToAddRecord = (moduleType) => {
  if (moduleType === "food") {
    uni.navigateTo({
      url: "/pages/food/recommend",
    });
  } else if (moduleType === "recipe") {
    uni.navigateTo({
      url: "/pages/recipe/list",
    });
  } else {
    uni.navigateTo({
      url: `/pages/record/add?type=${moduleType}`,
    });
  }
};

const handleModuleHide = async (groupKey) => {
  emit("module-hide", groupKey);
};

const handleModuleHideWithConfirm = async (groupKey) => {
  try {
    vibrate.light();
    const groupName = MODULE_GROUPS[groupKey]?.name || "该模块组";

    const result = await new Promise((resolve) => {
      uni.showModal({
        title: "确认隐藏",
        content: `确定要隐藏"${groupName}"吗？隐藏后可以通过悬浮按钮或"显示所有模块"按钮恢复。`,
        confirmText: "隐藏",
        cancelText: "取消",
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        },
      });
    });

    if (result) {
      vibrate.medium();
      await handleModuleHide(groupKey);
      uni.showToast({
        title: "已隐藏",
        icon: "success",
      });
    }
  } catch (error) {
    console.error("隐藏模块组失败:", error);
    vibrate.error();
    uni.showToast({
      title: "操作失败，请重试",
      icon: "none",
    });
  }
};

const handleModuleShow = async (groupKey) => {
  emit("module-show", groupKey);
};

const handleShowAllModules = async () => {
  emit("show-all-modules");
};
</script>

<style lang="scss" scoped>
.modules-section {
  padding: 0 20rpx;
  margin-bottom: 20rpx;

  .module-group {
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .group-title {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .group-icon {
          font-size: 28rpx;
        }

        .group-name {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .checkin-status {
          .status-text {
            font-size: 24rpx;
            color: #667eea;
            font-weight: 500;
          }
        }

        .hide-btn {
          width: 56rpx;
          height: 56rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 107, 157, 0.1);
          border-radius: 50%;
          transition: all 0.3s;
          cursor: pointer;

          &:hover {
            background: rgba(255, 107, 157, 0.2);
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.9);
            background: rgba(255, 107, 157, 0.3);
          }

          .hide-icon {
            font-size: 20rpx;
            color: #ff6b9d;
            font-weight: bold;
            transition: all 0.3s;
          }
        }
      }
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16rpx;

      &.checkin-grid {
        grid-template-columns: repeat(5, 1fr);
      }

      .module-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16rpx 8rpx;
        border-radius: 16rpx;
        transition: all 0.3s;
        position: relative;

        &.checked {
          background: rgba(102, 126, 234, 0.1);

          .module-name {
            color: #667eea;
          }
        }

        &:active {
          transform: scale(0.95);
        }

        .module-icon {
          width: 70rpx;
          height: 70rpx;
          border-radius: 18rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10rpx;
          position: relative;

          .icon-emoji {
            font-size: 32rpx;
          }

          .check-badge {
            position: absolute;
            top: -8rpx;
            right: -8rpx;
            width: 28rpx;
            height: 28rpx;
            background: #34c759;
            color: white;
            border-radius: 50%;
            font-size: 18rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          }
        }

        .module-name {
          font-size: 22rpx;
          color: #333;
          text-align: center;
          line-height: 1.3;
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

// 响应式设计 - 小屏幕适配
@media (max-width: 750rpx) {
  .modules-section {
    .module-group {
      .group-header {
        .header-actions {
          gap: 12rpx;

          .hide-btn {
            width: 48rpx;
            height: 48rpx;

            .hide-icon {
              font-size: 18rpx;
            }
          }

          .checkin-status {
            .status-text {
              font-size: 22rpx;
            }
          }
        }
      }
    }
  }
}
</style>
