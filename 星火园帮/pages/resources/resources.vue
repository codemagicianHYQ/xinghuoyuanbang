<template>
  <view class="resources-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索资源"
          @confirm="handleSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
    </view>

    <!-- 资源分类 -->
    <view class="resource-categories">
      <!-- 考试资料 -->
      <view class="category-card exam-card" @click="navigateToCategory('exam')">
        <view class="category-header">
          <text class="category-icon">📚</text>
          <text class="category-title">考试资料</text>
        </view>
        <view class="category-tags">
          <text class="tag" v-for="tag in examTags" :key="tag">{{ tag }}</text>
        </view>
        <view class="category-footer">
          <text class="resource-count" v-if="examCount > 0"
            >{{ examCount }}份资料</text
          >
          <text class="resource-count" v-else>暂无资料</text>
          <text class="arrow-right">></text>
        </view>
      </view>

      <!-- 图书资源 -->
      <view class="category-card book-card" @click="navigateToCategory('book')">
        <view class="category-header">
          <text class="category-icon">📖</text>
          <text class="category-title">图书资源</text>
        </view>
        <view class="category-tags">
          <text class="tag" v-for="tag in bookTags" :key="tag">{{ tag }}</text>
        </view>
        <view class="category-footer">
          <text class="resource-count" v-if="bookCount > 0"
            >{{ bookCount }}本图书</text
          >
          <text class="resource-count" v-else>暂无图书</text>
          <text class="arrow-right">></text>
        </view>
      </view>
    </view>

    <!-- 热门资源 -->
    <view class="hot-section" v-if="hotResources.length > 0">
      <view class="section-header">
        <text class="section-title">🔥 热门资源</text>
        <text class="more-link" @click="viewMore">查看更多</text>
      </view>
      <view class="hot-list">
        <view
          class="hot-item"
          v-for="item in hotResources"
          :key="item.id"
          @click="viewResource(item)"
        >
          <view class="hot-info">
            <text class="hot-title">{{ item.title }}</text>
            <view class="hot-meta">
              <text class="hot-type">{{ item.type }}</text>
              <text class="hot-downloads">{{ item.downloads }}次下载</text>
            </view>
          </view>
          <view class="hot-action">
            <text class="download-btn">获取</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 自定义tabBar -->
    <custom-tab-bar />
  </view>
</template>

<script>
import { mapState } from "vuex";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import request from "@/common/request.js";

export default {
  components: {
    CustomTabBar,
  },
  data() {
    return {
      searchKeyword: "",
      examTags: ["高数", "英语", "专业课"],
      bookTags: ["计算机", "经济学", "文学"],
      examCount: 0,
      bookCount: 0,
      hotResources: [],
      currentCommunity: null, // 当前选择的社区
      categories: [
        {
          id: "hot",
          name: "热门资源",
          icon: "🔥",
          tags: ["推荐", "热门", "精选"],
        },
        {
          id: "book",
          name: "图书资源",
          icon: "📚",
          tags: ["教材", "教辅", "资料"],
        },
        {
          id: "exam",
          name: "考试资料",
          icon: "📝",
          tags: ["真题", "笔记", "题库"],
        },
        {
          id: "paperwork",
          name: "文书模板",
          icon: "📄",
          tags: ["简历", "报告", "论文"],
        },
      ],
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
  },
  onLoad() {
    // 加载当前选择的社区
    this.loadCurrentCommunity();

    // 检查社区类型，如果是小区版，显示提示并重定向
    const communityType = this.currentCommunity?.type || "school";
    const isCampusVersion = communityType === "school";
    if (!isCampusVersion) {
      uni.showModal({
        title: "提示",
        content: "资源功能仅在校园版中可用，小区版暂不支持此功能",
        showCancel: false,
        success: () => {
          // 重定向到首页
          uni.switchTab({
            url: "/pages/home/home",
          });
        },
      });
      return;
    }

    // 加载资源数量
    this.loadResourceCounts();

    // 显示鼓励发布资料的弹窗
    this.showPublishEncouragement();
  },
  onShow() {
    // 同步tabBar状态
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSelected(2); // 资源页面对应索引2
    }
    // 每次显示页面时重新加载资源数量（确保数据同步）
    this.loadResourceCounts();
  },
  methods: {
    loadCurrentCommunity() {
      try {
        const savedCommunity = uni.getStorageSync("selectedCommunity");
        if (savedCommunity) {
          this.currentCommunity = savedCommunity;
          console.log(
            "资源页面加载当前社区:",
            savedCommunity.name,
            "类型:",
            savedCommunity.type
          );
        } else {
          this.currentCommunity = null;
          console.log("资源页面：未选择社区");
        }
      } catch (error) {
        console.error("加载当前社区失败:", error);
        this.currentCommunity = null;
      }
    },
    handleSearch() {
      if (!this.searchKeyword.trim()) return;
      uni.navigateTo({
        url: `/subpages/resources/search?keyword=${encodeURIComponent(
          this.searchKeyword
        )}`,
      });
    },
    navigateToCategory(type) {
      if (type === "campus") {
        // 校园论坛已经移到主页，跳转到校园论坛页面
        uni.navigateTo({
          url: "/pages/campus-interaction",
        });
        return;
      }
      if (type === "exam") {
        // 考试资料跳转到列表页面
        uni.navigateTo({
          url: "/subpages/resources/exam/list",
        });
        return;
      }
      if (type === "book") {
        // 图书资源只显示列表，不提供发布功能
        uni.navigateTo({
          url: "/subpages/resources/book/list",
        });
        return;
      }
      const url = `/subpages/resources/${type}/list`;
      uni.navigateTo({ url });
    },
    viewResource(item) {
      uni.navigateTo({
        url: `/subpages/resources/detail?id=${item.id}`,
      });
    },
    viewMore() {
      uni.navigateTo({
        url: "/subpages/resources/hot",
      });
    },
    async loadResourceCounts() {
      try {
        console.log("开始加载资源数量统计...");
        // 并行请求考试资料和图书的统计信息
        const [examStatsResult, bookStatsResult] = await Promise.all([
          request({
            url: "/exam-resources/stats",
            method: "GET",
            skipCache: true, // 跳过缓存，确保获取最新数据
          }).catch((err) => {
            console.error("获取考试资料统计失败:", err);
            return { success: false, data: { totalResources: 0 } };
          }),
          request({
            url: "/books/stats",
            method: "GET",
            skipCache: true, // 跳过缓存，确保获取最新数据
          }).catch((err) => {
            console.error("获取图书统计失败:", err);
            return { success: false, data: { totalBooks: 0 } };
          }),
        ]);

        console.log("考试资料统计结果:", examStatsResult);
        console.log("图书统计结果:", bookStatsResult);

        // 更新考试资料数量
        if (examStatsResult && examStatsResult.success && examStatsResult.data) {
          this.examCount = examStatsResult.data.totalResources || 0;
          console.log("考试资料数量已更新为:", this.examCount);
        } else {
          this.examCount = 0;
          console.warn("考试资料统计结果格式不正确:", examStatsResult);
        }

        // 更新图书数量
        if (bookStatsResult && bookStatsResult.success && bookStatsResult.data) {
          this.bookCount = bookStatsResult.data.totalBooks || 0;
          console.log("图书数量已更新为:", this.bookCount);
        } else {
          this.bookCount = 0;
          console.warn("图书统计结果格式不正确:", bookStatsResult);
        }
      } catch (error) {
        console.error("加载资源数量失败:", error);
        // 失败时保持默认值 0
        this.examCount = 0;
        this.bookCount = 0;
      }
    },
    showPublishEncouragement() {
      // 检查是否已经显示过弹窗（避免重复显示）
      const hasShown = uni.getStorageSync("resourcePublishEncouragementShown");
      if (hasShown) {
        // 临时清除标记让弹窗重新显示（用于测试）
        uni.removeStorageSync("resourcePublishEncouragementShown");
        console.log("已清除资源页面弹窗标记，弹窗将重新显示");
        // return; // 注释掉return，让弹窗继续显示
      }

      // 立即显示弹窗
      uni.showModal({
        title: "🎓✨ 共创资源宝库",
        content:
          "去考试资料页面发布手上的资料，审核通过后最低一份奖励3元！💰\n\n让我们一起共建丰富的学习资源库，帮助更多同学！🤝",
        confirmText: "去瞅瞅",
        cancelText: "朕知道了",
        success: (res) => {
          if (res.confirm) {
            // 跳转到考试资料页面
            uni.navigateTo({
              url: "/subpages/resources/exam/list",
            });
          }
          // 标记已显示过弹窗
          uni.setStorageSync("resourcePublishEncouragementShown", true);
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.resources-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeef8 0%, #e0f2fe 50%, #f0f9ff 100%);
  padding-bottom: 100rpx;
  position: relative;

  // 添加底部渐变装饰
  &::before {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 300rpx;
    background: linear-gradient(to top, rgba(255, 182, 193, 0.15) 0%, rgba(135, 206, 250, 0.1) 50%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }
}

// 搜索栏
.search-section {
  padding: $uni-spacing-col-base;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(10rpx);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background-color: $uni-bg-color-grey;
  border-radius: 36rpx;
  padding: 0 80rpx 0 32rpx;
  font-size: $uni-font-size-base;
}

.search-icon {
  position: absolute;
  right: 24rpx;
  font-size: 32rpx;
}

// 资源分类
.resource-categories {
  padding: $uni-spacing-col-base;
  position: relative;
  z-index: 1;
}

.category-card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  margin-bottom: $uni-spacing-row-base;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: visible;
  border: 1px solid rgba(255, 255, 255, 0.8);
  // 3D浮动效果
  transform: translateY(0) translateZ(0);
  box-shadow: 
    0 8rpx 24rpx rgba(0, 0, 0, 0.12),
    0 4rpx 8rpx rgba(0, 0, 0, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);

  // 添加左侧高亮边框
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
    background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
    border-radius: $uni-border-radius-lg 0 0 $uni-border-radius-lg;
    transition: width 0.3s ease, box-shadow 0.3s ease;
    z-index: 1;
  }

  // 添加右上角装饰点
  &::after {
    content: '';
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    z-index: 1;
  }

  // 悬停时的3D效果
  &:hover {
    transform: translateY(-8rpx) translateZ(0);
    box-shadow: 
      0 16rpx 40rpx rgba(0, 0, 0, 0.16),
      0 8rpx 16rpx rgba(0, 0, 0, 0.12),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  }

  &:active {
    transform: translateY(-4rpx) scale(0.98) translateZ(0);
    box-shadow: 
      0 12rpx 32rpx rgba(0, 0, 0, 0.14),
      0 6rpx 12rpx rgba(0, 0, 0, 0.1),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    
    &::before {
      width: 8rpx;
    }
    
    &::after {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }
}

// 考试资料卡片 - 蓝紫色主题
.exam-card {
  &::before {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    box-shadow: 
      0 0 16rpx rgba(102, 126, 234, 0.5),
      0 0 8rpx rgba(102, 126, 234, 0.3);
  }

  &::after {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  }

  &:hover {
    box-shadow: 
      0 20rpx 48rpx rgba(102, 126, 234, 0.3),
      0 12rpx 24rpx rgba(102, 126, 234, 0.2),
      0 6rpx 12rpx rgba(102, 126, 234, 0.15),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(102, 126, 234, 0.3);
  }

  &:active {
    box-shadow: 
      0 16rpx 40rpx rgba(102, 126, 234, 0.35),
      0 8rpx 20rpx rgba(102, 126, 234, 0.25),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(102, 126, 234, 0.4);
  }
}

// 图书资源卡片 - 青绿色主题
.book-card {
  &::before {
    background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%);
    box-shadow: 
      0 0 16rpx rgba(17, 153, 142, 0.5),
      0 0 8rpx rgba(17, 153, 142, 0.3);
  }

  &::after {
    background: linear-gradient(135deg, rgba(17, 153, 142, 0.3) 0%, rgba(56, 239, 125, 0.3) 100%);
  }

  &:hover {
    box-shadow: 
      0 20rpx 48rpx rgba(17, 153, 142, 0.3),
      0 12rpx 24rpx rgba(17, 153, 142, 0.2),
      0 6rpx 12rpx rgba(17, 153, 142, 0.15),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(17, 153, 142, 0.3);
  }

  &:active {
    box-shadow: 
      0 16rpx 40rpx rgba(17, 153, 142, 0.35),
      0 8rpx 20rpx rgba(17, 153, 142, 0.25),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(17, 153, 142, 0.4);
  }
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-row-base;
}

.category-icon {
  font-size: 48rpx;
  margin-right: $uni-spacing-col-base;
}

.category-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: $uni-spacing-row-base;
}

.tag {
  padding: 6rpx 16rpx;
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  border-radius: 20rpx;
}

.category-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-count,
.update-time {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.arrow-right {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

// 热门资源
.hot-section {
  padding: 0 $uni-spacing-col-base $uni-spacing-col-base;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-row-base;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
}

.more-link {
  font-size: $uni-font-size-sm;
  color: $uni-color-primary;
}

.hot-list {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base 0;
}

.hot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  border-bottom: 1px solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: $uni-bg-color-hover;
  }
}

.hot-info {
  flex: 1;
}

.hot-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: 8rpx;
  display: block;
}

.hot-meta {
  display: flex;
  gap: $uni-spacing-col-base;
}

.hot-type {
  font-size: 24rpx;
  color: $uni-color-primary;
}

.hot-downloads {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.download-btn {
  padding: 8rpx 24rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  font-size: 24rpx;
  border-radius: 30rpx;
}

// 空状态样式
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $uni-spacing-col-base;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  line-height: 1.5;
}
</style>
