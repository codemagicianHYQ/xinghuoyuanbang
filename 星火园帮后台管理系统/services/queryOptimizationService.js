// services/queryOptimizationService.js
const db = require("../models");
const { Op } = require("sequelize");

class QueryOptimizationService {
  /**
   * 优化数据库查询，减少长事务
   */

  /**
   * 批量处理任务完成，减少事务时间
   * @param {Array} taskIds 任务ID数组
   * @param {string} acceptorId 接单员ID
   */
  static async batchProcessTaskCompletion(taskIds, acceptorId) {
    const startTime = Date.now();
    console.log(
      `[QueryOptimization] 开始批量处理任务完成，任务数量: ${taskIds.length}`
    );

    try {
      // 1. 批量获取任务信息（减少查询次数）
      const tasks = await db.Task.findAll({
        where: { id: { [Op.in]: taskIds } },
        attributes: [
          "id",
          "taskType",
          "rewardAmount",
          "publisherId",
          "acceptorId",
          "borrowMode",
          "specifics",
        ],
        include: [
          {
            model: db.User,
            as: "publisher",
            attributes: ["id", "nickname", "openid"],
          },
          {
            model: db.User,
            as: "acceptor",
            attributes: ["id", "nickname", "openid"],
          },
        ],
      });

      if (tasks.length === 0) {
        throw new Error("未找到任何任务");
      }

      // 2. 按任务类型分组处理
      const borrowTasks = tasks.filter((task) => task.taskType === "借物品");
      const otherTasks = tasks.filter((task) => task.taskType !== "借物品");

      const results = [];

      // 3. 并行处理不同类型的任务
      const promises = [];

      // 处理借物品任务
      if (borrowTasks.length > 0) {
        promises.push(this.batchProcessBorrowTasks(borrowTasks));
      }

      // 处理其他任务
      if (otherTasks.length > 0) {
        promises.push(this.batchProcessOtherTasks(otherTasks));
      }

      const batchResults = await Promise.all(promises);

      // 4. 合并结果
      batchResults.forEach((result) => {
        results.push(...result);
      });

      const endTime = Date.now();
      console.log(
        `[QueryOptimization] 批量处理完成，耗时: ${endTime - startTime}ms`
      );

      return {
        success: true,
        processedCount: results.length,
        duration: endTime - startTime,
        results,
      };
    } catch (error) {
      console.error("[QueryOptimization] 批量处理任务失败:", error);
      throw error;
    }
  }

  /**
   * 批量处理借物品任务
   */
  static async batchProcessBorrowTasks(tasks) {
    const results = [];

    for (const task of tasks) {
      try {
        // 使用短事务处理单个任务
        const result = await db.sequelize.transaction(async (t) => {
          return await this.processSingleBorrowTask(task, t);
        });
        results.push(result);
      } catch (error) {
        console.error(
          `[QueryOptimization] 处理借物品任务 ${task.id} 失败:`,
          error
        );
        results.push({ taskId: task.id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * 批量处理其他任务
   */
  static async batchProcessOtherTasks(tasks) {
    const results = [];

    for (const task of tasks) {
      try {
        // 使用短事务处理单个任务
        const result = await db.sequelize.transaction(async (t) => {
          return await this.processSingleOtherTask(task, t);
        });
        results.push(result);
      } catch (error) {
        console.error(
          `[QueryOptimization] 处理其他任务 ${task.id} 失败:`,
          error
        );
        results.push({ taskId: task.id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * 处理单个借物品任务（短事务）
   */
  static async processSingleBorrowTask(task, transaction) {
    const startTime = Date.now();

    // 解析借物品任务信息
    const specifics = JSON.parse(task.specifics || "{}");
    const dailyRent = parseFloat(specifics.dailyRent || 0);
    const borrowTime = parseInt(specifics.borrowTime || 0);
    const totalRent = dailyRent * borrowTime;
    const platformFee = parseFloat((totalRent * 0.1).toFixed(2));
    const lenderIncome = totalRent - platformFee;

    // 更新任务状态
    await task.update(
      {
        status: "completed",
        paymentStatus: "transferred",
        platformFee: platformFee,
        acceptorFee: lenderIncome,
      },
      { transaction }
    );

    // 更新发布者（借出者）余额
    await db.User.increment("balance", {
      by: lenderIncome,
      where: { id: task.publisherId },
      transaction,
    });

    // 更新接单员（借入者）余额（退还押金）
    const deposit = parseFloat(specifics.deposit || 0);
    await db.User.increment("balance", {
      by: deposit,
      where: { id: task.acceptorId },
      transaction,
    });

    const endTime = Date.now();
    console.log(
      `[QueryOptimization] 借物品任务 ${task.id} 处理完成，耗时: ${
        endTime - startTime
      }ms`
    );

    return {
      taskId: task.id,
      success: true,
      duration: endTime - startTime,
      lenderIncome,
      depositRefund: deposit,
    };
  }

  /**
   * 处理单个其他任务（短事务）
   */
  static async processSingleOtherTask(task, transaction) {
    const startTime = Date.now();

    // 计算费用
    const platformFee = parseFloat((task.rewardAmount * 0.1).toFixed(2));
    const riderAmount = task.rewardAmount - platformFee;

    // 更新任务状态
    await task.update(
      {
        status: "completed",
        paymentStatus: "transferred",
        platformFee: platformFee,
        acceptorFee: riderAmount,
      },
      { transaction }
    );

    // 更新接单员余额
    await db.User.increment("balance", {
      by: riderAmount,
      where: { id: task.acceptorId },
      transaction,
    });

    const endTime = Date.now();
    console.log(
      `[QueryOptimization] 其他任务 ${task.id} 处理完成，耗时: ${
        endTime - startTime
      }ms`
    );

    return {
      taskId: task.id,
      success: true,
      duration: endTime - startTime,
      riderAmount,
      platformFee,
    };
  }

  /**
   * 优化查询：使用索引和限制字段
   */
  static async getOptimizedTaskList(filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // 只查询必要的字段
    const attributes = [
      "id",
      "title",
      "taskType",
      "rewardAmount",
      "status",
      "createdAt",
      "publisherId",
      "acceptorId",
      "deadline",
    ];

    // 构建优化的查询条件
    const whereClause = {};

    if (filters.taskType) {
      whereClause.taskType = filters.taskType;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.publisherId) {
      whereClause.publisherId = filters.publisherId;
    }

    // 使用索引优化查询
    const orderClause = [["createdAt", "DESC"]];

    try {
      const { count, rows } = await db.Task.findAndCountAll({
        where: whereClause,
        attributes,
        include: [
          {
            model: db.User,
            as: "publisher",
            attributes: ["id", "nickname", "avatarUrl"],
          },
        ],
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true, // 避免重复计数
      });

      return {
        tasks: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      };
    } catch (error) {
      console.error("[QueryOptimization] 获取任务列表失败:", error);
      throw error;
    }
  }

  /**
   * 优化查询：批量获取用户信息
   */
  static async batchGetUserInfo(userIds) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    try {
      const users = await db.User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ["id", "nickname", "avatarUrl", "balance"],
        // 使用索引优化
        order: [["id", "ASC"]],
      });

      // 转换为Map以提高查找效率
      const userMap = new Map();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      return userMap;
    } catch (error) {
      console.error("[QueryOptimization] 批量获取用户信息失败:", error);
      throw error;
    }
  }

  /**
   * 优化查询：使用缓存减少数据库查询
   */
  static async getCachedTaskStats(cacheKey, forceRefresh = false) {
    const cacheService = require("./cacheService");

    try {
      // 尝试从缓存获取
      if (!forceRefresh) {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          console.log(`[QueryOptimization] 从缓存获取统计数据: ${cacheKey}`);
          return cached;
        }
      }

      // 缓存未命中，查询数据库
      const stats = await this.calculateTaskStats();

      // 缓存结果（5分钟）
      await cacheService.set(cacheKey, stats, 300);

      console.log(`[QueryOptimization] 统计数据已缓存: ${cacheKey}`);
      return stats;
    } catch (error) {
      console.error("[QueryOptimization] 获取缓存统计数据失败:", error);
      throw error;
    }
  }

  /**
   * 计算任务统计数据
   */
  static async calculateTaskStats() {
    const startTime = Date.now();

    try {
      // 使用并行查询提高效率
      const [taskCounts, userCounts, revenueStats] = await Promise.all([
        // 任务统计
        db.Task.findAll({
          attributes: [
            "taskType",
            [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
            [
              db.sequelize.fn("SUM", db.sequelize.col("rewardAmount")),
              "totalAmount",
            ],
          ],
          where: { status: "completed" },
          group: ["taskType"],
        }),

        // 用户统计
        db.User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 最近30天
            },
          },
        }),

        // 收入统计
        db.Task.findOne({
          attributes: [
            [
              db.sequelize.fn("SUM", db.sequelize.col("platformFee")),
              "totalPlatformFee",
            ],
            [
              db.sequelize.fn("SUM", db.sequelize.col("acceptorFee")),
              "totalAcceptorFee",
            ],
          ],
          where: {
            status: "completed",
            paymentStatus: "transferred",
          },
        }),
      ]);

      const endTime = Date.now();
      console.log(
        `[QueryOptimization] 统计数据计算完成，耗时: ${endTime - startTime}ms`
      );

      return {
        taskCounts,
        userCounts,
        revenueStats,
        calculationTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[QueryOptimization] 计算统计数据失败:", error);
      throw error;
    }
  }

  /**
   * 优化删除操作：分批删除避免长事务
   */
  static async batchDeleteRecords(model, whereClause, batchSize = 100) {
    let deletedCount = 0;
    let hasMore = true;

    console.log(`[QueryOptimization] 开始分批删除记录，批次大小: ${batchSize}`);

    while (hasMore) {
      try {
        // 获取一批记录
        const records = await model.findAll({
          where: whereClause,
          limit: batchSize,
          attributes: ["id"],
        });

        if (records.length === 0) {
          hasMore = false;
          break;
        }

        const recordIds = records.map((record) => record.id);

        // 分批删除
        const deleted = await model.destroy({
          where: { id: { [Op.in]: recordIds } },
        });

        deletedCount += deleted;
        console.log(
          `[QueryOptimization] 已删除 ${deleted} 条记录，总计: ${deletedCount}`
        );

        // 如果删除的记录数少于批次大小，说明已经删除完毕
        if (deleted < batchSize) {
          hasMore = false;
        }

        // 添加小延迟避免数据库压力过大
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("[QueryOptimization] 分批删除失败:", error);
        throw error;
      }
    }

    console.log(
      `[QueryOptimization] 分批删除完成，总计删除: ${deletedCount} 条记录`
    );
    return { deletedCount };
  }
}

module.exports = QueryOptimizationService;
