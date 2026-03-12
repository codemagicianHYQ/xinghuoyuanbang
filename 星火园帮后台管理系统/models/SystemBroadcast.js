const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SystemBroadcast = sequelize.define(
  "SystemBroadcast",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "version_update", // 版本更新通知
        "system_maintenance", // 系统维护
        "security_alert", // 安全提醒
        "admin_announcement", // 管理员公告
        "activity_promotion", // 活动推广
        "policy_update", // 政策更新
        "other" // 其他
      ),
      allowNull: false,
      comment: "广播消息类型",
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "消息标题",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "消息内容",
    },
    summary: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "消息摘要",
    },
    targetScope: {
      type: DataTypes.ENUM("all", "campus", "community", "specific_users"),
      allowNull: false,
      defaultValue: "all",
      comment:
        "目标范围：all-所有用户，campus-校园版，community-社区版，specific_users-特定用户",
    },
    targetUserIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "特定用户ID列表（当targetScope为specific_users时使用）",
    },
    targetUsers: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "目标用户列表（JSON字符串）",
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "定时发送时间",
    },
    status: {
      type: DataTypes.ENUM("draft", "scheduled", "active", "sent", "cancelled"),
      allowNull: false,
      defaultValue: "active",
      comment: "消息状态",
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "实际发送时间",
    },
    createdBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "创建者ID",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      allowNull: false,
      defaultValue: "normal",
      comment: "消息优先级",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "是否激活",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "过期时间（null表示永不过期）",
    },
    extraData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "额外数据",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "创建时间",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "更新时间",
    },
  },
  {
    tableName: "system_broadcasts",
    timestamps: true,
    indexes: [
      {
        fields: ["type"],
      },
      {
        fields: ["targetScope"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["expiresAt"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  }
);

module.exports = SystemBroadcast;
