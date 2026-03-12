const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");
const db = require("../models");
const User = db.User;

const verifyToken = (req, res, next) => {
  // 优先读取 token 字段，兼容小程序
  let token =
    req.headers["token"] ||
    req.headers["authorization"] ||
    req.headers["x-access-token"];

  console.log(`[verifyToken] 请求头信息:`, {
    url: req.url,
    method: req.method,
    token: token ? token.substring(0, 50) + "..." : null,
    authorization: req.headers["authorization"]
      ? req.headers["authorization"].substring(0, 50) + "..."
      : null,
    "x-access-token": req.headers["x-access-token"]
      ? req.headers["x-access-token"].substring(0, 50) + "..."
      : null,
    allHeaders: Object.keys(req.headers),
  });

  if (!token) {
    console.log(`[verifyToken] 没有找到token，返回403`);
    return res.status(403).send({ message: "No token provided!" });
  }

  // 处理 Authorization: Bearer <token> 格式
  // 先清理可能存在的重复Bearer前缀
  while (token.startsWith("Bearer Bearer ")) {
    token = token.substring(7); // 移除一个"Bearer "
  }

  while (token.startsWith("BearerBearer")) {
    token = token.substring(6); // 移除一个"Bearer"
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  } else if (
    req.headers["authorization"] &&
    req.headers["authorization"].startsWith("Bearer ")
  ) {
    // 如果token字段没有Bearer前缀，但authorization字段有
    token = req.headers["authorization"].slice(7);
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      console.log(`[verifyToken] JWT验证失败:`, {
        error: err.message,
        token: token.substring(0, 50) + "...",
        url: req.url,
      });
      return res.status(401).send({ message: "Unauthorized! Invalid Token." });
    }

    console.log(`[verifyToken] JWT验证成功:`, {
      userId: decoded.id,
      role: decoded.role,
      url: req.url,
    });

    req.userId = decoded.id; // Add user ID to request object
    req.userRole = decoded.role; // Add user role to request object
    req.communityAdminId = decoded.communityAdminId || null; // Add community admin ID if exists
    // 不做单点登录/黑名单/主动失效，token只要未过期就有效
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    // 首先检查 JWT token 中的角色（更可靠，因为是从登录时获取的）
    const roleFromToken = req.userRole;
    if (roleFromToken === "admin" || roleFromToken === "community_admin") {
      next();
      return;
    }
    
    // 如果 JWT 中没有角色信息，则从数据库查询（备用方案）
    const user = await User.findByPk(req.userId);
    // 允许超级管理员（role === "admin"）和社区管理员（role === "community_admin"）
    if (user && (user.role === "admin" || user.role === "community_admin")) {
      next();
      return;
    }
    
    res.status(403).send({ message: "Require Admin Role!" });
    return;
  } catch (error) {
    console.error("[isAdmin] 验证用户角色失败:", error);
    res.status(500).send({ message: "Unable to validate User role!" });
  }
};

// 检查是否是社区管理员
const isCommunityAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && user.role === "community_admin" && user.communityAdminId) {
      req.communityAdminId = user.communityAdminId; // 确保 req 中包含社区ID
      next();
      return;
    }
    res.status(403).send({ message: "Require Community Admin Role!" });
    return;
  } catch (error) {
    res.status(500).send({ message: "Unable to validate Community Admin role!" });
  }
};

// 检查是否是超级管理员（不包括社区管理员）
const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user && user.role === "admin") {
      next();
      return;
    }
    res.status(403).send({ message: "Require Super Admin Role!" });
    return;
  } catch (error) {
    res.status(500).send({ message: "Unable to validate Super Admin role!" });
  }
};

// You can add more role checks like isModerator if needed

const authJwt = {
  verifyToken,
  isAdmin,
  isCommunityAdmin,
  isSuperAdmin,
};
module.exports = authJwt;
