#!/usr/bin/env node

/**
 * 修复 system_messages 表 type 字段枚举值
 * 确保数据库中的枚举值包含 rider_application_approved
 */

const db = require("../models");

async function fixSystemMessageTypeEnum() {
  console.log("🔧 开始修复 system_messages 表 type 字段枚举值...");

  try {
    // 检查当前枚举值
    console.log("📋 检查当前枚举值...");
    const enumInfo = await db.sequelize.query(
      "SHOW COLUMNS FROM system_messages LIKE 'type'",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    if (enumInfo.length > 0) {
      console.log("当前枚举值:", enumInfo[0].Type);
    }

    // 更新枚举值，添加 rider_application_approved
    console.log("🔄 更新枚举值...");
    await db.sequelize.query(`
      ALTER TABLE system_messages 
      MODIFY COLUMN type ENUM(
        'rider_application_approved',
        'rider_application_rejected', 
        'order_rejected',
        'order_completed',
        'order_cancelled',
        'account_security',
        'activity_notification',
        'system_maintenance',
        'other'
      ) NOT NULL COMMENT '系统消息类型'
    `);

    console.log("✅ 枚举值更新成功");

    // 验证更新结果
    console.log("🔍 验证更新结果...");
    const updatedEnumInfo = await db.sequelize.query(
      "SHOW COLUMNS FROM system_messages LIKE 'type'",
      { type: db.sequelize.QueryTypes.SELECT }
    );

    if (updatedEnumInfo.length > 0) {
      console.log("更新后的枚举值:", updatedEnumInfo[0].Type);
    }

    console.log("🎉 system_messages 表 type 字段修复完成！");
  } catch (error) {
    console.error("❌ 修复失败:", error);

    // 如果是枚举值已存在的错误，忽略
    if (
      error.message.includes("Duplicate entry") ||
      error.message.includes("already exists")
    ) {
      console.log("ℹ️ 枚举值可能已存在，继续执行...");
    } else {
      throw error;
    }
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

// 运行修复
fixSystemMessageTypeEnum();
