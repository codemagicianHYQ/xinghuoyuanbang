const db = require("../models");
const Task = db.Task;
const User = db.User; // If you need publisher/acceptor details
const { Op } = require("sequelize");
const WalletService = require("../services/walletService");
const WechatPayService = require("../services/wechatPayService");
const wechatNotificationService = require("../services/wechatNotificationService");
const TeamMember = db.TeamMember;
const Chat = db.Chat;
const cacheService = require("../services/cacheService");
const databaseService = require("../services/databaseService");
// 移除 nullHandler 依赖

// 计算平台费用和接单员费用
const calculateFees = (rewardAmount, task = null) => {
  let amount = parseFloat(rewardAmount);

  // 如果是借出物品任务，需要从specifics中解析实际租金收入
  if (task && task.taskType === "借物品" && task.borrowMode === "lend") {
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
        amount = dailyRent * days; // 实际租金收入
      }
    }
  }

  const platformFee = (amount * 0.1).toFixed(2); // 平台抽成10%
  const acceptorFee = (amount * 0.9).toFixed(2); // 接单员获得90%
  return {
    platformFee: parseFloat(platformFee),
    acceptorFee: parseFloat(acceptorFee),
  };
};

const DEFAULT_AVATAR_URL = "/static/images/default-avatar.png";

const setNoCacheHeaders = (res) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  res.set("ETag", `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
};

const getVirtualFilter = (mode, alias = "t") => {
  const pattern = '%"__virtual":true%';
  const markerCondition = `${alias}.borrowMode = 'virtual'`;
  const fallbackCondition = `(( ${alias}.acceptorId IS NULL OR ${alias}.acceptorId = '' ) AND ${alias}.status IN ('assigned', 'publisher_confirmed', 'completed') AND ${alias}.paymentStatus IN ('paid', 'transferred'))`;

  if (mode === "virtual") {
    return {
      clause: ` AND (${markerCondition} OR ${alias}.remarks LIKE ? OR ${fallbackCondition})`,
      values: [pattern],
    };
  }
  if (mode === "real") {
    return {
      clause: ` AND (( ${alias}.borrowMode IS NULL OR ${alias}.borrowMode <> 'virtual' ) AND (${alias}.remarks IS NULL OR ${alias}.remarks NOT LIKE ?) AND NOT ${fallbackCondition})`,
      values: [pattern],
    };
  }
  return null;
};

const sanitizeVirtualProfile = (profile = {}, roleLabel = "用户") => {
  const nickname =
    typeof profile.nickname === "string" && profile.nickname.trim() !== ""
      ? profile.nickname.trim()
      : `虚拟${roleLabel}${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`;

  const avatarUrl =
    typeof profile.avatarUrl === "string" && profile.avatarUrl.trim() !== ""
      ? profile.avatarUrl.trim()
      : DEFAULT_AVATAR_URL;

  return {
    nickname,
    avatarUrl,
  };
};

const serializeVirtualRemarks = (
  baseRemarkText,
  publisherProfile,
  acceptorProfile
) => {
  const remarkText =
    typeof baseRemarkText === "string" ? baseRemarkText.trim() : "";

  return JSON.stringify({
    __virtual: true,
    text: remarkText,
    publisher: publisherProfile,
    acceptor: acceptorProfile,
  });
};

const parseVirtualRemarks = (rawRemarks) => {
  if (!rawRemarks) {
    return {
      text: "",
      virtualProfile: null,
    };
  }

  if (typeof rawRemarks === "string") {
    try {
      const parsed = JSON.parse(rawRemarks);
      if (parsed && parsed.__virtual) {
        return {
          text: typeof parsed.text === "string" ? parsed.text : "",
          virtualProfile: {
            publisher: parsed.publisher || null,
            acceptor: parsed.acceptor || null,
          },
        };
      }
    } catch (error) {
      // ignore JSON parse errors and use raw string
    }

    return {
      text: rawRemarks,
      virtualProfile: null,
    };
  }

  return {
    text: String(rawRemarks),
    virtualProfile: null,
  };
};

const formatTaskRow = (taskRow) => {
  if (!taskRow) {
    return null;
  }

  const { text: parsedRemarks, virtualProfile } = parseVirtualRemarks(
    taskRow.remarks
  );

  const hasVirtualMarker =
    taskRow.borrowMode === "virtual" ||
    (typeof taskRow.remarks === "string" &&
      taskRow.remarks.includes('"__virtual":true'));

  const fallbackVirtual =
    (!taskRow.acceptorId || taskRow.acceptorId === "") &&
    ["assigned", "publisher_confirmed", "completed"].includes(taskRow.status) &&
    ["paid", "transferred"].includes(taskRow.paymentStatus);

  const formattedTask = {
    ...taskRow,
    images: parseImagesField(taskRow.images),
    remarks: parsedRemarks,
    virtualProfile,
    isVirtualOrder:
      Boolean(virtualProfile) || hasVirtualMarker || Boolean(fallbackVirtual),
  };

  if (virtualProfile && virtualProfile.publisher) {
    formattedTask.publisher = {
      id: taskRow.publisherId,
      nickname: virtualProfile.publisher.nickname,
      avatarUrl: virtualProfile.publisher.avatarUrl,
    };
  } else if (taskRow.publisher_nickname) {
    formattedTask.publisher = {
      id: taskRow.publisherId,
      nickname: taskRow.publisher_nickname,
      avatarUrl: taskRow.publisher_avatarUrl,
    };
  } else {
    formattedTask.publisher = null;
  }

  if (virtualProfile && virtualProfile.acceptor) {
    formattedTask.acceptor = {
      id: taskRow.acceptorId,
      nickname: virtualProfile.acceptor.nickname,
      avatarUrl: virtualProfile.acceptor.avatarUrl,
    };
  } else if (taskRow.acceptor_nickname) {
    formattedTask.acceptor = {
      id: taskRow.acceptorId,
      nickname: taskRow.acceptor_nickname,
      avatarUrl: taskRow.acceptor_avatarUrl,
    };
  } else {
    formattedTask.acceptor = null;
  }

  return formattedTask;
};

const parseImagesField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item) => typeof item === "string" && item.trim() !== ""
    );
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => typeof item === "string" && item.trim() !== ""
        );
      }
      return [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const buildVirtualSpecifics = (taskType, payload = {}) => {
  const only = "[仅发布者和接单员可见]";
  const lines = [];

  const description = payload.description?.trim();
  const location = payload.locationText?.trim();
  const deliveryAddress = payload.deliveryAddress?.trim();
  const courierPlatform = payload.courierPlatform?.trim();
  const pickupCode = payload.pickupCode?.trim();
  const takeoutPlatform = payload.takeoutPlatform?.trim();
  const takeoutOrderInfo = payload.takeoutOrderInfo?.trim();

  if (description) {
    lines.push(description);
  }

  if (taskType === "express") {
    if (courierPlatform) {
      lines.push(`快递平台: ${courierPlatform}`);
    }
    if (pickupCode) {
      lines.push(`取件码/手机号: ${pickupCode}`);
    } else {
      lines.push(`取件码/手机号: ${only}`);
    }
    if (location) {
      lines.push(`取件地点: ${location}`);
    }
    if (deliveryAddress) {
      lines.push(`送达地址: ${deliveryAddress}`);
    }
    lines.push(`联系方式: ${only}`);
    return lines.join("\n");
  }

  if (taskType === "tea_coffee") {
    if (takeoutPlatform) {
      lines.push(`外卖平台及取货点: ${takeoutPlatform}`);
    }
    if (deliveryAddress) {
      lines.push(`送达地址: ${deliveryAddress}`);
    }
    if (takeoutOrderInfo) {
      lines.push(`外卖信息/取餐号: ${takeoutOrderInfo}`);
    } else {
      lines.push(`外卖信息/取餐号: ${only}`);
    }
    lines.push(`联系方式: ${only}`);
    return lines.join("\n");
  }

  lines.push("该虚拟任务暂不支持此类型，请选择代取快递或取外卖。");
  return lines.join("\n");
};

// 打款给接单员（模拟函数，实际需要对接支付系统）
const transferToAcceptor = async (task) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log(`[transferToAcceptor] 开始处理任务 ${task.id} 的资金分配`);

    // 获取接单员信息
    const acceptor = await User.findByPk(task.acceptorId, { transaction });
    if (!acceptor) {
      throw new Error("接单员不存在");
    }

    // 计算接单员收入（90%）
    const riderAmount = parseFloat(task.acceptorFee || 0);
    const platformFee = parseFloat(task.platformFee || 0);

    console.log(
      `[transferToAcceptor] 任务 ${task.id} 资金分配: 接单员收入=${riderAmount}元, 平台费用=${platformFee}元`
    );

    // 尝试真正的微信支付转账
    let wechatTransferResult = null;
    try {
      const wechatPay = WechatPayService;

      // 生成商户订单号
      const partnerTradeNo = `TASK_${task.id}_${Date.now()}`;

      // 调用微信企业付款到零钱
      wechatTransferResult = await wechatPay.transferToBalance({
        openid: acceptor.openid,
        amount: Math.round(riderAmount * 100), // 转换为分
        desc: `任务完成奖励 - ${task.title}`,
        partnerTradeNo: partnerTradeNo,
      });

      console.log(
        `[transferToAcceptor] 微信支付转账成功: ${JSON.stringify(
          wechatTransferResult
        )}`
      );
    } catch (wechatError) {
      console.error(
        `[transferToAcceptor] 微信支付转账失败: ${wechatError.message}`
      );

      // 如果微信支付失败，回退到余额增加模式
      console.log("[transferToAcceptor] 回退到余额增加模式");

      const acceptorBalanceBefore = parseFloat(acceptor.walletBalance);
      const acceptorBalanceAfter = acceptorBalanceBefore + riderAmount;

      await acceptor.update(
        {
          walletBalance: acceptorBalanceAfter,
          totalEarnings: parseFloat(acceptor.totalEarnings) + riderAmount,
        },
        { transaction }
      );

      wechatTransferResult = {
        success: false,
        fallback: true,
        message: "微信支付失败，已增加到余额",
      };
    }

    // 更新分片表中的任务状态
    const taskTableName = `tasks_community_${task.communityId}`;
    await db.sequelize.query(
      `UPDATE ${taskTableName} SET transferTime = ?, paymentStatus = ?, platformFee = ?, acceptorFee = ? WHERE id = ?`,
      {
        replacements: [
          new Date(),
          "transferred",
          platformFee,
          riderAmount,
          task.id,
        ],
        type: db.sequelize.QueryTypes.UPDATE,
        transaction: transaction,
      }
    );

    await transaction.commit();

    console.log(
      `[transferToAcceptor] 任务 ${task.id} 资金分配完成: 接单员收入${riderAmount}元, 平台费用${platformFee}元`
    );

    return {
      success: true,
      wechatTransfer: wechatTransferResult,
      platformFee,
      riderAmount,
    };
  } catch (error) {
    await transaction.rollback();
    console.error(`[transferToAcceptor] 任务 ${task.id} 打款失败:`, error);
    throw error;
  }
};

// Public: Get all tasks with pagination and filtering (for Uni-app)
exports.getAllTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      taskType = "",
      status = "", // 修改：默认不限制状态，返回所有任务
      sortBy = "createdAt",
      sortOrder = "DESC",
      startDate = "", // 兼容旧参数
      completedStartDate = "", // 新增：已完成订单的开始日期参数
      version = "campus", // 新增：版本筛选，默认为校园版
      communityId = "", // 新增：社区ID筛选
    } = req.query;
    const offset = (page - 1) * limit;

    // 白名单验证 sortBy 和 sortOrder 防止SQL注入
    const allowedSortFields = [
      "createdAt",
      "deadline",
      "rewardAmount",
      "status",
      "updatedAt",
    ];
    const allowedSortOrders = ["ASC", "DESC"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    let whereCondition = {
      version: version, // 添加版本筛选
    };

    // 添加社区ID筛选
    if (communityId && communityId !== "") {
      whereCondition.communityId = parseInt(communityId);
    }

    // 新的逻辑：保留所有待接单和进行中的订单，已完成的订单只保留指定天数内的
    let filterDate = null;
    if (completedStartDate) {
      filterDate = new Date(completedStartDate + "T00:00:00.000Z");

      // 使用Op.or来组合条件：
      // 1. 所有非完成状态的订单（open, assigned, in_progress等）
      // 2. 已完成状态但完成时间在指定日期之后的订单（只基于publisherConfirmedTime，且不为null）
      const baseCondition = { ...whereCondition }; // 保存基础条件（包括communityId）
      whereCondition = {
        ...baseCondition,
        [Op.or]: [
          // 非完成状态的订单（排除已取消的）
          {
            status: {
              [Op.and]: [
                { [Op.notIn]: ["completed", "finished"] },
                { [Op.ne]: "cancelled" },
              ],
            },
          },
          // 已完成状态但完成时间在指定日期之后的订单（只使用publisherConfirmedTime，且不为null）
          {
            status: {
              [Op.in]: ["completed", "finished", "publisher_confirmed"],
            },
            publisherConfirmedTime: {
              [Op.and]: [{ [Op.gte]: filterDate }, { [Op.ne]: null }],
            },
          },
        ],
      };
    } else {
      // 兼容旧逻辑：默认过滤掉已取消的订单，除非明确指定要查看取消的订单
      if (status && status !== "") {
        // 只有当明确指定状态时才过滤
        whereCondition.status = status;
      } else {
        // 默认不显示已取消的订单
        whereCondition.status = { [Op.ne]: "cancelled" };
      }
    }

    // 兼容旧逻辑：按日期范围过滤（最近10天）
    if (startDate && !completedStartDate) {
      whereCondition.createdAt = {
        [Op.gte]: new Date(startDate + "T00:00:00.000Z"),
      };
    }

    if (search) {
      whereCondition.title = { [Op.like]: `%${search}%` };
    }
    if (taskType) {
      whereCondition.taskType = taskType;
    } else {
      // 如果没有指定taskType，则过滤掉"找搭子"任务，因为它们在专门的页面显示
      whereCondition.taskType = { [Op.ne]: "找搭子" };
    }

    const order = [[sortBy, sortOrder.toUpperCase()]];

    // 如果指定了社区ID，使用分表查询
    let count, rows;
    if (communityId && communityId !== "") {
      const tableName = `tasks_community_${communityId}`;

      // 构建SQL查询条件
      let whereClause = "WHERE 1=1";
      const whereParams = [];

      if (whereCondition.version) {
        whereClause += " AND version = ?";
        whereParams.push(whereCondition.version);
      }

      if (whereCondition.taskType) {
        if (
          typeof whereCondition.taskType === "object" &&
          whereCondition.taskType[Op.ne]
        ) {
          whereClause += " AND taskType != ?";
          whereParams.push(whereCondition.taskType[Op.ne]);
        } else {
          whereClause += " AND taskType = ?";
          whereParams.push(whereCondition.taskType);
        }
      }

      if (whereCondition.title) {
        whereClause += " AND title LIKE ?";
        whereParams.push(
          `%${whereCondition.title[Op.like].replace(/%/g, "")}%`
        );
      }

      // 处理状态过滤
      if (whereCondition[Op.or]) {
        const orConditions = whereCondition[Op.or];
        const statusConditions = [];

        orConditions.forEach((condition) => {
          if (condition.status) {
            if (condition.status[Op.and]) {
              const andConditions = condition.status[Op.and];
              andConditions.forEach((andCond) => {
                if (andCond[Op.notIn]) {
                  statusConditions.push(
                    `status NOT IN (${andCond[Op.notIn]
                      .map(() => "?")
                      .join(",")})`
                  );
                  whereParams.push(...andCond[Op.notIn]);
                } else if (andCond[Op.ne]) {
                  statusConditions.push(`status != ?`);
                  whereParams.push(andCond[Op.ne]);
                }
              });
            }
          }
        });

        if (statusConditions.length > 0) {
          whereClause += ` AND (${statusConditions.join(" OR ")})`;
        }
      }

      // 查询总数
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
      const countResult = await db.sequelize.query(countQuery, {
        replacements: whereParams,
        type: db.sequelize.QueryTypes.SELECT,
      });
      count = countResult[0]?.count || 0;

      // 查询数据 - 使用安全的排序字段防止SQL注入
      const dataQuery = `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
      const tasks = await db.sequelize.query(dataQuery, {
        replacements: [...whereParams, parseInt(limit), offset],
        type: db.sequelize.QueryTypes.SELECT,
      });

      // 获取用户信息
      const userIds = [];
      tasks.forEach((task) => {
        if (task.publisherId) userIds.push(task.publisherId);
        if (task.acceptorId) userIds.push(task.acceptorId);
      });

      let users = [];
      if (userIds.length > 0) {
        users = await User.findAll({
          where: { id: { [Op.in]: [...new Set(userIds)] } },
          attributes: ["id", "nickname", "avatarUrl"],
          raw: true,
        });
      }

      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });

      // 为任务添加用户信息
      rows = tasks
        .map((task) => {
          const formatted = formatTaskRow(task);
          if (!formatted) {
            return null;
          }

          if (!formatted.isVirtualOrder) {
            const publisherInfo = userMap[task.publisherId] || null;
            formatted.publisher = publisherInfo
              ? {
                  id: task.publisherId,
                  nickname: publisherInfo.nickname,
                  avatarUrl: publisherInfo.avatarUrl,
                }
              : null;

            formatted.acceptor = task.acceptorId
              ? (() => {
                  const acceptorInfo = userMap[task.acceptorId] || null;
                  return acceptorInfo
                    ? {
                        id: task.acceptorId,
                        nickname: acceptorInfo.nickname,
                        avatarUrl: acceptorInfo.avatarUrl,
                      }
                    : null;
                })()
              : null;
          }

          return formatted;
        })
        .filter(Boolean);
    } else {
      // 主表已删除，如果没有指定社区ID，返回空结果
      count = 0;
      rows = [];
    }

    res.status(200).send({
      totalItems: count,
      tasks: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get a single task by order number (for Uni-app)
exports.getTaskByOrderNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    // 在所有社区的分表中查找任务
    let task = null;
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE out_trade_no = ?",
          {
            replacements: [orderNumber],
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

    if (!task) {
      return res.status(404).json({ message: "未找到对应的任务" });
    }

    // 获取用户信息
    const userIds = [task.publisherId, task.acceptorId].filter((id) => id);
    let users = [];
    if (userIds.length > 0) {
      users = await User.findAll({
        where: { id: { [Op.in]: [...new Set(userIds)] } },
        attributes: ["id", "nickname", "avatarUrl"],
        raw: true,
      });
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    // 为任务添加用户信息
    const taskWithUsers = {
      ...task,
      publisher_nickname: userMap[task.publisherId]
        ? userMap[task.publisherId].nickname
        : null,
      publisher_avatarUrl: userMap[task.publisherId]
        ? userMap[task.publisherId].avatarUrl
        : null,
      acceptor_nickname:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].nickname
          : null,
      acceptor_avatarUrl:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].avatarUrl
          : null,
    };

    const formattedTask = formatTaskRow(taskWithUsers) || taskWithUsers;

    res.status(200).json(formattedTask);
  } catch (error) {
    next(error);
  }
};

// Public: Get a single task by ID (for Uni-app)
exports.getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // 在所有社区的分表中查找任务
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    let task = null;
    let communityId = null;

    // 遍历所有社区分表查找任务
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
        // 如果表不存在，继续查找下一个
        continue;
      }
    }

    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }

    // 获取用户信息
    const userIds = [task.publisherId, task.acceptorId].filter((id) => id);

    let users = [];
    if (userIds.length > 0) {
      users = await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ["id", "nickname", "avatarUrl", "gender"],
        raw: true,
      });
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    // 为任务添加用户信息
    const taskRowWithUsers = {
      ...task,
      publisher_nickname: userMap[task.publisherId]
        ? userMap[task.publisherId].nickname
        : null,
      publisher_avatarUrl: userMap[task.publisherId]
        ? userMap[task.publisherId].avatarUrl
        : null,
      acceptor_nickname:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].nickname
          : null,
      acceptor_avatarUrl:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].avatarUrl
          : null,
    };

    const formattedTask = formatTaskRow(taskRowWithUsers) || taskRowWithUsers;

    // 获取当前用户ID（如果已登录）
    const currentUserId = req.userId; // 从token中获取，可能为undefined
    const isPublisher =
      currentUserId &&
      (task.publisherId === currentUserId || task.publisherId == currentUserId);
    const isAcceptor =
      currentUserId &&
      (task.acceptorId === currentUserId || task.acceptorId == currentUserId);

    // const isAdmin = currentUserId && currentUserId.startsWith("ADMIN");

    // 只有发布者或接单者才能看到完整信息，其他人都需要隐藏敏感信息
    if (!isPublisher && !isAcceptor) {
      // 隐藏specifics中的敏感信息（取件码等）
      let maskedSpecifics = formattedTask.specifics;
      if (maskedSpecifics) {
        // 隐藏取件码
        maskedSpecifics = maskedSpecifics.replace(
          /(取件码|手机尾号)[：:]\s*([^\n\r]+)/g,
          "$1: [仅发布者和接单员可见]"
        );
        // 可以根据需要添加更多隐私信息的隐藏规则
      }

      // 创建隐藏敏感信息的任务副本
      const taskData = { ...formattedTask, specifics: maskedSpecifics };

      // 处理确认图片字段
      if (
        taskData.confirmImages &&
        typeof taskData.confirmImages === "string"
      ) {
        try {
          taskData.confirmImages = JSON.parse(taskData.confirmImages);
        } catch (error) {
          console.error("[getTaskById] 解析确认图片JSON失败:", error);
          taskData.confirmImages = null;
        }
      }

      res.status(200).send(taskData);
    } else {
      if (isPublisher) {
      } else if (isAcceptor) {
      }
      // 发布者或接单者可以看到完整信息
      const taskData = { ...formattedTask };

      // 处理确认图片字段
      if (
        taskData.confirmImages &&
        typeof taskData.confirmImages === "string"
      ) {
        try {
          taskData.confirmImages = JSON.parse(taskData.confirmImages);
        } catch (error) {
          console.error("[getTaskById] 解析确认图片JSON失败:", error);
          taskData.confirmImages = null;
        }
      }

      res.status(200).send(taskData);
    }
  } catch (error) {
    next(error);
  }
};

// Authenticated User (Uni-app): Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      taskType,
      rewardAmount,
      locationText = "",
      deadline,
      publisherId: publisherIdFromBody,
      status = "open",
      communityId: communityIdFromBody,
      version = "campus",
      virtualOrder,
      isVirtualOrder,
      virtualPublisher = {},
      virtualAcceptor = {},
      remarks = "",
      timeRequirement = null,
      budget = null,
      images = [],
      deliveryAddress = "",
      courierPlatform = "",
      pickupCode = "",
      takeoutPlatform = "",
      takeoutOrderInfo = "",
      out_trade_no = null,
      borrowMode = null,
      autoOfflineDate = null,
      specifics = "",
      requiredGender = 0,
    } = req.body;

    // 调试日志：打印接收到的budget值
    console.log(`[createTask] 接收到的数据:`, {
      taskType,
      budget: budget,
      budgetType: typeof budget,
      parsedBudget: parseFloat(budget),
    });
    const publisherId = req.userId; // Set by authJwt.verifyToken

    // 获取社区ID（从查询参数或请求体中）
    const communityId = req.query.communityId || req.body.communityId;

    if (!title || !taskType || rewardAmount === undefined) {
      return res.status(400).send({ message: "标题、任务类型和赏金为必填项" });
    }
    if (parseFloat(rewardAmount) < 0) {
      return res.status(400).send({ message: "赏金不能为负数" });
    }

    // 根据任务类型设置支付状态
    let paymentStatus = "pending"; // 默认待支付
    let finalOutTradeNo = out_trade_no || null;

    if (taskType === "找搭子") {
      paymentStatus = "paid"; // 找搭子类型不需要付款，默认为已支付
    } else if (taskType === "借物品" && borrowMode === "lend") {
      // 借出模式：发布者不需要支付，借进用户支付
      paymentStatus = "pending";
    } else if (taskType === "借物品" && borrowMode === "borrow") {
      // 借进模式：发布者需要先支付
      const user = await User.findByPk(publisherId);
      if (user && user.tempPaymentInfo) {
        try {
          const tempPayment = JSON.parse(user.tempPaymentInfo);
          if (
            tempPayment.paymentType === "borrow_item" &&
            tempPayment.borrowInfo?.mode === "borrow"
          ) {
            paymentStatus = "paid";
            finalOutTradeNo = tempPayment.out_trade_no;

            // 清除临时支付信息
            user.tempPaymentInfo = null;
            await user.save();
          }
        } catch (error) {
          console.error(`[createTask] 解析临时支付信息失败:`, error);
        }
      }
    } else if (out_trade_no) {
      paymentStatus = "paid"; // 有支付订单号，说明已支付
    }

    // 处理日期格式转换
    let formattedDeadline = null;
    if (deadline) {
      try {
        // 将ISO格式转换为MySQL格式
        const date = new Date(deadline);
        formattedDeadline = date.toISOString().slice(0, 19).replace("T", " ");
      } catch (error) {
        console.error(`[createTask] 日期格式转换失败:`, error);
        formattedDeadline = null;
      }
    }

    let formattedAutoOfflineDate = null;
    if (autoOfflineDate) {
      try {
        // 将ISO格式转换为MySQL格式
        const date = new Date(autoOfflineDate);
        formattedAutoOfflineDate = date
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      } catch (error) {
        console.error(`[createTask] 自动下架日期格式转换失败:`, error);
        formattedAutoOfflineDate = null;
      }
    }

    // 计算自动取消时间
    let autoCancelTime = null;
    if (timeRequirement) {
      const autoCancelService = require("../services/autoCancelService");
      autoCancelTime =
        autoCancelService.calculateAutoCancelTime(timeRequirement);
    }

    // 直接基于当前时间（订单创建时间）计算截止时间
    const currentTime = new Date();
    let recalculatedDeadline = null;

    console.log(
      `[createTask] 开始计算截止时间，当前时间: ${currentTime}, timeRequirement: ${timeRequirement}`
    );

    if (timeRequirement) {
      // 根据用户选择的时间要求计算
      const timeOptions = [
        { value: "immediate", hours: 0 },
        { value: "30min", hours: 0.5 },
        { value: "1hour", hours: 1 },
        { value: "2hour", hours: 2 },
        { value: "4hour", hours: 4 },
        { value: "6hour", hours: 6 },
        { value: "12hour", hours: 12 },
        { value: "24hour", hours: 24 },
        { value: "48hour", hours: 48 },
      ];

      const option = timeOptions.find((opt) => opt.value === timeRequirement);
      if (option) {
        recalculatedDeadline = new Date(
          currentTime.getTime() + option.hours * 60 * 60 * 1000
        );
        console.log(
          `[createTask] 根据timeRequirement计算截止时间: ${recalculatedDeadline}`
        );
      }
    }

    // 如果没有timeRequirement或没找到匹配项，使用默认24小时
    if (!recalculatedDeadline) {
      recalculatedDeadline = new Date(
        currentTime.getTime() + 24 * 60 * 60 * 1000
      );
      console.log(
        `[createTask] 使用默认24小时计算截止时间: ${recalculatedDeadline}`
      );
    }

    // 转换为MySQL格式（YYYY-MM-DD HH:MM:SS），保持本地时区
    const year = recalculatedDeadline.getFullYear();
    const month = String(recalculatedDeadline.getMonth() + 1).padStart(2, "0");
    const day = String(recalculatedDeadline.getDate()).padStart(2, "0");
    const hours = String(recalculatedDeadline.getHours()).padStart(2, "0");
    const minutes = String(recalculatedDeadline.getMinutes()).padStart(2, "0");
    const seconds = String(recalculatedDeadline.getSeconds()).padStart(2, "0");
    const formattedRecalculatedDeadline = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    console.log(`[createTask] 最终截止时间: ${formattedRecalculatedDeadline}`);

    // 构建任务数据
    const taskData = {
      title,
      description,
      taskType,
      rewardAmount: parseFloat(rewardAmount) || 0, // 确保是数字类型
      locationText,
      deadline: formattedRecalculatedDeadline,
      publisherId,
      status: "open", // Default status
      out_trade_no: finalOutTradeNo || null, // 新增：写入支付订单号
      paymentStatus: paymentStatus, // 根据任务类型设置支付状态
      specifics: specifics || "", // 任务详情信息
      remarks: remarks || "", // 备注信息
      requiredGender: parseInt(requiredGender) || 0, // 确保是整数类型
      version: version, // 新增：版本
      borrowMode: borrowMode || null, // 新增：借物品模式
      autoOfflineDate: formattedAutoOfflineDate, // 新增：自动下架日期
      images: images || [], // 新增：任务图片数组
      budget: taskType === "帮我买" ? parseFloat(budget) || 0 : null, // 新增：帮我买任务的物品预算
      timeRequirement: timeRequirement || null, // 新增：时间要求
      autoCancelTime: autoCancelTime, // 新增：自动取消时间
    };

    console.log("[createTask] 最终任务数据:", taskData);
    console.log(
      "[createTask] budget字段:",
      taskData.budget,
      "类型:",
      typeof taskData.budget
    );
    console.log("[createTask] 社区ID:", communityId);

    let task;
    if (communityId && communityId !== "") {
      // 使用分表创建任务
      const tableName = `tasks_community_${communityId}`;

      // 添加社区ID到任务数据
      taskData.communityId = parseInt(communityId) || 0;

      // 使用原始SQL插入到分表
      const insertQuery = `
        INSERT INTO ${tableName} (
          title, description, taskType, rewardAmount, locationText, status,
          publisherId, deadline, out_trade_no, specifics, remarks, requiredGender,
          version, borrowMode, autoOfflineDate, images, paymentStatus, communityId,
          budget, timeRequirement, autoCancelTime, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await db.sequelize.query(insertQuery, {
        replacements: [
          taskData.title,
          taskData.description,
          taskData.taskType,
          taskData.rewardAmount,
          taskData.locationText,
          taskData.status,
          taskData.publisherId,
          taskData.deadline,
          taskData.out_trade_no,
          taskData.specifics,
          taskData.remarks,
          taskData.requiredGender,
          taskData.version,
          taskData.borrowMode,
          taskData.autoOfflineDate,
          JSON.stringify(taskData.images),
          taskData.paymentStatus,
          taskData.communityId,
          taskData.budget,
          taskData.timeRequirement,
          taskData.autoCancelTime,
        ],
        type: db.sequelize.QueryTypes.INSERT,
      });

      // 获取创建的任务
      const taskId = result[0];
      const createdTask = await db.sequelize.query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        {
          replacements: [taskId],
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      task = createdTask[0];
    } else {
      // 主表已删除，必须指定社区ID
      return res.status(400).send({ message: "必须指定社区ID才能创建任务" });
    }

    // 订单发布的消息通知已移除

    res.status(201).json({ code: 0, message: "任务发布成功", data: task });
  } catch (error) {
    next(error);
  }
};

// Authenticated User (Uni-app): User accepts a task
exports.acceptTask = async (req, res, next) => {
  const taskId = req.params.id;
  const acceptorId = req.userId; // from JWT
  const user = await User.findByPk(acceptorId);
  if (
    !user ||
    (user.role !== "rider" && user.riderApplicationStatus !== "approved")
  ) {
    return res
      .status(403)
      .send({ message: "您还不是接单员，请先申请成为接单员。" });
  }
  try {
    // 先尝试从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id, name FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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

    // 主表已删除，只从分表查找

    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }
    if (task.publisherId === acceptorId) {
      // 根据任务类型给出不同的提示
      if (task.taskType === "借物品") {
        if (task.borrowMode === "lend") {
          return res.status(400).send({ message: "不能借自己的物品哦" });
        } else if (task.borrowMode === "borrow") {
          return res.status(400).send({ message: "不能借自己的需求哦" });
        }
      }
      return res.status(400).send({ message: "不能接自己发布的订单哦" });
    }
    if (task.status !== "open") {
      if (task.status === "assigned") {
        return res.status(400).send({ message: "该订单已被其他用户接单" });
      } else if (
        task.status === "completed" ||
        task.status === "publisher_confirmed"
      ) {
        return res.status(400).send({ message: "该订单已完成，无法接单" });
      } else if (task.status === "cancelled") {
        return res.status(400).send({ message: "该订单已取消，无法接单" });
      } else {
        return res.status(400).send({ message: "该订单状态不允许接单" });
      }
    }

    // 处理借物品任务的支付逻辑
    if (task.taskType === "借物品") {
      if (task.borrowMode === "lend") {
        // 借出模式：借入者已经支付押金+租金，需要更新rewardAmount和支付状态

        // 从specifics中解析押金和租金信息
        const specifics = task.specifics || "";
        const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
        const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);

        if (depositMatch && rentMatch && req.body.borrowInfo) {
          const deposit = parseFloat(depositMatch[1]);
          const dailyRent = parseFloat(rentMatch[1]);
          const { startDate, endDate, out_trade_no } = req.body.borrowInfo;

          if (startDate && endDate) {
            // 计算借用天数
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // 计算总费用（押金 + 租金）
            const totalCost = deposit + dailyRent * days;

            // 更新rewardAmount为实际租金收入（不包含押金，押金会退还）
            task.rewardAmount = dailyRent * days;

            // 更新支付订单号
            if (out_trade_no) {
              task.out_trade_no = out_trade_no;
            }
          }
        }

        task.paymentStatus = "paid"; // 借入者已经支付
      } else if (task.borrowMode === "borrow") {
        // 借进模式：发布者已经支付，借出者不需要支付
        task.paymentStatus = "paid"; // 发布者已经支付
      }
    } else {
      // 其他任务类型的原有逻辑
      const total = parseFloat(task.rewardAmount);
      const platformFee = parseFloat((total * 0.1).toFixed(2));
      const acceptorFee = parseFloat((total - platformFee).toFixed(2));

      // 确保找搭子类型的任务支付状态保持为paid
      if (task.taskType === "找搭子" && task.paymentStatus !== "paid") {
        task.paymentStatus = "paid";
      }
    }

    task.acceptorId = acceptorId;
    task.status = "assigned";
    task.acceptedAt = new Date(); // 设置接单时间

    // 对于借物品任务，存储用户选择的借用时间
    if (task.taskType === "借物品" && req.body.borrowInfo) {
      const { startDate, endDate } = req.body.borrowInfo;
      if (startDate && endDate) {
        // 将用户选择的借用时间添加到specifics中
        const currentSpecifics = task.specifics || "";
        const borrowTimeInfo = `\n借用时间: ${startDate} 至 ${endDate}`;
        task.specifics = currentSpecifics + borrowTimeInfo;
      }
    }

    // 设置平台费用和接单员费用
    if (task.taskType === "借物品") {
      // 借物品任务使用calculateFees函数计算费用
      const fees = calculateFees(task.rewardAmount, task);
      task.platformFee = fees.platformFee;
      task.acceptorFee = fees.acceptorFee;
    } else {
      // 其他任务类型的费用计算
      const total = parseFloat(task.rewardAmount);
      const platformFee = parseFloat((total * 0.1).toFixed(2));
      const acceptorFee = parseFloat((total - platformFee).toFixed(2));
      task.platformFee = platformFee;
      task.acceptorFee = acceptorFee;
    }

    // 更新任务状态
    if (communityId) {
      // 分表任务，使用原始SQL更新
      const tableName = `tasks_community_${communityId}`;
      await db.sequelize.query(
        `UPDATE ${tableName} SET acceptorId = ?, status = ?, acceptedAt = NOW(), platformFee = ?, acceptorFee = ? WHERE id = ?`,
        {
          replacements: [
            acceptorId,
            "assigned",
            task.platformFee,
            task.acceptorFee,
            taskId,
          ],
          type: db.sequelize.QueryTypes.UPDATE,
        }
      );
    } else {
      // 主表任务，使用Sequelize更新
      await task.save();
    }

    // 异步发送任务接取通知给发布者
    setImmediate(async () => {
      try {
        await wechatNotificationService.notifyTaskAccepted(task, user);
      } catch (error) {
        console.error("❌ [acceptTask] 发送任务接取通知失败:", error);
      }
    });

    res.status(200).send({
      message: "接单成功！",
      task,
      platformFee: task.platformFee || 0,
      acceptorFee: task.acceptorFee || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Authenticated User (Uni-app or Admin): Update task status or details
// This needs careful permission checks: only publisher, acceptor, or admin can update specific fields.
exports.updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.userId; // from JWT
    const userRole = req.userRole; // from JWT
    const updatableFields = req.body; // e.g., { status: 'completed', description: 'new desc' }

    // 先尝试从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id, name FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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

    // 主表已删除，只从分表查找
    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }

    // Permission logic:
    // Admin can edit most fields.
    // Publisher can edit before accepted, or cancel, or confirm completion.
    // Acceptor can mark as done.
    let canUpdate = false;
    if (userRole === "admin") {
      canUpdate = true;
    } else if (task.publisherId === userId) {
      // Publisher specific updates
      if (
        updatableFields.status === "cancelled" &&
        (task.status === "open" || task.status === "assigned")
      )
        canUpdate = true;
      if (
        updatableFields.status === "publisher_confirmed" &&
        task.status === "acceptor_done"
      )
        canUpdate = true;
      if (
        task.status === "open" &&
        (updatableFields.title ||
          updatableFields.description ||
          updatableFields.rewardAmount ||
          updatableFields.budget)
      )
        canUpdate = true; // Can edit details if still open
    } else if (task.acceptorId === userId) {
      // Acceptor specific updates
      if (
        updatableFields.status === "acceptor_done" &&
        task.status === "assigned"
      )
        canUpdate = true;
    }

    // 添加调试日志
    console.log("[updateTask] 权限检查:", {
      taskId,
      userId,
      userRole,
      taskPublisherId: task.publisherId,
      taskAcceptorId: task.acceptorId,
      taskStatus: task.status,
      updatableFields,
      canUpdate,
    });

    if (
      !canUpdate &&
      Object.keys(updatableFields).some(
        (key) => !["status"].includes(key) && userRole !== "admin"
      )
    ) {
      // Non-admin trying to update more than just status in non-permitted ways
      if (
        !(
          task.publisherId === userId &&
          task.status === "open" &&
          (updatableFields.title ||
            updatableFields.description ||
            updatableFields.rewardAmount ||
            updatableFields.budget ||
            updatableFields.locationText ||
            updatableFields.taskType ||
            updatableFields.deadline)
        )
      ) {
        return res.status(403).send({
          message:
            "Forbidden: You do not have permission to update these fields for this task.",
        });
      }
    }

    // 如果订单已支付，不允许修改 rewardAmount 或 budget（避免退款时金额不一致）
    console.log("[updateTask] 检查支付状态限制:", {
      paymentStatus: task.paymentStatus,
      hasRewardAmount: updatableFields.rewardAmount !== undefined,
      hasBudget: updatableFields.budget !== undefined,
      userRole,
      isAdmin: userRole === "admin",
    });

    if (
      task.paymentStatus === "paid" &&
      (updatableFields.rewardAmount !== undefined ||
        updatableFields.budget !== undefined) &&
      userRole !== "admin"
    ) {
      console.log("[updateTask] 拒绝修改：订单已支付，不允许修改金额");
      return res.status(400).send({
        message: "订单已支付，不允许修改金额。如需修改，请先退款后再修改。",
      });
    }

    // If only status is being updated, and the user has permission for that specific status transition
    if (updatableFields.status && !canUpdate) {
      return res.status(403).send({
        message:
          "Forbidden: You do not have permission to change to this task status.",
      });
    }

    // Fields admin can update vs user (example)
    const allowedAdminFields = [
      "title",
      "description",
      "taskType",
      "rewardAmount",
      "budget",
      "locationText",
      "status",
      "deadline",
      "specifics",
      // 取快递专用字段
      "platform",
      "pickupCode",
      "pickupLocation",
      "deliveryAddress",
      "packageSize",
      "remarks",
      "expectedDelivery",
      // 学习伙伴专用字段
      "activityType",
      "activityName",
      "peopleNumber",
      "costMethod",
      "activityTime",
      // 其他字段
      "out_trade_no",
    ];
    const allowedPublisherOpenFields = [
      "title",
      "description",
      "taskType",
      "rewardAmount",
      "budget",
      "locationText",
      "deadline",
      "specifics",
      // 取快递专用字段
      "platform",
      "pickupCode",
      "pickupLocation",
      "deliveryAddress",
      "packageSize",
      "remarks",
      "expectedDelivery",
      // 学习伙伴专用字段
      "activityType",
      "activityName",
      "peopleNumber",
      "costMethod",
      "activityTime",
      // 其他字段
      "out_trade_no",
    ];

    // 注意：这里只是将允许的字段复制到 task 对象中，用于后续的状态比较等
    // 实际的字段过滤和更新在下面的 SQL 更新逻辑中进行
    for (const key in updatableFields) {
      if (userRole === "admin" && allowedAdminFields.includes(key)) {
        task[key] = updatableFields[key];
      } else if (
        task.publisherId === userId &&
        task.status === "open" &&
        allowedPublisherOpenFields.includes(key)
      ) {
        task[key] = updatableFields[key];
      } else if (key === "status" && canUpdate) {
        // For status changes by publisher/acceptor
        task[key] = updatableFields[key];
      }
    }

    // 保存旧状态用于比较
    const oldStatus = task.status;

    // 日期时间字段转换为MySQL格式
    const toSqlDateTime = (value) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    // 更新任务状态
    if (communityId) {
      // 分表任务，使用原始SQL更新
      const tableName = `tasks_community_${communityId}`;
      const updateFields = [];
      const updateValues = [];

      // 日期时间字段列表
      const dateTimeFields = [
        "deadline",
        "acceptorDoneTime",
        "publisherConfirmedTime",
        "transferTime",
        "autoConfirmTime",
        "autoOfflineDate",
        "expectedDelivery",
        "activityTime",
      ];

      // 构建更新字段和值
      // 只处理允许更新的字段，避免更新不允许的字段
      const fieldsToUpdate = {};

      console.log("[updateTask] 开始字段过滤:", {
        updatableFieldsKeys: Object.keys(updatableFields),
        userRole,
        taskPublisherId: task.publisherId,
        userId,
        taskStatus: task.status,
        isPublisher: task.publisherId === userId,
        isOpen: task.status === "open",
      });

      // 先过滤出允许更新的字段
      const isPublisher = task.publisherId === userId;
      const isOpen = task.status === "open";

      for (const key in updatableFields) {
        if (userRole === "admin" && allowedAdminFields.includes(key)) {
          fieldsToUpdate[key] = updatableFields[key];
          console.log(`[updateTask] 字段 ${key} 已添加 (admin)`);
        } else if (
          isPublisher &&
          isOpen &&
          allowedPublisherOpenFields.includes(key)
        ) {
          fieldsToUpdate[key] = updatableFields[key];
          console.log(
            `[updateTask] 字段 ${key} 已添加 (publisher, isPublisher=${isPublisher}, isOpen=${isOpen}, inList=${allowedPublisherOpenFields.includes(
              key
            )})`
          );
        } else if (key === "status" && canUpdate) {
          fieldsToUpdate[key] = updatableFields[key];
          console.log(`[updateTask] 字段 ${key} 已添加 (status)`);
        } else {
          console.log(`[updateTask] 字段 ${key} 被跳过:`, {
            isAdmin: userRole === "admin",
            inAdminFields: allowedAdminFields.includes(key),
            isPublisher,
            isOpen,
            inPublisherFields: allowedPublisherOpenFields.includes(key),
            isStatus: key === "status",
            canUpdate,
          });
        }
      }

      // 如果没有可更新的字段，返回错误
      if (Object.keys(fieldsToUpdate).length === 0) {
        console.log("[updateTask] 没有可更新的字段:", {
          updatableFields: Object.keys(updatableFields),
          userRole,
          taskPublisherId: task.publisherId,
          userId,
          taskStatus: task.status,
          allowedAdminFields,
          allowedPublisherOpenFields,
        });
        return res.status(400).send({
          message: "没有可更新的字段或没有权限更新这些字段",
        });
      }

      console.log("[updateTask] 准备更新的字段:", {
        fieldsToUpdate: Object.keys(fieldsToUpdate),
        fieldsToUpdateValues: fieldsToUpdate,
      });

      Object.keys(fieldsToUpdate).forEach((key) => {
        let value = fieldsToUpdate[key];

        // 日期时间字段转换
        if (dateTimeFields.includes(key)) {
          value = toSqlDateTime(value);
        }

        // 金额字段确保是数字类型
        if (key === "rewardAmount" || key === "budget") {
          value = value === null ? null : parseFloat(value);
          if (Number.isNaN(value)) {
            value = null;
          }
        }

        // 图片字段确保是JSON字符串
        if (key === "images" && value && typeof value !== "string") {
          value = JSON.stringify(value);
        }

        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      });
      updateValues.push(taskId);

      console.log("[updateTask] 执行SQL更新:", {
        tableName,
        updateFields: updateFields.join(", "),
        updateValuesCount: updateValues.length,
        taskId,
      });

      try {
        await db.sequelize.query(
          `UPDATE ${tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
          {
            replacements: updateValues,
            type: db.sequelize.QueryTypes.UPDATE,
          }
        );
        console.log("[updateTask] SQL更新成功");
      } catch (sqlError) {
        console.error("[updateTask] SQL更新失败:", sqlError);
        throw sqlError;
      }
    } else {
      // 主表任务，使用Sequelize更新
      await task.save();
    }

    // 检查状态变化，发送相应通知
    const newStatus = task.status;
    if (oldStatus !== newStatus) {
      setImmediate(async () => {
        try {
          // 包含完整的关联数据
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

          if (newStatus === "acceptor_done") {
            // 接单员标记送达，通知发布者
            await wechatNotificationService.notifyTaskDelivered(
              taskWithRelations,
              taskWithRelations.acceptor
            );
          } else if (
            newStatus === "publisher_confirmed" ||
            newStatus === "completed"
          ) {
            // 发布者确认完成，通知双方
            await wechatNotificationService.notifyTaskCompleted(
              taskWithRelations,
              "both"
            );
          }
        } catch (error) {
          console.error("发送任务状态变更通知失败:", error);
        }
      });
    }

    res.status(200).send({ message: "任务更新成功", task });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete a task
exports.adminDeleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // 从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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
      return res.status(404).send({ message: "任务不存在" });
    }

    console.log(`[adminDeleteTask] 开始删除任务 ID: ${taskId}`);

    // 使用事务确保数据一致性
    const result = await db.sequelize.transaction(async (t) => {
      // 1. 先删除相关的聊天记录
      const Chat = db.Chat;
      const deletedChats = await Chat.destroy({
        where: { taskId: taskId },
        transaction: t,
      });

      // 2. 然后删除任务（从分表中删除）
      if (communityId) {
        const tableName = `tasks_community_${communityId}`;
        await db.sequelize.query(`DELETE FROM ${tableName} WHERE id = ?`, {
          replacements: [taskId],
          type: db.sequelize.QueryTypes.DELETE,
          transaction: t,
        });
      } else {
        console.error("[adminDeleteTask] 错误：未找到社区ID");
        throw new Error("无法删除任务：未找到社区ID");
      }

      return { deletedChats };
    });

    res.status(200).send({
      message: "任务删除成功",
      deletedChats: result.deletedChats,
    });
  } catch (error) {
    console.error("[adminDeleteTask] Error:", error.message);
    if (error.original) {
      console.error("[adminDeleteTask] Original DB Error:", error.original);
    }
    next(error);
  }
};

// User (publisher or acceptor): Get tasks related to them
exports.getMyTasks = async (req, res, next) => {
  const userId = req.userId;
  const { type = "published", page = 1, limit = 10 } = req.query; // type can be 'published' or 'accepted'
  const offset = (page - 1) * limit;

  let whereCondition = {};
  if (type === "published") {
    whereCondition.publisherId = userId;
  } else if (type === "accepted") {
    whereCondition.acceptorId = userId;
  } else {
    return res.status(400).send({ message: "任务类型参数无效" });
  }

  try {
    // 日志：打印userId、type、whereCondition
    console.log(
      "[getMyTasks] userId:",
      userId,
      "type:",
      type,
      "whereCondition:",
      whereCondition
    );

    // 从分表中查询任务
    let allTasks = [];
    let totalCount = 0;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 遍历所有社区分表查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        // 构建查询条件
        let whereClause = "";
        let replacements = [];

        if (type === "published") {
          whereClause = "publisherId = ?";
          replacements = [userId];
        } else if (type === "accepted") {
          whereClause = "acceptorId = ?";
          replacements = [userId];
        }

        // 查询总数
        const countResult = await db.sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`,
          {
            replacements,
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (countResult[0]?.count > 0) {
          totalCount += countResult[0].count;

          // 查询任务数据
          const tasks = await db.sequelize.query(
            `SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY createdAt DESC`,
            {
              replacements,
              type: db.sequelize.QueryTypes.SELECT,
            }
          );

          allTasks = allTasks.concat(tasks);
        }
      } catch (error) {
        // 表不存在，继续查找下一个
        continue;
      }
    }

    // 按创建时间排序
    allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 分页处理
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = allTasks.slice(startIndex, endIndex);

    // 获取用户信息
    const userIds = [
      ...new Set([
        ...paginatedTasks.map((t) => t.publisherId),
        ...paginatedTasks.map((t) => t.acceptorId).filter((id) => id),
      ]),
    ];

    let users = [];
    if (userIds.length > 0) {
      users = await User.findAll({
        where: { id: { [db.Sequelize.Op.in]: userIds } },
        attributes: ["id", "nickname", "avatarUrl"],
        raw: true,
      });
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    // 为任务添加用户信息
    const tasksWithUsers = paginatedTasks.map((task) => ({
      ...task,
      publisher_nickname: userMap[task.publisherId]
        ? userMap[task.publisherId].nickname
        : null,
      publisher_avatarUrl: userMap[task.publisherId]
        ? userMap[task.publisherId].avatarUrl
        : null,
      acceptor_nickname:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].nickname
          : null,
      acceptor_avatarUrl:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].avatarUrl
          : null,
    }));

    const formattedTasks = tasksWithUsers
      .map((task) => formatTaskRow(task) || task)
      .filter(Boolean);

    // 日志：打印查到的任务数量
    console.log(
      `[getMyTasks] 查到任务数量: ${totalCount}, 返回数量: ${formattedTasks.length}`
    );

    // 无论是否有任务，都返回200和空数组
    return res.status(200).send({
      totalItems: totalCount,
      tasks: formattedTasks,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all tasks with pagination and filtering
exports.adminGetAllTasks = async (req, res, next) => {
  try {
    console.log("[adminGetAllTasks] 开始处理请求");
    console.log("[adminGetAllTasks] 请求参数:", req.query);
    console.log("[adminGetAllTasks] 用户ID:", req.userId || "anonymous");
    console.log("[adminGetAllTasks] 用户角色:", req.userRole || "none");

    const {
      page = 1,
      limit = 10,
      search = "",
      taskType = "",
      status = "",
      communityId = "",
      sortBy = "createdAt",
      sortOrder = "DESC",
      virtualMode = "all",
    } = req.query;
    const offset = (page - 1) * limit;

    // 白名单验证 sortBy 和 sortOrder 防止SQL注入
    const allowedSortFields = [
      "createdAt",
      "deadline",
      "rewardAmount",
      "status",
      "updatedAt",
      "id",
    ];
    const allowedSortOrders = ["ASC", "DESC"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    const normalizeVirtualMode = (mode) => {
      if (mode === "real" || mode === "virtual" || mode === "all") {
        return mode;
      }
      return "all";
    };

    const normalizedVirtualMode = normalizeVirtualMode(virtualMode);

    const filterByVirtualMode = (task) => {
      if (!task) return false;
      if (normalizedVirtualMode === "virtual") {
        return task.isVirtualOrder === true;
      }
      if (normalizedVirtualMode === "real") {
        return task.isVirtualOrder !== true;
      }
      return true;
    };

    let whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }
    if (search) {
      whereCondition.title = { [Op.like]: `%${search}%` };
    }
    if (taskType) {
      whereCondition.taskType = taskType;
    }

    console.log("[adminGetAllTasks] 查询条件:", whereCondition);
    console.log("[adminGetAllTasks] 社区ID:", communityId);

    const order = [[sortBy, sortOrder.toUpperCase()]];

    let count = 0;
    let rows = [];

    // 如果指定了社区ID，从对应的分表查询
    if (communityId && communityId !== "all") {
      try {
        const tableName = databaseService.getTaskTableName(communityId);
        const tableExists = await databaseService.checkShardedTableExists(
          communityId
        );

        if (tableExists) {
          // 构建WHERE条件
          let whereClause = "WHERE 1=1";
          const replacements = [];

          if (status) {
            whereClause += " AND status = ?";
            replacements.push(status);
          }
          if (search) {
            whereClause += " AND title LIKE ?";
            replacements.push(`%${search}%`);
          }
          if (taskType) {
            whereClause += " AND taskType = ?";
            replacements.push(taskType);
          }

          // 查询数据
          const dataQuery = `
            SELECT t.*, 
                   p.nickname as publisher_nickname, p.avatarUrl as publisher_avatarUrl,
                   a.nickname as acceptor_nickname, a.avatarUrl as acceptor_avatarUrl
            FROM ${tableName} t
            LEFT JOIN users p ON t.publisherId = p.id
            LEFT JOIN users a ON t.acceptorId = a.id
            ${whereClause}
            ORDER BY t.${sortBy} ${sortOrder.toUpperCase()}
          `;

          const taskResults = await db.sequelize.query(dataQuery, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT,
          });

          const formattedTasks = (taskResults || [])
            .map((task) => formatTaskRow(task))
            .filter(Boolean)
            .filter(filterByVirtualMode);
          count = formattedTasks.length;
          rows = formattedTasks.slice(offset, offset + parseInt(limit));
        }
      } catch (error) {
        console.error(
          `[adminGetAllTasks] 查询社区 ${communityId} 分表失败:`,
          error
        );
      }
    } else {
      // 查询所有社区的分表
      try {
        const allCommunities = await databaseService.getAllCommunities();
        const allTasks = [];
        let totalCount = 0;

        for (const community of allCommunities) {
          try {
            const tableName = databaseService.getTaskTableName(community.id);
            const tableExists = await databaseService.checkShardedTableExists(
              community.id
            );

            if (tableExists) {
              // 构建WHERE条件
              let whereClause = "WHERE 1=1";
              const replacements = [];

              if (status) {
                whereClause += " AND status = ?";
                replacements.push(status);
              }
              if (search) {
                whereClause += " AND title LIKE ?";
                replacements.push(`%${search}%`);
              }
              if (taskType) {
                whereClause += " AND taskType = ?";
                replacements.push(taskType);
              }

              // 查询数据
              const dataQuery = `
                SELECT t.*, 
                       p.nickname as publisher_nickname, p.avatarUrl as publisher_avatarUrl,
                       a.nickname as acceptor_nickname, a.avatarUrl as acceptor_avatarUrl
                FROM ${tableName} t
                LEFT JOIN users p ON t.publisherId = p.id
                LEFT JOIN users a ON t.acceptorId = a.id
                ${whereClause}
                ORDER BY t.${safeSortBy} ${safeSortOrder}
              `;

              const taskResults = await db.sequelize.query(dataQuery, {
                replacements,
                type: db.sequelize.QueryTypes.SELECT,
              });

              // 转换数据格式
              const formattedTasks = (taskResults || []).map((task) =>
                formatTaskRow(task)
              );

              allTasks.push(...formattedTasks);
              totalCount += taskResults.length;
            }
          } catch (error) {
            console.error(
              `[adminGetAllTasks] 查询社区 ${community.id} 分表失败:`,
              error
            );
          }
        }

        // 对所有任务进行排序和分页
        allTasks.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          if (sortOrder.toUpperCase() === "DESC") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });

        count = totalCount;
        rows = allTasks.slice(offset, offset + parseInt(limit));
      } catch (error) {
        console.error("[adminGetAllTasks] 查询所有分表失败:", error);
      }
    }

    console.log("[adminGetAllTasks] 查询结果:", {
      count,
      rowsCount: rows.length,
    });

    // 无论是否有任务，都返回200状态码
    const response = {
      totalItems: count || 0,
      tasks: rows || [],
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: parseInt(page),
      virtualMode: normalizedVirtualMode,
    };

    console.log("[adminGetAllTasks] 返回响应:", response);
    setNoCacheHeaders(res);
    res.status(200).send(response);
  } catch (error) {
    console.error("[adminGetAllTasks] 获取任务列表失败:", error);
    next(error);
  }
};

// Admin: Create a new task (supports virtual demonstration orders)
exports.adminCreateTask = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      title,
      description = "",
      taskType,
      rewardAmount,
      locationText = "",
      deadline,
      publisherId,
      status = "open",
      communityId,
      version = "campus",
      virtualOrder,
      isVirtualOrder,
      virtualPublisher = {},
      virtualAcceptor = {},
      remarks = "",
      timeRequirement = null,
      budget = null,
      images = [],
      deliveryAddress = "",
      courierPlatform = "",
      pickupCode = "",
      takeoutPlatform = "",
      takeoutOrderInfo = "",
      specifics = "",
      requiredGender = 0,
      borrowMode = null,
      autoOfflineDate = null,
      out_trade_no = null,
    } = req.body;

    const useVirtual = virtualOrder === true || isVirtualOrder === true;

    if (!title || !taskType) {
      await transaction.rollback();
      return res.status(400).send({ message: "任务标题和任务类型为必填项" });
    }

    if (useVirtual && !["express", "tea_coffee"].includes(taskType)) {
      await transaction.rollback();
      return res
        .status(400)
        .send({ message: "虚拟任务目前仅支持代取快递或取外卖类型" });
    }

    if (!communityId) {
      await transaction.rollback();
      return res
        .status(400)
        .send({ message: "请选择任务所属社区后再创建任务" });
    }

    const communityIdInt = parseInt(communityId);
    if (Number.isNaN(communityIdInt)) {
      await transaction.rollback();
      return res.status(400).send({ message: "社区ID格式不正确" });
    }

    const parsedReward = parseFloat(rewardAmount) || 0;
    if (parsedReward < 0) {
      await transaction.rollback();
      return res.status(400).send({ message: "悬赏金额不能为负数" });
    }

    const tableName = databaseService.getTaskTableName(communityIdInt);
    const tableExists = await databaseService.checkShardedTableExists(
      communityIdInt
    );
    if (!tableExists) {
      throw new Error(`社区 ${communityIdInt} 的任务分表不存在`);
    }

    const formatDateTime = (value) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    const imageList = parseImagesField(images);

    let finalPublisherId = publisherId;
    let finalAcceptorId = req.body.acceptorId || null;
    let finalStatus = status || "open";
    let finalPaymentStatus = req.body.paymentStatus || "pending";
    let acceptedAt = null;
    let virtualPublisherProfile = null;
    let virtualAcceptorProfile = null;

    if (useVirtual) {
      finalStatus = "assigned";
      finalPaymentStatus = "paid";
      acceptedAt = new Date();

      virtualPublisherProfile = sanitizeVirtualProfile(
        virtualPublisher,
        "发布者"
      );
      virtualAcceptorProfile = sanitizeVirtualProfile(
        virtualAcceptor,
        "接单员"
      );

      if (!finalPublisherId) {
        if (req.userId) {
          finalPublisherId = req.userId;
        } else {
          const fallbackAdmin = await User.findOne({
            where: { role: "admin" },
            attributes: ["id"],
            transaction,
          });

          if (fallbackAdmin) {
            finalPublisherId = fallbackAdmin.id;
          } else {
            const fallbackUser = await User.findOne({
              attributes: ["id"],
              transaction,
            });
            if (fallbackUser) {
              finalPublisherId = fallbackUser.id;
            }
          }
        }
      }

      if (!finalPublisherId) {
        await transaction.rollback();
        return res
          .status(500)
          .send({ message: "未找到可用于虚拟订单的默认发布者账号" });
      }

      finalAcceptorId = null;
    } else if (!finalPublisherId) {
      await transaction.rollback();
      return res.status(400).send({
        message: "任务标题、类型和发布者ID为必填项",
      });
    } else {
      const publisherExists = await User.findByPk(finalPublisherId, {
        transaction,
      });
      if (!publisherExists) {
        await transaction.rollback();
        return res.status(404).send({ message: "发布者不存在" });
      }
    }

    const fees = calculateFees(parsedReward);
    const budgetValue =
      budget !== null && budget !== undefined ? parseFloat(budget) : null;
    const normalizedBudget = Number.isNaN(budgetValue) ? null : budgetValue;
    const formattedDeadline = formatDateTime(deadline);
    const acceptedAtStr = formatDateTime(acceptedAt);
    const generateOrderNo = () =>
      `ORDER${Date.now()}${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;

    const outTradeNo = out_trade_no || (useVirtual ? generateOrderNo() : null);

    const normalizedDeliveryAddress =
      typeof deliveryAddress === "string" ? deliveryAddress.trim() : "";
    const normalizedCourierPlatform =
      typeof courierPlatform === "string" ? courierPlatform.trim() : "";
    const normalizedPickupCode =
      typeof pickupCode === "string" ? pickupCode.trim() : "";
    const normalizedTakeoutPlatform =
      typeof takeoutPlatform === "string" ? takeoutPlatform.trim() : "";
    const normalizedTakeoutOrderInfo =
      typeof takeoutOrderInfo === "string" ? takeoutOrderInfo.trim() : "";

    const finalSpecifics = useVirtual
      ? buildVirtualSpecifics(taskType, {
          description,
          locationText,
          deliveryAddress: normalizedDeliveryAddress,
          courierPlatform: normalizedCourierPlatform,
          pickupCode: normalizedPickupCode,
          takeoutPlatform: normalizedTakeoutPlatform,
          takeoutOrderInfo: normalizedTakeoutOrderInfo,
        })
      : specifics || "";
    const finalImages = useVirtual ? [] : imageList;

    const insertQuery = `
      INSERT INTO ${tableName} (
        title, description, taskType, rewardAmount, locationText, status,
        publisherId, deadline, out_trade_no, specifics, remarks, requiredGender,
        version, borrowMode, autoOfflineDate, images, paymentStatus, communityId,
        budget, timeRequirement, autoCancelTime, createdAt, acceptorId, acceptedAt,
        platformFee, acceptorFee
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;

    const normalizedRemarks = typeof remarks === "string" ? remarks.trim() : "";
    const finalRemarks = useVirtual
      ? serializeVirtualRemarks(
          normalizedRemarks,
          virtualPublisherProfile,
          virtualAcceptorProfile
        )
      : normalizedRemarks;

    const insertReplacements = [
      title,
      description,
      taskType,
      parsedReward,
      locationText,
      finalStatus,
      finalPublisherId,
      formattedDeadline,
      outTradeNo,
      finalSpecifics,
      finalRemarks,
      requiredGender || 0,
      version,
      borrowMode || null,
      autoOfflineDate ? formatDateTime(autoOfflineDate) : null,
      JSON.stringify(finalImages),
      finalPaymentStatus,
      communityIdInt,
      normalizedBudget,
      timeRequirement || null,
      null,
      finalAcceptorId,
      acceptedAtStr,
      fees.platformFee,
      fees.acceptorFee,
    ];

    const insertResult = await db.sequelize.query(insertQuery, {
      replacements: insertReplacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction,
    });

    const taskId = insertResult[0];

    const [taskRow] = await db.sequelize.query(
      `
        SELECT t.*,
               p.nickname AS publisher_nickname, p.avatarUrl AS publisher_avatarUrl,
               a.nickname AS acceptor_nickname, a.avatarUrl AS acceptor_avatarUrl
        FROM ${tableName} t
        LEFT JOIN users p ON t.publisherId = p.id
        LEFT JOIN users a ON t.acceptorId = a.id
        WHERE t.id = ?
      `,
      {
        replacements: [taskId],
        type: db.sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    await transaction.commit();

    const formattedTask = formatTaskRow(taskRow);
    if (formattedTask) {
      formattedTask.courierPlatform = taskRow.courierPlatform;
      formattedTask.pickupCode = taskRow.pickupCode;
      formattedTask.takeoutPlatform = taskRow.takeoutPlatform;
      formattedTask.takeoutOrderInfo = taskRow.takeoutOrderInfo;
      formattedTask.deliveryAddress = taskRow.deliveryAddress;
      formattedTask.locationText = taskRow.locationText;
    }

    res.status(201).send({
      message: "任务创建成功",
      task: formattedTask,
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("回滚事务失败:", rollbackError);
    }
    next(error);
  }
};

// Admin: Update any task
exports.adminUpdateTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (Number.isNaN(taskId)) {
      return res.status(400).send({ message: "任务ID格式不正确" });
    }

    const updateData = req.body || {};

    const communities = await databaseService.getAllCommunities();
    let tableName = null;
    let communityId = null;
    let existingTask = null;

    for (const community of communities) {
      try {
        const candidateTable = databaseService.getTaskTableName(community.id);
        const tableExists = await databaseService.checkShardedTableExists(
          community.id
        );
        if (!tableExists) {
          continue;
        }

        const [taskRow] = await db.sequelize.query(
          `SELECT * FROM ${candidateTable} WHERE id = ? LIMIT 1`,
          {
            replacements: [taskId],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (taskRow) {
          tableName = candidateTable;
          communityId = community.id;
          existingTask = taskRow;
          break;
        }
      } catch (error) {
        console.error(
          `[adminUpdateTask] 查询社区 ${community.id} 分表失败:`,
          error
        );
      }
    }

    if (!existingTask || !tableName) {
      return res.status(404).send({ message: "任务不存在" });
    }

    const toSqlDateTime = (value) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    const allowedFields = [
      "title",
      "description",
      "taskType",
      "rewardAmount",
      "locationText",
      "deadline",
      "status",
      "publisherId",
      "acceptorId",
      "images",
      "remarks",
      "timeRequirement",
      "budget",
      "paymentStatus",
      "acceptorDoneTime",
      "publisherConfirmedTime",
      "transferTime",
      "autoConfirmTime",
      "borrowMode",
    ];

    const setClauses = [];
    const replacements = [];

    for (const field of allowedFields) {
      if (updateData[field] === undefined) {
        continue;
      }

      let value = updateData[field];

      if (field === "images") {
        value = JSON.stringify(parseImagesField(value));
      } else if (field === "rewardAmount" || field === "budget") {
        value = value === null ? null : parseFloat(value);
        if (Number.isNaN(value)) {
          value = null;
        }
      } else if (
        [
          "deadline",
          "acceptorDoneTime",
          "publisherConfirmedTime",
          "transferTime",
          "autoConfirmTime",
        ].includes(field)
      ) {
        value = toSqlDateTime(value);
      }

      setClauses.push(`${field} = ?`);
      replacements.push(value);
    }

    const statusToUpdate = updateData.status || existingTask.status;
    if (statusToUpdate === "acceptor_done" && !updateData.acceptorDoneTime) {
      setClauses.push("acceptorDoneTime = ?");
      replacements.push(toSqlDateTime(new Date()));
    }

    if (
      statusToUpdate === "publisher_confirmed" &&
      !updateData.publisherConfirmedTime
    ) {
      setClauses.push("publisherConfirmedTime = ?");
      replacements.push(toSqlDateTime(new Date()));
    }

    const paymentStatusToUpdate =
      updateData.paymentStatus || existingTask.paymentStatus;
    if (paymentStatusToUpdate === "transferred" && !updateData.transferTime) {
      setClauses.push("transferTime = ?");
      replacements.push(toSqlDateTime(new Date()));
    }

    if (setClauses.length === 0) {
      return res.status(400).send({ message: "没有可更新的字段" });
    }

    const updateSql = `UPDATE ${tableName} SET ${setClauses.join(
      ", "
    )} WHERE id = ?`;
    replacements.push(taskId);

    await db.sequelize.query(updateSql, {
      replacements,
      type: db.sequelize.QueryTypes.UPDATE,
    });

    const [taskRow] = await db.sequelize.query(
      `
        SELECT t.*,
               p.nickname AS publisher_nickname, p.avatarUrl AS publisher_avatarUrl,
               a.nickname AS acceptor_nickname, a.avatarUrl AS acceptor_avatarUrl
        FROM ${tableName} t
        LEFT JOIN users p ON t.publisherId = p.id
        LEFT JOIN users a ON t.acceptorId = a.id
        WHERE t.id = ?
      `,
      {
        replacements: [taskId],
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    const formattedTask = formatTaskRow(taskRow);

    setNoCacheHeaders(res);
    res.status(200).send({
      message: "任务更新成功",
      task: formattedTask,
      communityId,
    });
  } catch (error) {
    next(error);
  }
};

// 首页推荐任务（最新10条）
exports.getHomeRecommendTasks = async (req, res, next) => {
  try {
    // 从所有社区分表中收集任务
    const allTasks = [];

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 从每个社区分表中获取任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          `SELECT * FROM ${tableName} WHERE status != 'cancelled' ORDER BY createdAt DESC LIMIT 10`,
          { type: db.sequelize.QueryTypes.SELECT }
        );

        allTasks.push(...tasks);
      } catch (error) {
        // 表不存在，继续查找下一个
        continue;
      }
    }

    // 按创建时间排序并取前10条
    allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const topTasks = allTasks.slice(0, 10);

    // 获取用户信息
    const userIds = [
      ...new Set([
        ...topTasks.map((task) => task.publisherId),
        ...topTasks.map((task) => task.acceptorId).filter((id) => id),
      ]),
    ];

    let users = [];
    if (userIds.length > 0) {
      users = await User.findAll({
        where: { id: { [db.Sequelize.Op.in]: userIds } },
        attributes: ["id", "nickname", "avatarUrl"],
        raw: true,
      });
    }

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    // 为任务添加用户信息
    const tasksWithUsers = topTasks.map((task) => ({
      ...task,
      publisher_nickname: userMap[task.publisherId]
        ? userMap[task.publisherId].nickname
        : null,
      publisher_avatarUrl: userMap[task.publisherId]
        ? userMap[task.publisherId].avatarUrl
        : null,
      acceptor_nickname:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].nickname
          : null,
      acceptor_avatarUrl:
        task.acceptorId && userMap[task.acceptorId]
          ? userMap[task.acceptorId].avatarUrl
          : null,
    }));

    const formattedTasks = tasksWithUsers
      .map((task) => formatTaskRow(task) || task)
      .filter(Boolean);

    res.status(200).send({ tasks: formattedTasks });
  } catch (error) {
    next(error);
  }
};

// 接单员确认完成任务
exports.acceptorConfirmDone = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const acceptorId = req.userId;
    const { confirmImages } = req.body; // 订单确认图片数组

    // 从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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
      return res.status(404).send({ message: "任务不存在" });
    }

    console.log(
      `[acceptorConfirmDone] 任务信息: ID=${task.id}, 状态=${task.status}, 接单员ID=${task.acceptorId}, 当前用户ID=${acceptorId}`
    );

    if (task.acceptorId !== acceptorId) {
      return res.status(403).send({
        message: "只有接单员可以确认完成任务",
        taskAcceptorId: task.acceptorId,
        currentUserId: acceptorId,
        mismatch: true,
      });
    }

    console.log(`[acceptorConfirmDone] 任务状态检查: 当前状态=${task.status}`);

    // 允许的状态：assigned（进行中）或 acceptor_done（接单员已确认完成）
    const allowedStatuses = ["assigned", "acceptor_done"];
    if (!allowedStatuses.includes(task.status)) {
      return res.status(400).send({
        message: "任务状态不允许确认完成",
        currentStatus: task.status,
        allowedStatuses: allowedStatuses,
      });
    }

    // 如果任务已经是 acceptor_done 状态，说明已经确认过了
    if (task.status === "acceptor_done") {
      return res.status(400).send({
        message: "任务已经确认完成，无需重复确认",
        currentStatus: task.status,
      });
    }

    // 检查是否需要上传订单确认图片
    const requireConfirmImages = [
      "取快递",
      "取外卖",
      "代购",
      "代取",
      "送货",
      "跑腿",
    ];
    const taskType = task.taskType || task.title || "";
    const needsConfirmImages = requireConfirmImages.some(
      (type) => taskType.includes(type) || task.title?.includes(type)
    );

    if (needsConfirmImages) {
      if (
        confirmImages &&
        Array.isArray(confirmImages) &&
        confirmImages.length > 0
      ) {
      } else {
      }

      // 验证图片URL格式（只在有图片时验证）
      if (
        confirmImages &&
        Array.isArray(confirmImages) &&
        confirmImages.length > 0
      ) {
        const isValidImageUrl = (url) => {
          return (
            typeof url === "string" &&
            (url.startsWith("http://") || url.startsWith("https://")) &&
            (url.includes("/订单确认/") || url.includes("orderConfirm"))
          );
        };

        const invalidImages = confirmImages.filter(
          (img) => !isValidImageUrl(img)
        );
        if (invalidImages.length > 0) {
          return res.status(400).send({
            message: "订单确认图片格式不正确，请重新上传",
            requireImages: true,
          });
        }
      }
    }

    // 更新订单状态
    const autoConfirmTime = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3小时后自动确认

    console.log(`[acceptorConfirmDone] 订单 ${taskId} 接单员确认完成`);
    console.log(
      `[acceptorConfirmDone] 设置自动确认时间: ${autoConfirmTime.toISOString()}`
    );
    console.log(`[acceptorConfirmDone] 当前时间: ${new Date().toISOString()}`);
    console.log(`[acceptorConfirmDone] 将在3小时后自动确认`);

    // 更新任务状态到分表
    if (communityId) {
      const tableName = `tasks_community_${communityId}`;

      // 构建更新数据
      const updateData = {
        status: "acceptor_done",
        acceptorDoneTime: new Date(),
        autoConfirmTime: autoConfirmTime,
      };

      // 如果有确认图片，添加到更新数据中
      if (confirmImages && confirmImages.length > 0) {
        updateData.confirmImages = JSON.stringify(confirmImages);
      }

      // 构建动态SQL
      const setClause = Object.keys(updateData)
        .map((key) => {
          if (key === "acceptorDoneTime" || key === "autoConfirmTime") {
            return `${key} = ?`;
          } else {
            return `${key} = ?`;
          }
        })
        .join(", ");

      const values = Object.values(updateData);
      values.push(taskId); // 添加WHERE条件的值

      await db.sequelize.query(
        `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
        {
          replacements: values,
          type: db.sequelize.QueryTypes.UPDATE,
        }
      );
    } else {
      console.error("[acceptorConfirmDone] 错误：未找到社区ID");
      return res
        .status(500)
        .send({ message: "服务器内部错误：无法更新任务状态" });
    }

    // 发送任务送达通知
    setImmediate(async () => {
      try {
        // 获取用户信息
        const userIds = [task.publisherId, task.acceptorId].filter((id) => id);
        let users = [];
        if (userIds.length > 0) {
          users = await User.findAll({
            where: { id: { [db.Sequelize.Op.in]: userIds } },
            attributes: ["id", "nickname", "openid"],
            raw: true,
          });
        }

        const userMap = {};
        users.forEach((user) => {
          userMap[user.id] = user;
        });

        // 构建任务对象
        const taskWithRelations = {
          ...task,
          publisher: userMap[task.publisherId] || null,
          acceptor: task.acceptorId ? userMap[task.acceptorId] || null : null,
        };

        await wechatNotificationService.notifyTaskDelivered(
          taskWithRelations,
          taskWithRelations.acceptor
        );
      } catch (error) {
        console.error("❌ [acceptorConfirmDone] 发送任务送达通知失败:", error);
      }
    });

    res.status(200).send({
      message: "任务完成确认成功，等待发布者确认",
      task: {
        ...task,
        confirmImages: confirmImages || null,
      },
      confirmImages: confirmImages || null,
    });
  } catch (error) {
    next(error);
  }
};

// 发布者确认完成任务
exports.publisherConfirmDone = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const publisherId = req.userId;

    // 先尝试从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id, name FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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

    // 主表已删除，只从分表查找

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

    // 更新订单状态
    task.status = "publisher_confirmed";
    task.publisherConfirmedTime = new Date();

    // 计算平台费用和接单员费用
    const fees = calculateFees(task.rewardAmount, task);
    task.platformFee = fees.platformFee;
    task.acceptorFee = fees.acceptorFee;

    // 更新paymentStatus为transferred（仅当当前为paid时）
    if (task.paymentStatus === "paid") {
      task.paymentStatus = "transferred";
    }

    // 更新任务状态
    if (communityId) {
      // 分表任务，使用原始SQL更新
      const tableName = `tasks_community_${communityId}`;
      await db.sequelize.query(
        `UPDATE ${tableName} SET status = ?, publisherConfirmedTime = NOW(), platformFee = ?, acceptorFee = ?, paymentStatus = ? WHERE id = ? AND paymentStatus = 'paid'`,
        {
          replacements: [
            "publisher_confirmed",
            task.platformFee,
            task.acceptorFee,
            "transferred", // 将paymentStatus从paid更新为transferred
            taskId,
          ],
          type: db.sequelize.QueryTypes.UPDATE,
        }
      );
    } else {
      // 主表任务，使用Sequelize更新
      await task.save();
    }

    console.log(`[publisherConfirmDone] 任务状态已更新:`, {
      taskId: task.id,
      taskType: task.taskType,
      borrowMode: task.borrowMode,
      status: task.status,
      paymentStatus: task.paymentStatus,
    });

    // 发送任务完成通知
    setImmediate(async () => {
      try {
        // 获取发布者和接单员信息
        const publisher = await User.findByPk(task.publisherId, {
          attributes: ["id", "nickname", "openid"],
        });
        const acceptor = await User.findByPk(task.acceptorId, {
          attributes: ["id", "nickname", "openid"],
        });

        // 构建包含关联数据的任务对象
        const taskWithRelations = {
          ...task,
          publisher,
          acceptor,
        };

        await wechatNotificationService.notifyTaskCompleted(
          taskWithRelations,
          "both"
        );

        // 发送系统消息给发布者和接单员
        try {
          const SystemMessageService = require("../services/systemMessageService");

          // 发送给发布者
          await SystemMessageService.sendOrderCompleted(
            taskWithRelations.publisher.id,
            taskWithRelations
          );

          // 发送给接单员
          await SystemMessageService.sendOrderCompleted(
            taskWithRelations.acceptor.id,
            taskWithRelations
          );
        } catch (error) {
          console.error("❌ [publisherConfirmDone] 发送系统消息失败:", error);
        }
      } catch (error) {
        console.error("❌ [publisherConfirmDone] 发送任务完成通知失败:", error);
      }
    });

    // 触发打款给接单员
    // 确保task对象包含communityId，供transferToAcceptor使用
    if (communityId) {
      task.communityId = communityId;
    }

    if (task.taskType === "借物品") {
      // 借物品任务使用WalletService处理资金分配
      await WalletService.processTaskCompletion(
        task.id,
        task.acceptorId,
        task.rewardAmount,
        communityId // 传入communityId
      );
    } else if (task.taskType === "帮我买") {
      // 帮我买任务使用专门的资金分配方法
      await WalletService.processBuyTaskCompletion(task, task.acceptorId);
    } else {
      // 其他任务类型使用原有逻辑
      if (!task.communityId) {
        console.error(
          `[publisherConfirmDone] 任务 ${task.id} 缺少communityId，无法执行打款`
        );
        return res.status(500).send({ message: "任务信息不完整，无法打款" });
      }
      await transferToAcceptor(task);
    }

    res.status(200).send({
      message: "任务确认完成，已打款给接单员",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// 自动确认完成任务（定时任务调用）
exports.autoConfirmDone = async (req, res, next) => {
  try {
    const now = new Date();
    console.log(`[autoConfirmDone] 开始检查需要自动确认的订单...`);
    console.log(`[autoConfirmDone] 当前时间: ${now.toISOString()}`);

    // 先查询所有acceptor_done状态的订单，用于调试
    const allAcceptorDoneTasks = [];

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

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
      `[autoConfirmDone] 找到 ${allAcceptorDoneTasks.length} 个acceptor_done状态的订单:`
    );
    allAcceptorDoneTasks.forEach((task) => {
      const timeDiff = task.autoConfirmTime
        ? Math.floor((task.autoConfirmTime - now) / (1000 * 60 * 60))
        : "N/A";
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
      `[autoConfirmDone] 找到 ${tasksToAutoConfirm.length} 个需要自动确认的订单`
    );

    let confirmedCount = 0;
    let failedCount = 0;

    for (const task of tasksToAutoConfirm) {
      try {
        // 计算平台费用和接单员费用
        const fees = calculateFees(task.rewardAmount, task);

        // 找到任务所在的社区分表并更新
        let updated = false;
        for (const community of communities) {
          const tableName = `tasks_community_${community.id}`;

          try {
            const result = await db.sequelize.query(
              `UPDATE ${tableName} SET status = ?, publisherConfirmedTime = ?, platformFee = ?, acceptorFee = ? WHERE id = ?`,
              {
                replacements: [
                  "publisher_confirmed",
                  now,
                  fees.platformFee,
                  fees.acceptorFee,
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
          console.error(`[autoConfirmDone] 无法找到任务 ${task.id} 所在的分表`);
          failedCount++;
          continue;
        }

        // 触发打款给接单员
        if (task.taskType === "借物品") {
          // 借物品任务使用WalletService处理资金分配
          await WalletService.processTaskCompletion(
            task.id,
            task.acceptorId,
            task.rewardAmount
          );
        } else if (task.taskType === "帮我买") {
          // 帮我买任务使用专门的资金分配方法
          await WalletService.processBuyTaskCompletion(task, task.acceptorId);
        } else {
          // 其他任务类型使用原有逻辑
          await transferToAcceptor(task);
        }

        confirmedCount++;
      } catch (error) {
        failedCount++;
        console.error(`[autoConfirmDone] 自动确认订单 ${task.id} 失败:`, error);
      }
    }

    console.log(
      `[autoConfirmDone] 自动确认完成: 成功 ${confirmedCount} 个, 失败 ${failedCount} 个`
    );

    res.status(200).send({
      message: `自动确认了 ${confirmedCount} 个订单`,
      confirmedCount,
      failedCount,
      totalAcceptorDone: allAcceptorDoneTasks.length,
      now: now.toISOString(),
    });
  } catch (error) {
    console.error(`[autoConfirmDone] 自动确认任务执行失败:`, error);
    next(error);
  }
};

// 获取用户完成任务数量
exports.getCompletedTasksCount = async (req, res) => {
  try {
    const userId = req.userId;

    // 从所有分表中查询完成任务数量
    let totalCount = 0;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 遍历所有社区分表查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const countResult = await db.sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName} WHERE acceptorId = ? AND status IN ('completed', 'finished', 'publisher_confirmed')`,
          {
            replacements: [userId],
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (countResult[0]?.count > 0) {
          totalCount += parseInt(countResult[0].count);
        }
      } catch (error) {
        // 表不存在，继续查找下一个
        continue;
      }
    }

    res.json({
      success: true,
      data: {
        count: totalCount,
      },
    });
  } catch (error) {
    console.error("获取完成任务数量失败:", error);
    res.status(500).json({
      success: false,
      message: "获取完成任务数量失败",
      error: error.message,
    });
  }
};

// 转单功能
exports.transferTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { newAcceptorId } = req.body;
    const currentUserId = req.userId;

    // 验证任务是否存在且当前用户是接单员
    const task = await Task.findByPk(taskId, {
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

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "任务不存在",
      });
    }

    if (task.acceptorId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "您不是此任务的接单员",
      });
    }

    if (task.status !== "assigned" && task.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "只有进行中的任务才能转单",
      });
    }

    // 验证新接单员是否存在且是团队成员
    const newAcceptor = await User.findByPk(newAcceptorId);
    if (!newAcceptor) {
      return res.status(404).json({
        success: false,
        message: "新接单员不存在",
      });
    }

    // 检查新接单员是否是团队成员
    const teamMember = await TeamMember.findOne({
      where: {
        userId: newAcceptorId,
        status: "active",
      },
    });

    if (!teamMember) {
      return res.status(400).json({
        success: false,
        message: "新接单员不是团队成员",
      });
    }

    // 更新任务
    await task.update({
      acceptorId: newAcceptorId,
    });

    // 发送系统消息给发布者
    try {
      const SystemMessageService = require("../services/systemMessageService");
      await SystemMessageService.createSystemMessage({
        userId: task.publisherId,
        type: "other",
        title: "订单转单通知",
        content: `您的订单"${task.title}"已转单给团队成员"${
          newAcceptor.nickname
        }"。\n\n转单时间：${new Date().toLocaleString()}\n\n新接单员将负责处理此订单。`,
        summary: `订单"${task.title}"已转单给团队成员"${newAcceptor.nickname}"`,
        relatedId: task.id,
        relatedType: "task",
        extraData: {
          taskId: task.id,
          taskTitle: task.title,
          newAcceptorId: newAcceptorId,
          newAcceptorName: newAcceptor.nickname,
          transferredAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("❌ [transferTask] 发送系统消息给发布者失败:", error);
    }

    // 发送系统消息给新接单员
    try {
      const SystemMessageService = require("../services/systemMessageService");
      await SystemMessageService.createSystemMessage({
        userId: newAcceptorId,
        type: "other",
        title: "收到转单任务",
        content: `您收到了转单任务"${task.title}"，请及时处理。\n\n任务奖励：${task.rewardAmount}元\n\n请尽快联系发布者确认任务详情。`,
        summary: `您收到了转单任务"${task.title}"`,
        relatedId: task.id,
        relatedType: "task",
        extraData: {
          taskId: task.id,
          taskTitle: task.title,
          rewardAmount: task.rewardAmount,
          transferredAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("❌ [transferTask] 发送系统消息给新接单员失败:", error);
    }

    // 发送微信通知
    try {
      if (task.publisher.openid) {
        await wechatNotificationService.sendTaskTransferNotification(
          task.publisher.openid,
          task.title,
          newAcceptor.nickname
        );
      }
      if (newAcceptor.openid) {
        await wechatNotificationService.sendTaskAssignedNotification(
          newAcceptor.openid,
          task.title,
          task.rewardAmount
        );
      }
    } catch (notificationError) {
      console.error("发送微信通知失败:", notificationError);
    }

    res.json({
      success: true,
      message: "转单成功",
      data: {
        taskId: taskId,
        newAcceptorId: newAcceptorId,
        newAcceptorName: newAcceptor.nickname,
      },
    });
  } catch (error) {
    console.error("转单失败:", error);
    res.status(500).json({
      success: false,
      message: "转单失败",
      error: error.message,
    });
  }
};

// 驳回订单功能
exports.rejectTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const currentUserId = req.userId;

    // 先尝试从分表中查找任务
    let task = null;
    let communityId = null;

    // 获取所有社区
    const communities = await db.sequelize.query(
      "SELECT id, name FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // 在每个社区的分表中查找任务
    for (const community of communities) {
      const tableName = `tasks_community_${community.id}`;

      try {
        const tasks = await db.sequelize.query(
          "SELECT * FROM " + tableName + " WHERE id = ?",
          {
            replacements: [taskId],
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

    // 获取发布者和接单员信息
    const publisher = await User.findByPk(task.publisherId, {
      attributes: ["id", "nickname", "openid"],
    });
    const acceptor = await User.findByPk(task.acceptorId, {
      attributes: ["id", "nickname", "openid"],
    });

    // 添加用户信息到任务对象
    task.publisher = publisher;
    task.acceptor = acceptor;

    console.log("[rejectTask] 权限检查:", {
      taskAcceptorId: task.acceptorId,
      currentUserId: currentUserId,
      isEqual: task.acceptorId === currentUserId,
      taskId: taskId,
    });

    if (task.acceptorId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "您不是此任务的接单员",
      });
    }

    if (task.status !== "assigned" && task.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "只有进行中的任务才能驳回",
      });
    }

    // 处理借物品任务的取消逻辑
    if (task.taskType === "借物品" && task.borrowMode === "lend") {
      // 借出模式：借入者取消订单，需要全额退款

      if (task.out_trade_no) {
        try {
          const wechatPayRefundService = require("../services/wechatPayRefundService");
          const refundNo =
            "REFUND" + Date.now() + Math.floor(Math.random() * 10000);

          // 从任务详情中解析押金和租金
          const specifics = task.specifics || "";
          const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
          const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);

          const deposit = parseFloat(depositMatch ? depositMatch[1] : 0);
          const dailyRent = parseFloat(rentMatch ? rentMatch[1] : 0);

          // 根据用户选择的借用时间计算实际天数
          let days = 1; // 默认1天
          const borrowTimeMatch = specifics.match(/借用时间: (.+)/);
          if (borrowTimeMatch) {
            const timeRange = borrowTimeMatch[1];
            const dateMatch = timeRange.match(
              /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
            );
            if (dateMatch) {
              const startDate = new Date(dateMatch[1]);
              const endDate = new Date(dateMatch[2]);
              const diffTime = Math.abs(endDate - startDate);
              days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
          }

          const totalRent = dailyRent * days;
          const totalAmount = deposit + totalRent;

          const refundResult = await wechatPayRefundService.applyRefund(
            task.out_trade_no,
            refundNo,
            totalAmount,
            totalAmount,
            "借物品订单取消"
          );

          if (refundResult.success) {
          } else {
            console.error(`[rejectTask] 退款失败:`, {
              error: refundResult.error,
              error_code: refundResult.error_code,
              refund_status: refundResult.refund_status,
            });
          }
        } catch (refundError) {
          console.error(`[rejectTask] 退款处理失败:`, refundError);
        }
      }
    }

    // 更新任务状态为开放状态（使用原始SQL更新分表）
    const updateQuery = `
      UPDATE tasks_community_${communityId} 
      SET acceptorId = NULL, status = 'open' 
      WHERE id = ?
    `;

    await db.sequelize.query(updateQuery, {
      replacements: [taskId],
      type: db.sequelize.QueryTypes.UPDATE,
    });

    // 发送系统消息给发布者
    try {
      const SystemMessageService = require("../services/systemMessageService");
      const result = await SystemMessageService.sendOrderRejected(
        task.publisherId,
        task,
        "接单员无法及时处理"
      );
    } catch (error) {
      console.error("❌ [rejectTask] 发送系统消息给发布者失败:", error);
      console.error("❌ [rejectTask] 错误详情:", error.message);
      console.error("❌ [rejectTask] 错误堆栈:", error.stack);
    }

    // 发送系统消息给原接单员
    try {
      const SystemMessageService = require("../services/systemMessageService");
      await SystemMessageService.createSystemMessage({
        userId: currentUserId,
        type: "order_rejected",
        title: "订单驳回确认",
        content: `您已驳回订单"${
          task.title
        }"，该订单已返回订单大厅。\n\n驳回时间：${new Date().toLocaleString()}\n\n订单已重新开放，其他接单员可以接取。`,
        summary: `您已驳回订单"${task.title}"`,
        relatedId: task.id,
        relatedType: "task",
        extraData: {
          taskId: task.id,
          taskTitle: task.title,
          rejectedBy: "self",
          rejectedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("❌ [rejectTask] 发送系统消息给接单员失败:", error);
    }

    // 发送微信通知
    try {
      if (task.publisher.openid) {
        await wechatNotificationService.sendTaskRejectedNotification(
          task.publisher.openid,
          task.title
        );
      }
    } catch (notificationError) {
      console.error("发送微信通知失败:", notificationError);
    }

    res.json({
      success: true,
      message: "订单已驳回",
      data: {
        taskId: taskId,
        status: "open",
      },
    });
  } catch (error) {
    console.error("驳回订单失败:", error);
    res.status(500).json({
      success: false,
      message: "驳回订单失败",
      error: error.message,
    });
  }
};

// 带缓存的任务获取方法
exports.getAllTasksWithCache = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      taskType = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "DESC",
      version = "campus",
    } = req.query;

    // 生成缓存键
    const cacheKey = `tasks:list:${JSON.stringify({
      page,
      limit,
      search,
      taskType,
      status,
      sortBy,
      sortOrder,
      version,
    })}`;

    // 使用缓存包装器
    const result = await cacheService.wrap("taskList", cacheKey, async () => {
      const offset = (page - 1) * limit;

      let whereCondition = {
        version: version,
      };

      if (status) {
        whereCondition.status = status;
      }
      if (search) {
        whereCondition.title = { [Op.like]: `%${search}%` };
      }
      if (taskType) {
        whereCondition.taskType = taskType;
      } else {
        whereCondition.taskType = { [Op.ne]: "找搭子" };
      }

      const order = [[sortBy, sortOrder.toUpperCase()]];

      // 使用读连接（从库）
      const connection = databaseService.getSlave();
      const Task = connection.models.Task;
      const User = connection.models.User;

      const { count, rows } = await Task.findAndCountAll({
        where: whereCondition,
        attributes: [
          "id",
          "title",
          "description",
          "taskType",
          "rewardAmount",
          "status",
          "createdAt",
          "publisherId",
          "acceptorId",
          "acceptedAt",
          "deadline",
          "locationText",
          "specifics",
          "remarks",
          "publisherConfirmedTime",
          "acceptorDoneTime",
          "out_trade_no",
          "borrowMode",
          "autoOfflineDate",
          "images",
        ],
        include: [
          {
            model: User,
            as: "publisher",
            attributes: ["id", "nickname", "avatarUrl"],
          },
          {
            model: User,
            as: "acceptor",
            attributes: ["id", "nickname", "avatarUrl"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: order,
      });

      return {
        totalItems: count,
        tasks: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      };
    });

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

// 带缓存的任务详情获取方法
exports.getTaskByIdWithCache = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 使用缓存包装器
    const task = await cacheService.wrap("taskDetail", id, async () => {
      // 使用读连接（从库）
      const connection = databaseService.getSlave();
      const Task = connection.models.Task;
      const User = connection.models.User;

      return await Task.findByPk(id, {
        attributes: [
          "id",
          "title",
          "description",
          "taskType",
          "rewardAmount",
          "status",
          "createdAt",
          "publisherId",
          "acceptorId",
          "acceptedAt",
          "deadline",
          "locationText",
          "specifics",
          "remarks",
          "publisherConfirmedTime",
          "acceptorDoneTime",
          "out_trade_no",
          "borrowMode",
          "autoOfflineDate",
          "images",
        ],
        include: [
          {
            model: User,
            as: "publisher",
            attributes: ["id", "nickname", "avatarUrl"],
          },
          {
            model: User,
            as: "acceptor",
            attributes: ["id", "nickname", "avatarUrl"],
            required: false,
          },
        ],
      });
    });

    if (!task) {
      return res.status(404).json({ message: "任务不存在" });
    }

    const taskPlain = typeof task.toJSON === "function" ? task.toJSON() : task;
    taskPlain.images = parseImagesField(taskPlain.images);

    res.status(200).json(taskPlain);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理任务取消逻辑
 * @param {Object} task - 任务信息
 * @param {number} communityId - 社区ID
 */
async function handleTaskCancellation(task, communityId) {
  try {
    console.log(
      `[handleTaskCancellation] 处理任务取消: ${task.id}, 任务类型: ${task.taskType}, 借出模式: ${task.borrowMode}`
    );

    // 借出模式（lend）的任务发布者没有付款，直接取消，无需退款
    if (task.taskType === "借物品" && task.borrowMode === "lend") {
      console.log(
        `[handleTaskCancellation] 借出模式任务 ${task.id} 无需退款，直接取消`
      );
      return;
    }

    // 其他任务类型：如果已支付且有订单号，需要退款
    if (task.paymentStatus === "paid" && task.out_trade_no) {
      console.log(`[handleTaskCancellation] 任务 ${task.id} 需要退款处理`);

      // 调用退款服务
      const refundNo =
        "CANCEL_REFUND" + Date.now() + Math.floor(Math.random() * 10000);

      let totalAmount = 0;
      let refundAmount = 0;

      if (task.taskType === "帮我买") {
        // 帮我买任务：实际支付金额 = rewardAmount + budget + 0.1
        const budget = parseFloat(task.budget) || 0;
        const reward = parseFloat(task.rewardAmount) || 0;
        const platformFee = 0.1;
        totalAmount = budget + reward + platformFee;
        refundAmount = totalAmount;
      } else {
        // 其他任务类型：只退还跑腿费
        totalAmount = parseFloat(task.rewardAmount) || 0;
        refundAmount = totalAmount;
      }

      const refundResult = await wechatPayRefundService.applyRefund(
        task.out_trade_no,
        refundNo,
        totalAmount,
        refundAmount,
        "用户取消订单"
      );

      if (refundResult.success) {
        console.log(`[handleTaskCancellation] 任务 ${task.id} 退款成功`);

        // 更新支付状态为已退款
        if (communityId) {
          const tableName = `tasks_community_${communityId}`;
          await db.sequelize.query(
            `UPDATE ${tableName} SET paymentStatus = 'refunded' WHERE id = ?`,
            {
              replacements: [task.id],
              type: db.sequelize.QueryTypes.UPDATE,
            }
          );
        }
      } else {
        console.error(
          `[handleTaskCancellation] 任务 ${task.id} 退款失败:`,
          refundResult.error
        );
      }
    } else {
      console.log(
        `[handleTaskCancellation] 任务 ${task.id} 未支付或无订单号，无需退款`
      );
    }
  } catch (error) {
    console.error(`[handleTaskCancellation] 处理任务取消失败:`, error);
  }
}

/**
 * 处理任务取消的退款逻辑
 * @param {Object} task - 任务信息
 * @param {number} communityId - 社区ID
 */
async function handleTaskCancellation(task, communityId) {
  try {
    console.log(
      `[handleTaskCancellation] 处理任务 ${task.id} 取消，任务类型: ${task.taskType}, 借物模式: ${task.borrowMode}`
    );

    // 借出模式（lend）的任务发布者没有付款，不需要退款
    if (task.taskType === "借物品" && task.borrowMode === "lend") {
      console.log(
        `[handleTaskCancellation] 借出模式任务 ${task.id} 无需退款，直接取消`
      );
      return;
    }

    // 其他任务类型：检查是否需要退款
    if (task.paymentStatus === "paid" && task.out_trade_no) {
      console.log(
        `[handleTaskCancellation] 任务 ${task.id} 需要退款，开始处理...`
      );

      try {
        // 计算退款金额
        let refundAmount = 0;
        let totalAmount = 0;

        if (task.taskType === "帮我买") {
          // 帮我买任务：实际支付金额 = rewardAmount（跑腿费）+ budget（预算）+ 0.1（服务费）
          const budget = parseFloat(task.budget) || 0;
          const reward = parseFloat(task.rewardAmount) || 0;
          const platformFee = 0.1;
          totalAmount = budget + reward + platformFee;
          refundAmount = totalAmount;
        } else if (task.taskType === "借物品" && task.borrowMode === "borrow") {
          // 借进模式：需要从specifics中解析押金和租金
          const specifics = task.specifics || "";
          const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
          const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);

          const deposit = parseFloat(depositMatch ? depositMatch[1] : 0);
          const dailyRent = parseFloat(rentMatch ? rentMatch[1] : 0);

          // 根据用户选择的借用时间计算实际天数
          let days = 1; // 默认1天
          const borrowTimeMatch = specifics.match(/借用时间: (.+)/);
          if (borrowTimeMatch) {
            const timeRange = borrowTimeMatch[1];
            const dateMatch = timeRange.match(
              /(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
            );
            if (dateMatch) {
              const startDate = new Date(dateMatch[1]);
              const endDate = new Date(dateMatch[2]);
              const diffTime = Math.abs(endDate - startDate);
              days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
          }

          const totalRent = dailyRent * days;
          totalAmount = deposit + totalRent;
          refundAmount = totalAmount;
        } else {
          // 其他任务类型：只退还跑腿费
          totalAmount = parseFloat(task.rewardAmount) || 0;
          refundAmount = totalAmount;
        }

        // 申请退款
        const refundNo =
          "CANCEL_REFUND" + Date.now() + Math.floor(Math.random() * 10000);

        const refundResult = await wechatPayRefundService.applyRefund(
          task.out_trade_no,
          refundNo,
          totalAmount,
          refundAmount,
          "用户取消订单"
        );

        if (refundResult.success) {
          console.log(`[handleTaskCancellation] 任务 ${task.id} 退款申请成功`);

          // 更新任务支付状态为已退款
          const tableName = `tasks_community_${communityId}`;
          await db.sequelize.query(
            `UPDATE ${tableName} SET paymentStatus = 'refunded' WHERE id = ?`,
            {
              replacements: [task.id],
              type: db.sequelize.QueryTypes.UPDATE,
            }
          );

          console.log(
            `[handleTaskCancellation] 任务 ${task.id} 支付状态已更新为已退款`
          );
        } else {
          console.error(
            `[handleTaskCancellation] 任务 ${task.id} 退款失败:`,
            refundResult.error
          );
        }
      } catch (refundError) {
        console.error(
          `[handleTaskCancellation] 任务 ${task.id} 退款处理失败:`,
          refundError
        );
      }
    } else {
      console.log(
        `[handleTaskCancellation] 任务 ${task.id} 无需退款 (paymentStatus: ${task.paymentStatus}, out_trade_no: ${task.out_trade_no})`
      );
    }
  } catch (error) {
    console.error(`[handleTaskCancellation] 处理任务取消失败:`, error);
  }
}
