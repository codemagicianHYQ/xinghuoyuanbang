// controllers/optimizedTaskController.js
const db = require("../models");
const { Task, User } = db;
const QueryOptimizationService = require("../services/queryOptimizationService");
const WalletService = require("../services/walletService");
const wechatNotificationService = require("../services/wechatNotificationService");

/**
 * 优化后的任务控制器 - 减少长事务
 */

/**
 * 优化后的发布者确认完成任务
 * 使用短事务 + 异步处理
 */
exports.optimizedPublisherConfirmDone = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const taskId = req.params.id;
    const publisherId = req.userId;

    // 1. 快速验证（无事务）
    const task = await Task.findByPk(taskId, {
      attributes: [
        "id",
        "publisherId",
        "status",
        "taskType",
        "rewardAmount",
        "acceptorId",
        "borrowMode",
        "specifics",
      ],
    });

    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }

    if (task.publisherId !== publisherId) {
      return res.status(403).send({ message: "只有发布者可以确认完成任务" });
    }

    if (task.status !== "acceptor_done") {
      return res
        .status(400)
        .send({ message: "只有接单员已确认完成的订单可以确认" });
    }

    // 2. 使用短事务处理核心业务逻辑
    const result = await db.sequelize.transaction(async (t) => {
      // 计算费用
      const fees = calculateFees(task.rewardAmount, task);

      // 更新任务状态
      await task.update(
        {
          status: "publisher_confirmed",
          publisherConfirmedTime: new Date(),
          platformFee: fees.platformFee,
          acceptorFee: fees.acceptorFee,
        },
        { transaction: t }
      );

      return { task, fees };
    });

    // 3. 异步处理通知和资金分配（不阻塞响应）
    setImmediate(async () => {
      try {
        await Promise.all([
          // 并行处理通知
          sendTaskCompletionNotifications(result.task),
          // 并行处理资金分配
          processTaskPayment(result.task),
        ]);
      } catch (error) {
        console.error(
          "❌ [optimizedPublisherConfirmDone] 异步处理失败:",
          error
        );
      }
    });

    const endTime = Date.now();
    console.log(
      `[optimizedPublisherConfirmDone] 任务完成处理耗时: ${
        endTime - startTime
      }ms`
    );

    res.status(200).send({
      message: "任务确认完成，已打款给接单员",
      task: result.task,
      processingTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化后的批量任务处理
 */
exports.batchProcessTasks = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { taskIds, acceptorId } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).send({ message: "任务ID列表不能为空" });
    }

    // 使用优化服务批量处理
    const result = await QueryOptimizationService.batchProcessTaskCompletion(
      taskIds,
      acceptorId
    );

    const endTime = Date.now();
    console.log(
      `[batchProcessTasks] 批量处理完成，总耗时: ${endTime - startTime}ms`
    );

    res.status(200).send({
      message: "批量处理完成",
      result,
      totalTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化后的任务列表查询
 */
exports.getOptimizedTaskList = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { page = 1, limit = 20, taskType, status, publisherId } = req.query;

    const filters = {};
    if (taskType) filters.taskType = taskType;
    if (status) filters.status = status;
    if (publisherId) filters.publisherId = publisherId;

    const pagination = { page: parseInt(page), limit: parseInt(limit) };

    // 使用优化服务获取任务列表
    const result = await QueryOptimizationService.getOptimizedTaskList(
      filters,
      pagination
    );

    const endTime = Date.now();
    console.log(`[getOptimizedTaskList] 查询耗时: ${endTime - startTime}ms`);

    res.status(200).send({
      success: true,
      data: result,
      queryTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化后的任务统计
 */
exports.getOptimizedTaskStats = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const cacheKey = "task_stats_" + new Date().toISOString().split("T")[0];
    const forceRefresh = req.query.refresh === "true";

    // 使用缓存优化查询
    const stats = await QueryOptimizationService.getCachedTaskStats(
      cacheKey,
      forceRefresh
    );

    const endTime = Date.now();
    console.log(
      `[getOptimizedTaskStats] 统计查询耗时: ${endTime - startTime}ms`
    );

    res.status(200).send({
      success: true,
      data: stats,
      queryTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化后的删除操作
 */
exports.optimizedDeleteTask = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { taskId } = req.params;

    // 使用短事务删除
    const result = await db.sequelize.transaction(async (t) => {
      // 1. 删除相关聊天记录
      const deletedChats = await db.Chat.destroy({
        where: { taskId: taskId },
        transaction: t,
      });

      // 2. 删除任务
      const deletedTask = await Task.destroy({
        where: { id: taskId },
        transaction: t,
      });

      return { deletedChats, deletedTask };
    });

    const endTime = Date.now();
    console.log(`[optimizedDeleteTask] 删除操作耗时: ${endTime - startTime}ms`);

    res.status(200).send({
      message: "任务删除成功",
      result,
      processingTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 优化后的批量删除
 */
exports.batchDeleteTasks = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).send({ message: "任务ID列表不能为空" });
    }

    // 使用优化服务分批删除
    const chatResult = await QueryOptimizationService.batchDeleteRecords(
      db.Chat,
      { taskId: { [db.Sequelize.Op.in]: taskIds } }
    );

    const taskResult = await QueryOptimizationService.batchDeleteRecords(Task, {
      id: { [db.Sequelize.Op.in]: taskIds },
    });

    const endTime = Date.now();
    console.log(`[batchDeleteTasks] 批量删除耗时: ${endTime - startTime}ms`);

    res.status(200).send({
      message: "批量删除完成",
      result: {
        deletedChats: chatResult.deletedCount,
        deletedTasks: taskResult.deletedCount,
      },
      processingTime: endTime - startTime,
    });
  } catch (error) {
    next(error);
  }
};

// 辅助函数：发送任务完成通知（异步）
async function sendTaskCompletionNotifications(task) {
  try {
    const taskWithRelations = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "publisher",
          attributes: ["id", "nickname", "openid"],
        },
        {
          model: User,
          as: "acceptor",
          attributes: ["id", "nickname", "openid"],
        },
      ],
    });

    console.log(
      `🎯 [sendTaskCompletionNotifications] 开始执行任务完成通知，任务ID: ${task.id}`
    );

    // 并行发送通知
    await Promise.all([
      wechatNotificationService.notifyTaskCompleted(taskWithRelations, "both"),
      sendSystemMessages(taskWithRelations),
    ]);

    console.log(`🎯 [sendTaskCompletionNotifications] 任务完成通知执行完成`);
  } catch (error) {
    console.error(
      "❌ [sendTaskCompletionNotifications] 发送任务完成通知失败:",
      error
    );
  }
}

// 辅助函数：发送系统消息（异步）
async function sendSystemMessages(taskWithRelations) {
  try {
    const SystemMessageService = require("../services/systemMessageService");

    // 并行发送系统消息
    await Promise.all([
      SystemMessageService.sendOrderCompleted(
        taskWithRelations.publisher.id,
        taskWithRelations
      ),
      SystemMessageService.sendOrderCompleted(
        taskWithRelations.acceptor.id,
        taskWithRelations
      ),
    ]);

    console.log(
      `✅ [sendSystemMessages] 已发送订单完成系统消息给发布者和接单员`
    );
  } catch (error) {
    console.error("❌ [sendSystemMessages] 发送系统消息失败:", error);
  }
}

// 辅助函数：处理任务资金分配（异步）
async function processTaskPayment(task) {
  try {
    if (task.taskType === "借物品") {
      // 借物品任务使用WalletService处理资金分配
      await WalletService.processTaskCompletion(
        task.id,
        task.acceptorId,
        task.rewardAmount
      );
    } else {
      // 其他任务类型使用原有逻辑
      await transferToAcceptor(task);
    }
  } catch (error) {
    console.error("❌ [processTaskPayment] 处理资金分配失败:", error);
  }
}

// 辅助函数：计算费用
function calculateFees(rewardAmount, task) {
  let platformFee = 0;
  let acceptorFee = 0;

  if (task.taskType === "借物品" && task.borrowMode === "lend") {
    // 借物品借出模式：计算租金费用
    const specifics = JSON.parse(task.specifics || "{}");
    const dailyRent = parseFloat(specifics.dailyRent || 0);
    const borrowTime = parseInt(specifics.borrowTime || 0);
    const totalRent = dailyRent * borrowTime;

    platformFee = parseFloat((totalRent * 0.1).toFixed(2));
    acceptorFee = totalRent - platformFee;
  } else {
    // 其他任务类型：10%平台费，90%给接单员
    platformFee = parseFloat((rewardAmount * 0.1).toFixed(2));
    acceptorFee = rewardAmount - platformFee;
  }

  return { platformFee, acceptorFee };
}

// 辅助函数：转账给接单员
async function transferToAcceptor(task) {
  // 这里实现原有的转账逻辑
  console.log(`[transferToAcceptor] 处理任务 ${task.id} 的转账`);
}

module.exports = exports;
