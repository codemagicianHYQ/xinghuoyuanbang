/**
 * 生成超级管理员 INSERT SQL
 * 运行: node scripts/create_super_admin.js
 * 将输出的 SQL 复制到 MySQL 中执行
 */
const bcrypt = require("bcryptjs");

const email = "1850336901@qq.com";
const plainPassword = "hyq/\\911";
const userId = "admin001"; // 用户ID，用于登录和系统内标识
const nickname = "超级管理员";

async function main() {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const sql = `-- 创建超级管理员（邮箱: ${email}）
USE users;

INSERT INTO users (
  id, openid, email, password, nickname, role, version, createdAt, updatedAt
) VALUES (
  '${userId}',
  'admin_email_${userId}',  -- openid 占位，管理员通过邮箱登录
  '${email}',
  '${hashedPassword}',
  '${nickname}',
  'admin',
  'campus',
  NOW(),
  NOW()
);`;

  console.log(sql);
}

main().catch(console.error);
