// models/teamMember.model.js
module.exports = (sequelize, Sequelize) => {
  const TeamMember = sequelize.define("teamMember", {
    id: {
      type: Sequelize.STRING(16),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    teamId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "团队ID",
    },
    userId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "用户ID",
    },
    role: {
      type: Sequelize.ENUM("member", "leader", "admin"),
      defaultValue: "member",
      allowNull: false,
      comment: "在团队中的角色",
    },
    status: {
      type: Sequelize.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
      allowNull: false,
      comment: "成员状态",
    },
    joinedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
      comment: "加入时间",
    },
    workingSchedule: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "个人工作时间安排",
    },
    serviceAreas: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "个人服务区域",
    },
    performance: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "绩效数据",
    },
  });

  return TeamMember;
};
