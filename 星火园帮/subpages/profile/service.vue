<template>
  <view class="service-container page-container">
    <!-- 客服头像和状�?-->
    <view class="service-header card shadow-base">
      <view class="service-avatar-container">
        <image class="service-avatar" src="/static/icons/service.png" />
        <view class="online-status">
          <view class="status-dot"></view>
          <text class="status-text">在线</text>
        </view>
      </view>
      <view class="service-info">
        <text class="service-title">星火园帮客服</text>
        <text class="service-desc">专业客服团队，为您提供贴心服务</text>
        <text class="service-time">在线时间9:00-22:00</text>
      </view>
    </view>

    <!-- 快捷服务 -->
    <view class="quick-service card shadow-base">
      <text class="section-title">快捷服务</text>
      <view class="service-grid">
        <view class="service-item" @click="openWechat">
          <text class="service-icon-text">💬</text>
          <text class="service-name">微信客服</text>
        </view>
        <view class="service-item" @click="callPhone">
          <text class="service-icon-text">📞</text>
          <text class="service-name">电话客服</text>
        </view>
        <view class="service-item" @click="goToFeedback">
          <text class="service-icon-text">📝</text>
          <text class="service-name">意见反馈</text>
        </view>
        <view class="service-item" @click="goToFAQ">
          <text class="service-icon-text">💡</text>
          <text class="service-name">常见问题</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-info card shadow-base">
      <text class="section-title">联系方式</text>
      <view class="contact-item" @click="copyWechat">
        <view class="contact-left">
          <text class="contact-icon-text">💬</text>
          <view class="contact-detail">
            <text class="contact-label">微信客服</text>
            <text class="contact-value">{{
              wechatServiceConfig.fallback.wechatId
            }}</text>
          </view>
        </view>
        <button class="copy-btn">复制</button>
      </view>
      <view class="contact-item" @click="copyPhone">
        <view class="contact-left">
          <text class="contact-icon-text">📞</text>
          <view class="contact-detail">
            <text class="contact-label">客服电话</text>
            <text class="contact-value">{{
              wechatServiceConfig.fallback.phoneNumber
            }}</text>
          </view>
        </view>
        <button class="copy-btn">复制</button>
      </view>
    </view>

    <!-- 服务承诺 -->
    <view class="service-promise card shadow-base">
      <text class="section-title">服务承诺</text>
      <view class="promise-list">
        <view class="promise-item">
          <text class="promise-icon">💡</text>
          <text class="promise-text">快速响应，5分钟内回复</text>
        </view>
        <view class="promise-item">
          <text class="promise-icon">💡</text>
          <text class="promise-text">专业解答，解决您的问题</text>
        </view>
        <view class="promise-item">
          <text class="promise-icon">💯</text>
          <text class="promise-text">满意度保证，服务至上</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  openCustomerService,
  isCustomerServiceSupported,
  wechatServiceConfig,
} from "@/config/wechat-service.js";

export default {
  data() {
    return {
      wechatServiceConfig: wechatServiceConfig,
    };
  },
  methods: {
    // 复制微信�?
    copyWechat() {
      uni.setClipboardData({
        data: wechatServiceConfig.fallback.wechatId,
        success: () => {
          uni.showToast({ title: "微信号已复制", icon: "success" });
        },
      });
    },

    // 复制电话号码
    copyPhone() {
      uni.setClipboardData({
        data: wechatServiceConfig.fallback.phoneNumber,
        success: () => {
          uni.showToast({ title: "电话已复制", icon: "success" });
        },
      });
    },

    // 打开微信客服
    async openWechat() {
      try {
        // 检查是否支持微信客服API
        if (isCustomerServiceSupported()) {
          // 使用微信官方客服API
          await openCustomerService();
        } else {
          // 低版本基础库，使用降级方案
          this.showWechatFallback();
        }
      } catch (error) {
        console.error("打开客服失败:", error);
        // 降级处理：显示微信号
        this.showWechatFallback();
      }
    },

    // 显示微信号降级方�?
    showWechatFallback() {
      uni.showModal({
        title: "微信客服",
        content: `请添加微信号�?{wechatServiceConfig.fallback.wechatId}\n我们将为您提供专业服务`,
        confirmText: "复制微信号",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.copyWechat();
          }
        },
      });
    },

    // 拨打电话
    callPhone() {
      uni.showModal({
        title: "电话客服",
        content: `客服电话�?{wechatServiceConfig.fallback.phoneNumber}\n服务时间�?{wechatServiceConfig.fallback.serviceTime}`,
        confirmText: "立即拨打",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: wechatServiceConfig.fallback.phoneNumber,
              fail: () => {
                uni.showToast({ title: "拨打失败", icon: "none" });
              },
            });
          }
        },
      });
    },

    // 跳转到意见反�?
    goToFeedback() {
      uni.navigateTo({
        url: "/subpages/profile/feedback",
      });
    },

    // 跳转到常见问�?
    goToFAQ() {
      uni.showToast({ title: "常见问题功能开发中", icon: "none" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.service-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faff 0%, #f0f8ff 100%);
  padding: 32rpx;
}

// 客服头像和状�?
.service-header {
  margin-bottom: 32rpx;
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eaffd0 0%, #fffbe6 100%);
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(77, 166, 255, 0.1);
}

.service-avatar-container {
  position: relative;
  margin-right: 32rpx;
}

.service-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #4caf50;
  border-radius: 16rpx;
  padding: 4rpx 12rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #fff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.status-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 500;
}

.service-info {
  flex: 1;
}

.service-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 8rpx;
}

.service-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.service-time {
  font-size: 24rpx;
  color: #4e9fff;
  font-weight: 500;
}

// 快捷服务
.quick-service {
  margin-bottom: 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(77, 166, 255, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 24rpx;
  display: block;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 24rpx;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(77, 166, 255, 0.1);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(77, 166, 255, 0.2);
  }
}

.service-icon-text {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.service-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

// 联系方式
.contact-info {
  margin-bottom: 32rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(77, 166, 255, 0.1);
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.contact-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.contact-icon-text {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.contact-detail {
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.contact-value {
  font-size: 26rpx;
  color: #666;
}

.copy-btn {
  background: linear-gradient(135deg, #4da6ff 0%, #3399ff 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  padding: 12rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(77, 166, 255, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(-1rpx);
    box-shadow: 0 6rpx 16rpx rgba(77, 166, 255, 0.4);
  }
}

// 服务承诺
.service-promise {
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(77, 166, 255, 0.1);
}

.promise-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.promise-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.promise-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.promise-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
