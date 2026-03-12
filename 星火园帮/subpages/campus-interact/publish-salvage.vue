<template>
  <view class="salvage-publish-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="title-section">
        <text class="page-title">发布捞一捞</text>
        <text class="page-subtitle">在这里找到那个特别的TA！</text>
      </view>
    </view>

    <form @submit="submitSalvageRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🎆</text>
            <text class="item-label"
              >标题 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="请输入标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏷️</text>
            <text class="item-label">类型</text>
          </view>
          <picker :range="salvageTypes" range-key="name" @change="onTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.type ? getTypeName(formData.type) : "请选择类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label"
              >详细描述 <text class="required-star">*</text></text
            >
          </view>
          <textarea
            class="textarea-field rounded-base textarea-enhanced"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您要找的人的特征、相遇场景等信息..."
            maxlength="500"
          />
          <view class="char-count">{{ formData.description.length }}/500</view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label"
              >地点 <text class="required-star">*</text></text
            >
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
            placeholder="请输入相遇地点"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📅</text>
            <text class="item-label"
              >日期 <text class="required-star">*</text></text
            >
          </view>
          <picker mode="date" :value="formData.date" @change="onDateChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.date || "请选择相遇日期" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📞</text>
            <text class="item-label"
              >联系方式 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base contact-input"
            name="contactInfo"
            v-model="formData.contactInfo"
            placeholder="请输入您的联系方式"
            maxlength="50"
          />
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
          class="submit-btn salvage-btn rounded-full"
          @click="submitSalvageRequest"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          <text class="btn-icon">👋</text>
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
        date: "",
        contactInfo: "",
        images: [],
      },
      salvageTypes: [
        { name: "寻找同学", value: "classmate" },
        { name: "寻找朋友", value: "friend" },
        { name: "寻找恋人", value: "lover" },
        { name: "寻找室友", value: "roommate" },
        { name: "寻找社团伙伴", value: "club" },
        { name: "其他", value: "other" },
      ],
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
    isFormValid() {
      const isValid =
        this.formData.title.trim() &&
        this.formData.description.trim() &&
        this.formData.location.trim() &&
        this.formData.date &&
        this.formData.contactInfo.trim();
      console.log("表单验证详情:", {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        location: this.formData.location.trim(),
        date: this.formData.date,
        contactInfo: this.formData.contactInfo.trim(),
        isValid,
      });
      return isValid;
    },
  },
  onShow() {
    // 检查是否有选中的地址数据
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData && selectedAddressData.target === "salvage") {
      this.formData.location = selectedAddressData.address;
      // 清除存储的数据，避免影响其他页面
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    onTypeChange(e) {
      const index = e.detail.value;
      this.formData.type = this.salvageTypes[index].value;
    },
    getTypeName(value) {
      const type = this.salvageTypes.find((t) => t.value === value);
      return type ? type.name : "";
    },
    onDateChange(e) {
      this.formData.date = e.detail.value;
    },
    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=salvage`,
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
    deleteImage(index) {
      this.formData.images.splice(index, 1);
    },

    // 上传图片到服务器
    async uploadImages(tempFilePaths) {
      try {
        uni.showLoading({ title: "上传中..." });

        const uploadPromises = tempFilePaths.map((filePath) =>
          this.uploadSingleImage(filePath)
        );
        const results = await Promise.all(uploadPromises);

        uni.hideLoading();
        return results
          .filter((result) => result.success)
          .map((result) => result.url);
      } catch (error) {
        uni.hideLoading();
        console.error("批量上传图片失败:", error);
        throw error;
      }
    },

    // 上传单张图片
    async uploadSingleImage(filePath) {
      try {
        console.log("捞一捞页面 - 开始上传图片:", filePath);
        console.log("捞一捞页面 - 上传URL:", `${baseURL}/upload?type=campus`);

        const uploadResult = await uni.uploadFile({
          url: `${baseURL}/upload/campus`, // 使用专用接口，与二手市集一致
          filePath: filePath,
          name: "file",
          header: {
            Authorization: uni.getStorageSync("userAuthToken_xh") || "",
          },
        });

        console.log("捞一捞页面 - 上传结果:", uploadResult);

        // 处理 uni.uploadFile 返回的数组格式
        let actualResult;
        if (Array.isArray(uploadResult) && uploadResult.length === 2) {
          actualResult = uploadResult[1]; // 取数组的第二个元素
          console.log(
            "捞一捞页面 - 检测到数组格式，使用第二个元素:",
            actualResult
          );
        } else {
          actualResult = uploadResult;
          console.log("捞一捞页面 - 使用原始结果:", actualResult);
        }

        console.log("捞一捞页面 - 响应状态码:", actualResult.statusCode);
        console.log("捞一捞页面 - 响应数据:", actualResult.data);
        console.log("捞一捞页面 - 响应头:", actualResult.header);

        // 检查响应数据是否有效
        if (!actualResult.data) {
          console.error("捞一捞页面 - 服务器响应为空，完整响应:", actualResult);
          throw new Error("服务器响应为空");
        }

        let response;
        try {
          response = JSON.parse(actualResult.data);
          console.log("捞一捞页面 - 解析后的响应:", response);
        } catch (parseError) {
          console.error("捞一捞页面 - JSON解析失败:", actualResult.data);
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
    async submitSalvageRequest() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布失物招领")) {
        return;
      }

      console.log("表单验证状态:", this.isFormValid);
      console.log("表单数据:", this.formData);
      console.log("是否正在提交:", this.isSubmitting);

      if (this.isSubmitting) {
        console.log("正在提交中，请稍候");
        return;
      }

      if (!this.isFormValid) {
        console.log("表单验证失败");
        // 检查具体哪些字段缺失
        const missingFields = [];
        if (!this.formData.title.trim()) missingFields.push("标题");
        if (!this.formData.description.trim()) missingFields.push("详细描述");
        if (!this.formData.location.trim()) missingFields.push("地点");
        if (!this.formData.date) missingFields.push("日期");
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

      // 先上传图片
      let uploadedImages = [];
      if (this.formData.images && this.formData.images.length > 0) {
        try {
          uploadedImages = await this.uploadImages(this.formData.images);
        } catch (error) {
          console.error("图片上传失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: "图片上传失败",
            icon: "none",
          });
          this.isSubmitting = false;
          return;
        }
      }

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        this.isSubmitting = false;
        return;
      }

      const submissionData = {
        type: "salvage",
        title: this.formData.title?.trim() || "",
        description: this.formData.description?.trim() || "",
        location: this.formData.location?.trim() || "",
        date: this.formData.date || null,
        contactInfo: this.formData.contactInfo?.trim() || "",
        images: uploadedImages, // 使用上传后的图片URL
        communityId: currentCommunity.id, // 添加社区ID
      };

      try {
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
        console.error("捞人发布失败:", error);
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

.salvage-publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  padding: 0;
  padding-bottom: 200rpx;
}

// 顶部装饰区域
.header-decoration {
  position: relative;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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
  border: 2px solid #b3e5fc;
  background-color: #f8fdff;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  box-sizing: border-box;
  transition: all 0.3s ease;
  min-height: 88rpx;

  &:focus {
    border-color: #4ecdc4;
    background-color: #ffffff;
    box-shadow: 0 0 0 4rpx rgba(78, 205, 196, 0.1);
  }

  &::placeholder {
    color: #81d4fa;
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
    color: #4ecdc4;
    font-size: 28rpx;
    text-decoration: none;
    font-weight: 500;
    padding: 8rpx 0;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;

    &:active {
      color: #26c6da;
      border-bottom-color: #26c6da;
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
  color: #81d4fa;
  margin-top: 8rpx;
}

.picker {
  padding: 24rpx;
  border: 2px solid #b3e5fc;
  background-color: #f8fdff;
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
      color: #81d4fa;
      font-size: 24rpx;
    }
  }

  &:focus {
    border-color: #4ecdc4;
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
  background: linear-gradient(45deg, #f8fdff 0%, #e1f5fe 100%);
}

.contact-input {
  background: linear-gradient(45deg, #f8fdff 0%, #e0f2f1 100%);
}

.image-uploader {
  display: flex;
  flex-wrap: nowrap; /* 不换行，强制一排显示 */
  gap: 8rpx; /* 减小间距 */
  .image-item,
  .upload-btn {
    width: calc(33.333% - 6rpx); /* 使用百分比宽度，三张图片各占1/3 */
    height: 160rpx; /* 保持高度 */
    border-radius: $uni-border-radius-base;
    overflow: hidden;
    position: relative;
    flex-shrink: 0; /* 防止压缩 */
  }

  .upload-btn {
    background-color: #f8fdff;
    border: 2px dashed #b3e5fc;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      border-color: #4ecdc4;
      background-color: #e0f2f1;
    }

    .upload-icon {
      font-size: 60rpx;
      color: #81d4fa;
    }
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

  &.salvage-btn {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(78, 205, 196, 0.4);

    &:not(:disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.4);
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

.rounded-lg {
  border-radius: 24rpx;
}

.shadow-base {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}
</style>
