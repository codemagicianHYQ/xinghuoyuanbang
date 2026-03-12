import axiosInstance from "./axiosInstance";
import axios from "axios";

// 创建专门用于campus API的axios实例
const campusAxios = axios.create({
  baseURL: "/campushelper/api/v1",
  timeout: 10000,
});

// 社区管理API
export const communityManagementAPI = {
  // 获取社区列表
  getCommunitiesList(params) {
    return axiosInstance.get("/community-management/communities", {
      params,
    });
  },

  // 创建社区
  createCommunity(data) {
    return axiosInstance.post("/community-management/communities", data);
  },

  // 获取社区详情
  getCommunityDetail(id) {
    return axiosInstance.get(`/community-management/communities/${id}`);
  },

  // 更新社区
  updateCommunity(id, data) {
    return axiosInstance.put(`/community-management/communities/${id}`, data);
  },

  // 删除社区
  deleteCommunity(id) {
    return axiosInstance.delete(`/community-management/communities/${id}`);
  },

  // 获取社区统计数据
  getCommunityStats(id, params) {
    return axiosInstance.get(`/community-management/communities/${id}/stats`, {
      params,
    });
  },

  // 批量操作社区
  batchOperationCommunities(data) {
    return axiosInstance.post("/community-management/communities/batch", data);
  },

  // 批量删除社区
  batchDeleteCommunities(communityIds) {
    return axiosInstance.post("/community-management/communities/batch", {
      action: "delete",
      communityIds,
    });
  },

  // 获取社区选项
  getCommunityOptions(params) {
    return axiosInstance.get("/community-management/options", { params });
  },

  // 获取省份列表
  getProvinces() {
    return campusAxios.get("/campuses/provinces");
  },

  // 根据省份获取城市列表
  getCitiesByProvince(province) {
    return campusAxios.get(`/campuses/provinces/${province}/cities`);
  },

  // 添加社区管理员
  addCommunityAdmin(communityId, userId) {
    return axiosInstance.post(
      `/community-management/communities/${communityId}/admin`,
      { userId }
    );
  },

  // 删除社区管理员
  removeCommunityAdmin(communityId) {
    return axiosInstance.delete(
      `/community-management/communities/${communityId}/admin`
    );
  },

  // 获取社区管理员信息
  getCommunityAdmin(communityId) {
    return axiosInstance.get(
      `/community-management/communities/${communityId}/admin`
    );
  },
};
