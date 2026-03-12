<template>
  <view class="wallet-container page-container">
    <!-- 余额卡片 -->
    <view class="balance-card card rounded-lg shadow-base">
      <view class="balance-left">
        <text class="balance-label">余额(元)</text>
        <text class="balance-amount">{{ balance.toFixed(2) }}</text>
      </view>
      <view class="balance-right">
        <button class="withdraw-btn" @click="goToWithdraw">提现</button>
      </view>
    </view>

    <!-- 余额明细 -->
    <view class="balance-details card rounded-lg shadow-base">
      <view class="filter-bar">
        <view class="filter-item active">余额明细</view>
        <view class="filter-item" @click="showDatePicker">
          <text>{{ selectedDateText }}</text>
          <text class="arrow">▼</text>
        </view>
      </view>

      <view v-if="isLoadingTransactions" class="loading-placeholder">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      <view v-else-if="transactions.length === 0" class="empty-placeholder">
        <view class="empty-icon">📄</view>
        <text class="empty-text">该条件下暂无余额流水</text>
      </view>
      <view v-else class="transaction-list">
        <view
          class="transaction-item"
          v-for="item in transactions"
          :key="item.id"
        >
          <view class="item-info">
            <text class="item-type">{{ item.typeDescription }}</text>
            <view class="item-details">
              <text
                class="item-task-type"
                :class="
                  item.source === 'market'
                    ? 'type-market'
                    : getTaskTypeClassByType(item.taskType)
                "
                >{{ getTaskTypeText(item.taskType) }}</text
              >
              <text class="item-time">{{
                formatDate(item.transferTime || item.createdAt)
              }}</text>
            </view>
          </view>
          <text
            class="item-amount"
            :class="{ positive: item.amount > 0, negative: item.amount < 0 }"
          >
            {{ item.amount > 0 ? "+" : "" }}{{ item.amount.toFixed(2) }}
          </text>
        </view>
        <uni-load-more :status="loadMoreStatusTransactions"></uni-load-more>
      </view>
    </view>

    <!-- 日期选择器模态框 -->
    <view
      v-if="showDatePickerModal"
      class="date-picker-modal"
      @click="closeDatePicker"
    >
      <view class="date-picker-content" @click.stop>
        <view class="date-picker-header">
          <text class="date-picker-title">选择日期</text>
        </view>
        <picker
          mode="date"
          :value="selectedDate || getCurrentDate()"
          :start="getMinDate()"
          :end="getMaxDate()"
          @change="onDateChange"
          class="date-picker"
        >
          <view class="date-display">
            <text>{{ selectedDate || getCurrentDate() }}</text>
          </view>
        </picker>
        <view class="date-picker-buttons">
          <button class="cancel-btn" @click="closeDatePicker">取消</button>
          <button class="clear-btn" @click="clearDateFilter">清除筛选</button>
          <button class="confirm-btn" @click="confirmDate">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      balance: 0.0,
      transactions: [],
      isLoadingTransactions: true,
      currentPageTransactions: 1,
      totalPagesTransactions: 1,
      loadMoreStatusTransactions: "more",
      selectedDate: null, // 选中的日期
      showDatePickerModal: false, // 显示日期选择器模态框
      tempSelectedDate: null, // 临时选中的日期
    };
  },
  computed: {
    ...mapState({
      // userInfo: state => state.userInfo
    }),
    selectedDateText() {
      if (!this.selectedDate) {
        return "全部时间";
      }
      const date = new Date(this.selectedDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
  },
  onLoad() {
    this.fetchWalletInfo();
    this.fetchTransactions(true);
  },

  onShow() {
    // 每次显示页面时刷新余额和交易记录
    console.log("钱包页面显示，刷新余额和交易记录");
    this.fetchWalletInfo();
    this.fetchTransactions(true);
  },
  onReachBottom() {
    if (this.currentPageTransactions < this.totalPagesTransactions) {
      this.currentPageTransactions++;
      this.fetchTransactions(false);
    } else {
      this.loadMoreStatusTransactions = "noMore";
    }
  },
  methods: {
    async fetchWalletInfo() {
      try {
        const res = await request({ url: "/wallet/balance", method: "GET" });
        console.log("钱包余额API响应:", res);
        if (res && res.success && typeof res.balance === "number") {
          this.balance = res.balance;
          console.log("钱包余额更新成功:", this.balance);
        } else {
          console.error("钱包余额数据格式错误:", res);
        }
      } catch (error) {
        console.error("获取钱包余额失败:", error);
        uni.showToast({ title: "获取余额失败", icon: "none" });
      }
    },
    async fetchTransactions(isRefresh = false, callback) {
      if (isRefresh) {
        this.transactions = [];
        this.currentPageTransactions = 1;
      }
      this.isLoadingTransactions = this.currentPageTransactions === 1;
      this.loadMoreStatusTransactions = "loading";

      try {
        const requestData = {
          page: this.currentPageTransactions,
          limit: 15,
        };

        // 如果选择了日期，添加日期筛选参数
        if (this.selectedDate) {
          requestData.date = this.selectedDate;
          console.log("筛选日期:", this.selectedDate);
        }

        const response = await request({
          url: "/wallet/info",
          method: "GET",
          data: requestData,
        });

        if (
          response &&
          response.success &&
          response.data &&
          response.data.earnings
        ) {
          const earnings = response.data.earnings.map((item) => ({
            id: item.id,
            typeDescription: item.title || "收入",
            amount: parseFloat(item.amount),
            createdAt: item.time,
            transferTime: item.time,
            status: "completed",
            taskType: item.type,
            source: item.source, // 新增：区分任务和二手市集
          }));

          if (isRefresh) {
            this.transactions = earnings;
          } else {
            this.transactions = this.transactions.concat(earnings);
          }
          this.totalPagesTransactions =
            Math.ceil(response.data.total / response.data.limit) || 1;
          this.loadMoreStatusTransactions =
            this.currentPageTransactions >= this.totalPagesTransactions
              ? "noMore"
              : "more";
        } else {
          this.loadMoreStatusTransactions = "noMore";
        }
        if (this.transactions.length === 0)
          this.loadMoreStatusTransactions = "noMore";
      } catch (error) {
        console.error("获取收入记录失败:", error);
        this.loadMoreStatusTransactions = "more";
      } finally {
        this.isLoadingTransactions = false;
        if (typeof callback === "function") {
          callback();
        }
      }
    },

    goToWithdraw() {
      // 跳转到提现页面
      uni.navigateTo({
        url: "/subpages/profile/withdraw",
      });
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    getTaskTypeText(taskType) {
      const taskTypeMap = {
        取快递: "取快递",
        取外卖: "取外卖",
        帮我买: "帮我买",
        课程代替: "课程代替",
        借物品: "借物品",
        游戏陪玩: "游戏陪玩",
        学习伙伴: "学习伙伴",
        学习互助: "学习互助",
        搬运服务: "搬运服务",
        其他服务: "其他服务",
        求资料: "求资料",
        express: "取快递",
        buy: "帮我买",
        class_attendance: "课程代替",
        campus_errand: "校园跑腿",
        tea_coffee: "买饮品",
        other: "其他服务",
        二手市集: "二手市集", // 新增：二手市集收入
      };
      return taskTypeMap[taskType] || "其他任务";
    },

    // 获取任务类型对应的CSS类名
    getTaskTypeClassByType(taskType) {
      // 任务类型的颜色映射，与任务大厅保持一致
      const taskTypeClassMap = {
        取快递: "type-express",
        取外卖: "type-food",
        帮我买: "type-buy",
        学习互助: "type-write",
        借物品: "type-borrow",
        倒垃圾: "type-game",
        学习伙伴: "type-partner",
        搬运服务: "type-move",
        其他服务: "type-help",
        求资料: "type-material",
        express: "type-express",
        buy: "type-buy",
        class_attendance: "type-class",
        campus_errand: "type-errand",
        tea_coffee: "type-drink",
        other: "type-other",
      };
      return taskTypeClassMap[taskType] || "type-default";
    },

    // 显示日期选择器
    showDatePicker() {
      console.log("显示日期选择器");
      console.log("年份范围:", this.getMinDate(), "到", this.getMaxDate());
      // 直接显示日期选择器模态框
      this.showDatePickerModal = true;
    },

    // 验证日期格式
    validateDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateString)) {
        return false;
      }
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    },

    // 获取当前日期
    getCurrentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    // 获取最小日期（2025年1月1日）
    getMinDate() {
      const minDate = "2025-01-01";
      console.log("最小日期:", minDate);
      return minDate;
    },

    // 获取最大日期（当前日期）
    getMaxDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const maxDate = `${year}-${month}-${day}`;
      console.log("最大日期:", maxDate);
      return maxDate;
    },

    // 日期改变事件
    onDateChange(e) {
      this.tempSelectedDate = e.detail.value;
    },

    // 关闭日期选择器
    closeDatePicker() {
      this.showDatePickerModal = false;
    },

    // 确认日期选择
    confirmDate() {
      if (this.tempSelectedDate) {
        this.selectedDate = this.tempSelectedDate;
        this.fetchTransactions(true);
      }
      this.showDatePickerModal = false;
    },

    // 清除日期筛选
    clearDateFilter() {
      this.selectedDate = null;
      this.tempSelectedDate = null;
      this.fetchTransactions(true);
      this.showDatePickerModal = false;
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
}

.balance-card {
  padding: $uni-spacing-col-lg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;

  .balance-left {
    .balance-label {
      display: block;
      font-size: $uni-font-size-base;
      opacity: 0.9;
      margin-bottom: $uni-spacing-row-sm;
    }

    .balance-amount {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
    }
  }

  .balance-right {
    text-align: right;

    .withdraw-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20rpx;
      padding: 10rpx 30rpx;
      font-size: $uni-font-size-base;
    }
  }
}

.balance-details {
  padding: $uni-spacing-col-lg;

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: $uni-spacing-row-base;
    border-bottom: 1px solid $uni-border-color-light;
    margin-bottom: $uni-spacing-row-lg;

    .filter-item {
      display: flex;
      align-items: center;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      padding: $uni-spacing-row-sm $uni-spacing-col-sm;
      min-height: 60rpx;

      &.active {
        color: $uni-color-primary;
        font-weight: bold;
      }

      .arrow {
        margin-left: 5rpx;
        font-size: $uni-font-size-sm;
        color: $uni-text-color-light;
      }
    }
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

  .transaction-list {
    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $uni-spacing-row-base 0;
      border-bottom: 1px solid $uni-border-color-light;

      &:last-child {
        border-bottom: none;
      }

      .item-info {
        display: flex;
        flex-direction: column;

        .item-type {
          font-size: $uni-font-size-base;
          color: $uni-text-color;
          margin-bottom: 5rpx;
          font-weight: 500;
        }

        .item-details {
          display: flex;
          align-items: center;
          gap: 10rpx;

          .item-task-type {
            font-size: $uni-font-size-sm;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
            font-weight: 500;
            display: inline-block;
          }

          // 任务类型颜色 - 与任务大厅保持一致
          .type-express {
            background: #e3f2fd;
            color: #1976d2;
          }
          .type-food {
            background: #fff3e0;
            color: #f57c00;
          }
          .type-buy {
            background: #e8f5e8;
            color: #388e3c;
          }
          .type-class {
            background: #f3e5f5;
            color: #7b1fa2;
          }
          .type-borrow {
            background: #fff8e1;
            color: #fbc02d;
          }
          .type-game {
            background: #fce4ec;
            color: #c2185b;
          }
          .type-partner {
            background: #e0f2f1;
            color: #00695c;
          }
          .type-write {
            background: #f1f8e9;
            color: #689f38;
          }
          .type-move {
            background: #e8eaf6;
            color: #3f51b5;
          }
          .type-help {
            background: #fff3e0;
            color: #ff9800;
          }
          .type-material {
            background: #e1f5fe;
            color: #0277bd;
          }
          .type-errand {
            background: #f3e5f5;
            color: #8e24aa;
          }
          .type-drink {
            background: #fff8e1;
            color: #ff8f00;
          }
          .type-other {
            background: #f5f5f5;
            color: #757575;
          }
          .type-default {
            background: #eaf4ff;
            color: #4e9fff;
          }
          // 二手市集特殊颜色
          .type-market {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: #ffffff;
            font-weight: 600;
          }

          .item-time {
            font-size: $uni-font-size-sm;
            color: $uni-text-color-light;
          }
        }
      }

      .item-amount {
        font-size: $uni-font-size-lg;
        font-weight: 500;

        &.positive {
          color: $uni-color-success;
        }

        &.negative {
          color: $uni-color-error;
        }
      }
    }
  }
}

.loading-placeholder {
  padding: $uni-spacing-row-lg 0;
}

// 日期选择器模态框样式
.date-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker-content {
  background: white;
  border-radius: $uni-border-radius-lg;
  width: 80%;
  max-width: 400rpx;
  padding: $uni-spacing-col-lg;
}

.date-picker-header {
  text-align: center;
  padding-bottom: $uni-spacing-row-base;
  border-bottom: 1px solid $uni-border-color-light;
  margin-bottom: $uni-spacing-row-lg;
}

.date-picker-title {
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
}

.date-picker {
  padding: $uni-spacing-row-lg 0;
}

.date-display {
  text-align: center;
  padding: $uni-spacing-row-base;
  border: 1px solid $uni-border-color-light;
  border-radius: $uni-border-radius-base;
  background: $uni-bg-color-page;
}

.date-picker-buttons {
  display: flex;
  gap: $uni-spacing-col-sm;
  margin-top: $uni-spacing-row-lg;
}

.cancel-btn,
.clear-btn,
.confirm-btn {
  flex: 1;
  padding: $uni-spacing-row-base;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
}

.cancel-btn {
  background: $uni-bg-color-page;
  color: $uni-text-color;
  border: 1px solid $uni-border-color-light;
}

.clear-btn {
  background: $uni-color-warning;
  color: white;
  border: none;
}

.confirm-btn {
  background: $uni-color-primary;
  color: white;
  border: none;
}
</style>
