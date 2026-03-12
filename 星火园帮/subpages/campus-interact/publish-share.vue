<template>
  <view class="share-publish-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="title-section">
        <text class="page-title">发布分享</text>
        <text class="page-subtitle">分享你的精彩瞬间，让更多人看到！</text>
      </view>
    </view>

    <form @submit="submitShareRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📝</text>
            <text class="item-label">
              分享标题 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.title"
            placeholder="请输入分享标题"
            maxlength="50"
          />
          <text class="char-count">{{ formData.title.length }}/50</text>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">🏷️</text>
            <text class="item-label">
              分享类型 <text class="required-star">*</text>
            </text>
          </view>
          <picker
            :range="shareTypes"
            range-key="label"
            @change="onShareTypeChange"
          >
            <view class="picker-value input-imitation rounded-base">
              {{ selectedShareType.label }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📝</text>
            <text class="item-label">
              分享内容 <text class="required-star">*</text>
            </text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.content"
            placeholder="请详细描述你要分享的内容..."
            maxlength="1000"
          ></textarea>
          <text class="char-count">{{ formData.content.length }}/1000</text>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📍</text>
            <text class="item-label">分享地点</text>
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
            class="input-field rounded-base"
            v-model="formData.location"
            placeholder="请输入分享地点（可选）"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📷</text>
            <text class="item-label">分享图片</text>
          </view>
          <view class="image-upload-section">
            <view class="upload-btn" @click="chooseImage">
              <text class="upload-icon">📷</text>
              <text class="upload-text">选择图片</text>
            </view>
            <view class="image-preview" v-if="formData.images.length > 0">
              <view
                class="image-item"
                v-for="(image, index) in formData.images"
                :key="index"
              >
                <image :src="image" mode="aspectFill" class="preview-image" />
                <view class="delete-btn" @click="removeImage(index)">×</view>
              </view>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">🏷️</text>
            <text class="item-label">标签</text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.tags"
            placeholder="请输入标签，用逗号分隔（可选）"
          />
        </view>
      </view>
    </form>

    <!-- 底部发布按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn share-btn rounded-full"
        @click="submitShareRequest"
        :disabled="isSubmitting"
        :loading="isSubmitting"
      >
        <text class="btn-icon">🚀</text>
        <text class="btn-text">{{
          isSubmitting ? "发布中..." : "发布分享"
        }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import config from "@/common/config.js";

const baseURL = config.baseURL;

export default {
  data() {
    return {
      isSubmitting: false,
      formData: {
        title: "",
        shareType: "",
        content: "",
        location: "",
        images: [],
        tags: "",
      },
      shareTypes: [
        { label: "生活分享", value: "life" },
        { label: "学习心得", value: "study" },
        { label: "美食推荐", value: "food" },
        { label: "旅行见闻", value: "travel" },
        { label: "运动健身", value: "sports" },
        { label: "兴趣爱好", value: "hobby" },
        { label: "其他分享", value: "other" },
      ],
      selectedShareType: { label: "请选择分享类型", value: "" },
    };
  },
  onShow() {
    // 检查是否有选中的地址数据
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData && selectedAddressData.target === "share") {
      this.formData.location = selectedAddressData.address;
      // 清除存储的数据，避免影响其他页面
      uni.removeStorageSync("selectedAddressData");
    }
  },
  computed: {
    isFormValid() {
      return (
        this.formData.title.trim() &&
        this.selectedShareType.value &&
        this.formData.content.trim()
      );
    },
  },
  methods: {
    onShareTypeChange(e) {
      this.selectedShareType = this.shareTypes[e.detail.value];
      this.formData.shareType = this.selectedShareType.value;
    },

    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=share`,
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

    chooseImage() {
      uni.chooseImage({
        count: 9 - this.formData.images.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          // 检查返回值是否有效
          if (res && res.tempFilePaths && Array.isArray(res.tempFilePaths)) {
            this.formData.images = this.formData.images.concat(
              res.tempFilePaths
            );
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
        console.log("开始上传图片:", filePath);
        console.log("上传URL:", `${baseURL}/upload/campus`);

        const uploadResult = await uni.uploadFile({
          url: `${baseURL}/upload/campus`, // 使用专用接口，与二手市集一致
          filePath: filePath,
          name: "file",
          header: {
            "Content-Type": "multipart/form-data",
            Authorization: uni.getStorageSync("userAuthToken_xh") || "", // 添加Authorization头
          },
        });

        console.log("分享页面 - 上传结果:", uploadResult);

        // 处理 uni.uploadFile 返回的数组格式
        let actualResult;
        if (Array.isArray(uploadResult) && uploadResult.length === 2) {
          actualResult = uploadResult[1]; // 取数组的第二个元素
          console.log(
            "分享页面 - 检测到数组格式，使用第二个元素:",
            actualResult
          );
        } else {
          actualResult = uploadResult;
          console.log("分享页面 - 使用原始结果:", actualResult);
        }

        console.log("分享页面 - 响应状态码:", actualResult.statusCode);
        console.log("分享页面 - 响应数据:", actualResult.data);
        console.log("分享页面 - 响应头:", actualResult.header);

        // 检查响应数据是否有效
        if (!actualResult.data) {
          console.error("分享页面 - 服务器响应为空，完整响应:", actualResult);
          throw new Error("服务器响应为空");
        }

        let response;
        try {
          response = JSON.parse(actualResult.data);
          console.log("分享页面 - 解析后的响应:", response);
        } catch (parseError) {
          console.error("分享页面 - JSON解析失败:", actualResult.data);
          console.error("分享页面 - 解析错误:", parseError);
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

    removeImage(index) {
      this.formData.images.splice(index, 1);
    },

    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.location = address.address;
    },

    async submitShareRequest() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布分享")) {
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
        if (!this.formData.title.trim()) missingFields.push("分享标题");
        if (!this.formData.shareType) missingFields.push("分享类型");
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

      try {
        // 先上传图片
        let uploadedImages = [];
        if (this.formData.images && this.formData.images.length > 0) {
          uploadedImages = await this.uploadImages(this.formData.images);
        }

        const shareData = {
          type: "share",
          title: this.formData.title?.trim() || "",
          description: this.formData.content?.trim() || "",
          shareType: this.selectedShareType?.value || "",
          location: this.formData.location?.trim() || "",
          images: uploadedImages,
          communityId: currentCommunity.id, // 添加社区ID
        };

        const res = await request({
          url: "/campus-interactions",
          method: "POST",
          data: shareData,
        });

        if (res.success) {
          uni.showToast({
            title: "发布成功",
            icon: "success",
          });

          // 触发全局事件，通知列表页刷新
          uni.$emit("refreshCampusList");

          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        } else {
          uni.showToast({
            title: res.message || "发布失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("发布分享失败:", error);
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

.share-publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
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
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.4;
    }
  }
}

.form-section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(78, 205, 196, 0.1);

  .form-item {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label-with-icon {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .label-icon {
        font-size: 32rpx;
        margin-right: 12rpx;
      }

      .item-label {
        font-size: 30rpx;
        font-weight: 600;
        color: #2c3e50;

        .required-star {
          color: #e74c3c;
          margin-left: 4rpx;
        }
      }
    }

    .input-field,
    .textarea-field,
    .input-imitation {
      background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
      border: 2px solid #4dd0e1;
      font-size: 30rpx;
      color: #2c3e50;
      border-radius: 16rpx;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.3s ease;

      &:focus {
        border-color: #4ecdc4;
        background: linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%);
        box-shadow: 0 0 0 4rpx rgba(78, 205, 196, 0.1);
      }

      &::placeholder {
        color: #95a5a6;
        font-size: 28rpx;
      }
    }

    .input-field {
      padding: 24rpx;
      min-height: 88rpx;
    }

    .textarea-field {
      padding: 24rpx;
      min-height: 240rpx;
      line-height: 1.6;
      resize: none;
    }

    .input-imitation {
      padding: 24rpx;
      min-height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .picker-arrow {
        color: #95a5a6;
        font-size: 24rpx;
      }
    }

    .char-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: #95a5a6;
      margin-top: 8rpx;
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

    .image-upload-section {
      .upload-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200rpx;
        border: 2px dashed #4dd0e1;
        border-radius: 16rpx;
        background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
        transition: all 0.3s ease;

        &:active {
          border-color: #4ecdc4;
          background: linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%);
        }

        .upload-icon {
          font-size: 48rpx;
          margin-bottom: 8rpx;
        }

        .upload-text {
          font-size: 28rpx;
          color: #4ecdc4;
          font-weight: 500;
        }
      }

      .image-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-top: 16rpx;

        .image-item {
          position: relative;
          width: 200rpx;
          height: 200rpx;
          border-radius: 12rpx;
          overflow: hidden;

          .preview-image {
            width: 100%;
            height: 100%;
          }

          .delete-btn {
            position: absolute;
            top: 8rpx;
            right: 8rpx;
            width: 40rpx;
            height: 40rpx;
            background: rgba(0, 0, 0, 0.6);
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            font-weight: bold;
          }
        }
      }
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

  &.share-btn {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(78, 205, 196, 0.4);

    &:not(:disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      transform: none;
    }
  }

  .btn-icon {
    font-size: 32rpx;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
  }
}
</style>
