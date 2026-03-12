<template>
  <view class="messages-container page-container">
    <!-- 消息分类标签 -->
    <view class="message-tabs">
      <view
        v-for="tab in messageTabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view v-if="tab.count > 0" class="tab-badge-dot"></view>
      </view>
    </view>

    <!-- 消息列表 -->
    <view v-if="isLoading" class="loading-placeholder">
      <uni-load-more status="loading"></uni-load-more>
    </view>
    <view v-else-if="currentMessageList.length === 0" class="empty-placeholder">
      <text class="empty-icon">💬</text>
      <text class="empty-text">{{ getEmptyText() }}</text>
    </view>
    <view v-else class="messages-list">
      <view
        v-for="message in currentMessageList"
        :key="message.id"
        class="message-item"
        @click="handleMessageClick(message)"
      >
        <view class="message-avatar">
          <image
            :src="getMessageAvatar(message)"
            mode="aspectFill"
            class="avatar-image"
          ></image>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ getMessageTitle(message) }}</text>
          </view>
          <view class="message-preview">
            <text class="message-summary">{{
              getMessageSummary(message)
            }}</text>
          </view>
        </view>
        <view class="message-right">
          <view class="message-time-container">
            <view class="message-time">{{
              formatTime(getLatestMessageTime(message))
            }}</view>
            <view
              v-if="message.unreadCount > 0"
              class="unread-dot"
              :data-unread-count="message.unreadCount"
            ></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";
import simpleMessageBadge from "@/common/simpleMessageBadge.js";
import realtimeMessageManager from "@/common/realtimeMessageManager.js";

export default {
  data() {
    return {
      activeTab: "chat", // 默认显示聊天消息
      messageTabs: [
        { key: "chat", name: "聊天", count: 0 },
        { key: "system", name: "系统消息", count: 0 },
      ],
      allMessages: {
        chat: [],
        system: [],
      },
      isLoading: true,
      readMessages: new Set(), // 记录已读的消息ID
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.userInfo,
    }),
    currentMessageList() {
      return this.allMessages[this.activeTab] || [];
    },
  },
  onLoad() {
    // 从本地存储加载已读状态
    this.loadReadStatus();
    this.setupMessageBadge();
    // 获取消息数据，不标记为已读
    this.fetchAllMessages();
  },
  onShow() {
    // 页面显示时获取最新消息，不改变已读状态
    this.fetchAllMessages();
  },
  onUnload() {
    simpleMessageBadge.removeListener(this.updateBadges);
  },
  onPullDownRefresh() {
    this.fetchAllMessages().finally(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    // 切换消息分类
    switchTab(tabKey) {
      this.activeTab = tabKey;
      this.updateTabCounts();
    },

    // 获取所有类型的消息
    async fetchAllMessages() {
      this.isLoading = true;
      try {
        // 获取聊天消息
        console.log("messages.vue: 正在请求 /chats/user-messages API...");
        const taskResponse = await request({
          url: "/chats/user-messages",
          method: "GET",
        });
        console.log("messages.vue: /chats/user-messages 响应:", taskResponse);

        // 获取系统消息
        console.log("messages.vue: 正在请求 /users/system-messages API...");
        const systemResponse = await request({
          url: "/users/system-messages",
          method: "GET",
        });
        console.log(
          "messages.vue: /users/system-messages 响应:",
          systemResponse
        );

        // 处理聊天消息 - 从chat API获取所有消息，然后按任务分组
        if (taskResponse && Array.isArray(taskResponse.messages)) {
          // 清空聊天消息列表
          this.allMessages.chat = [];

          // 按消息ID分组消息
          const chatGroups = {};

          taskResponse.messages.forEach((msg) => {
            // 后端返回的是summary字段，我们需要映射为content字段
            const messageContent = msg.content || msg.summary;

            // 将summary字段映射为content字段，确保前端能正确获取
            if (msg.summary && !msg.content) {
              msg.content = msg.summary;
            }

            // 获取用户信息，尝试从多个字段获取
            const getUserName = () => {
              const userName =
                msg.otherUserName ||
                msg.senderName ||
                msg.receiverName ||
                msg.sender?.nickname ||
                msg.receiver?.nickname ||
                msg.sender?.name ||
                msg.receiver?.name;
              return userName;
            };

            const getUserAvatar = () => {
              return (
                msg.otherUserAvatar ||
                msg.senderAvatar ||
                msg.receiverAvatar ||
                msg.sender?.avatarUrl ||
                msg.receiver?.avatarUrl ||
                msg.sender?.avatar ||
                msg.receiver?.avatar
              );
            };

            // 根据数据库结构进行分组
            // 优先使用taskId，然后是campusResourceId，最后是senderId+receiverId组合
            let chatId;
            let chatType = "聊天";
            let chatTitle = "聊天";

            if (msg.taskId) {
              chatId = `task_${msg.taskId}`;
              chatType = "任务";
              // 对于任务消息，优先显示用户名，如果没有则显示任务类型
              const userName = getUserName();
              if (userName) {
                chatTitle = userName;
              } else {
                chatTitle = msg.taskType
                  ? `${msg.taskType}任务`
                  : `任务${msg.taskId}`;
              }
            } else if (msg.campusResourceId) {
              chatId = `partner_${msg.campusResourceId}`;
              chatType = "学习伙伴";
              // 对于学习伙伴消息，优先显示用户名
              const userName = getUserName();
              if (userName) {
                chatTitle = userName;
              } else {
                chatTitle = "学习伙伴";
              }
            } else if (msg.senderId && msg.receiverId) {
              // 基于发送者和接收者ID创建唯一标识
              chatId = `chat_${[msg.senderId, msg.receiverId]
                .sort()
                .join("_")}`;
              chatType = "聊天";
              // 对于用户聊天，显示用户名
              const userName = getUserName();
              if (userName) {
                chatTitle = userName;
              } else {
                chatTitle = "用户聊天";
              }
            } else {
              // 如果都没有，使用消息ID
              chatId = `msg_${msg.id}`;
              chatTitle = `聊天${msg.id}`;
            }

            if (!chatGroups[chatId]) {
              chatGroups[chatId] = {
                id: chatId,
                title: chatTitle,
                summary: messageContent || "暂无内容",
                createTime: msg.createTime,
                lastMessageTime: msg.createTime,
                unreadCount: 0, // 初始化为0，稍后计算
                messageCount: 0,
                type: "chat",
                lastMessage: "", // 初始化为空字符串，稍后填充
                messages: [],
                taskId: msg.taskId,
                campusResourceId: msg.campusResourceId,
                senderId: msg.senderId,
                receiverId: msg.receiverId,
                chatType: chatType,
                // 添加用户信息
                otherUserName: getUserName(),
                otherUserAvatar: getUserAvatar(),
              };
            }
            chatGroups[chatId].messages.push(msg);
            chatGroups[chatId].messageCount++;
            // 使用后端返回的unreadCount，它已经正确计算了发送者和接收者的关系
            if (msg.unreadCount > 0) {
              chatGroups[chatId].unreadCount += msg.unreadCount;
            }
          });

          // 确保每个分组都有正确的lastMessage - 按时间排序获取最新消息
          Object.values(chatGroups).forEach((group) => {
            if (group.messages && group.messages.length > 0) {
              // 按createdAt时间排序，最新的在前
              const sortedMessages = group.messages.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );

              // 取最新时间的消息作为lastMessage
              for (const msg of sortedMessages) {
                const content = msg.content || msg.summary;
                if (
                  content &&
                  content.trim() !== "" &&
                  !content.includes("未知")
                ) {
                  group.lastMessage = content;
                  // 不再需要设置lastMessageTime，直接使用getLatestMessageTime方法
                  break;
                }
              }

              // 如果还是没有找到，设置为默认值
              if (!group.lastMessage || group.lastMessage.trim() === "") {
                group.lastMessage = "新消息";
              }
            }
          });

          // 将分组后的消息添加到聊天分类中
          this.allMessages.chat = Object.values(chatGroups);
        }

        // 处理系统消息
        if (systemResponse && Array.isArray(systemResponse.messages)) {
          this.allMessages.system = systemResponse.messages.map((msg) => ({
            id: msg.id,
            type: "system",
            title: msg.title,
            summary: msg.summary || msg.content,
            content: msg.content,
            createTime: msg.createTime,
            unreadCount: msg.unreadCount,
            relatedId: msg.relatedId,
            relatedType: msg.relatedType,
            extraData: msg.extraData,
          }));
        } else {
          this.allMessages.system = [];
        }

        // 不在这里应用已读状态，只在点击具体消息时才标记为已读
        // 更新标签页红点数量
        this.updateTabCounts();

        // 强制更新视图
        this.$forceUpdate();
      } catch (error) {
        console.error("获取消息失败:", error);
        // 清空消息列表
        this.allMessages.chat = [];
        this.allMessages.system = [];
      } finally {
        this.isLoading = false;
      }
    },

    // 从本地存储加载已读状态
    loadReadStatus() {
      try {
        const readMessagesData = uni.getStorageSync("readMessages");
        if (readMessagesData) {
          this.readMessages = new Set(JSON.parse(readMessagesData));
        }
      } catch (error) {
        console.error("加载已读状态失败:", error);
        this.readMessages = new Set();
      }
    },

    // 保存已读状态到本地存储
    saveReadStatus() {
      try {
        const readMessagesArray = Array.from(this.readMessages);
        uni.setStorageSync("readMessages", JSON.stringify(readMessagesArray));
      } catch (error) {
        console.error("保存已读状态失败:", error);
      }
    },

    // 应用已读状态
    applyReadStatus() {
      // 对于聊天消息，遍历分组内的具体消息
      this.allMessages.chat.forEach((group) => {
        if (group.messages && Array.isArray(group.messages)) {
          group.messages.forEach((message) => {
            if (this.readMessages.has(message.id)) {
              message.unreadCount = 0;
            }
          });
          // 重新计算分组的未读数量
          group.unreadCount = group.messages.reduce(
            (sum, msg) => sum + (msg.unreadCount || 0),
            0
          );
        }
      });

      // 对于系统消息，直接处理消息对象
      this.allMessages.system.forEach((message) => {
        if (this.readMessages.has(message.id)) {
          message.unreadCount = 0;
        }
      });
    },

    // 更新标签页数量
    updateTabCounts() {
      this.messageTabs.forEach((tab) => {
        const messages = this.allMessages[tab.key] || [];

        // 对于聊天消息，直接使用分组的unreadCount
        let unreadCount = 0;
        if (tab.key === "chat") {
          unreadCount = messages.reduce(
            (sum, group) => sum + (group.unreadCount || 0),
            0
          );
        } else {
          // 对于系统消息，使用消息的unreadCount
          unreadCount = messages.reduce(
            (sum, msg) => sum + (msg.unreadCount || 0),
            0
          );
        }
        // 只有未读消息数量大于0时才显示红点
        tab.count = unreadCount > 0 ? unreadCount : 0;
      });
      // 强制更新视图
      this.$forceUpdate();
    },

    // 处理消息点击
    handleMessageClick(message) {
      switch (message.type) {
        case "chat":
          this.navigateToChat(message);
          break;
        case "system":
          this.showSystemMessage(message);
          break;
      }
    },

    // 跳转到聊天
    async navigateToChat(message) {
      // 标记当前消息为已读（消息栏红点消失）
      if (message.unreadCount > 0) {
        message.unreadCount = 0;
        // 记录已读的消息ID
        this.readMessages.add(message.id);
        // 保存已读状态到本地存储
        this.saveReadStatus();
        // 立即更新标签页红点数量
        this.updateTabCounts();
        // 强制更新视图
        this.$forceUpdate();

        // 用户点击具体消息后，标记消息中心为已查看（清除红点）
        // 注意：不要直接调用 enterMessageCenter()，因为 realtimeMessageManager 会覆盖状态
        // simpleMessageBadge.enterMessageCenter();
        try {
          // 根据消息类型构建请求数据，使用后端期望的格式
          let requestData = {};
          if (message.taskId) {
            requestData.type = "task";
            requestData.id = parseInt(message.taskId);
          } else if (message.campusResourceId) {
            requestData.type = "partner";
            requestData.id = parseInt(message.campusResourceId);
          } else if (message.senderId && message.receiverId) {
            // 对于用户聊天，使用chat类型标记已读
            requestData.type = "chat";
            requestData.id = `chat_${[message.senderId, message.receiverId]
              .sort()
              .join("_")}`;
            console.log("用户聊天标记已读:", requestData);
          } else {
            // 对于其他消息，暂时跳过后端标记已读，但前端红点已清除
            console.log("其他消息类型暂不支持后端标记已读，但前端红点已清除");
          }

          // 只有支持的消息类型才调用后端API
          if (requestData.type && requestData.id) {
            await request({
              url: "/chats/mark-read",
              method: "POST",
              data: requestData,
            });
          }
        } catch (error) {
          console.error("标记消息为已读失败:", error);
        }
      }

      // 跳转到聊天界面
      let chatUrl = `/pages/chat/chat?title=${encodeURIComponent(
        message.title
      )}`;

      if (message.taskId) {
        chatUrl += `&taskId=${message.taskId}`;
      } else if (message.campusResourceId) {
        chatUrl += `&campusResourceId=${message.campusResourceId}`;
      } else if (message.senderId && message.receiverId) {
        chatUrl += `&senderId=${message.senderId}&receiverId=${message.receiverId}`;
      } else {
        chatUrl += `&messageId=${message.id}`;
      }

      uni.navigateTo({ url: chatUrl });

      // 跳转后，延迟检查新消息状态，更新红点
      setTimeout(() => {
        realtimeMessageManager.checkNewMessages();
      }, 1000);
    },

    // 显示系统消息
    async showSystemMessage(message) {
      // 标记为已读
      if (message.unreadCount > 0) {
        message.unreadCount = 0;
        this.readMessages.add(message.id);
        this.saveReadStatus();
        this.updateTabCounts();
        this.$forceUpdate();

        // 调用后端API标记为已读
        try {
          await request({
            url: `/users/system-messages/${message.id}/read`,
            method: "PUT",
          });
        } catch (error) {
          console.error("标记系统消息已读失败:", error);
        }
      }

      // 显示消息详情
      uni.showModal({
        title: message.title,
        content: message.content || message.summary,
        showCancel: false,
        confirmText: "知道了",
      });
    },

    // 获取消息头像
    getMessageAvatar(message) {
      if (message.type === "system") {
        return "/static/icons/megaphone.png";
      }

      // 如果是任务消息，使用任务相关的头像
      if (message.type === "task") {
        // 从消息列表中获取第一条消息的头像信息
        if (message.messages && message.messages.length > 0) {
          const firstMsg = message.messages[0];
          return (
            firstMsg.senderAvatar ||
            firstMsg.otherUserAvatar ||
            "/static/images/default-avatar.png"
          );
        }
      }

      return message.otherUserAvatar || "/static/images/default-avatar.png";
    },

    // 获取消息标题
    getMessageTitle(message) {
      if (message.type === "system") {
        return "系统通知";
      }

      // 如果是任务消息，显示任务类型
      if (message.type === "task" && message.taskType) {
        const taskTypeMap = {
          express: "快递任务",
          food: "外卖任务",
          study: "学习任务",
          other: "其他任务",
          delivery: "配送任务",
          help: "帮忙任务",
          shopping: "购物任务",
          cleaning: "清洁任务",
          maintenance: "维修任务",
          transport: "运输任务",
        };

        // 如果有具体的任务描述，添加到标题中
        let title = taskTypeMap[message.taskType] || `${message.taskType}任务`;
        if (message.messages && message.messages.length > 0) {
          const firstMsg = message.messages[0];
          if (firstMsg.taskDescription) {
            title = `${title} - ${firstMsg.taskDescription}`;
          }
        }

        return title;
      }

      return message.title || message.otherUserName || "未知用户";
    },

    // 获取消息摘要
    getMessageSummary(message) {
      if (message.type === "chat") {
        // 聊天消息显示最新消息内容
        let lastMessage = message.lastMessage || "";

        // 如果lastMessage是URL，显示为"图片消息"
        if (lastMessage && lastMessage.startsWith("http")) {
          lastMessage = "图片消息";
        }

        // 如果lastMessage是JSON格式的位置信息，显示为"位置消息"
        if (
          lastMessage &&
          lastMessage.startsWith("{") &&
          lastMessage.includes("latitude")
        ) {
          try {
            const locationData = JSON.parse(lastMessage);
            lastMessage = `位置: ${locationData.name || "未知位置"}`;
          } catch (e) {
            lastMessage = "位置消息";
          }
        }

        // 如果还是没有内容，尝试从消息列表中获取
        if (
          (!lastMessage || lastMessage.trim() === "") &&
          message.messages &&
          message.messages.length > 0
        ) {
          // 从最新的消息开始查找有内容的消息
          for (let i = message.messages.length - 1; i >= 0; i--) {
            const msg = message.messages[i];
            if (msg.content && msg.content.trim() !== "") {
              lastMessage = msg.content;
              break;
            }
          }

          // 如果找到的消息是URL或位置信息，重新处理
          if (lastMessage && lastMessage.startsWith("http")) {
            lastMessage = "图片消息";
          } else if (
            lastMessage &&
            lastMessage.startsWith("{") &&
            lastMessage.includes("latitude")
          ) {
            try {
              const locationData = JSON.parse(lastMessage);
              lastMessage = `位置: ${locationData.name || "未知位置"}`;
            } catch (e) {
              lastMessage = "位置消息";
            }
          }
        }

        // 如果还是没有内容，显示默认值
        if (
          !lastMessage ||
          lastMessage.trim() === "" ||
          lastMessage.includes("未知")
        ) {
          lastMessage = "新消息";
        }

        return lastMessage;
      }

      const result = message.summary || message.lastMessage || "新消息";
      return result;
    },

    // 获取空状态文本
    getEmptyText() {
      const textMap = {
        chat: "暂无聊天记录",
        system: "暂无系统消息",
      };
      return textMap[this.activeTab] || "暂无消息";
    },

    // 获取最新消息时间
    getLatestMessageTime(message) {
      // 直接使用消息对象的createTime字段
      return message.createTime;
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) {
        return "刚刚";
      }
      try {
        const date = new Date(timestamp);

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return "刚刚";
        }

        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMinutes / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffMinutes < 1) return "刚刚";
        if (diffMinutes < 60) return `${diffMinutes}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;

        return `${date.getMonth() + 1}/${date.getDate()}`;
      } catch (error) {
        console.error("格式化时间错误:", error);
        return "刚刚";
      }
    },

    // 跳转到首页
    goToHome() {
      uni.switchTab({ url: "/pages/home/home" });
    },

    // 设置消息红点监听
    setupMessageBadge() {
      simpleMessageBadge.addListener(this.updateBadges);
    },

    // 更新红点数量
    updateBadges(unreadCounts) {
      console.log("消息中心收到红点更新通知:", unreadCounts);

      const isVisible = unreadCounts.total > 0;
      console.log("=== 消息中心页面红点位置 ===");
      console.log(
        "📱 消息中心页面 - 聊天标签：",
        isVisible ? "🔴 显示红点" : "⚪ 无红点"
      );
      console.log(
        "📱 消息中心页面 - 系统消息标签：",
        isVisible ? "🔴 显示红点" : "⚪ 无红点"
      );
      console.log(
        "📱 我的页面 - 消息中心按钮：",
        isVisible ? "🔴 显示红点" : "⚪ 无红点"
      );
      console.log(
        "📱 我的页面 - 消息栏文字：",
        isVisible ? "🔴 显示红点" : "⚪ 无红点"
      );
      console.log(
        "📱 底部导航栏 - 我的标签：",
        isVisible ? "🔴 显示红点" : "⚪ 无红点"
      );
      console.log("================================");

      // 使用本地计算的红点数量，确保点击后的状态能正确反映
      this.updateTabCounts();
      // 强制更新视图
      this.$forceUpdate();
      // 如果当前页面可见，获取最新消息数据
      if (this.$mp && this.$mp.page && this.$mp.page.route) {
        this.fetchAllMessages();
      }
    },

    // 标记所有消息为已读
    async markAllMessagesAsRead() {
      try {
        console.log("开始标记所有消息为已读");
        console.log("聊天消息数量:", this.allMessages.chat.length);
        console.log("系统消息数量:", this.allMessages.system.length);
        console.log("聊天消息详情:", this.allMessages.chat);
        console.log("系统消息详情:", this.allMessages.system);

        // 标记所有聊天消息为已读
        for (const message of this.allMessages.chat) {
          console.log("处理聊天消息:", message);
          if (message.unreadCount > 0) {
            console.log("发现未读聊天消息，unreadCount:", message.unreadCount);
            let requestData = {};
            if (message.taskId) {
              requestData.type = "task";
              requestData.id = parseInt(message.taskId);
            } else if (message.campusResourceId) {
              requestData.type = "partner";
              requestData.id = parseInt(message.campusResourceId);
            } else {
              // 对于用户聊天，暂时跳过
              console.log("跳过用户聊天消息");
              continue;
            }

            if (requestData.type && requestData.id) {
              try {
                await request({
                  url: "/chats/mark-read",
                  method: "POST",
                  data: requestData,
                });
                console.log(
                  `标记消息为已读: ${requestData.type}_${requestData.id}`
                );
              } catch (error) {
                console.error("标记消息为已读失败:", error);
              }
            }
          }
        }

        // 标记所有系统消息为已读
        for (const message of this.allMessages.system) {
          if (message.unreadCount > 0) {
            try {
              await request({
                url: `/users/system-messages/${message.id}/read`,
                method: "PUT",
              });
              console.log(`标记系统消息为已读: ${message.id}`);
            } catch (error) {
              console.error("标记系统消息为已读失败:", error);
            }
          }
        }

        // 重新获取消息数据
        this.fetchAllMessages();
      } catch (error) {
        console.error("标记所有消息为已读失败:", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: 0;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}

// 消息分类标签
.message-tabs {
  display: flex;
  background-color: $uni-bg-color;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24rpx 16rpx;
    position: relative;

    .tab-text {
      font-size: 28rpx;
      color: $uni-text-color-grey;
      margin-bottom: 8rpx;
    }

    .tab-badge-dot {
      position: absolute;
      top: 18rpx;
      right: 115rpx;
      width: 13rpx;
      height: 13rpx;
      background-color: $uni-color-error;
      border-radius: 50%;
    }

    &.active {
      .tab-text {
        color: $uni-color-primary;
        font-weight: bold;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: $uni-color-primary;
        border-radius: 2rpx;
      }
    }
  }
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-image {
    width: 250rpx;
    height: 250rpx;
    margin-bottom: $uni-spacing-row-lg;
  }

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-light;
    margin-bottom: $uni-spacing-row-lg * 2;
  }

  .go-home-btn {
    width: auto;
    padding: 0 $uni-spacing-col-lg * 2;
    font-size: 36rpx;
    height: 88rpx;
    line-height: 88rpx;
    min-width: 260rpx;
  }
}

.loading-placeholder {
  padding-top: 200rpx;
}

.messages-list {
  padding: $uni-spacing-col-base;

  .message-item {
    display: flex;
    align-items: center;
    padding: $uni-spacing-row-base $uni-spacing-col-base;
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
    margin-bottom: $uni-spacing-row-base;
    box-shadow: $uni-shadow-sm;
    position: relative;

    &:active {
      background-color: #f5f5f5;
    }
  }

  .message-avatar {
    margin-right: $uni-spacing-col-base;
    position: relative;

    .avatar-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: $uni-border-radius-circle;
      background-color: #eee;
    }
  }

  .message-content {
    flex: 1;
    min-width: 0;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $uni-spacing-row-sm;
  }

  .message-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
  }

  .message-time {
    font-size: $uni-font-size-base;
    color: $uni-text-color-light;
  }

  .message-preview {
    display: flex;
    align-items: center;
  }

  .message-summary {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .message-right {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .message-time-container {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .unread-dot {
    width: 15rpx;
    height: 15rpx;
    background-color: $uni-color-error;
    border-radius: 50%;
  }
}
</style>
