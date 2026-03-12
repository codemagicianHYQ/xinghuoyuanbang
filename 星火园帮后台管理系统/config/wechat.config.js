// config/wechat.config.js
module.exports = {
  // 微信小程序配置
  appId:
    process.env.WECHAT_APP_ID ||
    process.env.WECHAT_APPID ||
    "wx2fc8b63c0eed31a4",
  appSecret:
    process.env.WECHAT_APP_SECRET || "f2b2db1f844805f4fb0f3f743cc5bf85",

  // 微信支付配置
  mchId: process.env.WECHAT_MCH_ID,
  apiKey: process.env.WECHAT_API_KEY,

  // 证书文件路径
  certPath: process.env.WECHAT_CERT_PATH || "./certs/apiclient_cert.pem",
  keyPath: process.env.WECHAT_KEY_PATH || "./certs/apiclient_key.pem",
  caPath: process.env.WECHAT_CA_PATH || "./certs/rootca.pem",

  // 支付相关配置
  notifyUrl:
    process.env.WECHAT_NOTIFY_URL ||
    "https://xinghuoyuanbang.top/api/pay/notify",

  // 企业付款配置
  transferDesc: process.env.WECHAT_TRANSFER_DESC || "星火园帮任务奖励",

  // 消息推送配置
  messageToken: process.env.WECHAT_MESSAGE_TOKEN || "HYQ666888",
  encodingAESKey:
    process.env.WECHAT_ENCODING_AES_KEY ||
    "6vxbimOXv2gMWoO6JcbdbV1UayVtUEa4Aw38L0iZJnd",

  // 消息推送URL（您需要配置到微信后台）
  messageUrl:
    process.env.WECHAT_MESSAGE_URL ||
    "https://xinghuoyuanbang.top/api/wechat/message",

  // 订阅消息模板ID配置
  templates: {
    newTask:
      process.env.WECHAT_TEMPLATE_NEW_TASK ||
      "vtPkIE3rnciTE0kVXE3WVhmz6KUkATBh5Nl9LytMX0g",
    taskAccepted:
      process.env.WECHAT_TEMPLATE_TASK_ACCEPTED ||
      "58VecsBQtioKWF8uBfXjhtSyX2MmzNcXqaZUQJk_oe4",
    taskDelivered:
      process.env.WECHAT_TEMPLATE_TASK_DELIVERED ||
      "Buc3PRwms6j6QV5dPjzJwo0QmCGts5OU9x8TTxyhxc4",
    taskCompleted:
      process.env.WECHAT_TEMPLATE_TASK_COMPLETED ||
      "e4Jkk2iypweLiPMBqQbWgbx189wjq3hZGG6An-_sS5A",
  },

  // 开发环境配置
  isDev: process.env.NODE_ENV === "development",

  // 验证配置是否完整
  validateConfig() {
    const required = ["appId", "mchId", "apiKey"];
    const missing = required.filter((key) => !this[key]);

    if (missing.length > 0) {
      throw new Error(`微信支付配置不完整，缺少: ${missing.join(", ")}`);
    }

    return true;
  },

  // 验证消息推送配置
  validateMessageConfig() {
    const required = ["appId", "messageToken", "encodingAESKey"];
    const missing = required.filter(
      (key) => !this[key] || this[key].includes("YOUR_")
    );

    if (missing.length > 0) {
      console.warn(`微信消息推送配置不完整，缺少: ${missing.join(", ")}`);
      return false;
    }

    return true;
  },
};
