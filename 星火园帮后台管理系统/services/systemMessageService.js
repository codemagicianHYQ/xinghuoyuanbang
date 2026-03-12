const { SystemMessage } = require("../models");
const { Op } = require("sequelize");

class SystemMessageService {
  /**
   * 创建系统消息
   * @param {Object} messageData - 消息数据
   * @param {number} messageData.userId - 用户ID
   * @param {string} messageData.type - 消息类型
   * @param {string} messageData.title - 消息标题
   * @param {string} messageData.content - 消息内容
   * @param {string} messageData.summary - 消息摘要（可选）
   * @param {number} messageData.relatedId - 相关ID（可选）
   * @param {string} messageData.relatedType - 相关类型（可选）
   * @param {Object} messageData.extraData - 额外数据（可选）
   */
  static async createSystemMessage(messageData) {
    try {
      console.log(`[SystemMessageService] 开始创建系统消息:`, {
        userId: messageData.userId,
        type: messageData.type,
        title: messageData.title,
      });

      const message = await SystemMessage.create({
        userId: messageData.userId,
        type: messageData.type,
        title: messageData.title,
        content: messageData.content,
        summary: messageData.summary || messageData.content,
        relatedId: messageData.relatedId,
        relatedType: messageData.relatedType,
        extraData: messageData.extraData,
        isRead: false,
      });

      console.log(`✅ [SystemMessageService] 系统消息创建成功:`, {
        id: message.id,
        userId: message.userId,
        type: message.type,
        title: message.title,
      });

      return message;
    } catch (error) {
      console.error("❌ [SystemMessageService] 创建系统消息失败:", error);
      console.error("❌ [SystemMessageService] 错误详情:", error.message);
      console.error("❌ [SystemMessageService] 错误堆栈:", error.stack);
      throw error;
    }
  }

  /**
   * 发送接单员申请通过消息
   * @param {number} userId - 用户ID
   * @param {Object} applicationData - 申请数据
   */
  static async sendRiderApplicationApproved(userId, applicationData = {}) {
    return await this.createSystemMessage({
      userId,
      type: "rider_application_approved",
      title: "接单员申请通过",
      content: `恭喜！您的接单员申请已通过审核，现在可以开始接单了！\n\n审核通过时间：${new Date().toLocaleString()}\n\n请遵守平台规则，诚信接单，为同学们提供优质服务。`,
      summary: "您的接单员申请已通过审核，现在可以接单了！",
      relatedId: null, // 接单员申请没有具体的关联ID，设为null
      relatedType: "application",
      extraData: {
        applicationId: applicationData.applicationId || userId,
        approvedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送接单员申请被拒绝消息
   * @param {number} userId - 用户ID
   * @param {string} reason - 拒绝原因
   * @param {Object} applicationData - 申请数据
   */
  static async sendRiderApplicationRejected(
    userId,
    reason,
    applicationData = {}
  ) {
    return await this.createSystemMessage({
      userId,
      type: "rider_application_rejected",
      title: "接单员申请未通过",
      content: `很抱歉，您的接单员申请未通过审核。\n\n拒绝原因：${reason}\n\n审核时间：${new Date().toLocaleString()}\n\n您可以重新完善资料后再次申请。如有疑问，请联系客服。`,
      summary: `您的接单员申请未通过审核：${reason}`,
      relatedId: null, // 接单员申请没有具体的关联ID，设为null
      relatedType: "application",
      extraData: {
        applicationId: applicationData.applicationId || userId,
        reason,
        rejectedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送订单驳回消息
   * @param {number} userId - 用户ID
   * @param {Object} taskData - 任务数据
   * @param {string} reason - 驳回原因
   */
  static async sendOrderRejected(
    userId,
    taskData,
    reason = "接单员无法及时处理"
  ) {
    return await this.createSystemMessage({
      userId,
      type: "order_rejected",
      title: "订单被驳回",
      content: `您的订单"${
        taskData.title
      }"已被驳回至订单大厅。\n\n驳回原因：${reason}\n\n驳回时间：${new Date().toLocaleString()}\n\n订单已重新开放，其他接单员可以接取。`,
      summary: `您的订单"${taskData.title}"已被驳回：${reason}`,
      relatedId: taskData.id,
      relatedType: "task",
      extraData: {
        taskId: taskData.id,
        taskTitle: taskData.title,
        reason,
        rejectedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送订单完成消息
   * @param {number} userId - 用户ID
   * @param {Object} taskData - 任务数据
   */
  static async sendOrderCompleted(userId, taskData) {
    return await this.createSystemMessage({
      userId,
      type: "order_completed",
      title: "订单已完成",
      content: `您的订单"${
        taskData.title
      }"已完成！\n\n完成时间：${new Date().toLocaleString()}\n\n感谢您使用星火园帮服务，期待下次为您服务！`,
      summary: `您的订单"${taskData.title}"已完成`,
      relatedId: taskData.id,
      relatedType: "task",
      extraData: {
        taskId: taskData.id,
        taskTitle: taskData.title,
        completedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送订单取消消息
   * @param {number} userId - 用户ID
   * @param {Object} taskData - 任务数据
   * @param {string} reason - 取消原因
   */
  static async sendOrderCancelled(userId, taskData, reason = "订单被取消") {
    return await this.createSystemMessage({
      userId,
      type: "order_cancelled",
      title: "订单已取消",
      content: `您的订单"${
        taskData.title
      }"已被取消。\n\n取消原因：${reason}\n\n取消时间：${new Date().toLocaleString()}\n\n如有疑问，请联系客服。`,
      summary: `您的订单"${taskData.title}"已被取消：${reason}`,
      relatedId: taskData.id,
      relatedType: "task",
      extraData: {
        taskId: taskData.id,
        taskTitle: taskData.title,
        reason,
        cancelledAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 发送账户安全消息
   * @param {number} userId - 用户ID
   * @param {string} securityEvent - 安全事件描述
   * @param {Object} extraData - 额外数据
   */
  static async sendAccountSecurity(userId, securityEvent, extraData = {}) {
    return await this.createSystemMessage({
      userId,
      type: "account_security",
      title: "账户安全提醒",
      content: `检测到您的账户有安全相关活动：${securityEvent}\n\n时间：${new Date().toLocaleString()}\n\n如非本人操作，请及时修改密码并联系客服。`,
      summary: `账户安全提醒：${securityEvent}`,
      extraData: {
        securityEvent,
        detectedAt: new Date().toISOString(),
        ...extraData,
      },
    });
  }

  /**
   * 发送活动通知消息
   * @param {number} userId - 用户ID
   * @param {string} activityTitle - 活动标题
   * @param {string} activityContent - 活动内容
   * @param {Object} extraData - 额外数据
   */
  static async sendActivityNotification(
    userId,
    activityTitle,
    activityContent,
    extraData = {}
  ) {
    return await this.createSystemMessage({
      userId,
      type: "activity_notification",
      title: "活动通知",
      content: `${activityTitle}\n\n${activityContent}\n\n活动时间：${new Date().toLocaleString()}\n\n快来参与吧！`,
      summary: `活动通知：${activityTitle}`,
      extraData: {
        activityTitle,
        activityContent,
        publishedAt: new Date().toISOString(),
        ...extraData,
      },
    });
  }

  /**
   * 发送系统维护消息
   * @param {number} userId - 用户ID
   * @param {string} maintenanceInfo - 维护信息
   * @param {Object} extraData - 额外数据
   */
  static async sendSystemMaintenance(userId, maintenanceInfo, extraData = {}) {
    return await this.createSystemMessage({
      userId,
      type: "system_maintenance",
      title: "系统维护通知",
      content: `系统维护通知：${maintenanceInfo}\n\n维护时间：${new Date().toLocaleString()}\n\n维护期间部分功能可能暂时无法使用，请耐心等待。`,
      summary: `系统维护通知：${maintenanceInfo}`,
      extraData: {
        maintenanceInfo,
        maintenanceAt: new Date().toISOString(),
        ...extraData,
      },
    });
  }

  /**
   * 标记系统消息为已读
   * @param {number} messageId - 消息ID
   * @param {number} userId - 用户ID
   */
  static async markAsRead(messageId, userId) {
    try {
      const message = await SystemMessage.findOne({
        where: {
          id: messageId,
          userId: userId,
        },
      });

      if (message) {
        message.isRead = true;
        await message.save();
        console.log(
          `✅ [SystemMessageService] 系统消息已标记为已读:`,
          messageId
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ [SystemMessageService] 标记系统消息已读失败:", error);
      throw error;
    }
  }

  /**
   * 获取用户未读系统消息数量
   * @param {number} userId - 用户ID
   */
  static async getUnreadCount(userId) {
    try {
      const count = await SystemMessage.count({
        where: {
          userId: userId,
          isRead: false,
        },
      });
      return count;
    } catch (error) {
      console.error(
        "❌ [SystemMessageService] 获取未读系统消息数量失败:",
        error
      );
      return 0;
    }
  }

  /**
   * 清理超过一个月的系统消息
   */
  static async cleanupOldMessages() {
    try {
      console.log("[SystemMessageService] 开始清理超过一个月的系统消息");

      // 计算一个月前的日期
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // 删除超过一个月的消息
      const deletedCount = await SystemMessage.destroy({
        where: {
          createdAt: {
            [Op.lt]: oneMonthAgo,
          },
        },
      });

      console.log(
        `✅ [SystemMessageService] 成功清理${deletedCount}条超过一个月的系统消息`
      );

      return {
        success: true,
        deletedCount,
        cutoffDate: oneMonthAgo.toISOString(),
      };
    } catch (error) {
      console.error("❌ [SystemMessageService] 清理系统消息失败:", error);
      throw error;
    }
  }
}

module.exports = SystemMessageService;
