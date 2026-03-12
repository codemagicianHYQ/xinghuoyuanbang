<template>
  <view class="rider-center-container">
    <!-- 头部信息 -->
    <view class="rider-header">
      <view class="rider-info-card">
        <image
          class="rider-avatar"
          :src="userInfo.avatarUrl || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="rider-details">
          <text class="rider-name">{{ userInfo.nickname || "接单员" }}</text>
          <text class="rider-id">ID: {{ userInfo.id }}</text>
          <view class="rider-status">
            <text class="status-text">接单员· 校园</text>
          </view>
        </view>
      </view>

      <!-- 收益统计 -->
      <view class="earnings-stats">
        <view class="stat-item">
          <text class="stat-value">¥{{ userInfo.totalEarnings || 0 }}</text>
          <text class="stat-label">总收入</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">¥{{ userInfo.walletBalance || 0 }}</text>
          <text class="stat-label">当前余额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ completedTasksCount }}</text>
          <text class="stat-label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="section-title">接单管理</view>
      <view class="menu-grid">
        <view
          class="menu-item"
          @click="navigateTo('/subpages/profile/team-coordination')"
        >
          <view class="menu-icon">🤝</view>
          <text class="menu-text">团队协调</text>
        </view>
        <view
          class="menu-item"
          @click="navigateTo('/subpages/profile/my-accepted')"
        >
          <view class="menu-icon">📋</view>
          <text class="menu-text">我的接单</text>
        </view>
        <view class="menu-item" @click="navigateTo('/subpages/profile/wallet')">
          <view class="menu-icon">💰</view>
          <text class="menu-text">我的钱包</text>
        </view>
        <view
          class="menu-item"
          @click="navigateTo('/subpages/profile/messages')"
        >
          <view class="menu-icon">💬</view>
          <text class="menu-text">消息中心</text>
        </view>
      </view>
    </view>

    <!-- 校园自营接单团队 -->
    <view class="team-section">
      <view class="section-title">校园自营接单团队</view>

      <!-- 团队申请状态 -->
      <view class="team-status-card" v-if="teamApplication">
        <view class="status-header">
          <text class="status-title">申请状态</text>
          <view
            class="status-badge"
            :class="{
              'status-pending': teamApplication.status === 'pending',
              'status-approved': teamApplication.status === 'approved',
              'status-rejected': teamApplication.status === 'rejected',
            }"
          >
            {{ getStatusText(teamApplication.status) }}
          </view>
        </view>
        <view class="status-details">
          <text class="status-desc">
            {{ getStatusDescription(teamApplication.status) }}
          </text>
          <text class="apply-time" v-if="teamApplication.createdAt">
            申请时间：{{ formatDate(teamApplication.createdAt) }}
          </text>
        </view>
      </view>

      <!-- 团队信息 -->
      <view
        class="team-info-card"
        v-if="teamApplication && teamApplication.status === 'approved'"
      >
        <view class="team-header">
          <image
            :src="
              teamApplication.team.avatar || '/static/images/default-team.png'
            "
            class="team-avatar"
          />
          <view class="team-details">
            <text class="team-name">{{ teamApplication.team.name }}</text>
            <text class="team-desc">{{
              teamApplication.team.description
            }}</text>
          </view>
        </view>
        <view class="team-stats">
          <view class="team-stat">
            <text class="stat-number">{{
              teamApplication.team.memberCount || 0
            }}</text>
            <text class="stat-label">团队成员</text>
          </view>
          <view class="team-stat">
            <text class="stat-number">{{
              teamApplication.team.areaCount || 0
            }}</text>
            <text class="stat-label">负责区域</text>
          </view>
        </view>
      </view>

      <!-- 申请按钮 -->
      <view
        class="apply-section"
        v-if="!teamApplication || teamApplication.status === 'rejected'"
      >
        <button
          class="apply-team-btn"
          @click="showApplyTeamModal = true"
          :disabled="teamApplication && teamApplication.status === 'pending'"
        >
          {{
            teamApplication && teamApplication.status === "pending"
              ? "申请审核中"
              : "申请加入团队"
          }}
        </button>
        <text class="apply-tip">加入校园自营接单团队，享受更多优质订单</text>
      </view>
    </view>

    <!-- 申请团队弹窗 -->
    <view
      class="modal-overlay"
      v-if="showApplyTeamModal"
      @click="showApplyTeamModal = false"
    >
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">申请加入校园自营接单团队</text>
          <text class="modal-close" @click="showApplyTeamModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">申请理由</text>
            <textarea
              v-model="applyForm.reason"
              class="form-textarea"
              placeholder="请简述您的申请理由，如：课余时间充足、熟悉校园环境等"
              maxlength="200"
            />
            <text class="char-count">{{ applyForm.reason.length }}/200</text>
          </view>
          <view class="form-group">
            <text class="form-label">可接单时间</text>
            <textarea
              v-model="applyForm.availableTime"
              class="form-textarea"
              placeholder="请说明您的可接单时间段，如：周一至周五18:00-22:00，周末全天"
              maxlength="200"
            />
            <text class="char-count"
              >{{ applyForm.availableTime.length }}/200</text
            >
          </view>
        </view>
        <view class="modal-footer">
          <button
            class="modal-btn cancel-btn"
            @click="showApplyTeamModal = false"
          >
            取消
          </button>
          <button
            class="modal-btn confirm-btn"
            @click="submitTeamApplication"
            :disabled="!applyForm.reason.trim()"
          >
            提交申请
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapActions } from "vuex";
import config, { USER_AUTH_TOKEN_KEY } from "../../common/config.js";

export default {
  data() {
    return {
      completedTasksCount: 0,
      teamApplication: null,
      showApplyTeamModal: false,
      applyForm: {
        reason: "",
        availableTime: "",
      },
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
  },
  onShow() {
    if (this.hasLogin) {
      this.fetchTeamApplication();
      this.fetchCompletedTasksCount();
    }
  },
  methods: {
    ...mapActions(["fetchCurrentUserInfo"]),

    // 获取团队申请信息
    async fetchTeamApplication() {
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        if (!token) {
          this.handleLogout();
          return;
        }
        const [error, response] = await uni.request({
          url: `${this.$baseUrl}/team-applications/my-application`,
          method: "GET",
          header: { Authorization: `Bearer ${token}` },
        });
        if (error) return;

        if (response?.data?.success) {
          this.teamApplication = response.data.data;
        } else if (response?.statusCode === 401) {
          await this.tryRefreshToken();
        }
      } catch (err) {
        console.error("fetchTeamApplication error:", err);
      }
    },

    // 获取已完成任务数量
    async fetchCompletedTasksCount() {
      try {
        const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
        if (!token) return;
        const [error, response] = await uni.request({
          url: `${this.$baseUrl}/tasks/completed-count`,
          method: "GET",
          header: { Authorization: `Bearer ${token}` },
        });
        if (error) {
          this.completedTasksCount = 0;
          return;
        }

        if (response?.data?.success) {
          this.completedTasksCount = response.data.data.count;
        } else if (response?.statusCode === 401) {
          await this.tryRefreshToken();
        }
      } catch (err) {
        console.error("fetchCompletedTasksCount error:", err);
        this.completedTasksCount = 0;
      }
    },

    // 提交申请
    async submitTeamApplication() {
      if (!this.applyForm.reason.trim()) {
        return uni.showToast({ title: "请填写申请理由", icon: "none" });
      }
      try {
        const [error, response] = await uni.request({
          url: `${this.$baseUrl}/team-applications/apply`,
          method: "POST",
          header: {
            Authorization: `Bearer ${uni.getStorageSync(USER_AUTH_TOKEN_KEY)}`,
            "Content-Type": "application/json",
          },
          data: this.applyForm,
        });
        if (error) {
          uni.showToast({ title: "网络错误", icon: "none" });
          return;
        }
        if (response?.data?.success) {
          uni.showToast({ title: "申请提交成功", icon: "success" });
          this.showApplyTeamModal = false;
          this.applyForm = { reason: "", availableTime: "" };
          this.fetchTeamApplication();
        } else if (response?.statusCode === 401) {
          await this.tryRefreshToken();
        }
      } catch (err) {
        console.error("submitTeamApplication error:", err);
      }
    },

    // 状态文字
    getStatusText(status) {
      return (
        {
          pending: "审核中",
          approved: "已通过",
          rejected: "已拒绝",
        }[status] || "未知状态"
      );
    },

    getStatusDescription(status) {
      return (
        {
          pending: "您的申请正在审核中，请耐心等待管理员审核。",
          approved: "恭喜您已成功加入校园自营接单团队！",
          rejected: "很抱歉，您的申请未通过审核，可以重新申请。",
        }[status] || ""
      );
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    navigateTo(url) {
      uni.navigateTo({
        url,
        fail: (err) => {
          console.error("导航失败:", err);
          uni.showToast({ title: "页面打开失败", icon: "none" });
        },
      });
    },

    handleLogout() {
      uni.removeStorageSync(USER_AUTH_TOKEN_KEY);
      uni.removeStorageSync("userInfo");
      uni.navigateTo({ url: "/pages/login/login" });
    },

    async tryRefreshToken() {
      try {
        await this.fetchCurrentUserInfo();
      } catch (e) {
        this.handleLogout();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.rider-center-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.rider-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: white;
}

.rider-info-card {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.rider-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.rider-details {
  flex: 1;
}

.rider-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.rider-id {
  display: block;
  font-size: 24rpx;
  opacity: 0.8;
  margin-bottom: 10rpx;
}

.rider-status {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.status-text {
  font-size: 24rpx;
}

.earnings-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
}

.menu-section,
.team-section {
  margin: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.menu-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.menu-item:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.menu-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  color: white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.menu-text {
  display: block;
  font-size: 28rpx;
  color: #333;
}

.team-status-card,
.team-info-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.status-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-details {
  color: #666;
}

.status-desc {
  display: block;
  font-size: 26rpx;
  margin-bottom: 10rpx;
}

.apply-time {
  font-size: 24rpx;
  opacity: 0.8;
}

.team-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.team-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.team-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.team-desc {
  font-size: 24rpx;
  color: #666;
}

.team-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.team-stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.apply-section {
  text-align: center;
  background: white;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.apply-team-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.apply-team-btn:disabled {
  background: #ccc;
}

.apply-tip {
  font-size: 24rpx;
  color: #666;
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
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.modal-footer {
  display: flex;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.confirm-btn:disabled {
  background: #ccc;
}
</style>
