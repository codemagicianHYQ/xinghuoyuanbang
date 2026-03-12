// controllers/rider.controller.js
const db = require("../models");
const User = db.User;
const AutoRiderApprovalService = require("../services/autoRiderApprovalService");

// 用户提交成为接单员的申请
exports.applyToBeRider = async (req, res, next) => {
  const userId = req.userId; // 从 verifyToken 中间件获取
  const { realName, phoneNumber, studentIdCardImageUrl } = req.body;

  if (!realName || !phoneNumber || !studentIdCardImageUrl) {
    return res
      .status(400)
      .send({ message: "真实姓名、手机号和学生证图片都是必填的。" });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "用户未找到。" });
    }

    // 检查是否已是接单员或正在审核中
    if (user.role === "rider" || user.riderApplicationStatus === "approved") {
      return res
        .status(400)
        .send({ message: "您已经是接单员了，无需重复申请。" });
    }
    if (user.riderApplicationStatus === "pending") {
      return res
        .status(400)
        .send({ message: "您的申请正在审核中，请耐心等待。" });
    }

    // 更新用户信息并提交申请
    user.realName = realName;
    user.phoneNumber = phoneNumber;
    user.studentIdCardImageUrl = studentIdCardImageUrl;
    user.riderApplicationStatus = "pending"; // 设置为审核中
    user.riderRejectionReason = null; // 清除之前的拒绝原因（如果之前被拒过）

    await user.save();

    // 启动自动审核定时任务（如果还没有启动）
    AutoRiderApprovalService.startAutoApproval();

    // 返回处理后的用户信息（不含敏感信息）
    const userProfile = { ...user.get({ plain: true }) };
    delete userProfile.password; // 如果有密码字段
    delete userProfile.sessionKey;
    res.status(200).send({
      message: "接单员申请已提交，请等待审核。",
      user: userProfile, // 返回更新后的用户信息，前端可以更新Vuex
    });
  } catch (error) {
    console.error("申请成为接单员失败:", error);
    next(error); // 交给全局错误处理器
  }
};

// 获取当前用户的接单员申请状态
exports.getRiderApplicationStatus = async (req, res, next) => {
  const userId = req.userId; // 从 verifyToken 中间件获取

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "role",
        "riderApplicationStatus",
        "riderRejectionReason",
        "realName",
        "nickname",
      ], // 只选择需要的字段
    });

    if (!user) {
      return res.status(404).send({ message: "用户未找到。" });
    }

    res.status(200).send({
      code: 0, // 表示成功
      message: "获取申请状态成功。",
      data: {
        status: user.riderApplicationStatus,
        role: user.role,
        rejectionReason: user.riderRejectionReason,
        // 可以附带一些用户信息，方便前端判断是否已填写过部分资料
        realName: user.realName,
      },
    });
  } catch (error) {
    console.error("获取接单员申请状态失败:", error);
    next(error);
  }
};

// 获取接单员申请统计信息（管理员接口）
exports.getRiderApplicationStats = async (req, res, next) => {
  try {
    const stats = await AutoRiderApprovalService.getPendingApplicationsStats();

    res.status(200).send({
      code: 0,
      message: "获取统计信息成功",
      data: stats,
    });
  } catch (error) {
    console.error("获取接单员申请统计失败:", error);
    next(error);
  }
};

// 手动触发自动审核（管理员接口）
exports.triggerAutoApproval = async (req, res, next) => {
  try {
    await AutoRiderApprovalService.triggerAutoApproval();

    res.status(200).send({
      code: 0,
      message: "手动触发自动审核成功",
    });
  } catch (error) {
    console.error("手动触发自动审核失败:", error);
    next(error);
  }
};
