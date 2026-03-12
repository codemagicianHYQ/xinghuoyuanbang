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
        @click="goToDetail(item.examId)"
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
        <view class="item-cover-container">
          <image
            class="item-cover"
            :src="(item.exam && item.exam.coverImage) || '/static/images/default-exam.png'"
            mode="aspectFill"
          />
          <view class="item-badge" v-if="item.exam && item.exam.isNew">NEW</view>
        </view>
        <view class="item-info">
          <view class="item-title">{{ (item.exam && item.exam.title) || "未知资料" }}</view>
          <view class="item-course" v-if="item.exam && item.exam.course">
            课程：{{ item.exam.course }}
          </view>
          <view class="item-teacher" v-if="item.exam && item.exam.teacher">
            任课教师：{{ item.exam.teacher }}
          </view>
          <view class="item-year" v-if="item.exam && item.exam.year">
            {{ item.exam.year }}
          </view>
          <view class="item-stats">
            <text class="stat-item"
              >{{ (item.exam && item.exam.downloads) || 0 }}次下载</text
            >
            <text class="stat-item"
              >{{ (item.exam && item.exam.views) || 0 }}次浏览</text
            >
          </view>
          <text class="item-time">{{ formatTime(item.createdAt) }}</text>
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
      <text class="empty-icon">📝</text>
      <text class="empty-text">暂无收藏的资料</text>
      <view class="empty-actions">
        <button class="empty-btn" @click="goToExamList">去浏览</button>
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

  methods: {
    // 加载收藏列表
    loadFavorites() {
      this.isLoading = true;
      try {
        // 从本地存储获取收藏的考试资料信息
        let favoritesData = uni.getStorageSync("exam_favorites_data") || [];

        if (favoritesData.length === 0) {
          this.favoritesList = [];
          return;
        }

        // 直接使用本地存储的考试资料信息
        this.favoritesList = favoritesData.map((item, index) => ({
          id: item.id || Date.now() + index,
          examId: item.examId,
          exam: item.exam || {},
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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      }
    },

    // 跳转到资料详情
    goToDetail(examId) {
      if (this.isEditMode) return;
      uni.navigateTo({
        url: `/subpages/resources/exam/detail?id=${examId}`,
      });
    },

    // 返回
    goBack() {
      uni.navigateBack();
    },

    // 去资料列表
    goToExamList() {
      uni.navigateBack();
    },

    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (!this.isEditMode) {
        this.selectedItems = [];
      }
    },

    // 切换选择
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
    removeFavorite(itemId) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这个收藏吗？",
        success: (res) => {
          if (res.confirm) {
            this.doRemoveFavorite(itemId);
          }
        },
      });
    },

    // 执行删除
    doRemoveFavorite(itemId) {
      const item = this.favoritesList.find((i) => i.id === itemId);
      if (!item) return;

      // 从本地存储中删除
      let favorites = uni.getStorageSync("exam_favorites") || [];
      let favoritesData = uni.getStorageSync("exam_favorites_data") || [];

      favorites = favorites.filter((id) => id !== item.examId);
      favoritesData = favoritesData.filter((i) => i.id !== itemId);

      uni.setStorageSync("exam_favorites", favorites);
      uni.setStorageSync("exam_favorites_data", favoritesData);

      // 从列表中删除
      this.favoritesList = this.favoritesList.filter((i) => i.id !== itemId);

      uni.showToast({
        title: "已删除",
        icon: "success",
      });
    },

    // 批量删除
    batchDelete() {
      if (this.selectedItems.length === 0) return;

      uni.showModal({
        title: "确认删除",
        content: `确定要删除选中的 ${this.selectedItems.length} 个收藏吗？`,
        success: (res) => {
          if (res.confirm) {
            let favorites = uni.getStorageSync("exam_favorites") || [];
            let favoritesData = uni.getStorageSync("exam_favorites_data") || [];

            // 获取要删除的资料ID
            const examIdsToRemove = this.selectedItems
              .map((itemId) => {
                const item = this.favoritesList.find((i) => i.id === itemId);
                return item ? item.examId : null;
              })
              .filter((id) => id !== null);

            // 从本地存储中删除
            favorites = favorites.filter((id) => !examIdsToRemove.includes(id));
            favoritesData = favoritesData.filter(
              (item) => !this.selectedItems.includes(item.id)
            );

            uni.setStorageSync("exam_favorites", favorites);
            uni.setStorageSync("exam_favorites_data", favoritesData);

            // 从列表中删除
            this.favoritesList = this.favoritesList.filter(
              (item) => !this.selectedItems.includes(item.id)
            );

            this.selectedItems = [];
            this.isEditMode = false;

            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.favorites-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
}

.header-left {
  width: 60rpx;
}

.back-icon {
  font-size: 40rpx;
  color: $uni-text-color;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.header-right {
  width: 60rpx;
  text-align: right;
}

.edit-btn {
  font-size: $uni-font-size-base;
  color: $uni-color-primary;
}

.favorites-list {
  padding: $uni-spacing-col-base;
}

.favorite-item {
  display: flex;
  align-items: flex-start;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-row-base;
  gap: $uni-spacing-col-base;
  position: relative;
}

.item-checkbox {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 40rpx;
  height: 40rpx;
  border: 2px solid $uni-border-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $uni-bg-color;
  z-index: 10;
}

.checkbox-icon {
  font-size: 24rpx;
  color: transparent;
}

.checkbox-icon.checked {
  color: $uni-color-primary;
}

.item-cover-container {
  position: relative;
  flex-shrink: 0;
  width: 180rpx;
  height: 240rpx;
}

.item-cover {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
  background-color: #f5f5f5;
}

.item-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background-color: $uni-color-error;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.item-title {
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-text-color;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item-course,
.item-teacher,
.item-year {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.item-stats {
  display: flex;
  gap: $uni-spacing-col-base;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.item-time {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.item-actions {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 32rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  margin-bottom: 40rpx;
}

.empty-actions {
  margin-top: 40rpx;
}

.empty-btn {
  padding: 20rpx 60rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border-radius: $uni-border-radius-pill;
  border: none;
  font-size: $uni-font-size-base;
}

.batch-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.batch-info {
  flex: 1;
}

.batch-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.batch-buttons {
  display: flex;
  gap: $uni-spacing-col-base;
}

.batch-btn {
  padding: 16rpx 32rpx;
  border-radius: $uni-border-radius-base;
  border: none;
  font-size: $uni-font-size-base;
}

.cancel-btn {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.delete-btn {
  background-color: $uni-color-error;
  color: #ffffff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid $uni-border-color;
  border-top-color: $uni-color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20rpx;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}
</style>
