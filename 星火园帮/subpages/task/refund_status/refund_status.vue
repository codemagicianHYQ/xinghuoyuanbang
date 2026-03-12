<template>
  <view class="refund-status-container">
    <view class="header">
      <text class="title">退款状态</text>
    </view>

    <view class="refund-info">
      <view class="info-item">
        <text class="label">退款单号：</text>
        <text class="value">{{ refundInfo.refundNo }}</text>
      </view>
      <view class="info-item">
        <text class="label">退款金额：</text>
        <text class="value amount">¥{{ refundInfo.amount }}</text>
      </view>
      <view class="info-item">
        <text class="label">申请时间：</text>
        <text class="value">{{ formatDate(refundInfo.createdAt) }}</text>
      </view>
      <view class="info-item">
        <text class="label">退款原因：</text>
        <text class="value">{{ refundInfo.reason }}</text>
      </view>
    </view>

    <view class="status-timeline">
      <view class="timeline-item" :class="{ active: true }">
        <view class="timeline-dot"></view>
        <view class="timeline-content">
          <text class="timeline-title">退款申请已提交</text>
          <text class="timeline-time">{{
            formatDate(refundInfo.createdAt)
          }}</text>
        </view>
      </view>

      <view
        class="timeline-item"
        :class="{ active: refundInfo.status !== 'processing' }"
      >
        <view class="timeline-dot"></view>
        <view class="timeline-content">
          <text class="timeline-title">退款处理中</text>
          <text class="timeline-time" v-if="refundInfo.status !== 'processing'">
            {{ formatDate(refundInfo.updatedAt) }}
          </text>
        </view>
      </view>

      <view
        class="timeline-item"
        :class="{ active: refundInfo.status === 'success' }"
      >
        <view class="timeline-dot"></view>
        <view class="timeline-content">
          <text class="timeline-title">退款成功</text>
          <text class="timeline-time" v-if="refundInfo.status === 'success'">
            {{ formatDate(refundInfo.updatedAt) }}
          </text>
        </view>
      </view>
    </view>

    <view class="status-message" v-if="refundInfo.status === 'success'">
      <view class="success-icon">✓</view>
      <text class="message">退款已成功，预计1-3个工作日到账</text>
    </view>

    <view class="status-message" v-else-if="refundInfo.status === 'failed'">
      <view class="error-icon">✗</view>
      <text class="message">退款失败：{{ refundInfo.errorMsg }}</text>
    </view>

    <view class="status-message" v-else>
      <view class="processing-icon">⏳</view>
      <text class="message">退款处理中，请耐心等待</text>
    </view>

    <view class="action-buttons">
      <button
        class="refresh-btn"
        @click="refreshStatus"
        :loading="isRefreshing"
      >
        刷新状态
      </button>
      <button class="contact-btn" @click="contactService">联系客服</button>
    </view>
  </view>
</template>

<script>
import { getRefundStatus } from "@/common/refund.js";
// 移除date-fns导入，使用原生JavaScript日期方法

export default {
  data() {
    return {
      refundNo: "",
      refundInfo: {
        refundNo: "",
        amount: 0,
        reason: "",
        status: "processing",
        createdAt: null,
        updatedAt: null,
        errorMsg: "",
      },
      isRefreshing: false,
    };
  },

  onLoad(options) {
    this.refundNo = options.refundNo;
    this.loadRefundStatus();
  },

  methods: {
    async loadRefundStatus() {
      try {
        const res = await getRefundStatus(this.refundNo);
        if (res.success) {
          this.refundInfo = res.data;
        } else {
          uni.showToast({
            title: res.message || "加载退款状态失败",
            icon: "none",
          });
        }
      } catch (error) {
        uni.showToast({
          title: "网络错误，请稍后重试",
          icon: "none",
        });
      }
    },

    async refreshStatus() {
      this.isRefreshing = true;
      await this.loadRefundStatus();
      this.isRefreshing = false;

      uni.showToast({
        title: "状态已刷新",
        icon: "success",
      });
    },

    contactService() {
      uni.showModal({
        title: "联系客服",
        content: "如有疑问，请拨打客服电话：400-123-4567",
        showCancel: false,
        confirmText: "知道了",
      });
    },

    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.refund-status-container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.refund-info {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #666;
      font-size: 28rpx;
    }

    .value {
      color: #333;
      font-size: 28rpx;

      &.amount {
        color: #ff6b35;
        font-weight: bold;
      }
    }
  }
}

.status-timeline {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .timeline-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 30rpx;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 15rpx;
      top: 40rpx;
      width: 2rpx;
      height: 40rpx;
      background: #e9ecef;
    }

    .timeline-dot {
      width: 30rpx;
      height: 30rpx;
      border-radius: 50%;
      background: #e9ecef;
      margin-right: 20rpx;
      flex-shrink: 0;
      margin-top: 5rpx;
    }

    .timeline-content {
      flex: 1;

      .timeline-title {
        display: block;
        font-size: 28rpx;
        color: #999;
        margin-bottom: 8rpx;
      }

      .timeline-time {
        font-size: 24rpx;
        color: #ccc;
      }
    }

    &.active {
      .timeline-dot {
        background: #28a745;
      }

      .timeline-content {
        .timeline-title {
          color: #333;
        }

        .timeline-time {
          color: #666;
        }
      }
    }
  }
}

.status-message {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;

  .success-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #28a745;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: 20rpx;
  }

  .error-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #dc3545;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: 20rpx;
  }

  .processing-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #ffc107;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-right: 20rpx;
  }

  .message {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;

  .refresh-btn,
  .contact-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
  }

  .refresh-btn {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
  }

  .contact-btn {
    background: #f8f9fa;
    color: #666;
    border: 2rpx solid #e9ecef;
  }
}
</style>
