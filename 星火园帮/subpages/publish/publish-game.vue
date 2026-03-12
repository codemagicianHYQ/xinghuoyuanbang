<template>
  <view class="publish-game-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">🗑️</view>
      <view class="title-content">
        <view class="page-title">发布倒垃圾任务</view>
        <view class="page-subtitle">环保助手，帮你清理！</view>
      </view>
    </view>

    <form @submit="submitGameTask">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏠</text>
            <text class="item-label">
              寝室地址 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.gameName"
            placeholder="如：5号宿舍楼302室"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🗑️</text>
            <text class="item-label">
              垃圾类型 <text class="required-star">*</text>
            </text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.gameMode"
            placeholder="如：干垃圾、湿垃圾、可回收垃圾"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">⏰</text>
            <text class="item-label">
              清理时间 <text class="required-star">*</text>
            </text>
          </view>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.gameDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.gameDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.gameTime"
              @change="bindTimeChange"
            >
              <view
                class="picker-value input-imitation time-picker-item rounded-base"
              >
                {{ formData.gameTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label">备注说明</text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.rankRequirement"
            placeholder="如：垃圾较多、需要分类等"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label">垃圾投放点</text>
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.voiceMethod"
            placeholder="如：宿舍楼下垃圾箱、垃圾站等"
            maxlength="50"
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
            v-model="formData.reward"
            type="number"
            placeholder="请输入报酬金额"
            class="input-field rounded-base"
          />
        </view>
      </view>

      <view class="submit-btn game-btn rounded-full" @click="submitGameTask">
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
        gameName: "",
        gameMode: "",
        playerNumber: "",
        gameDate: now.toISOString().split("T")[0],
        gameTime: "",
        rankRequirement: "",
        voiceMethod: "",

        reward: "",
      },
      playerNumbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      voiceOptions: [
        "游戏内语音",
        "QQ语音",
        "微信语音",
        "YY语音",
        "不需要语音",
      ],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  onLoad() {
    console.log(
      "游戏陪玩页面onLoad token:",
      uni.getStorageSync(USER_AUTH_TOKEN_KEY)
    );
  },
  onShow() {
    console.log(
      "游戏陪玩页面onShow token:",
      uni.getStorageSync(USER_AUTH_TOKEN_KEY)
    );
  },
  methods: {
    bindPlayerNumberChange(e) {
      this.formData.playerNumber = this.playerNumbers[e.detail.value];
    },
    bindDateChange(e) {
      this.formData.gameDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.gameTime = e.detail.value;
    },
    bindVoiceChange(e) {
      this.formData.voiceMethod = this.voiceOptions[e.detail.value];
    },
    validateForm() {
      if (!this.formData.gameName.trim()) {
        uni.showToast({ title: "请输入寝室地址", icon: "none" });
        return false;
      }
      if (!this.formData.gameMode.trim()) {
        uni.showToast({ title: "请输入垃圾类型", icon: "none" });
        return false;
      }
      if (!this.formData.gameDate || !this.formData.gameTime) {
        uni.showToast({ title: "请选择清理时间", icon: "none" });
        return false;
      }
      if (
        !this.formData.reward ||
        isNaN(this.formData.reward) ||
        Number(this.formData.reward) < 0
      ) {
        uni.showToast({ title: "请输入有效的报酬金额", icon: "none" });
        return false;
      }
      // 新增校验
      if (!`${this.formData.gameName} - ${this.formData.gameMode}`.trim()) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return false;
      }
      if (!"game") {
        uni.showToast({ title: "任务类型不能为空", icon: "none" });
        return false;
      }
      if (Number(this.formData.reward) < 2) {
        uni.showToast({ title: "报酬至少2元", icon: "none" });
        return false;
      }
      return true;
    },
    async submitGameTask() {
      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      const reward = Number(this.formData.reward);

      // 构造任务数据
      const taskData = {
        title: `找小伙伴倒垃圾`,
        description: "帮忙清理垃圾",
        taskType: "倒垃圾",
        rewardAmount: reward,
        locationText: this.formData.gameName,
        specifics: `寝室地址: ${this.formData.gameName}\n垃圾类型: ${
          this.formData.gameMode
        }\n清理时间: ${this.formData.gameDate} ${
          this.formData.gameTime
        }\n备注说明: ${
          this.formData.rankRequirement.trim() || "无"
        }\n垃圾投放点: ${this.formData.voiceMethod || "宿舍楼下垃圾箱"}`,
        paymentAmount: reward,
        paymentDescription: `倒垃圾：${this.formData.gameName}`,
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

.publish-game-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(82, 196, 26, 0.2);
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
  border: 1px solid rgba(82, 196, 26, 0.1);
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
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    border: 2px solid #b7eb8f;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #52c41a;
      background: linear-gradient(135deg, #ffffff 0%, #f6ffed 100%);
      box-shadow: 0 0 0 4rpx rgba(82, 196, 26, 0.1);
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

.game-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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
