<template>
  <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <!-- 左侧社区选择器 -->
      <view class="community-selector" @click="goToSelectCommunity">
        <text class="location-icon">📍</text>
        <text class="community-text">{{ getCurrentCommunityName() }}</text>
        <text class="dropdown-icon">▼</text>
      </view>

      <!-- 中间标题 (已移除) -->

      <!-- 右侧操作按钮 (已移除) -->
    </view>
  </view>
</template>

<script>
export default {
  name: "CustomNavBar",
  props: {
    title: {
      type: String,
      default: "星火园帮",
    },
  },
  data() {
    return {
      statusBarHeight: 0,
      currentCommunity: null,
    };
  },
  mounted() {
    this.getStatusBarHeight();
    this.loadCurrentCommunity();
    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChanged);
  },
  beforeDestroy() {
    uni.$off("communityChanged", this.handleCommunityChanged);
  },
  methods: {
    // 获取状态栏高度
    getStatusBarHeight() {
      try {
        // 尝试使用新的API
        const windowInfo = uni.getWindowInfo();
        this.statusBarHeight = windowInfo.statusBarHeight || 20;
      } catch (error) {
        try {
          // 如果新API不可用，使用旧API
          const systemInfo = uni.getSystemInfoSync();
          this.statusBarHeight = systemInfo.statusBarHeight || 20;
        } catch (e) {
          console.warn("无法获取状态栏高度，使用默认值");
          this.statusBarHeight = 20;
        }
      }
    },

    // 加载当前选择的社区
    loadCurrentCommunity() {
      const savedCommunity = uni.getStorageSync("selectedCommunity");
      if (savedCommunity) {
        this.currentCommunity = savedCommunity;
      }
    },

    // 处理社区变化事件
    handleCommunityChanged(community) {
      this.currentCommunity = community;
      this.$emit("communityChanged", community);
    },

    // 获取当前社区名称
    getCurrentCommunityName() {
      return this.currentCommunity ? this.currentCommunity.name : "请选择社区";
    },

    // 跳转到社区选择页面
    goToSelectCommunity() {
      uni.navigateTo({
        url: "/subpages/community/select-community",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-bottom: 1rpx solid rgba(240, 240, 240, 0.5);

  .navbar-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    position: relative;

    .community-selector {
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      max-width: 320rpx;
      padding: 12rpx 20rpx;
      border-radius: 50rpx;
      background: rgba(255, 107, 53, 0.25);
      border: 2rpx solid rgba(255, 107, 53, 0.3);
      box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.15);
      transition: all 0.3s ease;

      &:active {
        background: rgba(255, 107, 53, 0.35);
        transform: scale(0.95);
        box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.25);
      }

      .location-icon {
        font-size: 28rpx;
        margin-right: 10rpx;
        color: #ff6b35;
      }

      .community-text {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        margin-right: 8rpx;
        max-width: 200rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-icon {
        font-size: 20rpx;
        color: #ff6b35;
        font-weight: bold;
      }
    }
  }
}
</style>
