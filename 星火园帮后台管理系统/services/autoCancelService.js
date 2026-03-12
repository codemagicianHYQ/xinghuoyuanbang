const db = require("../models");
const { Op } = require("sequelize");

/**
 * 自动取消订单服务
 * 根据时间要求计算自动取消时间：
 * - 立刻需要：发布后30分钟
 * - 30分钟内：发布后1小时
 * - 1小时内：发布后1.5小时
 * - 2小时内：发布后2.5小时
 * - 12小时内：发布后12.5小时
 * - 24小时内：发布后24.5小时
 * - 48小时内：发布后48.5小时
 */

/**
 * 根据时间要求计算自动取消时间
 * @param {string} timeRequirement - 时间要求
 * @param {Date} publishTime - 发布时间
 * @returns {Date} 自动取消时间
 */
function calculateAutoCancelTime(timeRequirement, publishTime = new Date()) {
  const baseTime = new Date(publishTime);

  switch (timeRequirement) {
    case "immediate":
      // 立刻需要：发布后30分钟
      return new Date(baseTime.getTime() + 30 * 60 * 1000);
    case "30min":
      // 30分钟内：发布后1小时
      return new Date(baseTime.getTime() + 60 * 60 * 1000);
    case "1hour":
      // 1小时内：发布后1.5小时
      return new Date(baseTime.getTime() + 90 * 60 * 1000);
    case "2hour":
      // 2小时内：发布后2.5小时
      return new Date(baseTime.getTime() + 150 * 60 * 1000);
    case "4hour":
      // 4小时内：发布后4.5小时
      return new Date(baseTime.getTime() + 4.5 * 60 * 60 * 1000);
    case "6hour":
      // 6小时内：发布后6.5小时
      return new Date(baseTime.getTime() + 6.5 * 60 * 60 * 1000);
    case "12hour":
      // 12小时内：发布后12.5小时
      return new Date(baseTime.getTime() + 12.5 * 60 * 60 * 1000);
    case "24hour":
      // 24小时内：发布后24.5小时
      return new Date(baseTime.getTime() + 24.5 * 60 * 60 * 1000);
    case "48hour":
      // 48小时内：发布后48.5小时
      return new Date(baseTime.getTime() + 48.5 * 60 * 60 * 1000);
    default:
      // 默认：发布后24小时
      return new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * 自动取消超时订单
 * 查找所有状态为open且autoCancelTime已到的订单
 */
async function autoCancelExpiredTasks() {
  try {
    console.log("[autoCancelService] 开始检查超时订单...");

    const now = new Date();

    // 查询所有社区
    const communities = await db.sequelize.query("SELECT id FROM communities", {
      type: db.sequelize.QueryTypes.SELECT,
    });

    let totalCancelled = 0;

    // 遍历所有社区的任务表
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        // 先检查表是否有 budget 字段
        const hasBudgetColumn = await db.sequelize.query(
          `SELECT COUNT(*) as count 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = ? 
           AND COLUMN_NAME = 'budget'`,
          {
            replacements: [tableName],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        const hasBudget = hasBudgetColumn[0]?.count > 0;

        // 根据表结构动态构建查询字段
        const selectFields = hasBudget
          ? `id, publisherId, rewardAmount, paymentStatus, out_trade_no, communityId, taskType, borrowMode, specifics, budget, title`
          : `id, publisherId, rewardAmount, paymentStatus, out_trade_no, communityId, taskType, borrowMode, specifics, title`;

        // 查找需要自动取消的订单
        const expiredTasks = await db.sequelize.query(
          `SELECT ${selectFields}
           FROM ${tableName} 
           WHERE status = 'open' 
           AND autoCancelTime IS NOT NULL 
           AND autoCancelTime <= ?`,
          {
            replacements: [now],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        console.log(
          `[autoCancelService] 社区 ${community.id} 发现 ${expiredTasks.length} 个超时订单`
        );

        // 调试：打印超时订单的详细信息
        if (expiredTasks.length > 0) {
          expiredTasks.forEach((task, index) => {
            // 如果表没有 budget 字段，从 specifics 中解析（如果是帮我买任务）
            let budget = task.budget;
            if (!budget && task.taskType === "帮我买" && task.specifics) {
              try {
                const specifics =
                  typeof task.specifics === "string"
                    ? JSON.parse(task.specifics)
                    : task.specifics;
                budget = specifics.budget || specifics.预算 || 0;
              } catch (e) {
                budget = 0;
              }
            }

            // 将解析的 budget 添加到 task 对象中，供后续使用
            if (!task.budget) {
              task.budget = budget || 0;
            }

            console.log(`[autoCancelService] 超时订单 ${index + 1}:`, {
              id: task.id,
              title: task.title,
              taskType: task.taskType,
              rewardAmount: task.rewardAmount,
              budget: task.budget || 0,
              out_trade_no: task.out_trade_no,
              expectedTotal:
                task.taskType === "帮我买"
                  ? parseFloat(task.rewardAmount || 0) +
                    parseFloat(task.budget || 0) +
                    0.1
                  : task.rewardAmount,
            });
          });
        }

        // 处理每个超时订单
        for (const task of expiredTasks) {
          try {
            await cancelExpiredTask(task, tableName, community.id);
            totalCancelled++;
          } catch (error) {
            console.error(
              `[autoCancelService] 取消订单 ${task.id} 失败:`,
              error.message
            );
          }
        }
      } catch (error) {
        console.error(
          `[autoCancelService] 处理社区 ${community.id} 失败:`,
          error.message
        );
      }
    }

    console.log(
      `[autoCancelService] 自动取消完成，共取消 ${totalCancelled} 个订单`
    );
    return totalCancelled;
  } catch (error) {
    console.error("[autoCancelService] 自动取消订单失败:", error);
    throw error;
  }
}

/**
 * 取消单个超时订单
 * @param {Object} task - 任务信息
 * @param {string} tableName - 表名
 * @param {number} communityId - 社区ID
 */
async function cancelExpiredTask(task, tableName, communityId) {
  try {
    console.log(
      `[autoCancelService] 取消订单 ${task.id}，发布者: ${task.publisherId}`
    );

    // 更新订单状态为已取消
    await db.sequelize.query(
      `UPDATE ${tableName} 
       SET status = 'cancelled', 
           remarks = CONCAT(IFNULL(remarks, ''), ' [系统自动取消-超时未接单]')
       WHERE id = ?`,
      {
        replacements: [task.id],
        type: db.sequelize.QueryTypes.UPDATE,
      }
    );

    // 如果订单已支付，尝试退款（退款失败不影响订单取消）
    if (task.paymentStatus === "paid" && task.out_trade_no) {
      try {
        await processRefund(task, communityId);
      } catch (refundError) {
        console.error(
          `[autoCancelService] 订单 ${task.id} 退款失败:`,
          refundError
        );
        // 退款失败时，paymentStatus 仍为 paid，订单已取消但不退款
        // 这种情况需要人工处理或重试
      }
    }

    console.log(`[autoCancelService] 订单 ${task.id} 取消成功`);
  } catch (error) {
    console.error(`[autoCancelService] 取消订单 ${task.id} 失败:`, error);
    throw error;
  }
}

/**
 * 处理退款
 * @param {Object} task - 任务信息
 * @param {number} communityId - 社区ID
 */
async function processRefund(task, communityId) {
  try {
    console.log(`[autoCancelService] 开始处理订单 ${task.id} 的退款`);

    // 重新从数据库查询任务的最新信息，确保使用最新的金额数据
    // 这样可以避免使用过期的任务对象数据
    const tableName = `tasks_community_${communityId}`;
    const latestTask = await db.sequelize.query(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      {
        replacements: [task.id],
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    if (!latestTask || latestTask.length === 0) {
      throw new Error(`订单 ${task.id} 不存在`);
    }

    const currentTask = latestTask[0];
    console.log(
      `[autoCancelService] 从数据库获取的最新任务信息:`,
      JSON.stringify({
        id: currentTask.id,
        rewardAmount: currentTask.rewardAmount,
        budget: currentTask.budget,
        taskType: currentTask.taskType,
        borrowMode: currentTask.borrowMode,
        out_trade_no: currentTask.out_trade_no,
      })
    );

    // 使用与用户主动取消相同的退款服务
    const wechatPayRefundService = require("./wechatPayRefundService");

    // 生成退款单号
    const out_refund_no =
      "REFUND" + Date.now() + Math.floor(Math.random() * 10000);

    // 根据任务类型计算退款金额（使用最新的任务数据）
    let refundAmount, totalAmount;

    // 清理任务类型字符串，去除可能的空格或特殊字符
    const taskType = String(currentTask.taskType || "").trim();

    console.log(
      `[autoCancelService] 开始计算退款金额，任务类型: "${taskType}", borrowMode: "${task.borrowMode}"`
    );

    if (taskType === "借物品" && currentTask.borrowMode === "lend") {
      // 借出模式：发布者没有付款，不应该退款
      console.log(
        `[autoCancelService] 借出模式任务 ${currentTask.id} 发布者没有付款，无需退款`
      );
      throw new Error("借出模式任务无需退款");
    } else if (taskType === "帮我买") {
      // 帮我买任务：实际支付金额 = rewardAmount（跑腿费）+ budget（预算）+ 0.1（服务费）
      const reward = parseFloat(currentTask.rewardAmount || 0);
      const budget = parseFloat(currentTask.budget || 0);
      const serviceFee = 0.1; // 平台服务费
      totalAmount = reward + budget + serviceFee;
      refundAmount = totalAmount;

      console.log(
        `[autoCancelService] 帮我买任务金额计算: 跑腿费${reward}元 + 预算${budget}元 + 服务费${serviceFee}元 = ${totalAmount}元`
      );
    } else {
      // 其他任务类型：使用rewardAmount
      refundAmount = parseFloat(currentTask.rewardAmount || 0);
      totalAmount = refundAmount;
      console.log(
        `[autoCancelService] 其他任务类型退款金额: ${refundAmount}元`
      );
    }

    console.log(
      `[autoCancelService] 订单详情:\n` +
        `- 任务ID: ${currentTask.id}\n` +
        `- 任务类型: ${currentTask.taskType}\n` +
        `- 借物模式: ${currentTask.borrowMode || "N/A"}\n` +
        `- rewardAmount: ${
          currentTask.rewardAmount
        } (类型: ${typeof currentTask.rewardAmount})\n` +
        `- budget: ${
          currentTask.budget
        } (类型: ${typeof currentTask.budget})\n` +
        `- 计算的退款金额: ${refundAmount} 元\n` +
        `- 计算的订单总金额: ${totalAmount} 元\n` +
        `- 订单号: ${currentTask.out_trade_no}\n` +
        `- 退款单号: ${out_refund_no}\n` +
        `- 发送给微信的退款金额: ${Math.round(refundAmount * 100)} 分\n` +
        `- 发送给微信的订单总金额: ${Math.round(totalAmount * 100)} 分`
    );

    // 调用微信支付退款API（使用统一的服务）
    const refundResult = await wechatPayRefundService.applyRefund(
      currentTask.out_trade_no, // 原支付订单号
      out_refund_no, // 退款单号
      totalAmount, // 原订单金额（元）
      refundAmount, // 退款金额（元）
      "订单超时未接单自动取消"
    );

    if (refundResult.success) {
      console.log(
        `[autoCancelService] 订单 ${currentTask.id} 退款申请成功:`,
        refundResult
      );
    } else {
      console.error(`[autoCancelService] 订单 ${currentTask.id} 退款失败:`, {
        error: refundResult.error,
        error_code: refundResult.error_code,
        refund_status: refundResult.refund_status,
      });
      throw new Error(refundResult.error || "退款失败");
    }

    // 更新订单的支付状态为已退款
    await db.sequelize.query(
      `UPDATE ${tableName} SET paymentStatus = 'refunded' WHERE id = ?`,
      {
        replacements: [currentTask.id],
        type: db.sequelize.QueryTypes.UPDATE,
      }
    );

    console.log(
      `[autoCancelService] 订单 ${currentTask.id} 支付状态已更新为已退款`
    );
  } catch (error) {
    console.error(`[autoCancelService] 处理退款失败:`, error);
    throw error;
  }
}

/**
 * 启动自动取消服务
 * 每5分钟检查一次超时订单
 */
function startAutoCancelService() {
  console.log("[autoCancelService] 启动自动取消服务...");

  // 立即执行一次检查
  autoCancelExpiredTasks().catch(console.error);

  // 每5分钟检查一次
  setInterval(() => {
    autoCancelExpiredTasks().catch(console.error);
  }, 5 * 60 * 1000); // 5分钟

  console.log("[autoCancelService] 自动取消服务已启动，每5分钟检查一次");
}

module.exports = {
  calculateAutoCancelTime,
  autoCancelExpiredTasks,
  cancelExpiredTask,
  processRefund,
  startAutoCancelService,
};
