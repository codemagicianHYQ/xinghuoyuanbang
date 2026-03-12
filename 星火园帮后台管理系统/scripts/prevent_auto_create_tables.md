# 🔒 防止自动创建备份表和主表

## 📋 检查清单

### ✅ 已完成的防护措施

#### 1. **Sequelize 自动同步已完全禁用** ✅

**位置 1**：`models/index.js` (line 223-224)

```javascript
// 数据库同步已禁用，手动管理表结构
// sequelize.sync() 相关代码已删除
```

**位置 2**：`server.js` (line 203-213) ✅ **已修复**

```javascript
console.log("[DB] ⚠️  数据库自动同步已禁用（生产模式）");
console.log("[DB] 使用手动管理的数据库表结构和分表架构");

// 数据库同步已完全禁用，不会自动创建表
// db.sequelize.sync() 已禁用，使用手动分表管理
(async () => {
  try {
    console.log("[DB] 跳过数据库同步，准备执行 initial()...");
    console.log("[INFO] ✅ 数据库表结构由手动管理，不执行自动同步");
    await initial();
    // ...
```

**原问题**：

- ❌ `server.js` 中存在 `db.sequelize.sync({ force: syncForce })`
- ❌ 每次服务器重启都会执行同步，自动创建主表

**状态**：✅ **已完全禁用，不会自动创建主表**

---

#### 2. **迁移脚本中的备份逻辑** ✅

**位置**：`scripts/migrate_campus_market_data.js`

**状态**：✅ **已删除**

**原问题**：

- 脚本会创建 `campus_resources_backup_${Date.now()}`
- 脚本会创建 `market_products_backup_${Date.now()}`

**解决方案**：

- ✅ 迁移脚本已完全删除
- ✅ 数据已于 2025-10-23 迁移完成
- ✅ 不再有自动创建备份表的风险

---

#### 3. **模型定义中的 tableName** ✅

**已检查的模型**：

- `campusResource.model.js` - tableName: `campus_resources`
- `marketProduct.model.js` - tableName: `market_products`
- `task.model.js` - 默认表名（但已被分表替代）

**状态**：✅ 模型只定义表名，不会自动创建（因为 `sync()` 已禁用）

---

## 🛡️ 推荐的防护措施

### 1. 修改迁移脚本（可选）

**方案 A**：注释掉备份逻辑（推荐）

```javascript
// scripts/migrate_campus_market_data.js

async function backupTables() {
  console.log("\n==========================================");
  console.log("⚠️  备份功能已禁用（数据已迁移完成）");
  console.log("==========================================\n");

  console.log("✅ 跳过备份步骤（主表数据已在之前的迁移中备份）");
  console.log("ℹ️  如需备份，请在 MySQL 中手动执行：");
  console.log("   CREATE TABLE backup_name AS SELECT * FROM source_table;");

  return; // 直接返回，不执行备份

  // 原备份代码已注释
  /*
  try {
    const campusTableExists = await sequelize.query(...);
    // ...
  }
  */
}
```

**方案 B**：重命名脚本（推荐）

```bash
# 将脚本重命名为 .bak 或 .old
mv scripts/migrate_campus_market_data.js scripts/migrate_campus_market_data.js.bak
```

---

### 2. 添加环境变量控制（高级）

在 `.env` 中添加：

```env
# 是否允许创建备份表（生产环境应设为 false）
ALLOW_BACKUP_CREATION=false

# 是否允许自动同步数据库（生产环境应设为 false）
ALLOW_DB_SYNC=false
```

在 `models/index.js` 中添加检查：

```javascript
// 环境变量保护
const ALLOW_DB_SYNC = process.env.ALLOW_DB_SYNC === "true";

if (ALLOW_DB_SYNC) {
  console.warn("⚠️  警告：数据库自动同步已启用，这可能会修改生产数据库结构！");
  // sequelize.sync({ alter: true });
} else {
  console.log("✅ 数据库自动同步已禁用（生产模式）");
}
```

---

### 3. 在启动脚本中添加检查

在 `app.js` 或 `server.js` 中：

```javascript
// 启动时检查主表是否存在
const { sequelize } = require("./models");
const { QueryTypes } = require("sequelize");

async function checkDatabaseHealth() {
  try {
    // 检查是否存在主表
    const mainTables = ["campus_resources", "market_products"];
    const existingMainTables = [];

    for (const table of mainTables) {
      const exists = await sequelize.query(`SHOW TABLES LIKE '${table}'`, {
        type: QueryTypes.SELECT,
      });
      if (exists.length > 0) {
        existingMainTables.push(table);
      }
    }

    if (existingMainTables.length > 0) {
      console.warn(
        `⚠️  警告：检测到主表存在: ${existingMainTables.join(", ")}`
      );
      console.warn("   建议检查并删除这些主表，以避免数据混乱");
    } else {
      console.log("✅ 数据库健康检查通过：主表已删除，使用分表架构");
    }
  } catch (error) {
    console.error("❌ 数据库健康检查失败:", error.message);
  }
}

// 在服务器启动后调用
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await checkDatabaseHealth();
});
```

---

## 📊 当前状态总结

| 检查项             | 状态      | 风险等级 | 说明                 |
| ------------------ | --------- | -------- | -------------------- |
| Sequelize 自动同步 | ✅ 已禁用 | 🟢 低    | 不会自动创建主表     |
| 迁移脚本备份逻辑   | ✅ 已删除 | 🟢 低    | 脚本已删除           |
| 模型定义           | ✅ 正常   | 🟢 低    | 只定义表名，不创建表 |
| 分表服务           | ✅ 正常   | 🟢 低    | 正确使用分表架构     |

---

## 🎯 完成的防护措施

### ✅ 已完成：删除迁移脚本

迁移脚本 `migrate_campus_market_data.js` 已完全删除

- ✅ 数据已于 2025-10-23 迁移完成
- ✅ 脚本已删除，彻底消除自动创建备份表的风险
- ✅ README 已更新，标记迁移状态

### 🔄 可选：添加启动健康检查

在 `app.js` 中添加数据库健康检查（见上文），可以在启动时自动检测主表是否存在

---

## 🔍 验证方法

### 1. 检查 Sequelize 同步状态

```bash
# 在代码中搜索 sequelize.sync
grep -r "sequelize.sync" 星火园帮后台管理系统/
```

**预期结果**：找不到或只有注释

### 2. 检查是否有新备份表

```sql
-- 在 MySQL 中执行
SELECT
    TABLE_NAME,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'campushelper'
  AND TABLE_NAME LIKE '%backup%'
ORDER BY CREATE_TIME DESC;
```

**预期结果**：只有旧的 6 个备份表，CREATE_TIME 不变

### 3. 监控服务器日志

重启服务器后，检查日志中是否有：

- ❌ "Creating table..." 或类似消息
- ✅ "数据库自动同步已禁用" 消息

---

## 📝 最佳实践

1. **生产环境**：

   - ✅ 禁用 `sequelize.sync()`
   - ✅ 使用迁移脚本管理数据库结构
   - ✅ 备份应通过 `mysqldump` 而非脚本内创建

2. **开发环境**：

   - ⚠️ 可以启用 `sync({ alter: true })`（通过环境变量控制）
   - ✅ 使用独立的开发数据库

3. **脚本执行**：
   - ✅ 一次性脚本应标记为 `.bak` 或移至归档
   - ✅ 可重复执行的脚本应使用幂等操作

---

**最后更新**：2025-10-23  
**维护者**：开发团队
