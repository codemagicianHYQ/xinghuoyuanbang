<template>
  <view class="team-coordination-container">
    <!-- 头部信息 -->
    <view class="header-section">
      <view class="header-title">团队协调</view>
      <view class="header-subtitle">管理您的接单任务</view>
    </view>

    <!-- 进行中的订单 -->
    <view class="section">
      <view class="section-title">进行中的订单</view>
      <view v-if="loading" class="loading-placeholder">
        <text>加载中...</text>
      </view>
      <view v-else-if="activeOrders.length === 0" class="empty-placeholder">
        <view class="empty-icon">暂无</view>
        <text class="empty-text">暂无进行中的订单</text>
      </view>
      <view v-else class="order-list">
        <view class="order-item" v-for="order in activeOrders" :key="order.id">
          <view class="order-info">
            <text class="order-title">{{ order.title }}</text>
            <text class="order-type">{{
              getTaskTypeText(order.taskType)
            }}</text>
            <text class="order-amount">¥{{ order.rewardAmount }}</text>
            <text class="order-time"
              >创建: {{ formatDate(order.createdAt) }}</text
            >
            <text class="order-time" v-if="order.acceptedAt"
              >接单: {{ formatDate(order.acceptedAt) }}</text
            >
            <text class="order-time" v-if="order.publisherConfirmedTime"
              >完成: {{ formatDate(order.publisherConfirmedTime) }}</text
            >
          </view>
          <view class="order-actions">
            <button
              class="action-btn transfer-btn"
              @click="showTransferModal(order)"
              :disabled="!canTransfer(order)"
            >
              转单
            </button>
            <button
              class="action-btn reject-btn"
              @click="showRejectModal(order)"
              :disabled="!canReject(order)"
            >
              驳回
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 转单模态框 -->
    <view v-if="showTransfer" class="modal-overlay" @click="closeTransferModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">转单给团队成员</text>
          <text class="modal-close" @click="closeTransferModal">关闭</text>
        </view>
        <view class="modal-body">
          <text class="modal-subtitle">选择要转单的团队成员</text>
          <view class="team-members">
            <view
              class="member-item"
              v-for="member in availableMembers"
              :key="member.id"
              @click="selectMember(member)"
              :class="{
                selected: selectedMember && selectedMember.id === member.id,
              }"
            >
              <image
                class="member-avatar"
                :src="member.avatarUrl || '/static/images/default-avatar.png'"
                mode="aspectFill"
              />
              <view class="member-info">
                <text class="member-name">{{ member.nickname }}</text>
                <text class="member-status">在线</text>
              </view>
            </view>
          </view>
          <view v-if="availableMembers.length === 0" class="no-members">
            <text>暂无可转单的团队成员</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeTransferModal">
            取消
          </button>
          <button
            class="modal-btn confirm-btn"
            @click="confirmTransfer"
            :disabled="!selectedMember"
          >
            确认转单
          </button>
        </view>
      </view>
    </view>

    <!-- 驳回模态框 -->
    <view v-if="showReject" class="modal-overlay" @click="closeRejectModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">驳回订单</text>
          <text class="modal-close" @click="closeRejectModal">关闭</text>
        </view>
        <view class="modal-body">
          <text class="modal-subtitle">确认要驳回此订单吗？</text>
          <view class="order-detail">
            <text class="order-title">{{
              selectedOrder && selectedOrder.title
            }}</text>
            <text class="order-type">{{
              getTaskTypeText(selectedOrder && selectedOrder.taskType)
            }}</text>
            <text class="order-amount"
              >¥{{ selectedOrder && selectedOrder.rewardAmount }}</text
            >
          </view>
          <text class="warning-text"
            >驳回后订单将返回订单大厅，系统会通知发布者</text
          >
          <text class="time-limit-text"
            >注意：驳回功能仅在接单后10分钟内有效</text
          >
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeRejectModal">
            取消
          </button>
          <button class="modal-btn reject-confirm-btn" @click="confirmReject">
            确认驳回
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";
import config, { USER_AUTH_TOKEN_KEY } from "../../common/config.js";

export default {
  data() {
    return {
      activeOrders: [],
      teamMembers: [],
      loading: false,
      showTransfer: false,
      showReject: false,
      selectedOrder: null,
      selectedMember: null,
    };
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.userInfo || {},
      hasLogin: (state) => state.hasLogin,
    }),
    $baseUrl() {
      return config.baseURL;
    },
    availableMembers() {
      if (!this.selectedOrder) {
        return this.teamMembers.filter((m) => m.id !== this.userInfo.id);
      }
      return this.teamMembers.filter(
        (m) =>
          m.id !== this.userInfo.id && m.id !== this.selectedOrder.publisherId
      );
    },
  },
  onLoad() {
    if (this.hasLogin) {
      this.fetchActiveOrders();
      this.fetchTeamMembers();
    }
  },
  onShow() {
    if (this.hasLogin) {
      this.fetchActiveOrders();
      this.fetchTeamMembers();
    }
  },
  methods: {
    async fetchActiveOrders() {
      this.loading = true;
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        if (!token) return this.handleAuthError();

        const [error, res] = await uni.request({
          url: `${this.$baseUrl}/tasks/my-accepted`,
          method: "GET",
          header: { Authorization: `Bearer ${token}` },
        });

        if (error) throw error;

        let orders = [];
        if (res.data.success && res.data.data) {
          orders = res.data.data;
        } else if (res.data.tasks) {
          orders = res.data.tasks;
        }

        this.activeOrders = orders.filter(
          (o) => o.status === "assigned" || o.status === "in_progress"
        );
      } catch (err) {
        console.error("获取进行中订单失败", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchTeamMembers() {
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        if (!token) return;

        const [error, res] = await uni.request({
          url: `${this.$baseUrl}/team-members/my-team`,
          method: "GET",
          header: { Authorization: `Bearer ${token}` },
        });

        if (error) throw error;
        if (res.data.success) this.teamMembers = res.data.data;
      } catch (err) {
        console.error("获取团队成员失败:", err);
      }
    },

    canTransfer(order) {
      return this.availableMembers.length > 0;
    },

    canReject(order) {
      if (!order || !order.acceptedAt) return false;
      const diff = new Date() - new Date(order.acceptedAt);
      return diff <= 10 * 60 * 1000;
    },

    showTransferModal(order) {
      this.selectedOrder = order;
      this.selectedMember = null;
      this.showTransfer = true;
    },

    closeTransferModal() {
      this.showTransfer = false;
      this.selectedOrder = null;
      this.selectedMember = null;
    },

    selectMember(member) {
      this.selectedMember = member;
    },

    async confirmTransfer() {
      if (!this.selectedOrder || !this.selectedMember) return;
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        const [error, res] = await uni.request({
          url: `${this.$baseUrl}/tasks/${this.selectedOrder.id}/transfer`,
          method: "POST",
          header: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { newAcceptorId: this.selectedMember.id },
        });

        if (error) throw error;
        if (res.data.success) {
          uni.showToast({ title: "转单成功", icon: "success" });
          this.closeTransferModal();
          this.fetchActiveOrders();
        } else {
          uni.showToast({
            title: res.data.message || "转单失败",
            icon: "none",
          });
        }
      } catch (err) {
        uni.showToast({ title: "转单失败", icon: "none" });
      }
    },

    showRejectModal(order) {
      if (!this.canReject(order)) {
        return uni.showModal({
          title: "提示",
          content: "驳回订单仅限于接单后10分钟内，超过时间无法驳回",
          showCancel: false,
          confirmText: "知道了",
        });
      }
      this.selectedOrder = order;
      this.showReject = true;
    },

    closeRejectModal() {
      this.showReject = false;
      this.selectedOrder = null;
    },

    async confirmReject() {
      if (!this.selectedOrder) return;
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        const [error, res] = await uni.request({
          url: `${this.$baseUrl}/tasks/${this.selectedOrder.id}/reject`,
          method: "POST",
          header: { Authorization: `Bearer ${token}` },
        });

        if (error) throw error;
        if (res.data.success) {
          uni.showToast({ title: "订单已驳回", icon: "success" });
          this.closeRejectModal();
          this.fetchActiveOrders();
        } else {
          uni.showToast({
            title: res.data.message || "驳回失败",
            icon: "none",
          });
        }
      } catch (err) {
        uni.showToast({ title: "驳回失败", icon: "none" });
      }
    },

    getTaskTypeText(type) {
      const map = {
        取快递: "取快递",
        跑腿: "跑腿",
        学习辅导: "学习辅导",
        其他: "其他",
      };
      return map[type] || type;
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}-${d.getDate()} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    },

    handleAuthError() {
      uni.removeStorageSync(USER_AUTH_TOKEN_KEY);
      uni.removeStorageSync("userInfo");
      uni.navigateTo({ url: "/pages/login/login" });
    },
  },
};
</script>

<style lang="scss">
.team-coordination-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  color: white;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.header-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

.section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}

.loading-placeholder,
.empty-placeholder {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
}

.empty-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 30rpx;
  background: #fafafa;
}

.order-info {
  margin-bottom: 20rpx;
}

.order-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.order-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  margin-right: 20rpx;
}

.order-amount {
  color: #4caf50;
  font-weight: bold;
  font-size: 28rpx;
}

.order-time {
  color: #999;
  font-size: 24rpx;
  display: block;
  margin-top: 10rpx;
}

.order-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  color: white;
}

.transfer-btn {
  background: #2196f3;
}

.transfer-btn:disabled {
  background: #ccc;
  color: #999;
}

.reject-btn {
  background: #f44336;
}

.reject-btn:disabled {
  background: #ccc;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 28rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s;
}

.member-item.selected {
  border-color: #2196f3;
  background: #e3f2fd;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.member-status {
  font-size: 24rpx;
  color: #4caf50;
}

.no-members {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.order-detail {
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.warning-text {
  color: #f44336;
  font-size: 24rpx;
  text-align: center;
  margin-bottom: 10rpx;
}

.time-limit-text {
  color: #ff9800;
  font-size: 22rpx;
  text-align: center;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 2rpx solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  color: white;
}

.cancel-btn {
  background: #999;
}

.confirm-btn {
  background: #2196f3;
}

.confirm-btn:disabled {
  background: #ccc;
  color: #999;
}

.reject-confirm-btn {
  background: #f44336;
}
</style>
