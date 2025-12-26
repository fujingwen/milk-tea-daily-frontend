<template>
  <view class="menstruation-calendar">
    <!-- 日历头部 -->
    <view class="calendar-header">
      <view class="header-left">
        <text class="header-title">🌸 月经日历</text>
        <text class="header-subtitle" v-if="predictionInfo">
          下次预计 {{ formatDate(predictionInfo.nextPeriodDate, "MM-DD") }}
          <text v-if="predictionInfo.daysUntil > 0">
            ({{ predictionInfo.daysUntil }}天后)
          </text>
          <text v-else class="expected-today">今天可能来！</text>
        </text>
      </view>
      <view class="header-right">
        <button class="header-btn" @click="showSettings = true">
          <text class="btn-icon">⚙️</text>
          <text class="btn-text">设置</text>
        </button>
      </view>
    </view>

    <!-- 星期标题 -->
    <view class="weekdays">
      <text class="weekday" v-for="day in weekdays" :key="day">{{ day }}</text>
    </view>

    <!-- 日期网格 -->
    <view class="calendar-grid">
      <view
        v-for="date in calendarDates"
        :key="date.getTime()"
        class="date-cell"
        :class="getDateCellClasses(date)"
        @click="onDateClick(date)"
      >
        <text class="date-number">{{ date.getDate() }}</text>

        <!-- 月经状态指示器 -->
        <view class="menstruation-indicators">
          <!-- 经期开始 -->
          <view
            v-if="isMenstruationStart(date)"
            class="indicator start-indicator"
            title="经期开始"
          >
            <text class="indicator-icon">🌸</text>
          </view>

          <!-- 经期中 -->
          <view
            v-if="isMenstruationDate(date)"
            class="indicator period-indicator"
            :class="getPeriodDayClass(date)"
            title="经期中"
          >
            <text class="indicator-icon">🩸</text>
          </view>

          <!-- 预测经期 -->
          <view
            v-if="isPredictedPeriod(date)"
            class="indicator predicted-indicator"
            title="预测经期"
          >
            <text class="indicator-icon">🌙</text>
          </view>

          <!-- 排卵期 -->
          <view
            v-if="isOvulationDate(date)"
            class="indicator ovulation-indicator"
            title="排卵期"
          >
            <text class="indicator-icon">🥚</text>
          </view>
        </view>

        <!-- 长按菜单 -->
        <view
          v-if="
            showContextMenu && selectedDate && isSameDay(selectedDate, date)
          "
          class="context-menu"
          @click.stop
        >
          <view class="menu-item" @click="markPeriodStart(date)">
            <text class="menu-icon">🌸</text>
            <text class="menu-text">标记开始</text>
          </view>
          <view class="menu-item" @click="markPeriodEnd(date)">
            <text class="menu-icon">✅</text>
            <text class="menu-text">标记结束</text>
          </view>
          <view class="menu-item" @click="addRecord(date)">
            <text class="menu-icon">📝</text>
            <text class="menu-text">详细记录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 选中日期的详细信息 -->
    <view class="selected-date-info" v-if="selectedDateInfo">
      <view class="info-header">
        <text class="info-title"
          >{{ formatDate(selectedDate, "MM月DD日") }} 的信息</text
        >
        <button class="edit-btn" @click="editDateRecord(selectedDate)">
          <text class="btn-icon">✏️</text>
        </button>
      </view>

      <view class="info-content">
        <view class="info-item" v-if="selectedDateInfo.isPeriod">
          <text class="info-label">经期状态</text>
          <text class="info-value period-value">
            {{
              selectedDateInfo.periodDay > 0
                ? `经期第${selectedDateInfo.periodDay}天`
                : "经期开始"
            }}
          </text>
        </view>

        <view class="info-item" v-if="selectedDateInfo.flow">
          <text class="info-label">经量</text>
          <text class="info-value">{{
            getFlowLabel(selectedDateInfo.flow)
          }}</text>
        </view>

        <view class="info-item" v-if="selectedDateInfo.painLevel">
          <text class="info-label">痛经程度</text>
          <text class="info-value">{{
            getPainLabel(selectedDateInfo.painLevel)
          }}</text>
        </view>

        <view class="info-item" v-if="selectedDateInfo.remark">
          <text class="info-label">备注</text>
          <text class="info-value">{{ selectedDateInfo.remark }}</text>
        </view>
      </view>
    </view>

    <!-- 月经统计信息 -->
    <view class="stats-section">
      <view class="stats-title">📊 本月统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-emoji">🌸</text>
          <text class="stat-label">经期天数</text>
          <text class="stat-value">{{ monthStats.periodDays }}天</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">🔄</text>
          <text class="stat-label">平均周期</text>
          <text class="stat-value">{{ monthStats.avgCycle }}天</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">📈</text>
          <text class="stat-label">最长周期</text>
          <text class="stat-value">{{ monthStats.maxCycle }}天</text>
        </view>
        <view class="stat-item">
          <text class="stat-emoji">📉</text>
          <text class="stat-label">最短周期</text>
          <text class="stat-value">{{ monthStats.minCycle }}天</text>
        </view>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <u-popup v-model="showSettings" mode="bottom" height="600rpx">
      <view class="settings-content">
        <view class="settings-header">
          <text class="settings-title">⚙️ 月经设置</text>
        </view>

        <view class="settings-section">
          <view class="setting-item">
            <text class="setting-label">默认经期长度</text>
            <view class="setting-control">
              <picker
                mode="selector"
                :range="periodLengths"
                :value="settings.defaultPeriodLength - 3"
                @change="onDefaultPeriodLengthChange"
              >
                <view class="picker">
                  <text class="picker-text"
                    >{{ settings.defaultPeriodLength }}天</text
                  >
                  <text class="picker-icon">📅</text>
                </view>
              </picker>
            </view>
          </view>

          <view class="setting-item">
            <text class="setting-label">平均周期长度</text>
            <view class="setting-control">
              <picker
                mode="selector"
                :range="cycleLengths"
                :value="settings.avgCycleLength - 20"
                @change="onAvgCycleLengthChange"
              >
                <view class="picker">
                  <text class="picker-text"
                    >{{ settings.avgCycleLength }}天</text
                  >
                  <text class="picker-icon">📅</text>
                </view>
              </picker>
            </view>
          </view>

          <view class="setting-item">
            <text class="setting-label">显示预测</text>
            <switch
              :checked="settings.showPredictions"
              @change="onShowPredictionsChange"
              color="#ff2d92"
            />
          </view>

          <view class="setting-item">
            <text class="setting-label">显示排卵期</text>
            <switch
              :checked="settings.showOvulation"
              @change="onShowOvulationChange"
              color="#ff2d92"
            />
          </view>

          <view class="setting-item">
            <text class="setting-label">月经来了提醒</text>
            <switch
              :checked="settings.showPeriodStartReminder"
              @change="onShowPeriodStartReminderChange"
              color="#ff2d92"
            />
          </view>

          <view class="setting-item">
            <text class="setting-label">月经走了提醒</text>
            <switch
              :checked="settings.showPeriodEndReminder"
              @change="onShowPeriodEndReminderChange"
              color="#ff2d92"
            />
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { formatDate, isSameDay } from "@/utils";

const props = defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  records: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "date-click",
  "add-record",
  "edit-record",
  "mark-period-start",
  "mark-period-end",
]);

// 响应式数据
const selectedDate = ref(null);
const showContextMenu = ref(false);
const showSettings = ref(false);

// 设置数据
const settings = ref({
  defaultPeriodLength: 5,
  avgCycleLength: 28,
  showPredictions: true,
  showOvulation: true,
  showPeriodStartReminder: true,
  showPeriodEndReminder: true,
});

// 星期标题
const weekdays = computed(() => ["一", "二", "三", "四", "五", "六", "日"]);

// 生成日历日期
const calendarDates = computed(() => {
  const year = props.currentDate.getFullYear();
  const month = props.currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 计算这个月第一天是星期几（0=周日，1=周一，...，6=周六）
  // 转换为以周一为0的索引（0=周一，1=周二，...，6=周日）
  let firstDayOfWeek = firstDay.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 6; // 周日转为6
  else firstDayOfWeek = firstDayOfWeek - 1; // 周一转为0

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const dates = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  return dates;
});

// 获取月经记录
const menstruationRecords = computed(() => {
  return props.records
    .filter((record) => record.moduleType === "menstruation")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
});

// 预测信息
const predictionInfo = computed(() => {
  if (
    menstruationRecords.value.length === 0 ||
    !settings.value.showPredictions
  ) {
    return null;
  }

  // 计算个性化周期长度（使用加权平均，近几次周期权重更高）
  const cycles = [];
  const weights = [];
  for (let i = 0; i < menstruationRecords.value.length - 1; i++) {
    const current = new Date(menstruationRecords.value[i].startDate);
    const previous = new Date(menstruationRecords.value[i + 1].startDate);
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
    personalizedAvgCycle = settings.value.avgCycleLength;
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
  const lastRecord = menstruationRecords.value[0]; // 最新记录
  const lastStartDate = new Date(lastRecord.startDate);

  // 考虑最近一次月经的持续时间，对预测进行调整
  const lastPeriodLength = lastRecord.endDate
    ? Math.ceil(
        (new Date(lastRecord.endDate) - lastStartDate) / (1000 * 3600 * 24)
      ) + 1
    : settings.value.defaultPeriodLength;

  // 根据最近一次月经持续时间调整周期长度
  const adjustedCycle =
    personalizedAvgCycle +
    (lastPeriodLength - settings.value.defaultPeriodLength) * 0.1;

  const nextPeriodDate = new Date(lastStartDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(adjustedCycle));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );

  // 计算预测区间（基于历史周期变化范围）
  const minCycle =
    cycles.length > 0 ? Math.min(...cycles) : personalizedAvgCycle - 3;
  const maxCycle =
    cycles.length > 0 ? Math.max(...cycles) : personalizedAvgCycle + 3;

  const nextPeriodStart = new Date(nextPeriodDate);
  const nextPeriodEnd = new Date(nextPeriodDate);
  nextPeriodEnd.setDate(
    nextPeriodEnd.getDate() + settings.value.defaultPeriodLength - 1
  );

  const earliestDate = new Date(lastStartDate);
  earliestDate.setDate(earliestDate.getDate() + minCycle);

  const latestDate = new Date(lastStartDate);
  latestDate.setDate(latestDate.getDate() + maxCycle);

  return {
    nextPeriodDate,
    daysUntil,
    avgCycle: personalizedAvgCycle,
    confidenceLevel,
    nextPeriodStart,
    nextPeriodEnd,
    earliestDate,
    latestDate,
  };
});

// 选中日期信息
const selectedDateInfo = computed(() => {
  if (!selectedDate.value) return null;

  // 查找该日期的月经记录
  const dateRecords = menstruationRecords.value.filter((record) => {
    const startDate = new Date(record.startDate);
    const endDate = record.endDate ? new Date(record.endDate) : startDate;

    return selectedDate.value >= startDate && selectedDate.value <= endDate;
  });

  if (dateRecords.length === 0) return null;

  const record = dateRecords[0];
  const startDate = new Date(record.startDate);
  const periodDay =
    Math.ceil((selectedDate.value - startDate) / (1000 * 3600 * 24)) + 1;

  return {
    ...record,
    isPeriod: true,
    periodDay,
  };
});

// 月经统计
const monthStats = computed(() => {
  const currentYear = props.currentDate.getFullYear();
  const currentMonth = props.currentDate.getMonth();

  const monthRecords = menstruationRecords.value.filter((record) => {
    const recordDate = new Date(record.startDate);
    return (
      recordDate.getFullYear() === currentYear &&
      recordDate.getMonth() === currentMonth
    );
  });

  // 计算经期天数
  let periodDays = 0;
  monthRecords.forEach((record) => {
    const startDate = new Date(record.startDate);
    const endDate = record.endDate ? new Date(record.endDate) : startDate;
    const days = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;
    periodDays += days;
  });

  // 计算周期统计
  const cycles = [];
  for (let i = 0; i < menstruationRecords.value.length - 1; i++) {
    const current = new Date(menstruationRecords.value[i].startDate);
    const previous = new Date(menstruationRecords.value[i + 1].startDate);
    const days = Math.ceil((current - previous) / (1000 * 3600 * 24));
    cycles.push(days);
  }

  const avgCycle =
    cycles.length > 0
      ? Math.round(
          cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length
        )
      : settings.value.avgCycleLength;

  const maxCycle = cycles.length > 0 ? Math.max(...cycles) : avgCycle;
  const minCycle = cycles.length > 0 ? Math.min(...cycles) : avgCycle;

  return {
    periodDays,
    avgCycle,
    maxCycle,
    minCycle,
  };
});

// 获取日期单元格的样式类
const getDateCellClasses = (date) => {
  const classes = ["date-cell"];

  // 当前月
  if (date.getMonth() !== props.currentDate.getMonth()) {
    classes.push("other-month");
  }

  // 今天
  if (isSameDay(date, new Date())) {
    classes.push("today");
  }

  // 选中日期
  if (selectedDate.value && isSameDay(date, selectedDate.value)) {
    classes.push("selected");
  }

  // 月经日历页面不需要标注周六周日放假上班

  // 经期相关
  if (isMenstruationDate(date)) {
    classes.push("menstruation-date");
    classes.push(getPeriodDayClass(date));
  }

  // 预测经期
  if (isPredictedPeriod(date)) {
    classes.push("predicted-period");
  }

  // 排卵期
  if (isOvulationDate(date)) {
    classes.push("ovulation-date");
  }

  return classes.join(" ");
};

// 检查是否是经期开始
const isMenstruationStart = (date) => {
  return menstruationRecords.value.some((record) =>
    isSameDay(new Date(record.startDate), date)
  );
};

// 检查是否是经期中
const isMenstruationDate = (date) => {
  return menstruationRecords.value.some((record) => {
    const startDate = new Date(record.startDate);
    const endDate = record.endDate ? new Date(record.endDate) : startDate;
    return date >= startDate && date <= endDate;
  });
};

// 检查是否是预测经期
const isPredictedPeriod = (date) => {
  if (!predictionInfo.value || !settings.value.showPredictions) return false;

  // 使用更准确的预测区间
  const nextPeriodDate = new Date(predictionInfo.value.nextPeriodDate);
  const periodStart = new Date(nextPeriodDate);
  const periodEnd = new Date(nextPeriodDate);
  periodEnd.setDate(
    periodEnd.getDate() + settings.value.defaultPeriodLength - 1
  );

  // 如果有置信度数据，使用更准确的预测区间
  if (
    predictionInfo.value.nextPeriodStart &&
    predictionInfo.value.nextPeriodEnd
  ) {
    return (
      date >= predictionInfo.value.nextPeriodStart &&
      date <= predictionInfo.value.nextPeriodEnd
    );
  }

  return date >= periodStart && date <= periodEnd;
};

// 检查是否是排卵期
const isOvulationDate = (date) => {
  if (!settings.value.showOvulation || !predictionInfo.value) return false;

  const nextPeriodDate = new Date(predictionInfo.value.nextPeriodDate);
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14); // 排卵期通常是下次月经前14天

  const today = new Date();
  const daysDiff = Math.abs(date - ovulationDate) / (1000 * 3600 * 24);

  return daysDiff <= 1; // 排卵期前后1天
};

// 获取经期天数样式类
const getPeriodDayClass = (date) => {
  const periodDay = getPeriodDayNumber(date);
  if (periodDay <= 2) return "early-period";
  if (periodDay <= 4) return "mid-period";
  return "late-period";
};

// 获取经期第几天
const getPeriodDayNumber = (date) => {
  const record = menstruationRecords.value.find((r) => {
    const startDate = new Date(r.startDate);
    const endDate = r.endDate ? new Date(r.endDate) : startDate;
    return date >= startDate && date <= endDate;
  });

  if (!record) return 0;

  const startDate = new Date(record.startDate);
  return Math.ceil((date - startDate) / (1000 * 3600 * 24)) + 1;
};

// 事件处理
const onDateClick = (date) => {
  selectedDate.value = date;
  emit("date-click", date);
};

const markPeriodStart = (date) => {
  emit("mark-period-start", date);
  showContextMenu.value = false;
};

const markPeriodEnd = (date) => {
  emit("mark-period-end", date);
  showContextMenu.value = false;
};

const addRecord = (date) => {
  emit("add-record", date);
  showContextMenu.value = false;
};

const editDateRecord = (date) => {
  emit("edit-record", date);
};

// 设置相关方法
const onDefaultPeriodLengthChange = (e) => {
  settings.value.defaultPeriodLength = parseInt(periodLengths[e.detail.value]);
};

const onAvgCycleLengthChange = (e) => {
  settings.value.avgCycleLength = parseInt(cycleLengths[e.detail.value]);
};

const onShowPredictionsChange = (e) => {
  settings.value.showPredictions = e.detail.value;
};

const onShowOvulationChange = (e) => {
  settings.value.showOvulation = e.detail.value;
};

const onShowPeriodStartReminderChange = (e) => {
  settings.value.showPeriodStartReminder = e.detail.value;
};

const onShowPeriodEndReminderChange = (e) => {
  settings.value.showPeriodEndReminder = e.detail.value;
};

// 检查是否是周末
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 周日或周六
};

// 检查是否是节假日（简单的节假日判断，可以后续扩展）
const isHoliday = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 简单节假日判断（可以扩展更多节假日）
  const holidays = [
    // 新年
    { month: 1, day: 1 },
    // 春节（简单判断，不考虑农历）
    { month: 2, day: 10 },
    { month: 2, day: 11 },
    { month: 2, day: 12 },
    // 清明节
    { month: 4, day: 4 },
    { month: 4, day: 5 },
    { month: 4, day: 6 },
    // 劳动节
    { month: 5, day: 1 },
    // 端午节
    { month: 6, day: 10 },
    // 中秋节
    { month: 9, day: 15 },
    { month: 9, day: 16 },
    { month: 9, day: 17 },
    // 国庆节
    { month: 10, day: 1 },
    { month: 10, day: 2 },
    { month: 10, day: 3 },
    { month: 10, day: 4 },
    { month: 10, day: 5 },
    { month: 10, day: 6 },
    { month: 10, day: 7 },
  ];

  return holidays.some(
    (holiday) => holiday.month === month && holiday.day === day
  );
};

// 检查是否是周末工作日（这里简单返回false，可以根据实际需求扩展）
const isWeekendWorkday = (date) => {
  // 这里可以根据实际的周末工作日安排来返回true或false
  // 暂时返回false，后续可以根据用户设置或公司政策来判断
  return false;
};

// 工具方法
const getFlowLabel = (flow) => {
  const flowMap = {
    less: "少量 🌸",
    mid: "中量 🌺",
    more: "大量 🌹",
  };
  return flowMap[flow] || "未知";
};

const getPainLabel = (pain) => {
  const painMap = {
    none: "无痛 😊",
    light: "轻微 😐",
    mid: "中度 😣",
    heavy: "重度 😭",
  };
  return painMap[pain] || "未知";
};

// 设置选项
const periodLengths = ["3", "4", "5", "6", "7", "8", "9"];
const cycleLengths = Array.from({ length: 15 }, (_, i) => (20 + i).toString());
</script>

<style lang="scss" scoped>
.menstruation-calendar {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: linear-gradient(135deg, #ff2d92 0%, #ff6b9d 100%);
    color: white;

    .header-left {
      .header-title {
        font-size: 32rpx;
        font-weight: 600;
        display: block;
        margin-bottom: 8rpx;
      }

      .header-subtitle {
        font-size: 24rpx;
        opacity: 0.9;

        .expected-today {
          color: #ffeb3b;
          font-weight: 600;
        }
      }
    }

    .header-right {
      .header-btn {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20rpx;
        padding: 12rpx 20rpx;
        border: none;
        color: white;

        .btn-icon {
          margin-right: 8rpx;
        }

        .btn-text {
          font-size: 24rpx;
        }
      }
    }
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 20rpx 20rpx 0;
    background: white;

    .weekday {
      text-align: center;
      font-size: 24rpx;
      color: #666;
      font-weight: 500;
    }
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2rpx;
    padding: 20rpx;
    background: white;
    padding-top: 0;

    .date-cell {
      position: relative;
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8f8f8;
      border-radius: 8rpx;
      transition: all 0.3s;
      cursor: pointer;

      &.other-month {
        opacity: 0.3;
      }

      &.today {
        background: rgba(255, 45, 146, 0.1);
        border: 2rpx solid #ff2d92;
      }

      &.selected {
        background: #ff2d92;
        color: white;
      }

      // 周末样式
      &.weekend {
        .date-number {
          color: #d63384;
          font-weight: 600;
        }

        // 周六特殊颜色
        &.saturday {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);

          .date-number {
            color: #1976d2;
          }
        }

        // 周日特殊颜色
        &.sunday {
          background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);

          .date-number {
            color: #c2185b;
          }
        }
      }

      // 节假日样式
      &.holiday {
        background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);

        .date-number {
          color: #e65100;
          font-weight: 700;
        }

        &::before {
          content: "🎉";
          position: absolute;
          top: 4rpx;
          right: 4rpx;
          font-size: 16rpx;
        }
      }

      // 周末工作日样式
      &.weekend-workday {
        background: linear-gradient(135deg, #e8f5e8 0%, #4caf50 100%);

        .date-number {
          color: #2e7d32;
          font-weight: 600;
        }

        &::after {
          content: "💼";
          position: absolute;
          bottom: 4rpx;
          left: 4rpx;
          font-size: 16rpx;
        }
      }

      &.menstruation-date {
        background: linear-gradient(135deg, #ff6b9d 0%, #ff2d92 100%);
        color: white;

        &.early-period {
          background: linear-gradient(135deg, #ff8a95 0%, #ff6b9d 100%);
        }

        &.mid-period {
          background: linear-gradient(135deg, #ff6b9d 0%, #ff2d92 100%);
        }

        &.late-period {
          background: linear-gradient(135deg, #ff2d92 0%, #d63384 100%);
        }
      }

      &.predicted-period {
        background: rgba(255, 45, 146, 0.1);
        border: 2rpx dashed rgba(255, 45, 146, 0.5);
      }

      &.ovulation-date {
        background: rgba(255, 193, 7, 0.1);
        border: 2rpx solid #ffc107;
      }

      .date-number {
        font-size: 28rpx;
        font-weight: 500;
        z-index: 1;
      }

      .menstruation-indicators {
        position: absolute;
        bottom: 4rpx;
        display: flex;
        gap: 2rpx;

        .indicator {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          .indicator-icon {
            font-size: 8rpx;
          }

          &.start-indicator {
            background: #ff2d92;
          }

          &.period-indicator {
            background: #ff1744;
          }

          &.predicted-indicator {
            background: rgba(255, 45, 146, 0.6);
            border: 1rpx solid #ff2d92;
          }

          &.ovulation-indicator {
            background: #ffc107;
          }
        }
      }

      .context-menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 8rpx;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
        z-index: 10;
        margin-top: 8rpx;
        overflow: hidden;

        .menu-item {
          display: flex;
          align-items: center;
          padding: 16rpx 20rpx;
          border-bottom: 1rpx solid #eee;
          transition: background 0.3s;

          &:last-child {
            border-bottom: none;
          }

          &:active {
            background: #f8f8f8;
          }

          .menu-icon {
            margin-right: 12rpx;
            font-size: 24rpx;
          }

          .menu-text {
            font-size: 24rpx;
            color: #333;
          }
        }
      }
    }
  }

  .selected-date-info {
    background: white;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .info-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }

      .edit-btn {
        background: #ff2d92;
        color: white;
        border: none;
        border-radius: 20rpx;
        padding: 8rpx 16rpx;
        font-size: 20rpx;
      }
    }

    .info-content {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: 26rpx;
          color: #666;
        }

        .info-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;

          &.period-value {
            color: #ff2d92;
            font-weight: 600;
          }
        }
      }
    }
  }

  .stats-section {
    background: white;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .stats-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16rpx;

      .stat-item {
        text-align: center;
        padding: 16rpx;
        background: #f8f8f8;
        border-radius: 12rpx;

        .stat-emoji {
          font-size: 32rpx;
          display: block;
          margin-bottom: 8rpx;
        }

        .stat-label {
          font-size: 24rpx;
          color: #666;
          display: block;
          margin-bottom: 4rpx;
        }

        .stat-value {
          font-size: 26rpx;
          color: #ff2d92;
          font-weight: 600;
        }
      }
    }
  }

  .settings-content {
    padding: 20rpx;

    .settings-header {
      margin-bottom: 20rpx;

      .settings-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .settings-section {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .setting-label {
          font-size: 28rpx;
          color: #333;
        }

        .setting-control {
          .picker {
            display: flex;
            align-items: center;
            background: #f8f8f8;
            border-radius: 8rpx;
            padding: 12rpx 20rpx;

            .picker-text {
              font-size: 26rpx;
              color: #333;
              margin-right: 8rpx;
            }

            .picker-icon {
              font-size: 24rpx;
            }
          }
        }
      }
    }
  }
}
</style>
