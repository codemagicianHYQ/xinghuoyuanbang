const {
  SystemMessage,
  SystemBroadcast,
  UserBroadcastRead,
  User,
} = require("../models");

class EnhancedSystemMessageService {
  /**
   * 创建广播消息
   * @param {Object} broadcastData - 广播数据
   */
  static async createBroadcast(broadcastData) {
    try {
      const broadcast = await SystemBroadcast.create({
        type: broadcastData.type,
        title: broadcastData.title,
        content: broadcastData.content,
        summary: broadcastData.summary || broadcastData.content,
        targetScope: broadcastData.targetScope || "all",
        targetUserIds: broadcastData.targetUserIds,
        priority: broadcastData.priority || "normal",
        expiresAt: broadcastData.expiresAt,
        extraData: broadcastData.extraData,
      });

      console.log(`✅ [EnhancedSystemMessageService] 广播消息创建成功:`, {
        id: broadcast.id,
        type: broadcast.type,
        title: broadcast.title,
        targetScope: broadcast.targetScope,
      });

      // 如果是立即发送，则分发到目标用户
      if (broadcastData.sendImmediately !== false) {
        await EnhancedSystemMessageService.distributeBroadcast(broadcast.id);
      }

      return broadcast;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 创建广播消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 分发广播消息到目标用户
   * @param {number} broadcastId - 广播消息ID
   */
  static async distributeBroadcast(broadcastId) {
    try {
      const broadcast = await SystemBroadcast.findByPk(broadcastId);
      if (!broadcast || !broadcast.isActive) {
        throw new Error("广播消息不存在或已停用");
      }

      let targetUsers = [];

      // 根据目标范围获取用户列表
      switch (broadcast.targetScope) {
        case "all":
          targetUsers = await User.findAll({
            attributes: ["id"],
          });
          break;
        case "campus":
          targetUsers = await User.findAll({
            attributes: ["id"],
            where: { version: "campus" },
          });
          break;
        case "community":
          targetUsers = await User.findAll({
            attributes: ["id"],
            where: { version: "community" },
          });
          break;
        case "specific_users":
          if (
            broadcast.targetUserIds &&
            Array.isArray(broadcast.targetUserIds)
          ) {
            targetUsers = await User.findAll({
              attributes: ["id"],
              where: {
                id: broadcast.targetUserIds,
              },
            });
          }
          break;
      }

      // 为每个目标用户创建阅读记录
      const readRecords = targetUsers.map((user) => ({
        userId: user.id,
        broadcastId: broadcast.id,
        isRead: false,
      }));

      if (readRecords.length > 0) {
        await UserBroadcastRead.bulkCreate(readRecords);
        console.log(
          `✅ [EnhancedSystemMessageService] 广播消息已分发到 ${readRecords.length} 个用户`
        );
      }

      return readRecords.length;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 分发广播消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 获取用户的系统消息（包括个人消息和广播消息）
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   */
  static async getUserSystemMessages(userId, options = {}) {
    try {
      const { page = 1, limit = 20, version = "campus" } = options;
      const offset = (page - 1) * limit;

      // 获取个人系统消息
      const personalMessages = await SystemMessage.findAndCountAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: offset,
      });

      // 获取广播消息
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("用户不存在");
      }

      let broadcastWhere = {
        isActive: true,
        [require("sequelize").Op.or]: [
          { targetScope: "all" },
          { targetScope: user.version },
        ],
      };

      // 如果有过期时间，检查是否过期
      broadcastWhere[require("sequelize").Op.or].push({
        expiresAt: null,
      });
      broadcastWhere[require("sequelize").Op.or].push({
        expiresAt: { [require("sequelize").Op.gt]: new Date() },
      });

      const broadcastMessages = await SystemBroadcast.findAndCountAll({
        where: broadcastWhere,
        include: [
          {
            model: UserBroadcastRead,
            as: "userReads",
            where: { userId },
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: offset,
      });

      // 格式化消息数据
      const formattedPersonalMessages = personalMessages.rows.map((msg) => ({
        id: `personal_${msg.id}`,
        type: "personal",
        title: msg.title,
        summary: msg.summary || msg.content,
        content: msg.content,
        createTime: msg.createdAt,
        unreadCount: msg.isRead ? 0 : 1,
        relatedId: msg.relatedId,
        relatedType: msg.relatedType,
        extraData: msg.extraData,
      }));

      const formattedBroadcastMessages = broadcastMessages.rows.map(
        (broadcast) => {
          const readRecord = broadcast.userReads && broadcast.userReads[0];
          return {
            id: `broadcast_${broadcast.id}`,
            type: "broadcast",
            title: broadcast.title,
            summary: broadcast.summary || broadcast.content,
            content: broadcast.content,
            createTime: broadcast.createdAt,
            unreadCount: readRecord && readRecord.isRead ? 0 : 1,
            priority: broadcast.priority,
            expiresAt: broadcast.expiresAt,
            extraData: broadcast.extraData,
          };
        }
      );

      // 合并并排序所有消息
      const allMessages = [
        ...formattedPersonalMessages,
        ...formattedBroadcastMessages,
      ]
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .slice(0, limit);

      const totalCount = personalMessages.count + broadcastMessages.count;

      return {
        messages: allMessages,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
      };
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 获取用户系统消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 标记系统消息为已读
   * @param {string} messageId - 消息ID（格式：personal_123 或 broadcast_456）
   * @param {string} userId - 用户ID
   */
  static async markAsRead(messageId, userId) {
    try {
      if (messageId.startsWith("personal_")) {
        const id = parseInt(messageId.replace("personal_", ""));
        const message = await SystemMessage.findOne({
          where: { id, userId },
        });
        if (message) {
          message.isRead = true;
          await message.save();
          return true;
        }
      } else if (messageId.startsWith("broadcast_")) {
        const id = parseInt(messageId.replace("broadcast_", ""));
        const readRecord = await UserBroadcastRead.findOne({
          where: { broadcastId: id, userId },
        });
        if (readRecord) {
          readRecord.isRead = true;
          readRecord.readAt = new Date();
          await readRecord.save();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 标记消息已读失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 获取用户未读系统消息数量
   * @param {string} userId - 用户ID
   */
  static async getUnreadCount(userId) {
    try {
      // 个人消息未读数量
      const personalUnreadCount = await SystemMessage.count({
        where: { userId, isRead: false },
      });

      // 广播消息未读数量
      const user = await User.findByPk(userId);
      if (!user) return 0;

      let broadcastWhere = {
        isActive: true,
        [require("sequelize").Op.or]: [
          { targetScope: "all" },
          { targetScope: user.version },
        ],
      };

      // 检查过期时间
      broadcastWhere[require("sequelize").Op.or].push({
        expiresAt: null,
      });
      broadcastWhere[require("sequelize").Op.or].push({
        expiresAt: { [require("sequelize").Op.gt]: new Date() },
      });

      const broadcastUnreadCount = await SystemBroadcast.count({
        where: broadcastWhere,
        include: [
          {
            model: UserBroadcastRead,
            as: "userReads",
            where: { userId, isRead: false },
            required: false,
          },
        ],
      });

      return personalUnreadCount + broadcastUnreadCount;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 获取未读消息数量失败:",
        error
      );
      return 0;
    }
  }

  /**
   * 清理过期的广播消息
   */
  static async cleanupExpiredBroadcasts() {
    try {
      const expiredBroadcasts = await SystemBroadcast.findAll({
        where: {
          expiresAt: { [require("sequelize").Op.lt]: new Date() },
          isActive: true,
        },
      });

      for (const broadcast of expiredBroadcasts) {
        broadcast.isActive = false;
        await broadcast.save();
      }

      console.log(
        `✅ [EnhancedSystemMessageService] 清理了 ${expiredBroadcasts.length} 条过期广播消息`
      );
      return expiredBroadcasts.length;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 清理过期广播消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 发送版本更新通知
   * @param {string} version - 版本号
   * @param {string} updateContent - 更新内容
   * @param {string} targetScope - 目标范围
   */
  static async sendVersionUpdateNotification(
    version,
    updateContent,
    targetScope = "all"
  ) {
    return await this.createBroadcast({
      type: "version_update",
      title: `版本更新通知 v${version}`,
      content: `星火园帮已更新至版本 ${version}\n\n${updateContent}\n\n更新时间：${new Date().toLocaleString()}\n\n请及时更新以获得最佳体验！`,
      summary: `版本更新通知 v${version}`,
      targetScope,
      priority: "high",
      extraData: {
        version,
        updateContent,
        updateTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送管理员公告
   * @param {string} title - 公告标题
   * @param {string} content - 公告内容
   * @param {string} targetScope - 目标范围
   * @param {string} priority - 优先级
   */
  static async sendAdminAnnouncement(
    title,
    content,
    targetScope = "all",
    priority = "normal"
  ) {
    return await this.createBroadcast({
      type: "admin_announcement",
      title,
      content,
      summary:
        content.length > 100 ? content.substring(0, 100) + "..." : content,
      targetScope,
      priority,
      extraData: {
        announcementTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送安全提醒
   * @param {string} securityEvent - 安全事件
   * @param {string} targetScope - 目标范围
   */
  static async sendSecurityAlert(securityEvent, targetScope = "all") {
    return await this.createBroadcast({
      type: "security_alert",
      title: "安全提醒",
      content: `重要安全提醒：${securityEvent}\n\n时间：${new Date().toLocaleString()}\n\n请及时关注并采取相应措施，确保账户安全。`,
      summary: `安全提醒：${securityEvent}`,
      targetScope,
      priority: "urgent",
      extraData: {
        securityEvent,
        alertTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 创建广播消息（管理员）
   */
  static async createBroadcastMessage(messageData) {
    try {
      const {
        type,
        title,
        content,
        targetScope,
        targetUsers,
        scheduledAt,
        createdBy,
      } = messageData;

      console.log(`[EnhancedSystemMessageService] 创建广播消息:`, {
        type,
        title,
        targetScope,
        scheduledAt,
      });

      const broadcastMessage = await SystemBroadcast.create({
        type,
        title,
        content,
        targetScope,
        targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : "active",
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 如果不是定时消息，立即分发
      if (!scheduledAt) {
        await EnhancedSystemMessageService.distributeBroadcast(
          broadcastMessage.id
        );
      }

      console.log(
        `[EnhancedSystemMessageService] 广播消息创建成功:`,
        broadcastMessage.toJSON()
      );

      return broadcastMessage;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 创建广播消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 创建个人消息（管理员）
   */
  static async createPersonalMessage(messageData) {
    try {
      const { type, title, content, targetUsers, scheduledAt, createdBy } =
        messageData;

      console.log(`[EnhancedSystemMessageService] 创建个人消息:`, {
        type,
        title,
        targetUsers: targetUsers?.length,
        scheduledAt,
      });

      const messages = [];
      for (const userId of targetUsers) {
        const message = await SystemMessage.create({
          type,
          title,
          content,
          userId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: scheduledAt ? "scheduled" : "active",
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        messages.push(message);
      }

      console.log(
        `[EnhancedSystemMessageService] 个人消息创建成功，共 ${messages.length} 条`
      );

      return messages;
    } catch (error) {
      console.error(
        "❌ [EnhancedSystemMessageService] 创建个人消息失败:",
        error
      );
      throw error;
    }
  }

  /**
   * 更新消息（管理员）
   */
  static async updateMessage(messageId, updateData, adminId) {
    try {
      console.log(`[EnhancedSystemMessageService] 更新消息:`, {
        messageId,
        updateData,
      });

      const [messageType, id] = messageId.split("_");

      if (messageType === "broadcast") {
        const message = await SystemBroadcast.findByPk(id);
        if (!message) {
          throw new Error("广播消息不存在");
        }

        await message.update({
          ...updateData,
          updatedAt: new Date(),
        });

        return message;
      } else if (messageType === "personal") {
        const message = await SystemMessage.findByPk(id);
        if (!message) {
          throw new Error("个人消息不存在");
        }

        await message.update({
          ...updateData,
          updatedAt: new Date(),
        });

        return message;
      } else {
        throw new Error("无效的消息ID格式");
      }
    } catch (error) {
      console.error("❌ [EnhancedSystemMessageService] 更新消息失败:", error);
      throw error;
    }
  }

  /**
   * 删除消息（管理员）
   */
  static async deleteMessage(messageId, adminId) {
    try {
      console.log(`[EnhancedSystemMessageService] 删除消息:`, {
        messageId,
      });

      const [messageType, id] = messageId.split("_");

      if (messageType === "broadcast") {
        const message = await SystemBroadcast.findByPk(id);
        if (!message) {
          throw new Error("广播消息不存在");
        }

        await message.destroy();
      } else if (messageType === "personal") {
        const message = await SystemMessage.findByPk(id);
        if (!message) {
          throw new Error("个人消息不存在");
        }

        await message.destroy();
      } else {
        throw new Error("无效的消息ID格式");
      }

      console.log(`[EnhancedSystemMessageService] 消息删除成功: ${messageId}`);
    } catch (error) {
      console.error("❌ [EnhancedSystemMessageService] 删除消息失败:", error);
      throw error;
    }
  }

  /**
   * 立即发送消息（管理员）
   */
  static async sendMessageNow(messageId, adminId) {
    try {
      console.log(`[EnhancedSystemMessageService] 立即发送消息:`, {
        messageId,
      });

      const [messageType, id] = messageId.split("_");

      if (messageType === "broadcast") {
        const message = await SystemBroadcast.findByPk(id);
        if (!message) {
          throw new Error("广播消息不存在");
        }

        // 更新状态为已发送
        await message.update({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        });

        // 分发消息
        await EnhancedSystemMessageService.distributeBroadcast(id);

        return message;
      } else if (messageType === "personal") {
        const message = await SystemMessage.findByPk(id);
        if (!message) {
          throw new Error("个人消息不存在");
        }

        // 更新状态为已发送
        await message.update({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        });

        return message;
      } else {
        throw new Error("无效的消息ID格式");
      }
    } catch (error) {
      console.error("❌ [EnhancedSystemMessageService] 删除消息失败:", error);
      throw error;
    }
  }
}

module.exports = EnhancedSystemMessageService;
