import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/maintenance/health
 * Sistem sağlık kontrolü yapar
 * Requirements: 11.7
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const health = {
      database: await checkDatabase(),
      memory: getMemoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error("Health check hatası:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Sağlık kontrolü yapılamadı" },
      { status: 500 }
    )
  }
}

/**
 * Veritabanı bağlantısını kontrol eder
 */
async function checkDatabase() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    return {
      status: "ok",
      latency: `${latency}ms`,
    }
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    }
  }
}

/**
 * Bellek kullanımını getirir
 */
function getMemoryUsage() {
  const usage = process.memoryUsage()

  return {
    rss: formatBytes(usage.rss),
    heapTotal: formatBytes(usage.heapTotal),
    heapUsed: formatBytes(usage.heapUsed),
    external: formatBytes(usage.external),
  }
}

/**
 * Byte'ları okunabilir formata çevirir
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
