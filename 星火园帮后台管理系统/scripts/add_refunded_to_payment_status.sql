-- 为所有 tasks_community_* 表的 paymentStatus 字段添加 'refunded' 选项
-- 此脚本会更新所有现有任务分表的 paymentStatus ENUM 定义

-- 获取所有 tasks_community_* 表名，并生成 ALTER TABLE 语句
-- 注意：需要手动执行，或者通过脚本动态生成

-- 示例：为 tasks_community_22 表添加 'refunded'
-- ALTER TABLE tasks_community_22 MODIFY COLUMN paymentStatus ENUM('pending','paid','transferred','refunded') DEFAULT 'pending';

-- 动态生成所有表的更新语句：
-- SELECT CONCAT('ALTER TABLE ', TABLE_NAME, ' MODIFY COLUMN paymentStatus ENUM(''pending'',''paid'',''transferred'',''refunded'') DEFAULT ''pending'';') AS sql_statement
-- FROM INFORMATION_SCHEMA.TABLES
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME LIKE 'tasks_community_%';

-- 手动为每个表执行 ALTER TABLE 语句
-- 如果有多个表，需要为每个表执行一次

-- 示例（替换 TABLE_NAME 为实际的表名）：
-- ALTER TABLE tasks_community_1 MODIFY COLUMN paymentStatus ENUM('pending','paid','transferred','refunded') DEFAULT 'pending';
-- ALTER TABLE tasks_community_2 MODIFY COLUMN paymentStatus ENUM('pending','paid','transferred','refunded') DEFAULT 'pending';
-- ... 以此类推
