/**
 * 为所有 tasks_community_* 表的 paymentStatus 字段添加 'refunded' 选项
 * 此脚本会查找所有任务分表，并更新它们的 paymentStatus ENUM 定义
 */

const db = require("../models");
const sequelize = db.sequelize;

async function updatePaymentStatusEnum() {
  try {
    console.log("[add_refunded_to_payment_status] 开始更新 paymentStatus ENUM...");

    // 1. 查找所有 tasks_community_* 表
    const tables = await sequelize.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME LIKE 'tasks_community_%'`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(
      `[add_refunded_to_payment_status] 找到 ${tables.length} 个任务分表`
    );

    // 2. 检查每个表的 paymentStatus 列定义
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(
        `[add_refunded_to_payment_status] 检查表: ${tableName}`
      );

      try {
        // 检查 paymentStatus 列是否是 ENUM 类型，并且是否包含 'refunded'
        const columnInfo = await sequelize.query(
          `SELECT COLUMN_TYPE 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = ? 
             AND COLUMN_NAME = 'paymentStatus'`,
          {
            replacements: [tableName],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (columnInfo.length === 0) {
          console.log(
            `[add_refunded_to_payment_status] ⚠️ 表 ${tableName} 没有 paymentStatus 列，跳过`
          );
          continue;
        }

        const columnType = columnInfo[0].COLUMN_TYPE;
        console.log(
          `[add_refunded_to_payment_status] 当前 paymentStatus 类型: ${columnType}`
        );

        // 检查是否已经包含 'refunded'
        if (columnType.includes("refunded")) {
          console.log(
            `[add_refunded_to_payment_status] ✅ 表 ${tableName} 已包含 'refunded'，跳过`
          );
          continue;
        }

        // 3. 更新 ENUM 定义
        console.log(
          `[add_refunded_to_payment_status] 正在更新表 ${tableName}...`
        );

        await sequelize.query(
          `ALTER TABLE \`${tableName}\` 
           MODIFY COLUMN paymentStatus ENUM('pending','paid','transferred','refunded') DEFAULT 'pending'`,
          {
            type: sequelize.QueryTypes.RAW,
          }
        );

        console.log(
          `[add_refunded_to_payment_status] ✅ 成功更新表 ${tableName}`
        );
      } catch (error) {
        console.error(
          `[add_refunded_to_payment_status] ❌ 更新表 ${tableName} 失败:`,
          error.message
        );
        // 继续处理下一个表
      }
    }

    console.log(
      "[add_refunded_to_payment_status] ✅ 所有表的 paymentStatus ENUM 更新完成"
    );
  } catch (error) {
    console.error(
      "[add_refunded_to_payment_status] ❌ 更新失败:",
      error
    );
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行更新
if (require.main === module) {
  updatePaymentStatusEnum()
    .then(() => {
      console.log("[add_refunded_to_payment_status] 脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[add_refunded_to_payment_status] 脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = updatePaymentStatusEnum;
