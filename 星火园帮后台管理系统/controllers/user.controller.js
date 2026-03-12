// controllers/user.controller.js
const db = require("../models");
const User = db.User;
const { Op } = require("sequelize"); // For search operations
// 移除 nullHandler 依赖，直接处理 null 值

// Admin: Get all users with pagination and search
exports.adminGetAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      isVerified = null,
      riderApplicationStatus = null, // 新增：接单员申请状态过滤
      version = "campus", // 新增：版本筛选，默认为校园版
    } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {
      version: version, // 添加版本筛选
    };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { nickname: { [Op.like]: `%${search}%` } },
          { realName: { [Op.like]: `%${search}%` } },
          { phoneNumber: { [Op.like]: `%${search}%` } },
          { school: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (role) {
      whereCondition.role = role;
    }
    if (isVerified !== null && isVerified !== undefined && isVerified !== "") {
      whereCondition.isVerified = isVerified === "true" || isVerified === true;
    }
    // 新增：处理接单员申请状态过滤
    if (
      riderApplicationStatus !== null &&
      riderApplicationStatus !== undefined &&
      riderApplicationStatus !== ""
    ) {
      whereCondition.riderApplicationStatus = riderApplicationStatus;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ["sessionKey"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    // 直接处理用户数据，移除 sessionKey
    const processedUsers = rows.map((user) => {
      const userObj = user.get ? user.get({ plain: true }) : user;
      delete userObj.sessionKey;
      return userObj;
    });

    res.status(200).send({
      totalItems: count,
      users: processedUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get a single user by ID
exports.adminGetUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["sessionKey"] },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // 直接处理用户数据，移除 sessionKey
    const userObj = user.get ? user.get({ plain: true }) : user;
    delete userObj.sessionKey;

    res.status(200).send(userObj);
  } catch (error) {
    next(error);
  }
};

// Admin: Update user details (e.g., role, nickname, verification status, RIDER STATUS)
exports.adminUpdateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const {
      nickname,
      role, // <<< 管理员可以修改角色
      isVerified,
      realName,
      gender,
      phoneNumber,
      school,
      riderApplicationStatus, // <<< 管理员可以修改接单员申请状态
      riderRejectionReason, // <<< 管理员可以设置拒绝原因
    } = req.body;

    // 移除password相关检查，因为不再使用password字段
    if (req.body.openid) {
      return res.status(400).send({ message: "OpenID cannot be changed." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // 更新字段
    if (nickname !== undefined) user.nickname = nickname;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (realName !== undefined) user.realName = realName;
    if (gender !== undefined) user.gender = gender;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (school !== undefined) user.school = school;

    // --- 接单员和角色相关字段的更新 ---
    let shouldSendApprovedMessage = false;
    let shouldSendRejectedMessage = false;
    let rejectionReason = null;

    if (riderApplicationStatus !== undefined) {
      const oldStatus = user.riderApplicationStatus;
      user.riderApplicationStatus = riderApplicationStatus;

      if (riderApplicationStatus === "approved" && user.role !== "rider") {
        user.role = "rider"; // 申请通过，自动将会员角色设置为 rider
        shouldSendApprovedMessage = true;
      } else if (
        ["rejected", "none"].includes(riderApplicationStatus) &&
        user.role === "rider"
      ) {
        user.role = "user"; // 如果申请被拒或撤销，且当前是 rider，则降为 user
        if (riderApplicationStatus === "rejected") {
          shouldSendRejectedMessage = true;
        }
      }
    }
    // 如果管理员直接修改角色 (独立于 riderApplicationStatus 的判断)
    if (role !== undefined && user.role !== role) {
      user.role = role;
      // 如果将角色直接设为 rider，也应将申请状态设为 approved
      if (role === "rider" && user.riderApplicationStatus !== "approved") {
        user.riderApplicationStatus = "approved";
        shouldSendApprovedMessage = true;
      }
      // 如果角色从 rider 改为 user，申请状态可能也需要重置或标记
      else if (role === "user" && user.riderApplicationStatus === "approved") {
        user.riderApplicationStatus = "none"; // 或者其他表示非接单员的状态
      }
    }
    if (riderRejectionReason !== undefined) {
      // 通常在 status 为 rejected 时设置
      user.riderRejectionReason =
        riderApplicationStatus === "rejected" ? riderRejectionReason : null;
      rejectionReason = riderRejectionReason;
    }
    // --- End of Rider and Role specific updates ---

    await user.save();

    // 发送系统消息
    try {
      const SystemMessageService = require("../services/systemMessageService");

      if (shouldSendApprovedMessage) {
        await SystemMessageService.sendRiderApplicationApproved(user.id, {
          applicationId: user.id, // 使用用户ID作为申请ID
        });
        console.log(
          `✅ [updateUserProfile] 已发送接单员申请通过消息给用户 ${user.id}`
        );
      }

      if (shouldSendRejectedMessage) {
        await SystemMessageService.sendRiderApplicationRejected(
          user.id,
          rejectionReason || "申请未通过审核",
          {
            applicationId: user.id, // 使用用户ID作为申请ID
          }
        );
        console.log(
          `✅ [updateUserProfile] 已发送接单员申请拒绝消息给用户 ${user.id}`
        );
      }
    } catch (error) {
      console.error("❌ [updateUserProfile] 发送系统消息失败:", error);
      // 不抛出错误，避免影响用户更新
    }
    const updatedUser = { ...user.get({ plain: true }) };
    delete updatedUser.sessionKey;

    res.status(200).send({
      message: "User updated successfully by admin.",
      user: updatedUser,
    });
  } catch (error) {
    // 如果是唯一约束错误（例如，手机号等唯一字段冲突）
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send({
        message:
          "Failed! A unique field (e.g., phone number) is already in use.",
      });
    }
    next(error);
  }
};

// Admin: Delete a user
exports.adminDeleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    // 确保当前操作的管理员不是在删除自己 (req.userId 来自 verifyToken)
    if (user.role === "admin" && user.id === parseInt(req.userId)) {
      // parseInt 以防类型不匹配
      return res
        .status(403)
        .send({ message: "Admin cannot delete their own account." });
    }

    console.log(`[adminDeleteUser] 开始删除用户 ID: ${userId}`);

    // 使用事务确保数据一致性
    const result = await db.sequelize.transaction(async (t) => {
      const Task = db.Task;
      const Chat = db.Chat;
      const Feedback = db.Feedback;
      const Withdrawal = db.Withdrawal;
      const UserAddress = db.UserAddress;

      // 1. 先删除用户发布的任务相关的聊天记录
      const userTasks = await Task.findAll({
        where: { publisherId: userId },
        attributes: ["id"],
        transaction: t,
      });

      const taskIds = userTasks.map((task) => task.id);
      let deletedChats = 0;

      if (taskIds.length > 0) {
        deletedChats = await Chat.destroy({
          where: { taskId: { [db.Sequelize.Op.in]: taskIds } },
          transaction: t,
        });
        console.log(`[adminDeleteUser] 删除了 ${deletedChats} 条聊天记录`);
      }

      // 2. 删除用户发布的任务
      const deletedTasks = await Task.destroy({
        where: { publisherId: userId },
        transaction: t,
      });
      console.log(`[adminDeleteUser] 删除了 ${deletedTasks} 个任务`);

      // 3. 重置用户接单的任务（将任务状态重置为open）
      const updatedAcceptedTasks = await Task.update(
        {
          acceptorId: null,
          status: "open",
          acceptedAt: null,
        },
        {
          where: { acceptorId: userId },
          transaction: t,
        }
      );
      console.log(
        `[adminDeleteUser] 重置了 ${updatedAcceptedTasks[0]} 个已接单任务`
      );

      // 4. 删除用户相关的反馈记录
      const deletedFeedbacks = await Feedback.destroy({
        where: { userId: userId },
        transaction: t,
      });
      console.log(`[adminDeleteUser] 删除了 ${deletedFeedbacks} 条反馈记录`);

      // 5. 删除用户相关的提现记录
      const deletedWithdrawals = await Withdrawal.destroy({
        where: { userId: userId },
        transaction: t,
      });
      console.log(`[adminDeleteUser] 删除了 ${deletedWithdrawals} 条提现记录`);

      // 6. 删除用户相关的聊天记录（作为发送者或接收者）
      const deletedUserChats = await Chat.destroy({
        where: {
          [db.Sequelize.Op.or]: [{ senderId: userId }, { receiverId: userId }],
        },
        transaction: t,
      });
      console.log(
        `[adminDeleteUser] 删除了 ${deletedUserChats} 条用户聊天记录`
      );

      // 7. 删除用户相关的地址记录
      const deletedAddresses = await UserAddress.destroy({
        where: { userId: userId },
        transaction: t,
      });

      // 8. 最后删除用户
      await user.destroy({ transaction: t });

      return {
        deletedTasks,
        deletedChats,
        updatedAcceptedTasks: updatedAcceptedTasks[0],
        deletedFeedbacks,
        deletedWithdrawals,
        deletedUserChats,
        deletedAddresses,
      };
    });

    res.status(200).send({
      message: "用户删除成功",
      deletedTasks: result.deletedTasks,
      deletedChats: result.deletedChats,
      updatedAcceptedTasks: result.updatedAcceptedTasks,
      deletedFeedbacks: result.deletedFeedbacks,
      deletedWithdrawals: result.deletedWithdrawals,
      deletedUserChats: result.deletedUserChats,
      deletedAddresses: result.deletedAddresses,
    });
  } catch (error) {
    console.error("[adminDeleteUser] Error:", error.message);
    if (error.original) {
      console.error("[adminDeleteUser] Original DB Error:", error.original);
    }
    next(error);
  }
};

// Uni-app user: Get their own profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const userIdToFetch = req.userId; // 从 verifyToken 中间件获取当前登录用户的ID
    const { version = "campus" } = req.query; // 获取版本参数

    if (!userIdToFetch) {
      return res
        .status(401)
        .send({ message: "Unauthorized: User ID not found in token." });
    }

    // 根据版本查找用户
    const user = await User.findOne({
      where: {
        id: userIdToFetch,
        version: version,
      },
      attributes: { exclude: ["sessionKey", "openid"] }, // 不返回敏感信息
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User profile not found in this version." });
    }

    // 直接处理用户数据
    const userObj = user.get ? user.get({ plain: true }) : user;

    res.status(200).send(userObj);
  } catch (error) {
    next(error);
  }
};

// Uni-app user: Update their own profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    console.log("=== 更新用户资料开始 ===");
    console.log("用户ID:", req.userId);
    console.log("请求体:", req.body);

    const userId = req.userId;
    const {
      nickname,
      avatarUrl, // 用户自己上传的新头像URL
      realName,
      gender,
      phoneNumber,
      school,
      version, // 新增：版本字段
      // 用户不能自己修改 role, isVerified, riderApplicationStatus 等
    } = req.body;

    // 根据版本查找用户
    const user = await User.findOne({
      where: {
        id: userId,
        version: version || "campus",
      },
    });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found in this version." });
    }

    if (nickname !== undefined) {
      // 允许用户设置空昵称，不强制使用默认值
      user.nickname = nickname.trim();
    }
    if (avatarUrl !== undefined) {
      // 允许用户清除头像 (传 null 或空字符串) 或更新头像
      // 如果传入的是有效URL，直接保存；如果是空字符串，设置为null
      user.avatarUrl =
        avatarUrl && avatarUrl.trim() !== "" ? avatarUrl.trim() : null;
      console.log("更新头像URL:", {
        原始值: avatarUrl,
        处理后: user.avatarUrl,
      });
    }
    if (realName !== undefined) user.realName = realName; // 用户是否能修改已认证的真实姓名，取决于业务
    if (gender !== undefined) user.gender = gender;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (school !== undefined) user.school = school;
    if (version !== undefined) {
      // 验证版本值是否有效
      if (version === "campus" || version === "community") {
        user.version = version;
        console.log("更新用户版本:", version);
      } else {
        console.warn("无效的版本值:", version);
      }
    }

    await user.save();
    const updatedUser = { ...user.get({ plain: true }) };
    delete updatedUser.sessionKey;

    res
      .status(200)
      .send({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// 获取用户系统消息
exports.getSystemMessages = async (req, res, next) => {
  try {
    console.log(`[getSystemMessages] 控制器被调用`);
    const userId = req.userId;
    const { page = 1, limit = 20, version = "campus" } = req.query;

    console.log(`[getSystemMessages] 请求参数:`, {
      userId,
      version,
      page,
      limit,
    });

    // 检查用户ID是否存在
    if (!userId) {
      console.error(`[getSystemMessages] 用户ID不存在`);
      return res.status(400).json({
        success: false,
        message: "用户未认证",
      });
    }

    // 使用增强的系统消息服务
    const EnhancedSystemMessageService = require("../services/enhancedSystemMessageService");

    const result = await EnhancedSystemMessageService.getUserSystemMessages(
      userId,
      {
        page,
        limit,
        version,
      }
    );

    console.log(`[getSystemMessages] 查询到 ${result.totalItems} 条消息`);

    res.status(200).send(result);
  } catch (error) {
    console.error("获取系统消息失败:", error);
    next(error);
  }
};

// 临时调试：获取系统消息（不检查版本）
exports.getSystemMessagesDebug = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`[getSystemMessagesDebug] 调试请求: userId=${userId}`);

    // 查询真实的系统消息数据
    const { SystemMessage } = require("../models");

    const { count, rows: messages } = await SystemMessage.findAndCountAll({
      where: {
        userId: userId,
      },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // 格式化消息数据
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      type: "system",
      title: msg.title,
      summary: msg.summary || msg.content,
      content: msg.content,
      createTime: msg.createdAt,
      unreadCount: msg.isRead ? 0 : 1,
      relatedId: msg.relatedId,
      relatedType: msg.relatedType,
      extraData: msg.extraData,
    }));

    console.log(`[getSystemMessagesDebug] 查询到 ${count} 条消息`);

    res.status(200).send({
      messages: formattedMessages,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      debug: {
        userId,
        version: "debug_mode",
      },
    });
  } catch (error) {
    console.error("调试获取系统消息失败:", error);
    next(error);
  }
};

// 标记系统消息为已读
exports.markSystemMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    console.log(`[markSystemMessageAsRead] 请求参数:`, {
      messageId,
      userId,
    });

    // 使用增强的系统消息服务
    const EnhancedSystemMessageService = require("../services/enhancedSystemMessageService");

    const success = await EnhancedSystemMessageService.markAsRead(
      messageId,
      userId
    );

    if (success) {
      console.log(`[markSystemMessageAsRead] 消息已标记为已读: ${messageId}`);
      res.status(200).send({
        success: true,
        message: "消息已标记为已读",
      });
    } else {
      console.log(`[markSystemMessageAsRead] 消息未找到: ${messageId}`);
      res.status(404).send({
        success: false,
        message: "消息不存在",
      });
    }
  } catch (error) {
    console.error("标记系统消息已读失败:", error);
    next(error);
  }
};

// 创建版本用户（用于版本切换时创建新用户）
exports.createVersionUser = async (req, res, next) => {
  try {
    console.log("=== 创建版本用户开始 ===");
    console.log("请求体:", req.body);

    const {
      openid,
      userInfo,
      version = "campus",
      sourceUserId, // 源用户ID，用于复制基本信息
    } = req.body;

    if (!openid) {
      return res.status(400).send({ message: "openid 是必需的" });
    }

    // 检查是否已存在该版本的用户
    const existingUser = await User.findOne({
      where: {
        openid: openid,
        version: version,
      },
    });

    if (existingUser) {
      return res.status(200).send({
        message: "用户已存在",
        user: existingUser.get({ plain: true }),
      });
    }

    // 如果有源用户ID，复制基本信息
    let newUserData = {
      id: User.generateHashId(),
      openid: openid,
      nickname: userInfo?.nickName || "PuppyBuddy",
      avatarUrl: userInfo?.avatarUrl || null,
      role: "user",
      isVerified: false,
      riderApplicationStatus: "none",
      version: version,
    };

    if (sourceUserId) {
      const sourceUser = await User.findByPk(sourceUserId);
      if (sourceUser) {
        // 复制基本信息，但重置版本相关状态
        newUserData.nickname = sourceUser.nickname;
        newUserData.avatarUrl = sourceUser.avatarUrl;
        newUserData.gender = sourceUser.gender;
        newUserData.phoneNumber = sourceUser.phoneNumber;
        newUserData.school = sourceUser.school;
        newUserData.realName = sourceUser.realName;
        // 重置版本相关状态
        newUserData.isVerified = false;
        newUserData.riderApplicationStatus = "none";
      }
    }

    if (userInfo && userInfo.gender !== undefined) {
      newUserData.gender = userInfo.gender;
    }

    const newUser = await User.create(newUserData);

    const userObj = newUser.get({ plain: true });
    delete userObj.sessionKey;

    res.status(201).send({
      message: "版本用户创建成功",
      user: userObj,
    });
  } catch (error) {
    console.error("创建版本用户失败:", error);
    next(error);
  }
};
