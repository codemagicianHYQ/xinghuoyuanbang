<template>
  <view class="campus-container">
    <!-- 整体布局容器 -->
    <view class="layout-container">
      <!-- 顶部装饰区域 -->
      <view class="header">
        <view class="floating-icons">
          <text class="icon-float icon-1">🎓</text>
          <text class="icon-float icon-2">💬</text>
          <text class="icon-float icon-3">🔍</text>
          <text class="icon-float icon-4">🌟</text>
          <text class="icon-float icon-5">📚</text>
        </view>
        <view class="bubble-animation">
          <view class="bubble bubble-1"></view>
          <view class="bubble bubble-2"></view>
          <view class="bubble bubble-3"></view>
        </view>
        <view class="title-row">
          <text class="main-title">校园论坛</text>
          <text class="sub-title">互动无界，校园相连</text>
        </view>
      </view>

      <!-- 主要内容区域 -->
      <view class="main-content">
        <!-- 左侧分类栏 -->
        <view class="sidebar-filter" :class="{ collapsed: sidebarCollapsed }">
          <!-- 收缩按钮 -->
          <view class="collapse-btn" @click="toggleSidebar">
            <text class="collapse-icon">{{
              sidebarCollapsed ? "▶" : "◀"
            }}</text>
          </view>

          <!-- 分类选项 -->
          <view class="sidebar-tabs" v-show="!sidebarCollapsed">
            <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'all' }"
              @click="selectCategory('all')"
            >
              <text class="tab-icon">🌈</text>
              <text class="sidebar-text">全部</text>
            </view>
            <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'ask' }"
              @click="selectCategory('ask')"
            >
              <text class="tab-icon">❓</text>
              <text class="sidebar-text">问答</text>
            </view>
            <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'lost' }"
              @click="selectCategory('lost')"
            >
              <text class="tab-icon">🔍</text>
              <text class="sidebar-text">寻物</text>
            </view>
            <!-- 捞一捞暂时隐藏，过审时有问题 -->
            <!-- <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'salvage' }"
              @click="selectCategory('salvage')"
            >
              <text class="tab-icon">👋</text>
              <text class="sidebar-text">捞一捞</text>
            </view> -->
            <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'complaint' }"
              @click="selectCategory('complaint')"
            >
              <text class="tab-icon">💬</text>
              <text class="sidebar-text">吐槽</text>
            </view>
            <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'share' }"
              @click="selectCategory('share')"
            >
              <text class="tab-icon">📤</text>
              <text class="sidebar-text">分享</text>
            </view>
            <!-- 学习伙伴暂时隐藏，过审时有问题 -->
            <!-- <view
              class="sidebar-tab"
              :class="{ active: selectedCategory === 'partner' }"
              @click="selectCategory('partner')"
            >
              <text class="tab-icon">🤝</text>
              <text class="sidebar-text">学习伙伴</text>
            </view> -->
          </view>
        </view>

        <!-- 右侧内容区域 -->
        <view class="content-area" :class="{ 'grid-mode': sidebarCollapsed }">
          <!-- 未选择社区提示 -->
          <view v-if="!currentCommunity" class="no-community-prompt">
            <view class="prompt-icon">📍</view>
            <text class="prompt-title">请先选择社区</text>
            <text class="prompt-subtitle"
              >选择社区后即可查看该社区的校园论坛</text
            >
            <button class="select-community-btn" @click="goToSelectCommunity">
              去选择社区
            </button>
          </view>

          <!-- 互动列表 -->
          <view class="campus-list" v-else-if="campusActivities.length > 0">
            <view
              class="campus-card"
              v-for="activity in filteredActivities"
              :key="activity.id"
              @click="goToDetail(activity.id)"
            >
              <view class="card-header">
                <view
                  class="activity-type"
                  :class="'type-' + activity.activityType"
                >
                  <text class="type-icon">{{
                    getActivityTypeIcon(activity.activityType)
                  }}</text>
                  <text class="type-text">{{
                    getActivityTypeLabel(activity.activityType)
                  }}</text>
                </view>
                <view class="activity-status" :class="activity.status">
                  {{ getStatusText(activity.status) }}
                </view>
              </view>

              <view class="activity-title">{{ activity.title }}</view>
              <view class="activity-description">{{
                activity.description || activity.specifics
              }}</view>

              <view class="activity-info">
                <view class="info-item" v-if="activity.activityDate">
                  <text class="info-icon">📅</text>
                  <text class="info-text">{{
                    formatDate(activity.activityDate)
                  }}</text>
                </view>
                <view class="info-item" v-if="activity.locationText">
                  <text class="info-icon">📍</text>
                  <text class="info-text">{{ activity.locationText }}</text>
                </view>
                <view class="info-item" v-if="activity.maxParticipants">
                  <text class="info-icon">👥</text>
                  <text class="info-text"
                    >{{ activity.currentParticipants || 0 }}/{{
                      activity.maxParticipants
                    }}人</text
                  >
                </view>
              </view>

              <view class="card-footer">
                <view class="publisher-info">
                  <image
                    class="avatar"
                    :src="
                      activity.publisherAvatar ||
                      '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <text class="publisher-name">{{
                    activity.publisherName || "匿名用户"
                  }}</text>
                </view>
                <text class="publish-time">{{
                  formatTime(activity.createdAt || activity.publishTime)
                }}</text>
              </view>
            </view>
          </view>

          <!-- 加载中 -->
          <view v-else-if="isLoading" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>

          <!-- 加载更多 -->
          <view v-if="loadingMore && currentCommunity" class="loading-more">
            <view class="loading-spinner-small"></view>
            <text class="loading-text">加载更多...</text>
          </view>

          <!-- 空状态 -->
          <view
            v-else-if="campusActivities.length === 0 && currentCommunity"
            class="empty-state"
          >
            <view class="empty-image">🎉</view>
            <text class="empty-text">还没有校园论坛</text>
            <text class="empty-subtext">快来发布第一个校园论坛吧！</text>
          </view>

          <!-- 右下角发布按钮（只在已选择社区时显示） -->
          <view v-if="currentCommunity" class="fab-container">
            <button class="fab-button" @click="showPublishMenu = true">
              <text class="plus-icon">+</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布菜单弹窗 -->
    <view
      class="publish-menu"
      v-if="showPublishMenu"
      @click="showPublishMenu = false"
    >
      <view class="menu-content" @click.stop>
        <view class="menu-title">选择发布类型</view>
        <view class="menu-options">
          <!-- 第一行 -->
          <view class="menu-option ask-option" @click="goToPublish('ask')">
            <view class="option-bg">
              <text class="option-icon">❓</text>
            </view>
            <text class="option-text">问答</text>
          </view>
          <view class="menu-option lost-option" @click="goToPublish('lost')">
            <view class="option-bg">
              <text class="option-icon">🔍</text>
            </view>
            <text class="option-text">寻物</text>
          </view>
          <!-- 捞一捞暂时隐藏，过审时有问题 -->
          <!-- <view
            class="menu-option salvage-option"
            @click="goToPublish('salvage')"
          >
            <view class="option-bg">
              <text class="option-icon">👋</text>
            </view>
            <text class="option-text">捞一捞</text>
          </view> -->

          <!-- 第二行 -->
          <view
            class="menu-option complaint-option"
            @click="goToPublish('complaint')"
          >
            <view class="option-bg">
              <text class="option-icon">💬</text>
            </view>
            <text class="option-text">吐槽</text>
          </view>
          <view class="menu-option share-option" @click="goToPublish('share')">
            <view class="option-bg">
              <text class="option-icon">📤</text>
            </view>
            <text class="option-text">分享</text>
          </view>
          <!-- 学习伙伴暂时隐藏，过审时有问题 -->
          <!-- <view
            class="menu-option partner-option"
            @click="goToPublish('partner')"
          >
            <view class="option-bg">
              <text class="option-icon">🤝</text>
            </view>
            <text class="option-text">学习伙伴</text>
          </view> -->
        </view>
        <view class="menu-cancel" @click="showPublishMenu = false">取消</view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      campusActivities: [],
      selectedCategory: "all",
      isLoading: false,
      userInfo: null,
      showPublishMenu: false,
      sidebarCollapsed: true,
      // 添加缓存和分页相关数据
      cacheData: new Map(), // 缓存已加载的数据
      lastLoadTime: 0, // 上次加载时间
      cacheExpiry: 5 * 60 * 1000, // 缓存过期时间（5分钟）
      page: 1,
      pageSize: 10,
      hasMore: true,
      loadingMore: false,
      eventListenerRegistered: false, // 事件监听器注册标志
      currentCommunity: null, // 当前选择的社区
    };
  },

  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),

    filteredActivities() {
      if (this.selectedCategory === "all") {
        return this.campusActivities;
      }
      return this.campusActivities.filter(
        (activity) =>
          activity.postType === this.selectedCategory ||
          activity.activityType === this.selectedCategory ||
          activity.type === this.selectedCategory
      );
    },
  },

  onLoad() {
    console.log("DEBUG: main.vue onLoad 被调用");
    this.getUserInfo();
    this.loadCurrentCommunity(); // 加载当前社区
    this.loadCampusActivities(true); // 首次加载

    // 监听刷新事件
    console.log("DEBUG: 注册刷新事件监听器");
    uni.$on("refreshCampusList", () => {
      console.log("DEBUG: 收到刷新事件，准备重新加载列表");
      this.loadCampusActivities(true);
      console.log("DEBUG: 列表重新加载完成");
    });
    console.log("DEBUG: 刷新事件监听器注册完成");
  },

  onShow() {
    console.log("DEBUG: main.vue onShow 被调用");

    // 重新加载当前社区（从选择社区页面返回时可能已更改）
    this.loadCurrentCommunity();

    // 确保事件监听器已注册（防止页面栈问题）
    if (!this.eventListenerRegistered) {
      console.log("DEBUG: 在 onShow 中注册刷新事件监听器");
      uni.$on("refreshCampusList", () => {
        console.log("DEBUG: 收到刷新事件，准备重新加载列表");
        this.loadCampusActivities(true);
        console.log("DEBUG: 列表重新加载完成");
      });
      this.eventListenerRegistered = true;
    }

    // 检查缓存是否过期（只在已选择社区时）
    if (this.currentCommunity) {
      const now = Date.now();
      if (now - this.lastLoadTime > this.cacheExpiry) {
        this.loadCampusActivities(true); // 缓存过期，重新加载
      } else {
        this.loadCampusActivities(false); // 使用缓存
      }
    }
  },

  onUnload() {
    // 页面卸载时移除事件监听
    uni.$off("refreshCampusList");
  },

  onPullDownRefresh() {
    this.loadCampusActivities(true).then(() => {
      uni.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMoreActivities();
    }
  },

  methods: {
    async getUserInfo() {
      try {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    },

    // 加载当前选择的社区
    loadCurrentCommunity() {
      try {
        const savedCommunity = uni.getStorageSync("selectedCommunity");
        if (savedCommunity) {
          this.currentCommunity = savedCommunity;
        } else {
          this.currentCommunity = null;
        }
      } catch (error) {
        console.error("加载当前社区失败:", error);
        this.currentCommunity = null;
      }
    },

    // 跳转到选择社区页面
    goToSelectCommunity() {
      uni.navigateTo({
        url: "/subpages/community/select-community",
      });
    },

    // 优化的数据加载方法
    async loadCampusActivities(forceRefresh = false) {
      console.log(
        `DEBUG: loadCampusActivities 被调用，forceRefresh=${forceRefresh}`
      );

      // 如果使用缓存且缓存未过期
      if (
        !forceRefresh &&
        this.cacheData.size > 0 &&
        Date.now() - this.lastLoadTime < this.cacheExpiry
      ) {
        console.log("使用缓存数据");
        this.campusActivities = this.getAllCachedActivities();
        return;
      }

      console.log("DEBUG: 开始重新加载数据，跳过缓存");
      this.isLoading = true;
      this.page = 1;
      this.hasMore = true;

      try {
        // 优先加载当前选中的分类数据
        await this.loadCategoryData(this.selectedCategory, true, forceRefresh);

        // 如果当前分类是"全部"，则加载所有分类的数据
        if (this.selectedCategory === "all") {
          await this.loadAllCategoriesData(forceRefresh);
        }

        this.lastLoadTime = Date.now();
        this.campusActivities = this.getAllCachedActivities();

        console.log(`加载完成，共 ${this.campusActivities.length} 条数据`);
      } catch (error) {
        console.error("加载校园论坛失败:", error);
        this.campusActivities = [];
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 加载指定分类的数据
    async loadCategoryData(
      category,
      isFirstLoad = false,
      forceRefresh = false
    ) {
      if (category === "all") return;

      const cacheKey = category;

      // 检查缓存（强制刷新时跳过缓存）
      if (!isFirstLoad && !forceRefresh && this.cacheData.has(cacheKey)) {
        return;
      }

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        console.warn(`加载 ${category} 分类失败: 未选择社区`);
        return;
      }

      try {
        console.log(`加载 ${category} 分类数据...`);
        const result = await request({
          url: "/campus-interactions",
          method: "GET",
          data: {
            type: category,
            page: this.page,
            pageSize: this.pageSize,
            communityId: currentCommunity.id, // 添加社区ID
          },
        });

        if (result.success && result.data) {
          const data = Array.isArray(result.data.list) ? result.data.list : [];
          const processedData = this.processActivityData(data, category);

          // 缓存数据
          this.cacheData.set(cacheKey, processedData);
          console.log(
            `${category} 分类加载完成，${processedData.length} 条数据`
          );
        }
      } catch (error) {
        console.error(`加载 ${category} 分类失败:`, error);
      }
    },

    // 加载所有分类数据
    async loadAllCategoriesData(forceRefresh = false) {
      const categories = [
        "ask",
        "lost",
        "salvage",
        "complaint",
        "share",
        "partner",
      ];

      // 并行加载所有分类，但限制并发数
      const batchSize = 3; // 每次最多3个并发请求
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        await Promise.all(
          batch.map((category) =>
            this.loadCategoryData(category, true, forceRefresh)
          )
        );
      }
    },

    // 处理活动数据
    processActivityData(data, category) {
      return data.map((item) => ({
        ...item,
        activityType: category,
        type: category,
        publisherName: item.isAnonymous
          ? "匿名用户"
          : item.creator?.nickname || "匿名用户",
        publisherAvatar: item.isAnonymous
          ? "/static/images/default-avatar.png"
          : item.creator?.avatarUrl || "/static/images/default-avatar.png",
      }));
    },

    // 获取所有缓存的活动数据
    getAllCachedActivities() {
      let allActivities = [];
      for (const [category, data] of this.cacheData) {
        allActivities = allActivities.concat(data);
      }

      // 按时间排序
      return allActivities.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.publishTime || 0);
        const timeB = new Date(b.createdAt || b.publishTime || 0);
        return timeB - timeA;
      });
    },

    // 加载更多数据
    async loadMoreActivities() {
      if (this.loadingMore || !this.hasMore) return;

      this.loadingMore = true;
      this.page++;

      try {
        await this.loadCategoryData(this.selectedCategory, false);

        // 更新显示数据
        this.campusActivities = this.getAllCachedActivities();

        // 检查是否还有更多数据
        // 这里可以根据实际API返回的数据来判断
        // 暂时设置为false，避免无限加载
        this.hasMore = false;
      } catch (error) {
        console.error("加载更多数据失败:", error);
        this.page--; // 回退页码
      } finally {
        this.loadingMore = false;
      }
    },

    async selectCategory(category) {
      this.selectedCategory = category;

      // 如果切换到"全部"分类，确保所有数据都已加载
      if (category === "all") {
        if (this.cacheData.size < 6) {
          // 6个分类
          console.log("切换到全部分类，加载所有数据...");
          await this.loadAllCategoriesData();
          this.campusActivities = this.getAllCachedActivities();
        }
      } else {
        // 如果切换到具体分类，确保该分类数据已加载
        if (!this.cacheData.has(category)) {
          console.log(`切换到 ${category} 分类，加载数据...`);
          await this.loadCategoryData(category, true);
          this.campusActivities = this.getAllCachedActivities();
        }
      }
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    getActivityTypeLabel(type) {
      const typeMap = {
        ask: "问答",
        lost: "寻物",
        salvage: "捞一捞",
        complaint: "吐槽",
        share: "分享",
        partner: "学习伙伴",
      };
      return typeMap[type] || "校园论坛";
    },

    getActivityTypeIcon(type) {
      const iconMap = {
        ask: "❓",
        lost: "🔍",
        salvage: "👋",
        complaint: "💬",
        share: "📤",
        partner: "🤝",
      };
      return iconMap[type] || "🎯";
    },

    getStatusText(status) {
      const statusMap = {
        active: "进行中",
        completed: "已结束",
        cancelled: "已取消",
        pending: "待处理",
        resolved: "已解决",
      };
      return statusMap[status] || "进行中";
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },

    formatTime(timeStr) {
      if (!timeStr) return "";
      const now = new Date();
      const time = new Date(timeStr);
      const diff = now - time;

      if (diff < 60000) return "刚刚";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${Math.floor(diff / 86400000)}天前`;
    },

    goToDetail(id) {
      uni.navigateTo({
        url: `/subpages/campus-interact/detail?id=${id}`,
      });
    },

    e0() {
      this.showPublishMenu = true;
    },

    goToPublish(type) {
      this.showPublishMenu = false;
      let url = "";
      switch (type) {
        case "ask":
          url = "/subpages/campus-interact/publish-ask";
          break;
        case "lost":
          url = "/subpages/campus-interact/publish-lost";
          break;
        case "salvage":
          url = "/subpages/campus-interact/publish-salvage";
          break;
        case "complaint":
          url = "/subpages/campus-interact/publish-complaint";
          break;
        case "share":
          url = "/subpages/campus-interact/publish-share";
          break;
        case "partner":
          url = "/subpages/campus-interact/publish-partner";
          break;
        default:
          url = "/subpages/campus-interact/publish-ask"; // 默认跳转到问答
      }
      uni.navigateTo({ url });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.campus-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: relative;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  padding: 30rpx 32rpx 20rpx;
  border-radius: 0 0 40rpx 40rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  flex-shrink: 0;

  .floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    .icon-float {
      position: absolute;
      font-size: 40rpx;
      opacity: 0.15;

      &.icon-1 {
        top: 8rpx;
        right: 8%;
      }

      &.icon-2 {
        top: 8rpx;
        left: 8%;
      }

      &.icon-3 {
        bottom: 8rpx;
        right: 12%;
      }

      &.icon-4 {
        bottom: 8rpx;
        left: 12%;
      }

      &.icon-5 {
        top: 50%;
        left: 8%;
        transform: translateY(-50%);
      }
    }
  }

  .bubble-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .bubble {
      position: absolute;
      border-radius: 50%;
      animation: bubble-float 3s ease-in-out infinite;

      &.bubble-1 {
        width: 60rpx;
        height: 60rpx;
        background: rgba(255, 255, 255, 0.15);
        top: 20%;
        left: 15%;
        animation-delay: 0s;
      }

      &.bubble-2 {
        width: 40rpx;
        height: 40rpx;
        background: rgba(255, 255, 255, 0.1);
        top: 60%;
        right: 20%;
        animation-delay: 1s;
      }

      &.bubble-3 {
        width: 80rpx;
        height: 80rpx;
        background: rgba(255, 255, 255, 0.08);
        bottom: 25%;
        left: 60%;
        animation-delay: 2s;
      }
    }
  }
}

.title-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.main-title {
  font-size: 44rpx;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.sub-title {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  text-align: center;
  letter-spacing: 1rpx;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

@keyframes bubble-float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.3;
  }
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.sidebar-filter {
  width: 200rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  border-right: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 4rpx 0 12rpx rgba(0, 0, 0, 0.05);
  border-radius: 0 20rpx 20rpx 0;
  transition: width 0.3s ease;
  position: relative;
  height: fit-content;
  max-height: calc(100vh - 200rpx);

  &.collapsed {
    width: 60rpx;
  }
}

.collapse-btn {
  position: absolute;
  top: 20rpx;
  right: -20rpx;
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.3);
  z-index: 10;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }

  .collapse-icon {
    color: #ffffff;
    font-size: 20rpx;
    font-weight: bold;
  }
}

.sidebar-tabs {
  padding-top: 60rpx;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.sidebar-tab {
  padding: 20rpx 16rpx;
  margin: 8rpx 12rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: rgba(78, 205, 196, 0.1);
    transform: translateX(4rpx);
  }

  &.active {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.3);
    transform: translateX(8rpx);

    .tab-icon {
      transform: scale(1.1);
    }

    .sidebar-text {
      color: #ffffff;
      font-weight: 600;
    }
  }
}

.tab-icon {
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.sidebar-text {
  font-size: 22rpx;
  color: $uni-text-color-grey;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
  display: block;
}

.content-area {
  flex: 1;
  padding: 0 24rpx;
  position: relative;
  transition: margin-left 0.3s ease;
}

.campus-list {
  padding: 24rpx 0;
}

/* 侧边栏收起时的双列布局 */
.content-area.grid-mode .campus-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 24rpx 0;
}

.content-area.grid-mode .campus-card {
  margin-bottom: 0;
  padding: 24rpx;
}

.campus-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(
      90deg,
      #4ecdc4 0%,
      #ff9500 30%,
      #667eea 60%,
      #ff6b6b 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    transform: translateY(-2rpx) scale(0.98);
  }

  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
    border-color: rgba(78, 205, 196, 0.2);

    &::before {
      opacity: 1;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.activity-type {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  padding: 10rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 600;
  transition: all 0.3s ease;

  .type-icon {
    font-size: 20rpx;
  }

  .type-text {
    font-size: 24rpx;
  }

  &.type-ask {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  &.type-lost {
    background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
    color: #ffffff;
  }

  &.type-salvage {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: #ffffff;
  }

  &.type-complaint {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
    color: #ffffff;
  }

  &.type-share {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: #ffffff;
  }

  &.type-partner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}

.activity-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 500;

  &.active {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
  }

  &.completed {
    background-color: rgba(149, 165, 166, 0.1);
    color: #95a5a6;
  }

  &.cancelled {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
}

.activity-title {
  font-size: 32rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.activity-description {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.activity-info {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 20rpx;
}

.info-text {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid $uni-border-color;
  padding-top: 20rpx;
}

.publisher-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

.publisher-name {
  font-size: 26rpx;
  color: $uni-text-color;
  font-weight: 500;
}

.publish-time {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  width: 100%;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid $uni-border-color;
  border-left-color: $uni-color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: $uni-text-color-grey;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  width: 100%;
}

.loading-spinner-small {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid $uni-border-color;
  border-left-color: $uni-color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  width: 100%;
}

.empty-image {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: $uni-text-color-grey;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.empty-subtext {
  font-size: 28rpx;
  color: $uni-text-color-placeholder;
}

.no-community-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  width: 100%;
}

.prompt-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.prompt-title {
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 16rpx;
  text-align: center;
}

.prompt-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 48rpx;
  text-align: center;
  line-height: 1.5;
}

.select-community-btn {
  width: 100%;
  max-width: 500rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(78, 205, 196, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.3);
  }
}

.fab-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  z-index: 100;
}

.fab-button {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
  border-radius: 60rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.plus-icon {
  font-size: 60rpx;
  color: #ffffff;
  font-weight: 300;
}

.publish-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.menu-content {
  width: 100%;
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 48rpx 0 32rpx 0;
}

.menu-title {
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  margin-bottom: 32rpx;
  color: #222;
}

.menu-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
  padding: 0 24rpx;
}

.menu-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 120rpx;

  .option-bg {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    transition: all 0.3s ease;
  }

  .option-icon {
    font-size: 36rpx;
    color: #ffffff;
  }

  .option-text {
    font-size: 24rpx;
    font-weight: 500;
    color: $uni-text-color;
    transition: all 0.3s ease;
  }

  &.ask-option .option-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.lost-option .option-bg {
    background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
  }

  &.salvage-option .option-bg {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  }

  &.complaint-option .option-bg {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
  }

  &.share-option .option-bg {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  }

  &.partner-option .option-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &:active {
    transform: scale(0.95);
  }

  &:hover {
    transform: translateY(-4rpx);

    .option-bg {
      transform: scale(1.1);
      box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.2);
    }
  }
}

.menu-cancel {
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #888;
  border-top: 1px solid #eee;
  margin-top: 16rpx;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 44rpx;
  transition: all 0.3s ease;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>
