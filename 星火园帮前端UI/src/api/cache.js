import axiosInstance from "./axiosInstance";

export const getCacheStats = async () => {
  const response = await axiosInstance.get("/cache/stats");
  return response.data;
};

export const getRedisInfo = async () => {
  const response = await axiosInstance.get("/cache/redis-info");
  return response.data;
};

export const testCacheConnection = async () => {
  const response = await axiosInstance.get("/cache/test-connection");
  return response.data;
};

export const getCacheStrategies = async () => {
  const response = await axiosInstance.get("/cache/strategies");
  return response.data;
};

export const clearCacheByStrategy = async (strategy) => {
  const response = await axiosInstance.delete(`/cache/strategy/${strategy}`);
  return response.data;
};

export const clearCacheByTag = async (tag) => {
  const response = await axiosInstance.delete(`/cache/tag/${tag}`);
  return response.data;
};

export const clearAllCache = async () => {
  const response = await axiosInstance.delete("/cache/all");
  return response.data;
};

export const warmupCache = async (strategy, identifiers) => {
  const response = await axiosInstance.post("/cache/warmup", {
    strategy,
    identifiers,
  });
  return response.data;
};
