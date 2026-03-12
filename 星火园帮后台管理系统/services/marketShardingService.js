const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

/**
 * 二手市集分表服务
 * 当添加新社区时自动创建对应的二手市集分表
 */

class MarketShardingService {
  constructor() {
    this.createdTables = new Set(); // 缓存已创建的表
  }

  /**
   * 为新社区自动创建二手市集分表
   * @param {number} communityId - 社区ID
   * @param {string} communityName - 社区名称（用于日志）
   * @returns {Promise<boolean>} 是否创建成功
   */
  async createMarketTableForCommunity(communityId, communityName = "") {
    try {
      const tableName = `market_products_community_${communityId}`;

      // 检查表是否已存在
      if (this.createdTables.has(tableName)) {
        console.log(`✅ 二手市集表 ${tableName} 已在缓存中，跳过创建`);
        return true;
      }

      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}'`,
        { type: QueryTypes.SELECT }
      );

      if (tableExists.length > 0) {
        console.log(`✅ 二手市集表 ${tableName} 已存在，添加到缓存`);
        this.createdTables.add(tableName);
        return true;
      }

      console.log(
        `🔨 为社区 ${communityName}(${communityId}) 自动创建二手市集分表: ${tableName}`
      );

      // 创建二手市集分表
      await sequelize.query(`
        CREATE TABLE ${tableName} (
          id VARCHAR(16) PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          category ENUM('books','electronics','clothes','beauty','sports','home','food','stationery','others') NOT NULL,
          \`condition\` ENUM('new','excellent','good','used') NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          originalPrice DECIMAL(10,2),
          isNegotiable BOOLEAN DEFAULT FALSE,
          images JSON NOT NULL,
          tradeMethods JSON NOT NULL,
          location VARCHAR(100),
          deliveryFee DECIMAL(10,2),
          wechatId VARCHAR(50),
          contactNote VARCHAR(200),
          sellerId VARCHAR(16) NOT NULL,
          status ENUM('active','sold','cancelled','draft','pending','completed','refunded') DEFAULT 'active',
          viewCount INT DEFAULT 0,
          favoriteCount INT DEFAULT 0,
          buyerId VARCHAR(16),
          soldAt DATETIME,
          out_trade_no VARCHAR(64),
          finalPrice DECIMAL(10,2),
          serviceFee DECIMAL(10,2),
          discountAmount DECIMAL(10,2),
          sellerIncome DECIMAL(10,2),
          isNegotiated BOOLEAN DEFAULT FALSE,
          communityId INT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          -- 索引
          INDEX idx_communityId (communityId),
          INDEX idx_category (category),
          INDEX idx_status (status),
          INDEX idx_sellerId (sellerId),
          INDEX idx_buyerId (buyerId),
          INDEX idx_createdAt (createdAt),
          INDEX idx_price (price),
          INDEX idx_category_status (category, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 添加到缓存
      this.createdTables.add(tableName);

      console.log(
        `✅ 成功为社区 ${communityName}(${communityId}) 创建二手市集分表: ${tableName}`
      );

      // 更新跨社区查询视图
      await this.updateCrossCommunityView();

      return true;
    } catch (error) {
      console.error(
        `❌ 为社区 ${communityId} 创建二手市集分表失败:`,
        error.message
      );
      return false;
    }
  }

  /**
   * 更新跨社区查询视图
   */
  async updateCrossCommunityView() {
    try {
      // 获取所有社区
      const communities = await sequelize.query(
        "SELECT id FROM communities ORDER BY id",
        { type: QueryTypes.SELECT }
      );

      // 检查哪些表已经存在
      const existingTables = [];
      for (const community of communities) {
        const tableName = `market_products_community_${community.id}`;
        const tableExists = await sequelize.query(
          `SHOW TABLES LIKE '${tableName}'`,
          { type: QueryTypes.SELECT }
        );
        if (tableExists.length > 0) {
          existingTables.push(community.id);
        }
      }

      if (existingTables.length === 0) {
        console.log("⚠️  没有找到任何二手市集分表，跳过视图更新");
        return;
      }

      // 构建UNION ALL查询（只包含已存在的表）
      const unionQueries = existingTables
        .map(
          (communityId) =>
            `SELECT * FROM market_products_community_${communityId}`
        )
        .join(" UNION ALL ");

      // 删除旧视图
      await sequelize.query(
        `DROP VIEW IF EXISTS market_products_all_communities`
      );

      // 创建新视图
      await sequelize.query(`
        CREATE VIEW market_products_all_communities AS
        ${unionQueries}
      `);

      console.log(
        `✅ 二手市集跨社区查询视图已更新，包含 ${existingTables.length} 个社区表`
      );
    } catch (error) {
      console.error("❌ 更新二手市集跨社区查询视图失败:", error.message);
    }
  }

  /**
   * 为单个社区初始化二手市集分表
   */
  async initializeMarketTableForCommunity(community) {
    const tableName = `market_products_community_${community.id}`;

    // 检查表是否已存在
    const tableExists = await sequelize.query(
      `SHOW TABLES LIKE '${tableName}'`,
      { type: QueryTypes.SELECT }
    );

    if (tableExists.length > 0) {
      console.log(`  ⚠️  二手市集表 ${tableName} 已存在，跳过创建`);
      this.createdTables.add(tableName);
      return { created: false, skipped: true };
    } else {
      const success = await this.createMarketTableForCommunity(
        community.id,
        community.name
      );
      return { created: success, skipped: false };
    }
  }

  /**
   * 初始化所有社区的二手市集分表
   * 在系统启动时调用，确保所有社区都有对应的分表
   */
  async initializeAllCommunityTables() {
    try {
      console.log("🚀 初始化所有社区的二手市集分表...");

      // 获取所有社区
      const communities = await sequelize.query(
        "SELECT id, name FROM communities ORDER BY id",
        { type: QueryTypes.SELECT }
      );

      console.log(
        `📊 发现 ${communities.length} 个社区，开始创建二手市集分表...`
      );

      let successCount = 0;
      let skipCount = 0;

      for (const community of communities) {
        const tableName = `market_products_community_${community.id}`;

        // 检查表是否已存在
        const tableExists = await sequelize.query(
          `SHOW TABLES LIKE '${tableName}'`,
          { type: QueryTypes.SELECT }
        );

        if (tableExists.length > 0) {
          console.log(`  ⚠️  二手市集表 ${tableName} 已存在，跳过创建`);
          this.createdTables.add(tableName);
          skipCount++;
        } else {
          const success = await this.createMarketTableForCommunity(
            community.id,
            community.name
          );
          if (success) {
            successCount++;
          }
        }
      }

      console.log(`\n📋 二手市集分表初始化完成:`);
      console.log(`  - 新创建: ${successCount} 个表`);
      console.log(`  - 已存在: ${skipCount} 个表`);
      console.log(`  - 总计: ${successCount + skipCount} 个表`);

      // 更新跨社区查询视图
      await this.updateCrossCommunityView();

      return {
        success: true,
        created: successCount,
        skipped: skipCount,
        total: successCount + skipCount,
      };
    } catch (error) {
      console.error("❌ 初始化二手市集分表失败:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 删除社区时清理对应的二手市集分表
   * @param {number} communityId - 社区ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteMarketTableForCommunity(communityId) {
    try {
      const tableName = `market_products_community_${communityId}`;

      console.log(`🗑️  删除社区 ${communityId} 的二手市集分表: ${tableName}`);

      // 检查表是否存在
      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}'`,
        { type: QueryTypes.SELECT }
      );

      if (tableExists.length === 0) {
        console.log(`  ⚠️  二手市集表 ${tableName} 不存在，无需删除`);
        return true;
      }

      // 删除表
      await sequelize.query(`DROP TABLE ${tableName}`);

      // 从缓存中移除
      this.createdTables.delete(tableName);

      console.log(
        `✅ 成功删除社区 ${communityId} 的二手市集分表: ${tableName}`
      );

      // 更新跨社区查询视图
      await this.updateCrossCommunityView();

      return true;
    } catch (error) {
      console.error(
        `❌ 删除社区 ${communityId} 的二手市集分表失败:`,
        error.message
      );
      return false;
    }
  }

  /**
   * 获取所有已创建的二手市集分表信息
   */
  async getAllShardingTables() {
    try {
      const tables = await sequelize.query(
        "SHOW TABLES LIKE 'market_products_community_%'",
        { type: QueryTypes.SELECT }
      );

      const tableInfo = [];

      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const communityId = tableName.replace("market_products_community_", "");

        // 获取表记录数
        const count = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName}`,
          { type: QueryTypes.SELECT }
        );

        tableInfo.push({
          tableName,
          communityId: parseInt(communityId),
          recordCount: count[0].count,
        });
      }

      return tableInfo;
    } catch (error) {
      console.error("❌ 获取二手市集分表信息失败:", error.message);
      return [];
    }
  }

  /**
   * 检查二手市集分表健康状态
   */
  async checkShardingHealth() {
    try {
      console.log("🔍 检查二手市集分表健康状态...");

      // 获取所有社区
      const communities = await sequelize.query(
        "SELECT id, name FROM communities ORDER BY id",
        { type: QueryTypes.SELECT }
      );

      const healthReport = {
        totalCommunities: communities.length,
        tablesCreated: 0,
        tablesMissing: [],
        tablesWithData: 0,
        totalRecords: 0,
      };

      for (const community of communities) {
        const tableName = `market_products_community_${community.id}`;

        const tableExists = await sequelize.query(
          `SHOW TABLES LIKE '${tableName}'`,
          { type: QueryTypes.SELECT }
        );

        if (tableExists.length > 0) {
          healthReport.tablesCreated++;

          // 检查记录数
          const count = await sequelize.query(
            `SELECT COUNT(*) as count FROM ${tableName}`,
            { type: QueryTypes.SELECT }
          );

          const recordCount = count[0].count;
          healthReport.totalRecords += recordCount;

          if (recordCount > 0) {
            healthReport.tablesWithData++;
          }
        } else {
          healthReport.tablesMissing.push({
            communityId: community.id,
            communityName: community.name,
            tableName,
          });
        }
      }

      console.log("📊 二手市集分表健康状态报告:");
      console.log(`  - 总社区数: ${healthReport.totalCommunities}`);
      console.log(`  - 已创建表: ${healthReport.tablesCreated}`);
      console.log(`  - 缺失表: ${healthReport.tablesMissing.length}`);
      console.log(`  - 有数据表: ${healthReport.tablesWithData}`);
      console.log(`  - 总记录数: ${healthReport.totalRecords}`);

      if (healthReport.tablesMissing.length > 0) {
        console.log("⚠️  缺失的二手市集分表:");
        healthReport.tablesMissing.forEach((missing) => {
          console.log(
            `  - 社区 ${missing.communityName}(${missing.communityId}): ${missing.tableName}`
          );
        });
      }

      return healthReport;
    } catch (error) {
      console.error("❌ 检查二手市集分表健康状态失败:", error.message);
      return null;
    }
  }
}

// 创建单例实例
const marketShardingService = new MarketShardingService();

module.exports = marketShardingService;
