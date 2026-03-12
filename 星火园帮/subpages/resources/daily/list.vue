<template>
  <view class="daily-list-container">
    <!-- 顶部Banner -->
    <view class="daily-banner">
      <swiper class="banner-swiper" circular autoplay interval="5000">
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image class="banner-image" :src="item.image" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <!-- 英语名言 -->
      <view class="quote-section">
        <text class="quote-text">{{ dailyQuote.en }}</text>
        <text class="quote-author">—— {{ dailyQuote.author }}</text>
        <text class="quote-translation">{{ dailyQuote.zh }}</text>
      </view>
    </view>

    <!-- 新闻列表 -->
    <view class="news-list">
      <view
        class="news-item"
        v-for="item in newsList"
        :key="item.id"
        @click="viewNewsDetail(item.id)"
      >
        <view class="news-content">
          <text class="news-title">{{ item.title }}</text>
          <text class="news-desc">{{ item.description }}</text>
          <view class="news-meta">
            <text class="news-time">{{ item.time }}</text>
            <text class="news-source">{{ item.source }}</text>
          </view>
        </view>
        <image
          v-if="item.image"
          class="news-image"
          :src="item.image"
          mode="aspectFill"
        />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bannerList: [
        { image: "/static/images/banner1.jpg" },
        { image: "/static/images/banner2.jpg" },
        { image: "/static/images/banner3.jpg" },
      ],
      dailyQuote: {
        en: "The best way to predict the future is to create it.",
        author: "Abraham Lincoln",
        zh: "预测未来的最好方法就是创造未来。",
      },
      newsList: [
        {
          id: 1,
          title: "学校举办2024年春季开学典礼",
          description: "校长发表重要讲话，勉励同学们在新学期继续努力...",
          time: "2024-02-26",
          source: "校新闻中心",
          image: "/static/images/news1.jpg",
        },
        {
          id: 2,
          title: "我校学子在全国大学生创新创业大赛中获佳绩",
          description: "在刚刚结束的比赛中，我校学生团队获得特等奖...",
          time: "2024-02-25",
          source: "教务处",
          image: "/static/images/news2.jpg",
        },
        {
          id: 3,
          title: "图书馆新增电子资源数据库",
          description: "为满足师生科研需求，图书馆新增多个专业数据库...",
          time: "2024-02-24",
          source: "图书馆",
          image: "/static/images/news3.jpg",
        },
      ],
    };
  },
  methods: {
    viewNewsDetail(id) {
      uni.navigateTo({
        url: `/subpages/resources/daily/detail?id=${id}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.daily-list-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

.daily-banner {
  position: relative;
  width: 100%;
  height: 400rpx;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.quote-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
}

.quote-text {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.quote-author {
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 8rpx;
  display: block;
}

.quote-translation {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
}

.news-list {
  padding: 32rpx;
}

.news-item {
  display: flex;
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.news-content {
  flex: 1;
  margin-right: 24rpx;
}

.news-title {
  font-size: 32rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 16rpx;
  display: block;
}

.news-desc {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  margin-bottom: 16rpx;
  display: block;
}

.news-meta {
  display: flex;
  gap: 24rpx;
}

.news-time,
.news-source {
  font-size: 24rpx;
  color: $uni-text-color-placeholder;
}

.news-image {
  width: 200rpx;
  height: 150rpx;
  border-radius: $uni-border-radius-base;
}
</style>
