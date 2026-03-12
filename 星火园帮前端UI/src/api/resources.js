import axiosInstance from "./axiosInstance";

// 获取资源列表
export const getResources = (params) => {
  return axiosInstance.get("/resources", { params });
};

// 获取单个资源详情
export const getResourceById = (id) => {
  return axiosInstance.get(`/resources/${id}`);
};

// 创建新资源
export const createResource = (data) => {
  return axiosInstance.post("/resources", data);
};

// 更新资源
export const updateResource = (id, data) => {
  return axiosInstance.put(`/resources/${id}`, data);
};

// 删除资源
export const deleteResource = (id) => {
  return axiosInstance.delete(`/resources/${id}`);
};

// 获取热门资源
export const getHotResources = (params) => {
  return axiosInstance.get("/resources/hot", { params });
};

// 获取推荐资源
export const getRecommendedResources = (params) => {
  return axiosInstance.get("/resources/recommended", { params });
};

// 增加下载次数
export const incrementDownloads = (id) => {
  return axiosInstance.post(`/resources/${id}/download`);
};

// 获取资源统计信息
export const getResourceStats = () => {
  return axiosInstance.get("/resources/stats");
};
