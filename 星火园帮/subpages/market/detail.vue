<template>
  <view class="market-detail-container">
    <!-- 商品图片轮播 -->
    <view class="image-section">
      <swiper
        class="goods-swiper"
        circular
        :indicator-dots="true"
        :autoplay="false"
        :current="currentImageIndex"
        @change="onImageChange"
      >
        <swiper-item v-for="(image, index) in goodsDetail.images" :key="index">
          <image
            :src="image"
            mode="aspectFill"
            class="goods-image"
            @click="previewImages"
          />
        </swiper-item>
      </swiper>
      <view class="image-indicator">
        {{ currentImageIndex + 1 }}/{{ goodsDetail.images.length }}
      </view>
      <view class="action-buttons">
        <view class="action-btn share-btn" @click="shareGoods">
          <text class="action-icon">📤</text>
        </view>
        <view
          class="action-btn like-btn"
          :class="{ liked: goodsDetail.isLiked }"
          @click="toggleLike"
        >
          <text class="action-icon">{{
            goodsDetail.isLiked ? "❤️" : "🤍"
          }}</text>
        </view>
      </view>
    </view>

    <!-- 商品基本信息 -->
    <view class="goods-info card">
      <view class="price-section">
        <view class="price-row">
          <text class="current-price">¥{{ goodsDetail.price }}</text>
          <text class="original-price" v-if="goodsDetail.originalPrice">
            ¥{{ goodsDetail.originalPrice }}
          </text>
        </view>
        <view class="price-tags">
          <text class="price-tag negotiable" v-if="goodsDetail.isNegotiable"
            >可小刀</text
          >
          <text class="price-tag new" v-if="goodsDetail.isNew">全新</text>
        </view>
      </view>

      <text class="goods-title">{{ goodsDetail.title }}</text>

      <view class="goods-meta">
        <view class="meta-item">
          <text class="meta-label">成色：</text>
          <text class="meta-value">{{
            getConditionText(goodsDetail.condition)
          }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">分类：</text>
          <text class="meta-value">{{ goodsDetail.categoryName }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">浏览：</text>
          <text class="meta-value">{{ goodsDetail.viewCount }}次</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">发布：</text>
          <text class="meta-value">{{
            formatTime(goodsDetail.publishTime)
          }}</text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="goods-detail card">
      <view class="section-header">
        <text class="section-title">商品详情</text>
      </view>
      <text class="detail-content">{{ goodsDetail.description }}</text>

      <!-- 商品参数 -->
      <view
        class="goods-params"
        v-if="goodsDetail.params && goodsDetail.params.length > 0"
      >
        <text class="params-title">商品参数</text>
        <view class="params-list">
          <view
            class="param-item"
            v-for="param in goodsDetail.params"
            :key="param.name"
          >
            <text class="param-name">{{ param.name }}：</text>
            <text class="param-value">{{ param.value }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 交易信息 -->
    <view class="trade-info card">
      <view class="section-header">
        <text class="section-title">交易信息</text>
      </view>
      <view class="trade-item">
        <text class="trade-label">交易方式：</text>
        <text class="trade-value">{{ goodsDetail.tradeType || "面交" }}</text>
      </view>
      <view class="trade-item">
        <text class="trade-label">交易地点：</text>
        <text class="trade-value">{{ goodsDetail.location || "校内" }}</text>
      </view>
      <view class="trade-item" v-if="goodsDetail.deliveryFee">
        <text class="trade-label">邮费：</text>
        <text class="trade-value">¥{{ goodsDetail.deliveryFee }}</text>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section card">
      <view class="section-header">
        <text class="section-title">联系方式</text>
      </view>
      <view class="contact-item" v-if="isPurchased">
        <text class="contact-label">微信号：</text>
        <text class="contact-value">{{
          goodsDetail.wechatId || "未提供"
        }}</text>
      </view>
      <view class="contact-item" v-else>
        <text class="contact-label">联系方式：</text>
        <text class="contact-value">购买后联系卖家</text>
      </view>
      <view class="contact-item" v-if="goodsDetail.contactNote">
        <text class="contact-label">备注：</text>
        <text class="contact-value">{{ goodsDetail.contactNote }}</text>
      </view>
    </view>

    <!-- 卖家信息 -->
    <view class="seller-section card">
      <view class="section-header">
        <text class="section-title">卖家信息</text>
        <view class="seller-rating">
          <text class="rating-text">信用</text>
          <view class="rating-stars">
            <text
              class="star"
              :class="{ active: index < goodsDetail.sellerRating }"
              v-for="index in 5"
              :key="index"
              >⭐</text
            >
          </view>
        </view>
      </view>

      <view class="seller-profile" @click="viewSellerProfile">
        <image
          :src="goodsDetail.sellerAvatar || '/static/images/default-avatar.png'"
          class="seller-avatar"
          mode="aspectFill"
        />
        <view class="seller-info">
          <text class="seller-name">{{ goodsDetail.sellerName }}</text>
          <text class="seller-desc" v-if="goodsDetail.sellerDesc">{{
            goodsDetail.sellerDesc
          }}</text>
          <view class="seller-stats">
            <text class="stat-item"
              >在售 {{ goodsDetail.sellerGoodsCount || 0 }}</text
            >
            <text class="stat-item"
              >已售 {{ goodsDetail.sellerSoldCount || 0 }}</text
            >
          </view>
        </view>
        <view class="seller-actions">
          <button
            v-if="!isMyGoods && !goodsDetail.isFollowing"
            class="follow-btn"
            @click="followSeller"
          >
            关注
          </button>
          <button
            v-if="!isMyGoods && goodsDetail.isFollowing"
            class="unfollow-btn"
            @click="unfollowSeller"
          >
            已关注
          </button>
          <text class="arrow-icon">></text>
        </view>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section" v-if="recommendGoods.length > 0">
      <view class="section-header">
        <text class="section-title">猜你喜欢</text>
      </view>
      <scroll-view class="recommend-scroll" scroll-x>
        <view class="recommend-list">
          <view
            class="recommend-item"
            v-for="item in recommendGoods"
            :key="item.id"
            @click="goToDetail(item.id)"
          >
            <image
              class="recommend-image"
              :src="item.images[0]"
              mode="aspectFill"
            />
            <text class="recommend-title">{{ item.title }}</text>
            <text class="recommend-price">¥{{ item.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-group">
        <view class="action-item" @click="toggleLike">
          <text class="action-icon">{{
            goodsDetail.isLiked ? "❤️" : "🤍"
          }}</text>
          <text class="action-text">{{
            goodsDetail.isLiked ? "已收藏" : "收藏"
          }}</text>
        </view>
      </view>
      <view class="purchase-buttons">
        <!-- 自己的商品且未售出时显示下架按钮 -->
        <button
          class="btn-danger"
          @click="offlineGoods"
          v-if="isMyGoods && !isSold"
        >
          下架
        </button>
        <!-- 自己的商品且已售出时显示已售出状态 -->
        <button class="btn-disabled" v-if="isMyGoods && isSold" disabled>
          已售出
        </button>
        <!-- 已购买的商品显示联系卖家、取消订单和确认收到按钮 -->
        <template v-else-if="isPurchased">
          <button class="btn-secondary" @click="contactSeller">联系卖家</button>
          <button
            class="btn-warning"
            @click="cancelOrder"
            v-if="goodsDetail.status === 'pending'"
          >
            取消订单
          </button>
          <button
            class="btn-primary"
            @click="confirmReceived"
            v-if="goodsDetail.status === 'pending'"
          >
            确认收到
          </button>
        </template>
        <!-- 别人的商品显示小刀和购买按钮 -->
        <template v-else-if="!isMyGoods && !isPurchased">
          <button
            class="btn-secondary"
            @click="makeOffer"
            v-if="goodsDetail.isNegotiable"
          >
            小刀
          </button>
          <button class="btn-primary" @click="buyNow">购买</button>
        </template>
      </view>
    </view>

    <!-- 议价弹窗 -->
    <view
      class="offer-modal"
      v-if="showOfferModal"
      @click="showOfferModal = false"
    >
      <view class="offer-content" @click.stop>
        <view class="offer-header">
          <text class="offer-title">出价</text>
          <text class="offer-close" @click="showOfferModal = false">✕</text>
        </view>
        <view class="offer-current">
          <text class="current-label">当前价格：</text>
          <text class="current-price">¥{{ goodsDetail.price }}</text>
        </view>
        <view class="offer-input-section">
          <text class="input-label">你的出价：</text>
          <input
            class="offer-input"
            v-model="offerPrice"
            type="number"
            placeholder="请输入出价"
          />
        </view>
        <view class="offer-message-section">
          <text class="input-label">留言：</text>
          <textarea
            class="offer-message"
            v-model="offerMessage"
            placeholder="向卖家说点什么..."
            maxlength="200"
          />
        </view>
        <view class="offer-actions">
          <button class="offer-cancel" @click="showOfferModal = false">
            取消
          </button>
          <button class="offer-confirm" @click="submitOffer">发送</button>
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
      goodsId: "",
      currentImageIndex: 0,
      showOfferModal: false,
      offerPrice: "",
      offerMessage: "",
      goodsDetail: {
        id: "",
        title: "",
        price: 0,
        originalPrice: null,
        isNegotiable: false,
        isNew: false,
        condition: "",
        categoryName: "",
        description: "",
        images: [],
        params: [],
        tradeType: "",
        location: "",
        deliveryFee: null,
        viewCount: 0,
        publishTime: "",
        sellerName: "",
        sellerAvatar: "",
        sellerDesc: "",
        sellerRating: 0,
        sellerGoodsCount: 0,
        sellerSoldCount: 0,
        isLiked: false,
        isFollowing: false,
      },
      recommendGoods: [],
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
      userInfo: (state) => state.userInfo,
    }),
    // 判断是否是自己的商品
    isMyGoods() {
      // 如果商品详情还未加载完成，返回false
      if (!this.goodsDetail.sellerId) {
        return false;
      }

      // 直接从本地存储获取用户信息
      const userInfo = uni.getStorageSync("userInfo_xh");
      const currentUser = userInfo
        ? typeof userInfo === "string"
          ? JSON.parse(userInfo)
          : userInfo
        : null;

      const isMyGoods =
        currentUser &&
        this.goodsDetail.sellerId &&
        String(this.goodsDetail.sellerId) === String(currentUser.id);

      console.log("isMyGoods判断:", {
        currentUser: currentUser,
        sellerId: this.goodsDetail.sellerId,
        userId: currentUser?.id,
        isMyGoods,
      });
      return isMyGoods;
    },
    // 判断是否已购买
    isPurchased() {
      // 如果商品详情还未加载完成，返回false
      if (!this.goodsDetail.buyerId) {
        return false;
      }

      // 直接从本地存储获取用户信息
      const userInfo = uni.getStorageSync("userInfo_xh");
      const currentUser = userInfo
        ? typeof userInfo === "string"
          ? JSON.parse(userInfo)
          : userInfo
        : null;

      const isPurchased =
        currentUser &&
        this.goodsDetail.buyerId &&
        String(this.goodsDetail.buyerId) === String(currentUser.id);

      console.log("isPurchased判断:", {
        currentUser: currentUser,
        buyerId: this.goodsDetail.buyerId,
        userId: currentUser?.id,
        isPurchased,
      });
      return isPurchased;
    },
    // 判断商品是否已售出
    isSold() {
      const isSold = Boolean(
        this.goodsDetail.status === "completed" ||
          this.goodsDetail.status === "sold" ||
          this.goodsDetail.buyerId
      );
      console.log("isSold判断:", {
        status: this.goodsDetail.status,
        buyerId: this.goodsDetail.buyerId,
        isSold: isSold,
      });
      return isSold;
    },
  },
  onLoad(options) {
    console.log("详情页onLoad，接收参数:", options);
    if (options.id) {
      this.goodsId = options.id;
      console.log("设置商品ID:", this.goodsId);
      this.loadGoodsDetail();
      this.loadRecommendGoods();
    } else {
      console.log("未接收到商品ID");
    }
  },
  onShow() {
    // 每次显示页面时检查关注状态
    if (this.goodsDetail && this.goodsDetail.sellerId) {
      console.log("[Detail] onShow 被调用，检查关注状态");
      const isFollowing = this.checkFollowStatus(this.goodsDetail.sellerId);
      this.goodsDetail.isFollowing = isFollowing;
      console.log("[Detail] 关注状态更新为:", isFollowing);
    }
  },
  methods: {
    // 检查收藏状态
    checkFavoriteStatus(productId) {
      const favorites = uni.getStorageSync("market_favorites") || [];
      return favorites.includes(productId);
    },
    // 检查关注状态
    checkFollowStatus(sellerId) {
      const following = uni.getStorageSync("market_following") || [];
      const isFollowed = following.includes(String(sellerId));
      console.log("[Detail] 检查关注状态:", {
        sellerId: sellerId,
        sellerIdType: typeof sellerId,
        following: following,
        isFollowed: isFollowed,
      });
      return isFollowed;
    },
    // 联系卖家
    contactSeller() {
      if (!this.goodsDetail.wechatId) {
        uni.showToast({
          title: "卖家未提供联系方式",
          icon: "none",
        });
        return;
      }

      uni.setClipboardData({
        data: this.goodsDetail.wechatId,
        success: () => {
          uni.showToast({
            title: "联系方式已复制",
            icon: "success",
          });
        },
        fail: () => {
          uni.showToast({
            title: "复制失败",
            icon: "none",
          });
        },
      });
    },
    // 确认收到
    async confirmReceived() {
      uni.showModal({
        title: "确认收到",
        content: "确认已收到商品？确认后钱款将打给卖家。",
        success: async (res) => {
          if (res.confirm) {
            try {
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
                url: `/market/products/${this.goodsId}/confirm`,
                method: "POST",
                data: {
                  communityId: currentCommunity.id,
                },
              });

              if (result.success) {
                uni.showToast({
                  title: "确认成功",
                  icon: "success",
                });
                // 刷新商品详情
                this.loadGoodsDetail();
                // 强制更新页面状态
                this.$forceUpdate();
              } else {
                uni.showToast({
                  title: result.message || "确认失败",
                  icon: "none",
                });
              }
            } catch (error) {
              console.error("确认收到失败:", error);
              uni.showToast({
                title: "确认失败",
                icon: "none",
              });
            }
          }
        },
      });
    },
    // 取消订单
    async cancelOrder() {
      uni.showModal({
        title: "取消订单",
        content: "确认取消订单？取消后将进行退款处理。",
        success: async (res) => {
          if (res.confirm) {
            try {
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
                url: `/market/products/${this.goodsId}/cancel`,
                method: "POST",
                data: {
                  communityId: currentCommunity.id,
                },
              });

              if (result.success) {
                uni.showToast({
                  title: "订单已取消",
                  icon: "success",
                });
                // 刷新商品详情
                this.loadGoodsDetail();
                // 强制更新页面状态
                this.$forceUpdate();
              } else {
                uni.showToast({
                  title: result.message || "取消失败",
                  icon: "none",
                });
              }
            } catch (error) {
              console.error("取消订单失败:", error);
              uni.showToast({
                title: "取消失败",
                icon: "none",
              });
            }
          }
        },
      });
    },
    async loadGoodsDetail() {
      try {
        console.log("开始加载商品详情，商品ID:", this.goodsId);

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        console.log("当前社区:", currentCommunity);

        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        const apiUrl = `/market/products/${this.goodsId}?communityId=${currentCommunity.id}`;
        console.log("请求URL:", apiUrl);

        const result = await request({
          url: apiUrl,
          method: "GET",
        });

        if (result.success) {
          const product = result.data;
          console.log("[Detail] 商品详情API响应:", {
            id: product.id,
            title: product.title,
            sellerId: product.sellerId,
            seller: product.seller,
            sellerStats: product.sellerStats,
          });

          // 调试：检查用户信息
          const userInfo = uni.getStorageSync("userInfo_xh");
          const currentUser = userInfo
            ? typeof userInfo === "string"
              ? JSON.parse(userInfo)
              : userInfo
            : null;
          console.log("[Detail] 用户信息调试:", {
            currentUser: currentUser,
            productSellerId: product.seller?.id || product.sellerId,
            isMyGoods:
              currentUser &&
              (product.seller?.id || product.sellerId) &&
              String(product.seller?.id || product.sellerId) ===
                String(currentUser.id),
          });

          this.goodsDetail = {
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            isNegotiable: product.isNegotiable,
            isNew: product.condition === "new",
            condition: product.condition,
            categoryName: this.getCategoryName(product.category),
            description: product.description,
            images: product.images || [],
            params: this.generateProductParams(product),
            tradeType: this.getTradeTypeText(product.tradeMethods),
            location: product.location || "",
            deliveryFee: product.deliveryFee,
            viewCount: product.viewCount || 0,
            publishTime: product.createdAt,
            sellerId: product.seller?.id || product.sellerId,
            sellerName: product.seller?.nickname || "匿名用户",
            sellerAvatar:
              product.seller?.avatarUrl ||
              product.seller?.avatar ||
              product.seller?.headImg ||
              product.seller?.profileImage ||
              product.seller?.image ||
              "/static/images/default-avatar.png",
            sellerDesc: product.seller?.school || "",
            sellerRating: 5, // 暂时固定，后续可以添加评分系统
            sellerGoodsCount: product.sellerStats?.goodsCount || 0,
            sellerSoldCount: product.sellerStats?.soldCount || 0,
            isLiked: this.checkFavoriteStatus(product.id), // 从本地存储检查收藏状态
            isFollowing: this.checkFollowStatus(product.sellerId), // 从本地存储检查关注状态
            buyerId: product.buyerId, // 添加买家ID
            status: product.status, // 添加商品状态
            wechatId: product.wechatId, // 添加微信号
            contactNote: product.contactNote, // 添加联系方式备注
          };

          console.log("[Detail] 处理后的商品详情:", {
            id: this.goodsDetail.id,
            title: this.goodsDetail.title,
            sellerId: this.goodsDetail.sellerId,
            sellerName: this.goodsDetail.sellerName,
          });
        } else {
          throw new Error(result.message || "获取商品详情失败");
        }
      } catch (error) {
        console.error("加载商品详情失败:", error);
        uni.showToast({
          title: error.message || "加载失败",
          icon: "none",
        });
      }
    },
    async loadRecommendGoods() {
      try {
        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          console.warn("未选择社区，跳过推荐商品加载");
          return;
        }

        // 获取推荐商品（同分类的其他商品）
        const result = await request({
          url: "/market/products",
          method: "GET",
          data: {
            page: 1,
            limit: 4,
            category: this.goodsDetail.categoryName
              ? this.getCategoryKey(this.goodsDetail.categoryName)
              : "",
            exclude: this.goodsId, // 排除当前商品
            communityId: currentCommunity.id, // 添加社区ID
          },
        });

        if (result.success) {
          this.recommendGoods = result.data.list.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            originalPrice: item.originalPrice,
            images: item.images || [],
            sellerName: item.seller?.nickname || "匿名用户",
          }));
        }
      } catch (error) {
        console.error("加载推荐商品失败:", error);
        // 失败时显示空数组
        this.recommendGoods = [];
      }
    },
    onImageChange(e) {
      this.currentImageIndex = e.detail.current;
    },
    previewImages() {
      uni.previewImage({
        urls: this.goodsDetail.images,
        current: this.currentImageIndex,
      });
    },
    shareGoods() {
      uni.share({
        provider: "weixin",
        type: 0,
        title: this.goodsDetail.title,
        summary: this.goodsDetail.description,
        imageUrl: this.goodsDetail.images[0],
        success: () => {
          uni.showToast({
            title: "分享成功",
            icon: "success",
          });
        },
      });
    },
    toggleLike() {
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

      if (this.goodsDetail.isLiked) {
        // 取消收藏 - 从列表中移除
        favorites = favorites.filter((id) => id !== this.goodsDetail.id);
        favoritesData = favoritesData.filter(
          (data) => data.productId !== this.goodsDetail.id
        );
        uni.showToast({
          title: "已取消收藏",
          icon: "none",
        });
      } else {
        // 添加收藏 - 添加到列表
        if (!favorites.includes(this.goodsDetail.id)) {
          favorites.push(this.goodsDetail.id);
          // 保存完整的商品信息
          const favoriteItem = {
            id: Date.now() + Math.random(),
            productId: this.goodsDetail.id,
            product: {
              id: this.goodsDetail.id,
              title: this.goodsDetail.title || "未知商品",
              price: this.goodsDetail.price || 0,
              originalPrice:
                this.goodsDetail.originalPrice || this.goodsDetail.price || 0,
              description: this.goodsDetail.description || "暂无描述",
              images: this.goodsDetail.images || [],
              condition: this.goodsDetail.condition || "unknown",
              category: this.goodsDetail.category || "其他",
              location: this.goodsDetail.location || "未知地点",
              seller: {
                id: this.goodsDetail.sellerId || "unknown",
                nickname: this.goodsDetail.sellerName || "匿名用户",
                avatarUrl:
                  this.goodsDetail.sellerAvatar ||
                  "/static/images/default-avatar.png",
                school: this.goodsDetail.sellerSchool || "",
              },
              status: this.goodsDetail.status || "active",
              communityId: this.goodsDetail.communityId, // 添加社区ID
              createdAt: this.goodsDetail.createdAt || new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          };

          favoritesData.push(favoriteItem);
        }
        uni.showToast({
          title: "已收藏",
          icon: "none",
        });
      }

      // 保存到本地存储
      uni.setStorageSync("market_favorites", favorites);
      uni.setStorageSync("market_favorites_data", favoritesData);

      // 更新UI状态
      this.goodsDetail.isLiked = !this.goodsDetail.isLiked;
    },
    makeOffer() {
      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      const originalPrice = parseFloat(this.goodsDetail.price);
      const productId = this.goodsDetail.id;

      // 检查本地是否已有该商品的小刀价格
      const knifePriceKey = `knife_price_${productId}`;
      let knifePrice = uni.getStorageSync(knifePriceKey);
      let discountAmount = uni.getStorageSync(`knife_discount_${productId}`);

      // 如果没有存储过，则计算新的优惠价格
      if (!knifePrice) {
        // 计算服务费
        let serviceFee = 0;
        if (originalPrice <= 10) {
          serviceFee = parseFloat((originalPrice * 0.04).toFixed(2));
        } else {
          serviceFee = parseFloat((originalPrice * 0.05).toFixed(2));
        }

        // 计算优惠金额（服务费的30%-50%随机）
        const discountRate = 0.3 + Math.random() * 0.2; // 30%-50%随机
        discountAmount = parseFloat((serviceFee * discountRate).toFixed(2));

        // 计算小刀价格（原价 - 优惠金额）
        knifePrice = parseFloat((originalPrice - discountAmount).toFixed(2));

        // 存储到本地
        uni.setStorageSync(knifePriceKey, knifePrice);
        uni.setStorageSync(`knife_discount_${productId}`, discountAmount);
      }

      // 显示小刀确认弹窗
      uni.showModal({
        title: "小刀优惠",
        content: `恭喜获得¥${discountAmount}的小刀优惠！\n\n当前价格：¥${knifePrice}\n\n确认以此价格购买吗？`,
        showCancel: true,
        cancelText: "取消",
        confirmText: "确认购买",
        success: (res) => {
          if (res.confirm) {
            this.buyWithNegotiation(knifePrice);
          }
        },
      });
    },
    submitOffer() {
      if (!this.offerPrice) {
        uni.showToast({
          title: "请输入出价",
          icon: "none",
        });
        return;
      }

      if (parseFloat(this.offerPrice) <= 0) {
        uni.showToast({
          title: "出价必须大于0",
          icon: "none",
        });
        return;
      }

      const offerPrice = parseFloat(this.offerPrice);
      const originalPrice = parseFloat(this.goodsDetail.price);

      if (offerPrice >= originalPrice) {
        uni.showToast({
          title: "小刀价格应低于原价",
          icon: "none",
        });
        return;
      }

      // 计算服务费和优惠
      let serviceFee = 0;
      if (originalPrice <= 10) {
        serviceFee = parseFloat((originalPrice * 0.04).toFixed(2));
      } else {
        serviceFee = parseFloat((originalPrice * 0.05).toFixed(2));
      }

      // 计算优惠金额（服务费的30%-50%随机）
      const discountRate = 0.3 + Math.random() * 0.2; // 30%-50%随机
      const discountAmount = parseFloat((serviceFee * discountRate).toFixed(2));

      // 计算实际支付金额
      const actualPayment = offerPrice;
      const sellerIncome = parseFloat((originalPrice - serviceFee).toFixed(2));

      // 显示小刀详情
      uni.showModal({
        title: "小刀详情",
        content: `原价：¥${originalPrice}\n小刀价：¥${offerPrice}\n服务费：¥${serviceFee}\n平台优惠：¥${discountAmount}\n\n您实际支付：¥${actualPayment}\n卖家收入：¥${sellerIncome}\n\n确认以此价格购买？`,
        showCancel: true,
        cancelText: "取消",
        confirmText: "确认购买",
        success: (res) => {
          if (res.confirm) {
            this.buyWithNegotiation(offerPrice);
          } else {
            this.showOfferModal = false;
          }
        },
      });
    },
    async buyNow() {
      if (!this.hasLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      // 计算服务费
      const originalPrice = parseFloat(this.goodsDetail.price);
      let serviceFee = 0;
      if (originalPrice <= 10) {
        serviceFee = parseFloat((originalPrice * 0.04).toFixed(2));
      } else {
        serviceFee = parseFloat((originalPrice * 0.05).toFixed(2));
      }

      const sellerIncome = parseFloat((originalPrice - serviceFee).toFixed(2));

      uni.showModal({
        title: "确认购买",
        content: "确认购买此商品？",
        success: async (res) => {
          if (res.confirm) {
            await this.processPurchase(originalPrice, false);
          }
        },
      });
    },
    async buyWithNegotiation(negotiatedPrice) {
      await this.processPurchase(negotiatedPrice, true);
    },
    async processPurchase(price, isNegotiated) {
      try {
        // 1. 调用支付接口
        const payRes = await request({
          url: "/pay/unifiedOrder",
          method: "POST",
          data: {
            amount: price,
            description: `购买商品：${this.goodsDetail.title}${
              isNegotiated ? "（小刀）" : ""
            }`,
          },
        });

        if (!payRes.paymentParams) {
          uni.showToast({
            title: payRes.message || "微信支付下单失败",
            icon: "none",
          });
          return;
        }

        // 2. 调用微信支付
        const params = payRes.paymentParams;
        await new Promise((resolve, reject) => {
          uni.requestPayment({
            timeStamp: params.timeStamp + "",
            nonceStr: params.nonceStr,
            package: params.package,
            signType: params.signType,
            paySign: params.paySign,
            success: resolve,
            fail: reject,
          });
        });

        // 3. 支付成功后更新商品状态
        const purchaseData = {
          out_trade_no: payRes.out_trade_no,
        };

        if (isNegotiated) {
          purchaseData.isNegotiated = true;
          purchaseData.negotiatedPrice = price;
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

        const result = await request({
          url: `/market/products/${this.goodsId}/purchase`,
          method: "POST",
          data: {
            ...purchaseData,
            communityId: currentCommunity.id,
          },
        });

        if (result.success) {
          const paymentDetails = result.data.paymentDetails;
          let successMessage = "购买成功！";

          if (isNegotiated) {
            successMessage += `\n小刀价：¥${paymentDetails.finalPrice}\n平台优惠：¥${paymentDetails.discountAmount}`;
          }

          successMessage += "\n请通过其他方式联系卖家";

          uni.showModal({
            title: "购买成功",
            content: successMessage,
            showCancel: false,
            confirmText: "知道了",
            success: () => {
              this.showOfferModal = false;
              // 刷新商品详情
              this.loadGoodsDetail();
              // 强制更新页面状态
              this.$forceUpdate();
            },
          });
        } else {
          uni.showToast({
            title: result.message || "购买失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("购买失败:", error);
        if (error.errMsg && error.errMsg.includes("cancel")) {
          uni.showToast({
            title: "支付已取消",
            icon: "none",
          });
        } else {
          uni.showToast({
            title: "购买失败，请重试",
            icon: "none",
          });
        }
      }
    },
    // 下架商品
    async offlineGoods() {
      uni.showModal({
        title: "确认下架",
        content: "确定要下架这个商品吗？下架后其他用户将无法看到此商品。",
        success: async (res) => {
          if (res.confirm) {
            try {
              // 获取当前社区ID
              const currentCommunity = uni.getStorageSync("selectedCommunity");
              if (!currentCommunity || !currentCommunity.id) {
                uni.showToast({
                  title: "请先选择社区",
                  icon: "none",
                });
                return;
              }

              // 调用下架商品的API
              const result = await request({
                url: `/market/products/${this.goodsId}`,
                method: "DELETE",
                data: {
                  communityId: currentCommunity.id,
                },
              });

              if (result.success) {
                // 从收藏中移除该商品
                this.removeFromFavorites();

                uni.showToast({
                  title: "商品已下架",
                  icon: "success",
                });
                // 跳转回商品列表
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } else {
                uni.showToast({
                  title: result.message || "下架失败",
                  icon: "none",
                });
              }
            } catch (error) {
              console.error("下架商品失败:", error);
              uni.showToast({
                title: "下架失败",
                icon: "none",
              });
            }
          }
        },
      });
    },
    // 从收藏中移除商品
    removeFromFavorites() {
      try {
        // 获取当前收藏列表
        let favorites = uni.getStorageSync("market_favorites") || [];
        let favoritesData = uni.getStorageSync("market_favorites_data") || [];

        // 从收藏列表中移除该商品
        favorites = favorites.filter((id) => id !== this.goodsId);
        favoritesData = favoritesData.filter(
          (data) => data.productId !== this.goodsId
        );

        // 保存更新后的收藏列表
        uni.setStorageSync("market_favorites", favorites);
        uni.setStorageSync("market_favorites_data", favoritesData);
      } catch (error) {
        console.error("从收藏中移除商品失败:", error);
      }
    },
    viewSellerProfile() {
      console.log(
        "[Detail] 点击卖家信息，sellerId:",
        this.goodsDetail.sellerId
      );
      console.log("[Detail] 商品详情:", {
        id: this.goodsDetail.id,
        title: this.goodsDetail.title,
        sellerId: this.goodsDetail.sellerId,
        sellerName: this.goodsDetail.sellerName,
      });

      if (!this.goodsDetail.sellerId) {
        uni.showToast({
          title: "卖家信息不完整",
          icon: "none",
        });
        return;
      }

      uni.navigateTo({
        url: `/subpages/market/seller?id=${this.goodsDetail.sellerId}`,
      });
    },
    goToDetail(id) {
      uni.redirectTo({
        url: `/subpages/market/detail?id=${id}`,
      });
    },
    getConditionText(condition) {
      const conditionMap = {
        new: "全新",
        excellent: "几乎全新",
        good: "轻微使用痕迹",
        used: "明显使用痕迹",
      };
      return conditionMap[condition] || "未知";
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
    getCategoryName(category) {
      const categoryMap = {
        books: "图书教材",
        electronics: "数码电子",
        clothes: "服饰鞋包",
        beauty: "美妆护肤",
        sports: "运动户外",
        home: "家居用品",
        food: "食品零食",
        stationery: "文具办公",
        others: "其他闲置",
      };
      return categoryMap[category] || "其他";
    },
    getCategoryKey(categoryName) {
      const categoryMap = {
        图书教材: "books",
        数码电子: "electronics",
        服饰鞋包: "clothes",
        美妆护肤: "beauty",
        运动户外: "sports",
        家居用品: "home",
        食品零食: "food",
        文具办公: "stationery",
        其他闲置: "others",
      };
      return categoryMap[categoryName] || "others";
    },
    generateProductParams(product) {
      // 根据商品信息生成参数列表
      const params = [];
      if (product.category) {
        params.push({
          name: "分类",
          value: this.getCategoryName(product.category),
        });
      }
      if (product.condition) {
        params.push({
          name: "状态",
          value: this.getConditionText(product.condition),
        });
      }
      if (product.tradeMethods && product.tradeMethods.length > 0) {
        params.push({
          name: "交易方式",
          value: this.getTradeTypeText(product.tradeMethods),
        });
      }
      if (product.location) {
        params.push({ name: "交易地点", value: product.location });
      }
      return params;
    },
    getTradeTypeText(tradeMethods) {
      if (!tradeMethods || tradeMethods.length === 0) return "面交";
      const methodMap = {
        meetup: "面交",
        delivery: "快递",
      };
      return tradeMethods
        .map((method) => methodMap[method] || method)
        .join("/");
    },
    // 关注卖家
    followSeller() {
      // 检查是否是自己
      if (this.isMyGoods) {
        uni.showToast({
          title: "不能关注自己",
          icon: "none",
        });
        return;
      }

      // 获取当前关注列表
      let following = uni.getStorageSync("market_following") || [];
      let followingData = uni.getStorageSync("market_following_data") || [];

      // 添加关注
      if (!following.includes(String(this.goodsDetail.sellerId))) {
        following.push(String(this.goodsDetail.sellerId));
        // 保存完整的卖家信息
        const followItem = {
          id: Date.now() + Math.random(),
          sellerId: this.goodsDetail.sellerId,
          seller: {
            id: this.goodsDetail.sellerId,
            nickname: this.goodsDetail.sellerName || "匿名用户",
            avatarUrl:
              this.goodsDetail.sellerAvatar ||
              "/static/images/default-avatar.png",
            school: this.goodsDetail.sellerDesc || "",
            goodsCount: this.goodsDetail.sellerGoodsCount || 0,
            soldCount: this.goodsDetail.sellerSoldCount || 0,
          },
          createdAt: new Date().toISOString(),
        };

        console.log("[Detail] 关注时保存的卖家信息:", {
          sellerId: this.goodsDetail.sellerId,
          nickname: this.goodsDetail.sellerName,
          avatarUrl: this.goodsDetail.sellerAvatar,
          school: this.goodsDetail.sellerDesc,
          goodsCount: this.goodsDetail.sellerGoodsCount,
          soldCount: this.goodsDetail.sellerSoldCount,
        });

        // 强制使用当前检测到的真实头像
        followItem.seller.avatarUrl = this.goodsDetail.sellerAvatar;
        console.log("[Detail] 强制更新头像为:", this.goodsDetail.sellerAvatar);
        followingData.push(followItem);
      }

      // 保存到本地存储
      uni.setStorageSync("market_following", following);
      uni.setStorageSync("market_following_data", followingData);

      // 更新已关注用户的头像信息
      this.updateFollowedUserAvatar();

      // 更新UI状态
      this.goodsDetail.isFollowing = true;
      uni.showToast({
        title: "关注成功",
        icon: "success",
      });

      // 同步到其他页面
      this.syncFollowStatus();
    },

    // 更新已关注用户的头像信息
    updateFollowedUserAvatar() {
      try {
        let followingData = uni.getStorageSync("market_following_data") || [];
        const sellerId = String(this.goodsDetail.sellerId);

        // 查找并更新该用户的头像信息
        const updatedData = followingData.map((item) => {
          if (String(item.sellerId) === sellerId) {
            console.log("[Detail] 更新已关注用户头像:", {
              oldAvatar: item.seller.avatarUrl,
              newAvatar: this.goodsDetail.sellerAvatar,
            });
            return {
              ...item,
              seller: {
                ...item.seller,
                avatarUrl: this.goodsDetail.sellerAvatar,
                nickname: this.goodsDetail.sellerName,
                school: this.goodsDetail.sellerDesc,
                goodsCount: this.goodsDetail.sellerGoodsCount,
                soldCount: this.goodsDetail.sellerSoldCount,
              },
            };
          }
          return item;
        });

        // 保存更新后的数据
        uni.setStorageSync("market_following_data", updatedData);
        console.log("[Detail] 已关注用户头像信息已更新");
      } catch (error) {
        console.error("[Detail] 更新已关注用户头像失败:", error);
      }
    },
    // 取消关注卖家
    unfollowSeller() {
      uni.showModal({
        title: "确认取消关注",
        content: "确定要取消关注这个卖家吗？",
        success: (res) => {
          if (res.confirm) {
            // 获取当前关注列表
            let following = uni.getStorageSync("market_following") || [];
            let followingData =
              uni.getStorageSync("market_following_data") || [];

            // 取消关注 - 从列表中移除
            following = following.filter(
              (id) => String(id) !== String(this.goodsDetail.sellerId)
            );
            followingData = followingData.filter(
              (data) =>
                String(data.sellerId) !== String(this.goodsDetail.sellerId)
            );

            // 保存到本地存储
            uni.setStorageSync("market_following", following);
            uni.setStorageSync("market_following_data", followingData);

            // 更新UI状态
            this.goodsDetail.isFollowing = false;
            uni.showToast({
              title: "已取消关注",
              icon: "success",
            });

            // 同步到其他页面
            this.syncFollowStatus();
          }
        },
      });
    },
    // 同步关注状态到其他页面
    syncFollowStatus() {
      // 使用事件总线同步关注状态
      uni.$emit("followStatusChanged", {
        sellerId: this.goodsDetail.sellerId,
        isFollowing: this.goodsDetail.isFollowing,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.market-detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.image-section {
  position: relative;
  height: 750rpx;
}

.goods-swiper {
  width: 100%;
  height: 100%;
}

.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-indicator {
  position: absolute;
  bottom: 32rpx;
  right: 32rpx;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 24rpx;
}

.action-buttons {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.liked {
    background-color: rgba(255, 71, 87, 0.1);
  }

  .action-icon {
    font-size: 32rpx;
  }
}

.card {
  background-color: $uni-bg-color;
  margin: 16rpx;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.goods-info {
  margin-top: 0;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.current-price {
  font-size: 56rpx;
  color: #ff4757;
  font-weight: bold;
}

.original-price {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  text-decoration: line-through;
}

.price-tags {
  display: flex;
  gap: 8rpx;
}

.price-tag {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;

  &.negotiable {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  &.new {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
    border: 1px solid #27ae60;
  }
}

.goods-title {
  font-size: $uni-font-size-xl;
  color: $uni-text-color;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 24rpx;
}

.goods-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.meta-value {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
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

.detail-content {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  line-height: 1.6;
  margin-bottom: $uni-spacing-col-base;
}

.goods-params {
  border-top: 1px solid $uni-border-color;
  padding-top: $uni-spacing-col-base;
}

.params-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.param-item {
  display: flex;
}

.param-name {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  min-width: 120rpx;
}

.param-value {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  flex: 1;
}

.trade-item {
  display: flex;
  margin-bottom: 12rpx;
}

.trade-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  min-width: 120rpx;
}

/* 联系方式样式 */
.contact-section {
  margin-bottom: $uni-spacing-col-lg;
}

.contact-item {
  display: flex;
  margin-bottom: 12rpx;
}

.contact-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  min-width: 120rpx;
}

.contact-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  flex: 1;
}

.trade-value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.seller-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rating-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
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

.seller-profile {
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
}

.seller-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.seller-info {
  flex: 1;
}

.seller-name {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.seller-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.seller-stats {
  display: flex;
  gap: 24rpx;
}

.seller-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.follow-btn {
  padding: 12rpx 24rpx;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  min-width: 120rpx;
}

.unfollow-btn {
  padding: 12rpx 24rpx;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  min-width: 120rpx;
}

.stat-item {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.arrow-icon {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.recommend-section {
  margin: 16rpx;
  padding: $uni-spacing-col-lg;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
}

.recommend-scroll {
  margin-top: $uni-spacing-col-base;
}

.recommend-list {
  display: flex;
  gap: $uni-spacing-col-base;
  padding-bottom: 16rpx;
}

.recommend-item {
  flex-shrink: 0;
  width: 240rpx;
}

.recommend-image {
  width: 100%;
  height: 240rpx;
  border-radius: $uni-border-radius-base;
  margin-bottom: 12rpx;
}

.recommend-title {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  line-height: 1.4;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.recommend-price {
  font-size: $uni-font-size-base;
  color: #ff4757;
  font-weight: 500;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color;
  padding: 16rpx $uni-spacing-col-base 32rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  gap: $uni-spacing-col-base;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 32rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.purchase-buttons {
  flex: 1;
  display: flex;
  gap: 16rpx;
}

.btn-secondary,
.btn-primary,
.btn-warning,
.btn-disabled {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: $uni-font-size-base;
  font-weight: 500;
}

.btn-secondary {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-warning {
  background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
  color: #ffffff;
}

.btn-danger {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: $uni-font-size-base;
  font-weight: 500;
  background-color: #ff4757;
  color: #ffffff;
}

.btn-disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

// 议价弹窗样式
.offer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.offer-content {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-col-lg;
}

.offer-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
}

.offer-close {
  font-size: 32rpx;
  color: $uni-text-color-grey;
  padding: 8rpx;
}

.offer-current {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: $uni-spacing-col-lg;
}

.current-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

.current-price {
  font-size: $uni-font-size-lg;
  color: #ff4757;
  font-weight: 500;
}

.offer-input-section,
.offer-message-section {
  margin-bottom: $uni-spacing-col-lg;
}

.input-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: 12rpx;
  display: block;
}

.offer-input {
  width: 100%;
  height: 72rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: 0 16rpx;
  font-size: $uni-font-size-base;
  box-sizing: border-box;
}

.offer-message {
  width: 100%;
  min-height: 120rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: 16rpx;
  font-size: $uni-font-size-base;
  resize: none;
  box-sizing: border-box;
}

.offer-actions {
  display: flex;
  gap: 24rpx;
}

.offer-cancel,
.offer-confirm {
  flex: 1;
  height: 72rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
}

.offer-cancel {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.offer-confirm {
  background-color: $uni-color-primary;
  color: #ffffff;
}
</style>
