// 微信客服配置
export const wechatServiceConfig = {
  // 企业微信客服配置
  customerService: {
    // 企业ID (用户提供的实际企业ID)
    corpId: "ww4f94bec1d56104e4",

    // 客服链接 (用户提供的实际客服链�?
    url: "https://work.weixin.qq.com/kfid/kfcc460616b96351981",

    // 小程序气泡消息配�?
    showMessageCard: true,
    sendMessageTitle: "星火园帮客服",
    sendMessagePath: "/pages/index/index",
    sendMessageImg: "/static/icons/service.png",
  },

  // 备用联系方式
  fallback: {
    wechatId: "spark-help",
    phoneNumber: "400-123-4567",
    serviceTime: "9:00-22:00",
  },
};

// 检查是否支持微信客服API
export function isCustomerServiceSupported() {
  try {
    const systemInfo = uni.getSystemInfoSync();
    const version = systemInfo.SDKVersion;
    return compareVersion(version, "2.19.0") >= 0;
  } catch (error) {
    // 如果新API不可用，尝试使用旧API
    try {
      const systemInfo = uni.getSystemInfoSync();
      const version = systemInfo.SDKVersion;
      return compareVersion(version, "2.19.0") >= 0;
    } catch (e) {
      console.warn("无法获取系统信息，默认不支持客服API");
      return false;
    }
  }
}

// 版本比较函数
export function compareVersion(v1, v2) {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

// 打开微信客服
export function openCustomerService() {
  return new Promise((resolve, reject) => {
    if (!isCustomerServiceSupported()) {
      reject(new Error("基础库版本过低，不支持微信客服API"));
      return;
    }

    wx.openCustomerServiceChat({
      extInfo: {
        url: wechatServiceConfig.customerService.url,
      },
      corpId: wechatServiceConfig.customerService.corpId,
      showMessageCard: wechatServiceConfig.customerService.showMessageCard,
      sendMessageTitle: wechatServiceConfig.customerService.sendMessageTitle,
      sendMessagePath: wechatServiceConfig.customerService.sendMessagePath,
      sendMessageImg: wechatServiceConfig.customerService.sendMessageImg,
      success: (res) => {
        console.log("打开客服成功", res);
        resolve(res);
      },
      fail: (err) => {
        console.error("打开客服失败", err);
        reject(err);
      },
    });
  });
}
