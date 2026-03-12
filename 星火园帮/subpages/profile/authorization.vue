<template>
  <view class="authorization-page">
    <view class="header">
      <text class="title">微信授权获取OpenID</text>
      <text class="subtitle"
        >通过第三方接口获取用户OpenID，用于提现到微信零钱</text
      >
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">回调地址</text>
        <input
          v-model="redirectUrl"
          placeholder="请输入回调地址，如：https://your-domain.com/callback"
          class="input"
        />
      </view>

      <view class="form-item">
        <text class="label">跳转方式</text>
        <picker
          :value="mpIndex"
          :range="mpOptions"
          @change="onMpChange"
          class="picker"
        >
          <view class="picker-text">{{ mpOptions[mpIndex] }}</view>
        </picker>
      </view>

      <button @click="getAuthorizationUrl" class="btn-primary">
        获取授权链接
      </button>
    </view>

    <view v-if="authorizationUrl" class="result-section">
      <view class="result-header">
        <text class="result-title">授权链接已生成</text>
      </view>

      <view class="url-display">
        <text class="url-text">{{ authorizationUrl }}</text>
        <button @click="copyUrl" class="btn-copy">复制链接</button>
      </view>

      <view class="instructions">
        <text class="instruction-title">使用说明</text>
        <text class="instruction-text">1. 复制上面的授权链接</text>
        <text class="instruction-text">2. 在浏览器中打开链接</text>
        <text class="instruction-text"
          >3. 用户授权后会自动跳转到你的回调地址</text
        >
        <text class="instruction-text">4. 回调地址会收到包含openid的参数</text>
      </view>

      <button @click="testCallback" class="btn-test">测试回调验证</button>
    </view>

    <view v-if="callbackResult" class="callback-section">
      <view class="callback-header">
        <text class="callback-title">回调验证结果</text>
      </view>

      <view class="callback-data">
        <text class="data-item">OpenID: {{ callbackResult.openid }}</text>
        <text class="data-item">时间: {{ callbackResult.timestamp }}</text>
        <text class="data-item"
          >验证状态: {{ callbackResult.valid ? "成功" : "失败" }}</text
        >
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      redirectUrl: "https://xinghuoyuanbang.top/callback",
      mpIndex: 0,
      mpOptions: ["reLaunch (mp=1)", "navigateTo (mp=2)", "redirectTo (mp=3)"],
      authorizationUrl: "",
      callbackResult: null,
    };
  },

  computed: {
    mp() {
      return this.mpIndex + 1;
    },
  },

  methods: {
    onMpChange(e) {
      this.mpIndex = e.detail.value;
    },

    async getAuthorizationUrl() {
      if (!this.redirectUrl) {
        uni.showToast({
          title: "请输入回调地址",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({ title: "生成..." });

        const response = await uni.request({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/auth/authorization-url",
          method: "GET",
          data: {
            redirectUrl: this.redirectUrl,
            mp: this.mp,
          },
        });

        // 检查响应数据是否存在
        if (response.data && response.data.success) {
          this.authorizationUrl = response.data.data.authorizationUrl;
          uni.showToast({
            title: "授权链接生成成功",
            icon: "success",
          });
        } else if (response.statusCode === 401) {
          // 处理认证失败
          console.log("认证失败，跳转到登录页面");
          uni.removeStorageSync("userAuthToken_xh");
          uni.removeStorageSync("userInfo");
          uni.navigateTo({
            url: "/pages/login/login",
          });
        } else {
          throw new Error(
            (response.data && response.data.message) || "授权链接生成失败"
          );
        }
      } catch (error) {
        console.error("获取授权链接失败:", error);
        uni.showToast({
          title: "获取授权链接失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    copyUrl() {
      uni.setClipboardData({
        data: this.authorizationUrl,
        success: () => {
          uni.showToast({
            title: "链接已复制",
            icon: "success",
          });
        },
      });
    },

    async testCallback() {
      if (!this.authorizationUrl) {
        uni.showToast({
          title: "请先生成授权链接",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({ title: "测试..." });

        // 模拟回调参数
        const mockParams = {
          ivtick: Math.floor(Date.now() / 1000).toString(),
          u_openid: "mock_openid_" + Date.now(),
          encdata: "mock_encdata",
          userinfo: "",
        };

        const response = await uni.request({
          url: "https://xinghuoyuanbang.top/campushelper/api/v1/auth/callback",
          method: "GET",
          data: mockParams,
        });

          // 检查响应数据是否存在
        if (response.data && response.data.success) {
          this.callbackResult = {
            openid: response.data.data.openid,
            timestamp: response.data.data.timestamp,
            valid: true,
          };
          uni.showToast({
            title: "回调验证成功",
            icon: "success",
          });
        } else {
          this.callbackResult = {
            openid: mockParams.u_openid,
            timestamp: mockParams.ivtick,
            valid: false,
          };
          uni.showToast({
            title: "回调验证失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("测试回调失败:", error);
        uni.showToast({
          title: "测试回调失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },
  },
};
</script>

<style scoped>
.authorization-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 40rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #fafafa;
}

.picker {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #fafafa;
}

.picker-text {
  line-height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  margin-top: 20rpx;
}

.result-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  margin-bottom: 30rpx;
}

.result-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.url-display {
  background-color: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  position: relative;
}

.url-text {
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.btn-copy {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  height: 60rpx;
  background-color: #28a745;
  color: #fff;
  border-radius: 6rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
}

.instructions {
  background-color: #e3f2fd;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.instruction-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 16rpx;
  display: block;
}

.instruction-text {
  font-size: 26rpx;
  color: #1976d2;
  line-height: 1.6;
  display: block;
  margin-bottom: 8rpx;
}

.btn-test {
  width: 100%;
  height: 80rpx;
  background-color: #ff9800;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.callback-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
}

.callback-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.callback-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.callback-data {
  background-color: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
}

.data-item {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  display: block;
}
</style>
