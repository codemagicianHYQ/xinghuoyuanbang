// controllers/adminSystemMessage.controller.js
const EnhancedSystemMessageService = require("../services/enhancedSystemMessageService");
const { Op } = require("sequelize");

// 获取所有系统消息（管理员）
exports.getAllSystemMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    console.log(`[getAllSystemMessages] 管理员请求获取系统消息:`, {
      page,
      limit,
      type,
      status,
    });

    // 构建查询条件
    const whereConditions = {};
    if (type) {
      whereConditions.type = type;
    }
    if (status) {
      whereConditions.status = status;
    }

    // 获取个人系统消息
    const SystemMessage = require("../models/SystemMessage");
    const personalMessages = await SystemMessage.findAndCountAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 获取广播消息
    const SystemBroadcast = require("../models/SystemBroadcast");
    const broadcastMessages = await SystemBroadcast.findAndCountAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 合并结果
    const allMessages = [
      ...personalMessages.rows.map((msg) => ({
        ...msg.toJSON(),
        messageType: "personal",
        id: `personal_${msg.id}`,
      })),
      ...broadcastMessages.rows.map((msg) => ({
        ...msg.toJSON(),
        messageType: "broadcast",
        id: `broadcast_${msg.id}`,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = personalMessages.count + broadcastMessages.count;

    res.status(200).json({
      success: true,
      data: {
        messages: allMessages,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("获取系统消息失败:", error);
    next(error);
  }
};

// 创建系统消息（管理员）
exports.createSystemMessage = async (req, res, next) => {
  try {
    const { type, title, content, targetScope, targetUsers, scheduledAt } =
      req.body;
    const adminId = req.userId;

    console.log(`[createSystemMessage] 管理员创建系统消息:`, {
      type,
      title,
      targetScope,
      scheduledAt,
    });

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "消息类型、标题和内容不能为空",
      });
    }

    let result;
    if (targetScope === "all" || targetScope === "specific_roles") {
      // 创建广播消息
      result = await EnhancedSystemMessageService.createBroadcastMessage({
        type,
        title,
        content,
        targetScope,
        targetUsers,
        scheduledAt,
        createdBy: adminId,
      });
    } else {
      // 创建个人消息
      result = await EnhancedSystemMessageService.createPersonalMessage({
        type,
        title,
        content,
        targetUsers,
        scheduledAt,
        createdBy: adminId,
      });
    }

    res.status(201).json({
      success: true,
      message: "系统消息创建成功",
      data: result,
    });
  } catch (error) {
    console.error("创建系统消息失败:", error);
    next(error);
  }
};

// 更新系统消息（管理员）
exports.updateSystemMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const updateData = req.body;
    const adminId = req.userId;

    console.log(`[updateSystemMessage] 管理员更新系统消息:`, {
      messageId,
      updateData,
    });

    const result = await EnhancedSystemMessageService.updateMessage(
      messageId,
      updateData,
      adminId
    );

    res.status(200).json({
      success: true,
      message: "系统消息更新成功",
      data: result,
    });
  } catch (error) {
    console.error("更新系统消息失败:", error);
    next(error);
  }
};

// 删除系统消息（管理员）
exports.deleteSystemMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const adminId = req.userId;

    console.log(`[deleteSystemMessage] 管理员删除系统消息:`, {
      messageId,
    });

    await EnhancedSystemMessageService.deleteMessage(messageId, adminId);

    res.status(200).json({
      success: true,
      message: "系统消息删除成功",
    });
  } catch (error) {
    console.error("删除系统消息失败:", error);
    next(error);
  }
};

// 立即发送系统消息（管理员）
exports.sendSystemMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const adminId = req.userId;

    console.log(`[sendSystemMessage] 管理员立即发送系统消息:`, {
      messageId,
    });

    const result = await EnhancedSystemMessageService.sendMessageNow(
      messageId,
      adminId
    );

    res.status(200).json({
      success: true,
      message: "系统消息发送成功",
      data: result,
    });
  } catch (error) {
    console.error("发送系统消息失败:", error);
    next(error);
  }
};

// 获取系统消息统计（管理员）
exports.getSystemMessageStats = async (req, res, next) => {
  try {
    console.log(`[getSystemMessageStats] 管理员请求系统消息统计`);

    const SystemMessage = require("../models/SystemMessage");
    const SystemBroadcast = require("../models/SystemBroadcast");
    const UserBroadcastRead = require("../models/UserBroadcastRead");

    // 获取个人消息统计
    const personalStats = await SystemMessage.findAll({
      attributes: [
        "type",
        [
          SystemMessage.sequelize.fn(
            "COUNT",
            SystemMessage.sequelize.col("id")
          ),
          "count",
        ],
      ],
      group: ["type"],
      raw: true,
    });

    // 获取广播消息统计
    const broadcastStats = await SystemBroadcast.findAll({
      attributes: [
        "type",
        [
          SystemBroadcast.sequelize.fn(
            "COUNT",
            SystemBroadcast.sequelize.col("id")
          ),
          "count",
        ],
      ],
      group: ["type"],
      raw: true,
    });

    // 获取未读消息统计
    const unreadStats = await UserBroadcastRead.findAll({
      attributes: [
        [
          UserBroadcastRead.sequelize.fn(
            "COUNT",
            UserBroadcastRead.sequelize.col("id")
          ),
          "unreadCount",
        ],
      ],
      where: { isRead: false },
      raw: true,
    });

    // 获取最近7天的消息统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPersonalMessages = await SystemMessage.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const recentBroadcastMessages = await SystemBroadcast.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        personalMessageStats: personalStats,
        broadcastMessageStats: broadcastStats,
        unreadCount: unreadStats[0]?.unreadCount || 0,
        recentMessages: {
          personal: recentPersonalMessages,
          broadcast: recentBroadcastMessages,
          total: recentPersonalMessages + recentBroadcastMessages,
        },
      },
    });
  } catch (error) {
    console.error("获取系统消息统计失败:", error);
    next(error);
  }
};

// 获取定时消息列表（管理员）
exports.getScheduledMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`[getScheduledMessages] 管理员请求定时消息列表`);

    const SystemMessage = require("../models/SystemMessage");
    const SystemBroadcast = require("../models/SystemBroadcast");

    // 获取定时个人消息
    const scheduledPersonalMessages = await SystemMessage.findAndCountAll({
      where: {
        scheduledAt: {
          [Op.ne]: null,
        },
        status: "scheduled",
      },
      order: [["scheduledAt", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 获取定时广播消息
    const scheduledBroadcastMessages = await SystemBroadcast.findAndCountAll({
      where: {
        scheduledAt: {
          [Op.ne]: null,
        },
        status: "scheduled",
      },
      order: [["scheduledAt", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 合并结果
    const allScheduledMessages = [
      ...scheduledPersonalMessages.rows.map((msg) => ({
        ...msg.toJSON(),
        messageType: "personal",
        id: `personal_${msg.id}`,
      })),
      ...scheduledBroadcastMessages.rows.map((msg) => ({
        ...msg.toJSON(),
        messageType: "broadcast",
        id: `broadcast_${msg.id}`,
      })),
    ].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const totalCount =
      scheduledPersonalMessages.count + scheduledBroadcastMessages.count;

    res.status(200).json({
      success: true,
      data: {
        messages: allScheduledMessages,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("获取定时消息失败:", error);
    next(error);
  }
};
