-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountabilityPartnership` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'ENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,

    INDEX `AccountabilityPartnership_partnerId_status_idx`(`partnerId`, `status`),
    INDEX `AccountabilityPartnership_requesterId_status_idx`(`requesterId`, `status`),
    INDEX `AccountabilityPartnership_partnerId_idx`(`partnerId`),
    INDEX `AccountabilityPartnership_requesterId_idx`(`requesterId`),
    UNIQUE INDEX `AccountabilityPartnership_requesterId_partnerId_key`(`requesterId`, `partnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('PLAN_APPROVED', 'PLAN_REJECTED', 'PLAN_DELETED', 'USER_ROLE_CHANGED', 'USER_DELETED', 'COMMENT_DELETED', 'SETTINGS_UPDATED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED', 'TAG_CREATED', 'TAG_DELETED', 'EMAIL_SENT', 'BACKUP_CREATED', 'CACHE_CLEARED', 'RECIPE_APPROVED', 'RECIPE_REJECTED', 'RECIPE_DELETED', 'GROUP_APPROVED', 'GROUP_REJECTED', 'GROUP_DELETED', 'CHALLENGE_CREATED', 'CHALLENGE_DELETED') NOT NULL,
    `targetId` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `ActivityLog_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `ActivityLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Backup` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Backup_createdAt_idx`(`createdAt`),
    INDEX `Backup_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Badge` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('FIRST_PLAN', 'LIKES_10', 'LIKES_50', 'LIKES_100', 'VIEWS_100', 'VIEWS_500', 'VIEWS_1000', 'COMMENTS_10', 'COMMENTS_50', 'ACTIVE_7_DAYS', 'ACTIVE_30_DAYS', 'ACTIVE_100_DAYS', 'PLANS_5', 'PLANS_10', 'PLANS_25', 'EARLY_ADOPTER', 'COMMUNITY_HELPER', 'WEIGHT_LOSS_HERO', 'FIRST_PARTNER', 'SUPPORTIVE_PARTNER', 'GOAL_ACHIEVER', 'LONG_TERM_PARTNER', 'MOTIVATOR', 'PROFILE_COMPLETE', 'FIRST_RECIPE', 'RECIPES_5', 'RECIPES_10', 'RECIPES_25', 'RECIPE_LIKES_10', 'RECIPE_LIKES_50', 'RECIPE_LIKES_100', 'RECIPE_MASTER', 'RECIPE_VIEWS_100', 'RECIPE_VIEWS_500', 'RECIPE_COMMENTS_10', 'RECIPE_COMMENTS_25', 'GROUP_CREATOR', 'GROUP_ADMIN', 'CHALLENGE_WINNER', 'CHALLENGE_PARTICIPANT', 'SOCIAL_BUTTERFLY', 'CHEAT_FREE_7_DAYS', 'CHEAT_FREE_30_DAYS', 'FAST_FOOD_FREE_30_DAYS', 'BALANCED_RECOVERY', 'NEWSLETTER_SUBSCRIBER', 'QUEST_MASTER_10', 'QUEST_MASTER_50', 'QUEST_MASTER_100', 'COIN_COLLECTOR_1000', 'COIN_COLLECTOR_5000', 'COIN_COLLECTOR_10000', 'GAME_CALORIE_MASTER', 'GAME_MEMORY_MASTER', 'GAME_QUICK_CLICK_MASTER', 'SHOP_FIRST_PURCHASE', 'SHOP_ENTHUSIAST_10') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `xpReward` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Badge_type_key`(`type`),
    INDEX `Badge_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BannedWord` (
    `id` VARCHAR(191) NOT NULL,
    `word` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BannedWord_word_key`(`word`),
    INDEX `BannedWord_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#10b981',
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogCategory_name_key`(`name`),
    UNIQUE INDEX `BlogCategory_slug_key`(`slug`),
    INDEX `BlogCategory_order_idx`(`order`),
    INDEX `BlogCategory_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogComment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BlogComment_authorId_idx`(`authorId`),
    INDEX `BlogComment_postId_isApproved_createdAt_idx`(`postId`, `isApproved`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `featuredImage` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT',
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `metaKeywords` VARCHAR(191) NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `readTime` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `featuredImageAlt` VARCHAR(191) NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_authorId_idx`(`authorId`),
    INDEX `BlogPost_categoryId_status_idx`(`categoryId`, `status`),
    INDEX `BlogPost_slug_idx`(`slug`),
    INDEX `BlogPost_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostTag` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `BlogPostTag_postId_idx`(`postId`),
    INDEX `BlogPostTag_tagId_idx`(`tagId`),
    UNIQUE INDEX `BlogPostTag_postId_tagId_key`(`postId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogReaction` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlogReaction_postId_idx`(`postId`),
    INDEX `BlogReaction_userId_idx`(`userId`),
    UNIQUE INDEX `BlogReaction_postId_userId_emoji_key`(`postId`, `userId`, `emoji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogTag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BlogTag_name_key`(`name`),
    UNIQUE INDEX `BlogTag_slug_key`(`slug`),
    INDEX `BlogTag_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalorieGoal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dailyCalories` INTEGER NOT NULL,
    `dailyProtein` INTEGER NULL,
    `dailyCarbs` INTEGER NULL,
    `dailyFat` INTEGER NULL,
    `activityLevel` VARCHAR(191) NOT NULL DEFAULT 'sedentary',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CalorieGoal_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#4caf50',
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Challenge` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` ENUM('WEIGHT_LOSS', 'ACTIVITY', 'STREAK', 'CHECK_IN', 'RECIPE_SHARE', 'PLAN_SHARE') NOT NULL,
    `target` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Challenge_createdBy_idx`(`createdBy`),
    INDEX `Challenge_groupId_isActive_idx`(`groupId`, `isActive`),
    INDEX `Challenge_isActive_startDate_idx`(`isActive`, `startDate`),
    INDEX `Challenge_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `Challenge_type_isActive_idx`(`type`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChallengeLeaderboard` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `rank` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChallengeLeaderboard_challengeId_rank_idx`(`challengeId`, `rank`),
    INDEX `ChallengeLeaderboard_userId_idx`(`userId`),
    UNIQUE INDEX `ChallengeLeaderboard_challengeId_userId_key`(`challengeId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChallengeParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `challengeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChallengeParticipant_challengeId_completed_idx`(`challengeId`, `completed`),
    INDEX `ChallengeParticipant_userId_idx`(`userId`),
    UNIQUE INDEX `ChallengeParticipant_challengeId_userId_key`(`challengeId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheatChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `weekEnd` DATETIME(3) NOT NULL,
    `limit` INTEGER NOT NULL DEFAULT 2,
    `penalty` VARCHAR(191) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CheatChallenge_userId_weekStart_idx`(`userId`, `weekStart`),
    UNIQUE INDEX `CheatChallenge_userId_weekStart_key`(`userId`, `weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheatMeal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SWEET', 'FAST_FOOD', 'SODA', 'ALCOHOL', 'OTHER') NOT NULL,
    `note` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CheatMeal_type_idx`(`type`),
    INDEX `CheatMeal_userId_date_idx`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckIn` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NULL,
    `energy` INTEGER NULL,
    `motivation` INTEGER NULL,
    `sleep` INTEGER NULL,
    `water` INTEGER NULL,
    `exercise` BOOLEAN NOT NULL DEFAULT false,
    `dietPlan` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CheckIn_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `type` ENUM('EARN', 'SPEND', 'BONUS', 'REFUND', 'EARNED', 'SPENT') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CoinTransaction_type_idx`(`type`),
    INDEX `CoinTransaction_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collection` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Collection_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CollectionPlan_collectionId_order_idx`(`collectionId`, `order`),
    UNIQUE INDEX `CollectionPlan_collectionId_planId_key`(`collectionId`, `planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isSpam` BOOLEAN NOT NULL DEFAULT false,
    `moderatedAt` DATETIME(3) NULL,
    `moderatedBy` VARCHAR(191) NULL,
    `moderationNote` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_moderatedBy_idx`(`moderatedBy`),
    INDEX `Comment_planId_createdAt_idx`(`planId`, `createdAt`),
    INDEX `Comment_status_idx`(`status`),
    INDEX `Comment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentReaction` (
    `id` VARCHAR(191) NOT NULL,
    `commentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CommentReaction_commentId_idx`(`commentId`),
    INDEX `CommentReaction_userId_idx`(`userId`),
    UNIQUE INDEX `CommentReaction_commentId_userId_emoji_key`(`commentId`, `userId`, `emoji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Confession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `aiReply` VARCHAR(191) NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `Confession_approvedBy_idx`(`approvedBy`),
    INDEX `Confession_createdAt_idx`(`createdAt`),
    INDEX `Confession_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Confession_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfessionComment` (
    `id` VARCHAR(191) NOT NULL,
    `confessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `ConfessionComment_confessionId_createdAt_idx`(`confessionId`, `createdAt`),
    INDEX `ConfessionComment_status_idx`(`status`),
    INDEX `ConfessionComment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfessionLike` (
    `id` VARCHAR(191) NOT NULL,
    `confessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConfessionLike_confessionId_idx`(`confessionId`),
    INDEX `ConfessionLike_userId_idx`(`userId`),
    UNIQUE INDEX `ConfessionLike_confessionId_userId_key`(`confessionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfessionReaction` (
    `id` VARCHAR(191) NOT NULL,
    `confessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConfessionReaction_confessionId_idx`(`confessionId`),
    INDEX `ConfessionReaction_userId_idx`(`userId`),
    UNIQUE INDEX `ConfessionReaction_confessionId_userId_emoji_key`(`confessionId`, `userId`, `emoji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CrisisButton` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `trigger` VARCHAR(191) NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `resolvedAt` DATETIME(3) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CrisisButton_trigger_idx`(`trigger`),
    INDEX `CrisisButton_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomizationItem` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('FRAME', 'BACKGROUND', 'THEME', 'BADGE', 'ANIMATION') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `previewUrl` VARCHAR(191) NULL,
    `cssClass` VARCHAR(191) NULL,
    `colors` JSON NULL,
    `unlockCondition` VARCHAR(191) NOT NULL,
    `badgeType` ENUM('FIRST_PLAN', 'LIKES_10', 'LIKES_50', 'LIKES_100', 'VIEWS_100', 'VIEWS_500', 'VIEWS_1000', 'COMMENTS_10', 'COMMENTS_50', 'ACTIVE_7_DAYS', 'ACTIVE_30_DAYS', 'ACTIVE_100_DAYS', 'PLANS_5', 'PLANS_10', 'PLANS_25', 'EARLY_ADOPTER', 'COMMUNITY_HELPER', 'WEIGHT_LOSS_HERO', 'FIRST_PARTNER', 'SUPPORTIVE_PARTNER', 'GOAL_ACHIEVER', 'LONG_TERM_PARTNER', 'MOTIVATOR', 'PROFILE_COMPLETE', 'FIRST_RECIPE', 'RECIPES_5', 'RECIPES_10', 'RECIPES_25', 'RECIPE_LIKES_10', 'RECIPE_LIKES_50', 'RECIPE_LIKES_100', 'RECIPE_MASTER', 'RECIPE_VIEWS_100', 'RECIPE_VIEWS_500', 'RECIPE_COMMENTS_10', 'RECIPE_COMMENTS_25', 'GROUP_CREATOR', 'GROUP_ADMIN', 'CHALLENGE_WINNER', 'CHALLENGE_PARTICIPANT', 'SOCIAL_BUTTERFLY', 'CHEAT_FREE_7_DAYS', 'CHEAT_FREE_30_DAYS', 'FAST_FOOD_FREE_30_DAYS', 'BALANCED_RECOVERY', 'NEWSLETTER_SUBSCRIBER', 'QUEST_MASTER_10', 'QUEST_MASTER_50', 'QUEST_MASTER_100', 'COIN_COLLECTOR_1000', 'COIN_COLLECTOR_5000', 'COIN_COLLECTOR_10000', 'GAME_CALORIE_MASTER', 'GAME_MEMORY_MASTER', 'GAME_QUICK_CLICK_MASTER', 'SHOP_FIRST_PURCHASE', 'SHOP_ENTHUSIAST_10') NULL,
    `badgeCount` INTEGER NULL,
    `level` INTEGER NULL,
    `xpRequired` INTEGER NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isSpecial` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustomizationItem_code_key`(`code`),
    INDEX `CustomizationItem_badgeType_idx`(`badgeType`),
    INDEX `CustomizationItem_isDefault_idx`(`isDefault`),
    INDEX `CustomizationItem_type_order_idx`(`type`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyQuest` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DAILY_LOGIN', 'LIKE_PLAN', 'COMMENT', 'UPDATE_PROFILE', 'LOG_WEIGHT', 'PLAY_GAME', 'TRACK_CALORIES', 'CREATE_PLAN') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'EASY',
    `xpReward` INTEGER NOT NULL DEFAULT 0,
    `coinReward` INTEGER NOT NULL DEFAULT 0,
    `target` INTEGER NOT NULL DEFAULT 1,
    `icon` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DailyQuest_isActive_idx`(`isActive`),
    INDEX `DailyQuest_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `recipients` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `sentCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,

    INDEX `EmailCampaign_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Favorite_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `Favorite_planId_userId_key`(`planId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `id` VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    INDEX `Follow_followerId_idx`(`followerId`),
    INDEX `Follow_followingId_idx`(`followingId`),
    INDEX `Follow_followingId_status_idx`(`followingId`, `status`),
    INDEX `Follow_status_idx`(`status`),
    UNIQUE INDEX `Follow_followerId_followingId_key`(`followerId`, `followingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Food` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `calories` DOUBLE NOT NULL,
    `protein` DOUBLE NULL,
    `carbs` DOUBLE NULL,
    `fat` DOUBLE NULL,
    `fiber` DOUBLE NULL,
    `servingSize` DOUBLE NOT NULL DEFAULT 100,
    `isCommon` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Food_category_idx`(`category`),
    INDEX `Food_isCommon_idx`(`isCommon`),
    INDEX `Food_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FooterLink` (
    `id` VARCHAR(191) NOT NULL,
    `settingsId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `openInNewTab` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FooterLink_settingsId_order_idx`(`settingsId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FriendSuggestion` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `suggestedId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `dismissed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FriendSuggestion_score_idx`(`score`),
    INDEX `FriendSuggestion_userId_dismissed_idx`(`userId`, `dismissed`),
    UNIQUE INDEX `FriendSuggestion_userId_suggestedId_key`(`userId`, `suggestedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameScore` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gameType` ENUM('CALORIE_GUESS', 'MEMORY_CARDS', 'NUTRITION_QUIZ', 'DAILY_PUZZLE') NOT NULL,
    `score` INTEGER NOT NULL,
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `xpEarned` INTEGER NOT NULL DEFAULT 0,
    `coinEarned` INTEGER NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameScore_gameType_score_idx`(`gameType`, `score`),
    INDEX `GameScore_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `GameScore_userId_gameType_idx`(`userId`, `gameType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DAILY_LOGIN', 'WEEKLY_PLAN', 'WEEKLY_COMMENT', 'WEEKLY_LIKE', 'MONTHLY_ACTIVE', 'WEEKLY_RECIPE', 'MONTHLY_RECIPE', 'WEEKLY_RECIPE_COMMENT', 'MONTHLY_RECIPE_SHARE') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `target` INTEGER NOT NULL,
    `xpReward` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Goal_type_key`(`type`),
    INDEX `Goal_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `goalType` VARCHAR(191) NOT NULL,
    `targetWeight` INTEGER NULL,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `maxMembers` INTEGER NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionReason` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `ageGroup` ENUM('AGE_18_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_PLUS') NULL,
    `gender` ENUM('MALE', 'FEMALE', 'MIXED') NULL,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NULL,

    UNIQUE INDEX `Group_slug_key`(`slug`),
    INDEX `Group_ageGroup_idx`(`ageGroup`),
    INDEX `Group_createdBy_idx`(`createdBy`),
    INDEX `Group_gender_idx`(`gender`),
    INDEX `Group_goalType_idx`(`goalType`),
    INDEX `Group_isPrivate_status_idx`(`isPrivate`, `status`),
    INDEX `Group_level_idx`(`level`),
    INDEX `Group_slug_idx`(`slug`),
    INDEX `Group_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Group_status_goalType_idx`(`status`, `goalType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupEvent` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `eventType` ENUM('MEETUP', 'WEBINAR', 'WORKSHOP', 'CHALLENGE', 'OTHER') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `maxParticipants` INTEGER NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupEvent_createdBy_idx`(`createdBy`),
    INDEX `GroupEvent_eventType_idx`(`eventType`),
    INDEX `GroupEvent_groupId_startDate_idx`(`groupId`, `startDate`),
    INDEX `GroupEvent_startDate_idx`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupEventParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('GOING', 'MAYBE', 'NOT_GOING') NOT NULL DEFAULT 'GOING',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupEventParticipant_eventId_status_idx`(`eventId`, `status`),
    INDEX `GroupEventParticipant_userId_idx`(`userId`),
    UNIQUE INDEX `GroupEventParticipant_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupGoalProgress` (
    `id` VARCHAR(191) NOT NULL,
    `goalId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupGoalProgress_goalId_createdAt_idx`(`goalId`, `createdAt`),
    INDEX `GroupGoalProgress_goalId_userId_idx`(`goalId`, `userId`),
    INDEX `GroupGoalProgress_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupJoinRequest` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupJoinRequest_groupId_status_idx`(`groupId`, `status`),
    INDEX `GroupJoinRequest_userId_status_idx`(`userId`, `status`),
    UNIQUE INDEX `GroupJoinRequest_groupId_userId_key`(`groupId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupLeaderboard` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `period` ENUM('WEEKLY', 'MONTHLY', 'ALL_TIME') NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `activityScore` INTEGER NOT NULL DEFAULT 0,
    `weightLossScore` DOUBLE NOT NULL DEFAULT 0,
    `streakScore` INTEGER NOT NULL DEFAULT 0,
    `totalScore` DOUBLE NOT NULL DEFAULT 0,
    `rank` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupLeaderboard_groupId_period_rank_idx`(`groupId`, `period`, `rank`),
    INDEX `GroupLeaderboard_groupId_period_totalScore_idx`(`groupId`, `period`, `totalScore`),
    INDEX `GroupLeaderboard_periodStart_periodEnd_idx`(`periodStart`, `periodEnd`),
    INDEX `GroupLeaderboard_userId_idx`(`userId`),
    UNIQUE INDEX `GroupLeaderboard_groupId_userId_period_periodStart_key`(`groupId`, `userId`, `period`, `periodStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupMember` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MODERATOR', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActiveAt` DATETIME(3) NULL,
    `permissions` JSON NULL,

    INDEX `GroupMember_groupId_lastActiveAt_idx`(`groupId`, `lastActiveAt`),
    INDEX `GroupMember_groupId_role_idx`(`groupId`, `role`),
    INDEX `GroupMember_userId_idx`(`userId`),
    UNIQUE INDEX `GroupMember_groupId_userId_key`(`groupId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupMessage` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `messageType` ENUM('TEXT', 'EMOJI', 'GIF', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupMessage_groupId_createdAt_idx`(`groupId`, `createdAt`),
    INDEX `GroupMessage_messageType_idx`(`messageType`),
    INDEX `GroupMessage_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupPost` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `metadata` JSON NULL,
    `postType` ENUM('UPDATE', 'ACHIEVEMENT', 'MOTIVATION', 'PROGRESS', 'PHOTO') NOT NULL DEFAULT 'UPDATE',

    INDEX `GroupPost_groupId_createdAt_idx`(`groupId`, `createdAt`),
    INDEX `GroupPost_groupId_postType_createdAt_idx`(`groupId`, `postType`, `createdAt`),
    INDEX `GroupPost_postType_idx`(`postType`),
    INDEX `GroupPost_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupPostComment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupPostComment_postId_createdAt_idx`(`postId`, `createdAt`),
    INDEX `GroupPostComment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupPostLike` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupPostLike_postId_idx`(`postId`),
    UNIQUE INDEX `GroupPostLike_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupResource` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `resourceType` ENUM('VIDEO', 'RECIPE', 'EXERCISE', 'PDF', 'ARTICLE', 'LINK') NOT NULL,
    `url` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `tags` JSON NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupResource_groupId_category_idx`(`groupId`, `category`),
    INDEX `GroupResource_groupId_views_idx`(`groupId`, `views`),
    INDEX `GroupResource_resourceType_idx`(`resourceType`),
    INDEX `GroupResource_uploadedBy_idx`(`uploadedBy`),
    INDEX `GroupResource_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupStats` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `totalMembers` INTEGER NOT NULL DEFAULT 0,
    `activeMembers` INTEGER NOT NULL DEFAULT 0,
    `totalWeightLoss` DOUBLE NOT NULL DEFAULT 0,
    `avgWeightLoss` DOUBLE NOT NULL DEFAULT 0,
    `totalPosts` INTEGER NOT NULL DEFAULT 0,
    `totalMessages` INTEGER NOT NULL DEFAULT 0,
    `activeRate` DOUBLE NOT NULL DEFAULT 0,
    `lastCalculated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GroupStats_groupId_key`(`groupId`),
    INDEX `GroupStats_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupStatsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `activeMembers` INTEGER NOT NULL,
    `totalWeightLoss` DOUBLE NOT NULL,
    `postsCount` INTEGER NOT NULL,
    `messagesCount` INTEGER NOT NULL,

    INDEX `GroupStatsHistory_groupId_date_idx`(`groupId`, `date`),
    UNIQUE INDEX `GroupStatsHistory_groupId_date_key`(`groupId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupWeeklyGoal` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `weekEnd` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetValue` DOUBLE NOT NULL,
    `currentValue` DOUBLE NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GroupWeeklyGoal_groupId_completed_idx`(`groupId`, `completed`),
    INDEX `GroupWeeklyGoal_groupId_weekStart_idx`(`groupId`, `weekStart`),
    INDEX `GroupWeeklyGoal_weekStart_weekEnd_idx`(`weekStart`, `weekEnd`),
    UNIQUE INDEX `GroupWeeklyGoal_groupId_weekStart_key`(`groupId`, `weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Like` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Like_planId_idx`(`planId`),
    INDEX `Like_userId_idx`(`userId`),
    UNIQUE INDEX `Like_planId_userId_key`(`planId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `mealType` VARCHAR(191) NOT NULL,
    `totalCalories` DOUBLE NOT NULL DEFAULT 0,
    `totalProtein` DOUBLE NOT NULL DEFAULT 0,
    `totalCarbs` DOUBLE NOT NULL DEFAULT 0,
    `totalFat` DOUBLE NOT NULL DEFAULT 0,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Meal_mealType_idx`(`mealType`),
    INDEX `Meal_userId_date_idx`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealEntry` (
    `id` VARCHAR(191) NOT NULL,
    `mealId` VARCHAR(191) NOT NULL,
    `foodId` VARCHAR(191) NULL,
    `foodName` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `calories` DOUBLE NOT NULL,
    `protein` DOUBLE NULL,
    `carbs` DOUBLE NULL,
    `fat` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MealEntry_foodId_idx`(`foodId`),
    INDEX `MealEntry_mealId_idx`(`mealId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measurement` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `chest` DOUBLE NULL,
    `waist` DOUBLE NULL,
    `hips` DOUBLE NULL,
    `thigh` DOUBLE NULL,
    `arm` DOUBLE NULL,
    `neck` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Measurement_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MicroCopy` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MicroCopy_key_key`(`key`),
    INDEX `MicroCopy_isActive_idx`(`isActive`),
    INDEX `MicroCopy_location_idx`(`location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MoodLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `mood` INTEGER NOT NULL,
    `stress` INTEGER NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MoodLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsletterSubscriber` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribedAt` DATETIME(3) NULL,

    UNIQUE INDEX `NewsletterSubscriber_email_key`(`email`),
    INDEX `NewsletterSubscriber_email_idx`(`email`),
    INDEX `NewsletterSubscriber_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('NEW_FOLLOWER', 'COMMENT', 'LIKE', 'BADGE_EARNED', 'PARTNER_REQUEST', 'PARTNER_ACCEPTED', 'RECIPE_APPROVED', 'RECIPE_REJECTED', 'PLAN_APPROVED', 'PLAN_REJECTED', 'GROUP_INVITE', 'CHALLENGE_INVITE', 'WALL_POST', 'MENTION', 'LEVEL_UP', 'COMMENT_REACTION', 'FOLLOW_REQUEST', 'FOLLOW_ACCEPTED', 'RECIPE_COMMENT', 'RECIPE_LIKE', 'PLAN_COMMENT', 'PLAN_LIKE', 'GROUP_NEW_POST', 'GROUP_NEW_COMMENT', 'GROUP_NEW_MESSAGE', 'GROUP_POST_LIKE', 'GROUP_EVENT_CREATED', 'GROUP_EVENT_REMINDER', 'GROUP_MEMBER_JOINED', 'GROUP_ROLE_CHANGED', 'GROUP_WEEKLY_GOAL', 'GROUP_LEADERBOARD_RANK', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_APPROVED', 'GROUP_JOIN_REJECTED', 'QUEST_COMPLETED', 'QUEST_AVAILABLE', 'REWARD_PURCHASED', 'COIN_EARNED', 'STREAK_MILESTONE') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `actionUrl` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `actorId` VARCHAR(191) NULL,
    `relatedId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_type_idx`(`type`),
    INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Notification_userId_isRead_createdAt_idx`(`userId`, `isRead`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailNewFollower` BOOLEAN NOT NULL DEFAULT true,
    `emailComment` BOOLEAN NOT NULL DEFAULT true,
    `emailLike` BOOLEAN NOT NULL DEFAULT true,
    `emailBadge` BOOLEAN NOT NULL DEFAULT true,
    `emailPartnerRequest` BOOLEAN NOT NULL DEFAULT true,
    `emailWeeklyDigest` BOOLEAN NOT NULL DEFAULT true,
    `pushNewFollower` BOOLEAN NOT NULL DEFAULT true,
    `pushComment` BOOLEAN NOT NULL DEFAULT true,
    `pushLike` BOOLEAN NOT NULL DEFAULT false,
    `pushBadge` BOOLEAN NOT NULL DEFAULT true,
    `pushPartnerRequest` BOOLEAN NOT NULL DEFAULT true,
    `inAppNewFollower` BOOLEAN NOT NULL DEFAULT true,
    `inAppComment` BOOLEAN NOT NULL DEFAULT true,
    `inAppLike` BOOLEAN NOT NULL DEFAULT true,
    `inAppBadge` BOOLEAN NOT NULL DEFAULT true,
    `inAppPartnerRequest` BOOLEAN NOT NULL DEFAULT true,
    `quietHoursStart` INTEGER NULL,
    `quietHoursEnd` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `metaKeywords` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `showInFooter` BOOLEAN NOT NULL DEFAULT false,
    `showInNavbar` BOOLEAN NOT NULL DEFAULT false,
    `showInTopNavbar` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `publishedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    INDEX `Page_isPublished_order_idx`(`isPublished`, `order`),
    INDEX `Page_showInFooter_order_idx`(`showInFooter`, `order`),
    INDEX `Page_showInNavbar_order_idx`(`showInNavbar`, `order`),
    INDEX `Page_showInTopNavbar_order_idx`(`showInTopNavbar`, `order`),
    INDEX `Page_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnershipCheckIn` (
    `id` VARCHAR(191) NOT NULL,
    `partnershipId` VARCHAR(191) NOT NULL,
    `checkInId` VARCHAR(191) NOT NULL,
    `supportNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PartnershipCheckIn_partnershipId_createdAt_idx`(`partnershipId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnershipGoal` (
    `id` VARCHAR(191) NOT NULL,
    `partnershipId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `targetDate` DATETIME(3) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PartnershipGoal_partnershipId_completed_idx`(`partnershipId`, `completed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnershipMessage` (
    `id` VARCHAR(191) NOT NULL,
    `partnershipId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PartnershipMessage_partnershipId_createdAt_idx`(`partnershipId`, `createdAt`),
    INDEX `PartnershipMessage_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `startWeight` INTEGER NOT NULL,
    `goalWeight` INTEGER NOT NULL,
    `durationText` VARCHAR(191) NOT NULL,
    `routine` VARCHAR(191) NOT NULL,
    `diet` VARCHAR(191) NOT NULL,
    `exercise` VARCHAR(191) NOT NULL,
    `motivation` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `Plan_slug_key`(`slug`),
    INDEX `Plan_categoryId_idx`(`categoryId`),
    INDEX `Plan_goalWeight_startWeight_idx`(`goalWeight`, `startWeight`),
    INDEX `Plan_slug_idx`(`slug`),
    INDEX `Plan_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Plan_status_views_idx`(`status`, `views`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanTag` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PlanTag_planId_tagId_key`(`planId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Poll` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `allowMultiple` BOOLEAN NOT NULL DEFAULT false,
    `endsAt` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Poll_createdBy_idx`(`createdBy`),
    INDEX `Poll_isActive_createdAt_idx`(`isActive`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollOption` (
    `id` VARCHAR(191) NOT NULL,
    `pollId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PollOption_pollId_order_idx`(`pollId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PollVote` (
    `id` VARCHAR(191) NOT NULL,
    `pollId` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PollVote_pollId_idx`(`pollId`),
    INDEX `PollVote_userId_idx`(`userId`),
    UNIQUE INDEX `PollVote_pollId_optionId_userId_key`(`pollId`, `optionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProfileCustomization` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activeFrame` VARCHAR(191) NULL,
    `activeBackground` VARCHAR(191) NULL,
    `activeTheme` VARCHAR(191) NULL,
    `activeBadges` JSON NULL,
    `unlockedFrames` JSON NULL,
    `unlockedBackgrounds` JSON NULL,
    `unlockedThemes` JSON NULL,
    `unlockedBadges` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProfileCustomization_userId_key`(`userId`),
    INDEX `ProfileCustomization_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgressPhoto` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NULL,
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgressPhoto_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoFeature` (
    `id` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#10b981',
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `link` VARCHAR(191) NULL,

    INDEX `PromoFeature_isActive_idx`(`isActive`),
    INDEX `PromoFeature_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromoSection` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'VIDEO', 'FEATURES', 'HOW_IT_WORKS', 'TESTIMONIALS', 'CTA', 'STATS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `content` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonUrl` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PromoSection_isActive_idx`(`isActive`),
    INDEX `PromoSection_type_order_idx`(`type`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `p256dh` VARCHAR(191) NOT NULL,
    `auth` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PushSubscription_endpoint_key`(`endpoint`),
    INDEX `PushSubscription_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recipe` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `ingredients` VARCHAR(191) NOT NULL,
    `instructions` VARCHAR(191) NOT NULL,
    `prepTime` INTEGER NULL,
    `cookTime` INTEGER NULL,
    `servings` INTEGER NULL,
    `difficulty` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `calories` DOUBLE NULL,
    `protein` DOUBLE NULL,
    `carbs` DOUBLE NULL,
    `fat` DOUBLE NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionReason` VARCHAR(191) NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Recipe_slug_key`(`slug`),
    INDEX `Recipe_category_idx`(`category`),
    INDEX `Recipe_slug_idx`(`slug`),
    INDEX `Recipe_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Recipe_status_views_idx`(`status`, `views`),
    INDEX `Recipe_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeComment` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RecipeComment_recipeId_createdAt_idx`(`recipeId`, `createdAt`),
    INDEX `RecipeComment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeFavorite` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecipeFavorite_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `RecipeFavorite_recipeId_userId_key`(`recipeId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeImage` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecipeImage_recipeId_order_idx`(`recipeId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecipeLike` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecipeLike_recipeId_idx`(`recipeId`),
    INDEX `RecipeLike_userId_idx`(`userId`),
    UNIQUE INDEX `RecipeLike_recipeId_userId_key`(`recipeId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeoSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `settings` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopItem` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('FRAME', 'THEME', 'AVATAR', 'XP_BOOST', 'COIN_BOOST', 'STREAK_SHIELD', 'SPECIAL_BADGE', 'AD_FREE', 'PREMIUM_REPORT') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `category` ENUM('COSMETIC', 'BOOSTER', 'BADGE', 'FEATURE') NOT NULL,
    `isLimited` BOOLEAN NOT NULL DEFAULT false,
    `stock` INTEGER NULL,
    `requiredLevel` INTEGER NULL,
    `requiredBadge` ENUM('FIRST_PLAN', 'LIKES_10', 'LIKES_50', 'LIKES_100', 'VIEWS_100', 'VIEWS_500', 'VIEWS_1000', 'COMMENTS_10', 'COMMENTS_50', 'ACTIVE_7_DAYS', 'ACTIVE_30_DAYS', 'ACTIVE_100_DAYS', 'PLANS_5', 'PLANS_10', 'PLANS_25', 'EARLY_ADOPTER', 'COMMUNITY_HELPER', 'WEIGHT_LOSS_HERO', 'FIRST_PARTNER', 'SUPPORTIVE_PARTNER', 'GOAL_ACHIEVER', 'LONG_TERM_PARTNER', 'MOTIVATOR', 'PROFILE_COMPLETE', 'FIRST_RECIPE', 'RECIPES_5', 'RECIPES_10', 'RECIPES_25', 'RECIPE_LIKES_10', 'RECIPE_LIKES_50', 'RECIPE_LIKES_100', 'RECIPE_MASTER', 'RECIPE_VIEWS_100', 'RECIPE_VIEWS_500', 'RECIPE_COMMENTS_10', 'RECIPE_COMMENTS_25', 'GROUP_CREATOR', 'GROUP_ADMIN', 'CHALLENGE_WINNER', 'CHALLENGE_PARTICIPANT', 'SOCIAL_BUTTERFLY', 'CHEAT_FREE_7_DAYS', 'CHEAT_FREE_30_DAYS', 'FAST_FOOD_FREE_30_DAYS', 'BALANCED_RECOVERY', 'NEWSLETTER_SUBSCRIBER', 'QUEST_MASTER_10', 'QUEST_MASTER_50', 'QUEST_MASTER_100', 'COIN_COLLECTOR_1000', 'COIN_COLLECTOR_5000', 'COIN_COLLECTOR_10000', 'GAME_CALORIE_MASTER', 'GAME_MEMORY_MASTER', 'GAME_QUICK_CLICK_MASTER', 'SHOP_FIRST_PURCHASE', 'SHOP_ENTHUSIAST_10') NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ShopItem_code_key`(`code`),
    INDEX `ShopItem_category_order_idx`(`category`, `order`),
    INDEX `ShopItem_isActive_idx`(`isActive`),
    INDEX `ShopItem_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShoppingList` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `weekNumber` INTEGER NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShoppingList_planId_idx`(`planId`),
    INDEX `ShoppingList_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `ShoppingList_userId_isCompleted_idx`(`userId`, `isCompleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShoppingListItem` (
    `id` VARCHAR(191) NOT NULL,
    `shoppingListId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `isChecked` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,
    `estimatedPrice` DOUBLE NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ShoppingListItem_shoppingListId_category_order_idx`(`shoppingListId`, `category`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(191) NOT NULL,
    `siteTitle` VARCHAR(191) NOT NULL DEFAULT 'Zayıflama Planım',
    `siteDescription` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `twitterUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `footerText` VARCHAR(191) NULL,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `footerAboutText` VARCHAR(191) NULL DEFAULT 'Gerçek insanların gerçek başarı hikayeleri. Sağlıklı yaşam için ilham alın.',
    `footerAboutTitle` VARCHAR(191) NULL DEFAULT 'Hakkımızda',
    `footerLinksTitle` VARCHAR(191) NULL DEFAULT 'Hızlı Bağlantılar',
    `footerSocialTitle` VARCHAR(191) NULL DEFAULT 'Bizi Takip Edin',
    `facebookAppId` VARCHAR(191) NULL,
    `facebookAppSecret` VARCHAR(191) NULL,
    `facebookOAuthEnabled` BOOLEAN NOT NULL DEFAULT false,
    `googleClientId` VARCHAR(191) NULL,
    `googleClientSecret` VARCHAR(191) NULL,
    `googleOAuthEnabled` BOOLEAN NOT NULL DEFAULT false,
    `googleAnalyticsId` VARCHAR(191) NULL,
    `googleSearchConsoleCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_name_key`(`name`),
    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `role` VARCHAR(191) NULL,
    `text` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Testimonial_isActive_order_idx`(`isActive`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `startWeight` INTEGER NULL,
    `goalWeight` INTEGER NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `tiktok` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `lastActiveDate` DATETIME(3) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `streak` INTEGER NOT NULL DEFAULT 0,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `city` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `allowMessages` BOOLEAN NOT NULL DEFAULT true,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `requireFollowApproval` BOOLEAN NOT NULL DEFAULT false,
    `showEmail` BOOLEAN NOT NULL DEFAULT false,
    `showWeight` BOOLEAN NOT NULL DEFAULT true,
    `emailVerified` DATETIME(3) NULL,
    `theme` VARCHAR(191) NULL DEFAULT 'system',
    `coins` INTEGER NOT NULL DEFAULT 0,
    `lastQuestReset` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_coins_idx`(`coins`),
    INDEX `User_xp_level_idx`(`xp`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBadge` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `badgeId` VARCHAR(191) NOT NULL,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserBadge_userId_earnedAt_idx`(`userId`, `earnedAt`),
    UNIQUE INDEX `UserBadge_userId_badgeId_key`(`userId`, `badgeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDailyQuest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimedReward` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserDailyQuest_date_idx`(`date`),
    INDEX `UserDailyQuest_userId_completed_idx`(`userId`, `completed`),
    INDEX `UserDailyQuest_userId_date_idx`(`userId`, `date`),
    UNIQUE INDEX `UserDailyQuest_userId_questId_date_key`(`userId`, `questId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserGoal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `goalId` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,

    INDEX `UserGoal_endDate_idx`(`endDate`),
    INDEX `UserGoal_goalId_idx`(`goalId`),
    INDEX `UserGoal_userId_completed_idx`(`userId`, `completed`),
    UNIQUE INDEX `UserGoal_userId_goalId_startDate_key`(`userId`, `goalId`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,

    INDEX `UserPurchase_itemId_idx`(`itemId`),
    INDEX `UserPurchase_userId_isActive_idx`(`userId`, `isActive`),
    INDEX `UserPurchase_userId_purchasedAt_idx`(`userId`, `purchasedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `beforeImage` VARCHAR(191) NULL,
    `afterImage` VARCHAR(191) NULL,
    `beforeWeight` INTEGER NULL,
    `afterWeight` INTEGER NULL,
    `duration` VARCHAR(191) NULL,
    `story` VARCHAR(191) NOT NULL,
    `quote` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserStory_isActive_order_idx`(`isActive`, `order`),
    INDEX `UserStory_isFeatured_idx`(`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WallPost` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WallPost_authorId_idx`(`authorId`),
    INDEX `WallPost_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebVitals` (
    `id` VARCHAR(191) NOT NULL,
    `metricName` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `delta` INTEGER NOT NULL,
    `metricId` VARCHAR(191) NOT NULL,
    `navigationType` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WebVitals_createdAt_idx`(`createdAt`),
    INDEX `WebVitals_metricName_idx`(`metricName`),
    INDEX `WebVitals_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeightLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WeightLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quest` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DAILY', 'WEEKLY', 'SPECIAL') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetValue` INTEGER NOT NULL,
    `coinReward` INTEGER NOT NULL DEFAULT 0,
    `xpReward` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `conditions` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Quest_type_isActive_idx`(`type`, `isActive`),
    INDEX `Quest_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserQuest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `questId` VARCHAR(191) NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `rewardClaimed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `UserQuest_userId_completed_idx`(`userId`, `completed`),
    INDEX `UserQuest_userId_expiresAt_idx`(`userId`, `expiresAt`),
    INDEX `UserQuest_questId_idx`(`questId`),
    UNIQUE INDEX `UserQuest_userId_questId_assignedAt_key`(`userId`, `questId`, `assignedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reward` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('BADGE', 'THEME', 'AVATAR', 'FRAME', 'DISCOUNT_CODE', 'GIFT_CARD', 'AD_FREE', 'PREMIUM_STATS', 'CUSTOM_PROFILE') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `stock` INTEGER NULL,
    `digitalData` JSON NULL,
    `physicalData` JSON NULL,
    `premiumData` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reward_category_isActive_idx`(`category`, `isActive`),
    INDEX `Reward_isFeatured_order_idx`(`isFeatured`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserReward` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rewardId` VARCHAR(191) NOT NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `coinsPaid` INTEGER NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `rewardData` JSON NULL,

    INDEX `UserReward_userId_purchasedAt_idx`(`userId`, `purchasedAt`),
    INDEX `UserReward_rewardId_idx`(`rewardId`),
    INDEX `UserReward_userId_isUsed_idx`(`userId`, `isUsed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MiniGame` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `settings` JSON NOT NULL,
    `rewardTiers` JSON NOT NULL,
    `dailyLimit` INTEGER NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MiniGame_code_key`(`code`),
    INDEX `MiniGame_code_idx`(`code`),
    INDEX `MiniGame_isActive_order_idx`(`isActive`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `coinsEarned` INTEGER NOT NULL DEFAULT 0,
    `gameData` JSON NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `GameSession_userId_startedAt_idx`(`userId`, `startedAt`),
    INDEX `GameSession_gameId_score_idx`(`gameId`, `score`),
    INDEX `GameSession_userId_gameId_startedAt_idx`(`userId`, `gameId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StreakBonus` (
    `id` VARCHAR(191) NOT NULL,
    `streakDays` INTEGER NOT NULL,
    `coinReward` INTEGER NOT NULL,
    `xpReward` INTEGER NOT NULL,
    `badgeType` ENUM('FIRST_PLAN', 'LIKES_10', 'LIKES_50', 'LIKES_100', 'VIEWS_100', 'VIEWS_500', 'VIEWS_1000', 'COMMENTS_10', 'COMMENTS_50', 'ACTIVE_7_DAYS', 'ACTIVE_30_DAYS', 'ACTIVE_100_DAYS', 'PLANS_5', 'PLANS_10', 'PLANS_25', 'EARLY_ADOPTER', 'COMMUNITY_HELPER', 'WEIGHT_LOSS_HERO', 'FIRST_PARTNER', 'SUPPORTIVE_PARTNER', 'GOAL_ACHIEVER', 'LONG_TERM_PARTNER', 'MOTIVATOR', 'PROFILE_COMPLETE', 'FIRST_RECIPE', 'RECIPES_5', 'RECIPES_10', 'RECIPES_25', 'RECIPE_LIKES_10', 'RECIPE_LIKES_50', 'RECIPE_LIKES_100', 'RECIPE_MASTER', 'RECIPE_VIEWS_100', 'RECIPE_VIEWS_500', 'RECIPE_COMMENTS_10', 'RECIPE_COMMENTS_25', 'GROUP_CREATOR', 'GROUP_ADMIN', 'CHALLENGE_WINNER', 'CHALLENGE_PARTICIPANT', 'SOCIAL_BUTTERFLY', 'CHEAT_FREE_7_DAYS', 'CHEAT_FREE_30_DAYS', 'FAST_FOOD_FREE_30_DAYS', 'BALANCED_RECOVERY', 'NEWSLETTER_SUBSCRIBER', 'QUEST_MASTER_10', 'QUEST_MASTER_50', 'QUEST_MASTER_100', 'COIN_COLLECTOR_1000', 'COIN_COLLECTOR_5000', 'COIN_COLLECTOR_10000', 'GAME_CALORIE_MASTER', 'GAME_MEMORY_MASTER', 'GAME_QUICK_CLICK_MASTER', 'SHOP_FIRST_PURCHASE', 'SHOP_ENTHUSIAST_10') NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `StreakBonus_streakDays_key`(`streakDays`),
    INDEX `StreakBonus_streakDays_idx`(`streakDays`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
