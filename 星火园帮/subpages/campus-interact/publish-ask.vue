<template>
  <view class="ask-publish-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="title-section">
        <text class="page-title">发布问答</text>
        <text class="page-subtitle">有问题？来这里寻找答案吧！</text>
      </view>
    </view>

    <form @submit="submitAskRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label"
              >问题标题 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="请输入您的问题标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏷️</text>
            <text class="item-label">问题类型</text>
          </view>
          <picker
            :range="questionTypes"
            range-key="name"
            @change="onTypeChange"
          >
            <view class="picker-value input-imitation rounded-base">
              {{
                formData.type ? getTypeName(formData.type) : "请选择问题类型"
              }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📋</text>
            <text class="item-label"
              >问题描述 <text class="required-star">*</text></text
            >
          </view>
          <textarea
            class="textarea-field rounded-base textarea-enhanced"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您的问题，包括背景、具体困难等..."
            maxlength="500"
          />
          <view class="char-count">{{ formData.description.length }}/500</view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📞</text>
            <text class="item-label">联系方式</text>
          </view>
          <input
            class="input-field rounded-base contact-input"
            name="contact"
            v-model="formData.contact"
            placeholder="微信号、QQ号等，方便回答者联系"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⏰</text>
            <text class="item-label">截止时间</text>
          </view>
          <picker
            mode="date"
            :value="formData.deadline"
            @change="onDeadlineChange"
          >
            <view class="picker-value input-imitation rounded-base">
              {{ formData.deadline || "请选择截止时间" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>
      </view>

      <view class="submit-section">
        <button
          class="submit-btn ask-btn rounded-full"
          @click="submitAskRequest"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
        >
          <text class="btn-icon">🚀</text>
          <text class="btn-text">{{
            isSubmitting ? "发布中..." : "发布问答"
          }}</text>
        </button>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      formData: {
        title: "",
        type: "",
        description: "",
        contact: "",
        deadline: "",
      },
      questionTypes: [
        { name: "学习问题", value: "study" },
        { name: "生活问题", value: "life" },
        { name: "技术问题", value: "tech" },
        { name: "校园生活", value: "campus" },
        { name: "其他问题", value: "other" },
      ],
      isSubmitting: false,
    };
  },
  computed: {
    isFormValid() {
      return this.formData.title && this.formData.description;
    },
  },
  methods: {
    onTypeChange(e) {
      const index = e.detail.value;
      this.formData.type = this.questionTypes[index].value;
    },
    onDeadlineChange(e) {
      this.formData.deadline = e.detail.value;
    },
    getTypeName(value) {
      const type = this.questionTypes.find((t) => t.value === value);
      return type ? type.name : "";
    },
    validateForm() {
      if (!this.formData.title || !this.formData.title.trim()) {
        uni.showToast({
          title: "请输入问题标题",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.description || !this.formData.description.trim()) {
        uni.showToast({
          title: "请输入问题描述",
          icon: "none",
        });
        return false;
      }
      return true;
    },

    async submitAskRequest() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布求资料")) {
        return;
      }

      if (!this.validateForm()) return;

      if (this.isSubmitting) return;

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        return;
      }

      this.isSubmitting = true;
      uni.showLoading({ title: "发布中..." });

      try {
        const result = await request({
          url: "/campus-interactions",
          method: "POST",
          data: {
            type: "ask",
            title: this.formData.title?.trim() || "",
            description: this.formData.description?.trim() || "",
            questionType: this.formData.type || "",
            deadline: this.formData.deadline || null,
            contactInfo: this.formData.contactInfo?.trim() || "",
            communityId: currentCommunity.id, // 添加社区ID
          },
        });

        uni.hideLoading();
        if (result.success) {
          uni.showToast({
            title: "发布成功！",
            icon: "success",
          });

          // 触发全局事件，通知列表页刷新
          uni.$emit("refreshCampusList");

          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        }
      } catch (error) {
        uni.hideLoading();
        console.error("发布失败:", error);
        uni.showToast({
          title: "发布失败，请重试",
          icon: "none",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.ask-publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  padding: 0;
  padding-bottom: 200rpx;
}

// 顶部装饰区域
.header-decoration {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx 32rpx 20rpx;
  border-radius: 0 0 50rpx 50rpx;
  margin-bottom: 32rpx;
  overflow: hidden;

  .title-section {
    text-align: center;
    position: relative;
    z-index: 2;

    .page-title {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 16rpx;
    }

    .page-subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.form-section {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-lg;
  margin: 0 32rpx 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label-with-icon {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-row-sm;

  .item-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
  }

  .item-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: 600;

    .required-star {
      color: #ff6b6b;
      margin-left: 4rpx;
    }
  }
}

.input-field,
.textarea-field,
.input-imitation {
  width: 100%;
  padding: 24rpx;
  border: 2px solid #a5b4fc;
  background: linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%);
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  box-sizing: border-box;
  transition: all 0.3s ease;
  min-height: 88rpx;

  &:focus {
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.input-imitation {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .picker-arrow {
    color: #95a5a6;
    font-size: 24rpx;
  }
}

.textarea-field {
  min-height: 240rpx;
  resize: none;
  line-height: 1.6;

  &.textarea-enhanced {
    position: relative;
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.picker {
  padding: 24rpx;
  border: 2px solid #e8eaed;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  min-height: 88rpx;
  display: flex;
  align-items: center;

  &.picker-enhanced {
    position: relative;

    &::after {
      content: "▼";
      position: absolute;
      right: 24rpx;
      color: #9ca3af;
      font-size: 24rpx;
    }
  }

  &:focus {
    border-color: #667eea;
    background-color: #ffffff;
  }
}

.picker-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  flex: 1;
}

.contact-input {
  background: linear-gradient(45deg, #fafbfc 0%, #f0f9ff 100%);
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 255, 255, 0.95) 20%,
    #ffffff 100%
  );
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transition: all 0.3s ease;

  &.ask-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

    &:not(:disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
    }
  }

  &:disabled {
    opacity: 0.6;
    transform: none !important;
  }

  .btn-icon {
    font-size: 32rpx;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
  }
}

.rounded-base {
  border-radius: 16rpx;
}

.rounded-full {
  border-radius: 48rpx;
}
</style>
