import axiosInstance from "./axiosInstance";

// 获取系统性能概览
export const getSystemOverview = async () => {
  try {
    const response = await axiosInstance.get("/performance/overview");
    return response;
  } catch (error) {
    console.error("获取系统性能概览失败:", error);
    throw error;
  }
};

// 获取API性能统计
export const getApiPerformance = async () => {
  try {
    const response = await axiosInstance.get("/performance/api");
    return response;
  } catch (error) {
    console.error("获取API性能统计失败:", error);
    throw error;
  }
};

// 获取缓存性能统计
export const getCachePerformance = async () => {
  try {
    const response = await axiosInstance.get("/performance/cache");
    return response;
  } catch (error) {
    console.error("获取缓存性能统计失败:", error);
    throw error;
  }
};

// 获取性能报告
export const getPerformanceReport = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/performance/report", {
      params,
    });
    return response;
  } catch (error) {
    console.error("获取性能报告失败:", error);
    throw error;
  }
};

// 清理缓存
export const clearCache = async (type, pattern) => {
  try {
    const response = await axiosInstance.post("/performance/cache/clear", {
      type,
      pattern,
    });
    return response;
  } catch (error) {
    console.error("清理缓存失败:", error);
    throw error;
  }
};

// 预热缓存
export const warmupCache = async (strategy, items) => {
  try {
    const response = await axiosInstance.post("/performance/cache/warmup", {
      strategy,
      items,
    });
    return response;
  } catch (error) {
    console.error("预热缓存失败:", error);
    throw error;
  }
};
