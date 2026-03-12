// 极简消息红点管理工具
// 只保存两个核心状态，避免复杂的状态管理

class SimpleMessageBadge {
  constructor() {
    // 只保存两个核心状态
    this.unreadCount = 0; // 未读消息总数
    this.hasViewedMessageCenter = false; // 是否看过消息中心

    // 从本地存储加载状态
    this.loadFromStorage();

    // 监听器列表
    this.listeners = [];
  }

  // 从本地存储加载状态
  loadFromStorage() {
    const stored = uni.getStorageSync("simpleMessageBadge");
    if (stored) {
      this.unreadCount = stored.unreadCount || 0;
      this.hasViewedMessageCenter = stored.hasViewedMessageCenter || false;
    }
  }

  // 保存状态到本地存储
  saveToStorage() {
    const state = {
      unreadCount: this.unreadCount,
      hasViewedMessageCenter: this.hasViewedMessageCenter,
    };
    uni.setStorageSync("simpleMessageBadge", state);
  }

  // 新消息到来时
  onNewMessage() {
    this.unreadCount++;
    this.hasViewedMessageCenter = false; // 有新消息，重置"已查看"
    this.saveToStorage();
    this.updateUI();
  }

  // 用户进入消息中心时 - 简化逻辑：直接清除未读数量
  enterMessageCenter() {
    this.unreadCount = 0; // 直接清零
    this.hasViewedMessageCenter = true;
    this.saveToStorage();
    this.updateUI();
  }

  // UI 显示规则 - 简化逻辑：有未读消息就显示红点
  getBadgeCount() {
    const count = this.unreadCount;
    const isVisible = count > 0;
    return count;
  }

  // 更新UI
  updateUI() {
    const count = this.getBadgeCount();
    const isVisible = count > 0;

    // 通知所有监听器
    this.listeners.forEach((callback) => {
      try {
        callback({ total: count, chat: count, system: 0 });
      } catch (error) {
        console.error("消息红点监听器执行失败:", error);
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

  // 获取当前未读数量（兼容原有接口）
  getUnreadCounts() {
    const count = this.getBadgeCount();
    return {
      total: count,
      chat: count,
      system: 0,
    };
  }

  // 标记消息中心为已查看（兼容原有接口）
  markMessageCenterAsViewed() {
    this.enterMessageCenter();
  }

  // 处理新消息到达（兼容原有接口）
  onNewMessageReceived() {
    this.onNewMessage();
  }

  // 调试方法：手动增加未读数量
  addUnreadCount(count = 1) {
    console.log("手动增加未读数量:", count);
    this.unreadCount += count;
    this.hasViewedMessageCenter = false;
    this.saveToStorage();
    this.updateUI();
  }

  // 调试方法：重置状态
  reset() {
    this.unreadCount = 0;
    this.hasViewedMessageCenter = false;
    this.saveToStorage();
    this.updateUI();
  }

  // 调试方法：查看当前状态
  getState() {
    return {
      unreadCount: this.unreadCount,
      hasViewedMessageCenter: this.hasViewedMessageCenter,
      badgeCount: this.getBadgeCount(),
    };
  }

  // 调试方法：手动测试新消息
  testNewMessage() {
    this.onNewMessage();
  }

  // 调试方法：手动测试进入消息中心
  testEnterMessageCenter() {
    this.enterMessageCenter();
  }

  // 调试方法：强制同步数据库状态
  forceSyncWithDatabase(unreadCount) {
    this.unreadCount = unreadCount;
    this.hasViewedMessageCenter = unreadCount === 0;
    this.saveToStorage();
    this.updateUI();
  }
}

// 创建全局实例
const simpleMessageBadge = new SimpleMessageBadge();

export default simpleMessageBadge;
