-- ============================================================
-- 创建首个社区及其分表（任务/校园互动/二手市集）
-- 执行顺序：在 00_init_database_full.sql 之后执行
-- 使用同一数据库：USE xxx; 与 00 中一致
-- ============================================================

USE users;

-- 插入一个默认社区（若已有社区可跳过或修改 id/name）
INSERT IGNORE INTO `communities` (`id`, `name`, `type`, `createdAt`, `updatedAt`)
VALUES (1, '默认社区', 'community', NOW(), NOW());

-- ===================== 任务分表（含 confirmImages、paymentStatus 含 refunded） =====================
CREATE TABLE IF NOT EXISTS `tasks_community_1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `specifics` text DEFAULT NULL,
  `taskType` varchar(50) NOT NULL,
  `rewardAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `budget` decimal(10,2) DEFAULT NULL,
  `locationText` varchar(255) DEFAULT NULL,
  `status` enum('open','assigned','acceptor_done','publisher_confirmed','completed','cancelled') DEFAULT 'open',
  `publisherId` varchar(16) NOT NULL,
  `acceptorId` varchar(16) DEFAULT NULL,
  `acceptedAt` datetime DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `out_trade_no` varchar(64) DEFAULT NULL,
  `acceptorDoneTime` datetime DEFAULT NULL,
  `publisherConfirmedTime` datetime DEFAULT NULL,
  `autoConfirmTime` datetime DEFAULT NULL,
  `autoCancelTime` datetime DEFAULT NULL,
  `timeRequirement` varchar(50) DEFAULT NULL,
  `paymentStatus` enum('pending','paid','transferred','refunded') DEFAULT 'pending',
  `platformFee` decimal(10,2) DEFAULT NULL,
  `acceptorFee` decimal(10,2) DEFAULT NULL,
  `transferTime` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `requiredGender` int(11) DEFAULT 0,
  `version` enum('community','campus') DEFAULT 'campus',
  `communityId` int(11) NOT NULL,
  `borrowMode` enum('lend','borrow') DEFAULT NULL,
  `autoOfflineDate` datetime DEFAULT NULL,
  `images` json DEFAULT NULL,
  `confirmImages` json DEFAULT NULL COMMENT '订单确认图片数组',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_communityId` (`communityId`),
  KEY `idx_status` (`status`),
  KEY `idx_publisherId` (`publisherId`),
  KEY `idx_acceptorId` (`acceptorId`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_taskType` (`taskType`),
  KEY `idx_paymentStatus` (`paymentStatus`),
  KEY `idx_deadline` (`deadline`),
  KEY `idx_autoCancelTime` (`autoCancelTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务分表-社区1';

-- ===================== 校园互动分表 =====================
CREATE TABLE IF NOT EXISTS `campus_resources_community_1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('ask','lost','salvage','complaint','share','partner') NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `contactInfo` varchar(100) DEFAULT NULL,
  `images` json DEFAULT NULL,
  `itemType` varchar(50) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `questionType` varchar(50) DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `complaintType` varchar(50) DEFAULT NULL,
  `isAnonymous` tinyint(1) DEFAULT 0,
  `shareType` varchar(50) DEFAULT NULL,
  `activityType` varchar(50) DEFAULT NULL,
  `activityDate` datetime DEFAULT NULL,
  `activityTime` varchar(20) DEFAULT NULL,
  `maxParticipants` int(11) DEFAULT NULL,
  `status` enum('active','completed','deleted') DEFAULT 'active',
  `viewCount` int(11) DEFAULT 0,
  `likeCount` int(11) DEFAULT 0,
  `commentCount` int(11) DEFAULT 0,
  `createdBy` varchar(16) NOT NULL,
  `updatedBy` varchar(16) DEFAULT NULL,
  `communityId` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_communityId` (`communityId`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_createdBy` (`createdBy`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_type_status` (`type`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校园互动分表-社区1';

-- ===================== 二手市集分表 =====================
CREATE TABLE IF NOT EXISTS `market_products_community_1` (
  `id` varchar(16) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `category` enum('books','electronics','clothes','beauty','sports','home','food','stationery','others') NOT NULL,
  `condition` enum('new','excellent','good','used') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `isNegotiable` tinyint(1) DEFAULT 0,
  `images` json NOT NULL,
  `tradeMethods` json NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `deliveryFee` decimal(10,2) DEFAULT NULL,
  `wechatId` varchar(50) DEFAULT NULL,
  `contactNote` varchar(200) DEFAULT NULL,
  `sellerId` varchar(16) NOT NULL,
  `status` enum('active','sold','cancelled','draft','pending','completed','refunded') DEFAULT 'active',
  `viewCount` int(11) DEFAULT 0,
  `favoriteCount` int(11) DEFAULT 0,
  `buyerId` varchar(16) DEFAULT NULL,
  `soldAt` datetime DEFAULT NULL,
  `out_trade_no` varchar(64) DEFAULT NULL,
  `finalPrice` decimal(10,2) DEFAULT NULL,
  `serviceFee` decimal(10,2) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `sellerIncome` decimal(10,2) DEFAULT NULL,
  `isNegotiated` tinyint(1) DEFAULT 0,
  `communityId` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_communityId` (`communityId`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_sellerId` (`sellerId`),
  KEY `idx_buyerId` (`buyerId`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_price` (`price`),
  KEY `idx_category_status` (`category`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='二手市集分表-社区1';

-- 可选：创建跨社区查询视图（仅当存在多个社区分表时有用，单社区可忽略）
-- 多社区时由后台服务 AutoShardingService 自动维护视图，此处不重复创建。

SELECT '✅ 首个社区及分表创建完成。后续新增社区请通过后台添加，系统会自动创建对应分表。' AS message;
