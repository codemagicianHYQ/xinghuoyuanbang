<template>
  <view class="salvage-publish-container page-container">
    <form @submit="submitSalvageRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label"
            >标题 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="请输入标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >详细描述 <text class="required-star">*</text></text
          >
          <textarea
            class="textarea-field rounded-base"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您要找的人的特征、相遇场景等信息..."
            maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >地点 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            name="location"
            v-model="formData.location"
            placeholder="请输入相遇地点"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >日期 <text class="required-star">*</text></text
          >
          <picker
            class="picker rounded-base"
            mode="date"
            :value="formData.date"
            :start="startDate"
            :end="endDate"
            @change="onDateChange"
          >
            <view class="picker-value">
              {{ formData.date || "请选择日期" }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label"
            >联系方式 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            name="contactInfo"
            v-model="formData.contactInfo"
            placeholder="请输入您的联系方式"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">上传图片 (最多3张)</text>
          <view class="image-uploader">
            <view
              class="image-item"
              v-for="(image, index) in formData.images"
              :key="index"
            >
              <image :src="image" mode="aspectFill" class="preview-image" />
              <text class="delete-btn" @click="deleteImage(index)">×</text>
            </view>
            <view
              class="upload-btn"
              v-if="formData.images.length < 3"
              @click="chooseImage"
            >
              <text class="upload-icon">+</text>
            </view>
          </view>
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
        description: "",
        location: "",
        date: "",
        contactInfo: "",
        images: [],
      },
      isAgreed: false,
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
    startDate() {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      return date.toISOString().split("T")[0];
    },
    endDate() {
      return new Date().toISOString().split("T")[0];
    },
  },
  onLoad() {
    if (!this.hasLogin) {
      uni.showModal({
        title: "提示",
        content: "您尚未登录，登录后才能发布捞人信息。",
        showCancel: false,
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/login/login?redirect=/subpages/resources/publish-salvage",
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
    onDateChange(e) {
      this.formData.date = e.detail.value;
    },
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    viewPlatformTerms() {
      uni.showToast({ title: "查看平台使用条款（待实现）", icon: "none" });
    },
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 3 - this.formData.images.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
        });
        this.formData.images = [...this.formData.images, ...res.tempFilePaths];
      } catch (error) {
        console.error("选择图片失败:", error);
      }
    },
    deleteImage(index) {
      this.formData.images.splice(index, 1);
    },
    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入标题", icon: "none" });
        return false;
      }
      if (this.formData.title.trim().length < 5) {
        uni.showToast({ title: "标题至少5个字", icon: "none" });
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
      if (!this.formData.location.trim()) {
        uni.showToast({ title: "请输入地点", icon: "none" });
        return false;
      }
      if (!this.formData.date) {
        uni.showToast({ title: "请选择日期", icon: "none" });
        return false;
      }
      if (!this.formData.contactInfo.trim()) {
        uni.showToast({ title: "请输入联系方式", icon: "none" });
        return false;
      }
      if (!this.isAgreed) {
        uni.showToast({ title: "请先阅读并同意相关平台条款", icon: "none" });
        return false;
      }
      return true;
    },
    async submitSalvageRequest() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({ title: "正在发布..." });

      const submissionData = {
        type: "salvage",
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        location: this.formData.location.trim(),
        date: this.formData.date,
        contactInfo: this.formData.contactInfo.trim(),
        images: this.formData.images,
      };

      try {
        const response = await request({
          url: "/salvage/create",
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
        console.error("捞人发布失败:", error);
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

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-row-base;
  .image-item,
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    border-radius: $uni-border-radius-base;
    overflow: hidden;
    position: relative;
  }
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .delete-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }
  .upload-btn {
    background-color: lighten($uni-bg-color-page, 3%);
    border: 1px dashed $uni-border-color;
    display: flex;
    align-items: center;
    justify-content: center;
    .upload-icon {
      font-size: 60rpx;
      color: $uni-text-color-grey;
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
