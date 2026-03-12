const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow.controller");
const { verifyToken } = require("../middleware/authJwt");

// 关注用户
router.post("/:userId", [verifyToken], followController.followUser);

// 取消关注用户
router.post("/unfollow/:userId", [verifyToken], followController.unfollowUser);

// 获取关注列表
router.get("/", [verifyToken], followController.getFollowingList);

// 获取粉丝列表
router.get("/followers", [verifyToken], followController.getFollowersList);

// 检查是否已关注
router.get("/check/:userId", [verifyToken], followController.checkFollowStatus);

module.exports = router;
