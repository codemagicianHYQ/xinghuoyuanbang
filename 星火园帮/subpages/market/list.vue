<template>
  <view class="market-container">
    <!-- 搜索和筛选区域 -->
    <view class="search-section">
      <view class="search-bar">
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索宝贝"
          @confirm="onSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
      <view class="favorites-button" @click="goToFavorites">
        <text class="favorites-icon">❤️</text>
        <text class="favorites-text">收藏</text>
      </view>
      <view class="my-button" @click="goToMy">
        <text class="my-icon">😊</text>
        <text class="my-text">我的</text>
      </view>
    </view>

    <!-- 左右分块筛选区域 -->
    <view class="filter-blocks">
      <!-- 左侧分类选择块 -->
      <view
        class="filter-block category-block"
        :class="{ expanded: showCategoryFilter }"
      >
        <view class="block-toggle" @click="toggleCategoryFilter">
          <text class="block-title">商品分类</text>
          <text class="block-arrow" :class="{ rotated: showCategoryFilter }"
            >▼</text
          >
        </view>

        <view class="block-content" v-if="showCategoryFilter">
          <view class="category-options">
            <view
              class="category-option"
              :class="{ active: selectedCategory === category.id }"
              v-for="category in categoryOptions"
              :key="category.id"
              @click="selectCategory(category.id)"
            >
              <text class="category-icon">{{ category.icon }}</text>
              <text class="category-name">{{ category.name }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 右侧排序选择块 -->
      <view
        class="filter-block sort-block"
        :class="{ expanded: showSortFilter }"
      >
        <view class="block-toggle" @click="toggleSortFilter">
          <text class="block-title">排序方式</text>
          <text class="block-arrow" :class="{ rotated: showSortFilter }"
            >▼</text
          >
        </view>

        <view class="block-content" v-if="showSortFilter">
          <view class="sort-options">
            <view
              class="sort-option"
              :class="{ active: sortBy === sort.id }"
              v-for="sort in sortOptions"
              :key="sort.id"
              @click="changeSortBy(sort.id)"
            >
              <text class="sort-icon">{{ sort.icon }}</text>
              <text class="sort-name">{{ sort.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品列表 - 双列瀑布流 -->
    <view class="goods-waterfall" v-if="goodsList.length > 0">
      <view class="waterfall-column">
        <view
          class="goods-item"
          v-for="item in leftColumnGoods"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <view class="goods-image-container">
            <image
              class="goods-image"
              :src="getImageSrc(item)"
              mode="aspectFill"
              @load="onImageLoad"
              @error="onImageError"
            />
            <view class="goods-status" v-if="item.status === 'sold'">
              <text class="status-text">已售</text>
            </view>
            <view
              class="like-button"
              @click.stop="toggleLike(item)"
              v-if="item.isLiked"
            >
              <text class="like-icon liked">❤️</text>
            </view>
            <view class="like-button" @click.stop="toggleLike(item)" v-else>
              <text class="like-icon">🤍</text>
            </view>
          </view>
          <view class="goods-info">
            <view class="goods-main-info">
              <text class="goods-title">{{ item.title }}</text>
              <view class="goods-desc">{{ item.description }}</view>
              <view class="goods-price-row">
                <view class="price-section">
                  <text class="goods-price">¥{{ item.price }}</text>
                  <text class="goods-original-price" v-if="item.originalPrice"
                    >¥{{ item.originalPrice }}</text
                  >
                </view>
                <view
                  class="goods-tags"
                  v-if="item.isNegotiable || item.condition"
                >
                  <text class="goods-tag" v-if="item.isNegotiable">可小刀</text>
                  <text class="goods-tag condition-tag" v-if="item.condition">{{
                    getConditionText(item.condition)
                  }}</text>
                </view>
              </view>
            </view>
            <view class="goods-bottom-info">
              <view class="goods-meta">
                <view class="goods-user">
                  <image
                    class="user-avatar"
                    :src="
                      item.userAvatar || '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <text class="user-name">{{ item.userName }}</text>
                </view>
                <text class="time-text">{{
                  formatTime(item.publishTime)
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="waterfall-column">
        <view
          class="goods-item"
          v-for="item in rightColumnGoods"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <view class="goods-image-container">
            <image
              class="goods-image"
              :src="getImageSrc(item)"
              mode="aspectFill"
              @load="onImageLoad"
              @error="onImageError"
            />
            <view class="goods-status" v-if="item.status === 'sold'">
              <text class="status-text">已售</text>
            </view>
            <view
              class="like-button"
              @click.stop="toggleLike(item)"
              v-if="item.isLiked"
            >
              <text class="like-icon liked">❤️</text>
            </view>
            <view class="like-button" @click.stop="toggleLike(item)" v-else>
              <text class="like-icon">🤍</text>
            </view>
          </view>
          <view class="goods-info">
            <view class="goods-main-info">
              <text class="goods-title">{{ item.title }}</text>
              <view class="goods-desc">{{ item.description }}</view>
              <view class="goods-price-row">
                <view class="price-section">
                  <text class="goods-price">¥{{ item.price }}</text>
                  <text class="goods-original-price" v-if="item.originalPrice"
                    >¥{{ item.originalPrice }}</text
                  >
                </view>
                <view
                  class="goods-tags"
                  v-if="item.isNegotiable || item.condition"
                >
                  <text class="goods-tag" v-if="item.isNegotiable">可小刀</text>
                  <text class="goods-tag condition-tag" v-if="item.condition">{{
                    getConditionText(item.condition)
                  }}</text>
                </view>
              </view>
            </view>
            <view class="goods-bottom-info">
              <view class="goods-meta">
                <view class="goods-user">
                  <image
                    class="user-avatar"
                    :src="
                      item.userAvatar || '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <text class="user-name">{{ item.userName }}</text>
                </view>
                <text class="time-text">{{
                  formatTime(item.publishTime)
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="isLoading">
      <text class="load-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="goodsList.length === 0 && !isLoading">
      <text class="empty-icon">🛍️</text>
      <text class="empty-text">暂无商品</text>
      <view class="empty-actions">
        <button class="empty-btn" @click="goToPublish">去发布</button>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-fab" @click="goToPublish">
      <text class="fab-icon">+</text>
      <text class="fab-text">发布</text>
    </view>

    <!-- 筛选弹窗 -->
    <view
      class="filter-modal"
      v-if="showFilterModal"
      @click="showFilterModal = false"
    >
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <text class="filter-close" @click="showFilterModal = false">✕</text>
        </view>
        <view class="filter-section">
          <text class="filter-label">价格区间</text>
          <view class="price-range">
            <input
              class="price-input"
              v-model="filterConditions.minPrice"
              placeholder="最低价"
              type="number"
            />
            <text class="price-separator">-</text>
            <input
              class="price-input"
              v-model="filterConditions.maxPrice"
              placeholder="最高价"
              type="number"
            />
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-label">商品状态</text>
          <view class="condition-list">
            <view
              class="condition-item"
              :class="{
                active: filterConditions.condition === condition.value,
              }"
              v-for="condition in conditionOptions"
              :key="condition.value"
              @click="filterConditions.condition = condition.value"
            >
              {{ condition.label }}
            </view>
          </view>
        </view>
        <view class="filter-actions">
          <button class="filter-reset" @click="resetFilter">重置</button>
          <button class="filter-confirm" @click="applyFilter">确定</button>
        </view>
      </view>
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
      sortBy: "time", // time, price_asc, price_desc
      categoryOptions: [
        { id: "all", name: "全部", icon: "🏠" },
        { id: "books", name: "书籍", icon: "📚" },
        { id: "electronics", name: "数码", icon: "📱" },
        { id: "clothes", name: "服饰", icon: "👕" },
        { id: "sports", name: "运动", icon: "⚽" },
        { id: "beauty", name: "美妆", icon: "💄" },
        { id: "daily", name: "日用", icon: "🏠" },
        { id: "others", name: "其他", icon: "📦" },
      ],
      sortOptions: [
        { id: "time", name: "最新发布", icon: "🕒" },
        { id: "price_asc", name: "价格升序", icon: "📈" },
        { id: "price_desc", name: "价格降序", icon: "📉" },
      ],
      goodsList: [],
      isLoading: false,
      page: 1,
      hasMore: true,
      showCategoryFilter: false,
      showSortFilter: false,
      showFilterModal: false,
      filterConditions: {
        minPrice: "",
        maxPrice: "",
        condition: "all", // all, new, used, excellent
      },
      conditionOptions: [
        { label: "全部", value: "all" },
        { label: "全新", value: "new" },
        { label: "几乎全新", value: "excellent" },
        { label: "轻微使用痕迹", value: "good" },
        { label: "明显使用痕迹", value: "used" },
      ],
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
      userInfo: (state) => state.userInfo,
    }),
    // 瀑布流左列数据
    leftColumnGoods() {
      return this.goodsList.filter((_, index) => index % 2 === 0);
    },
    // 瀑布流右列数据
    rightColumnGoods() {
      return this.goodsList.filter((_, index) => index % 2 === 1);
    },
  },
  onLoad() {
    this.loadGoodsList();
  },

  onShow() {
    // 页面显示时刷新收藏状态
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
    // 检查收藏状态
    checkFavoriteStatus(productId) {
      const favorites = uni.getStorageSync("market_favorites") || [];
      return favorites.includes(productId);
    },
    // 切换分类筛选展开状态
    toggleCategoryFilter() {
      this.showCategoryFilter = !this.showCategoryFilter;
      // 关闭排序筛选
      this.showSortFilter = false;
    },
    // 切换排序筛选展开状态
    toggleSortFilter() {
      this.showSortFilter = !this.showSortFilter;
      // 关闭分类筛选
      this.showCategoryFilter = false;
    },
    // 跳转到我的收藏
    goToFavorites() {
      uni.navigateTo({
        url: "/subpages/market/favorites",
        success: (res) => {},
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({
            title: "跳转失败，请检查页面路径",
            icon: "none",
            duration: 2000,
          });
        },
      });
    },
    // 跳转到我的页面
    goToMy() {
      uni.navigateTo({
        url: "/subpages/market/my",
        success: (res) => {},
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({
            title: "跳转失败，请检查页面路径",
            icon: "none",
            duration: 2000,
          });
        },
      });
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.refreshList();
    },
    changeSortBy(sortBy) {
      this.sortBy = sortBy;
      this.refreshList();
    },
    onSearch() {
      this.refreshList();
    },
    async loadGoodsList() {
      if (this.isLoading) return;
      this.isLoading = true;

      try {
        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          this.isLoading = false;
          return;
        }

        const params = {
          page: this.page,
          limit: 10,
          communityId: currentCommunity.id, // 添加社区ID
        };

        // 只添加非空参数
        if (this.selectedCategory && this.selectedCategory !== "all") {
          params.category = this.selectedCategory;
        }
        if (this.searchKeyword && this.searchKeyword.trim()) {
          params.search = this.searchKeyword.trim();
        }

        // 排序参数
        if (this.sortBy === "time") {
          params.sortBy = "createdAt";
        } else if (this.sortBy === "price_asc") {
          params.sortBy = "price";
          params.sortOrder = "ASC";
        } else if (this.sortBy === "price_desc") {
          params.sortBy = "price";
          params.sortOrder = "DESC";
        }

        // 价格筛选
        if (
          this.filterConditions.minPrice &&
          this.filterConditions.minPrice !== ""
        ) {
          params.minPrice = this.filterConditions.minPrice;
        }
        if (
          this.filterConditions.maxPrice &&
          this.filterConditions.maxPrice !== ""
        ) {
          params.maxPrice = this.filterConditions.maxPrice;
        }

        // 商品状态筛选
        if (
          this.filterConditions.condition &&
          this.filterConditions.condition !== "all" &&
          this.filterConditions.condition !== ""
        ) {
          params.condition = this.filterConditions.condition;
        }

        // 调用真实API获取商品列表
        const result = await request({
          url: "/market/products",
          method: "GET",
          data: params,
        });

        if (result.success) {
          const newGoods = result.data.list.map((item) => {
            return {
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              originalPrice: item.originalPrice,
              isNegotiable: item.isNegotiable,
              isNew: item.condition === "new",
              condition: item.condition,
              images: item.images || [],
              sellerId: item.seller?.id || item.sellerId || "unknown",
              userName: item.seller?.nickname || "匿名用户",
              userAvatar:
                item.seller?.avatarUrl || "/static/images/default-avatar.png",
              location: item.seller?.school || "",
              publishTime: item.createdAt,
              viewCount: item.viewCount || 0,
              likeCount: item.favoriteCount || 0,
              isLiked: this.checkFavoriteStatus(item.id), // 从本地存储检查收藏状态
              status: item.status === "active" ? "available" : item.status,
            };
          });

          if (this.page === 1) {
            this.goodsList = newGoods;
          } else {
            this.goodsList = [...this.goodsList, ...newGoods];
          }

          // 计算总页数
          const totalPages = Math.ceil(
            result.data.total / result.data.pageSize
          );
          this.hasMore = result.data.page < totalPages;
        } else {
          throw new Error(result.message || "获取商品列表失败");
        }
      } catch (error) {
        console.error("加载商品列表失败:", error);
        uni.showToast({
          title: error.message || "加载失败",
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
        url: `/subpages/market/detail?id=${id}`,
      });
    },
    goToPublish() {
      if (!this.hasLogin) {
        uni.showModal({
          title: "提示",
          content: "请先登录后再发布商品",
          showCancel: false,
          confirmText: "去登录",
          success: () => {
            uni.navigateTo({
              url: "/pages/login/login",
            });
          },
        });
        return;
      }
      uni.navigateTo({
        url: "/subpages/market/publish",
      });
    },
    toggleLike(item) {
      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      // 获取当前收藏列表
      let favorites = uni.getStorageSync("market_favorites") || [];
      let favoritesData = uni.getStorageSync("market_favorites_data") || [];

      if (item.isLiked) {
        // 取消收藏 - 从列表中移除
        favorites = favorites.filter((id) => id !== item.id);
        favoritesData = favoritesData.filter(
          (data) => data.productId !== item.id
        );
        item.likeCount = Math.max(0, item.likeCount - 1);
        uni.showToast({
          title: "已取消收藏",
          icon: "none",
        });
      } else {
        // 添加收藏 - 添加到列表
        if (!favorites.includes(item.id)) {
          favorites.push(item.id);
          // 保存完整的商品信息
          const favoriteItem = {
            id: Date.now() + Math.random(),
            productId: item.id,
            product: {
              id: item.id,
              title: item.title || "未知商品",
              price: item.price || 0,
              originalPrice: item.originalPrice || item.price || 0,
              description: item.description || "暂无描述",
              images: item.images || [],
              condition: item.condition || "unknown",
              category: item.category || "其他",
              location: item.location || "未知地点",
              seller: {
                id: item.sellerId || "unknown",
                nickname: item.userName || "匿名用户",
                avatarUrl:
                  item.userAvatar || "/static/images/default-avatar.png",
                school: item.location || "",
              },
              status: item.status || "active",
              createdAt: item.publishTime || new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          };

          favoritesData.push(favoriteItem);
        }
        item.likeCount += 1;
        uni.showToast({
          title: "已收藏",
          icon: "none",
        });
      }

      // 保存到本地存储
      uni.setStorageSync("market_favorites", favorites);
      uni.setStorageSync("market_favorites_data", favoritesData);

      // 更新UI状态
      item.isLiked = !item.isLiked;
    },
    resetFilter() {
      this.filterConditions = {
        minPrice: "",
        maxPrice: "",
        condition: "all",
      };
    },
    applyFilter() {
      this.showFilterModal = false;
      this.refreshList();
    },
    formatTime(timeStr) {
      if (!timeStr) return "未知时间";

      const time = new Date(timeStr);
      const now = new Date();
      const diff = now - time;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60));
          return `${minutes}分钟前`;
        }
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        // 手动格式化日期，确保在所有平台上都显示中文格式
        const year = time.getFullYear();
        const month = String(time.getMonth() + 1).padStart(2, "0");
        const day = String(time.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
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
    onImageLoad() {
      // 图片加载完成后的处理（可用于优化瀑布流布局）
      // 在实际项目中可以根据图片尺寸调整商品卡片高度
    },
    onImageError(e) {
      console.error("图片加载失败:", e);
    },
    getImageUrl(url) {
      if (!url) {
        return null;
      }
      // 直接返回原始URL，不进行编码
      return url;
    },
    getImageSrc(item) {
      return (
        this.getImageUrl(item.images[0]) || "/static/images/default-goods.png"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.market-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 50%, #e8f4fd 100%);
  padding-bottom: 120rpx;
}

.search-section {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: $uni-spacing-col-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-bar {
  flex: 1;
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
  color: $uni-text-color-grey;
}

.filter-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background-color: $uni-color-primary;
  border-radius: 12rpx;

  .filter-icon {
    font-size: 24rpx;
    color: #ffffff;
  }

  .filter-text {
    font-size: 20rpx;
    color: #ffffff;
    margin-top: 2rpx;
  }
}

.category-scroll {
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
  white-space: nowrap;

  /* 隐藏滚动条 */
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  background-color: $uni-bg-color-grey;
  transition: all 0.3s;
  min-width: 120rpx;

  &.active {
    background-color: $uni-color-primary;

    .category-icon,
    .category-name {
      color: #ffffff;
    }
  }

  .category-icon {
    font-size: 32rpx;
    margin-bottom: 4rpx;
  }

  .category-name {
    font-size: 24rpx;
    color: $uni-text-color-grey;
  }
}

.sort-section {
  display: flex;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
  padding: 0 $uni-spacing-col-base;
}

.sort-item {
  flex: 1;
  text-align: center;
  padding: $uni-spacing-col-sm 0;
}

.sort-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;

  &.active {
    color: $uni-color-primary;
    font-weight: 500;
  }
}

.goods-waterfall {
  padding: $uni-spacing-col-base;
  display: flex;
  gap: $uni-spacing-col-base;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx; /* 统一间距 */
}

.goods-item {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  height: 480rpx; /* 固定卡片高度 */

  &:active {
    transform: scale(0.98);
  }
}

.goods-image-container {
  position: relative;
  width: 100%;
  height: 200rpx; /* 固定图片容器高度 */
  border-radius: $uni-border-radius-base $uni-border-radius-base 0 0;
  overflow: hidden;
  flex-shrink: 0; /* 防止图片容器被压缩 */
}

.goods-image {
  width: 100%;
  height: 100%; /* 填充整个容器 */
  object-fit: cover;
  display: block;
  background-color: #f5f5f5;
}

.goods-status {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;

  .status-text {
    color: #ffffff;
    font-size: 24rpx;
  }
}

.like-button {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .like-icon {
    font-size: 28rpx;

    &.liked {
      color: #ff4757;
    }
  }
}

.goods-info {
  padding: $uni-spacing-col-base;
  flex: 1; /* 占用剩余空间 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 280rpx; /* 固定信息区域高度 = 总高度(480) - 图片高度(200) */
  overflow: hidden; /* 防止内容溢出 */
}

.goods-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goods-bottom-info {
  margin-top: auto;
}

.goods-title {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
  height: 44rpx; /* 固定标题高度为1行 */
}

.goods-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  line-height: 1.4;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  height: 68rpx; /* 固定描述高度为2行 */
  flex-shrink: 0;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  height: 40rpx; /* 固定价格行高度 */
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: bold;
}

.goods-original-price {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  text-decoration: line-through;
}

.goods-tags {
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0;
}

.goods-tag {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  border: 1px solid $uni-color-warning;
  color: $uni-color-warning;

  &.new-tag {
    border-color: #27ae60;
    color: #27ae60;
  }

  &.condition-tag {
    border-color: #3498db;
    color: #3498db;
  }
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.goods-user {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.user-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.user-name {
  font-size: 24rpx;
  color: $uni-text-color;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-text {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  flex-shrink: 0;
}

.load-more {
  text-align: center;
  padding: $uni-spacing-col-base;
}

.load-text {
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
  margin-bottom: 32rpx;
}

.empty-actions {
  display: flex;
  gap: 24rpx;
}

.empty-btn {
  padding: 16rpx 32rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
}

.publish-fab {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
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

// 筛选弹窗样式
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.filter-content {
  width: 100%;
  background-color: $uni-bg-color;
  border-radius: 24rpx 24rpx 0 0;
  padding: $uni-spacing-col-lg;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-col-lg;
}

.filter-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
}

.filter-close {
  font-size: 32rpx;
  color: $uni-text-color-grey;
  padding: 8rpx;
}

/* 左右分块筛选样式 */
.filter-blocks {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.filter-block {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e9ecef;
  overflow: hidden;
}

.category-block {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.sort-block {
  background: linear-gradient(135deg, #f1f8e9 0%, #fff3e0 100%);
}

.block-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-bottom: 1rpx solid #e0e0e0;
}

.block-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
}

.block-arrow {
  font-size: 24rpx;
  color: #666666;
  transition: transform 0.3s ease;
}

.block-arrow.rotated {
  transform: rotate(180deg);
}

.block-content {
  position: fixed;
  top: 230rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 60vh;
  overflow-y: auto;
  border: 1rpx solid #e0e0e0;
  padding: 20rpx 24rpx;
}

/* 左侧分类弹层位置 */
.category-block .block-content {
  left: 24rpx;
  right: 50%;
  margin-right: 8rpx;
}

/* 右侧排序弹层位置 */
.sort-block .block-content {
  left: 50%;
  right: 24rpx;
  margin-left: 8rpx;
}

/* 背景遮罩 */
.filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.category-options,
.sort-options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.category-option,
.sort-option {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.category-option.active,
.sort-option.active {
  background-color: #007aff;
  border-color: #007aff;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.category-option.active .category-name,
.sort-option.active .sort-name {
  color: #ffffff;
}

.category-icon,
.sort-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.category-name,
.sort-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

/* 收藏按钮样式 */
.favorites-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-radius: 12rpx;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60rpx;
  min-width: 120rpx;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.favorites-button:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.favorites-icon {
  font-size: 24rpx;
}

.favorites-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

/* 我的按钮样式 */
.my-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
  border-radius: 12rpx;
  gap: 8rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60rpx;
  min-width: 120rpx;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.my-button:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.my-icon {
  font-size: 24rpx;
}

.my-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.filter-section {
  margin-bottom: $uni-spacing-col-lg;
}

.filter-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: $uni-spacing-col-sm;
  display: block;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price-input {
  flex: 1;
  height: 72rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: 0 16rpx;
  font-size: $uni-font-size-base;
}

.price-separator {
  color: $uni-text-color-grey;
  font-size: $uni-font-size-base;
}

.condition-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.condition-item {
  padding: 16rpx 24rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;

  &.active {
    border-color: $uni-color-primary;
    color: $uni-color-primary;
    background-color: rgba(65, 105, 225, 0.1);
  }
}

.filter-actions {
  display: flex;
  gap: 24rpx;
  margin-top: $uni-spacing-col-lg;
}

.filter-reset,
.filter-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
}

.filter-reset {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.filter-confirm {
  background-color: $uni-color-primary;
  color: #ffffff;
}
</style>
