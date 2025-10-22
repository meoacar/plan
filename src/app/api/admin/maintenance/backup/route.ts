import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createBackup } from "@/lib/backup"
import { logActivity } from "@/lib/activity-logger"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/maintenance/backup
 * Yedek listesini getirir
 * Requirements: 11.4
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("Backup listesi hatası:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Yedek listesi alınamadı" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/maintenance/backup
 * Yeni yedek oluşturur
 * Requirements: 11.3
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    // Yedek oluştur
    const backup = await createBackup(session.user.id)

    // Activity log
    await logActivity({
      userId: session.user.id,
      type: "BACKUP_CREATED",
      description: `Veritabanı yedeği oluşturuldu: ${backup.filename}`,
      metadata: {
        filename: backup.filename,
        size: backup.size,
      },
      request,
    })

    return NextResponse.json({
      success: true,
      backup: {
        filename: backup.filename,
        size: backup.size,
        downloadUrl: `/api/admin/maintenance/backup/download/${backup.filename}`,
      },
    })
  } catch (error) {
    console.error("Backup oluşturma hatası:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Yedek oluşturulamadı" },
      { status: 500 }
    )
  }
}
