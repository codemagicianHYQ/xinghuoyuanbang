// models/dispatchTeam.model.js
module.exports = (sequelize, Sequelize) => {
  const DispatchTeam = sequelize.define("dispatchTeam", {
    id: {
      type: Sequelize.STRING(16),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: "团队名称",
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "团队描述",
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "团队头像URL",
    },
    type: {
      type: Sequelize.ENUM("campus", "community", "custom"),
      defaultValue: "campus",
      allowNull: false,
      comment: "团队类型：campus-校园自营，community-社区，custom-自定义",
    },
    status: {
      type: Sequelize.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
      allowNull: false,
      comment: "团队状态",
    },
    dispatchRules: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "派单规则配置",
    },
    workingHours: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "工作时间配置",
    },
    serviceAreas: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "服务区域配置",
    },
    maxMembers: {
      type: Sequelize.INTEGER,
      defaultValue: 50,
      allowNull: false,
      comment: "最大成员数",
    },
    currentMembers: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: "当前成员数",
    },
    createdBy: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "创建者ID",
    },
  });

  return DispatchTeam;
};
