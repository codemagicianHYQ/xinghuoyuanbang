// common/request.js - 性能优化版本
import config, { USER_AUTH_TOKEN_KEY, USER_INFO_KEY } from "./config.js";

const baseURL = config.baseURL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_INTERVAL = 300; // 减少请求间隔到300ms

// 请求队列，防止并发请求过多
let requestQueue = [];
let isProcessing = false;

// 性能监控
const performanceMonitor = {
  requests: new Map(),
  stats: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    slowRequests: 0,
  },
};

// 请求去重缓存
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5秒缓存

// 处理请求队列
const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;

  isProcessing = true;
  const { options, resolve, reject } = requestQueue.shift();

  try {
    const result = await makeRequest(options);
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    isProcessing = false;
    // 延迟处理下一个请求
    setTimeout(() => {
      processQueue();
    }, REQUEST_INTERVAL);
  }
};

// 生成请求缓存键
const generateCacheKey = (options) => {
  const { url, method = "GET", data = {} } = options;
  return `${method}:${url}:${JSON.stringify(data)}`;
};

// 检查请求缓存
const getCachedRequest = (cacheKey) => {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  requestCache.delete(cacheKey);
  return null;
};

// 设置请求缓存
const setCachedRequest = (cacheKey, data) => {
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

// 实际发起请求的函数
const makeRequest = (options, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const requestId = `${Date.now()}_${Math.random()}`;

    // 性能监控开始
    performanceMonitor.requests.set(requestId, {
      startTime,
      url: options.url,
      method: options.method || "GET",
    });

    // 检查请求去重
    if (options.method === "GET" && !options.skipCache) {
      const cacheKey = generateCacheKey(options);
      const cachedData = getCachedRequest(cacheKey);
      if (cachedData) {
        console.log(`🚀 请求缓存命中: ${options.url}`);
        resolve(cachedData);
        return;
      }
    }
    const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
    const userInfo = uni.getStorageSync(USER_INFO_KEY);
    // 确保token格式正确，避免重复添加Bearer前缀
    let cleanToken = token;
    if (token) {
      // 先清理可能存在的重复Bearer前缀
      let tempToken = token;
      while (tempToken.startsWith("Bearer Bearer ")) {
        tempToken = tempToken.substring(7); // 移除一个"Bearer "
        console.log(
          "检测到重复Bearer前缀，清理后:",
          tempToken.substring(0, 50) + "..."
        );
      }

      // 处理其他可能的重复情况
      while (tempToken.startsWith("BearerBearer")) {
        tempToken = tempToken.substring(6); // 移除一个"Bearer"
        console.log(
          "检测到重复Bearer前缀(无空格)，清理后:",
          tempToken.substring(0, 50) + "..."
        );
      }

      // 然后处理正常的Bearer前缀
      if (tempToken.startsWith("Bearer ")) {
        cleanToken = tempToken;
      } else if (tempToken.startsWith("Bearer")) {
        // 如果只有Bearer没有空格，添加空格
        cleanToken = "Bearer " + tempToken.substring(6);
      } else {
        // 如果没有Bearer前缀，添加它
        cleanToken = "Bearer " + tempToken;
      }

      // 如果清理后的token与原始token不同，更新存储
      if (cleanToken !== token) {
        console.log("Token格式已修复，更新存储");
        uni.setStorageSync(USER_AUTH_TOKEN_KEY, cleanToken);
      }
    }

    const headers = {
      "Content-Type": "application/json",
      ...(options.header || {}),
      ...(cleanToken ? { token: cleanToken } : {}),
    };

    // loading处理
    if (options.showLoading) {
      uni.showLoading({
        title: options.loadingText || "加载中...",
        mask: true,
      });
    }

    uni.request({
      url: options.url.startsWith("http")
        ? options.url
        : (options.baseURL || baseURL) + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: headers,
      timeout: options.timeout || 15000,
      success: (res) => {
        // 性能监控结束
        const endTime = Date.now();
        const duration = endTime - startTime;
        const requestInfo = performanceMonitor.requests.get(requestId);

        if (requestInfo) {
          performanceMonitor.requests.delete(requestId);
          performanceMonitor.stats.totalRequests++;

          if (res.statusCode >= 200 && res.statusCode < 300) {
            performanceMonitor.stats.successfulRequests++;
          } else {
            performanceMonitor.stats.failedRequests++;
          }

          // 更新平均响应时间
          const totalTime =
            performanceMonitor.stats.averageResponseTime *
              (performanceMonitor.stats.totalRequests - 1) +
            duration;
          performanceMonitor.stats.averageResponseTime =
            totalTime / performanceMonitor.stats.totalRequests;

          // 记录慢请求
          if (duration > 2000) {
            performanceMonitor.stats.slowRequests++;
            console.warn(
              `🐌 慢请求: ${requestInfo.method} ${requestInfo.url} - ${duration}ms`
            );
          }

          // 记录性能数据
          console.log(
            `📊 请求性能: ${requestInfo.method} ${requestInfo.url} - ${duration}ms`
          );
        }

        // 自动续期：检测响应头x-renewed-token（兼容小写和大写）
        let renewedToken = null;
        if (res.header) {
          for (const k in res.header) {
            if (k.toLowerCase() === "x-renewed-token") {
              renewedToken = res.header[k];
              break;
            }
          }
        }
        // 只有2xx响应时才自动覆盖本地token
        if (renewedToken && res.statusCode >= 200 && res.statusCode < 300) {
          uni.setStorageSync(USER_AUTH_TOKEN_KEY, renewedToken);
          // 新增：token续期后自动刷新用户信息
          request({
            url: "/auth/me",
            method: "GET",
            // 自动带上新token
          })
            .then((freshUserInfo) => {
              if (freshUserInfo) {
                uni.setStorageSync(
                  USER_INFO_KEY,
                  JSON.stringify(freshUserInfo)
                );
              }
            })
            .catch((e) => {
              console.error("[request.js] token续期后刷新userInfo失败", e);
            });
        }
        if (options.showLoading) {
          uni.hideLoading();
        }

        // 处理429错误（请求过于频繁）
        if (res.statusCode === 429) {
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              makeRequest(options, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, RETRY_DELAY * (retryCount + 1));
            return;
          } else {
            uni.showToast({
              title: "请求过于频繁，请稍后再试",
              icon: "none",
              duration: 3000,
            });
            reject(new Error("请求过于频繁"));
            return;
          }
        }

        if ((res.statusCode === 200 || res.statusCode === 201) && res.data) {
          if (typeof res.data.code === "undefined" || res.data.code === 0) {
            // 缓存GET请求的响应
            if (options.method === "GET" && !options.skipCache) {
              const cacheKey = generateCacheKey(options);
              setCachedRequest(cacheKey, res.data);
            }
            resolve(res.data);
          } else {
            uni.showToast({
              title: res.data.message || "请求失败",
              icon: "none",
            });
            reject(res.data);
          }
        } else if (res.statusCode === 400) {
          // 处理400错误，显示具体的错误信息
          let errorMessage = "请求参数错误";

          // 尝试从响应中获取具体错误信息
          if (res.data && res.data.message) {
            errorMessage = res.data.message;
          } else if (res.data && res.data.error) {
            errorMessage = res.data.error;
          } else if (res.data && typeof res.data === "string") {
            errorMessage = res.data;
          }

          // 针对接单接口的特殊处理
          if (options.url && options.url.includes("/accept")) {
            if (
              errorMessage.includes("自己") ||
              errorMessage.includes("发布者")
            ) {
              errorMessage = "不能接自己发布的订单哦";
            } else if (
              errorMessage.includes("已接") ||
              errorMessage.includes("assigned")
            ) {
              errorMessage = "该订单已被其他用户接单";
            } else if (
              errorMessage.includes("权限") ||
              errorMessage.includes("permission")
            ) {
              errorMessage = "您没有接单权限，请先申请成为接单员";
            } else if (
              errorMessage.includes("状态") ||
              errorMessage.includes("status")
            ) {
              errorMessage = "订单状态不允许接单";
            }
          }

          // 针对退款接口的特殊处理
          if (options.url && options.url.includes("/refund/apply")) {
            if (
              errorMessage.includes("订单已全额退款") ||
              errorMessage.includes("已全额退款") ||
              errorMessage.includes("ALREADY_REFUNDED")
            ) {
              errorMessage = "该订单已经退款，无需重复操作";
            } else if (
              errorMessage.includes("INVALID_REQUEST") ||
              errorMessage.includes("请求参数无效")
            ) {
              errorMessage = "退款请求参数无效，请检查订单状态";
            }
          }

          uni.showToast({
            title: errorMessage,
            icon: "none",
            duration: 3000,
          });
          reject(res);
        } else if (res.statusCode === 401 || res.statusCode === 404) {
          // 针对任务列表接口，404也当作空数据
          if (
            res.statusCode === 404 &&
            options.url &&
            (options.url.includes("/my-published") ||
              options.url.includes("/my-accepted"))
          ) {
            resolve({
              tasks: [],
              totalItems: 0,
              totalPages: 1,
              currentPage: 1,
            });
            return;
          }

          // 针对资源API，404也当作空数据
          if (
            res.statusCode === 404 &&
            options.url &&
            options.url.includes("/resources")
          ) {
            resolve({
              success: true,
              data: {
                list: [],
                total: 0,
                page: 1,
                pageSize: 10,
              },
            });
            return;
          }
          // 只对认证相关接口清空token
          const isAuthApi =
            options.url &&
            (options.url.includes("/auth/me") ||
              options.url.includes("/auth/login") ||
              options.url.includes("/auth/wechat-login"));
          if (isAuthApi && res.statusCode === 401) {
            uni.removeStorageSync(USER_AUTH_TOKEN_KEY);
            uni.removeStorageSync(USER_INFO_KEY);
            uni.showToast({ title: "登录已过期，请重新登录", icon: "none" });
            // 可选：全局登出逻辑，如跳转登录页
          } else if (res.statusCode === 401) {
            // 非认证接口的401错误，显示弹窗提示重新登录
            showTokenExpiredDialog();
          } else {
            uni.showToast({
              title: "接口不存在/无权限",
              icon: "none",
            });
          }
          reject(res);
        } else if (res.statusCode === 503) {
          // 处理维护模式503错误
          let maintenanceMessage = "系统正在维护中，请稍后再试...";

          // 检查响应数据中是否包含维护信息
          if (res.data && res.data.data && res.data.data.maintenanceMessage) {
            maintenanceMessage = res.data.data.maintenanceMessage;
          } else if (res.data && res.data.message) {
            maintenanceMessage = res.data.message;
          }

          // 更新本地维护状态
          uni.setStorageSync("maintenanceMode", true);
          uni.setStorageSync("maintenanceMessage", maintenanceMessage);

          // 只在特定情况下显示弹窗（避免重复弹窗）
          const shouldShowModal = !uni.getStorageSync("maintenanceModalShown");
          if (shouldShowModal) {
            uni.setStorageSync("maintenanceModalShown", true);
            uni.showModal({
              title: "系统维护中",
              content: maintenanceMessage,
              showCancel: false,
              confirmText: "我知道了",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 用户确认后，可以选择跳转到首页或退出小程序
                  uni.switchTab({
                    url: "/pages/home/home",
                  });
                }
              },
            });
          }

          reject(res);
        } else {
          uni.showToast({ title: "服务器异常", icon: "none" });
          reject(res);
        }
      },
      fail: (err) => {
        if (options.showLoading) {
          uni.hideLoading();
        }
        uni.showToast({ title: "网络请求失败", icon: "none" });
        reject(err);
      },
      complete: () => {
        if (options.showLoading) {
          uni.hideLoading();
        }
      },
    });
  });
};

// 显示token过期弹窗
const showTokenExpiredDialog = () => {
  // 防止重复弹窗
  if (window.hasShownExpiredDialog) {
    return;
  }
  window.hasShownExpiredDialog = true;

  uni.showModal({
    title: "登录已过期",
    content: "您的登录状态已过期，请重新登录",
    showCancel: false,
    confirmText: "重新登录",
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的登录信息
        uni.removeStorageSync(USER_AUTH_TOKEN_KEY);
        uni.removeStorageSync(USER_INFO_KEY);

        // 跳转到登录页面
        uni.reLaunch({
          url: "/pages/login/login",
        });
      }
    },
    complete: () => {
      // 重置弹窗标记，允许下次过期时再次弹窗
      setTimeout(() => {
        window.hasShownExpiredDialog = false;
      }, 5000); // 5秒后重置
    },
  });
};

// 主请求函数，带队列控制
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 将请求加入队列
    requestQueue.push({ options, resolve, reject });
    processQueue();
  });
};

// 获取性能统计信息
export const getPerformanceStats = () => {
  return {
    ...performanceMonitor.stats,
    activeRequests: performanceMonitor.requests.size,
    cacheSize: requestCache.size,
  };
};

// 清除缓存
export const clearCache = () => {
  requestCache.clear();
  console.log("🧹 请求缓存已清除");
};

// 获取缓存统计
export const getCacheStats = () => {
  const now = Date.now();
  let validCache = 0;
  let expiredCache = 0;

  requestCache.forEach((value, key) => {
    if (now - value.timestamp < CACHE_DURATION) {
      validCache++;
    } else {
      expiredCache++;
    }
  });

  return {
    total: requestCache.size,
    valid: validCache,
    expired: expiredCache,
  };
};

export default request;
