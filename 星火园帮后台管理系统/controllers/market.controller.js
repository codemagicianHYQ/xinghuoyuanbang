const { Op } = require("sequelize");
const { User } = require("../models");
const shardingHelper = require("../services/shardingHelper");
const WechatPayService = require("../services/wechatPayService");
const db = require("../models");

// 获取商品列表（按社区分表查询）
exports.getProductsByCommunity = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      communityId,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "DESC",
      search,
      status = "active",
      sellerId,
    } = req.query;

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 构建查询条件
    const where = {};

    // 如果没有传递sellerId，则使用当前用户ID（用于获取当前用户的商品）
    if (sellerId) {
      where.sellerId = sellerId;
    } else if (req.userId) {
      // 如果用户已登录但没有传递sellerId，则查询当前用户的商品
      where.sellerId = req.userId;
    }

    // 状态筛选
    if (status && status !== "all") {
      where.status = status;
    }

    // 分类筛选
    if (category && category !== "all") {
      where.category = category;
    }

    // 商品状态筛选
    if (condition) {
      where.condition = condition;
    }

    // 价格筛选
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum)) {
          where.price[Op.gte] = minPriceNum;
        }
      }
      if (maxPrice) {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum)) {
          where.price[Op.lte] = maxPriceNum;
        }
      }
    }

    // 搜索
    if (search && typeof search === "string") {
      const cleanSearch = search.replace(/[%_\\]/g, "");
      if (cleanSearch.length > 0) {
        where[Op.or] = [
          { title: { [Op.like]: `%${cleanSearch}%` } },
          { description: { [Op.like]: `%${cleanSearch}%` } },
        ];
      }
    }

    // 卖家筛选
    if (sellerId) {
      where.sellerId = sellerId;
    }

    // 验证并清理sortBy参数
    const allowedSortFields = ["createdAt", "price", "viewCount", "title"];
    const cleanSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const cleanSortOrder = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    // 查询选项
    const options = {
      where,
      order: [[cleanSortBy, cleanSortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    // 查询数据
    const { count, rows } = await shardingHelper.queryFromShardedTable(
      tableName,
      options
    );

    // 获取卖家信息
    const sellerIds = [...new Set(rows.map((p) => p.sellerId))];
    const sellers = await User.findAll({
      where: { id: sellerIds },
      attributes: ["id", "nickname", "avatarUrl", "school"],
    });

    const sellerMap = {};
    sellers.forEach((seller) => {
      sellerMap[seller.id] = seller;
    });

    // 添加卖家信息到商品数据
    const productsWithSellers = rows.map((product) => ({
      ...product,
      seller: sellerMap[product.sellerId] || null,
    }));

    res.json({
      success: true,
      data: {
        list: productsWithSellers,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    next(error);
  }
};

// 获取商品列表（旧接口，保留兼容性）
exports.getProducts = async (req, res, next) => {
  try {
    const { communityId } = req.query;

    // 二手市集必须提供communityId，使用分表查询
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    return exports.getProductsByCommunity(req, res, next);
  } catch (error) {
    console.error("获取商品列表失败:", error);
    next(error);
  }
};

// 获取商品详情（从分表查询）
exports.getProductByIdFromSharding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId } = req.query;

    console.log("获取商品详情请求:", { id, communityId });

    // 验证社区ID
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);
    console.log("分表名称:", tableName);

    // 查询商品详情
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);
    console.log("查询到的商品:", product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    // 获取卖家信息
    const seller = await User.findByPk(product.sellerId, {
      attributes: ["id", "nickname", "avatarUrl", "school"],
    });

    // 获取卖家统计数据
    const sellerStats = await shardingHelper.queryFromShardedTable(tableName, {
      where: { sellerId: product.sellerId },
    });

    // 计算在售和已售数量
    const goodsCount = sellerStats.rows.filter(
      (item) => item.status === "active"
    ).length;
    const soldCount = sellerStats.rows.filter(
      (item) => item.status === "sold" || item.status === "completed"
    ).length;

    res.json({
      success: true,
      data: {
        ...product,
        seller: seller,
        sellerStats: {
          goodsCount: goodsCount,
          soldCount: soldCount,
        },
      },
    });
  } catch (error) {
    console.error("获取商品详情失败:", error);
    next(error);
  }
};

// 获取商品详情（兼容接口）
exports.getProductById = async (req, res, next) => {
  try {
    const { communityId } = req.query;

    // 如果指定了communityId，使用分表查询
    if (communityId) {
      return exports.getProductByIdFromSharding(req, res, next);
    }

    // 如果没有communityId，返回错误
    return res.status(400).json({
      success: false,
      message: "缺少必填参数：communityId（社区ID）",
    });
  } catch (error) {
    console.error("获取商品详情失败:", error);
    next(error);
  }
};

// 创建商品
exports.createProduct = async (req, res, next) => {
  try {
    console.log("创建商品请求数据:", req.body);

    const {
      title,
      description,
      category,
      condition,
      price,
      originalPrice,
      isNegotiable,
      images,
      tradeMethods,
      location,
      communityId,
    } = req.body;

    // 验证必填字段
    if (!title || !description || !category || !price || !communityId) {
      console.log("缺少必填字段:", {
        title,
        description,
        category,
        price,
        communityId,
      });
      return res.status(400).json({
        success: false,
        message: "缺少必填字段",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);
    console.log("分表名称:", tableName);

    // 创建商品数据
    const productData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      title: title.trim(),
      description: description.trim(),
      category,
      condition: condition || "good",
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      isNegotiable: isNegotiable || false,
      images: Array.isArray(images) ? images : images ? [images] : [],
      tradeMethods: Array.isArray(tradeMethods) ? tradeMethods : ["面交"],
      location: location ? location.trim() : null,
      sellerId: req.userId,
      status: "active",
      viewCount: 0,
      communityId: parseInt(communityId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 插入到分表
    console.log("准备插入商品数据:", productData);
    const product = await shardingHelper.insertIntoShardedTable(
      tableName,
      productData
    );
    console.log("商品插入成功:", product);

    res.status(201).json({
      success: true,
      message: "商品创建成功",
      data: product,
    });
  } catch (error) {
    console.error("创建商品失败:", error);
    next(error);
  }
};

// 更新商品
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询原记录
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    // 检查权限
    if (product.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限修改此商品",
      });
    }

    // 更新数据
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };
    delete updateData.communityId; // 不允许修改社区ID

    await shardingHelper.updateInShardedTable(tableName, id, updateData);

    res.json({
      success: true,
      message: "商品更新成功",
    });
  } catch (error) {
    console.error("更新商品失败:", error);
    next(error);
  }
};

// 删除商品
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询原记录
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    // 检查权限
    if (product.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限删除此商品",
      });
    }

    // 物理删除：直接从数据库删除记录
    await shardingHelper.deleteFromShardedTable(tableName, id);

    console.log(`✅ 已物理删除二手商品: ${id}`);

    res.json({
      success: true,
      message: "商品删除成功",
    });
  } catch (error) {
    console.error("删除商品失败:", error);
    next(error);
  }
};

// 获取我的商品
exports.getMyProducts = async (req, res, next) => {
  try {
    const { communityId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询我的商品
    const where = { sellerId: req.userId };
    const options = {
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    const { count, rows } = await shardingHelper.queryFromShardedTable(
      tableName,
      options
    );

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取我的商品失败:", error);
    next(error);
  }
};

// 计算平台费用和卖家收入（平台抽成3%）
const calculateMarketFees = (price) => {
  const totalPrice = parseFloat(price) || 0;
  const platformFee = parseFloat((totalPrice * 0.03).toFixed(2)); // 平台抽成3%
  const sellerIncome = parseFloat((totalPrice - platformFee).toFixed(2)); // 卖家收入97%
  return {
    platformFee,
    sellerIncome,
    totalPrice,
  };
};

// 购买商品
exports.purchaseProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId, out_trade_no, isNegotiated, negotiatedPrice } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询商品
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    if (product.sellerId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "不能购买自己的商品",
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "商品已下架",
      });
    }

    // 确定最终成交价格
    const finalPrice = isNegotiated && negotiatedPrice 
      ? parseFloat(negotiatedPrice) 
      : parseFloat(product.price);

    // 计算平台费用和卖家收入（平台抽成3%）
    const fees = calculateMarketFees(finalPrice);

    // 更新商品状态，保存支付信息和费用信息
    const updateData = {
      status: "sold",
      buyerId: req.userId,
      soldAt: new Date(),
      updatedAt: new Date(),
    };

    // 保存支付订单号
    if (out_trade_no) {
      updateData.out_trade_no = out_trade_no;
    }

    // 保存价格和费用信息
    updateData.finalPrice = finalPrice;
    updateData.serviceFee = fees.platformFee;
    updateData.sellerIncome = fees.sellerIncome;
    
    // 保存小刀信息
    if (isNegotiated) {
      updateData.isNegotiated = true;
      if (negotiatedPrice) {
        const discountAmount = parseFloat(product.price) - finalPrice;
        updateData.discountAmount = discountAmount > 0 ? discountAmount : 0;
      }
    }

    await shardingHelper.updateInShardedTable(tableName, id, updateData);

    console.log(`[purchaseProduct] 商品 ${id} 购买成功:`, {
      finalPrice,
      platformFee: fees.platformFee,
      sellerIncome: fees.sellerIncome,
      out_trade_no,
    });

    res.json({
      success: true,
      message: "购买成功",
      data: {
        productId: id,
        buyerId: req.userId,
        sellerId: product.sellerId,
        finalPrice,
        platformFee: fees.platformFee,
        sellerIncome: fees.sellerIncome,
        paymentDetails: {
          finalPrice,
          discountAmount: updateData.discountAmount || 0,
        },
      },
    });
  } catch (error) {
    console.error("购买商品失败:", error);
    next(error);
  }
};

// 打款给卖家
const transferToSeller = async (product, sellerIncome) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log(`[transferToSeller] 开始处理商品 ${product.id} 的资金分配`);

    // 获取卖家信息
    const seller = await User.findByPk(product.sellerId, { transaction });
    if (!seller) {
      throw new Error("卖家不存在");
    }

    const sellerIncomeAmount = parseFloat(sellerIncome || 0);

    console.log(
      `[transferToSeller] 商品 ${product.id} 资金分配: 卖家收入=${sellerIncomeAmount}元`
    );

    // 尝试真正的微信支付转账
    let wechatTransferResult = null;
    try {
      // 生成商户订单号
      const partnerTradeNo = `MARKET_${product.id}_${Date.now()}`;

      // 调用微信企业付款到零钱
      wechatTransferResult = await WechatPayService.transferToBalance({
        openid: seller.openid,
        amount: Math.round(sellerIncomeAmount * 100), // 转换为分
        desc: `二手商品交易收入 - ${product.title}`,
        partnerTradeNo: partnerTradeNo,
      });

      console.log(
        `[transferToSeller] 微信支付转账成功: ${JSON.stringify(
          wechatTransferResult
        )}`
      );
    } catch (wechatError) {
      console.error(
        `[transferToSeller] 微信支付转账失败: ${wechatError.message}`
      );

      // 如果微信支付失败，回退到余额增加模式
      console.log("[transferToSeller] 回退到余额增加模式");

      const sellerBalanceBefore = parseFloat(seller.walletBalance || 0);
      const sellerBalanceAfter = sellerBalanceBefore + sellerIncomeAmount;

      await seller.update(
        {
          walletBalance: sellerBalanceAfter,
          totalEarnings: parseFloat(seller.totalEarnings || 0) + sellerIncomeAmount,
        },
        { transaction }
      );

      wechatTransferResult = {
        success: false,
        fallback: true,
        message: "微信支付失败，已增加到余额",
      };
    }

    await transaction.commit();

    console.log(
      `[transferToSeller] 商品 ${product.id} 资金分配完成: 卖家收入${sellerIncomeAmount}元`
    );

    return {
      success: true,
      wechatTransfer: wechatTransferResult,
      sellerIncome: sellerIncomeAmount,
    };
  } catch (error) {
    await transaction.rollback();
    console.error(`[transferToSeller] 商品 ${product.id} 打款失败:`, error);
    throw error;
  }
};

// 确认收货
exports.confirmReceived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询商品
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    if (product.buyerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限确认收货",
      });
    }

    if (product.status !== "sold") {
      return res.status(400).json({
        success: false,
        message: "商品状态不正确，无法确认收货",
      });
    }

    // 更新状态为已完成
    await shardingHelper.updateInShardedTable(tableName, id, {
      status: "completed",
      updatedAt: new Date(),
    });

    // 确认收货后，打款给卖家
    try {
      const sellerIncome = parseFloat(product.sellerIncome || product.finalPrice || product.price || 0);
      if (sellerIncome > 0) {
        await transferToSeller(product, sellerIncome);
        console.log(`[confirmReceived] 商品 ${id} 确认收货成功，已打款给卖家`);
      } else {
        console.warn(`[confirmReceived] 商品 ${id} 卖家收入为0，跳过打款`);
      }
    } catch (transferError) {
      console.error(`[confirmReceived] 商品 ${id} 打款给卖家失败:`, transferError);
      // 打款失败不影响确认收货，但记录错误
    }

    res.json({
      success: true,
      message: "确认收货成功，已打款给卖家",
    });
  } catch (error) {
    console.error("确认收货失败:", error);
    next(error);
  }
};

// 取消订单
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询商品
    const product = await shardingHelper.findByIdInShardedTable(tableName, id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    if (product.buyerId !== req.userId && product.sellerId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "无权限取消订单",
      });
    }

    // 更新状态为已取消
    await shardingHelper.updateInShardedTable(tableName, id, {
      status: "cancelled",
      buyerId: null,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "取消订单成功",
    });
  } catch (error) {
    console.error("取消订单失败:", error);
    next(error);
  }
};

// 获取已购买的商品
exports.getPurchasedProducts = async (req, res, next) => {
  try {
    const { communityId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询已购买的商品
    const where = { buyerId: req.userId };
    const options = {
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    const { count, rows } = await shardingHelper.queryFromShardedTable(
      tableName,
      options
    );

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取已购买商品失败:", error);
    next(error);
  }
};

// 获取已售出的商品
exports.getSoldProducts = async (req, res, next) => {
  try {
    const { communityId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "缺少必填参数：communityId（社区ID）",
      });
    }

    // 获取分表名称
    const tableName = shardingHelper.getMarketTableName(communityId);

    // 查询已售出的商品
    const where = { sellerId: req.userId, status: ["sold", "completed"] };
    const options = {
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    const { count, rows } = await shardingHelper.queryFromShardedTable(
      tableName,
      options
    );

    // 获取买家信息
    const productsWithBuyer = await Promise.all(
      rows.map(async (product) => {
        if (product.buyerId) {
          try {
            const buyer = await User.findByPk(product.buyerId, {
              attributes: ["id", "nickname", "avatarUrl"],
            });
            return {
              ...product,
              buyer: buyer || null,
            };
          } catch (error) {
            console.error(`获取买家信息失败 (${product.buyerId}):`, error);
            return {
              ...product,
              buyer: null,
            };
          }
        }
        return {
          ...product,
          buyer: null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        list: productsWithBuyer,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取已售出商品失败:", error);
    next(error);
  }
};

// 获取用户信息
exports.getUserById = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { communityId } = req.query;

    console.log(
      `[getUserById] 查询用户信息: userId=${userId}, communityId=${communityId}`
    );

    const user = await User.findByPk(userId, {
      attributes: ["id", "nickname", "avatarUrl", "school", "createdAt"],
    });

    console.log(
      `[getUserById] 用户查询结果:`,
      user ? "找到用户" : "用户不存在"
    );

    if (!user) {
      console.log(`[getUserById] 用户不存在: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 获取用户统计信息（如果提供了communityId）
    let userStats = {
      goodsCount: 0,
      soldCount: 0,
    };

    if (communityId) {
      try {
        const tableName = shardingHelper.getMarketTableName(communityId);

        // 查询在售商品数量
        const activeGoods = await shardingHelper.queryFromShardedTable(
          tableName,
          {
            where: { sellerId: userId, status: "active" },
            limit: 1,
          }
        );
        userStats.goodsCount = activeGoods.count;

        // 查询已售商品数量
        const soldGoods = await shardingHelper.queryFromShardedTable(
          tableName,
          {
            where: { sellerId: userId, status: ["sold", "completed"] },
            limit: 1,
          }
        );
        userStats.soldCount = soldGoods.count;
      } catch (statsError) {
        console.warn("获取用户统计信息失败:", statsError.message);
        // 统计信息获取失败不影响用户基本信息返回
      }
    }

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        ...userStats,
      },
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    next(error);
  }
};

// 获取关注列表
exports.getFollowingList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // 这里应该查询关注关系表，但为了简化，我们返回空列表
    res.json({
      success: true,
      data: {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("获取关注列表失败:", error);
    next(error);
  }
};
