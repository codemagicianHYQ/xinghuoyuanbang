<template>
  <button
    class="publish-btn lively-green-btn"
    :class="{
      'fixed-bottom-publish-btn': fixed,
      disabled: disabled || loading,
    }"
    :loading="loading"
    :disabled="disabled || loading"
    @click="$emit('click')"
    :style="!fixed ? 'width: 180px; height: 44px; font-size: 18px' : ''"
  >
    <slot>{{ loading ? "发布中..." : text }}</slot>
  </button>
</template>

<script>
export default {
  name: "PublishButton",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "立即发布",
    },
    fixed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.lively-green-btn {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border: none;
  outline: none;
  border-radius: 24px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(67, 233, 123, 0.15);
  transition: background 0.2s;
  width: 180px;
  height: 44px;
  font-size: 18px;
  margin: 0 auto;
  display: block;
}
.publish-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fixed-bottom-publish-btn {
  position: fixed !important;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 100;
  width: auto !important;
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600;
  border-radius: 44rpx;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(67, 233, 123, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.fixed-bottom-publish-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s;
}

.fixed-bottom-publish-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(67, 233, 123, 0.5);
}

.fixed-bottom-publish-btn:active::before {
  left: 100%;
}
</style>
