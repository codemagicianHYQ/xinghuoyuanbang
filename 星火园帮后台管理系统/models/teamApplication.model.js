// models/teamApplication.model.js
module.exports = (sequelize, Sequelize) => {
  const TeamApplication = sequelize.define("teamApplication", {
    id: {
      type: Sequelize.STRING(16),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "申请人ID",
    },
    teamId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "申请的团队ID",
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "申请理由",
    },
    availableTime: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "可接单时间",
    },
    status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
      comment: "申请状态",
    },
    reviewNote: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "审核备注",
    },
    reviewedBy: {
      type: Sequelize.STRING(16),
      allowNull: true,
      comment: "审核人ID",
    },
    reviewedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "审核时间",
    },
  });

  return TeamApplication;
};
