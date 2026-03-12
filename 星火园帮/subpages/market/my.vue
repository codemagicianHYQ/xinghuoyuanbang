<template>
  <view class="my-container">
    <!-- 标签页切换 -->
    <view class="tab-container">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'purchased' }"
        @click="switchTab('purchased')"
      >
        <text class="tab-text">已购</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'selling' }"
        @click="switchTab('selling')"
      >
        <text class="tab-text">在售</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'sold' }"
        @click="switchTab('sold')"
      >
        <text class="tab-text">已售</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'following' }"
        @click="switchTab('following')"
      >
        <text class="tab-text">关注</text>
      </view>
    </view>

    <!-- 已购商品列表 -->
    <view v-if="currentTab === 'purchased'" class="content-section">
      <view v-if="purchasedProducts.length === 0" class="empty-state">
        <text class="empty-icon">🛍️</text>
        <text class="empty-text">暂无已购商品</text>
        <text class="empty-desc">去逛逛二手市集吧</text>
      </view>
      <view v-else class="product-grid">
        <view
          v-for="product in purchasedProducts"
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <image
            :src="product.images[0]"
            class="product-image"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-title">{{ product.title }}</text>
            <text class="product-price"
              >¥{{ product.finalPrice || product.price }}</text
            >
            <view class="product-meta">
              <text class="product-seller">{{
                product.seller && product.seller.nickname
              }}</text>
              <text class="product-time">{{ formatDate(product.soldAt) }}</text>
            </view>
            <view class="product-status">
              <text class="status-tag" :class="'status-' + product.status">
                {{ getStatusText(product.status) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 在售商品列表 -->
    <view v-if="currentTab === 'selling'" class="content-section">
      <view v-if="sellingProducts.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无在售商品</text>
        <text class="empty-desc">发布商品开始售卖吧</text>
      </view>
      <view v-else class="product-grid">
        <view
          v-for="product in sellingProducts"
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <image
            :src="product.images[0]"
            class="product-image"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-title">{{ product.title }}</text>
            <text class="product-price">¥{{ product.price }}</text>
            <view class="product-meta">
              <text class="product-time">{{
                formatDate(product.createdAt)
              }}</text>
            </view>
            <view class="product-status">
              <text class="status-tag status-active">在售中</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 已售商品列表 -->
    <view v-if="currentTab === 'sold'" class="content-section">
      <view v-if="soldProducts.length === 0" class="empty-state">
        <text class="empty-icon">🚀</text>
        <text class="empty-text">暂无已售商品</text>
        <text class="empty-desc">发布商品开始售卖吧</text>
      </view>
      <view v-else class="product-grid">
        <view
          v-for="product in soldProducts"
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <image
            :src="product.images[0]"
            class="product-image"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-title">{{ product.title }}</text>
            <text class="product-price"
              >¥{{ product.finalPrice || product.price }}</text
            >
            <view class="product-meta">
              <text class="product-buyer"
                >买家：{{
                  product.buyer && product.buyer.nickname
                    ? product.buyer.nickname
                    : "未知用户"
                }}</text
              >
              <text class="product-time">{{ formatDate(product.soldAt) }}</text>
            </view>
            <view class="product-status">
              <text class="status-tag" :class="'status-' + product.status">
                {{ getStatusText(product.status) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 关注列表 -->
    <view v-if="currentTab === 'following'" class="content-section">
      <view v-if="followingList.length === 0" class="empty-state">
        <text class="empty-icon">💝</text>
        <text class="empty-text">暂无关注用户</text>
        <text class="empty-desc">去关注一些有趣的卖家吧</text>
      </view>
      <view v-else class="following-list">
        <view
          v-for="user in followingList"
          :key="user.id"
          class="following-item"
          @click="goToSeller(user.id)"
        >
          <image
            :src="user.avatarUrl || '/static/images/default-avatar.png'"
            class="user-avatar"
            mode="aspectFill"
          />
          <view class="user-info">
            <text class="user-name">{{ user.nickname }}</text>
            <text class="user-desc" v-if="user.school">{{ user.school }}</text>
            <view class="user-stats">
              <text class="stat-item">在售 {{ user.goodsCount || 0 }}</text>
              <text class="stat-item">已售 {{ user.soldCount || 0 }}</text>
            </view>
          </view>
          <view class="follow-action">
            <button class="unfollow-btn" @click.stop="unfollowUser(user.id)">
              取消关注
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>

    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  name: "MyMarket",
  data() {
    return {
      currentTab: "purchased",
      purchasedProducts: [],
      sellingProducts: [],
      soldProducts: [],
      followingList: [],
      loading: false,
      hasMore: true,
      page: 1,
      limit: 20,
    };
  },
  onLoad() {
    this.loadData();
    // 监听关注状态变化
    uni.$on("followStatusChanged", this.handleFollowStatusChanged);
  },
  onShow() {
    // 注意：此页面不在tabBar中，不需要同步tabBar状态
    // 如果需要同步，应该同步到"我的"页面（profile页面）
    console.log("二手市集个人中心页面显示");
  },
  onUnload() {
    // 移除事件监听
    uni.$off("followStatusChanged", this.handleFollowStatusChanged);
  },
  onPullDownRefresh() {
    this.refreshData();
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    // 切换标签页
    switchTab(tab) {
      this.currentTab = tab;
      this.page = 1;
      this.hasMore = true;
      this.loadData();
    },

    // 加载数据
    async loadData() {
      this.loading = true;
      try {
        if (this.currentTab === "purchased") {
          await this.loadPurchasedProducts();
        } else if (this.currentTab === "selling") {
          await this.loadSellingProducts();
        } else if (this.currentTab === "sold") {
          await this.loadSoldProducts();
        } else if (this.currentTab === "following") {
          await this.loadFollowingList();
        }
      } catch (error) {
        console.error("加载数据失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
        uni.stopPullDownRefresh();
      }
    },

    // 加载已购商品
    async loadPurchasedProducts() {
      try {
        console.log("开始加载已购商品...");

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        const result = await request({
          url: `/market/purchased?page=${this.page}&limit=${this.limit}&communityId=${currentCommunity.id}`,
          method: "GET",
        });

        console.log("已购商品API响应:", result);

        if (result.success) {
          const list = result.data.list || [];
          console.log(`已购商品数据: ${list.length}条`);

          if (this.page === 1) {
            this.purchasedProducts = list;
          } else {
            this.purchasedProducts.push(...list);
          }
          this.hasMore = list.length === this.limit;
        } else {
          console.error("获取已购商品失败:", result.message);
          this.purchasedProducts = [];
        }
      } catch (error) {
        console.error("加载已购商品出错:", error);
        this.purchasedProducts = [];
      }
    },

    // 加载在售商品
    async loadSellingProducts() {
      try {
        console.log("开始加载在售商品...");

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        // 获取当前用户ID
        const userInfo = uni.getStorageSync("userInfo_xh");
        const currentUser =
          typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;

        const result = await request({
          url: `/market/products?page=${this.page}&limit=${this.limit}&status=active&communityId=${currentCommunity.id}&sellerId=${currentUser.id}`,
          method: "GET",
        });

        console.log("在售商品API响应:", result);

        if (result.success) {
          const list = result.data.list || [];
          console.log(`在售商品数据: ${list.length}条`);

          if (this.page === 1) {
            this.sellingProducts = list;
          } else {
            this.sellingProducts.push(...list);
          }
          this.hasMore = list.length === this.limit;
        } else {
          console.error("获取在售商品失败:", result.message);
          this.sellingProducts = [];
        }
      } catch (error) {
        console.error("加载在售商品出错:", error);
        this.sellingProducts = [];
      }
    },

    // 加载已售商品
    async loadSoldProducts() {
      try {
        console.log("开始加载已售商品...");

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        const result = await request({
          url: `/market/sold?page=${this.page}&limit=${this.limit}&communityId=${currentCommunity.id}`,
          method: "GET",
        });

        console.log("已售商品API响应:", result);

        if (result.success) {
          const list = result.data.list || [];
          console.log(`已售商品数据: ${list.length}条`);

          if (this.page === 1) {
            this.soldProducts = list;
          } else {
            this.soldProducts.push(...list);
          }
          this.hasMore = list.length === this.limit;
        } else {
          console.error("获取已售商品失败:", result.message);
          this.soldProducts = [];
        }
      } catch (error) {
        console.error("加载已售商品出错:", error);
        this.soldProducts = [];
      }
    },

    // 加载关注列表
    async loadFollowingList() {
      try {
        console.log("开始加载关注列表...");

        // 从本地存储获取关注列表
        const followingData = uni.getStorageSync("market_following_data") || [];
        console.log(`关注列表数据: ${followingData.length}条`);

        if (followingData.length === 0) {
          this.followingList = [];
          this.hasMore = false;
          return;
        }

        // 按时间倒序排列
        const sortedData = followingData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // 分页处理
        const startIndex = (this.page - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        const pageData = sortedData.slice(startIndex, endIndex);

        // 实时获取最新的用户信息
        const processedData = await Promise.all(
          pageData.map(async (item) => {
            try {
              // 获取当前社区ID
              const currentCommunity = uni.getStorageSync("selectedCommunity");
              if (!currentCommunity || !currentCommunity.id) {
                console.warn("未选择社区，使用本地数据");
                return {
                  id: item.sellerId,
                  avatarUrl:
                    item.seller?.avatarUrl ||
                    "/static/images/default-avatar.png",
                  nickname: item.seller?.nickname || "匿名用户",
                  school: item.seller?.school || "",
                  goodsCount: item.seller?.goodsCount || 0,
                  soldCount: item.seller?.soldCount || 0,
                  createdAt: item.createdAt,
                };
              }

              // 实时从API获取用户信息
              const result = await request({
                url: `/market/users/${item.sellerId}?communityId=${currentCommunity.id}`,
                method: "GET",
              });

              if (result.success) {
                const userData = result.data;
                console.log(`[My] 实时获取用户信息: ${item.sellerId}`, {
                  nickname: userData.nickname,
                  avatarUrl: userData.avatarUrl,
                  goodsCount: userData.goodsCount,
                  soldCount: userData.soldCount,
                });

                // 使用API返回的最新数据
                return {
                  id: item.sellerId,
                  avatarUrl:
                    userData.avatarUrl || "/static/images/default-avatar.png",
                  nickname: userData.nickname || "匿名用户",
                  school: userData.school || "",
                  goodsCount: userData.goodsCount || 0,
                  soldCount: userData.soldCount || 0,
                  createdAt: item.createdAt,
                };
              } else {
                console.warn(
                  `获取用户信息失败: ${item.sellerId}`,
                  result.message
                );
                // 使用本地数据作为备用
                return {
                  id: item.sellerId,
                  avatarUrl:
                    item.seller?.avatarUrl ||
                    "/static/images/default-avatar.png",
                  nickname: item.seller?.nickname || "匿名用户",
                  school: item.seller?.school || "",
                  goodsCount: item.seller?.goodsCount || 0,
                  soldCount: item.seller?.soldCount || 0,
                  createdAt: item.createdAt,
                };
              }
            } catch (error) {
              console.error(`获取用户信息出错: ${item.sellerId}`, error);
              // 使用本地数据作为备用
              return {
                id: item.sellerId,
                avatarUrl:
                  item.seller?.avatarUrl || "/static/images/default-avatar.png",
                nickname: item.seller?.nickname || "匿名用户",
                school: item.seller?.school || "",
                goodsCount: item.seller?.goodsCount || 0,
                soldCount: item.seller?.soldCount || 0,
                createdAt: item.createdAt,
              };
            }
          })
        );

        if (this.page === 1) {
          this.followingList = processedData;
        } else {
          this.followingList.push(...processedData);
        }

        this.hasMore = endIndex < sortedData.length;
        console.log(
          `当前页数据: ${pageData.length}条，还有更多: ${this.hasMore}`
        );
      } catch (error) {
        console.error("加载关注列表出错:", error);
        this.followingList = [];
      }
    },

    // 刷新数据
    refreshData() {
      this.page = 1;
      this.hasMore = true;
      this.loadData();
    },

    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.loadData();
      }
    },

    // 跳转到商品详情
    goToDetail(productId) {
      uni.navigateTo({
        url: `/subpages/market/detail?id=${productId}`,
      });
    },

    // 跳转到卖家页面
    goToSeller(sellerId) {
      uni.navigateTo({
        url: `/subpages/market/seller?id=${sellerId}`,
      });
    },

    // 取消关注
    unfollowUser(userId) {
      uni.showModal({
        title: "确认取消关注",
        content: "确定要取消关注这个用户吗？",
        success: (res) => {
          if (res.confirm) {
            // 获取当前关注列表
            let following = uni.getStorageSync("market_following") || [];
            let followingData =
              uni.getStorageSync("market_following_data") || [];

            // 取消关注 - 从列表中移除
            following = following.filter((id) => String(id) !== String(userId));
            followingData = followingData.filter(
              (data) => String(data.sellerId) !== String(userId)
            );

            // 保存到本地存储
            uni.setStorageSync("market_following", following);
            uni.setStorageSync("market_following_data", followingData);

            uni.showToast({
              title: "已取消关注",
              icon: "success",
            });

            // 刷新数据
            this.refreshData();

            // 同步到其他页面
            uni.$emit("followStatusChanged", {
              sellerId: userId,
              isFollowing: false,
            });
          }
        },
      });
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
        // 手动格式化中文日期
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: "待确认",
        completed: "已完成",
        refunded: "已退款",
      };
      return statusMap[status] || "未知";
    },
    // 处理关注状态变化
    handleFollowStatusChanged(data) {
      if (this.currentTab === "following") {
        // 如果当前在关注页面，刷新关注列表
        this.refreshData();
      }
    },
  },
};
</script>

<style scoped>
.my-container {
  min-height: 100vh;
  background: #e3f2fd;
  padding: 20rpx;
}

.tab-container {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  /* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1); */
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  /* transition: background 0.3s ease; */
}

.tab-item.active {
  background: #2196f3;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #fff;
  font-weight: 600;
}

.content-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  /* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1); */
}

.empty-state {
  text-align: center;
  padding: 60rpx 20rpx;
}

.empty-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-card {
  width: 48%;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  /* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1); */
  /* transition: opacity 0.3s ease; */
  margin-bottom: 20rpx;
}

.product-card:active {
  opacity: 0.8;
}

.product-image {
  width: 100%;
  height: 200rpx;
}

.product-info {
  padding: 16rpx;
}

.product-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.product-price {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.product-seller,
.product-buyer {
  font-size: 22rpx;
  color: #666;
}

.product-time {
  font-size: 20rpx;
  color: #999;
}

.product-status {
  margin-top: 8rpx;
}

.status-tag {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  color: #fff;
}

.status-pending {
  background: #ff9800;
}

.status-completed {
  background: #4caf50;
}

.status-refunded {
  background: #f44336;
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.following-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  /* transition: background 0.3s ease; */
}

.following-item:active {
  background: #e9ecef;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
  display: block;
}

.user-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.user-stats {
  display: flex;
  gap: 16rpx;
}

.stat-item {
  font-size: 22rpx;
  color: #999;
}

.follow-action {
  margin-left: 16rpx;
}

.unfollow-btn {
  padding: 8rpx 16rpx;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  /* box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3); */
  /* transition: opacity 0.3s ease; */
}

.unfollow-btn:active {
  opacity: 0.8;
  /* box-shadow: 0 1rpx 4rpx rgba(255, 107, 107, 0.5); */
}

.load-more {
  text-align: center;
  padding: 20rpx;
  margin-top: 20rpx;
}

.load-more-text {
  font-size: 28rpx;
  color: #2196f3;
}

.loading-state {
  text-align: center;
  padding: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
