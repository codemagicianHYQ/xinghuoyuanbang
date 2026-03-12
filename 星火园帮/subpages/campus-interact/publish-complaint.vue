<template>
  <view class="complaint-publish-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="title-section">
        <text class="page-title">发布吐槽</text>
        <text class="page-subtitle">说出你的不满，让大家一起来吐槽！</text>
      </view>
    </view>

    <form @submit="submitComplaintRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label"
              >吐槽标题 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="请输入吐槽标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏷️</text>
            <text class="item-label">吐槽类型</text>
          </view>
          <picker
            :range="complaintTypes"
            range-key="name"
            @change="onTypeChange"
          >
            <view class="picker-value input-imitation rounded-base">
              {{
                formData.type ? getTypeName(formData.type) : "请选择吐槽类型"
              }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">💬</text>
            <text class="item-label"
              >吐槽内容 <text class="required-star">*</text></text
            >
          </view>
          <textarea
            class="textarea-field rounded-base textarea-enhanced"
            name="description"
            v-model="formData.description"
            placeholder="说出你的不满和想法，让大家一起来吐槽..."
            maxlength="500"
          />
          <view class="char-count">{{ formData.description.length }}/500</view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label">相关地点</text>
          </view>
          <view class="address-actions">
            <view class="action-link" @click="selectSavedAddress">
              选择常用地址
            </view>
            <view class="action-link" @click="chooseMapLocation">
              地图选择
            </view>
          </view>
          <input
            class="input-field rounded-base location-input"
            name="location"
            v-model="formData.location"
            placeholder="可选，相关地点或场所"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🕵️</text>
            <text class="item-label">是否匿名</text>
          </view>
          <checkbox-group @change="onAnonymousChange">
            <label class="checkbox-label">
              <checkbox
                :value="true"
                :checked="formData.isAnonymous"
                color="#74b9ff"
                style="transform: scale(0.8)"
              />
              <text>匿名发布（不显示个人信息）</text>
            </label>
          </checkbox-group>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📷</text>
            <text class="item-label">上传图片 (最多3张)</text>
          </view>
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

      <view class="submit-section">
        <button
          class="submit-btn complaint-btn rounded-full"
          @click="submitComplaintRequest"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          <text class="btn-icon">🗣️</text>
          <text class="btn-text">{{
            isSubmitting ? "发布中..." : "立即发布"
          }}</text>
        </button>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import config from "@/common/config.js";

const baseURL = config.baseURL;
import { mapState } from "vuex";

export default {
  data() {
    return {
      formData: {
        title: "",
        type: "",
        description: "",
        location: "",
        isAnonymous: false,
        images: [],
      },
      complaintTypes: [
        { id: "food", name: "食堂餐饮" },
        { id: "dorm", name: "宿舍生活" },
        { id: "course", name: "课程教学" },
        { id: "facility", name: "校园设施" },
        { id: "service", name: "校园服务" },
        { id: "transport", name: "交通出行" },
        { id: "other", name: "其他吐槽" },
      ],
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
    isFormValid() {
      return this.formData.title.trim() && this.formData.description.trim();
    },
  },
  onLoad() {
    if (!this.hasLogin) {
      uni.showModal({
        title: "提示",
        content: "您尚未登录，登录后才能发布吐槽。",
        showCancel: false,
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/login/login?redirect=/subpages/campus-interact/publish-complaint",
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
  onShow() {
    // 检查是否有选中的地址数据
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData && selectedAddressData.target === "complaint") {
      this.formData.location = selectedAddressData.address;
      // 清除存储的数据，避免影响其他页面
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    getTypeName(typeId) {
      const type = this.complaintTypes.find((t) => t.id === typeId);
      return type ? type.name : "";
    },
    onTypeChange(e) {
      this.formData.type = this.complaintTypes[e.detail.value].id;
    },
    onAnonymousChange(e) {
      this.formData.isAnonymous = e.detail.value.length > 0;
    },
    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=complaint`,
      });
    },
    chooseMapLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.location =
            (res.name ? res.name + " " : "") + (res.address || "");
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            uni.showToast({ title: "选择位置失败", icon: "none" });
          }
        },
      });
    },
    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.location = address.address;
    },
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.formData.images.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          // 检查返回值是否有效
          if (res && res.tempFilePaths && Array.isArray(res.tempFilePaths)) {
            this.formData.images = [
              ...this.formData.images,
              ...res.tempFilePaths,
            ];
          }
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          // 根据错误类型给出不同的提示
          if (err.errMsg && err.errMsg.includes("cancel")) {
            // 用户取消选择，不显示错误提示
            return;
          } else if (err.errMsg && err.errMsg.includes("auth")) {
            uni.showModal({
              title: "权限提示",
              content: "需要相机和相册权限才能上传图片，请在设置中开启权限",
              showCancel: false,
            });
          } else {
            uni.showToast({
              title: "选择图片失败",
              icon: "none",
            });
          }
        },
      });
    },

    // 上传图片到服务器（在提交时调用）
    async uploadImages(tempFilePaths) {
      try {
        uni.showLoading({ title: "上传中..." });

        const uploadPromises = tempFilePaths.map((filePath) =>
          this.uploadSingleImage(filePath)
        );
        const results = await Promise.all(uploadPromises);

        // 过滤掉上传失败的图片
        const successUrls = results.filter((result) => result && result.url);

        uni.hideLoading();
        if (successUrls.length !== tempFilePaths.length) {
          uni.showToast({
            title: `部分图片上传失败`,
            icon: "none",
          });
        }

        return successUrls.map((result) => result.url);
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: "上传失败",
          icon: "none",
        });
        console.error("批量上传失败:", error);
        return [];
      }
    },

    // 上传单张图片
    async uploadSingleImage(filePath) {
      try {
        const uploadResult = await uni.uploadFile({
          url: `${baseURL}/upload/campus`, // 使用专用接口，与二手市集一致
          filePath: filePath,
          name: "file",
          header: {
            "Content-Type": "multipart/form-data",
            Authorization: uni.getStorageSync("userAuthToken_xh") || "", // 添加Authorization头
          },
        });

        // 处理 uni.uploadFile 返回的数组格式
        let actualResult;
        if (Array.isArray(uploadResult) && uploadResult.length === 2) {
          actualResult = uploadResult[1]; // 取数组的第二个元素
        } else {
          actualResult = uploadResult;
        }

        // 检查响应数据是否有效
        if (!actualResult.data) {
          throw new Error("服务器响应为空");
        }

        let response;
        try {
          response = JSON.parse(actualResult.data);
        } catch (parseError) {
          console.error("JSON解析失败:", actualResult.data);
          throw new Error("服务器响应格式错误");
        }

        if (response.success) {
          return {
            success: true,
            url: response.data.url, // 修复：使用 response.data.url
          };
        } else {
          throw new Error(response.message || "上传失败");
        }
      } catch (error) {
        console.error("上传图片失败:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    },
    deleteImage(index) {
      this.formData.images.splice(index, 1);
    },
    async submitComplaintRequest() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布吐槽")) {
        return;
      }

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        return;
      }

      if (this.isSubmitting) {
        return;
      }

      if (!this.isFormValid) {
        // 检查具体哪些字段缺失
        const missingFields = [];
        if (!this.formData.title.trim()) missingFields.push("吐槽标题");
        if (!this.formData.complaintType) missingFields.push("投诉类型");
        if (!this.formData.description.trim()) missingFields.push("详细描述");
        if (!this.formData.location.trim()) missingFields.push("地点");
        if (!this.formData.contactInfo.trim()) missingFields.push("联系方式");

        uni.showToast({
          title: `请填写${missingFields.join("、")}`,
          icon: "none",
          duration: 3000,
        });
        return;
      }

      this.isSubmitting = true;
      uni.showLoading({ title: "正在发布..." });

      try {
        // 先上传图片
        let uploadedImages = [];
        if (this.formData.images && this.formData.images.length > 0) {
          uploadedImages = await this.uploadImages(this.formData.images);
        }

        const submissionData = {
          type: "complaint",
          title: this.formData.title?.trim() || "",
          description: this.formData.description?.trim() || "",
          location: this.formData.location?.trim() || "",
          complaintType: this.formData.type || "",
          isAnonymous: this.formData.isAnonymous || false,
          images: uploadedImages,
          communityId: currentCommunity.id, // 添加社区ID
        };

        const response = await request({
          url: "/campus-interactions",
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

          // 触发全局事件，通知列表页刷新
          uni.$emit("refreshCampusList");

          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        }
      } catch (error) {
        uni.hideLoading();
        console.error("吐槽发布失败:", error);
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

.complaint-publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4e6 100%);
  padding: 0;
  padding-bottom: 200rpx;
}

// 顶部装饰区域
.header-decoration {
  position: relative;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
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
  border: 2px solid #ffcdd2;
  background-color: #fef7f7;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  box-sizing: border-box;
  transition: all 0.3s ease;
  min-height: 88rpx;

  &:focus {
    border-color: #ff6b6b;
    background-color: #ffffff;
    box-shadow: 0 0 0 4rpx rgba(255, 107, 107, 0.1);
  }

  &::placeholder {
    color: #ffab91;
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

.address-actions {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;

  .action-link {
    color: #ff6b6b;
    font-size: 28rpx;
    text-decoration: none;
    font-weight: 500;
    padding: 8rpx 0;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;

    &:active {
      color: #ff5722;
      border-bottom-color: #ff5722;
    }
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
  color: #ffab91;
  margin-top: 8rpx;
}

.picker {
  padding: 24rpx;
  border: 2px solid #ffcdd2;
  background-color: #fef7f7;
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
      color: #ffab91;
      font-size: 24rpx;
    }
  }

  &:focus {
    border-color: #ff6b6b;
    background-color: #ffffff;
  }
}

.picker-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  flex: 1;
}

// 特殊输入框样式
.location-input {
  background: linear-gradient(45deg, #fef7f7 0%, #ffebee 100%);
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;

  text {
    margin-left: 12rpx;
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

  &.complaint-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
    color: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);

    &:not(:disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
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

.rounded-lg {
  border-radius: $uni-border-radius-lg;
}

.rounded-base {
  border-radius: $uni-border-radius-base;
}

.shadow-base {
  box-shadow: $uni-shadow-base;
}
</style>
