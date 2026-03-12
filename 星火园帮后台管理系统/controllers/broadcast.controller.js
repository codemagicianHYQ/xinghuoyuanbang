const EnhancedSystemMessageService = require("../services/enhancedSystemMessageService");
const { SystemBroadcast, UserBroadcastRead, User } = require("../models");

// 创建广播消息
exports.createBroadcast = async (req, res, next) => {
  try {
    const {
      type,
      title,
      content,
      summary,
      targetScope = "all",
      targetUserIds,
      priority = "normal",
      expiresAt,
      extraData,
      sendImmediately = true,
    } = req.body;

    // 验证必填字段
    if (!type || !title || !content) {
      return res.status(400).send({
        message: "类型、标题和内容为必填字段",
      });
    }

    // 验证目标范围
    if (
      targetScope === "specific_users" &&
      (!targetUserIds || !Array.isArray(targetUserIds))
    ) {
      return res.status(400).send({
        message: "指定用户范围时，必须提供用户ID列表",
      });
    }

    const broadcast = await EnhancedSystemMessageService.createBroadcast({
      type,
      title,
      content,
      summary,
      targetScope,
      targetUserIds,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      extraData,
      sendImmediately,
    });

    res.status(201).send({
      message: "广播消息创建成功",
      data: broadcast,
    });
  } catch (error) {
    console.error("创建广播消息失败:", error);
    next(error);
  }
};

// 获取广播消息列表
exports.getBroadcasts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, targetScope, isActive } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (type) where.type = type;
    if (targetScope) where.targetScope = targetScope;
    if (isActive !== undefined) where.isActive = isActive === "true";

    const { count, rows: broadcasts } = await SystemBroadcast.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: UserBroadcastRead,
          as: "userReads",
          attributes: ["userId", "isRead", "readAt"],
        },
      ],
    });

    // 计算每个广播的统计信息
    const broadcastsWithStats = broadcasts.map((broadcast) => {
      const readRecords = broadcast.userReads || [];
      const totalUsers = readRecords.length;
      const readUsers = readRecords.filter((record) => record.isRead).length;
      const unreadUsers = totalUsers - readUsers;

      return {
        id: broadcast.id,
        type: broadcast.type,
        title: broadcast.title,
        content: broadcast.content,
        summary: broadcast.summary,
        targetScope: broadcast.targetScope,
        targetUserIds: broadcast.targetUserIds,
        priority: broadcast.priority,
        isActive: broadcast.isActive,
        expiresAt: broadcast.expiresAt,
        extraData: broadcast.extraData,
        createdAt: broadcast.createdAt,
        updatedAt: broadcast.updatedAt,
        stats: {
          totalUsers,
          readUsers,
          unreadUsers,
          readRate:
            totalUsers > 0 ? ((readUsers / totalUsers) * 100).toFixed(2) : 0,
        },
      };
    });

    res.status(200).send({
      broadcasts: broadcastsWithStats,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("获取广播消息列表失败:", error);
    next(error);
  }
};

// 获取单个广播消息详情
exports.getBroadcastById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const broadcast = await SystemBroadcast.findByPk(id, {
      include: [
        {
          model: UserBroadcastRead,
          as: "userReads",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "nickname", "avatarUrl"],
            },
          ],
        },
      ],
    });

    if (!broadcast) {
      return res.status(404).send({
        message: "广播消息不存在",
      });
    }

    res.status(200).send({
      data: broadcast,
    });
  } catch (error) {
    console.error("获取广播消息详情失败:", error);
    next(error);
  }
};

// 更新广播消息
exports.updateBroadcast = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const broadcast = await SystemBroadcast.findByPk(id);
    if (!broadcast) {
      return res.status(404).send({
        message: "广播消息不存在",
      });
    }

    // 更新字段
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        broadcast[key] = updateData[key];
      }
    });

    await broadcast.save();

    res.status(200).send({
      message: "广播消息更新成功",
      data: broadcast,
    });
  } catch (error) {
    console.error("更新广播消息失败:", error);
    next(error);
  }
};

// 删除广播消息
exports.deleteBroadcast = async (req, res, next) => {
  try {
    const { id } = req.params;

    const broadcast = await SystemBroadcast.findByPk(id);
    if (!broadcast) {
      return res.status(404).send({
        message: "广播消息不存在",
      });
    }

    // 软删除：设置为非激活状态
    broadcast.isActive = false;
    await broadcast.save();

    res.status(200).send({
      message: "广播消息已删除",
    });
  } catch (error) {
    console.error("删除广播消息失败:", error);
    next(error);
  }
};

// 重新分发广播消息
exports.redistributeBroadcast = async (req, res, next) => {
  try {
    const { id } = req.params;

    const broadcast = await SystemBroadcast.findByPk(id);
    if (!broadcast) {
      return res.status(404).send({
        message: "广播消息不存在",
      });
    }

    // 删除现有的阅读记录
    await UserBroadcastRead.destroy({
      where: { broadcastId: id },
    });

    // 重新分发
    const distributedCount =
      await EnhancedSystemMessageService.distributeBroadcast(id);

    res.status(200).send({
      message: "广播消息重新分发成功",
      distributedCount,
    });
  } catch (error) {
    console.error("重新分发广播消息失败:", error);
    next(error);
  }
};

// 获取广播消息统计
exports.getBroadcastStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const broadcast = await SystemBroadcast.findByPk(id);
    if (!broadcast) {
      return res.status(404).send({
        message: "广播消息不存在",
      });
    }

    // 获取阅读统计
    const readStats = await UserBroadcastRead.findAll({
      where: { broadcastId: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "version"],
        },
      ],
    });

    const totalUsers = readStats.length;
    const readUsers = readStats.filter((record) => record.isRead).length;
    const unreadUsers = totalUsers - readUsers;

    // 按版本统计
    const versionStats = {};
    readStats.forEach((record) => {
      const version = record.user?.version || "unknown";
      if (!versionStats[version]) {
        versionStats[version] = { total: 0, read: 0, unread: 0 };
      }
      versionStats[version].total++;
      if (record.isRead) {
        versionStats[version].read++;
      } else {
        versionStats[version].unread++;
      }
    });

    res.status(200).send({
      data: {
        broadcastId: id,
        broadcastTitle: broadcast.title,
        totalUsers,
        readUsers,
        unreadUsers,
        readRate:
          totalUsers > 0 ? ((readUsers / totalUsers) * 100).toFixed(2) : 0,
        versionStats,
        readRecords: readStats.map((record) => ({
          userId: record.userId,
          userNickname: record.user?.nickname,
          userVersion: record.user?.version,
          isRead: record.isRead,
          readAt: record.readAt,
        })),
      },
    });
  } catch (error) {
    console.error("获取广播消息统计失败:", error);
    next(error);
  }
};

// 清理过期的广播消息
exports.cleanupExpiredBroadcasts = async (req, res, next) => {
  try {
    const cleanedCount =
      await EnhancedSystemMessageService.cleanupExpiredBroadcasts();

    res.status(200).send({
      message: "过期广播消息清理完成",
      cleanedCount,
    });
  } catch (error) {
    console.error("清理过期广播消息失败:", error);
    next(error);
  }
};

// 快速发送版本更新通知
exports.sendVersionUpdate = async (req, res, next) => {
  try {
    const { version, updateContent, targetScope = "all" } = req.body;

    if (!version || !updateContent) {
      return res.status(400).send({
        message: "版本号和更新内容为必填字段",
      });
    }

    const broadcast =
      await EnhancedSystemMessageService.sendVersionUpdateNotification(
        version,
        updateContent,
        targetScope
      );

    res.status(201).send({
      message: "版本更新通知发送成功",
      data: broadcast,
    });
  } catch (error) {
    console.error("发送版本更新通知失败:", error);
    next(error);
  }
};

// 快速发送管理员公告
exports.sendAdminAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      content,
      targetScope = "all",
      priority = "normal",
    } = req.body;

    if (!title || !content) {
      return res.status(400).send({
        message: "标题和内容为必填字段",
      });
    }

    const broadcast = await EnhancedSystemMessageService.sendAdminAnnouncement(
      title,
      content,
      targetScope,
      priority
    );

    res.status(201).send({
      message: "管理员公告发送成功",
      data: broadcast,
    });
  } catch (error) {
    console.error("发送管理员公告失败:", error);
    next(error);
  }
};

// 快速发送安全提醒
exports.sendSecurityAlert = async (req, res, next) => {
  try {
    const { securityEvent, targetScope = "all" } = req.body;

    if (!securityEvent) {
      return res.status(400).send({
        message: "安全事件描述为必填字段",
      });
    }

    const broadcast = await EnhancedSystemMessageService.sendSecurityAlert(
      securityEvent,
      targetScope
    );

    res.status(201).send({
      message: "安全提醒发送成功",
      data: broadcast,
    });
  } catch (error) {
    console.error("发送安全提醒失败:", error);
    next(error);
  }
};
