<template>
  <view class="birthday-add-page">
    <view class="form-container">
      <!-- 基本信息 -->
      <view class="form-section card">
        <view class="section-title">基本信息</view>

        <view class="form-item">
          <text class="form-label">姓名 *</text>
          <input
            class="form-input"
            v-model="formData.name"
            placeholder="请输入姓名"
            maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="form-label">生日 *</text>
          <picker
            mode="date"
            :value="formData.birthday"
            @change="onBirthdayChange"
            :end="maxDate"
          >
            <view class="picker-input">
              <text v-if="formData.birthday" class="picker-text">{{
                formatBirthdayDisplay(formData.birthday)
              }}</text>
              <text v-else class="picker-placeholder">请选择生日</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">关系</text>
          <picker
            :range="relationshipOptions"
            range-key="label"
            :value="relationshipIndex"
            @change="onRelationshipChange"
          >
            <view class="picker-input">
              <text v-if="formData.relationship" class="picker-text">{{
                getRelationshipLabel(formData.relationship)
              }}</text>
              <text v-else class="picker-placeholder">请选择关系</text>
            </view>
          </picker>
        </view>

        <view v-if="formData.birthday" class="birthday-info">
          <view class="info-item">
            <text class="info-label">年龄：</text>
            <text class="info-value"
              >{{ calculateAge(formData.birthday) }}岁</text
            >
          </view>
          <view class="info-item">
            <text class="info-label">星座：</text>
            <text class="info-value"
              >{{ getZodiacSign(formData.birthday).emoji }}
              {{ getZodiacSign(formData.birthday).name }}</text
            >
          </view>
          <view class="info-item">
            <text class="info-label">距离生日：</text>
            <text class="info-value"
              >{{ getDaysUntilBirthday(formData.birthday) }}天</text
            >
          </view>
        </view>
      </view>

      <!-- 联系信息 -->
      <view class="form-section card">
        <view class="section-title">联系信息</view>

        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            v-model="formData.phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
          />
        </view>

        <view class="form-item">
          <text class="form-label">地址</text>
          <input
            class="form-input"
            v-model="formData.address"
            placeholder="请输入地址"
            maxlength="100"
          />
        </view>
      </view>

      <!-- 提醒设置 -->
      <view class="form-section card">
        <view class="section-title">提醒设置</view>

        <view class="reminder-options">
          <view
            v-for="option in reminderOptions"
            :key="option.value"
            class="reminder-option"
            :class="{
              active: formData.reminderSettings.includes(option.value),
            }"
            @click="toggleReminder(option.value)"
          >
            <text class="option-text">{{ option.label }}</text>
            <view
              class="option-check"
              v-if="formData.reminderSettings.includes(option.value)"
              >✓</view
            >
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section card">
        <view class="section-title">备注</view>

        <view class="form-item">
          <textarea
            class="form-textarea"
            v-model="formData.notes"
            placeholder="添加一些备注信息..."
            maxlength="200"
          />
          <text class="char-count">{{ formData.notes.length }}/200</text>
        </view>
      </view>

      <!-- 标签 -->
      <view class="form-section card">
        <view class="section-title">标签</view>

        <view class="tags-input">
          <view class="tag-list">
            <view
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="tag-item"
            >
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-remove" @click="removeTag(index)">×</text>
            </view>
          </view>
          <input
            class="tag-input"
            v-model="newTag"
            placeholder="添加标签"
            @confirm="addTag"
            maxlength="10"
          />
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="cancel-btn" @click="goBack">取消</button>
      <button class="save-btn" @click="saveBirthday" :disabled="!canSave">
        保存
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import birthdayService from "@/utils/birthdayService.js";
import {
  calculateAge,
  getDaysUntilBirthday,
  getZodiacSign,
  formatBirthdayDisplay,
  showToast,
} from "@/utils/index.js";
import {
  RELATIONSHIP_TYPES,
  BIRTHDAY_REMINDER_TYPES,
  DEFAULT_BIRTHDAY_REMINDERS,
} from "@/utils/constants.js";

// 响应式数据
const formData = ref({
  name: "",
  birthday: "",
  relationship: "",
  phone: "",
  address: "",
  notes: "",
  reminderSettings: [...DEFAULT_BIRTHDAY_REMINDERS],
  tags: [],
});

const newTag = ref("");
const isEdit = ref(false);
const recordId = ref("");

// 计算属性
const relationshipOptions = computed(() => RELATIONSHIP_TYPES);
const reminderOptions = computed(() => BIRTHDAY_REMINDER_TYPES);

const relationshipIndex = computed(() => {
  return relationshipOptions.value.findIndex(
    (item) => item.value === formData.value.relationship
  );
});

const maxDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const canSave = computed(() => {
  return formData.value.name.trim() && formData.value.birthday;
});

// 方法
const getRelationshipLabel = (value) => {
  const relationship = RELATIONSHIP_TYPES.find((r) => r.value === value);
  return relationship ? relationship.label : "其他";
};

const onBirthdayChange = (e) => {
  formData.value.birthday = e.detail.value;
};

const onRelationshipChange = (e) => {
  const index = e.detail.value;
  formData.value.relationship = relationshipOptions.value[index].value;
};

const toggleReminder = (value) => {
  const index = formData.value.reminderSettings.indexOf(value);
  if (index > -1) {
    formData.value.reminderSettings.splice(index, 1);
  } else {
    formData.value.reminderSettings.push(value);
    formData.value.reminderSettings.sort((a, b) => b - a); // 降序排列
  }
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (
    tag &&
    !formData.value.tags.includes(tag) &&
    formData.value.tags.length < 5
  ) {
    formData.value.tags.push(tag);
    newTag.value = "";
  }
};

const removeTag = (index) => {
  formData.value.tags.splice(index, 1);
};

const saveBirthday = async () => {
  if (!canSave.value) {
    showToast("请填写必填信息", "none");
    return;
  }

  try {
    const data = { ...formData.value };

    if (isEdit.value) {
      const result = birthdayService.updateBirthdayRecord(recordId.value, data);
      if (result) {
        showToast("更新成功", "success");
      } else {
        showToast("更新失败", "error");
        return;
      }
    } else {
      const result = birthdayService.addBirthdayRecord(data);
      if (result) {
        showToast("添加成功", "success");
      } else {
        showToast("添加失败", "error");
        return;
      }
    }

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error("保存生日记录失败:", error);
    showToast("保存失败", "error");
  }
};

const goBack = () => {
  uni.navigateBack();
};

const loadRecord = (id) => {
  const records = birthdayService.getBirthdayRecords();
  const record = records.find((r) => r.recordId === id);

  if (record) {
    formData.value = {
      name: record.name || "",
      birthday: record.birthday || "",
      relationship: record.relationship || "",
      phone: record.phone || "",
      address: record.address || "",
      notes: record.notes || "",
      reminderSettings: record.reminderSettings || [
        ...DEFAULT_BIRTHDAY_REMINDERS,
      ],
      tags: record.tags || [],
    };
  }
};

// 生命周期
onMounted(() => {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options || {};

    if (options.id) {
      isEdit.value = true;
      recordId.value = options.id;
      loadRecord(options.id);
    }
  } catch (error) {
    console.error("获取页面参数失败:", error);
  }
});
</script>

<style lang="scss" scoped>
.birthday-add-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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

  .form-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
    }

    .form-input {
      width: 100%;
      padding: 24rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 12rpx;
      font-size: 28rpx;
      background: #fff;
    }

    .picker-input {
      padding: 24rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 12rpx;
      background: #fff;

      .picker-text {
        font-size: 28rpx;
        color: #333;
      }

      .picker-placeholder {
        font-size: 28rpx;
        color: #999;
      }
    }

    .form-textarea {
      width: 100%;
      min-height: 120rpx;
      padding: 24rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 12rpx;
      font-size: 28rpx;
      background: #fff;
      resize: none;
    }

    .char-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .birthday-info {
    background: #f8f9fa;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-top: 16rpx;

    .info-item {
      display: flex;
      justify-content: space-between;
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
      }
    }
  }

  .reminder-options {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .reminder-option {
      position: relative;
      padding: 16rpx 24rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 24rpx;
      background: #fff;
      transition: all 0.3s;

      &.active {
        background: #ff6b9d;
        border-color: #ff6b9d;

        .option-text {
          color: white;
        }
      }

      .option-text {
        font-size: 26rpx;
        color: #333;
      }

      .option-check {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 24rpx;
        height: 24rpx;
        background: #34c759;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16rpx;
      }
    }
  }

  .tags-input {
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .tag-item {
        display: flex;
        align-items: center;
        background: #ff6b9d;
        color: white;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;

        .tag-text {
          margin-right: 8rpx;
        }

        .tag-remove {
          font-size: 28rpx;
          font-weight: bold;
          cursor: pointer;
        }
      }
    }

    .tag-input {
      width: 100%;
      padding: 24rpx;
      border: 1rpx solid #e0e0e0;
      border-radius: 12rpx;
      font-size: 28rpx;
      background: #fff;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #e0e0e0;

  .cancel-btn,
  .save-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
  }

  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }

  .save-btn {
    background: #ff6b9d;
    color: white;

    &:disabled {
      background: #ccc;
      color: #999;
    }
  }
}
</style>
