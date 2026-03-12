// routes/dispatchTeam.routes.js
const express = require("express");
const router = express.Router();
const dispatchTeamController = require("../controllers/dispatchTeam.controller");
const authJwt = require("../middleware/authJwt");

// 管理员路由
router.post(
  "/",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.createTeam
);
router.get(
  "/",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.getAllTeams
);
router.get(
  "/:teamId",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.getTeamDetail
);
router.put(
  "/:teamId",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.updateTeam
);
router.delete(
  "/:teamId",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.deleteTeam
);

// 团队成员管理
router.get(
  "/:teamId/members",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.getTeamMembers
);
router.delete(
  "/:teamId/members/:memberId",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.removeTeamMember
);
router.put(
  "/:teamId/members/:memberId/status",
  authJwt.verifyToken,
  authJwt.isAdmin,
  dispatchTeamController.updateMemberStatus
);

module.exports = router;
