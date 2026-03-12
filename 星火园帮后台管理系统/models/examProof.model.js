module.exports = (sequelize, Sequelize) => {
  const ExamProof = sequelize.define(
    "ExamProof",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "用户ID",
      },
      proofImage: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: "凭证图片URL",
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "用户备注",
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
        comment: "审核状态：pending-待审核，approved-已通过，rejected-已拒绝",
      },
      rewardAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "奖励金额",
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "提交时间",
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "审核时间",
      },
      reviewedBy: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "审核人ID",
      },
      adminRemark: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "管理员备注",
      },
    },
    {
      tableName: "exam_proofs",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["submittedAt"],
        },
      ],
    }
  );

  return ExamProof;
};
