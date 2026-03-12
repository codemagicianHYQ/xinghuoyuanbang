<template>
  <view class="market-detail-container">
    <!-- 商品图片轮播 -->
    <swiper
      class="goods-swiper"
      circular
      :indicator-dots="true"
      :autoplay="true"
    >
      <swiper-item v-for="(image, index) in goodsDetail.images" :key="index">
        <image :src="image" mode="aspectFill" class="goods-image" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="goods-info card">
      <view class="price-row">
        <text class="price">¥{{ goodsDetail.price }}</text>
        <text class="original-price" v-if="goodsDetail.originalPrice"
          >¥{{ goodsDetail.originalPrice }}</text
        >
      </view>
      <text class="title">{{ goodsDetail.title }}</text>
      <view class="meta-info">
        <text class="condition">成色：{{ goodsDetail.condition }}</text>
        <text class="publish-time"
          >发布时间：{{ goodsDetail.publishTime }}</text
        >
      </view>
    </view>

    <!-- 商品描述 -->
    <view class="goods-desc card">
      <text class="section-title">商品描述</text>
      <text class="desc-content">{{ goodsDetail.description }}</text>
    </view>

    <!-- 卖家信息 -->
    <view class="seller-info card">
      <text class="section-title">卖家信息</text>
      <view class="seller-profile">
        <image
          :src="goodsDetail.sellerAvatar"
          class="seller-avatar"
          mode="aspectFill"
        />
        <view class="seller-detail">
          <text class="seller-name">{{ goodsDetail.sellerName }}</text>
          <text class="seller-rating"
            >信用等级：{{ goodsDetail.sellerRating }}</text
          >
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <button class="contact-btn" @click="contactSeller">联系卖家</button>
        <button class="buy-btn" @click="buyGoods">立即购买</button>
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
      goodsId: null,
      goodsDetail: {
        id: 1,
        title: "示例商品",
        price: 99.0,
        originalPrice: 199.0,
        condition: "9成新",
        description: "这是一个示例商品描述，包含商品的具体信息和使用情况。",
        images: ["/static/images/goods1.jpg", "/static/images/goods2.jpg"],
        publishTime: "2024-03-20",
        sellerName: "张同学",
        sellerAvatar: "/static/images/avatar1.jpg",
        sellerRating: "优秀",
        contactInfo: "微信号：example123",
      },
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
  },
  onLoad(options) {
    if (options.id) {
      this.goodsId = options.id;
      this.loadGoodsDetail();
    }
  },
  methods: {
    async loadGoodsDetail() {
      try {
        // 实际项目中应该调用API获取商品详情
        // const response = await request({
        //   url: `/market/goods/${this.goodsId}`,
        //   method: "GET"
        // });
        // this.goodsDetail = response.data;

        // 这里使用模拟数据
        console.log("加载商品详情，ID:", this.goodsId);
      } catch (error) {
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    contactSeller() {
      if (!this.hasLogin) {
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

      // 复制联系方式
      uni.setClipboardData({
        data: this.goodsDetail.contactInfo,
        success: () => {
          uni.showToast({
            title: "联系方式已复制",
            icon: "success",
          });
        },
      });
    },
    buyGoods() {
      if (!this.hasLogin) {
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

      uni.showModal({
        title: "确认购买",
        content: "确定要购买该商品吗？",
        success: (res) => {
          if (res.confirm) {
            // 实际项目中应该调用购买API
            uni.showToast({
              title: "购买成功",
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

.market-detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.goods-swiper {
  width: 100%;
  height: 750rpx;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  margin: $uni-spacing-col-base;
  padding: $uni-spacing-col-lg;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.goods-info {
  .price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;
  }

  .price {
    font-size: 48rpx;
    color: $uni-color-error;
    font-weight: bold;
    margin-right: 16rpx;
  }

  .original-price {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    text-decoration: line-through;
  }

  .title {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }

  .meta-info {
    display: flex;
    justify-content: space-between;
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.goods-desc {
  .section-title {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .desc-content {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    line-height: 1.6;
  }
}

.seller-info {
  .section-title {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  .seller-profile {
    display: flex;
    align-items: center;
  }

  .seller-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }

  .seller-detail {
    flex: 1;
  }

  .seller-name {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    margin-bottom: 8rpx;
  }

  .seller-rating {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .action-buttons {
    display: flex;
    gap: $uni-spacing-col-base;
  }

  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: $uni-font-size-base;
    border: none;

    &.contact-btn {
      background-color: $uni-bg-color-grey;
      color: $uni-text-color;
    }

    &.buy-btn {
      background-color: $uni-color-primary;
      color: #ffffff;
    }
  }
}
</style>
