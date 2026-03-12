<template>
  <view class="order-cancel-container">
    <view class="header">
      <text class="title">取消订单</text>
    </view>

    <view class="order-info">
      <view class="order-item">
        <text class="label">订单号：</text>
        <text class="value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="order-item">
        <text class="label">任务标题：</text>
        <text class="value">{{ orderInfo.taskTitle }}</text>
      </view>
      <view class="order-item">
        <text class="label">订单金额：</text>
        <text class="value amount">¥{{ formatAmount(orderInfo.amount) }}</text>
      </view>
      <view class="order-item">
        <text class="label">支付时间：</text>
        <text class="value">{{ formatDate(orderInfo.payTime) }}</text>
      </view>
    </view>

    <view class="cancel-form">
      <view class="form-item">
        <text class="label">取消原因 <text class="required">*</text></text>
        <picker :range="cancelReasons" @change="onReasonChange">
          <view class="picker-value">
            {{ selectedReason || "请选择取消原因" }}
            <text class="arrow">></text>
          </view>
        </picker>
      </view>

      <view class="form-item" v-if="selectedReason === '其他'">
        <text class="label">详细说明</text>
        <textarea
          v-model="customReason"
          placeholder="请详细说明取消原因"
          class="textarea"
          maxlength="200"
        />
      </view>

      <view class="refund-info">
        <text class="refund-title">退款信息</text>
        <view class="refund-item">
          <text class="label">退款金额：</text>
          <text class="value">¥{{ formatAmount(orderInfo.amount) }}</text>
        </view>
        <view class="refund-item">
          <text class="label">退款方式：</text>
          <text class="value">微信零钱</text>
        </view>
        <view class="refund-item">
          <text class="label">预计到账：</text>
          <text class="value">立刻到账</text>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <button class="cancel-btn" @click="goBack" :disabled="isSubmitting">
        返回
      </button>
      <button
        class="confirm-btn"
        @click="confirmCancel"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        确认取消
      </button>
    </view>
  </view>
</template>

<script>
import request from "../../../common/request.js";

export default {
  data() {
    return {
      orderId: "",
      orderInfo: {
        orderNo: "",
        taskTitle: "",
        amount: 0,
        payTime: null,
        taskType: "",
        borrowMode: "",
      },
      cancelReasons: [
        "任务已完成，不需要了",
        "时间安排有冲突",
        "找到了其他解决方式",
        "价格不合适",
        "其他",
      ],
      selectedReason: "",
      customReason: "",
      isSubmitting: false,
    };
  },

  onLoad(options) {
    this.orderId = options.orderId;
    this.loadOrderInfo();
  },

  methods: {
    async loadOrderInfo() {
      try {
        console.log("开始加载任务信息，taskId:", this.orderId);
        const res = await request({
          url: `/tasks/${this.orderId}`,
          method: "GET",
        });
        console.log("任务信息加载结果:", res);

        if (res && res.taskType === "学习伙伴") {
          uni.showToast({
            title: "学习伙伴活动请使用专用取消功能",
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }

        if (res && res.status === "cancelled") {
          uni.showToast({
            title: "该订单已经取消",
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }

        if (res && res.refund_status === "full") {
          uni.showToast({
            title: "该订单已经退款",
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }

        if (res && res.id) {
          let orderNo;
          if (res.out_trade_no) {
            orderNo = res.out_trade_no.replace(/^ORDER\s*/, "");
          } else {
            orderNo = "暂未生成";
          }

          this.orderInfo = {
            orderNo,
            taskTitle: res.title,
            amount: res.rewardAmount,
            payTime: res.createdAt,
            taskType: res.taskType,
            borrowMode: res.borrowMode,
          };
        } else {
          uni.showToast({
            title: "加载任务信息失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("加载任务信息异常:", error);
        uni.showToast({
          title: "加载任务信息失败",
          icon: "none",
        });
      }
    },

    onReasonChange(e) {
      this.selectedReason = this.cancelReasons[e.detail.value];
    },

    formatDate(date) {
      if (!date) return "";
      try {
        const dateObj = new Date(date);
        const y = dateObj.getFullYear();
        const m = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const d = dateObj.getDate().toString().padStart(2, "0");
        const h = dateObj.getHours().toString().padStart(2, "0");
        const min = dateObj.getMinutes().toString().padStart(2, "0");
        return `${y}-${m}-${d} ${h}:${min}`;
      } catch (err) {
        console.error("日期格式化失败:", err);
        return date;
      }
    },

    formatAmount(amount) {
      if (amount === null || amount === undefined) return "0.00";
      return parseFloat(amount).toFixed(2);
    },

    async confirmCancel() {
      if (!this.selectedReason) {
        uni.showToast({
          title: "请选择取消原因",
          icon: "none",
        });
        return;
      }

      if (this.selectedReason === "其他" && !this.customReason.trim()) {
        uni.showToast({
          title: "请填写详细说明",
          icon: "none",
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const reason =
          this.selectedReason === "其他"
            ? this.customReason.trim()
            : this.selectedReason;

        // 检查是否是借出模式任务
        if (
          this.orderInfo.taskType === "借物品" &&
          this.orderInfo.borrowMode === "lend"
        ) {
          // 借出模式任务：直接调用取消订单接口
          const res = await request({
            url: `/tasks/${this.orderId}`,
            method: "PUT",
            data: {
              status: "cancelled",
              remarks: reason,
            },
          });

          if (res.message) {
            uni.showToast({
              title: "订单取消成功",
              icon: "success",
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: "取消订单失败",
              icon: "none",
            });
          }
        } else {
          // 其他任务：调用退款接口
          const res = await request({
            url: "/refund/apply",
            method: "POST",
            data: {
              taskId: this.orderId,
              refundAmount: 0,
              refundReason: reason,
            },
          });

          if (res.success) {
            uni.showToast({
              title: "订单取消成功，退款已处理",
              icon: "success",
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "取消订单失败",
              icon: "none",
            });
          }
        }
      } catch (error) {
        console.error("取消订单失败:", error);
        let errorMessage = "网络错误，请稍后重试";

        if (error.statusCode === 400) {
          if (error.data && error.data.message) {
            errorMessage = error.data.message;
          } else if (error.data && error.data.error) {
            errorMessage = error.data.error;
          } else if (typeof error.data === "string") {
            errorMessage = error.data;
          }

          if (
            errorMessage.includes("订单已全额退款") ||
            errorMessage.includes("已全额退款")
          ) {
            errorMessage = "该订单已经退款，无需重复操作";
            uni.showToast({
              title: "订单已退款，正在返回",
              icon: "success",
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
            return;
          }
        }

        uni.showToast({
          title: errorMessage,
          icon: "none",
          duration: 3000,
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
.order-cancel-container {
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

.order-info {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .order-item {
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

.cancel-form {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);

  .form-item {
    margin-bottom: 30rpx;

    .label {
      display: block;
      color: #333;
      font-size: 28rpx;
      margin-bottom: 15rpx;

      .required {
        color: #ff6b35;
      }
    }

    .picker-value {
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 12rpx;
      padding: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
      color: #333;

      .arrow {
        color: #999;
        font-size: 24rpx;
      }
    }

    .textarea {
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 12rpx;
      padding: 20rpx;
      width: 100%;
      min-height: 120rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }
  }
}

.refund-info {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  border-left: 6rpx solid #28a745;

  .refund-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .refund-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #666;
      font-size: 26rpx;
    }

    .value {
      color: #333;
      font-size: 26rpx;
      font-weight: 500;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
  }

  .cancel-btn {
    background: #f8f9fa;
    color: #666;
    border: 2rpx solid #e9ecef;
  }

  .confirm-btn {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;

    &:disabled {
      background: #ccc;
      color: #999;
    }
  }
}
</style>
