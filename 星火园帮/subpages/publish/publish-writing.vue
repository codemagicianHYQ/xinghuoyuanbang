<template>
  <view class="publish-writing-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">📚</view>
      <view class="title-content">
        <view class="page-title">发布作业辅助</view>
        <view class="page-subtitle">学习有困难，我来帮助你！</view>
      </view>
    </view>

    <form @submit="submitWritingTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label">
            辅助类型 <text class="required-star">*</text>
          </text>
          <picker :range="documentTypes" @change="bindDocTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.documentType || "请选择辅助类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">
            辅助内容 <text class="required-star">*</text>
          </text>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.requirements"
            placeholder="请输入需要辅助的作业内容以及具体要求"
            maxlength="500"
            auto-height
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            截止时间 <text class="required-star">*</text>
          </text>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.deadline"
              :start="minDate"
              :end="maxDate"
              @change="bindDeadlineDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.deadline || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.deadlineTime"
              @change="bindDeadlineTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.deadlineTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">参考资料</text>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.references"
            placeholder="如有参考资料或链接，请在此提供"
            maxlength="300"
            auto-height
          />
        </view>

        <view class="form-item">
          <text class="item-label">格式要求</text>
          <input
            class="input-field rounded-base"
            v-model="formData.formatRequirements"
            placeholder="如：Word文档、PDF、特定格式要求"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            报酬 (元)
            <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.reward"
            placeholder="根据难度和字数合理定价"
          />
        </view>
      </view>

      <view
        class="submit-btn writing-btn rounded-full"
        @click="submitWritingTask"
      >
        <text class="btn-icon">🚀</text>
        <text class="btn-text">立即发布</text>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import PublishButton from "@/components/PublishButton.vue";

export default {
  components: { PublishButton },
  data() {
    const now = new Date();
    return {
      formData: {
        documentType: "",
        requirements: "",
        deadline: "",
        deadlineTime: "",
        references: "",
        formatRequirements: "",
        reward: "",
      },
      documentTypes: [
        "作业辅导",
        "论文指导",
        "实验报告",
        "课程设计",
        "毕业设计",
        "其他",
      ],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  methods: {
    bindDocTypeChange(e) {
      this.formData.documentType = this.documentTypes[e.detail.value];
    },
    bindDeadlineDateChange(e) {
      this.formData.deadline = e.detail.value;
    },
    bindDeadlineTimeChange(e) {
      this.formData.deadlineTime = e.detail.value;
    },
    validateForm() {
      if (!this.formData.documentType) {
        uni.showToast({ title: "请选择辅助类型", icon: "none" });
        return false;
      }
      if (!this.formData.requirements) {
        uni.showToast({ title: "请填写辅助内容", icon: "none" });
        return false;
      }
      if (!this.formData.reward || isNaN(this.formData.reward)) {
        uni.showToast({ title: "请填写有效报酬", icon: "none" });
        return false;
      }
      // 新增校验
      if (
        !`代替${this.formData.documentType}：${this.formData.wordCount}`.trim()
      ) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return false;
      }
      if (!"writing") {
        uni.showToast({ title: "任务类型不能为空", icon: "none" });
        return false;
      }
      if (parseFloat(this.formData.reward) < 10) {
        uni.showToast({ title: "报酬至少10元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitWritingTask() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      const reward = Number(this.formData.reward);

      // 构造任务数据
      const taskData = {
        title: `找小伙伴作业辅助`,
        description: this.formData.requirements.trim(),
        taskType: "作业辅助",
        rewardAmount: reward,
        locationText: "线上服务",
        specifics: `辅助类型: ${
          this.formData.documentType
        }\n辅助内容: ${this.formData.requirements.trim()}\n参考资料: ${
          this.formData.references.trim() || "无"
        }\n格式要求: ${this.formData.formatRequirements.trim() || "无"}`,
        paymentAmount: reward,
        paymentDescription: `作业辅助：${this.formData.documentType}`,
      };

      // 跳转到发布确认页面
      uni.navigateTo({
        url: `/subpages/publish/publish-confirm?taskData=${encodeURIComponent(
          JSON.stringify(taskData)
        )}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-writing-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(129, 212, 250, 0.2);
  display: flex;
  align-items: center;
  min-height: 120rpx;
}

.main-icon {
  font-size: 120rpx;
  margin-right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
  position: relative;
  z-index: 100;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.title-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.page-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  position: relative;
  z-index: 2;
}

.form-section {
  padding: 32rpx;
  margin: 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(21, 101, 192, 0.1);
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .label-with-icon {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .item-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .item-label {
    font-size: 32rpx;
    color: #2c3e50;
    font-weight: 600;
    .required-star {
      color: #e74c3c;
      margin-left: 4rpx;
    }
  }

  .input-field,
  .textarea-field,
  .input-imitation {
    background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
    border: 2px solid #81d4fa;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #4fc3f7;
      background: linear-gradient(135deg, #ffffff 0%, #e1f5fe 100%);
      box-shadow: 0 0 0 4rpx rgba(129, 212, 250, 0.1);
    }

    &::placeholder {
      color: #95a5a6;
      font-size: 28rpx;
    }
  }

  .input-field {
    min-height: 88rpx;
    line-height: 88rpx;
    padding: 0 24rpx;
  }

  .textarea-field {
    padding: 24rpx;
    min-height: 240rpx;
    line-height: 1.6;
  }

  .input-imitation {
    min-height: 88rpx;
    padding: 0 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .picker-arrow {
      color: #95a5a6;
      font-size: 24rpx;
    }
  }

  .time-picker-group {
    display: flex;
    gap: $uni-spacing-col-base;
    .time-picker-item {
      flex: 1;
    }
  }
}

/* 发布按钮样式 */
.submit-btn {
  margin: 32rpx 24rpx;
  width: calc(100% - 48rpx);
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.writing-btn {
  background: linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%);
  color: #ffffff;

  .btn-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
  }
}
</style>
