// 例如：pages/market/list.vue
<template>
  <view class="market-container">
    <!-- 搜索和分类区域 -->
    <view class="search-section">
      <view class="search-bar">
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索二手物品"
          @confirm="onSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
    </view>

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

    <!-- 商品列表 -->
    <view class="goods-list" v-if="goodsList.length > 0">
      <view
        class="goods-item"
        v-for="item in goodsList"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <image
          class="goods-image"
          :src="item.images[0] || '/static/images/default-goods.png'"
          mode="aspectFill"
        />
        <view class="goods-info">
          <text class="goods-title">{{ item.title }}</text>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-tag" v-if="item.isNegotiable">可议价</text>
          </view>
          <view class="goods-user">
            <image
              class="user-avatar"
              :src="item.userAvatar || '/static/images/default-avatar.png'"
              mode="aspectFill"
            />
            <text class="user-name">{{ item.userName }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image
        class="empty-image"
        src="/static/images/empty-box.png"
        mode="aspectFit"
      />
      <text class="empty-text">暂无二手物品</text>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-fab" @click="goToPublish">
      <text class="fab-icon">+</text>
      <text class="fab-text">发布</text>
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
      selectedCategory: "all",
      categories: [
        { id: "all", name: "全部" },
        { id: "books", name: "图书教材" },
        { id: "electronics", name: "数码电子" },
        { id: "clothes", name: "服饰鞋包" },
        { id: "sports", name: "运动户外" },
        { id: "daily", name: "生活用品" },
        { id: "others", name: "其他" },
      ],
      goodsList: [],
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
    this.loadGoodsList();
  },
  onReachBottom() {
    if (this.hasMore && !this.isLoading) {
      this.loadMoreGoods();
    }
  },
  onPullDownRefresh() {
    this.refreshList();
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.page = 1;
      this.goodsList = [];
      this.loadGoodsList();
    },
    onSearch() {
      this.page = 1;
      this.goodsList = [];
      this.loadGoodsList();
    },
    async loadGoodsList() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        const params = {
          page: this.page,
          pageSize: 10,
          category:
            this.selectedCategory === "all" ? "" : this.selectedCategory,
          keyword: this.searchKeyword,
        };

        // 模拟数据，实际应该调用API
        // const result = await request({
        //   url: "/market/goods",
        //   method: "GET",
        //   data: params,
        // });

        // 模拟数据
        const mockData = [
          {
            id: 1,
            title: "计算机网络第七版教材",
            price: 25,
            isNegotiable: true,
            images: ["/static/images/goods1.jpg"],
            userName: "张同学",
            userAvatar: "/static/images/avatar1.jpg",
          },
          {
            id: 2,
            title: "小米充电宝10000毫安",
            price: 50,
            isNegotiable: false,
            images: ["/static/images/goods2.jpg"],
            userName: "李同学",
            userAvatar: "/static/images/avatar2.jpg",
          },
          // 添加更多模拟数据...
        ];

        if (this.page === 1) {
          this.goodsList = mockData;
        } else {
          this.goodsList = [...this.goodsList, ...mockData];
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
    loadMoreGoods() {
      this.page++;
      this.loadGoodsList();
    },
    refreshList() {
      this.page = 1;
      this.goodsList = [];
      this.loadGoodsList().then(() => {
        uni.stopPullDownRefresh();
      });
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/subpages/other/market/detail?id=${id}`,
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
        url: "/subpages/other/market/publish",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.market-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx; // 为发布按钮留出空间
}

.search-section {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color;
  position: sticky;
  top: 0;
  z-index: 10;
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

.category-scroll {
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
  white-space: nowrap;
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

.goods-list {
  padding: $uni-spacing-col-base;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $uni-spacing-col-base;
}

.goods-item {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
}

.goods-image {
  width: 100%;
  height: 340rpx;
  object-fit: cover;
}

.goods-info {
  padding: $uni-spacing-col-base;
}

.goods-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.goods-price-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin: 8rpx 0;
}

.goods-price {
  font-size: $uni-font-size-lg;
  color: $uni-color-error;
  font-weight: bold;
}

.goods-tag {
  font-size: 20rpx;
  color: $uni-color-warning;
  border: 1px solid $uni-color-warning;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.goods-user {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
}

.user-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.user-name {
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

.publish-fab {
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

  .fab-icon {
    font-size: 40rpx;
    color: #ffffff;
    font-weight: 300;
    line-height: 1;
  }

  .fab-text {
    font-size: 24rpx;
    color: #ffffff;
    margin-top: 4rpx;
  }
}
</style>
