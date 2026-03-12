# 数据库脚本说明

## 📁 当前脚本列表

### 🔧 维护脚本

| 脚本名称                          | 说明                         | 状态        |
| --------------------------------- | ---------------------------- | ----------- |
| `drop_main_tables.sql`            | 删除主表（迁移后）           | ✅ 活跃     |
| `check_remaining_references.sql`  | 检查是否还有对主表的引用     | ✅ 活跃     |
| `safe_clean_backups.sql`          | 安全清理所有备份表           | ✅ 活跃     |
| `prevent_auto_create_tables.md`   | 防止自动创建表的完整文档     | 📖 文档     |
| `fix_comments_foreign_key_v2.sql` | 修复评论表外键约束（已完成） | ✅ 保留参考 |

### 🗄️ 数据迁移脚本

~~已删除所有一次性迁移脚本~~

- ✅ 校园互动和二手市集数据已于 2025-10-23 迁移完成
- ✅ 迁移脚本已删除，防止误执行
- ℹ️ 所有数据已迁移至对应社区的分表中

### 🏗️ 数据库结构脚本

| 脚本名称                            | 说明               | 状态        |
| ----------------------------------- | ------------------ | ----------- |
| `add_community_admin_fields.sql`    | 添加社区管理员字段 | ✅ 保留参考 |
| `add_confirm_images_field.sql`      | 添加确认图片字段   | ✅ 保留参考 |
| `create_after_sales_table.sql`      | 创建售后表         | ✅ 保留参考 |
| `fix_after_sales_status.sql`        | 修复售后状态       | ✅ 保留参考 |
| `fix_sharded_tables_timestamps.sql` | 修复分表时间戳     | ✅ 保留参考 |
| `fix_timestamps_simple.sql`         | 简单修复时间戳     | ✅ 保留参考 |

### 🔒 安全优化脚本

| 脚本名称                            | 说明              | 状态        |
| ----------------------------------- | ----------------- | ----------- |
| `fix_sql_injection.sql`             | 修复 SQL 注入问题 | ✅ 保留参考 |
| `optimize_database_performance.sql` | 优化数据库性能    | ✅ 保留参考 |

## 🗑️ 已删除的脚本

以下脚本因为问题已解决或功能重复而被删除：

- ❌ `fix_comments_foreign_key.sql` - 旧版本（已有 v2 版本）
- ❌ `diagnose_and_fix_comments.sql` - 诊断脚本（问题已解决）
- ❌ `force_fix_comments_fk.sql` - 强制修复脚本（问题已解决）
- ❌ `simple_fix_comments.sql` - 简单修复脚本（问题已解决）
- ❌ `quick_fix.sql` - 快速修复脚本（问题已解决）
- ❌ `check_all_tables.sql` - 旧检查脚本（已有新版本）
- ❌ `如何删除外键.md` - 操作指南（问题已解决）
- ❌ `README_COMMENTS_FIX.md` - 修复说明（问题已解决）

## 📋 使用说明

### 检查数据库引用

如果需要检查是否还有对主表的引用，执行：

```bash
mysql -u root -p campushelper < check_remaining_references.sql
```

或在 MySQL Workbench 中打开并执行。

### 清理备份表

如果需要清理所有备份表，执行：

```bash
mysql -u root -p campushelper < safe_clean_backups.sql
```

**该脚本会**：

1. 列出所有备份表及其数据量
2. 删除所有 `*_backup_*` 表
3. 验证清理结果
4. 显示当前数据库表统计

### 查看执行结果

**检查引用脚本**会输出以下信息：

1. 所有外键约束
2. comments 表的外键
3. 视图引用
4. 触发器引用
5. 存储过程引用
6. 主表是否存在
7. 所有分表列表

如果前 5 项都返回 0 行，说明没有对主表的引用了。

**清理备份脚本**会输出以下信息：

1. 备份表列表及大小
2. 删除进度
3. 剩余备份表数量（应为 0）
4. 数据库表统计（分表、主表）
5. 所有正式表列表

## 🎯 数据库当前状态

### 分表结构

#### 任务分表

- `tasks_community_1`
- `tasks_community_12`
- `tasks_community_13`
- `tasks_community_15`
- `tasks_community_17`

#### 校园互动分表

- `campus_resources_community_1`
- `campus_resources_community_12`
- `campus_resources_community_13`
- `campus_resources_community_15`
- `campus_resources_community_17`

#### 二手市集分表

- `market_products_community_1`
- `market_products_community_12`
- `market_products_community_13`
- `market_products_community_15`
- `market_products_community_17`

### 主表状态

以下主表**已删除**或**应该删除**：

- ❌ `campus_resources` - 校园互动主表（已删除）
- ❌ `market_products` - 二手市集主表（已删除）
- ❌ `tasks` - 任务主表（应该删除）

### 评论表

`comments` 表已完成修改：

- ✅ 删除了对主表的外键约束
- ✅ 添加了 `communityId` 字段
- ✅ 创建了必要的索引

## ⚠️ 注意事项

1. **备份数据库**：执行任何脚本前请先备份
2. **测试环境**：建议先在测试环境执行
3. **检查依赖**：确认没有其他应用依赖主表
4. **更新代码**：删除主表后需要更新应用代码

## 📝 维护日志

| 日期       | 操作                                | 说明                                       |
| ---------- | ----------------------------------- | ------------------------------------------ |
| 2025-10-23 | 修复 server.js 自动同步问题         | 禁用 db.sequelize.sync()，彻底解决主表重建 |
| 2025-10-23 | 删除迁移脚本                        | 数据已迁移完成，防止误执行                 |
| 2025-10-23 | 创建 prevent_auto_create_tables.md  | 防止自动创建备份表和主表的文档             |
| 2025-10-23 | 创建 safe_clean_backups.sql         | 用于安全清理所有备份表                     |
| 2025-10-23 | 删除外键修复相关脚本                | 评论表外键问题已解决                       |
| 2025-10-23 | 创建 check_remaining_references.sql | 用于检查主表引用                           |
| 2025-10-23 | 清理旧脚本                          | 删除 8 个已完成或重复的脚本                |

---

**最后更新**：2025-10-23  
**维护者**：开发团队
