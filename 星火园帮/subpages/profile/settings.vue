<template>
  <view class="settings-container page-container">
    <view class="setting-group card rounded-lg shadow-base">
      <button
        open-type="chooseAvatar"
        @chooseavatar="onChooseAvatarEvent"
        class="setting-item-button"
      >
        <text class="item-label">更换头像</text>
        <view class="item-action">
          <image
            class="current-avatar rounded-circle"
            :src="avatarUrl"
            mode="aspectFill"
            @error="onAvatarError"
            @load="onAvatarLoad"
            :key="localAvatarUrl || avatarUrl"
          ></image>
          <text class="arrow-icon">></text>
        </view>
      </button>

      <view
        class="setting-item"
        @click="navigateToPage('/subpages/profile/edit-info')"
      >
        <text class="item-label">编辑个人资料</text>
        <text class="arrow-icon">></text>
      </view>

      <view
        class="setting-item"
        @click="navigateToPage('/subpages/profile/feedback')"
      >
        <text class="item-label">意见反馈</text>
        <text class="arrow-icon">></text>
      </view>

      <!-- 通知设置区域 -->
      <view class="setting-item notification-setting">
        <text class="item-label">接收订单通知</text>
        <view class="item-action">
          <switch
            :checked="notificationSettings.orderNotification"
            @change="onOrderNotificationChange"
            color="#007AFF"
          />
        </view>
      </view>
      <view
        class="setting-item"
        @click="navigateToPage('/subpages/profile/aboutus')"
      >
        <text class="item-label">关于我们</text>
        <text class="arrow-icon">></text>
      </view>
    </view>

    <view
      class="setting-group card rounded-lg shadow-base logout-container"
      v-if="hasLogin"
    >
      <button class="logout-btn button-error" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import request from "@/common/request.js";

export default {
  data() {
    return {
      forceUpdate: 0, // 用于强制更新头像显示
      localAvatarUrl: null, // 本地头像URL，用于立即显示
      notificationSettings: {
        orderNotification: true, // 默认开启订单通知
      },
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.userInfo || {},
      hasLogin: (state) => state.hasLogin,
    }),
    // 头像URL计算属性
    avatarUrl() {
      // 优先使用本地头像URL（用于立即显示）
      if (this.localAvatarUrl) {
        const timestamp = Date.now();
        const urlWithTimestamp = this.localAvatarUrl.includes("?")
          ? `${this.localAvatarUrl}&t=${timestamp}`
          : `${this.localAvatarUrl}?t=${timestamp}`;
        return urlWithTimestamp;
      }

      // 确保userInfo存在且有avatarUrl
      if (!this.userInfo || !this.userInfo.avatarUrl) {
        return "/static/images/default-avatar.png";
      }

      const url = this.userInfo.avatarUrl;

      // 添加时间戳避免缓存，确保新头像能立即显示
      const timestamp = Date.now();
      const urlWithTimestamp = url.includes("?")
        ? `${url}&t=${timestamp}`
        : `${url}?t=${timestamp}`;
      return urlWithTimestamp;
    },
  },
  onShow() {
    // 确保用户信息是最新的
    this.refreshUserInfoIfNeeded();
    // 初始化本地头像URL
    if (this.userInfo && this.userInfo.avatarUrl) {
      this.localAvatarUrl = this.userInfo.avatarUrl;
    }
  },
  watch: {
    userInfo: {
      handler(newVal, oldVal) {
        if (newVal && newVal.avatarUrl !== oldVal?.avatarUrl) {
          this.localAvatarUrl = newVal.avatarUrl;
          this.$nextTick(() => {
            // 更新强制更新标记
            this.forceUpdate = Date.now();
            this.$forceUpdate();
          });
        }
      },
      deep: true,
      immediate: true,
    },
    // 监听强制更新标记
    forceUpdate: {
      handler(newVal) {
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      },
    },
  },
  onLoad() {
    // 初始化通知设置
    this.loadNotificationSettings();
  },
  methods: {
    ...mapMutations(["logout", "setUserInfo"]),

    // 加载通知设置
    loadNotificationSettings: function () {
      try {
        // 从本地存储读取设置，默认为true（开启）
        const savedSetting = uni.getStorageSync("orderNotificationSetting");
        if (savedSetting !== null && savedSetting !== undefined) {
          this.notificationSettings.orderNotification = savedSetting;
        } else {
          // 首次使用，默认开启并保存
          this.notificationSettings.orderNotification = true;
          uni.setStorageSync("orderNotificationSetting", true);
        }
      } catch (error) {
        console.error("加载通知设置失败:", error);
        // 出错时默认开启
        this.notificationSettings.orderNotification = true;
      }
    },

    // 处理订单通知开关变化
    onOrderNotificationChange: function (e) {
      const isEnabled = e.detail.value;

      this.notificationSettings.orderNotification = isEnabled;

      if (isEnabled) {
        // 开启通知时，弹出订阅提示
        this.requestSubscriptionAuth();
      } else {
        // 关闭通知时，清除订阅状态
        uni.removeStorageSync("orderNotificationSetting");

        // 显示提示
        uni.showToast({
          title: "已关闭订单通知",
          icon: "success",
          duration: 2000,
        });
      }
    },

    // 请求订阅消息授权
    requestSubscriptionAuth: function () {
      // 使用新的订阅服务
      import("@/common/subscription.js").then(
        ({ requestMessageSubscription }) => {
          requestMessageSubscription().then((success) => {
            if (success) {
              // 订阅成功，设置已保存，提示由订阅服务显示
              console.log("订阅授权成功");
            } else {
              // 订阅失败，提示用户
              uni.showToast({
                title: "订阅失败，可稍后在微信设置中开启",
                icon: "none",
                duration: 3000,
              });
            }
          });
        }
      );
    },

    onAvatarLoad(e) {
      console.log("头像加载成功:", e);
    },
    onAvatarError(e) {
      console.error("头像加载失败:", e);
      console.error("尝试加载的头像URL:", this.userInfo?.avatarUrl);
      console.error("当前用户信息:", this.userInfo);

      // 如果头像加载失败，尝试从服务器重新获取用户信息
      if (this.hasLogin) {
        console.log("头像加载失败，尝试从服务器重新获取用户信息...");
        this.$store.dispatch("fetchCurrentUserInfo").catch((error) => {
          console.error("重新获取用户信息失败:", error);
        });
      }
    },
    onChooseAvatarEvent(e) {
      const tempAvatarPath = e.detail.avatarUrl;
      if (tempAvatarPath) {
        uni.showLoading({ title: "头像上传中..." });
        console.log("开始上传头像:", tempAvatarPath);
        console.log("头像选择事件详情:", e.detail);

        // 上传图片到后端
        uni.uploadFile({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/avatar",
          filePath: tempAvatarPath,
          name: "file",
          formData: {
            type: "avatar",
          },
          header: {
            "Content-Type": "multipart/form-data",
          },
          success: (uploadRes) => {
            console.log("头像上传响应:", uploadRes);
            uni.hideLoading();

            try {
              const data = JSON.parse(uploadRes.data);
              console.log("解析的上传数据:", data);

              if (data.url) {
                console.log("头像上传成功，URL:", data.url);

                // 立即更新本地状态，让用户立即看到新头像
                const updatedUserInfo = {
                  ...this.userInfo,
                  avatarUrl: data.url,
                };
                console.log("立即更新用户信息:", updatedUserInfo);

                // 直接更新Vuex状态
                this.setUserInfo(updatedUserInfo);

                // 同时直接更新本地状态作为备用
                this.$set(this, "localAvatarUrl", data.url);

                // 立即强制刷新界面显示
                this.$nextTick(() => {
                  this.forceRefreshAvatar();
                });

                // 显示上传成功提示
                uni.showToast({
                  title: "头像上传成功！",
                  icon: "success",
                  duration: 1500,
                });

                // 异步调用后端接口写入数据库
                console.log("开始调用后端API保存头像URL:", data.url);
                request({
                  url: "/users/profile/me",
                  method: "PUT",
                  header: {
                    Authorization:
                      "Bearer " + uni.getStorageSync("userAuthToken_xh"),
                  },
                  data: { avatarUrl: data.url },
                  success: (res) => {
                    console.log("用户信息更新响应:", res);
                    console.log("响应状态码:", res.statusCode);
                    console.log("响应数据:", res.data);

                    if (res.data && res.data.user) {
                      console.log("头像信息已同步到服务器");
                      console.log("服务器返回的用户信息:", res.data.user);
                      console.log(
                        "服务器返回的avatarUrl:",
                        res.data.user.avatarUrl
                      );

                      // 再次确保界面更新
                      setTimeout(() => {
                        this.forceRefreshAvatar();
                      }, 200);
                    } else {
                      console.error("用户信息更新失败:", res);
                      uni.showToast({
                        title: "头像同步失败",
                        icon: "none",
                      });
                    }
                  },
                  fail: (error) => {
                    console.error("用户信息更新请求失败:", error);
                    console.error("错误详情:", error);
                    uni.showToast({ title: "头像同步失败", icon: "none" });
                  },
                });
              } else {
                console.error("头像上传失败，响应数据:", data);
                uni.showToast({
                  title: "上传失败: " + (data.message || "未知错误"),
                  icon: "none",
                });
              }
            } catch (parseError) {
              console.error("解析上传响应失败:", parseError);
              console.error("原始响应数据:", uploadRes.data);
              uni.showToast({ title: "上传响应解析失败", icon: "none" });
            }
          },
          fail: (error) => {
            console.error("头像上传请求失败:", error);
            uni.hideLoading();
            uni.showToast({
              title: "上传失败: " + (error.errMsg || "网络错误"),
              icon: "none",
            });
          },
        });
      } else {
        console.error("未获取到头像路径");
        uni.showToast({ title: "未选择新头像", icon: "none" });
      }
    },
    navigateToPage(pageUrl) {
      if (pageUrl) {
        uni.navigateTo({ url: pageUrl });
      } else {
        uni.showToast({ title: "功能暂未开放", icon: "none" });
      }
    },
    refreshUserInfoIfNeeded() {
      // 如果用户已登录但没有头像信息，尝试从服务器获取
      if (this.hasLogin && (!this.userInfo || !this.userInfo.avatarUrl)) {
        console.log("检测到用户信息不完整，尝试从服务器获取...");
        this.$store.dispatch("fetchCurrentUserInfo").catch((error) => {
          console.error("获取用户信息失败:", error);
        });
      }
    },
    // 强制刷新头像显示
    forceRefreshAvatar() {
      console.log("强制刷新头像显示...");
      this.forceUpdate = Date.now();

      // 强制重新计算计算属性
      this.$nextTick(() => {
        console.log("触发界面更新...");
        this.$forceUpdate();

        // 再次确保更新
        setTimeout(() => {
          console.log("二次确认更新...");
          this.forceUpdate = Date.now();
          this.$forceUpdate();
        }, 50);
      });
    },
    handleLogout() {
      uni.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            this.logout();
            uni.showToast({ title: "已退出登录", icon: "success" });
            uni.navigateBack({ delta: 1 }).catch(() => {
              uni.switchTab({ url: "/pages/home/home" });
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
  padding: 0;
}
.setting-item,
.setting-item-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-row-lg $uni-spacing-col-lg;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color-light;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  transition: background-color 0.1s ease;
  &:last-child {
    border-bottom: none;
  }
  &:active {
    background-color: $uni-bg-color-hover;
  }
  .item-label {
    flex-grow: 1;
  }
  .item-action {
    display: flex;
    align-items: center;
    color: $uni-text-color-light;
    .current-avatar {
      width: 80rpx;
      height: 80rpx;
      margin-right: $uni-spacing-col-sm;
      background-color: #eee;
    }
    .arrow-icon {
      font-size: $uni-font-size-lg;
      color: $uni-text-color-placeholder;
    }
  }
  .item-action-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }
}
.setting-item-button {
  width: 100%;
  text-align: left;
  border-radius: 0;
  padding: 0;
  line-height: normal;
  background-color: $uni-bg-color;
  color: $uni-text-color;
  font-size: $uni-font-size-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-row-lg $uni-spacing-col-lg;
  &:after {
    border: none;
  }
  &.button-hover,
  &:active {
    background-color: $uni-bg-color-hover !important;
  }
}
.logout-container {
  width: 80%;
  margin: 0 auto;
  padding: 0 !important;
}

.logout-btn {
  @extend .button-error;
  width: 100%;
  margin: 0;
  border-radius: $uni-border-radius-base;
}
.rounded-lg {
  border-radius: $uni-border-radius-lg;
}
.rounded-circle {
  border-radius: $uni-border-radius-circle;
}
.shadow-base {
  box-shadow: $uni-shadow-base;
}

/* 通知设置样式 */
.notification-setting {
  .item-action {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
}

.setting-item.notification-setting {
  background-color: rgba(0, 122, 255, 0.05);
  border-left: 4rpx solid #007aff;
}

.setting-item.notification-setting .item-label {
  color: #333;
  font-weight: 500;
}
</style>
