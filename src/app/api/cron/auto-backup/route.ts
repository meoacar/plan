import { NextRequest, NextResponse } from "next/server"
import { createBackup } from "@/lib/backup"

/**
 * POST /api/cron/auto-backup
 * Otomatik yedekleme cron job'ı
 * Requirements: 11.9
 * 
 * Vercel cron job tarafından çağrılır
 * vercel.json'da tanımlanmalı:
 * {
 *   "crons": [{
 *     "path": "/api/cron/auto-backup",
 *     "schedule": "0 2 * * *"  // Her gün saat 02:00
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Cron secret kontrolü (güvenlik için)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Otomatik yedek oluştur (userId olmadan)
    const backup = await createBackup()

    console.log("Otomatik yedek oluşturuldu:", backup.filename)

    return NextResponse.json({
      success: true,
      message: "Otomatik yedek başarıyla oluşturuldu",
      backup: {
        filename: backup.filename,
        size: backup.size,
      },
    })
  } catch (error) {
    console.error("Otomatik yedekleme hatası:", error)
    return NextResponse.json(
      { error: "Otomatik yedekleme başarısız" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint'i de ekleyelim (Vercel cron bazen GET kullanır)
 */
export async function GET(request: NextRequest) {
  return POST(request)
}
