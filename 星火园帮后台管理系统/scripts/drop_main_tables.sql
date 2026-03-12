-- ========================================
-- 删除主表（已迁移至分表架构）
-- ========================================

USE campushelper;

-- 显示即将删除的主表
SELECT '=== 即将删除以下主表 ===' AS step;

SELECT 
    TABLE_NAME AS '表名',
    TABLE_ROWS AS '行数',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '大小(MB)',
    CREATE_TIME AS '创建时间'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME IN ('campus_resources', 'market_products', 'tasks');

-- 警告提示
SELECT '========================================' AS divider;
SELECT '⚠️  警告：即将删除主表！' AS warning;
SELECT '⚠️  请确认数据已完全迁移至分表！' AS warning;
SELECT '⚠️  建议先备份数据库！' AS warning;
SELECT '========================================' AS divider;

-- 删除主表
DROP TABLE IF EXISTS campus_resources;
SELECT '✅ 已删除: campus_resources' AS status;

DROP TABLE IF EXISTS market_products;
SELECT '✅ 已删除: market_products' AS status;

DROP TABLE IF EXISTS tasks;
SELECT '✅ 已删除: tasks' AS status;

-- 验证删除结果
SELECT '========================================' AS divider;
SELECT '=== 验证删除结果 ===' AS step;
SELECT '========================================' AS divider;

SELECT 
    COUNT(*) AS '剩余主表数量'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME IN ('campus_resources', 'market_products', 'tasks');

-- 显示分表列表
SELECT '========================================' AS divider;
SELECT '=== 当前分表列表 ===' AS step;
SELECT '========================================' AS divider;

SELECT 
    CASE
        WHEN TABLE_NAME LIKE 'tasks_community_%' THEN '任务分表'
        WHEN TABLE_NAME LIKE 'campus_resources_community_%' THEN '校园互动分表'
        WHEN TABLE_NAME LIKE 'market_products_community_%' THEN '二手市集分表'
    END AS '类型',
    TABLE_NAME AS '表名',
    TABLE_ROWS AS '行数',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND (
        TABLE_NAME LIKE 'tasks_community_%'
        OR TABLE_NAME LIKE 'campus_resources_community_%'
        OR TABLE_NAME LIKE 'market_products_community_%'
    )
ORDER BY 
    CASE
        WHEN TABLE_NAME LIKE 'tasks_community_%' THEN 1
        WHEN TABLE_NAME LIKE 'campus_resources_community_%' THEN 2
        WHEN TABLE_NAME LIKE 'market_products_community_%' THEN 3
    END,
    TABLE_NAME;

-- 统计分表数量
SELECT '========================================' AS divider;
SELECT '=== 分表统计 ===' AS step;
SELECT '========================================' AS divider;

SELECT 
    '任务分表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE 'tasks_community_%'

UNION ALL

SELECT 
    '校园互动分表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE 'campus_resources_community_%'

UNION ALL

SELECT 
    '二手市集分表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE 'market_products_community_%';

SELECT '========================================' AS divider;
SELECT '✅ 主表删除完成！系统已完全使用分表架构' AS status;
SELECT '========================================' AS divider;

