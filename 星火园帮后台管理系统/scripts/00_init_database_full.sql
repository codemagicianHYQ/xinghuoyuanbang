-- ============================================================
-- 星火园帮 - 数据库结构恢复脚本（从项目代码还原）
-- 使用场景：腾讯云数据库清空后，在新实例上重建库与表结构
-- 执行前请将下方 DATABASE_NAME 改为你的实际数据库名（与 config 里一致，如 users）
-- ============================================================

-- 可选：若需新建库，取消下面两行注释并修改数据库名
-- CREATE DATABASE IF NOT EXISTS users DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE users;

-- 若库已存在，直接使用（请改成你的数据库名）
USE users;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================== 1. 社区表（必须先建，分表依赖社区ID） =====================
CREATE TABLE IF NOT EXISTS `communities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '社区/学校名称',
  `type` enum('school','community') DEFAULT 'community' COMMENT '类型：school-学校(校园版), community-社区(小区版)',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(255) DEFAULT NULL COMMENT '详细地址',
  `latitude` decimal(10,8) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT '经度',
  `adminName` varchar(50) DEFAULT NULL COMMENT '管理员姓名',
  `adminPhone` varchar(20) DEFAULT NULL COMMENT '管理员电话',
  `adminQRCode` text COMMENT '管理员企业微信二维码URL',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区/学校表';

-- ===================== 2. 用户表 =====================
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(16) NOT NULL,
  `openid` varchar(255) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `role` enum('user','rider','admin','community_admin') NOT NULL DEFAULT 'user',
  `isVerified` tinyint(1) DEFAULT 0,
  `gender` int(11) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `riderApplicationStatus` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `riderRejectionReason` varchar(255) DEFAULT NULL,
  `sessionKey` varchar(128) DEFAULT NULL COMMENT '微信 session_key',
  `idCardImageUrl` varchar(255) DEFAULT NULL,
  `studentIdCardImageUrl` varchar(255) DEFAULT NULL,
  `walletBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalEarnings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalWithdrawn` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bankCardNumber` varchar(20) DEFAULT NULL COMMENT '银行卡号',
  `bankName` varchar(50) DEFAULT NULL COMMENT '银行名称',
  `realName` varchar(20) DEFAULT NULL COMMENT '真实姓名',
  `version` enum('community','campus') NOT NULL DEFAULT 'campus' COMMENT '版本',
  `communityAdminId` int(11) DEFAULT NULL COMMENT '用户作为社区管理员管理的社区ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_users_community_admin_id` (`communityAdminId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ===================== 3. 反馈表 =====================
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) DEFAULT NULL,
  `content` text NOT NULL COMMENT '反馈内容',
  `contact` varchar(100) DEFAULT NULL COMMENT '联系方式',
  `imageUrls` json DEFAULT NULL COMMENT '图片URL数组',
  `deviceInfo` json DEFAULT NULL COMMENT '设备信息',
  `status` enum('pending','processing','resolved','closed') DEFAULT 'pending' COMMENT '处理状态',
  `adminReply` text DEFAULT NULL COMMENT '管理员回复',
  `adminId` varchar(16) DEFAULT NULL COMMENT '处理反馈的管理员ID',
  `processedAt` datetime DEFAULT NULL COMMENT '处理时间',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `status` (`status`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反馈表';

-- ===================== 4. 提现表 =====================
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '申请提现的用户ID',
  `amount` decimal(10,2) NOT NULL COMMENT '提现金额（元）',
  `withdrawType` enum('wechat','bank') NOT NULL DEFAULT 'wechat' COMMENT '提现类型',
  `status` enum('pending','approved','rejected','completed','processing','failed') NOT NULL DEFAULT 'pending' COMMENT '提现状态',
  `applyTime` datetime NOT NULL COMMENT '申请时间',
  `processTime` datetime DEFAULT NULL COMMENT '处理时间',
  `completeTime` datetime DEFAULT NULL COMMENT '完成时间',
  `adminId` varchar(16) DEFAULT NULL COMMENT '处理提现的管理员ID',
  `rejectReason` varchar(255) DEFAULT NULL COMMENT '拒绝原因',
  `failReason` varchar(255) DEFAULT NULL COMMENT '失败原因',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `weekNumber` int(11) NOT NULL COMMENT '申请周数',
  `year` int(11) NOT NULL COMMENT '申请年份',
  `thirdPartyOrderId` varchar(255) DEFAULT NULL COMMENT '第三方订单号',
  `thirdPartyTicket` varchar(255) DEFAULT NULL COMMENT '第三方票据',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `adminId` (`adminId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提现表';

-- ===================== 5. 聊天表 =====================
CREATE TABLE IF NOT EXISTS `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `taskId` int(11) DEFAULT NULL,
  `campusResourceId` int(11) DEFAULT NULL,
  `senderId` varchar(16) NOT NULL,
  `receiverId` varchar(16) NOT NULL,
  `content` text NOT NULL,
  `messageType` varchar(255) DEFAULT 'text',
  `isRead` tinyint(1) DEFAULT 0,
  `isRecalled` tinyint(1) DEFAULT 0,
  `recalledAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `senderId` (`senderId`),
  KEY `receiverId` (`receiverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天记录表';

-- ===================== 6. 资料表 =====================
CREATE TABLE IF NOT EXISTS `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '资料标题',
  `course` varchar(50) NOT NULL COMMENT '课程名称',
  `teacher` varchar(30) DEFAULT NULL COMMENT '任课教师',
  `major` varchar(20) NOT NULL COMMENT '专业大类',
  `subMajor` varchar(30) NOT NULL COMMENT '专业小类',
  `year` varchar(30) DEFAULT NULL COMMENT '学年学期',
  `description` text DEFAULT NULL COMMENT '资料描述',
  `coverImage` varchar(500) DEFAULT NULL COMMENT '封面图片URL',
  `downloadUrl` varchar(500) NOT NULL COMMENT '下载链接',
  `extractCode` varchar(20) DEFAULT NULL COMMENT '提取码',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `downloads` int(11) DEFAULT 0 COMMENT '下载次数',
  `favorites` int(11) DEFAULT 0 COMMENT '收藏次数',
  `isTop` tinyint(1) DEFAULT 0 COMMENT '是否置顶',
  `isRecommended` tinyint(1) DEFAULT 0 COMMENT '是否推荐',
  `isNew` tinyint(1) DEFAULT 1 COMMENT '是否新资料',
  `status` enum('active','inactive','deleted') DEFAULT 'active' COMMENT '状态',
  `createdBy` varchar(16) DEFAULT NULL,
  `updatedBy` varchar(16) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `resources_major_sub_major` (`major`,`subMajor`),
  KEY `status` (`status`),
  KEY `isTop` (`isTop`),
  KEY `isRecommended` (`isRecommended`),
  KEY `downloads` (`downloads`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资料表';

-- ===================== 7. 图书表 =====================
CREATE TABLE IF NOT EXISTS `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '图书标题',
  `author` varchar(100) DEFAULT NULL COMMENT '作者',
  `publisher` varchar(100) DEFAULT NULL COMMENT '出版社',
  `publishDate` datetime DEFAULT NULL COMMENT '出版日期',
  `category` varchar(50) NOT NULL COMMENT '图书分类',
  `subCategory` varchar(50) NOT NULL COMMENT '子分类',
  `description` text DEFAULT NULL COMMENT '图书描述',
  `coverImage` varchar(500) DEFAULT NULL COMMENT '封面图片URL',
  `downloadUrl` varchar(500) DEFAULT NULL COMMENT '下载链接',
  `extractCode` varchar(20) DEFAULT NULL COMMENT '提取码',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `downloads` int(11) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `favorites` int(11) DEFAULT 0,
  `isTop` tinyint(1) DEFAULT 0,
  `isRecommended` tinyint(1) DEFAULT 0,
  `isElectronic` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否为电子书',
  `status` enum('active','inactive','deleted') DEFAULT 'active' COMMENT '状态',
  `uploadBy` varchar(16) DEFAULT NULL,
  `createdBy` varchar(16) DEFAULT NULL,
  `updatedBy` varchar(16) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `books_category_sub_category` (`category`,`subCategory`),
  KEY `status` (`status`),
  KEY `isTop` (`isTop`),
  KEY `isRecommended` (`isRecommended`),
  KEY `downloads` (`downloads`),
  KEY `views` (`views`),
  KEY `likes` (`likes`),
  KEY `createdAt` (`createdAt`),
  KEY `author` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书表';

-- ===================== 8. 评论表 =====================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campusResourceId` int(11) NOT NULL COMMENT '校园资源ID',
  `communityId` int(11) NOT NULL COMMENT '社区ID，用于确定分表',
  `userId` varchar(16) NOT NULL COMMENT '评论用户ID',
  `content` text NOT NULL COMMENT '评论内容',
  `parentId` int(11) DEFAULT NULL COMMENT '父评论ID',
  `isAnonymous` tinyint(1) DEFAULT 0 COMMENT '是否匿名',
  `status` enum('active','deleted') DEFAULT 'active' COMMENT '评论状态',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campusResourceId` (`campusResourceId`),
  KEY `communityId` (`communityId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ===================== 9. 关注表 =====================
CREATE TABLE IF NOT EXISTS `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `followerId` varchar(16) NOT NULL COMMENT '关注者ID',
  `followingId` varchar(16) NOT NULL COMMENT '被关注者ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`followerId`,`followingId`),
  KEY `idx_follower` (`followerId`),
  KEY `idx_following` (`followingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注关系表';

-- ===================== 10. 页面配置表 =====================
CREATE TABLE IF NOT EXISTS `page_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pageKey` varchar(255) NOT NULL,
  `configData` json NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pageKey` (`pageKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面配置表';

-- ===================== 11. 考试资料凭证表 =====================
CREATE TABLE IF NOT EXISTS `exam_proofs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `proofImage` varchar(500) NOT NULL COMMENT '凭证图片URL',
  `remark` text DEFAULT NULL COMMENT '用户备注',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `rewardAmount` decimal(10,2) DEFAULT NULL COMMENT '奖励金额',
  `submittedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `reviewedAt` datetime DEFAULT NULL COMMENT '审核时间',
  `reviewedBy` varchar(16) DEFAULT NULL COMMENT '审核人ID',
  `adminRemark` text DEFAULT NULL COMMENT '管理员备注',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_submittedAt` (`submittedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试资料凭证表';

-- ===================== 12. 售后申请表 =====================
CREATE TABLE IF NOT EXISTS `after_sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `taskId` int(11) NOT NULL COMMENT '关联的任务ID',
  `userId` varchar(50) NOT NULL COMMENT '申请用户ID',
  `issueType` enum('quality','delay','communication','refund','other') NOT NULL COMMENT '问题类型',
  `description` text NOT NULL COMMENT '问题描述',
  `images` json DEFAULT NULL COMMENT '上传的图片URL数组',
  `contactInfo` varchar(200) NOT NULL COMMENT '联系方式',
  `status` enum('pending','processing','resolved','rejected') DEFAULT 'pending' COMMENT '处理状态',
  `adminResponse` text DEFAULT NULL COMMENT '管理员回复',
  `resolvedAt` datetime DEFAULT NULL COMMENT '解决时间',
  `communityId` int(11) DEFAULT NULL COMMENT '所属社区ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_taskId` (`taskId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_communityId` (`communityId`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后申请表';

-- ===================== 13. 用户收益表 =====================
CREATE TABLE IF NOT EXISTS `user_earnings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `amount` decimal(10,2) NOT NULL COMMENT '收益金额',
  `type` varchar(50) NOT NULL COMMENT '收益类型',
  `description` text DEFAULT NULL COMMENT '收益描述',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_type` (`type`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收益记录表';

-- ===================== 14. 系统消息表 =====================
CREATE TABLE IF NOT EXISTS `system_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '接收消息的用户ID',
  `type` enum('rider_application_approved','rider_application_rejected','order_rejected','order_completed','order_cancelled','account_security','activity_notification','system_maintenance','other') NOT NULL COMMENT '系统消息类型',
  `title` varchar(200) NOT NULL COMMENT '消息标题',
  `content` text NOT NULL COMMENT '消息内容',
  `summary` varchar(500) DEFAULT NULL COMMENT '消息摘要',
  `isRead` tinyint(1) DEFAULT 0 COMMENT '是否已读',
  `relatedId` int(11) DEFAULT NULL COMMENT '相关ID',
  `relatedType` varchar(50) DEFAULT NULL COMMENT '相关类型',
  `extraData` json DEFAULT NULL COMMENT '额外数据',
  `scheduledAt` datetime DEFAULT NULL COMMENT '定时发送时间',
  `status` enum('draft','scheduled','active','sent','cancelled') NOT NULL DEFAULT 'active' COMMENT '消息状态',
  `sentAt` datetime DEFAULT NULL COMMENT '实际发送时间',
  `createdBy` varchar(50) DEFAULT NULL COMMENT '创建者ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `type` (`type`),
  KEY `isRead` (`isRead`),
  KEY `createdAt` (`createdAt`),
  KEY `userId_isRead` (`userId`,`isRead`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统消息表';

-- ===================== 15. 系统广播表 =====================
CREATE TABLE IF NOT EXISTS `system_broadcasts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('version_update','system_maintenance','security_alert','admin_announcement','activity_promotion','policy_update','other') NOT NULL COMMENT '广播消息类型',
  `title` varchar(200) NOT NULL COMMENT '消息标题',
  `content` text NOT NULL COMMENT '消息内容',
  `summary` varchar(500) DEFAULT NULL COMMENT '消息摘要',
  `targetScope` enum('all','campus','community','specific_users') NOT NULL DEFAULT 'all' COMMENT '目标范围',
  `targetUserIds` json DEFAULT NULL COMMENT '特定用户ID列表',
  `targetUsers` text DEFAULT NULL COMMENT '目标用户列表JSON',
  `scheduledAt` datetime DEFAULT NULL COMMENT '定时发送时间',
  `status` enum('draft','scheduled','active','sent','cancelled') NOT NULL DEFAULT 'active' COMMENT '消息状态',
  `sentAt` datetime DEFAULT NULL COMMENT '实际发送时间',
  `createdBy` varchar(50) DEFAULT NULL COMMENT '创建者ID',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal' COMMENT '消息优先级',
  `isActive` tinyint(1) DEFAULT 1 COMMENT '是否激活',
  `expiresAt` datetime DEFAULT NULL COMMENT '过期时间',
  `extraData` json DEFAULT NULL COMMENT '额外数据',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `targetScope` (`targetScope`),
  KEY `priority` (`priority`),
  KEY `isActive` (`isActive`),
  KEY `expiresAt` (`expiresAt`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统广播表';

-- ===================== 16. 用户广播阅读记录表 =====================
CREATE TABLE IF NOT EXISTS `user_broadcast_reads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `broadcastId` int(11) NOT NULL COMMENT '广播消息ID',
  `isRead` tinyint(1) DEFAULT 0 COMMENT '是否已读',
  `readAt` datetime DEFAULT NULL COMMENT '阅读时间',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId_broadcastId` (`userId`,`broadcastId`),
  KEY `userId` (`userId`),
  KEY `broadcastId` (`broadcastId`),
  KEY `isRead` (`isRead`),
  KEY `userId_isRead` (`userId`,`isRead`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户广播阅读记录表';

-- ===================== 17. 派单团队表 =====================
CREATE TABLE IF NOT EXISTS `dispatchTeams` (
  `id` varchar(16) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT '团队名称',
  `description` text DEFAULT NULL COMMENT '团队描述',
  `avatar` varchar(255) DEFAULT NULL COMMENT '团队头像URL',
  `type` enum('campus','community','custom') NOT NULL DEFAULT 'campus' COMMENT '团队类型',
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active' COMMENT '团队状态',
  `dispatchRules` json DEFAULT NULL COMMENT '派单规则配置',
  `workingHours` json DEFAULT NULL COMMENT '工作时间配置',
  `serviceAreas` json DEFAULT NULL COMMENT '服务区域配置',
  `maxMembers` int(11) NOT NULL DEFAULT 50 COMMENT '最大成员数',
  `currentMembers` int(11) NOT NULL DEFAULT 0 COMMENT '当前成员数',
  `createdBy` varchar(16) NOT NULL COMMENT '创建者ID',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `createdBy` (`createdBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='派单团队表';

-- ===================== 18. 团队申请表 =====================
CREATE TABLE IF NOT EXISTS `teamApplications` (
  `id` varchar(16) NOT NULL,
  `userId` varchar(16) NOT NULL COMMENT '申请人ID',
  `teamId` varchar(16) NOT NULL COMMENT '申请的团队ID',
  `reason` text DEFAULT NULL COMMENT '申请理由',
  `availableTime` text DEFAULT NULL COMMENT '可接单时间',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '申请状态',
  `reviewNote` text DEFAULT NULL COMMENT '审核备注',
  `reviewedBy` varchar(16) DEFAULT NULL COMMENT '审核人ID',
  `reviewedAt` datetime DEFAULT NULL COMMENT '审核时间',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `teamId` (`teamId`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队申请表';

-- ===================== 19. 团队成员表 =====================
CREATE TABLE IF NOT EXISTS `teamMembers` (
  `id` varchar(16) NOT NULL,
  `teamId` varchar(16) NOT NULL COMMENT '团队ID',
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `role` enum('member','leader','admin') NOT NULL DEFAULT 'member' COMMENT '在团队中的角色',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active' COMMENT '成员状态',
  `joinedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `workingSchedule` json DEFAULT NULL COMMENT '个人工作时间安排',
  `serviceAreas` json DEFAULT NULL COMMENT '个人服务区域',
  `performance` json DEFAULT NULL COMMENT '绩效数据',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `teamId` (`teamId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表';

-- ===================== 20. 用户地址表 =====================
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(16) NOT NULL COMMENT '用户ID',
  `name` varchar(20) DEFAULT NULL COMMENT '地址标签',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `phone` varchar(20) DEFAULT NULL COMMENT '收件人手机号',
  `isDefault` tinyint(1) DEFAULT 0 COMMENT '是否默认地址',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 说明：任务、校园互动、二手市集 已采用分表架构，无主表。
-- 分表（tasks_community_*、campus_resources_community_*、market_products_community_*）
-- 会在「后台添加新社区」时由 AutoShardingService 自动创建。
-- 请先在后台创建至少一个社区，或运行 01_create_shard_templates.sql 为指定社区创建分表（见下方说明）。
-- ============================================================
