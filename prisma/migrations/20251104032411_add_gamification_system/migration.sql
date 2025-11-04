-- CreateEnum
CREATE TYPE IF NOT EXISTS "QuestType" AS ENUM ('DAILY', 'WEEKLY', 'SPECIAL');
CREATE TYPE IF NOT EXISTS "CoinTransactionType" AS ENUM ('EARN', 'SPEND', 'BONUS', 'REFUND');
CREATE TYPE IF NOT EXISTS "RewardType" AS ENUM ('BADGE', 'THEME', 'AVATAR', 'FRAME', 'DISCOUNT_CODE', 'GIFT_CARD', 'AD_FREE', 'PREMIUM_STATS', 'CUSTOM_PROFILE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "coins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastQuestReset" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "targetType" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CoinTransactionType" NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER,
    "digitalData" JSONB,
    "physicalData" JSONB,
    "premiumData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coinsPaid" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rewardData" JSONB,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiniGame" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "settings" JSONB NOT NULL,
    "rewardTiers" JSONB NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MiniGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "gameData" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakBonus" (
    "id" TEXT NOT NULL,
    "streakDays" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "badgeType" "BadgeType",
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakBonus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quest_type_isActive_idx" ON "Quest"("type", "isActive");

-- CreateIndex
CREATE INDEX "Quest_category_idx" ON "Quest"("category");

-- CreateIndex
CREATE INDEX "UserQuest_userId_completed_idx" ON "UserQuest"("userId", "completed");

-- CreateIndex
CREATE INDEX "UserQuest_userId_expiresAt_idx" ON "UserQuest"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "UserQuest_questId_idx" ON "UserQuest"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_assignedAt_key" ON "UserQuest"("userId", "questId", "assignedAt");

-- CreateIndex
CREATE INDEX "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CoinTransaction_type_idx" ON "CoinTransaction"("type");

-- CreateIndex
CREATE INDEX "Reward_category_isActive_idx" ON "Reward"("category", "isActive");

-- CreateIndex
CREATE INDEX "Reward_isFeatured_order_idx" ON "Reward"("isFeatured", "order");

-- CreateIndex
CREATE INDEX "UserReward_userId_purchasedAt_idx" ON "UserReward"("userId", "purchasedAt");

-- CreateIndex
CREATE INDEX "UserReward_rewardId_idx" ON "UserReward"("rewardId");

-- CreateIndex
CREATE INDEX "UserReward_userId_isUsed_idx" ON "UserReward"("userId", "isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "MiniGame_code_key" ON "MiniGame"("code");

-- CreateIndex
CREATE INDEX "MiniGame_code_idx" ON "MiniGame"("code");

-- CreateIndex
CREATE INDEX "MiniGame_isActive_order_idx" ON "MiniGame"("isActive", "order");

-- CreateIndex
CREATE INDEX "GameSession_userId_startedAt_idx" ON "GameSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "GameSession_gameId_score_idx" ON "GameSession"("gameId", "score");

-- CreateIndex
CREATE INDEX "GameSession_userId_gameId_startedAt_idx" ON "GameSession"("userId", "gameId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StreakBonus_streakDays_key" ON "StreakBonus"("streakDays");

-- CreateIndex
CREATE INDEX "StreakBonus_streakDays_idx" ON "StreakBonus"("streakDays");

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "MiniGame"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
