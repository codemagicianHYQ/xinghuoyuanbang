const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { verifyToken } = require("../middleware/authJwt");
const { apiLimiter } = require("../middleware/security");

// 提交反馈（允许匿名）
router.post("/", apiLimiter, feedbackController.submitFeedback);

// 获取用户反馈列表（需要登录）
router.get(
  "/user",
  [verifyToken, apiLimiter],
  feedbackController.getUserFeedbacks
);

// 管理员获取所有反馈列表
router.get(
  "/admin/all",
  [verifyToken, apiLimiter],
  feedbackController.getAllFeedbacks
);

// 管理员获取反馈详情
router.get(
  "/admin/:id",
  [verifyToken, apiLimiter],
  feedbackController.getFeedbackDetail
);

// 管理员处理反馈
router.put(
  "/admin/:id/process",
  [verifyToken, apiLimiter],
  feedbackController.processFeedback
);

// 管理员删除反馈
router.delete(
  "/admin/:id",
  [verifyToken, apiLimiter],
  feedbackController.deleteFeedback
);

module.exports = router;
