<template>
  <view class="after-sales-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </view>
      <text class="nav-title">售后申请</text>
    </view>

    <!-- 任务信息 -->
    <view v-if="task" class="task-info">
      <view class="info-header">
        <text class="info-title">任务信息</text>
      </view>

      <view class="task-card">
        <view class="task-title">{{ task.title }}</view>
        <view class="task-meta">
          <text class="task-type">{{ task.taskType }}</text>
          <text class="task-reward">¥{{ task.rewardAmount }}</text>
        </view>
        <view class="task-status">
          <text class="status-text">{{ getStatusText(task.status) }}</text>
        </view>
      </view>
    </view>

    <!-- 售后类型选择 -->
    <view class="issue-type">
      <view class="info-header">
        <text class="info-title">问题类型</text>
        <text v-if="isViewMode" class="status-badge" :class="statusClass">
          {{ statusText }}
        </text>
      </view>

      <view class="type-list">
        <view
          v-for="type in issueTypes"
          :key="type.value"
          class="type-item"
          :class="{
            'type-selected': selectedType === type.value,
            'type-disabled': isViewMode,
          }"
          @click="!isViewMode && selectType(type.value)"
        >
          <view class="type-icon">
            <uni-icons
              :type="type.icon"
              size="20"
              :color="selectedType === type.value ? '#4ecb73' : '#666'"
            ></uni-icons>
          </view>
          <view class="type-content">
            <text class="type-title">{{ type.label }}</text>
            <text class="type-desc">{{ type.desc }}</text>
          </view>
          <view class="type-check">
            <uni-icons
              v-if="selectedType === type.value"
              type="checkmarkempty"
              size="16"
              color="#4ecb73"
            ></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 问题描述 -->
    <view class="issue-description">
      <view class="info-header">
        <text class="info-title">问题描述</text>
      </view>

      <view class="description-input">
        <textarea
          v-model="description"
          placeholder="请详细描述您遇到的问题..."
          class="description-textarea"
          :maxlength="500"
          show-confirm-bar="false"
          :disabled="isViewMode"
        />
        <view class="char-count">{{ (description || "").length }}/500</view>
      </view>
    </view>

    <!-- 图片上传 -->
    <view class="image-upload">
      <view class="info-header">
        <text class="info-title">上传图片（选填）</text>
      </view>

      <view class="upload-area">
        <view v-for="(image, index) in images" :key="index" class="image-item">
          <image :src="image" class="uploaded-image" mode="aspectFill" />
          <view
            v-if="!isViewMode"
            class="image-delete"
            @click="deleteImage(index)"
          >
            <uni-icons type="close" size="16" color="#fff"></uni-icons>
          </view>
        </view>

        <view
          v-if="images.length < 3 && !isViewMode"
          class="upload-btn"
          @click="chooseImage"
        >
          <uni-icons type="camera" size="24" color="#999"></uni-icons>
          <text class="upload-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-info">
      <view class="info-header">
        <text class="info-title">联系方式</text>
      </view>

      <view class="contact-input">
        <input
          v-model="contactInfo"
          placeholder="请输入您的联系方式（手机号或微信号）"
          class="contact-text"
          :disabled="isViewMode"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view v-if="!isViewMode" class="submit-section">
      <button
        class="submit-btn"
        @click="submitAfterSales"
        :disabled="!canSubmit"
        :loading="isSubmitting"
      >
        提交申请
      </button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      taskId: null,
      task: null,
      isViewMode: false, // 是否为查看模式
      afterSalesDetail: null, // 售后申请详情
      selectedType: "",
      description: "",
      images: [],
      contactInfo: "",
      isSubmitting: false,
      issueTypes: [
        {
          value: "quality",
          label: "服务质量问题",
          desc: "接单员服务态度差、未按要求完成等",
          icon: "help",
        },
        {
          value: "delay",
          label: "超时未完成",
          desc: "超过约定时间仍未完成任务",
          icon: "time",
        },
        {
          value: "communication",
          label: "沟通问题",
          desc: "接单员沟通不畅、拒绝沟通等",
          icon: "chat",
        },
        {
          value: "refund",
          label: "申请退款",
          desc: "任务未完成或质量不达标要求退款",
          icon: "wallet",
        },
        {
          value: "other",
          label: "其他问题",
          desc: "其他需要客服介入的问题",
          icon: "more",
        },
      ],
    };
  },
  computed: {
    canSubmit() {
      return (
        this.selectedType && this.description.trim() && this.contactInfo.trim()
      );
    },
    statusText() {
      if (!this.afterSalesDetail || !this.afterSalesDetail.status) {
        return "未知状态";
      }
      return this.getStatusText(this.afterSalesDetail.status);
    },
    statusClass() {
      if (!this.afterSalesDetail || !this.afterSalesDetail.status) {
        return "status-unknown";
      }
      return this.getStatusClass(this.afterSalesDetail.status);
    },
  },
  onLoad(options) {
    this.taskId = options.id;
    this.isViewMode = options.view === "true"; // 检查是否为查看模式

    if (this.taskId) {
      this.fetchTaskDetail();
      if (this.isViewMode) {
        this.fetchAfterSalesDetail(); // 查看模式下获取售后申请详情
      }
    } else {
      uni.showToast({ title: "无效的任务ID", icon: "none" });
      this.goBack();
    }
  },
  methods: {
    async fetchTaskDetail() {
      try {
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });
        this.task = res;
      } catch (e) {
        console.error("获取任务详情失败:", e);
        uni.showToast({ title: "加载失败", icon: "none" });
        this.goBack();
      }
    },

    // 获取售后申请详情
    async fetchAfterSalesDetail() {
      try {
        const res = await request({
          url: `/after-sales/user`,
          method: "GET",
        });

        if (res && res.success && res.data && res.data.list) {
          // 找到该任务的售后申请
          const taskAfterSales = res.data.list.find(
            (item) => item.taskId == this.taskId
          );
          if (taskAfterSales) {
            this.afterSalesDetail = taskAfterSales;
            // 填充表单数据
            this.selectedType = taskAfterSales.issueType || "";
            this.description = taskAfterSales.description || "";
            this.images = taskAfterSales.images || [];
            this.contactInfo = taskAfterSales.contactInfo || "";
          }
        }
      } catch (e) {
        console.error("获取售后申请详情失败:", e);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    getStatusText(status) {
      if (!status) return "未知状态";

      const statusMap = {
        assigned: "进行中",
        acceptor_done: "待确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        pending: "待处理",
        processing: "处理中",
        resolved: "已解决",
        rejected: "已拒绝",
        cancelled: "已撤销",
      };
      return statusMap[status] || "未知状态";
    },

    getStatusClass(status) {
      if (!status) return "status-unknown";

      const classMap = {
        pending: "status-pending",
        processing: "status-processing",
        resolved: "status-resolved",
        rejected: "status-rejected",
        cancelled: "status-cancelled",
      };
      return classMap[status] || "status-unknown";
    },

    selectType(type) {
      this.selectedType = type;
    },

    chooseImage() {
      uni.chooseImage({
        count: 3 - this.images.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        },
      });
    },

    deleteImage(index) {
      this.images.splice(index, 1);
    },

    async submitAfterSales() {
      if (!this.canSubmit) return;

      this.isSubmitting = true;
      try {
        // 先上传图片
        const uploadedImages = [];
        for (let image of this.images) {
          try {
            const uploadRes = await new Promise((resolve, reject) => {
              uni.uploadFile({
                url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/afterSales",
                filePath: image,
                name: "file",
                header: {
                  Authorization: uni.getStorageSync("userAuthToken_xh") || "",
                },
                success: (res) => {
                  try {
                    const data = JSON.parse(res.data);
                    if (data.success && data.data && data.data.url) {
                      resolve(data.data.url);
                    } else if (data.url) {
                      resolve(data.url);
                    } else {
                      reject(new Error("上传成功但未返回图片URL"));
                    }
                  } catch (e) {
                    reject(new Error("响应解析失败: " + res.data));
                  }
                },
                fail: (err) => {
                  reject(err);
                },
              });
            });
            if (uploadRes) {
              uploadedImages.push(uploadRes);
            }
          } catch (e) {
            console.error("图片上传失败:", e);
            uni.showToast({
              title: "图片上传失败",
              icon: "none",
            });
          }
        }

        // 提交售后申请
        const res = await request({
          url: "/after-sales/submit",
          method: "POST",
          data: {
            taskId: this.taskId,
            issueType: this.selectedType,
            description: this.description,
            images: uploadedImages,
            contactInfo: this.contactInfo,
          },
        });

        if (res) {
          uni.showToast({
            title: "申请提交成功",
            icon: "success",
          });

          // 提交成功后，更新当前页面的状态为查看模式
          this.isViewMode = true;
          this.afterSalesDetail = res.data; // 使用后端返回的售后申请数据
          this.selectedType = res.data.issueType || "";
          this.description = res.data.description || "";
          this.images = res.data.images || [];
          this.contactInfo = res.data.contactInfo || "";
        }
      } catch (e) {
        console.error("提交售后申请失败:", e);
        uni.showToast({
          title: (e && e.message) || "提交失败",
          icon: "none",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style lang="scss" scoped>
.after-sales-container {
  min-height: 100vh;
  background: #f8faff;
  padding-bottom: 120rpx;
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-back {
  padding: 10rpx;
  margin-right: 20rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.task-info,
.issue-type,
.issue-description,
.image-upload,
.contact-info {
  background: #fff;
  border-radius: 24rpx;
  margin: 32rpx;
  overflow: hidden;
}

.info-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.task-card {
  padding: 32rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.task-type {
  background: #e8f5e8;
  color: #4ecb73;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.task-reward {
  color: #ff4e4e;
  font-size: 28rpx;
  font-weight: bold;
}

.task-status {
  text-align: right;
}

.status-text {
  background: #fff3e0;
  color: #ff9800;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.type-list {
  padding: 32rpx;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s;
}

.type-item.type-selected {
  border-color: #4ecb73;
  background: #f8fff8;
}

.type-icon {
  margin-right: 20rpx;
}

.type-content {
  flex: 1;
}

.type-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.type-desc {
  font-size: 24rpx;
  color: #666;
}

.type-check {
  margin-left: 20rpx;
}

.description-input {
  padding: 32rpx;
}

.description-textarea {
  width: 100%;
  min-height: 200rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.upload-area {
  padding: 32rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4e4e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.contact-input {
  padding: 32rpx;
}

/* 状态徽章样式 */
.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-pending {
  background-color: #ffa500;
}

.status-processing {
  background-color: #007bff;
}

.status-resolved {
  background-color: #28a745;
}

.status-rejected {
  background-color: #dc3545;
}

.status-cancelled {
  background-color: #6c757d;
}

.status-unknown {
  background-color: #6c757d;
}

/* 查看模式下的禁用样式 */
.type-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 查看模式下的表单样式 */
.description-textarea:disabled {
  background-color: #f5f5f5;
  color: #666;
  opacity: 0.8;
}

.contact-text:disabled {
  background-color: #f5f5f5;
  color: #666;
  opacity: 0.8;
}

.contact-text {
  width: 100%;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.submit-btn:disabled {
  background: #ccc;
}
</style>
