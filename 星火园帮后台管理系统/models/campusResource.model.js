module.exports = (sequelize, Sequelize) => {
  const CampusResource = sequelize.define(
    "CampusResource",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.ENUM(
          "ask",
          "lost",
          "salvage",
          "complaint",
          "share",
          "partner"
        ),
        allowNull: false,
        comment:
          "内容类型：ask-问答，lost-寻物，salvage-捞一捞，complaint-吐槽，share-分享，partner-找搭子",
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "标题",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "详细描述",
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: "地点",
      },
      contactInfo: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "联系方式",
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "图片URL数组",
      },
      // 寻物相关字段
      itemType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "物品类型（仅寻物使用）",
      },
      // 捞一捞相关字段
      date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "日期（仅捞一捞使用）",
      },
      // 问答相关字段
      questionType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "问题类型（仅问答使用）",
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "截止时间（仅问答使用）",
      },
      // 吐槽相关字段
      complaintType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "吐槽类型（仅吐槽使用）",
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否匿名（仅吐槽使用）",
      },
      // 分享相关字段
      shareType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "分享类型（仅分享使用）",
      },
      // 找搭子相关字段
      activityType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "活动类型（仅找搭子使用）",
      },
      activityDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "活动日期（仅找搭子使用）",
      },
      activityTime: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "活动时间（仅找搭子使用）",
      },
      maxParticipants: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "最大参与人数（仅找搭子使用）",
      },
      // 通用字段
      status: {
        type: Sequelize.ENUM("active", "completed", "deleted"),
        defaultValue: "active",
        comment: "状态：active-活跃，completed-已完成，deleted-已删除",
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "浏览次数",
      },
      likeCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "点赞次数",
      },
      commentCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "评论次数",
      },
      createdBy: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "创建者ID",
      },
      updatedBy: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "更新者ID",
      },
    },
    {
      tableName: "campus_resources", // 校园论坛分表
      timestamps: true,
      indexes: [
        {
          fields: ["type"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["createdBy"],
        },
        {
          fields: ["type", "status"],
        },
      ],
    }
  );

  return CampusResource;
};
