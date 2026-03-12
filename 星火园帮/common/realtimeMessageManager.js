// 内存优化的实时消息管理器
import request from "./request.js";
import simpleMessageBadge from "./simpleMessageBadge.js";

class RealtimeMessageManager {
  constructor() {
    this.isActive = false;
    this.pollingTimer = null;
    this.pollingInterval = 15000; // 15秒检查一次
    this.originalPollingInterval = 15000; // 保存原始间隔
    this.lastCheckTime = 0;
    this.errorCount = 0;
    this.listeners = [];
    this.consecutiveNetworkErrors = 0; // 连续网络错误次数
  }

  // 启动实时消息监听
  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.lastCheckTime = Date.now();
    this.errorCount = 0;
    this.hasShownExpiredDialog = false; // 防止重复弹窗
    this.startPolling();
  }

  // 停止实时消息监听
  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  // 显示token过期弹窗
  showTokenExpiredDialog() {
    // 防止重复弹窗
    if (this.hasShownExpiredDialog) {
      return;
    }
    this.hasShownExpiredDialog = true;

    uni.showModal({
      title: "登录已过期",
      content: "您的登录状态已过期，请重新登录",
      showCancel: false,
      confirmText: "重新登录",
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录信息
          uni.removeStorageSync("userAuthToken_xh");
          uni.removeStorageSync("userInfo_xh");

          // 跳转到登录页面
          uni.reLaunch({
            url: "/pages/login/login",
          });
        }
      },
      complete: () => {
        // 重置弹窗标记，允许下次过期时再次弹窗
        setTimeout(() => {
          this.hasShownExpiredDialog = false;
        }, 5000); // 5秒后重置
      },
    });
  }

  // 开始轮询
  startPolling() {
    if (!this.isActive) {
      return;
    }

    this.pollingTimer = setInterval(() => {
      this.checkNewMessages();
    }, this.pollingInterval);
  }

  // 检查新消息 - 内存优化版本
  async checkNewMessages() {
    if (!this.isActive) {
      return;
    }

    // 检查用户是否已登录
    const token = uni.getStorageSync("userAuthToken_xh");
    const userInfo = uni.getStorageSync("userInfo_xh");

    // 检查token和用户信息是否都存在
    if (
      !token ||
      !userInfo ||
      token === "" ||
      token === "null" ||
      token === "undefined"
    ) {
      console.log("用户未登录或token无效，跳过消息检查");
      return;
    }

    // 检查token格式是否正确
    if (typeof token !== "string" || token.length < 10) {
      console.log("token格式无效，跳过消息检查");
      return;
    }

    // 检查token是否过期（简单检查JWT格式）
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.log("token格式不正确，跳过消息检查");
        return;
      }

      // 解析payload检查过期时间
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.log("token已过期，提示用户重新登录");
        this.showTokenExpiredDialog();
        return;
      }
    } catch (error) {
      console.log("token解析失败，跳过消息检查:", error);
      return;
    }

    // 防止过于频繁的检查
    const now = Date.now();
    if (now - this.lastCheckTime < this.pollingInterval) {
      return;
    }

    this.lastCheckTime = now;

    try {
      // 优先使用轻量级API，只获取未读数量
      let unreadCount = 0;

      try {
        // 尝试使用新的轻量级API
        const response = await request({
          url: "/chats/user-messages-count",
          method: "GET",
        });

        if (response && typeof response.unreadCount === "number") {
          unreadCount = response.unreadCount;
        } else {
          throw new Error("轻量级API不可用");
        }
      } catch (error) {
        // 回退到原有API，但只计算未读数量，不存储消息内容
        const response = await request({
          url: "/chats/user-messages",
          method: "GET",
        });

        if (response && response.messages) {
          // 只计算未读数量，不创建消息数组
          // 注意：只统计当前用户作为接收者的未读消息
          for (const msg of response.messages) {
            // 使用 unreadCount 字段来判断，因为它已经过滤了接收者逻辑
            if (msg.unreadCount > 0) {
              unreadCount++;
            }
          }
        }
      }

      // 更新红点状态
      if (unreadCount > 0) {
        simpleMessageBadge.unreadCount = unreadCount;
        simpleMessageBadge.hasViewedMessageCenter = false;
      } else {
        simpleMessageBadge.unreadCount = 0;
        simpleMessageBadge.hasViewedMessageCenter = true;
      }

      simpleMessageBadge.saveToStorage();
      simpleMessageBadge.updateUI();

      // 网络恢复，重置错误计数和检查间隔
      if (this.consecutiveNetworkErrors > 0) {
        console.log("网络已恢复，重置检查间隔");
        this.consecutiveNetworkErrors = 0;
        this.pollingInterval = this.originalPollingInterval;
        this.errorCount = Math.max(0, this.errorCount - 2); // 网络恢复时减少错误计数
      }

      // 通知监听器
      this.notifyListeners({
        hasNewMessages: unreadCount > 0,
        unreadCounts: simpleMessageBadge.getUnreadCounts(),
        databaseUnreadCount: unreadCount,
        newMessages: [], // 暂时不传递新消息内容，只传递未读数量
      });
    } catch (error) {
      console.error("检查新消息失败:", error);
      this.errorCount++;

      // 区分不同类型的错误
      const isNetworkError =
        error.errMsg &&
        (error.errMsg.includes("request:fail") ||
          error.errMsg.includes("net::ERR_INTERNET_DISCONNECTED") ||
          error.errMsg.includes("net::ERR_NAME_NOT_RESOLVED"));

      // 如果是网络错误，增加检查间隔而不是停止监听
      if (isNetworkError) {
        this.consecutiveNetworkErrors++;
        console.log(
          `检测到网络错误 (${this.consecutiveNetworkErrors}次)，增加检查间隔`
        );
        this.pollingInterval = Math.min(this.pollingInterval * 1.2, 60000); // 最大60秒
        this.errorCount = Math.max(0, this.errorCount - 1); // 网络错误不累积

        // 重新启动轮询以应用新的间隔
        if (this.pollingTimer) {
          clearInterval(this.pollingTimer);
          this.startPolling();
        }
      } else {
        // 非网络错误，重置网络错误计数
        this.consecutiveNetworkErrors = 0;
      }

      // 只有在非网络错误且错误次数过多时才停止轮询
      if (!isNetworkError && this.errorCount >= 10) {
        console.error("错误次数过多，停止实时消息监听");
        this.stop();
      }
    }
  }

  // 通知所有监听器
  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("消息监听器执行失败:", error);
      }
    });
  }

  // 添加监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 移除监听器
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 手动检查新消息（用于测试）
  async forceCheck() {
    await this.checkNewMessages();
  }

  // 重置检查时间（用于避免重复处理）
  resetCheckTime() {
    this.lastCheckTime = 0;
  }

  // 获取当前状态
  getStatus() {
    return {
      isActive: this.isActive,
      errorCount: this.errorCount,
      lastCheckTime: this.lastCheckTime,
      pollingInterval: this.pollingInterval,
      originalPollingInterval: this.originalPollingInterval,
      consecutiveNetworkErrors: this.consecutiveNetworkErrors,
    };
  }
}

// 创建全局实例
const realtimeMessageManager = new RealtimeMessageManager();

export default realtimeMessageManager;
