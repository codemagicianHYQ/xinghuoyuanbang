module.exports = (sequelize, Sequelize) => {
  const Resource = sequelize.define(
    "Resource",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "资料标题",
      },
      course: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "课程名称",
      },
      teacher: {
        type: Sequelize.STRING(30),
        allowNull: true,
        comment: "任课教师",
      },
      major: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: "专业大类",
      },
      subMajor: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment: "专业小类",
      },
      year: {
        type: Sequelize.STRING(30),
        allowNull: true,
        comment: "学年学期",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "资料描述",
      },
      coverImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "封面图片URL",
      },
      downloadUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: "下载链接",
      },
      extractCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "提取码",
      },
      tags: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: "标签，逗号分隔",
      },
      downloads: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "下载次数",
      },
      favorites: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "收藏次数",
      },
      isTop: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否置顶",
      },
      isRecommended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否推荐",
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "是否新资料",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "deleted"),
        defaultValue: "active",
        comment: "状态：active-正常，inactive-禁用，deleted-已删除",
      },
      createdBy: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "创建者ID",
      },
      updatedBy: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "更新者ID",
      },
    },
    {
      tableName: "resources",
      timestamps: true,
      indexes: [
        {
          fields: ["major", "subMajor"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["isTop"],
        },
        {
          fields: ["isRecommended"],
        },
        {
          fields: ["downloads"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  Resource.associate = (models) => {
    // 可以在这里定义与其他模型的关联关系
    // 例如：Resource.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
  };

  return Resource;
};
