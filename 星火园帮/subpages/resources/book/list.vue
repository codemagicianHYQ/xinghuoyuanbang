<template>
  <view class="book-list-container">
    <!-- 头部操作栏 -->
    <view class="header-bar">
      <view class="header-title">图书资源</view>
      <view class="header-action" @click="goToFavorites">
        <text class="action-icon">⭐</text>
        <text class="action-text">我的收藏</text>
      </view>
    </view>

    <!-- 图书分类筛选 -->
    <scroll-view class="category-tabs" scroll-x>
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

    <!-- 子分类筛选（当选择大类时显示） -->
    <scroll-view class="sub-category-tabs" scroll-x v-if="showSubCategories">
      <view class="sub-category-list">
        <view
          class="sub-category-item"
          :class="{ active: selectedSubCategory === subCategory.id }"
          v-for="subCategory in currentSubCategories"
          :key="subCategory.id"
          @click="selectSubCategory(subCategory.id)"
        >
          {{ subCategory.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 图书列表 -->
    <view class="book-list" v-if="bookList.length > 0">
      <view
        class="book-item"
        v-for="item in bookList"
        :key="item.id"
        @click="viewDetail(item.id)"
      >
        <view class="book-cover">
          <image
            class="cover-image"
            :src="item.coverImage || '/static/images/default-book.png'"
            mode="aspectFill"
          />
          <view class="book-badge" v-if="item.isNew">NEW</view>
          <view class="book-type-badge" v-if="item.isElectronic">电子书</view>
        </view>
        <view class="book-info">
          <text class="book-title">{{ item.title }}</text>
          <text class="book-author">{{ item.author }}</text>
          <text class="book-publisher">{{ item.publisher }}</text>
          <view class="book-meta" v-if="item.price || item.condition">
            <text class="book-price" v-if="item.price">¥{{ item.price }}</text>
            <text class="book-condition" v-if="getConditionText(item.condition)">{{
              getConditionText(item.condition)
            }}</text>
          </view>
          <view class="book-stats">
            <text class="download-count">{{ item.downloads }}次下载</text>
            <text class="view-count">{{ item.views }}次浏览</text>
            <text class="like-count">❤️{{ item.likes }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📚</text>
      <text class="empty-text">暂无图书资源</text>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && bookList.length > 0">
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>

  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      selectedCategory: "all",
      selectedSubCategory: "all",
      showSubCategories: false,
      categories: [
        { id: "all", name: "全部" },
        { id: "medical", name: "医学类" },
        { id: "literature", name: "文学类" },
        { id: "science", name: "科技类" },
        { id: "education", name: "教育类" },
        { id: "business", name: "商业类" },
        { id: "history", name: "历史类" },
        { id: "philosophy", name: "哲学类" },
      ],
      subCategories: {
        literature: [
          { id: "all", name: "全部文学" },
          { id: "novel", name: "小说" },
          { id: "poetry", name: "诗歌" },
          { id: "essay", name: "散文" },
          { id: "drama", name: "戏剧" },
        ],
        science: [
          { id: "all", name: "全部科技" },
          { id: "computer", name: "计算机" },
          { id: "physics", name: "物理学" },
          { id: "chemistry", name: "化学" },
          { id: "biology", name: "生物学" },
        ],
        education: [
          { id: "all", name: "全部教育" },
          { id: "textbook", name: "教材" },
          { id: "reference", name: "参考书" },
          { id: "exam", name: "考试资料" },
        ],
        medical: [
          { id: "all", name: "全部医学" },
          { id: "tcm", name: "中医" },
          { id: "western", name: "西医" },
          { id: "nursing", name: "护理" },
          { id: "pharmacy", name: "药学" },
        ],
        business: [
          { id: "all", name: "全部商业" },
          { id: "management", name: "管理" },
          { id: "marketing", name: "营销" },
          { id: "finance", name: "金融" },
          { id: "economics", name: "经济" },
        ],
        history: [
          { id: "all", name: "全部历史" },
          { id: "china", name: "中国史" },
          { id: "world", name: "世界史" },
          { id: "ancient", name: "古代史" },
          { id: "modern", name: "近代史" },
        ],
        philosophy: [
          { id: "all", name: "全部哲学" },
          { id: "chinese", name: "中国哲学" },
          { id: "western", name: "西方哲学" },
          { id: "ethics", name: "伦理学" },
          { id: "logic", name: "逻辑学" },
        ],
      },
      bookList: [],
      page: 1,
      hasMore: true,
      loadStatus: "more",
      isLoading: false,
    };
  },
  computed: {
    currentSubCategories() {
      if (
        this.selectedCategory === "all" ||
        !this.subCategories[this.selectedCategory]
      ) {
        return [];
      }
      return this.subCategories[this.selectedCategory];
    },
  },
  onLoad() {
    this.loadBookList();
  },
  onReachBottom() {
    if (this.hasMore && !this.isLoading) {
      this.loadMore();
    }
  },
  onPullDownRefresh() {
    this.refresh();
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.selectedSubCategory = "all";
      this.showSubCategories =
        categoryId !== "all" && this.subCategories[categoryId];
      this.page = 1;
      this.bookList = [];
      this.loadBookList();
    },
    selectSubCategory(subCategoryId) {
      this.selectedSubCategory = subCategoryId;
      this.page = 1;
      this.bookList = [];
      this.loadBookList();
    },
    async loadBookList() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.loadStatus = "loading";

      try {
        // 调用后端API获取图书列表
        const params = {
          page: this.page,
          pageSize: 10,
          status: "active",
        };

        // 添加筛选条件
        if (this.selectedCategory !== "all") {
          params.category = this.selectedCategory;
        }
        if (this.selectedSubCategory !== "all") {
          params.subCategory = this.selectedSubCategory;
        }

        const result = await request({
          url: "/books",
          method: "GET",
          data: params,
        });

        if (result.success && result.data) {
          const { list, total } = result.data;

          if (this.page === 1) {
            this.bookList = list;
          } else {
            this.bookList = [...this.bookList, ...list];
          }

          this.hasMore = this.bookList.length < total;
          this.loadStatus = this.hasMore ? "more" : "noMore";
        } else {
          throw new Error(result.message || "获取数据失败");
        }
      } catch (error) {
        console.error("加载图书列表失败:", error);
        this.loadStatus = "more";
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    loadMore() {
      this.page++;
      this.loadBookList();
    },
    refresh() {
      this.page = 1;
      this.bookList = [];
      this.loadBookList().then(() => {
        uni.stopPullDownRefresh();
      });
    },
    viewDetail(id) {
      uni.navigateTo({
        url: `/subpages/resources/book/detail?id=${id}`,
      });
    },
    goToFavorites() {
      uni.navigateTo({
        url: "/subpages/resources/book/favorites",
      });
    },
    getConditionText(condition) {
      if (!condition) return null;
      const conditionMap = {
        new: "全新",
        good: "九成新",
        fair: "七成新",
        poor: "五成新",
      };
      return conditionMap[condition] || null;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.book-list-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

// 头部操作栏
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
}

.header-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background-color: rgba($uni-color-warning, 0.1);
  color: $uni-color-warning;
  font-size: $uni-font-size-sm;
}

.action-icon {
  font-size: 28rpx;
}

.action-text {
  font-size: $uni-font-size-sm;
}

// 分类筛选
.category-tabs {
  background-color: $uni-bg-color;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid $uni-border-color;

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.category-list {
  display: inline-flex;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.category-item {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
  transition: all 0.3s;
  white-space: nowrap;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

// 子分类
.sub-category-tabs {
  background-color: $uni-bg-color;
  white-space: nowrap;
  border-bottom: 1px solid $uni-border-color;

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sub-category-list {
  display: inline-flex;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.sub-category-item {
  padding: 8rpx 20rpx;
  border-radius: 25rpx;
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  transition: all 0.3s;
  white-space: nowrap;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

// 图书列表
.book-list {
  padding: $uni-spacing-col-base;
}

.book-item {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-row-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  display: flex;
  gap: $uni-spacing-col-base;

  &:active {
    transform: scale(0.98);
  }
}

.book-cover {
  position: relative;
  width: 180rpx;
  height: 240rpx;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
  object-fit: cover;
}

.book-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background-color: $uni-color-error;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.book-type-badge {
  position: absolute;
  bottom: -8rpx;
  left: -8rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: $uni-text-color;
  line-height: 1.4;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.book-author {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  margin-bottom: 4rpx;
}

.book-publisher {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  margin-bottom: 8rpx;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
  margin-bottom: 8rpx;
}

.book-price {
  font-size: $uni-font-size-lg;
  color: #ff4757;
  font-weight: 500;
}

.book-condition {
  font-size: 24rpx;
  color: $uni-color-primary;
  background-color: rgba($uni-color-primary, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.book-stats {
  display: flex;
  gap: $uni-spacing-col-base;
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

// 空状态
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

// 加载更多
.load-more {
  padding: $uni-spacing-row-base 0;
}

</style>
