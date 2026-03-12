<template>
  <view
    class="splash-container"
    v-if="showSplash"
    :class="{ 'fade-out': isFadingOut }"
  >
    <view class="splash-content">
      <!-- 爱心动画 -->
      <view class="preloader">
        <span></span>
        <span></span>
        <span></span>
      </view>
      <view class="shadow"></view>

      <!-- 应用名称 -->
      <view class="app-name">{{ appName }}</view>

      <!-- 加载文字 -->
      <view class="loading-text">{{ loadingText }}</view>

      <!-- 进度条 -->
      <view class="progress-container">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "SplashScreen",
  props: {
    appName: {
      type: String,
      default: "星火园帮",
    },
    loadingText: {
      type: String,
      default: "正在加载...",
    },
    duration: {
      type: Number,
      default: 1500,
    },
  },
  data() {
    return {
      showSplash: true,
      isFadingOut: false,
      progress: 0,
    };
  },
  mounted() {
    this.startLoading();
  },
  methods: {
    startLoading() {
      // 模拟加载进度
      const interval = setInterval(() => {
        this.progress += Math.random() * 15;
        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            this.hideSplash();
          }, 500);
        }
      }, 100);

      // 最大加载时间
      setTimeout(() => {
        if (this.progress < 100) {
          this.progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            this.hideSplash();
          }, 500);
        }
      }, this.duration);
    },
    hideSplash() {
      this.isFadingOut = true;
      setTimeout(() => {
        this.showSplash = false;
        this.$emit("splash-complete");
      }, 500);
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

/* 爱心动画样式 */
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
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
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
    transform: translateX(-50%) scale(0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* 应用名称样式 */
.app-name {
  margin-top: 60px;
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

/* 进度条样式 */
.progress-container {
  margin-top: 40px;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 淡出动画 */
.splash-container.fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
