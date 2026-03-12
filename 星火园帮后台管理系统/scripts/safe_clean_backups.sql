-- ========================================
-- 安全清理备份表（带数据检查）
-- ========================================

USE campushelper;

-- 1. 列出所有备份表及其数据量
SELECT '========================================' AS divider;
SELECT '📋 第一步：检查所有备份表' AS step;
SELECT '========================================' AS divider;

SELECT 
    TABLE_NAME AS '表名',
    TABLE_ROWS AS '行数',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '大小(MB)',
    CREATE_TIME AS '创建时间'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE '%backup%'
ORDER BY CREATE_TIME DESC;

-- 2. 删除空的或数据很少的备份表
SELECT '========================================' AS divider;
SELECT '🗑️ 第二步：删除备份表' AS step;
SELECT '========================================' AS divider;

-- 删除 campus_resources 备份表
DROP TABLE IF EXISTS campus_resources_backup_17611981656;
SELECT '✅ 已删除: campus_resources_backup_17611981656' AS status;

DROP TABLE IF EXISTS campus_resources_backup_17611981406;
SELECT '✅ 已删除: campus_resources_backup_17611981406' AS status;

DROP TABLE IF EXISTS campus_resources_backup_17611981084;
SELECT '✅ 已删除: campus_resources_backup_17611981084' AS status;

-- 删除 market_products 备份表
DROP TABLE IF EXISTS market_products_backup_176119816574;
SELECT '✅ 已删除: market_products_backup_176119816574' AS status;

DROP TABLE IF EXISTS market_products_backup_176119814066;
SELECT '✅ 已删除: market_products_backup_176119814066' AS status;

DROP TABLE IF EXISTS market_products_backup_176119810845;
SELECT '✅ 已删除: market_products_backup_176119810845' AS status;

-- 3. 验证清理结果
SELECT '========================================' AS divider;
SELECT '✔️ 第三步：验证清理结果' AS step;
SELECT '========================================' AS divider;

SELECT 
    COUNT(*) AS '剩余备份表数量'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE '%backup%';

-- 4. 显示当前所有表（按类型分组）
SELECT '========================================' AS divider;
SELECT '📊 第四步：当前数据库表总览' AS step;
SELECT '========================================' AS divider;

-- 分表统计
SELECT 
    '分表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND (
        TABLE_NAME LIKE 'tasks_community_%'
        OR TABLE_NAME LIKE 'campus_resources_community_%'
        OR TABLE_NAME LIKE 'market_products_community_%'
    )

UNION ALL

-- 主表统计
SELECT 
    '主表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME NOT LIKE '%_community_%'
    AND TABLE_NAME NOT LIKE '%backup%'

UNION ALL

-- 备份表统计
SELECT 
    '备份表' AS '类型',
    COUNT(*) AS '数量',
    SUM(TABLE_ROWS) AS '总行数',
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '总大小(MB)'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME LIKE '%backup%';

-- 5. 列出所有正式表（不含备份）
SELECT '========================================' AS divider;
SELECT '📋 第五步：所有正式表列表' AS step;
SELECT '========================================' AS divider;

SELECT 
    TABLE_NAME AS '表名',
    TABLE_ROWS AS '行数',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS '大小(MB)',
    ENGINE AS '引擎'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME NOT LIKE '%backup%'
ORDER BY 
    CASE 
        WHEN TABLE_NAME LIKE '%_community_%' THEN 2
        ELSE 1
    END,
    TABLE_NAME;

SELECT '========================================' AS divider;
SELECT '✅ 备份表清理完成！' AS status;
SELECT '========================================' AS divider;

