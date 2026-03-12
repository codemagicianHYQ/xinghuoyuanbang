const express = require("express");
const router = express.Router();
const payController = require("../controllers/pay.controller");
const { verifyToken } = require("../middleware/authJwt");

// 微信小程序统一下单
router.post("/unifiedOrder", verifyToken, payController.unifiedOrder);
// 微信支付回调
router.post("/notify", payController.notify);
// 微信退款回调
router.post("/refund-notify", payController.refundNotify);

module.exports = router;
