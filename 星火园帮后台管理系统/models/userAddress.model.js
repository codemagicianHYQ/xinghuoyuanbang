module.exports = (sequelize, Sequelize) => {
  const UserAddress = sequelize.define("user_address", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      comment: "用户ID，外键",
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "地址标签，如家、公司",
    },
    detail: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "详细地址",
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "收件人手机号",
    },
    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: "是否默认地址",
    },
  });

  return UserAddress;
};
