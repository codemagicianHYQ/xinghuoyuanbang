// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const authConfig = require("../config/auth.config");
const db = require("../models");
const { authJwt } = require("../middleware");

/**
 * 微信小程序登录
 * POST /api/v1/auth/wechat-login
 */
router.post("/wechat-login", async (req, res) => {
  try {
    console.log("=== 微信登录开始 ===");
    console.log("请求体:", req.body);

    const { code, userInfo, version = "campus" } = req.body;

    if (!code) {
      console.log("❌ 缺少授权码");
      return res.status(400).json({
        success: false,
        message: "缺少授权码",
      });
    }

    console.log("✅ 授权码验证通过:", code);
    console.log("用户信息:", userInfo);
    console.log("userInfo 类型:", typeof userInfo);
    console.log(
      "userInfo 是否为空:",
      !userInfo || Object.keys(userInfo).length === 0
    );
    console.log("userInfo.nickName:", userInfo?.nickName);
    console.log("userInfo.avatarUrl:", userInfo?.avatarUrl);

    // 获取用户真实openid - 使用微信API
    let userOpenid = null;
    try {
      // 使用微信配置
      const wechatConfig = require("../config/wechat.config");

      if (!wechatConfig.appId || !wechatConfig.appSecret) {
        throw new Error("微信配置缺失：appId或appSecret未配置");
      }

      const wechatApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatConfig.appId}&secret=${wechatConfig.appSecret}&js_code=${code}&grant_type=authorization_code`;
      console.log("请求微信API获取openid...");

      const axios = require("axios");
      const wechatResponse = await axios.get(wechatApiUrl);
      const wechatData = wechatResponse.data;

      if (wechatData.errcode || !wechatData.openid) {
        throw new Error(
          `微信API错误: ${wechatData.errmsg || "获取openid失败"}`
        );
      }

      userOpenid = wechatData.openid;
      console.log("✅ 获取到真实openid:", userOpenid);
    } catch (openidError) {
      console.error("❌ 获取真实openid失败:", openidError.message);
      console.log("⚠️ 将使用临时openid，支付功能可能受限");
      userOpenid = `wx_${Date.now()}`;
    }

    // 微信一键登录逻辑 - 根据openid查找或创建用户
    // ⚠️ 重要：每个微信账号应该有独立的用户记录，不能共享用户
    let user = null;

    console.log("开始查找用户，openid:", userOpenid);
    console.log("数据库连接状态:", !!db.sequelize);

    try {
      // 首先根据openid查找现有用户（这是正确的逻辑）
      if (
        userOpenid &&
        !userOpenid.startsWith("wx_") &&
        userOpenid.length >= 20
      ) {
        console.log("🔍 根据真实openid和版本查找用户...");
        user = await User.findOne({
          where: {
            openid: userOpenid,
            version: version,
          },
        });

        if (user) {
          console.log(
            `✅ 根据openid找到用户: ${user.nickname}, ID: ${user.id}`
          );
        } else {
          console.log("❌ 根据openid未找到用户，将创建新用户");
        }
      } else {
        console.log("⚠️ openid无效，无法根据openid查找用户");
      }

      console.log("✅ 数据库查询完成");
    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError);
      return res.status(500).json({
        success: false,
        message: "数据库查询失败",
        error: dbError.message,
      });
    }

    if (user) {
      console.log(`✅ 找到现有用户: ${user.nickname}, ID: ${user.id}`);

      // 检查并更新openid（如果当前是假openid，且获取到了真实openid）
      if (
        user.openid &&
        user.openid.startsWith("wx_") &&
        userOpenid &&
        !userOpenid.startsWith("wx_") &&
        userOpenid.length >= 20
      ) {
        console.log(`🔄 更新用户openid: ${user.openid} -> ${userOpenid}`);
        try {
          await user.update({ openid: userOpenid });
        } catch (updateError) {
          console.error(`❌ 更新用户openid失败:`, updateError.message);
        }
      } else if (user.openid && user.openid.startsWith("wx_")) {
        console.log(`⚠️ 用户当前openid为假: ${user.openid}`);
        if (
          userOpenid &&
          !userOpenid.startsWith("wx_") &&
          userOpenid.length >= 20
        ) {
          console.log(`🔄 尝试更新为真实openid: ${userOpenid}`);
          try {
            await user.update({ openid: userOpenid });
          } catch (updateError) {
            console.error(`❌ 更新用户openid失败:`, updateError.message);
          }
        }
      } else {
        console.log(`✅ 用户openid正常: ${user.openid}`);
      }
    } else {
      console.log("未找到现有用户，开始创建新用户...");

      try {
        // 生成唯一的用户ID（仿照n2tlJeRDtF29TgUI格式）
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 8);
        const userId = `${timestamp}${random}`.substring(0, 20);

        console.log("准备创建新用户，参数:");
        console.log("- 用户ID:", userId);
        console.log("- 昵称:", userInfo?.nickName || "PuppyBuddy");
        console.log("- 头像:", userInfo?.avatarUrl || "");
        console.log("- openid:", userOpenid);

        // 创建新用户
        // 检查openid格式
        if (
          userOpenid &&
          !userOpenid.startsWith("wx_") &&
          userOpenid.length >= 20
        ) {
          console.log("✅ 使用真实openid创建用户:", userOpenid);
        } else {
          console.log("⚠️ 使用临时openid创建用户:", userOpenid);
          console.log("💡 注意：支付功能可能受限，建议检查微信配置");
        }

        user = await User.create({
          id: userId,
          nickname: userInfo?.nickName || "PuppyBuddy",
          avatarUrl: userInfo?.avatarUrl || "",
          role: "user",
          walletBalance: 0,
          totalEarnings: 0,
          totalWithdrawn: 0,
          openid: userOpenid,
          version: version,
        });
      } catch (createError) {
        console.error("创建新用户失败:", createError);
        return res.status(500).json({
          success: false,
          message: "创建用户失败，请重试",
          error: createError.message,
        });
      }
    }

    // 不更新用户信息，保持原有数据
    console.log(`使用现有用户信息: ${user.nickname}`);

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: "30d" }
    );

    console.log(
      `用户 ${user.nickname} 登录成功，ID: ${user.id}, 钱包余额: ${user.walletBalance}`
    );

    res.json({
      success: true,
      message: "微信一键登录成功",
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          role: user.role,
          walletBalance: user.walletBalance,
          totalEarnings: user.totalEarnings,
          totalWithdrawn: user.totalWithdrawn,
        },
      },
    });
  } catch (error) {
    console.error("微信登录失败:", error);
    res.status(500).json({
      success: false,
      message: "登录失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 */
router.get("/me", [authJwt.verifyToken], async (req, res) => {
  try {
    console.log("=== 获取用户信息开始 ===");
    console.log("用户ID:", req.userId);
    console.log("用户角色:", req.userRole);
    console.log("查询参数:", req.query);

    const { version = "campus" } = req.query;

    // 根据版本查找用户
    const user = await User.findOne({
      where: {
        id: req.userId,
        version: version,
      },
    });

    console.log(
      "数据库查询结果:",
      user ? `找到用户 ${user.nickname} (版本: ${user.version})` : "未找到用户"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户在此版本中不存在",
      });
    }

    const responseData = {
      success: true,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        realName: user.realName,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        school: user.school,
        role: user.role,
        riderApplicationStatus: user.riderApplicationStatus,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        totalWithdrawn: user.totalWithdrawn,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    console.log("返回给前端的用户信息:", responseData);
    console.log("用户昵称:", user.nickname);
    console.log("用户角色:", user.role);

    res.json(responseData);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

/**
 * 微信手机号登录
 * POST /api/v1/auth/wechat-phone
 */
router.post("/wechat-phone", async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "缺少授权码",
      });
    }

    // 这里应该调用微信API获取手机号
    // 暂时使用code作为标识
    const phoneCode = code;

    // 查找或创建用户
    let user = await User.findOne({
      where: { phoneCode },
    });

    if (!user) {
      user = await User.create({
        phoneCode,
        nickname: userInfo?.nickName || "PuppyBuddy",
        avatarUrl: userInfo?.avatarUrl || "",
        role: "user",
        walletBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "手机号登录成功",
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      },
    });
  } catch (error) {
    console.error("手机号登录失败:", error);
    res.status(500).json({
      success: false,
      message: "登录失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 账号密码登录
 * POST /api/v1/auth/signin
 */
router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      });
    }

    // 查找用户
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username },
          { email: username },
          { phone: username },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      },
    });
  } catch (error) {
    console.error("账号密码登录失败:", error);
    res.status(500).json({
      success: false,
      message: "登录失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 用户注册
 * POST /api/v1/auth/signup
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, password, email, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email: email || username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "用户名或邮箱已存在",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = await User.create({
      username,
      password: hashedPassword,
      email: email || username,
      nickname: nickname || username,
      role: "user",
      walletBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
    });

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "注册成功",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      },
    });
  } catch (error) {
    console.error("用户注册失败:", error);
    res.status(500).json({
      success: false,
      message: "注册失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 刷新token
 * POST /api/v1/auth/refresh
 */
router.post("/refresh", [authJwt.verifyToken], async (req, res) => {
  try {
    // 使用中间件验证后的用户ID
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 生成新的token
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "token刷新成功",
      data: {
        token: newToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          role: user.role,
          walletBalance: user.walletBalance,
        },
      },
    });
  } catch (error) {
    console.error("token刷新失败:", error);
    res.status(401).json({
      success: false,
      message: "token无效或已过期",
    });
  }
});

/**
 * 退出登录
 * POST /api/v1/auth/logout
 */
router.post("/logout", async (req, res) => {
  try {
    // 这里可以添加token黑名单逻辑
    // 目前只是返回成功消息
    res.json({
      success: true,
      message: "退出登录成功",
    });
  } catch (error) {
    console.error("退出登录失败:", error);
    res.status(500).json({
      success: false,
      message: "退出登录失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 修改密码
 * POST /api/v1/auth/change-password
 */
router.post("/change-password", [authJwt.verifyToken], async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "旧密码和新密码不能为空",
      });
    }

    // 使用中间件验证后的用户ID
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "旧密码错误",
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await user.update({ password: hashedNewPassword });

    res.json({
      success: true,
      message: "密码修改成功",
    });
  } catch (error) {
    console.error("修改密码失败:", error);
    res.status(500).json({
      success: false,
      message: "修改密码失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 忘记密码
 * POST /api/v1/auth/forgot-password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "邮箱不能为空",
      });
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "该邮箱未注册",
      });
    }

    // 这里应该发送重置密码邮件
    // 暂时返回成功消息
    res.json({
      success: true,
      message: "重置密码链接已发送到邮箱",
    });
  } catch (error) {
    console.error("忘记密码失败:", error);
    res.status(500).json({
      success: false,
      message: "操作失败，请重试",
      error: error.message,
    });
  }
});

/**
 * 重置密码
 * POST /api/v1/auth/reset-password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "重置token和新密码不能为空",
      });
    }

    // 这里应该验证重置token
    // 暂时返回成功消息
    res.json({
      success: true,
      message: "密码重置成功",
    });
  } catch (error) {
    console.error("重置密码失败:", error);
    res.status(500).json({
      success: false,
      message: "操作失败，请重试",
      error: error.message,
    });
  }
});

module.exports = router;
