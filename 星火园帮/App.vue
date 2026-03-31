<script>
// 1. 从 config.js 引入统一定义的 localStorage 键名
import { USER_AUTH_TOKEN_KEY, USER_INFO_KEY } from "./common/config.js"; // 确保路径正确

export default {
  onLaunch: function (options) {
    console.log("App Launch，启动参数：", options);

    // 维护状态延后拉取，避免与首屏 / 开屏页路由竞态
    setTimeout(() => {
      this.checkMaintenanceModeAsync();
    }, 400);

    // 直接进入主页面，无需版本选择
    console.log("App.vue onLaunch: 直接启动应用");

    // 自定义tabBar无需JavaScript增强

    // 2. 使用从 config.js 导入的键名
    const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
    const storedUserInfoString = uni.getStorageSync(USER_INFO_KEY); // Vuex store 存储的是 JSON 字符串

    let userInfo = null;
    if (storedUserInfoString) {
      try {
        userInfo = JSON.parse(storedUserInfoString); // 解析存储的字符串
      } catch (e) {
        console.error(
          "App.vue onLaunch: 解析本地存储的 userInfo 失败, 可能数据已损坏:",
          e
        );
        uni.removeStorageSync(USER_INFO_KEY); // 清除可能损坏的数据
      }
    }

    if (token && userInfo && this.$store) {
      console.log(
        "App.vue onLaunch: 检测到本地登录信息，尝试通过 commit 恢复/同步登录状态到Vuex..."
      );
      this.$store.commit("login", { token: token, user: userInfo });

      // 启动实时消息管理器
      import("./common/realtimeMessageManager.js").then((module) => {
        module.default.start();
      });
    } else {
      console.log(
        "App.vue onLaunch: 未检测到有效本地登录信息或 Vuex Store 未准备好。"
      );
      // 不启动消息管理器，等待用户登录后再启动
      if (!token)
        console.log(
          `App.vue onLaunch: Token not found with key: ${USER_AUTH_TOKEN_KEY}`
        );
      if (!userInfo && storedUserInfoString)
        console.log(
          "App.vue onLaunch: userInfo was in storage but failed to parse or was initially null."
        );
      else if (!userInfo)
        console.log(
          `App.vue onLaunch: UserInfo not found or null with key: ${USER_INFO_KEY}`
        );
    }
  },

  onShow: function (options) {
    console.log("App Show，启动参数：", options);
    // 应用显示时启动实时消息管理器
    const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
    if (token) {
      import("./common/realtimeMessageManager.js").then((module) => {
        module.default.start();
      });
    }
  },

  onHide: function () {
    console.log("App Hide");
    // 应用隐藏时停止实时消息管理器以节省资源
    import("./common/realtimeMessageManager.js").then((module) => {
      module.default.stop();
    });
  },

  onError: function (err) {
    console.error("App Error:", err);
    // 在这里可以进行全局的错误上报
  },

  globalData: {
    // appName: '星火园帮',
  },

  methods: {
    // 检查维护模式
    async checkMaintenanceMode() {
      try {
        const res = await uni.request({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/maintenance/status",
          method: "GET",
          timeout: 5000,
        });

        if (res.data && res.data.success && res.data.data) {
          const { maintenanceMode, maintenanceMessage } = res.data.data;

          if (maintenanceMode) {
            // 存储维护状态到本地
            uni.setStorageSync("maintenanceMode", true);
            uni.setStorageSync("maintenanceMessage", maintenanceMessage);

            // 显示维护提示弹窗
            uni.showModal({
              title: "系统维护",
              content: maintenanceMessage || "系统正在维护中，请稍后再试...",
              showCancel: false,
              confirmText: "我知道了",
              success: (res) => {
                if (res.confirm) {
                  console.log("用户确认维护提示");
                }
              },
            });
          } else {
            // 清除维护状态
            uni.removeStorageSync("maintenanceMode");
            uni.removeStorageSync("maintenanceMessage");
            console.log("维护模式已关闭，系统正常运行");
          }
        }
      } catch (error) {
        console.error("检查维护模式失败:", error);
        // 如果检查失败，不影响正常使用
      }
    },

    // 异步检查维护模式
    async checkMaintenanceModeAsync() {
      try {
        // 强制清除所有维护模式相关的本地缓存
        uni.removeStorageSync("maintenanceMode");
        uni.removeStorageSync("maintenanceMessage");
        uni.removeStorageSync("maintenanceModalShown");
        uni.removeStorageSync("isAppLaunch");

        const { checkMaintenanceMode } = await import(
          "./common/maintenanceCheck.js"
        );
        await checkMaintenanceMode();
      } catch (error) {
        console.error("异步检查维护模式失败:", error);
      }
    },
  },
};
</script>

<template>
  <view></view>
</template>

<style lang="scss">
/* #ifndef APP-PLUS-NVUE */
@import "./uni.scss"; // 修正为相对路径

page {
  background-color: $uni-bg-color-page; /* <<< 修改为 uni.scss 中定义的页面背景色变量 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  color: $uni-text-color; /* 确保 $uni-text-color 在 uni.scss 中定义 */
  font-size: $uni-font-size-base; /* 确保 $uni-font-size-base 在 uni.scss 中定义 */
  box-sizing: border-box;
  min-height: 100vh;
}

/* #ifdef MP-TOUTIAO */
@font-face {
  font-family: uniicons;
  src: url("/static/uni.ttf"); /* 确认路径，或使用 uni_modules/uni-icons/static/uni.ttf */
}
/* #endif */

/* #endif */

/* 自定义tabBar样式已移至 custom-tab-bar/index.vue */

/* 原生tabBar样式已移除，使用自定义tabBar */

/* 原生tabBar样式已完全移除，使用自定义tabBar */
/* 所有原生tabBar样式已移除，发光效果在自定义tabBar中实现 */
</style>
