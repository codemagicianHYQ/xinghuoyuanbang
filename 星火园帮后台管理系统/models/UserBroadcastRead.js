const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserBroadcastRead = sequelize.define(
  "UserBroadcastRead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      comment: "用户ID",
    },
    broadcastId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "广播消息ID",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "是否已读",
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "阅读时间",
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
    tableName: "user_broadcast_reads",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["broadcastId"],
      },
      {
        fields: ["isRead"],
      },
      {
        fields: ["userId", "broadcastId"],
        unique: true,
      },
      {
        fields: ["userId", "isRead"],
      },
    ],
  }
);

module.exports = UserBroadcastRead;
