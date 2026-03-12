<template>
  <view class="partner-publish-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="title-section">
        <text class="page-title">发布学习伙伴</text>
        <text class="page-subtitle">寻找志同道合的伙伴，一起做有趣的事！</text>
      </view>
    </view>

    <form @submit="submitPartnerRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">🎯</text>
            <text class="item-label">
              活动类型 <text class="required-star">*</text>
            </text>
          </view>
          <picker
            :range="activityTypes"
            range-key="label"
            @change="onActivityTypeChange"
          >
            <view class="picker-value input-imitation rounded-base">
              {{ selectedActivityType.label }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📝</text>
            <text class="item-label">
              活动标题 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.title"
            placeholder="请输入活动标题"
            maxlength="50"
          />
          <text class="char-count">{{ formData.title.length }}/50</text>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📍</text>
            <text class="item-label">
              活动地点 <text class="required-star">*</text>
            </text>
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
            placeholder="请输入活动地点"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📅</text>
            <text class="item-label">
              活动时间 <text class="required-star">*</text>
            </text>
          </view>
          <view class="time-picker-row">
            <picker mode="date" @change="onDateChange">
              <view class="time-picker input-imitation rounded-base">
                {{ formData.activityDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker mode="time" @change="onTimeChange">
              <view class="time-picker input-imitation rounded-base">
                {{ formData.activityTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">👥</text>
            <text class="item-label">
              人数限制 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.maxParticipants"
            placeholder="请输入最大参与人数"
            type="number"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">📝</text>
            <text class="item-label">
              活动描述 <text class="required-star">*</text>
            </text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.description"
            placeholder="请详细描述活动内容、要求等..."
            maxlength="500"
          ></textarea>
          <text class="char-count">{{ formData.description.length }}/500</text>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="label-icon">💰</text>
            <text class="item-label">活动费用</text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.fee"
            placeholder="请输入活动费用（可选）"
            type="number"
          />
        </view>
      </view>
    </form>

    <!-- 底部发布按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn partner-btn rounded-full"
        @click="submitPartnerRequest"
        :disabled="!isFormValid || isSubmitting"
        :loading="isSubmitting"
      >
        <text class="btn-icon">🚀</text>
        <text class="btn-text">{{
          isSubmitting ? "发布中..." : "发布学习伙伴"
        }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      isSubmitting: false,
      formData: {
        title: "",
        activityType: "",
        location: "",
        activityDate: "",
        activityTime: "",
        maxParticipants: "",
        description: "",
        fee: "",
      },
      activityTypes: [
        { label: "学习交流", value: "study" },
        { label: "运动健身", value: "sports" },
        { label: "文艺活动", value: "culture" },
        { label: "志愿服务", value: "volunteer" },
        { label: "旅行出游", value: "travel" },
        { label: "聚餐聚会", value: "dining" },
        { label: "其他活动", value: "other" },
      ],
      selectedActivityType: { label: "请选择活动类型", value: "" },
    };
  },
  computed: {
    isFormValid() {
      return (
        this.formData.title.trim() &&
        this.selectedActivityType.value &&
        this.formData.location.trim() &&
        this.formData.activityDate &&
        this.formData.activityTime &&
        this.formData.maxParticipants &&
        this.formData.description.trim()
      );
    },
  },
  onShow() {
    // 检查是否有选中的地址数据
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData && selectedAddressData.target === "partner") {
      this.formData.location = selectedAddressData.address;
      // 清除存储的数据，避免影响其他页面
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    onActivityTypeChange(e) {
      this.selectedActivityType = this.activityTypes[e.detail.value];
      this.formData.activityType = this.selectedActivityType.value;
    },

    onDateChange(e) {
      this.formData.activityDate = e.detail.value;
    },

    onTimeChange(e) {
      this.formData.activityTime = e.detail.value;
    },

    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}&target=partner`,
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

    async submitPartnerRequest() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布找伙伴")) {
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

      // 详细表单验证
      if (!this.formData.title || !this.formData.title.trim()) {
        uni.showToast({
          title: "请输入活动标题",
          icon: "none",
        });
        return;
      }

      if (!this.selectedActivityType || !this.selectedActivityType.value) {
        uni.showToast({
          title: "请选择活动类型",
          icon: "none",
        });
        return;
      }

      if (!this.formData.location || !this.formData.location.trim()) {
        uni.showToast({
          title: "请输入活动地点",
          icon: "none",
        });
        return;
      }

      if (!this.formData.activityDate) {
        uni.showToast({
          title: "请选择活动日期",
          icon: "none",
        });
        return;
      }

      if (!this.formData.activityTime) {
        uni.showToast({
          title: "请选择活动时间",
          icon: "none",
        });
        return;
      }

      if (!this.formData.maxParticipants) {
        uni.showToast({
          title: "请输入参与人数",
          icon: "none",
        });
        return;
      }

      if (!this.formData.description || !this.formData.description.trim()) {
        uni.showToast({
          title: "请输入活动描述",
          icon: "none",
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const activityData = {
          type: "partner",
          title: this.formData.title?.trim() || "",
          activityType: this.selectedActivityType?.value || "",
          location: this.formData.location?.trim() || "",
          activityDate: this.formData.activityDate || null,
          activityTime: this.formData.activityTime || "",
          maxParticipants: parseInt(this.formData.maxParticipants) || null,
          description: this.formData.description?.trim() || "",
          communityId: currentCommunity.id, // 添加社区ID
        };

        const res = await request({
          url: "/campus-interactions",
          method: "POST",
          data: activityData,
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
        console.error("发布学习伙伴失败:", error);
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

.partner-publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
  padding: 0;
  padding-bottom: 200rpx;
}

// 顶部装饰区域
.header-decoration {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border: 1px solid rgba(102, 126, 234, 0.1);

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
      background: linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%);
      border: 2px solid #a5b4fc;
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
        color: #667eea;
        font-size: 28rpx;
        text-decoration: none;
        font-weight: 500;
        padding: 8rpx 0;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;

        &:active {
          color: #5a67d8;
          border-bottom-color: #5a67d8;
        }
      }
    }

    .time-picker-row {
      display: flex;
      gap: 16rpx;

      .time-picker {
        flex: 1;
        background: linear-gradient(135deg, #f0f2ff 0%, #e8ecff 100%);
        border: 2px solid #a5b4fc;
        border-radius: 16rpx;
        padding: 24rpx;
        min-height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 30rpx;
        color: #2c3e50;
        transition: all 0.3s ease;

        &:active {
          border-color: #667eea;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
        }

        .picker-arrow {
          color: #95a5a6;
          font-size: 24rpx;
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

  &.partner-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

    &:not(:disabled):active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
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
