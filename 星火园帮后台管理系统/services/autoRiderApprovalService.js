// services/autoRiderApprovalService.js
const db = require("../models");
const User = db.User;
const { Op } = require("sequelize");
const SystemMessageService = require("./systemMessageService");

/**
 * 接单员自动审核服务
 * 用户申请接单员后2分钟自动通过审核
 */
class AutoRiderApprovalService {
  /**
   * 启动接单员自动审核定时任务
   * 每分钟检查一次待审核的申请
   */
  static startAutoApproval() {
    console.log("🚀 启动接单员自动审核服务...");

    // 每分钟检查一次
    setInterval(async () => {
      try {
        await this.processPendingApplications();
      } catch (error) {
        console.error("❌ 处理接单员自动审核失败:", error);
      }
    }, 60000); // 60秒 = 1分钟

    console.log("✅ 接单员自动审核服务已启动，每分钟检查一次");
  }

  /**
   * 处理待审核的接单员申请
   */
  static async processPendingApplications() {
    try {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // 2分钟前

      console.log(
        `[AutoRiderApproval] 检查接单员申请，当前时间: ${now.toISOString()}`
      );
      console.log(
        `[AutoRiderApproval] 2分钟前时间: ${twoMinutesAgo.toISOString()}`
      );

      // 查找2分钟前提交的待审核申请
      const pendingApplications = await User.findAll({
        where: {
          riderApplicationStatus: "pending",
          updatedAt: {
            [Op.lte]: twoMinutesAgo, // 2分钟前或更早提交的申请
          },
        },
        attributes: [
          "id",
          "nickname",
          "realName",
          "phoneNumber",
          "studentIdCardImageUrl",
          "riderApplicationStatus",
          "updatedAt",
        ],
      });

      console.log(
        `[AutoRiderApproval] 找到 ${pendingApplications.length} 个待自动审核的申请`
      );

      // 调试：显示所有待审核申请的时间信息
      if (pendingApplications.length > 0) {
        console.log(`[AutoRiderApproval] 待审核申请详情:`);
        pendingApplications.forEach((app, index) => {
          const timeDiff = (now - new Date(app.updatedAt)) / (1000 * 60);
          console.log(
            `  ${index + 1}. 用户ID: ${
              app.id
            }, 更新时间: ${app.updatedAt.toISOString()}, 时间差: ${timeDiff.toFixed(
              2
            )}分钟`
          );
        });
      }

      let approvedCount = 0;
      let failedCount = 0;

      for (const application of pendingApplications) {
        try {
          console.log(
            `[AutoRiderApproval] 开始自动审核用户 ${application.id} (${application.nickname})`
          );

          // 自动通过审核
          await this.approveRiderApplication(application);

          approvedCount++;
          console.log(
            `[AutoRiderApproval] ✅ 用户 ${application.id} 自动审核通过`
          );
        } catch (error) {
          failedCount++;
          console.error(
            `[AutoRiderApproval] ❌ 用户 ${application.id} 自动审核失败:`,
            error
          );
        }
      }

      if (approvedCount > 0 || failedCount > 0) {
        console.log(
          `[AutoRiderApproval] 自动审核完成: 通过 ${approvedCount} 个, 失败 ${failedCount} 个`
        );
      }
    } catch (error) {
      console.error("[AutoRiderApproval] 处理待审核申请失败:", error);
      throw error;
    }
  }

  /**
   * 自动通过接单员申请
   */
  static async approveRiderApplication(application) {
    const transaction = await db.sequelize.transaction();

    try {
      // 更新用户状态为已通过
      await application.update(
        {
          riderApplicationStatus: "approved",
          role: "rider", // 设置为接单员角色
        },
        { transaction }
      );

      // 发送系统消息通知用户
      await SystemMessageService.createSystemMessage({
        userId: application.id,
        title: "接单员申请审核通过",
        content: `恭喜！您的接单员申请已通过审核，现在可以开始接单了。感谢您的参与！`,
        type: "rider_application_approved",
      });

      await transaction.commit();

      console.log(
        `[AutoRiderApproval] 用户 ${application.id} 接单员申请已自动通过`
      );
    } catch (error) {
      await transaction.rollback();
      console.error(`[AutoRiderApproval] 自动通过申请失败:`, error);
      throw error;
    }
  }

  /**
   * 手动触发自动审核（用于测试）
   */
  static async triggerAutoApproval() {
    console.log("🔧 手动触发接单员自动审核...");
    await this.processPendingApplications();
  }

  /**
   * 获取待审核申请统计
   */
  static async getPendingApplicationsStats() {
    try {
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

      // 分别查询总待审核数量和准备审核数量
      const totalPending = await User.count({
        where: {
          riderApplicationStatus: "pending",
        },
      });

      const readyForAutoApproval = await User.count({
        where: {
          riderApplicationStatus: "pending",
          updatedAt: {
            [Op.lte]: twoMinutesAgo,
          },
        },
      });

      // 调试：查询所有待审核申请的时间信息
      const allPending = await User.findAll({
        where: {
          riderApplicationStatus: "pending",
        },
        attributes: ["id", "updatedAt"],
        order: [["updatedAt", "ASC"]],
      });

      console.log(`[AutoRiderApproval] 调试统计信息:`);
      console.log(`   当前时间: ${now.toISOString()}`);
      console.log(`   2分钟前: ${twoMinutesAgo.toISOString()}`);
      console.log(`   总待审核: ${totalPending}`);
      console.log(`   准备审核: ${readyForAutoApproval}`);

      if (allPending.length > 0) {
        console.log(`   所有待审核申请:`);
        allPending.forEach((app, index) => {
          const timeDiff = (now - new Date(app.updatedAt)) / (1000 * 60);
          const isReady = new Date(app.updatedAt) <= twoMinutesAgo;
          console.log(
            `     ${index + 1}. ID: ${
              app.id
            }, 时间: ${app.updatedAt.toISOString()}, 时间差: ${timeDiff.toFixed(
              2
            )}分钟, 准备审核: ${isReady}`
          );
        });
      }

      return {
        totalPending,
        readyForAutoApproval,
        nextCheckTime: new Date(now.getTime() + 60000), // 下次检查时间
      };
    } catch (error) {
      console.error("[AutoRiderApproval] 获取统计信息失败:", error);
      throw error;
    }
  }
}

module.exports = AutoRiderApprovalService;
