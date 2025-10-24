-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FooterLink_settingsId_order_idx" ON "FooterLink"("settingsId", "order");

-- AddForeignKey
ALTER TABLE "FooterLink" ADD CONSTRAINT "FooterLink_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
