const express = require("express");
const router = express.Router();
const campusController = require("../controllers/campus.controller");
const { verifyToken } = require("../middleware/authJwt");

// 获取社区列表（支持搜索、分页、筛选）
router.get("/", campusController.getCommunities);

// 获取省份列表
router.get("/provinces", campusController.getProvinces);

// 根据省份获取城市列表
router.get("/provinces/:province/cities", campusController.getCitiesByProvince);

// 根据经纬度查找附近社区
router.get("/nearby", campusController.findNearbyCommunities);

// 获取社区详情
router.get("/:id", campusController.getCommunityById);

// 搜索社区（支持关键词搜索）
router.get("/search/:keyword", campusController.searchCommunities);

// 获取社区管理员企业微信二维码
router.get("/:id/admin-qr", campusController.getCommunityAdminQR);

module.exports = router;
