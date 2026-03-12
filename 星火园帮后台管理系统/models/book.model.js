module.exports = (sequelize, Sequelize) => {
  const Book = sequelize.define(
    "Book",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "图书标题",
      },
      author: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "作者",
      },
      publisher: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "出版社",
      },
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "出版日期",
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "图书分类",
      },
      subCategory: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "子分类",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "图书描述",
      },
      coverImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "封面图片URL",
      },
      downloadUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "下载链接（电子书）",
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
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "浏览次数",
      },
      likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "点赞次数",
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
      isElectronic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否为电子书（固定为电子书）",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "deleted"),
        defaultValue: "active",
        comment: "状态：active-正常，inactive-禁用，deleted-已删除",
      },
      uploadBy: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "上传者ID",
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
      tableName: "books",
      timestamps: true,
      indexes: [
        {
          fields: ["category", "subCategory"],
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
          fields: ["views"],
        },
        {
          fields: ["likes"],
        },
        {
          fields: ["createdAt"],
        },
        // 移除 isbn 索引（仅电子书不再使用）
        {
          fields: ["author"],
        },
      ],
    }
  );

  Book.associate = (models) => {
    // 可以在这里定义与其他模型的关联关系
    // 例如：Book.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploadBy' });
    // Book.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
  };

  return Book;
};
