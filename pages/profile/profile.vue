<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="user-info card">
      <view class="user-avatar">
        <image
          :src="userInfo.avatar || '/static/default-avatar.png'"
          class="avatar-img"
        />
      </view>
      <view class="user-details">
        <text class="user-name">{{ userInfo.nickname || "奶茶爱好者" }}</text>
        <text class="user-id">ID: {{ userInfo.userId || "local" }}</text>
      </view>
      <u-button
        v-if="!isLoggedIn"
        type="primary"
        size="small"
        @click="handleLogin"
      >
        登录
      </u-button>
    </view>

    <!-- 数据概览 -->
    <view class="data-overview card">
      <view class="overview-header">
        <text class="overview-title">数据概览</text>
      </view>
      <view class="overview-stats">
        <view class="stat-card">
          <text class="stat-number">{{ totalRecords }}</text>
          <text class="stat-label">总记录数</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ usedDays }}</text>
          <text class="stat-label">使用天数</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ activeModules }}</text>
          <text class="stat-label">活跃模块</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="function-menu">
      <view class="menu-item card" @click="goToBackup">
        <view class="menu-icon">
          <text class="icon-text">☁️</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">数据备份</text>
          <text class="menu-desc">备份和恢复你的数据</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <view class="menu-item card" @click="goToSettings">
        <view class="menu-icon">
          <text class="icon-text">⚙️</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">系统设置</text>
          <text class="menu-desc">通知、隐私等设置</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <view class="menu-item card" @click="goToBirthdayList">
        <view class="menu-icon">
          <text class="icon-text">🎂</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">生日记录</text>
          <text class="menu-desc">管理朋友和家人的生日</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <view class="menu-item card" @click="goToHelp">
        <view class="menu-icon">
          <text class="icon-text">❓</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">帮助中心</text>
          <text class="menu-desc">使用帮助和常见问题</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <!-- 开发者选项 -->
      <view
        class="menu-item card developer-option"
        @click="showDeveloperMenu"
        v-if="isDevelopment"
      >
        <view class="menu-icon">
          <text class="icon-text">🛠️</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">开发者选项</text>
          <text class="menu-desc">Mock数据管理和调试工具</text>
        </view>
        <text class="arrow-right">›</text>
      </view>

      <view class="menu-item card" @click="goToAbout">
        <view class="menu-icon">
          <text class="icon-text">ℹ️</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">关于我们</text>
          <text class="menu-desc">版本信息和联系方式</text>
        </view>
        <text class="arrow-right">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="isLoggedIn">
      <u-button
        type="default"
        @click="handleLogout"
        custom-style="color: #ff3b30; border-color: #ff3b30;"
      >
        退出登录
      </u-button>
    </view>

    <!-- 登录弹窗 -->
    <u-popup v-model="showLoginModal" mode="center" border-radius="20">
      <view class="login-modal">
        <view class="login-header">
          <text class="login-title">登录随手记</text>
          <text class="login-desc">登录后可同步数据到云端</text>
        </view>

        <view class="login-methods">
          <!-- #ifdef MP-WEIXIN -->
          <u-button
            type="primary"
            @click="wechatLogin"
            custom-style="background: #07c160;"
          >
            <u-icon name="wechat-fill" color="white" size="20" />
            微信快速登录
          </u-button>
          <!-- #endif -->

          <!-- #ifdef APP-PLUS -->
          <view class="phone-login">
            <u-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              type="number"
            />
            <view class="code-input">
              <u-input
                v-model="loginForm.code"
                placeholder="验证码"
                type="number"
              />
              <u-button
                size="small"
                :disabled="codeCountdown > 0"
                @click="sendCode"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s` : "发送验证码" }}
              </u-button>
            </view>
            <u-button type="primary" @click="phoneLogin"> 手机号登录 </u-button>
          </view>
          <!-- #endif -->
        </view>

        <view class="login-actions">
          <u-button type="default" @click="closeLoginModal"> 取消 </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAppStore, useRecordStore } from "@/stores";
import { showToast, showConfirm } from "@/utils";
import MockHelper from "@/utils/mockHelper.js";

const appStore = useAppStore();
const recordStore = useRecordStore();

// 响应式数据
const showLoginModal = ref(false);
const loginForm = ref({
  phone: "",
  code: "",
});
const codeCountdown = ref(0);

// 计算属性
const isLoggedIn = computed(() => appStore.isLoggedIn);
const userInfo = computed(() => appStore.userInfo || {});
const isDevelopment = computed(() => process.env.NODE_ENV === "development");

const totalRecords = computed(() => recordStore.records.length);

const usedDays = computed(() => {
  if (recordStore.records.length === 0) return 0;

  const dates = new Set();
  recordStore.records.forEach((record) => {
    const date = new Date(record.createTime).toDateString();
    dates.add(date);
  });

  return dates.size;
});

const activeModules = computed(() => {
  const modules = new Set();
  recordStore.records.forEach((record) => {
    modules.add(record.moduleType);
  });

  return modules.size;
});

// 方法
const handleLogin = () => {
  showLoginModal.value = true;
};

const wechatLogin = () => {
  // #ifdef MP-WEIXIN
  uni.getUserProfile({
    desc: "用于完善用户资料",
    success: (res) => {
      const userInfo = {
        userId: "wx_" + Date.now(),
        nickname: res.userInfo.nickName,
        avatar: res.userInfo.avatarUrl,
      };

      appStore.setUser(userInfo);
      showToast("登录成功", "success");
      closeLoginModal();
    },
    fail: () => {
      showToast("登录失败", "none");
    },
  });
  // #endif
};

const sendCode = () => {
  if (!loginForm.value.phone) {
    showToast("请输入手机号", "none");
    return;
  }

  // 模拟发送验证码
  codeCountdown.value = 60;
  const timer = setInterval(() => {
    codeCountdown.value--;
    if (codeCountdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);

  showToast("验证码已发送", "success");
};

const phoneLogin = () => {
  if (!loginForm.value.phone || !loginForm.value.code) {
    showToast("请填写完整信息", "none");
    return;
  }

  // 模拟登录
  const userInfo = {
    userId: "phone_" + loginForm.value.phone,
    nickname: "用户" + loginForm.value.phone.slice(-4),
    avatar: "",
  };

  appStore.setUser(userInfo);
  showToast("登录成功", "success");
  closeLoginModal();
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  loginForm.value = { phone: "", code: "" };
};

const handleLogout = async () => {
  const confirmed = await showConfirm("确定要退出登录吗？");
  if (confirmed) {
    appStore.logout();
    showToast("已退出登录", "success");
  }
};

const goToBackup = () => {
  showToast("备份功能开发中...", "none");
};

const goToSettings = () => {
  showToast("设置功能开发中...", "none");
};

const goToBirthdayList = () => {
  uni.navigateTo({
    url: "/pages/birthday/list",
  });
};

const goToHelp = () => {
  showToast("帮助功能开发中...", "none");
};

const goToAbout = () => {
  uni.showModal({
    title: "关于奶茶与日常",
    content:
      "版本：1.0.0\n记录奶茶与日常生活的美好时光\n一款轻量化的多场景记录工具",
    showCancel: false,
  });
};

// 开发者功能
const showDeveloperMenu = () => {
  MockHelper.showDeveloperMenu();
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
  appStore.loadUserData();
});
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;

  .user-avatar {
    .avatar-img {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #eee;
    }
  }

  .user-details {
    flex: 1;

    .user-name {
      display: block;
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 8rpx;
    }

    .user-id {
      display: block;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.data-overview {
  margin-bottom: 20rpx;

  .overview-header {
    margin-bottom: 20rpx;

    .overview-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .overview-stats {
    display: flex;
    gap: 20rpx;

    .stat-card {
      flex: 1;
      text-align: center;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;

      .stat-number {
        display: block;
        font-size: 36rpx;
        color: #667eea;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.function-menu {
  margin-bottom: 20rpx;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;
    transition: all 0.3s;

    &.developer-option {
      border: 2rpx dashed #ff6b9d;
      background: linear-gradient(
        135deg,
        rgba(255, 107, 157, 0.05) 0%,
        rgba(255, 107, 157, 0.1) 100%
      );

      .menu-title {
        color: #ff6b9d !important;
      }
    }

    .menu-icon {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon-text {
        font-size: 32rpx;
      }
    }

    .menu-content {
      flex: 1;

      .menu-title {
        display: block;
        font-size: 30rpx;
        color: #333;
        margin-bottom: 4rpx;
      }

      .menu-desc {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
    }

    .arrow-right {
      font-size: 32rpx;
      color: #ccc;
      font-weight: bold;
    }
  }
}

.logout-section {
  margin-top: 40rpx;
}

.login-modal {
  width: 600rpx;
  padding: 40rpx;

  .login-header {
    text-align: center;
    margin-bottom: 40rpx;

    .login-title {
      display: block;
      font-size: 36rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 12rpx;
    }

    .login-desc {
      display: block;
      font-size: 28rpx;
      color: #666;
    }
  }

  .login-methods {
    margin-bottom: 30rpx;

    .phone-login {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .code-input {
        display: flex;
        gap: 12rpx;
        align-items: center;
      }
    }
  }

  .login-actions {
    text-align: center;
  }
}
</style>
