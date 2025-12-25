<template>
  <view id="app">
    <!-- uni-app不需要router-view，页面路由由框架自动处理 -->
  </view>
</template>

<script>
import birthdayService from "./utils/birthdayService.js";

export default {
  name: "App",
  onLaunch() {
    console.log("App Launch");
    // 初始化应用
    this.initApp();
  },
  onShow() {
    console.log("App Show");
    // 每次显示时检查生日提醒
    birthdayService.manualCheck();
  },
  onHide() {
    console.log("App Hide");
  },
  methods: {
    initApp() {
      // 检查存储权限
      // 初始化数据库
      // 设置默认配置

      // 初始化生日提醒服务
      setTimeout(() => {
        birthdayService.init();
      }, 1000); // 延迟1秒启动，确保应用完全加载
    },
  },
};
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
}

.container {
  padding: 20rpx;
}

.card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50rpx;
}

.text-primary {
  color: #667eea;
}

.text-secondary {
  color: #999;
  font-size: 28rpx;
}
</style>
