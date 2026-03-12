const db = require("../models");
const Chat = db.Chat;
const Task = db.Task;
const User = db.User;

// 工具: 规范化ID（过滤 'null'/'undefined' 字符串）
const normalizeId = (value) => {
  if (value === undefined || value === null) return null;
  if (value === "null" || value === "undefined" || value === "") return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

// 获取聊天消息
exports.getMessages = async (req, res, next) => {
  try {
    const taskIdRaw = req.query.taskId;
    const campusResourceIdRaw = req.query.campusResourceId;
    const otherUserId = req.query.otherUserId;
    const taskId = normalizeId(taskIdRaw);
    const campusResourceId = normalizeId(campusResourceIdRaw);
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;
    const offset = (page - 1) * limit;

    // 兼容任务、找搭子或按用户ID
    let whereBase = {};
    if (otherUserId) {
      // 按用户ID加载消息 - 获取当前用户与指定用户之间的所有消息
      whereBase = {
        [db.Sequelize.Op.or]: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      };
    } else if (taskId !== null) {
      // 验证任务权限 - 从分表中查找任务
      let task = null;

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
      if (task.publisherId !== userId && task.acceptorId !== userId) {
        return res.status(403).send({ message: "无权限查看此聊天" });
      }
      whereBase.taskId = taskId;
    } else if (campusResourceId !== null) {
      // 校园互动内容需要从分表查询，但聊天功能暂时跳过权限验证
      // TODO: 实现分表查询权限验证
      console.log(
        `[getMessages] 用户 ${userId} 查看校园互动内容 ${campusResourceId} 聊天，跳过权限验证`
      );
      whereBase.campusResourceId = campusResourceId;
    } else {
      return res.status(400).send({ message: "缺少关联ID" });
    }

    const { count, rows } = await Chat.findAndCountAll({
      where: {
        ...whereBase,
        messageType: {
          [db.Sequelize.Op.ne]: "system", // 排除系统消息
        },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "nickname", "avatarUrl"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 处理撤回消息的显示逻辑
    const processedMessages = rows.map((message) => {
      if (message.messageType === "recall" && message.isRecalled) {
        // 根据当前用户和消息发送者的关系显示不同的撤回文本
        if (message.senderId === userId) {
          // 当前用户是发送者，显示"您撤回了一条消息"
          message.content = "您撤回了一条消息";
        } else {
          // 当前用户是接收者，显示"对方撤回了一条消息"
          message.content = "对方撤回了一条消息";
        }
      }
      return message;
    });

    res.status(200).send({
      messages: processedMessages,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// 发送消息
exports.sendMessage = async (req, res, next) => {
  try {
    const taskId = normalizeId(req.body.taskId);
    const campusResourceId = normalizeId(req.body.campusResourceId);
    const { receiverId, content, messageType = "text" } = req.body;
    const senderId = req.userId;

    // 禁止通过聊天API创建系统消息
    if (messageType === "system") {
      return res.status(400).json({
        success: false,
        message: "系统消息应通过系统消息API创建，不能通过聊天API创建",
      });
    }

    // 支持任务或找搭子
    let task = null;
    let cr = null;
    if (taskId) {
      // 从分表中查找任务
      const communities = await db.sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: db.sequelize.QueryTypes.SELECT }
      );

      for (const community of communities) {
        const tableName = `tasks_community_${community.id}`;

        try {
          const tasks = await db.sequelize.query(
            "SELECT * FROM " + tableName + " WHERE id = ?",
            {
              replacements: [parseInt(taskId)],
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
    } else if (campusResourceId) {
      // 校园互动内容需要从分表查询，暂时跳过验证
      // TODO: 实现分表查询权限验证
      console.log(
        `[sendMessage] 校园互动内容 ${campusResourceId} 聊天，跳过权限验证`
      );
      cr = { createdBy: null }; // 临时设置，允许发送消息
    }

    if (!task && !cr) {
      return res.status(404).send({ message: "关联对象不存在" });
    }

    // 验证发送者是否有权限

    // 验证发送者是否存在
    const sender = await User.findByPk(senderId);
    if (!sender) {
      return res.status(404).send({ message: "发送者不存在" });
    }

    // 验证接收者是否存在

    // 如果receiverId未定义，根据任务或找搭子自动确定接收者
    let finalReceiverId = receiverId;
    if (!finalReceiverId) {
      if (task) {
        // 对于任务，发送者如果是发布者，接收者就是接单者；反之亦然
        if (task.publisherId === senderId) {
          // 发送者是发布者，接收者应该是接单者
          finalReceiverId = task.acceptorId;
        } else if (task.acceptorId === senderId) {
          // 发送者是接单者，接收者应该是发布者
          finalReceiverId = task.publisherId;
        } else {
          // 发送者既不是发布者也不是接单者，默认发给发布者
          finalReceiverId = task.publisherId;
        }
      } else if (cr) {
        // 对于校园互动内容，接收者通常是发布者
        finalReceiverId = cr.createdBy;
      }
    }

    if (!finalReceiverId) {
      return res.status(400).send({ message: "无法确定接收者" });
    }

    const receiver = await User.findByPk(finalReceiverId);
    if (!receiver) {
      return res.status(404).send({ message: "接收者不存在" });
    }

    // 对于任务，只有发布者和接单者可以发送消息
    if (task && task.publisherId !== senderId && task.acceptorId !== senderId) {
      return res.status(403).send({ message: "无权限发送任务消息" });
    }

    // 如果任务还没有接单者（acceptorId为NULL），只允许发布者发送消息
    if (task && !task.acceptorId && task.publisherId !== senderId) {
      return res
        .status(403)
        .send({ message: "任务未接单，只有发布者可以发送消息" });
    }

    if (cr && cr.createdBy !== senderId) {
      // 不是发布者，但允许发送消息给发布者
      console.log(
        `[sendMessage] 用户 ${senderId} 向校园互动内容 ${campusResourceId} 发布者发送消息，允许`
      );
    }

    // 验证接收者是否为任务相关方
    if (task) {
    }

    // 验证接收者是否为任务相关方
    if (task) {
      // 如果任务有接单者，接收者必须是发布者或接单者
      if (
        task.acceptorId &&
        task.publisherId !== finalReceiverId &&
        task.acceptorId !== finalReceiverId
      ) {
        return res.status(400).send({ message: "任务接收者无效" });
      }
      // 如果任务没有接单者，接收者必须是发布者
      if (!task.acceptorId && task.publisherId !== finalReceiverId) {
        return res
          .status(400)
          .send({ message: "任务未接单，接收者必须是发布者" });
      }
    }

    if (cr && cr.createdBy !== finalReceiverId) {
      // 对于校园互动内容，接收者主要应该是发布者
      return res.status(400).send({ message: "接收者无效" });
    }

    // 创建消息

    // 直接创建消息，messageType字段在数据库中存在
    const messageData = {
      taskId: task ? taskId : null,
      campusResourceId: cr ? campusResourceId : null,
      senderId,
      receiverId: finalReceiverId,
      content,
      messageType,
    };

    // 尝试创建消息 - 使用原始SQL绕过Sequelize验证
    let message;
    try {
      // 使用原始SQL插入，避免Sequelize验证
      const [result] = await db.sequelize.query(
        `INSERT INTO chats (taskId, campusResourceId, senderId, receiverId, content, messageType, isRead, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            messageData.taskId,
            messageData.campusResourceId,
            messageData.senderId,
            messageData.receiverId,
            messageData.content,
            messageData.messageType,
            false, // 消息初始状态为未读
          ],
          type: db.sequelize.QueryTypes.INSERT,
        }
      );

      // 获取插入的ID
      // MySQL在不同配置下返回的result结构可能不同
      // 有时是 { insertId: 74 }，有时直接是 74
      let insertId;
      if (typeof result === "number") {
        insertId = result;
      } else if (result && typeof result === "object") {
        insertId = result.insertId || result[0]?.insertId || result[0]?.id;
      }

      // 如果仍然无法获取ID，记录错误信息
      if (!insertId) {
        console.error(
          "[sendMessage] 无法获取插入的消息ID，result结构:",
          result
        );
      }

      // 创建消息对象用于后续处理
      message = {
        id: insertId,
        ...messageData,
        isRead: false, // 消息初始状态为未读
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (createError) {
      console.error("[sendMessage] 创建消息失败:", createError);
      console.error("[sendMessage] 创建失败详情:", {
        name: createError.name,
        message: createError.message,
        sql: createError.sql,
        sqlMessage: createError.sqlMessage,
      });
      throw createError;
    }

    // 获取完整的消息信息
    try {
      // 检查message.id是否存在
      if (!message.id) {
        console.error("[sendMessage] message.id 不存在，返回基本消息");
        res.status(201).send({
          message: message,
        });
        return;
      }

      // 使用原始SQL查询来确保能获取到刚插入的消息
      const fullMessageResult = await db.sequelize.query(
        `SELECT c.*, 
                s.id as sender_id, s.nickname as sender_nickname, s.avatarUrl as sender_avatarUrl,
                r.id as receiver_id, r.nickname as receiver_nickname, r.avatarUrl as receiver_avatarUrl
         FROM chats c
         LEFT JOIN users s ON c.senderId = s.id
         LEFT JOIN users r ON c.receiverId = r.id
         WHERE c.id = ?`,
        {
          replacements: [message.id],
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      if (fullMessageResult && fullMessageResult.length > 0) {
        const msg = fullMessageResult[0];
        const fullMessage = {
          id: msg.id,
          taskId: msg.taskId,
          campusResourceId: msg.campusResourceId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          messageType: msg.messageType,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
          sender: {
            id: msg.sender_id,
            nickname: msg.sender_nickname,
            avatarUrl: msg.sender_avatarUrl,
          },
          receiver: {
            id: msg.receiver_id,
            nickname: msg.receiver_nickname,
            avatarUrl: msg.receiver_avatarUrl,
          },
        };

        res.status(201).send({
          message: fullMessage,
        });
      } else {
        // 如果查询失败，返回基本消息
        res.status(201).send({
          message: message,
        });
      }
    } catch (includeError) {
      console.error("[sendMessage] 获取完整消息失败:", includeError);
      res.status(201).send({
        message: message,
      });
    }
  } catch (error) {
    console.error("[sendMessage] 发送消息失败:", error);
    console.error("[sendMessage] 错误详情:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
    });
    next(error);
  }
};

// 获取新消息
exports.getNewMessages = async (req, res, next) => {
  try {
    const taskId = normalizeId(req.query.taskId);
    const campusResourceId = normalizeId(req.query.campusResourceId);
    const lastMessageId = normalizeId(req.query.lastMessageId) || 0;
    const userId = req.userId;

    // 兼容任务或找搭子
    let whereBase = {};
    if (taskId) {
      // 验证任务权限 - 从分表中查找任务
      let task = null;

      const communities = await db.sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: db.sequelize.QueryTypes.SELECT }
      );

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
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!task) {
        return res.status(404).send({ message: "任务不存在" });
      }
      if (task.publisherId !== userId && task.acceptorId !== userId) {
        return res.status(403).send({ message: "无权限查看此聊天" });
      }
      whereBase.taskId = taskId;
    } else if (campusResourceId) {
      // 校园互动内容需要从分表查询，暂时跳过验证
      // TODO: 实现分表查询权限验证
      console.log(
        `[getChats] 校园互动内容 ${campusResourceId} 聊天，跳过权限验证`
      );
      // 对于校园互动内容，允许发布者以及任何想联系发布者的用户
      if (cr.createdBy !== userId) {
        // 不是发布者，但允许查看聊天（可能是想联系发布者）
        console.log(
          `[getMessages] 用户 ${userId} 查看校园互动内容 ${campusResourceId} 聊天，允许访问`
        );
      }
      whereBase.campusResourceId = campusResourceId;
    } else {
      return res.status(400).send({ message: "缺少关联ID" });
    }

    const messages = await Chat.findAll({
      where: {
        ...whereBase,
        id: { [db.Sequelize.Op.gt]: lastMessageId },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "nickname", "avatarUrl"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // 处理撤回消息的显示逻辑
    const processedMessages = messages.map((message) => {
      if (message.messageType === "recall" && message.isRecalled) {
        // 根据当前用户和消息发送者的关系显示不同的撤回文本
        if (message.senderId === userId) {
          // 当前用户是发送者，显示"您撤回了一条消息"
          message.content = "您撤回了一条消息";
        } else {
          // 当前用户是接收者，显示"对方撤回了一条消息"
          message.content = "对方撤回了一条消息";
        }
      }
      return message;
    });

    res.status(200).send({
      messages: processedMessages,
    });
  } catch (error) {
    next(error);
  }
};

// 举报问题
exports.reportIssue = async (req, res, next) => {
  try {
    const { taskId, content } = req.body;
    const reporterId = req.userId;

    // 验证任务是否存在 - 从分表中查找任务
    let task = null;

    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

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
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }

    // 验证举报者是否有权限
    if (task.publisherId !== reporterId && task.acceptorId !== reporterId) {
      return res.status(403).send({ message: "无权限举报此任务" });
    }

    // 这里可以保存举报信息到数据库
    // 暂时只返回成功消息
    res.status(200).send({
      message: "举报成功，我们会尽快处理",
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的消息列表
exports.getUserMessages = async (req, res, next) => {
  try {
    const userId = req.userId;

    // 直接查询用户相关的所有消息，排除系统消息
    const userChats = await db.Chat.findAll({
      where: {
        [db.Sequelize.Op.or]: [{ senderId: userId }, { receiverId: userId }],
        messageType: {
          [db.Sequelize.Op.ne]: "system", // 排除系统消息
        },
      },
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: ["id", "nickname", "avatarUrl"],
        },
        {
          model: db.User,
          as: "receiver",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 按消息类型分类
    const taskMessages = [];
    const partnerMessages = [];
    const directMessages = [];

    for (const chat of userChats) {
      const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;

      if (!otherUser) continue;

      // 处理撤回消息的显示逻辑
      let displayContent = chat.content;
      if (chat.messageType === "recall" && chat.isRecalled) {
        // 根据当前用户和消息发送者的关系显示不同的撤回文本
        if (chat.senderId === userId) {
          // 当前用户是发送者，显示"您撤回了一条消息"
          displayContent = "您撤回了一条消息";
        } else {
          // 当前用户是接收者，显示"对方撤回了一条消息"
          displayContent = "对方撤回了一条消息";
        }
      }

      const messageBase = {
        id: `chat_${chat.id}`,
        otherUserId: otherUser.id,
        otherUserName: otherUser.nickname || "匿名用户",
        otherUserAvatar: otherUser.avatarUrl,
        createTime: chat.createdAt,
        isRead: chat.isRead ? 1 : 0, // 添加isRead字段，转换为数字
        unreadCount: chat.receiverId === userId && !chat.isRead ? 1 : 0,
        content: displayContent, // 使用处理后的内容
      };

      if (chat.taskId) {
        // 任务相关消息 - 从分表中查找任务
        try {
          let task = null;

          const communities = await db.sequelize.query(
            "SELECT id FROM communities ORDER BY id",
            { type: db.sequelize.QueryTypes.SELECT }
          );

          for (const community of communities) {
            const tableName = `tasks_community_${community.id}`;

            try {
              const tasks = await db.sequelize.query(
                "SELECT * FROM " + tableName + " WHERE id = ?",
                {
                  replacements: [chat.taskId],
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

          // 获取用户信息
          if (task) {
            const userIds = [task.publisherId, task.acceptorId].filter(
              (id) => id
            );
            let users = [];
            if (userIds.length > 0) {
              users = await db.User.findAll({
                where: { id: { [db.Sequelize.Op.in]: userIds } },
                attributes: ["id", "nickname"],
                raw: true,
              });
            }

            const userMap = {};
            users.forEach((user) => {
              userMap[user.id] = user;
            });

            // 为任务添加用户信息
            task = {
              ...task,
              publisher: userMap[task.publisherId] || null,
              acceptor: task.acceptorId
                ? userMap[task.acceptorId] || null
                : null,
            };
          }

          if (task) {
            taskMessages.push({
              ...messageBase,
              type: "task",
              title: task.title || `任务${task.id}`,
              summary: displayContent,
              taskId: task.id,
              taskType: task.taskType,
            });
          }
        } catch (error) {
          console.error(`获取任务${chat.taskId}信息失败:`, error);
        }
      } else if (chat.campusResourceId) {
        // 校园互动内容相关消息 - 暂时跳过查询
        // TODO: 实现分表查询
        console.log(
          `[getChats] 校园互动内容 ${chat.campusResourceId} 聊天，跳过查询`
        );
        const campusResource = null; // 临时设置

        if (campusResource) {
          campusMessages.push({
            ...messageBase,
            type: "campus",
            title: campusResource.title || `校园互动${campusResource.id}`,
            summary: displayContent,
            campusResourceId: campusResource.id,
          });
        }
      } else {
        // 直接消息（没有关联任务或找搭子）
        directMessages.push({
          ...messageBase,
          type: "task", // 归类为任务消息
          title: `与${otherUser.nickname}的对话`,
          summary: displayContent,
          taskId: null,
        });
      }
    }

    // 去重并合并消息（按最新时间排序）
    const allMessages = [
      ...taskMessages,
      ...partnerMessages,
      ...directMessages,
    ];

    // 按时间排序
    allMessages.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

    res.status(200).send({
      messages: allMessages,
    });
  } catch (error) {
    console.error("[getUserMessages] 错误:", error);
    next(error);
  }
};

// 标记消息为已读
exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userId = req.userId;

    // 验证任务是否存在 - 从分表中查找任务
    let task = null;

    const communities = await db.sequelize.query(
      "SELECT id FROM communities ORDER BY id",
      { type: db.sequelize.QueryTypes.SELECT }
    );

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
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!task) {
      return res.status(404).send({ message: "任务不存在" });
    }

    // 验证用户是否有权限
    if (task.publisherId !== userId && task.acceptorId !== userId) {
      return res.status(403).send({ message: "无权限操作此聊天" });
    }

    // 标记该任务中发给当前用户的所有消息为已读
    await Chat.update(
      { isRead: true },
      {
        where: {
          taskId: taskId,
          receiverId: userId,
          isRead: false,
        },
      }
    );

    res.status(200).send({ message: "消息已标记为已读" });
  } catch (error) {
    next(error);
  }
};

// 标记消息为已读
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).send({
        success: false,
        message: "缺少必要参数",
      });
    }

    let whereCondition = {};

    if (type === "task") {
      whereCondition = {
        receiverId: userId,
        taskId: id,
        isRead: 0,
      };
    } else if (type === "partner") {
      whereCondition = {
        receiverId: userId,
        campusResourceId: id,
        isRead: 0,
      };
    } else if (type === "market") {
      whereCondition = {
        receiverId: userId,
        marketId: id,
        isRead: 0,
      };
    } else if (type === "chat") {
      // 处理按用户ID的聊天消息
      // id 格式为 "chat_userId1_userId2"
      const userIds = id.replace("chat_", "").split("_");
      if (userIds.length === 2) {
        whereCondition = {
          receiverId: userId,
          [db.Sequelize.Op.or]: [
            {
              senderId: userIds[0],
              receiverId: userIds[1],
            },
            {
              senderId: userIds[1],
              receiverId: userIds[0],
            },
          ],
          isRead: 0,
        };
      } else {
        return res.status(400).send({
          success: false,
          message: "无效的聊天ID格式",
        });
      }
    } else {
      return res.status(400).send({
        success: false,
        message: "不支持的消息类型",
      });
    }

    // 更新消息为已读
    const [updatedCount] = await db.Chat.update(
      { isRead: 1 },
      { where: whereCondition }
    );

    res.status(200).send({
      success: true,
      message: "标记为已读成功",
      updatedCount: updatedCount,
    });
  } catch (error) {
    console.error("标记消息为已读失败:", error);
    next(error);
  }
};

// 获取用户未读消息数量 - 内存优化版本
exports.getUserMessagesCount = async (req, res, next) => {
  try {
    const userId = req.userId;

    // 只查询未读消息数量，不返回消息内容，排除系统消息
    const unreadCount = await Chat.count({
      where: {
        receiverId: userId,
        isRead: 0,
        messageType: {
          [db.Sequelize.Op.ne]: "system", // 排除系统消息
        },
      },
    });

    res.json({
      success: true,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("获取未读消息数量失败:", error);
    next(error);
  }
};

// 撤回消息
exports.recallMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    console.log(
      `[recallMessage] 撤回消息请求: messageId=${messageId}, userId=${userId}`
    );

    // 查找消息
    const message = await Chat.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "消息不存在",
      });
    }

    // 检查权限：只能撤回自己发送的消息
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "只能撤回自己发送的消息",
      });
    }

    // 检查消息类型：只能撤回文本消息
    if (message.messageType && message.messageType !== "text") {
      return res.status(400).json({
        success: false,
        message: "只能撤回文本消息",
      });
    }

    // 检查时间限制：超过10分钟不能撤回
    const messageTime = new Date(message.createdAt).getTime();
    const now = Date.now();
    const timeDiff = now - messageTime;
    const maxRecallTime = 10 * 60 * 1000; // 10分钟

    if (timeDiff > maxRecallTime) {
      return res.status(400).json({
        success: false,
        message: "消息发送超过10分钟，无法撤回",
      });
    }

    // 检查消息是否已经被撤回
    if (message.messageType === "recall" || message.isRecalled) {
      return res.status(400).json({
        success: false,
        message: "消息已经被撤回",
      });
    }

    // 更新消息状态 - 只标记为已撤回，不修改内容
    await message.update({
      messageType: "recall",
      isRecalled: true,
      recalledAt: new Date(),
    });

    console.log(`[recallMessage] 消息撤回成功: messageId=${messageId}`);

    res.json({
      success: true,
      message: "消息撤回成功",
      data: {
        messageId: message.id,
        recalledAt: message.recalledAt,
      },
    });
  } catch (error) {
    console.error("撤回消息失败:", error);
    next(error);
  }
};
