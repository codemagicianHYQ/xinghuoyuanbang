module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define(
    "comments",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      campusResourceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "校园资源ID",
      },
      communityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "社区ID，用于确定分表",
      },
      userId: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "评论用户ID",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "评论内容",
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "父评论ID，用于回复",
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否匿名评论",
      },
      status: {
        type: Sequelize.ENUM("active", "deleted"),
        defaultValue: "active",
        comment: "评论状态",
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "comments",
    }
  );

  return Comment;
};
