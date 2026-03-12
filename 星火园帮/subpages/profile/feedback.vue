<template>
  <view class="feedback-container page-container">
    <view class="feedback-tips card rounded-lg shadow-base">
      <text class="tip-icon">💡</text>
      <text
        >我们非常重视您的每一个建议和遇到的问题，请详细描述，我们会尽快处理！</text
      >
    </view>

    <form @submit="submitFeedback">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label"
            >反馈内容 <text class="required-star">*</text></text
          >
          <textarea
            class="textarea-field rounded-base"
            name="content"
            v-model="formData.content"
            placeholder="请详细描述您遇到的问题或建议..."
            maxlength="1000"
            auto-height
          />
          <view class="char-counter">{{ formData.content.length }}/1000</view>
        </view>

        <view class="form-item">
          <text class="item-label">相关截图 (可选，最多3张)</text>
          <view class="image-uploader">
            <view class="image-preview-list">
              <view
                class="image-preview-item"
                v-for="(image, index) in formData.images"
                :key="index"
              >
                <image
                  :src="image"
                  mode="aspectFill"
                  @click="previewImage(index)"
                ></image>
                <view class="remove-image-btn" @click="removeImage(index)">
                  <text class="uni-icon uni-icon-closeempty"></text>
                </view>
              </view>
              <view
                class="add-image-btn"
                @click="chooseImages"
                v-if="formData.images.length < 3"
              >
                <text class="uni-icon uni-icon-plusempty"></text>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">联系方式 (选填)</text>
          <input
            class="input-field rounded-base"
            name="contact"
            v-model="formData.contact"
            placeholder="手机 / QQ / 微信，方便我们与您联系"
            maxlength="50"
          />
        </view>
      </view>

      <button
        form-type="submit"
        class="submit-btn button-primary rounded-pill shadow-base"
        :loading="isLoading"
        :disabled="isLoading"
      >
        提交反馈
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
        content: "",
        images: [],
        contact: "",
      },
      isLoading: false,
    };
  },
  computed: {
    ...mapState({
      vuex_userInfo: (state) => state.userInfo || {},
      hasLogin: (state) => state.hasLogin,
    }),
  },
  methods: {
    // 获取设备信息
    getDeviceInfo() {
      try {
        // 尝试使用新的API
        const deviceInfo = uni.getDeviceInfo();
        const windowInfo = uni.getWindowInfo();
        const appBaseInfo = uni.getAppBaseInfo();
        return {
          ...deviceInfo,
          ...windowInfo,
          ...appBaseInfo,
        };
      } catch (error) {
        try {
          // 如果新API不可用，使用旧API
          return uni.getSystemInfoSync();
        } catch (e) {
          console.warn("无法获取设备信息");
          return {};
        }
      }
    },
    chooseImages() {
      const currentCount = this.formData.images.length;
      const remainingCount = 3 - currentCount;
      if (remainingCount <= 0) {
        uni.showToast({ title: "最多上传3张图片", icon: "none" });
        return;
      }

      uni.chooseImage({
        count: remainingCount,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.formData.images = [
            ...this.formData.images,
            ...res.tempFilePaths,
          ];
        },
        fail: (err) => {
          if (err.errMsg !== "chooseImage:fail cancel") {
            console.error("chooseImage failed:", err);
            uni.showToast({ title: "选择图片失败", icon: "none" });
          }
        },
      });
    },
    removeImage(index) {
      this.formData.images.splice(index, 1);
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images,
        current: index,
      });
    },
    validateForm() {
      if (!this.formData.content.trim()) {
        uni.showToast({ title: "请输入反馈内容", icon: "none" });
        return false;
      }
      if (this.formData.content.trim().length < 10) {
        uni.showToast({ title: "反馈内容至少10个字", icon: "none" });
        return false;
      }
      return true;
    },
    async submitFeedback() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        // 1. 如果有图片，先上传图片获取URL
        const uploadedImageUrls = [];
        if (this.formData.images.length > 0) {
          uni.showLoading({ title: "正在上传图片..." });

          for (const imagePath of this.formData.images) {
            try {
              const uploadResult = await new Promise((resolve, reject) => {
                uni.uploadFile({
                  url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/feedback",
                  filePath: imagePath,
                  name: "file",
                  success: resolve,
                  fail: reject,
                });
              });

              const responseData = JSON.parse(uploadResult.data);
              if (responseData && responseData.url) {
                uploadedImageUrls.push(responseData.url);
              }
            } catch (uploadError) {
              console.error("图片上传失败:", uploadError);
              uni.showToast({ title: "图片上传失败", icon: "none" });
            }
          }

          uni.hideLoading();
        }

        const submissionData = {
          content: this.formData.content.trim(),
          contact: this.formData.contact.trim() || null,
          imageUrls: uploadedImageUrls,
          userId: this.vuex_userInfo.id || null,
          deviceInfo: this.getDeviceInfo(),
        };

        console.log("Submitting feedback data:", submissionData);

        // 2. 提交反馈内容到后端
        const result = await request({
          url: "/feedback",
          method: "POST",
          data: submissionData,
        });

        console.log("Feedback submission result:", result);

        uni.showToast({
          title: "反馈提交成功！感谢您的支持",
          icon: "success",
          duration: 2000,
        });

        // 提交成功后，清空表单并返回上一页
        setTimeout(() => {
          this.formData.content = "";
          this.formData.images = [];
          this.formData.contact = "";
          uni.navigateBack();
        }, 2000);
      } catch (error) {
        console.error("Feedback submission failed:", error);
        uni.showToast({ title: "提交失败，请稍后再试", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.feedback-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}

.feedback-tips {
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  margin-bottom: $uni-spacing-row-lg;
  display: flex;
  align-items: flex-start;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  background-color: lighten($uni-color-primary, 45%);
  border: 1px solid lighten($uni-color-primary, 35%);

  .tip-icon {
    font-size: $uni-font-size-lg;
    margin-right: $uni-spacing-col-sm;
    line-height: 1.5;
  }
}

.form-section {
  padding: $uni-spacing-col-lg;
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: $uni-spacing-row-lg * 1.2;

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
  .textarea-field {
    background-color: $uni-bg-color-grey;
    border: 1px solid $uni-border-color-light;
    padding: 20rpx;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    border-radius: $uni-border-radius-base;
    width: 100%;
    box-sizing: border-box;

    &:focus {
      border-color: $uni-color-primary;
      background-color: $uni-bg-color;
    }
  }

  .input-field {
    height: 80rpx;
    padding: 0 $uni-spacing-col-base;
    line-height: 80rpx;
  }

  .textarea-field {
    min-height: 240rpx;
    line-height: 1.6;
  }

  .char-counter {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-placeholder;
    text-align: right;
    margin-top: $uni-spacing-row-sm;
  }
}

.image-uploader {
  .image-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: $uni-spacing-col-base;
  }

  .image-preview-item,
  .add-image-btn {
    width: 180rpx;
    height: 180rpx;
    border-radius: $uni-border-radius-base;
    background-color: $uni-bg-color-grey;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    image {
      width: 100%;
      height: 100%;
      border-radius: $uni-border-radius-base;
    }
  }

  .add-image-btn {
    border: 1px dashed $uni-border-color;
    cursor: pointer;
    .uni-icon-plusempty {
      font-size: 60rpx;
      color: $uni-text-color-placeholder;
    }
    &:active {
      background-color: darken($uni-bg-color-grey, 5%);
    }
  }

  .remove-image-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    .uni-icon-closeempty {
      font-size: 28rpx;
    }
  }
}

.submit-btn {
  background-color: $uni-color-primary;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  padding: 22rpx 0;
  border-radius: $uni-border-radius-pill;
  text-align: center;
  line-height: normal;
  margin-top: $uni-spacing-row-lg * 1.5;
  width: 100%;

  &:active {
    background-color: darken($uni-color-primary, 10%);
  }
  &[disabled] {
    background-color: lighten($uni-color-primary, 20%) !important;
    color: rgba(255, 255, 255, 0.7) !important;
  }
}

.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  margin-bottom: $uni-spacing-row-lg;
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
