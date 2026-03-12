const router = require("express").Router();
const db = require("../models");

// 获取当前用户所有地址（假设已通过中间件获取 userId）
router.get("/", async (req, res) => {
  // 这里简单用 req.query.userId，实际应用中建议用登录态
  const userId = req.query.userId || (req.user && req.user.id);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });
  const addresses = await db.UserAddress.findAll({ where: { userId } });
  res.json(addresses);
});

// 新增地址
router.post("/", async (req, res) => {
  const userId = req.body.userId || (req.user && req.user.id);
  const { detail, name, phone, isDefault } = req.body;
  if (!userId || !detail || !name || !phone) {
    return res.status(400).json({ message: "参数不完整" });
  }
  // 如果设为默认，先取消其他默认
  if (isDefault) {
    await db.UserAddress.update({ isDefault: false }, { where: { userId } });
  }
  const address = await db.UserAddress.create({
    userId,
    detail,
    name,
    phone,
    isDefault,
  });
  res.json(address);
});

// 编辑地址
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId || (req.user && req.user.id);
  const { detail, name, phone, isDefault } = req.body;
  if (!userId || !detail || !name || !phone) {
    return res.status(400).json({ message: "参数不完整" });
  }
  const address = await db.UserAddress.findOne({ where: { id, userId } });
  if (!address) return res.status(404).json({ message: "地址不存在" });
  if (isDefault) {
    await db.UserAddress.update({ isDefault: false }, { where: { userId } });
  }
  await address.update({ detail, name, phone, isDefault });
  res.json(address);
});

// 删除地址
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || (req.user && req.user.id);
  if (!userId) return res.status(400).json({ message: "缺少 userId" });
  const address = await db.UserAddress.findOne({ where: { id, userId } });
  if (!address) return res.status(404).json({ message: "地址不存在" });
  await address.destroy();
  res.json({ message: "删除成功" });
});

module.exports = router;
