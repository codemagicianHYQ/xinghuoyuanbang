<template>
  <view class="publish-moving-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">🚚</view>
      <view class="title-content">
        <view class="page-title">发布搬运服务</view>
        <view class="page-subtitle">专业搬运，轻松搬运！</view>
      </view>
    </view>

    <form @submit="submitMovingTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📦</text>
            <text class="item-label">
              搬运类别 <text class="required-star">*</text>
            </text>
          </view>
          <picker :range="movingTypes" @change="bindMovingTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.movingType || "请选择搬运类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <!-- 搬运物品图片上传区域 -->
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
              >最多上传6张图片，可上传物品照片、搬运现场等</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label">
              物品描述 <text class="required-star">*</text>
            </text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.itemDescription"
            placeholder="详细描述需要搬运的物品，如：行李箱2个、纸箱5个等"
            maxlength="300"
            auto-height
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label">
              起始地点 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.fromLocation"
            placeholder="如：5号宿舍楼3楼301室"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddressForFrom"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocationForFrom"
              >地图选择</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏠</text>
            <text class="item-label">
              目的地点 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.toLocation"
            placeholder="如：北门快递站"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddressForTo"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocationForTo"
              >地图选择</text
            >
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⏰</text>
            <text class="item-label">
              搬运时间 <text class="required-star">*</text>
            </text>
          </view>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.movingDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.movingDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.movingTime"
              @change="bindTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.movingTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⚖️</text>
            <text class="item-label">预估重量</text>
          </view>
          <picker :range="weightRanges" @change="bindWeightChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.estimatedWeight || "请选择预估重量" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">👥</text>
            <text class="item-label">需要人数</text>
          </view>
          <picker :range="peopleNumbers" @change="bindPeopleChange">
            <view class="picker-value input-imitation rounded-base">
              {{
                formData.peopleNeeded
                  ? formData.peopleNeeded + "人"
                  : "请选择需要人数"
              }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⚠️</text>
            <text class="item-label">特殊要求</text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.specialRequirements"
            placeholder="如：需要搬运工具、易碎物品需小心等"
            maxlength="200"
            auto-height
          />
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
            placeholder="根据工作量合理定价"
          />
        </view>
      </view>

      <view
        class="submit-btn moving-btn rounded-full"
        @click="submitMovingTask"
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
        movingType: "",
        itemDescription: "",
        fromLocation: "",
        toLocation: "",
        movingDate: "",
        movingTime: "",
        estimatedWeight: "",
        peopleNeeded: "",
        specialRequirements: "",
        reward: "",
        images: [], // 搬运物品图片数组
      },
      movingTypes: ["宿舍搬迁", "快递搬运", "行李托运", "家具搬运", "其他物品"],
      weightRanges: ["10kg以下", "10-30kg", "30-50kg", "50kg以上"],
      peopleNumbers: ["1", "2", "3", "4人以上"],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
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
      if (selectedAddressData.target === "from") {
        this.formData.fromLocation = selectedAddressData.address;
      } else if (selectedAddressData.target === "to") {
        this.formData.toLocation = selectedAddressData.address;
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

    bindMovingTypeChange(e) {
      this.formData.movingType = this.movingTypes[e.detail.value];
    },
    bindDateChange(e) {
      this.formData.movingDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.movingTime = e.detail.value;
    },
    bindWeightChange(e) {
      this.formData.estimatedWeight = this.weightRanges[e.detail.value];
    },
    bindPeopleChange(e) {
      this.formData.peopleNeeded = this.peopleNumbers[e.detail.value];
    },
    selectSavedAddressForFrom() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=from`,
      });
    },

    // 设置选中的起始地址（供选择地址页面调用）
    setSelectedFromAddress(address) {
      this.formData.fromLocation = address.detail;
    },

    chooseMapLocationForFrom() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.fromLocation =
            (res.name ? res.name + " " : "") + (res.address || "");
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            uni.showToast({ title: "选择位置失败", icon: "none" });
          }
        },
      });
    },
    selectSavedAddressForTo() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=to`,
      });
    },

    // 设置选中的目的地址（供选择地址页面调用）
    setSelectedToAddress(address) {
      this.formData.toLocation = address.detail;
    },

    chooseMapLocationForTo() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.toLocation =
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
      if (!this.formData.movingType) {
        uni.showToast({ title: "请选择搬运类型", icon: "none" });
        return false;
      }
      if (
        !this.formData.fromLocation.trim() ||
        !this.formData.toLocation.trim()
      ) {
        uni.showToast({ title: "请填写起止地点", icon: "none" });
        return false;
      }
      if (!this.formData.itemDescription.trim()) {
        uni.showToast({ title: "请填写物品描述", icon: "none" });
        return false;
      }
      if (!this.formData.reward || isNaN(this.formData.reward)) {
        uni.showToast({ title: "请填写有效报酬", icon: "none" });
        return false;
      }
      // 新增校验
      if (
        !`${this.formData.movingType}：${this.formData.fromLocation} → ${this.formData.toLocation}`.trim()
      ) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return false;
      }
      if (!"moving") {
        uni.showToast({ title: "任务类型不能为空", icon: "none" });
        return false;
      }
      if (parseFloat(this.formData.reward) < 5) {
        uni.showToast({ title: "报酬至少5元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitMovingTask() {
      if (!this.ensureLogin()) return;
      if (!this.checkCommunitySelection()) return;

      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      try {
        const reward = Number(this.formData.reward);

        // 构造任务数据
        const taskData = {
          title: `找小伙伴搬运`,
          description:
            this.formData.specialRequirements.trim() || "需要搬运服务",
          taskType: "搬运服务",
          rewardAmount: reward,
          locationText: `${this.formData.fromLocation.trim()} → ${this.formData.toLocation.trim()}`,
          specifics: `搬运类型: ${
            this.formData.movingType
          }\n物品描述: ${this.formData.itemDescription.trim()}\n起始地点: ${this.formData.fromLocation.trim()}\n目的地点: ${this.formData.toLocation.trim()}\n搬运时间: ${
            this.formData.movingDate
          } ${this.formData.movingTime}\n预估重量: ${
            this.formData.estimatedWeight || "未知"
          }\n需要人数: ${this.formData.peopleNeeded || "1"}人`,
          images: this.formData.images, // 传递临时图片路径，在支付成功后上传
          paymentAmount: reward,
          paymentDescription: `搬运服务：${this.formData.movingType}`,
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

.publish-moving-container {
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

.publish-moving-container {
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 149, 0, 0.2);
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
  border: 1px solid rgba(255, 149, 0, 0.1);
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
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border: 2px solid #ffcc80;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #ff9500;
      background: linear-gradient(135deg, #ffffff 0%, #fff8e1 100%);
      box-shadow: 0 0 0 4rpx rgba(255, 149, 0, 0.1);
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
      color: #ff9500;
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

.moving-btn {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
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
