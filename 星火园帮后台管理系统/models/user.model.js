// models/user.model.js
const crypto = require("crypto");

// 生成随机哈希ID的工具函数
const generateHashId = () => {
  // 生成16字节的随机数据
  const randomBytes = crypto.randomBytes(16);
  // 转换为base64并移除特殊字符，只保留字母和数字
  return randomBytes
    .toString("base64")
    .replace(/[+/=]/g, "") // 移除 + / = 字符
    .substring(0, 16); // 截取前16位，确保长度一致
};

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.STRING(16), // 改为STRING类型，长度为16
      primaryKey: true,
      defaultValue: () => generateHashId(), // 使用自定义函数生成默认值
      allowNull: false,
      unique: true,
    },
    openid: {
      type: Sequelize.STRING,
      allowNull: false, // 对于微信小程序，这应该是核心凭据
      // 暂时移除 unique: true 以避免索引过多的问题
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: true, // 允许后端统一设置为 "PuppyBuddy" 或用户微信昵称
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true, // 普通用户可以为空，管理员必须有
      unique: false, // 可根据需要设置为 true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true, // 只有管理员需要
    },
    avatarUrl: {
      type: Sequelize.STRING,
      allowNull: true, // 初始可以为 null，让前端显示应用内默认头像
      get() {
        const val = this.getDataValue("avatarUrl");
        if (!val || typeof val !== "string") return val;
        try {
          const { encodeFileUrl } = require("../config/domain");
          return encodeFileUrl(val); // 编码以兼容手机端（中文路径、空格）
        } catch (e) {
          return val;
        }
      },
    },
    // 移除 email 和 password 字段，因为应用只使用微信登录
    role: {
      type: Sequelize.ENUM("user", "rider", "admin", "community_admin"), // 扩展角色，加入 'rider' 和 'community_admin'
      defaultValue: "user",
      allowNull: false,
    },
    isVerified: {
      // 可以指学生认证状态，或平台其他认证状态
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    gender: {
      type: Sequelize.INTEGER, // 0-未知, 1-男, 2-女
      allowNull: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    school: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // 移除 studentIdNumber 字段，因为已从数据库中删除
    // --- 新增接单员相关字段 ---
    riderApplicationStatus: {
      // 接单员申请状态
      type: Sequelize.ENUM("none", "pending", "approved", "rejected"),
      defaultValue: "none", // 'none' 表示未申请或初始状态
      allowNull: false,
    },
    riderRejectionReason: {
      // 审核拒绝原因 (如果申请被拒)
      type: Sequelize.STRING,
      allowNull: true,
    },
    sessionKey: {
      type: Sequelize.STRING(128),
      allowNull: true,
      comment: "微信 session_key，用于手机号解密",
    },
    idCardImageUrl: {
      // 身份证正面图片URL
      type: Sequelize.STRING,
      allowNull: true,
    },
    studentIdCardImageUrl: {
      // 学生证图片URL
      type: Sequelize.STRING,
      allowNull: true,
    },
    walletBalance: {
      // 钱包余额（元）
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    totalEarnings: {
      // 总收入（元）
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    totalWithdrawn: {
      // 总提现（元）
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    bankCardNumber: {
      // 银行卡号
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "银行卡号",
    },
    bankName: {
      // 银行名称
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "银行名称",
    },
    realName: {
      // 真实姓名（用于提现）
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "真实姓名",
    },
    version: {
      // 版本：community(社区版) 或 campus(校园版)
      type: Sequelize.ENUM("community", "campus"),
      allowNull: false,
      defaultValue: "campus",
      comment: "版本：community(社区版) 或 campus(校园版)",
    },
    communityAdminId: {
      // 用户作为社区管理员管理的社区ID
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "用户作为社区管理员管理的社区ID",
    },
  });

  // 移除password相关的hooks和方法，因为只使用微信登录

  // 添加生成哈希ID的静态方法
  User.generateHashId = generateHashId;

  return User;
};
