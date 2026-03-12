const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

/**
 * 分表辅助服务
 * 提供统一的分表操作方法
 */

class ShardingHelper {
  /**
   * 获取任务分表名称
   */
  getTaskTableName(communityId) {
    return `tasks_community_${communityId}`;
  }

  /**
   * 获取校园论坛分表名称
   */
  getCampusTableName(communityId) {
    return `campus_resources_community_${communityId}`;
  }

  /**
   * 获取二手市集分表名称
   */
  getMarketTableName(communityId) {
    return `market_products_community_${communityId}`;
  }

  /**
   * 在指定的分表中插入数据
   * @param {string} tableName - 表名
   * @param {object} data - 要插入的数据
   * @returns {Promise<object>} 插入的记录
   */
  async insertIntoShardedTable(tableName, data) {
    try {
      // 构建字段和值
      const fields = Object.keys(data);
      const values = Object.values(data).map((value) => {
        // 处理JSON字段（排除Date对象）
        if (
          Array.isArray(value) ||
          (typeof value === "object" &&
            value !== null &&
            !(value instanceof Date))
        ) {
          return JSON.stringify(value);
        }
        return value;
      });

      // 构建占位符
      const placeholders = fields.map(() => "?").join(", ");
      // 为保留关键字添加反引号
      const fieldNames = fields
        .map((field) => {
          const reservedKeywords = [
            "condition",
            "order",
            "group",
            "select",
            "from",
            "where",
            "having",
            "limit",
            "offset",
          ];
          return reservedKeywords.includes(field.toLowerCase())
            ? `\`${field}\``
            : field;
        })
        .join(", ");

      // 执行插入
      const [result] = await sequelize.query(
        `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
        {
          replacements: values,
          type: QueryTypes.INSERT,
        }
      );

      console.log("插入操作结果:", result);
      console.log("插入的ID应该是:", data.id);

      // 直接返回插入的数据，而不是重新查询
      return data;
    } catch (error) {
      console.error(`❌ 插入数据到分表 ${tableName} 失败:`, error.message);
      throw error;
    }
  }

  /**
   * 从指定的分表中查询数据
   * @param {string} tableName - 表名
   * @param {object} options - 查询选项
   * @returns {Promise<Array>} 查询结果
   */
  async queryFromShardedTable(tableName, options = {}) {
    try {
      const { where = {}, limit, offset, order = "createdAt DESC" } = options;

      // 构建WHERE条件
      const whereConditions = [];
      const replacements = [];

      // 处理 [Op.or] 条件
      if (where[Symbol.for("or")] || where["$or"]) {
        const orConditions = where[Symbol.for("or")] || where["$or"];
        const orParts = [];

        orConditions.forEach((orCondition) => {
          const orWhereConditions = [];
          const orReplacements = [];

          Object.keys(orCondition).forEach((key) => {
            const value = orCondition[key];
            const escapedKey = [
              "condition",
              "order",
              "group",
              "select",
              "from",
              "where",
              "having",
              "limit",
              "offset",
            ].includes(key.toLowerCase())
              ? `\`${key}\``
              : key;

            if (value && typeof value === "object" && !Array.isArray(value)) {
              Object.entries(value).forEach(([operator, operatorValue]) => {
                switch (operator) {
                  case "in":
                  case "IN":
                    if (Array.isArray(operatorValue)) {
                      const placeholders = operatorValue
                        .map(() => "?")
                        .join(", ");
                      orWhereConditions.push(
                        `${escapedKey} IN (${placeholders})`
                      );
                      orReplacements.push(...operatorValue);
                    }
                    break;
                  case "ne":
                  case "NE":
                    orWhereConditions.push(`${escapedKey} != ?`);
                    orReplacements.push(operatorValue);
                    break;
                  default:
                    orWhereConditions.push(`${escapedKey} = ?`);
                    orReplacements.push(operatorValue);
                }
              });
            } else if (Array.isArray(value)) {
              const placeholders = value.map(() => "?").join(", ");
              orWhereConditions.push(`${escapedKey} IN (${placeholders})`);
              orReplacements.push(...value);
            } else {
              orWhereConditions.push(`${escapedKey} = ?`);
              orReplacements.push(value);
            }
          });

          if (orWhereConditions.length > 0) {
            orParts.push(`(${orWhereConditions.join(" AND ")})`);
            replacements.push(...orReplacements);
          }
        });

        if (orParts.length > 0) {
          whereConditions.push(`(${orParts.join(" OR ")})`);
        }
      } else {
        // 处理普通WHERE条件
        Object.keys(where).forEach((key) => {
          const value = where[key];
          // 为保留关键字添加反引号
          const escapedKey = [
            "condition",
            "order",
            "group",
            "select",
            "from",
            "where",
            "having",
            "limit",
            "offset",
          ].includes(key.toLowerCase())
            ? `\`${key}\``
            : key;

          // 处理Sequelize操作符
          if (value && typeof value === "object" && !Array.isArray(value)) {
            // 处理Sequelize操作符对象
            Object.entries(value).forEach(([operator, operatorValue]) => {
              switch (operator) {
                case "in":
                case "IN":
                  if (Array.isArray(operatorValue)) {
                    const placeholders = operatorValue
                      .map(() => "?")
                      .join(", ");
                    whereConditions.push(`${escapedKey} IN (${placeholders})`);
                    replacements.push(...operatorValue);
                  }
                  break;
                case "ne":
                case "NE":
                  whereConditions.push(`${escapedKey} != ?`);
                  replacements.push(operatorValue);
                  break;
                case "between":
                case "BETWEEN":
                  if (
                    Array.isArray(operatorValue) &&
                    operatorValue.length === 2
                  ) {
                    whereConditions.push(`${escapedKey} BETWEEN ? AND ?`);
                    replacements.push(operatorValue[0], operatorValue[1]);
                  }
                  break;
                case "like":
                case "LIKE":
                  whereConditions.push(`${escapedKey} LIKE ?`);
                  replacements.push(operatorValue);
                  break;
                default:
                  // 默认处理为等于
                  whereConditions.push(`${escapedKey} = ?`);
                  replacements.push(operatorValue);
              }
            });
          } else if (Array.isArray(value)) {
            // 处理数组条件，使用 IN 操作符
            const placeholders = value.map(() => "?").join(", ");
            whereConditions.push(`${escapedKey} IN (${placeholders})`);
            replacements.push(...value);
          } else {
            whereConditions.push(`${escapedKey} = ?`);
            replacements.push(value);
          }
        });
      }

      let sql = `SELECT * FROM ${tableName}`;

      if (whereConditions.length > 0) {
        sql += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      // 处理ORDER BY子句
      if (order) {
        let orderClause = "";
        if (Array.isArray(order)) {
          // 处理Sequelize格式的order数组 [[field, direction], ...]
          const orderParts = order.map(([field, direction]) => {
            return `${field} ${direction || "ASC"}`;
          });
          orderClause = orderParts.join(", ");
        } else if (typeof order === "string") {
          orderClause = order;
        }

        if (orderClause) {
          sql += ` ORDER BY ${orderClause}`;
        }
      }

      if (limit) {
        sql += ` LIMIT ${limit}`;
        if (offset) {
          sql += ` OFFSET ${offset}`;
        }
      }

      const results = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      // 获取总数
      let countSql = `SELECT COUNT(*) as count FROM ${tableName}`;
      if (whereConditions.length > 0) {
        countSql += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      const [countResult] = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return {
        count: countResult.count,
        rows: results,
      };
    } catch (error) {
      console.error(`❌ 从分表 ${tableName} 查询数据失败:`, error.message);
      throw error;
    }
  }

  /**
   * 从指定的分表中查询单条数据
   * @param {string} tableName - 表名
   * @param {number|string} id - 记录ID
   * @returns {Promise<object|null>} 查询结果
   */
  async findByIdInShardedTable(tableName, id) {
    try {
      const result = await sequelize.query(
        `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
        {
          replacements: [id],
          type: QueryTypes.SELECT,
        }
      );

      return result[0] || null; // 返回第一个记录或null
    } catch (error) {
      console.error(`❌ 从分表 ${tableName} 查询记录失败:`, error.message);
      throw error;
    }
  }

  /**
   * 更新指定分表中的数据
   * @param {string} tableName - 表名
   * @param {number|string} id - 记录ID
   * @param {object} data - 要更新的数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateInShardedTable(tableName, id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);

      const setClause = fields.map((field) => `${field} = ?`).join(", ");

      await sequelize.query(
        `UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
        {
          replacements: [...values, id],
          type: QueryTypes.UPDATE,
        }
      );

      return true;
    } catch (error) {
      console.error(`❌ 更新分表 ${tableName} 中的记录失败:`, error.message);
      throw error;
    }
  }

  /**
   * 从指定的分表中删除数据
   * @param {string} tableName - 表名
   * @param {number|string} id - 记录ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteFromShardedTable(tableName, id) {
    try {
      await sequelize.query(`DELETE FROM ${tableName} WHERE id = ?`, {
        replacements: [id],
        type: QueryTypes.DELETE,
      });

      return true;
    } catch (error) {
      console.error(`❌ 从分表 ${tableName} 删除记录失败:`, error.message);
      throw error;
    }
  }

  /**
   * 查询分表中的记录总数
   * @param {string} tableName - 表名
   * @param {object} where - 查询条件
   * @returns {Promise<number>} 记录总数
   */
  async countInShardedTable(tableName, where = {}) {
    try {
      const whereConditions = [];
      const replacements = [];

      Object.keys(where).forEach((key) => {
        whereConditions.push(`${key} = ?`);
        replacements.push(where[key]);
      });

      let sql = `SELECT COUNT(*) as count FROM ${tableName}`;

      if (whereConditions.length > 0) {
        sql += ` WHERE ${whereConditions.join(" AND ")}`;
      }

      const [result] = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return result.count;
    } catch (error) {
      console.error(`❌ 统计分表 ${tableName} 记录数失败:`, error.message);
      throw error;
    }
  }

  /**
   * 从主表迁移数据到分表
   * @param {string} sourceTable - 源表名
   * @param {string} targetTable - 目标表名
   * @param {object} where - 迁移条件
   * @returns {Promise<number>} 迁移的记录数
   */
  async migrateData(sourceTable, targetTable, where = {}) {
    try {
      console.log(`🔄 开始从 ${sourceTable} 迁移数据到 ${targetTable}...`);

      // 构建WHERE条件
      const whereConditions = [];
      const replacements = [];

      Object.keys(where).forEach((key) => {
        whereConditions.push(`${key} = ?`);
        replacements.push(where[key]);
      });

      let whereClause = "";
      if (whereConditions.length > 0) {
        whereClause = ` WHERE ${whereConditions.join(" AND ")}`;
      }

      // 查询要迁移的数据
      const dataToMigrate = await sequelize.query(
        `SELECT * FROM ${sourceTable}${whereClause}`,
        {
          replacements,
          type: QueryTypes.SELECT,
        }
      );

      if (dataToMigrate.length === 0) {
        console.log(`⚠️  没有找到需要迁移的数据`);
        return 0;
      }

      console.log(`📊 找到 ${dataToMigrate.length} 条记录需要迁移`);

      // 逐条插入到目标表
      let successCount = 0;
      for (const record of dataToMigrate) {
        try {
          const fields = Object.keys(record);
          const values = Object.values(record);

          const placeholders = fields.map(() => "?").join(", ");
          const fieldNames = fields.join(", ");

          await sequelize.query(
            `INSERT INTO ${targetTable} (${fieldNames}) VALUES (${placeholders})`,
            {
              replacements: values,
              type: QueryTypes.INSERT,
            }
          );

          successCount++;
        } catch (error) {
          console.error(`❌ 迁移记录 ID ${record.id} 失败:`, error.message);
        }
      }

      console.log(`✅ 成功迁移 ${successCount}/${dataToMigrate.length} 条记录`);

      return successCount;
    } catch (error) {
      console.error(`❌ 数据迁移失败:`, error.message);
      throw error;
    }
  }
}

// 创建单例实例
const shardingHelper = new ShardingHelper();

module.exports = shardingHelper;
