// common/config.js

// 只保留生产环境服务器地址
const baseURL = "https://xinghuoyuanbang.top/campushelper/api/v1";

// 其他全局配置
const APP_NAME = "星火园帮";
const USER_AUTH_TOKEN_KEY = "userAuthToken_xh"; // 存储Token的键名，加个前缀避免冲突
const USER_INFO_KEY = "userInfo_xh"; // 存储用户信息的键名

// 页面路径配置
const PAGE_PATHS = {};

export { APP_NAME, USER_AUTH_TOKEN_KEY, USER_INFO_KEY, PAGE_PATHS };

export default {
  baseURL,
};
