// models/withdrawal.model.js
module.exports = (sequelize, Sequelize) => {
  const Withdrawal = sequelize.define("withdrawal", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.STRING(16),
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "申请提现的用户ID",
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "提现金额（元）",
    },
    withdrawType: {
      type: Sequelize.ENUM("wechat", "bank"),
      defaultValue: "wechat",
      allowNull: false,
      comment: "提现类型：微信零钱/银行卡",
    },
    status: {
      type: Sequelize.ENUM(
        "pending",
        "approved",
        "rejected",
        "completed",
        "processing",
        "failed"
      ),
      defaultValue: "pending",
      allowNull: false,
      comment: "提现状态：待审核/已通过/已拒绝/已完成/处理中/失败",
    },
    applyTime: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "申请时间",
    },
    processTime: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "处理时间",
    },
    completeTime: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "完成时间",
    },
    adminId: {
      type: Sequelize.STRING(16),
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "处理提现的管理员ID",
    },
    rejectReason: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "拒绝原因",
    },
    failReason: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "失败原因",
    },
    remark: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "备注",
    },
    weekNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "申请周数（用于批量处理）",
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "申请年份",
    },
    thirdPartyOrderId: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "第三方接口订单号",
    },
    thirdPartyTicket: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "第三方接口票据",
    },
  });

  // 关联关系
  Withdrawal.associate = (models) => {
    Withdrawal.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
    });

    Withdrawal.belongsTo(models.user, {
      foreignKey: "adminId",
      as: "admin",
    });
  };

  return Withdrawal;
};
