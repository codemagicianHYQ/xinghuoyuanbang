/**
 * 添加社区管理员字段
 * 在 users 表添加 communityAdminId 字段
 */

const db = require("../models");

async function addCommunityAdminField() {
  try {
    console.log("开始添加社区管理员字段...");

    // 检查 users 表是否有 communityAdminId 字段
    const hasCommunityAdminId = await db.sequelize.query(
      `SELECT COUNT(*) as count 
       FROM information_schema.columns 
       WHERE table_schema = DATABASE() 
       AND table_name = 'users' 
       AND column_name = 'communityAdminId'`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    if (hasCommunityAdminId[0].count === 0) {
      await db.sequelize.query(
        `ALTER TABLE users 
         ADD COLUMN communityAdminId INT NULL COMMENT '用户作为社区管理员管理的社区ID'`
      );
      console.log("✓ 已添加 communityAdminId 字段到 users 表");
    } else {
      console.log("- communityAdminId 字段已存在");
    }

    // 添加索引
    try {
      await db.sequelize.query(
        `CREATE INDEX idx_users_community_admin_id ON users(communityAdminId)`
      );
      console.log("✓ 已添加索引 idx_users_community_admin_id");
    } catch (error) {
      if (error.message.includes("Duplicate key name")) {
        console.log("- 索引 idx_users_community_admin_id 已存在");
      } else {
        throw error;
      }
    }

    console.log("\n✅ 所有字段和索引添加完成！");
  } catch (error) {
    console.error("❌ 添加字段失败:", error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

addCommunityAdminField();

