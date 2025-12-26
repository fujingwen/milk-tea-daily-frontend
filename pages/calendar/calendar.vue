<template>
  <view class="calendar-page">
    <!-- 日历头部 -->
    <CalendarHeader
      :current-date="currentDate"
      :view-mode="viewMode"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @go-to-today="goToToday"
      @scroll-to-today="scrollToToday"
      @switch-to-menstruation="switchToMenstruation"
      @switch-to-calendar="switchToCalendar"
      @switch-to-timeline="switchToTimeline"
    />

    <!-- 日历视图 -->
    <CalendarView
      v-if="viewMode === 'calendar'"
      :current-date="currentDate"
      :selected-date="selectedDate"
      :records="recordStore.records"
      @date-select="selectDate"
      @record-detail="goToRecordDetail"
      @add-record="addRecord"
    />

    <!-- 月经视图 -->
    <MenstruationView
      v-if="viewMode === 'menstruation'"
      :current-date="currentDate"
      :records="recordStore.records"
      @date-click="onMenstruationDateClick"
      @add-record="addMenstruationRecord"
      @edit-record="editMenstruationRecord"
      @mark-period-start="markPeriodStart"
      @mark-period-end="markPeriodEnd"
    />

    <!-- 时间轴视图 -->
    <TimelineView
      v-if="viewMode === 'timeline'"
      :records="recordStore.records"
      @record-detail="goToRecordDetail"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import { formatDate } from "@/utils";

// 导入组件
import CalendarHeader from "./components/CalendarHeader.vue";
import CalendarView from "./components/CalendarView.vue";
import MenstruationView from "./components/MenstruationView.vue";
import TimelineView from "./components/TimelineView.vue";

const recordStore = useRecordStore();

// 响应式数据
const currentDate = ref(new Date());
const selectedDate = ref(null);
const viewMode = ref("calendar");

// 方法
const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const goToToday = () => {
  currentDate.value = new Date();
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const switchToCalendar = () => {
  viewMode.value = "calendar";
};

const switchToTimeline = () => {
  viewMode.value = "timeline";
};

const switchToMenstruation = () => {
  viewMode.value = "menstruation";
};

const scrollToToday = () => {
  // 时间轴滚动到今天的逻辑
};

const goToRecordDetail = (record) => {
  if (record.moduleType === "birthday") {
    uni.navigateTo({
      url: `/pages/birthday/detail?id=${record.recordId}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/record/detail?id=${record.recordId}`,
    });
  }
};

const addRecord = () => {
  uni.navigateTo({
    url: "/pages/record/add",
  });
};

// 月经相关方法
const onMenstruationDateClick = (date) => {
  selectedDate.value = date;
};

const addMenstruationRecord = (date) => {
  uni.navigateTo({
    url: `/pages/record/add?module=menstruation&date=${formatDate(date, 'YYYY-MM-DD')}`,
  });
};

const editMenstruationRecord = (date) => {
  // 查找该日期的月经记录
  const dateStr = date.toDateString();
  const menstruationRecord = recordStore.records.find(record => {
    const recordDate = new Date(record.startDate || record.createTime).toDateString();
    return record.moduleType === 'menstruation' && recordDate === dateStr;
  });

  if (menstruationRecord) {
    uni.navigateTo({
      url: `/pages/record/detail?id=${menstruationRecord.recordId}`,
    });
  } else {
    addMenstruationRecord(date);
  }
};

const markPeriodStart = (date) => {
  // 验证日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    uni.showToast({
      title: '不能设置今天之后的日期',
      icon: 'none'
    });
    return;
  }

  // 检查10天内是否有记录
  const menstruationRecords = recordStore.records
    .filter(record => record.moduleType === 'menstruation')
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const recentRecords = menstruationRecords.filter(record => {
    const recordDate = new Date(record.startDate);
    const daysDiff = Math.abs((date - recordDate) / (1000 * 3600 * 24));
    return daysDiff <= 10;
  });

  if (recentRecords.length > 0) {
    const targetDateStr = formatDate(date, 'YYYY-MM-DD');
    uni.showModal({
      title: '提示',
      content: `在${targetDateStr}的10天内已有月经记录，是否要修改？`,
      success: (res) => {
        if (res.confirm) {
          createPeriodStartRecord(date);
        }
      }
    });
  } else {
    createPeriodStartRecord(date);
  }
};

const markPeriodEnd = (date) => {
  // 验证日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    uni.showToast({
      title: '不能设置今天之后的日期',
      icon: 'none'
    });
    return;
  }

  // 检查是否有未结束的月经记录
  const menstruationRecords = recordStore.records
    .filter(record => record.moduleType === 'menstruation')
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const ongoingPeriod = menstruationRecords.find(record =>
    !record.endDate || record.endDate === null
  );

  if (!ongoingPeriod) {
    uni.showToast({
      title: '没有进行中的月经记录',
      icon: 'none'
    });
    return;
  }

  createPeriodEndRecord(date, ongoingPeriod);
};

const createPeriodStartRecord = (date) => {
  const targetDateStr = formatDate(date, 'YYYY-MM-DD');

  const periodRecord = {
    recordId: Date.now().toString(),
    moduleType: 'menstruation',
    startDate: targetDateStr,
    endDate: null,
    periodType: 'start',
    amount: 'normal',
    symptoms: [],
    mood: 'normal',
    description: '',
    createTime: date.getTime(),
    updateTime: date.getTime()
  };

  recordStore.addRecord(periodRecord);
  uni.showToast({
    title: '已记录月经开始',
    icon: 'success'
  });
};

const createPeriodEndRecord = (date, ongoingPeriod) => {
  const targetDateStr = formatDate(date, 'YYYY-MM-DD');

  // 更新现有记录
  const updatedRecord = {
    ...ongoingPeriod,
    endDate: targetDateStr,
    periodType: 'end',
    updateTime: date.getTime()
  };

  recordStore.updateRecord(ongoingPeriod.recordId, updatedRecord);
  uni.showToast({
    title: '已记录月经结束',
    icon: 'success'
  });
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 20rpx;
}
</style>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 20rpx;
}
</style>
