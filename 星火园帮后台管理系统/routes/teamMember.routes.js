const express = require("express");
const router = express.Router();
const teamMemberController = require("../controllers/teamMember.controller.js");
const { verifyToken } = require("../middleware/authJwt");

// 获取我的团队成员
router.get("/my-team", [verifyToken], teamMemberController.getMyTeamMembers);

// 获取我的接单任务
router.get(
  "/my-accepted-tasks",
  [verifyToken],
  teamMemberController.getMyAcceptedTasks
);

module.exports = router;
