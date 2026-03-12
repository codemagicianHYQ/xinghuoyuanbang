-- 更新 users 表的 role ENUM，添加 community_admin
-- 执行时间: 2025-12-16

USE users;

-- 注意：MySQL 不支持直接修改 ENUM，需要先修改为 VARCHAR，再改回 ENUM
-- 或者先删除 ENUM，再重新创建

-- 方法1：如果表中数据不多，可以先备份，然后修改表结构
-- 这里提供一个安全的迁移方法

-- 步骤1：添加临时列
ALTER TABLE users ADD COLUMN role_temp VARCHAR(50) NULL;

-- 步骤2：复制数据（添加 WHERE 条件以绕过安全更新模式）
UPDATE users SET role_temp = role WHERE id IS NOT NULL;

-- 步骤3：删除原列
ALTER TABLE users DROP COLUMN role;

-- 步骤4：重新创建 ENUM 列（包含 community_admin）
ALTER TABLE users ADD COLUMN role ENUM('user', 'rider', 'admin', 'community_admin') NOT NULL DEFAULT 'user';

-- 步骤5：复制回数据（使用主键 id 来满足安全更新模式的要求）
UPDATE users SET role = role_temp 
WHERE id IS NOT NULL 
AND role_temp IN ('user', 'rider', 'admin', 'community_admin');

-- 步骤6：删除临时列
ALTER TABLE users DROP COLUMN role_temp;

