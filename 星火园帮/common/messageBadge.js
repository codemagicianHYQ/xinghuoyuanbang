// 简化的消息红点提示管理工具
import request from "./request.js";

class MessageBadgeManager {
  constructor() {
    // 从本地存储加载未读数量，如果没有则初始化为0
    this.unreadCounts = uni.getStorageSync("unreadCounts") || {
      total: 0,
      chat: 0,
      system: 0,
    };
    this.listeners = [];
    // 从本地存储加载消息中心查看状态
    this.hasViewedMessageCenter =
      uni.getStorageSync("hasViewedMessageCenter") || false;
    this.autoRefreshTimer = null; // 自动刷新定时器
    this.isAutoRefreshEnabled = false; // 是否启用自动刷新
    this.lastFetchTime = 0; // 上次获取时间
    this.fetchCooldown = 10000; // 10秒冷却时间，避免频繁请求

    // 移除自动初始化，避免多个实例同时发起请求
    // setTimeout(() => {
    //   this.fetchUnreadCounts();
    // }, 100);
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

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.getUnreadCounts());
      } catch (error) {
        console.error("消息红点监听器执行失败:", error);
      }
    });
  }

  // 获取未读消息数量
  async fetchUnreadCounts(force = false) {
    // 如果用户已经查看过消息中心，直接返回当前数量，不重新获取
    if (this.hasViewedMessageCenter && !force) {
      console.log("用户已查看消息中心，返回当前未读数量:", this.unreadCounts);
      return this.unreadCounts;
    }

    // 检查频率限制
    const now = Date.now();
    if (!force && now - this.lastFetchTime < this.fetchCooldown) {
      console.log("fetchUnreadCounts 被跳过，频率限制中");
      return;
    }
    this.lastFetchTime = now;

    try {
      // 获取聊天消息
      const chatResponse = await request({
        url: "/chats/user-messages",
        method: "GET",
      });

      // 获取系统消息
      const systemResponse = await request({
        url: "/users/system-messages",
        method: "GET",
      });

      // 计算各类消息的未读数量
      let chatCount = 0;
      let systemCount = 0;

      // 处理聊天消息
      if (chatResponse && chatResponse.messages) {
        console.log("聊天消息响应:", chatResponse);
        // 按用户ID分组消息，统计未读数量
        const chatGroups = {};

        chatResponse.messages.forEach((msg) => {
          // 根据数据库结构进行分组统计
          let chatId;

          if (msg.taskId) {
            chatId = `task_${msg.taskId}`;
          } else if (msg.campusResourceId) {
            chatId = `partner_${msg.campusResourceId}`;
          } else if (msg.otherUserId) {
            // 处理getUserMessages返回的数据结构
            const currentUserId = uni.getStorageSync("userInfo")?.id;
            if (currentUserId) {
              chatId = `chat_${[currentUserId, msg.otherUserId]
                .sort()
                .join("_")}`;
            } else {
              chatId = `msg_${msg.id}`;
            }
          } else if (msg.senderId && msg.receiverId) {
            chatId = `chat_${[msg.senderId, msg.receiverId].sort().join("_")}`;
          } else {
            chatId = `msg_${msg.id}`;
          }

          if (!chatGroups[chatId]) {
            chatGroups[chatId] = { unreadCount: 0 };
          }
          // 只有真正未读的消息才计算
          if (msg.unreadCount > 0 || msg.isRead === 0) {
            // 优先使用msg.unreadCount，如果没有则根据isRead状态判断
            if (msg.unreadCount > 0) {
              chatGroups[chatId].unreadCount += msg.unreadCount;
            } else if (msg.isRead === 0) {
              chatGroups[chatId].unreadCount += 1;
            }
          }
        });

        // 统计未读消息的总数量
        chatCount = Object.values(chatGroups).reduce(
          (sum, group) => sum + group.unreadCount,
          0
        );
        console.log("聊天消息分组:", chatGroups);
        console.log("聊天消息未读数量:", chatCount);
      }

      // 处理系统消息
      if (systemResponse && systemResponse.messages) {
        systemCount = systemResponse.messages.reduce((sum, msg) => {
          return sum + (msg.unreadCount || 0);
        }, 0);
      }

      this.unreadCounts = {
        total: chatCount + systemCount,
        chat: chatCount,
        system: systemCount,
      };
      console.log("最终未读消息数量:", this.unreadCounts);

      // 保存未读数量到本地存储
      uni.setStorageSync("unreadCounts", this.unreadCounts);

      // 注意：不在这里重置hasViewedMessageCenter状态
      // 只有当用户主动查看消息中心时，才设置hasViewedMessageCenter = true
      // 只有当有新消息到达时，才重置hasViewedMessageCenter = false
      // 这里只更新未读消息数量，不改变查看状态

      this.notifyListeners();
      return this.unreadCounts;
    } catch (error) {
      console.error("获取未读消息数量失败:", error);
      // 如果是网络错误，不更新计数，保持当前状态
      if (error.statusCode === 502 || error.statusCode >= 500) {
        console.warn("服务器错误，保持当前消息计数状态");
      }
    }
    return this.unreadCounts;
  }

  // 获取当前未读数量
  getUnreadCounts() {
    // 简化逻辑：有新消息就显示红点，查看具体消息后红点消失
    console.log("返回未读消息数量:", this.unreadCounts);
    console.log("当前hasViewedMessageCenter状态:", this.hasViewedMessageCenter);
    return { ...this.unreadCounts };
  }

  // 标记用户已查看消息中心
  markMessageCenterAsViewed() {
    console.log("标记消息中心为已查看，清除所有未读消息");
    // 清除所有未读消息
    this.unreadCounts = {
      total: 0,
      chat: 0,
      system: 0,
    };
    this.hasViewedMessageCenter = true;
    // 保存到本地存储，确保状态持久化
    uni.setStorageSync("hasViewedMessageCenter", true);
    // 保存清零后的未读数量到本地存储
    uni.setStorageSync("unreadCounts", this.unreadCounts);
    this.notifyListeners();
  }

  // 重置消息中心查看状态（用于调试）
  resetMessageCenterViewed() {
    console.log("重置消息中心查看状态");
    this.hasViewedMessageCenter = false;
    uni.setStorageSync("hasViewedMessageCenter", false);
    this.notifyListeners();
  }

  // 强制显示红点（用于调试）
  forceShowRedDot() {
    console.log("强制显示红点");
    this.hasViewedMessageCenter = false;
    uni.setStorageSync("hasViewedMessageCenter", false);
    // 强制刷新未读计数
    this.fetchUnreadCounts();
  }

  // 处理新消息到达，重置查看状态让红点显示
  onNewMessageReceived() {
    console.log("收到新消息，重置查看状态让红点显示");
    console.log("重置前 hasViewedMessageCenter:", this.hasViewedMessageCenter);
    console.log("重置前 unreadCounts:", this.unreadCounts);

    // 收到新消息时，重置查看状态
    this.hasViewedMessageCenter = false;
    uni.setStorageSync("hasViewedMessageCenter", false);
    // 清除本地存储的未读数量，强制重新获取
    uni.removeStorageSync("unreadCounts");

    console.log("重置后 hasViewedMessageCenter:", this.hasViewedMessageCenter);
    console.log("开始强制刷新未读计数...");

    // 强制刷新未读计数，忽略频率限制
    this.fetchUnreadCounts(true);
  }

  // 标记消息为已读
  async markAsRead(type, id) {
    try {
      // 根据类型构建请求数据，使用后端期望的格式
      let requestData = {};
      let shouldCallAPI = true;

      if (type === "chat") {
        // 解析chatId来确定消息类型
        if (id.startsWith("task_")) {
          requestData.type = "task";
          requestData.id = parseInt(id.replace("task_", ""));
        } else if (id.startsWith("partner_")) {
          requestData.type = "partner";
          requestData.id = parseInt(id.replace("partner_", ""));
        } else if (id.startsWith("chat_")) {
          // 用户聊天暂不支持后端标记已读，但前端红点要清除
          console.log("用户聊天暂不支持后端标记已读，但前端红点已清除");
          shouldCallAPI = false;
        } else if (id.startsWith("msg_")) {
          // 其他消息类型暂不支持后端标记已读，但前端红点要清除
          console.log("其他消息类型暂不支持后端标记已读，但前端红点已清除");
          shouldCallAPI = false;
        }
      } else {
        requestData.type = type;
        requestData.id = parseInt(id);
      }

      // 调用后端API（如果支持）
      if (shouldCallAPI) {
        const response = await request({
          url: "/chats/mark-read",
          method: "POST",
          data: requestData,
        });

        if (response && response.success) {
          // 减少对应类型的未读数量
          if (this.unreadCounts[type] > 0) {
            this.unreadCounts[type]--;
          }
          this.updateTotalCount();
          this.notifyListeners();
        }
      } else {
        // 对于不支持后端标记已读的消息类型，仍然要更新前端红点状态
        // 减少对应类型的未读数量
        if (this.unreadCounts[type] > 0) {
          this.unreadCounts[type]--;
        }
        this.updateTotalCount();
        this.notifyListeners();
      }
    } catch (error) {
      console.error("标记消息为已读失败:", error);
    }
  }

  // 更新总计数
  updateTotalCount() {
    this.unreadCounts.total = this.unreadCounts.chat + this.unreadCounts.system;
  }

  // 启用自动刷新
  enableAutoRefresh() {
    if (this.isAutoRefreshEnabled) return;

    this.isAutoRefreshEnabled = true;
    // 每30秒自动刷新一次未读消息数量，避免频率限制
    this.autoRefreshTimer = setInterval(() => {
      this.fetchUnreadCounts();
    }, 30000);
    console.log("消息徽章自动刷新已启用");
  }

  // 禁用自动刷新
  disableAutoRefresh() {
    this.isAutoRefreshEnabled = false;
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
    console.log("消息徽章自动刷新已禁用");
  }

  // 重置所有计数
  reset() {
    this.unreadCounts = {
      total: 0,
      chat: 0,
      system: 0,
    };
    this.hasViewedMessageCenter = false;
    // 不自动禁用刷新，让调用方决定
    this.notifyListeners();
  }

  // 测试方法：手动触发新消息检测
  testNewMessageDetection() {
    console.log("手动触发新消息检测测试");
    this.onNewMessageReceived();
  }
}

// 创建全局实例
const messageBadgeManager = new MessageBadgeManager();

export default messageBadgeManager;
