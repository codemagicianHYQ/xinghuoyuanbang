/**
 * 消息订阅服务
 * 统一管理微信小程序的消息订阅功能
 */

// 消息模板ID配置
// 注意：不同的模板ID会显示不同样式的弹窗
const MESSAGE_TEMPLATES = {
  TASK_ACCEPTED: "58VecsBQtioKWF8uBfXjhtSyX2MmzNcXqaZUQJk_oe4", // 订单接单通知
  TASK_DELIVERED: "Buc3PRwms6j6QV5dPjzJwo0QmCGts5OU9x8TTxyhxc4", // 订单送达通知
  TASK_COMPLETED: "e4Jkk2iypweLiPMBqQbWgbx189wjq3hZGG6An-_sS5A", // 订单完成通知
  TASK_CANCELLED: "v5l1vaSjSJaD1AWdxxsasj2OtWsXjWjMB_i9chdliJY", // 订单取消通知
  // 备用模板ID（如果上面的模板ID有问题，可以尝试这些）
  TASK_ACCEPTED_ALT: "vtPkIE3rnciTE0kVXE3WVhmz6KUkATBh5Nl9LytMX0g", // 备用接单通知
  TASK_DELIVERED_ALT: "Buc3PRwms6j6QV5dPjzJwo0QmCGts5OU9x8TTxyhxc4", // 备用送达通知
  TASK_COMPLETED_ALT: "e4Jkk2iypweLiPMBqQbWgbx189wjq3hZGG6An-_sS5A", // 备用完成通知
};

/**
 * 检查用户是否已订阅消息通知
 * @returns {Promise<boolean>} 是否已订阅
 */
export async function checkMessageSubscription() {
  try {
    // 检查本地存储的设置
    const orderNotificationSetting = uni.getStorageSync(
      "orderNotificationSetting"
    );

    // 检查是否已经授权过订阅消息
    const hasAuthorized = uni.getStorageSync("hasAuthorizedSubscription");

    // 如果用户已经授权过，且本地设置为true，认为已订阅
    if (hasAuthorized === true && orderNotificationSetting === true) {
      return true;
    }

    // 如果本地存储中没有订阅状态，认为未订阅
    if (
      orderNotificationSetting === null ||
      orderNotificationSetting === undefined
    ) {
      return false;
    }

    // 如果明确设置为false，认为未订阅
    if (orderNotificationSetting === false) {
      return false;
    }

    // 检查微信订阅消息权限
    const authSetting = uni.getSetting();
    if (
      authSetting.authSetting &&
      authSetting.authSetting["scope.subscribeMessage"] === false
    ) {
      return false; // 用户拒绝了订阅消息权限
    }

    return orderNotificationSetting === true; // 只有明确为true才认为已订阅
  } catch (error) {
    console.error("检查消息订阅状态失败:", error);
    return false; // 出错时默认认为未订阅
  }
}

/**
 * 请求消息订阅权限
 * @param {Array<string>} tmplIds 要订阅的模板ID数组，为空时使用默认模板
 * @returns {Promise<boolean>} 订阅是否成功
 */
export async function requestMessageSubscription(tmplIds = null) {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    const templateIds = tmplIds || [
      // 尝试使用不同的模板ID组合
      // 如果某些模板ID无效，微信可能只显示有效的模板
      MESSAGE_TEMPLATES.TASK_ACCEPTED, // 订单接单通知
      MESSAGE_TEMPLATES.TASK_DELIVERED, // 订单送达通知
      MESSAGE_TEMPLATES.TASK_COMPLETED, // 订单完成通知
      // 注意：微信小程序一次最多只能请求3个模板
      // 如果某些模板ID无效，微信会自动过滤掉无效的模板
    ];

    // 过滤掉无效的模板ID
    const validTemplateIds = templateIds.filter((id) => id && id.trim() !== "");

    if (validTemplateIds.length === 0) {
      console.error("没有有效的模板ID");
      resolve(false);
      return;
    }

    console.log("开始请求订阅消息，有效模板ID:", validTemplateIds);
    console.log("原始模板ID:", templateIds);
    console.log("模板ID数量:", validTemplateIds.length);

    // 详细验证每个模板ID
    validTemplateIds.forEach((id, index) => {
      console.log(`模板ID ${index + 1}: ${id}`);
      console.log(`  长度: ${id.length}`);
      console.log(
        `  格式检查: ${/^[a-zA-Z0-9_-]+$/.test(id) ? "有效" : "无效"}`
      );
    });

    wx.requestSubscribeMessage({
      tmplIds: validTemplateIds,
      success: (res) => {
        console.log("订阅消息授权结果:", res);
        console.log("使用的模板ID列表:", validTemplateIds);
        console.log("微信返回结果详情:", JSON.stringify(res, null, 2));

        // 检查返回结果中缺少的模板ID
        const returnedTemplateIds = Object.keys(res).filter(
          (key) => key !== "errMsg"
        );
        const missingTemplateIds = validTemplateIds.filter(
          (id) => !returnedTemplateIds.includes(id)
        );

        if (missingTemplateIds.length > 0) {
          console.warn("以下模板ID在返回结果中缺失:", missingTemplateIds);
          console.warn("这可能表示这些模板ID无效或已过期");
        }

        // 获取订阅成功的通知类型
        const acceptedNotifications = [];
        const notificationNames = {
          [MESSAGE_TEMPLATES.TASK_ACCEPTED]: "订单接单通知",
          [MESSAGE_TEMPLATES.TASK_DELIVERED]: "订单送达通知",
          [MESSAGE_TEMPLATES.TASK_COMPLETED]: "订单完成通知",
          [MESSAGE_TEMPLATES.TASK_CANCELLED]: "订单取消通知",
        };

        Object.entries(res).forEach(([tmplId, status]) => {
          console.log(`模板ID ${tmplId} 状态: ${status}`);
          if (status === "accept") {
            acceptedNotifications.push(notificationNames[tmplId] || "未知通知");
          }
        });

        if (acceptedNotifications.length > 0) {
          // 订阅成功，保存设置
          uni.setStorageSync("orderNotificationSetting", true);
          uni.setStorageSync("hasAuthorizedSubscription", true);
          console.log("订阅成功，已保存设置");
          console.log("订阅成功的通知类型:", acceptedNotifications);

          // 显示订阅成功提示
          uni.showToast({
            title: `已授权${acceptedNotifications.length}个通知`,
            icon: "success",
            duration: 2000,
          });

          resolve(true);
        } else {
          console.log("用户拒绝所有通知");
          // 用户拒绝所有通知，清除订阅状态
          uni.removeStorageSync("orderNotificationSetting");
          uni.setStorageSync("hasAuthorizedSubscription", false);
          resolve(false);
        }
      },
      fail: (err) => {
        console.log("订阅消息授权失败:", err);
        // 不显示自定义提示，让微信官方的错误处理自然显示
        resolve(false);
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    resolve(true); // 非微信小程序环境直接返回成功
    // #endif
  });
}

/**
 * 确认是否继续操作（无订阅）
 * @param {string} title 弹窗标题
 * @param {string} content 弹窗内容
 * @param {string} confirmText 确认按钮文字
 * @param {string} cancelText 取消按钮文字
 * @returns {Promise<boolean>} 是否继续操作
 */
export async function confirmContinueWithoutSubscription(
  title = "消息通知",
  content = "您未订阅消息通知，可能错过重要信息。是否继续？",
  confirmText = "继续",
  cancelText = "去订阅"
) {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        if (res.confirm) {
          resolve(true); // 继续操作
        } else {
          // 用户选择去订阅，再次请求订阅
          requestMessageSubscription().then(resolve);
        }
      },
    });
  });
}

/**
 * 智能订阅检查：如果用户未订阅，自动弹出订阅提示
 * @param {Array<string>} tmplIds 要订阅的模板ID数组
 * @param {Object} options 配置选项
 * @returns {Promise<boolean>} 是否已订阅或订阅成功
 */
export async function smartSubscriptionCheck(tmplIds = null, options = {}) {
  const {
    forceCheck = false, // 是否强制检查
    showContinueDialog = true, // 是否显示继续操作对话框
    title = "消息通知",
    content = "您未订阅消息通知，可能错过重要信息。是否继续？",
    confirmText = "继续",
    cancelText = "去订阅",
  } = options;

  try {
    // 检查是否已订阅
    const hasSubscribed = await checkMessageSubscription();

    if (hasSubscribed && !forceCheck) {
      return true; // 已订阅且不需要强制检查
    }

    if (!hasSubscribed) {
      // 请求订阅
      const subscribeResult = await requestMessageSubscription(tmplIds);

      if (!subscribeResult && showContinueDialog) {
        // 订阅失败，询问是否继续
        return await confirmContinueWithoutSubscription(
          title,
          content,
          confirmText,
          cancelText
        );
      }

      return subscribeResult;
    }

    return true;
  } catch (error) {
    console.error("智能订阅检查失败:", error);
    return true; // 出错时默认允许继续
  }
}

// 导出模板ID常量
export { MESSAGE_TEMPLATES };

/**
 * 测试订阅消息功能（调试用）
 */
export async function testSubscription() {
  console.log("=== 测试订阅消息功能 ===");
  console.log("当前模板ID配置:", MESSAGE_TEMPLATES);

  try {
    // 检查微信环境
    // #ifdef MP-WEIXIN
    console.log("当前环境: 微信小程序");

    // 检查订阅消息权限
    const setting = uni.getSetting();
    console.log("微信设置:", setting);

    if (
      setting.authSetting &&
      setting.authSetting["scope.subscribeMessage"] === false
    ) {
      console.log("用户已拒绝订阅消息权限");
      return false;
    }

    // 验证模板ID有效性
    console.log("=== 验证模板ID有效性 ===");
    const templateIds = [
      MESSAGE_TEMPLATES.TASK_ACCEPTED,
      MESSAGE_TEMPLATES.TASK_DELIVERED,
      MESSAGE_TEMPLATES.TASK_COMPLETED,
    ];

    templateIds.forEach((id, index) => {
      const names = ["订单接单通知", "订单送达通知", "订单完成通知"];
      console.log(`${names[index]} 模板ID: ${id}`);
      console.log(`  长度: ${id ? id.length : 0}`);
      console.log(`  是否为空: ${!id || id.trim() === ""}`);
      console.log(
        `  格式: ${
          id ? (id.match(/^[a-zA-Z0-9_-]+$/) ? "有效" : "格式异常") : "无效"
        }`
      );
    });

    // 尝试请求订阅
    const result = await requestMessageSubscription();
    console.log("订阅结果:", result);
    return result;
    // #endif

    // #ifndef MP-WEIXIN
    console.log("当前环境: 非微信小程序");
    return true;
    // #endif
  } catch (error) {
    console.error("测试订阅消息失败:", error);
    return false;
  }
}
