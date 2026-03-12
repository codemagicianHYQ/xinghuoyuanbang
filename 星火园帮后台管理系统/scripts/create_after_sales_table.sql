-- 创建售后申请表
CREATE TABLE IF NOT EXISTS after_sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskId INT NOT NULL COMMENT '关联的任务ID',
  userId VARCHAR(50) NOT NULL COMMENT '申请用户ID',
  issueType ENUM('quality', 'delay', 'communication', 'refund', 'other') NOT NULL COMMENT '问题类型',
  description TEXT NOT NULL COMMENT '问题描述',
  images JSON COMMENT '上传的图片URL数组',
  contactInfo VARCHAR(200) NOT NULL COMMENT '联系方式',
  status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
  adminResponse TEXT COMMENT '管理员回复',
  resolvedAt DATETIME COMMENT '解决时间',
  communityId INT COMMENT '所属社区ID',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_taskId (taskId),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_communityId (communityId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后申请表';
