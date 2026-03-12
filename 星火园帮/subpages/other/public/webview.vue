<template>
  <view class="webview-container">
    <web-view v-if="webviewUrl" :src="webviewUrl"></web-view>
    <view v-else class="loading-tip">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
// 建议将这些URL也放入 config.js 中统一管理
// import { USER_AGREEMENT_URL, PRIVACY_POLICY_URL } from '@/common/config.js';

export default {
  data() {
    return {
      webviewUrl: "",
      pageTitle: "详情",
    };
  },
  onLoad(options) {
    console.log("webview options:", options);
    let urlToLoad = "";
    let title = "文档详情";

    if (options.url) {
      // 优先使用直接传递的URL
      urlToLoad = decodeURIComponent(options.url);
      if (options.title) {
        title = decodeURIComponent(options.title);
      }
    } else if (options.type) {
      // 根据类型加载预设的URL
      switch (options.type) {
        case "userAgreement":
          // urlToLoad = USER_AGREEMENT_URL; // 从config.js导入
          urlToLoad = "YOUR_USER_AGREEMENT_URL_HERE"; // 【重要】替换为你的用户协议实际URL
          title = "用户服务协议";
          break;
        case "privacyPolicy":
          // urlToLoad = PRIVACY_POLICY_URL; // 从config.js导入
          urlToLoad = "YOUR_PRIVACY_POLICY_URL_HERE"; // 【重要】替换为你的隐私政策实际URL
          title = "隐私政策";
          break;
        default:
          console.error("Unknown webview type:", options.type);
          uni.showToast({ title: "文档类型错误", icon: "none" });
          // 可以选择返回上一页或显示错误信息
          // uni.navigateBack();
          this.webviewUrl = ""; // 确保不加载任何内容
          return;
      }
    } else {
      uni.showToast({ title: "缺少必要的页面参数", icon: "none" });
      // uni.navigateBack();
      this.webviewUrl = "";
      return;
    }

    if (
      !urlToLoad ||
      urlToLoad.includes("YOUR_") ||
      urlToLoad.includes("_URL_HERE")
    ) {
      console.error("WebView URL未配置或配置不正确:", urlToLoad);
      uni.showModal({
        title: "提示",
        content: "相关文档链接未配置，请联系客服。",
        showCancel: false,
        confirmText: "知道了",
        complete: () => {
          // uni.navigateBack(); // 加载失败，可以返回上一页
        },
      });
      this.webviewUrl = ""; // 清空URL，避免web-view加载错误地址
      return;
    }

    this.webviewUrl = urlToLoad;
    this.pageTitle = title;

    uni.setNavigationBarTitle({
      title: this.pageTitle,
    });
  },
  // 如果需要在 web-view 加载 H5 页面后，H5 页面向小程序发送消息，可以在这里监听
  onWebviewMessage(event) {
    console.log("Received message from web-view:", event.detail.data);

    // 处理提现成功消息
    if (event.detail.data && event.detail.data.type === "withdraw_success") {
      uni.showToast({
        title: "提现成功！",
        icon: "success",
      });
      // 返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },

  // 页面显示时检查是否需要自动返回
  onShow() {
    console.log("webview页面显示");
    // 如果是从提现页面来的，设置一个定时器作为备用方案
    if (this.pageTitle.includes("提现") || this.pageTitle.includes("处理")) {
      console.log("检测到提现相关页面，设置备用返回机制");
      setTimeout(() => {
        console.log("备用方案：自动返回");
        uni.navigateBack();
      }, 5000); // 5秒后备用返回
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.webview-container {
  width: 100%;
  height: 100vh; // 确保容器占满整个视口高度
}

web-view {
  width: 100%;
  height: 100%;
}

.loading-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: $uni-font-size-base;
  color: $uni-text-color-light;
}
</style>
