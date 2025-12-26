<template>
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
</template>

<script setup>
import { ref } from "vue";

const searchKeyword = ref("");

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    uni.navigateTo({
      url: `/pages/record/list?search=${encodeURIComponent(
        searchKeyword.value
      )}`,
    });
  }
};
</script>

<style lang="scss" scoped>
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
</style>
