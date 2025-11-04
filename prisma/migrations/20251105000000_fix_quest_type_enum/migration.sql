-- Drop old QuestType enum if exists and recreate with correct values
DO $$ 
BEGIN
    -- Drop the old enum if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestType') THEN
        -- First, we need to check if Quest table exists and uses this enum
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Quest') THEN
            -- Temporarily change the column type to text
            ALTER TABLE "Quest" ALTER COLUMN "type" TYPE TEXT;
        END IF;
        
        -- Drop the old enum
        DROP TYPE "QuestType";
    END IF;
    
    -- Create the new enum with correct values
    CREATE TYPE "QuestType" AS ENUM ('DAILY', 'WEEKLY', 'SPECIAL');
    
    -- If Quest table exists, change the column back to the enum type
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Quest') THEN
        ALTER TABLE "Quest" ALTER COLUMN "type" TYPE "QuestType" USING ("type"::text::"QuestType");
    END IF;
END $$;
