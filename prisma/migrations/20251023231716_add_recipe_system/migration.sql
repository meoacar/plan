-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'RECIPE_APPROVED';
ALTER TYPE "ActivityType" ADD VALUE 'RECIPE_REJECTED';
ALTER TYPE "ActivityType" ADD VALUE 'RECIPE_DELETED';

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "servings" INTEGER,
    "difficulty" TEXT,
    "category" TEXT NOT NULL,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "status" "RecipeStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeImage" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeLike" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeComment" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeFavorite" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_userId_status_idx" ON "Recipe"("userId", "status");

-- CreateIndex
CREATE INDEX "Recipe_status_createdAt_idx" ON "Recipe"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Recipe_category_idx" ON "Recipe"("category");

-- CreateIndex
CREATE INDEX "Recipe_slug_idx" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "RecipeImage_recipeId_order_idx" ON "RecipeImage"("recipeId", "order");

-- CreateIndex
CREATE INDEX "RecipeLike_userId_idx" ON "RecipeLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeLike_recipeId_userId_key" ON "RecipeLike"("recipeId", "userId");

-- CreateIndex
CREATE INDEX "RecipeComment_recipeId_createdAt_idx" ON "RecipeComment"("recipeId", "createdAt");

-- CreateIndex
CREATE INDEX "RecipeComment_userId_idx" ON "RecipeComment"("userId");

-- CreateIndex
CREATE INDEX "RecipeFavorite_userId_createdAt_idx" ON "RecipeFavorite"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeFavorite_recipeId_userId_key" ON "RecipeFavorite"("recipeId", "userId");

-- AddForeignKey
ALTER TABLE "RecipeImage" ADD CONSTRAINT "RecipeImage_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeLike" ADD CONSTRAINT "RecipeLike_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeComment" ADD CONSTRAINT "RecipeComment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeFavorite" ADD CONSTRAINT "RecipeFavorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
