  <template>
  <view class="select-address-container page-container">
    <view class="page-title">{{
      fromChat ? "选择要发送的地址" : "选择常用地址"
    }}</view>

    <view v-if="addressList.length === 0" class="empty-tip">
      <text>{{
        fromChat ? "暂无保存的地址，请先添加地址" : "暂无保存的地址"
      }}</text>
      <button
        class="add-address-btn button-primary rounded-pill"
        @click="goToAddAddress"
      >
        添加新地址
      </button>
    </view>

    <view v-else>
      <view
        v-for="(item, idx) in addressList"
        :key="item.id"
        class="address-card card"
        @click="selectAddress(item)"
      >
        <view class="address-info">
          <view class="address-header">
            <text class="address-detail">{{ item.detail }}</text>
            <text class="address-tag" v-if="item.isDefault">默认</text>
          </view>
          <view class="contact-info">{{ item.name }} {{ item.phone }}</view>
        </view>
        <view class="select-icon">
          <text class="uni-icon uni-icon-arrowright"></text>
        </view>
      </view>

      <view class="bottom-actions">
        <button
          class="add-address-btn button-secondary rounded-pill"
          @click="goToAddAddress"
        >
          {{ fromChat ? "添加新地址" : "添加新地址" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      addressList: [],
      callbackPage: "", // 回调页面路径
      fromChat: false, // 是否从聊天页面跳转过来
      taskId: "", // 任务ID
      otherUserId: "", // 对方用户ID
      target: "", // 目标地址字段类型
    };
  },
  onLoad(options) {
    // 获取回调页面信息
    if (options.callbackPage) {
      this.callbackPage = decodeURIComponent(options.callbackPage);
    }

    // 获取target参数
    if (options.target) {
      this.target = options.target;
    }

    // 检查是否从聊天页面跳转过来
    if (options.from === "chat") {
      this.fromChat = true;
      this.taskId = options.taskId || "";
      this.otherUserId = options.otherUserId || "";
      console.log("从聊天页面跳转，参数:", {
        from: options.from,
        taskId: this.taskId,
        otherUserId: this.otherUserId,
      });
    }

    this.fetchAddressList();
  },
  onShow() {
    this.fetchAddressList();
  },
  methods: {
    async fetchAddressList() {
      try {
        const userId = uni.getStorageSync("userId");
        if (!userId) {
          uni.showToast({ title: "未登录", icon: "none" });
          return;
        }

        const res = await request({
          url: "/user_addresses",
          method: "GET",
          data: { userId },
        });

        this.addressList = Array.isArray(res) ? res : res.data || [];
      } catch (error) {
        console.error("获取地址列表失败", error);
        uni.showToast({ title: "获取地址列表失败", icon: "none" });
      }
    },

    async selectAddress(address) {
      // 如果是从聊天页面跳转过来的，直接发送地址消息
      if (this.fromChat) {
        try {
          await this.sendAddressToChat(address);
          return;
        } catch (error) {
          console.error("发送地址到聊天失败", error);
          uni.showToast({
            title: "发送失败，请重试",
            icon: "none",
          });
          return;
        }
      }

      // 获取target参数，用于确定要设置哪个地址字段
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      // 从URL参数中获取target
      const target = currentPage.options?.target || this.target || "";

      // 使用本地存储传递数据，包含target信息
      const addressData = {
        address: address.detail,
        target: target,
      };
      uni.setStorageSync("selectedAddressData", addressData);

      // 显示选择成功提示
      uni.showToast({
        title: "已选择地址",
        icon: "success",
        duration: 1000,
      });

      // 延迟返回上一页，确保数据已设置
      setTimeout(() => {
        uni.navigateBack();
      }, 500);
    },

    sendAddressToChat(address) {
      try {
        // 检查参数是否有空
        if (!this.taskId) {
          console.error("taskId为空");
          uni.showToast({ title: "任务ID无效", icon: "none" });
          return;
        }

        if (!this.otherUserId) {
          console.error("otherUserId为空");
          uni.showToast({ title: "接收者ID无效", icon: "none" });
          return;
        }

          // 参考快递平台页面的逻辑，直接使用本地存储
        uni.setStorageSync("selectedAddress", address.detail);
        console.log("保存地址到本地存储", address.detail);

        // 显示提示
        uni.showToast({
          title: "地址已选择",
          icon: "success",
          duration: 1500,
        });

        // 返回聊天页面
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } catch (error) {
        console.error("选择地址失败:", error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none",
          duration: 2000,
        });
      }
    },

    goToAddAddress() {
      uni.navigateTo({
        url: `/subpages/profile/add-address?callbackPage=${encodeURIComponent(
          this.callbackPage
        )}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.select-address-container {
  padding: 32rpx;
  background: linear-gradient(135deg, #f8faff 0%, #f0f8ff 100%);
  min-height: 100vh;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  text-align: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 4rpx;
    background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
    border-radius: 2rpx;
  }
}

.empty-tip {
  text-align: center;
  padding: 120rpx 0;
  color: #666;
  font-size: 28rpx;

  text {
    display: block;
    margin-bottom: 40rpx;
    font-size: 30rpx;
  }

  .add-address-btn {
    margin-top: 40rpx;
    width: 320rpx;
    height: 88rpx;
    font-size: 30rpx;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 44rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.2);
  }
}

.address-card {
  margin-bottom: 24rpx;
  padding: 32rpx;
  background: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(0, 122, 255, 0.1);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
    border-color: rgba(0, 122, 255, 0.2);
  }
}

.address-info {
  flex: 1;
  margin-right: 24rpx;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.address-detail {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.address-tag {
  background: linear-gradient(135deg, #007aff 0%, #0056cc 100%);
  color: white;
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 16rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.3);
}

.contact-info {
  font-size: 26rpx;
  color: #666;
}

.select-icon {
  color: #007aff;
  font-size: 32rpx;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.address-card:active .select-icon {
  opacity: 1;
}

.bottom-actions {
  margin-top: 48rpx;
  text-align: center;
  padding: 0 20rpx;
}

.add-address-btn {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 44rpx;
  transition: all 0.3s ease;
}

.button-secondary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  border: 1rpx solid #dee2e6;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
  }
}
</style>
