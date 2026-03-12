const { Comment, CampusResource, User } = require("../models");
const { Op } = require("sequelize");

// 获取评论列表
exports.getComments = async (req, res) => {
  try {
    const { campusResourceId, communityId, page = 1, limit = 20 } = req.query;

    if (!campusResourceId) {
      return res.status(400).json({
        success: false,
        message: "缺少校园资源ID",
      });
    }

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少社区ID",
      });
    }

    // 安全地解析分页参数，防止NaN
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    // 确保参数为正整数
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "分页参数无效",
      });
    }

    const offset = (pageNum - 1) * limitNum;

    // 优化查询：分步查询，避免复杂的嵌套include
    const { count, rows } = await Comment.findAndCountAll({
      where: {
        campusResourceId: parseInt(campusResourceId),
        communityId: parseInt(communityId),
        status: "active",
        parentId: null, // 只获取顶级评论
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: limitNum,
      offset: offset,
    });

    // 单独查询回复，避免复杂的嵌套查询
    if (rows.length > 0) {
      const commentIds = rows.map((comment) => comment.id);
      const replies = await Comment.findAll({
        where: {
          parentId: { [Op.in]: commentIds },
          status: "active",
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "nickname", "avatarUrl"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // 将回复按parentId分组
      const repliesMap = {};
      replies.forEach((reply) => {
        if (!repliesMap[reply.parentId]) {
          repliesMap[reply.parentId] = [];
        }
        repliesMap[reply.parentId].push(reply);
      });

      // 将回复添加到对应的评论中
      rows.forEach((comment) => {
        comment.dataValues.replies = repliesMap[comment.id] || [];
      });
    }

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    res.status(500).json({
      success: false,
      message: "获取评论失败",
    });
  }
};

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const {
      campusResourceId,
      communityId,
      content,
      parentId,
      isAnonymous = false,
    } = req.body;
    const userId = req.userId;

    if (!campusResourceId || !content) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少社区ID",
      });
    }

    // 注意：现在使用分表，不再检查主表 CampusResource
    // 校园资源存在性应该由前端保证，或在查询分表时验证

    const comment = await Comment.create({
      campusResourceId: parseInt(campusResourceId),
      communityId: parseInt(communityId),
      userId,
      content: content.trim(),
      parentId: parentId ? parseInt(parentId) : null,
      isAnonymous: Boolean(isAnonymous),
    });

    // 获取完整的评论信息（包括用户信息）
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "avatarUrl"],
        },
      ],
    });

    res.json({
      success: true,
      data: commentWithUser,
      message: "评论成功",
    });
  } catch (error) {
    console.error("创建评论失败:", error);
    res.status(500).json({
      success: false,
      message: "评论失败",
    });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "评论不存在",
      });
    }

    // 检查权限：只有评论作者可以删除
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "无权限删除此评论",
      });
    }

    // 删除主评论及其所有子评论
    if (comment.parentId === null) {
      // 如果是主评论，先删除所有子评论
      await Comment.destroy({
        where: {
          parentId: comment.id,
        },
      });
    }

    // 删除主评论
    await comment.destroy();

    res.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除评论失败:", error);
    res.status(500).json({
      success: false,
      message: "删除失败",
    });
  }
};
