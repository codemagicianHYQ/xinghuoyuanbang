<template>
  <view class="publish-express-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">📦</view>
      <view class="title-content">
        <view class="page-title">发布快递代取</view>
        <view class="page-subtitle">快递到了没时间取？找小伙伴帮忙！</view>
      </view>
    </view>

    <form @submit="submitExpressTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📦</text>
            <text class="item-label"
              >快递平台 <text class="required-star">*</text></text
            >
          </view>
          <picker :range="expressPlatforms" @change="bindPlatformChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.platform || "请选择快递平台" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <!-- 快递图片上传区域 -->
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📷</text>
            <text class="item-label">快递图片</text>
          </view>
          <view class="image-upload-section">
            <view class="image-grid">
              <view
                class="image-item"
                v-for="(image, index) in formData.images"
                :key="index"
              >
                <image :src="image" mode="aspectFill" class="preview-image" />
                <view class="image-actions">
                  <text class="action-btn" @click="previewImage(index)">👁</text>
                  <text class="action-btn delete" @click="deleteImage(index)"
                    >🗑</text
                  >
                </view>
              </view>
              <view
                class="add-image-btn"
                v-if="formData.images.length < 6"
                @click="chooseImages"
              >
                <text class="add-icon">+</text>
                <text class="add-text">添加图片</text>
              </view>
            </view>
            <text class="upload-tip"
              >最多上传6张图片，可上传快递单号、取件码等</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🔢</text>
            <text class="item-label"
              >取件码/手机尾号 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.pickupCode"
            placeholder="如：1-2-3456 或 手机尾号8888"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label"
              >取件地点 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.pickupLocation"
            placeholder="如：菜鸟驿站、顺丰快递柜等"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddressForPickup"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocationForPickup"
              >地图选择</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏠</text>
            <text class="item-label"
              >送达地址 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.deliveryAddress"
            placeholder="如：5号宿舍楼302室"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddress"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocation">地图选择</text>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⏰</text>
            <text class="item-label"
              >期望送达时间 <text class="required-star">*</text></text
            >
          </view>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.expectedDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.expectedDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.expectedTime"
              @change="bindTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.expectedTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📏</text>
            <text class="item-label">包裹大小</text>
          </view>
          <view class="radio-group">
            <label
              class="radio-item"
              v-for="size in packageSizes"
              :key="size.value"
            >
              <radio
                :value="size.value"
                :checked="formData.packageSize === size.value"
                @click="selectPackageSize(size.value)"
              />
              <text>{{ size.label }}</text>
            </label>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">💰</text>
            <text class="item-label">
              报酬 (元)
              <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.reward"
            placeholder="建议金额2元以上"
          />
        </view>
      </view>

      <view
        class="submit-btn express-btn rounded-full"
        @click="submitExpressTask"
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
import publishGate from "@/mixins/publishGate.js";

export default {
  components: { PublishButton },
  mixins: [publishGate],
  data() {
    const now = new Date();
    return {
      formData: {
        platform: "",
        pickupCode: "",
        pickupLocation: "",
        deliveryAddress: "",
        expectedDate: now.toISOString().split("T")[0],
        expectedTime: new Date(now.getTime() + 30 * 60000)
          .toTimeString()
          .slice(0, 5),
        packageSize: "中件",
        reward: "",
        images: [], // 快递图片数组
      },
      expressPlatforms: [
        "顺丰",
        "圆通",
        "中通",
        "申通",
        "韵达",
        "京东",
        "菜鸟驿站",
        "其他",
      ],
      packageSizes: [
        { value: "小件", label: "小件" },
        { value: "中件", label: "中件" },
        { value: "大件", label: "大件" },
      ],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  onLoad() {
    if (!this.ensureLogin()) return;
    this.checkCommunitySelection();
  },
  onShow() {
    // 检查是否有选中的地址
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData) {
      if (selectedAddressData.target === "pickup") {
        this.formData.pickupLocation = selectedAddressData.address;
      } else if (selectedAddressData.target === "delivery") {
        this.formData.deliveryAddress = selectedAddressData.address;
      }

      // 清除本地存储
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    // 图片上传相关方法
    chooseImages() {
      const remainCount = 6 - this.formData.images.length;
      uni.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.formData.images = [
            ...this.formData.images,
            ...res.tempFilePaths,
          ];
        },
        fail: (err) => {
          // 检查是否是用户取消了选择
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            console.error("选择图片失败:", err);
            uni.showToast({
              title: "选择图片失败",
              icon: "none",
            });
          }
        },
      });
    },

    async uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `https://xinghuoyuanbang.top/campushelper/api/v1/upload/task`,
          filePath: filePath,
          name: "file",
          header: {
            Authorization: uni.getStorageSync("userAuthToken_xh") || "",
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.success) {
                resolve(data);
              } else {
                reject(new Error(data.message || "上传失败"));
              }
            } catch (e) {
              reject(new Error("响应解析失败: " + res.data));
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },

    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images,
        current: index,
      });
    },

    deleteImage(index) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            this.formData.images.splice(index, 1);
          }
        },
      });
    },

    bindPlatformChange(e) {
      this.formData.platform = this.expressPlatforms[e.detail.value];
    },
    bindDateChange(e) {
      this.formData.expectedDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.expectedTime = e.detail.value;
    },
    selectPackageSize(size) {
      this.formData.packageSize = size;
    },
    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=delivery`,
      });
    },

    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.deliveryAddress = address.detail;
    },

    chooseMapLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.deliveryAddress =
            (res.name ? res.name + " " : "") + (res.address || "");
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            uni.showToast({ title: "选择位置失败", icon: "none" });
          }
        },
      });
    },
    selectSavedAddressForPickup() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=pickup`,
      });
    },

    // 设置选中的取件地址（供选择地址页面调用）
    setSelectedPickupAddress(address) {
      this.formData.pickupLocation = address.detail;
    },

    chooseMapLocationForPickup() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.pickupLocation =
            (res.name ? res.name + " " : "") + (res.address || "");
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            uni.showToast({ title: "选择位置失败", icon: "none" });
          }
        },
      });
    },
    validateForm() {
      if (!this.formData.platform) {
        uni.showToast({ title: "请选择快递平台", icon: "none" });
        return false;
      }
      if (!(this.formData.pickupCode || "").trim()) {
        uni.showToast({ title: "请输入取件码", icon: "none" });
        return false;
      }
      if (!(this.formData.pickupLocation || "").trim()) {
        uni.showToast({ title: "请输入取件地点", icon: "none" });
        return false;
      }
      if (!(this.formData.deliveryAddress || "").trim()) {
        uni.showToast({ title: "请输入送达地址", icon: "none" });
        return false;
      }
      if (
        this.formData.reward === undefined ||
        this.formData.reward === null ||
        this.formData.reward === "" ||
        isNaN(parseFloat(this.formData.reward)) ||
        parseFloat(this.formData.reward) < 2
      ) {
        uni.showToast({ title: "报酬至少2元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitExpressTask() {
      if (!this.ensureLogin()) return;
      if (!this.checkCommunitySelection()) return;

      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      try {
        // 构建任务数据，但不立即发布
        const taskData = {
          title: `找小伙伴取${this.formData.platform}快递`,
          description: "请帮我取快递",
          taskType: "取快递",
          rewardAmount: parseFloat(this.formData.reward),
          locationText: (this.formData.deliveryAddress || "").trim(),
          specifics: `快递平台: ${this.formData.platform}\n取件码: ${
            this.formData.pickupCode
          }\n取件地点: ${this.formData.pickupLocation}\n送达地址: ${
            this.formData.deliveryAddress
          }\n期望送达: ${this.formData.expectedDate} ${
            this.formData.expectedTime
          }\n包裹大小: ${this.formData.packageSize || "中件"}`,
          images: this.formData.images, // 传递临时图片路径，在支付成功后上传
          // 支付相关信息
          paymentAmount: parseFloat(this.formData.reward),
          paymentDescription: "取快递任务赏金",
        };

        // 跳转到发布确认页面
        uni.navigateTo({
          url: `/subpages/publish/publish-confirm?taskData=${encodeURIComponent(
            JSON.stringify(taskData)
          )}`,
        });
      } catch (error) {
        let msg = error && error.message ? error.message : "准备发布失败";
        if (error && error.data && error.data.message) msg = error.data.message;
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-express-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

/* 图片上传样式 */
.image-upload-section {
  margin-top: 16rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 4rpx;
  padding: 4rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 0 0 12rpx;
}

.action-btn {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 20rpx;
  cursor: pointer;
}

.action-btn.delete {
  background: #ff4757;
  color: white;
}

.add-image-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-image-btn:active {
  background: #f0f0f0;
  border-color: #4a90e2;
}

.add-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: #999;
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 20rpx;
  color: #666;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.publish-express-container {
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(78, 205, 196, 0.2);
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
  border: 1px solid rgba(78, 205, 196, 0.1);
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
    background: linear-gradient(135deg, #f8fdff 0%, #e8f4f8 100%);
    border: 2px solid #b3e5fc;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #4ecdc4;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
      box-shadow: 0 0 0 4rpx rgba(78, 205, 196, 0.1);
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
    gap: 16rpx;
    .time-picker-item {
      flex: 1;
    }
  }

  .radio-group {
    display: flex;
    gap: 24rpx;
    .radio-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 12rpx 20rpx;
      background: linear-gradient(135deg, #f8fdff 0%, #e8f4f8 100%);
      border: 2px solid #b3e5fc;
      border-radius: 12rpx;
      transition: all 0.3s ease;

      &:active {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: #ffffff;
        border-color: #4ecdc4;
      }
    }
  }

  .address-actions {
    display: flex;
    gap: 32rpx;
    margin-top: 16rpx;

    .action-link {
      color: #4ecdc4;
      font-size: 28rpx;
      text-decoration: none;
      font-weight: 500;

      &:active {
        opacity: 0.7;
      }
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

.express-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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
