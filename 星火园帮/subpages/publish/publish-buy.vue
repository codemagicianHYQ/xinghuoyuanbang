<template>
  <view class="publish-buy-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">🛍️</view>
      <view class="title-content">
        <view class="page-title">发布代购任务</view>
        <view class="page-subtitle">没时间买东西？找小伙伴帮忙代购！</view>
      </view>
    </view>

    <form @submit="submitBuyTask">
      <view class="form-section card rounded-lg shadow-base">
        <!-- 购买物品图片上传区域 -->
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📷</text>
            <text class="item-label">物品图片</text>
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
              >最多上传6张图片，可上传商品图片、购物清单等</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🛒</text>
            <text class="item-label">
              购买物品 <text class="required-star">*</text>
            </text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.items"
            placeholder="请详细描述需要购买的物品，如：农夫山泉550ml*2瓶"
            maxlength="300"
            auto-height
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏪</text>
            <text class="item-label">
              购买地点 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.purchaseLocation"
            placeholder="如：学校超市、校外711便利店"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddressForPurchase"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocationForPurchase"
              >地图选择</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏠</text>
            <text class="item-label">
              送达地址 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.deliveryAddress"
            placeholder="如：3号教学楼201教室"
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
            <text class="item-label">
              期望送达时间
              <text class="required-star">*</text>
            </text>
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
            <text class="item-icon">💰</text>
            <text class="item-label">
              物品预算 (元)
              <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.budget"
            placeholder="预计物品总价，如：20"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">💸</text>
            <text class="item-label">
              跑腿费 (元)
              <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.reward"
            placeholder="建议金额3-10元"
          />
        </view>
      </view>

      <view class="submit-btn buy-btn rounded-full" @click="submitBuyTask">
        <text class="btn-icon">🚀</text>
        <text class="btn-text">立即发布</text>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { USER_AUTH_TOKEN_KEY } from "@/common/config.js";
import PublishButton from "@/components/PublishButton.vue";

export default {
  components: { PublishButton },
  data() {
    const now = new Date();
    return {
      formData: {
        items: "",
        purchaseLocation: "",
        deliveryAddress: "",
        expectedDate: now.toISOString().split("T")[0],
        expectedTime: new Date(now.getTime() + 60 * 60000)
          .toTimeString()
          .slice(0, 5),
        budget: "",
        reward: "",
        images: [], // 购买物品图片数组
      },
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  onLoad() {
    console.log(
      "帮我买页面onLoad token:",
      uni.getStorageSync(USER_AUTH_TOKEN_KEY)
    );
  },
  onShow() {
    // 检查是否有选中的地址
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData) {
      if (selectedAddressData.target === "purchase") {
        this.formData.purchaseLocation = selectedAddressData.address;
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
          console.error("选择图片失败:", err);
          uni.showToast({
            title: "选择图片失败",
            icon: "none",
          });
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

    bindDateChange(e) {
      this.formData.expectedDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.expectedTime = e.detail.value;
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
    selectSavedAddressForPurchase() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=purchase`,
      });
    },

    // 设置选中的购买地点地址（供选择地址页面调用）
    setSelectedPurchaseAddress(address) {
      this.formData.purchaseLocation = address.detail;
    },

    chooseMapLocationForPurchase() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.purchaseLocation =
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
      if (!this.formData.items.trim()) {
        uni.showToast({ title: "请输入购买物品", icon: "none" });
        return false;
      }
      if (!this.formData.purchaseLocation.trim()) {
        uni.showToast({ title: "请输入购买地点", icon: "none" });
        return false;
      }
      if (!this.formData.deliveryAddress.trim()) {
        uni.showToast({ title: "请输入送达地址", icon: "none" });
        return false;
      }
      if (!this.formData.budget || parseFloat(this.formData.budget) <= 0) {
        uni.showToast({ title: "请输入有效的物品预算", icon: "none" });
        return false;
      }
      if (
        this.formData.reward === undefined ||
        this.formData.reward === null ||
        this.formData.reward === "" ||
        isNaN(parseFloat(this.formData.reward)) ||
        parseFloat(this.formData.reward) < 2
      ) {
        uni.showToast({ title: "跑腿费至少2元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitBuyTask() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      try {
        // 计算支付金额：物品预算 + 跑腿费 + 0.1元平台服务费
        const budget = parseFloat(this.formData.budget);
        const reward = parseFloat(this.formData.reward);
        const platformFee = 0.1; // 物品预算的平台服务费
        const totalPayment = budget + reward + platformFee;

        // 构建任务数据，但不立即发布
        const taskData = {
          title: `找小伙伴买东西`,
          description: "请帮我买东西",
          taskType: "帮我买",
          rewardAmount: reward, // 接单员收到的跑腿费
          budget: budget, // 物品预算
          locationText: this.formData.deliveryAddress.trim(),
          specifics: `购买物品: ${this.formData.items}\n购买地点: ${this.formData.purchaseLocation}\n送达地址: ${this.formData.deliveryAddress}\n期望送达: ${this.formData.expectedDate} ${this.formData.expectedTime}`,
          images: this.formData.images, // 传递临时图片路径，在支付成功后上传
          // 支付相关信息
          paymentAmount: totalPayment, // 发布者支付：物品预算 + 跑腿费 + 0.1元
          paymentDescription: `帮买任务费用（物品${budget}元+跑腿${reward}元+服务费0.1元）`,
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

.publish-buy-container {
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

.publish-buy-container {
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.2);
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
  border: 1px solid rgba(102, 126, 234, 0.1);
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
    background: linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%);
    border: 2px solid #c7d2fe;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #667eea;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
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

  .address-actions {
    display: flex;
    gap: 32rpx;
    margin-top: 16rpx;

    .action-link {
      color: #667eea;
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

.buy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.lively-green-btn {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(67, 233, 123, 0.15);
  transition: background 0.2s;
  width: 180px;
  height: 44px;
  font-size: 18px;
  margin: 0 auto;
  display: block;
}
</style>
