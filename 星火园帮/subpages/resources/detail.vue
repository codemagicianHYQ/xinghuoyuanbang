<template>
  <view class="resource-detail-container">
    <view class="empty-state">
      <text class="empty-icon">⚠️</text>
      <text class="empty-text">此页面已废弃，请使用具体的资源详情页</text>
      <text class="empty-tip">考试资料详情：/subpages/resources/exam/detail</text>
      <text class="empty-tip">图书资源详情：/subpages/resources/book/detail</text>
    </view>
  </view>
</template>

<script>
export default {
  onLoad(options) {
    // 尝试根据类型重定向到正确的详情页
    if (options.type === 'exam') {
      uni.redirectTo({
        url: `/subpages/resources/exam/detail?id=${options.id}`,
      });
    } else {
      // 默认跳转到考试资料详情页，或显示错误信息
      uni.showToast({
        title: '请使用正确的详情页',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.resource-detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  margin-bottom: 20rpx;
}

.empty-tip {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  margin-top: 10rpx;
}
</style>
