/**
 * 校园论坛控制器
 *
 * 负责处理校园论坛相关功能：
 * - 求资料 (ask)
 * - 失物招领 (salvage)
 * - 寻物启事 (lost)
 * - 吐槽 (complaint)
 * - 分享 (share)
 * - 找伙伴 (partner)
 *
 * 数据存储：按社区分表 - campus_resources_community_{communityId} (校园论坛)
 */

const { CampusResource } = require("../models");
const { Op } = require("sequelize");
const shardingHelper = require("../services/shardingHelper");
const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

// ==================== 校园论坛列表查询（分表） ====================

/**
 * 获取校园论坛资源列表（从分表查询）
 */
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

    // 构建查询条件 - 使用参数化查询防止SQL注入
    let whereClause = `${tableName}.status = ?`;
    const replacements = [status];

    if (type) {
      whereClause += ` AND ${tableName}.type = ?`;
      replacements.push(type);
    }

    if (keyword) {
      whereClause += ` AND (${tableName}.title LIKE ? OR ${tableName}.description LIKE ?)`;
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

    // 查询数据 - 关联用户表获取发布者信息
    const resources = await sequelize.query(
      `SELECT 
        ${tableName}.*,
        users.id as creator_id,
        users.nickname as creator_nickname,
        users.avatarUrl as creator_avatarUrl
       FROM ${tableName}
       LEFT JOIN users ON ${tableName}.createdBy = users.id
       WHERE ${whereClause}
       ORDER BY ${tableName}.createdAt DESC
       LIMIT ${limit} OFFSET ${offset}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    );

    // 格式化返回数据，将用户信息整合到 creator 对象中
    const formattedResources = resources.map((resource) => {
      const { creator_id, creator_nickname, creator_avatarUrl, ...rest } =
        resource;

      // 如果设置了匿名，则不返回用户信息
      if (resource.isAnonymous) {
        return {
          ...rest,
          creator: {
            id: "anonymous",
            nickname: "匿名用户",
            avatarUrl: "/static/default-avatar.png",
          },
        };
      }

      return {
        ...rest,
        creator: creator_id
          ? {
              id: creator_id,
              nickname: creator_nickname || "未知用户",
              avatarUrl: creator_avatarUrl || "/static/default-avatar.png",
            }
          : {
              id: "unknown",
              nickname: "未知用户",
              avatarUrl: "/static/default-avatar.png",
            },
      };
    });

    res.json({
      success: true,
      data: {
        total: countResult.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: formattedResources,
      },
    });
  } catch (error) {
    console.error("获取校园论坛列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取列表失败",
      error: error.message,
    });
  }
};

// ==================== 校园论坛详情查询（分表） ====================

/**
 * 获取校园论坛详情（从分表查询）
 */
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

    // 查询数据 - 关联用户表获取发布者信息
    const [resource] = await sequelize.query(
      `SELECT 
        ${tableName}.*,
        users.id as creator_id,
        users.nickname as creator_nickname,
        users.avatarUrl as creator_avatarUrl
       FROM ${tableName}
       LEFT JOIN users ON ${tableName}.createdBy = users.id
       WHERE ${tableName}.id = ?
       LIMIT 1`,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 格式化返回数据
    const { creator_id, creator_nickname, creator_avatarUrl, ...rest } =
      resource;

    let formattedResource;
    // 如果设置了匿名，则不返回用户信息
    if (resource.isAnonymous) {
      formattedResource = {
        ...rest,
        creator: {
          id: "anonymous",
          nickname: "匿名用户",
          avatarUrl: "/static/default-avatar.png",
        },
      };
    } else {
      formattedResource = {
        ...rest,
        creator: creator_id
          ? {
              id: creator_id,
              nickname: creator_nickname || "未知用户",
              avatarUrl: creator_avatarUrl || "/static/default-avatar.png",
            }
          : {
              id: "unknown",
              nickname: "未知用户",
              avatarUrl: "/static/default-avatar.png",
            },
      };
    }

    res.json({
      success: true,
      data: formattedResource,
    });
  } catch (error) {
    console.error("获取校园论坛详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取详情失败",
      error: error.message,
    });
  }
};

// ==================== 校园论坛发布（分表） ====================

/**
 * 创建校园论坛内容
 */
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
      communityId, // 必填：社区ID
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
      "ask", // 求资料
      "lost", // 寻物启事
      "salvage", // 失物招领
      "complaint", // 吐槽
      "share", // 分享
      "partner", // 找伙伴
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
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 使用分表辅助服务插入到对应社区的分表
    const tableName = shardingHelper.getCampusTableName(communityId);
    const campusResource = await shardingHelper.insertIntoShardedTable(
      tableName,
      campusResourceData
    );

    console.log(`✅ 成功发布校园论坛到分表: ${tableName}`);

    res.status(201).json({
      success: true,
      message: "发布成功",
      data: campusResource,
    });
  } catch (error) {
    console.error("创建校园论坛内容失败:", error);
    res.status(500).json({
      success: false,
      message: "发布失败",
      error: error.message,
    });
  }
};

// ==================== 校园论坛更新（分表） ====================

/**
 * 更新校园论坛内容
 */
exports.updateCampusResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId } = req.query;
    const updateData = req.body;

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getCampusTableName(communityId);

    // 查询原记录
    const resource = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 检查权限
    if (resource.createdBy !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限修改此资源",
      });
    }

    // 更新数据
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date(),
    };

    await shardingHelper.updateInShardedTable(tableName, id, dataToUpdate);

    res.json({
      success: true,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新校园论坛失败:", error);
    res.status(500).json({
      success: false,
      message: "更新失败",
      error: error.message,
    });
  }
};

// ==================== 校园论坛删除（分表） ====================

/**
 * 删除校园论坛内容（软删除）
 */
exports.deleteCampusResource = async (req, res) => {
  try {
    const { id } = req.params;
    // DELETE 请求的参数可能在 query 或 body 中
    const communityId = req.query.communityId || req.body.communityId;

    console.log("删除校园互动请求:", {
      id,
      communityId,
      userId: req.userId,
      query: req.query,
      body: req.body,
      params: req.params,
    });

    // 如果没有 communityId，尝试从所有社区中查找
    let resource = null;
    let actualCommunityId = communityId;
    let tableName = null;

    if (!communityId) {
      console.warn("⚠️ 未提供 communityId，将从所有社区查找");
      // 获取所有社区
      const { sequelize } = require("../config/database");
      const { QueryTypes } = require("sequelize");
      const communities = await sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: QueryTypes.SELECT }
      );

      // 遍历所有社区查找资源
      for (const community of communities) {
        try {
          tableName = shardingHelper.getCampusTableName(community.id);
          resource = await shardingHelper.findByIdInShardedTable(tableName, id);
          if (resource) {
            actualCommunityId = community.id;
            console.log(`✅ 在社区 ${community.id} 找到资源`);
            break;
          }
        } catch (error) {
          // 继续查找下一个社区
          continue;
        }
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "资源不存在",
        });
      }
    } else {
      // 获取分表名称
      tableName = shardingHelper.getCampusTableName(communityId);
      // 查询原记录
      resource = await shardingHelper.findByIdInShardedTable(tableName, id);
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "资源不存在",
      });
    }

    // 检查权限
    if (resource.createdBy !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限删除此资源",
      });
    }

    // 检查是否有评论
    const { Comment } = require("../models");
    const commentCount = await Comment.count({
      where: {
        campusResourceId: parseInt(id),
        communityId: parseInt(actualCommunityId),
      },
    });

    console.log(`该内容有 ${commentCount} 条评论（包括已删除）`);

    // 如果有评论，物理删除所有评论（包括子评论）
    if (commentCount > 0) {
      const deletedCount = await Comment.destroy({
        where: {
          campusResourceId: parseInt(id),
          communityId: parseInt(actualCommunityId),
        },
        force: true, // 强制物理删除
      });
      console.log(`✅ 已物理删除 ${deletedCount} 条评论`);
    }

    // 物理删除：直接从数据库删除记录
    await shardingHelper.deleteFromShardedTable(tableName, id);

    console.log(`✅ 已物理删除校园论坛内容: ${id}`);

    res.json({
      success: true,
      message: "删除成功",
      deletedComments: commentCount,
    });
  } catch (error) {
    console.error("删除校园论坛失败:", error);
    res.status(500).json({
      success: false,
      message: "删除失败",
      error: error.message,
    });
  }
};

// ==================== 兼容旧接口（主表查询） ====================

/**
 * 获取资源列表（旧接口，兼容性保留）
 * 如果传入communityId，使用分表查询；否则使用主表查询
 */
exports.getResources = async (req, res) => {
  const { communityId } = req.query;

  // 如果指定了communityId，使用分表查询
  if (communityId) {
    return exports.getCampusResourcesByCommunity(req, res);
  }

  // 否则返回错误，因为校园互动内容必须指定社区ID
  return res.status(400).json({
    success: false,
    message: "校园论坛内容需要指定社区ID",
  });
};

/**
 * 获取单个资源详情（旧接口，兼容性保留）
 */
exports.getResourceById = async (req, res) => {
  const { communityId } = req.query;

  // 如果指定了communityId，使用分表查询
  if (communityId) {
    return exports.getCampusResourceById(req, res);
  }

  // 否则返回错误，因为校园互动内容必须指定社区ID
  return res.status(400).json({
    success: false,
    message: "校园论坛内容需要指定社区ID",
  });
};

module.exports = exports;
