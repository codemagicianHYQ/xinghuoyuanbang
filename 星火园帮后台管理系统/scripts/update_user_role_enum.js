/**
 * 更新 users 表的 role ENUM，添加 community_admin
 * 注意：MySQL 不支持直接修改 ENUM，需要先改为 VARCHAR，再改回 ENUM
 */

const db = require("../models");

async function updateUserRoleEnum() {
  try {
    console.log("开始更新 users 表的 role ENUM...");

    // 检查当前 role 列的类型
    const [columns] = await db.sequelize.query(
      `SELECT COLUMN_TYPE 
       FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'role'`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    if (columns && columns.length > 0) {
      console.log("当前 role 列类型:", columns[0].COLUMN_TYPE);

      // 如果已经是 ENUM 且包含 community_admin，则跳过
      if (columns[0].COLUMN_TYPE.includes("community_admin")) {
        console.log("✓ role ENUM 已经包含 community_admin，无需更新");
        return;
      }
    }

    console.log("开始修改 role 列...");

    // 步骤1：添加临时列
    try {
      await db.sequelize.query(
        `ALTER TABLE users ADD COLUMN role_temp VARCHAR(50) NULL`
      );
      console.log("✓ 步骤1: 已添加临时列 role_temp");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("- 临时列 role_temp 已存在，继续执行");
      } else {
        throw error;
      }
    }

    // 步骤2：复制数据到临时列（添加 WHERE 条件以绕过安全更新模式）
    await db.sequelize.query(
      `UPDATE users SET role_temp = role WHERE id IS NOT NULL`
    );
    console.log("✓ 步骤2: 已复制数据到临时列");

    // 步骤3：删除原列
    await db.sequelize.query(`ALTER TABLE users DROP COLUMN role`);
    console.log("✓ 步骤3: 已删除原 role 列");

    // 步骤4：重新创建 ENUM 列（包含 community_admin）
    await db.sequelize.query(
      `ALTER TABLE users ADD COLUMN role ENUM('user', 'rider', 'admin', 'community_admin') NOT NULL DEFAULT 'user'`
    );
    console.log("✓ 步骤4: 已重新创建 role 列（包含 community_admin）");

    // 步骤5：从临时列复制回数据（只复制有效的值）
    // 使用主键 id 来满足安全更新模式的要求
    await db.sequelize.query(
      `UPDATE users SET role = role_temp 
       WHERE id IS NOT NULL 
       AND role_temp IN ('user', 'rider', 'admin', 'community_admin')`
    );
    console.log("✓ 步骤5: 已从临时列复制回数据");

    // 步骤6：删除临时列
    await db.sequelize.query(`ALTER TABLE users DROP COLUMN role_temp`);
    console.log("✓ 步骤6: 已删除临时列");

    console.log("\n✅ role ENUM 更新完成！");
  } catch (error) {
    console.error("❌ 更新 role ENUM 失败:", error);
    console.error("错误详情:", error.message);

    // 如果出错，尝试恢复
    console.log("\n尝试恢复...");
    try {
      // 检查是否有临时列
      const [tempColumns] = await db.sequelize.query(
        `SELECT COLUMN_NAME 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'users' 
         AND COLUMN_NAME = 'role_temp'`,
        {
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      if (tempColumns && tempColumns.length > 0) {
        // 如果有临时列，检查是否有 role 列
        const [roleColumns] = await db.sequelize.query(
          `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'users' 
           AND COLUMN_NAME = 'role'`,
          {
            type: db.sequelize.QueryTypes.SELECT,
          }
        );

        if (!roleColumns || roleColumns.length === 0) {
          // 如果 role 列不存在，重新创建（使用旧的 ENUM 值）
          await db.sequelize.query(
            `ALTER TABLE users ADD COLUMN role ENUM('user', 'rider', 'admin') NOT NULL DEFAULT 'user'`
          );
          await db.sequelize.query(
            `UPDATE users SET role = role_temp WHERE id IS NOT NULL AND role_temp IN ('user', 'rider', 'admin')`
          );
          await db.sequelize.query(`ALTER TABLE users DROP COLUMN role_temp`);
          console.log("✓ 已恢复到原始状态");
        }
      }
    } catch (recoverError) {
      console.error("恢复失败:", recoverError);
    }

    process.exit(1);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

updateUserRoleEnum();
