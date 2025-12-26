<template>
  <view class="daily-mood-form">
    <view class="form-item">
      <text class="form-label">心情类型</text>
      <view class="mood-options">
        <view
          class="mood-option"
          :class="{ active: formData.moodType === mood.value }"
          v-for="mood in moodTypes"
          :key="mood.value"
          @click="updateFormData('moodType', mood.value)"
        >
          <text class="mood-emoji">{{ mood.emoji }}</text>
          <text class="mood-label">{{ mood.label }}</text>
        </view>
      </view>
    </view>

    <view class="form-item">
      <text class="form-label">今日关键字</text>

      <!-- 关键字输入区域 -->
      <view class="keyword-input-area">
        <view class="input-container">
          <input
            class="keyword-input"
            v-model="keywordInput"
            placeholder="输入关键字..."
            @confirm="addKeyword"
          />
          <view
            class="add-btn"
            :class="{ disabled: !keywordInput?.trim() }"
            @click="addKeyword"
          >
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>

      <!-- 已添加的关键字 -->
      <view
        class="selected-keywords"
        v-if="formData.keywords && formData.keywords.length > 0"
      >
        <view class="keywords-header">
          <text class="keywords-title">已选择的关键字</text>
        </view>
        <view class="keywords-grid">
          <view
            v-for="(keyword, index) in formData.keywords"
            :key="index"
            class="keyword-tag selected"
          >
            <text class="tag-text">{{ keyword }}</text>
            <view class="tag-remove" @click="removeKeyword(index)">
              <text class="remove-icon">×</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 最近使用的关键字 -->
      <view class="recent-keywords" v-if="recentKeywords.length > 0">
        <view class="section-header">
          <text class="section-title">最近使用</text>
        </view>
        <view class="keywords-grid">
          <view
            v-for="keyword in recentKeywords"
            :key="keyword"
            class="keyword-tag recent"
            :class="{ 'already-selected': formData.keywords.includes(keyword) }"
            @click="toggleKeyword(keyword)"
          >
            <text class="tag-text">{{ keyword }}</text>
            <text v-if="formData.keywords.includes(keyword)" class="tag-check"
              >✓</text
            >
          </view>
        </view>
      </view>

      <!-- 推荐关键字 -->
      <view class="common-keywords">
        <view class="section-header">
          <text class="section-title">常用关键字</text>
        </view>
        <view class="keywords-grid">
          <view
            v-for="keyword in commonKeywords"
            :key="keyword"
            class="keyword-tag common"
            :class="{ 'already-selected': formData.keywords.includes(keyword) }"
            @click="toggleKeyword(keyword)"
          >
            <text class="tag-text">{{ keyword }}</text>
            <text v-if="formData.keywords.includes(keyword)" class="tag-check"
              >✓</text
            >
          </view>
        </view>
      </view>
    </view>

    <view class="form-item">
      <text class="form-label">详细描述</text>
      <u-textarea
        :value="formData.description"
        @input="updateFormData('description', $event)"
        placeholder="详细描述一下今天的心情和感受..."
        maxlength="500"
        count
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { MOOD_TYPES } from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

// 响应式数据
const keywordInput = ref("");

// 计算属性
const moodTypes = computed(() => MOOD_TYPES);

const commonKeywords = ref([
  "开心",
  "充实",
  "忙碌",
  "疲惫",
  "放松",
  "焦虑",
  "学习",
  "工作",
  "运动",
  "阅读",
  "思考",
  "创作",
  "购物",
  "聚餐",
  "旅行",
  "电影",
  "音乐",
  "游戏",
  "家庭",
  "朋友",
  "恋爱",
  "健康",
  "美食",
  "时尚",
  "科技",
  "艺术",
  "自然",
  "宠物",
  "摄影",
  "写作",
  "冥想",
  "瑜伽",
  "跑步",
  "健身",
  "烹饪",
  "园艺",
]);

const recentKeywords = computed(() => {
  const recent = uni.getStorageSync("recentKeywords") || [];
  return recent.slice(0, 12);
});

// 方法
const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};

const addKeyword = () => {
  const keyword = keywordInput.value?.trim();
  if (keyword && !props.formData.keywords.includes(keyword)) {
    const newKeywords = [...props.formData.keywords, keyword];
    updateFormData("keywords", newKeywords);
    keywordInput.value = "";
    updateRecentKeywords(keyword);
  }
};

const removeKeyword = (index) => {
  const newKeywords = [...props.formData.keywords];
  newKeywords.splice(index, 1);
  updateFormData("keywords", newKeywords);
};

const toggleKeyword = (keyword) => {
  const keywords = [...props.formData.keywords];
  const index = keywords.indexOf(keyword);
  if (index > -1) {
    keywords.splice(index, 1);
  } else {
    keywords.push(keyword);
    updateRecentKeywords(keyword);
  }
  updateFormData("keywords", keywords);
};

const updateRecentKeywords = (keyword) => {
  let recent = uni.getStorageSync("recentKeywords") || [];
  recent = recent.filter((k) => k !== keyword);
  recent.unshift(keyword);
  recent = recent.slice(0, 20);
  uni.setStorageSync("recentKeywords", recent);
};
</script>

<style lang="scss" scoped>
.daily-mood-form {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }
  }

  .mood-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;

    .mood-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx;
      border-radius: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;

      &.active {
        border-color: #ff9500;
        background: rgba(255, 149, 0, 0.1);
      }

      .mood-emoji {
        font-size: 24rpx;
        margin-bottom: 6rpx;
      }

      .mood-label {
        font-size: 22rpx;
        color: #333;
      }
    }
  }

  // 关键字相关样式
  .keyword-input-area {
    margin-bottom: 20rpx;

    .input-container {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx;
      background: white;
      border-radius: 12rpx;
      border: 2rpx solid #eee;

      .keyword-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        border: none;
        outline: none;
      }

      .add-btn {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: #667eea;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        &.disabled {
          background: #ccc;
          opacity: 0.5;
        }

        .add-icon {
          font-size: 32rpx;
          color: white;
          font-weight: bold;
        }
      }
    }
  }

  .selected-keywords,
  .recent-keywords,
  .common-keywords {
    margin-bottom: 24rpx;

    .keywords-header,
    .section-header {
      margin-bottom: 12rpx;

      .keywords-title,
      .section-title {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
      }
    }

    .keywords-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
    }
  }

  .keyword-tag {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    transition: all 0.3s;
    cursor: pointer;

    &.selected {
      background: #667eea;
      color: white;

      .tag-text {
        color: white;
      }

      .tag-remove {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;

        .remove-icon {
          font-size: 18rpx;
          color: white;
          font-weight: bold;
        }
      }
    }

    &.recent {
      background: #e8f4fd;
      border: 2rpx solid #b3d9f2;
      color: #2c5aa0;

      &.already-selected {
        background: #667eea;
        border-color: #667eea;
        color: white;

        .tag-text {
          color: white;
        }
      }

      .tag-check {
        font-size: 18rpx;
        color: white;
        font-weight: bold;
      }
    }

    &.common {
      background: #f0f0f0;
      border: 2rpx solid #ddd;
      color: #666;

      &.already-selected {
        background: #667eea;
        border-color: #667eea;
        color: white;

        .tag-text {
          color: white;
        }
      }

      .tag-check {
        font-size: 18rpx;
        color: white;
        font-weight: bold;
      }
    }

    .tag-text {
      font-size: 24rpx;
    }
  }
}
</style>
