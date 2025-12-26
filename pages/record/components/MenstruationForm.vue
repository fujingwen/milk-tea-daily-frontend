<template>
  <view class="menstruation-form">
    <!-- 开始日期选择 -->
    <view class="form-item">
      <text class="form-label">开始日期</text>
      <view class="date-picker-container">
        <picker
          mode="date"
          :value="formData.startDate"
          @change="onStartDateChange"
        >
          <view class="date-picker">
            <text class="date-text">{{ formatDate(formData.startDate) }}</text>
            <text class="picker-icon">📅</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 结束日期选择 -->
    <view class="form-item">
      <text class="form-label">结束日期</text>
      <view class="date-picker-container">
        <picker mode="date" :value="formData.endDate" @change="onEndDateChange">
          <view class="date-picker">
            <text class="date-text">{{
              formatDate(formData.endDate) || "选择结束日期"
            }}</text>
            <text class="picker-icon">📅</text>
          </view>
        </picker>
      </view>
      <text class="hint-text">不填写表示仍在经期中</text>
    </view>

    <!-- 经量选择 -->
    <view class="form-item">
      <text class="form-label">经量</text>
      <view class="flow-options">
        <view
          v-for="flow in flowTypes"
          :key="flow.value"
          class="flow-option"
          :class="{ active: formData.flow === flow.value }"
          @click="updateFormData('flow', flow.value)"
        >
          <text class="flow-emoji">{{ flow.emoji }}</text>
          <text class="flow-label">{{ flow.label }}</text>
        </view>
      </view>
    </view>

    <!-- 痛经程度 -->
    <view class="form-item">
      <text class="form-label">痛经程度</text>
      <view class="pain-options">
        <view
          v-for="pain in painLevels"
          :key="pain.value"
          class="pain-option"
          :class="{ active: formData.painLevel === pain.value }"
          @click="updateFormData('painLevel', pain.value)"
        >
          <text class="pain-emoji">{{ pain.emoji }}</text>
          <text class="pain-label">{{ pain.label }}</text>
        </view>
      </view>
    </view>

    <!-- 月经预测信息 -->
    <view class="prediction-section" v-if="predictionInfo">
      <view class="prediction-header">
        <text class="prediction-title">📊 月经预测</text>
      </view>
      <view class="prediction-content">
        <view class="prediction-item">
          <text class="prediction-label">平均周期</text>
          <text class="prediction-value">{{ predictionInfo.avgCycle }}天</text>
        </view>
        <view class="prediction-item">
          <text class="prediction-label">下次预测</text>
          <text class="prediction-value">{{
            formatDate(predictionInfo.nextPeriodDate)
          }}</text>
        </view>
        <view class="prediction-item">
          <text class="prediction-label">距离下次</text>
          <text class="prediction-value">
            <text v-if="predictionInfo.daysUntil > 0"
              >{{ predictionInfo.daysUntil }}天</text
            >
            <text v-else class="expected-today">今天可能来！</text>
          </text>
        </view>
        <view class="prediction-item">
          <text class="prediction-label">预测准确度</text>
          <text class="prediction-value" v-if="predictionInfo.confidenceLevel">
            {{ predictionInfo.confidenceLevel }}%
          </text>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-textarea
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="记录一些特殊情况或感受..."
        maxlength="200"
        count
        class="remark-textarea"
        :auto-height="true"
        :min-height="100"
      />
    </view>

    <!-- 历史记录 -->
    <view class="history-section" v-if="recentRecords.length > 0">
      <view class="history-header">
        <text class="history-title">📚 最近记录</text>
      </view>
      <view
        v-for="record in recentRecords"
        :key="record.recordId"
        class="history-item"
        @click="selectHistoryRecord(record)"
      >
        <view class="history-date">
          <text class="date-main">{{
            formatDate(record.startDate, "MM-DD")
          }}</text>
          <text class="date-range" v-if="record.endDate">
            ~ {{ formatDate(record.endDate, "MM-DD") }}
          </text>
        </view>
        <view class="history-details">
          <text class="flow-info">
            {{ getFlowLabel(record.flow) }} ·
            {{ getPainLabel(record.painLevel) }}
          </text>
          <text class="duration-info">{{ getDurationDays(record) }}天</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { FLOW_TYPES, PAIN_LEVELS } from "@/utils/constants";
import { formatDate } from "@/utils";

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

const flowTypes = computed(() => [
  { value: "less", label: "少量", emoji: "🌸" },
  { value: "mid", label: "中量", emoji: "🌺" },
  { value: "more", label: "大量", emoji: "🌹" },
]);

const painLevels = computed(() => [
  { value: "none", label: "无痛", emoji: "😊" },
  { value: "light", label: "轻微", emoji: "😐" },
  { value: "mid", label: "中度", emoji: "😣" },
  { value: "heavy", label: "重度", emoji: "😭" },
]);

// 计算预测信息
const predictionInfo = computed(() => {
  const menstruationRecords = props.records
    .filter((record) => record.moduleType === "menstruation")
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  if (menstruationRecords.length === 0) return null;

  // 计算个性化周期长度（使用加权平均，近几次周期权重更高）
  const cycles = [];
  const weights = [];
  for (let i = 0; i < menstruationRecords.length - 1; i++) {
    const current = new Date(menstruationRecords[i].startDate);
    const previous = new Date(menstruationRecords[i + 1].startDate);
    const days = Math.ceil((current - previous) / (1000 * 3600 * 24));
    cycles.push(days);
    // 最近几个周期权重更高
    weights.push(Math.exp(-0.2 * i)); // 指数衰减
  }

  // 计算加权平均周期长度
  let personalizedAvgCycle;
  if (cycles.length > 0) {
    const weightedSum = cycles.reduce(
      (sum, cycle, i) => sum + cycle * weights[i],
      0
    );
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    personalizedAvgCycle = Math.round(weightedSum / weightSum);
  } else {
    personalizedAvgCycle = 28; // 默认值
  }

  // 计算预测置信度（根据历史记录的规律性）
  let confidenceLevel = 50; // 基础置信度
  if (cycles.length >= 3) {
    // 计算周期长度的标准差
    const avgCycle = cycles.reduce((sum, c) => sum + c, 0) / cycles.length;
    const variance =
      cycles.reduce((sum, c) => sum + Math.pow(c - avgCycle, 2), 0) /
      cycles.length;
    const stdDev = Math.sqrt(variance);

    // 标准差越小，预测越准确
    if (stdDev <= 1) confidenceLevel = 90;
    else if (stdDev <= 2) confidenceLevel = 80;
    else if (stdDev <= 3) confidenceLevel = 70;
    else if (stdDev <= 5) confidenceLevel = 60;
  }

  // 预测下次月经日期
  const lastRecord = menstruationRecords[0]; // 最新记录
  const lastStartDate = new Date(lastRecord.startDate);

  // 考虑最近一次月经的持续时间，对预测进行调整
  const lastPeriodLength = lastRecord.endDate
    ? Math.ceil(
        (new Date(lastRecord.endDate) - lastStartDate) / (1000 * 3600 * 24)
      ) + 1
    : 5; // 默认值

  // 根据最近一次月经持续时间调整周期长度
  const adjustedCycle = personalizedAvgCycle + (lastPeriodLength - 5) * 0.1;

  const nextPeriodDate = new Date(lastStartDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(adjustedCycle));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );

  return {
    avgCycle: personalizedAvgCycle,
    nextPeriodDate,
    daysUntil,
    confidenceLevel,
    lastStartDate,
  };
});

// 最近记录
const recentRecords = computed(() => {
  return props.records
    .filter((record) => record.moduleType === "menstruation")
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 3);
});

const updateFormData = (key, value) => {
  emit("update:formData", { ...props.formData, [key]: value });
};

const onStartDateChange = (e) => {
  updateFormData("startDate", e.detail.value);
};

const onEndDateChange = (e) => {
  updateFormData("endDate", e.detail.value);
};

const getFlowLabel = (flow) => {
  const flowConfig = flowTypes.value.find((f) => f.value === flow);
  return flowConfig ? flowConfig.label : "未知";
};

const getPainLabel = (pain) => {
  const painConfig = painLevels.value.find((p) => p.value === pain);
  return painConfig ? painConfig.label : "未知";
};

const getDurationDays = (record) => {
  if (!record.endDate) return 1;
  const start = new Date(record.startDate);
  const end = new Date(record.endDate);
  return Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
};

const selectHistoryRecord = (record) => {
  emit("update:formData", {
    ...props.formData,
    startDate: record.startDate,
    endDate: record.endDate,
    flow: record.flow,
    painLevel: record.painLevel,
    remark: record.remark,
  });
};
</script>

<style lang="scss" scoped>
.menstruation-form {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }

    .date-picker-container {
      .date-picker {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        border-radius: 12rpx;
        padding: 20rpx;
        border: 2rpx solid #eee;

        .date-text {
          font-size: 28rpx;
          color: #333;
        }

        .picker-icon {
          font-size: 24rpx;
        }
      }
    }

    .hint-text {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }

    .flow-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12rpx;

      .flow-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx;
        border-radius: 12rpx;
        border: 2rpx solid #eee;
        background: white;
        transition: all 0.3s;

        &.active {
          border-color: #ff2d92;
          background: rgba(255, 45, 146, 0.1);
        }

        .flow-emoji {
          font-size: 32rpx;
          margin-bottom: 8rpx;
        }

        .flow-label {
          font-size: 24rpx;
          color: #333;
          text-align: center;
        }
      }
    }

    .pain-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8rpx;

      .pain-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16rpx;
        border-radius: 12rpx;
        border: 2rpx solid #eee;
        background: white;
        transition: all 0.3s;

        &.active {
          border-color: #ff2d92;
          background: rgba(255, 45, 146, 0.1);
        }

        .pain-emoji {
          font-size: 28rpx;
          margin-bottom: 6rpx;
        }

        .pain-label {
          font-size: 22rpx;
          color: #333;
          text-align: center;
        }
      }
    }

    .remark-textarea {
      background: white;
      border-radius: 12rpx;
      padding: 20rpx;
      border: 2rpx solid #eee;
      font-size: 28rpx;
      line-height: 1.6;
    }
  }

  .prediction-section {
    background: linear-gradient(135deg, #ff2d92 0%, #ff6b9d 100%);
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    color: white;

    .prediction-header {
      margin-bottom: 16rpx;

      .prediction-title {
        font-size: 28rpx;
        font-weight: 600;
      }
    }

    .prediction-content {
      .prediction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .prediction-label {
          font-size: 26rpx;
          opacity: 0.9;
        }

        .prediction-value {
          font-size: 26rpx;
          font-weight: 500;

          .expected-today {
            color: #ffeb3b;
            font-weight: 600;
          }
        }
      }
    }
  }

  .history-section {
    .history-header {
      margin-bottom: 16rpx;

      .history-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .history-item {
      background: white;
      border-radius: 12rpx;
      padding: 16rpx;
      margin-bottom: 12rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;

      &:active {
        background: #f8f8f8;
        border-color: #ff2d92;
      }

      .history-date {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        .date-main {
          font-size: 26rpx;
          font-weight: 500;
          color: #333;
        }

        .date-range {
          font-size: 24rpx;
          color: #666;
          margin-left: 8rpx;
        }
      }

      .history-details {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .flow-info {
          font-size: 24rpx;
          color: #666;
        }

        .duration-info {
          font-size: 24rpx;
          color: #ff2d92;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
