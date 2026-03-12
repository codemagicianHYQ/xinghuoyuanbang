-- 创建用户收益表
CREATE TABLE IF NOT EXISTS user_earnings (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId varchar(16) NOT NULL COMMENT '用户ID',
  amount decimal(10,2) NOT NULL COMMENT '收益金额',
  type varchar(50) NOT NULL COMMENT '收益类型：exam_reward-考试资料奖励，task_reward-任务奖励等',
  description text COMMENT '收益描述',
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_userId (userId),
  KEY idx_type (type),
  KEY idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收益记录表';
