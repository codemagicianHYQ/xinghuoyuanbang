<template>
  <view class="chat-page">
    <view class="chat-container">
      <!-- 任务状态横幅 -->
      <view class="task-banner" @click="viewTaskDetail" v-if="currentTask">
        <view class="task-info">
          <view class="task-type">{{
            currentTask.taskType || "快递代取"
          }}</view>
          <view class="task-status">
            <text class="status-text">{{
              getTaskStatusText(currentTask.status)
            }}</text>
            <text class="arrow-icon">></text>
          </view>
        </view>
      </view>

      <!-- 聊天消息列表 -->
      <view class="chat-messages-wrapper">
        <scroll-view
          class="chat-messages"
          scroll-y
          :scroll-top="scrollTop"
          @scroll="onScroll"
          :scroll-with-animation="true"
          :show-scrollbar="false"
          :enable-back-to-top="false"
          :bounces="false"
          :scroll-anchoring="true"
          :enhanced="false"
        >
          <view v-if="isLoading" class="loading-messages">
            <uni-load-more status="loading"></uni-load-more>
          </view>

          <view
            v-for="message in messages"
            :key="message.id"
            :id="`msg-${message.id || message.tempId}`"
            class="message-item"
            :class="{ 'message-mine': message.senderId === currentUserId }"
          >
            <view class="message-avatar">
              <image
                :src="getUserAvatar(message)"
                class="avatar"
                @error="handleAvatarError"
                mode="aspectFill"
              />
            </view>
            <view class="message-content">
              <view
                class="message-bubble"
                :class="{
                  'address-message': message.messageType === 'address',
                  'image-message': message.messageType === 'image',
                  'location-message': message.messageType === 'location',
                  'recall-message-bubble': message.messageType === 'recall',
                }"
                @longpress="onMessageLongPress(message)"
              >
                <!-- 文本消息 -->
                <text
                  class="message-text"
                  v-if="message.messageType === 'text' || !message.messageType"
                  >{{ message.content }}</text
                >

                <!-- 撤回消息 -->
                <view
                  v-else-if="message.messageType === 'recall'"
                  class="recall-message"
                >
                  <text class="recall-text">{{ message.content }}</text>
                </view>

                <!-- 地址消息 -->
                <view
                  v-else-if="message.messageType === 'address'"
                  class="address-content"
                >
                  <view class="address-text" style="color: inherit">{{
                    message.content
                  }}</view>
                </view>

                <!-- 图片消息 -->
                <view
                  v-else-if="message.messageType === 'image'"
                  class="image-content"
                >
                  <!-- 直接显示图片 -->
                  <image
                    v-if="message.content"
                    :src="message.content"
                    class="message-image"
                    mode="aspectFit"
                    @click="previewImage(message.content)"
                    @error="handleImageError"
                    @load="handleImageLoad"
                    @longpress="forceRefreshImage(message.id || message.tempId)"
                    :class="{ 'clickable-image': true }"
                    :data-url="message.content"
                    :data-message-id="message.id || message.tempId"
                    :data-message-type="message.messageType"
                  />

                  <!-- 如果图片加载失败，显示错误信息 -->
                  <view
                    v-if="!message.content"
                    style="
                      color: #ff6b6b;
                      font-size: 24rpx;
                      padding: 20rpx;
                      text-align: center;
                      background: #fff5f5;
                      border: 1rpx solid #ffebee;
                      border-radius: 8rpx;
                    "
                  >
                    ❌ 图片URL丢失
                  </view>
                </view>

                <!-- 位置消息 -->
                <view
                  v-else-if="message.messageType === 'location'"
                  class="location-content"
                >
                  <view class="location-info">
                    <view class="location-name">{{
                      getLocationName(message.content)
                    }}</view>
                    <view class="location-address">{{
                      getLocationAddress(message.content)
                    }}</view>
                  </view>
                  <view
                    class="location-action"
                    @click="openLocation(message.content)"
                  >
                    <uni-icons
                      type="location"
                      size="16"
                      color="#007AFF"
                    ></uni-icons>
                    <text class="location-action-text">查看位置</text>
                  </view>
                </view>
              </view>
              <view class="message-time">{{
                formatTime(message.createdAt)
              }}</view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 输入框区域 -->
      <view class="input-area">
        <!-- 任务完成状态提示 -->
        <view v-if="isTaskCompleted" class="task-completed-notice">
          <text class="notice-text">任务已完成，聊天关闭</text>
        </view>

        <!-- 正常输入框（任务未完成时显示） -->
        <view v-else class="input-container">
          <view class="input-row">
            <input
              v-model="inputMessage"
              class="message-input"
              placeholder="请输入内容..."
              :disabled="isSending"
              @confirm="handleConfirm"
              :adjust-position="true"
              :cursor-spacing="20"
            />
            <view class="input-actions">
              <view class="plus-btn" @click="toggleFunctionMenu">
                <text class="plus-icon">+</text>
              </view>
              <button
                class="send-btn"
                @click="sendMessage"
                :disabled="!inputMessage.trim() || isSending"
              >
                发送
              </button>
            </view>
          </view>

          <!-- 功能菜单 -->
          <view
            class="function-menu"
            v-if="showFunctionMenu && !isTaskCompleted"
          >
            <view class="function-item" @click="chooseImage">
              <view class="function-icon">
                <text class="icon-text">🖼️</text>
              </view>
              <text class="function-text">相册</text>
            </view>
            <view class="function-item" @click="takePhoto">
              <view class="function-icon">
                <text class="icon-text">📸</text>
              </view>
              <text class="function-text">拍照</text>
            </view>
            <view class="function-item" @click="chooseLocation">
              <view class="function-icon">
                <text class="icon-text">📍</text>
              </view>
              <text class="function-text">位置</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 校园论坛聊天：活泼校园化界面 -->
      <view
        class="campus-interact-chat-footer"
        v-if="campusResourceId && !taskId"
      >
        <view class="campus-chat-container">
          <!-- 活动信息卡片 -->
          <view class="activity-card">
            <view class="activity-icon">🎯</view>
            <view class="activity-info">
              <text class="activity-title">{{ chatTitle }}</text>
              <text class="activity-subtitle">一起寻找志同道合的伙伴</text>
            </view>
          </view>

          <!-- 互动按钮 -->
          <view class="interaction-buttons">
            <view class="interaction-btn primary" @click="shareActivity">
              <text class="btn-icon">📢</text>
              <text class="btn-text">分享活动</text>
            </view>
            <view class="interaction-btn secondary" @click="viewActivityDetail">
              <text class="btn-icon">📋</text>
              <text class="btn-text">查看详情</text>
            </view>
          </view>

          <!-- 校园元素装饰 -->
          <view class="campus-decoration">
            <text class="decoration-text">✨ 星火园帮 ✨</text>
          </view>

          <!-- 输入框区域 -->
          <view class="input-container">
            <view class="input-row">
              <input
                v-model="inputMessage"
                class="message-input"
                placeholder="请输入内容..."
                :disabled="isSending"
                @confirm="handleConfirm"
                :adjust-position="true"
                :cursor-spacing="20"
              />
              <view class="input-actions">
                <view class="plus-btn" @click="toggleFunctionMenu">
                  <text class="plus-icon">+</text>
                </view>
                <button
                  class="send-btn"
                  @click="sendMessage"
                  :disabled="!inputMessage.trim() || isSending"
                >
                  发送
                </button>
              </view>
            </view>

            <!-- 功能菜单 -->
            <view class="function-menu" v-if="showFunctionMenu">
              <view class="function-item" @click="chooseImage">
                <view class="function-icon">
                  <text class="icon-text">🖼️</text>
                </view>
                <text class="function-text">相册</text>
              </view>
              <view class="function-item" @click="takePhoto">
                <view class="function-icon">
                  <text class="icon-text">📸</text>
                </view>
                <text class="function-text">拍照</text>
              </view>
              <view class="function-item" @click="chooseLocation">
                <view class="function-icon">
                  <text class="icon-text">📍</text>
                </view>
                <text class="function-text">位置</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 长按消息菜单 -->
    <view
      class="message-context-menu"
      v-if="showMessageMenu"
      @click="hideMessageMenu"
    >
      <view class="menu-content" @click.stop="">
        <view
          class="menu-item"
          @click="copyMessage"
          v-if="selectedMessage && selectedMessage.messageType === 'text'"
        >
          <text class="menu-text">复制</text>
        </view>
        <view
          class="menu-item"
          @click="recallMessage"
          v-if="canRecallMessage(selectedMessage)"
        >
          <text class="menu-text">撤回</text>
        </view>
        <view class="menu-item" @click="hideMessageMenu">
          <text class="menu-text">取消</text>
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
      taskId: null,
      campusResourceId: null,
      otherUserId: null,
      chatTitle: "聊天",
      messages: [],
      inputMessage: "",
      isSending: false,
      isLoading: false,
      scrollTop: 9999999,
      currentPage: 1,
      hasMore: true,
      pollingTimer: null,
      lastMessageId: 0,
      isPageActive: true,
      pollingErrorCount: 0,
      // 新增功能相关状态
      isUploading: false,
      uploadProgress: 0,
      currentTask: null,
      showFunctionMenu: false,
      userAtBottom: true, // 用户是否在聊天底部
      isTaskCompleted: false, // 任务是否已完成
      // 长按消息菜单相关状态
      showMessageMenu: false,
      selectedMessage: null, // 当前选中的消息
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    currentUserId() {
      const userId = this.userInfo && this.userInfo.id;
      return userId;
    },
  },
  onLoad(options) {
    // 兼容任务聊天、学习伙伴聊天与二手市集聊天
    const normalize = (v) =>
      v && v !== "null" && v !== "undefined" ? v : null;
    this.taskId = normalize(options.taskId);
    this.campusResourceId = normalize(options.campusResourceId);
    this.otherUserId = options.otherUserId || options.receiverId;
    // 修复URL解码问题
    this.chatTitle = options.title ? decodeURIComponent(options.title) : "聊天";

    console.log("=== 聊天页面开始加载 ===");
    console.log("聊天页面加载参数:", {
      taskId: this.taskId,
      campusResourceId: this.campusResourceId,
      otherUserId: this.otherUserId,
      chatTitle: this.chatTitle,
    });

    if (this.taskId || this.findPartnerId || this.otherUserId) {
      // 立即设置滚动位置到底部
      this.scrollTop = 9999999;

      this.loadMessages().then(() => {
        // 消息加载完成后，确保滚动到底部
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 500);
          // 再次确保滚动到底部
          setTimeout(() => {
            this.scrollToBottom();
          }, 1000);
        });

        // 消息加载完成后，标记消息为已读
        console.log("准备调用markMessagesAsRead方法");
        this.markMessagesAsRead().then(() => {
          // 标记完成后，触发实时消息管理器重新检查，更新红点状态
          console.log("消息标记为已读完成，触发重新检查");
          setTimeout(() => {
            realtimeMessageManager.checkNewMessages();
          }, 1000);
        });
      });
      // 禁用chat.vue的轮询，统一使用realtimeMessageManager
      // this.startMessagePolling();
      // 添加实时消息监听
      realtimeMessageManager.addListener(this.onRealtimeMessage);
      // 获取任务信息
      if (this.taskId) {
        this.loadTaskInfo();
      }
      // 启用消息徽章自动刷新（极简版本不需要自动刷新）
      console.log("极简消息红点管理器已启用");
    } else {
      console.error("关联ID不存在，无法加载聊天");
      uni.showToast({
        title: "关联ID不存在",
        icon: "none",
      });
    }
  },
  onShow() {
    // 页面显示时恢复轮询，但不重新加载消息
    this.isPageActive = true;
    this.pollingErrorCount = 0;
    // 禁用chat.vue的轮询，统一使用realtimeMessageManager
    // if (!this.pollingTimer && this.taskId) {
    //   this.startMessagePolling();
    // }

    // 监听键盘事件
    this.setupKeyboardListeners();

    // 只在任务状态可能发生变化时才重新加载任务信息
    // 避免频繁请求导致429错误
    if (this.taskId && !this.currentTask) {
      this.loadTaskInfo();
    }

    // 页面显示时滚动到最新消息
    if (this.messages.length > 0) {
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToBottom();
        }, 300);
      });
    }

    // 检查是否有临时保存的地址内容
    const tempAddressContent = uni.getStorageSync("tempAddressContent");
    if (tempAddressContent) {
      this.inputMessage = tempAddressContent;
      uni.removeStorageSync("tempAddressContent");
    }

    // 检查是否有从地址选择页面返回的地址（参考快递平台页面的逻辑）
    const selectedAddress = uni.getStorageSync("selectedAddress");
    if (selectedAddress) {
      this.inputMessage = `我的地址：${selectedAddress}`;
      uni.removeStorageSync("selectedAddress");
    }
  },

  onHide() {
    // 页面隐藏时停止轮询
    this.isPageActive = false;
    this.stopMessagePolling();

    // 移除键盘监听
    this.removeKeyboardListeners();
  },

  onUnload() {
    this.stopMessagePolling();
    // 移除实时消息监听
    realtimeMessageManager.removeListener(this.onRealtimeMessage);
    // 禁用消息徽章自动刷新（极简版本不需要）
    console.log("极简消息红点管理器已禁用");
  },

  methods: {
    async loadMessages() {
      this.isLoading = true;
      try {
        const params = { page: this.currentPage, limit: 50 };
        // 按用户ID加载消息，而不是按任务ID
        if (this.otherUserId) {
          params.otherUserId = this.otherUserId;
        } else if (this.taskId) {
          params.taskId = this.taskId;
        } else if (this.findPartnerId) {
          params.findPartnerId = this.findPartnerId;
        }
        const res = await request({
          url: `/chats/messages`,
          method: "GET",
          data: params,
        });

        if (res && res.messages) {
          console.log("加载消息成功，数量:", res.messages.length);

          if (this.currentPage === 1) {
            this.messages = res.messages.reverse();
            // 设置最后消息ID，用于轮询新消息
            if (this.messages.length > 0) {
              this.lastMessageId = Math.max(
                ...this.messages.map((msg) => msg.id)
              );
            }
            // 首次加载完成后滚动到底部
            this.$nextTick(() => {
              setTimeout(() => {
                this.scrollToBottom();
              }, 300);
              // 再次确保滚动到底部
              setTimeout(() => {
                this.scrollToBottom();
              }, 600);
            });
          } else {
            this.messages = [...res.messages.reverse(), ...this.messages];
          }

          this.hasMore = res.messages.length === 50;
        }
      } catch (e) {
        console.error("加载消息失败:", e);
        // 如果是第一次加载失败，显示友好提示
        if (this.currentPage === 1) {
          uni.showModal({
            title: "连接失败",
            content: "无法加载聊天记录，请检查网络连接后重试",
            showCancel: false,
            confirmText: "重试",
            success: () => {
              this.loadMessages();
            },
          });
        } else {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      } finally {
        this.isLoading = false;
      }
    },

    // 添加新方法：刷新最新消息（不重置分页）
    async refreshLatestMessages() {
      try {
        const params = { page: 1, limit: 20 };
        if (this.taskId) params.taskId = this.taskId;
        if (this.campusResourceId)
          params.campusResourceId = this.campusResourceId;
        const res = await request({
          url: `/chats/messages`,
          method: "GET",
          data: params,
        });

        if (res && res.messages) {
          const newMessages = res.messages.reverse();
          // 只更新消息列表，不重置分页状态
          this.messages = newMessages;
          // 更新最后消息ID
          if (this.messages.length > 0) {
            this.lastMessageId = Math.max(
              ...this.messages.map((msg) => msg.id)
            );
          }
          this.hasMore = res.messages.length === 20;
        }
      } catch (e) {
        console.error("刷新最新消息失败:", e);
      }
    },

    // 选择相册图片
    chooseImage() {
      console.log("chooseImage 方法被调用");
      this.showFunctionMenu = false;
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: (res) => {
          console.log("选择图片成功:", res);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.compressAndUploadImage(res.tempFilePaths[0]);
          } else {
            console.error("没有获取到图片路径");
            uni.showToast({
              title: "获取图片失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          // 检查是否是用户取消了选择
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            uni.showToast({
              title: "选择图片失败",
              icon: "none",
            });
          }
        },
      });
    },

    // 拍照
    takePhoto() {
      console.log("takePhoto 方法被调用");
      this.showFunctionMenu = false;
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: (res) => {
          console.log("拍照成功:", res);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            this.compressAndUploadImage(res.tempFilePaths[0]);
          } else {
            console.error("没有获取到图片路径");
            uni.showToast({
              title: "获取图片失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("拍照失败:", err);
          // 检查是否是用户取消了拍照
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了拍照");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            uni.showToast({
              title: "拍照失败",
              icon: "none",
            });
          }
        },
      });
    },

    // 选择位置
    chooseLocation() {
      this.showFunctionMenu = false;
      uni.chooseLocation({
        success: (res) => {
          this.sendLocationMessage(res);
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            console.error("选择位置失败:", err);
            if (err.errMsg.includes("auth deny")) {
              uni.showModal({
                title: "位置权限被拒绝",
                content: "请在设置中开启位置权限，以便发送位置信息",
                showCancel: false,
                confirmText: "知道了",
              });
            } else {
              uni.showToast({
                title: "选择位置失败",
                icon: "none",
              });
            }
          }
        },
      });
    },

    // 上传图片
    async uploadImage(filePath) {
      console.log("uploadImage 方法被调用，文件路径:", filePath);

      if (this.isUploading) {
        console.log("正在上传中，跳过本次上传");
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;

      try {
        // 显示上传进度
        uni.showLoading({
          title: "上传中...",
          mask: true,
        });

        console.log("开始上传图片到服务器");

        // 上传图片到服务器
        const uploadResult = await new Promise((resolve, reject) => {
          // 获取用户token
          const token = uni.getStorageSync("userToken");
          const headers = {};
          if (token) {
            headers.token = token;
          }

          console.log("上传请求头:", headers);
          console.log(
            "上传URL: https://xinghuoyuanbang.top/campushelper/api/v1/upload/chat"
          );

          const uploadTask = uni.uploadFile({
            url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/chat",
            filePath: filePath,
            name: "file",
            formData: {},
            header: headers,
            success: (res) => {
              console.log("上传成功，响应:", res);
              resolve(res);
            },
            fail: (err) => {
              console.error("上传失败:", err);
              reject(new Error(err.errMsg || "上传失败"));
            },
          });

          // 监听上传进度
          uploadTask.onProgressUpdate((res) => {
            console.log("上传进度:", res.progress + "%");
            this.uploadProgress = res.progress;
          });
        });

        console.log("上传完成，检查响应状态");

        // 检查响应状态
        if (uploadResult.statusCode !== 200) {
          throw new Error(`上传失败，状态码: ${uploadResult.statusCode}`);
        }

        // 检查响应数据
        if (!uploadResult.data) {
          throw new Error("服务器没有返回数据");
        }

        console.log("服务器返回数据:", uploadResult.data);

        // 解析上传结果
        let result;
        try {
          result = JSON.parse(uploadResult.data);
          console.log("解析后的结果:", result);
        } catch (parseError) {
          console.error("解析响应数据失败:", parseError);
          throw new Error("服务器响应格式错误");
        }

        // 处理不同的响应格式
        let imageUrl = null;
        if (result && result.url) {
          // 直接返回URL的格式
          imageUrl = result.url;
        } else if (result && result.data && result.data.url) {
          // 嵌套在data中的格式
          imageUrl = result.data.url;
        } else if (result && result.success && result.data && result.data.url) {
          // 完整的成功响应格式
          imageUrl = result.data.url;
        }

        if (imageUrl) {
          console.log("上传成功，图片URL:", imageUrl);
          // 发送图片消息
          await this.sendImageMessage(imageUrl);
        } else {
          console.error("上传结果中没有URL:", result);
          throw new Error(result?.message || "上传失败");
        }
      } catch (error) {
        console.error("上传图片失败:", error);
        // 显示错误提示
        uni.showToast({
          title: `上传失败: ${error.message}`,
          icon: "none",
          duration: 3000,
        });
      } finally {
        // 确保状态重置和loading隐藏
        this.isUploading = false;
        this.uploadProgress = 0;

        // 安全地隐藏loading
        try {
          uni.hideLoading();
        } catch (hideError) {
          console.warn("隐藏loading失败:", hideError);
        }
      }
    },

    // 发送图片消息
    async sendImageMessage(imageUrl) {
      try {
        console.log("sendImageMessage 方法被调用，图片URL:", imageUrl);

        // 创建临时图片消息
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const tempMessage = {
          id: tempId,
          content: imageUrl,
          messageType: "image",
          senderId: this.currentUserId,
          receiverId: this.otherUserId,
          createdAt: new Date().toISOString(),
          isTemp: true,
          tempId: tempId,
        };

        console.log("创建临时消息:", tempMessage);

        // 立即显示
        this.messages.push(tempMessage);
        this.scrollToBottomImmediate();

        // 发送到后端
        const messageData = {
          receiverId: this.otherUserId,
          content: imageUrl,
          messageType: "image",
        };

        // 如果有当前任务，关联到任务；否则按用户ID发送
        if (this.currentTask && this.currentTask.id) {
          messageData.taskId = this.currentTask.id;
        } else if (this.taskId) {
          messageData.taskId = this.taskId;
        } else if (this.campusResourceId) {
          messageData.campusResourceId = this.campusResourceId;
        }

        console.log("发送消息数据:", messageData);

        const res = await request({
          url: "/chats/send",
          method: "POST",
          data: messageData,
        });

        console.log("发送图片消息的响应:", res);

        // 如果后端返回了消息，替换临时消息
        if (res && res.message) {
          console.log("后端返回的消息:", res.message);
          console.log("消息内容:", res.message.content);
          console.log("消息类型:", res.message.messageType);

          const index = this.messages.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            console.log("找到临时消息，索引:", index);

            // 确保后端返回的消息有有效的内容
            if (res.message.content && res.message.content.trim()) {
              this.messages[index] = res.message;
            } else {
              console.log("后端返回的消息内容为空，保持临时消息");
              this.messages[index].isTemp = false;
            }
          } else {
            console.log("未找到临时消息");
          }
        } else {
          // 后端没有返回消息，保持临时消息
          console.log("后端没有返回消息，保持临时消息");
          const index = this.messages.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            this.messages[index].isTemp = false;
          }
        }

        // 强制更新视图
        this.$forceUpdate();

        // 确保消息发送后滚动到底部
        this.$nextTick(() => {
          this.scrollToBottomImmediate();
        });

        console.log("图片消息发送完成");
      } catch (error) {
        console.error("发送图片消息失败:", error);
        // 发送失败，移除临时消息
        this.messages = this.messages.filter((msg) => !msg.isTemp);
        uni.showToast({
          title: "发送失败",
          icon: "none",
        });
      }
    },

    // 发送位置消息
    async sendLocationMessage(locationInfo) {
      try {
        const locationContent = JSON.stringify({
          name: locationInfo.name,
          address: locationInfo.address,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
        });

        // 创建临时位置消息，立即显示
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const tempMessage = {
          id: tempId,
          content: locationContent,
          messageType: "location",
          senderId: this.currentUserId,
          receiverId: this.otherUserId,
          createdAt: new Date().toISOString(),
          isTemp: true,
          tempId: tempId,
        };

        // 立即显示
        this.messages.push(tempMessage);
        this.scrollToBottomImmediate();

        const messageData = {
          receiverId: this.otherUserId,
          content: locationContent,
          messageType: "location",
        };

        // 如果有当前任务，关联到任务；否则按用户ID发送
        if (this.currentTask && this.currentTask.id) {
          messageData.taskId = this.currentTask.id;
        } else if (this.taskId) {
          messageData.taskId = this.taskId;
        } else if (this.campusResourceId) {
          messageData.campusResourceId = this.campusResourceId;
        }

        const res = await request({
          url: "/chats/send",
          method: "POST",
          data: messageData,
        });

        console.log("发送图片消息的响应:", res);

        // 如果后端返回了消息，替换临时消息
        if (res && res.message) {
          console.log("后端返回的消息:", res.message);
          console.log("消息内容:", res.message.content);
          console.log("消息类型:", res.message.messageType);

          const index = this.messages.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            console.log("找到临时消息，索引:", index);

            // 确保后端返回的消息有有效的内容
            if (res.message.content && res.message.content.trim()) {
              this.messages[index] = res.message;
            } else {
              console.log("后端返回的消息内容为空，保持临时消息");
              this.messages[index].isTemp = false;
            }
          } else {
            console.log("未找到临时消息");
          }
        } else {
          // 后端没有返回消息，保持临时消息
          console.log("后端没有返回消息，保持临时消息");
          const index = this.messages.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            this.messages[index].isTemp = false;
          }
        }

        // 强制更新视图
        this.$forceUpdate();

        // 确保消息发送后滚动到底部
        this.$nextTick(() => {
          this.scrollToBottomImmediate();
        });
      } catch (error) {
        console.error("发送位置消息失败:", error);
        // 发送失败，移除临时消息
        this.messages = this.messages.filter((msg) => !msg.isTemp);
        uni.showToast({
          title: "发送失败",
          icon: "none",
        });
      }
    },

    // 预览图片
    previewImage(imageUrl) {
      // 获取聊天中所有的图片消息
      const imageMessages = this.messages.filter(
        (msg) => msg.messageType === "image" && msg.content
      );

      if (imageMessages.length === 0) {
        uni.showToast({
          title: "没有可预览的图片",
          icon: "none",
        });
        return;
      }

      // 提取所有图片URL
      const imageUrls = imageMessages.map((msg) => msg.content);

      // 找到当前点击的图片在数组中的位置
      const currentIndex = imageUrls.indexOf(imageUrl);

      uni.previewImage({
        urls: imageUrls,
        current: currentIndex >= 0 ? currentIndex : 0,
        // 微信小程序不支持 loop 和 indicator 选项，已移除
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function (data) {
            console.log("选中了第" + (data.tapIndex + 1) + "个按钮");
          },
          fail: function (err) {
            console.log(err.errMsg);
          },
        },
      });
    },

    // 处理图片加载错误
    handleImageError(e) {
      console.error("图片加载失败:", e);

      // 尝试从多个来源获取图片URL
      let imageUrl = null;
      let messageId = null;

      if (e.target && e.target.src) {
        imageUrl = e.target.src;
      } else if (e.target && e.target.dataset && e.target.dataset.url) {
        imageUrl = e.target.dataset.url;
      } else {
        // 尝试从消息对象中获取URL
        if (e.target && e.target.dataset && e.target.dataset.messageId) {
          messageId = e.target.dataset.messageId;
          const message = this.messages.find(
            (msg) => (msg.id || msg.tempId) === messageId
          );
          if (message && message.content) {
            imageUrl = message.content;
          }
        }
      }

      if (imageUrl) {
        // 测试图片URL是否可以访问
        this.testImageUrl(imageUrl);
      }

      uni.showToast({
        title: "图片加载失败",
        icon: "none",
        duration: 3000,
      });
    },

    // 测试图片URL是否可以访问
    testImageUrl(url) {
      uni.request({
        url: url,
        method: "HEAD",
        success: (res) => {
          console.log("图片URL测试成功:", res.statusCode);
        },
        fail: (err) => {
          console.error("图片URL测试失败:", err.errMsg);
        },
      });
    },

    // 强制刷新图片
    forceRefreshImage(messageId) {
      // 找到对应的消息
      const messageIndex = this.messages.findIndex(
        (msg) => msg.id === messageId || msg.tempId === messageId
      );
      if (messageIndex !== -1) {
        const message = this.messages[messageIndex];

        if (message.content && message.messageType === "image") {
          // 强制更新图片URL，添加时间戳参数
          const originalUrl = message.content;
          const separator = originalUrl.includes("?") ? "&" : "?";
          const newUrl = `${originalUrl}${separator}t=${Date.now()}`;

          // 更新消息内容
          this.messages[messageIndex].content = newUrl;

          // 强制更新视图
          this.$forceUpdate();
        }
      }
    },

    // 获取位置名称
    getLocationName(locationContent) {
      try {
        const location = JSON.parse(locationContent);
        return location.name || "未知位置";
      } catch (error) {
        return "未知位置";
      }
    },

    // 获取位置地址
    getLocationAddress(locationContent) {
      try {
        const location = JSON.parse(locationContent);
        return location.address || "地址未知";
      } catch (error) {
        return "地址未知";
      }
    },

    // 打开位置
    openLocation(locationContent) {
      try {
        const location = JSON.parse(locationContent);
        uni.openLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address,
          scale: 18,
        });
      } catch (error) {
        console.error("打开位置失败:", error);
        uni.showToast({
          title: "打开位置失败",
          icon: "none",
        });
      }
    },

    // 处理回车确认，防止重复发送
    handleConfirm() {
      // 如果正在发送中，忽略回车确认
      if (this.isSending) return;
      this.sendMessage();
    },

    // 压缩并上传图片
    async compressAndUploadImage(filePath) {
      console.log("compressAndUploadImage 方法被调用，文件路径:", filePath);
      try {
        // 显示压缩中提示
        uni.showLoading({
          title: "压缩图片中...",
          mask: true,
        });

        // 使用微信小程序原生的图片压缩
        const compressedPath = await this.compressImage(filePath);
        console.log("图片压缩完成，压缩后路径:", compressedPath);

        // 隐藏loading
        uni.hideLoading();

        // 上传压缩后的图片
        await this.uploadImage(compressedPath);
      } catch (error) {
        uni.hideLoading();
        console.error("图片压缩失败:", error);
        // 如果压缩失败，直接上传原图
        console.log("压缩失败，尝试上传原图:", filePath);
        await this.uploadImage(filePath);
      }
    },

    // 压缩图片 - 使用微信小程序原生API
    compressImage(filePath) {
      return new Promise((resolve, reject) => {
        // 使用uni.compressImage进行压缩
        uni.compressImage({
          src: filePath,
          quality: 80, // 压缩质量80%
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (err) => {
            console.error("压缩失败，使用原图:", err);
            // 压缩失败时返回原图路径
            resolve(filePath);
          },
        });
      });
    },

    // 图片加载成功
    handleImageLoad(e) {
      // 微信小程序中e.target.src可能为undefined，尝试从多个来源获取URL
      let imageUrl = null;
      let messageId = null;

      if (e.target && e.target.src) {
        imageUrl = e.target.src;
      } else if (e.target && e.target.dataset && e.target.dataset.url) {
        imageUrl = e.target.dataset.url;
      } else {
        // 尝试从消息对象中获取URL
        if (e.target && e.target.dataset && e.target.dataset.messageId) {
          messageId = e.target.dataset.messageId;
          const message = this.messages.find(
            (msg) => (msg.id || msg.tempId) === messageId
          );
          if (message && message.content) {
            imageUrl = message.content;
          }
        }
      }

      // 验证URL是否有效
      if (imageUrl && !this.isValidImageUrl(imageUrl)) {
        console.warn("图片URL格式可能有问题:", imageUrl);
      }
    },

    // 验证图片URL是否有效
    isValidImageUrl(url) {
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return false;
      }

      // 微信小程序环境中的简单URL验证
      return (
        url.startsWith("https://") &&
        (url.includes("xinghuoyuanbang") || url.includes("files"))
      );
    },

    // 图片加载失败
    handleImageError(e) {
      console.error("图片加载失败:", e);
      console.error("图片URL:", e.target.src);
      uni.showToast({
        title: "图片加载失败",
        icon: "none",
      });
    },

    async sendMessage() {
      if (!this.inputMessage.trim() || this.isSending) return;

      // 防止重复发送相同内容
      const messageContent = this.inputMessage.trim();
      const recentMessage = this.messages[this.messages.length - 1];
      if (
        recentMessage &&
        recentMessage.content === messageContent &&
        recentMessage.senderId === this.currentUserId &&
        Date.now() - new Date(recentMessage.createdAt).getTime() < 3000
      ) {
        console.log("检测到重复发送，忽略");
        return;
      }

      this.isSending = true;

      // 判断是否为地址消息
      const isAddressMessage = messageContent.startsWith("我的地址：");
      const messageType = isAddressMessage ? "address" : "text";

      // 使用新的消息管理方法
      const messageData = {
        content: messageContent,
        senderId: this.currentUserId,
        receiverId: this.otherUserId,
        createdAt: new Date().toISOString(),
        messageType: messageType,
      };

      // 发送新消息（立即显示临时消息）
      const tempMessage = this.sendNewMessage(messageData);
      this.inputMessage = "";

      try {
        const body = {
          receiverId: this.otherUserId,
          content: messageContent,
          messageType,
        };
        // 如果有当前任务，关联到任务；否则按用户ID发送
        if (this.currentTask && this.currentTask.id) {
          body.taskId = this.currentTask.id;
        } else if (this.taskId) {
          body.taskId = this.taskId;
        } else if (this.campusResourceId) {
          body.campusResourceId = this.campusResourceId;
        }

        const res = await request({
          url: `/chats/send`,
          method: "POST",
          data: body,
        });

        if (res && res.message) {
          // 替换临时消息为真实消息
          this.replaceTempMessage(tempMessage.tempId, res.message);
          // 发送成功后滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }

        // 发送消息成功后，不立即检查新消息
        // 因为发送者不应该看到自己发送消息的红点
        // 延迟一段时间后再检查，让接收者有足够时间查看消息
      } catch (e) {
        console.error("发送消息失败:", e);
        // 移除临时消息
        this.removeTempMessage(tempMessage.tempId);
        uni.showToast({
          title: "发送失败，请重试",
          icon: "none",
          duration: 2000,
        });
      } finally {
        this.isSending = false;
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          // 使用一个足够大的固定值滚动到底部
          this.scrollTop = 999999;
          console.log(
            "滚动到底部，scrollTop:",
            this.scrollTop,
            "消息数量:",
            this.messages.length
          );

          // 如果scrollTop不够大，尝试使用更大的值
          setTimeout(() => {
            this.scrollTop = 9999999;
            console.log("再次滚动到底部，scrollTop:", this.scrollTop);
          }, 100);
        }
      });
    },

    // 立即滚动到底部，用于发送消息后的即时反馈
    scrollToBottomImmediate() {
      if (this.messages.length > 0) {
        // 直接滚动到底部
        this.scrollTop = 9999999;
        console.log(
          "立即滚动到底部，scrollTop:",
          this.scrollTop,
          "消息数量:",
          this.messages.length
        );
      }
    },

    // 消息管理方法 - 基于典型聊天UI逻辑
    // 1. 添加新消息到列表末尾
    addNewMessage(message) {
      this.messages.push(message);
      this.renderMessages();
      // 发送消息时强制滚动到底部
      this.forceScrollToBottom();
    },

    // 2. 渲染消息列表（Vue会自动处理，这里主要用于逻辑清晰）
    renderMessages() {
      // 消息去重
      this.deduplicateMessages();

      // 懒加载优化
      this.optimizeMessageList();

      // Vue的响应式系统会自动重新渲染
      console.log(`渲染消息列表，当前消息数量: ${this.messages.length}`);
    },

    // 4. 处理新消息到达 - 核心业务逻辑
    onNewMessage(newMessage) {
      // 检查是否是自己发送的消息（避免重复显示）
      if (newMessage.senderId === this.currentUserId) {
        console.log("忽略自己发送的消息，避免重复显示");
        return;
      }

      // 添加到消息列表末尾
      this.messages.push(newMessage);
      this.renderMessages();

      // 智能滚动：只有在用户当前在底部时才自动滚动
      this.isUserAtBottom().then((shouldScrollToBottom) => {
        if (shouldScrollToBottom) {
          this.scrollToBottom();
        }
      });

      // 更新消息徽章状态
      console.log("收到新消息，调用onNewMessage");
      simpleMessageBadge.onNewMessage();

      // 显示新消息提示
      uni.showToast({
        title: "收到新消息",
        icon: "none",
        duration: 1000,
      });
    },

    // 5. 发送消息 - 优化后的发送逻辑
    sendNewMessage(messageData) {
      // 创建临时消息，立即显示
      const tempMessage = {
        id: `temp_${Date.now()}_${Math.random()}`,
        ...messageData,
        isTemp: true,
        tempId: `temp_${Date.now()}_${Math.random()}`,
      };

      // 立即添加到列表末尾并滚动
      this.addNewMessage(tempMessage);

      return tempMessage;
    },

    // 6. 替换临时消息为真实消息
    replaceTempMessage(tempId, realMessage) {
      const index = this.messages.findIndex((msg) => msg.tempId === tempId);
      if (index !== -1) {
        this.messages[index] = realMessage;
        console.log("临时消息已替换为真实消息");
      }
    },

    // 7. 移除临时消息（发送失败时）
    removeTempMessage(tempId) {
      this.messages = this.messages.filter((msg) => msg.tempId !== tempId);
      console.log("临时消息已移除");
    },

    // 8. 已读逻辑 - 滚动到底部时自动标记为已读（使用下面的完整版本）

    // 处理头像加载错误（使用下面的完整版本）

    // 9. 懒加载优化 - 限制显示的消息数量
    optimizeMessageList() {
      const MAX_DISPLAY_MESSAGES = 100; // 最多显示100条消息

      if (this.messages.length > MAX_DISPLAY_MESSAGES) {
        // 保留最新的消息，移除最旧的消息
        const messagesToRemove = this.messages.length - MAX_DISPLAY_MESSAGES;
        this.messages = this.messages.slice(messagesToRemove);
        console.log(`优化消息列表，移除了 ${messagesToRemove} 条旧消息`);
      }
    },

    // 10. 消息去重逻辑
    deduplicateMessages() {
      const seen = new Set();
      this.messages = this.messages.filter((msg) => {
        const key = `${msg.id}_${msg.createdAt}_${msg.content}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    },

    // 11. 强制滚动到底部 - 最可靠的方法
    forceScrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          // 直接滚动到底部
          this.scrollTop = 999999;
          console.log("强制滚动到底部，scrollTop:", this.scrollTop);
        }
      });
    },

    // 滚动事件处理
    onScroll(e) {
      try {
        const { scrollTop, scrollHeight, height } = e.detail;
        // 如果滚动位置接近底部（允许50px的误差），认为用户在底部
        this.userAtBottom = scrollTop + height >= scrollHeight - 50;
      } catch (error) {
        console.error("onScroll error:", error);
      }
    },

    // 检测用户是否在聊天底部
    isUserAtBottom() {
      // 直接返回缓存的滚动状态
      return Promise.resolve(this.userAtBottom !== false);
    },

    startMessagePolling() {
      // 每8秒轮询一次新消息，避免触发频率限制
      this.pollingTimer = setInterval(() => {
        this.pollNewMessages();
        // 移除频繁的任务状态更新，只在必要时更新
      }, 8000);
    },

    stopMessagePolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    // 手动重试轮询
    retryMessagePolling() {
      console.log("手动重试消息轮询");
      this.pollingErrorCount = 0; // 重置错误计数
      this.startMessagePolling(); // 重新开始轮询
      uni.showToast({
        title: "正在重试连接...",
        icon: "loading",
        duration: 1000,
      });
    },

    async pollNewMessages() {
      // 如果页面不在前台，暂停轮询
      if (!this.isPageActive) {
        return;
      }

      // 如果没有最后消息ID，不进行轮询
      if (!this.lastMessageId || this.lastMessageId <= 0) {
        return;
      }

      try {
        const params = { lastMessageId: this.lastMessageId };
        if (this.taskId) params.taskId = this.taskId;
        if (this.campusResourceId)
          params.campusResourceId = this.campusResourceId;
        const res = await request({
          url: `/chats/new-messages`,
          method: "GET",
          data: params,
        });

        if (res && res.messages && res.messages.length > 0) {
          // 过滤掉当前用户发送的消息，避免重复显示
          // 处理新消息 - 使用新的消息管理逻辑
          if (res.messages && res.messages.length > 0) {
            res.messages.forEach((newMessage) => {
              this.onNewMessage(newMessage);
            });
          }

          // 更新最后消息ID
          const lastMessage = res.messages[res.messages.length - 1];
          this.lastMessageId = Math.max(this.lastMessageId, lastMessage.id);
        }
      } catch (e) {
        console.error("轮询新消息失败:", e);

        // 检查是否是502 Bad Gateway错误
        if (
          e.statusCode === 502 ||
          (e.data &&
            typeof e.data === "string" &&
            e.data.includes("<!DOCTYPE html>"))
        ) {
          console.warn("检测到502 Bad Gateway错误，可能是服务器暂时不可用");
          this.pollingErrorCount = (this.pollingErrorCount || 0) + 1;
          if (this.pollingErrorCount > 3) {
            console.warn("502错误次数过多，延长轮询间隔");
            this.stopMessagePolling();
            // 延长到60秒后重新开始轮询
            setTimeout(() => {
              this.retryMessagePolling();
            }, 60000);
            return;
          }
          // 短暂延迟后继续轮询
          setTimeout(() => {
            this.pollNewMessages();
          }, 5000);
          return;
        }

        // 检查是否是频率限制错误
        if (e.message && e.message.includes("请求过于频繁")) {
          console.warn("触发频率限制，延长轮询间隔");
          this.stopMessagePolling();
          // 延长到30秒后重新开始轮询
          setTimeout(() => {
            this.retryMessagePolling();
          }, 30000);
          return;
        }

        // 如果连续失败次数过多，停止轮询
        this.pollingErrorCount = (this.pollingErrorCount || 0) + 1;
        if (this.pollingErrorCount > 5) {
          console.warn("轮询失败次数过多，停止轮询");
          this.stopMessagePolling();
          // 显示网络错误提示
          uni.showToast({
            title: "网络连接异常，请检查网络",
            icon: "none",
            duration: 3000,
          });
        }
      }
    },

    loadMoreMessages() {
      if (this.hasMore && !this.isLoading) {
        this.currentPage++;
        this.loadMessages();
      }
    },

    getUserAvatar(message) {
      // 如果是当前用户发送的消息
      if (message.senderId === this.currentUserId) {
        // 优先使用userInfo中的头像
        if (this.userInfo && this.userInfo.avatarUrl) {
          return this.userInfo.avatarUrl;
        }

        // 如果没有头像，使用默认头像
        return "/static/images/default-avatar.png";
      }

      // 如果是其他用户发送的消息
      // 优先使用消息中携带的用户头像信息
      if (message.sender && message.sender.avatarUrl) {
        return message.sender.avatarUrl;
      }

      if (message.senderAvatar) {
        return message.senderAvatar;
      }

      // 尝试从其他可能的字段获取头像
      if (message.otherUserAvatar) {
        return message.otherUserAvatar;
      }

      return "/static/images/default-avatar.png";
    },

    formatTime(timestamp) {
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
          // 1分钟内
          return "刚刚";
        } else if (diff < 3600000) {
          // 1小时内
          return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
          // 24小时内
          return `${Math.floor(diff / 3600000)}小时前`;
        } else {
          return `${
            date.getMonth() + 1
          }-${date.getDate()} ${date.getHours()}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        }
      } catch (error) {
        return "";
      }
    },

    goBack() {
      uni.navigateBack();
    },

    showMoreActions() {
      // 使用原生action sheet替代弹窗，避免引用问题
      uni.showActionSheet({
        itemList: ["查看任务详情"],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.viewTaskDetail();
              break;
          }
        },
      });
    },

    // 切换功能菜单显示
    toggleFunctionMenu() {
      console.log("加号按钮被点击");
      this.showFunctionMenu = !this.showFunctionMenu;
    },

    // 获取任务状态文本
    getTaskStatusText(status) {
      const statusMap = {
        open: "待接单",
        assigned: "订单进行中",
        acceptor_done: "待确认",
        publisher_confirmed: "已完成",
        cancelled: "已取消",
        paid: "已支付",
      };
      return statusMap[status] || "订单进行中";
    },

    // 检查任务是否已完成
    checkTaskCompletion() {
      if (!this.currentTask) {
        this.isTaskCompleted = false;
        return;
      }

      // 任务完成的状态：publisher_confirmed（发布者确认完成）
      const completedStatuses = ["publisher_confirmed", "paid"];
      this.isTaskCompleted = completedStatuses.includes(
        this.currentTask.status
      );

      console.log("任务完成状态检查:", {
        status: this.currentTask.status,
        isCompleted: this.isTaskCompleted,
      });
    },

    // 加载任务信息
    async loadTaskInfo() {
      if (!this.taskId) {
        console.log("没有taskId，跳过任务信息加载");
        return;
      }

      try {
        console.log("开始加载任务信息，taskId:", this.taskId);
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        console.log("任务信息响应:", res);
        if (res && res.data) {
          this.currentTask = res.data;
          console.log("任务信息加载成功:", this.currentTask);
          console.log(
            "当前任务状态:",
            this.currentTask.status,
            "显示文本:",
            this.getTaskStatusText(this.currentTask.status)
          );
          // 检查任务是否已完成
          this.checkTaskCompletion();
        } else if (res && res.id) {
          // 如果响应直接是任务对象
          this.currentTask = res;
          console.log("任务信息加载成功（直接格式）:", this.currentTask);
          console.log(
            "当前任务状态:",
            this.currentTask.status,
            "显示文本:",
            this.getTaskStatusText(this.currentTask.status)
          );
          // 检查任务是否已完成
          this.checkTaskCompletion();
        } else {
          console.log("任务信息响应格式不正确:", res);
          // 即使响应格式不正确，也创建一个默认的任务对象
          this.currentTask = {
            id: this.taskId,
            taskType: "快递代取",
            status: "assigned",
          };
        }
      } catch (error) {
        console.error("获取任务信息失败:", error);

        // 检查是否是频率限制错误
        if (error.message && error.message.includes("请求过于频繁")) {
          console.warn("任务信息请求触发频率限制，跳过本次更新");
          return; // 不更新任务信息，保持当前状态
        }

        // 如果获取失败，创建一个默认的任务对象
        this.currentTask = {
          id: this.taskId,
          taskType: "快递代取",
          status: "assigned",
        };
      }
    },

    async viewTaskDetail() {
      console.log("viewTaskDetail called, taskId:", this.taskId);
      console.log(
        "当前页面参数 - taskId:",
        this.taskId,
        "otherUserId:",
        this.otherUserId
      );

      if (!this.taskId) {
        console.error("taskId不存在，无法获取任务信息");
        uni.showToast({
          title: "任务ID不存在",
          icon: "none",
        });
        return;
      }

      // 显示加载提示
      uni.showLoading({
        title: "获取任务信息中...",
        mask: true,
      });

      try {
        console.log("开始获取任务信息，taskId:", this.taskId);
        console.log("请求URL:", `/tasks/${this.taskId}`);

        // 先获取任务信息来判断任务类型
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        console.log("任务信息响应:", res);
        console.log("响应状态:", res ? "成功" : "失败");
        console.log("响应内容:", JSON.stringify(res, null, 2));

        // 检查响应数据结构
        let task = null;
        if (res && res.task) {
          // 如果响应包含task字段
          task = res.task;
          console.log("从res.task获取任务信息");
        } else if (res && res.id) {
          // 如果响应直接是任务对象
          task = res;
          console.log("从res直接获取任务信息");
        }

        if (task) {
          console.log("任务类型:", task.taskType);
          console.log("任务详情:", task);

          // 如果是学习伙伴任务，跳转到专门的学习伙伴详情页面
          if (task.taskType === "学习伙伴") {
            const url = `/subpages/campus-interact/detail?id=${this.taskId}`;
            console.log("跳转到学习伙伴详情页面:", url);
            uni.navigateTo({
              url: url,
              success: () => {
                console.log("跳转学习伙伴详情页面成功");
              },
              fail: (err) => {
                console.error("跳转学习伙伴详情页面失败:", err);
                uni.showToast({
                  title: "页面跳转失败",
                  icon: "none",
                });
              },
            });
          } else {
            // 其他任务跳转到通用任务详情页面
            const url = `/subpages/task/task_detail/task_detail?id=${this.taskId}`;
            console.log("跳转到任务详情页面:", url);
            uni.navigateTo({
              url: url,
              success: () => {
                console.log("跳转任务详情页面成功");
              },
              fail: (err) => {
                console.error("跳转任务详情页面失败:", err);
                uni.showToast({
                  title: "页面跳转失败",
                  icon: "none",
                });
              },
            });
          }
        } else {
          console.error("任务信息为空或格式不正确:", res);
          console.error("响应结构:", Object.keys(res || {}));

          // 如果获取任务信息失败，尝试直接跳转到任务详情页面
          console.log("尝试直接跳转到任务详情页面");
          const url = `/subpages/task/task_detail/task_detail?id=${this.taskId}`;
          uni.navigateTo({
            url: url,
            success: () => {
              console.log("直接跳转任务详情页面成功");
            },
            fail: (err) => {
              console.error("直接跳转任务详情页面失败:", err);
              uni.showToast({
                title: "获取任务信息失败",
                icon: "none",
              });
            },
          });
        }
      } catch (error) {
        console.error("获取任务信息失败:", error);
        console.error("错误详情:", error.message);
        console.error("错误堆栈:", error.stack);

        // 出错时显示错误提示，不跳转
        uni.showToast({
          title: "获取任务信息失败",
          icon: "none",
        });
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
      }
    },

    reportIssue() {
      this.$refs.morePopup.close();
      uni.showModal({
        title: "举报问题",
        content: "请描述您遇到的问题",
        editable: true,
        placeholderText: "请输入问题描述",
        success: (res) => {
          if (res.confirm && res.content) {
            this.submitReport(res.content);
          }
        },
      });
    },

    async submitReport(content) {
      try {
        await request({
          url: `/chats/report`,
          method: "POST",
          data: {
            taskId: this.taskId,
            content: content,
          },
        });
        uni.showToast({ title: "举报成功", icon: "success" });
      } catch (e) {
        uni.showToast({ title: "举报失败", icon: "none" });
      }
    },

    publishAddress() {
      // 跳转到地址选择页面，让用户从已保存的地址中选择
      uni.navigateTo({
        url: `/subpages/profile/select-address?from=chat&taskId=${this.taskId}&otherUserId=${this.otherUserId}`,
        fail: (err) => {
          console.log("跳转地址页面失败:", err);
          // 如果地址页面不存在，显示提示
          uni.showModal({
            title: "功能开发中",
            content: "地址管理功能正在开发中，请稍后再试",
            showCancel: false,
            confirmText: "知道了",
          });
        },
      });
    },

    saveAddress() {
      uni.showModal({
        title: "保存地址",
        content: "请输入要保存的地址",
        editable: true,
        placeholderText: "请输入详细地址",
        success: (res) => {
          if (res.confirm && res.content) {
            // 这里可以调用API保存地址
            console.log("保存地址:", res.content);
            uni.showToast({
              title: "地址保存成功",
              icon: "success",
            });
          }
        },
      });
    },

    selectFromMap() {
      // 调用地图选择功能
      uni.chooseLocation({
        success: (res) => {
          console.log("选择的位置：", res);
          uni.showToast({
            title: "位置选择成功",
            icon: "success",
          });
        },
        fail: (err) => {
          console.log("选择位置失败：", err);
          // 如果是权限问题，给出更详细的提示
          if (err.errMsg && err.errMsg.includes("auth")) {
            uni.showModal({
              title: "需要位置权限",
              content: "请在设置中允许使用位置信息",
              showCancel: false,
              confirmText: "知道了",
            });
          } else {
            uni.showToast({
              title: "位置选择失败",
              icon: "none",
            });
          }
        },
      });
    },

    handleAvatarError(e) {
      console.error("头像加载失败:", e);
      console.error("头像路径:", e.target.src);
      // 头像加载失败时，使用默认头像
      e.target.src = "/static/images/default-avatar.png";
      console.log("已设置默认头像路径");
    },

    applyAfterSale() {
      // 跳转到售后页面，传递任务ID
      uni.navigateTo({
        url: `/pages/after_sales/after_sales?id=${this.taskId}`,
        success: () => {
          console.log("跳转售后页面成功，taskId:", this.taskId);
        },
        fail: (err) => {
          console.error("跳转售后页面失败:", err);
          uni.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    },

    // 分享学习伙伴活动
    shareActivity() {
      if (!this.campusResourceId) {
        uni.showToast({
          title: "无法获取活动信息",
          icon: "none",
        });
        return;
      }

      // 复制分享链接
      const shareUrl = `https://xinghuoyuanbang.top/campus-interact/${this.campusResourceId}`;
      uni.setClipboardData({
        data: shareUrl,
        success: () => {
          uni.showToast({
            title: "分享链接已复制",
            icon: "success",
          });
        },
      });
    },

    // 查看学习伙伴活动详情
    viewActivityDetail() {
      if (!this.campusResourceId) {
        uni.showToast({
          title: "无法获取活动信息",
          icon: "none",
        });
        return;
      }

      // 跳转到学习伙伴详情页
      uni.navigateTo({
        url: `/subpages/campus-interact/detail?id=${this.campusResourceId}`,
      });
    },

    closeChat() {
      uni.navigateBack();
    },

    // 处理实时消息
    onRealtimeMessage(data) {
      console.log("聊天页面收到实时消息通知:", data);
      // 重置实时消息管理器的检查时间，避免重复处理
      realtimeMessageManager.resetCheckTime();
    },

    // 标记消息为已读
    async markMessagesAsRead() {
      console.log("聊天页面markMessagesAsRead方法被调用");
      try {
        let type = "task";
        let id = this.taskId;

        if (this.campusResourceId) {
          type = "partner";
          id = this.campusResourceId;
        } else if (this.otherUserId) {
          type = "chat";
          id = `chat_${[this.currentUserId, this.otherUserId]
            .sort()
            .join("_")}`;
        }

        console.log("聊天页面标记消息为已读:", {
          type,
          id,
          taskId: this.taskId,
          campusResourceId: this.campusResourceId,
          otherUserId: this.otherUserId,
        });

        if (id) {
          // 调用API标记消息为已读
          console.log("正在调用API标记消息为已读:", type, id);

          const response = await request({
            url: "/chats/mark-read",
            method: "POST",
            data: {
              type: type,
              id: id,
            },
          });

          console.log("标记消息为已读API响应:", response);
          console.log("聊天页面标记消息为已读完成");

          // 标记完成后，立即检查新消息状态，更新红点
          setTimeout(() => {
            realtimeMessageManager.checkNewMessages();
          }, 500);
        } else {
          console.log("聊天页面没有有效的ID，跳过标记已读");
        }
      } catch (error) {
        console.error("标记消息为已读失败:", error);
      }
    },

    // 键盘监听相关方法
    setupKeyboardListeners() {
      // 简化处理，主要依靠adjust-position属性
      console.log("设置键盘监听器");
    },

    removeKeyboardListeners() {
      // 移除键盘监听
      console.log("移除键盘监听器");
    },

    // 长按消息相关方法
    onMessageLongPress(message) {
      console.log("长按消息:", message);
      this.selectedMessage = message;
      this.showMessageMenu = true;
    },

    hideMessageMenu() {
      this.showMessageMenu = false;
      this.selectedMessage = null;
    },

    copyMessage() {
      if (!this.selectedMessage) return;

      uni.setClipboardData({
        data: this.selectedMessage.content,
        success: () => {
          uni.showToast({
            title: "已复制到剪贴板",
            icon: "success",
          });
        },
        fail: () => {
          uni.showToast({
            title: "复制失败",
            icon: "none",
          });
        },
      });

      this.hideMessageMenu();
    },

    canRecallMessage(message) {
      console.log("检查是否可以撤回消息:", message);
      console.log("当前用户ID:", this.currentUserId);

      if (!message || !this.currentUserId) {
        console.log("消息或用户ID不存在");
        return false;
      }

      // 只能撤回自己发送的消息
      if (message.senderId !== this.currentUserId) {
        console.log("不是自己发送的消息，发送者ID:", message.senderId);
        return false;
      }

      // 只能撤回文本消息（暂不支持撤回图片、位置等）
      if (message.messageType !== "text" && message.messageType !== undefined) {
        console.log("不是文本消息，消息类型:", message.messageType);
        return false;
      }

      // 检查消息发送时间，超过10分钟不能撤回
      const messageTime = new Date(message.createdAt).getTime();
      const now = Date.now();
      const timeDiff = now - messageTime;
      const maxRecallTime = 10 * 60 * 1000; // 10分钟

      console.log("消息时间检查:", {
        messageTime: new Date(message.createdAt),
        now: new Date(now),
        timeDiff: timeDiff,
        maxRecallTime: maxRecallTime,
        canRecall: timeDiff <= maxRecallTime,
      });

      return timeDiff <= maxRecallTime;
    },

    async recallMessage() {
      if (
        !this.selectedMessage ||
        !this.canRecallMessage(this.selectedMessage)
      ) {
        uni.showToast({
          title: "无法撤回此消息",
          icon: "none",
        });
        return;
      }

      try {
        // 调用后端撤回API
        const response = await request({
          url: `/chats/${this.selectedMessage.id}/recall`,
          method: "PUT",
        });

        if (response && response.success) {
          // 更新本地消息列表
          const messageIndex = this.messages.findIndex(
            (msg) => msg.id === this.selectedMessage.id
          );

          if (messageIndex !== -1) {
            // 标记消息为已撤回
            this.messages[messageIndex].isRecalled = true;
            this.messages[messageIndex].content = "您撤回了一条消息";
            this.messages[messageIndex].messageType = "recall";
          }

          uni.showToast({
            title: "消息已撤回",
            icon: "success",
          });
        } else {
          uni.showToast({
            title: response?.message || "撤回失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("撤回消息失败:", error);
        uni.showToast({
          title: "撤回失败，请稍后重试",
          icon: "none",
        });
      }

      this.hideMessageMenu();
    },
  },
};
</script>

<style lang="scss" scoped>
/* 全局禁用页面滚动 */
page {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 禁用body滚动 */
body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* 全局禁用所有滚动 */
* {
  -webkit-overflow-scrolling: touch;
}

/* 全局透明滚动条 */
* {
  scrollbar-width: thin !important;
  scrollbar-color: transparent transparent !important;
  -ms-overflow-style: auto !important;
}

*::-webkit-scrollbar {
  width: 6rpx !important;
  height: 6rpx !important;
  background: transparent !important;
}

*::-webkit-scrollbar-track {
  background: transparent !important;
}

*::-webkit-scrollbar-thumb {
  background: transparent !important;
}

*::-webkit-scrollbar-corner {
  background: transparent !important;
}

/* 确保聊天页面完全固定 */
.chat-page {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* 聊天消息包装器 - 用于隐藏滚动条 */
.chat-messages-wrapper {
  flex: 1;
  overflow: hidden !important;
  position: relative;
  /* 隐藏滚动条 - 恢复正常的边距 */
  margin-right: 0 !important;
  padding-right: 0 !important;
  width: 100% !important;
}
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f0f8ff 0%, #e6f3ff 50%, #ffffff 100%);
  padding-top: 20rpx;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  overflow: hidden !important;
  /* 防止整体移动 */
  transform: translateZ(0) !important;
  -webkit-transform: translateZ(0) !important;
  /* 强制固定定位 */
  z-index: 1;
  /* 禁用触摸滚动 */
  touch-action: none;
  -webkit-overflow-scrolling: touch;
}

.chat-messages {
  flex: 1;
  padding: 0 20rpx 10rpx 20rpx;
  background: linear-gradient(180deg, #f0f8ff 0%, #e6f3ff 50%, #ffffff 100%);
  /* 为固定的输入区域留出空间 */
  padding-bottom: 120rpx;
  /* 启用滚动 */
  overflow-y: auto !important;
  overflow-x: hidden !important;
  /* 隐藏滚动条 */
  margin-right: 0 !important;
  padding-right: 20rpx !important;
  /* 透明滚动条 */
  scrollbar-width: thin !important; /* Firefox */
  scrollbar-color: transparent transparent !important; /* Firefox */
  -ms-overflow-style: auto !important; /* IE and Edge */
  /* 确保内容区域不会超出边界 */
  box-sizing: border-box;
  /* 防止滚动时的整体移动 */
  position: relative !important;
  /* 硬件加速 */
  transform: translateZ(0) !important;
  -webkit-transform: translateZ(0) !important;
  /* 强制固定高度 */
  height: calc(100vh - 230rpx) !important;
  max-height: calc(100vh - 230rpx) !important;
  /* 禁用触摸滚动传播 */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

/* 透明 WebKit 浏览器的滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6rpx !important;
  height: 6rpx !important;
  background: transparent !important;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent !important;
  border-radius: 3rpx !important;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: transparent !important;
  border-radius: 3rpx !important;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: transparent !important;
}

.chat-messages::-webkit-scrollbar-corner {
  background: transparent !important;
}

.loading-messages {
  text-align: center;
  padding: 20rpx;
}

.message-item {
  display: flex;
  margin-bottom: 32rpx;
  align-items: flex-start;
  padding: 0 20rpx;
}

.message-item:last-child {
  margin-bottom: 10rpx;
}

.message-item.message-mine {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  margin: 0 8rpx;
}

/* 专门调整左边头像的边距，让它和右边一样小 */
.message-item:not(.message-mine) .message-avatar {
  margin-left: 0rpx !important;
  margin-right: 8rpx !important;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.message-content {
  max-width: 60%;
  align-self: flex-start;
}

.message-bubble {
  background: linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #e8f5e8;
  position: relative;
  overflow: hidden;
}

.message-bubble::before {
  display: none;
}

.message-mine .message-bubble {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
  color: #fff;
  border: none;
}

.message-mine .message-bubble::before {
  display: none;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  text-align: left;
}

.message-mine .message-time {
  text-align: right;
}

/* 地址消息特殊样式 */
.address-message {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  border: 2rpx solid #2196f3 !important;
  color: #64b5f6 !important; /* 浅蓝色文字，提高可读性 */
}

.message-mine .address-message {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%) !important;
  border: 2rpx solid #ff9800 !important;
  color: #64b5f6 !important; /* 浅蓝色文字，提高可读性 */
}

.address-content {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.address-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.address-text {
  font-size: 28rpx;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-line;
  font-weight: 500; /* 加粗文字，提高可读性 */
}

.input-area {
  background: linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%);
  padding: 20rpx 20rpx 60rpx 20rpx;
  margin-top: 0;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 10 !important;
}

/* 校园论坛聊天活泼校园化界面 */
.campus-interact-chat-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24rpx;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -8rpx 32rpx rgba(102, 126, 234, 0.3);
}

.campus-chat-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.activity-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.activity-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
  animation: bounce 2s infinite;
}

.activity-info {
  flex: 1;
}

.activity-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.activity-subtitle {
  display: block;
  font-size: 24rpx;
  color: #666;
  font-style: italic;
}

.interaction-buttons {
  display: flex;
  gap: 16rpx;
}

.interaction-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.interaction-btn.primary {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.4);
}

.interaction-btn.secondary {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  box-shadow: 0 6rpx 20rpx rgba(78, 205, 196, 0.4);
}

.interaction-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.btn-text {
  font-size: 24rpx;
  font-weight: 500;
}

.campus-decoration {
  text-align: center;
  padding: 16rpx;
}

.decoration-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 动画效果 */
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10rpx);
  }
  60% {
    transform: translateY(-5rpx);
  }
}

.message-input {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 24rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  border: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.message-input:focus {
  background: linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%);
  border-color: #64b5f6;
  box-shadow: 0 0 0 2rpx rgba(100, 181, 246, 0.2);
}

.send-btn {
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 50%, #c8e6c9 100%);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(129, 199, 132, 0.3);
  transition: all 0.3s ease;
}

.send-btn:active {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(129, 199, 132, 0.4);
}

.send-btn:disabled {
  background: linear-gradient(135deg, #ccc 0%, #999 100%);
  box-shadow: none;
  transform: none;
}

/* 功能按钮样式 */
.function-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
  padding: 16rpx 0;
}

.function-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.function-btn:active {
  transform: translateY(-2rpx);
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  box-shadow: 0 4rpx 12rpx rgba(100, 181, 246, 0.2);
}

.function-btn .btn-text {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

/* 消息类型样式 */
.message-bubble.image-message {
  padding: 8rpx;
  background: transparent;
  border: none;
  box-shadow: none;
}

.message-bubble.location-message {
  padding: 16rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
  min-width: 300rpx;
}

.image-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8rpx;
  background: transparent;
}

.message-image {
  max-width: 400rpx;
  max-height: 400rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 8rpx;
  display: block;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.clickable-image:active {
  transform: scale(0.98);
}

.location-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.location-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.location-address {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.location-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
  border-radius: 12rpx;
  color: white;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.location-action:active {
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.location-action-text {
  font-weight: 500;
}

.popup-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.popup-row {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.popup-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 12rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.popup-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: linear-gradient(180deg, #4caf50 0%, #66bb6a 100%);
  border-radius: 0 2rpx 2rpx 0;
}

.popup-item:active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: translateX(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(100, 181, 246, 0.2);
}

.popup-item text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
}

/* 任务状态横幅样式 */
.task-banner {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  padding: 32rpx 32rpx;
  margin: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: none !important;
  outline: none !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-type {
  font-size: 30rpx;
  font-weight: 600;
  color: #2e7d32;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.status-text {
  font-size: 26rpx;
  color: #4caf50;
  font-weight: 500;
}

.arrow-icon {
  font-size: 20rpx;
  color: #4caf50;
  font-weight: bold;
}

/* 输入区域优化样式 */
.input-container {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 20rpx;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.plus-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.plus-btn:active {
  background: linear-gradient(135deg, #388e3c 0%, #4caf50 100%);
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
}

.plus-icon {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

/* 功能菜单样式 */
.function-menu {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  background: #f8f9fa;
  border-top: 1rpx solid #e0e0e0;
  margin-top: 0;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: none;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.function-item:active {
  background: #f0f0f0;
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

.function-icon {
  margin-bottom: 8rpx;
}

.function-text {
  font-size: 24rpx;
  color: #666;
}

.icon-text {
  font-size: 32rpx;
}

/* 发送按钮美化 */
.send-btn {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  min-width: 80rpx;
}

.send-btn:active {
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.4);
}

.send-btn:disabled {
  background: linear-gradient(135deg, #ccc 0%, #999 100%);
  box-shadow: none;
  transform: none;
}

/* 功能菜单弹窗样式 */
.function-popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.function-grid {
  display: flex;
  justify-content: space-around;
  gap: 32rpx;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8f9fa;
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.function-item:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.function-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.function-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 任务完成状态提示样式 */
.task-completed-notice {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  margin: 16rpx 24rpx;
  text-align: center;
}

.notice-text {
  color: #666;
  font-size: 28rpx;
  font-weight: 500;
}

/* 长按消息菜单样式 */
.message-context-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999 !important;
  animation: fadeIn 0.2s ease;
}

.menu-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 0;
  width: 90%;
  max-width: 500rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  margin: 0 auto;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 撤回消息气泡样式 */
.recall-message-bubble {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* 撤回消息样式 */
.recall-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  background: transparent;
  border: none;
  box-shadow: none;
  width: 100%;
}

.recall-text {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  font-style: italic;
}

/* 撤回消息的气泡样式覆盖 */
.message-mine .recall-message {
  background: transparent;
  border: none;
  box-shadow: none;
}

.message-mine .recall-text {
  color: #999;
}
</style>
