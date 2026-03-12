// routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// --- Uni-app User Profile Routes (Protected by verifyToken) ---
// These routes are prefixed with /campushelper/api/v1/users in routes/index.js

// 系统消息相关路由 - 必须放在通用路由之前
router.get("/system-messages", [verifyToken], userController.getSystemMessages);

// 测试路由，用于调试403问题
router.get("/test-auth", [verifyToken], (req, res) => {
  console.log(`[test-auth] 测试路由被调用，userId: ${req.userId}`);
  res.status(200).json({
    success: true,
    message: "认证测试成功",
    userId: req.userId,
  });
});

// PUT /campushelper/api/v1/users/profile/me - Update current logged-in user's profile
router.put("/profile/me", [verifyToken], userController.updateUserProfile);

// PUT /campushelper/api/v1/users/me - Update current logged-in user's profile (alternative route)
router.put("/me", [verifyToken], userController.updateUserProfile);

// --- Admin Routes for User Management (Protected by isAdmin) ---
// GET /admin/api/v1/users - Get all users (paginated, with search/filter)
router.get("/", [verifyToken, isAdmin], userController.adminGetAllUsers);

// GET /admin/api/v1/users/:id - Get a single user by ID
router.get("/:id", [verifyToken, isAdmin], userController.adminGetUserById);

// PUT /admin/api/v1/users/:id - Update user details (e.g., role, nickname, verification status)
router.put("/:id", [verifyToken, isAdmin], userController.adminUpdateUser);

// DELETE /admin/api/v1/users/:id - Delete a user
router.delete("/:id", [verifyToken, isAdmin], userController.adminDeleteUser);

router.get(
  "/system-messages-debug",
  [verifyToken],
  userController.getSystemMessagesDebug
);
router.put(
  "/system-messages/:messageId/read",
  [verifyToken],
  userController.markSystemMessageAsRead
);

// 创建版本用户路由
router.post("/create-version-user", userController.createVersionUser);

module.exports = router;
