require("dotenv").config();

module.exports = {
  PORT: process.env.SERVER_PORT || 1111,
  BASE_URL: process.env.BASE_URL || "http://localhost:1111",
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || "admin-token-placeholder",
  WECHAT_APPID: process.env.WECHAT_APPID || "wx2fc8b63c0eed31a4",
  WECHAT_MCHID: process.env.WECHAT_MCHID || "1723045531",
  WECHAT_APIv3KEY:
    process.env.WECHAT_APIv3KEY || "aZ3kL9bX7fQp1RmYcVd6TgH2sNwEoJ5M",
  WECHAT_PUBLIC_KEY_PATH:
    process.env.WECHAT_PUBLIC_KEY_PATH || "/etc/wechatpay/apiclient_cert.pem",
  WECHAT_PRIVATE_KEY_PATH:
    process.env.WECHAT_PRIVATE_KEY_PATH || "/etc/wechatpay/apiclient_key.pem",
  WECHAT_SERIAL:
    process.env.WECHAT_SERIAL || "3936CD26CA1558A008F7A8262A1F1EFA7BC8DC9E",
};
