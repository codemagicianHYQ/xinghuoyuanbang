const { DataTypes } = require("sequelize");
const db = require("../config/database");

const AfterSales = db.sequelize.define(
  "AfterSales",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "关联的任务ID",
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "申请用户ID",
    },
    issueType: {
      type: DataTypes.ENUM(
        "quality",
        "delay",
        "communication",
        "refund",
        "other"
      ),
      allowNull: false,
      comment: "问题类型",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "问题描述",
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "上传的图片URL数组",
    },
    contactInfo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "联系方式",
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "resolved", "rejected"),
      defaultValue: "pending",
      comment: "处理状态",
    },
    adminResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "管理员回复",
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "解决时间",
    },
    communityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "所属社区ID",
    },
  },
  {
    tableName: "after_sales",
    timestamps: true,
    indexes: [
      {
        fields: ["taskId"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["communityId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = AfterSales;
