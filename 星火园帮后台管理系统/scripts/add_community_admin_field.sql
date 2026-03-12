-- 添加社区管理员字段
-- 执行时间: 2025-12-16

USE users;

-- 在 users 表中添加 communityAdminId 字段（用户作为社区管理员管理的社区ID）
ALTER TABLE users 
ADD COLUMN communityAdminId INT NULL COMMENT '用户作为社区管理员管理的社区ID';

-- 添加索引以提高查询性能
CREATE INDEX idx_users_community_admin_id ON users(communityAdminId);

-- 注意：这里不添加外键约束，因为社区表可能在不同的数据库中

