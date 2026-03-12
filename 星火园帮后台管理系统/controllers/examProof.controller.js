const db = require("../models");
const ExamProof = db.ExamProof;
const { Op } = require("sequelize");
const WalletService = require("../services/walletService");

// 提交考试资料凭证
exports.submitProof = async (req, res, next) => {
  try {
    const { proofImage, remark } = req.body;
    const userId = req.userId;

    if (!proofImage) {
      return res.status(400).json({
        success: false,
        message: "请上传凭证图片",
      });
    }

    // 创建凭证记录
    const proofData = {
      userId,
      proofImage,
      remark: remark || "",
      status: "pending", // 待审核
      submittedAt: new Date(),
    };

    const proof = await ExamProof.create(proofData);

    res.json({
      success: true,
      message: "凭证提交成功，等待审核",
      data: {
        id: proof.id,
        status: proof.status,
        submittedAt: proof.submittedAt,
      },
    });
  } catch (error) {
    console.error("提交考试资料凭证失败:", error);
    res.status(500).json({
      success: false,
      message: "提交失败，请重试",
    });
  }
};

// 获取用户的凭证记录
exports.getUserProofs = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await ExamProof.findAndCountAll({
      where: { userId },
      order: [["submittedAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        proofs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取用户凭证记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取记录失败",
    });
  }
};

// 管理员审核凭证
exports.reviewProof = async (req, res, next) => {
  try {
    const { proofId } = req.params;
    const { status, rewardAmount, adminRemark } = req.body;
    const adminId = req.userId;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "无效的审核状态",
      });
    }

    const proof = await ExamProof.findByPk(proofId);
    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "凭证记录不存在",
      });
    }

    if (proof.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "该凭证已经审核过了",
      });
    }

    // 更新凭证状态
    const updateData = {
      status,
      reviewedAt: new Date(),
      reviewedBy: adminId,
      adminRemark: adminRemark || "",
    };

    if (status === "approved" && rewardAmount) {
      updateData.rewardAmount = parseFloat(rewardAmount);
    }

    await proof.update(updateData);

    // 如果审核通过且有奖励，发放奖励到用户余额
    if (status === "approved" && updateData.rewardAmount) {
      try {
        await WalletService.processExamReward(
          proof.userId,
          updateData.rewardAmount,
          proofId,
          adminId
        );
        console.log(
          `用户 ${proof.userId} 获得考试资料奖励 ${updateData.rewardAmount} 元`
        );
      } catch (rewardError) {
        console.error("奖励发放失败:", rewardError);
        // 奖励发放失败，但不影响审核结果
      }
    }

    res.json({
      success: true,
      message: `凭证${status === "approved" ? "审核通过" : "审核拒绝"}`,
      data: {
        id: proof.id,
        status: proof.status,
        reviewedAt: proof.reviewedAt,
      },
    });
  } catch (error) {
    console.error("审核凭证失败:", error);
    res.status(500).json({
      success: false,
      message: "审核失败，请重试",
    });
  }
};

// 获取所有凭证记录（管理员）
exports.getAllProofs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const { count, rows } = await ExamProof.findAndCountAll({
      where,
      order: [["submittedAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        proofs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取凭证记录失败:", error);
    res.status(500).json({
      success: false,
      message: "获取记录失败",
    });
  }
};

// 获取考试资料凭证统计信息
exports.getProofStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate && endDate) {
      where.submittedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // 获取各状态统计
    const [total, pending, approved, rejected] = await Promise.all([
      ExamProof.count({ where }),
      ExamProof.count({ where: { ...where, status: "pending" } }),
      ExamProof.count({ where: { ...where, status: "approved" } }),
      ExamProof.count({ where: { ...where, status: "rejected" } }),
    ]);

    // 获取总奖励金额
    const totalReward = await ExamProof.sum("rewardAmount", {
      where: { ...where, status: "approved" },
    });

    // 获取最近提交的凭证
    const recentProofs = await ExamProof.findAll({
      where,
      order: [["submittedAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          approved,
          rejected,
          totalReward: totalReward || 0,
        },
        recentProofs,
      },
    });
  } catch (error) {
    console.error("获取考试资料凭证统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取统计信息失败",
    });
  }
};
