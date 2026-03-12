// controllers/dispatchTeam.controller.js
const db = require("../models");
const { DispatchTeam, TeamMember, User, TeamApplication } = db;

// 创建派单团队
exports.createTeam = async (req, res, next) => {
  const {
    name,
    description,
    avatar,
    type,
    dispatchRules,
    workingHours,
    serviceAreas,
    maxMembers,
  } = req.body;
  const createdBy = req.userId;

  try {
    const team = await DispatchTeam.create({
      id: db.User.generateHashId(),
      name,
      description,
      avatar,
      type: type || "campus",
      dispatchRules,
      workingHours,
      serviceAreas,
      maxMembers: maxMembers || 50,
      createdBy,
    });

    res.status(201).send({
      success: true,
      message: "团队创建成功",
      data: team,
    });
  } catch (error) {
    console.error("创建派单团队失败:", error);
    next(error);
  }
};

// 获取所有派单团队
exports.getAllTeams = async (req, res, next) => {
  const { type, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereCondition = {};
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;

    const { count, rows: teams } = await DispatchTeam.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "nickname"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 为每个团队添加成员统计
    for (let team of teams) {
      const memberCount = await TeamMember.count({
        where: { teamId: team.id, status: "active" },
      });
      team.dataValues.memberCount = memberCount;
    }

    res.status(200).send({
      success: true,
      data: {
        teams,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取派单团队列表失败:", error);
    next(error);
  }
};

// 获取团队详情
exports.getTeamDetail = async (req, res, next) => {
  const { teamId } = req.params;

  try {
    const team = await DispatchTeam.findByPk(teamId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "nickname", "avatarUrl"],
        },
        {
          model: TeamMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "nickname", "avatarUrl", "realName"],
            },
          ],
        },
      ],
    });

    if (!team) {
      return res.status(404).send({
        success: false,
        message: "团队不存在",
      });
    }

    // 获取待审核申请数
    const pendingApplicationsCount = await TeamApplication.count({
      where: { teamId: teamId, status: "pending" },
    });
    team.dataValues.pendingApplicationsCount = pendingApplicationsCount;

    res.status(200).send({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("获取团队详情失败:", error);
    next(error);
  }
};

// 更新团队信息
exports.updateTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const updateData = req.body;

  try {
    const team = await DispatchTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).send({
        success: false,
        message: "团队不存在",
      });
    }

    await team.update(updateData);

    res.status(200).send({
      success: true,
      message: "团队信息更新成功",
      data: team,
    });
  } catch (error) {
    console.error("更新团队信息失败:", error);
    next(error);
  }
};

// 删除团队
exports.deleteTeam = async (req, res, next) => {
  const { teamId } = req.params;

  try {
    const team = await DispatchTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).send({
        success: false,
        message: "团队不存在",
      });
    }

    // 检查是否有活跃成员
    const activeMembersCount = await TeamMember.count({
      where: { teamId: teamId, status: "active" },
    });

    if (activeMembersCount > 0) {
      return res.status(400).send({
        success: false,
        message: "团队还有活跃成员，无法删除",
      });
    }

    await team.destroy();

    res.status(200).send({
      success: true,
      message: "团队删除成功",
    });
  } catch (error) {
    console.error("删除团队失败:", error);
    next(error);
  }
};

// 获取团队成员列表
exports.getTeamMembers = async (req, res, next) => {
  const { teamId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereCondition = { teamId };
    if (status) whereCondition.status = status;

    const { count, rows: members } = await TeamMember.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "nickname",
            "avatarUrl",
            "realName",
            "phoneNumber",
          ],
        },
      ],
      order: [["joinedAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).send({
      success: true,
      data: {
        members,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取团队成员列表失败:", error);
    next(error);
  }
};

// 移除团队成员
exports.removeTeamMember = async (req, res, next) => {
  const { teamId, memberId } = req.params;

  try {
    const member = await TeamMember.findOne({
      where: { id: memberId, teamId: teamId },
    });

    if (!member) {
      return res.status(404).send({
        success: false,
        message: "成员不存在",
      });
    }

    await member.destroy();

    // 更新团队成员数
    await DispatchTeam.decrement("currentMembers", {
      where: { id: teamId },
    });

    res.status(200).send({
      success: true,
      message: "成员移除成功",
    });
  } catch (error) {
    console.error("移除团队成员失败:", error);
    next(error);
  }
};

// 更新成员状态
exports.updateMemberStatus = async (req, res, next) => {
  const { teamId, memberId } = req.params;
  const { status } = req.body;

  try {
    const member = await TeamMember.findOne({
      where: { id: memberId, teamId: teamId },
    });

    if (!member) {
      return res.status(404).send({
        success: false,
        message: "成员不存在",
      });
    }

    await member.update({ status });

    res.status(200).send({
      success: true,
      message: "成员状态更新成功",
      data: member,
    });
  } catch (error) {
    console.error("更新成员状态失败:", error);
    next(error);
  }
};
