<template>
  <view class="birthday-detail-page" v-if="birthday">
    <!-- 头部信息 -->
    <view class="header-section card">
      <view class="avatar-section">
        <view class="avatar">
          <text class="avatar-text">{{ birthday.name.charAt(0) }}</text>
        </view>
        <view class="header-info">
          <text class="name">{{ birthday.name }}</text>
          <text class="relationship">{{
            getRelationshipLabel(birthday.relationship)
          }}</text>
        </view>
      </view>

      <view class="birthday-info">
        <view class="birthday-date">
          <text class="date-text">{{
            formatBirthdayDisplay(birthday.birthday, birthday.calendarType)
          }}</text>
          <text class="zodiac"
            >{{ getZodiacSign(birthday.birthday).emoji }}
            {{ getZodiacSign(birthday.birthday).name }}</text
          >
        </view>
        <view class="age-info">
          <text class="age">{{ calculateAge(birthday.birthday) }}岁</text>
          <text class="days-until" :class="{ today: daysUntilBirthday === 0 }">
            {{
              daysUntilBirthday === 0
                ? "🎉 今天生日！"
                : `还有${daysUntilBirthday}天`
            }}
          </text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="actions-section card">
      <view class="action-buttons">
        <button
          v-if="birthday.phone"
          class="action-btn call-btn"
          @click="makeCall"
        >
          <text class="btn-icon">📞</text>
          <text class="btn-text">拨打电话</text>
        </button>
        <button class="action-btn message-btn" @click="sendBirthdayWish">
          <text class="btn-icon">💌</text>
          <text class="btn-text">发送祝福</text>
        </button>
        <button class="action-btn gift-btn" @click="showGiftIdeas">
          <text class="btn-icon">🎁</text>
          <text class="btn-text">礼物建议</text>
        </button>
      </view>
    </view>

    <!-- 详细信息 -->
    <view class="details-section card">
      <view class="section-title">详细信息</view>

      <view class="detail-item">
        <text class="detail-label">日历类型</text>
        <text class="detail-value">{{ birthday.calendarType === 'lunar' ? '农历' : '公历' }}</text>
      </view>

      <view class="detail-item">
        <text class="detail-label">重复设置</text>
        <text class="detail-value">{{ getRepeatLabel(birthday.repeatType) }}</text>
      </view>

      <view class="detail-item" v-if="birthday.phone">
        <text class="detail-label">手机号</text>
        <text class="detail-value">{{ birthday.phone }}</text>
      </view>

      <view class="detail-item" v-if="birthday.address">
        <text class="detail-label">地址</text>
        <text class="detail-value">{{ birthday.address }}</text>
      </view>

      <view class="detail-item">
        <text class="detail-label">完整生日</text>
        <text class="detail-value">{{
          formatFullBirthday(birthday.birthday)
        }}</text>
      </view>

      <view class="detail-item">
        <text class="detail-label">下次生日</text>
        <text class="detail-value">{{
          formatFullBirthday(getNextBirthday(birthday.birthday))
        }}</text>
      </view>

      <view class="detail-item" v-if="birthday.notes">
        <text class="detail-label">备注</text>
        <text class="detail-value notes">{{ birthday.notes }}</text>
      </view>
    </view>

    <!-- 提醒设置 -->
    <view class="reminder-section card">
      <view class="section-title">提醒设置</view>

      <view class="reminder-list">
        <view
          v-for="days in birthday.reminderSettings"
          :key="days"
          class="reminder-item"
        >
          <text class="reminder-text">{{ getReminderLabel(days) }}</text>
          <text class="reminder-status">已开启</text>
        </view>
      </view>
    </view>

    <!-- 标签 -->
    <view
      v-if="birthday.tags && birthday.tags.length > 0"
      class="tags-section card"
    >
      <view class="section-title">标签</view>

      <view class="tags-list">
        <view v-for="tag in birthday.tags" :key="tag" class="tag-item">
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section card">
      <view class="section-title">记录信息</view>

      <view class="history-item">
        <text class="history-label">创建时间</text>
        <text class="history-value">{{
          formatDate(birthday.createTime, "YYYY-MM-DD HH:mm")
        }}</text>
      </view>

      <view
        v-if="birthday.updateTime !== birthday.createTime"
        class="history-item"
      >
        <text class="history-label">更新时间</text>
        <text class="history-value">{{
          formatDate(birthday.updateTime, "YYYY-MM-DD HH:mm")
        }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <button class="edit-btn" @click="editBirthday">编辑</button>
      <button class="delete-btn" @click="deleteBirthday">删除</button>
    </view>

    <!-- 礼物建议弹窗 -->
    <view
      v-if="showGiftModal"
      class="gift-modal"
      @click="showGiftModal = false"
    >
      <view class="gift-content" @click.stop>
        <view class="gift-header">
          <text class="gift-title">🎁 礼物建议</text>
          <text class="gift-close" @click="showGiftModal = false">×</text>
        </view>
        <view class="gift-list">
          <view v-for="gift in giftSuggestions" :key="gift" class="gift-item">
            <text class="gift-text">{{ gift }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view v-else class="empty-state">
    <text class="empty-text">生日记录不存在</text>
    <button class="back-btn" @click="goBack">返回</button>
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
  getNextBirthday,
  formatDate,
  showToast,
  showConfirm,
} from "@/utils/index.js";
import {
  RELATIONSHIP_TYPES,
  BIRTHDAY_REMINDER_TYPES,
  REPEAT_TYPES,
} from "@/utils/constants.js";

// 响应式数据
const birthday = ref(null);
const showGiftModal = ref(false);

// 计算属性
const daysUntilBirthday = computed(() => {
  return birthday.value ? getDaysUntilBirthday(birthday.value.birthday) : 0;
});

const giftSuggestions = computed(() => {
  const age = birthday.value ? calculateAge(birthday.value.birthday) : 0;
  const relationship = birthday.value ? birthday.value.relationship : "";

  const suggestions = {
    family: ["鲜花", "蛋糕", "保健品", "家居用品", "电子产品"],
    friend: ["书籍", "音乐专辑", "手工艺品", "美食", "游戏"],
    colleague: ["办公用品", "咖啡", "植物", "书籍", "小礼品"],
    lover: ["珠宝", "香水", "玫瑰花", "巧克力", "浪漫晚餐"],
    classmate: ["文具", "书籍", "零食", "小饰品", "纪念品"],
    other: ["鲜花", "蛋糕", "礼品卡", "书籍", "小礼品"],
  };

  return suggestions[relationship] || suggestions.other;
});

// 方法
const getRelationshipLabel = (type) => {
  const relationship = RELATIONSHIP_TYPES.find((r) => r.value === type);
  return relationship ? relationship.label : "其他";
};

const getReminderLabel = (days) => {
  const reminder = BIRTHDAY_REMINDER_TYPES.find((r) => r.value === days);
  return reminder ? reminder.label : `提前${days}天`;
};

const getRepeatLabel = (type) => {
  const repeat = REPEAT_TYPES.find((r) => r.value === type);
  return repeat ? repeat.label : "每年";
};

const formatFullBirthday = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const makeCall = () => {
  if (birthday.value.phone) {
    uni.makePhoneCall({
      phoneNumber: birthday.value.phone,
      fail: () => {
        showToast("拨打电话失败", "none");
      },
    });
  }
};

const sendBirthdayWish = () => {
  const message = `🎉 祝${birthday.value.name}生日快乐！愿你永远开心健康！🎂`;

  // #ifdef MP-WEIXIN
  uni.setClipboardData({
    data: message,
    success: () => {
      showToast("祝福语已复制到剪贴板", "success");
    },
  });
  // #endif

  // #ifdef APP-PLUS
  uni.share({
    provider: "weixin",
    scene: "WXSceneSession",
    type: 0,
    summary: message,
    success: () => {
      showToast("祝福发送成功", "success");
    },
    fail: () => {
      showToast("发送失败", "none");
    },
  });
  // #endif
};

const showGiftIdeas = () => {
  showGiftModal.value = true;
};

const editBirthday = () => {
  uni.navigateTo({
    url: `/pages/birthday/add?id=${birthday.value.recordId}`,
  });
};

const deleteBirthday = async () => {
  const confirmed = await showConfirm(
    `确定要删除${birthday.value.name}的生日记录吗？`
  );
  if (confirmed) {
    const success = birthdayService.deleteBirthdayRecord(
      birthday.value.recordId
    );
    if (success) {
      showToast("删除成功", "success");
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      showToast("删除失败", "error");
    }
  }
};

const goBack = () => {
  uni.navigateBack();
};

const loadBirthday = (id) => {
  const records = birthdayService.getBirthdayRecords();
  const record = records.find((r) => r.recordId === id);

  if (record) {
    birthday.value = record;
  }
};

// 生命周期
onMounted(() => {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || {};

    if (options.id) {
      loadBirthday(options.id);
    }
  } catch (error) {
    console.error("获取页面参数失败:", error);
  }
});
</script>

<style lang="scss" scoped>
.birthday-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header-section {
  margin-bottom: 20rpx;

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 24rpx;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      background: #ff6b9d;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar-text {
        font-size: 36rpx;
        color: white;
        font-weight: bold;
      }
    }

    .header-info {
      flex: 1;

      .name {
        display: block;
        font-size: 36rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .relationship {
        font-size: 26rpx;
        color: #666;
        background: #f0f0f0;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
      }
    }
  }

  .birthday-info {
    .birthday-date {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .date-text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }

      .zodiac {
        font-size: 26rpx;
        color: #666;
      }
    }

    .age-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .age {
        font-size: 28rpx;
        color: #666;
      }

      .days-until {
        font-size: 28rpx;
        color: #ff6b9d;
        font-weight: 500;

        &.today {
          color: #34c759;
          font-weight: bold;
        }
      }
    }
  }
}

.actions-section {
  margin-bottom: 20rpx;

  .action-buttons {
    display: flex;
    gap: 16rpx;

    .action-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      padding: 20rpx;
      border: none;
      border-radius: 12rpx;
      font-size: 24rpx;

      .btn-icon {
        font-size: 32rpx;
      }

      .btn-text {
        font-size: 24rpx;
      }

      &.call-btn {
        background: #34c759;
        color: white;
      }

      &.message-btn {
        background: #ff9500;
        color: white;
      }

      &.gift-btn {
        background: #ff6b9d;
        color: white;
      }
    }
  }
}

.details-section,
.reminder-section,
.tags-section,
.history-section {
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .detail-item,
  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .detail-label,
    .history-label {
      font-size: 28rpx;
      color: #666;
      min-width: 120rpx;
    }

    .detail-value,
    .history-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      text-align: right;

      &.notes {
        text-align: left;
        margin-left: 20rpx;
        line-height: 1.5;
      }
    }
  }

  .reminder-list {
    .reminder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .reminder-text {
        font-size: 28rpx;
        color: #333;
      }

      .reminder-status {
        font-size: 24rpx;
        color: #34c759;
      }
    }
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .tag-item {
      background: #ff6b9d;
      color: white;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;

      .tag-text {
        font-size: 24rpx;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #e0e0e0;

  .edit-btn,
  .delete-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
  }

  .edit-btn {
    background: #ff6b9d;
    color: white;
  }

  .delete-btn {
    background: #ff3b30;
    color: white;
  }
}

.gift-modal {
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

  .gift-content {
    width: 600rpx;
    background: white;
    border-radius: 20rpx;
    padding: 40rpx;

    .gift-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;

      .gift-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .gift-close {
        font-size: 40rpx;
        color: #999;
      }
    }

    .gift-list {
      .gift-item {
        padding: 16rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .gift-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 40rpx;
  }

  .back-btn {
    background: #ff6b9d;
    color: white;
    border: none;
    padding: 20rpx 40rpx;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}
</style>
