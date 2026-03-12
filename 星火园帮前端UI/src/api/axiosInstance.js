import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router"; // 引入 router 实例用于导航

// 后端 API 的基础路径
// 使用相对路径，生产/开发均请求当前域名，由 Nginx 代理到后端
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/admin/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin-auth-token");
    if (token) {
      // 同时设置多个token字段，确保后端能识别
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["token"] = token;
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么，例如直接返回 response.data
    // 假设后端成功时，数据在 response.data 中，或者 response.data.data
    // 这里的处理取决于你的后端 API 如何设计成功和失败的响应体
    return response; // 直接返回整个响应，让调用处处理 response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || "发生未知错误";

      switch (status) {
        case 400: // Bad Request
          console.warn(`请求错误: ${message}`);
          break;
        case 401: // Unauthorized
          ElMessage.error("认证失败或Token已过期，请重新登录。");
          localStorage.removeItem("admin-auth-token"); // 清除无效/过期token
          localStorage.removeItem("admin-user-info");
          router.push({ name: "Login" }); // 跳转到登录页
          break;
        case 403: // Forbidden
          console.warn(`权限不足: ${message}`);
          break;
        case 404: // Not Found
          // 对于404错误，只在控制台记录，不显示错误消息
          console.warn(`API接口不存在: ${error.config.url}`);
          break;
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
          console.warn(`服务器错误 (${status}): ${message}`);
          break;
        default:
          console.warn(`发生错误 (${status}): ${message}`);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.warn(
        "网络错误或服务器无响应，请检查您的网络连接和后端服务状态。"
      );
    } else {
      // 设置请求时发生了一些事情，触发了错误
      console.warn(`请求发起时出错: ${error.message}`);
    }
    return Promise.reject(error); // 继续传递错误，让调用处的 catch 也能处理
  }
);

export default axiosInstance;
