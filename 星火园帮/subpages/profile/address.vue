<template>
  <view class="address-container page-container">
    <view class="fun-title" style="margin-bottom: 32rpx">我的地址</view>
    <view v-if="addressList.length === 0" class="empty-tip"
      >暂无地址，请点击下方按钮添加</view
    >
    <view
      v-for="(item, idx) in addressList"
      :key="item.id"
      class="address-card card"
    >
      <view class="address-info">
        <text class="address-detail">{{ item.detail }}</text>
        <text class="address-tag" v-if="item.isDefault">默认</text>
        <view>{{ item.name }} {{ item.phone }}</view>
      </view>
      <view class="address-actions">
        <button class="edit-btn" @click="editAddress(idx)">编辑</button>
        <button class="delete-btn" @click="confirmDelete(idx)">删除</button>
      </view>
    </view>
    <button class="add-btn button-primary rounded-pill" @click="addAddress">
      添加新地址
    </button>
    <uni-popup v-if="deleteIndex !== -1" ref="deletePopup" type="dialog">
      <view class="popup-content">
        <view class="fun-title" style="font-size: 30rpx">确认删除该地址？</view>
        <view class="popup-actions">
          <button class="button-error" @click="doDeleteAddress">确认</button>
          <button class="button-primary" @click="closeDeletePopup">取消</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import request from "@/common/request.js";
export default {
  data() {
    return {
      addressList: [],
      deleteIndex: -1,
    };
  },
  onLoad() {
    this.fetchAddressList();
  },
  onShow() {
    this.fetchAddressList();
  },
  methods: {
    async fetchAddressList() {
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
      console.log("接口原始返回：", res);
      this.addressList = Array.isArray(res) ? res : res.data || [];
      console.log("最终 addressList：", this.addressList);
    },
    addAddress() {
      uni.navigateTo({ url: "/subpages/profile/add-address" });
    },
    editAddress(idx) {
      const id = this.addressList[idx].id;
      uni.navigateTo({ url: `/subpages/profile/add-address?id=${id}` });
    },
    confirmDelete(idx) {
      this.deleteIndex = idx;
      if (this.$refs.deletePopup) {
        this.$refs.deletePopup.open();
      }
    },
    async doDeleteAddress() {
      if (this.deleteIndex !== -1) {
        const address = this.addressList[this.deleteIndex];
        try {
          const userId = uni.getStorageSync("userId");
          await request({
            url: `/user_addresses/${address.id}?userId=${userId}`,
            method: "DELETE",
          });
          this.addressList.splice(this.deleteIndex, 1);
          uni.showToast({ title: "删除成功", icon: "success" });
        } catch (e) {
          uni.showToast({ title: "删除失败", icon: "none" });
        }
        this.deleteIndex = -1;
      }
      if (this.$refs.deletePopup) {
        this.$refs.deletePopup.close();
      }
    },
    closeDeletePopup() {
      this.deleteIndex = -1;
      if (this.$refs.deletePopup) {
        this.$refs.deletePopup.close();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.address-container {
  min-height: 100vh;
  background: $uni-bg-color-page;
}
.empty-tip {
  text-align: center;
  color: #bbb;
  margin: 40rpx 0;
}
.address-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  .address-info {
    display: flex;
    align-items: center;
    .address-detail {
      font-size: 30rpx;
      color: #222;
      font-family: $fun-font-family;
    }
    .address-tag {
      margin-left: 16rpx;
      color: #fff;
      background: #4e9fff;
      border-radius: 8rpx;
      font-size: 22rpx;
      padding: 2rpx 12rpx;
    }
  }
  .address-actions {
    margin-top: 12rpx;
    display: flex;
    gap: 16rpx;
    .edit-btn {
      background: #fffbe6;
      color: #ffb300;
      border-radius: 12rpx;
      font-size: 26rpx;
      padding: 8rpx 24rpx;
    }
    .delete-btn {
      background: #ffeaea;
      color: #ff4e4e;
      border-radius: 12rpx;
      font-size: 26rpx;
      padding: 8rpx 24rpx;
    }
  }
}
.add-btn {
  margin-top: 32rpx;
  width: 100%;
}
.popup-content {
  background: #333;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  min-width: 300rpx;
  max-width: 70vw;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  box-sizing: border-box;
  .fun-title {
    color: #fff;
    text-align: center;
    width: 100%;
  }
  .popup-actions {
    display: flex;
    gap: 16rpx;
    justify-content: center;
    margin-top: 20rpx;
    width: 100%;
  }
}
::v-deep .uni-popup__wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
</style>
