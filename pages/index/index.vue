<template>
  <view class="index-page">
    <!-- 顶部搜索 -->
    <!-- <SearchHeader /> -->

    <!-- 今日提醒模块 -->
    <TodayReminders
      :weather-info="weatherInfo"
      :menstruation-reminder="menstruationReminder"
      :pending-todos="pendingTodos"
      :upcoming-birthdays="upcomingBirthdays"
      :upcoming-holidays="upcomingHolidays"
      @todo-complete="handleTodoComplete"
    />

    <!-- 模块快捷入口 - 分组显示 -->
    <ModuleGroups
      :records="recordStore.records"
      :module-visibility-store="moduleVisibilityStore"
      @module-hide="handleModuleHide"
      @module-show="handleModuleShow"
      @show-all-modules="handleShowAllModules"
    />

    <!-- 最近记录 -->
    <RecentRecords :records="recordStore.records" />

    <!-- 待办事项完成确认弹窗 -->
    <TodoCompleteModal
      :visible="showCompleteModal"
      :todo="currentTodo"
      @close="closeCompleteModal"
      @confirm="confirmComplete"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecordStore, useAppStore, useModuleVisibilityStore } from "@/stores";
import birthdayService from "@/utils/birthdayService.js";
import reminderService from "@/utils/reminderService.js";
import { vibrate } from "@/utils/hapticFeedback.js";

// 导入组件
import SearchHeader from "./components/SearchHeader.vue";
import TodayReminders from "./components/TodayReminders.vue";
import ModuleGroups from "./components/ModuleGroups.vue";
import RecentRecords from "./components/RecentRecords.vue";
import TodoCompleteModal from "./components/TodoCompleteModal.vue";

const recordStore = useRecordStore();
const appStore = useAppStore();
const moduleVisibilityStore = useModuleVisibilityStore();

// 响应式数据
const weatherInfo = ref(null);
const upcomingHolidays = ref([]);
const upcomingBirthdays = ref([]);
const pendingTodos = ref([]);
const menstruationReminder = ref(null);

// 待办事项完成相关数据
const showCompleteModal = ref(false);
const currentTodo = ref(null);

// 加载提醒数据
const loadReminders = async () => {
  try {
    // 获取天气信息
    weatherInfo.value = await reminderService.getWeatherInfo();

    // 获取节日提醒
    upcomingHolidays.value = reminderService.getUpcomingHolidays();

    // 获取生日提醒
    const birthdayRecords = birthdayService.getBirthdayRecords();
    upcomingBirthdays.value = reminderService.getUpcomingBirthdays(birthdayRecords);

    // 获取待办事项
    pendingTodos.value = reminderService.getPendingTodos(recordStore.records);

    // 获取姨妈期提醒
    menstruationReminder.value = reminderService.getMenstruationReminder(recordStore.records);
  } catch (error) {
    console.error("加载提醒数据失败:", error);
  }
};

// 待办事项完成相关方法
const handleTodoComplete = (todo) => {
  vibrate.light();
  currentTodo.value = todo;
  showCompleteModal.value = true;
};

const closeCompleteModal = () => {
  showCompleteModal.value = false;
  currentTodo.value = null;
};

const confirmComplete = async (remark) => {
  try {
    if (!currentTodo.value) return;

    vibrate.medium();

    // 更新待办事项状态
    const success = recordStore.updateRecord(currentTodo.value.recordId, {
      isCompleted: true,
      completeRemark: remark,
      completeTime: Date.now()
    });

    if (success) {
      uni.showToast({
        title: '已完成',
        icon: 'success'
      });

      // 重新加载提醒数据
      await loadReminders();
      closeCompleteModal();
    } else {
      throw new Error('更新失败');
    }
  } catch (error) {
    console.error('完成待办事项失败:', error);
    vibrate.error();
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 模块隐藏相关方法
const handleModuleHide = async (groupKey) => {
  try {
    await moduleVisibilityStore.hideModule(groupKey);
    console.log(`模块组 ${groupKey} 已隐藏`);
  } catch (error) {
    console.error('隐藏模块组失败:', error);
    uni.showToast({
      title: '隐藏失败，请重试',
      icon: 'none'
    });
  }
};

const handleModuleShow = async (groupKey) => {
  try {
    await moduleVisibilityStore.showModule(groupKey);
    console.log(`模块组 ${groupKey} 已显示`);
  } catch (error) {
    console.error('显示模块组失败:', error);
    uni.showToast({
      title: '显示失败，请重试',
      icon: 'none'
    });
  }
};

const handleShowAllModules = async () => {
  try {
    await moduleVisibilityStore.showAllModules();
    console.log('所有模块组已显示');
    uni.showToast({
      title: '所有模块已恢复显示',
      icon: 'success'
    });
  } catch (error) {
    console.error('显示所有模块失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 生命周期
onMounted(async () => {
  recordStore.loadFromStorage();
  appStore.loadUserData();

  // 初始化模块可见性状态
  await moduleVisibilityStore.loadFromStorage();

  await loadReminders();
});
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
