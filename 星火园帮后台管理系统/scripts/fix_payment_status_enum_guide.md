# 修复 paymentStatus 字段 ENUM 定义

## 问题描述

在作业辅助任务取消订单时出现错误：

```
Data truncated for column 'paymentStatus' at row 1
```

## 问题原因

`paymentStatus` 字段的 ENUM 定义中缺少 `'refunded'` 状态，导致退款时无法设置该值。

## 修复方案

1. 更新模型定义（已完成）
2. 执行数据库修复脚本

## 执行步骤

### 方法一：使用简化的 SQL 脚本（推荐）

```bash
# 连接到数据库
mysql -h sh-cynosdbmysql-grp-0kyzoabc.sql.tencentcdb.com -P 24489 -u root -p

# 在 MySQL 中执行
source /path/to/星火园帮后台管理系统/scripts/fix_payment_status_enum_simple.sql
```

### 方法二：使用 Node.js 脚本

```bash
cd 星火园帮后台管理系统
node scripts/fix_payment_status_enum.js
```

### 方法三：手动执行 SQL

```bash
mysql -h sh-cynosdbmysql-grp-0kyzoabc.sql.tencentcdb.com -P 24489 -u root -p users < scripts/fix_payment_status_enum_simple.sql
```

## 数据库连接信息

- 主机: sh-cynosdbmysql-grp-0kyzoabc.sql.tencentcdb.com
- 端口: 24489
- 用户: root
- 数据库: users

## 修复内容

- 主表 `tasks` 的 `paymentStatus` 字段
- 所有社区分表 `tasks_community_*` 的 `paymentStatus` 字段
- 添加 `'refunded'` 到 ENUM 定义中

## 验证修复

执行完成后，可以通过以下 SQL 验证：

```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'users'
    AND COLUMN_NAME = 'paymentStatus'
    AND TABLE_NAME LIKE 'tasks%'
ORDER BY TABLE_NAME;
```

## 注意事项

- 执行前请备份数据库
- 建议在维护时间窗口执行
- 修复完成后需要重启应用服务
- 如果 Node.js 脚本连接失败，请使用 SQL 脚本方式
