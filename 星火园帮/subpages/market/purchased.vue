<template>
  <view class="purchased-container">
    <!-- 商品列表 -->
    <view class="products-grid" v-if="purchasedProducts.length > 0">
      <view
        class="product-card"
        v-for="product in purchasedProducts"
        :key="product.id"
        @click="() => goToDetail(product.id)"
      >
        <!-- 商品图片 -->
        <view class="product-image-container">
          <image
            class="product-image"
            :src="
              product.images && product.images[0]
                ? product.images[0]
                : '/static/images/placeholder.png'
            "
            mode="aspectFill"
          />
          <!-- 已购买标签 -->
          <view class="purchased-tag">已购买</view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info">
          <view class="product-title">{{ product.title }}</view>
          <view class="product-price">
            <text class="current-price"
              >¥{{ product.finalPrice || product.price }}</text
            >
            <text
              class="original-price"
              v-if="product.finalPrice && product.finalPrice !== product.price"
            >
              ¥{{ product.price }}
            </text>
          </view>
          <view class="product-meta">
            <text class="seller"
              >卖家：{{
                (product.seller && product.seller.nickname) || "未知"
              }}</text
            >
            <text class="purchase-date"
              >购买：{{ formatDate(product.soldAt) }}</text
            >
          </view>
          <view class="product-tags">
            <text class="tag" v-if="product.isNegotiated">小刀购买</text>
            <text class="tag condition">{{ getConditionText(product.condition) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">🛒</text>
      <text class="empty-title">暂无已购商品</text>
      <text class="empty-desc">去二手市集逛逛吧</text>
      <button class="go-shopping-btn" @click="goToMarket">去逛逛</button>
    </view>

    <!-- 加载更多 -->
    <uni-load-more
      v-if="purchasedProducts.length > 0"
      :status="loadStatus"
      :content-text="loadContentText"
    />
  </view>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "PurchasedProducts",
  data() {
    return {
      purchasedProducts: [],
      loadStatus: "more",
      loadContentText: {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "没有更多数据了",
      },
      page: 1,
      limit: 10,
    };
  },
  computed: {
    ...mapState(["hasLogin", "userInfo"]),
  },
  onLoad() {
    this.loadPurchasedProducts();
  },
  onPullDownRefresh() {
    this.refreshList();
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    // 跳转到商品详情
    goToDetail(productId) {
      uni.navigateTo({
        url: `/subpages/market/detail?id=${productId}`,
      });
    },
    // 跳转到二手市集
    goToMarket() {
      uni.navigateBack();
    },
    // 加载已购商品
    async loadPurchasedProducts() {
      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        return;
      }

      try {
        const response = await this.$request({
          url: `/market/purchased?page=${this.page}&limit=${this.limit}&communityId=${currentCommunity.id}`,
          method: "GET",
        });

        if (response.success) {
          if (this.page === 1) {
            this.purchasedProducts = response.data.products || [];
          } else {
            this.purchasedProducts.push(...(response.data.products || []));
          }

          // 更新加载状态
          if (response.data.products.length < this.limit) {
            this.loadStatus = "noMore";
          } else {
            this.loadStatus = "more";
          }
        }
      } catch (error) {
        console.error("加载已购商品失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    // 刷新列表
    refreshList() {
      this.page = 1;
      this.loadStatus = "more";
      this.loadPurchasedProducts().finally(() => {
        uni.stopPullDownRefresh();
      });
    },
    // 加载更多
    loadMore() {
      if (this.loadStatus === "more") {
        this.page++;
        this.loadPurchasedProducts();
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return "今天";
      } else if (days === 1) {
        return "昨天";
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString();
      }
    },
    // 获取商品状态的中文显示
    getConditionText(condition) {
      const conditionMap = {
        new: "全新",
        excellent: "几乎全新",
        good: "轻微使用痕迹",
        used: "明显使用痕迹",
        fair: "一般",
        poor: "较差",
        unknown: "未知",
      };
      return conditionMap[condition] || condition;
    },
  },
};
</script>

<style lang="scss" scoped>
.purchased-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #e8f4fd 100%);
  padding-bottom: 120rpx;
}

/* 商品网格 */
.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  padding: 32rpx;
}

/* 商品卡片 */
.product-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-card:active {
  transform: scale(0.98);
}

/* 商品图片 */
.product-image-container {
  position: relative;
  width: 100%;
  height: 200rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.purchased-tag {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

/* 商品信息 */
.product-info {
  padding: 20rpx;
}

.product-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.current-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4757;
}

.original-price {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-bottom: 12rpx;
}

.seller,
.purchase-date {
  font-size: 22rpx;
  color: #666666;
}

.product-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.tag {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
  color: #666666;
}

.tag.condition {
  background-color: #e8f5e8;
  color: #4caf50;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 32rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 48rpx;
}

.go-shopping-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.go-shopping-btn:active {
  opacity: 0.8;
}
</style>
