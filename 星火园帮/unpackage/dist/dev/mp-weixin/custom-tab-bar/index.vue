<template>
  <view class="custom-tabbar">
    <view
      class="tabbar-item"
      v-for="(item, index) in filteredTabList"
      :key="index"
      :class="{
        active: activeIndex === index,
      }"
      @click="switchTab(index, item)"
    >
      <view class="tabbar-icon-wrapper">
        <image
          class="tabbar-icon"
          :src="activeIndex === index ? item.selectedIconPath : item.iconPath"
          mode="aspectFit"
          @error="onImageError"
          @load="onImageLoad"
        />
        <view class="glow-effect" v-if="activeIndex === index"></view>
      </view>
      <text class="tabbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "CustomTabBar",
  data() {
    return {
      selected: 0, // 默认选中第一个
      currentCommunity: null, // 当前选择的社区
      tabList: [
        {
          pagePath: "pages/home/home",
          iconPath: "/static/tabbar/home.png",
          selectedIconPath: "/static/tabbar/home-active.png",
          text: "首页",
        },
        {
          pagePath: "pages/tasks",
          iconPath: "/static/tabbar/orders.png",
          selectedIconPath: "/static/tabbar/orders_active.png",
          text: "订单",
        },
        {
          pagePath: "subpages/profile/messages",
          iconPath: "/static/icons/megaphone.png",
          selectedIconPath: "/static/icons/megaphone.png",
          text: "消息",
          version: "community", // 只在小区版显示
        },
        {
          pagePath: "pages/resources/resources",
          iconPath: "/static/tabbar/resouce.png",
          selectedIconPath: "/static/tabbar/resouce_active.png",
          text: "资源",
          version: "campus", // 只在校园版显示
        },
        {
          pagePath: "pages/profile/profile",
          iconPath: "/static/tabbar/profile.png",
          selectedIconPath: "/static/tabbar/profile_active.png",
          text: "我的",
        },
      ],
    };
  },
  computed: {
    // 计算属性，确保响应式更新
    activeIndex() {
      return this.selected;
    },
    // 根据社区类型过滤tab列表
    filteredTabList() {
      const communityType = this.currentCommunity?.type || "school";
      const isCampusVersion = communityType === "school";
      // 如果是小区版，过滤掉资源标签
      if (!isCampusVersion) {
        return this.tabList.filter(
          (tab) => !tab.version || tab.version === "community"
        );
      }
      // 校园版显示所有标签
      return this.tabList.filter(
        (tab) => !tab.version || tab.version === "campus"
      );
    },
  },
  watch: {
    // 监听selected变化，强制更新视图
    selected: {
      handler(newVal, oldVal) {
        console.log("selected变化:", oldVal, "->", newVal);
        // 立即强制更新，不使用nextTick
        this.$forceUpdate();
      },
      immediate: true,
    },
  },
  mounted() {
    console.log("自定义tabBar已挂载");
    this.loadCurrentCommunity();
    this.setCurrentIndex();
    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChange);
  },
  beforeDestroy() {
    // 清理事件监听
    uni.$off("communityChanged", this.handleCommunityChange);
  },
  methods: {
    switchTab(index, item) {
      if (this.selected === index) return;

      console.log("切换tab，从", this.selected, "到", index);

      // 判断是否是 tabBar 页面（pages 开头的路径）
      // 如果是 subpages 开头的路径，使用 navigateTo
      if (item.pagePath.startsWith("subpages/")) {
        uni.navigateTo({
          url: `/${item.pagePath}`,
        });
      } else {
        // tabBar 页面使用 switchTab
        uni.switchTab({
          url: `/${item.pagePath}`,
        });
      }
    },

    loadCurrentCommunity() {
      try {
        const savedCommunity = uni.getStorageSync("selectedCommunity");
        if (savedCommunity) {
          this.currentCommunity = savedCommunity;
          console.log(
            "底部导航栏加载当前社区:",
            savedCommunity.name,
            "类型:",
            savedCommunity.type
          );
        } else {
          this.currentCommunity = null;
          console.log("底部导航栏：未选择社区");
        }
      } catch (error) {
        console.error("加载当前社区失败:", error);
        this.currentCommunity = null;
      }
    },
    handleCommunityChange(community) {
      console.log("底部导航栏收到社区变化事件:", community);
      this.currentCommunity = community;
      // 强制更新视图
      this.$forceUpdate();
    },
    setCurrentIndex() {
      try {
        const pages = getCurrentPages();
        if (pages && pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          const currentRoute = currentPage.route;
          console.log("当前页面路径:", currentRoute);

          // 查找匹配的tab项，支持完整路径匹配和部分路径匹配
          const index = this.filteredTabList.findIndex((item) => {
            // 完全匹配
            if (item.pagePath === currentRoute) {
              return true;
            }
            // 对于 subpages 路径，检查是否包含
            if (
              item.pagePath.startsWith("subpages/") &&
              currentRoute.includes(item.pagePath.replace("subpages/", ""))
            ) {
              return true;
            }
            return false;
          });

          if (index !== -1) {
            this.selected = index;
            console.log("设置当前tab索引:", index);
          } else {
            console.log("未找到匹配的tab页面");
          }
        } else {
          console.log("页面栈为空");
        }
      } catch (error) {
        console.error("设置当前索引时出错:", error);
      }
    },

    addClickGlow(index) {
      // 这个方法现在不再使用，发光效果直接在switchTab中处理
      console.log("addClickGlow被调用，索引:", index);
    },

    onImageError(e) {
      console.error("图标加载失败:", e);
    },

    onImageLoad(e) {
      console.log("图标加载成功:", e);
    },

    // 供页面调用的方法，用于同步tabBar状态
    setSelected(index) {
      if (
        index >= 0 &&
        index < this.tabList.length &&
        this.selected !== index
      ) {
        this.selected = index;
        console.log("外部设置selected:", index);
      }
    },

    // 兼容原生小程序的setData方法
    setData(data) {
      if (data && typeof data === "object") {
        Object.keys(data).forEach((key) => {
          if (key in this.$data && this[key] !== data[key]) {
            this[key] = data[key];
            console.log("setData设置", key, ":", data[key]);
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 115rpx !important;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  border-top: 1rpx solid rgba(74, 144, 226, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 5rpx 10rpx !important;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 9999;
  width: 100%;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rpx 8rpx;
  border-radius: 12rpx;
  transition: none; /* 移除过渡动画，避免选中状态切换时的跳跃 */
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-width: 60rpx;
}

.tabbar-item:active {
  transform: scale(0.95);
  background: rgba(61, 106, 255, 0.2);
  box-shadow: 0 0 40rpx 8rpx rgba(0, 142, 236, 0.6);
}

.tabbar-item.active {
  background: linear-gradient(
    135deg,
    rgba(61, 106, 255, 0.2) 0%,
    rgba(0, 142, 236, 0.2) 100%
  );
  box-shadow: 0 0 20rpx 3rpx rgba(0, 142, 236, 0.6);
  border-radius: 16rpx;
}

.tabbar-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.tabbar-icon {
  width: 48rpx;
  height: 48rpx;
  transition: none; /* 移除过渡动画，避免选中状态切换时的跳跃 */
}

.tabbar-item.active .tabbar-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 6rpx rgba(0, 142, 236, 0.6));
}

.tabbar-item:active .tabbar-icon {
  transform: scale(1.2);
  filter: drop-shadow(0 0 12rpx rgba(0, 142, 236, 0.9));
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80rpx;
  height: 60rpx;
  background: radial-gradient(
    circle,
    rgba(0, 142, 236, 0.3) 0%,
    rgba(0, 142, 236, 0.1) 50%,
    transparent 100%
  );
  border-radius: 50%;
  animation: pulse 2s infinite;
  transition: none; /* 移除过渡动画，避免闪烁 */
}

.tabbar-text {
  font-size: 22rpx;
  color: #7a7e83;
  transition: none; /* 移除过渡动画，避免选中状态切换时的跳跃 */
  font-weight: 400;
}

.tabbar-item.active .tabbar-text {
  color: #4a90e2;
  font-weight: 600;
}

.tabbar-item:active .tabbar-text {
  color: #fff;
  text-shadow: 0 0 15rpx rgba(0, 142, 236, 0.9);
}

/* 脉冲发光动画 */
@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
}

/* 安全区域适配 */
.custom-tabbar {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
