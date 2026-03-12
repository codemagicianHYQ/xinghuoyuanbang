const db = require("../models");
const { TeamMember, User, DispatchTeam } = db;

// 获取我的团队成员
exports.getMyTeamMembers = async (req, res) => {
  try {
    const userId = req.userId;

    // 查找用户所在的团队
    const userTeamMember = await TeamMember.findOne({
      where: {
        userId: userId,
        status: "active",
      },
      include: [
        {
          model: DispatchTeam,
          as: "team",
          attributes: ["id", "name", "type"],
        },
      ],
    });

    if (!userTeamMember) {
      return res.status(404).json({
        success: false,
        message: "您不是任何团队的成员",
      });
    }

    // 获取同一团队的所有成员
    const teamMembers = await TeamMember.findAll({
      where: {
        teamId: userTeamMember.teamId,
        status: "active",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl", "openid"],
        },
      ],
    });

    // 格式化返回数据
    const members = teamMembers.map((member) => ({
      id: member.user.id,
      nickname: member.user.nickname,
      avatarUrl: member.user.avatarUrl,
      openid: member.user.openid,
      joinTime: member.createdAt,
      role: member.role,
    }));

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("获取团队成员失败:", error);
    res.status(500).json({
      success: false,
      message: "获取团队成员失败",
      error: error.message,
    });
  }
};

// 获取我的接单任务
exports.getMyAcceptedTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Task.findAndCountAll({
      where: {
        acceptorId: userId,
        status: {
          [db.Sequelize.Op.in]: ["assigned", "in_progress"],
        },
      },
      include: [
        {
          model: User,
          as: "publisher",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const tasks = rows.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      rewardAmount: task.rewardAmount,
      status: task.status,
      createdAt: task.createdAt,
      publisher: task.publisher,
    }));

    res.json({
      success: true,
      data: {
        tasks: tasks,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取我的接单任务失败:", error);
    res.status(500).json({
      success: false,
      message: "获取我的接单任务失败",
      error: error.message,
    });
  }
};
