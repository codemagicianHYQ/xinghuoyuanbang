/**
 * 资源控制器
 *
 * 此控制器处理两类资源：
 * 1. 学习资料（考试资料、图书资源）- Resource模型 - 全局共享，不分表
 * 2. 校园互动（求资料、失物招领等）- CampusResource模型 - 按社区分表
 */

const { Resource, CampusResource } = require("../models");
const { Op } = require("sequelize");
const shardingHelper = require("../services/shardingHelper");
const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

// ==================== 校园互动相关接口（需要分表） ====================

// 获取校园互动资源列表（从分表查询）
exports.getCampusResourcesByCommunity = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      communityId,
      type,
      keyword,
      status = "active",
    } = req.query;

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId",
      });
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 获取分表名称
    const tableName = shardingHelper.getCampusTableName(communityId);

    // 构建查询条件
    let whereClause = `status = '${status}'`;
    const replacements = [];

    if (type) {
      whereClause += ` AND type = ?`;
      replacements.push(type);
    }

    if (keyword) {
      whereClause += ` AND (title LIKE ? OR description LIKE ?)`;
      replacements.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    );

    // 查询数据
    const resources = await sequelize.query(
      `SELECT * FROM ${tableName} WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: {
        total: countResult.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: resources,
      },
    });
  } catch (error) {
    console.error("获取校园互动列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取列表失败",
      error: error.message,
    });
  }
};

// 获取资源列表（旧接口，保留兼容性）
exports.getResources = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      major,
      subMajor,
      keyword,
      status = "active",
      type, // 新增：校园互动内容类型
      communityId, // 新增：社区ID
    } = req.query;

    // 如果指定了communityId，使用分表查询
    if (communityId) {
      return exports.getCampusResourcesByCommunity(req, res);
    }

    // 如果指定了type参数，查询校园互动内容
    if (type) {
      // 校园互动内容需要社区ID，如果没有提供则返回错误
      if (!communityId) {
        return res.status(400).json({
          success: false,
          message: "校园互动内容需要指定社区ID",
        });
      }

      // 使用分表查询
      return exports.getCampusResourcesByCommunity(req, res);
    }

    // 原有的学习资料查询逻辑
    const where = { status };

    // 添加筛选条件
    if (major) {
      where.major = major;
    }
    if (subMajor) {
      where.subMajor = subMajor;
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { course: { [Op.like]: `%${keyword}%` } },
        { teacher: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

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
        page: parseInt(page),
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

// 获取校园互动详情（从分表查询）
exports.getCampusResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.query;

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getCampusTableName(communityId);

    // 查询数据
    const resource = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error("获取校园互动详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取详情失败",
      error: error.message,
    });
  }
};

// 获取单个资源详情（旧接口，保留兼容性）
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.query;

    // 如果指定了communityId，使用分表查询
    if (communityId) {
      return exports.getCampusResourceById(req, res);
    }

    // 校园互动内容必须指定社区ID（已迁移至分表）
    // 只支持查询全局学习资料
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(400).json({
        success: false,
        message: "缺少社区ID参数，校园互动内容请传递communityId参数",
      });
    }

    // 如果是校园互动内容，需要转换数据格式以匹配前端期望
    if (resource.dataValues && resource.creator) {
      const campusResource = resource.toJSON();
      // 转换字段名以匹配前端期望
      campusResource.publisherName = campusResource.isAnonymous
        ? "匿名用户"
        : campusResource.creator?.nickname || "匿名用户";
      campusResource.publisherAvatar = campusResource.isAnonymous
        ? "/static/images/default-avatar.png"
        : campusResource.creator?.avatarUrl ||
          "/static/images/default-avatar.png";
      campusResource.postType = campusResource.type;
      campusResource.specifics = campusResource.description;
      campusResource.locationText = campusResource.location;

      // 移除creator字段，避免重复
      delete campusResource.creator;

      return res.json({
        success: true,
        data: campusResource,
      });
    }

    res.json({
      success: true,
      data: resource,
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

// 创建新资源
exports.createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      createdBy: req.userId,
    };

    const resource = await Resource.create(resourceData);

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

// 更新资源
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

// 删除资源
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.query;

    let resource = null;

    // 如果提供了社区ID，从分表查询校园互动内容
    if (communityId) {
      const tableName = shardingHelper.getCampusTableName(communityId);
      resource = await shardingHelper.findByIdInShardedTable(tableName, id);
    }

    // 如果分表中没有找到，再查询学习资料表
    if (!resource) {
      resource = await Resource.findByPk(id);
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 检查权限：只有发布者可以删除
    if (
      resource.createdBy !== req.userId &&
      resource.publisherId !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "无权限删除此资源",
      });
    }

    // 物理删除：直接从数据库删除记录
    await resource.destroy({ force: true });

    console.log(`✅ 已物理删除资源: ${id}`);

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

// 增加下载次数
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

// 获取热门资源
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

// 获取推荐资源
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

// 获取资源统计信息
exports.getResourceStats = async (req, res) => {
  try {
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

// 创建校园互动内容
exports.createCampusResource = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      location,
      contactInfo,
      images,
      itemType,
      date,
      questionType,
      deadline,
      complaintType,
      isAnonymous,
      shareType,
      activityType,
      activityDate,
      activityTime,
      maxParticipants,
      communityId, // 新增：社区ID
    } = req.body;

    // 验证必填字段
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "缺少必填字段：type、title、description",
      });
    }

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填字段：communityId（社区ID）",
      });
    }

    // 验证类型是否有效
    const validTypes = [
      "ask",
      "lost",
      "salvage",
      "complaint",
      "share",
      "partner",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "无效的内容类型",
      });
    }

    const campusResourceData = {
      type,
      title: (title || "").trim(),
      description: (description || "").trim(),
      location: (location || "").trim() || null,
      contactInfo: (contactInfo || "").trim() || null,
      images: images ? JSON.stringify(images) : null,
      itemType: itemType || null,
      date: date || null,
      questionType: questionType || null,
      deadline: deadline || null,
      complaintType: complaintType || null,
      isAnonymous: isAnonymous || false,
      shareType: shareType || null,
      activityType: activityType || null,
      activityDate: activityDate || null,
      activityTime: activityTime || null,
      maxParticipants: maxParticipants || null,
      createdBy: req.userId,
      communityId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 使用分表辅助服务插入到对应社区的分表
    const shardingHelper = require("../services/shardingHelper");
    const tableName = shardingHelper.getCampusTableName(communityId);
    const campusResource = await shardingHelper.insertIntoShardedTable(
      tableName,
      campusResourceData
    );

    console.log(`✅ 成功发布校园互动到分表: ${tableName}`);

    res.status(201).json({
      success: true,
      message: "发布成功",
      data: campusResource,
    });
  } catch (error) {
    console.error("创建校园互动内容失败:", error);
    res.status(500).json({
      success: false,
      message: "发布失败",
      error: error.message,
    });
  }
};
