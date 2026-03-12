// services/cronService.js
const cron = require("node-cron");
const db = require("../models");
const { Withdrawal, User, Task } = db;
const { Op } = require("sequelize");
const SystemMessageService = require("./systemMessageService");

class CronService {
  /**
   * 初始化所有定时任务
   */
  static initCronJobs() {
    console.log("初始化定时任务...");

    // 每天凌晨2点处理提现申请
    this.scheduleWithdrawalProcessing();

    // 每周一凌晨3点处理周度提现
    this.scheduleWeeklyWithdrawalProcessing();

    // 每小时检查一次需要自动确认的订单
    this.scheduleOrderAutoConfirm();

    // 每天凌晨3点清理超过一个月的系统消息
    this.scheduleMessageCleanup();

    console.log("定时任务初始化完成");
  }

  /**
   * 定时处理提现申请（每天凌晨2点）
   */
  static scheduleWithdrawalProcessing() {
    cron.schedule(
      "0 2 * * *",
      async () => {
        console.log("开始处理提现申请...");
        try {
          await this.processPendingWithdrawals();
        } catch (error) {
          console.error("处理提现申请失败:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Shanghai",
      }
    );
  }

  /**
   * 定时处理周度提现（每周一凌晨3点）
   */
  static scheduleWeeklyWithdrawalProcessing() {
    cron.schedule(
      "0 3 * * 1",
      async () => {
        console.log("开始处理周度提现...");
        try {
          await this.processWeeklyWithdrawals();
        } catch (error) {
          console.error("处理周度提现失败:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Shanghai",
      }
    );
  }

  /**
   * 定时处理订单自动确认（每小时执行一次）
   */
  static scheduleOrderAutoConfirm() {
    cron.schedule(
      "0 * * * *", // 每小时执行一次
      async () => {
        console.log("开始检查需要自动确认的订单...");
        try {
          await this.processOrderAutoConfirm();
        } catch (error) {
          console.error("处理订单自动确认失败:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Shanghai",
      }
    );
  }

  /**
   * 处理待处理的提现申请
   */
  static async processPendingWithdrawals() {
    const transaction = await db.sequelize.transaction();

    try {
      // 查找待处理的提现申请
      const pendingWithdrawals = await Withdrawal.findAll({
        where: {
          status: "pending",
          applyTime: {
            [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前的申请
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nickname", "openid"],
          },
        ],
        transaction,
      });

      console.log(`找到 ${pendingWithdrawals.length} 个待处理的提现申请`);

      for (const withdrawal of pendingWithdrawals) {
        try {
          // 模拟提现处理（实际应该调用微信支付API）
          await this.processSingleWithdrawal(withdrawal, transaction);
        } catch (error) {
          console.error(`处理提现申请 ${withdrawal.id} 失败:`, error);
          // 标记为失败
          await withdrawal.update(
            {
              status: "rejected",
              processTime: new Date(),
              rejectReason: error.message,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      console.log("提现申请处理完成");
    } catch (error) {
      await transaction.rollback();
      console.error("批量处理提现申请失败:", error);
      throw error;
    }
  }

  /**
   * 处理单个提现申请
   */
  static async processSingleWithdrawal(withdrawal, transaction) {
    // 这里应该调用微信支付API进行实际提现
    // 目前只是模拟处理

    // 更新提现状态为已完成
    await withdrawal.update(
      {
        status: "completed",
        processTime: new Date(),
        completeTime: new Date(),
      },
      { transaction }
    );

    // 更新用户总提现金额
    const user = await User.findByPk(withdrawal.userId, { transaction });
    if (user) {
      await user.update(
        {
          totalWithdrawn:
            parseFloat(user.totalWithdrawn || 0) +
            parseFloat(withdrawal.amount),
        },
        { transaction }
      );
    }

    console.log(
      `提现申请 ${withdrawal.id} 处理完成，金额: ${withdrawal.amount}元`
    );
  }

  /**
   * 处理周度提现
   */
  static async processWeeklyWithdrawals() {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    console.log(`处理第 ${weekNumber} 周（${year}年）的提现申请`);

    // 这里可以添加周度提现的特殊逻辑
    // 比如批量处理、生成报表等
  }

  /**
   * 获取周数
   */
  static getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  /**
   * 处理订单自动确认
   */
  static async processOrderAutoConfirm() {
    try {
      const now = new Date();
      console.log(
        `[CronService] 开始处理订单自动确认，当前时间: ${now.toISOString()}`
      );

      // 获取所有社区
      const communities = await db.sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: db.sequelize.QueryTypes.SELECT }
      );

      // 先查询所有acceptor_done状态的订单，用于调试
      const allAcceptorDoneTasks = [];

      // 从每个社区分表中获取acceptor_done状态的任务
      for (const community of communities) {
        const tableName = `tasks_community_${community.id}`;

        try {
          const tasks = await db.sequelize.query(
            `SELECT id, status, autoConfirmTime, paymentStatus, acceptorDoneTime, title FROM ${tableName} WHERE status = 'acceptor_done'`,
            { type: db.sequelize.QueryTypes.SELECT }
          );

          allAcceptorDoneTasks.push(...tasks);
        } catch (error) {
          // 表不存在，继续查找下一个
          continue;
        }
      }

      console.log(
        `[CronService] 找到 ${allAcceptorDoneTasks.length} 个acceptor_done状态的订单:`
      );
      allAcceptorDoneTasks.forEach((task) => {
        console.log(
          `[CronService] 订单ID: ${task.id}, 自动确认时间: ${task.autoConfirmTime}, 支付状态: ${task.paymentStatus}`
        );
      });

      // 查找需要自动确认的订单（3小时后自动确认）
      const tasksToAutoConfirm = [];

      // 从每个社区分表中获取需要自动确认的任务
      for (const community of communities) {
        const tableName = `tasks_community_${community.id}`;

        try {
          const tasks = await db.sequelize.query(
            `SELECT id, status, autoConfirmTime, paymentStatus, acceptorDoneTime, title, acceptorId, rewardAmount, taskType FROM ${tableName} WHERE status = 'acceptor_done' AND autoConfirmTime <= ? AND paymentStatus = 'paid'`,
            {
              replacements: [now],
              type: db.sequelize.QueryTypes.SELECT,
            }
          );

          tasksToAutoConfirm.push(...tasks);
        } catch (error) {
          // 表不存在，继续查找下一个
          continue;
        }
      }

      console.log(
        `[CronService] 找到 ${tasksToAutoConfirm.length} 个需要自动确认的订单`
      );

      let confirmedCount = 0;
      let failedCount = 0;

      for (const task of tasksToAutoConfirm) {
        try {
          console.log(`[CronService] 开始自动确认订单 ${task.id}`);

          // 计算平台费用和接单员费用
          const calculateFees = (rewardAmount, task) => {
            let platformFee = 0;
            let acceptorFee = 0;

            if (task.taskType === "借物品" && task.borrowMode === "lend") {
              // 借出物品任务，平台收取10%手续费
              platformFee = parseFloat(rewardAmount) * 0.1;
              acceptorFee = parseFloat(rewardAmount) * 0.9;
            } else {
              // 其他任务类型，平台收取10%手续费
              platformFee = parseFloat(rewardAmount) * 0.1;
              acceptorFee = parseFloat(rewardAmount) * 0.9;
            }

            return { platformFee, acceptorFee };
          };

          const fees = calculateFees(task.rewardAmount, task);

          // 找到任务所在的社区分表并更新
          let updated = false;
          for (const community of communities) {
            const tableName = `tasks_community_${community.id}`;

            try {
              const result = await db.sequelize.query(
                `UPDATE ${tableName} SET status = ?, publisherConfirmedTime = ?, platformFee = ?, acceptorFee = ?, paymentStatus = ? WHERE id = ? AND paymentStatus = 'paid'`,
                {
                  replacements: [
                    "publisher_confirmed",
                    now,
                    fees.platformFee,
                    fees.acceptorFee,
                    "transferred", // 将paymentStatus从paid更新为transferred
                    task.id,
                  ],
                  type: db.sequelize.QueryTypes.UPDATE,
                }
              );

              if (result[1] > 0) {
                // 如果更新了行
                updated = true;
                break;
              }
            } catch (error) {
              // 表不存在，继续查找下一个
              continue;
            }
          }

          if (!updated) {
            console.error(`[CronService] 无法找到任务 ${task.id} 所在的分表`);
            failedCount++;
            continue;
          }

          // 触发打款给接单员
          if (task.taskType === "借物品") {
            // 借物品任务使用WalletService处理资金分配
            const WalletService = require("./walletService");
            await WalletService.processTaskCompletion(
              task.id,
              task.acceptorId,
              task.rewardAmount
            );
          } else {
            // 其他任务类型使用原有逻辑
            const transferToAcceptor = async (task) => {
              // 这里应该实现打款逻辑
              console.log(
                `[CronService] 模拟打款给接单员 ${task.acceptorId}，金额: ${task.rewardAmount}`
              );
            };
            await transferToAcceptor(task);
          }

          confirmedCount++;
          console.log(`[CronService] 自动确认订单 ${task.id} 完成`);
        } catch (error) {
          failedCount++;
          console.error(`[CronService] 自动确认订单 ${task.id} 失败:`, error);
        }
      }

      console.log(
        `[CronService] 自动确认完成: 成功 ${confirmedCount} 个, 失败 ${failedCount} 个`
      );
    } catch (error) {
      console.error("[CronService] 批量处理订单自动确认失败:", error);
      throw error;
    }
  }

  /**
   * 定时清理系统消息（每天凌晨3点）
   */
  static scheduleMessageCleanup() {
    cron.schedule(
      "0 3 * * *",
      async () => {
        console.log("[CronService] 开始清理超过一个月的系统消息...");
        try {
          const result = await SystemMessageService.cleanupOldMessages();
          console.log(
            `[CronService] 系统消息清理完成: 删除了${result.deletedCount}条消息`
          );
        } catch (error) {
          console.error("[CronService] 清理系统消息失败:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Shanghai",
      }
    );
  }
}

module.exports = CronService;
