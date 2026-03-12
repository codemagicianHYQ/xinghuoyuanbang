// src/api/examProofs.js
import axiosInstance from "./axiosInstance";

// 获取考试资料凭证列表
export const getExamProofs = (params = {}) => {
  return axiosInstance.get("/exam-proofs", { params });
};

// 获取考试资料凭证统计
export const getExamProofStats = (params = {}) => {
  return axiosInstance.get("/exam-proofs/stats", { params });
};

// 审核考试资料凭证
export const reviewExamProof = (proofId, data) => {
  return axiosInstance.put(`/exam-proofs/${proofId}/review`, data);
};

// 获取用户凭证记录
export const getUserProofs = (params = {}) => {
  return axiosInstance.get("/campushelper/api/v1/exam-proof/user", { params });
};
