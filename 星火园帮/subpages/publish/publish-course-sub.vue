<template>
  <view class="publish-course-sub-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">🏫</view>
      <view class="title-content">
        <view class="page-title">学习互助</view>
        <view class="page-subtitle">学习互助，共同进步！</view>
      </view>
    </view>

    <form @submit="submitCourseSubTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label">
            具体内容 <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            v-model="formData.courseName"
            placeholder="请输入具体内容以及需求"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            时间 <text class="required-star">*</text>
          </text>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.courseDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.courseDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.courseTime"
              @change="bindTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.courseTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">
            地点 <text class="required-star">*</text>
          </text>
          <input
            class="input-field rounded-base"
            v-model="formData.location"
            placeholder="输入地点"
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
          <text class="item-label">性别限制</text>
          <view class="gender-options">
            <button
              class="gender-btn"
              :class="{ active: formData.genderLimit === 'male' }"
              @click="setGenderLimit('male')"
            >
              男生
            </button>
            <button
              class="gender-btn"
              :class="{ active: formData.genderLimit === 'female' }"
              @click="setGenderLimit('female')"
            >
              女生
            </button>
            <button
              class="gender-btn"
              :class="{ active: formData.genderLimit === 'any' }"
              @click="setGenderLimit('any')"
            >
              不限
            </button>
          </view>
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
            placeholder="建议金额10-50元"
          />
        </view>
      </view>

      <view
        class="submit-btn course-sub-btn rounded-full"
        @click="submitCourseSubTask"
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

export default {
  components: { PublishButton },
  data() {
    const now = new Date();
    return {
      formData: {
        courseName: "",
        courseDate: "",
        courseTime: "",
        location: "",
        genderLimit: "any",
        reward: "",
      },
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  onShow() {
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: "发布学习互助",
    });

    // 检查是否有选中的地址
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData) {
      this.formData.location = selectedAddressData.address;
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    bindDateChange(e) {
      this.formData.courseDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.courseTime = e.detail.value;
    },
    setGenderLimit(limit) {
      this.formData.genderLimit = limit;
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
      if (!this.formData.courseName.trim()) {
        uni.showToast({ title: "请输入互助内容", icon: "none" });
        return false;
      }
      if (!this.formData.courseDate || !this.formData.courseTime) {
        uni.showToast({ title: "请选择时间", icon: "none" });
        return false;
      }
      if (!this.formData.location.trim()) {
        uni.showToast({ title: "请输入地点", icon: "none" });
        return false;
      }
      if (
        this.formData.reward === undefined ||
        this.formData.reward === null ||
        this.formData.reward === "" ||
        isNaN(parseFloat(this.formData.reward))
      ) {
        uni.showToast({ title: "请输入有效报酬", icon: "none" });
        return false;
      }
      // 新增校验
      if (!`学习互助：${this.formData.courseName}`.trim()) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return false;
      }
      if (!"course_substitute") {
        uni.showToast({ title: "任务类型不能为空", icon: "none" });
        return false;
      }
      if (parseFloat(this.formData.reward) < 10) {
        uni.showToast({ title: "报酬至少10元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitCourseSubTask() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      let reward = Number(this.formData.reward);
      if (isNaN(reward) || reward < 0) reward = 0;

      // 构造任务数据
      const taskData = {
        title: `找小伙伴学习互助`,
        description: this.formData.courseName.trim() || "需要学习互助",
        taskType: "学习互助",
        rewardAmount: reward,
        locationText: this.formData.location.trim(),
        specifics: `具体内容: ${this.formData.courseName}\n时间: ${
          this.formData.courseDate
        } ${
          this.formData.courseTime
        }\n地点: ${this.formData.location.trim()}\n性别限制: ${
          this.formData.genderLimit
        }`,
        paymentAmount: reward,
        paymentDescription: `学习互助：${this.formData.courseName}`,
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

.publish-course-sub-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 188, 212, 0.2);
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
  border: 1px solid rgba(0, 188, 212, 0.1);
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
    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
    border: 2px solid #4dd0e1;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #00bcd4;
      background: linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%);
      box-shadow: 0 0 0 4rpx rgba(0, 188, 212, 0.1);
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
      color: #00bcd4;
      font-size: 28rpx;
      text-decoration: none;
      font-weight: 500;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .gender-options {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;

    .gender-btn {
      flex: 1;
      height: 60rpx;
      line-height: 60rpx;
      text-align: center;
      border: 1px solid #e0e0e0;
      border-radius: 8rpx;
      background-color: #f8f8f8;
      color: #666;
      font-size: 28rpx;
      transition: all 0.2s;

      &.active {
        background-color: #43e97b;
        color: #fff;
        border-color: #43e97b;
      }

      &:active {
        opacity: 0.8;
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

.course-sub-btn {
  background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
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
