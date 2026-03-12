<template>
  <view class="hot-resources-container">
    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x>
      <view class="category-list">
        <view
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 热门资源列表 -->
    <view class="hot-list" v-if="hotList.length > 0">
      <view
        class="hot-item"
        v-for="(item, index) in hotList"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <view class="rank-number" :class="{ 'top-three': index < 3 }">
          {{ index + 1 }}
        </view>
        <image
          class="item-image"
          :src="item.coverImage || '/static/images/default-goods.png'"
          mode="aspectFill"
        />
        <view class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <view class="item-meta">
            <text class="item-price">¥{{ item.price }}</text>
            <text class="item-condition">{{ item.condition }}</text>
          </view>
          <view class="item-stats">
            <view class="stat-item">
              <text class="stat-icon">👁</text>
              <text class="stat-value">{{ item.views }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">❤️</text>
              <text class="stat-value">{{ item.likes }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">💬</text>
              <text class="stat-value">{{ item.comments }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状�?-->
    <view class="empty-state" v-else>
      <image
        class="empty-image"
        src="/static/images/empty-box.png"
        mode="aspectFit"
      />
      <text class="empty-text">暂无热门资源</text>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      selectedCategory: "all",
      categories: [
        { id: "all", name: "全部" },
        { id: "books", name: "图书教材" },
        { id: "daily", name: "日常用品" },
        { id: "electronics", name: "数码电子" },
        { id: "other", name: "其他" },
      ],
      hotList: [],
      isLoading: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
  },
  onLoad() {
    this.loadHotList();
  },
  onPullDownRefresh() {
    this.refreshList();
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.loadHotList();
    },
    async loadHotList() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        const params = {
          category:
            this.selectedCategory === "all" ? "" : this.selectedCategory,
        };

        // 模拟数据
        const mockData = [
          {
            id: 1,
            title: "计算机网络（第7版）",
            price: 45,
            condition: "九成新",
            coverImage: "/static/images/book1.jpg",
            views: 1234,
            likes: 88,
            comments: 32,
          },
          {
            id: 2,
            title: "宿舍用洗衣机",
            price: 80,
            condition: "八成新",
            coverImage: "/static/images/goods1.jpg",
            views: 986,
            likes: 76,
            comments: 28,
          },
          {
            id: 3,
            title: "小米充电宝10000毫安",
            price: 50,
            condition: "全新",
            coverImage: "/static/images/goods2.jpg",
            views: 876,
            likes: 65,
            comments: 24,
          },
        ];

        this.hotList = mockData;
      } catch (error) {
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    refreshList() {
      this.loadHotList().then(() => {
        uni.stopPullDownRefresh();
      });
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/subpages/resources/detail?id=${id}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.hot-resources-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

.category-scroll {
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;

  /* 隐藏滚动条*/
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.category-list {
  display: inline-flex;
  padding: $uni-spacing-col-sm $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.category-item {
  padding: 12rpx 24rpx;
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

.hot-list {
  padding: $uni-spacing-col-base;
}

.hot-item {
  display: flex;
  align-items: center;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-col-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.rank-number {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  margin-right: $uni-spacing-col-base;

  &.top-three {
    color: #ffffff;
    border-radius: 50%;
    font-weight: bold;

    &:nth-child(1) {
      background-color: #ff4d4f;
    }
    &:nth-child(2) {
      background-color: #ffa940;
    }
    &:nth-child(3) {
      background-color: #73d13d;
    }
  }
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-base;
  margin-right: $uni-spacing-col-base;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160rpx;
}

.item-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8rpx 0;
}

.item-price {
  font-size: $uni-font-size-lg;
  color: $uni-color-error;
  font-weight: bold;
}

.item-condition {
  font-size: $uni-font-size-sm;
  color: $uni-color-warning;
  background-color: rgba($uni-color-warning, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.item-stats {
  display: flex;
  gap: $uni-spacing-col-base;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-value {
  font-size: 24rpx;
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
</style>
