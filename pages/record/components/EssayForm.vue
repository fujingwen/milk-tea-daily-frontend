<template>
  <view class="essay-form">
    <view class="essay-section">
      <view class="form-item">
        <text class="form-label">碎碎念类型</text>
        <view class="essay-type-options">
          <view
            v-for="type in essayTypes"
            :key="type.value"
            class="essay-type-option"
            :class="{ active: formData.essayType === type.value }"
            @click="updateFormData('essayType', type.value)"
          >
            <text class="type-emoji">{{ type.emoji }}</text>
            <text class="type-label">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">内容</text>
        <u-textarea
          :value="formData.content"
          @input="updateFormData('content', $event)"
          :placeholder="getEssayPlaceholder(formData.essayType)"
          maxlength="1000"
          count
          class="essay-textarea"
          :auto-height="true"
          :min-height="200"
        />
      </view>

      <!-- 显示今日已有的碎碎念 -->
      <view class="today-essays" v-if="todayEssays.length > 0">
        <view class="section-header">
          <text class="section-title">今日碎碎念</text>
          <text class="section-subtitle">点击可追加内容</text>
        </view>
        <view
          v-for="essay in todayEssays"
          :key="essay.recordId"
          class="essay-item"
          @click="$emit('append-essay', essay)"
        >
          <view class="essay-header">
            <view class="essay-type">
              <text class="type-emoji">{{
                getEssayTypeConfig(essay.essayType).emoji
              }}</text>
              <text class="type-name">{{
                getEssayTypeConfig(essay.essayType).label
              }}</text>
            </view>
            <text class="essay-time">{{ formatTime(essay.createTime) }}</text>
          </view>
          <text class="essay-content">{{ essay.content }}</text>
          <view class="essay-actions">
            <text class="append-hint">点击追加内容</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { ESSAY_TYPES } from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:formData", "append-essay"]);

const essayTypes = computed(() => ESSAY_TYPES);

// 今日碎碎念
const todayEssays = computed(() => {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  return props.records
    .filter(
      (record) =>
        record.moduleType === "essay" &&
        record.createTime >= todayStart &&
        record.createTime <= todayEnd
    )
    .sort((a, b) => b.createTime - a.createTime);
});

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};

const getEssayTypeConfig = (type) => {
  return ESSAY_TYPES.find((t) => t.value === type) || ESSAY_TYPES[0];
};

const getEssayPlaceholder = (type) => {
  const placeholders = {
    thoughts: "今天想说些什么呢...",
    wish: "许下一个小心愿...",
    advice: "给自己一些建议...",
    complain: "有什么想吐槽的...",
    gratitude: "今天感恩什么呢...",
    reflection: "反思一下今天...",
  };
  return placeholders[type] || placeholders.thoughts;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
</script>

<style lang="scss" scoped>
.essay-form {
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

  .essay-section {
    .essay-type-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12rpx;
      margin-bottom: 20rpx;

      .essay-type-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx;
        border-radius: 16rpx;
        border: 2rpx solid #eee;
        transition: all 0.3s;
        background: white;

        &.active {
          border-color: #34c759;
          background: rgba(52, 199, 89, 0.1);
        }

        .type-emoji {
          font-size: 32rpx;
          margin-bottom: 8rpx;
        }

        .type-label {
          font-size: 24rpx;
          color: #333;
          text-align: center;
        }
      }
    }

    .essay-textarea {
      background: white;
      border-radius: 12rpx;
      padding: 20rpx;
      border: 2rpx solid #eee;
      font-size: 28rpx;
      line-height: 1.6;
    }
  }

  .today-essays {
    margin-top: 30rpx;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .section-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }

      .section-subtitle {
        font-size: 24rpx;
        color: #999;
      }
    }

    .essay-item {
      background: white;
      border-radius: 16rpx;
      padding: 20rpx;
      margin-bottom: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;

      &:active {
        background: #f8f8f8;
        border-color: #34c759;
      }

      .essay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .essay-type {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .type-emoji {
            font-size: 20rpx;
          }

          .type-name {
            font-size: 24rpx;
            color: #666;
            font-weight: 500;
          }
        }

        .essay-time {
          font-size: 22rpx;
          color: #999;
        }
      }

      .essay-content {
        font-size: 26rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 12rpx;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .essay-actions {
        display: flex;
        justify-content: flex-end;

        .append-hint {
          font-size: 22rpx;
          color: #34c759;
          padding: 6rpx 12rpx;
          background: rgba(52, 199, 89, 0.1);
          border-radius: 12rpx;
        }
      }
    }
  }
}
</style>
