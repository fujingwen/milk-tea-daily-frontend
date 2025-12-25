<template>
  <view class="birthday-list-page">
    <!-- 顶部统计 -->
    <view class="stats-section card">
      <view class="stats-header">
        <text class="stats-title">生日统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-number">{{ todayBirthdays.length }}</text>
          <text class="stat-label">今日生日</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ upcomingBirthdays.length }}</text>
          <text class="stat-label">7天内</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ thisMonthBirthdays.length }}</text>
          <text class="stat-label">本月生日</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ allBirthdays.length }}</text>
          <text class="stat-label">总记录</text>
        </view>
      </view>
    </view>

    <!-- 今日生日 -->
    <view v-if="todayBirthdays.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">🎉 今日生日</text>
      </view>
      <view class="birthday-list">
        <view
          v-for="birthday in todayBirthdays"
          :key="birthday.recordId"
          class="birthday-item today-birthday card"
          @click="goToDetail(birthday)"
        >
          <view class="birthday-info">
            <view class="name-section">
              <text class="name">{{ birthday.name }}</text>
              <text class="age"
                >{{ calculateAge(birthday.birthday) + 1 }}岁</text
              >
            </view>
            <view class="relationship">
              <text class="relationship-text">{{
                getRelationshipLabel(birthday.relationship)
              }}</text>
            </view>
          </view>
          <view class="birthday-actions">
            <text class="birthday-date">🎂 生日快乐！</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 即将到来的生日 -->
    <view v-if="upcomingBirthdays.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">📅 即将到来</text>
      </view>
      <view class="birthday-list">
        <view
          v-for="birthday in upcomingBirthdays"
          :key="birthday.recordId"
          class="birthday-item upcoming-birthday card"
          @click="goToDetail(birthday)"
        >
          <view class="birthday-info">
            <view class="name-section">
              <text class="name">{{ birthday.name }}</text>
              <text class="age">{{ calculateAge(birthday.birthday) }}岁</text>
            </view>
            <view class="relationship">
              <text class="relationship-text">{{
                getRelationshipLabel(birthday.relationship)
              }}</text>
            </view>
          </view>
          <view class="birthday-actions">
            <text class="days-until"
              >还有{{ getDaysUntilBirthday(birthday.birthday) }}天</text
            >
            <text class="birthday-date">{{
              formatBirthdayDisplay(birthday.birthday)
            }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 本月生日 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">📆 本月生日</text>
        <text
          class="section-more"
          @click="showAllBirthdays = !showAllBirthdays"
        >
          {{ showAllBirthdays ? "收起" : "查看全部" }}
        </text>
      </view>
      <view class="birthday-list">
        <view
          v-for="birthday in displayBirthdays"
          :key="birthday.recordId"
          class="birthday-item card"
          @click="goToDetail(birthday)"
        >
          <view class="birthday-info">
            <view class="name-section">
              <text class="name">{{ birthday.name }}</text>
              <text class="age">{{ calculateAge(birthday.birthday) }}岁</text>
              <text class="zodiac">{{
                getZodiacSign(birthday.birthday).emoji
              }}</text>
            </view>
            <view class="relationship">
              <text class="relationship-text">{{
                getRelationshipLabel(birthday.relationship)
              }}</text>
            </view>
          </view>
          <view class="birthday-actions">
            <text class="birthday-date">{{
              formatBirthdayDisplay(birthday.birthday)
            }}</text>
            <text class="days-info"
              >{{ getDaysUntilBirthday(birthday.birthday) }}天后</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="allBirthdays.length === 0" class="empty-state">
      <text class="empty-text">还没有生日记录</text>
      <button class="add-button" @click="goToAdd">添加第一个生日</button>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import birthdayService from "@/utils/birthdayService.js";
import {
  calculateAge,
  getDaysUntilBirthday,
  getZodiacSign,
  formatBirthdayDisplay,
} from "@/utils/index.js";
import { RELATIONSHIP_TYPES } from "@/utils/constants.js";

// 响应式数据
const allBirthdays = ref([]);
const showAllBirthdays = ref(false);

// 计算属性
const todayBirthdays = computed(() => {
  return birthdayService.getTodayBirthdays();
});

const upcomingBirthdays = computed(() => {
  return birthdayService
    .getUpcomingBirthdays()
    .filter((b) => getDaysUntilBirthday(b.birthday) > 0);
});

const thisMonthBirthdays = computed(() => {
  return birthdayService.getThisMonthBirthdays();
});

const displayBirthdays = computed(() => {
  if (showAllBirthdays.value) {
    return allBirthdays.value;
  }
  return thisMonthBirthdays.value;
});

// 方法
const getRelationshipLabel = (type) => {
  const relationship = RELATIONSHIP_TYPES.find((r) => r.value === type);
  return relationship ? relationship.label : "其他";
};

const loadBirthdays = () => {
  allBirthdays.value = birthdayService.getBirthdayRecords();
};

const goToDetail = (birthday) => {
  uni.navigateTo({
    url: `/pages/birthday/detail?id=${birthday.recordId}`,
  });
};

const goToAdd = () => {
  uni.navigateTo({
    url: "/pages/birthday/add",
  });
};

// 生命周期
onMounted(() => {
  loadBirthdays();
});
</script>

<style lang="scss" scoped>
.birthday-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.stats-section {
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
    display: flex;
    justify-content: space-between;

    .stat-item {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 36rpx;
        color: #ff6b9d;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.section {
  margin-bottom: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 26rpx;
      color: #ff6b9d;
    }
  }
}

.birthday-list {
  .birthday-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    transition: all 0.3s;

    &.today-birthday {
      background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
      color: white;

      .name,
      .age,
      .relationship-text,
      .birthday-date {
        color: white;
      }
    }

    &.upcoming-birthday {
      border-left: 4rpx solid #ff6b9d;
    }

    .birthday-info {
      flex: 1;

      .name-section {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 8rpx;

        .name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .age {
          font-size: 24rpx;
          color: #666;
          background: #f0f0f0;
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
        }

        .zodiac {
          font-size: 24rpx;
        }
      }

      .relationship {
        .relationship-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .birthday-actions {
      text-align: right;

      .days-until {
        display: block;
        font-size: 24rpx;
        color: #ff6b9d;
        font-weight: 500;
        margin-bottom: 4rpx;
      }

      .birthday-date {
        display: block;
        font-size: 26rpx;
        color: #666;
      }

      .days-info {
        display: block;
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }

  .add-button {
    background: #ff6b9d;
    color: white;
    border: none;
    padding: 20rpx 40rpx;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #ff6b9d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 157, 0.4);
  z-index: 999;

  .fab-icon {
    font-size: 48rpx;
    color: white;
    font-weight: bold;
  }
}
</style>
