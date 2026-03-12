const db = require("../models");
const { User, Follow } = db;

// 关注用户
exports.followUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.userId;

    console.log(
      `[followUser] 关注请求: followerId=${followerId}, targetUserId=${targetUserId}`
    );

    // 检查认证
    if (!followerId) {
      console.log(`[followUser] 用户未认证`);
      return res.status(401).json({
        success: false,
        message: "用户未认证",
      });
    }

    // 不能关注自己
    if (followerId === targetUserId) {
      console.log(`[followUser] 不能关注自己: ${followerId}`);
      return res.status(400).json({
        success: false,
        message: "不能关注自己",
      });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 检查是否已经关注
    const existingFollow = await Follow.findOne({
      where: {
        followerId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "已经关注过该用户",
      });
    }

    // 创建关注关系
    const follow = await Follow.create({
      followerId,
      followingId: targetUserId,
    });

    res.json({
      success: true,
      message: "关注成功",
      data: follow,
    });
  } catch (error) {
    console.error("关注用户失败:", error);
    res.status(500).json({
      success: false,
      message: "关注失败",
    });
  }
};

// 取消关注用户
exports.unfollowUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.userId;

    // 查找关注关系
    const follow = await Follow.findOne({
      where: {
        followerId,
        followingId: targetUserId,
      },
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "未关注该用户",
      });
    }

    // 删除关注关系
    await follow.destroy();

    res.json({
      success: true,
      message: "取消关注成功",
    });
  } catch (error) {
    console.error("取消关注失败:", error);
    res.status(500).json({
      success: false,
      message: "取消关注失败",
    });
  }
};

// 获取关注列表
exports.getFollowingList = async (req, res) => {
  try {
    const followerId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Follow.findAndCountAll({
      where: { followerId },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "nickname", "avatarUrl", "school"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    // 获取每个用户的商品统计
    const followingList = await Promise.all(
      rows.map(async (follow) => {
        const user = follow.following;
        if (!user) return null;

        // 获取用户的商品统计（需要社区ID）
        const { communityId } = req.query;
        let stats = {
          totalCount: 0,
          goodsCount: 0,
          soldCount: 0,
        };

        if (communityId) {
          try {
            // 使用分表查询用户商品统计
            const shardingHelper = require("../services/shardingHelper");
            const tableName = shardingHelper.getMarketTableName(communityId);

            // 查询该用户的所有商品
            const userProducts = await shardingHelper.queryFromShardedTable(
              tableName,
              {
                where: { sellerId: user.id },
              }
            );

            // 计算统计
            const goodsCount = userProducts.rows.filter(
              (item) => item.status === "active"
            ).length;
            const soldCount = userProducts.rows.filter(
              (item) => item.status === "sold" || item.status === "completed"
            ).length;

            stats = {
              totalCount: userProducts.rows.length,
              goodsCount: goodsCount,
              soldCount: soldCount,
            };
          } catch (error) {
            console.error(`获取用户 ${user.id} 商品统计失败:`, error);
            // 保持默认的0值
          }
        }

        return {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          school: user.school,
          goodsCount: parseInt(stats.goodsCount) || 0,
          soldCount: parseInt(stats.soldCount) || 0,
          followTime: follow.createdAt,
        };
      })
    );

    res.json({
      success: true,
      data: {
        list: followingList.filter(Boolean),
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取关注列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取关注列表失败",
    });
  }
};

// 获取粉丝列表
exports.getFollowersList = async (req, res) => {
  try {
    const followingId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Follow.findAndCountAll({
      where: { followingId },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "nickname", "avatarUrl", "school"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    const followersList = rows.map((follow) => ({
      id: follow.follower.id,
      nickname: follow.follower.nickname,
      avatarUrl: follow.follower.avatarUrl,
      school: follow.follower.school,
      followTime: follow.createdAt,
    }));

    res.json({
      success: true,
      data: {
        list: followersList,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取粉丝列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取粉丝列表失败",
    });
  }
};

// 检查关注状态
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const followerId = req.userId;

    const follow = await Follow.findOne({
      where: {
        followerId,
        followingId: targetUserId,
      },
    });

    res.json({
      success: true,
      data: {
        isFollowing: !!follow,
      },
    });
  } catch (error) {
    console.error("检查关注状态失败:", error);
    res.status(500).json({
      success: false,
      message: "检查关注状态失败",
    });
  }
};
