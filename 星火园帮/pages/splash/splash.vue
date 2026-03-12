<template>
  <view class="splash-container">
    <view class="splash-content">
      <!-- 爱心动画 - 基于你提供的模板 -->
      <view class="animation-container">
        <view class="preloader">
          <span></span>
          <span></span>
          <span></span>
        </view>
        <view class="shadow"></view>
      </view>

      <!-- 应用名称 -->
      <view class="app-name">星火园帮</view>

      <!-- 加载文字 -->
      <view class="loading-text">正在启动...</view>
    </view>
  </view>
</template>

<script>
export default {
  name: "SplashPage",
  data() {
    return {
      // 页面数据
    };
  },
  onLoad() {
    // 页面加载时开始动画
    this.startSplashAnimation();
  },
  methods: {
    startSplashAnimation() {
      // 1.5秒后跳转到首页
      setTimeout(() => {
        this.navigateToHome();
      }, 1500);
    },
    navigateToHome() {
      // 跳转到首页
      uni.reLaunch({
        url: "/pages/home/home",
      });
    },
  },
};
</script>

<style scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 动画容器 */
.animation-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

/* 爱心动画样式 - 基于你提供的模板 */
.preloader {
  animation: rotate 1.6s cubic-bezier(0.75, 0, 0.5, 1) infinite;
  position: relative;
  width: 64px;
  height: 64px;
}

@keyframes rotate {
  50% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(720deg);
  }
}

.preloader span {
  --c: #ff6b6b;
  position: absolute;
  display: block;
  height: 64px;
  width: 64px;
  background: var(--c);
  border: 1px solid var(--c);
  border-radius: 100%;
}

.preloader span:nth-child(1) {
  transform: translate(-28px, -28px);
  animation: shape_1 1.6s cubic-bezier(0.75, 0, 0.5, 1) infinite;
}

@keyframes shape_1 {
  60% {
    transform: scale(0.4);
  }
}

.preloader span:nth-child(2) {
  transform: translate(28px, -28px);
  animation: shape_2 1.6s cubic-bezier(0.75, 0, 0.5, 1) infinite;
}

@keyframes shape_2 {
  40% {
    transform: scale(0.4);
  }
}

.preloader span:nth-child(3) {
  position: relative;
  border-radius: 0px;
  transform: scale(0.98) rotate(-45deg);
  animation: shape_3 1.6s cubic-bezier(0.75, 0, 0.5, 1) infinite;
}

@keyframes shape_3 {
  50% {
    border-radius: 100%;
    transform: scale(0.5) rotate(-45deg);
  }
  100% {
    transform: scale(0.98) rotate(-45deg);
  }
}

.shadow {
  position: relative;
  top: 20px;
  display: block;
  height: 16px;
  width: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: shadow 2.3s cubic-bezier(0.75, 0, 0.5, 1) infinite;
}

@keyframes shadow {
  50% {
    transform: scale(0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* 应用名称样式 */
.app-name {
  margin-top: 40px;
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

/* 加载文字样式 */
.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
