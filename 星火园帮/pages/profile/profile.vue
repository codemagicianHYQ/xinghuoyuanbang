<template>
  <view class="profile-container">
    <view class="profile-header-bg">
      <view
        class="profile-header card rounded-lg shadow-base"
        @tap="handleProfileClick"
      >
        <view class="avatar-container">
          <image
            class="avatar rounded-circle"
            :src="avatarSrc"
            mode="aspectFill"
            @tap.stop="handleChangeAvatar"
          ></image>
          <button
            class="edit-avatar-btn"
            v-if="hasLogin"
            open-type="chooseAvatar"
            @chooseavatar="onChooseAvatarEvent"
          >
            <text class="edit-icon">📷</text>
          </button>
        </view>
        <view class="user-details">
          <view class="nickname-container">
            <text class="greeting-nickname fun-title">
              Hi,{{
                hasLogin && vuex_userInfo.nickname
                  ? vuex_userInfo.nickname
                  : "欢迎"
              }}
              <text v-if="isRiderUser" class="rider-tag">（接单员）</text>
            </text>
          </view>
          <text class="user-id" v-if="hasLogin && vuex_userInfo.id">
            ID: {{ vuex_userInfo.id }}
          </text>
          <text class="login-prompt-text" v-if="!hasLogin">点击登录/注册</text>
        </view>
        <view
          class="edit-profile-btn-small"
          v-if="hasLogin"
          @tap.stop="handleEditProfile"
        >
          <text class="edit-icon-small">✏️</text>
        </view>
      </view>
      <!-- 接单员申请卡片 -->
      <view
        class="apply-rider-card-fun card shadow-base"
        @click="handleApplyRider"
      >
        <view class="apply-rider-content">
          <image
            src="/static/icons/become-rider.png"
            class="apply-rider-icon"
          />
          <view class="apply-rider-info">
            <text class="apply-title fun-title">接单员·校园</text>
            <text class="apply-desc">课余时间也有收益！</text>
          </view>
          <template v-if="!isRiderUser">
            <template
              v-if="
                vuex_userInfo &&
                vuex_userInfo.riderApplicationStatus === 'pending'
              "
            >
              <view class="rider-info-msg">
                <view class="rider-congrats">接单员申请已提交</view>
                <view class="rider-action">预计十分钟内审核完成</view>
              </view>
            </template>
            <template v-else>
              <button class="apply-btn-fun centered">立即申请</button>
            </template>
          </template>
          <template v-else>
            <view class="rider-info-msg">
              <view class="rider-congrats">恭喜成为接单员</view>
              <view class="rider-action">点击进入接单员中心</view>
            </view>
          </template>
        </view>
      </view>
    </view>

    <!-- 其他功能区 -->
    <view class="menu-list card rounded-lg shadow-base">
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/my-published', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/profile-published.png"
            mode="aspectFit"
          ></image>
          <text>我发布的</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/my-accepted', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/profile-accepted.png"
            mode="aspectFit"
          ></image>
          <text>我接受的</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/wallet', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/profile-wallet.png"
            mode="aspectFit"
          ></image>
          <text>我的钱包</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/address', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/profile-address.png"
            mode="aspectFit"
          ></image>
          <text>我的地址</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/messages', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/megaphone.png"
            mode="aspectFit"
          ></image>
          <text>消息中心</text>
        </view>
        <view class="menu-right">
          <view v-if="messageBadgeCount > 0" class="message-badge-dot"></view>
          <text class="uni-icon-arrowright"></text>
        </view>
      </view>
      <view class="menu-item" @click="contactService">
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/service.png"
            mode="aspectFit"
          ></image>
          <text>联系客服</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
      <view
        class="menu-item"
        @click="navigateToPage('/subpages/profile/settings', true)"
      >
        <view class="item-content">
          <image
            class="item-icon"
            src="/static/icons/profile-settings.png"
            mode="aspectFit"
          ></image>
          <text>设置</text>
        </view>
        <text class="uni-icon-arrowright"></text>
      </view>
    </view>

    <!-- 自定义tabBar -->
    <custom-tab-bar />
  </view>
</template>

<script>
import { mapState, mapActions } from "vuex";
import simpleMessageBadge from "@/common/simpleMessageBadge.js";
import realtimeMessageManager from "@/common/realtimeMessageManager.js";
import CustomTabBar from "@/custom-tab-bar/index.vue";

export default {
  components: {
    CustomTabBar,
  },
  data() {
    return {
      messageBadgeCount: 0,
    };
  },
  computed: {
    ...mapState({
      vuex_userInfo: (state) => state.userInfo || {},
      hasLogin: (state) => state.hasLogin,
      forceUpdate: (state) => state.forceUpdate,
    }),
    avatarSrc() {
      // 如果用户已登录且有有效头像URL，使用用户头像
      if (
        this.hasLogin &&
        this.vuex_userInfo &&
        this.vuex_userInfo.avatarUrl &&
        this.vuex_userInfo.avatarUrl !== null &&
        this.vuex_userInfo.avatarUrl.trim() !== ""
      ) {
        return this.vuex_userInfo.avatarUrl;
      }
      // 否则使用默认头像
      return "/static/images/default-avatar.png";
    },
    isRiderUser() {
      // 只要是接单员（角色为rider或申请状态为approved）
      return (
        this.vuex_userInfo &&
        (this.vuex_userInfo.role === "rider" ||
          this.vuex_userInfo.riderApplicationStatus === "approved")
      );
    },
    canDisplayRiderApplicationEntry() {
      if (!this.hasLogin) return false;
      const isRider = this.vuex_userInfo.role === "rider";
      const isApplicationApproved =
        this.vuex_userInfo.riderApplicationStatus === "approved";
      return !isRider && !isApplicationApproved;
    },
    riderApplicationActionText() {
      if (this.vuex_userInfo && this.vuex_userInfo.riderApplicationStatus) {
        switch (this.vuex_userInfo.riderApplicationStatus) {
          case "pending":
            return "接单员申请审核中";
          case "rejected":
            return "申请被拒，点此重试";
          default:
            return "申请成为接单员";
        }
      }
      return "申请成为接单员";
    },
    showApplyRiderArrow() {
      if (this.vuex_userInfo && this.vuex_userInfo.riderApplicationStatus) {
        return !["pending", "rejected"].includes(
          this.vuex_userInfo.riderApplicationStatus
        );
      }
      return true;
    },
    riderStatusBadgeText() {
      if (this.vuex_userInfo && this.vuex_userInfo.riderApplicationStatus) {
        switch (this.vuex_userInfo.riderApplicationStatus) {
          case "pending":
            return "审核中";
          case "rejected":
            return "被拒绝";
          default:
            return "";
        }
      }
      return "";
    },
    canApplyNow() {
      // 添加这个计算属性，用于 handleRiderApplicationClick 判断
      if (!this.vuex_userInfo) return true;
      const status = this.vuex_userInfo.riderApplicationStatus;
      return !status || status === "none" || status === "rejected";
    },
  },
  onLoad() {
    this.setupMessageBadge();
    // 启用消息徽章自动刷新（极简版本不需要自动刷新）
  },
  onShow() {
    // 同步tabBar状态
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSelected(3); // 我的页面对应索引3
    }

    // 检查本地存储中的token，确保用户真的已登录
    const localToken = uni.getStorageSync("userAuthToken_xh");
    if (this.hasLogin && localToken) {
      this.fetchCurrentUserInfoAndUpdate();
    }

    // 页面显示时获取消息红点状态
    // 极简版本不需要频繁请求
  },
  onUnload() {
    simpleMessageBadge.removeListener(this.updateMessageBadge);
    realtimeMessageManager.removeListener(this.onRealtimeMessage);
    // 禁用消息徽章自动刷新（极简版本不需要）
  },
  methods: {
    ...mapActions(["fetchCurrentUserInfo"]),
    handleProfileClick() {
      if (!this.hasLogin) {
        uni.navigateTo({
          url: "/pages/login/login",
          fail: (err) => {
            console.error("导航到登录页面失败:", err);
            uni.showToast({ title: "页面打开失败", icon: "none" });
          },
        });
      }
    },
    handleChangeAvatar() {
      if (!this.hasLogin) {
        uni.navigateTo({
          url: "/pages/login/login",
          fail: (err) => {
            console.error("导航到登录页面失败:", err);
            uni.showToast({ title: "页面打开失败", icon: "none" });
          },
        });
        return;
      }

      // 直接跳转到设置页面进行头像编辑
      uni.navigateTo({
        url: "/subpages/profile/settings",
        fail: (err) => {
          console.error("导航到设置页面失败:", err);
          uni.showToast({ title: "页面打开失败", icon: "none" });
        },
      });
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

                // 更新用户信息
                this.$store.dispatch("fetchCurrentUserInfo").then(() => {
                  uni.showToast({
                    title: "头像上传成功！",
                    icon: "success",
                    duration: 1500,
                  });
                });
              } else {
                throw new Error(data.message || "上传失败");
              }
            } catch (error) {
              console.error("解析上传响应失败:", error);
              uni.showToast({
                title: "头像上传失败",
                icon: "none",
                duration: 2000,
              });
            }
          },
          fail: (error) => {
            console.error("头像上传失败:", error);
            uni.hideLoading();
            uni.showToast({
              title: "头像上传失败",
              icon: "none",
              duration: 2000,
            });
          },
        });
      }
    },
    handleEditProfile() {
      if (!this.hasLogin) {
        uni.navigateTo({
          url: "/pages/login/login",
          fail: (err) => {
            console.error("导航到登录页面失败:", err);
            uni.showToast({ title: "页面打开失败", icon: "none" });
          },
        });
        return;
      }

      // 直接进入个人资料编辑页面
      uni.navigateTo({
        url: "/subpages/profile/edit-info",
        fail: (err) => {
          console.error("导航到编辑资料页面失败:", err);
          uni.showToast({ title: "页面打开失败", icon: "none" });
        },
      });
    },
    async fetchCurrentUserInfoAndUpdate() {
      try {
        await this.fetchCurrentUserInfo();
      } catch (error) {
        console.error("Failed to refresh user info on profile show:", error);
      }
    },
    handleApplyRider() {
      if (!this.hasLogin) {
        uni.navigateTo({ url: "/pages/login/login" });
      } else if (this.isRiderUser) {
        // 如果已经是接单员，进入接单员中心
        this.navigateToPage("/subpages/profile/rider-center", false);
      } else {
        // 如果不是接单员，进入申请页面
        this.navigateToPage("/subpages/profile/apply-rider", false);
      }
    },
    contactService() {
      // 直接调用微信客服API
      wx.openCustomerServiceChat({
        extInfo: {
          url: "https://work.weixin.qq.com/kfid/kfcc460616b96351981",
        },
        corpId: "ww4f94bec1d56104e4",
        showMessageCard: true,
        sendMessageTitle: "星火园帮客服",
        sendMessagePath: "/pages/index/index",
        sendMessageImg: "/static/icons/service.png",
        success: (res) => {
          // 打开客服成功
        },
        fail: (err) => {
          console.error("打开客服失败", err);
          // 降级处理：显示微信号
          this.showWechatFallback();
        },
      });
    },

    // 设置消息红点监听
    setupMessageBadge() {
      simpleMessageBadge.addListener(this.updateMessageBadge);
      // 添加实时消息监听
      realtimeMessageManager.addListener(this.onRealtimeMessage);
    },

    // 更新消息红点数量
    updateMessageBadge(unreadCounts) {
      this.messageBadgeCount = unreadCounts.total;
      console.log("==========================");

      this.$forceUpdate();
    },

    // 处理实时消息
    onRealtimeMessage(data) {
      if (data.databaseUnreadCount !== undefined) {
        // 如果数据库有未读消息，但红点状态显示已查看，需要同步
        if (
          data.databaseUnreadCount > 0 &&
          simpleMessageBadge.hasViewedMessageCenter
        ) {
          simpleMessageBadge.unreadCount = data.databaseUnreadCount;
          simpleMessageBadge.hasViewedMessageCenter = false;
          simpleMessageBadge.saveToStorage();
          simpleMessageBadge.updateUI();
        }
      }

      // 更新红点显示
      this.updateMessageBadge(data.unreadCounts);
    },

    // 调试方法：重置消息中心查看状态
    resetMessageCenterState() {
      console.log("手动重置消息中心查看状态");
      simpleMessageBadge.reset();
    },

    // 调试方法：强制显示红点
    forceShowRedDot() {
      simpleMessageBadge.addUnreadCount(1);
    },

    // 调试方法：手动测试红点显示
    testRedDotDisplay() {
      console.log(
        "当前 simpleMessageBadge 状态:",
        simpleMessageBadge.getState()
      );

      // 手动触发红点更新
      this.updateMessageBadge(simpleMessageBadge.getUnreadCounts());

      console.log("测试后 messageBadgeCount:", this.messageBadgeCount);
      console.log("========================");
    },

    // 调试方法：强制同步数据库状态
    forceSyncWithDatabase() {
      console.log("=== 强制同步数据库状态 ===");
      console.log("当前状态:", simpleMessageBadge.getState());

      // 强制同步为0未读
      simpleMessageBadge.forceSyncWithDatabase(0);

      console.log("同步后状态:", simpleMessageBadge.getState());
      console.log("========================");
    },

    // 显示微信号降级方案
    showWechatFallback() {
      uni.showModal({
        title: "微信客服",
        content: "请添加微信号：spark-help\n我们将为您提供专业服务",
        confirmText: "复制微信号",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: "spark-help",
              success: () => {
                uni.showToast({ title: "微信号已复制", icon: "success" });
              },
            });
          }
        },
      });
    },
    navigateToPage(pageUrl, requireLogin = false) {
      if (requireLogin && !this.hasLogin) {
        uni.showToast({
          title: "请先登录后操作",
          icon: "none",
          duration: 1000,
        });
        uni.navigateTo({
          url: "/pages/login/login",
          fail: (err) => {
            console.error("导航到登录页面失败:", err);
            uni.showToast({ title: "页面打开失败", icon: "none" });
          },
        });
        return;
      }

      // 移除过早的标记，让用户在真正查看消息后才标记为已查看
      // if (pageUrl === "/subpages/profile/messages") {
      //   simpleMessageBadge.enterMessageCenter();
      // }

      if (pageUrl) {
        // 添加超时处理
        const navigationTimeout = setTimeout(() => {
          uni.showToast({
            title: "页面加载超时，请重试",
            icon: "none",
            duration: 2000,
          });
        }, 10000); // 10秒超时

        uni.navigateTo({
          url: pageUrl,
          success: () => {
            clearTimeout(navigationTimeout);
            console.log(`成功导航到 ${pageUrl}`);
          },
          fail: (err) => {
            clearTimeout(navigationTimeout);
            console.error(`导航到 ${pageUrl} 失败:`, err);

            // 如果是超时错误，提供重试选项
            if (err.errMsg && err.errMsg.includes("timeout")) {
              uni.showModal({
                title: "页面打开超时",
                content: "是否重试？",
                success: (res) => {
                  if (res.confirm) {
                    this.navigateToPage(pageUrl, requireLogin);
                  }
                },
              });
            } else {
              uni.showToast({ title: "页面打开失败", icon: "none" });
            }
          },
        });
      } else {
        uni.showToast({ title: "功能暂未开放", icon: "none" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.profile-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
  box-sizing: border-box;
}
.profile-header,
.menu-list,
.apply-rider-card {
  @extend .card;
  padding: $uni-spacing-col-lg;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: $uni-spacing-row-lg;
}
.profile-header {
  display: flex;
  flex-direction: row;
  align-items: center;

  .avatar-container {
    position: relative;
    margin-right: $uni-spacing-col-base;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border: 4rpx solid $uni-color-primary-light;
      background-color: #f0f0f0;
      box-shadow: $uni-shadow-sm;
      border-radius: $uni-border-radius-circle;
    }

    .edit-avatar-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      width: auto;
      height: auto;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
      }

      .edit-icon {
        font-size: 28rpx;
        color: #666;
        line-height: 1;
        display: block;
      }
    }
  }
  .user-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
    image.png .nickname-container {
      display: flex;
      align-items: center;
      width: 100%;

      .greeting-nickname {
        flex: 1;
      }
    }
    .user-id {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-light;
      margin-top: 8rpx;
    }
    .login-prompt-text {
      font-size: $uni-font-size-lg;
      color: $uni-text-color-grey;
    }
  }

  .edit-profile-btn-small {
    width: 48rpx;
    height: 48rpx;
    background-color: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: 16rpx;

    &:active {
      transform: scale(0.95);
    }

    .edit-icon-small {
      font-size: 24rpx;
      color: #666;
      line-height: 1;
    }
  }
}

// 通用菜单列表项样式 (不包括 apply-rider-card 的特殊图标处理)
.menu-list:not(.apply-rider-card) {
  padding: 0;
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $uni-spacing-row-lg $uni-spacing-col-lg;
    border-bottom: 1px solid $uni-border-color-light;
    background-color: transparent;
    transition: background-color 0.1s ease;
    &:last-child {
      border-bottom: none;
    }
    &:active {
      background-color: $uni-bg-color-hover;
    }
    .item-content {
      display: flex;
      align-items: center;
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      .item-icon {
        // 其他菜单项的图标样式
        width: 44rpx;
        height: 44rpx;
        margin-right: $uni-spacing-col-base;
      }
    }
    .uni-icon-arrowright {
      color: $uni-text-color-placeholder;
      font-size: $uni-font-size-lg;
    }

    .menu-right {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .message-badge-dot {
        background-color: #ff4757 !important;
        border-radius: 50% !important;
        width: 16rpx !important;
        height: 16rpx !important;
        display: block !important;
        flex-shrink: 0 !important;
      }
    }
  }
}

// "申请成为接单员"卡片的特定样式
.apply-rider-card {
  padding: 0;
  .menu-item {
    &.no-border {
      border-bottom: none;
    }
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $uni-spacing-row-lg $uni-spacing-col-lg;
    background-color: transparent;
    transition: background-color 0.1s ease;
    &:active {
      background-color: $uni-bg-color-hover;
    }
    .item-content {
      display: flex;
      align-items: center;
      font-size: $uni-font-size-lg;
      color: $uni-text-color;

      .item-icon {
        // "成为接单员"的图标样式
        width: 88rpx !important; // <<< 增大图标尺寸，并使用 !important
        height: 88rpx !important; // <<< 增大图标尺寸，并使用 !important
        margin-right: $uni-spacing-col-base;
      }
    }
    .uni-icon-arrowright {
      color: $uni-text-color-placeholder;
      font-size: $uni-font-size-lg;
    }
    .application-status-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color-light;
      font-weight: 500;
    }
  }
}

.apply-rider-card-fun {
  background: linear-gradient(90deg, #eaffd0 0%, #fffbe6 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx 0 #e6f7ff;
  margin: 24rpx 0;
  padding: 48rpx 32rpx;
  min-height: 120rpx;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx 0 rgba(103, 194, 58, 0.3);
  }

  .apply-rider-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .apply-rider-icon {
      width: 100rpx;
      height: 100rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
    }

    .apply-rider-info {
      flex: 1;
      margin-right: 24rpx;

      .apply-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
        display: block;
        white-space: nowrap;
      }

      .apply-desc {
        font-size: 24rpx;
        color: #666;
        display: block;
        white-space: nowrap;
      }
    }

    .apply-btn-fun {
      background: #b6f36b;
      color: #222;
      border-radius: 20rpx;
      font-size: 32rpx;
      font-weight: bold;
      padding: 20rpx 48rpx;
      margin-left: auto;
      box-shadow: 0 4rpx 12rpx 0 rgba(182, 243, 107, 0.3);
      border: none;
      min-width: 160rpx;
      height: 80rpx;
      line-height: 40rpx;
      transition: all 0.3s ease;

      &.centered {
        margin: 0 auto;
        display: block;
        width: fit-content;
      }

      &:active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 8rpx 0 rgba(182, 243, 107, 0.4);
      }
    }

    .rider-info-msg {
      text-align: center;
      max-width: 280rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .rider-congrats {
        font-size: 28rpx;
        color: #ff8c00;
        font-weight: 600;
        line-height: 1.3;
      }

      .rider-action {
        font-size: 32rpx;
        color: #67c23a;
        font-weight: bold;
        line-height: 1.4;
        white-space: nowrap;
        text-align: center;
        position: relative;

        &::after {
          content: "→";
          margin-left: 8rpx;
          font-size: 28rpx;
          color: #67c23a;
        }
      }
    }
  }
}

// 辅助类定义应在 uni.scss 中 (如果它们不在，你之前版本末尾的定义是好的)
// .rounded-lg { border-radius: $uni-border-radius-lg; }
// .rounded-circle { border-radius: $uni-border-radius-circle; }
// .shadow-base { box-shadow: $uni-shadow-base; }
.rider-tag {
  color: #409eff;
  font-size: 12px;
  margin-left: 4px;
}

.rider-info-msg {
  color: #67c23a;
  font-weight: bold;
  margin-left: 10px;
  text-align: center;

  .rider-congrats {
    color: #67c23a;
    font-weight: bold;
  }

  .rider-action {
    color: #909399;
    font-weight: 500;
    white-space: nowrap;
  }
}
</style>
