require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET || "xinghuoyuanbang_secret_key_2024", // 设置默认密钥
  jwtExpiration: process.env.JWT_EXPIRATION || "30d", // 30天，支持jwt.sign的字符串格式
  // jwtRefreshExpiration: 86400, // Example for refresh token if implemented
};
