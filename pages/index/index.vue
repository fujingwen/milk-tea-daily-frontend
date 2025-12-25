<template>
  <view class="index-page">
    <!-- 顶部搜索和语音 -->
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
          <view class="voice-btn" @click="handleVoiceInput">
            <text class="voice-icon">🎤</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="today-stats card">
      <view class="stats-header">
        <text class="stats-title">今日记录</text>
        <text class="stats-date">{{ formatDate(Date.now(), "MM月DD日") }}</text>
      </view>
      <view class="stats-content">
        <view class="stat-item" v-for="(count, type) in todayStats" :key="type">
          <text class="stat-emoji">{{ getModuleConfig(type).icon }}</text>
          <text class="stat-count">{{ count }}</text>
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
        </view>
        <view class="reminder-list">
          <view
            v-for="todo in pendingTodos.slice(0, 3)"
            :key="todo.recordId"
            class="reminder-item"
            :class="todo.urgency"
            @click="goToTodoDetail(todo.recordId)"
          >
            <view class="reminder-icon todo" :class="todo.urgency">
              <text class="icon-emoji">{{
                todo.urgency === "overdue" ? "⚠️" : "📝"
              }}</text>
            </view>
            <view class="reminder-content">
              <text class="reminder-text">{{ todo.content }}</text>
              <text class="reminder-sub" v-if="todo.deadline">{{
                todo.message
              }}</text>
            </view>
            <view class="reminder-arrow">›</view>
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
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">✨</text>
            <text class="group-name">今日打卡</text>
          </view>
          <view class="checkin-status">
            <text class="status-text"
              >{{ getTodayCheckInCount }}/{{ dailyCheckInModules.length }}</text
            >
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

      <!-- 其他模块分组 -->
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">📋</text>
            <text class="group-name">生活记录</text>
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

      <!-- 美食相关 -->
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">🍽️</text>
            <text class="group-name">美食相关</text>
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

      <!-- 计划提醒 -->
      <view class="module-group card">
        <view class="group-header">
          <view class="group-title">
            <text class="group-icon">📅</text>
            <text class="group-name">计划提醒</text>
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

    <!-- 语音输入弹窗 -->
    <view v-if="showVoiceModal" class="modal-overlay" @click="closeVoiceModal">
      <view class="voice-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">语音录入</text>
          <text class="modal-close" @click="closeVoiceModal">×</text>
        </view>
        <view class="voice-content">
          <view class="voice-icon" :class="{ recording: isRecording }">
            <text class="mic-icon">🎤</text>
          </view>
          <text class="voice-text">{{ voiceText || "点击开始录音" }}</text>
          <view class="voice-actions">
            <button class="btn btn-primary" @click="toggleRecording">
              {{ isRecording ? "停止录音" : "开始录音" }}
            </button>
            <button class="btn btn-default" @click="closeVoiceModal">
              取消
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore, useAppStore } from "@/stores";
import { MODULE_CONFIG, MODULE_GROUPS } from "@/utils/constants";
import { formatDate, formatRelativeTime, getTodayRange } from "@/utils";
import birthdayService from "@/utils/birthdayService.js";
import reminderService from "@/utils/reminderService.js";

const recordStore = useRecordStore();
const appStore = useAppStore();

// 响应式数据
const searchKeyword = ref("");
const showVoiceModal = ref(false);
const isRecording = ref(false);
const voiceText = ref("");
const weatherInfo = ref(null);
const upcomingHolidays = ref([]);
const upcomingBirthdays = ref([]);
const pendingTodos = ref([]);
const menstruationReminder = ref(null);

// 模块分组
const dailyCheckInModules = computed(() => MODULE_GROUPS.dailyCheckIn.modules);
const lifeRecordModules = computed(() => MODULE_GROUPS.lifeRecord.modules);
const foodRelatedModules = computed(() => MODULE_GROUPS.foodRelated.modules);
const planReminderModules = computed(() => MODULE_GROUPS.planReminder.modules);

// 计算属性
const moduleConfig = computed(() => MODULE_CONFIG);

const recentRecords = computed(() => {
  return recordStore.records.slice(0, 5);
});

const todayStats = computed(() => {
  const { start, end } = getTodayRange();
  const todayRecords = recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  );

  const stats = {};
  todayRecords.forEach((record) => {
    stats[record.moduleType] = (stats[record.moduleType] || 0) + 1;
  });

  return stats;
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

const handleVoiceInput = () => {
  showVoiceModal.value = true;
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = () => {
  // #ifdef MP-WEIXIN
  uni.authorize({
    scope: "scope.record",
    success() {
      const recorderManager = uni.getRecorderManager();
      recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: "mp3",
      });

      recorderManager.onStart(() => {
        isRecording.value = true;
        voiceText.value = "正在录音...";
      });

      recorderManager.onStop((res) => {
        isRecording.value = false;
        voiceText.value = "录音完成，正在识别...";
        // 这里应该调用语音识别API
        setTimeout(() => {
          voiceText.value = "识别结果：今天心情很好";
        }, 1000);
      });
    },
    fail() {
      uni.showToast({
        title: "需要录音权限",
        icon: "none",
      });
    },
  });
  // #endif

  // #ifdef APP-PLUS
  // App端使用讯飞语音SDK
  isRecording.value = true;
  voiceText.value = "正在录音...";
  // 模拟录音
  setTimeout(() => {
    isRecording.value = false;
    voiceText.value = "录音完成，正在识别...";
    setTimeout(() => {
      voiceText.value = "识别结果：今天心情很好";
    }, 1000);
  }, 3000);
  // #endif
};

const stopRecording = () => {
  // #ifdef MP-WEIXIN
  const recorderManager = uni.getRecorderManager();
  recorderManager.stop();
  // #endif

  // #ifdef APP-PLUS
  isRecording.value = false;
  voiceText.value = "录音已停止";
  // #endif
};

const closeVoiceModal = () => {
  showVoiceModal.value = false;
  isRecording.value = false;
  voiceText.value = "";
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

// 待办相关导航方法
const goToTodoDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${recordId}`,
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
  await loadReminders();
});
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

      .search-btn,
      .voice-btn {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
      }

      .search-btn {
        background: #667eea;

        .search-icon {
          font-size: 24rpx;
          color: white;
        }
      }

      .voice-btn {
        background: #ff6b9d;

        .voice-icon {
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

  .voice-modal {
    width: 600rpx;
    background: white;
    border-radius: 20rpx;
    overflow: hidden;

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
      }
    }

    .voice-content {
      padding: 40rpx;
      text-align: center;

      .voice-icon {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background: #667eea;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 30rpx;
        transition: all 0.3s;

        &.recording {
          background: #ff3b30;
          animation: pulse 1s infinite;
        }

        .mic-icon {
          font-size: 48rpx;
          color: white;
        }
      }

      .voice-text {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 40rpx;
      }

      .voice-actions {
        display: flex;
        gap: 20rpx;
        justify-content: center;

        .btn {
          padding: 20rpx 40rpx;
          border-radius: 50rpx;
          border: none;
          font-size: 28rpx;
          transition: all 0.3s;

          &.btn-primary {
            background: #667eea;
            color: white;

            &:active {
              background: #5a6fd8;
            }
          }

          &.btn-default {
            background: #f5f5f5;
            color: #333;

            &:active {
              background: #e8e8e8;
            }
          }
        }
      }
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
</style>
