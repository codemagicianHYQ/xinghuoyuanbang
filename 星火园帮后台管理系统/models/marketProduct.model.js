// models/marketProduct.model.js
const crypto = require("crypto");

// 生成随机哈希ID的工具函数
const generateHashId = () => {
  const randomBytes = crypto.randomBytes(16);
  return randomBytes.toString("base64").replace(/[+/=]/g, "").substring(0, 16);
};

module.exports = (sequelize, Sequelize) => {
  const MarketProduct = sequelize.define(
    "marketProduct",
    {
      id: {
        type: Sequelize.STRING(16),
        primaryKey: true,
        defaultValue: () => generateHashId(),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "商品标题",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "商品描述",
      },
      category: {
        type: Sequelize.ENUM(
          "books",
          "electronics",
          "clothes",
          "beauty",
          "sports",
          "home",
          "food",
          "stationery",
          "others"
        ),
        allowNull: false,
        comment: "商品分类",
      },
      condition: {
        type: Sequelize.ENUM("new", "excellent", "good", "used"),
        allowNull: false,
        comment: "商品状态",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "出售价格",
      },
      originalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "原价",
      },
      isNegotiable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否支持议价",
      },
      images: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "商品图片URL数组",
      },
      tradeMethods: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "交易方式数组",
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "交易地点",
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "邮费",
      },
      wechatId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "微信号",
      },
      contactNote: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: "联系方式备注",
      },
      sellerId: {
        type: Sequelize.STRING(16),
        allowNull: false,
        comment: "卖家ID",
        // 临时移除外键关联以避免启动错误
        // references: {
        //   model: "users",
        //   key: "id",
        // },
      },
      status: {
        type: Sequelize.ENUM(
          "active",
          "sold",
          "cancelled",
          "draft",
          "pending",
          "completed",
          "refunded"
        ),
        defaultValue: "active",
        comment: "商品状态",
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "浏览次数",
      },
      favoriteCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: "收藏次数",
      },
      buyerId: {
        type: Sequelize.STRING(16),
        allowNull: true,
        comment: "买家ID",
      },
      soldAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "售出时间",
      },
      out_trade_no: {
        type: Sequelize.STRING(64),
        allowNull: true,
        comment: "支付订单号",
      },
      finalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "最终成交价格",
      },
      serviceFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "服务费",
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "优惠金额",
      },
      sellerIncome: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "卖家实际收入",
      },
      isNegotiated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "是否小刀购买",
      },
    },
    {
      tableName: "market_products",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  // 添加生成哈希ID的静态方法
  MarketProduct.generateHashId = generateHashId;

  return MarketProduct;
};
