// controllers/teamApplication.controller.js
const db = require("../models");
const { TeamApplication, DispatchTeam, User, TeamMember } = db;

// 申请加入团队
exports.applyToTeam = async (req, res, next) => {
  const userId = req.userId;
  const { reason, availableTime } = req.body;

  console.log("申请加入团队 - 请求数据:", { userId, reason, availableTime });

  try {
    // 检查用户是否已经是接单员
    const user = await User.findByPk(userId);
    console.log(
      "用户信息:",
      user
        ? {
            id: user.id,
            role: user.role,
            riderApplicationStatus: user.riderApplicationStatus,
          }
        : "用户不存在"
    );

    if (!user) {
      console.log("用户不存在");
      return res.status(404).send({
        success: false,
        message: "用户不存在",
      });
    }

    if (user.role !== "rider" && user.riderApplicationStatus !== "approved") {
      console.log("用户不是接单员，拒绝申请");
      let message = "只有接单员才能申请加入团队";
      if (user.riderApplicationStatus === "none") {
        message = "请先申请成为接单员";
      } else if (user.riderApplicationStatus === "pending") {
        message = "接单员申请正在审核中，请等待审核通过后再申请加入团队";
      } else if (user.riderApplicationStatus === "rejected") {
        message = "接单员申请被拒绝，请重新申请成为接单员";
      }
      return res.status(400).send({
        success: false,
        message: message,
      });
    }

    // 查找校园自营团队
    const campusTeam = await DispatchTeam.findOne({
      where: { type: "campus", status: "active" },
    });

    if (!campusTeam) {
      return res.status(404).send({
        success: false,
        message: "暂无可申请的校园自营团队",
      });
    }

    // 检查是否已有待审核或已通过的申请
    const existingApplication = await TeamApplication.findOne({
      where: {
        userId: userId,
        teamId: campusTeam.id,
        status: ["pending", "approved"],
      },
    });

    if (existingApplication) {
      return res.status(400).send({
        success: false,
        message:
          existingApplication.status === "pending"
            ? "您已有待审核的申请"
            : "您已经是团队成员",
      });
    }

    // 创建申请
    const application = await TeamApplication.create({
      id: db.User.generateHashId(),
      userId: userId,
      teamId: campusTeam.id,
      reason: reason,
      availableTime: availableTime,
      status: "pending",
    });

    res.status(200).send({
      success: true,
      message: "申请提交成功，请等待审核",
      data: application,
    });
  } catch (error) {
    console.error("申请加入团队失败:", error);
    next(error);
  }
};

// 获取我的团队申请状态
exports.getMyApplication = async (req, res, next) => {
  const userId = req.userId;

  try {
    const application = await TeamApplication.findOne({
      where: { userId: userId },
      include: [
        {
          model: DispatchTeam,
          as: "team",
          attributes: ["id", "name", "description", "avatar", "type"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (application) {
      // 获取团队统计信息
      const memberCount = await TeamMember.count({
        where: { teamId: application.teamId, status: "active" },
      });

      application.team.dataValues.memberCount = memberCount;
      application.team.dataValues.areaCount = application.team.serviceAreas
        ? Object.keys(application.team.serviceAreas).length
        : 0;
    }

    res.status(200).send({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("获取团队申请状态失败:", error);
    next(error);
  }
};

// 获取所有团队申请（管理员）
exports.getAllApplications = async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows: applications } = await TeamApplication.findAndCountAll(
      {
        where: whereCondition,
        include: [
          {
            model: User,
            as: "applicant",
            attributes: ["id", "nickname", "avatarUrl", "realName"],
          },
          {
            model: DispatchTeam,
            as: "team",
            attributes: ["id", "name", "description"],
          },
          {
            model: User,
            as: "reviewer",
            attributes: ["id", "nickname"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    );

    res.status(200).send({
      success: true,
      data: {
        applications,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取团队申请列表失败:", error);
    next(error);
  }
};

// 审核团队申请（管理员）
exports.reviewApplication = async (req, res, next) => {
  const { applicationId } = req.params;
  const { status, reviewNote } = req.body;
  const adminId = req.userId;

  try {
    const application = await TeamApplication.findByPk(applicationId, {
      include: [
        {
          model: DispatchTeam,
          as: "team",
        },
      ],
    });

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "申请不存在",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).send({
        success: false,
        message: "该申请已被处理",
      });
    }

    // 更新申请状态
    application.status = status;
    application.reviewNote = reviewNote;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // 如果审核通过，将用户加入团队
    if (status === "approved") {
      // 检查是否已经是团队成员
      const existingMember = await TeamMember.findOne({
        where: { userId: application.userId, teamId: application.teamId },
      });

      if (!existingMember) {
        await TeamMember.create({
          id: db.User.generateHashId(),
          teamId: application.teamId,
          userId: application.userId,
          role: "member",
          status: "active",
          joinedAt: new Date(),
        });

        // 更新团队成员数
        await DispatchTeam.increment("currentMembers", {
          where: { id: application.teamId },
        });
      }
    }

    res.status(200).send({
      success: true,
      message:
        status === "approved" ? "申请已通过，用户已加入团队" : "申请已拒绝",
      data: application,
    });
  } catch (error) {
    console.error("审核团队申请失败:", error);
    next(error);
  }
};
