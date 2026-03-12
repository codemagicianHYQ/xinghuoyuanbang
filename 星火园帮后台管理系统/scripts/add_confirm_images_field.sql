-- 为所有社区分表添加 confirmImages 字段
-- 用于存储订单确认图片

-- 获取所有社区分表并添加字段
SET @sql = (
  SELECT GROUP_CONCAT(
    CONCAT('ALTER TABLE tasks_community_', id, ' ADD COLUMN confirmImages JSON DEFAULT NULL COMMENT "订单确认图片数组";')
    SEPARATOR '; '
  )
  FROM communities
);

-- 执行动态SQL
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证字段是否添加成功
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND COLUMN_NAME = 'confirmImages'
  AND TABLE_NAME LIKE 'tasks_community_%'
ORDER BY TABLE_NAME;
