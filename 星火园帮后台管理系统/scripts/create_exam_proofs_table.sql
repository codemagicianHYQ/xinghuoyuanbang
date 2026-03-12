-- 创建考试资料凭证表
CREATE TABLE IF NOT EXISTS `exam_proofs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `proofImage` varchar(500) NOT NULL COMMENT '凭证图片URL',
  `remark` text COMMENT '用户备注',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态：pending-待审核，approved-已通过，rejected-已拒绝',
  `rewardAmount` decimal(10,2) DEFAULT NULL COMMENT '奖励金额',
  `submittedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `reviewedAt` datetime DEFAULT NULL COMMENT '审核时间',
  `reviewedBy` varchar(16) DEFAULT NULL COMMENT '审核人ID',
  `adminRemark` text COMMENT '管理员备注',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_submittedAt` (`submittedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试资料凭证表';
