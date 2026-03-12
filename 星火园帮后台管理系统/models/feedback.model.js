module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING(16), // 改为STRING类型，与用户模型id字段匹配
        allowNull: true, // 允许匿名反馈
        references: {
          model: "users",
          key: "id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "反馈内容",
      },
      contact: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "联系方式",
      },
      imageUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "图片URL数组",
      },
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "设备信息",
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "resolved", "closed"),
        defaultValue: "pending",
        comment: "处理状态：待处理、处理中、已解决、已关闭",
      },
      adminReply: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "管理员回复",
      },
      adminId: {
        type: DataTypes.STRING(16), // 改为STRING类型，与用户模型id字段匹配
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "处理反馈的管理员ID",
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "处理时间",
      },
    },
    {
      tableName: "feedbacks",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  return Feedback;
};
