-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BadgeType" ADD VALUE 'FIRST_PARTNER';
ALTER TYPE "BadgeType" ADD VALUE 'SUPPORTIVE_PARTNER';
ALTER TYPE "BadgeType" ADD VALUE 'GOAL_ACHIEVER';
ALTER TYPE "BadgeType" ADD VALUE 'LONG_TERM_PARTNER';
ALTER TYPE "BadgeType" ADD VALUE 'MOTIVATOR';

-- CreateTable
CREATE TABLE "AccountabilityPartnership" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AccountabilityPartnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnershipGoal" (
    "id" TEXT NOT NULL,
    "partnershipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnershipGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnershipMessage" (
    "id" TEXT NOT NULL,
    "partnershipId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnershipMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnershipCheckIn" (
    "id" TEXT NOT NULL,
    "partnershipId" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "supportNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnershipCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountabilityPartnership_requesterId_status_idx" ON "AccountabilityPartnership"("requesterId", "status");

-- CreateIndex
CREATE INDEX "AccountabilityPartnership_partnerId_status_idx" ON "AccountabilityPartnership"("partnerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilityPartnership_requesterId_partnerId_key" ON "AccountabilityPartnership"("requesterId", "partnerId");

-- CreateIndex
CREATE INDEX "PartnershipGoal_partnershipId_completed_idx" ON "PartnershipGoal"("partnershipId", "completed");

-- CreateIndex
CREATE INDEX "PartnershipMessage_partnershipId_createdAt_idx" ON "PartnershipMessage"("partnershipId", "createdAt");

-- CreateIndex
CREATE INDEX "PartnershipMessage_senderId_idx" ON "PartnershipMessage"("senderId");

-- CreateIndex
CREATE INDEX "PartnershipCheckIn_partnershipId_createdAt_idx" ON "PartnershipCheckIn"("partnershipId", "createdAt");

-- AddForeignKey
ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityPartnership" ADD CONSTRAINT "AccountabilityPartnership_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipGoal" ADD CONSTRAINT "PartnershipGoal_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "AccountabilityPartnership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipMessage" ADD CONSTRAINT "PartnershipMessage_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "AccountabilityPartnership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipCheckIn" ADD CONSTRAINT "PartnershipCheckIn_partnershipId_fkey" FOREIGN KEY ("partnershipId") REFERENCES "AccountabilityPartnership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipCheckIn" ADD CONSTRAINT "PartnershipCheckIn_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
