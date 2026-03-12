// controllers/auth.controller.js
const db = require("../models");
const authConfig = require("../config/auth.config");
const logger = require("../config/logger");
const User = db.User;
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");

// 自动续期工具函数
function shouldRenewToken(decoded) {
  // decoded.exp是秒级时间戳
  const now = Math.floor(Date.now() / 1000);
  // 距离过期不足24小时则续期
  return decoded.exp && decoded.exp - now < 24 * 3600;
}

// 修改verifyToken中间件，支持多端并发token且仅token本身过期才失效
const verifyToken = (req, res, next) => {
  let token =
    req.headers["token"] ||
    req.headers["authorization"] ||
    req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      // 401时绝不返回x-renewed-token
      return res.status(401).send({ message: "Unauthorized! Invalid Token." });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    // 去除自动续期逻辑，不再返回x-renewed-token
    next();
  });
};

// 微信小程序登录或注册
exports.wechatLoginOrSignup = async (req, res, next) => {
  const { code, userInfo, version = "campus" } = req.body; // userInfo from uni.getUserProfile (avatarUrl, nickName, gender, etc.)

  logger.info("WeChat Login Attempt", {
    hasCode: !!code,
    hasUserInfo: !!userInfo,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
  });

  if (!code) {
    logger.warn("WeChat Login Failed - Missing Code", {
      ip: req.ip || req.connection.remoteAddress,
    });
    return res.status(400).send({ message: "WeChat code is required." });
  }

  try {
    if (!process.env.WECHAT_APPID || !process.env.WECHAT_APP_SECRET) {
      console.error("WECHAT_APPID or WECHAT_APP_SECRET not configured in .env");
      return res.status(500).send({
        message:
          "WeChat app configuration error. Please contact administrator.",
      });
    }

    const wechatApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APPID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    console.log("WeChat API URL:", wechatApiUrl);
    const wechatResponse = await axios.get(wechatApiUrl);
    const wechatData = wechatResponse.data;

    if (wechatData.errcode || !wechatData.openid) {
      console.error("WeChat jscode2session error:", wechatData);
      return res.status(400).send({
        message: wechatData.errmsg || "Failed to get session from WeChat.",
      });
    }

    const openid = wechatData.openid;
    // 根据版本和openid查找用户
    let user = await User.findOne({
      where: {
        openid: openid,
        version: version,
      },
    });

    const defaultNickname = "PuppyBuddy";

    if (!user) {
      // 用户不存在，创建新用户
      let newUserDetails = {
        id: User.generateHashId(), // 显式生成哈希id
        openid: openid,
        nickname:
          userInfo && userInfo.nickName && userInfo.nickName !== "PuppyBuddy"
            ? userInfo.nickName
            : defaultNickname,
        avatarUrl: null, // 初始登录强制使用应用内默认头像
        role: "user", // <<< 新用户默认为 'user'
        isVerified: false,
        riderApplicationStatus: "none", // <<< 初始化接单员申请状态
        sessionKey: wechatData.session_key, // 新增：保存 session_key
        version: version, // 设置版本
      };
      if (userInfo && userInfo.gender !== undefined) {
        // 微信 gender: 0未知, 1男, 2女
        newUserDetails.gender = userInfo.gender;
      }
      user = await User.create(newUserDetails);
      console.log(
        `New WeChat user created: ${user.id}, Nickname: ${user.nickname}, Role: ${user.role}, RiderStatus: ${user.riderApplicationStatus}`
      );
      // 新建用户时返回201
      const token = jwt.sign(
        { id: user.id, role: user.role, openid: user.openid },
        authConfig.secret,
        { expiresIn: authConfig.jwtExpiration }
      );
      const userProfile = {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
        gender: user.gender,
        riderApplicationStatus: user.riderApplicationStatus,
        realName: user.realName,
      };
      const plainUserProfile = JSON.parse(JSON.stringify(userProfile));
      delete plainUserProfile.sessionKey;
      return res.status(201).send({
        code: 0,
        message: "WeChat注册成功!",
        accessToken: token,
        user: plainUserProfile,
      });
    } else {
      // 用户已存在，按需更新信息
      let infoChanged = false;
      let newNickname = user.nickname;

      // 更新昵称逻辑
      if (!newNickname || newNickname === "微信用户") {
        // 如果当前昵称无效或为微信通用名
        newNickname =
          userInfo && userInfo.nickName && userInfo.nickName !== "微信用户"
            ? userInfo.nickName
            : defaultNickname;
      } else if (
        userInfo &&
        userInfo.nickName &&
        userInfo.nickName !== "微信用户" &&
        newNickname !== userInfo.nickName
      ) {
        // 如果用户在微信改了有效昵称，同步过来
        newNickname = userInfo.nickName;
      }
      // 确保最终不是 "微信用户" (除非微信本身就是这个名字且不是占位符) 或空
      if (
        !newNickname ||
        newNickname.trim() === "" ||
        newNickname === "微信用户"
      ) {
        newNickname = defaultNickname;
      }
      if (user.nickname !== newNickname) {
        user.nickname = newNickname;
        infoChanged = true;
      }

      // 保留用户已上传的头像，不强制重置为null
      // 如果用户之前上传过头像，应该保留；如果没有上传过，保持为null
      // 这样用户退出登录后再次登录时，头像信息不会丢失
      if (user.avatarUrl && user.avatarUrl.trim() !== "") {
        console.log(`保留用户已上传的头像: ${user.avatarUrl}`);
        // 不修改avatarUrl，保持用户之前上传的值
      } else {
        console.log("用户没有上传过头像，使用默认头像");
        // 如果avatarUrl为空或null，保持现状
      }

      if (
        userInfo &&
        userInfo.gender !== undefined &&
        user.gender !== userInfo.gender
      ) {
        user.gender = userInfo.gender;
        infoChanged = true;
      }

      // 确保老用户也有 riderApplicationStatus 字段，如果没有则初始化为 'none'
      if (
        user.riderApplicationStatus === null ||
        user.riderApplicationStatus === undefined
      ) {
        user.riderApplicationStatus = "none";
        infoChanged = true;
      }
      // 确保老用户的 role 字段有效 (如果之前没有 rider 角色)
      if (!["user", "rider", "admin"].includes(user.role)) {
        user.role = "user"; // 或根据其他逻辑判断
        infoChanged = true;
      }

      // 新增：每次登录都更新 session_key
      user.sessionKey = wechatData.session_key;

      if (infoChanged) {
        await user.save();
        console.log(
          `WeChat user info processed/updated: ${user.id}, Nickname: ${user.nickname}, Role: ${user.role}, RiderStatus: ${user.riderApplicationStatus}`
        );
      }
      console.log("WeChat user logged in:", user.id);
    }

    // 为用户生成 JWT（多端并发，不影响其它token）
    const token = jwt.sign(
      { id: user.id, role: user.role, openid: user.openid }, // Token 中可以包含 role
      authConfig.secret,
      { expiresIn: authConfig.jwtExpiration }
    );

    // 准备返回给前端的用户信息
    const userProfile = {
      id: user.id,
      openid: user.openid, // 通常不需要返回 openid 给客户端常规使用
      nickname: user.nickname,
      avatarUrl: user.avatarUrl, // 此时应为 null
      role: user.role, // <<< 返回用户的角色
      isVerified: user.isVerified,
      gender: user.gender,
      riderApplicationStatus: user.riderApplicationStatus, // <<< 返回接单员申请状态
      realName: user.realName, // 如果已填写，也一并返回
      // 其他希望前端知道的字段...
      // 避免返回 password, session_key 等敏感信息
    };
    // 清理一下，确保不意外返回 Sequelize 实例方法等
    const plainUserProfile = JSON.parse(JSON.stringify(userProfile));
    // 明确删除 sessionKey 字段
    delete plainUserProfile.sessionKey;

    res.status(200).send({
      code: 0,
      message: "WeChat login successful!",
      accessToken: token,
      user: plainUserProfile,
    });
  } catch (error) {
    console.error("WeChat login process error:", error);
    next(error); // 交给全局错误处理器
  }
};

// 微信手机号解密
function decryptPhone(sessionKey, encryptedData, iv) {
  const _sessionKey = Buffer.from(sessionKey, "base64");
  const _encryptedData = Buffer.from(encryptedData, "base64");
  const _iv = Buffer.from(iv, "base64");
  const decipher = crypto.createDecipheriv("aes-128-cbc", _sessionKey, _iv);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(_encryptedData, "binary", "utf8");
  decoded += decipher.final("utf8");
  return JSON.parse(decoded);
}

// 新增：绑定手机号接口
exports.wechatBindPhone = async (req, res, next) => {
  const { openid, encryptedData, iv } = req.body;
  if (!openid || !encryptedData || !iv) {
    return res.status(400).send({ message: "参数缺失" });
  }
  try {
    // 查找用户
    const user = await User.findOne({ where: { openid } });
    if (!user) return res.status(404).send({ message: "用户不存在" });
    const sessionKey = user.sessionKey;
    if (!sessionKey)
      return res.status(400).send({ message: "session_key 缺失" });
    // 解密手机号
    const phoneInfo = decryptPhone(sessionKey, encryptedData, iv);
    const phoneNumber = phoneInfo.phoneNumber;
    // 更新用户手机号
    user.phoneNumber = phoneNumber;
    await user.save();
    res.send({ code: 200, msg: "手机号绑定成功", phoneNumber });
  } catch (err) {
    next(err);
  }
};

// 后台管理系统账号密码登录（支持超级管理员和社区管理员）
exports.signin = async (req, res, next) => {
  console.log("[auth/signin] 收到登录请求", {
    email: req.body?.email ? "***" : null,
    hasUserId: !!req.body?.userId,
    timestamp: new Date().toISOString(),
  });
  const { email, userId, password } = req.body;
  if ((!email && !userId) || !password) {
    return res.status(400).json({ message: "邮箱/用户ID和密码不能为空" });
  }
  try {
    let user;
    
    // 优先使用userId登录（社区管理员）
    if (userId) {
      user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({ message: "用户不存在" });
      }
      // 检查是否是社区管理员
      if (user.role !== "community_admin") {
        return res.status(401).json({ message: "该用户不是社区管理员" });
      }
    } else if (email) {
      // 使用邮箱登录（超级管理员或社区管理员）
      const { Op } = require("sequelize");
      user = await User.findOne({
        where: {
          email,
          role: { [Op.in]: ["admin", "community_admin"] },
        },
      });
      if (!user) {
        return res.status(401).json({ message: "用户不存在或无权限" });
      }
    }
    // 密码验证：支持明文和bcrypt哈希密码（兼容旧数据）
    let passwordMatch = false;
    if (user.password === password) {
      // 明文密码匹配（兼容旧数据）
      passwordMatch = true;
      // 如果密码是明文，建议在后台手动更新为哈希密码
      console.warn(`[auth] 用户 ${user.email} 使用明文密码，建议更新为哈希密码`);
    } else {
      // 尝试bcrypt比对
      try {
        const bcrypt = require("bcryptjs");
        if (user.password && user.password.length > 30) {
          // 如果密码长度超过30，可能是bcrypt哈希（通常60字符）
          passwordMatch = await bcrypt.compare(password, user.password);
        }
      } catch (bcryptError) {
        // bcrypt不可用时，如果是生产环境，拒绝登录
        if (process.env.NODE_ENV === "production") {
          console.error("[auth] bcrypt不可用且密码不匹配，拒绝登录");
          return res.status(401).json({ message: "密码错误" });
        }
      }
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "密码错误" });
    }
    // 生成JWT（多端并发，不影响其它token）
    // 如果是社区管理员，包含communityAdminId
    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    if (user.communityAdminId) {
      tokenPayload.communityAdminId = user.communityAdminId;
    }
    
    const token = jwt.sign(tokenPayload, authConfig.secret, {
      expiresIn: authConfig.jwtExpiration,
    });
    
    // 返回用户信息（去除敏感字段）
    const userProfile = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      isVerified: user.isVerified,
      realName: user.realName,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      school: user.school,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    // 如果是社区管理员，返回社区ID
    if (user.communityAdminId) {
      userProfile.communityAdminId = user.communityAdminId;
    }
    res.status(200).json({
      accessToken: token,
      user: userProfile,
      message: "登录成功",
    });
  } catch (error) {
    console.error("[auth/signin] 登录处理异常:", error?.message || error);
    next(error);
  }
};

// 确保只导出需要被路由使用的函数
// module.exports = {
//   wechatLoginOrSignup,
//   // 如果你之前有 signup 和 signin 并决定保留它们 (例如给后台管理用), 也要在这里导出
// };

// 导出verifyToken时用新实现
module.exports.verifyToken = verifyToken;
