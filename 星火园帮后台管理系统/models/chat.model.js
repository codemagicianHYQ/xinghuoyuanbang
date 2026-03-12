module.exports = (sequelize, Sequelize) => {
  const Chat = sequelize.define(
    "chats",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          // 完全移除验证
        },
      },
      campusResourceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          // 完全移除验证
        },
      },
      senderId: {
        type: Sequelize.STRING(16),
        allowNull: false,
      },
      receiverId: {
        type: Sequelize.STRING(16),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      messageType: {
        type: Sequelize.STRING,
        defaultValue: "text",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isRecalled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      recalledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      // 禁用所有自动验证
      validate: {},
      // 启用时间戳
      timestamps: true,
      // 使用确切的表名
      freezeTableName: true,
      // 明确指定表名为chats
      tableName: "chats",
      // 禁用所有钩子
      hooks: {},
    }
  );

  return Chat;
};
