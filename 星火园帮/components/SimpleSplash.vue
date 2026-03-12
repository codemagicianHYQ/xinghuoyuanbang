<template>
  <view class="splash-container" v-if="showSplash">
    <view class="splash-content">
      <!-- 爱心动画 -->
      <view class="heart-loader">
        <view class="heart"></view>
        <view class="heart"></view>
        <view class="heart"></view>
      </view>

      <!-- 应用名称 -->
      <view class="app-title">星火园帮</view>

      <!-- 加载提示 -->
      <view class="loading-hint">正在启动...</view>
    </view>
  </view>
</template>

<script>
export default {
  name: "SimpleSplash",
  data() {
    return {
      showSplash: true,
    };
  },
  mounted() {
    // 1.5秒后自动隐藏
    setTimeout(() => {
      this.hideSplash();
    }, 1500);
  },
  methods: {
    hideSplash() {
      this.showSplash = false;
      this.$emit("splash-complete");
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

/* 爱心加载动画 */
.heart-loader {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 40px;
}

.heart {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  transform: rotate(45deg);
  animation: heartbeat 1.1s ease-in-out infinite;
}

.heart:before,
.heart:after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
}

.heart:before {
  top: -10px;
  left: 0;
}

.heart:after {
  top: 0;
  left: -10px;
}

.heart:nth-child(1) {
  animation-delay: 0s;
}

.heart:nth-child(2) {
  animation-delay: 0.2s;
  transform: rotate(45deg) scale(0.8);
}

.heart:nth-child(3) {
  animation-delay: 0.4s;
  transform: rotate(45deg) scale(0.6);
}

@keyframes heartbeat {
  0%,
  100% {
    transform: rotate(45deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: rotate(45deg) scale(1.2);
    opacity: 0.7;
  }
}

/* 应用标题 */
.app-title {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  margin-bottom: 20px;
  animation: titleGlow 2s ease-in-out infinite;
}

@keyframes titleGlow {
  0%,
  100% {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
  }
}

/* 加载提示 */
.loading-hint {
  font-size: 14px;
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
