<template>
  <view class="search-container">
    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索资源"
          confirm-type="search"
          @confirm="onSearch"
          @input="onInput"
          focus
        />
        <text class="clear-icon" v-if="searchKeyword" @click="clearSearch"
          >×</text
        >
        <view class="search-btn" @click="onSearch">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view
      class="search-history"
      v-if="!searchKeyword && searchHistory.length > 0"
    >
      <view class="section-header">
        <text class="section-title">搜索历史</text>
        <text class="clear-history" @click="clearHistory">清空</text>
      </view>
      <view class="history-list">
        <view
          class="history-item"
          v-for="(item, index) in searchHistory"
          :key="index"
          @click="useHistoryItem(item)"
        >
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="hot-search" v-if="!searchKeyword">
      <view class="section-header">
        <text class="section-title">热门搜索</text>
      </view>
      <view class="hot-list">
        <view
          class="hot-item"
          v-for="(item, index) in hotSearches"
          :key="index"
          @click="useHotItem(item)"
        >
          <text class="hot-rank" :class="{ 'top-three': index < 3 }">
            {{ index + 1 }}
          </text>
          <text class="hot-text">{{ item.keyword }}</text>
          <text class="hot-count">{{ item.count }}次搜索</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="searchKeyword">
      <!-- 筛选栏 -->
      <view class="filter-bar">
        <view
          class="filter-item"
          :class="{ active: currentFilter === 'all' }"
          @click="changeFilter('all')"
        >
          全部
          <text class="filter-count" v-if="examResults.length + bookResults.length > 0">
            ({{ examResults.length + bookResults.length }})
          </text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentFilter === 'exam' }"
          @click="changeFilter('exam')"
        >
          考试资料
          <text class="filter-count" v-if="examResults.length > 0">
            ({{ examResults.length }})
          </text>
        </view>
        <view
          class="filter-item"
          :class="{ active: currentFilter === 'book' }"
          @click="changeFilter('book')"
        >
          图书资源
          <text class="filter-count" v-if="bookResults.length > 0">
            ({{ bookResults.length }})
          </text>
        </view>
      </view>

      <!-- 排序栏 -->
      <view class="sort-bar" v-if="searchResults.length > 0">
        <view
          class="sort-item"
          :class="{ active: currentSort === 'default' }"
          @click="changeSort('default')"
        >
          综合
        </view>
        <view
          class="sort-item"
          :class="{ active: currentSort === 'time' }"
          @click="changeSort('time')"
        >
          最新
        </view>
      </view>

      <!-- 加载中 -->
      <view class="loading-state" v-if="isLoading">
        <text class="loading-text">搜索中...</text>
      </view>

      <!-- 结果列表 -->
      <view class="result-list" v-else-if="searchResults.length > 0">
        <view
          class="result-item"
          :class="item.type === 'exam' ? 'exam-item' : 'book-item'"
          v-for="item in searchResults"
          :key="item.uniqueKey"
          @click="goToDetail(item)"
        >
          <view class="item-cover">
            <image
              class="cover-image"
              :src="item.coverImage || (item.type === 'exam' ? '/static/images/default-exam.png' : '/static/images/default-book.png')"
              mode="aspectFill"
            />
          </view>
          <view class="item-info">
            <view class="item-header">
              <text class="item-type-badge" :class="item.type === 'book' ? 'book-badge' : ''">
                {{ item.type === 'exam' ? '考试资料' : '图书资源' }}
              </text>
              <text class="item-title">{{ item.title }}</text>
            </view>
            <view class="item-meta" v-if="item.type === 'exam'">
              <text class="item-course" v-if="item.course">课程：{{ item.course }}</text>
              <text class="item-teacher" v-if="item.teacher">教师：{{ item.teacher }}</text>
              <text class="item-year" v-if="item.year">{{ item.year }}</text>
            </view>
            <view class="item-meta" v-else>
              <text class="item-author" v-if="item.author">作者：{{ item.author }}</text>
              <text class="item-publisher" v-if="item.publisher">出版社：{{ item.publisher }}</text>
              <text class="item-category" v-if="item.category">{{ item.category }}</text>
            </view>
            <view class="item-stats">
              <text class="item-downloads">{{ item.downloads || 0 }}次下载</text>
              <text class="item-views">{{ item.views || 0 }}次浏览</text>
              <text class="item-favorites" v-if="item.type === 'exam' && item.favorites !== undefined">
                ⭐{{ item.favorites || 0 }}
              </text>
              <text class="item-likes" v-else-if="item.type === 'book' && item.likes !== undefined">
                ❤️{{ item.likes || 0 }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态-->
      <view class="empty-state" v-else>
        <text class="empty-icon">🔍</text>
        <text class="empty-text">未找到相关资源</text>
        <text class="empty-tip">试试其他关键词吧</text>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      searchKeyword: "",
      searchHistory: [],
      hotSearches: [
        { keyword: "考研资料", count: 1234 },
        { keyword: "教材", count: 986 },
        { keyword: "电脑", count: 876 },
        { keyword: "自行车", count: 765 },
        { keyword: "耳机", count: 654 },
      ],
      searchResults: [],
      examResults: [],
      bookResults: [],
      currentSort: "default",
      currentFilter: "all", // all, exam, book
      isLoading: false,
    };
  },
  onLoad(options) {
    // 从URL参数获取搜索关键词
    if (options.keyword) {
      this.searchKeyword = decodeURIComponent(options.keyword);
      // 自动执行搜索
      this.$nextTick(() => {
        this.onSearch();
      });
    }
    // 从本地存储加载搜索历史
    const history = uni.getStorageSync("searchHistory");
    if (history) {
      this.searchHistory = JSON.parse(history);
    }
  },
  methods: {
    onInput(e) {
      this.searchKeyword = e.detail.value;
    },
    clearSearch() {
      this.searchKeyword = "";
      this.searchResults = [];
    },
    goBack() {
      uni.navigateBack();
    },
    async onSearch() {
      if (!this.searchKeyword.trim()) return;

      // 添加到搜索历史
      this.addToHistory(this.searchKeyword);

      // 执行搜索
      this.isLoading = true;
      this.examResults = [];
      this.bookResults = [];
      this.searchResults = [];

      try {
        // 并行搜索考试资料和图书资源
        const [examResponse, bookResponse] = await Promise.all([
          request({
            url: "/exam-resources",
            method: "GET",
            data: {
              keyword: this.searchKeyword.trim(),
              page: 1,
              pageSize: 50,
              status: "active",
            },
            skipCache: true,
          }).catch((err) => {
            console.error("搜索考试资料失败:", err);
            return { success: false, data: { list: [] } };
          }),
          request({
            url: "/books",
            method: "GET",
            data: {
              keyword: this.searchKeyword.trim(),
              page: 1,
              pageSize: 50,
              status: "active",
            },
            skipCache: true,
          }).catch((err) => {
            console.error("搜索图书资源失败:", err);
            return { success: false, data: { list: [] } };
          }),
        ]);

        // 处理考试资料结果
        if (examResponse.success && examResponse.data.list) {
          this.examResults = examResponse.data.list.map((item) => ({
            ...item,
            type: "exam",
            uniqueKey: `exam-${item.id}`, // 为微信小程序平台生成唯一key
          }));
        }

        // 处理图书资源结果
        if (bookResponse.success && bookResponse.data.list) {
          this.bookResults = bookResponse.data.list.map((item) => ({
            ...item,
            type: "book",
            uniqueKey: `book-${item.id}`, // 为微信小程序平台生成唯一key
          }));
        }

        // 根据筛选条件合并结果
        this.updateSearchResults();
      } catch (error) {
        console.error("搜索失败:", error);
        uni.showToast({
          title: "搜索失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    updateSearchResults() {
      // 根据筛选条件合并结果
      if (this.currentFilter === "all") {
        // 综合排序：先按创建时间倒序，然后合并
        const allResults = [...this.examResults, ...this.bookResults];
        if (this.currentSort === "time") {
          allResults.sort(
            (a, b) =>
              new Date(b.createdAt || b.publishTime || 0) -
              new Date(a.createdAt || a.publishTime || 0)
          );
        }
        this.searchResults = allResults;
      } else if (this.currentFilter === "exam") {
        this.searchResults = [...this.examResults];
      } else if (this.currentFilter === "book") {
        this.searchResults = [...this.bookResults];
      }
    },
    addToHistory(keyword) {
      const index = this.searchHistory.indexOf(keyword);
      if (index > -1) {
        this.searchHistory.splice(index, 1);
      }
      this.searchHistory.unshift(keyword);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
      uni.setStorageSync("searchHistory", JSON.stringify(this.searchHistory));
    },
    clearHistory() {
      uni.showModal({
        title: "提示",
        content: "确定要清空搜索历史吗？",
        success: (res) => {
          if (res.confirm) {
            this.searchHistory = [];
            uni.removeStorageSync("searchHistory");
          }
        },
      });
    },
    useHistoryItem(keyword) {
      this.searchKeyword = keyword;
      this.onSearch();
    },
    useHotItem(item) {
      this.searchKeyword = item.keyword;
      this.onSearch();
    },
    changeSort(sort) {
      this.currentSort = sort;
      this.updateSearchResults();
    },
    changeFilter(filter) {
      this.currentFilter = filter;
      this.updateSearchResults();
    },
    goToDetail(item) {
      if (item.type === "exam") {
        uni.navigateTo({
          url: `/subpages/resources/exam/detail?id=${item.id}`,
        });
      } else if (item.type === "book") {
        uni.navigateTo({
          url: `/subpages/resources/book/detail?id=${item.id}`,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.search-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

.search-header {
  display: flex;
  align-items: center;
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar {
  flex: 1;
  position: relative;
  margin-right: $uni-spacing-col-base;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background-color: $uni-bg-color-grey;
  border-radius: 36rpx;
  padding: 0 80rpx 0 80rpx;
  font-size: $uni-font-size-base;
  margin-right: 16rpx;
}

.search-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: $uni-text-color-grey;
  z-index: 1;
  pointer-events: none;
}

.search-btn {
  height: 72rpx;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-btn-text {
  font-size: $uni-font-size-base;
  color: #fff;
  font-weight: 500;
}

.clear-icon {
  position: absolute;
  right: 140rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40rpx;
  color: $uni-text-color-grey;
  padding: 0 10rpx;
  z-index: 2;
}

.cancel-btn {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  padding: 0 $uni-spacing-col-sm;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base;
}

.section-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: bold;
}

.clear-history {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.history-list {
  padding: 0 $uni-spacing-col-base;
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-col-base;
}

.history-item {
  background-color: $uni-bg-color-grey;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.history-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
}

.hot-list {
  padding: 0 $uni-spacing-col-base;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: $uni-spacing-col-base 0;
  border-bottom: 1px solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }
}

.hot-rank {
  width: 40rpx;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  text-align: center;

  &.top-three {
    color: $uni-color-error;
    font-weight: bold;
  }
}

.hot-text {
  flex: 1;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin: 0 $uni-spacing-col-base;
}

.hot-count {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.filter-bar {
  display: flex;
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base;
  border-bottom: 1px solid $uni-border-color;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  position: relative;

  &.active {
    color: $uni-color-primary;
    font-weight: bold;
  }

  .filter-count {
    font-size: $uni-font-size-sm;
    margin-left: 4rpx;
  }
}

.sort-bar {
  display: flex;
  background-color: $uni-bg-color-grey;
  padding: $uni-spacing-col-base;
  border-bottom: 1px solid $uni-border-color;
}

.sort-item {
  flex: 1;
  text-align: center;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;

  &.active {
    color: $uni-color-primary;
    font-weight: bold;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.result-list {
  padding: $uni-spacing-col-base;
}

.result-item {
  display: flex;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-col-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-cover {
  width: 180rpx;
  height: 240rpx;
  margin-right: $uni-spacing-col-base;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8rpx;
}

.item-type-badge {
  font-size: 20rpx;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  
  &.book-badge {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
}

.item-title {
  flex: 1;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: bold;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin: 8rpx 0;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.item-course,
.item-teacher,
.item-year,
.item-author,
.item-publisher,
.item-category {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.item-stats {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  margin-top: 8rpx;
}

.item-downloads,
.item-views,
.item-favorites,
.item-likes {
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

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  margin-bottom: 8rpx;
}

.empty-tip {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  opacity: 0.7;
}
</style>
