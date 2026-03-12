const express = require("express");
const router = express.Router();
const afterSalesController = require("../controllers/afterSales.controller");
const { verifyToken } = require("../middleware/authJwt");

// 用户售后申请相关路由
router.post("/submit", verifyToken, afterSalesController.submitAfterSales);
router.get("/user", verifyToken, afterSalesController.getUserAfterSales);
router.get("/:id", verifyToken, afterSalesController.getAfterSalesDetail);
router.put("/:id/cancel", verifyToken, afterSalesController.cancelAfterSales);

// 管理员售后管理路由
router.get("/admin/all", verifyToken, afterSalesController.getAllAfterSales);
router.put(
  "/admin/:id/handle",
  verifyToken,
  afterSalesController.handleAfterSales
);

module.exports = router;
