-- Rename QuestType enum to DailyQuestType for DailyQuest table
-- This is needed because we have a new QuestType enum for the Quest table

-- Create new enum
CREATE TYPE "DailyQuestType" AS ENUM ('DAILY_LOGIN', 'LIKE_PLAN', 'COMMENT', 'UPDATE_PROFILE', 'LOG_WEIGHT', 'PLAY_GAME', 'TRACK_CALORIES', 'CREATE_PLAN');

-- Update DailyQuest table to use new enum
ALTER TABLE "DailyQuest" ALTER COLUMN "type" TYPE "DailyQuestType" USING ("type"::text::"DailyQuestType");

-- Note: We keep the old QuestType enum for backward compatibility with existing data
-- The new Quest table uses the QuestType enum defined in the previous migration
