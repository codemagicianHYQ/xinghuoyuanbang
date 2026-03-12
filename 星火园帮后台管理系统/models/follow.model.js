module.exports = (sequelize, Sequelize) => {
  const Follow = sequelize.define(
    "follows",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      followerId: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "关注者ID",
        references: {
          model: "users",
          key: "id",
        },
      },
      followingId: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "被关注者ID",
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      tableName: "follows",
      indexes: [
        {
          unique: true,
          fields: ["followerId", "followingId"],
          name: "unique_follow",
        },
        {
          fields: ["followerId"],
          name: "idx_follower",
        },
        {
          fields: ["followingId"],
          name: "idx_following",
        },
      ],
    }
  );

  return Follow;
};
