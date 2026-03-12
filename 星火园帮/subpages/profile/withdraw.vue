<template>
  <view class="withdraw-page">
    <view class="header">
      <text class="title">提现到微信零钱</text>
    </view>

    <view class="balance-section">
      <text class="balance-label">当前余额</text>
      <text class="balance-amount">¥{{ walletBalance }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">提现金额 <text class="required">*</text></text>
        <input
          v-model="amount"
          type="digit"
          placeholder="请输入提现金额（最低0.3元）"
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">提现方式</text>
        <view class="withdraw-type">
          <text class="type-text">微信零钱</text>
        </view>
      </view>

      <button
        @click="applyWithdrawal"
        :disabled="isProcessingWithdrawal"
        class="btn-primary"
      >
        {{ isProcessingWithdrawal ? "处理中..." : "申请提现" }}
      </button>
    </view>

    <!-- 提现记录部分 -->
    <view class="records-section">
      <view class="section-header">
        <text class="section-title">提现记录</text>
        <text @click="goToWithdrawRecords" class="view-all">查看全部</text>
      </view>

      <view v-if="recentWithdrawals.length > 0" class="records-list">
        <view
          v-for="record in recentWithdrawals"
          :key="record.id"
          class="record-item"
        >
          <view class="record-info">
            <text class="record-amount">¥{{ record.amount }}</text>
            <text class="record-time">{{ formatTime(record.applyTime) }}</text>
          </view>
          <view class="record-status">
            <text :class="['status-text', getStatusClass(record.status)]">
              {{ getStatusText(record.status) }}
            </text>
          </view>
        </view>
      </view>

      <view v-else class="empty-records">
        <text class="empty-text">暂无提现记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: "",
      walletBalance: 0,
      isProcessingWithdrawal: false,
      recentWithdrawals: [],
      // optional: store last api errors if needed
    };
  },

  computed: {
    canSubmit() {
      const parsed = parseFloat(this.amount);
      if (Number.isNaN(parsed)) return false;
      const amountValid = parsed >= 0.3;
      const balanceValid = parsed <= Number(this.walletBalance);
      const amountNotEmpty =
        this.amount !== "" && this.amount !== null && this.amount !== undefined;

      return amountValid && balanceValid && amountNotEmpty;
    },
  },

  mounted() {
    // Vue 3 mounted: 页面首次进入时加载
    this.getWalletBalance();
    this.getRecentWithdrawals();
  },

  // uni-app 页面显示时也希望刷新（如果运行在 uni-app 环境）
  onShow() {
    if (typeof this.getWalletBalance === "function") {
      this.getWalletBalance();
      this.getRecentWithdrawals();
    }
  },

  methods: {
    // Helper: uni.request -> Promise wrapper (works with uni-app)
    requestPromise(options = {}) {
      return new Promise((resolve, reject) => {
        const opt = Object.assign({}, options, {
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        });
        uni.request(opt);
      });
    },

    // clean token and ensure a proper "Bearer ..." prefix
    normalizeToken(token) {
      if (!token) return "";
      let t = String(token).trim();

      // Remove repeated 'Bearer ' prefixes
      while (t.toLowerCase().startsWith("bearer bearer ")) {
        t = t.substring("bearer ".length).trim();
      }
      if (!t.toLowerCase().startsWith("bearer ")) {
        t = "Bearer " + t.replace(/^bearer\s*/i, "");
      }
      return t;
    },

    async getWalletBalance() {
      try {
        const rawToken = uni.getStorageSync("userAuthToken_xh") || "";
        const token = this.normalizeToken(rawToken);

        // If no token, early exit
        if (!token) {
          console.warn("未检测到 token，跳转登录或显示余额为0");
          this.walletBalance = 0;
          return;
        }

        const response = await this.requestPromise({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/wallet/balance",
          method: "GET",
          header: {
            Authorization: token,
          },
        });

        // response: { statusCode, data, ... }
        if (
          response &&
          response.statusCode === 200 &&
          response.data &&
          response.data.success
        ) {
          // API 返回余额字段名可能不同，兼容处理
          const balance = response.data.balance ?? response.data.data ?? 0;
          this.walletBalance = Number(balance) || 0;
        } else {
          // 非200或success=false
          const code = response?.statusCode;
          // 特殊处理401
          if (code === 401) {
            // 如果是正在处理提现，不强制清除token（保持与原逻辑）
            if (this.isProcessingWithdrawal) {
              uni.showToast({ title: "认证失败，请稍后重试", icon: "none" });
            } else {
              uni.showToast({ title: "认证失败，请重新登录", icon: "none" });
              // 清除 token 并跳转登录（稍后）
              uni.removeStorageSync("userAuthToken_xh");
              setTimeout(() => {
                uni.navigateTo({ url: "/pages/login/login" });
              }, 1200);
            }
          } else if (code === 404) {
            uni.showToast({ title: "接口不存在", icon: "none" });
          } else if (code >= 500) {
            uni.showToast({ title: "服务器错误，请稍后重试", icon: "none" });
          } else {
            // 其他错误，保持余额为0
            console.warn("getWalletBalance 响应异常:", response);
            uni.showToast({
              title: response?.data?.message || "获取余额失败",
              icon: "none",
            });
          }
          // 保证 walletBalance 不为 undefined
          if (typeof this.walletBalance !== "number") this.walletBalance = 0;
        }
      } catch (err) {
        console.error("getWalletBalance 错误:", err);
        // 错误分类提示
        const msg = (err && err.errMsg) || (err && err.message) || "网络错误";
        if (msg.toLowerCase().includes("timeout")) {
          uni.showToast({ title: "请求超时，请检查网络", icon: "none" });
        } else if (msg.toLowerCase().includes("fail")) {
          uni.showToast({
            title: "网络连接失败，请检查网络设置",
            icon: "none",
          });
        } else {
          uni.showToast({ title: "获取余额失败，请稍后重试", icon: "none" });
        }
        this.walletBalance = 0;
      }
    },

    // navigate to profile edit page (kept from original)
    goToProfileEdit() {
      uni.navigateTo({
        url: "/subpages/profile/edit-info",
        success: () => {
          // noop
        },
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({ title: "页面跳转失败", icon: "none" });
        },
      });
    },

    generateOrderId() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `W${timestamp}${random}`;
    },

    // 处理回调（如果后台异步处理并回调前端）
    async handleAuthCallback(authData) {
      try {
        this.isProcessingWithdrawal = true;
        const { u_openid } = authData || {};
        if (!u_openid) {
          throw new Error("未获取到OpenID");
        }
        uni.showToast({
          title: "提现成功！资金已转入微信零钱",
          icon: "success",
        });
        // 更新状态并刷新
        await this.getWalletBalance();
        await this.getRecentWithdrawals();
      } catch (err) {
        console.error("handleAuthCallback 错误:", err);
        uni.hideLoading();
        this.isProcessingWithdrawal = false;
        uni.showToast({ title: err.message || "提现处理失败", icon: "none" });
      } finally {
        this.isProcessingWithdrawal = false;
      }
    },

    async applyWithdrawal() {
      // Basic validation & UX guards
      if (this.isProcessingWithdrawal) return;

      const parsed = parseFloat(this.amount);
      if (Number.isNaN(parsed)) {
        uni.showToast({ title: "请输入有效金额", icon: "none" });
        return;
      }

      // If amount < 0.3 or > balance, show warning
      if (parsed < 0.3) {
        uni.showToast({ title: "提现金额不能低于0.3元", icon: "none" });
        return;
      }
      if (parsed > Number(this.walletBalance)) {
        uni.showToast({ title: "余额不足", icon: "none" });
        return;
      }

      // Confirm when withdrawing partial amount
      const confirmMsg = `您当前余额为¥${this.walletBalance}，确定要提现¥${parsed}吗？`;
      uni.showModal({
        title: "确认提现",
        content: confirmMsg,
        confirmText: "确认提现",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.processWithdrawal(parsed);
          }
        },
      });
    },

    async processWithdrawal(amount) {
      try {
        this.isProcessingWithdrawal = true;
        uni.showLoading({ title: "正在申请提现..." });

        const rawToken = uni.getStorageSync("userAuthToken_xh") || "";
        const token = this.normalizeToken(rawToken);
        if (!token) {
          uni.hideLoading();
          uni.showToast({
            title: "未登录或认证失败，请重新登录",
            icon: "none",
          });
          setTimeout(() => uni.navigateTo({ url: "/pages/login/login" }), 1000);
          this.isProcessingWithdrawal = false;
          return;
        }

        const response = await this.requestPromise({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/wallet/withdraw",
          method: "POST",
          header: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          data: {
            amount: Number(amount),
            withdrawType: "wechat",
          },
        });

        // success case
        if (
          response &&
          response.statusCode === 200 &&
          response.data &&
          response.data.success
        ) {
          uni.hideLoading();
          uni.showToast({
            title: response.data.message || "提现申请已提交",
            icon: "success",
          });
          this.amount = "";
          await this.getWalletBalance();
          await this.getRecentWithdrawals();
        } else if (
          response &&
          response.data &&
          response.data.needAuthorization &&
          response.data.authUrl
        ) {
          // 需要第三方授权，跳转到 webview
          uni.hideLoading();
          uni.navigateTo({
            url: `/subpages/other/public/webview?url=${encodeURIComponent(
              response.data.authUrl
            )}&title=${encodeURIComponent("处理提现申请")}`,
          });
        } else {
          // other errors
          const msg =
            (response && response.data && response.data.message) ||
            "提现申请失败";
          throw new Error(msg);
        }
      } catch (err) {
        console.error("processWithdrawal 错误:", err);
        uni.hideLoading();
        const message = (err && err.message) || "申请提现失败，请稍后重试";
        if (message.includes("余额不足")) {
          uni.showToast({ title: "钱包余额不足", icon: "none" });
        } else if (message.includes("真实姓名")) {
          uni.showToast({ title: "请先完善真实姓名信息", icon: "none" });
        } else if (message.includes("认证失败")) {
          uni.showToast({ title: "认证失败，请重新登录", icon: "none" });
          uni.removeStorageSync("userAuthToken_xh");
          setTimeout(() => uni.navigateTo({ url: "/pages/login/login" }), 1200);
        } else {
          uni.showToast({ title: message, icon: "none" });
        }
      } finally {
        this.isProcessingWithdrawal = false;
      }
    },

    getStatusText(status) {
      const statusMap = {
        pending: "待处理",
        processing: "处理中",
        completed: "已完成",
        failed: "失败",
        rejected: "已拒绝",
      };
      return statusMap[status] || "未知状态";
    },

    async getRecentWithdrawals() {
      try {
        const rawToken = uni.getStorageSync("userAuthToken_xh") || "";
        const token = this.normalizeToken(rawToken);
        if (!token) {
          this.recentWithdrawals = [];
          return;
        }

        const response = await this.requestPromise({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/wallet/withdrawals",
          method: "GET",
          header: {
            Authorization: token,
          },
        });

        if (
          response &&
          response.statusCode === 200 &&
          response.data &&
          response.data.success
        ) {
          const payload = response.data.data ?? response.data;
          // support variations: payload.withdrawals or payload.list etc.
          const withdrawals = Array.isArray(payload.withdrawals)
            ? payload.withdrawals
            : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload)
            ? payload
            : [];

          // keep up to 5 most recent
          const slice = withdrawals.slice(0, 5);
          this.recentWithdrawals = slice.map((it) => ({
            id: it.id ?? this.generateOrderId(),
            amount: Number(it.amount ?? it.money ?? 0),
            status: it.status ?? "unknown",
            withdrawType: it.withdrawType ?? it.type ?? "wechat",
            applyTime: it.applyTime ?? it.createdAt ?? it.created_at ?? null,
            processTime: it.processTime ?? it.process_time ?? null,
            completeTime: it.completeTime ?? it.complete_time ?? null,
            rejectReason: it.rejectReason ?? it.reject_reason ?? null,
            thirdPartyOrderId:
              it.thirdPartyOrderId ?? it.third_party_order_id ?? null,
            failReason: it.failReason ?? it.fail_reason ?? null,
          }));
        } else {
          console.warn("getRecentWithdrawals 响应异常:", response);
          this.recentWithdrawals = [];
        }
      } catch (err) {
        console.error("getRecentWithdrawals 错误:", err);
        this.recentWithdrawals = [];
      }
    },

    goToWithdrawRecords() {
      uni.navigateTo({
        url: "/subpages/profile/withdraw-records",
        fail: (err) => {
          console.error("跳转提现记录失败:", err);
          uni.showToast({ title: "页面跳转失败", icon: "none" });
        },
      });
    },

    formatTime(timestamp) {
      if (!timestamp) return "未知时间";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "时间格式错误";
      const YYYY = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, "0");
      const DD = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${YYYY}-${MM}-${DD} ${hh}:${mm}`;
    },

    getStatusClass(status) {
      const classMap = {
        pending: "status-pending",
        processing: "status-processing",
        completed: "status-completed",
        failed: "status-failed",
        rejected: "status-rejected",
      };
      return classMap[status] || "status-unknown";
    },
  },
};
</script>

<style scoped>
/* --- 保留并复用你原来的样式（已检查无语法问题） --- */
.withdraw-page {
  padding: 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  animation: gradientShift 15s ease infinite;
  box-sizing: border-box;
}

@keyframes gradientShift {
  0% {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  50% {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
  100% {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.header {
  text-align: center;
  margin-bottom: 30rpx;
  padding: 40rpx 25rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.title {
  font-size: 42rpx;
  font-weight: 700;
  color: #2c3e50;
  display: block;
  margin-bottom: 0;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.balance-section {
  text-align: center;
  margin-bottom: 30rpx;
  padding: 40rpx 25rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.balance-label {
  font-size: 30rpx;
  color: #7f8c8d;
  display: block;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.balance-amount {
  font-size: 56rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.form-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx 25rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 30rpx;
  color: #2c3e50;
  margin-bottom: 20rpx;
  display: block;
  font-weight: 600;
}

.required {
  color: #e74c3c;
  margin-left: 6rpx;
  font-weight: 700;
}

.input {
  width: 100%;
  height: 96rpx;
  border: 2rpx solid #e1e8ed;
  border-radius: 16rpx;
  padding: 0 25rpx;
  font-size: 32rpx;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.withdraw-type {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border: 2rpx solid #e1e8ed;
  border-radius: 16rpx;
  padding: 25rpx;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.type-text {
  font-size: 30rpx;
  color: #2c3e50;
  font-weight: 600;
  display: block;
  margin-bottom: 0;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 20rpx;
  font-size: 34rpx;
  font-weight: 600;
  margin-top: 30rpx;
  border: none;
  cursor: pointer;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  box-shadow: none;
  cursor: not-allowed;
}

/* 提现记录样式 */
.records-section {
  margin-top: 40rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
}

.view-all {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-amount {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c3e50;
}

.record-time {
  font-size: 24rpx;
  color: #7f8c8d;
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.status-pending {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.status-processing {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.status-completed {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.status-failed {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.status-rejected {
  color: #95a5a6;
  background: rgba(149, 165, 166, 0.1);
}

.status-unknown {
  color: #7f8c8d;
  background: rgba(127, 140, 141, 0.1);
}

.empty-records {
  text-align: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #bdc3c7;
}
</style>
