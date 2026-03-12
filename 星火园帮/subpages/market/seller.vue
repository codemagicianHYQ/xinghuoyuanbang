<template>
  <view class="seller-container">
    <!-- 卖家头部信息 -->
    <view class="seller-header card">
      <view class="seller-avatar-section">
        <image
          :src="sellerInfo.avatar || '/static/images/default-avatar.png'"
          class="seller-avatar"
          mode="aspectFill"
        />
        <view class="seller-basic-info">
          <text class="seller-name">{{
            sellerInfo.nickname || sellerInfo.name
          }}</text>
          <view class="seller-rating">
            <view class="rating-stars">
              <text
                class="star"
                :class="{ active: index < sellerInfo.rating }"
                v-for="index in 5"
                :key="index"
                >⭐</text
              >
            </view>
            <text class="rating-text">{{ sellerInfo.rating }}.0</text>
          </view>
          <text class="seller-desc">{{
            sellerInfo.description || "这个人很懒，什么都没写"
          }}</text>
        </view>
      </view>

      <view class="seller-stats">
        <view class="stat-item">
          <text class="stat-number">{{ sellerInfo.goodsCount || 0 }}</text>
          <text class="stat-label">在售</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ sellerInfo.soldCount || 0 }}</text>
          <text class="stat-label">已售</text>
        </view>
      </view>

      <view class="action-buttons" v-if="!isCurrentUserSeller">
        <button
          class="btn-follow"
          :class="{ followed: isFollowed }"
          @click="toggleFollow"
        >
          {{ isFollowed ? "已关注" : "关注" }}
        </button>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-header">
        <text class="section-title">Ta的商品</text>
        <view class="filter-tabs">
          <text
            class="filter-tab"
            :class="{ active: currentFilter === 'selling' }"
            @click="changeFilter('selling')"
            >在售</text
          >
          <text
            class="filter-tab"
            :class="{ active: currentFilter === 'sold' }"
            @click="changeFilter('sold')"
            >已售</text
          >
        </view>
      </view>

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
                    <text class="goods-tag" v-if="item.isNegotiable"
                      >可小刀</text
                    >
                    <text
                      class="goods-tag condition-tag"
                      v-if="item.condition"
                      >{{ getConditionText(item.condition) }}</text
                    >
                  </view>
                </view>
              </view>
            </view>
            <view class="goods-bottom-info">
              <view class="goods-meta">
                <view class="goods-user">
                  <image
                    class="user-avatar"
                    :src="
                      (item.seller && item.seller.avatarUrl) ||
                      '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <text class="user-name">{{
                    (item.seller && item.seller.nickname) || "匿名用户"
                  }}</text>
                </view>
                <text class="time-text">{{
                  formatTime(item.createdAt || item.publishTime)
                }}</text>
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
                    <text class="goods-tag" v-if="item.isNegotiable"
                      >可小刀</text
                    >
                    <text
                      class="goods-tag condition-tag"
                      v-if="item.condition"
                      >{{ getConditionText(item.condition) }}</text
                    >
                  </view>
                </view>
              </view>
            </view>
            <view class="goods-bottom-info">
              <view class="goods-meta">
                <view class="goods-user">
                  <image
                    class="user-avatar"
                    :src="
                      (item.seller && item.seller.avatarUrl) ||
                      '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <text class="user-name">{{
                    (item.seller && item.seller.nickname) || "匿名用户"
                  }}</text>
                </view>
                <text class="time-text">{{
                  formatTime(item.createdAt || item.publishTime)
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
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
      sellerId: "",
      isFollowed: false,
      currentFilter: "selling", // selling, sold
      allGoods: [], // 存储所有商品数据
      isCurrentUserSeller: false, // 判断是否是当前用户自己的页面
      sellerInfo: {
        id: 1,
        name: "数码达人",
        avatar: "/static/images/default-avatar.png",
        description: "专业数码产品销售，信誉保证",
        rating: 5,
        goodsCount: 12,
        soldCount: 89,
        followCount: 156,
      },
      goodsList: [],
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
  onLoad(options) {
    console.log("[Seller] 页面加载，参数:", options);
    if (options.id) {
      this.sellerId = options.id;

      // 检查是否是当前用户自己的页面
      this.checkIfCurrentUser();

      this.loadSellerInfo();
      this.loadSellerGoods();
      // 延迟检查关注状态，确保数据加载完成
      setTimeout(() => {
        this.checkFollowStatus();
      }, 100);
    } else {
      console.error("[Seller] 缺少卖家ID参数");
    }
    // 监听关注状态变化
    uni.$on("followStatusChanged", this.handleFollowStatusChanged);
  },
  onShow() {
    // 每次显示页面时检查关注状态
    console.log("[Seller] onShow 被调用，检查关注状态");
    // 延迟检查，确保页面完全显示
    setTimeout(() => {
      this.checkFollowStatus();
    }, 50);
  },
  onUnload() {
    // 移除事件监听
    uni.$off("followStatusChanged", this.handleFollowStatusChanged);
  },
  methods: {
    // 检查是否是当前用户自己的页面
    checkIfCurrentUser() {
      try {
        const userInfo = uni.getStorageSync("userInfo_xh");
        if (userInfo) {
          const currentUser =
            typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
          this.isCurrentUserSeller =
            String(this.sellerId) === String(currentUser.id);
          console.log("关注按钮调试:", {
            sellerId: this.sellerId,
            currentUserId: currentUser.id,
            isCurrentUserSeller: this.isCurrentUserSeller,
          });
        } else {
          this.isCurrentUserSeller = false;
        }
      } catch (error) {
        this.isCurrentUserSeller = false;
      }
    },

    async loadSellerInfo() {
      try {
        console.log("[Seller] 开始加载卖家信息，sellerId:", this.sellerId);

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        // 使用新的用户详情API
        const result = await request({
          url: `/market/users/${this.sellerId}?communityId=${currentCommunity.id}`,
          method: "GET",
        });

        console.log("[Seller] 用户详情API响应:", result);

        if (result.success) {
          const userData = result.data;
          console.log("[Seller] API返回的用户数据:", {
            id: userData.id,
            nickname: userData.nickname,
            avatarUrl: userData.avatarUrl,
            avatar: userData.avatar,
            school: userData.school,
            goodsCount: userData.goodsCount,
            soldCount: userData.soldCount,
          });
          console.log("[Seller] 完整的API响应数据:", userData);
          // 尝试获取真实头像，检查多个可能的字段
          const realAvatar =
            userData.avatarUrl ||
            userData.avatar ||
            userData.headImg ||
            userData.profileImage ||
            userData.image ||
            "/static/images/default-avatar.png";
          console.log("[Seller] 检测到的头像字段:", {
            avatarUrl: userData.avatarUrl,
            avatar: userData.avatar,
            headImg: userData.headImg,
            profileImage: userData.profileImage,
            image: userData.image,
            finalAvatar: realAvatar,
          });

          this.sellerInfo = {
            id: userData.id,
            name: userData.nickname || "未知用户",
            nickname: userData.nickname || "未知用户",
            avatar: realAvatar,
            avatarUrl: realAvatar,
            school: userData.school || "这个人很懒，什么都没写",
            description: userData.school || "这个人很懒，什么都没写",
            rating: 5.0,
            goodsCount: userData.goodsCount || 0,
            soldCount: userData.soldCount || 0,
          };

          // 设置关注状态
          this.isFollowed = userData.isFollowing || false;

          console.log("[Seller] 卖家信息加载完成:", {
            id: this.sellerInfo.id,
            nickname: this.sellerInfo.nickname,
            goodsCount: this.sellerInfo.goodsCount,
            soldCount: this.sellerInfo.soldCount,
            isFollowed: this.isFollowed,
          });
        } else {
          console.error("[Seller] 获取用户详情失败:", result.message);
          uni.showToast({
            title: result.message || "加载失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("[Seller] 加载卖家信息失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    async loadSellerGoods() {
      try {
        console.log("[Seller] 开始加载卖家商品，sellerId:", this.sellerId);

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        // 从API获取卖家的商品数据
        const result = await request({
          url: `/market/products?sellerId=${this.sellerId}&page=1&limit=100&status=all&communityId=${currentCommunity.id}`,
          method: "GET",
        });

        console.log("[Seller] 商品API响应:", result);

        if (result.success) {
          this.allGoods = result.data.list || [];
          console.log(
            "[Seller] 加载的商品数据:",
            this.allGoods.map((item) => ({
              id: item.id,
              title: item.title,
              sellerId: item.sellerId,
              seller: item.seller ? item.seller.nickname : "unknown",
            }))
          );

          // 检查第一个商品的图片信息
          if (this.allGoods.length > 0) {
            console.log("第一个商品的图片信息:", this.allGoods[0].images);
          }

          // 统计在售和已售数量
          const availableGoods = this.allGoods.filter(
            (item) => item.status === "active"
          );
          const soldGoods = this.allGoods.filter(
            (item) => item.status === "completed" || item.status === "sold"
          );

          // 更新卖家统计信息
          this.sellerInfo.goodsCount = availableGoods.length;
          this.sellerInfo.soldCount = soldGoods.length;

          // 根据当前过滤条件显示商品
          this.goodsList = this.filterGoods(this.allGoods);
        }
      } catch (error) {
        console.error("加载卖家商品失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    filterGoods(goods) {
      if (this.currentFilter === "selling") {
        return goods.filter((item) => item.status === "active");
      } else if (this.currentFilter === "sold") {
        return goods.filter(
          (item) => item.status === "completed" || item.status === "sold"
        );
      }
      return goods;
    },
    changeFilter(filter) {
      this.currentFilter = filter;
      // 重新过滤已加载的商品数据
      if (this.allGoods && this.allGoods.length > 0) {
        this.goodsList = this.filterGoods(this.allGoods);
      } else {
        this.loadSellerGoods();
      }
    },
    toggleFollow() {
      // 如果是自己的页面，不允许关注
      if (this.isCurrentUserSeller) {
        uni.showToast({
          title: "不能关注自己",
          icon: "none",
        });
        return;
      }

      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      // 获取当前关注列表
      let following = uni.getStorageSync("market_following") || [];
      let followingData = uni.getStorageSync("market_following_data") || [];

      if (this.isFollowed) {
        // 取消关注 - 从列表中移除
        following = following.filter(
          (id) => String(id) !== String(this.sellerId)
        );
        followingData = followingData.filter(
          (data) => String(data.sellerId) !== String(this.sellerId)
        );

        this.isFollowed = false;
        uni.showToast({
          title: "已取消关注",
          icon: "success",
        });
      } else {
        // 添加关注 - 添加到列表
        if (!following.includes(String(this.sellerId))) {
          following.push(String(this.sellerId));
          // 保存完整的卖家信息
          const followItem = {
            id: Date.now() + Math.random(),
            sellerId: this.sellerId,
            seller: {
              id: this.sellerId,
              nickname: this.sellerInfo.nickname || "匿名用户",
              avatarUrl:
                this.sellerInfo.avatar ||
                this.sellerInfo.avatarUrl ||
                "/static/images/default-avatar.png",
              school: this.sellerInfo.school || "",
              goodsCount: this.sellerInfo.goodsCount || 0,
              soldCount: this.sellerInfo.soldCount || 0,
            },
            createdAt: new Date().toISOString(),
          };

          console.log("[Seller] 关注时保存的卖家信息:", {
            sellerId: this.sellerId,
            nickname: this.sellerInfo.nickname,
            avatar: this.sellerInfo.avatar,
            avatarUrl: this.sellerInfo.avatarUrl,
            school: this.sellerInfo.school,
            goodsCount: this.sellerInfo.goodsCount,
            soldCount: this.sellerInfo.soldCount,
          });

          // 强制使用当前检测到的真实头像
          followItem.seller.avatarUrl = this.sellerInfo.avatar;
          console.log("[Seller] 强制更新头像为:", this.sellerInfo.avatar);
          followingData.push(followItem);
        }

        this.isFollowed = true;
        uni.showToast({
          title: "关注成功",
          icon: "success",
        });
      }

      // 保存到本地存储
      uni.setStorageSync("market_following", following);
      uni.setStorageSync("market_following_data", followingData);

      // 更新已关注用户的头像信息
      this.updateFollowedUserAvatar();

      // 同步到其他页面
      uni.$emit("followStatusChanged", {
        sellerId: this.sellerId,
        isFollowing: this.isFollowed,
      });

      // 强制刷新关注状态
      setTimeout(() => {
        this.checkFollowStatus();
      }, 100);
    },

    // 更新已关注用户的头像信息
    updateFollowedUserAvatar() {
      try {
        let followingData = uni.getStorageSync("market_following_data") || [];
        const sellerId = String(this.sellerId);

        // 查找并更新该用户的头像信息
        const updatedData = followingData.map((item) => {
          if (String(item.sellerId) === sellerId) {
            console.log("[Seller] 更新已关注用户头像:", {
              oldAvatar: item.seller.avatarUrl,
              newAvatar: this.sellerInfo.avatar,
            });
            return {
              ...item,
              seller: {
                ...item.seller,
                avatarUrl: this.sellerInfo.avatar,
                nickname: this.sellerInfo.nickname,
                school: this.sellerInfo.school,
                goodsCount: this.sellerInfo.goodsCount,
                soldCount: this.sellerInfo.soldCount,
              },
            };
          }
          return item;
        });

        // 保存更新后的数据
        uni.setStorageSync("market_following_data", updatedData);
        console.log("[Seller] 已关注用户头像信息已更新");
      } catch (error) {
        console.error("[Seller] 更新已关注用户头像失败:", error);
      }
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/subpages/market/detail?id=${id}`,
      });
    },
    // 处理关注状态变化
    handleFollowStatusChanged(data) {
      if (data.sellerId === this.sellerId) {
        this.isFollowed = data.isFollowing;
      }
    },
    // 检查关注状态
    checkFollowStatus() {
      // 如果是自己的页面，跳过关注状态检查
      if (this.isCurrentUserSeller) {
        console.log("[Seller] 是自己的页面，跳过关注状态检查");
        return;
      }

      // 从本地存储检查关注状态
      const following = uni.getStorageSync("market_following") || [];
      const isFollowed = following.includes(String(this.sellerId));
      console.log("[Seller] 检查关注状态:", {
        sellerId: this.sellerId,
        sellerIdType: typeof this.sellerId,
        following: following,
        isFollowed: isFollowed,
        previousIsFollowed: this.isFollowed,
      });

      this.isFollowed = isFollowed;
      console.log("[Seller] 关注状态更新为:", this.isFollowed);
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
    getImageUrl(url) {
      console.log("原始图片URL:", url);
      if (!url) {
        console.log("图片URL为空，返回默认图片");
        return null;
      }
      // 直接返回原始URL，不进行编码
      console.log("直接使用原始URL:", url);
      return url;
    },
    getImageSrc(item) {
      console.log("商品图片信息:", item.images);
      console.log("商品完整信息:", item);
      const imageUrl = this.getImageUrl(item.images[0]);
      console.log("处理后的图片URL:", imageUrl);
      const finalSrc = imageUrl || "/static/images/default-goods.png";
      console.log("最终图片源:", finalSrc);
      return finalSrc;
    },
    onImageLoad() {
      // 图片加载完成后的处理（可用于优化瀑布流布局）
    },
    onImageError(e) {
      console.error("图片加载失败:", e);
    },
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
@import "@/uni.scss";

.seller-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

.card {
  background-color: $uni-bg-color;
  margin: 16rpx;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.seller-header {
  margin-top: 0;
}

.seller-avatar-section {
  display: flex;
  align-items: flex-start;
  gap: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-col-lg;
}

.seller-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
}

.seller-basic-info {
  flex: 1;
}

.seller-name {
  font-size: $uni-font-size-xl;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.seller-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 24rpx;
  color: #ddd;

  &.active {
    color: #ffc107;
  }
}

.rating-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
}

.seller-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  line-height: 1.4;
}

.seller-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: $uni-spacing-col-lg;
  padding: $uni-spacing-col-base 0;
  border-top: 1px solid $uni-border-color;
  border-bottom: 1px solid $uni-border-color;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-number {
  font-size: $uni-font-size-xl;
  color: $uni-text-color;
  font-weight: 500;
}

.stat-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.action-buttons {
  display: flex;
  gap: $uni-spacing-col-base;
}

.btn-follow {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: $uni-font-size-base;
  font-weight: 500;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;

  &.followed {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

.goods-section {
  margin: 16rpx;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-col-base;
}

.section-title {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  font-weight: 500;
}

.filter-tabs {
  display: flex;
  gap: $uni-spacing-col-base;
}

.filter-tab {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;

  &.active {
    color: $uni-color-primary;
    background-color: rgba(65, 105, 225, 0.1);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
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
