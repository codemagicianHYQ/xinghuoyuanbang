/**
 * 通知设置工具函数
 * 用于管理用户的通知偏好设置
 */

/**
 * 获取用户的订单通知设置
 * @returns {boolean} 是否开启订单通知
 */
export function getOrderNotificationSetting() {
  try {
    const setting = uni.getStorageSync("orderNotificationSetting");
    // 如果没有设置过，默认返回true（开启）
    return setting !== null && setting !== undefined ? setting : true;
  } catch (error) {
    console.error("获取订单通知设置失败:", error);
    return true; // 出错时默认开启
  }
}

/**
 * 设置用户的订单通知偏好
 * @param {boolean} enabled - 是否开启订单通知
 */
export function setOrderNotificationSetting(enabled) {
  try {
    uni.setStorageSync("orderNotificationSetting", enabled);
    console.log("订单通知设置已保存:", enabled);
  } catch (error) {
    console.error("保存订单通知设置失败:", error);
  }
}

/**
 * 检查是否应该显示订阅引导
 * 基于用户设置和上次显示时间
 * @returns {boolean} 是否应该显示引导
 */
export function shouldShowSubscriptionGuide() {
  try {
    // 检查用户是否开启了通知
    const notificationEnabled = getOrderNotificationSetting();
    if (!notificationEnabled) {
      return false;
    }

    // 检查上次显示引导的时间
    const lastGuideTime = uni.getStorageSync("lastSubscriptionGuideTime");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24小时

    // 如果从未显示过，或者距离上次显示超过24小时，则显示引导
    return !lastGuideTime || now - lastGuideTime > oneDay;
  } catch (error) {
    console.error("检查订阅引导失败:", error);
    return true;
  }
}

/**
 * 记录显示订阅引导的时间
 */
export function markSubscriptionGuideShown() {
  try {
    uni.setStorageSync("lastSubscriptionGuideTime", Date.now());
  } catch (error) {
    console.error("记录引导显示时间失败:", error);
  }
}

/**
 * 智能订阅引导
 * 根据用户设置决定是否显示订阅授权
 * @param {string} context - 调用上下文（'publish', 'accept'）
 * @param {Function} onConfirm - 用户确认授权的回调
 * @param {Function} onCancel - 用户取消的回调
 */
export function smartSubscriptionGuide(
  context = "general",
  onConfirm,
  onCancel
) {
  // 检查用户是否开启了通知
  if (!getOrderNotificationSetting()) {
    console.log("用户已关闭订单通知，跳过订阅引导");
    onCancel && onCancel("disabled");
    return;
  }

  // 检查是否应该显示引导
  if (!shouldShowSubscriptionGuide()) {
    console.log("订阅引导显示频率限制，跳过引导");
    onCancel && onCancel("throttled");
    return;
  }

  // 根据上下文选择合适的提示文案
  let title = "开启消息通知";
  let content = "为了及时通知您任务相关信息，请授权接收订阅消息";

  switch (context) {
    case "publish":
      content = "任务发布后将通知附近的接单员，是否开启消息通知";
      break;
    case "accept":
      content = "接单后将通知发布者，任务完成时也会收到通知，是否开启消息通知";
      break;
  }

  uni.showModal({
    title: title,
    content: content,
    confirmText: "去授权",
    cancelText: "稍后再说",
    success: (res) => {
      if (res.confirm) {
        markSubscriptionGuideShown();
        onConfirm && onConfirm();
      } else {
        onCancel && onCancel("user_cancel");
      }
    },
    fail: () => {
      onCancel && onCancel("modal_fail");
    },
  });
}

/**
 * 通知设置状态枚举
 */
export const NOTIFICATION_STATUS = {
  ENABLED: "enabled",
  DISABLED: "disabled",
  UNKNOWN: "unknown",
};

export default {
  getOrderNotificationSetting,
  setOrderNotificationSetting,
  shouldShowSubscriptionGuide,
  markSubscriptionGuideShown,
  smartSubscriptionGuide,
  NOTIFICATION_STATUS,
};
