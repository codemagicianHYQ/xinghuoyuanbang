<template>
  <view class="resource-list-container">
    <view class="search-bar">
      <input
        class="search-input"
        v-model="searchKeyword"
        placeholder="搜索资源"
        @confirm="onSearch"
      />
      <text class="search-icon">🔍</text>
    </view>

    <view class="category-tabs">
      <view
        class="tab-item"
        :class="{ active: currentCategory === category.id }"
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </view>
    </view>

    <view class="resource-list" v-if="resourceList.length > 0">
      <view
        class="resource-item"
        v-for="item in resourceList"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <image
          class="resource-image"
          :src="item.coverImage || '/static/images/default-resource.png'"
          mode="aspectFill"
        />
        <view class="resource-info">
          <text class="resource-title">{{ item.title }}</text>
          <text class="resource-desc">{{ item.description }}</text>
          <view class="resource-meta">
            <text class="publish-time">{{ item.publishTime }}</text>
            <text class="view-count">{{ item.viewCount }}次浏览</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <image
        class="empty-image"
        src="/static/images/empty-box.png"
        mode="aspectFit"
      />
      <text class="empty-text">暂无资源</text>
    </view>

    <view class="publish-btn" @click="goToPublish">
      <text class="btn-icon">+</text>
      <text class="btn-text">发布</text>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      searchKeyword: "",
      currentCategory: "all",
      categories: [
        { id: "all", name: "全部" },
        { id: "study", name: "学习资料" },
        { id: "life", name: "生活服务" },
        { id: "other", name: "其他" },
      ],
      resourceList: [],
      isLoading: false,
      page: 1,
      hasMore: true,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
  },
  onLoad() {
    this.loadResourceList();
  },
  onReachBottom() {
    if (this.hasMore && !this.isLoading) {
      this.loadMoreResources();
    }
  },
  onPullDownRefresh() {
    this.refreshList();
  },
  methods: {
    selectCategory(categoryId) {
      this.currentCategory = categoryId;
      this.page = 1;
      this.resourceList = [];
      this.loadResourceList();
    },
    onSearch() {
      this.page = 1;
      this.resourceList = [];
      this.loadResourceList();
    },
    async loadResourceList() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        const params = {
          page: this.page,
          pageSize: 10,
          category: this.currentCategory === "all" ? "" : this.currentCategory,
          keyword: this.searchKeyword,
        };

        // 模拟数据
        const mockData = [
          {
            id: 1,
            title: "高等数学期末复习资料",
            description: "包含重点公式和典型例题",
            coverImage: "/static/images/resource1.jpg",
            publishTime: "2024-03-20",
            viewCount: 128,
          },
          {
            id: 2,
            title: "计算机网络实验指导书",
            description: "详细的实验步骤和代码示例",
            coverImage: "/static/images/resource2.jpg",
            publishTime: "2024-03-19",
            viewCount: 256,
          },
        ];

        if (this.page === 1) {
          this.resourceList = mockData;
        } else {
          this.resourceList = [...this.resourceList, ...mockData];
        }

        this.hasMore = mockData.length >= 10;
      } catch (error) {
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    loadMoreResources() {
      this.page++;
      this.loadResourceList();
    },
    refreshList() {
      this.page = 1;
      this.resourceList = [];
      this.loadResourceList().then(() => {
        uni.stopPullDownRefresh();
      });
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/subpages/resources/detail?id=${id}`,
      });
    },
    goToPublish() {
      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login",
          });
        }, 1500);
        return;
      }
      uni.navigateTo({
        url: "/subpages/resources/publish",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.resource-list-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.search-bar {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color;
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input {
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

.category-tabs {
  display: flex;
  padding: $uni-spacing-col-sm $uni-spacing-col-base;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
}

.tab-item {
  padding: 12rpx 24rpx;
  margin-right: $uni-spacing-col-base;
  border-radius: 30rpx;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
  transition: all 0.3s;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

.resource-list {
  padding: $uni-spacing-col-base;
}

.resource-item {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  margin-bottom: $uni-spacing-col-base;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.resource-image {
  width: 100%;
  height: 340rpx;
  object-fit: cover;
}

.resource-info {
  padding: $uni-spacing-col-base;
}

.resource-title {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.resource-desc {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.publish-btn {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 120rpx;
  height: 120rpx;
  background-color: $uni-color-primary;
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }

  .btn-icon {
    font-size: 40rpx;
    color: #ffffff;
    font-weight: 300;
    line-height: 1;
  }

  .btn-text {
    font-size: 24rpx;
    color: #ffffff;
    margin-top: 4rpx;
  }
}
</style>
