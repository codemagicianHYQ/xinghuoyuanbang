const { Feedback, User } = require("../models");

// 提交反馈
exports.submitFeedback = async (req, res, next) => {
  try {
    const { content, contact, imageUrls, deviceInfo } = req.body;
    const userId = req.userId || null; // 允许匿名反馈

    // 验证必填字段
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "反馈内容不能为空" });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({ message: "反馈内容至少10个字" });
    }

    // 创建反馈记录
    const feedback = await Feedback.create({
      userId,
      content: content.trim(),
      contact: contact ? contact.trim() : null,
      imageUrls: imageUrls && imageUrls.length > 0 ? imageUrls : null,
      deviceInfo,
      status: "pending",
    });

    res.status(201).json({
      message: "反馈提交成功",
      feedback: {
        id: feedback.id,
        content: feedback.content,
        status: feedback.status,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户反馈列表（需要登录）
exports.getUserFeedbacks = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Feedback.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        "id",
        "content",
        "contact",
        "imageUrls",
        "status",
        "adminReply",
        "createdAt",
        "processedAt",
      ],
    });

    res.json({
      message: "获取反馈列表成功",
      data: {
        feedbacks: rows,
        pagination: {
          current: parseInt(page),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 管理员获取所有反馈列表
exports.getAllFeedbacks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Feedback.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl"],
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "nickname"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      message: "获取反馈列表成功",
      data: {
        feedbacks: rows,
        pagination: {
          current: parseInt(page),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 管理员获取反馈详情
exports.getFeedbackDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl", "phoneNumber"],
        },
        {
          model: User,
          as: "admin",
          attributes: ["id", "nickname"],
        },
      ],
    });

    if (!feedback) {
      return res.status(404).json({ message: "反馈不存在" });
    }

    res.json({
      message: "获取反馈详情成功",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// 管理员处理反馈
exports.processFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;
    const adminId = req.userId;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: "反馈不存在" });
    }

    // 更新反馈状态
    const updateData = {
      status,
      adminId,
      processedAt: new Date(),
    };

    if (adminReply) {
      updateData.adminReply = adminReply.trim();
    }

    await feedback.update(updateData);

    res.json({
      message: "反馈处理成功",
      data: {
        id: feedback.id,
        status: feedback.status,
        adminReply: feedback.adminReply,
        processedAt: feedback.processedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 管理员删除反馈
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: "反馈不存在" });
    }

    await feedback.destroy();

    res.json({ message: "反馈删除成功" });
  } catch (error) {
    next(error);
  }
};
