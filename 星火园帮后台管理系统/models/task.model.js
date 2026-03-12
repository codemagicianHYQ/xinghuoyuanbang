module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define(
    "task",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "用户输入的任务描述",
      },
      specifics: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "任务具体详情信息（地点、时间、人数等）",
      },
      taskType: {
        // e.g., 'takeaway', 'class_attendance', 'parcel', 'buy'
        type: Sequelize.STRING,
        allowNull: false,
      },
      rewardAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      locationText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        // 订单状态：open(待接单) -> assigned(进行中) -> acceptor_done(接单员确认完成) -> publisher_confirmed(发布者确认完成) -> completed(订单完成)
        type: Sequelize.ENUM(
          "open",
          "assigned",
          "acceptor_done",
          "publisher_confirmed",
          "completed",
          "cancelled"
        ),
        defaultValue: "open",
        allowNull: false,
      },
      publisherId: {
        // Foreign Key to User model
        type: Sequelize.STRING(16),
        allowNull: false,
        references: {
          model: "users", // table name
          key: "id",
        },
      },
      acceptorId: {
        // Foreign Key to User model
        type: Sequelize.STRING(16),
        allowNull: true,
        references: {
          model: "users", // table name
          key: "id",
        },
      },
      acceptedAt: {
        // 接单时间
        type: Sequelize.DATE,
        allowNull: true,
        comment: "接单时间",
      },
      deadline: {
        // Optional deadline for the task
        type: Sequelize.DATE,
        allowNull: true,
      },
      out_trade_no: {
        type: Sequelize.STRING(64),
        allowNull: true,
        // 暂时移除 unique: true 以避免索引过多的问题
        comment: "微信支付订单号",
      },
      // 新增订单流程相关字段
      acceptorDoneTime: {
        // 接单员确认完成的时间
        type: Sequelize.DATE,
        allowNull: true,
        comment: "接单员确认完成时间",
      },
      publisherConfirmedTime: {
        // 发布者确认完成的时间
        type: Sequelize.DATE,
        allowNull: true,
        comment: "发布者确认完成时间",
      },
      autoConfirmTime: {
        // 自动确认时间（接单员确认完成后的12小时）
        type: Sequelize.DATE,
        allowNull: true,
        comment: "自动确认时间",
      },
      paymentStatus: {
        // 支付状态：pending(待支付) -> paid(已支付) -> transferred(已打款给接单员) -> refunded(已退款)
        type: Sequelize.ENUM("pending", "paid", "transferred", "refunded"),
        defaultValue: "pending",
        allowNull: false,
      },
      platformFee: {
        // 平台抽成金额（10%）
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "平台抽成金额",
      },
      acceptorFee: {
        // 接单员获得金额（90%）
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "接单员获得金额",
      },
      transferTime: {
        // 打款给接单员的时间
        type: Sequelize.DATE,
        allowNull: true,
        comment: "打款时间",
      },
      remarks: {
        // 备注信息
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "用户备注信息",
      },
      requiredGender: {
        // 任务需要的性别：0-不限, 1-男生, 2-女生
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "任务需要的性别：0-不限, 1-男生, 2-女生",
      },
      version: {
        // 版本：community(社区版) 或 campus(校园版)
        type: Sequelize.ENUM("community", "campus"),
        allowNull: false,
        defaultValue: "campus",
        comment: "版本：community(社区版) 或 campus(校园版)",
      },
      communityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "所属社区ID",
      },
      borrowMode: {
        // 借物品模式：lend(借出) 或 borrow(借进)
        type: Sequelize.ENUM("lend", "borrow"),
        allowNull: true,
        comment: "借物品模式：lend(借出) 或 borrow(借进)",
      },
      autoOfflineDate: {
        // 自动下架日期
        type: Sequelize.DATE,
        allowNull: true,
        comment: "自动下架日期",
      },
      budget: {
        // 物品预算（帮我买任务使用）
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "物品预算金额",
      },
      platform: {
        // 快递平台（帮我买任务使用）
        type: Sequelize.STRING,
        allowNull: true,
        comment: "快递平台",
      },
      pickupCode: {
        // 取件码（帮我买任务使用）
        type: Sequelize.STRING,
        allowNull: true,
        comment: "取件码",
      },
      pickupLocation: {
        // 取件地点（帮我买任务使用）
        type: Sequelize.STRING,
        allowNull: true,
        comment: "取件地点",
      },
      deliveryAddress: {
        // 送达地址（帮我买任务使用）
        type: Sequelize.STRING,
        allowNull: true,
        comment: "送达地址",
      },
      packageSize: {
        // 包裹大小（帮我买任务使用）
        type: Sequelize.STRING,
        allowNull: true,
        comment: "包裹大小",
      },
      canUpdate: {
        // 是否可以更新（前端状态字段）
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: "是否可以更新",
      },
      timeRequirement: {
        // 时间要求：immediate(立刻需要), 30min(30分钟内), 1hour(1小时内), 2hour(2小时内), 4hour(4小时内), 6hour(6小时内), 12hour(12小时内), 24hour(24小时内), 48hour(48小时内)
        type: Sequelize.ENUM(
          "immediate",
          "30min",
          "1hour",
          "2hour",
          "4hour",
          "6hour",
          "12hour",
          "24hour",
          "48hour"
        ),
        allowNull: true,
        comment: "时间要求",
      },
      autoCancelTime: {
        // 自动取消时间（根据时间要求计算）
        type: Sequelize.DATE,
        allowNull: true,
        comment: "自动取消时间",
      },

      // Additional fields if needed
      // completionTime: { type: Sequelize.DATE, allowNull: true },
      images: { type: Sequelize.JSON, allowNull: true }, // Store array of image URLs
    },
    {
      // 禁用 updatedAt 字段
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: false,
    }
  );

  return Task;
};
