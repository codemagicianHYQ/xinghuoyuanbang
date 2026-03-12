const db = require("../models");
const Community = db.Community;
const { Op } = require("sequelize");

/**
 * 获取社区列表（支持搜索、分页、筛选）
 */
exports.getCommunities = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      province,
      city,
      keyword,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
        { province: { [Op.like]: `%${keyword}%` } },
        { city: { [Op.like]: `%${keyword}%` } },
      ];
    }

    // 传统搜索
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (province) {
      where.province = province;
    }

    if (city) {
      where.city = city;
    }

    const { count, rows } = await Community.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        campuses: rows,
        total: count,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取省份列表
 */
exports.getProvinces = async (req, res, next) => {
  try {
    const provinces = await Community.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("province")), "province"],
      ],
      where: {
        province: { [Op.ne]: null },
        province: { [Op.ne]: "" },
      },
      order: [["province", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: provinces.map((p) => p.province).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 根据省份获取城市列表
 */
exports.getCitiesByProvince = async (req, res, next) => {
  try {
    const { province } = req.params;

    const cities = await Community.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("city")), "city"],
      ],
      where: {
        province,
        city: { [Op.ne]: null },
        city: { [Op.ne]: "" },
      },
      order: [["city", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: cities.map((c) => c.city).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 根据经纬度查找附近社区
 */
exports.findNearbyCommunities = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10000,
      limit = 20,
      excludeId,
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "请提供经纬度参数",
      });
    }

    // 构建查询条件
    const whereCondition = {
      latitude: { [Op.ne]: null },
      longitude: { [Op.ne]: null },
    };

    // 如果提供了excludeId，排除当前选择的社区
    if (excludeId) {
      whereCondition.id = { [Op.ne]: parseInt(excludeId) };
    }

    // 获取所有有位置信息的社区（排除当前选择的社区）
    const allCommunities = await Community.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    console.log("查找附近社区调试信息:", {
      latitude,
      longitude,
      radius,
      limit,
      excludeId: excludeId || "无",
      communitiesFound: allCommunities.length,
      allCommunities: allCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
      })),
    });

    // 简化的距离计算函数（使用Haversine公式）
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // 地球半径（米）
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // 返回距离（米）
    };

    // 计算每个社区的真实距离
    const communitiesWithDistance = allCommunities.map((community) => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(community.latitude),
        parseFloat(community.longitude)
      );

      return {
        ...community.toJSON(),
        distance: Math.round(distance),
      };
    });

    // 按距离排序
    communitiesWithDistance.sort((a, b) => a.distance - b.distance);

    // 筛选出指定半径内的社区
    const nearbyCommunities = communitiesWithDistance.filter(
      (community) => community.distance <= parseInt(radius)
    );

    console.log("距离筛选结果:", {
      totalCommunities: communitiesWithDistance.length,
      nearbyCommunities: nearbyCommunities.length,
      radius: parseInt(radius),
    });

    // 只返回指定半径内的社区，如果附近没有社区则返回空数组
    const resultCommunities = nearbyCommunities.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        campuses: resultCommunities, // 修复：使用campuses而不是communities
        center: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        radius: parseInt(radius),
        total: resultCommunities.length,
        hasNearbyCommunities: nearbyCommunities.length > 0,
        message:
          nearbyCommunities.length === 0
            ? "附近暂无社区，为您推荐其他社区"
            : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区详情
 */
exports.getCommunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const community = await Community.findByPk(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区未找到",
      });
    }

    res.status(200).json({
      success: true,
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 搜索社区
 */
exports.searchCommunities = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { limit = 20 } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "请输入搜索关键词",
      });
    }

    const communities = await Community.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { address: { [Op.like]: `%${keyword}%` } },
          { province: { [Op.like]: `%${keyword}%` } },
          { city: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        campuses: communities, // 保持一致的响应格式
        keyword: keyword,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取社区管理员企业微信二维码
 */
exports.getCommunityAdminQR = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "社区ID不能为空",
      });
    }

    // 查找社区信息
    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "社区不存在",
      });
    }

    // 返回社区管理员二维码信息
    res.json({
      success: true,
      data: {
        communityId: community.id,
        communityName: community.name,
        qrCodeUrl: community.adminQRCode || null,
        adminName: community.adminName || null,
        adminPhone: community.adminPhone || null,
      },
    });
  } catch (error) {
    console.error("获取社区管理员二维码失败:", error);
    next(error);
  }
};
