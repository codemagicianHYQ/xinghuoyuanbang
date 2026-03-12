const { Book } = require("../models");
const { Op } = require("sequelize");

// 获取图书列表
exports.getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      category,
      subCategory,
      keyword,
      status = "active",
      isElectronic,
    } = req.query;

    // 构建查询条件
    const whereConditions = [];

    // 状态条件
    whereConditions.push({ status });

    // 添加筛选条件
    if (category) {
      whereConditions.push({ category });
    }
    if (subCategory) {
      whereConditions.push({ subCategory });
    }
    if (isElectronic !== undefined) {
      whereConditions.push({ isElectronic: isElectronic === "true" });
    }

    // 处理关键词搜索
    if (keyword && keyword.trim()) {
      const keywordConditions = [
        { title: { [Op.like]: `%${keyword.trim()}%` } },
        { author: { [Op.like]: `%${keyword.trim()}%` } },
        { publisher: { [Op.like]: `%${keyword.trim()}%` } },
      ];

      // 将关键词条件组合为一个 Op.or 条件
      whereConditions.push({
        [Op.or]: keywordConditions,
      });
    }

    // 组合所有条件
    const where =
      whereConditions.length === 1
        ? whereConditions[0]
        : { [Op.and]: whereConditions };

    // 确保分页参数是有效的数字
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;

    // 限制分页参数范围
    const validPage = Math.max(1, pageNum);
    const validPageSize = Math.min(Math.max(1, pageSizeNum), 100); // 最大100条

    const offset = (validPage - 1) * validPageSize;
    const limit = validPageSize;

    const { count, rows } = await Book.findAndCountAll({
      where,
      order: [
        ["isTop", "DESC"],
        ["isRecommended", "DESC"],
        ["createdAt", "DESC"],
      ],
      offset,
      limit,
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("获取图书列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取图书列表失败",
      error: error.message,
    });
  }
};

// 获取单个图书详情
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    // 增加浏览次数
    await book.increment("views");

    // 重新加载数据获取最新值
    await book.reload();

    // 确保收藏次数不会是负数
    if (book.favorites < 0) {
      await book.update({ favorites: 0 });
      await book.reload();
    }

    // 创建返回数据，确保收藏次数不会是负数
    const bookData = book.toJSON();
    bookData.favorites = Math.max(0, bookData.favorites || 0);

    res.json({
      success: true,
      data: bookData,
    });
  } catch (error) {
    console.error("获取图书详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取图书详情失败",
      error: error.message,
    });
  }
};

// 创建新图书
exports.createBook = async (req, res) => {
  try {
    // 验证必填字段
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: "图书标题不能为空",
      });
    }
    if (!req.body.category) {
      return res.status(400).json({
        success: false,
        message: "图书分类不能为空",
      });
    }
    if (!req.body.subCategory) {
      return res.status(400).json({
        success: false,
        message: "子分类不能为空",
      });
    }
    if (!req.body.isElectronic && !req.body.downloadUrl) {
      return res.status(400).json({
        success: false,
        message: "电子书必须提供下载链接",
      });
    }

    // 构建图书数据，确保字段与模型一致
    const bookData = {
      title: req.body.title,
      author: req.body.author || null,
      publisher: req.body.publisher || null,
      publishDate: req.body.publishDate || null,
      category: req.body.category,
      subCategory: req.body.subCategory,
      description: req.body.description || null,
      coverImage: req.body.coverImage || null,
      downloadUrl: req.body.downloadUrl || null,
      extractCode: req.body.extractCode || null,
      tags: req.body.tags || null,
      isElectronic: true, // 固定为电子书
      isTop: req.body.isTop || false,
      isRecommended: req.body.isRecommended || false,
      status: req.body.status || "active",
      createdBy: req.userId,
      uploadBy: req.userId,
    };

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: "图书创建成功",
      data: book,
    });
  } catch (error) {
    console.error("创建图书失败:", error);
    res.status(500).json({
      success: false,
      message: "创建图书失败",
      error: error.message,
    });
  }
};

// 更新图书
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    // 构建更新数据，只包含模型中的字段
    const updateData = {
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher,
      publishDate: req.body.publishDate,
      category: req.body.category,
      subCategory: req.body.subCategory,
      description: req.body.description,
      coverImage: req.body.coverImage,
      downloadUrl: req.body.downloadUrl,
      extractCode: req.body.extractCode,
      tags: req.body.tags,
      isElectronic: true, // 固定为电子书
      isTop: req.body.isTop,
      isRecommended: req.body.isRecommended,
      status: req.body.status,
      updatedBy: req.userId,
    };

    // 移除 undefined 字段
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await book.update(updateData);

    res.json({
      success: true,
      message: "图书更新成功",
      data: book,
    });
  } catch (error) {
    console.error("更新图书失败:", error);
    res.status(500).json({
      success: false,
      message: "更新图书失败",
      error: error.message,
    });
  }
};

// 删除图书
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    // 物理删除：直接从数据库删除记录
    await book.destroy({ force: true });

    console.log(`✅ 已物理删除图书: ${id}`);

    res.json({
      success: true,
      message: "图书删除成功",
    });
  } catch (error) {
    console.error("删除图书失败:", error);
    res.status(500).json({
      success: false,
      message: "删除图书失败",
      error: error.message,
    });
  }
};

// 增加下载次数
exports.incrementDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    await book.increment("downloads");

    res.json({
      success: true,
      message: "下载次数更新成功",
    });
  } catch (error) {
    console.error("更新下载次数失败:", error);
    res.status(500).json({
      success: false,
      message: "更新下载次数失败",
      error: error.message,
    });
  }
};

// 点赞图书
exports.likeBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    await book.increment("likes");

    res.json({
      success: true,
      message: "点赞成功",
    });
  } catch (error) {
    console.error("点赞失败:", error);
    res.status(500).json({
      success: false,
      message: "点赞失败",
      error: error.message,
    });
  }
};

// 收藏/取消收藏图书
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'add' 或 'remove'

    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "图书不存在",
      });
    }

    // 如果数据库有favorites字段，使用increment/decrement
    // 否则暂时只返回成功（后续添加字段后会自动生效）
    try {
      if (action === "add") {
        await book.increment("favorites");
      } else if (action === "remove") {
        // 先减少收藏次数
        await book.decrement("favorites");
        // 重新加载数据获取最新值
        await book.reload();
        // 确保不会小于0
        if (book.favorites < 0 || !book.favorites) {
          await book.update({ favorites: 0 });
          await book.reload();
        }
      }
    } catch (fieldError) {
      // 如果字段不存在，忽略错误（后续添加字段后会自动生效）
      console.warn(
        "收藏次数字段可能不存在，将在添加字段后生效:",
        fieldError.message
      );
    }

    // 重新获取更新后的数据
    await book.reload();

    // 确保返回的收藏次数不会是负数
    const favoritesCount = Math.max(0, book.favorites || 0);

    res.json({
      success: true,
      message: action === "add" ? "收藏成功" : "取消收藏成功",
      data: {
        favorites: favoritesCount,
      },
    });
  } catch (error) {
    console.error("收藏操作失败:", error);
    res.status(500).json({
      success: false,
      message: "收藏操作失败",
      error: error.message,
    });
  }
};

// 获取热门图书
exports.getHotBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.findAll({
      where: { status: "active" },
      order: [["downloads", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("获取热门图书失败:", error);
    res.status(500).json({
      success: false,
      message: "获取热门图书失败",
      error: error.message,
    });
  }
};

// 获取推荐图书
exports.getRecommendedBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.findAll({
      where: { status: "active", isRecommended: true },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("获取推荐图书失败:", error);
    res.status(500).json({
      success: false,
      message: "获取推荐图书失败",
      error: error.message,
    });
  }
};

// 获取图书统计信息
exports.getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.count({
      where: { status: "active" },
    });

    const totalDownloads = await Book.sum("downloads", {
      where: { status: "active" },
    });

    const totalViews = await Book.sum("views", {
      where: { status: "active" },
    });

    const totalLikes = await Book.sum("likes", {
      where: { status: "active" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newBooksToday = await Book.count({
      where: {
        status: "active",
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    const electronicBooks = await Book.count({
      where: { status: "active", isElectronic: true },
    });

    const physicalBooks = await Book.count({
      where: { status: "active", isElectronic: false },
    });

    res.json({
      success: true,
      data: {
        totalBooks,
        totalDownloads: totalDownloads || 0,
        totalViews: totalViews || 0,
        totalLikes: totalLikes || 0,
        newBooksToday,
        electronicBooks,
        physicalBooks,
      },
    });
  } catch (error) {
    console.error("获取图书统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取图书统计失败",
      error: error.message,
    });
  }
};

// 获取图书分类统计
exports.getBookCategories = async (req, res) => {
  try {
    const categories = await Book.findAll({
      attributes: [
        "category",
        "subCategory",
        [Book.sequelize.fn("COUNT", Book.sequelize.col("id")), "count"],
      ],
      where: { status: "active" },
      group: ["category", "subCategory"],
      order: [
        ["category", "ASC"],
        ["subCategory", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("获取图书分类统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取图书分类统计失败",
      error: error.message,
    });
  }
};
