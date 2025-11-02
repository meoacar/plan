-- AlterTable: Sadece eksik kolonları ekle
DO $$ 
BEGIN
    -- status kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='status') THEN
        ALTER TABLE "Comment" ADD COLUMN "status" "CommentStatus" NOT NULL DEFAULT 'APPROVED';
    END IF;
    
    -- isSpam kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='isSpam') THEN
        ALTER TABLE "Comment" ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- moderatedBy kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='moderatedBy') THEN
        ALTER TABLE "Comment" ADD COLUMN "moderatedBy" TEXT;
    END IF;
    
    -- moderatedAt kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='moderatedAt') THEN
        ALTER TABLE "Comment" ADD COLUMN "moderatedAt" TIMESTAMP(3);
    END IF;
    
    -- moderationNote kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='moderationNote') THEN
        ALTER TABLE "Comment" ADD COLUMN "moderationNote" TEXT;
    END IF;
    
    -- updatedAt kolonu yoksa ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Comment' AND column_name='updatedAt') THEN
        ALTER TABLE "Comment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- CreateIndex (sadece yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Comment_status_idx') THEN
        CREATE INDEX "Comment_status_idx" ON "Comment"("status");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Comment_moderatedBy_idx') THEN
        CREATE INDEX "Comment_moderatedBy_idx" ON "Comment"("moderatedBy");
    END IF;
END $$;

-- AddForeignKey (sadece yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Comment_moderatedBy_fkey'
    ) THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_moderatedBy_fkey" 
        FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
