const db = require("../models");
const Community = db.Community;
const Task = db.Task;
const User = db.User;
const { Op } = require("sequelize");
const autoShardingService = require("../services/autoShardingService");

/**
 * 获取社区列表（管理员用）
 */
exports.getCommunitiesList = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      province,
      city,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 搜索条件
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { province: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (province) {
      where.province = province;
    }

    if (city) {
      where.city = city;
    }

    const { count, rows } = await Community.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
    });

    // 由于任务表已分片，需要手动计算每个社区的任务数量
    const communitiesWithStats = await Promise.all(
      rows.map(async (community) => {
        const communityData = community.toJSON();
        let taskCount = 0;

        try {
          // 查询该社区的分片任务表
          const tableName = `tasks_community_${community.id}`;

          // 先检查表是否存在
          const tableExistsQuery = `
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = '${tableName}'
          `;
          const tableExistsResult = await db.sequelize.query(tableExistsQuery, {
            type: db.sequelize.QueryTypes.SELECT,
          });

          if (parseInt(tableExistsResult[0]?.count || 0) > 0) {
            const taskCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
            const result = await db.sequelize.query(taskCountQuery, {
              type: db.sequelize.QueryTypes.SELECT,
            });
            taskCount = parseInt(result[0]?.count || 0);
          } else {
            console.log(
              `社区 ${community.id} 的分片表 ${tableName} 不存在，任务数量为0`
            );
            taskCount = 0;
          }
        } catch (error) {
          console.error(`查询社区 ${community.id} 任务数量失败:`, error);
          taskCount = 0;
        }

        // 获取管理员信息
        let adminInfo = null;
        const adminUser = await User.findOne({
          where: {
            communityAdminId: community.id,
            role: "community_admin",
          },
          attributes: ["id", "nickname"],
        });
        if (adminUser) {
          adminInfo = {
            id: adminUser.id,
            nickname: adminUser.nickname,
          };
        }

        return {
          ...communityData,
          userCount: 0, // 用户不绑定社区，所以用户数始终为0
          taskCount: taskCount,
          admin: adminInfo, // 添加管理员信息
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        communities: communitiesWithStats,
        total: count,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建新社区
 */
exports.createCommunity = async (req, res, next) => {
  try {
    const {
      name,
      type = "community",
      province,
      city,
      district,
      address,
      latitude,
      longitude,
    } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "社区名称不能为空",
      });
    }

    // 检查社区名称是否已存在
    const existingCommunity = await Community.findOne({
      where: { name },
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "社区名称已存在",
      });
    }

    const community = await Community.create({
      name,
      type,
      province,
      city,
      district,
      address,
      latitude,
      longitude,
    });

    // 自动为新社区创建所有分表（任务、校园互动、二手市集）
    try {
      const tablesCreated =
        await autoShardingService.createAllTablesForCommunity(
          community.id,
          community.name
        );

      if (tablesCreated) {
        console.log(
          `✅ 社区 ${community.name}(${community.id}) 的所有分表创建成功（任务、校园互动、二手市集）`
        );
      } else {
        console.warn(
          `⚠️  社区 ${community.name}(${community.id}) 的部分分表创建失败`
        );
      }
    } catch (shardingError) {
      console.error("自动分表创建失败:", shardingError.message);
      // 不影响社区创建，只记录错误
    }

    res.status(201).json({
      success: true,
      message: "社区创建成功",
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新社区信息
 */
exports.updateCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      province,
      city,
      district,
      address,
      latitude,
      longitude,
    } = req.body;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 如果要更新名称，检查是否重复
    if (name && name !== community.name) {
      const existingCommunity = await Community.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });

      if (existingCommunity) {
        return res.status(400).json({
          success: false,
          message: "社区名称已存在",
        });
      }
    }

    await community.update({
      name: name !== undefined ? name : community.name,
      type: type !== undefined ? type : community.type,
      province: province !== undefined ? province : community.province,
      city: city !== undefined ? city : community.city,
      district: district !== undefined ? district : community.district,
      address: address !== undefined ? address : community.address,
      latitude: latitude !== undefined ? latitude : community.latitude,
      longitude: longitude !== undefined ? longitude : community.longitude,
    });

    res.status(200).json({
      success: true,
      message: "社区更新成功",
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除社区
 */
exports.deleteCommunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 注意：用户不与社区直接关联，只检查任务关联

    // 检查是否有关联的任务（查询分片表）
    let taskCount = 0;
    try {
      const tableName = `tasks_community_${id}`;

      // 先检查表是否存在
      const tableExistsQuery = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = '${tableName}'
      `;
      const tableExistsResult = await db.sequelize.query(tableExistsQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });

      if (parseInt(tableExistsResult[0]?.count || 0) > 0) {
        const taskCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
        const result = await db.sequelize.query(taskCountQuery, {
          type: db.sequelize.QueryTypes.SELECT,
        });
        taskCount = parseInt(result[0]?.count || 0);
      } else {
        console.log(`社区 ${id} 的分片表 ${tableName} 不存在，任务数量为0`);
        taskCount = 0;
      }
    } catch (error) {
      console.error(`查询社区 ${id} 任务数量失败:`, error);
      taskCount = 0;
    }

    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: `无法删除社区，还有 ${taskCount} 个任务关联到此社区`,
      });
    }

    await community.destroy();

    // 自动删除对应的所有分表（任务、校园互动、二手市集）
    try {
      const tablesDeleted =
        await autoShardingService.deleteAllTablesForCommunity(
          id,
          community.name
        );

      if (tablesDeleted) {
        console.log(
          `✅ 社区 ${community.name}(${id}) 的所有分表删除成功（任务、校园互动、二手市集）`
        );
      } else {
        console.warn(`⚠️  社区 ${community.name}(${id}) 的部分分表删除失败`);
      }
    } catch (shardingError) {
      console.error("自动分表删除失败:", shardingError.message);
      // 不影响社区删除，只记录错误
    }

    res.status(200).json({
      success: true,
      message: "社区删除成功",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区详情（包含统计数据）
 */
exports.getCommunityDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 获取该社区的任务统计（查询分片表）
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    try {
      const tableName = `tasks_community_${id}`;

      // 总任务数
      const totalQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      const totalResult = await db.sequelize.query(totalQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      totalTasks = parseInt(totalResult[0]?.count || 0);

      // 已完成任务数
      const completedQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE status = 'completed'`;
      const completedResult = await db.sequelize.query(completedQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      completedTasks = parseInt(completedResult[0]?.count || 0);

      // 待处理任务数
      const pendingQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE status = 'pending'`;
      const pendingResult = await db.sequelize.query(pendingQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      pendingTasks = parseInt(pendingResult[0]?.count || 0);

      // 进行中任务数
      const inProgressQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE status = 'in_progress'`;
      const inProgressResult = await db.sequelize.query(inProgressQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      inProgressTasks = parseInt(inProgressResult[0]?.count || 0);
    } catch (error) {
      console.error(`查询社区 ${id} 任务统计失败:`, error);
    }

    // 统计信息
    const stats = {
      totalUsers: 0, // 用户不绑定社区
      totalTasks,
      activeUsers: 0, // 用户不绑定社区
      completedTasks,
      pendingTasks,
      inProgressTasks,
    };

    // 按类型统计任务（查询分片表）
    let taskTypeStats = [];
    try {
      const tableName = `tasks_community_${id}`;
      const taskTypeQuery = `
        SELECT taskType, COUNT(*) as count 
        FROM ${tableName} 
        GROUP BY taskType
      `;
      const taskTypeResult = await db.sequelize.query(taskTypeQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      taskTypeStats = taskTypeResult;
    } catch (error) {
      console.error(`查询社区 ${id} 任务类型统计失败:`, error);
    }

    // 用户不绑定社区，所以用户角色统计为空
    const userRoleStats = {};

    res.status(200).json({
      success: true,
      data: {
        community,
        stats,
        taskTypeStats,
        userRoleStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区统计数据
 */
exports.getCommunityStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // 构建时间过滤条件
    const timeFilter = {};
    if (startDate && endDate) {
      timeFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 用户统计（用户不绑定社区，返回空数据）
    const userStats = [];

    // 任务统计（查询分片表）
    let taskStats = [];
    let taskCompletionStats = [];

    try {
      const tableName = `tasks_community_${id}`;

      // 构建时间过滤条件
      let timeCondition = "";
      if (startDate && endDate) {
        timeCondition = `AND createdAt BETWEEN '${startDate}' AND '${endDate}'`;
      }

      // 按日期统计任务数量
      const taskStatsQuery = `
        SELECT DATE(createdAt) as date, COUNT(*) as count 
        FROM ${tableName} 
        WHERE 1=1 ${timeCondition}
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt) ASC
      `;
      const taskStatsResult = await db.sequelize.query(taskStatsQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      taskStats = taskStatsResult;

      // 按状态统计任务数量
      const taskCompletionQuery = `
        SELECT status, COUNT(*) as count 
        FROM ${tableName} 
        WHERE 1=1 ${timeCondition}
        GROUP BY status
      `;
      const taskCompletionResult = await db.sequelize.query(
        taskCompletionQuery,
        {
          type: db.sequelize.QueryTypes.SELECT,
        }
      );
      taskCompletionStats = taskCompletionResult;
    } catch (error) {
      console.error(`查询社区 ${id} 任务统计失败:`, error);
    }

    res.status(200).json({
      success: true,
      data: {
        community: {
          id: community.id,
          name: community.name,
          type: community.type,
        },
        userStats,
        taskStats,
        taskCompletionStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 批量操作社区
 */
exports.batchOperationCommunities = async (req, res, next) => {
  try {
    const { action, communityIds } = req.body;

    if (
      !communityIds ||
      !Array.isArray(communityIds) ||
      communityIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "请选择要操作的社区",
      });
    }

    let result;

    switch (action) {
      case "delete":
        // 检查是否有关联数据
        const userCount = await User.count({
          where: { communityId: { [Op.in]: communityIds } },
        });

        // 检查任务关联（查询分片表）
        let taskCount = 0;
        try {
          for (const communityId of communityIds) {
            const tableName = `tasks_${communityId}`;
            const taskCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
            const result = await db.sequelize.query(taskCountQuery, {
              type: db.sequelize.QueryTypes.SELECT,
            });
            taskCount += parseInt(result[0]?.count || 0);
          }
        } catch (error) {
          console.error("查询社区任务数量失败:", error);
        }

        if (userCount > 0 || taskCount > 0) {
          return res.status(400).json({
            success: false,
            message: `无法删除选中的社区，还有 ${userCount} 个用户和 ${taskCount} 个任务关联`,
          });
        }

        result = await Community.destroy({
          where: { id: { [Op.in]: communityIds } },
        });

        res.status(200).json({
          success: true,
          message: `成功删除 ${result} 个社区`,
        });
        break;

      case "updateType":
        const { type } = req.body;
        if (!type) {
          return res.status(400).json({
            success: false,
            message: "请指定要更新的类型",
          });
        }

        result = await Community.update(
          { type },
          { where: { id: { [Op.in]: communityIds } } }
        );

        res.status(200).json({
          success: true,
          message: `成功更新 ${result[0]} 个社区的类型`,
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: "不支持的操作类型",
        });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区下拉选项（用于其他模块选择）
 */
exports.getCommunityOptions = async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    const communities = await Community.findAll({
      where,
      attributes: ["id", "name", "type", "province", "city"],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: communities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 初始化所有社区的分表
 */
exports.initializeShardingTables = async (req, res, next) => {
  try {
    const result = await autoShardingService.initializeAllCommunityTables();

    res.json({
      success: result.success,
      message: result.success ? "分表初始化完成" : "分表初始化失败",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 检查分表健康状态
 */
exports.checkShardingHealth = async (req, res, next) => {
  try {
    const healthReport = await autoShardingService.checkShardingHealth();

    res.json({
      success: true,
      message: "分表健康检查完成",
      data: healthReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有分表信息
 */
exports.getShardingTables = async (req, res, next) => {
  try {
    const tableInfo = await autoShardingService.getAllShardingTables();

    res.json({
      success: true,
      message: "获取分表信息成功",
      data: tableInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区管理员企业微信二维码
 */
exports.getCommunityAdminQR = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "社区ID不能为空",
      });
    }

    // 查找社区信息
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 返回社区管理员二维码信息
    res.json({
      success: true,
      data: {
        communityId: community.id,
        communityName: community.name,
        qrCodeUrl: community.adminQRCode || null,
        adminName: community.adminName || null,
        adminPhone: community.adminPhone || null,
      },
    });
  } catch (error) {
    console.error("获取社区管理员二维码失败:", error);
    next(error);
  }
};

/**
 * 更新社区管理员企业微信二维码
 */
exports.updateCommunityAdminQR = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { qrCodeUrl, adminName, adminPhone } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "社区ID不能为空",
      });
    }

    // 查找社区信息
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 更新社区管理员信息
    const updateData = {};
    if (qrCodeUrl !== undefined) updateData.adminQRCode = qrCodeUrl;
    if (adminName !== undefined) updateData.adminName = adminName;
    if (adminPhone !== undefined) updateData.adminPhone = adminPhone;

    await community.update(updateData);

    res.json({
      success: true,
      message: "社区管理员信息更新成功",
      data: {
        communityId: community.id,
        communityName: community.name,
        qrCodeUrl: community.adminQRCode,
        adminName: community.adminName,
        adminPhone: community.adminPhone,
      },
    });
  } catch (error) {
    console.error("更新社区管理员二维码失败:", error);
    next(error);
  }
};

/**
 * 添加社区管理员（从已有用户中选择）
 */
exports.addCommunityAdmin = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;

    if (!communityId || !userId) {
      return res.status(400).json({
        success: false,
        message: "社区ID和用户ID不能为空",
      });
    }

    // 检查社区是否存在
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 检查该用户是否已经是其他社区的管理员
    if (user.communityAdminId && user.communityAdminId !== parseInt(communityId)) {
      return res.status(400).json({
        success: false,
        message: "该用户已经是其他社区的管理员",
      });
    }

    // 如果用户已经有密码，检查密码是否存在
    let hashedPassword = user.password;
    if (!hashedPassword) {
      // 如果没有密码，使用bcrypt设置初始密码
      const bcrypt = require("bcryptjs");
      const defaultPassword = "123456";
      hashedPassword = await bcrypt.hash(defaultPassword, 10);
    }

    // 更新用户信息：设置角色为community_admin、社区管理权限、密码
    await user.update({
      role: "community_admin",
      communityAdminId: parseInt(communityId),
      password: hashedPassword, // 如果已有密码则保持，否则设置为123456的哈希
    });

    res.json({
      success: true,
      message: user.password ? "社区管理员添加成功" : "社区管理员添加成功，初始密码为123456",
      data: {
        communityId: community.id,
        communityName: community.name,
        adminUserId: userId,
        adminNickname: user.nickname,
      },
    });
  } catch (error) {
    console.error("添加社区管理员失败:", error);
    next(error);
  }
};

/**
 * 删除社区管理员
 */
exports.removeCommunityAdmin = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "社区ID不能为空",
      });
    }

    // 查找该社区的管理员
    const adminUser = await User.findOne({
      where: {
        communityAdminId: parseInt(communityId),
        role: "community_admin",
      },
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "该社区没有管理员",
      });
    }

    // 移除用户的社区管理权限，角色改回user
    await adminUser.update({
      role: "user",
      communityAdminId: null,
      // 保留密码，不删除
    });

    const community = await Community.findByPk(communityId);

    res.json({
      success: true,
      message: "社区管理员已移除",
      data: {
        communityId: community?.id,
        communityName: community?.name,
      },
    });
  } catch (error) {
    console.error("删除社区管理员失败:", error);
    next(error);
  }
};

/**
 * 获取社区管理员信息
 */
exports.getCommunityAdmin = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "社区ID不能为空",
      });
    }

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 查找该社区的管理员
    const adminUser = await User.findOne({
      where: {
        communityAdminId: parseInt(communityId),
        role: "community_admin",
      },
      attributes: ["id", "nickname", "email", "phoneNumber"],
    });

    res.json({
      success: true,
      data: {
        communityId: community.id,
        communityName: community.name,
        admin: adminUser ? adminUser.toJSON() : null,
      },
    });
  } catch (error) {
    console.error("获取社区管理员信息失败:", error);
    next(error);
  }
};