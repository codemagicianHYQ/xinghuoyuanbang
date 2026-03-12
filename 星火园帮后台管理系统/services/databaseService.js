const { dbCluster } = require("../config/database-cluster");
const { Op } = require("sequelize");

class DatabaseService {
  constructor() {
    this.cluster = dbCluster;
  }

  // 获取写连接（主库）
  getMaster() {
    return this.cluster.getMaster();
  }

  // 获取读连接（从库）
  getSlave() {
    return this.cluster.getSlave();
  }

  // 根据操作类型获取连接
  getConnection(operation = "read") {
    return this.cluster.getConnection(operation);
  }

  // 执行读操作
  async read(operation, options = {}) {
    try {
      const connection = this.getSlave();
      console.log(`📖 执行读操作: ${operation} (从库)`);
      return await connection.query(operation, options);
    } catch (error) {
      console.error("读操作失败:", error);
      throw error;
    }
  }

  // 执行写操作
  async write(operation, options = {}) {
    try {
      const connection = this.getMaster();
      console.log(`✍️ 执行写操作: ${operation} (主库)`);
      return await connection.query(operation, options);
    } catch (error) {
      console.error("写操作失败:", error);
      throw error;
    }
  }

  // 执行事务
  async transaction(callback, options = {}) {
    const connection = this.getMaster();
    return await connection.transaction(callback, options);
  }

  // 获取连接池状态
  getPoolStatus() {
    return this.cluster.getPoolStatus();
  }

  // 测试连接
  async testConnections() {
    return await this.cluster.testConnections();
  }

  // 获取所有社区
  async getAllCommunities() {
    try {
      const connection = this.getSlave();
      const [results] = await connection.query(
        "SELECT id, name, type, province, city, district, latitude, longitude FROM communities ORDER BY name"
      );
      return results;
    } catch (error) {
      console.error("获取社区列表失败:", error);
      return [];
    }
  }

  // 根据社区ID获取任务模型（分表使用原始SQL，返回null）
  getTaskModel(communityId) {
    // 分表使用原始SQL查询，不使用Sequelize模型
    return null;
  }

  // 根据社区ID获取分表名称
  getTaskTableName(communityId) {
    return `tasks_community_${communityId}`;
  }

  // 检查分表是否存在
  async checkShardedTableExists(communityId) {
    try {
      const connection = this.getSlave();
      const tableName = `tasks_community_${communityId}`;
      const [results] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        { replacements: [tableName] }
      );
      return results[0].count > 0;
    } catch (error) {
      console.error(`检查分表是否存在失败 (社区ID: ${communityId}):`, error);
      return false;
    }
  }
}

// 创建数据库服务实例
const databaseService = new DatabaseService();

module.exports = databaseService;
