-- 添加社区管理员相关字段
-- 执行时间: 2025-01-14

-- 添加管理员姓名字段
ALTER TABLE communities 
ADD COLUMN adminName VARCHAR(50) NULL COMMENT '管理员姓名';

-- 添加管理员电话字段
ALTER TABLE communities 
ADD COLUMN adminPhone VARCHAR(20) NULL COMMENT '管理员电话';

-- 添加管理员企业微信二维码字段
ALTER TABLE communities 
ADD COLUMN adminQRCode TEXT NULL COMMENT '管理员企业微信二维码URL';

-- 添加索引以提高查询性能
CREATE INDEX idx_communities_admin_name ON communities(adminName);
CREATE INDEX idx_communities_admin_phone ON communities(adminPhone);
