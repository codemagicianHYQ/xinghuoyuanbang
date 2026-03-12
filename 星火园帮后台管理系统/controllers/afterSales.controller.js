const db = require("../models");
const { AfterSales, User, Task } = db;

// 提交售后申请
exports.submitAfterSales = async (req, res) => {
  try {
    const { taskId, issueType, description, images, contactInfo } = req.body;
    const userId = req.userId;

    // 验证必填字段
    if (!taskId || !issueType || !description || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: "请填写完整的申请信息",
      });
    }

    // 在所有社区的分表中查找任务
    let task = null;
    let communityId = null;
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;
      try {
        const tasks = await db.sequelize.query(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          {
            replacements: [parseInt(taskId)],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (tasks.length > 0) {
          task = tasks[0];
          communityId = community.id;
          break;
        }
      } catch (error) {
        // 表不存在，继续查找下一个
        continue;
      }
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

    // 检查用户是否有权限申请售后
    if (task.publisherId !== userId && task.acceptorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "您没有权限申请此任务的售后",
      });
    }

    // 创建售后申请
    const afterSales = await AfterSales.create({
      taskId,
      userId,
      issueType,
      description,
      images: images || [],
      contactInfo,
      communityId: communityId,
    });

    console.log(
      `[submitAfterSales] 售后申请创建成功: ID=${afterSales.id}, 任务ID=${taskId}, 用户ID=${userId}`
    );

    res.json({
      success: true,
      message: "售后申请提交成功",
      data: {
        id: afterSales.id,
        status: afterSales.status,
      },
    });
  } catch (error) {
    console.error("提交售后申请失败:", error);
    res.status(500).json({
      success: false,
      message: "提交失败",
      error: error.message,
    });
  }
};

// 获取用户的售后申请列表
exports.getUserAfterSales = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereCondition = { userId };
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await AfterSales.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    // 手动为每个售后申请添加任务信息
    for (const afterSales of rows) {
      if (afterSales.taskId) {
        const communities = await db.sequelize.query(
          "SELECT id FROM communities ORDER BY id",
          { type: db.sequelize.QueryTypes.SELECT }
        );

        for (const community of communities) {
          const tableName = `tasks_community_${community.id}`;
          try {
            const tasks = await db.sequelize.query(
              `SELECT id, title, taskType, status, rewardAmount FROM ${tableName} WHERE id = ?`,
              {
                replacements: [parseInt(afterSales.taskId)],
                type: db.sequelize.QueryTypes.SELECT,
              }
            );

            if (tasks.length > 0) {
              afterSales.dataValues.task = tasks[0];
              break;
            }
          } catch (error) {
            // 表不存在，继续查找下一个
            continue;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error("获取售后申请列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取失败",
      error: error.message,
    });
  }
};

// 获取售后申请详情
exports.getAfterSalesDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const afterSales = await AfterSales.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
    });

    if (!afterSales) {
      return res.status(404).json({
        success: false,
        message: "售后申请不存在",
      });
    }

    // 手动查找任务信息（从分表中）
    let task = null;
    if (afterSales.taskId) {
      const communities = await db.sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: db.sequelize.QueryTypes.SELECT }
      );

      for (const community of communities) {
        const tableName = `tasks_community_${community.id}`;
        try {
          const tasks = await db.sequelize.query(
            `SELECT id, title, taskType, status, rewardAmount, publisherId, acceptorId FROM ${tableName} WHERE id = ?`,
            {
              replacements: [parseInt(afterSales.taskId)],
              type: db.sequelize.QueryTypes.SELECT,
            }
          );

          if (tasks.length > 0) {
            task = tasks[0];
            break;
          }
        } catch (error) {
          // 表不存在，继续查找下一个
          continue;
        }
      }
    }

    // 将任务信息添加到售后申请对象中
    afterSales.dataValues.task = task;

    // 检查权限
    if (afterSales.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "您没有权限查看此售后申请",
      });
    }

    res.json({
      success: true,
      data: afterSales,
    });
  } catch (error) {
    console.error("获取售后申请详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取失败",
      error: error.message,
    });
  }
};

// 撤销售后申请
exports.cancelAfterSales = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const afterSales = await AfterSales.findByPk(id);
    if (!afterSales) {
      return res.status(404).json({
        success: false,
        message: "售后申请不存在",
      });
    }

    // 检查权限
    if (afterSales.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "您没有权限撤销此售后申请",
      });
    }

    // 检查状态
    if (afterSales.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "只有待处理的售后申请才能撤销",
      });
    }

    // 更新状态为已撤销
    await afterSales.update({
      status: "cancelled",
      adminResponse: "用户主动撤销",
      resolvedAt: new Date(),
    });

    console.log(
      `[cancelAfterSales] 售后申请撤销成功: ID=${id}, 用户ID=${userId}`
    );

    res.json({
      success: true,
      message: "撤销成功",
    });
  } catch (error) {
    console.error("撤销售后申请失败:", error);
    res.status(500).json({
      success: false,
      message: "撤销失败",
      error: error.message,
    });
  }
};

// 管理员获取所有售后申请
exports.getAllAfterSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, communityId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }
    if (communityId && communityId !== "all") {
      whereCondition.communityId = communityId;
    }

    const { count, rows } = await AfterSales.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    // 手动为每个售后申请添加任务信息
    for (const afterSales of rows) {
      if (afterSales.taskId) {
        const communities = await db.sequelize.query(
          "SELECT id FROM communities ORDER BY id",
          { type: db.sequelize.QueryTypes.SELECT }
        );

        for (const community of communities) {
          const tableName = `tasks_community_${community.id}`;
          try {
            const tasks = await db.sequelize.query(
              `SELECT id, title, taskType, status, rewardAmount FROM ${tableName} WHERE id = ?`,
              {
                replacements: [parseInt(afterSales.taskId)],
                type: db.sequelize.QueryTypes.SELECT,
              }
            );

            if (tasks.length > 0) {
              afterSales.dataValues.task = tasks[0];
              break;
            }
          } catch (error) {
            // 表不存在，继续查找下一个
            continue;
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error("获取售后申请列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取失败",
      error: error.message,
    });
  }
};

// 管理员处理售后申请
exports.handleAfterSales = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, response } = req.body; // action: 'approve', 'reject', 'resolve'

    const afterSales = await AfterSales.findByPk(id);
    if (!afterSales) {
      return res.status(404).json({
        success: false,
        message: "售后申请不存在",
      });
    }

    let updateData = {};

    switch (action) {
      case "approve":
        updateData = {
          status: "processing",
          adminResponse: response,
        };
        break;
      case "reject":
        updateData = {
          status: "rejected",
          adminResponse: response,
        };
        break;
      case "resolve":
        updateData = {
          status: "resolved",
          adminResponse: response,
          resolvedAt: new Date(),
        };

        // 如果批准售后申请，需要进行财务处理
        if (action === "resolve") {
          await this.processAfterSalesRefund(afterSales);
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "无效的操作类型",
        });
    }

    await afterSales.update(updateData);

    console.log(
      `[handleAfterSales] 售后申请处理完成: ID=${id}, 操作=${action}`
    );

    res.json({
      success: true,
      message: "处理完成",
      data: {
        id: afterSales.id,
        status: afterSales.status,
      },
    });
  } catch (error) {
    console.error("处理售后申请失败:", error);
    res.status(500).json({
      success: false,
      message: "处理失败",
      error: error.message,
    });
  }
};

// 处理售后申请的财务操作
exports.processAfterSalesRefund = async (afterSales) => {
  const transaction = await db.sequelize.transaction();

  try {
    // 获取任务信息（从分表中查找）
    let task = null;
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;
      try {
        const tasks = await db.sequelize.query(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          {
            replacements: [parseInt(afterSales.taskId)],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (tasks.length > 0) {
          task = tasks[0];
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!task) {
      throw new Error("任务不存在");
    }

    // 获取接单员和发布者信息
    const acceptor = await User.findByPk(task.acceptorId, { transaction });
    const publisher = await User.findByPk(task.publisherId, { transaction });

    if (!acceptor || !publisher) {
      throw new Error("用户信息不存在");
    }

    // 计算退款金额
    const taskAmount = parseFloat(task.rewardAmount);
    const platformFee = parseFloat(task.platformFee) || taskAmount * 0.1;
    const acceptorFee = parseFloat(task.acceptorFee) || taskAmount * 0.9;

    console.log(
      `[processAfterSalesRefund] 开始处理售后退款: 任务金额=${taskAmount}, 平台费用=${platformFee}, 接单员收入=${acceptorFee}`
    );

    // 1. 从接单员余额中扣除该订单的收益
    const acceptorBalanceBefore = parseFloat(acceptor.walletBalance);
    const acceptorBalanceAfter = Math.max(
      0,
      acceptorBalanceBefore - acceptorFee
    );

    await acceptor.update(
      {
        walletBalance: acceptorBalanceAfter,
        totalEarnings: Math.max(
          0,
          parseFloat(acceptor.totalEarnings) - acceptorFee
        ),
      },
      { transaction }
    );

    // 记录接单员余额变动
    await db.sequelize.query(
      `INSERT INTO wallet_records (
        user_id, type, amount, balance_after, description, related_id, related_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          acceptor.id,
          "expense",
          -acceptorFee,
          acceptorBalanceAfter,
          `售后申请扣除 - 任务ID: ${task.id}`,
          afterSales.id,
          "after_sales",
        ],
        type: db.sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    // 2. 给发布者退款
    const publisherBalanceBefore = parseFloat(publisher.walletBalance);
    const publisherBalanceAfter = publisherBalanceBefore + taskAmount;

    await publisher.update(
      {
        walletBalance: publisherBalanceAfter,
      },
      { transaction }
    );

    // 记录发布者余额变动
    await db.sequelize.query(
      `INSERT INTO wallet_records (
        user_id, type, amount, balance_after, description, related_id, related_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          publisher.id,
          "income",
          taskAmount,
          publisherBalanceAfter,
          `售后申请退款 - 任务ID: ${task.id}`,
          afterSales.id,
          "after_sales",
        ],
        type: db.sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    await transaction.commit();

    console.log(
      `[processAfterSalesRefund] 售后退款处理完成: 接单员扣除=${acceptorFee}, 发布者退款=${taskAmount}`
    );

    return {
      success: true,
      acceptorDeduction: acceptorFee,
      publisherRefund: taskAmount,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("[processAfterSalesRefund] 售后退款处理失败:", error);
    throw error;
  }
};
