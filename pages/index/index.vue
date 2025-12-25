<template>
  <view class="index-page">
    <!-- 顶部搜索 -->
    <view class="header">
      <view class="search-bar">
        <view class="search-wrapper">
          <input
            class="search-input"
            placeholder="搜索记录..."
            v-model="searchKeyword"
            @confirm="handleSearch"
          />
          <view class="search-btn" @click="handleSearch">
            <text class="search-icon">🔍</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日提醒模块 -->
    <view v-if="hasAnyReminder" class="today-reminders card">
      <view class="reminders-header">
        <text class="reminders-title">📋 今日提醒</text>
        <text class="reminders-date">{{
          formatDate(Date.now(), "YYYY年MM月DD日")
        }}</text>
      </view>

      <!-- 天气信息 -->
      <view class="weather-section" v-if="weatherInfo">
        <view class="weather-main">
          <text class="weather-emoji">{{ weatherInfo.emoji }}</text>
          <view class="weather-info">
            <text class="weather-desc"
              >{{ weatherInfo.desc }} {{ weatherInfo.temp }}</text
            >
            <text class="weather-tip">{{ weatherInfo.tip }}</text>
          </view>
        </view>
      </view>

      <!-- 姨妈期提醒 -->
      <view
        class="reminder-section menstruation-reminder"
        v-if="menstruationReminder"
      >
        <view class="reminder-item" @click="goToMenstruationRecord">
          <view class="reminder-icon menstruation">
            <text class="icon-emoji">{{ menstruationReminder.emoji }}</text>
          </view>
          <view class="reminder-content">
            <text class="reminder-text">{{
              menstruationReminder.message
            }}</text>
          </view>
          <view class="reminder-arrow">›</view>
        </view>
      </view>

      <!-- 待办事项提醒 -->
      <view
        class="reminder-section todo-reminder"
        v-if="pendingTodos.length > 0"
      >
        <view class="section-label">
          <text class="label-icon">✅</text>
          <text class="label-text">待办事项</text>
          <text class="label-count">{{ pendingTodos.length }}项</text>
          <text class="view-more" @click="goToTodoList">查看全部</text>
        </view>
        <view class="reminder-list">
          <view
            v-for="todo in pendingTodos.slice(0, 3)"
            :key="todo.recordId"
            class="reminder-item todo-item"
            :class="todo.urgency"
          >
            <view class="reminder-icon todo" :class="todo.urgency">
              <text class="icon-emoji">{{
                todo.urgency === "overdue" ? "⚠️" : "📝"
              }}</text>
            </view>
            <view class="reminder-content" @click="goToTodoDetail(todo.recordId)">
              <text class="reminder-text">{{ todo.content }}</text>
              <text class="reminder-sub" v-if="todo.deadline">{{
                todo.message
              }}</text>
            </view>
            <view class="todo-actions">
              <view class="complete-btn" @click.stop="handleTodoComplete(todo)">
                <text class="complete-icon">✓</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 生日提醒 -->
      <view
        class="reminder-section birthday-reminder"
        v-if="upcomingBirthdays.length > 0"
      >
        <view class="section-label">
          <text class="label-icon">🎂</text>
          <text class="label-text">生日提醒</text>
          <text class="view-more" @click="goToBirthdayList">查看全部</text>
        </view>
        <view class="reminder-list">
          <view
            v-for="birthday in upcomingBirthdays.slice(0, 3)"
            :key="birthday.recordId"
            class="reminder-item"
            :class="{ today: birthday.daysUntil === 0 }"
            @click="goToBirthdayDetail(birthday.recordId)"
          >
            <view
              class="reminder-icon birthday"
              :class="{ today: birthday.daysUntil === 0 }"
            >
              <text class="icon-emoji">{{
                birthday.daysUntil === 0 ? "🎉" : "🎂"
              }}</text>
            </view>
            <view class="reminder-content">
              <text class="reminder-text">{{ birthday.name }}</text>
              <text class="reminder-sub">{{ birthday.message }}</text>
            </view>
            <view class="reminder-days">
              <text v-if="birthday.daysUntil === 0" class="days-today"
                >今天</text
              >
              <text v-else class="days-count">{{ birthday.daysUntil }}天</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 节日提醒 -->
      <view
        class="reminder-section holiday-reminder"
        v-if="upcomingHolidays.length > 0"
      >
        <view class="section-label">
          <text class="label-icon">🎊</text>
          <text class="label-text">节日提醒</text>
        </view>
        <view class="reminder-list">
          <view
            v-for="(holiday, index) in upcomingHolidays.slice(0, 3)"
            :key="index"
            class="reminder-item"
            :class="{
              today: holiday.daysUntil === 0,
              holiday: holiday.holiday,
            }"
          >
            <view
              class="reminder-icon holiday"
              :class="{ today: holiday.daysUntil === 0 }"
            >
              <text class="icon-emoji">{{ holiday.emoji }}</text>
            </view>
            <view class="reminder-content">
              <text class="reminder-text">{{ holiday.name }}</text>
              <text class="reminder-sub">{{ holiday.message }}</text>
            </view>
            <view class="reminder-days">
              <text v-if="holiday.daysUntil === 0" class="days-today"
                >今天</text
              >
              <text v-else class="days-count">{{ holiday.daysUntil }}天</text>
            </view>
            <view v-if="holiday.holiday" class="holiday-badge">放假</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 模块快捷入口 - 分组显示 -->
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
                  >{{ getTodayCheckInCount }}/{{ dailyCheckInModules.length }}</text
                >
              </view>
              <view class="hide-btn" @click.stop="handleModuleHideWithConfirm('dailyCheckIn')">
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
              <view class="hide-btn" @click.stop="handleModuleHideWithConfirm('lifeRecord')">
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
              <view class="hide-btn" @click.stop="handleModuleHideWithConfirm('foodRelated')">
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
              <view class="hide-btn" @click.stop="handleModuleHideWithConfirm('planReminder')">
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
    </view>

    <!-- 最近记录 -->
    <view class="recent-records">
      <view class="section-header">
        <text class="section-title">最近记录</text>
        <text class="section-more" @click="goToRecordList">查看全部</text>
      </view>

      <view class="record-list">
        <view
          class="record-item card"
          v-for="record in recentRecords"
          :key="record.recordId"
          @click="goToRecordDetail(record)"
        >
          <view class="record-header">
            <view class="record-module">
              <text class="module-emoji">{{
                getModuleConfig(record.moduleType).icon
              }}</text>
              <text class="module-text">{{
                getModuleConfig(record.moduleType).name
              }}</text>
            </view>
            <text class="record-time">{{
              formatRelativeTime(record.createTime)
            }}</text>
          </view>
          <view class="record-content">
            <text class="content-text">{{ getRecordSummary(record) }}</text>
          </view>
        </view>
      </view>

      <view v-if="recentRecords.length === 0" class="empty-state">
        <text class="empty-text">暂无记录，开始记录你的生活吧～</text>
      </view>
    </view>

    <!-- 隐藏模块的悬浮按钮 -->
    <FloatingButton
      v-for="groupKey in Object.keys(MODULE_GROUPS)"
      :key="`floating-${groupKey}`"
      v-if="isModuleGroupCompletelyHidden(groupKey)"
      :visible="true"
      :module-config="{
        type: groupKey,
        name: MODULE_GROUPS[groupKey].name,
        icon: MODULE_GROUPS[groupKey].icon,
        color: MODULE_GROUPS[groupKey].color
      }"
      :on-click="() => handleModuleShow(groupKey)"
    />

    <!-- 显示所有模块按钮 -->
    <ShowAllModulesButton
      :visible="moduleVisibilityStore.hasHiddenModules"
      :hidden-count="moduleVisibilityStore.hiddenModulesCount"
      :on-click="handleShowAllModules"
    />

    <!-- 待办事项完成确认弹窗 -->
    <view v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <view class="complete-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认完成</text>
          <text class="modal-close" @click="closeCompleteModal">×</text>
        </view>

        <view class="modal-content">
          <view class="todo-info">
            <text class="todo-title">{{ currentTodo?.content }}</text>
          </view>

          <view class="remark-section">
            <text class="remark-label">完成备注（可选）</text>
            <textarea
              class="remark-input"
              v-model="completeRemark"
              placeholder="添加完成备注..."
              maxlength="100"
            />
            <text class="char-count">{{ completeRemark.length }}/100</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="closeCompleteModal">取消</button>
          <button class="confirm-btn" @click="confirmComplete">确认完成</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore, useAppStore, useModuleVisibilityStore } from "@/stores";
import { MODULE_CONFIG, MODULE_GROUPS } from "@/utils/constants";
import { formatDate, formatRelativeTime, getTodayRange } from "@/utils";
import birthdayService from "@/utils/birthdayService.js";
import reminderService from "@/utils/reminderService.js";
import SwipeableContainer from "@/components/SwipeableContainer.vue";
import FloatingButton from "@/components/FloatingButton.vue";
import ShowAllModulesButton from "@/components/ShowAllModulesButton.vue";
import { vibrate } from "@/utils/hapticFeedback.js";

const recordStore = useRecordStore();
const appStore = useAppStore();
const moduleVisibilityStore = useModuleVisibilityStore();

// 响应式数据
const searchKeyword = ref("");
const weatherInfo = ref(null);
const upcomingHolidays = ref([]);
const upcomingBirthdays = ref([]);
const pendingTodos = ref([]);
const menstruationReminder = ref(null);

// 待办事项完成相关数据
const showCompleteModal = ref(false);
const currentTodo = ref(null);
const completeRemark = ref("");

// 模块分组
const dailyCheckInModules = computed(() => MODULE_GROUPS.dailyCheckIn.modules);
const lifeRecordModules = computed(() => MODULE_GROUPS.lifeRecord.modules);
const foodRelatedModules = computed(() => MODULE_GROUPS.foodRelated.modules);
const planReminderModules = computed(() => MODULE_GROUPS.planReminder.modules);

// 计算属性
const recentRecords = computed(() => {
  return recordStore.records.slice(0, 5);
});

// 是否有任何提醒
const hasAnyReminder = computed(() => {
  return (
    weatherInfo.value ||
    upcomingHolidays.value.length > 0 ||
    upcomingBirthdays.value.length > 0 ||
    pendingTodos.value.length > 0 ||
    menstruationReminder.value
  );
});

// 今日打卡状态
const todayCheckInStatus = computed(() => {
  const { start, end } = getTodayRange();
  const status = {};

  dailyCheckInModules.value.forEach((moduleType) => {
    const hasRecord = recordStore.records.some(
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

// 检查某模块今日是否已打卡
const isTodayChecked = (moduleType) => {
  return todayCheckInStatus.value[moduleType] || false;
};

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

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    uni.navigateTo({
      url: `/pages/record/list?search=${encodeURIComponent(
        searchKeyword.value
      )}`,
    });
  }
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

// 待办相关导航方法
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

// 待办事项完成相关方法
const handleTodoComplete = (todo) => {
  vibrate.light();
  currentTodo.value = todo;
  showCompleteModal.value = true;
};

const closeCompleteModal = () => {
  showCompleteModal.value = false;
  currentTodo.value = null;
  completeRemark.value = "";
};

const confirmComplete = async () => {
  try {
    if (!currentTodo.value) return;

    vibrate.medium();

    // 更新待办事项状态
    const success = recordStore.updateRecord(currentTodo.value.recordId, {
      isCompleted: true,
      completeRemark: completeRemark.value.trim(),
      completeTime: Date.now()
    });

    if (success) {
      uni.showToast({
        title: '已完成',
        icon: 'success'
      });

      // 重新加载提醒数据
      await loadReminders();

      closeCompleteModal();
    } else {
      throw new Error('更新失败');
    }
  } catch (error) {
    console.error('完成待办事项失败:', error);
    vibrate.error();
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 生日相关导航方法
const goToBirthdayList = () => {
  uni.navigateTo({
    url: "/pages/birthday/list",
  });
};

const goToBirthdayDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/birthday/detail?id=${recordId}`,
  });
};

// 姨妈记录导航
const goToMenstruationRecord = () => {
  uni.navigateTo({
    url: `/pages/record/add?type=menstruation`,
  });
};

// 加载提醒数据
const loadReminders = async () => {
  try {
    // 获取天气信息
    weatherInfo.value = await reminderService.getWeatherInfo();

    // 获取节日提醒
    upcomingHolidays.value = reminderService.getUpcomingHolidays();

    // 获取生日提醒
    const birthdayRecords = birthdayService.getBirthdayRecords();
    upcomingBirthdays.value =
      reminderService.getUpcomingBirthdays(birthdayRecords);

    // 获取待办事项
    pendingTodos.value = reminderService.getPendingTodos(recordStore.records);

    // 获取姨妈期提醒
    menstruationReminder.value = reminderService.getMenstruationReminder(
      recordStore.records
    );
  } catch (error) {
    console.error("加载提醒数据失败:", error);
  }
};

// 生命周期
onMounted(async () => {
  recordStore.loadFromStorage();
  appStore.loadUserData();

  // 初始化模块可见性状态
  await moduleVisibilityStore.loadFromStorage();

  await loadReminders();
});

// 模块隐藏相关方法
const handleModuleHide = async (groupKey) => {
  try {
    // 隐藏整个模块组
    await moduleVisibilityStore.hideModule(groupKey);
    console.log(`模块组 ${groupKey} 已隐藏`);
  } catch (error) {
    console.error('隐藏模块组失败:', error);
    uni.showToast({
      title: '隐藏失败，请重试',
      icon: 'none'
    });
  }
};

// 通过按钮隐藏模块（带确认对话框）
const handleModuleHideWithConfirm = async (groupKey) => {
  try {
    // 轻微触觉反馈
    vibrate.light();

    // 获取模块组名称
    const groupName = MODULE_GROUPS[groupKey]?.name || '该模块组';

    // 显示确认对话框
    const result = await new Promise((resolve) => {
      uni.showModal({
        title: '确认隐藏',
        content: `确定要隐藏"${groupName}"吗？隐藏后可以通过悬浮按钮或"显示所有模块"按钮恢复。`,
        confirmText: '隐藏',
        cancelText: '取消',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });

    if (result) {
      // 用户确认隐藏，中等触觉反馈
      vibrate.medium();
      await handleModuleHide(groupKey);
      uni.showToast({
        title: '已隐藏',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('隐藏模块组失败:', error);
    // 错误触觉反馈
    vibrate.error();
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

const handleModuleShow = async (groupKey) => {
  try {
    // 显示整个模块组
    await moduleVisibilityStore.showModule(groupKey);
    console.log(`模块组 ${groupKey} 已显示`);
  } catch (error) {
    console.error('显示模块组失败:', error);
    uni.showToast({
      title: '显示失败，请重试',
      icon: 'none'
    });
  }
};

const handleShowAllModules = async () => {
  try {
    await moduleVisibilityStore.showAllModules();
    console.log('所有模块组已显示');
    uni.showToast({
      title: '所有模块已恢复显示',
      icon: 'success'
    });
  } catch (error) {
    console.error('显示所有模块失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 检查模块组是否隐藏
const isModuleGroupCompletelyHidden = (groupKey) => {
  return moduleVisibilityStore.isModuleHidden(groupKey);
};


</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 20rpx;
  margin-bottom: 20rpx;

  .search-bar {
    .search-wrapper {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 50rpx;
      padding: 0 20rpx;
      gap: 12rpx;

      .search-input {
        flex: 1;
        height: 70rpx;
        font-size: 28rpx;
        background: transparent;
        border: none;
        color: #333;
      }

      .search-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
        background: #667eea;

        .search-icon {
          font-size: 24rpx;
          color: white;
        }
      }
    }
  }
}

.today-stats {
  margin: 0 20rpx 20rpx;

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .stats-date {
      font-size: 28rpx;
      color: #666;
    }
  }

  .stats-content {
    display: flex;
    gap: 20rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-emoji {
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }

      .stat-count {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

// 模块分组样式
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

    // 响应式设计 - 小屏幕适配
    @media (max-width: 750rpx) {
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

      // 兼容旧版本，保持原有的checkin-status样式
      .checkin-status {
        .status-text {
          font-size: 24rpx;
          color: #667eea;
          font-weight: 500;
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

  .empty-state {
    text-align: center;
    padding: 80rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// 今日提醒模块样式
.today-reminders {
  margin: 0 20rpx 20rpx;

  .reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .reminders-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .reminders-date {
      font-size: 24rpx;
      color: #999;
    }
  }

  .weather-section {
    margin-bottom: 24rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 16rpx;

    .weather-main {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .weather-emoji {
        font-size: 48rpx;
      }

      .weather-info {
        flex: 1;

        .weather-desc {
          display: block;
          font-size: 32rpx;
          font-weight: bold;
          color: white;
          margin-bottom: 8rpx;
        }

        .weather-tip {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .reminder-section {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 16rpx;

      .label-icon {
        font-size: 24rpx;
      }

      .label-text {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }

      .label-count {
        font-size: 22rpx;
        color: #999;
        margin-left: auto;
      }

      .view-more {
        font-size: 24rpx;
        color: #667eea;
        margin-left: auto;
      }
    }

    .reminder-list {
      .reminder-item {
        display: flex;
        align-items: center;
        gap: 16rpx;
        padding: 16rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        margin-bottom: 12rpx;
        transition: all 0.3s;

        &:last-child {
          margin-bottom: 0;
        }

        &:active {
          background: #f0f0f0;
        }

        &.today {
          background: linear-gradient(135deg, #ff6b9d, #ff8a80);

          .reminder-text,
          .reminder-sub {
            color: white;
          }

          .days-today {
            background: white;
            color: #ff6b9d;
          }
        }

        &.overdue {
          background: #fff5f5;
          border-left: 4rpx solid #ff4757;
        }

        &.urgent {
          background: #fff8e6;
          border-left: 4rpx solid #ffa502;
        }

        // 待办事项特殊样式
        &.todo-item {
          .reminder-content {
            cursor: pointer;

            &:hover {
              opacity: 0.8;
            }
          }

          .todo-actions {
            flex-shrink: 0;

            .complete-btn {
              width: 56rpx;
              height: 56rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #34c759, #30d158);
              border-radius: 50%;
              transition: all 0.3s;
              cursor: pointer;

              &:hover {
                transform: scale(1.1);
                box-shadow: 0 4rpx 12rpx rgba(52, 199, 89, 0.3);
              }

              &:active {
                transform: scale(0.9);
              }

              .complete-icon {
                font-size: 24rpx;
                color: white;
                font-weight: bold;
              }
            }
          }
        }

        .reminder-icon {
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;

          &.todo {
            background: #e8f5e9;

            &.overdue {
              background: #ffebee;
            }

            &.urgent {
              background: #fff3e0;
            }
          }

          &.birthday {
            background: #fce4ec;

            &.today {
              background: rgba(255, 255, 255, 0.3);
            }
          }

          &.holiday {
            background: #e3f2fd;

            &.today {
              background: rgba(255, 255, 255, 0.3);
            }
          }

          &.menstruation {
            background: #fce4ec;
          }

          .icon-emoji {
            font-size: 28rpx;
          }
        }

        .reminder-content {
          flex: 1;
          min-width: 0;

          .reminder-text {
            display: block;
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 4rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .reminder-sub {
            font-size: 24rpx;
            color: #666;
          }
        }

        .reminder-days {
          flex-shrink: 0;

          .days-today {
            background: #ff6b9d;
            color: white;
            padding: 6rpx 12rpx;
            border-radius: 16rpx;
            font-size: 22rpx;
            font-weight: 500;
          }

          .days-count {
            font-size: 26rpx;
            color: #667eea;
            font-weight: bold;
          }
        }

        .reminder-arrow {
          font-size: 28rpx;
          color: #ccc;
          flex-shrink: 0;
        }

        .holiday-badge {
          background: #ff6b9d;
          color: white;
          padding: 4rpx 10rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          flex-shrink: 0;
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

// 待办事项完成弹窗样式
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
  z-index: 999;
}

.complete-modal {
  width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  margin: 0 40rpx;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .modal-close {
      font-size: 40rpx;
      color: #999;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .modal-content {
    padding: 40rpx;

    .todo-info {
      margin-bottom: 30rpx;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;

      .todo-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        line-height: 1.4;
      }
    }

    .remark-section {
      .remark-label {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .remark-input {
        width: 100%;
        min-height: 120rpx;
        padding: 20rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 12rpx;
        font-size: 26rpx;
        background: #f8f9fa;
        resize: none;
        line-height: 1.5;
      }

      .char-count {
        display: block;
        text-align: right;
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }

  .modal-actions {
    display: flex;
    gap: 20rpx;
    padding: 0 40rpx 40rpx;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;
      transition: all 0.3s;

      &:active {
        transform: scale(0.98);
      }
    }

    .cancel-btn {
      background: #f5f5f5;
      color: #666;
    }

    .confirm-btn {
      background: #34c759;
      color: white;
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .complete-modal {
    width: 90%;
    margin: 0 5%;

    .modal-header {
      padding: 24rpx 30rpx;

      .modal-title {
        font-size: 28rpx;
      }
    }

    .modal-content {
      padding: 30rpx;

      .todo-info {
        .todo-title {
          font-size: 26rpx;
        }
      }
    }

    .modal-actions {
      padding: 0 30rpx 30rpx;

      .cancel-btn,
      .confirm-btn {
        height: 70rpx;
        font-size: 26rpx;
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .complete-modal {
    background: #2c2c2e;

    .modal-header {
      border-bottom-color: #3a3a3c;

      .modal-title {
        color: #ffffff;
      }

      .modal-close {
        color: #8e8e93;
      }
    }

    .modal-content {
      .todo-info {
        background: #1c1c1e;

        .todo-title {
          color: #ffffff;
        }
      }

      .remark-section {
        .remark-label {
          color: #8e8e93;
        }

        .remark-input {
          background: #1c1c1e;
          border-color: #3a3a3c;
          color: #ffffff;
        }

        .char-count {
          color: #8e8e93;
        }
      }
    }

    .modal-actions {
      .cancel-btn {
        background: #3a3a3c;
        color: #ffffff;
      }
    }
  }
}
</style>
