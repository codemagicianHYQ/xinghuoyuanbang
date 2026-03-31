<template>
  <view class="publish-paperwork-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">📋</view>
      <view class="title-content">
        <view class="page-title">发布求资料</view>
        <view class="page-subtitle">专业资料，高效获取！</view>
      </view>
    </view>

    <form @submit.prevent="submitPaperworkRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label">
            资料名称 <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            v-model="formData.title"
            placeholder="请输入您需要的资料名称"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            资料类型 <text class="required-star">*</text>
          </text>
          <picker :range="materialTypes" @change="bindMaterialTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.materialType || "请选择资料类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">
            详细描述 <text class="required-star">*</text>
          </text>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.description"
            placeholder="请详细描述您需要的资料内容、格式等信息...."
            maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            价格 (元) <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            type="digit"
            v-model="formData.reward"
            placeholder="建议金额2元以上"
            @input="validatePrice"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            资料形式 <text class="required-star">*</text>
          </text>
          <picker :range="materialFormats" @change="bindMaterialFormatChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.materialFormat || "请选择资料形式" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label"> 交易地点 </text>
          <input
            class="input-field rounded-base"
            v-model="formData.tradeLocation"
            placeholder="请选择交易地点（电子资料可网上发）"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddress"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocation">地图选择</text>
          </view>
          <text
            v-if="formData.materialFormat === '电子资料'"
            class="format-tip"
          >
            接单后在订单页面联系接单员发送联系方式
          </text>
        </view>
      </view>

      <view
        class="submit-btn paperwork-btn rounded-full"
        @click="submitPaperworkRequest"
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
  components: {
    PublishButton,
  },
  mixins: [publishGate],
  data() {
    return {
      formData: {
        title: "",
        materialType: "",
        description: "",
        reward: "",
        materialFormat: "",
        tradeLocation: "",
      },
      materialTypes: [
        "课程资料",
        "考试资料",
        "考研资料",
        "四六级资料",
        "计算机资料",
        "其他资料",
      ],
      materialFormats: ["纸质资料", "电子资料"],
      isSubmitting: false,
    };
  },
  onLoad(options) {
    if (!this.ensureLogin()) return;
    this.checkCommunitySelection();
    if (options && options.title) {
      this.formData.title = decodeURIComponent(options.title);
    }
    if (options && options.category && options.category === "data_request") {
      console.log("发布求资料类型任务");
    }
  },
  onShow() {
    // 监听地址选择页面返回
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.route.includes("publish-paperwork")) {
      // 检查是否有选中的地址
      const selectedAddressData = uni.getStorageSync("selectedAddressData");
      if (selectedAddressData) {
        this.formData.tradeLocation = selectedAddressData.address;
        uni.removeStorageSync("selectedAddressData");
      }
    }
  },
  methods: {
    bindMaterialTypeChange(e) {
      this.formData.materialType = this.materialTypes[e.detail.value];
    },

    bindMaterialFormatChange(e) {
      this.formData.materialFormat = this.materialFormats[e.detail.value];
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

    chooseMapLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.tradeLocation = res.name + " " + res.address;
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            console.error("选择位置失败:", err);
            uni.showToast({
              title: "选择位置失败",
              icon: "none",
            });
          }
        },
      });
    },

    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.tradeLocation = address.detail;
    },

    validatePrice(e) {
      const value = e.detail.value;
      if (value && parseFloat(value) < 2) {
        uni.showToast({
          title: "最低价格为2元",
          icon: "none",
        });
        this.formData.reward = "2";
      }
    },

    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入资料名称", icon: "none" });
        return false;
      }
      if (this.formData.title.trim().length < 3) {
        uni.showToast({ title: "资料名称至少3个字", icon: "none" });
        return false;
      }
      if (!this.formData.materialType) {
        uni.showToast({ title: "请选择资料类型", icon: "none" });
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
      if (!this.formData.reward || parseFloat(this.formData.reward) < 2) {
        uni.showToast({
          title: "请输入有效的价格 (最低2元)",
          icon: "none",
        });
        return false;
      }
      if (!this.formData.materialFormat) {
        uni.showToast({ title: "请选择资料形式", icon: "none" });
        return false;
      }
      return true;
    },

    async submitPaperworkRequest() {
      if (!this.ensureLogin()) return;
      if (!this.checkCommunitySelection()) return;

      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布求资料")) {
        return;
      }

      if (!this.validateForm()) return;

      // 构造任务数据
      const taskData = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        taskType: "求资料",
        rewardAmount: parseFloat(this.formData.reward),
        locationText: this.formData.tradeLocation.trim() || "线上交易",
        specifics: `资料类型: ${this.formData.materialType}\n资料形式: ${
          this.formData.materialFormat
        }${
          this.formData.tradeLocation.trim()
            ? `\n交易地点: ${this.formData.tradeLocation.trim()}`
            : ""
        }${
          this.formData.materialFormat === "电子资料"
            ? "\n备注: 接单后在订单页面联系接单员发送联系方式"
            : ""
        }\n详细描述: ${this.formData.description.trim()}`,
        paymentAmount: parseFloat(this.formData.reward),
        paymentDescription: "求资料任务赏金",
      };

      // 跳转到发布确认页面
      uni.navigateTo({
        url: `/subpages/publish/publish-confirm?taskData=${encodeURIComponent(
          JSON.stringify(taskData)
        )}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-paperwork-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(33, 150, 243, 0.2);
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
  margin: 24rpx $uni-spacing-col-base $uni-spacing-row-lg;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(33, 150, 243, 0.1);

  .form-item {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .item-label {
      display: block;
      font-size: 32rpx;
      color: #2c3e50;
      margin-bottom: 16rpx;
      font-weight: 600;
      word-wrap: break-word;

      .required-star {
        color: #e74c3c;
        margin-left: 4rpx;
      }
    }
  }

  .input-field,
  .textarea-field,
  .input-imitation {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 2px solid #90caf9;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;
    word-wrap: break-word;
    word-break: break-all;

    &:focus {
      border-color: #2196f3;
      background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
      box-shadow: 0 0 0 4rpx rgba(33, 150, 243, 0.1);
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
    resize: none;
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

  .address-actions {
    display: flex;
    gap: 32rpx;
    margin-top: 16rpx;

    .action-link {
      color: #2196f3;
      font-size: 28rpx;
      text-decoration: none;
      font-weight: 500;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .format-tip {
    display: block;
    font-size: 24rpx;
    color: #ff6b35;
    margin-top: 8rpx;
    padding: 8rpx 12rpx;
    background-color: #fff3e0;
    border-radius: 8rpx;
    border-left: 4rpx solid #ff6b35;
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

.paperwork-btn {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
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
