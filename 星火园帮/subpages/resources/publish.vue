<template>
  <view class="publish-container">
    <form @submit="submitResource">
      <!-- 基本信息 -->
      <view class="form-section card">
        <view class="form-item">
          <text class="item-label"
            >资源类型 <text class="required">*</text></text
          >
          <picker
            class="picker"
            :range="resourceTypes"
            range-key="name"
            @change="onTypeChange"
          >
            <view class="picker-value">
              {{
                formData.type ? getTypeName(formData.type) : "请选择资源类型"
              }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">标题 <text class="required">*</text></text>
          <input
            class="input-field"
            v-model="formData.title"
            placeholder="请输入资源标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">价格 <text class="required">*</text></text>
          <input
            class="input-field"
            type="digit"
            v-model="formData.price"
            placeholder="请输入价格"
          />
        </view>

        <view class="form-item">
          <text class="item-label">成色 <text class="required">*</text></text>
          <picker
            class="picker"
            :range="conditions"
            @change="onConditionChange"
          >
            <view class="picker-value">
              {{ formData.condition || "请选择成色" }}
            </view>
          </picker>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="form-section card">
        <text class="section-title"
          >上传图片 <text class="required">*</text></text
        >
        <text class="section-subtitle">最多上传9张图片</text>
        <view class="uploader-container">
          <view
            class="image-item"
            v-for="(image, index) in formData.images"
            :key="index"
          >
            <image
              class="preview-image"
              :src="image"
              mode="aspectFill"
              @click="previewImage(index)"
            />
            <text class="delete-btn" @click="deleteImage(index)">×</text>
          </view>
          <view
            class="upload-btn"
            v-if="formData.images.length < 9"
            @click="chooseImage"
          >
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
      </view>

      <!-- 详细描述 -->
      <view class="form-section card">
        <text class="section-title"
          >详细描述 <text class="required">*</text></text
        >
        <textarea
          class="textarea-field"
          v-model="formData.description"
          placeholder="请详细描述资源的具体情况，如使用年限、新旧程度、是否有瑕疵等"
          maxlength="500"
        />
        <text class="word-count">{{ formData.description.length }}/500</text>
      </view>

      <!-- 联系方式 -->
      <view class="form-section card">
        <text class="section-title"
          >联系方式 <text class="required">*</text></text
        >
        <input
          class="input-field"
          v-model="formData.contact"
          placeholder="请输入您的联系方式（如：微信/QQ）"
          maxlength="50"
        />
      </view>

      <!-- 协议同意 -->
      <view class="agreement-section">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox
              :value="true"
              :checked="isAgreed"
              color="#2979ff"
              style="transform: scale(0.8)"
            />
            <text>我已阅读并同意</text>
          </label>
        </checkbox-group>
        <text class="link-text" @click="viewAgreement">《平台交易协议》</text>
      </view>

      <!-- 提交按钮 -->
      <button
        class="submit-btn"
        form-type="submit"
        :disabled="!isAgreed || isSubmitting"
        :loading="isSubmitting"
      >
        发布资源
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
        type: "",
        title: "",
        price: "",
        condition: "",
        images: [],
        description: "",
        contact: "",
      },
      resourceTypes: [
        { id: "books", name: "图书教材" },
        { id: "daily", name: "日常用品" },
        { id: "electronics", name: "数码电子" },
        { id: "other", name: "其他" },
      ],
      conditions: ["全新", "九成新", "八成新", "七成新", "六成新及以下"],
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
        content: "请先登录后再发布资源",
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/login/login",
            });
          } else {
            uni.navigateBack();
          }
        },
      });
    }
  },
  methods: {
    getTypeName(typeId) {
      const type = this.resourceTypes.find((t) => t.id === typeId);
      return type ? type.name : "";
    },
    onTypeChange(e) {
      this.formData.type = this.resourceTypes[e.detail.value].id;
    },
    onConditionChange(e) {
      this.formData.condition = this.conditions[e.detail.value];
    },
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 9 - this.formData.images.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
        });
        this.formData.images = [...this.formData.images, ...res.tempFilePaths];
      } catch (error) {
        console.log("选择图片失败", error);
      }
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images,
        current: this.formData.images[index],
      });
    },
    deleteImage(index) {
      this.formData.images.splice(index, 1);
    },
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    viewAgreement() {
      uni.navigateTo({
        url: "/pages/agreement/agreement",
      });
    },
    validateForm() {
      if (!this.formData.type) {
        uni.showToast({
          title: "请选择资源类型",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.title.trim()) {
        uni.showToast({
          title: "请输入资源标题",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.price) {
        uni.showToast({
          title: "请输入价格",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.condition) {
        uni.showToast({
          title: "请选择成色",
          icon: "none",
        });
        return false;
      }
      if (this.formData.images.length === 0) {
        uni.showToast({
          title: "请至少上传一张图片",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({
          title: "请输入详细描述",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.contact.trim()) {
        uni.showToast({
          title: "请输入联系方式",
          icon: "none",
        });
        return false;
      }
      if (!this.isAgreed) {
        uni.showToast({
          title: "请阅读并同意平台交易协议",
          icon: "none",
        });
        return false;
      }
      return true;
    },
    async submitResource() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布资源")) {
        return;
      }

      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({
        title: "正在发布...",
      });

      try {
        // 模拟上传图片
        const uploadedImages = await Promise.all(
          this.formData.images.map(async (image) => {
            // 实际项目中应该调用上传API
            return image;
          })
        );

        const submitData = {
          ...this.formData,
          images: uploadedImages,
        };

        // 模拟提交
        await new Promise((resolve) => setTimeout(resolve, 1500));

        uni.hideLoading();
        uni.showToast({
          title: "发布成功",
          icon: "success",
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.hideLoading();
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

.publish-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding: $uni-spacing-col-base;
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
}

.form-section {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  margin-bottom: $uni-spacing-row-lg;
}

.section-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: bold;
  margin-bottom: $uni-spacing-row-sm;
}

.section-subtitle {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  margin-bottom: $uni-spacing-row-base;
}

.form-item {
  margin-bottom: $uni-spacing-row-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-sm;
  display: block;

  .required {
    color: $uni-color-error;
    margin-left: 4rpx;
  }
}

.input-field {
  width: 100%;
  height: 88rpx;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  padding: 0 $uni-spacing-col-base;
  font-size: $uni-font-size-base;
}

.picker {
  width: 100%;
  height: 88rpx;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  padding: 0 $uni-spacing-col-base;
}

.picker-value {
  height: 88rpx;
  line-height: 88rpx;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.uploader-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $uni-spacing-col-base;
  margin-top: $uni-spacing-row-base;
}

.image-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
}

.delete-btn {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  z-index: 1;
}

.upload-btn {
  width: 100%;
  padding-bottom: 100%;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48rpx;
  color: $uni-text-color-grey;
}

.upload-text {
  position: absolute;
  top: calc(50% + 30rpx);
  left: 50%;
  transform: translateX(-50%);
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.textarea-field {
  width: 100%;
  height: 240rpx;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  padding: $uni-spacing-col-base;
  font-size: $uni-font-size-base;
  margin-bottom: $uni-spacing-row-sm;
}

.word-count {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  text-align: right;
}

.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $uni-spacing-row-lg 0;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.agreement-label {
  display: flex;
  align-items: center;
}

.link-text {
  color: $uni-color-primary;
  margin-left: 4rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border-radius: $uni-border-radius-pill;
  font-size: $uni-font-size-base;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $uni-spacing-row-lg;

  &[disabled] {
    background-color: $uni-color-primary-light;
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
