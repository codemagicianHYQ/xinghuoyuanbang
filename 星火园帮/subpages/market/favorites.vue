<template>
  <view class="favorites-container">
    <!-- 头部 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">我的收藏</text>
      </view>
      <view class="header-right">
        <text class="edit-btn" @click="toggleEditMode">
          {{ isEditMode ? "完成" : "编辑" }}
        </text>
      </view>
    </view>

    <!-- 收藏列表 -->
    <view class="favorites-list" v-if="favoritesList.length > 0">
      <view
        class="favorite-item"
        v-for="item in favoritesList"
        :key="item.id"
        @click="goToDetail(item.productId)"
      >
        <view
          class="item-checkbox"
          v-if="isEditMode"
          @click.stop="toggleSelect(item.id)"
        >
          <text
            class="checkbox-icon"
            :class="{ checked: selectedItems.includes(item.id) }"
          >
            ✓
          </text>
        </view>
        <view class="item-image-container">
          <image
            class="item-image"
            :src="getImageSrc(item.product)"
            mode="aspectFill"
          />
          <view class="item-status" v-if="item.product.status === 'sold'">
            <text class="status-text">已售</text>
          </view>
        </view>
        <view class="item-info">
          <view class="item-title">{{ item.product.title }}</view>
          <view class="item-desc">{{ item.product.description }}</view>
          <view class="item-price-row">
            <text class="item-price">¥{{ item.product.price }}</text>
            <text class="item-original-price" v-if="item.product.originalPrice">
              ¥{{ item.product.originalPrice }}
            </text>
          </view>
          <view class="item-meta">
            <view class="item-user">
              <image
                class="user-avatar"
                :src="
                  (item.product.seller && item.product.seller.avatarUrl) ||
                  '/static/images/default-avatar.png'
                "
                mode="aspectFill"
              />
              <text class="user-name">{{
                (item.product.seller && item.product.seller.nickname) ||
                "匿名用户"
              }}</text>
            </view>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>
        </view>
        <view class="item-actions" v-if="!isEditMode">
          <view class="action-btn" @click.stop="removeFavorite(item.id)">
            <text class="action-icon">🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!isLoading">
      <text class="empty-icon">❤️</text>
      <text class="empty-text">{{ getEmptyText() }}</text>
      <view class="empty-actions">
        <button class="empty-btn" @click="goToMarket">去逛逛</button>
      </view>
    </view>

    <!-- 批量操作栏 -->
    <view class="batch-actions" v-if="isEditMode && selectedItems.length > 0">
      <view class="batch-info">
        <text class="batch-text">已选择 {{ selectedItems.length }} 项</text>
      </view>
      <view class="batch-buttons">
        <button class="batch-btn cancel-btn" @click="clearSelection">
          取消选择
        </button>
        <button class="batch-btn delete-btn" @click="batchDelete">删除</button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      favoritesList: [],
      isLoading: false,
      isEditMode: false,
      selectedItems: [],
    };
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  mounted() {
    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChanged);
  },

  beforeDestroy() {
    // 移除社区变化监听
    uni.$off("communityChanged", this.handleCommunityChanged);
  },

  methods: {
    // 加载收藏列表
    async loadFavorites() {
      this.isLoading = true;
      try {
        // 获取当前选择的社区
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          console.log("未选择社区，显示空列表");
          this.favoritesList = [];
          return;
        }

        // 从本地存储获取收藏的商品信息
        let favoritesData = uni.getStorageSync("market_favorites_data") || [];

        if (favoritesData.length === 0) {
          this.favoritesList = [];
          return;
        }

        // 过滤掉已下架的商品（状态为 'offline' 或 'sold' 的商品）
        // 同时过滤掉非当前社区的商品
        const validFavorites = favoritesData.filter((item) => {
          if (
            !item.product ||
            item.product.status === "offline" ||
            item.product.status === "sold"
          ) {
            return false;
          }

          // 如果商品有communityId字段，必须匹配当前社区
          if (item.product.communityId !== undefined) {
            return item.product.communityId === currentCommunity.id;
          }

          // 如果商品没有communityId字段，显示所有（兼容旧数据和可能的新数据）
          // 这样可以确保新收藏的商品能正常显示
          return true;
        });

        // 如果过滤后的数据与原始数据不同，更新本地存储
        if (validFavorites.length !== favoritesData.length) {
          // 更新本地存储
          uni.setStorageSync("market_favorites_data", validFavorites);

          // 同时更新收藏ID列表
          const favoriteIds = validFavorites.map((item) => item.productId);
          uni.setStorageSync("market_favorites", favoriteIds);
        }

        // 直接使用本地存储的商品信息
        this.favoritesList = validFavorites.map((item, index) => ({
          id: item.id || Date.now() + index,
          productId: item.productId,
          product: item.product,
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      } catch (error) {
        console.error("加载收藏列表失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 获取图片源
    getImageSrc(product) {
      if (product.images && product.images.length > 0) {
        return product.images[0];
      }
      return "/static/images/default-product.png";
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return "未知时间";

      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        // 手动格式化日期，确保在所有平台上都显示中文格式
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      }
    },

    // 跳转到商品详情
    goToDetail(productId) {
      uni.navigateTo({
        url: `/subpages/market/detail?id=${productId}`,
      });
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 跳转到市场
    goToMarket() {
      uni.navigateTo({
        url: "/subpages/market/list",
      });
    },

    // 获取空状态文本
    getEmptyText() {
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        return "请先选择社区";
      }
      return "暂无收藏商品";
    },

    // 处理社区变化事件
    handleCommunityChanged() {
      console.log("收藏页面收到社区变化事件，重新加载收藏列表");
      this.loadFavorites();
    },

    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (!this.isEditMode) {
        this.selectedItems = [];
      }
    },

    // 切换选择状态
    toggleSelect(itemId) {
      const index = this.selectedItems.indexOf(itemId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(itemId);
      }
    },

    // 清除选择
    clearSelection() {
      this.selectedItems = [];
    },

    // 删除单个收藏
    async removeFavorite(favoriteId) {
      try {
        uni.showModal({
          title: "确认删除",
          content: "确定要取消收藏这个商品吗？",
          success: async (res) => {
            if (res.confirm) {
              await this.deleteFavorite(favoriteId);
            }
          },
        });
      } catch (error) {
        console.error("删除收藏失败:", error);
      }
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedItems.length === 0) return;

      try {
        uni.showModal({
          title: "确认删除",
          content: `确定要删除选中的 ${this.selectedItems.length} 个收藏吗？`,
          success: async (res) => {
            if (res.confirm) {
              await this.batchDeleteFavorites();
            }
          },
        });
      } catch (error) {
        console.error("批量删除失败:", error);
      }
    },

    // 执行删除收藏
    deleteFavorite(favoriteId) {
      try {
        // 找到要删除的收藏项
        const favoriteItem = this.favoritesList.find(
          (item) => item.id === favoriteId
        );
        if (!favoriteItem) {
          uni.showToast({
            title: "收藏项不存在",
            icon: "none",
          });
          return;
        }

        // 从本地存储中移除
        let favorites = uni.getStorageSync("market_favorites") || [];
        let favoritesData = uni.getStorageSync("market_favorites_data") || [];

        // 从ID列表中移除
        favorites = favorites.filter((id) => id !== favoriteItem.productId);
        // 从完整数据中移除
        favoritesData = favoritesData.filter(
          (data) => data.productId !== favoriteItem.productId
        );

        // 保存更新后的数据
        uni.setStorageSync("market_favorites", favorites);
        uni.setStorageSync("market_favorites_data", favoritesData);

        uni.showToast({
          title: "删除成功",
          icon: "success",
        });
        this.loadFavorites();
      } catch (error) {
        console.error("删除收藏失败:", error);
        uni.showToast({
          title: "删除失败",
          icon: "none",
        });
      }
    },

    // 批量删除收藏
    batchDeleteFavorites() {
      try {
        // 获取要删除的商品ID列表
        const productIdsToDelete = this.selectedItems
          .map((id) => {
            const favoriteItem = this.favoritesList.find(
              (item) => item.id === id
            );
            return favoriteItem ? favoriteItem.productId : null;
          })
          .filter((id) => id !== null);

        // 从本地存储中移除
        let favorites = uni.getStorageSync("market_favorites") || [];
        let favoritesData = uni.getStorageSync("market_favorites_data") || [];

        // 从ID列表中移除
        favorites = favorites.filter((id) => !productIdsToDelete.includes(id));
        // 从完整数据中移除
        favoritesData = favoritesData.filter(
          (data) => !productIdsToDelete.includes(data.productId)
        );

        // 保存更新后的数据
        uni.setStorageSync("market_favorites", favorites);
        uni.setStorageSync("market_favorites_data", favoritesData);

        uni.showToast({
          title: "删除成功",
          icon: "success",
        });

        this.selectedItems = [];
        this.loadFavorites();
      } catch (error) {
        console.error("批量删除失败:", error);
        uni.showToast({
          title: "删除失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.favorites-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 32rpx;
  color: #333333;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  font-size: 28rpx;
  color: #007aff;
}

.favorites-list {
  padding: 20rpx 24rpx;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  margin-top: 8rpx;
}

.checkbox-icon {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: transparent;
  transition: all 0.3s ease;

  &.checked {
    background-color: #007aff;
    border-color: #007aff;
    color: #ffffff;
  }
}

.item-image-container {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  object-fit: cover;
}

.item-status {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

.status-text {
  font-size: 20rpx;
  color: #ffffff;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff6b6b;
}

.item-original-price {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.item-user {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.user-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.user-name {
  font-size: 22rpx;
  color: #666666;
}

.item-time {
  font-size: 22rpx;
  color: #999999;
}

.item-actions {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 50%;
}

.action-icon {
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
  color: #ffffff;
  border-radius: 24rpx;
  font-size: 28rpx;
  border: none;
}

.batch-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.batch-info {
  flex: 1;
}

.batch-text {
  font-size: 28rpx;
  color: #333333;
}

.batch-buttons {
  display: flex;
  gap: 16rpx;
}

.batch-btn {
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #666666;
}

.delete-btn {
  background-color: #ff6b6b;
  color: #ffffff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
