<template>
  <view class="book-detail-container">
    <!-- 图书基本信息 -->
    <view class="book-header">
      <view class="book-cover-section">
        <image
          class="book-cover"
          :src="bookInfo.coverImage || '/static/images/default-book.png'"
          mode="aspectFill"
        />
        <view class="book-badges">
          <view class="book-badge" v-if="bookInfo.isNew">NEW</view>
          <view class="book-type-badge" v-if="bookInfo.isElectronic"
            >电子书</view
          >
        </view>
      </view>
      <view class="book-info-section">
        <text class="book-title">{{ bookInfo.title }}</text>
        <text class="book-author">作者：{{ bookInfo.author || "未知" }}</text>
        <text class="book-publisher"
          >出版社：{{ bookInfo.publisher || "未知" }}</text
        >
        <text class="book-isbn" v-if="bookInfo.isbn"
          >ISBN：{{ bookInfo.isbn }}</text
        >
        <view class="book-meta">
          <text class="book-price" v-if="bookInfo.price"
            >¥{{ bookInfo.price }}</text
          >
          <text class="book-condition">{{
            getConditionText(bookInfo.condition)
          }}</text>
        </view>
      </view>
    </view>

    <!-- 图书统计信息 -->
    <view class="book-stats">
      <view class="stat-item">
        <text class="stat-number">{{ bookInfo.downloads || 0 }}</text>
        <text class="stat-label">下载次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ bookInfo.views || 0 }}</text>
        <text class="stat-label">浏览次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{
          bookInfo.favorites >= 0 ? bookInfo.favorites : 0
        }}</text>
        <text class="stat-label">收藏次数</text>
      </view>
    </view>

    <!-- 图书描述 -->
    <view class="book-description" v-if="bookInfo.description">
      <view class="section-title">图书简介</view>
      <text class="description-text">{{ bookInfo.description }}</text>
    </view>

    <!-- 图书标签 -->
    <view class="book-tags" v-if="bookInfo.tags">
      <view class="section-title">标签</view>
      <view class="tags-list">
        <text
          class="tag-item"
          v-for="tag in bookInfo.tags.split(',')"
          :key="tag"
        >
          {{ tag.trim() }}
        </text>
      </view>
    </view>

    <!-- 下载信息 -->
    <view class="download-section" v-if="bookInfo.downloadUrl">
      <view class="section-title">下载信息</view>
      <view class="download-info">
        <view class="download-item">
          <text class="download-label">下载链接</text>
          <view class="download-url-wrapper">
            <text class="download-url">{{ bookInfo.downloadUrl }}</text>
            <view class="copy-icon" @click="copyDownloadUrl">
              <text class="copy-icon-text">📋</text>
            </view>
          </view>
        </view>
        <view class="download-item" v-if="bookInfo.extractCode">
          <text class="download-label">提取码：</text>
          <text class="download-code">{{ bookInfo.extractCode }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button
        class="action-btn favorite-btn"
        @click="toggleFavorite"
        :class="{ favorited: bookInfo.isFavorited }"
      >
        <text class="btn-icon">{{ bookInfo.isFavorited ? "⭐" : "☆" }}</text>
        <text class="btn-text">{{
          bookInfo.isFavorited ? "已收藏" : "收藏"
        }}</text>
      </button>
      <button
        class="action-btn download-btn"
        @click="downloadBook"
        v-if="bookInfo.downloadUrl"
      >
        <text class="btn-icon">📥</text>
        <text class="btn-text">下载</text>
      </button>
      <button class="action-btn share-btn" open-type="share">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享</text>
      </button>
    </view>

    <!-- 相关推荐 -->
    <view class="related-books" v-if="relatedBooks.length > 0">
      <view class="section-title">相关推荐</view>
      <scroll-view class="related-list" scroll-x>
        <view
          class="related-item"
          v-for="book in relatedBooks"
          :key="book.id"
          @click="viewRelatedBook(book.id)"
        >
          <image
            class="related-cover"
            :src="book.coverImage || '/static/images/default-book.png'"
            mode="aspectFill"
          />
          <text class="related-title">{{ book.title }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { USER_AUTH_TOKEN_KEY } from "@/common/config.js";

export default {
  data() {
    return {
      bookId: null,
      bookInfo: {},
      relatedBooks: [],
    };
  },
  onLoad(options) {
    if (options.id) {
      this.bookId = options.id;
      this.loadBookDetail();
      this.loadRelatedBooks();
    }
  },
  methods: {
    async loadBookDetail() {
      try {
        const result = await request({
          url: `/books/${this.bookId}`,
          method: "GET",
        });

        if (result.success && result.data) {
          this.bookInfo = result.data;
          // 检查是否已收藏
          this.checkFavoriteStatus();
        } else {
          throw new Error(result.message || "获取图书详情失败");
        }
      } catch (error) {
        console.error("加载图书详情失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    async loadRelatedBooks() {
      try {
        const result = await request({
          url: "/books/recommended",
          method: "GET",
          data: { limit: 5 },
        });

        if (result.success && result.data) {
          this.relatedBooks = result.data.filter(
            (book) => book.id !== this.bookId
          );
        }
      } catch (error) {
        console.error("加载相关图书失败:", error);
      }
    },
    checkFavoriteStatus() {
      const favorites = uni.getStorageSync("book_favorites") || [];
      this.$set(this.bookInfo, "isFavorited", favorites.includes(this.bookId));
      // 确保收藏次数不会是负数或undefined
      const favoritesCount = Math.max(0, this.bookInfo.favorites || 0);
      this.$set(this.bookInfo, "favorites", favoritesCount);
    },
    async toggleFavorite() {
      // 检查登录状态 - 使用token检查
      const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
      if (!token) {
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

      const isFavorited = this.bookInfo.isFavorited;
      const action = isFavorited ? "remove" : "add";

      try {
        // 调用后端API同步收藏次数
        const result = await request({
          url: `/books/${this.bookId}/favorite`,
          method: "POST",
          data: { action },
        });

        if (result.success) {
          // 获取当前收藏列表
          let favorites = uni.getStorageSync("book_favorites") || [];
          let favoritesData = uni.getStorageSync("book_favorites_data") || [];

          if (isFavorited) {
            // 取消收藏
            favorites = favorites.filter((id) => id !== this.bookId);
            favoritesData = favoritesData.filter(
              (item) => item.bookId !== this.bookId
            );
            this.$set(this.bookInfo, "isFavorited", false);
          } else {
            // 添加收藏
            if (!favorites.includes(this.bookId)) {
              favorites.push(this.bookId);
              const favoriteItem = {
                id: Date.now() + Math.random(),
                bookId: this.bookId,
                book: { ...this.bookInfo },
                createdAt: new Date().toISOString(),
              };
              favoritesData.push(favoriteItem);
            }
            this.$set(this.bookInfo, "isFavorited", true);
          }

          // 保存到本地存储
          uni.setStorageSync("book_favorites", favorites);
          uni.setStorageSync("book_favorites_data", favoritesData);

          // 更新收藏次数（从后端返回的真实数据）
          if (result.data && result.data.favorites !== undefined) {
            // 确保不会是负数
            const favoritesCount = Math.max(0, result.data.favorites || 0);
            this.$set(this.bookInfo, "favorites", favoritesCount);
          } else {
            // 如果后端没有返回，使用本地计算，但确保不会是负数
            const currentFavorites = Math.max(0, this.bookInfo.favorites || 0);
            const newFavorites = isFavorited
              ? Math.max(0, currentFavorites - 1)
              : currentFavorites + 1;
            this.$set(this.bookInfo, "favorites", newFavorites);
          }

          uni.showToast({
            title: isFavorited ? "已取消收藏" : "收藏成功",
            icon: isFavorited ? "none" : "success",
          });

          // 强制更新视图
          this.$forceUpdate();
        } else {
          throw new Error(result.message || "收藏操作失败");
        }
      } catch (error) {
        console.error("收藏操作失败:", error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none",
        });
      }
    },
    async downloadBook() {
      try {
        // 增加下载次数
        await request({
          url: `/books/${this.bookId}/download`,
          method: "POST",
        });

        // 复制下载链接到剪贴板
        if (this.bookInfo.downloadUrl) {
          uni.setClipboardData({
            data: this.bookInfo.downloadUrl,
            success: () => {
              uni.showToast({
                title: "下载链接已复制",
                icon: "success",
              });
            },
          });
        }

        // 更新本地下载次数
        this.bookInfo.downloads = (this.bookInfo.downloads || 0) + 1;
      } catch (error) {
        console.error("下载失败:", error);
        uni.showToast({
          title: "下载失败",
          icon: "none",
        });
      }
    },
    viewRelatedBook(bookId) {
      uni.navigateTo({
        url: `/subpages/resources/book/detail?id=${bookId}`,
      });
    },
    getConditionText(condition) {
      const conditionMap = {
        new: "全新",
        good: "九成新",
        fair: "七成新",
        poor: "五成新",
      };
      return conditionMap[condition] || "未知";
    },
    copyDownloadUrl() {
      if (this.bookInfo.downloadUrl) {
        uni.setClipboardData({
          data: this.bookInfo.downloadUrl,
          success: () => {
            uni.showToast({
              title: "链接已复制",
              icon: "success",
              duration: 2000,
            });
          },
          fail: () => {
            uni.showToast({
              title: "复制失败",
              icon: "none",
            });
          },
        });
      }
    },
  },
  onShareAppMessage() {
    return {
      title: this.bookInfo.title,
      path: `/subpages/resources/book/detail?id=${this.bookId}`,
    };
  },
  onShareTimeline() {
    return {
      title: this.bookInfo.title,
      query: `id=${this.bookId}`,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.book-detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 180rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.book-header {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-lg;
  display: flex;
  gap: $uni-spacing-col-lg;
}

.book-cover-section {
  position: relative;
  flex-shrink: 0;
}

.book-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: $uni-border-radius-base;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.book-badges {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.book-badge {
  background-color: $uni-color-error;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.book-type-badge {
  background-color: $uni-color-primary;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.book-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.book-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.book-author,
.book-publisher,
.book-isbn {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
  margin-top: 8rpx;
}

.book-price {
  font-size: $uni-font-size-lg;
  color: #ff4757;
  font-weight: 600;
}

.book-condition {
  font-size: 24rpx;
  color: $uni-color-primary;
  background-color: rgba($uni-color-primary, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
}

.book-stats {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-number {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-color-primary;
}

.stat-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.section-title {
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-base;
  padding: 0 $uni-spacing-col-lg;
}

.book-description {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.description-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  line-height: 1.6;
}

.book-tags {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-col-base;
}

.tag-item {
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.download-section {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.download-info {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-row-base;
}

.download-item {
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
}

.download-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  min-width: 120rpx;
}

.download-url-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
}

.download-url,
.download-code {
  flex: 1;
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  word-break: break-all;
}

.copy-icon {
  flex-shrink: 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8rpx;
  transition: background-color 0.2s;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.copy-icon-text {
  font-size: 36rpx;
  line-height: 1;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base;
  display: flex;
  gap: $uni-spacing-col-base;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  border-radius: $uni-border-radius-base;
  border: none;
  font-size: $uni-font-size-base;
}

.favorite-btn {
  background-color: rgba($uni-color-warning, 0.1);
  color: $uni-color-warning;

  &.favorited {
    background-color: rgba($uni-color-warning, 0.2);
  }
}

.download-btn {
  background-color: $uni-color-primary;
  color: #ffffff;
}

.share-btn {
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
}

.btn-icon {
  font-size: 32rpx;
}

.related-books {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  margin-bottom: 40rpx;
  padding: $uni-spacing-col-lg;
}

.related-list {
  white-space: nowrap;
}

.related-item {
  display: inline-block;
  width: 120rpx;
  margin-right: $uni-spacing-col-base;
  text-align: center;
}

.related-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-base;
  margin-bottom: 8rpx;
}

.related-title {
  font-size: 24rpx;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: normal;
  line-height: 1.3;
}
</style>
