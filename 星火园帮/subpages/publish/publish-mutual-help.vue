<template>
  <view class="publish-help-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">❤️</view>
      <view class="title-content">
        <view class="page-title">发布其他服务任务</view>
        <view class="page-subtitle">其他服务，温暖校园！</view>
      </view>
    </view>

    <form @submit="submitHelpTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🤝</text>
            <text class="item-label"
              >服务类型 <text class="required-star">*</text></text
            >
          </view>
          <picker :range="helpTypes" @change="bindHelpTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.helpType || "请选择服务类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label"
            >任务标题 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            v-model="formData.title"
            placeholder="简要描述需要的服务"
            maxlength="50"
          />
        </view>

        <!-- 任务图片上传区域 -->
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📷</text>
            <text class="item-label">任务图片</text>
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
              >最多上传6张图片，可上传相关截图、现场照片等</text
            >
          </view>
        </view>

        <view class="form-item">
          <text class="item-label"
            >详细描述 <text class="required-star">*</text></text
          >
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.description"
            placeholder="详细说明需要什么服务"
            maxlength="500"
            auto-height
          />
        </view>

        <view class="form-item">
          <text class="item-label">地点</text>
          <input
            class="input-field rounded-base"
            v-model="formData.location"
            placeholder="如需要在特定地点，请填写"
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
          <text class="item-label">
            时间要求 <text class="required-star">*</text>
          </text>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.helpDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.helpDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.helpTime"
              @change="bindTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.helpTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">
            紧急程度 <text class="required-star">*</text>
          </text>
          <picker :range="urgencyLevels" @change="bindUrgencyChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.urgency || "请选择紧急程度" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">联系方式</text>
          <input
            class="input-field rounded-base"
            v-model="formData.contact"
            placeholder="留下您的联系方式（选填）"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            报酬 (元)
            <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.reward"
            placeholder="如需支付报酬请填写，也可以选择义务服务"
          />
        </view>
      </view>

      <view class="submit-btn help-btn rounded-full" @click="submitHelpTask">
        <text class="btn-icon">🚀</text>
        <text class="btn-text">立即发布</text>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import PublishButton from "@/components/PublishButton.vue";

export default {
  components: { PublishButton },
  data() {
    const now = new Date();
    return {
      formData: {
        helpType: "",
        title: "",
        description: "",
        location: "",
        helpDate: "",
        helpTime: "",
        urgency: "",
        contact: "",
        reward: "",
        images: [], // 任务图片数组
      },
      helpTypes: [
        "学习辅导",
        "技术支持",
        "生活服务",
        "心理支持",
        "信息咨询",
        "其他",
      ],
      urgencyLevels: ["一般", "较急", "紧急", "非常紧急"],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  onShow() {
    // 检查是否有选中的地址
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData) {
      this.formData.location = selectedAddressData.address;
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

    bindHelpTypeChange(e) {
      this.formData.helpType = this.helpTypes[e.detail.value];
    },
    bindDateChange(e) {
      this.formData.helpDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.helpTime = e.detail.value;
    },
    bindUrgencyChange(e) {
      this.formData.urgency = this.urgencyLevels[e.detail.value];
    },
    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}`,
      });
    },

    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.location = address.detail;
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
    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入任务标题", icon: "none" });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({ title: "请输入任务描述", icon: "none" });
        return false;
      }
      // 新增校验
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return false;
      }
      if (!"help") {
        uni.showToast({ title: "任务类型不能为空", icon: "none" });
        return false;
      }
      if (
        this.formData.reward !== undefined &&
        this.formData.reward !== null &&
        this.formData.reward !== "" &&
        isNaN(parseFloat(this.formData.reward))
      ) {
        uni.showToast({ title: "报酬必须为数字", icon: "none" });
        return false;
      }
      if (parseFloat(this.formData.reward) < 5) {
        uni.showToast({ title: "报酬至少5元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitHelpTask() {
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
          title: this.formData.title.trim(),
          description: this.formData.description.trim(),
          taskType: "其他服务",
          rewardAmount: reward,
          locationText: this.formData.location.trim(),
          specifics: `服务类型: ${this.formData.helpType}\n紧急程度: ${
            this.formData.urgency || "一般"
          }\n联系方式: ${this.formData.contact.trim()}\n${
            this.formData.helpDate && this.formData.helpTime
              ? `服务时间: ${this.formData.helpDate} ${this.formData.helpTime}`
              : ""
          }`,
          images: this.formData.images, // 传递临时图片路径，在支付成功后上传
          paymentAmount: reward,
          paymentDescription: `其他服务：${this.formData.title}`,
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

.publish-help-container {
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

.publish-help-container {
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #f48fb1 0%, #e91e63 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(244, 143, 177, 0.2);
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
  border: 1px solid rgba(233, 30, 99, 0.1);
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
    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
    border: 2px solid #f8bbd9;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #e91e63;
      background: linear-gradient(135deg, #ffffff 0%, #fce4ec 100%);
      box-shadow: 0 0 0 4rpx rgba(233, 30, 99, 0.1);
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
      color: #e91e63;
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

.help-btn {
  background: linear-gradient(135deg, #f48fb1 0%, #e91e63 100%);
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
