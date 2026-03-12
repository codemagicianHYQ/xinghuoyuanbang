<template>
  <view class="agreement-container page-container">
    <view class="content-card card rounded-lg shadow-base">
      <text class="title">用户服务协议</text>
      <scroll-view scroll-y class="agreement-scroll-view">
        <text class="agreement-text">
          【用户服务协议示例】欢迎您注册并使用星火园帮平台服务。 一、服务内容 1.
          星火园帮平台为用户提供校园生活便利服务，包括但不限于信息发布、任务匹配、数据管理等。
          2. 用户应遵守平台规则，合法合规使用平台服务。 二、用户权利与义务 1.
          用户有权自主选择平台服务，并对自己的账户和行为负责。 2.
          用户不得利用平台从事违法违规活动，不得扰乱平台秩序。 3.
          用户应妥善保管账户信息，因自身原因造成的损失由用户自行承担。
          三、平台权利与义务 1.
          平台有权根据运营需要对服务内容进行调整，并提前公告。 2.
          平台有权对违反协议或规则的用户采取限制、暂停或终止服务等措施。 3.
          平台承诺依法保护用户个人信息安全。 四、免责声明 1.
          因不可抗力或第三方原因导致服务中断或数据丢失，平台不承担责任。 2.
          用户因自身原因造成的损失，平台不承担责任。 五、协议变更 1.
          平台有权根据实际情况修改本协议内容，并通过平台公告等方式通知用户。 2.
          用户继续使用平台服务即视为同意变更后的协议。 六、其他 1.
          本协议的解释权和修改权归星火园帮平台所有。 2. 如有疑问请联系客服。
        </text>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "UserAgreement",
  data() {
    return {};
  },
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
    height: calc(
      100vh - #{$uni-spacing-col-base * 2} - #{$uni-spacing-col-lg * 2} - #{$uni-font-size-title} -
        #{$uni-spacing-row-lg} - 88rpx
    );
  }

  .agreement-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}
</style>
