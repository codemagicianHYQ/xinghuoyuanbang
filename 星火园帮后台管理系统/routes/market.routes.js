// routes/market.routes.js
const express = require("express");
const router = express.Router();
const marketController = require("../controllers/market.controller");
const { verifyToken } = require("../middleware/authJwt");

// 获取商品列表（公开接口）
router.get("/products", marketController.getProducts);

// 获取商品详情（公开接口）
router.get("/products/:id", marketController.getProductById);

// 获取用户详情（公开接口）
router.get("/users/:id", marketController.getUserById);

// 需要登录的接口
router.use(verifyToken);

// 发布商品
router.post("/products", marketController.createProduct);

// 更新商品
router.put("/products/:id", marketController.updateProduct);

// 删除商品
router.delete("/products/:id", marketController.deleteProduct);

// 获取我的商品
router.get("/my-products", marketController.getMyProducts);

// 购买商品
router.post("/products/:id/purchase", marketController.purchaseProduct);

// 获取已购商品
router.get("/purchased", marketController.getPurchasedProducts);

// 获取已售商品
router.get("/sold", marketController.getSoldProducts);

// 获取关注列表
router.get("/following", marketController.getFollowingList);

// 确认收到商品
router.post("/products/:id/confirm", marketController.confirmReceived);

// 取消订单
router.post("/products/:id/cancel", marketController.cancelOrder);

module.exports = router;
