<template>
  <view class="login-container page-container">
    <view class="logo-area">
      <image
        class="logo-image"
        src="/static/images/app-logo.png"
        mode="aspectFit"
      ></image>
      <text class="app-title">{{ appName }}</text>
    </view>

    <view class="login-prompt">
      <text>为了给您提供更好的服务，请授权登录</text>
    </view>

    <view class="button-area">
      <button
        class="login-btn button-primary"
        @click="handleWeChatLoginTap"
        :loading="loading"
      >
        <uni-icons
          type="weixin"
          size="22"
          color="#fff"
          style="margin-right: 10rpx"
        ></uni-icons>
        微信快捷登录
      </button>
    </view>

    <view class="agreement-area">
      <checkbox-group @change="onAgreementChange">
        <label class="agreement-label">
          <checkbox
            :value="true"
            :checked="isAgreed"
            color="#2979ff"
            style="transform: scale(0.8)"
          />
          <text>我已阅读并同意</text>
        </label>
      </checkbox-group>
      <text class="link-text" @click="goUserAgreement">《用户服务协议》</text>
      <text class="plain-text-separator">和</text>
      <text class="link-text" @click="goPrivacyPolicy">《隐私政策》</text>
    </view>
  </view>
</template>

<script>
import { mapMutations, mapState, mapActions } from "vuex";
import request from "@/common/request.js";
import {
  APP_NAME,
  USER_AUTH_TOKEN_KEY,
  USER_INFO_KEY,
} from "@/common/config.js"; // 引入应用名称
// 建议也将协议URL放到config.js中，然后在这里引入
// import { USER_AGREEMENT_URL, PRIVACY_POLICY_URL } from '@/common/config.js';

export default {
  data() {
    return {
      appName: APP_NAME,
      loading: false,
      isAgreed: false,
      redirectUrl: null, // 登录成功后跳转的地址
      retryCount: 0,
      maxRetries: 3,
      showUserAgreement: false,
      showPrivacyPolicy: false,
    };
  },
  onLoad(options) {
    if (options && options.redirect) {
      this.redirectUrl = decodeURIComponent(options.redirect);
    }
    // 添加网络状态监听
    this.setupNetworkListener();
  },
  onUnload() {
    // 页面卸载时移除网络监听
    uni.offNetworkStatusChange();
  },
  computed: {
    ...mapState(["hasLogin"]), // 确保Vuex store中已定义 hasLogin
  },
  methods: {
    ...mapMutations(["login"]), // 引入 Vuex 的 login mutation
    ...mapActions(["fetchCurrentUserInfo"]), // 引入 Vuex 的 fetchCurrentUserInfo action

    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },

    setupNetworkListener() {
      uni.onNetworkStatusChange((res) => {
        if (!res.isConnected) {
          uni.showToast({
            title: "网络连接已断开，请检查网络设置",
            icon: "none",
            duration: 2000,
          });
        }
      });
    },

    async checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            if (res.networkType === "none") {
              uni.showToast({
                title: "请检查网络连接",
                icon: "none",
                duration: 2000,
              });
              resolve(false);
            } else {
              resolve(true);
            }
          },
          fail: () => {
            uni.showToast({
              title: "网络状态检测失败",
              icon: "none",
              duration: 2000,
            });
            resolve(false);
          },
        });
      });
    },

    async handleWeChatLoginTap() {
      if (!this.isAgreed) {
        uni.showToast({
          title: "请先阅读并同意用户协议和隐私政策",
          icon: "none",
        });
        return;
      }

      // 检查网络状态
      const isNetworkOk = await this.checkNetworkStatus();
      if (!isNetworkOk) {
        return;
      }

      this.loading = true;
      try {
        const userProfileRes = await new Promise((resolve, reject) => {
          uni.getUserProfile({
            desc: "用于完善会员资料及登录",
            lang: "zh_CN",
            success: resolve,
            fail: reject,
          });
        });
        console.log("uni.getUserProfile success:", userProfileRes);

        // 检查用户信息是否为空
        if (
          !userProfileRes.userInfo ||
          Object.keys(userProfileRes.userInfo).length === 0
        ) {
          console.log("⚠️ 用户信息为空，使用默认信息继续登录");
          // 即使userInfo为空，也继续登录流程
          await this.performLogin({});
        } else {
          await this.performLogin(userProfileRes.userInfo);
        }
      } catch (error) {
        let title = "授权失败或发生错误";
        if (error && error.errMsg) {
          if (error.errMsg.includes("getUserProfile:fail auth deny")) {
            title = "您已拒绝授权获取个人信息";
          } else if (
            error.errMsg.includes("getUserProfile:fail:APINotAvailable")
          ) {
            title = "当前微信版本过低，无法使用此功能";
          }
        }
        uni.showToast({ title: title, icon: "none" });
        this.loading = false;
      }
    },

    async performLogin(userInfo = null) {
      this.loading = true;
      try {
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({ provider: "weixin", success: resolve, fail: reject });
        });
        console.log("uni.login success, code:", loginRes.code);
        if (loginRes.code) {
          const selectedVersion = "campus";
          const payload = {
            code: loginRes.code,
            userInfo: userInfo,
            version: selectedVersion,
          };
          console.log("login payload:", payload);
          console.log("userInfo 内容:", userInfo);
          console.log("userInfo 类型:", typeof userInfo);
          console.log(
            "userInfo 是否为空:",
            !userInfo || Object.keys(userInfo).length === 0
          );
          console.log("Sending payload to backend:", payload);
          const backendRes = await this.loginWithRetry(payload);
          console.log("后端响应数据:", backendRes);

          // 检查后端返回的数据结构
          if (backendRes && backendRes.success && backendRes.data) {
            const { token, user } = backendRes.data;

            if (token && user) {
              // 先保存登录状态
              this.login({
                token: token,
                user: user,
              });
              uni.setStorageSync("userId", user.id);
              uni.setStorageSync(USER_AUTH_TOKEN_KEY, token);
              uni.setStorageSync(USER_INFO_KEY, user);
              console.log("登录后保存的 userId:", user.id);
              console.log("登录后保存的 token:", token);
              console.log("登录后保存的 userInfo:", user);

              // 登录成功后，主动获取用户的完整信息（包括头像）
              try {
                await this.fetchCompleteUserInfo();
                console.log("已获取用户完整信息");
              } catch (error) {
                console.error("获取用户完整信息失败:", error);
              }

              uni.showToast({
                title: "登录成功",
                icon: "success",
                duration: 1500,
              });
              setTimeout(() => {
                // 优先检查是否有保存的返回路径（从其他页面跳转过来时保存的）
                const loginReturnPath = uni.getStorageSync("loginReturnPath");
                if (loginReturnPath) {
                  // 清除保存的路径
                  uni.removeStorageSync("loginReturnPath");
                  // 返回到原页面
                  uni.navigateBack({
                    fail: () => {
                      // 如果返回失败（比如页面栈已清空），则使用 navigateTo
                      uni.navigateTo({
                        url: loginReturnPath,
                        fail: () => {
                          // 如果 navigateTo 也失败，则跳转到首页
                          uni.switchTab({ url: "/pages/home/home" });
                        },
                      });
                    },
                  });
                } else if (this.redirectUrl) {
                  uni.reLaunch({ url: this.redirectUrl });
                } else {
                  uni.switchTab({ url: "/pages/home/home" });
                }
              }, 1500);
            } else {
              uni.showToast({ title: "微信登录失败，请重试", icon: "none" });
            }
          } else {
            uni.showToast({ title: "微信登录失败，请重试", icon: "none" });
          }
        } else {
          console.error(
            "微信登录失败！" + (loginRes.errMsg || "未能获取到登录凭证Code")
          );
          uni.showToast({ title: "微信登录失败，请重试", icon: "none" });
        }
      } catch (error) {
        console.error("performLogin process failed:", error);
        uni.showToast({ title: "登录失败，请稍后重试", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    async loginWithRetry(payload) {
      try {
        return await request({
          url: "/auth/wechat-login",
          method: "POST",
          data: payload,
        });
      } catch (error) {
        throw error;
      }
    },

    async fetchCompleteUserInfo() {
      try {
        // 调用Vuex action获取用户的完整信息
        await this.fetchCurrentUserInfo();
        console.log("登录后获取用户完整信息成功");
      } catch (error) {
        console.error("登录后获取用户完整信息失败:", error);
        throw error;
      }
    },

    async updateUserVersion(version) {
      try {
        // 检查token是否存在
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        console.log(
          "updateUserVersion - 当前token:",
          token ? `${token.substring(0, 20)}...` : "无token"
        );

        const response = await request({
          url: "/users/me",
          method: "PUT",
          data: {
            version: version,
          },
        });

        if (response) {
          console.log("用户版本已更新:", version);
        }
      } catch (error) {
        console.error("更新用户版本失败:", error);
        throw error;
      }
    },

    goUserAgreement() {
      uni.navigateTo({ url: "/subpages/other/privacy/user-agreement" });
    },
    goPrivacyPolicy() {
      uni.navigateTo({ url: "/subpages/other/privacy/privacy-policy" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
  .logo-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: $uni-border-radius-lg; // 与 uni.scss 匹配
    background-color: #eee; // 图片加载前的占位
    margin-bottom: 20rpx;
  }
  .app-title {
    font-size: $uni-font-size-title; // 使用 uni.scss 变量
    color: $uni-text-color;
    font-weight: 500;
  }
}
.login-prompt {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey; // 使用 uni.scss 变量
  margin-bottom: 60rpx;
  text-align: center;
  padding: 0 $uni-spacing-col-lg; // 使用 uni.scss 变量
}
.button-area {
  width: 100%;
  max-width: 600rpx;
  padding: 0 $uni-spacing-col-lg;
  box-sizing: border-box;
}
.agreement-area {
  margin-top: 80rpx;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  display: flex;
  flex-wrap: wrap; // 允许换行
  justify-content: center;
  align-items: center;
  padding: 0 $uni-spacing-col-base;
  line-height: 1.6;

  .agreement-label {
    display: flex;
    align-items: center;
    margin-right: 8rpx; // label 和后续文字的间距
  }
  checkbox {
    transform: scale(0.75); // 缩小checkbox
    margin-right: 4rpx; // checkbox 和文字 "我已阅读并同意" 的间距
    vertical-align: middle; // 轻微调整垂直对齐
  }
  .link-text {
    color: $uni-text-color-link; // 使用 uni.scss 变量
  }
  .plain-text-separator {
    // 用于 "和" 字
    margin: 0 8rpx;
  }
}
.popup-content {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  min-width: 540rpx;
  max-width: 90vw;
  box-sizing: border-box;
  text-align: left;
}
.popup-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16rpx;
  color: #333;
}
.popup-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
}
.popup-btn {
  margin-top: 24rpx;
  width: 100%;
  background: #2979ff;
  color: #fff;
  border-radius: 8rpx;
}
</style>
