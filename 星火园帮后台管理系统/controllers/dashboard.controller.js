const { Task, User } = require("../models");
const { Op } = require("sequelize");
const databaseService = require("../services/databaseService");
const db = require("../models");

const isVirtualFromRemarks = (remarks) => {
  if (!remarks) {
    return false;
  }

  if (typeof remarks === "object" && remarks !== null) {
    return Boolean(remarks.__virtual);
  }

  if (typeof remarks === "string") {
    try {
      const parsed = JSON.parse(remarks);
      if (parsed && typeof parsed === "object") {
        return Boolean(parsed.__virtual);
      }
    } catch (error) {
      return remarks.includes("__virtual");
    }

    return false;
  }

  return false;
};

// 获取仪表盘汇总数据
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 今日新增用户
    const newUsersToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    // 由于任务表已分片，我们需要查询所有分片来获取任务统计
    let newTasksToday = 0;
    let pendingTasks = 0;
    let completedTasksTotal = 0;

    try {
      // 如果是社区管理员，只查询该管理员管理的社区
      let communitiesToQuery = [];
      if (req.communityAdminId) {
        const communityIdInt = parseInt(req.communityAdminId);
        const tableExists = await databaseService.checkShardedTableExists(
          communityIdInt
        );
        if (tableExists) {
          communitiesToQuery = [{ id: communityIdInt }];
        } else {
          // 社区分表不存在，跳过
          communitiesToQuery = [];
        }
      } else {
        // 超级管理员查询所有社区
        communitiesToQuery = await databaseService.getAllCommunities();
      }

      for (const community of communitiesToQuery) {
        try {
          const tableName = databaseService.getTaskTableName(community.id);
          const tableExists = await databaseService.checkShardedTableExists(
            community.id
          );

          if (tableExists) {
            // 今日新增任务
            const newTasksQuery = `
              SELECT COUNT(*) as count FROM ${tableName} 
              WHERE createdAt >= ? AND createdAt < ?
            `;
            const newTasksResult = await db.sequelize.query(newTasksQuery, {
              replacements: [today, tomorrow],
              type: db.sequelize.QueryTypes.SELECT,
            });
            newTasksToday += parseInt(newTasksResult[0]?.count || 0);

            // 待处理任务（open状态）
            const pendingQuery = `
              SELECT COUNT(*) as count FROM ${tableName} 
              WHERE status = 'open'
            `;
            const pendingResult = await db.sequelize.query(pendingQuery, {
              type: db.sequelize.QueryTypes.SELECT,
            });
            pendingTasks += parseInt(pendingResult[0]?.count || 0);

            // 已完成任务总数
            const completedQuery = `
              SELECT COUNT(*) as count FROM ${tableName} 
              WHERE status = 'publisher_confirmed'
            `;
            const completedResult = await db.sequelize.query(completedQuery, {
              type: db.sequelize.QueryTypes.SELECT,
            });
            completedTasksTotal += parseInt(completedResult[0]?.count || 0);
          }
        } catch (error) {
          console.error(`查询社区 ${community.id} 分表失败:`, error);
        }
      }
    } catch (error) {
      console.error("查询分片任务表失败:", error);
    }

    res.json({
      success: true,
      data: {
        newTasksToday,
        newUsersToday,
        pendingTasks,
        completedTasksTotal,
      },
    });
  } catch (error) {
    console.error("获取仪表盘汇总数据失败:", error);
    res.status(500).json({
      success: false,
      message: "获取仪表盘汇总数据失败",
      error: error.message,
    });
  }
};

// 获取任务趋势数据
exports.getTaskTrend = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "请提供开始日期和结束日期",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 由于任务表已分片，我们需要查询所有分片来获取任务趋势
    const dateMap = new Map();

    try {
      // 如果是社区管理员，只查询该管理员管理的社区
      let communitiesToQuery = [];
      if (req.communityAdminId) {
        const communityIdInt = parseInt(req.communityAdminId);
        const tableExists = await databaseService.checkShardedTableExists(
          communityIdInt
        );
        if (tableExists) {
          communitiesToQuery = [{ id: communityIdInt }];
        } else {
          // 社区分表不存在，返回空数据
          return res.json({
            success: true,
            data: [],
          });
        }
      } else {
        // 超级管理员查询所有社区
        communitiesToQuery = await databaseService.getAllCommunities();
      }

      for (const community of communitiesToQuery) {
        try {
          const tableName = databaseService.getTaskTableName(community.id);
          const tableExists = await databaseService.checkShardedTableExists(
            community.id
          );

          if (tableExists) {
            // 按日期分组统计任务数量
            const trendQuery = `
              SELECT DATE(createdAt) as date, COUNT(*) as value 
              FROM ${tableName} 
              WHERE createdAt BETWEEN ? AND ?
              GROUP BY DATE(createdAt)
              ORDER BY DATE(createdAt) ASC
            `;
            const trendResult = await db.sequelize.query(trendQuery, {
              replacements: [start, end],
              type: db.sequelize.QueryTypes.SELECT,
            });

            // 合并数据
            trendResult.forEach((item) => {
              const dateKey = new Date(item.date).toLocaleDateString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
              });
              if (dateMap.has(dateKey)) {
                dateMap.set(
                  dateKey,
                  dateMap.get(dateKey) + parseInt(item.value)
                );
              } else {
                dateMap.set(dateKey, parseInt(item.value));
              }
            });
          }
        } catch (error) {
          console.error(`查询社区 ${community.id} 分表失败:`, error);
        }
      }
    } catch (error) {
      console.error("查询分片任务表失败:", error);
    }

    // 格式化数据
    const formattedData = Array.from(dateMap.entries()).map(
      ([date, value]) => ({
        date,
        value,
      })
    );

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("获取任务趋势数据失败:", error);
    res.status(500).json({
      success: false,
      message: "获取任务趋势数据失败",
      error: error.message,
    });
  }
};

// 获取用户活跃度数据
exports.getUserActivity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "请提供开始日期和结束日期",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 如果是社区管理员，只统计在该社区有任务的用户
    let userIdsInCommunity = null;
    if (req.communityAdminId) {
      const communityIdInt = parseInt(req.communityAdminId);
      const tableName = databaseService.getTaskTableName(communityIdInt);
      const tableExists = await databaseService.checkShardedTableExists(
        communityIdInt
      );

      if (tableExists) {
        // 获取在该社区有任务的用户ID（发布过或接受过任务）
        const userQuery = `
          SELECT DISTINCT publisherId as userId FROM ${tableName} WHERE publisherId IS NOT NULL
          UNION
          SELECT DISTINCT acceptorId as userId FROM ${tableName} WHERE acceptorId IS NOT NULL
        `;
        const userIdResults = await db.sequelize.query(userQuery, {
          type: db.sequelize.QueryTypes.SELECT,
        });
        userIdsInCommunity = userIdResults
          .map((row) => row.userId)
          .filter((id) => id);
      } else {
        // 社区分表不存在，返回空数据
        return res.json({
          success: true,
          data: [],
        });
      }
    }

    // 如果是社区管理员但没有找到相关用户，返回空数据
    if (
      req.communityAdminId &&
      (!userIdsInCommunity || userIdsInCommunity.length === 0)
    ) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // 构建查询条件
    const whereCondition = {
      updatedAt: {
        [Op.between]: [start, end],
      },
    };

    // 如果是社区管理员，只查询在该社区有任务的用户
    if (userIdsInCommunity && userIdsInCommunity.length > 0) {
      whereCondition.id = {
        [Op.in]: userIdsInCommunity,
      };
    }

    // 按日期分组统计活跃用户（有登录记录的用户）
    const activeUsersData = await User.findAll({
      attributes: [
        [User.sequelize.fn("DATE", User.sequelize.col("updatedAt")), "date"],
        [User.sequelize.fn("COUNT", User.sequelize.col("id")), "activeUsers"],
      ],
      where: whereCondition,
      group: [User.sequelize.fn("DATE", User.sequelize.col("updatedAt"))],
      order: [
        [User.sequelize.fn("DATE", User.sequelize.col("updatedAt")), "ASC"],
      ],
      raw: true,
    });

    // 构建新增用户查询条件
    const newUserWhereCondition = {
      createdAt: {
        [Op.between]: [start, end],
      },
    };

    // 如果是社区管理员，只查询在该社区有任务的新用户
    // 注意：这里不需要再次检查 userIdsInCommunity 是否为空，因为已经在上面返回了空数据
    if (userIdsInCommunity && userIdsInCommunity.length > 0) {
      newUserWhereCondition.id = {
        [Op.in]: userIdsInCommunity,
      };
    }

    // 按日期分组统计新增用户
    const newUsersData = await User.findAll({
      attributes: [
        [User.sequelize.fn("DATE", User.sequelize.col("createdAt")), "date"],
        [User.sequelize.fn("COUNT", User.sequelize.col("id")), "newUsers"],
      ],
      where: newUserWhereCondition,
      group: [User.sequelize.fn("DATE", User.sequelize.col("createdAt"))],
      order: [
        [User.sequelize.fn("DATE", User.sequelize.col("createdAt")), "ASC"],
      ],
      raw: true,
    });

    // 合并数据
    const dateMap = new Map();

    // 处理活跃用户数据
    activeUsersData.forEach((item) => {
      const dateKey = new Date(item.date).toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
      dateMap.set(dateKey, {
        date: dateKey,
        activeUsers: parseInt(item.activeUsers),
        newUsers: 0,
      });
    });

    // 处理新增用户数据
    newUsersData.forEach((item) => {
      const dateKey = new Date(item.date).toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
      if (dateMap.has(dateKey)) {
        dateMap.get(dateKey).newUsers = parseInt(item.newUsers);
      } else {
        dateMap.set(dateKey, {
          date: dateKey,
          activeUsers: 0,
          newUsers: parseInt(item.newUsers),
        });
      }
    });

    const formattedData = Array.from(dateMap.values());

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("获取用户活跃度数据失败:", error);
    res.status(500).json({
      success: false,
      message: "获取用户活跃度数据失败",
      error: error.message,
    });
  }
};

// 获取最近任务列表
exports.getRecentTasks = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    // 由于任务表已分片，我们需要查询所有分片来获取最近任务
    const allTasks = [];

    try {
      // 如果是社区管理员，只查询该管理员管理的社区
      let communitiesToQuery = [];
      if (req.communityAdminId) {
        const communityIdInt = parseInt(req.communityAdminId);
        const tableExists = await databaseService.checkShardedTableExists(
          communityIdInt
        );
        if (tableExists) {
          communitiesToQuery = [{ id: communityIdInt }];
        } else {
          // 社区分表不存在，返回空数据
          return res.json({
            success: true,
            data: [],
          });
        }
      } else {
        // 超级管理员查询所有社区
        communitiesToQuery = await databaseService.getAllCommunities();
      }

      for (const community of communitiesToQuery) {
        try {
          const tableName = databaseService.getTaskTableName(community.id);
          const tableExists = await databaseService.checkShardedTableExists(
            community.id
          );

          if (tableExists) {
            // 获取最近任务
            const recentQuery = `
              SELECT t.*, 
                     p.nickname as publisher_nickname,
                     p.avatarUrl as publisher_avatarUrl
              FROM ${tableName} t
              LEFT JOIN users p ON t.publisherId = p.id
              ORDER BY t.createdAt DESC
              LIMIT ?
            `;
            const recentResult = await db.sequelize.query(recentQuery, {
              replacements: [limitNum],
              type: db.sequelize.QueryTypes.SELECT,
            });

            // 转换数据格式
            const tasks = (recentResult || []).map((task) => ({
              id: task.id,
              title: task.title,
              taskType: task.taskType,
              status: task.status,
              rewardAmount: task.rewardAmount,
              createdAt: task.createdAt,
              deadline: task.deadline,
              specifics: task.specifics,
              publisher: task.publisher_nickname
                ? {
                    id: task.publisherId,
                    nickname: task.publisher_nickname,
                    avatarUrl: task.publisher_avatarUrl,
                  }
                : null,
            }));

            allTasks.push(...tasks);
          }
        } catch (error) {
          console.error(`查询社区 ${community.id} 分表失败:`, error);
        }
      }
    } catch (error) {
      console.error("查询分片任务表失败:", error);
    }

    // 按创建时间排序并限制数量
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limitNum);

    res.json({
      success: true,
      data: recentTasks,
    });
  } catch (error) {
    console.error("获取最近任务失败:", error);
    res.status(500).json({
      success: false,
      message: "获取最近任务失败",
      error: error.message,
    });
  }
};

// 获取营业流水统计
exports.getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate, communityId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "请提供开始日期和结束日期",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 获取已完成任务的流水数据
    let completedTasks = [];

    if (communityId && communityId !== "all") {
      // 查询指定社区的分表
      try {
        const tableName = databaseService.getTaskTableName(communityId);
        const tableExists = await databaseService.checkShardedTableExists(
          communityId
        );

        if (tableExists) {
          // 使用原始SQL查询分表
          const query = `
            SELECT t.*, 
                   p.nickname as publisher_nickname,
                   a.nickname as acceptor_nickname
            FROM ${tableName} t
            LEFT JOIN users p ON t.publisherId = p.id
            LEFT JOIN users a ON t.acceptorId = a.id
            WHERE t.status IN ('publisher_confirmed', 'completed', 'done')
              AND t.paymentStatus = 'transferred'
              AND (t.remarks IS NULL OR t.remarks NOT LIKE '%__virtual%')
              AND t.createdAt BETWEEN ? AND ?
            ORDER BY t.publisherConfirmedTime DESC
          `;

          const results = await db.sequelize.query(query, {
            replacements: [start, end],
            type: db.sequelize.QueryTypes.SELECT,
          });

          // 转换数据格式
          completedTasks = (results || []).map((task) => ({
            ...task,
            publisher: task.publisher_nickname
              ? {
                  id: task.publisherId,
                  nickname: task.publisher_nickname,
                }
              : null,
            acceptor: task.acceptor_nickname
              ? {
                  id: task.acceptorId,
                  nickname: task.acceptor_nickname,
                }
              : null,
          }));
        }
      } catch (error) {
        console.error(`查询社区 ${communityId} 分表失败:`, error);
      }
    } else {
      // 查询所有社区的分表
      try {
        const allCommunities = await databaseService.getAllCommunities();
        const allTasks = [];

        for (const community of allCommunities) {
          try {
            const tableName = databaseService.getTaskTableName(community.id);
            const tableExists = await databaseService.checkShardedTableExists(
              community.id
            );

            if (tableExists) {
              // 使用原始SQL查询分表
              const query = `
                SELECT t.*, 
                       p.nickname as publisher_nickname,
                       a.nickname as acceptor_nickname
                FROM ${tableName} t
                LEFT JOIN users p ON t.publisherId = p.id
                LEFT JOIN users a ON t.acceptorId = a.id
                WHERE t.status IN ('publisher_confirmed', 'completed', 'done')
                  AND t.paymentStatus = 'transferred'
                  AND (t.remarks IS NULL OR t.remarks NOT LIKE '%__virtual%')
                  AND t.createdAt BETWEEN ? AND ?
                ORDER BY t.publisherConfirmedTime DESC
              `;

              const results = await db.sequelize.query(query, {
                replacements: [start, end],
                type: db.sequelize.QueryTypes.SELECT,
              });

              // 转换数据格式
              const tasks = (results || []).map((task) => ({
                ...task,
                publisher: task.publisher_nickname
                  ? {
                      id: task.publisherId,
                      nickname: task.publisher_nickname,
                    }
                  : null,
                acceptor: task.acceptor_nickname
                  ? {
                      id: task.acceptorId,
                      nickname: task.acceptor_nickname,
                    }
                  : null,
              }));
              allTasks.push(...tasks);
            }
          } catch (error) {
            console.error(`查询社区 ${community.id} 分表失败:`, error);
          }
        }

        completedTasks = allTasks;
      } catch (error) {
        console.error("查询所有分表失败:", error);
      }
    }

    completedTasks = completedTasks.filter(
      (task) => !isVirtualFromRemarks(task.remarks)
    );

    // 计算总流水和利润
    const totalRevenue = completedTasks.reduce(
      (sum, task) => sum + parseFloat(task.rewardAmount || 0),
      0
    );
    const totalProfit = completedTasks.reduce((sum, task) => {
      // 如果platformFee为null，则动态计算（10%）
      let platformFee = task.platformFee;
      if (!platformFee) {
        // 对于借出物品任务，需要特殊处理
        if (task.taskType === "借物品" && task.borrowMode === "lend") {
          const specifics = task.specifics || "";
          const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
          const borrowTimeMatch = specifics.match(/借用时间: (.+)/);

          if (rentMatch && borrowTimeMatch) {
            const dailyRent = parseFloat(rentMatch[1]);
            const timeRange = borrowTimeMatch[1];
            const dateMatch = timeRange.match(
              /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
            );

            if (dateMatch) {
              const startDate = new Date(dateMatch[1]);
              const endDate = new Date(dateMatch[2]);
              const diffTime = Math.abs(endDate - startDate);
              const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const totalRent = dailyRent * days;
              platformFee = totalRent * 0.1;
            }
          }
        }
        if (!platformFee) {
          platformFee = parseFloat(task.rewardAmount || 0) * 0.1;
        }
      }
      return sum + parseFloat(platformFee);
    }, 0);
    const totalAcceptorFee = completedTasks.reduce((sum, task) => {
      // 如果acceptorFee为null，则动态计算（90%）
      let acceptorFee = task.acceptorFee;
      if (!acceptorFee) {
        // 对于借出物品任务，需要特殊处理
        if (task.taskType === "借物品" && task.borrowMode === "lend") {
          const specifics = task.specifics || "";
          const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
          const borrowTimeMatch = specifics.match(/借用时间: (.+)/);

          if (rentMatch && borrowTimeMatch) {
            const dailyRent = parseFloat(rentMatch[1]);
            const timeRange = borrowTimeMatch[1];
            const dateMatch = timeRange.match(
              /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
            );

            if (dateMatch) {
              const startDate = new Date(dateMatch[1]);
              const endDate = new Date(dateMatch[2]);
              const diffTime = Math.abs(endDate - startDate);
              const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const totalRent = dailyRent * days;
              acceptorFee = totalRent * 0.9;
            }
          }
        }
        if (!acceptorFee) {
          acceptorFee = parseFloat(task.rewardAmount || 0) * 0.9;
        }
      }
      return sum + parseFloat(acceptorFee);
    }, 0);

    // 按任务类型统计
    const taskTypeStats = {};
    completedTasks.forEach((task) => {
      const type = task.taskType;
      if (!taskTypeStats[type]) {
        taskTypeStats[type] = {
          count: 0,
          revenue: 0,
          profit: 0,
        };
      }
      taskTypeStats[type].count++;
      taskTypeStats[type].revenue += parseFloat(task.rewardAmount || 0);
      // 如果platformFee为null，则动态计算（10%）
      let platformFee = task.platformFee;
      if (!platformFee) {
        // 对于借出物品任务，需要特殊处理
        if (task.taskType === "借物品" && task.borrowMode === "lend") {
          const specifics = task.specifics || "";
          const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
          const borrowTimeMatch = specifics.match(/借用时间: (.+)/);

          if (rentMatch && borrowTimeMatch) {
            const dailyRent = parseFloat(rentMatch[1]);
            const timeRange = borrowTimeMatch[1];
            const dateMatch = timeRange.match(
              /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
            );

            if (dateMatch) {
              const startDate = new Date(dateMatch[1]);
              const endDate = new Date(dateMatch[2]);
              const diffTime = Math.abs(endDate - startDate);
              const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const totalRent = dailyRent * days;
              platformFee = totalRent * 0.1;
            }
          }
        }
        if (!platformFee) {
          platformFee = parseFloat(task.rewardAmount || 0) * 0.1;
        }
      }
      taskTypeStats[type].profit += parseFloat(platformFee);
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalProfit: totalProfit.toFixed(2),
          totalAcceptorFee: totalAcceptorFee.toFixed(2),
          taskCount: completedTasks.length,
        },
        taskTypeStats,
        transactions: completedTasks.map((task) => {
          // 计算正确的费用信息
          let platformFee = task.platformFee;
          let acceptorFee = task.acceptorFee;

          if (!platformFee || !acceptorFee) {
            // 对于借出物品任务，需要特殊处理
            if (task.taskType === "借物品" && task.borrowMode === "lend") {
              const specifics = task.specifics || "";
              const rentMatch = specifics.match(
                /日租金[：:]\s*(\d+(?:\.\d+)?)元/
              );
              const borrowTimeMatch = specifics.match(/借用时间: (.+)/);

              if (rentMatch && borrowTimeMatch) {
                const dailyRent = parseFloat(rentMatch[1]);
                const timeRange = borrowTimeMatch[1];
                const dateMatch = timeRange.match(
                  /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
                );

                if (dateMatch) {
                  const startDate = new Date(dateMatch[1]);
                  const endDate = new Date(dateMatch[2]);
                  const diffTime = Math.abs(endDate - startDate);
                  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  const totalRent = dailyRent * days;
                  platformFee = platformFee || totalRent * 0.1;
                  acceptorFee = acceptorFee || totalRent * 0.9;
                }
              }
            }

            if (!platformFee) {
              platformFee = parseFloat(task.rewardAmount || 0) * 0.1;
            }
            if (!acceptorFee) {
              acceptorFee = parseFloat(task.rewardAmount || 0) * 0.9;
            }
          }

          return {
            ...task,
            platformFee: parseFloat(platformFee || 0).toFixed(2),
            acceptorFee: parseFloat(acceptorFee || 0).toFixed(2),
          };
        }),
      },
    });
  } catch (error) {
    console.error("获取营业流水统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取营业流水统计失败",
      error: error.message,
    });
  }
};

// 获取利润趋势数据
exports.getProfitTrend = async (req, res) => {
  try {
    const { startDate, endDate, communityId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "请提供开始日期和结束日期",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 由于任务表已分片，我们需要查询所有分片来获取利润趋势
    const dateMap = new Map();

    try {
      // 根据 communityId 参数决定查询范围
      let communitiesToQuery = [];
      if (communityId && communityId !== "all" && communityId !== "") {
        // 如果指定了社区ID，只查询该社区
        const communityIdInt = parseInt(communityId);
        // 检查分表是否存在
        const tableExists = await databaseService.checkShardedTableExists(
          communityIdInt
        );
        if (tableExists) {
          communitiesToQuery = [{ id: communityIdInt }];
        } else {
          // 社区分表不存在，返回空数据
          return res.json({
            success: true,
            data: [],
          });
        }
      } else {
        // 如果没有指定社区ID，查询所有社区
        communitiesToQuery = await databaseService.getAllCommunities();
      }

      for (const community of communitiesToQuery) {
        try {
          const tableName = databaseService.getTaskTableName(community.id);
          const tableExists = await databaseService.checkShardedTableExists(
            community.id
          );

          if (tableExists) {
            // 按日期分组统计利润
            const profitQuery = `
              SELECT DATE(publisherConfirmedTime) as date,
                     SUM(rewardAmount) as totalRevenue,
                     SUM(platformFee) as totalProfit,
                     COUNT(*) as taskCount
              FROM ${tableName}
              WHERE status IN ('publisher_confirmed', 'completed', 'done')
                AND paymentStatus = 'transferred'
                AND (remarks IS NULL OR remarks NOT LIKE '%__virtual%')
                AND publisherConfirmedTime BETWEEN ? AND ?
              GROUP BY DATE(publisherConfirmedTime)
              ORDER BY DATE(publisherConfirmedTime) ASC
            `;
            const profitResult = await db.sequelize.query(profitQuery, {
              replacements: [start, end],
              type: db.sequelize.QueryTypes.SELECT,
            });

            // 合并数据
            profitResult.forEach((item) => {
              const dateKey = new Date(item.date).toLocaleDateString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
              });
              if (dateMap.has(dateKey)) {
                const existing = dateMap.get(dateKey);
                dateMap.set(dateKey, {
                  date: dateKey,
                  totalRevenue:
                    parseFloat(existing.totalRevenue) +
                    parseFloat(item.totalRevenue || 0),
                  totalProfit:
                    parseFloat(existing.totalProfit) +
                    parseFloat(item.totalProfit || 0),
                  taskCount: existing.taskCount + parseInt(item.taskCount || 0),
                });
              } else {
                dateMap.set(dateKey, {
                  date: dateKey,
                  totalRevenue: parseFloat(item.totalRevenue || 0),
                  totalProfit: parseFloat(item.totalProfit || 0),
                  taskCount: parseInt(item.taskCount || 0),
                });
              }
            });
          }
        } catch (error) {
          console.error(`查询社区 ${community.id} 分表失败:`, error);
        }
      }
    } catch (error) {
      console.error("查询分片任务表失败:", error);
    }

    // 格式化数据
    const formattedData = Array.from(dateMap.values()).map((item) => ({
      date: item.date,
      totalRevenue: item.totalRevenue.toFixed(2),
      totalProfit: item.totalProfit.toFixed(2),
      taskCount: item.taskCount,
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("获取利润趋势数据失败:", error);
    res.status(500).json({
      success: false,
      message: "获取利润趋势数据失败",
      error: error.message,
    });
  }
};
