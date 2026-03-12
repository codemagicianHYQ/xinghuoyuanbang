const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SystemMessage = sequelize.define(
  "SystemMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      comment: "接收消息的用户ID",
    },
    type: {
      type: DataTypes.ENUM(
        "rider_application_approved", // 接单员申请通过
        "rider_application_rejected", // 接单员申请被拒绝
        "order_rejected", // 订单被驳回
        "order_completed", // 订单完成
        "order_cancelled", // 订单取消
        "account_security", // 账户安全
        "activity_notification", // 活动通知
        "system_maintenance", // 系统维护
        "other" // 其他
      ),
      allowNull: false,
      comment: "系统消息类型",
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
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "是否已读",
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "相关ID（如任务ID、申请ID等）",
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "相关类型（如task、application等）",
    },
    extraData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "额外数据",
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
    tableName: "system_messages",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["isRead"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["userId", "isRead"],
      },
    ],
  }
);

module.exports = SystemMessage;
