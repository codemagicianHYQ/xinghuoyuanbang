<template>
  <view class="ask-publish-container page-container">
    <form @submit="submitAskRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label"
            >问题标题 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="请输入您的问题标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">问题类型</text>
          <picker
            class="picker rounded-base"
            :range="questionTypes"
            range-key="name"
            @change="onTypeChange"
          >
            <view class="picker-value">
              {{
                formData.type ? getTypeName(formData.type) : "请选择问题类型"
              }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label"
            >详细描述 <text class="required-star">*</text></text
          >
          <textarea
            class="textarea-field rounded-base"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您的问题，以便他人更好地帮助您..."
            maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="item-label">悬赏帮帮币 (可选)</text>
          <input
            class="input-field rounded-base"
            type="digit"
            name="reward"
            v-model="formData.reward"
            placeholder="例如：5 (纯数字)"
          />
        </view>

        <view class="form-item">
          <text class="item-label">联系方式 (选填)</text>
          <input
            class="input-field rounded-base"
            name="contactInfo"
            v-model="formData.contactInfo"
            placeholder="例如：QQ/微信，方便他人联系你"
            maxlength="50"
          />
        </view>
      </view>

      <view class="agreement-section">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox
              :value="true"
              :checked="isAgreed"
              color="#2979ff"
              style="transform: scale(0.8)"
            />
            <text>我已阅读并同意相关</text>
          </label>
        </checkbox-group>
        <text class="link-text" @click="viewPlatformTerms"
          >《平台使用条款》</text
        >
      </view>

      <button
        form-type="submit"
        class="submit-btn button-primary rounded-pill"
        :loading="isSubmitting"
        :disabled="!isAgreed || isSubmitting"
      >
        立即发布
      </button>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      formData: {
        title: "",
        type: "",
        description: "",
        reward: "",
        contactInfo: "",
      },
      questionTypes: [
        { id: "study", name: "学习相关" },
        { id: "life", name: "生活相关" },
        { id: "campus", name: "校园相关" },
        { id: "other", name: "其他" },
      ],
      isAgreed: false,
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
  },
  onLoad() {
    if (!this.hasLogin) {
      uni.showModal({
        title: "提示",
        content: "您尚未登录，登录后才能发布问题。",
        showCancel: false,
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/login/login?redirect=/subpages/resources/publish-ask",
            });
          } else {
            uni.navigateBack().catch(() => {
              uni.switchTab({ url: "/pages/home/home" });
            });
          }
        },
      });
    }
  },
  methods: {
    getTypeName(typeId) {
      const type = this.questionTypes.find((t) => t.id === typeId);
      return type ? type.name : "";
    },
    onTypeChange(e) {
      this.formData.type = this.questionTypes[e.detail.value].id;
    },
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    viewPlatformTerms() {
      uni.showToast({ title: "查看平台使用条款（待实现）", icon: "none" });
    },
    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入问题标题", icon: "none" });
        return false;
      }
      if (this.formData.title.trim().length < 5) {
        uni.showToast({ title: "问题标题至少5个字", icon: "none" });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({ title: "请输入详细描述", icon: "none" });
        return false;
      }
      if (this.formData.description.trim().length < 10) {
        uni.showToast({ title: "详细描述至少10个字", icon: "none" });
        return false;
      }
      if (
        this.formData.reward &&
        (isNaN(parseFloat(this.formData.reward)) ||
          parseFloat(this.formData.reward) < 0)
      ) {
        uni.showToast({
          title: "请输入有效的悬赏金额 (纯数字，可选)",
          icon: "none",
        });
        return false;
      }
      if (!this.isAgreed) {
        uni.showToast({ title: "请先阅读并同意相关平台条款", icon: "none" });
        return false;
      }
      return true;
    },
    async submitAskRequest() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({ title: "正在发布..." });

      const submissionData = {
        type: "ask_request",
        title: this.formData.title.trim(),
        questionType: this.formData.type,
        description: this.formData.description.trim(),
        reward: this.formData.reward ? parseFloat(this.formData.reward) : 0,
        contactInfo: this.formData.contactInfo.trim(),
      };

      try {
        const response = await request({
          url: "/asks/create",
          method: "POST",
          data: submissionData,
        });

        uni.hideLoading();
        if (response) {
          uni.showToast({
            title: "发布成功！",
            icon: "success",
            duration: 2000,
          });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/home/home" });
          }, 2000);
        }
      } catch (error) {
        uni.hideLoading();
        console.error("问题发布失败:", error);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}

.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  margin-bottom: $uni-spacing-row-lg;
  padding: $uni-spacing-col-lg;
}

.form-section {
  .form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: $uni-spacing-row-lg;
    &:last-child {
      margin-bottom: 0;
    }
    .item-label {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-row-sm;
      font-weight: 500;
      .required-star {
        color: $uni-color-error;
        margin-left: 4rpx;
      }
    }
    .input-field,
    .textarea-field,
    .picker {
      background-color: lighten($uni-bg-color-page, 3%);
      border: 1px solid $uni-border-color-light;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      border-radius: $uni-border-radius-base;
      width: 100%;
      box-sizing: border-box;
      &:focus {
        border-color: $uni-color-primary;
      }
    }
    .input-field {
      height: 88rpx;
      line-height: 88rpx;
      padding: 0 $uni-spacing-col-base;
    }
    .textarea-field {
      padding: $uni-spacing-col-base;
      height: 220rpx;
      line-height: 1.6;
    }
    .picker {
      height: 88rpx;
      line-height: 88rpx;
      padding: 0 $uni-spacing-col-base;
    }
  }
}

.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-row-lg * 1.5;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  .agreement-label {
    display: flex;
    align-items: center;
    margin-right: 4rpx;
  }
  .link-text {
    color: $uni-text-color-link;
  }
}

.submit-btn {
  width: 100%;
}

.rounded-lg {
  border-radius: $uni-border-radius-lg;
}

.rounded-base {
  border-radius: $uni-border-radius-base;
}

.rounded-pill {
  border-radius: $uni-border-radius-pill;
}

.shadow-base {
  box-shadow: $uni-shadow-base;
}
</style>
