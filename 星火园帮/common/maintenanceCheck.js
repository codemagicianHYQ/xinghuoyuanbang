// 维护模式检查工具
export const checkMaintenanceMode = async (showModal = true) => {
  try {
    // 检查是否已经显示过维护弹窗
    const maintenanceModalShown = uni.getStorageSync("maintenanceModalShown");

    // 总是从服务器获取最新的维护状态，不使用本地缓存
    const request = (await import("./request.js")).default;
    const res = await request({
      url: "/maintenance/status",
      method: "GET",
      showLoading: false,
    });

    if (res && res.data && res.data.maintenanceMode) {
      // 服务器返回维护模式，更新本地存储
      uni.setStorageSync("maintenanceMode", true);
      uni.setStorageSync(
        "maintenanceMessage",
        res.data.maintenanceMessage || "系统正在维护中，请稍后再试..."
      );

      if (showModal && !maintenanceModalShown) {
        uni.setStorageSync("maintenanceModalShown", true);
        uni.showModal({
          title: "系统维护",
          content:
            res.data.maintenanceMessage || "系统正在维护中，请稍后再试...",
          showCancel: false,
          confirmText: "我知道了",
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.switchTab({
                url: "/pages/home/home",
              });
            }
          },
        });
      }
      return true;
    } else {
      // 服务器返回非维护模式，清除本地存储
      uni.removeStorageSync("maintenanceMode");
      uni.removeStorageSync("maintenanceMessage");
      uni.removeStorageSync("maintenanceModalShown"); // 清除弹窗标记
      return false;
    }
  } catch (error) {
    // 502/网关错误等：仅调试日志，不当作致命错误（避免控制台一片红）
    console.warn(
      "[maintenance] 无法拉取维护状态，按非维护处理:",
      error?.statusCode || error?.errMsg || error
    );
    return false;
  }
};

// 在页面进入时检查维护模式
export const onPageShow = () => {
  return checkMaintenanceMode();
};

// 静默检查维护模式（不显示弹窗）
export const checkMaintenanceModeSilent = async () => {
  return await checkMaintenanceMode(false);
};

// 在关键操作前检查维护模式
export const beforeAction = async (actionName = "操作") => {
  const isMaintenanceMode = await checkMaintenanceModeSilent();
  if (isMaintenanceMode) {
    const maintenanceMessage =
      uni.getStorageSync("maintenanceMessage") ||
      "系统正在维护中，请稍后再试...";
    uni.showModal({
      title: "系统维护",
      content: maintenanceMessage,
      showCancel: false,
      confirmText: "我知道了",
    });
    return true; // 返回true表示处于维护模式，应该阻止操作
  }
  return false;
};
