const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");
const campusShardingService = require("./campusShardingService");
const marketShardingService = require("./marketShardingService");

/**
 * 自动分表服务
 * 当添加新社区时自动创建对应的任务、校园互动、二手市集分表
 */

class AutoShardingService {
  constructor() {
    this.createdTables = new Set(); // 缓存已创建的表
  }

  /**
   * 为新社区自动创建所有分表（任务、校园互动、二手市集）
   * @param {number} communityId - 社区ID
   * @param {string} communityName - 社区名称（用于日志）
   * @returns {Promise<boolean>} 是否创建成功
   */
  async createAllTablesForCommunity(communityId, communityName = "") {
    try {
      console.log(`🔨 为社区 ${communityName}(${communityId}) 创建所有分表...`);

      // 创建任务分表
      const taskSuccess = await this.createTaskTableForCommunity(
        communityId,
        communityName
      );

      // 创建校园互动分表
      const campusSuccess =
        await campusShardingService.createCampusTableForCommunity(
          communityId,
          communityName
        );

      // 创建二手市集分表
      const marketSuccess =
        await marketShardingService.createMarketTableForCommunity(
          communityId,
          communityName
        );

      const allSuccess = taskSuccess && campusSuccess && marketSuccess;

      if (allSuccess) {
        console.log(
          `✅ 成功为社区 ${communityName}(${communityId}) 创建所有分表`
        );
      } else {
        console.log(
          `⚠️  社区 ${communityName}(${communityId}) 部分分表创建失败`
        );
      }

      return allSuccess;
    } catch (error) {
      console.error(`❌ 为社区 ${communityId} 创建分表失败:`, error.message);
      return false;
    }
  }

  /**
   * 为新社区自动创建任务分表
   * @param {number} communityId - 社区ID
   * @param {string} communityName - 社区名称（用于日志）
   * @returns {Promise<boolean>} 是否创建成功
   */
  async createTaskTableForCommunity(communityId, communityName = "") {
    try {
      const tableName = `tasks_community_${communityId}`;

      // 检查表是否已存在
      if (this.createdTables.has(tableName)) {
        console.log(`✅ 表 ${tableName} 已在缓存中，跳过创建`);
        return true;
      }

      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}'`,
        { type: QueryTypes.SELECT }
      );

      if (tableExists.length > 0) {
        console.log(`✅ 表 ${tableName} 已存在，添加到缓存`);
        this.createdTables.add(tableName);
        return true;
      }

      console.log(
        `🔨 为社区 ${communityName}(${communityId}) 自动创建任务分表: ${tableName}`
      );

      // 创建分表
      await sequelize.query(`
        CREATE TABLE ${tableName} (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          specifics TEXT,
          taskType VARCHAR(50) NOT NULL,
          rewardAmount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
          budget DECIMAL(10,2) DEFAULT NULL,
          locationText VARCHAR(255),
          status ENUM('open','assigned','acceptor_done','publisher_confirmed','completed','cancelled') DEFAULT 'open',
          publisherId VARCHAR(16) NOT NULL,
          acceptorId VARCHAR(16),
          acceptedAt DATETIME,
          deadline DATETIME,
          out_trade_no VARCHAR(64),
          acceptorDoneTime DATETIME,
          publisherConfirmedTime DATETIME,
          autoConfirmTime DATETIME,
          autoCancelTime DATETIME,
          timeRequirement VARCHAR(50),
          paymentStatus ENUM('pending','paid','transferred','refunded') DEFAULT 'pending',
          platformFee DECIMAL(10,2),
          acceptorFee DECIMAL(10,2),
          transferTime DATETIME,
          remarks TEXT,
          requiredGender INT DEFAULT 0,
          version ENUM('community','campus') DEFAULT 'campus',
          communityId INT NOT NULL,
          borrowMode ENUM('lend','borrow'),
          autoOfflineDate DATETIME,
          images JSON,
          confirmImages JSON,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          
          -- 索引
          INDEX idx_communityId (communityId),
          INDEX idx_status (status),
          INDEX idx_publisherId (publisherId),
          INDEX idx_acceptorId (acceptorId),
          INDEX idx_createdAt (createdAt),
          INDEX idx_taskType (taskType),
          INDEX idx_paymentStatus (paymentStatus),
          INDEX idx_deadline (deadline),
          INDEX idx_autoCancelTime (autoCancelTime)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 添加到缓存
      this.createdTables.add(tableName);

      console.log(
        `✅ 成功为社区 ${communityName}(${communityId}) 创建任务分表: ${tableName}`
      );

      // 更新跨社区查询视图
      await this.updateCrossCommunityView();

      return true;
    } catch (error) {
      console.error(
        `❌ 为社区 ${communityId} 创建任务分表失败:`,
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

      if (communities.length === 0) {
        console.log("⚠️  没有社区，跳过视图更新");
        return;
      }

      // 获取所有任务表的列信息，找出所有表共有的列
      const allColumns = new Map();

      for (const community of communities) {
        const tableName = `tasks_community_${community.id}`;
        try {
          const columns = await sequelize.query(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = ? 
             ORDER BY ORDINAL_POSITION`,
            {
              replacements: [tableName],
              type: QueryTypes.SELECT,
            }
          );

          columns.forEach((col) => {
            const colName = col.COLUMN_NAME;
            if (!allColumns.has(colName)) {
              allColumns.set(colName, new Set());
            }
            allColumns.get(colName).add(tableName);
          });
        } catch (error) {
          console.warn(`⚠️  获取表 ${tableName} 的列信息失败:`, error.message);
        }
      }

      // 找出所有表都有的列（交集）
      const commonColumns = Array.from(allColumns.entries())
        .filter(([colName, tables]) => tables.size === communities.length)
        .map(([colName]) => colName)
        .sort();

      if (commonColumns.length === 0) {
        console.error("❌ 没有找到所有表共有的列，无法创建视图");
        return;
      }

      // 构建UNION ALL查询，只使用所有表共有的列
      const columnList = commonColumns.join(", ");
      const unionQueries = communities
        .map((community) => {
          const tableName = `tasks_community_${community.id}`;
          // 只选择所有表共有的列
          return `SELECT ${columnList} FROM ${tableName}`;
        })
        .join(" UNION ALL ");

      // 删除旧视图
      await sequelize.query(`DROP VIEW IF EXISTS tasks_all_communities`);

      // 创建新视图
      await sequelize.query(`
        CREATE VIEW tasks_all_communities AS
        ${unionQueries}
      `);

      console.log(
        `✅ 跨社区查询视图已更新，包含 ${communities.length} 个社区表，共 ${commonColumns.length} 个字段`
      );
    } catch (error) {
      console.error("❌ 更新跨社区查询视图失败:", error.message);
    }
  }

  /**
   * 初始化所有社区的所有分表
   * 在系统启动时调用，确保所有社区都有对应的分表
   */
  async initializeAllCommunityTables() {
    try {
      console.log("🚀 初始化所有社区的所有分表（任务、校园互动、二手市集）...");

      // 获取所有社区
      const communities = await sequelize.query(
        "SELECT id, name FROM communities ORDER BY id",
        { type: QueryTypes.SELECT }
      );

      console.log(`📊 发现 ${communities.length} 个社区，开始创建所有分表...`);

      let taskSuccessCount = 0;
      let campusSuccessCount = 0;
      let marketSuccessCount = 0;
      let taskSkipCount = 0;
      let campusSkipCount = 0;
      let marketSkipCount = 0;

      for (const community of communities) {
        // 初始化任务分表
        const taskResult = await this.initializeTaskTableForCommunity(
          community
        );
        if (taskResult.created) taskSuccessCount++;
        if (taskResult.skipped) taskSkipCount++;

        // 初始化校园互动分表
        const campusResult =
          await campusShardingService.initializeCampusTableForCommunity(
            community
          );
        if (campusResult.created) campusSuccessCount++;
        if (campusResult.skipped) campusSkipCount++;

        // 初始化二手市集分表
        const marketResult =
          await marketShardingService.initializeMarketTableForCommunity(
            community
          );
        if (marketResult.created) marketSuccessCount++;
        if (marketResult.skipped) marketSkipCount++;
      }

      console.log(`\n📋 所有分表初始化完成:`);
      console.log(`📋 任务分表:`);
      console.log(`  - 新创建: ${taskSuccessCount} 个表`);
      console.log(`  - 已存在: ${taskSkipCount} 个表`);
      console.log(`📋 校园互动分表:`);
      console.log(`  - 新创建: ${campusSuccessCount} 个表`);
      console.log(`  - 已存在: ${campusSkipCount} 个表`);
      console.log(`📋 二手市集分表:`);
      console.log(`  - 新创建: ${marketSuccessCount} 个表`);
      console.log(`  - 已存在: ${marketSkipCount} 个表`);

      // 更新所有跨社区查询视图
      await this.updateCrossCommunityView();
      await campusShardingService.updateCrossCommunityView();
      await marketShardingService.updateCrossCommunityView();

      return {
        success: true,
        tasks: { created: taskSuccessCount, skipped: taskSkipCount },
        campus: { created: campusSuccessCount, skipped: campusSkipCount },
        market: { created: marketSuccessCount, skipped: marketSkipCount },
      };
    } catch (error) {
      console.error("❌ 初始化所有社区分表失败:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 为单个社区初始化任务分表
   */
  async initializeTaskTableForCommunity(community) {
    const tableName = `tasks_community_${community.id}`;

    // 检查表是否已存在
    const tableExists = await sequelize.query(
      `SHOW TABLES LIKE '${tableName}'`,
      { type: QueryTypes.SELECT }
    );

    if (tableExists.length > 0) {
      console.log(`  ⚠️  任务表 ${tableName} 已存在，跳过创建`);
      this.createdTables.add(tableName);
      return { created: false, skipped: true };
    } else {
      const success = await this.createTaskTableForCommunity(
        community.id,
        community.name
      );
      return { created: success, skipped: false };
    }
  }

  /**
   * 删除社区时清理对应的所有分表（任务、校园互动、二手市集）
   * @param {number} communityId - 社区ID
   * @param {string} communityName - 社区名称（用于日志）
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteAllTablesForCommunity(communityId, communityName = "") {
    try {
      console.log(
        `🗑️  删除社区 ${communityName}(${communityId}) 的所有分表...`
      );

      // 删除任务分表
      const taskSuccess = await this.deleteTaskTableForCommunity(communityId);

      // 删除校园互动分表
      const campusSuccess =
        await campusShardingService.deleteCampusTableForCommunity(communityId);

      // 删除二手市集分表
      const marketSuccess =
        await marketShardingService.deleteMarketTableForCommunity(communityId);

      const allSuccess = taskSuccess && campusSuccess && marketSuccess;

      if (allSuccess) {
        console.log(
          `✅ 成功删除社区 ${communityName}(${communityId}) 的所有分表（任务、校园互动、二手市集）`
        );
      } else {
        console.warn(
          `⚠️  社区 ${communityName}(${communityId}) 部分分表删除失败`
        );
      }

      return allSuccess;
    } catch (error) {
      console.error(`❌ 删除社区 ${communityId} 的分表失败:`, error.message);
      return false;
    }
  }

  /**
   * 删除社区时清理对应的任务分表
   * @param {number} communityId - 社区ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteTaskTableForCommunity(communityId) {
    try {
      const tableName = `tasks_community_${communityId}`;

      console.log(`🗑️  删除社区 ${communityId} 的任务分表: ${tableName}`);

      // 检查表是否存在
      const tableExists = await sequelize.query(
        `SHOW TABLES LIKE '${tableName}'`,
        { type: QueryTypes.SELECT }
      );

      if (tableExists.length === 0) {
        console.log(`  ⚠️  表 ${tableName} 不存在，无需删除`);
        return true;
      }

      // 删除表
      await sequelize.query(`DROP TABLE ${tableName}`);

      // 从缓存中移除
      this.createdTables.delete(tableName);

      console.log(`✅ 成功删除社区 ${communityId} 的任务分表: ${tableName}`);

      // 更新跨社区查询视图
      await this.updateCrossCommunityView();

      return true;
    } catch (error) {
      console.error(
        `❌ 删除社区 ${communityId} 的任务分表失败:`,
        error.message
      );
      return false;
    }
  }

  /**
   * 获取所有已创建的分表信息
   */
  async getAllShardingTables() {
    try {
      const tables = await sequelize.query(
        "SHOW TABLES LIKE 'tasks_community_%'",
        { type: QueryTypes.SELECT }
      );

      const tableInfo = [];

      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const communityId = tableName.replace("tasks_community_", "");

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
      console.error("❌ 获取分表信息失败:", error.message);
      return [];
    }
  }

  /**
   * 检查分表健康状态
   */
  async checkShardingHealth() {
    try {
      console.log("🔍 检查分表健康状态...");

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
        const tableName = `tasks_community_${community.id}`;

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

      console.log("📊 分表健康状态报告:");
      console.log(`  - 总社区数: ${healthReport.totalCommunities}`);
      console.log(`  - 已创建表: ${healthReport.tablesCreated}`);
      console.log(`  - 缺失表: ${healthReport.tablesMissing.length}`);
      console.log(`  - 有数据表: ${healthReport.tablesWithData}`);
      console.log(`  - 总记录数: ${healthReport.totalRecords}`);

      if (healthReport.tablesMissing.length > 0) {
        console.log("⚠️  缺失的分表:");
        healthReport.tablesMissing.forEach((missing) => {
          console.log(
            `  - 社区 ${missing.communityName}(${missing.communityId}): ${missing.tableName}`
          );
        });
      }

      return healthReport;
    } catch (error) {
      console.error("❌ 检查分表健康状态失败:", error.message);
      return null;
    }
  }
}

// 创建单例实例
const autoShardingService = new AutoShardingService();

module.exports = autoShardingService;
