-- AlterTable
ALTER TABLE "Comment" 
ADD COLUMN "status" "CommentStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "moderatedBy" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3),
ADD COLUMN "moderationNote" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "Comment"("status");

-- CreateIndex
CREATE INDEX "Comment_moderatedBy_idx" ON "Comment"("moderatedBy");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
