<template>
  <view class="order-process-container">
    <!-- 状态对应的提示信息 -->
    <view class="status-section">
      <view class="status-card" :class="statusCardClass">
        <view class="status-icon">
          <uni-icons
            :type="statusIconType"
            size="48"
            :color="statusIconColor"
          ></uni-icons>
        </view>
        <text class="status-title">{{ statusTitle }}</text>
        <text class="status-desc">{{ statusDescription }}</text>
      </view>
    </view>

    <!-- 任务详情区块化布局 -->
    <view v-if="task" class="task-detail-container">
      <!-- 任务基本信息 -->
      <view class="task-basic-info">
        <view class="task-title-section">
          <text class="task-title">{{ task.title || "无标题" }}</text>
          <text class="task-reward">¥{{ getTaskAmount }}</text>
        </view>
        <view class="task-meta">
          <text class="task-type" :class="taskTypeClass">{{
            task.taskType
          }}</text>
          <view class="status-badge" :class="statusClass">{{
            statusText
          }}</view>
        </view>
        <text
          class="task-deadline"
          v-if="task.deadline && task.deadline !== 'null'"
          >{{ formatDeadline(task.deadline) }}截止</text
        >
      </view>

      <!-- 任务描述区块 -->
      <view class="task-description-block">
        <view class="block-icon">📝</view>
        <view class="block-content">
          <text class="block-title">任务描述</text>
          <text class="block-text">{{ taskDescription }}</text>
        </view>
      </view>

      <!-- 任务详情区块 -->
      <view v-if="task.specifics" class="task-details-block">
        <view class="block-icon">📋</view>
        <view class="block-content">
          <text class="block-title">任务详情</text>
          <text class="block-text">{{ task.specifics }}</text>
        </view>
      </view>

      <!-- 任务地点区块 -->
      <view v-if="task.locationText" class="task-location-block">
        <view class="block-icon">📍</view>
        <view class="block-content">
          <text class="block-title">任务地点</text>
          <text class="block-text">{{ getTaskLocation(task) }}</text>
        </view>
      </view>

      <!-- 订单信息区块 -->
      <view class="order-info-block">
        <view class="block-icon">📄</view>
        <view class="block-content">
          <text class="block-title">订单信息</text>
          <view class="order-info-list">
            <view class="order-info-item">
              <text class="order-label">单号</text>
              <text class="order-value">{{ orderNumber }}</text>
            </view>
            <view class="order-info-item">
              <text class="order-label">创建时间</text>
              <text class="order-value">{{ createTime }}</text>
            </view>
            <view class="order-info-item">
              <text class="order-label">接单时间</text>
              <text class="order-value">{{ acceptTime }}</text>
            </view>
            <view v-if="task.publisherConfirmedTime" class="order-info-item">
              <text class="order-label">完成时间</text>
              <text class="order-value">{{
                formatDateTime(task.publisherConfirmedTime)
              }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 发布者/接单员信息区块 -->
      <view
        v-if="task && (task.publisher || task.acceptor)"
        class="publisher-info-block"
      >
        <view class="block-icon">😊</view>
        <view class="block-content">
          <text class="block-title">{{
            isPublisher ? "任务接单员" : "任务发布者"
          }}</text>
          <view class="publisher-details">
            <image
              :src="isPublisher ? getAcceptorAvatar() : getPublisherAvatar()"
              class="publisher-avatar"
            />
            <view class="publisher-detail">
              <text class="publisher-name">{{
                isPublisher ? getAcceptorName() : getPublisherName()
              }}</text>
            </view>
          </view>
        </view>
        <button class="contact-btn" @click="contactPublisher">
          {{ isPublisher ? "联系接单员" : "联系发布者" }}
        </button>
      </view>

      <!-- 订单确认图片上传区块 -->
      <view
        v-if="!isPublisher && task.status === 'assigned'"
        class="confirm-images-card"
      >
        <view class="confirm-images-title">订单确认凭证</view>
        <view class="confirm-images-desc">请上传完成任务的图片凭证</view>

        <view class="upload-area">
          <view
            v-for="(image, index) in confirmImages"
            :key="index"
            class="confirm-image-item"
          >
            <image
              :src="image"
              class="confirm-uploaded-image"
              mode="aspectFill"
              @click="previewImage(image)"
            />
            <view class="confirm-image-actions">
              <view
                class="action-icon preview-icon"
                @click="previewImage(image)"
              >
                👁️
              </view>
              <view class="action-icon delete-icon" @click="removeImage(index)">
                🗑️
              </view>
            </view>
          </view>

          <view
            v-if="confirmImages.length < maxImages"
            class="upload-btn"
            @click="chooseImage"
          >
            <view class="upload-icon">📷</view>
            <text class="upload-text">添加图片</text>
            <text class="upload-tip">最多{{ maxImages }}张</text>
          </view>
        </view>
      </view>

      <!-- 接单员底部操作按钮 -->
      <view
        v-if="!isPublisher && task && task.status === 'assigned'"
        class="fixed-bottom-actions"
      >
        <button
          class="reject-btn"
          @click="handleRejectClick"
          :class="{ disabled: !canRejectTask }"
        >
          {{ rejectButtonText }}
        </button>
        <button
          class="complete-btn"
          @click="markAsComplete"
          :loading="isLoading"
          :disabled="isLoading"
        >
          标记完成
        </button>
      </view>

      <!-- 发布者确认完成按钮 -->
      <button
        v-if="isPublisher && task && task.status === 'acceptor_done'"
        class="confirm-btn fixed-bottom-btn"
        @click="confirmTaskComplete"
        :loading="isConfirming"
        :disabled="isConfirming"
      >
        确认完成
      </button>
    </view>

    <!-- 加载状态 -->
    <view v-if="!task && isLoading" class="loading-container">
      <uni-load-more
        status="loading"
        content-text="{ contentText: { contentdown: '加载中...' } }"
      ></uni-load-more>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";
import request from "@/common/request.js";

export default {
  name: "TaskProcess",
  data() {
    return {
      taskId: null,
      task: null,
      isLoading: true,
      isCompleting: false,
      isConfirming: false, // 用于控制确认完成按钮的加载状态
      confirmImages: [], // 确认图片数组
      maxImages: 3, // 最大图片数量
    };
  },
  computed: {
    ...mapState(["userInfo"]),

    // 是否为发布者
    isPublisher() {
      return (
        this.task && this.userInfo && this.task.publisherId === this.userInfo.id
      );
    },

    // 任务状态相关计算属性
    statusText() {
      if (!this.task) return "";
      const statusMap = {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "待确认",
        completed: "已完成",
        cancelled: "已取消",
        rejected: "已驳回",
      };
      return statusMap[this.task.status] || this.task.status;
    },

    statusClass() {
      if (!this.task) return "";
      return `status-${this.task.status}`;
    },

    statusCardClass() {
      if (!this.task) return "";
      return `status-card-${this.task.status}`;
    },

    statusIconType() {
      if (!this.task) return "help";
      const iconMap = {
        open: "help",
        assigned: "gear",
        acceptor_done: "checkmarkempty",
        completed: "checkmarkempty",
        cancelled: "close",
        rejected: "close",
      };
      return iconMap[this.task.status] || "help";
    },

    statusIconColor() {
      if (!this.task) return "#999";
      const colorMap = {
        open: "#ff9500",
        assigned: "#007aff",
        acceptor_done: "#34c759",
        completed: "#34c759",
        cancelled: "#ff3b30",
        rejected: "#ff3b30",
      };
      return colorMap[this.task.status] || "#999";
    },

    statusTitle() {
      if (!this.task) return "加载中...";
      const titleMap = {
        open: "等待接单",
        assigned: "任务进行中",
        acceptor_done: "等待确认",
        completed: "任务完成",
        cancelled: "任务取消",
        rejected: "任务驳回",
      };
      return titleMap[this.task.status] || "未知状态";
    },

    statusDescription() {
      if (!this.task) return "正在加载任务信息...";
      const descMap = {
        open: "任务已发布，等待接单员接单",
        assigned: "接单员正在处理任务",
        acceptor_done: "接单员已完成任务，等待您确认",
        completed: "任务已完成，感谢使用",
        cancelled: "任务已被取消",
        rejected: "任务已被驳回",
      };
      return descMap[this.task.status] || "状态未知";
    },

    // 任务描述计算属性
    taskDescription() {
      if (!this.task) return "请帮我取快递";

      // 如果有正常的描述内容
      if (
        this.task.description &&
        this.task.description !== null &&
        this.task.description !== "null" &&
        this.task.description.trim() !== ""
      ) {
        return this.task.description;
      }

      // 如果没有描述，根据任务类型生成默认描述
      const typeDescriptions = {
        取快递: "请帮我取快递",
        取外卖: "请帮我取外卖",
        代购: "请帮我代购商品",
        代取: "请帮我代取物品",
        送货: "请帮我送货",
        跑腿: "请帮我跑腿办事",
        借物品: "请帮我借物品",
        学习伙伴: "寻学习伙伴",
      };

      return typeDescriptions[this.task.taskType] || "请帮我完成任务";
    },

    // 获取任务金额
    getTaskAmount() {
      if (!this.task) return 0;

      // 对于借物品任务，计算实际支付金额（押金+租金）
      if (this.task.taskType === "借物品") {
        const specifics = this.task.specifics || "";

        // 解析押金
        const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
        const deposit = depositMatch ? parseFloat(depositMatch[1]) : 0;

        // 解析日租金
        const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
        const dailyRent = rentMatch ? parseFloat(rentMatch[1]) : 0;

        // 解析借用天数
        const dateMatch = specifics.match(
          /借用时间[：:]\s*(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
        let days = 1;
        if (dateMatch) {
          const startDate = new Date(dateMatch[1]);
          const endDate = new Date(dateMatch[2]);
          const diffTime = Math.abs(endDate - startDate);
          days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        const totalRent = dailyRent * days;
        const totalAmount = deposit + totalRent;

        return totalAmount.toFixed(2);
      }

      // 其他任务类型直接返回rewardAmount
      const amount = this.task.rewardAmount || 0;
      return amount;
    },

    // 订单号计算属性
    orderNumber() {
      if (!this.task) return "暂未生成";

      // 对于借物品任务，检查是否为借出模式
      if (this.task.taskType === "借物品") {
        // 借出模式：如果任务还未被接单（状态为open），显示"借出后生成"
        if (this.task.borrowMode === "lend") {
          if (this.task.status === "open") {
            return "借出后生成";
          }
          // 如果已经被接单且有订单号，显示实际订单号
          if (this.task.out_trade_no) {
            return this.formatOrderNumber(this.task.out_trade_no);
          }
          return "借出后生成";
        }
        // 借进模式显示实际订单号
        if (this.task.borrowMode === "borrow" && this.task.out_trade_no) {
          return this.formatOrderNumber(this.task.out_trade_no);
        }
        return "借出后生成";
      }

      if (!this.task.out_trade_no) return "暂未生成";
      return this.formatOrderNumber(this.task.out_trade_no);
    },

    // 创建时间计算属性
    createTime() {
      if (!this.task || !this.task.createdAt) return "暂无";
      return this.formatDateTime(this.task.createdAt);
    },

    // 接单时间计算属性
    acceptTime() {
      if (!this.task || !this.task.acceptedAt) return "暂无";
      return this.formatDateTime(this.task.acceptedAt);
    },

    // 驳回按钮文本计算属性
    rejectButtonText() {
      if (!this.task) return "驳回订单";

      if (this.task.taskType === "借物品") {
        if (this.task.borrowMode === "lend") {
          // 借出模式：借入者取消订单
          return "取消订单";
        } else if (this.task.borrowMode === "borrow") {
          // 借进模式：借出者驳回订单
          return "驳回订单";
        }
      }
      // 其他任务类型
      return "驳回订单";
    },

    // 任务类型对应的CSS类计算属性
    taskTypeClass() {
      if (!this.task || !this.task.taskType) return "task-type-default";

      const typeMap = {
        取快递: "task-type-express",
        取外卖: "task-type-takeaway",
        借物品: "task-type-borrow",
        代跑腿: "task-type-errand",
      };

      return typeMap[this.task.taskType] || "task-type-default";
    },
  },
  async onLoad(options) {
    this.taskId = options.id;

    // 如果用户信息为空，尝试从store获取
    if (!this.userInfo) {
      try {
        await this.$store.dispatch("fetchCurrentUserInfo");
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    }

    if (this.taskId) {
      this.fetchTaskDetail();
    } else {
      uni.showToast({ title: "无效的任务ID", icon: "none" });
      this.goBack();
    }
  },

  onShow() {
    // 页面显示时刷新任务数据，确保状态是最新的
    if (this.taskId) {
      this.fetchTaskDetail();
    }
  },
  methods: {
    async fetchTaskDetail() {
      this.isLoading = true;
      try {
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        if (res) {
          this.task = res;
        } else {
          uni.showToast({ title: "获取任务信息失败", icon: "none" });
        }
      } catch (error) {
        console.error("获取任务详情失败:", error);
        uni.showToast({ title: "获取任务信息失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },

    // 检查是否可以驳回订单（接单后10分钟内）
    canRejectTask() {
      if (!this.task || !this.task.acceptedAt) {
        return false;
      }

      const acceptTime = new Date(this.task.acceptedAt);
      const currentTime = new Date();
      const timeDiff = currentTime - acceptTime;
      const tenMinutes = 10 * 60 * 1000; // 10分钟的毫秒数

      return timeDiff <= tenMinutes;
    },

    // 处理驳回按钮点击
    handleRejectClick() {
      if (!this.canRejectTask()) {
        uni.showToast({
          title: "接单后10分钟内才能驳回",
          icon: "none",
        });
        return;
      }

      this.rejectTask();
    },

    // 驳回订单
    async rejectTask() {
      try {
        uni.showModal({
          title: "确认驳回",
          content: "确定要驳回这个订单吗？",
          success: async (res) => {
            if (res.confirm) {
              this.isLoading = true;
              try {
                const response = await request({
                  url: `/tasks/${this.taskId}/reject`,
                  method: "POST",
                });

                if (response.message) {
                  uni.showToast({
                    title: response.message,
                    icon: "success",
                  });
                  // 驳回成功后跳转回订单大厅
                  setTimeout(() => {
                    uni.navigateBack({
                      delta: 1, // 返回上一页
                      success: () => {
                        // 如果返回失败，则跳转到订单大厅
                        uni.switchTab({
                          url: "/pages/tasks/tasks",
                        });
                      },
                      fail: () => {
                        // 直接跳转到订单大厅
                        uni.switchTab({
                          url: "/pages/tasks/tasks",
                        });
                      },
                    });
                  }, 1500); // 延迟1.5秒让用户看到成功提示
                }
              } catch (error) {
                console.error("驳回订单失败:", error);
                uni.showToast({
                  title: error.message || "驳回失败",
                  icon: "none",
                });
              } finally {
                this.isLoading = false;
              }
            }
          },
        });
      } catch (error) {
        console.error("驳回订单失败:", error);
        uni.showToast({
          title: "驳回失败",
          icon: "none",
        });
      }
    },

    // 接单员确认完成任务
    async markAsComplete() {
      try {
        // 检查是否为线下任务且需要必须上传图片
        const isOfflineTask = this.isOfflineTask();
        if (isOfflineTask && this.confirmImages.length === 0) {
          uni.showModal({
            title: "提示",
            content: "此任务需要上传完成凭证图片，请先上传图片后再标记完成",
            showCancel: false,
            confirmText: "知道了",
          });
          return;
        }

        // 显示确认弹窗
        const confirmResult = await this.showConfirmDialog();
        if (!confirmResult) {
          return;
        }

        // 请求订阅消息授权
        await this.requestNotificationAuth();

        this.isCompleting = true;

        // 构建请求数据
        const requestData = {};
        if (this.confirmImages.length > 0) {
          requestData.confirmImages = this.confirmImages;
        }

        const response = await request({
          url: `/tasks/${this.taskId}/acceptor-confirm-done`,
          method: "POST",
          data: requestData,
        });

        if (response.message) {
          uni.showToast({
            title: response.message,
            icon: "success",
          });

          // 强制刷新任务信息
          console.log("标记完成前任务状态:", this.task?.status);
          await this.fetchTaskDetail();
          console.log("标记完成后任务状态:", this.task?.status);

          // 通知任务列表页面刷新
          uni.$emit("taskStatusChanged", {
            taskId: this.taskId,
            newStatus: "acceptor_done",
            action: "acceptorConfirmed",
          });

          // 延迟跳转回任务详情页面
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
            });
          }, 1500);
        }
      } catch (error) {
        console.error("确认完成任务失败:", error);
        uni.showToast({
          title: error.message || "确认失败",
          icon: "none",
        });
      } finally {
        this.isCompleting = false;
      }
    },

    // 判断是否为线下任务
    isOfflineTask() {
      if (!this.task || !this.task.taskType) {
        return false;
      }

      const offlineTaskTypes = ["取快递", "取外卖", "帮我买", "搬运服务"];
      return offlineTaskTypes.includes(this.task.taskType);
    },

    // 显示确认弹窗
    showConfirmDialog() {
      return new Promise((resolve) => {
        uni.showModal({
          title: "确认完成",
          content: "确认该任务已完成吗？",
          confirmText: "确定",
          cancelText: "取消",
          success: (res) => {
            resolve(res.confirm);
          },
          fail: () => {
            resolve(false);
          },
        });
      });
    },

    // 发布者确认任务完成
    async confirmTaskComplete() {
      try {
        this.isConfirming = true;
        const response = await request({
          url: `/tasks/${this.taskId}/publisher-confirm-done`,
          method: "POST",
        });

        if (response.message) {
          uni.showToast({
            title: response.message,
            icon: "success",
          });

          // 强制刷新任务信息
          console.log("确认完成前任务状态:", this.task?.status);
          await this.fetchTaskDetail();
          console.log("确认完成后任务状态:", this.task?.status);

          // 强制更新Vue响应式数据
          this.$forceUpdate();

          // 通知任务列表页面刷新
          uni.$emit("taskStatusChanged", {
            taskId: this.taskId,
            newStatus: "publisher_confirmed",
            action: "publisherConfirmed",
          });

          // 延迟跳转到任务列表页面
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/tasks",
            });
          }, 2000);
        }
      } catch (error) {
        console.error("确认任务完成失败:", error);
        uni.showToast({
          title: error.message || "确认失败",
          icon: "none",
        });
      } finally {
        this.isConfirming = false;
      }
    },

    // 请求订阅消息授权
    async requestNotificationAuth() {
      try {
        const authRes = await uni.requestSubscribeMessage({
          tmplIds: ["your_template_id_1", "your_template_id_2"],
        });

        const acceptedCount = Object.values(authRes).filter(
          (status) => status === "accept"
        ).length;

        if (acceptedCount > 0) {
          console.log(`用户授权了 ${acceptedCount} 个模板`);
        }
      } catch (err) {
        console.error("订阅消息授权失败:", err);
      }
    },

    // 联系发布者
    contactPublisher() {
      if (this.task && this.task.publisherId) {
        uni.navigateTo({
          url: `/pages/chat/chat?taskId=${this.taskId}&userId=${this.task.publisherId}`,
        });
      }
    },

    // 联系接单员
    contactAcceptor() {
      if (this.task && this.task.acceptorId) {
        uni.navigateTo({
          url: `/pages/chat/chat?taskId=${this.taskId}&userId=${this.task.acceptorId}`,
        });
      }
    },

    // 选择图片
    chooseImage() {
      if (this.confirmImages.length >= this.maxImages) {
        uni.showToast({
          title: `最多只能上传${this.maxImages}张图片`,
          icon: "none",
        });
        return;
      }

      uni.chooseImage({
        count: this.maxImages - this.confirmImages.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadImages(res.tempFilePaths);
        },
        fail: (error) => {
          // 检查是否是用户取消了选择
          if (error.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            console.error("选择图片失败:", error);
            uni.showToast({
              title: "选择图片失败",
              icon: "error",
            });
          }
        },
      });
    },

    // 上传图片
    async uploadImages(filePaths) {
      for (const filePath of filePaths) {
        try {
          await this.uploadSingleImage(filePath);
        } catch (error) {
          console.error("上传图片失败:", error);
          uni.showToast({
            title: "上传图片失败",
            icon: "none",
          });
        }
      }
    },

    // 上传单张图片
    async uploadSingleImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `https://xinghuoyuanbang.top/campushelper/api/v1/upload/orderConfirm`,
          filePath: filePath,
          name: "file",
          header: {
            Authorization: uni.getStorageSync("userAuthToken_xh") || "",
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              console.log("上传响应数据:", data);

              // 检查不同的成功响应格式
              if (data.success && data.url) {
                // 标准成功格式
                this.confirmImages.push(data.url);
                resolve(data.url);
              } else if (data.url) {
                // 只有url的情况
                this.confirmImages.push(data.url);
                resolve(data.url);
              } else if (data.success && data.data) {
                // 数据在data对象中的情况
                const responseData = data.data;
                const imageUrl =
                  responseData.url ||
                  responseData.imageUrl ||
                  responseData.image ||
                  responseData.fileUrl ||
                  responseData.file;
                if (imageUrl) {
                  this.confirmImages.push(imageUrl);
                  resolve(imageUrl);
                } else {
                  console.log("data对象内容:", responseData);
                  reject(new Error("上传成功但未在data中找到图片URL"));
                }
              } else if (data.success) {
                // 只有success的情况，可能url在其他字段
                const imageUrl =
                  data.imageUrl || data.image || data.fileUrl || data.file;
                if (imageUrl) {
                  this.confirmImages.push(imageUrl);
                  resolve(imageUrl);
                } else {
                  reject(new Error("上传成功但未返回图片URL"));
                }
              } else {
                reject(new Error(data.message || "上传失败"));
              }
            } catch (error) {
              console.error("解析上传响应失败:", error);
              reject(new Error("解析响应数据失败"));
            }
          },
          fail: (error) => {
            reject(error);
          },
        });
      });
    },

    // 预览图片
    previewImage(current) {
      uni.previewImage({
        current: current,
        urls: this.confirmImages,
      });
    },

    // 删除图片
    removeImage(index) {
      this.confirmImages.splice(index, 1);
    },

    // 格式化截止时间
    formatDeadline(deadline) {
      if (!deadline) return "";
      try {
        const date = new Date(deadline);

        // 将截止时间往后延长30分钟（自动取消时间）
        const autoCancelTime = new Date(date.getTime() + 30 * 60 * 1000);

        const month = autoCancelTime.getMonth() + 1;
        const day = autoCancelTime.getDate();
        const hours = autoCancelTime.getHours().toString().padStart(2, "0");
        const minutes = autoCancelTime.getMinutes().toString().padStart(2, "0");
        return `${month}月${day}日 ${hours}:${minutes}`;
      } catch (error) {
        return deadline;
      }
    },

    // 格式化订单号
    formatOrderNumber(outTradeNo) {
      if (!outTradeNo || outTradeNo === null || outTradeNo === "null")
        return "";
      // 去掉 ORDER 前缀，只保留数字部分
      const cleanOrderNo = outTradeNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime || dateTime === null || dateTime === "null") return "";
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (error) {
        return dateTime;
      }
    },

    // 获取任务地点显示文本
    getTaskLocation(task) {
      if (!task) return "未知地点";

      const taskType = task.taskType || "";

      // 根据任务类型优化地点显示
      switch (taskType) {
        case "倒垃圾":
          return "清理垃圾";

        case "搬运服务":
          // 解析具体信息，提取起始地点
          if (task.specifics) {
            const startLocationMatch = task.specifics.match(
              /起始地点[:：]\s*([^,，\n]+)/
            );
            if (startLocationMatch) {
              return startLocationMatch[1].trim();
            }
          }
          return task.locationText || "待确定";

        case "借物品":
          // 借物品任务显示借出地点
          if (task.specifics) {
            const locationMatch = task.specifics.match(
              /借出地点[:：]\s*([^,，\n]+)/
            );
            if (locationMatch) {
              return locationMatch[1].trim();
            }
          }
          return task.locationText || "待确定";

        default:
          return task.locationText || "待确定";
      }
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    getPublisherAvatar() {
      return (
        (this.task && this.task.publisher && this.task.publisher.avatarUrl) ||
        "/static/images/default-avatar.png"
      );
    },
    getPublisherName() {
      return (
        (this.task && this.task.publisher && this.task.publisher.nickname) ||
        "匿名用户"
      );
    },
    getAcceptorAvatar() {
      return (
        (this.task && this.task.acceptor && this.task.acceptor.avatarUrl) ||
        "/static/images/default-avatar.png"
      );
    },
    getAcceptorName() {
      return (
        (this.task && this.task.acceptor && this.task.acceptor.nickname) ||
        "匿名用户"
      );
    },
  },
};
</script>

<style scoped>
.order-process-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
  padding-bottom: 140rpx;
}

.status-section {
  padding: 0 32rpx;
  margin-bottom: 20rpx;
}

.status-card {
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  color: white;
  box-shadow: 0 8rpx 32rpx rgba(78, 203, 115, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 120rpx;
}

.status-icon {
  margin-bottom: 20rpx;
}

.status-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 8rpx;
}

.status-desc {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 0;
}

.task-detail-container {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 0 20rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.task-basic-info {
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.task-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.task-reward {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b35;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 15rpx;
  margin-bottom: 10rpx;
}

.task-type {
  font-size: 24rpx;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

/* 取快递 - 蓝色 */
.task-type-express {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

/* 取外卖 - 橙色 */
.task-type-takeaway {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

/* 借物品 - 绿色 */
.task-type-borrow {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

/* 代跑腿 - 紫色 */
.task-type-errand {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

/* 其他任务 - 灰色 */
.task-type-default {
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
}

.status-badge {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  color: white;
}

.status-open {
  background: #ff9500;
}

.status-assigned {
  background: #007aff;
}

.status-acceptor_done {
  background: #34c759;
}

.status-completed {
  background: #34c759;
}

.status-cancelled,
.status-rejected {
  background: #ff3b30;
}

.task-deadline {
  font-size: 24rpx;
  color: #ff6b35;
}

.task-description-block,
.task-details-block,
.task-location-block,
.order-info-block,
.publisher-info-block,
.acceptor-info-block {
  display: flex;
  align-items: flex-start;
  margin: 0 20rpx 32rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #fef7f7 0%, #fdf2f8 100%);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.publisher-info-block,
.acceptor-info-block {
  align-items: center;
}

.block-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
  margin-top: 5rpx;
}

.block-content {
  flex: 1;
}

.block-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  position: relative;
  padding-left: 16rpx;
}

.block-title::before {
  content: "|";
  position: absolute;
  left: 0;
  color: #4ecb73;
  font-weight: bold;
}

.block-text {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.publisher-details,
.acceptor-details {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.publisher-avatar,
.acceptor-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.publisher-name,
.acceptor-name {
  font-size: 26rpx;
  color: #333;
}

.publisher-detail {
  flex: 1;
}

.publisher-desc {
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}

.order-info-list {
  margin-top: 10rpx;
}

.order-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #eee;
}

.order-info-item:last-child {
  border-bottom: none;
}

.order-label {
  font-size: 24rpx;
  color: #666;
  min-width: 120rpx;
}

.order-value {
  font-size: 24rpx;
  color: #333;
  text-align: right;
  flex: 1;
}

.confirm-images-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx 0;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.confirm-images-card:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.95);
}

.confirm-images-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.confirm-images-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.confirm-image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.confirm-image-item:active {
  transform: scale(0.95);
}

.confirm-uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.confirm-image-actions {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  gap: 8rpx;
}

.action-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-icon {
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.delete-icon {
  background: rgba(255, 0, 0, 0.8);
  color: white;
}

.action-icon:active {
  transform: scale(0.9);
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #4ecb73;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
}

.upload-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.upload-tip {
  font-size: 20rpx;
  color: #999;
}

.fixed-bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.fixed-bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.reject-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #ff9500 0%, #e6850e 100%);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 8rpx 24rpx rgba(255, 149, 0, 0.3);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.reject-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(255, 149, 0, 0.4);
}

.complete-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 8rpx 24rpx rgba(78, 203, 115, 0.3);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.complete-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(78, 203, 115, 0.4);
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #4ecb73 0%, #44a08d 100%);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 8rpx 24rpx rgba(78, 203, 115, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(78, 203, 115, 0.5);
}

.contact-btn {
  background: linear-gradient(135deg, #ff3b30 0%, #d63031 100%);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 59, 48, 0.3);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.contact-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 59, 48, 0.4);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
}
</style>
