/**
 * 考试资料控制器
 *
 * 负责处理考试资料相关功能：
 * - 考试真题
 * - 复习资料
 * - 学习笔记
 *
 * 数据存储：全局共享 - resources表（不分表）
 * 注意：图书资源由 book.controller.js 单独处理
 */

const { Resource } = require("../models");
const ExamResource = Resource; // 使用Resource模型作为ExamResource
const { Op } = require("sequelize");

// ==================== 考试资料列表查询 ====================

/**
 * 获取资源列表
 */
exports.getResources = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      major,
      subMajor,
      keyword,
      status = "active",
    } = req.query;

    // 检查是否为管理员请求（通过URL路径判断）
    const isAdminRequest = req.originalUrl.includes("/admin/api/v1/");

    const where = isAdminRequest ? {} : { status };

    // 如果是管理员请求，不限制status，否则只显示active状态
    if (!isAdminRequest) {
      where.status = status;
    } else if (status) {
      where.status = status;
    }

    // 添加筛选条件
    if (major) {
      where.major = major;
    }
    if (subMajor) {
      where.subMajor = subMajor;
    }
    if (keyword && typeof keyword === "string" && keyword.trim()) {
      // 清理keyword，确保是字符串类型（Sequelize的参数化查询已防止SQL注入）
      const cleanKeyword = String(keyword).trim().substring(0, 100); // 限制长度防止过长查询
      if (cleanKeyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${cleanKeyword}%` } },
          { course: { [Op.like]: `%${cleanKeyword}%` } },
          { teacher: { [Op.like]: `%${cleanKeyword}%` } },
        ];
      }
    }

    // 确保分页参数是有效的数字，防止SQL注入和NaN错误
    // 先将参数转换为字符串，然后尝试解析为整数
    let pageNum =
      typeof page === "string" || typeof page === "number"
        ? parseInt(String(page).replace(/[^0-9]/g, ""), 10)
        : 1;
    let pageSizeNum =
      typeof pageSize === "string" || typeof pageSize === "number"
        ? parseInt(String(pageSize).replace(/[^0-9]/g, ""), 10)
        : 20;

    // 如果parseInt失败或结果为NaN，使用默认值
    if (isNaN(pageNum) || pageNum < 1) {
      pageNum = 1;
    }
    if (isNaN(pageSizeNum) || pageSizeNum < 1) {
      pageSizeNum = 20;
    }

    // 限制分页参数范围，防止恶意请求
    const validPage = Math.max(1, Math.min(Math.floor(pageNum), 1000)); // 最大1000页，确保是整数
    const validPageSize = Math.min(Math.max(1, Math.floor(pageSizeNum)), 100); // 最大100条，确保是整数

    // 确保offset和limit都是有效的整数，防止NaN
    const offset = Math.max(0, Math.floor((validPage - 1) * validPageSize));
    const limit = Math.max(1, Math.floor(validPageSize));

    // 最终验证，确保不是NaN或无效值
    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit < 1) {
      console.error("分页参数计算错误:", {
        page,
        pageSize,
        offset,
        limit,
        pageNum,
        pageSizeNum,
      });
      return res.status(400).json({
        success: false,
        message: "无效的分页参数",
      });
    }

    const { count, rows } = await Resource.findAndCountAll({
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
        page: validPage,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("获取资源列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取资源列表失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料详情查询 ====================

/**
 * 获取单个资源详情
 */
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 确保收藏次数不会是负数
    if (resource.favorites < 0) {
      await resource.update({ favorites: 0 });
      await resource.reload();
    }

    // 创建返回数据，确保收藏次数不会是负数
    const resourceData = resource.toJSON();
    resourceData.favorites = Math.max(0, resourceData.favorites || 0);

    res.json({
      success: true,
      data: resourceData,
    });
  } catch (error) {
    console.error("获取资源详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取资源详情失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料创建 ====================

/**
 * 创建新资源
 */
exports.createResource = async (req, res) => {
  try {
    const db = require("../models");
    const { Resource, sequelize } = db;

    // 检查并修复表结构（如果字段类型不正确）
    try {
      const fields = await sequelize.query(
        `SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'resources'
          AND COLUMN_NAME IN ('createdBy', 'updatedBy')`,
        { type: sequelize.QueryTypes.SELECT }
      );

      // 检查 createdBy 字段类型
      const createdByField = fields.find((f) => f.COLUMN_NAME === "createdBy");
      if (
        createdByField &&
        (createdByField.DATA_TYPE === "int" ||
          createdByField.DATA_TYPE === "integer")
      ) {
        console.log(
          "检测到 createdBy 字段类型为 INTEGER，正在修改为 VARCHAR(16)..."
        );
        await sequelize.query(
          `ALTER TABLE resources MODIFY COLUMN createdBy VARCHAR(16) DEFAULT NULL COMMENT '创建者ID'`
        );
        console.log("✅ 已修复 createdBy 字段类型");
      }

      // 检查 updatedBy 字段类型
      const updatedByField = fields.find((f) => f.COLUMN_NAME === "updatedBy");
      if (
        updatedByField &&
        (updatedByField.DATA_TYPE === "int" ||
          updatedByField.DATA_TYPE === "integer")
      ) {
        console.log(
          "检测到 updatedBy 字段类型为 INTEGER，正在修改为 VARCHAR(16)..."
        );
        await sequelize.query(
          `ALTER TABLE resources MODIFY COLUMN updatedBy VARCHAR(16) DEFAULT NULL COMMENT '更新者ID'`
        );
        console.log("✅ 已修复 updatedBy 字段类型");
      }
    } catch (fixError) {
      console.warn("检查/修复表结构时出错（继续执行）:", fixError.message);
    }

    const resourceData = {
      title: req.body.title,
      course: req.body.course || "",
      teacher: req.body.teacher || null,
      major: req.body.major,
      subMajor: req.body.subMajor,
      year: req.body.year || null,
      description: req.body.description || null,
      coverImage: req.body.coverImage || null,
      downloadUrl: req.body.downloadUrl,
      extractCode: req.body.extractCode || null,
      tags: req.body.tags || null,
      downloads: req.body.downloads || 0,
      isTop: req.body.isTop || false,
      isRecommended: req.body.isRecommended || false,
      isNew: req.body.isNew !== undefined ? req.body.isNew : true,
      status: req.body.status || "active",
      createdBy: req.userId, // 确保是字符串类型
    };

    // 先尝试使用模型创建，如果失败则使用原始 SQL
    let resource;
    try {
      resource = await Resource.create(resourceData);
    } catch (modelError) {
      // 如果模型创建失败（可能是类型不匹配），使用原始 SQL 插入
      if (modelError.message && modelError.message.includes("integer value")) {
        console.log("检测到类型错误，使用原始 SQL 插入...");

        const insertQuery = `
          INSERT INTO resources (
            title, course, teacher, major, subMajor, year, description, coverImage,
            downloadUrl, extractCode, tags, downloads, isTop, isRecommended,
            isNew, status, createdBy, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const insertResult = await sequelize.query(insertQuery, {
          replacements: [
            resourceData.title,
            resourceData.course || "",
            resourceData.teacher || null,
            resourceData.major,
            resourceData.subMajor,
            resourceData.year || null,
            resourceData.description || null,
            resourceData.coverImage || null,
            resourceData.downloadUrl,
            resourceData.extractCode || null,
            resourceData.tags || null,
            resourceData.downloads || 0,
            resourceData.isTop || false,
            resourceData.isRecommended || false,
            resourceData.isNew !== undefined ? resourceData.isNew : true,
            resourceData.status || "active",
            String(resourceData.createdBy), // 确保是字符串类型
          ],
          type: sequelize.QueryTypes.INSERT,
        });

        const resourceId = insertResult[0];
        resource = await Resource.findByPk(resourceId);

        if (!resource) {
          throw new Error("创建资源成功但无法获取资源详情");
        }
      } else {
        throw modelError;
      }
    }

    res.status(201).json({
      success: true,
      message: "资源创建成功",
      data: resource,
    });
  } catch (error) {
    console.error("创建资源失败:", error);
    res.status(500).json({
      success: false,
      message: "创建资源失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料更新 ====================

/**
 * 更新资源
 */
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.userId,
    };

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    await resource.update(updateData);

    res.json({
      success: true,
      message: "资源更新成功",
      data: resource,
    });
  } catch (error) {
    console.error("更新资源失败:", error);
    res.status(500).json({
      success: false,
      message: "更新资源失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料删除 ====================

/**
 * 删除资源
 */
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 检查权限：只有发布者可以删除
    if (resource.createdBy !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限删除此资源",
      });
    }

    // 物理删除：直接从数据库删除记录
    await resource.destroy({ force: true });

    console.log(`✅ 已物理删除考试资料: ${id}`);

    res.json({
      success: true,
      message: "资源删除成功",
    });
  } catch (error) {
    console.error("删除资源失败:", error);
    res.status(500).json({
      success: false,
      message: "删除资源失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料下载统计 ====================

/**
 * 增加下载次数
 */
exports.incrementDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    await resource.increment("downloads");

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

/**
 * 收藏/取消收藏考试资料
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'add' 或 'remove'

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 如果数据库有favorites字段，使用increment/decrement
    // 否则暂时只返回成功（后续添加字段后会自动生效）
    try {
      if (action === "add") {
        await resource.increment("favorites");
      } else if (action === "remove") {
        // 先减少收藏次数
        await resource.decrement("favorites");
        // 重新加载数据获取最新值
        await resource.reload();
        // 确保不会小于0
        if (resource.favorites < 0 || !resource.favorites) {
          await resource.update({ favorites: 0 });
          await resource.reload();
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
    await resource.reload();

    // 确保返回的收藏次数不会是负数
    const favoritesCount = Math.max(0, resource.favorites || 0);

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

// ==================== 考试资料推荐 ====================

/**
 * 获取热门资源
 */
exports.getHotResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const resources = await Resource.findAll({
      where: { status: "active" },
      order: [["downloads", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("获取热门资源失败:", error);
    res.status(500).json({
      success: false,
      message: "获取热门资源失败",
      error: error.message,
    });
  }
};

/**
 * 获取推荐资源
 */
exports.getRecommendedResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const resources = await Resource.findAll({
      where: { status: "active", isRecommended: true },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error("获取推荐资源失败:", error);
    res.status(500).json({
      success: false,
      message: "获取推荐资源失败",
      error: error.message,
    });
  }
};

// ==================== 考试资料统计 ====================

/**
 * 获取资源统计信息
 */
exports.getResourceStats = async (req, res) => {
  try {
    // 统计所有状态的资源（包括 active、pending 等）
    // 但前端只显示 active 状态的资源，所以这里统计 active 状态
    const totalResources = await Resource.count({
      where: { status: "active" },
    });

    const totalDownloads = await Resource.sum("downloads", {
      where: { status: "active" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newResourcesToday = await Resource.count({
      where: {
        status: "active",
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    // 调试信息：检查所有状态的资源数量
    const allStatusCount = await Resource.count();
    const activeCount = await Resource.count({ where: { status: "active" } });
    const pendingCount = await Resource.count({ where: { status: "pending" } });
    const inactiveCount = await Resource.count({
      where: { status: "inactive" },
    });

    console.log(
      `[统计] 总资源数: ${allStatusCount}, active: ${activeCount}, pending: ${pendingCount}, inactive: ${inactiveCount}`
    );

    res.json({
      success: true,
      data: {
        totalResources,
        totalDownloads: totalDownloads || 0,
        newResourcesToday,
      },
    });
  } catch (error) {
    console.error("获取资源统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取资源统计失败",
      error: error.message,
    });
  }
};

// ==================== 管理员方法 ====================

// 获取所有资源（管理员）
const getAllResources = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      major,
      subMajor,
      keyword,
      status,
    } = req.query;

    // 构建查询条件
    const where = {};
    if (major) where.major = major;
    if (subMajor) where.subMajor = subMajor;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { tags: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await ExamResource.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    res.json({
      success: true,
      data: {
        resources: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize)),
      },
    });
  } catch (error) {
    console.error("获取所有资源失败:", error);
    res.status(500).json({
      success: false,
      message: "获取所有资源失败",
      error: error.message,
    });
  }
};

// 获取资源统计（管理员）
const getAdminStats = async (req, res) => {
  try {
    const totalResources = await ExamResource.count();
    const activeResources = await ExamResource.count({
      where: { status: "active" },
    });
    const pendingResources = await ExamResource.count({
      where: { status: "pending" },
    });
    const totalDownloads = (await ExamResource.sum("downloads")) || 0;
    const totalViews = (await ExamResource.sum("views")) || 0;

    res.json({
      success: true,
      data: {
        totalResources,
        activeResources,
        pendingResources,
        totalDownloads,
        totalViews,
      },
    });
  } catch (error) {
    console.error("获取资源统计失败:", error);
    res.status(500).json({
      success: false,
      message: "获取资源统计失败",
      error: error.message,
    });
  }
};

// 审核资源（管理员）
const reviewResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const resource = await ExamResource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    await resource.update({
      status,
      reviewRemark: remark,
      reviewedAt: new Date(),
      reviewedBy: req.userId,
    });

    res.json({
      success: true,
      message: "审核完成",
    });
  } catch (error) {
    console.error("审核资源失败:", error);
    res.status(500).json({
      success: false,
      message: "审核资源失败",
      error: error.message,
    });
  }
};

// 批量操作资源（管理员）
const batchOperation = async (req, res) => {
  try {
    const { action, resourceIds } = req.body;

    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "请选择要操作的资源",
      });
    }

    let result;
    switch (action) {
      case "delete":
        result = await ExamResource.destroy({
          where: { id: { [Op.in]: resourceIds } },
        });
        res.json({
          success: true,
          message: `成功删除 ${result} 个资源`,
        });
        break;
      case "activate":
        result = await ExamResource.update(
          { status: "active" },
          { where: { id: { [Op.in]: resourceIds } } }
        );
        res.json({
          success: true,
          message: `成功激活 ${result[0]} 个资源`,
        });
        break;
      case "deactivate":
        result = await ExamResource.update(
          { status: "inactive" },
          { where: { id: { [Op.in]: resourceIds } } }
        );
        res.json({
          success: true,
          message: `成功停用 ${result[0]} 个资源`,
        });
        break;
      default:
        res.status(400).json({
          success: false,
          message: "不支持的操作类型",
        });
    }
  } catch (error) {
    console.error("批量操作失败:", error);
    res.status(500).json({
      success: false,
      message: "批量操作失败",
      error: error.message,
    });
  }
};

// 添加管理员方法到导出
exports.getAllResources = getAllResources;
exports.getAdminStats = getAdminStats;
exports.reviewResource = reviewResource;
exports.batchOperation = batchOperation;

module.exports = exports;
