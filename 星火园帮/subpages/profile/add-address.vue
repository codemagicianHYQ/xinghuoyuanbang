<template>
  <view class="add-address-container page-container">
    <view class="form-section card rounded-lg shadow-base">
      <view class="form-item">
        <text class="item-label">详细地址</text>
        <input
          class="input-field"
          v-model="form.detail"
          placeholder="请输入详细地址"
        />
      </view>
      <view class="form-item">
        <text class="item-label">收件人姓名</text>
        <input
          class="input-field"
          v-model="form.name"
          placeholder="请输入收件人姓名"
        />
      </view>
      <view class="form-item">
        <text class="item-label">手机号</text>
        <input
          class="input-field"
          v-model="form.phone"
          placeholder="请输入手机号"
        />
      </view>
      <view class="form-item default-row">
        <text class="item-label">设为默认地址</text>
        <switch
          :checked="form.isDefault"
          @change="(e) => (form.isDefault = e.detail.value)"
        />
      </view>
    </view>
    <button class="submit-btn button-primary rounded-pill" @click="saveAddress">
      保存
    </button>
  </view>
</template>
<script>
import request from "@/common/request.js";
export default {
  data() {
    return {
      form: {
        detail: "",
        name: "",
        phone: "",
        isDefault: false,
      },
      id: null,
    };
  },
  onLoad(options) {
    if (options && options.id) {
      this.id = options.id;
      this.fetchAddressDetail(options.id);
    }
  },
  methods: {
    async fetchAddressDetail(id) {
      const userId = uni.getStorageSync("userId");
      const res = await request({
        url: `/user_addresses`,
        method: "GET",
        data: { userId },
      });
      const addr = (Array.isArray(res) ? res : res.data || []).find(
        (a) => String(a.id) === String(id)
      );
      if (addr) {
        this.form = {
          detail: addr.detail,
          name: addr.name,
          phone: addr.phone,
          isDefault: addr.isDefault,
        };
      }
    },
    async saveAddress() {
      if (!this.form.detail || !this.form.name || !this.form.phone) {
        uni.showToast({ title: "请填写完整", icon: "none" });
        return;
      }
      const userId = uni.getStorageSync("userId");
      if (this.id) {
        await request({
          url: `/user_addresses/${this.id}`,
          method: "PUT",
          data: { ...this.form, userId },
        });
      } else {
        await request({
          url: "/user_addresses",
          method: "POST",
          data: { ...this.form, userId },
        });
      }
      uni.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => uni.navigateBack(), 1000);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/uni.scss";
.add-address-container {
  min-height: 100vh;
  background: $uni-bg-color-page;
}
.form-section {
  padding: $uni-spacing-col-sm $uni-spacing-col-lg;
}
.form-item {
  display: flex;
  flex-direction: column;
  padding: $uni-spacing-row-base 0;
  border-bottom: 1px solid $uni-border-color-light;
  &:last-child {
    border-bottom: none;
  }
  .item-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-row-sm;
    font-weight: 500;
  }
  .input-field {
    background-color: lighten($uni-bg-color-page, 2%);
    border: 1px solid $uni-border-color;
    padding: 20rpx;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    border-radius: $uni-border-radius-base;
    &:focus {
      border-color: $uni-color-primary;
    }
  }
  .default-row {
    display: flex;
    align-items: center;
    font-size: $uni-font-size-base;
    .uni-switch {
      margin-left: 20rpx;
    }
  }
}
.submit-btn {
  margin-top: $uni-spacing-row-lg * 2;
}
</style>
