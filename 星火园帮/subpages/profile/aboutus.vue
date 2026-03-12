<template>
  <view class="aboutus-container">
    <!-- 头部背景 -->
    <view class="header-section">
      <view class="header-bg">
        <image
          class="bg-image"
          src="/static/images/banner-bg.png"
          mode="aspectFill"
        ></image>
        <view class="header-overlay"></view>
      </view>
      <view class="header-content">
        <image
          class="app-logo"
          src="/static/images/app-logo.png"
          mode="aspectFit"
        ></image>
        <text class="app-name">星火园帮</text>
        <text class="app-slogan">让校园生活更美好</text>
      </view>
    </view>

    <!-- 项目介绍 -->
    <view class="intro-section">
      <view class="section-title">
        <text class="title-text">关于我们</text>
        <view class="title-line"></view>
      </view>

      <view class="intro-card">
        <view class="intro-icon">🌟</view>
        <view class="intro-content">
          <text class="intro-title">我们的使命</text>
          <text class="intro-desc">
            星火园帮致力于为校园师生提供便捷、高效的生活服务平台，我们相信，通过互助与分享，可以让校园生活变得更加美好和温暖。
          </text>
        </view>
      </view>

      <view class="intro-card">
        <view class="intro-icon">💡</view>
        <view class="intro-content">
          <text class="intro-title">我们的愿景</text>
          <text class="intro-desc">
            成为最受校园师生信赖的生活服务平台，让每个人都能在校园中找到属于自己的温暖角落，让互助成为校园文化的一部分。
          </text>
        </view>
      </view>

      <view class="intro-card">
        <view class="intro-icon">🤝</view>
        <view class="intro-content">
          <text class="intro-title">我们的价值观</text>
          <text class="intro-desc">
            诚信、互助、创新、温暖。我们相信真诚的交流能够建立信任，互助的精神能够创造价值，创新的思维能够解决问题。
          </text>
        </view>
      </view>
    </view>

    <!-- 服务特色 -->
    <view class="features-section">
      <view class="section-title">
        <text class="title-text">服务特色</text>
        <view class="title-line"></view>
      </view>

      <view class="features-grid">
        <view class="feature-item">
          <view class="feature-icon">📦</view>
          <text class="feature-title">代取快递</text>
          <text class="feature-desc">安全便捷的代取服务</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon">🍔</view>
          <text class="feature-title">代拿外卖</text>
          <text class="feature-desc">美食送到宿舍门口</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon">📚</view>
          <text class="feature-title">学习互助</text>
          <text class="feature-desc">知识分享与学习交流</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon">🎯</view>
          <text class="feature-title">学习伙伴</text>
          <text class="feature-desc">寻找志同道合的伙伴</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon">💼</view>
          <text class="feature-title">兼职信息</text>
          <text class="feature-desc">安全可靠的兼职机会</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon">🏃</view>
          <text class="feature-title">跑腿服务</text>
          <text class="feature-desc">各种生活跑腿需求</text>
        </view>
      </view>
    </view>

    <!-- 团队介绍 -->
    <view class="team-section">
      <view class="section-title">
        <text class="title-text">我们的团队</text>
        <view class="title-line"></view>
      </view>

      <view class="team-intro">
        <text class="team-desc"> 我们是一群赶路的人，但时而也抬头看看天 </text>
      </view>
    </view>

    <!-- 联系我们 -->
    <view class="contact-section">
      <view class="section-title">
        <text class="title-text">联系我们</text>
        <view class="title-line"></view>
      </view>

      <view class="contact-cards">
        <view class="contact-card" @click="copyEmail">
          <view class="contact-icon">📧</view>
          <view class="contact-info">
            <text class="contact-title">邮箱联系</text>
            <text class="contact-desc">1502685417@qq.com</text>
          </view>
        </view>

        <view class="contact-card" @click="contactService">
          <view class="contact-icon">💬</view>
          <view class="contact-info">
            <text class="contact-title">微信客服</text>
            <text class="contact-desc">扫码添加客服微信</text>
          </view>
        </view>

        <view class="contact-card" @click="navigateToFeedback">
          <view class="contact-icon">📱</view>
          <view class="contact-info">
            <text class="contact-title">意见反馈</text>
            <text class="contact-desc">您的建议是我们前进的动力</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer-section">
      <view class="footer-content">
        <text class="footer-text">© 2024 星火园帮</text>
        <text class="footer-text">让校园生活更美好</text>
        <view class="footer-links">
          <text class="footer-link">隐私政策</text>
          <text class="footer-link">服务条款</text>
          <text class="footer-link">用户协议</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "AboutUs",
  data() {
    return {
      // 页面数据
    };
  },
  onLoad() {
    // 页面加载时的逻辑
    console.log("关于我们页面加载");
  },
  methods: {
    // 复制邮箱地址
    copyEmail() {
      uni.setClipboardData({
        data: "1502685417@qq.com",
        success: () => {
          uni.showToast({
            title: "邮箱地址已复制",
            icon: "success",
            duration: 2000,
          });
        },
        fail: () => {
          uni.showToast({
            title: "复制失败",
            icon: "none",
          });
        },
      });
    },

    // 联系客服（与我的页面保持一致）
    contactService() {
      // 直接调用微信客服API
      wx.openCustomerServiceChat({
        extInfo: {
          url: "https://work.weixin.qq.com/kfid/kfcc460616b96351981",
        },
        corpId: "ww4f94bec1d56104e4",
        showMessageCard: true,
        sendMessageTitle: "星火园帮客服",
        sendMessagePath: "/pages/index/index",
        sendMessageImg: "/static/icons/service.png",
        success: (res) => {
          // 打开客服成功
        },
        fail: (err) => {
          console.error("打开客服失败", err);
          // 降级处理：显示微信号
          this.showWechatFallback();
        },
      });
    },

    // 显示微信号降级方案
    showWechatFallback() {
      uni.showModal({
        title: "微信客服",
        content: "请添加微信号：spark-help\n我们将为您提供专业服务",
        confirmText: "复制微信号",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: "spark-help",
              success: () => {
                uni.showToast({ title: "微信号已复制", icon: "success" });
              },
            });
          }
        },
      });
    },

    // 跳转到意见反馈页面
    navigateToFeedback() {
      uni.navigateTo({
        url: "/subpages/profile/feedback",
        fail: (err) => {
          console.error("导航到意见反馈页面失败:", err);
          uni.showToast({ title: "页面打开失败", icon: "none" });
        },
      });
    },
  },
};
</script>

<style>
.aboutus-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* 头部样式 */
.header-section {
  position: relative;
  height: 350rpx;
  overflow: hidden;
  margin-bottom: -50rpx;
  z-index: 10;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40rpx;
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.app-slogan {
  font-size: 28rpx;
  color: #f0f0f0;
  opacity: 0.9;
  margin-bottom: 20rpx;
}

/* 通用section样式 */
.intro-section,
.features-section,
.team-section,
.contact-section {
  margin: 40rpx 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
}

.intro-section {
  margin-top: 80rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.title-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 20rpx;
}

.title-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 介绍卡片样式 */
.intro-card {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
  padding: 30rpx;
  background: #f8f9ff;
  border-radius: 16rpx;
  border-left: 6rpx solid #667eea;
}

.intro-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  margin-top: 5rpx;
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
  display: block;
}

.intro-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  display: block;
}

/* 特色服务样式 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #f8f9ff;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.feature-item:active {
  transform: scale(0.95);
  background: #e8f0ff;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.feature-desc {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
  display: block;
}

/* 团队介绍样式 */
.team-intro {
  margin-bottom: 40rpx;
}

.team-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  text-align: center;
  display: block;
}

/* 联系我们样式 */
.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f8f9ff;
  border-radius: 16rpx;
  border: 2rpx solid #e8f0ff;
}

.contact-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.contact-info {
  flex: 1;
}

.contact-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.contact-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
}

/* 底部样式 */
.footer-section {
  margin: 40rpx 30rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-text {
  font-size: 26rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
  opacity: 0.8;
  display: block;
}

.footer-links {
  display: flex;
  gap: 30rpx;
  margin-top: 20rpx;
}

.footer-link {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.7;
  text-decoration: underline;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
