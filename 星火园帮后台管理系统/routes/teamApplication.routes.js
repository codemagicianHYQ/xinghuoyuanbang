// routes/teamApplication.routes.js
const express = require("express");
const router = express.Router();
const teamApplicationController = require("../controllers/teamApplication.controller");
const authJwt = require("../middleware/authJwt");

// 用户端路由
router.post(
  "/apply",
  authJwt.verifyToken,
  teamApplicationController.applyToTeam
);
router.get(
  "/my-application",
  authJwt.verifyToken,
  teamApplicationController.getMyApplication
);

// 管理员路由
router.get(
  "/all",
  authJwt.verifyToken,
  authJwt.isAdmin,
  teamApplicationController.getAllApplications
);
router.put(
  "/:applicationId/review",
  authJwt.verifyToken,
  authJwt.isAdmin,
  teamApplicationController.reviewApplication
);

module.exports = router;
