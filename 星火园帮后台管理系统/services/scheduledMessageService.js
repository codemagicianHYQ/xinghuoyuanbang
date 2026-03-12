// services/scheduledMessageService.js
const EnhancedSystemMessageService = require("./enhancedSystemMessageService");
const { Op } = require("sequelize");

class ScheduledMessageService {
  /**
   * 处理定时消息发送
   */
  static async processScheduledMessages() {
    try {
      console.log("[ScheduledMessageService] 开始处理定时消息");

      const now = new Date();

      // 获取到期的定时广播消息
      const SystemBroadcast = require("../models/SystemBroadcast");
      const expiredBroadcasts = await SystemBroadcast.findAll({
        where: {
          scheduledAt: {
            [Op.lte]: now,
          },
          status: "scheduled",
        },
      });

      // 获取到期的定时个人消息
      const SystemMessage = require("../models/SystemMessage");
      const expiredPersonalMessages = await SystemMessage.findAll({
        where: {
          scheduledAt: {
            [Op.lte]: now,
          },
          status: "scheduled",
        },
      });

      console.log(
        `[ScheduledMessageService] 找到 ${expiredBroadcasts.length} 条定时广播消息`
      );
      console.log(
        `[ScheduledMessageService] 找到 ${expiredPersonalMessages.length} 条定时个人消息`
      );

      // 处理定时广播消息
      for (const broadcast of expiredBroadcasts) {
        try {
          console.log(
            `[ScheduledMessageService] 处理定时广播消息: ${broadcast.id}`
          );

          // 更新状态为已发送
          await broadcast.update({
            status: "sent",
            sentAt: new Date(),
            updatedAt: new Date(),
          });

          // 分发消息
          await EnhancedSystemMessageService.distributeBroadcastMessage(
            broadcast.id
          );

          console.log(
            `[ScheduledMessageService] 定时广播消息发送成功: ${broadcast.id}`
          );
        } catch (error) {
          console.error(
            `[ScheduledMessageService] 处理定时广播消息失败: ${broadcast.id}`,
            error
          );

          // 标记为失败状态
          await broadcast.update({
            status: "cancelled",
            updatedAt: new Date(),
          });
        }
      }

      // 处理定时个人消息
      for (const message of expiredPersonalMessages) {
        try {
          console.log(
            `[ScheduledMessageService] 处理定时个人消息: ${message.id}`
          );

          // 更新状态为已发送
          await message.update({
            status: "sent",
            sentAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(
            `[ScheduledMessageService] 定时个人消息发送成功: ${message.id}`
          );
        } catch (error) {
          console.error(
            `[ScheduledMessageService] 处理定时个人消息失败: ${message.id}`,
            error
          );

          // 标记为失败状态
          await message.update({
            status: "cancelled",
            updatedAt: new Date(),
          });
        }
      }

      const totalProcessed =
        expiredBroadcasts.length + expiredPersonalMessages.length;
      console.log(
        `[ScheduledMessageService] 定时消息处理完成，共处理 ${totalProcessed} 条消息`
      );

      return {
        broadcastMessages: expiredBroadcasts.length,
        personalMessages: expiredPersonalMessages.length,
        total: totalProcessed,
      };
    } catch (error) {
      console.error("[ScheduledMessageService] 处理定时消息失败:", error);
      throw error;
    }
  }

  /**
   * 启动定时任务
   */
  static startScheduledTask() {
    console.log("[ScheduledMessageService] 启动定时消息处理任务");

    // 每分钟检查一次定时消息
    setInterval(async () => {
      try {
        await this.processScheduledMessages();
      } catch (error) {
        console.error("[ScheduledMessageService] 定时任务执行失败:", error);
      }
    }, 60000); // 60秒

    // 立即执行一次
    this.processScheduledMessages().catch((error) => {
      console.error("[ScheduledMessageService] 初始定时消息处理失败:", error);
    });
  }

  /**
   * 获取即将到期的定时消息
   */
  static async getUpcomingScheduledMessages(hours = 24) {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const SystemBroadcast = require("../models/SystemBroadcast");
      const SystemMessage = require("../models/SystemMessage");

      // 获取即将到期的广播消息
      const upcomingBroadcasts = await SystemBroadcast.findAll({
        where: {
          scheduledAt: {
            [Op.between]: [now, futureTime],
          },
          status: "scheduled",
        },
        order: [["scheduledAt", "ASC"]],
      });

      // 获取即将到期的个人消息
      const upcomingPersonalMessages = await SystemMessage.findAll({
        where: {
          scheduledAt: {
            [Op.between]: [now, futureTime],
          },
          status: "scheduled",
        },
        order: [["scheduledAt", "ASC"]],
      });

      return {
        broadcastMessages: upcomingBroadcasts,
        personalMessages: upcomingPersonalMessages,
        total: upcomingBroadcasts.length + upcomingPersonalMessages.length,
      };
    } catch (error) {
      console.error("[ScheduledMessageService] 获取即将到期消息失败:", error);
      throw error;
    }
  }

  /**
   * 取消定时消息
   */
  static async cancelScheduledMessage(messageId) {
    try {
      console.log(`[ScheduledMessageService] 取消定时消息: ${messageId}`);

      const [messageType, id] = messageId.split("_");

      if (messageType === "broadcast") {
        const SystemBroadcast = require("../models/SystemBroadcast");
        const message = await SystemBroadcast.findByPk(id);
        if (!message) {
          throw new Error("广播消息不存在");
        }

        await message.update({
          status: "cancelled",
          updatedAt: new Date(),
        });
      } else if (messageType === "personal") {
        const SystemMessage = require("../models/SystemMessage");
        const message = await SystemMessage.findByPk(id);
        if (!message) {
          throw new Error("个人消息不存在");
        }

        await message.update({
          status: "cancelled",
          updatedAt: new Date(),
        });
      } else {
        throw new Error("无效的消息ID格式");
      }

      console.log(`[ScheduledMessageService] 定时消息取消成功: ${messageId}`);
    } catch (error) {
      console.error("[ScheduledMessageService] 取消定时消息失败:", error);
      throw error;
    }
  }
}

module.exports = ScheduledMessageService;
