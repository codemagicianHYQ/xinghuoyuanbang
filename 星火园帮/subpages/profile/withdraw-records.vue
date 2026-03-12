<template>
  <view class="withdraw-records-container page-container">
    <!-- 记录列表 -->
    <view v-if="isLoading" class="loading-placeholder">
      <uni-load-more status="loading"></uni-load-more>
    </view>
    <view v-else-if="withdrawals.length === 0" class="empty-placeholder">
      <view class="empty-icon">📄</view>
      <text class="empty-text">暂无提现记录</text>
    </view>
    <view v-else class="withdrawals-list">
      <view
        class="withdrawal-item card"
        v-for="item in withdrawals"
        :key="item.id"
      >
        <view class="item-header">
          <text class="item-amount">¥{{ item.amount.toFixed(2) }}</text>
          <text class="item-status" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </text>
        </view>
        <view class="item-details">
          <view class="detail-row">
            <text class="detail-label">提现方式:</text>
            <text class="detail-value">{{
              getWithdrawTypeText(item.withdrawType)
            }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申请时间:</text>
            <text class="detail-value">{{ formatDate(item.applyTime) }}</text>
          </view>
          <view class="detail-row" v-if="item.processTime">
            <text class="detail-label">处理时间:</text>
            <text class="detail-value">{{ formatDate(item.processTime) }}</text>
          </view>
          <view class="detail-row" v-if="item.completeTime">
            <text class="detail-label">完成时间:</text>
            <text class="detail-value">{{
              formatDate(item.completeTime)
            }}</text>
          </view>
          <view class="detail-row" v-if="item.rejectReason">
            <text class="detail-label">拒绝原因:</text>
            <text class="detail-value reject-reason">{{
              item.rejectReason
            }}</text>
          </view>
          <!-- 第三方转账状态查询-->
          <view
            class="detail-row"
            v-if="item.status === 'processing' && item.thirdPartyOrderId"
          >
            <text class="detail-label">转账状态</text>
            <text class="detail-value">
              <text
                class="query-status-btn"
                @click="queryTransferStatus(item.id)"
              >
                查询状态
              </text>
            </text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <uni-load-more :status="loadMoreStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      withdrawals: [],
      isLoading: true,
      currentPage: 1,
      totalPages: 1,
      loadMoreStatus: "more",
    };
  },

  onLoad() {
    this.fetchWithdrawals(true);
  },
  onReachBottom() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchWithdrawals(false);
    } else {
      this.loadMoreStatus = "noMore";
    }
  },
  methods: {
    async fetchWithdrawals(isRefresh = false) {
      if (isRefresh) {
        this.withdrawals = [];
        this.currentPage = 1;
      }
      this.isLoading = this.currentPage === 1;
      this.loadMoreStatus = "loading";

      try {
        const response = await request({
          url: "/wallet/withdrawals",
          method: "GET",
          data: {
            page: this.currentPage,
            limit: 15,
          },
        });

        if (
          response &&
          response.success &&
          response.data &&
          response.data.withdrawals
        ) {
          const newWithdrawals = response.data.withdrawals.map((item) => ({
            id: item.id,
            amount: parseFloat(item.amount),
            status: item.status,
            withdrawType: item.withdrawType,
            applyTime: item.applyTime,
            processTime: item.processTime,
            completeTime: item.completeTime,
            rejectReason: item.rejectReason,
            thirdPartyOrderId: item.thirdPartyOrderId,
            failReason: item.failReason,
          }));

          if (isRefresh) {
            this.withdrawals = newWithdrawals;
          } else {
            this.withdrawals = this.withdrawals.concat(newWithdrawals);
          }

          this.totalPages = response.data.totalPages || 1;
          this.loadMoreStatus =
            this.currentPage >= this.totalPages ? "noMore" : "more";
        } else {
          this.loadMoreStatus = "noMore";
        }

        if (this.withdrawals.length === 0) {
          this.loadMoreStatus = "noMore";
        }
      } catch (error) {
        console.error("获取提现记录失败:", error);
        this.loadMoreStatus = "more";
        uni.showToast({ title: "获取提现记录失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },

    getStatusText(status) {
      const statusMap = {
        pending: "申请中",
        approved: "已通过",
        rejected: "已拒绝",
        completed: "已完成",
        processing: "处理中",
        failed: "失败",
      };
      return statusMap[status] || "未知状态";
    },

    getStatusClass(status) {
      const classMap = {
        pending: "status-pending",
        approved: "status-approved",
        rejected: "status-rejected",
        completed: "status-completed",
        processing: "status-processing",
        failed: "status-failed",
      };
      return classMap[status] || "";
    },

    getWithdrawTypeText(type) {
      const typeMap = {
        wechat: "微信零钱",
        bank: "银行",
      };
      return typeMap[type] || "未知方式";
    },

    formatDate(dateString) {
      if (!dateString) return "未知时间";
      const date = new Date(dateString);

      // 检查日期是否有空
      if (isNaN(date.getTime())) {
        return "时间格式错误";
      }

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },

    // 查询第三方转账状态
    async queryTransferStatus(withdrawalId) {
      try {
        uni.showLoading({ title: "查询中..." });

        const response = await request({
          url: `/wallet/withdrawals/${withdrawalId}/status`,
          method: "GET",
        });

        if (response && response.success) {
          const result = response.data;
          uni.showToast({
            title: result.message,
            icon: "success",
          });

          // 刷新提现记录
          this.fetchWithdrawals(true);
        } else {
          uni.showToast({
            title: response.message || "查询失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("查询转账状态失败", error);
        uni.showToast({
          title: "查询失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}

.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  margin-bottom: $uni-spacing-row-lg;
  padding: $uni-spacing-col-lg;
}

.empty-placeholder {
  text-align: center;
  padding: 60rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: $uni-spacing-row-base;
    opacity: 0.5;
  }

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-light;
  }
}

.loading-placeholder {
  padding: $uni-spacing-row-lg 0;
}

.withdrawals-list {
  .withdrawal-item {
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $uni-spacing-row-base;

      .item-amount {
        font-size: $uni-font-size-xl;
        font-weight: bold;
        color: $uni-text-color;
      }

      .item-status {
        font-size: $uni-font-size-base;
        padding: 5rpx 15rpx;
        border-radius: 15rpx;
        font-weight: 500;

        &.status-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        &.status-approved {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        &.status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        &.status-completed {
          background-color: #d4edda;
          color: #155724;
        }

        &.status-processing {
          background-color: #fff3cd;
          color: #856404;
        }

        &.status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }
      }
    }

    .item-details {
      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8rpx 0;
        border-bottom: 1px solid $uni-border-color-light;

        &:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: $uni-font-size-sm;
          color: $uni-text-color-light;
        }

        .detail-value {
          font-size: $uni-font-size-sm;
          color: $uni-text-color;

          &.reject-reason {
            color: #dc3545;
            max-width: 60%;
            text-align: right;
          }

          .query-status-btn {
            color: #007aff;
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
