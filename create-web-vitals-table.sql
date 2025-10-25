-- WebVitals tablosunu oluştur
CREATE TABLE IF NOT EXISTS "WebVitals" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "metricId" TEXT NOT NULL,
    "navigationType" TEXT,
    "userAgent" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebVitals_pkey" PRIMARY KEY ("id")
);

-- İndeksleri oluştur
CREATE INDEX IF NOT EXISTS "WebVitals_metricName_idx" ON "WebVitals"("metricName");
CREATE INDEX IF NOT EXISTS "WebVitals_createdAt_idx" ON "WebVitals"("createdAt");
CREATE INDEX IF NOT EXISTS "WebVitals_rating_idx" ON "WebVitals"("rating");
