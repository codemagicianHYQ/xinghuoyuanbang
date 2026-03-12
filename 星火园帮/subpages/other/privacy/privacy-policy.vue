<template>
  <view class="agreement-container page-container">
    <view class="content-card card rounded-lg shadow-base">
      <text class="title">隐私政策</text>
      <scroll-view scroll-y class="agreement-scroll-view">
        <text class="agreement-text">
          【隐私政策示例】 星火园帮平台非常重视您的个人信息和隐私保护。
          一、信息收集 1.
          平台会在您注册、使用服务过程中收集必要的个人信息，如昵称、联系方式等。
          2. 平台承诺仅为提供服务、优化体验、保障安全等目的收集和使用您的信息。
          二、信息使用 1. 平台不会将您的个人信息用于未授权的用途。 2.
          平台不会向无关第三方披露您的个人信息，法律法规或监管部门要求除外。
          三、信息安全 1. 平台采取多种安全措施保护您的信息安全。 2.
          如因不可抗力或第三方原因导致信息泄露，平台将协助您妥善应对，但不承担由此产生的责任。
          四、用户权利 1. 您有权随时查询、更正、删除您的个人信息。 2.
          您可通过“我的”-“我的信息”页面管理您的个人资料。 五、政策变更 1.
          平台有权根据法律法规及运营需要适时调整本政策，并通过平台公告等方式通知用户。
          2. 用户继续使用平台服务即视为同意变更后的政策。 六、联系我们
          如有疑问、意见或建议，请联系客服。
        </text>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "PrivacyPolicy",
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}

.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  margin-bottom: $uni-spacing-row-lg;
  padding: $uni-spacing-col-lg;
}

.content-card {
  .title {
    display: block;
    font-size: $uni-font-size-title;
    font-weight: bold;
    text-align: center;
    margin-bottom: $uni-spacing-row-lg;
    color: $uni-text-color;
  }

  .agreement-scroll-view {
    // 优化高度表达式，防止 Sass 报错
    height: calc(100vh - 200rpx);
  }

  .agreement-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}
</style>
