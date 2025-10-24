-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BadgeType" ADD VALUE 'FIRST_RECIPE';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPES_5';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPES_10';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPES_25';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_LIKES_10';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_LIKES_50';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_LIKES_100';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_MASTER';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_VIEWS_100';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_VIEWS_500';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_COMMENTS_10';
ALTER TYPE "BadgeType" ADD VALUE 'RECIPE_COMMENTS_25';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GoalType" ADD VALUE 'WEEKLY_RECIPE';
ALTER TYPE "GoalType" ADD VALUE 'MONTHLY_RECIPE';
ALTER TYPE "GoalType" ADD VALUE 'WEEKLY_RECIPE_COMMENT';
ALTER TYPE "GoalType" ADD VALUE 'MONTHLY_RECIPE_SHARE';
