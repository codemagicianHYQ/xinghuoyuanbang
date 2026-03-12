module.exports = (sequelize, Sequelize) => {
  const Community = sequelize.define(
    "community",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: "社区/学校名称",
      },
      type: {
        type: Sequelize.ENUM("school", "community"),
        defaultValue: "community",
        comment: "类型：school-学校(校园版), community-社区(小区版)",
      },
      province: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "省份",
      },
      city: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "城市",
      },
      district: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "区县",
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "详细地址",
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: "纬度",
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: "经度",
      },
      adminName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "管理员姓名",
      },
      adminPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "管理员电话",
      },
      adminQRCode: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "管理员企业微信二维码URL",
      },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      tableName: "communities",
    }
  );

  return Community;
};
