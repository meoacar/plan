-- Plan Reactions tablosunu oluştur
CREATE TABLE IF NOT EXISTS "PlanReaction" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanReaction_pkey" PRIMARY KEY ("id")
);

-- Unique constraint ekle (bir kullanıcı aynı plana aynı emoji'yi sadece bir kez verebilir)
CREATE UNIQUE INDEX IF NOT EXISTS "PlanReaction_planId_userId_emoji_key" ON "PlanReaction"("planId", "userId", "emoji");

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS "PlanReaction_planId_idx" ON "PlanReaction"("planId");
CREATE INDEX IF NOT EXISTS "PlanReaction_userId_idx" ON "PlanReaction"("userId");

-- Foreign key'ler ekle
ALTER TABLE "PlanReaction" ADD CONSTRAINT "PlanReaction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanReaction" ADD CONSTRAINT "PlanReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NotificationType enum'una PLAN_REACTION ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PLAN_REACTION' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'NotificationType')
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'PLAN_REACTION';
    END IF;
END $$;
