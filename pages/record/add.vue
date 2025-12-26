<template>
  <view class="add-record-page">
    <view class="form-container">
      <!-- 模块选择（仅在未指定类型时显示） -->
      <view class="form-section card" v-if="!isDirectMode">
        <view class="section-title">快速记录</view>

        <!-- 快速笔记入口 -->
        <view class="quick-note-section">
          <view class="quick-note-card" @click="selectModule('essay')">
            <view class="note-icon">📝</view>
            <view class="note-content">
              <text class="note-title">写笔记</text>
              <text class="note-desc">记录今天的想法和感受</text>
            </view>
            <view class="note-arrow">→</view>
          </view>
        </view>

        <!-- 其他常用记录 -->
        <view class="section-subtitle">其他记录类型</view>
        <view class="module-selector">
          <view
            class="module-option"
            :class="{ active: currentModule === type }"
            v-for="(config, type) in moduleConfig"
            :key="type"
            @click="selectModule(type)"
          >
            <text class="option-emoji">{{ config.icon }}</text>
            <text class="option-name">{{ config.name }}</text>
          </view>
        </view>
      </view>

      <!-- 动态表单 -->
      <view class="form-section card" v-if="currentModule">
        <view class="section-title">{{
          getModuleConfig(currentModule).name
        }}</view>

        <!-- 心情记录表单 -->
        <template v-if="currentModule === 'mood'">
          <view class="form-item">
            <text class="form-label">心情类型</text>
            <view class="mood-options">
              <view
                class="mood-option"
                :class="{ active: formData.moodType === mood.value }"
                v-for="mood in moodTypes"
                :key="mood.value"
                @click="formData.moodType = mood.value"
              >
                <text class="mood-emoji">{{ mood.emoji }}</text>
                <text class="mood-label">{{ mood.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">心情描述</text>
            <u-textarea
              v-model="formData.description"
              placeholder="描述一下你的心情..."
              maxlength="200"
              count
            />
          </view>
        </template>

        <!-- 体重记录表单 -->
        <template v-if="currentModule === 'weight'">
          <view class="form-item">
            <text class="form-label">体重 (kg)</text>
            <u-input
              v-model="formData.weightValue"
              type="digit"
              placeholder="请输入体重"
            />
          </view>
          <view class="form-item">
            <text class="form-label">测量时间</text>
            <u-datetime-picker v-model="formData.measureTime" mode="datetime" />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <u-input
              v-model="formData.remark"
              placeholder="空腹/饭后/运动后等"
            />
          </view>
        </template>

        <!-- 奶茶记录表单 -->
        <template v-if="currentModule === 'milkTea'">
          <view class="form-item">
            <text class="form-label">奶茶名称</text>
            <u-input v-model="formData.name" placeholder="请输入奶茶名称" />
          </view>
          <view class="form-item">
            <text class="form-label">购买店铺</text>
            <u-input v-model="formData.shop" placeholder="请输入店铺名称" />
          </view>
          <view class="form-item">
            <text class="form-label">甜度</text>
            <u-radio-group v-model="formData.sugar">
              <u-radio
                v-for="sugar in sugarTypes"
                :key="sugar.value"
                :name="sugar.value"
                :label="sugar.label"
              />
            </u-radio-group>
          </view>
          <view class="form-item">
            <text class="form-label">冰度</text>
            <u-radio-group v-model="formData.ice">
              <u-radio
                v-for="ice in iceTypes"
                :key="ice.value"
                :name="ice.value"
                :label="ice.label"
              />
            </u-radio-group>
          </view>
          <view class="form-item">
            <text class="form-label">价格 (元)</text>
            <u-input
              v-model="formData.price"
              type="digit"
              placeholder="请输入价格"
            />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <u-textarea
              v-model="formData.remark"
              placeholder="口感、推荐度等"
            />
          </view>
        </template>

        <!-- 记账表单 -->
        <template v-if="currentModule === 'account'">
          <view class="form-item">
            <text class="form-label">收支类型</text>
            <u-radio-group v-model="formData.type">
              <u-radio
                v-for="type in accountTypes"
                :key="type.value"
                :name="type.value"
                :label="type.label"
              />
            </u-radio-group>
          </view>
          <view class="form-item">
            <text class="form-label">金额 (元)</text>
            <u-input
              v-model="formData.amount"
              type="digit"
              placeholder="请输入金额"
            />
          </view>
          <view class="form-item">
            <text class="form-label">分类</text>
            <u-picker
              v-model="formData.category"
              :range="currentCategories"
              placeholder="请选择分类"
            />
          </view>
          <view class="form-item">
            <text class="form-label">支付方式</text>
            <u-radio-group v-model="formData.payType">
              <u-radio
                v-for="pay in payTypes"
                :key="pay.value"
                :name="pay.value"
                :label="pay.label"
              />
            </u-radio-group>
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <u-input v-model="formData.remark" placeholder="备注信息" />
          </view>
        </template>

        <!-- 待办事项表单 -->
        <template v-if="currentModule === 'todo'">
          <view class="form-item">
            <text class="form-label">待办内容</text>
            <u-textarea
              v-model="formData.content"
              placeholder="请输入待办事项..."
              maxlength="100"
              count
            />
          </view>
          <view class="form-item">
            <text class="form-label">优先级</text>
            <u-radio-group v-model="formData.priority">
              <u-radio
                v-for="priority in priorityTypes"
                :key="priority.value"
                :name="priority.value"
                :label="priority.label"
              />
            </u-radio-group>
          </view>
          <view class="form-item">
            <text class="form-label">截止时间</text>
            <u-datetime-picker
              v-model="formData.deadline"
              mode="datetime"
              placeholder="可选"
            />
          </view>
        </template>

        <!-- 食物记录表单 -->
        <template v-if="currentModule === 'food'">
          <view class="form-item">
            <text class="form-label">餐次类型</text>
            <view class="meal-options">
              <view
                class="meal-option"
                :class="{ active: formData.mealType === meal.value }"
                v-for="meal in mealTypes"
                :key="meal.value"
                @click="formData.mealType = meal.value"
              >
                <text class="meal-emoji">{{ meal.emoji }}</text>
                <text class="meal-label">{{ meal.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">食物名称</text>
            <u-input v-model="formData.foodName" placeholder="请输入食物名称" />
          </view>
          <view class="form-item">
            <text class="form-label">餐厅/地点</text>
            <u-input v-model="formData.restaurant" placeholder="在哪里吃的？" />
          </view>
          <view class="form-item">
            <text class="form-label">价格 (元)</text>
            <u-input
              v-model="formData.price"
              type="digit"
              placeholder="请输入价格"
            />
          </view>
          <view class="form-item">
            <text class="form-label">评分</text>
            <view class="rating-options">
              <view
                class="rating-option"
                :class="{ active: formData.rating === rating.value }"
                v-for="rating in ratingOptions"
                :key="rating.value"
                @click="formData.rating = rating.value"
              >
                <text class="rating-emoji">{{ rating.emoji }}</text>
                <text class="rating-label">{{ rating.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">标签</text>
            <view class="tag-options">
              <view
                class="tag-option"
                :class="{ active: formData.tags.includes(tag) }"
                v-for="tag in foodTags"
                :key="tag"
                @click="toggleTag(tag)"
              >
                <text class="tag-text">{{ tag }}</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <u-textarea
              v-model="formData.remark"
              placeholder="口感、推荐度、和谁一起吃等..."
              maxlength="200"
              count
            />
          </view>
        </template>

        <!-- 菜谱记录表单 -->
        <template v-if="currentModule === 'recipe'">
          <view class="redirect-notice">
            <view class="notice-icon">👨‍🍳</view>
            <text class="notice-title">菜谱功能</text>
            <text class="notice-desc"
              >菜谱功能有专门的页面，点击下方按钮前往</text
            >
            <button class="redirect-btn" @click="goToRecipeList">
              前往菜谱页面
            </button>
          </view>
        </template>

        <!-- 今日关键字表单 -->
        <template v-if="currentModule === 'keyword'">
          <view class="keyword-section">
            <view class="form-item">
              <text class="form-label">
                <text class="label-icon">🏷️</text>
                今日关键字
              </text>

              <!-- 关键字输入区域 -->
              <view class="keyword-input-area">
                <view class="input-container">
                  <input
                    class="keyword-input"
                    v-model="formData.keywordInput"
                    placeholder="输入关键字..."
                    @confirm="addKeyword"
                  />
                  <view
                    class="add-btn"
                    :class="{ disabled: !formData.keywordInput?.trim() }"
                    @click="addKeyword"
                  >
                    <text class="add-icon">+</text>
                  </view>
                </view>
              </view>

              <!-- 已添加的关键字 -->
              <view
                class="added-keywords"
                v-if="formData.keywords && formData.keywords.length > 0"
              >
                <view class="keywords-header">
                  <text class="keywords-count">已添加 {{ formData.keywords.length }} 个关键字</text>
                </view>
                <view class="keywords-grid">
                  <view
                    v-for="(keyword, index) in formData.keywords"
                    :key="index"
                    class="keyword-chip"
                  >
                    <text class="chip-text">{{ keyword }}</text>
                    <view class="chip-remove" @click="removeKeyword(index)">
                      <text class="remove-icon">×</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 推荐关键字 -->
              <view class="keyword-suggestions">
                <view class="suggestions-header">
                  <text class="suggestions-title">
                    <text class="title-icon">💡</text>
                    推荐关键字
                  </text>
                  <text class="suggestions-subtitle">点击快速添加</text>
                </view>
                <view class="suggestions-grid">
                  <view
                    v-for="suggestion in keywordSuggestions"
                    :key="suggestion"
                    class="suggestion-chip"
                    :class="{ 'added': formData.keywords.includes(suggestion) }"
                    @click="addSuggestionKeyword(suggestion)"
                  >
                    <text class="suggestion-text">{{ suggestion }}</text>
                    <text
                      v-if="formData.keywords.includes(suggestion)"
                      class="suggestion-check"
                    >✓</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">
                <text class="label-icon">💭</text>
                今日感想
              </text>
              <u-textarea
                v-model="formData.description"
                placeholder="用几句话描述今天的心情和感受..."
                maxlength="300"
                count
                class="description-textarea"
              />
            </view>
          </view>
        </template>

        <!-- 运动记录表单 -->
        <template v-if="currentModule === 'exercise'">
          <view class="form-item">
            <text class="form-label">运动类型</text>
            <view class="exercise-options">
              <view
                v-for="exercise in exerciseTypes"
                :key="exercise.value"
                class="exercise-option"
                :class="{ active: formData.exerciseType === exercise.value }"
                @click="formData.exerciseType = exercise.value"
              >
                <text class="exercise-emoji">{{ exercise.emoji }}</text>
                <text class="exercise-label">{{ exercise.label }}</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">运动时长 (分钟)</text>
            <u-input
              v-model="formData.duration"
              type="number"
              placeholder="请输入运动时长"
            />
          </view>
          <view class="form-item">
            <text class="form-label">消耗热量 (千卡)</text>
            <u-input
              v-model="formData.calories"
              type="number"
              placeholder="可选，输入消耗热量"
            />
          </view>
          <view
            class="form-item"
            v-if="
              ['running', 'walking', 'cycling', 'swimming', 'hiking'].includes(
                formData.exerciseType
              )
            "
          >
            <text class="form-label"
              >运动距离 ({{ getExerciseUnit(formData.exerciseType) }})</text
            >
            <u-input
              v-model="formData.distance"
              type="digit"
              placeholder="可选，输入运动距离"
            />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <u-textarea
              v-model="formData.remark"
              placeholder="运动感受、身体状态等..."
              maxlength="200"
              count
            />
          </view>
        </template>

        <!-- 随笔记录表单 -->
        <template v-if="currentModule === 'essay'">
          <view class="essay-section">
            <view class="form-item">
              <text class="form-label">
                <text class="label-icon">📝</text>
                今日笔记
              </text>
              <u-textarea
                v-model="formData.content"
                placeholder="写下今天的想法、感受、收获或者任何想记录的事情..."
                maxlength="1000"
                count
                class="essay-textarea"
                :auto-height="true"
                :min-height="200"
              />
            </view>

            <view class="form-item">
              <text class="form-label">
                <text class="label-icon">🏷️</text>
                标签
              </text>
              <view class="essay-tags">
                <view
                  v-for="tag in essayTagSuggestions"
                  :key="tag"
                  class="essay-tag"
                  :class="{ active: formData.tags && formData.tags.includes(tag) }"
                  @click="toggleEssayTag(tag)"
                >
                  <text class="tag-text">{{ tag }}</text>
                </view>
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">
                <text class="label-icon">💭</text>
                心情
              </text>
              <view class="mood-quick-select">
                <view
                  v-for="mood in quickMoodTypes"
                  :key="mood.value"
                  class="mood-quick-option"
                  :class="{ active: formData.mood === mood.value }"
                  @click="formData.mood = mood.value"
                >
                  <text class="mood-emoji">{{ mood.emoji }}</text>
                  <text class="mood-label">{{ mood.label }}</text>
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons" v-if="currentModule">
        <button class="cancel-button" @click="handleCancel">
          <text class="button-text">取消</text>
        </button>
        <button class="save-button" @click="handleSave">
          <text class="button-text">保存</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import {
  MODULE_CONFIG,
  MOOD_TYPES,
  SUGAR_TYPES,
  ICE_TYPES,
  ACCOUNT_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_TYPES,
  PRIORITY_TYPES,
  MEAL_TYPES,
  FOOD_TAGS,
  RATING_OPTIONS,
  EXERCISE_TYPES,
} from "@/utils/constants";
import { showToast } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const currentModule = ref("");
const formData = ref({});
const isDirectMode = ref(false); // 是否直接进入模式（从今日打卡进入）

// 计算属性
const moduleConfig = computed(() => MODULE_CONFIG);
const moodTypes = computed(() => MOOD_TYPES);
const sugarTypes = computed(() => SUGAR_TYPES);
const iceTypes = computed(() => ICE_TYPES);
const accountTypes = computed(() => ACCOUNT_TYPES);
const payTypes = computed(() => PAY_TYPES);
const priorityTypes = computed(() => PRIORITY_TYPES);
const mealTypes = computed(() => MEAL_TYPES);
const foodTags = computed(() => FOOD_TAGS);
const ratingOptions = computed(() => RATING_OPTIONS);
const exerciseTypes = computed(() => EXERCISE_TYPES);

const currentCategories = computed(() => {
  if (formData.value.type === "income") {
    return INCOME_CATEGORIES;
  } else {
    return EXPENSE_CATEGORIES;
  }
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓" };
};

const selectModule = (type) => {
  currentModule.value = type;
  initFormData(type);
};

const initFormData = (type) => {
  const baseData = {
    moduleType: type,
  };

  switch (type) {
    case "mood":
      formData.value = { ...baseData, moodType: "", description: "" };
      break;
    case "weight":
      formData.value = {
        ...baseData,
        weightValue: "",
        measureTime: Date.now(),
        remark: "",
      };
      break;
    case "milkTea":
      formData.value = {
        ...baseData,
        name: "",
        shop: "",
        sugar: "half",
        ice: "normal",
        price: "",
        drinkTime: Date.now(),
        remark: "",
      };
      break;
    case "account":
      formData.value = {
        ...baseData,
        type: "expense",
        amount: "",
        category: "",
        payType: "wechat",
        remark: "",
      };
      break;
    case "todo":
      formData.value = {
        ...baseData,
        content: "",
        priority: "mid",
        deadline: null,
        isCompleted: false,
      };
      break;
    case "food":
      formData.value = {
        ...baseData,
        mealType: "lunch",
        foodName: "",
        restaurant: "",
        price: "",
        rating: 3,
        tags: [],
        photos: [],
        remark: "",
      };
      break;
    case "keyword":
      formData.value = {
        ...baseData,
        keywords: [],
        keywordInput: "",
        description: "",
      };
      break;
    case "exercise":
      formData.value = {
        ...baseData,
        exerciseType: "",
        duration: "",
        calories: "",
        distance: "",
        remark: "",
      };
      break;
    case "essay":
      formData.value = {
        ...baseData,
        content: "",
        tags: [],
        mood: "",
        remark: "",
      };
      break;
    default:
      formData.value = baseData;
  }
};

const toggleTag = (tag) => {
  const tags = formData.value.tags;
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
  } else {
    tags.push(tag);
  }
};

// 关键字相关方法
const keywordSuggestions = [
  "开心", "充实", "忙碌", "疲惫", "放松", "焦虑",
  "学习", "工作", "运动", "阅读", "思考", "创作",
  "美食", "旅行", "购物", "电影", "音乐", "游戏",
  "朋友", "家人", "恋人", "同事", "聚会", "独处",
  "成长", "挑战", "收获", "感恩", "反思", "计划"
];

// 随笔标签建议
const essayTagSuggestions = [
  "日常", "感悟", "工作", "学习", "生活", "心情",
  "思考", "成长", "回忆", "计划", "梦想", "感恩"
];

// 快速心情选择
const quickMoodTypes = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'thoughtful', label: '深思', emoji: '🤔' },
  { value: 'grateful', label: '感恩', emoji: '🙏' }
];

const addKeyword = () => {
  const keyword = formData.value.keywordInput?.trim();
  if (keyword && !formData.value.keywords.includes(keyword)) {
    formData.value.keywords.push(keyword);
    formData.value.keywordInput = "";
  }
};

const removeKeyword = (index) => {
  formData.value.keywords.splice(index, 1);
};

const addSuggestionKeyword = (keyword) => {
  if (!formData.value.keywords.includes(keyword)) {
    formData.value.keywords.push(keyword);
  }
};

// 随笔标签切换
const toggleEssayTag = (tag) => {
  if (!formData.value.tags) {
    formData.value.tags = [];
  }
  const index = formData.value.tags.indexOf(tag);
  if (index > -1) {
    formData.value.tags.splice(index, 1);
  } else {
    formData.value.tags.push(tag);
  }
};

// 运动相关方法
const getExerciseUnit = (exerciseType) => {
  const exercise = EXERCISE_TYPES.find((e) => e.value === exerciseType);
  return exercise ? exercise.unit : "km";
};

const goToRecipeList = () => {
  uni.navigateTo({
    url: "/pages/recipe/list",
  });
};

const validateForm = () => {
  switch (currentModule.value) {
    case "mood":
      if (!formData.value.moodType) {
        showToast("请选择心情类型", "none");
        return false;
      }
      break;
    case "weight":
      if (!formData.value.weightValue) {
        showToast("请输入体重", "none");
        return false;
      }
      if (
        isNaN(formData.value.weightValue) ||
        formData.value.weightValue <= 0
      ) {
        showToast("请输入有效的体重数值", "none");
        return false;
      }
      break;
    case "milkTea":
      if (!formData.value.name) {
        showToast("请输入奶茶名称", "none");
        return false;
      }
      break;
    case "account":
      if (!formData.value.amount) {
        showToast("请输入金额", "none");
        return false;
      }
      if (isNaN(formData.value.amount) || formData.value.amount <= 0) {
        showToast("请输入有效的金额", "none");
        return false;
      }
      break;
    case "todo":
      if (!formData.value.content.trim()) {
        showToast("请输入待办内容", "none");
        return false;
      }
      break;
    case "food":
      if (!formData.value.foodName.trim()) {
        showToast("请输入食物名称", "none");
        return false;
      }
      break;
    case "keyword":
      if (!formData.value.keywords || formData.value.keywords.length === 0) {
        showToast("请至少添加一个关键字", "none");
        return false;
      }
      break;
    case "exercise":
      if (!formData.value.exerciseType) {
        showToast("请选择运动类型", "none");
        return false;
      }
      if (!formData.value.duration) {
        showToast("请输入运动时长", "none");
        return false;
      }
      break;
    case "essay":
      if (!formData.value.content.trim()) {
        showToast("请输入笔记内容", "none");
        return false;
      }
      break;
  }
  return true;
};

const handleSave = () => {
  if (!validateForm()) return;

  try {
    recordStore.addRecord(formData.value);
    showToast("保存成功", "success");

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    showToast("保存失败", "none");
  }
};

const handleCancel = () => {
  uni.navigateBack();
};

// 生命周期
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.type) {
    // 设置直接模式，隐藏模块选择器
    isDirectMode.value = true;
    selectModule(options.type);

    // 动态设置页面标题
    const moduleInfo = getModuleConfig(options.type);
    uni.setNavigationBarTitle({
      title: moduleInfo.name + "打卡",
    });

    // 处理从推荐页面传递的参数
    if (options.type === "food") {
      if (options.foodName) {
        formData.value.foodName = decodeURIComponent(options.foodName);
      }
      if (options.mealType) {
        formData.value.mealType = options.mealType;
      }
    }
  } else {
    // 从底部导航栏进入，显示快速记录选择
    uni.setNavigationBarTitle({
      title: "快速记录",
    });
  }
});
</script>

<style lang="scss" scoped>
.add-record-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx; /* 增加底部内边距，为按钮和导航栏留出空间 */
}

.form-container {
  padding: 20rpx;
}

.form-section {
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .section-subtitle {
    font-size: 28rpx;
    font-weight: 500;
    color: #666;
    margin: 30rpx 0 16rpx 0;
  }
}

.quick-note-section {
  margin-bottom: 30rpx;

  .quick-note-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
    }

    .note-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }

    .note-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .note-title {
        font-size: 32rpx;
        font-weight: bold;
        color: white;
      }

      .note-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .note-arrow {
      font-size: 32rpx;
      color: white;
      font-weight: bold;
    }
  }
}

.module-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;

  .module-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    border-radius: 12rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;

    &.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .option-emoji {
      font-size: 32rpx;
      margin-bottom: 8rpx;
    }

    .option-name {
      font-size: 24rpx;
      color: #333;
    }
  }
}

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
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .mood-emoji {
      font-size: 28rpx;
      margin-bottom: 6rpx;
    }

    .mood-label {
      font-size: 22rpx;
      color: #333;
    }
  }
}

.meal-options {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;

  .meal-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 20rpx;
    border-radius: 12rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;
    min-width: 100rpx;

    &.active {
      border-color: #ff6347;
      background: rgba(255, 99, 71, 0.1);
    }

    .meal-emoji {
      font-size: 24rpx;
      margin-bottom: 6rpx;
    }

    .meal-label {
      font-size: 22rpx;
      color: #333;
    }
  }
}

.rating-options {
  display: flex;
  gap: 12rpx;

  .rating-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx;
    border-radius: 12rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;
    flex: 1;

    &.active {
      border-color: #ffd700;
      background: rgba(255, 215, 0, 0.1);
    }

    .rating-emoji {
      font-size: 24rpx;
      margin-bottom: 6rpx;
    }

    .rating-label {
      font-size: 20rpx;
      color: #333;
    }
  }
}

.tag-options {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;

  .tag-option {
    padding: 12rpx 20rpx;
    border-radius: 20rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;
    background: #f8f8f8;

    &.active {
      border-color: #ff6347;
      background: #ff6347;

      .tag-text {
        color: white;
      }
    }

    .tag-text {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 100rpx; /* 调整为底部导航栏高度 + 一些间距 */
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-top: 1rpx solid #f0f0f0;
  z-index: 999; /* 确保在其他元素之上 */

  .cancel-button,
  .save-button {
    flex: 1;
    height: 88rpx;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &:active {
      transform: scale(0.98);
    }

    .button-text {
      position: relative;
      z-index: 1;
    }
  }

  .cancel-button {
    background: #f8f9fa;
    color: #6c757d;
    border: 2rpx solid #e9ecef;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #6c757d, #495057);
      transition: left 0.3s;
      z-index: 0;
    }

    &:active {
      &::before {
        left: 0;
      }

      .button-text {
        color: white;
      }
    }
  }

  .save-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #5a6fd8, #6a4c93);
      transition: left 0.3s;
      z-index: 0;
    }

    &:active {
      &::before {
        left: 0;
      }
    }
  }
}
</style>

.redirect-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  text-align: center;

  .notice-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .notice-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .notice-desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 40rpx;
  }

  .redirect-btn {
    padding: 20rpx 40rpx;
    background: #32cd32;
    color: white;
    border: none;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}

// 今日关键字样式重新设计
.keyword-section {
  .form-label {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;

    .label-icon {
      font-size: 24rpx;
    }
  }
}

.keyword-input-area {
  margin-bottom: 32rpx;

  .input-container {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 24rpx;
    padding: 8rpx;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #667eea;
      background: #fff;
      box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
    }

    .keyword-input {
      flex: 1;
      height: 64rpx;
      padding: 0 20rpx;
      background: transparent;
      border: none;
      font-size: 28rpx;
      color: #333;
      outline: none;

      &::placeholder {
        color: #999;
      }
    }

    .add-btn {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;

      &:active:not(.disabled) {
        transform: scale(0.95);
      }

      &.disabled {
        background: #e9ecef;
        cursor: not-allowed;

        .add-icon {
          color: #adb5bd;
        }
      }

      .add-icon {
        font-size: 32rpx;
        font-weight: bold;
        color: white;
      }
    }
  }
}

.added-keywords {
  margin-bottom: 32rpx;

  .keywords-header {
    margin-bottom: 16rpx;

    .keywords-count {
      font-size: 26rpx;
      color: #667eea;
      font-weight: 600;
    }
  }

  .keywords-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .keyword-chip {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 16rpx;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.25);
      transition: all 0.3s ease;

      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);
      }

      .chip-text {
        font-size: 26rpx;
        color: white;
        font-weight: 500;
      }

      .chip-remove {
        width: 28rpx;
        height: 28rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:active {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0.9);
        }

        .remove-icon {
          font-size: 20rpx;
          color: white;
          font-weight: bold;
        }
      }
    }
  }
}

.keyword-suggestions {
  .suggestions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .suggestions-title {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 26rpx;
      color: #495057;
      font-weight: 600;

      .title-icon {
        font-size: 22rpx;
      }
    }

    .suggestions-subtitle {
      font-size: 22rpx;
      color: #adb5bd;
    }
  }

  .suggestions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .suggestion-chip {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 12rpx 18rpx;
      background: #fff;
      border: 2rpx solid #e9ecef;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #495057;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        transition: left 0.3s ease;
        z-index: 0;
      }

      &:active:not(.added) {
        transform: scale(0.95);

        &::before {
          left: 0;
        }

        .suggestion-text {
          color: white;
        }
      }

      &.added {
        background: linear-gradient(135deg, #28a745, #20c997);
        border-color: #28a745;
        color: white;
        cursor: default;

        .suggestion-text {
          color: white;
        }

        .suggestion-check {
          color: white;
          font-weight: bold;
        }
      }

      .suggestion-text {
        font-size: 24rpx;
        font-weight: 500;
        position: relative;
        z-index: 1;
        transition: color 0.3s ease;
      }

      .suggestion-check {
        font-size: 20rpx;
        font-weight: bold;
        position: relative;
        z-index: 1;
      }
    }
  }
}

.description-textarea {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  transition: all 0.3s;

  &:focus {
    border-color: #667eea;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  }
}

// 运动记录样式
.exercise-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;

  .exercise-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx;
    border-radius: 12rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;

    &.active {
      border-color: #34c759;
      background: rgba(52, 199, 89, 0.1);
    }

    .exercise-emoji {
      font-size: 28rpx;
      margin-bottom: 6rpx;
    }

    .exercise-label {
      font-size: 22rpx;
      color: #333;
    }
  }
}

// 随笔记录样式
.essay-section {
  .form-label {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .label-icon {
      font-size: 24rpx;
    }
  }
}

.essay-textarea {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  transition: all 0.3s;

  &:focus {
    border-color: #667eea;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  }
}

.essay-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .essay-tag {
    padding: 12rpx 20rpx;
    border-radius: 20rpx;
    border: 2rpx solid #e9ecef;
    background: #f8f9fa;
    transition: all 0.3s;

    &.active {
      border-color: #667eea;
      background: #667eea;

      .tag-text {
        color: white;
      }
    }

    .tag-text {
      font-size: 24rpx;
      color: #333;
    }
  }
}

.mood-quick-select {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .mood-quick-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx;
    border-radius: 12rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;
    min-width: 100rpx;

    &.active {
      border-color: #ff6b9d;
      background: rgba(255, 107, 157, 0.1);
    }

    .mood-emoji {
      font-size: 28rpx;
      margin-bottom: 6rpx;
    }

    .mood-label {
      font-size: 22rpx;
      color: #333;
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .keyword-suggestions {
    .suggestion-tags {
      gap: 8rpx;

      .suggestion-tag {
        padding: 8rpx 12rpx;
        font-size: 22rpx;

        .tag-text {
          font-size: 22rpx;
        }

        .tag-check {
          font-size: 18rpx;
        }
      }
    }
  }

  .action-buttons {
    padding: 20rpx 16rpx;
    gap: 16rpx;

    .cancel-button,
    .save-button {
      height: 80rpx;
      font-size: 28rpx;
      border-radius: 40rpx;
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .keyword-suggestions {
    .suggestion-tags {
      .suggestion-tag {
        background: #2c2c2e;
        border-color: #3a3a3c;
        color: #ffffff;

        &:not(.selected) {
          &::before {
            background: linear-gradient(135deg, #667eea, #764ba2);
          }
        }
      }
    }
  }

  .action-buttons {
    background: #1c1c1e;
    border-top-color: #3a3a3c;

    .cancel-button {
      background: #2c2c2e;
      color: #ffffff;
      border-color: #3a3a3c;

      &::before {
        background: linear-gradient(135deg, #8e8e93, #6d6d70);
      }
    }
  }
}
