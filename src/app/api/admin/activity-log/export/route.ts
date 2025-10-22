import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

/**
 * GET /api/admin/activity-log/export
 * Aktivite loglarını CSV formatında export eder
 * Requirements: 10.10
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || undefined
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Filtreleme koşulları
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Tüm logları getir (limit yok, export için)
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // CSV formatına dönüştür
    const csvHeader = "Tarih,Kullanıcı,Email,İşlem Tipi,Açıklama,Hedef ID,Hedef Tip,IP Adresi\n"
    const csvRows = logs.map((log) => {
      const date = new Date(log.createdAt).toLocaleString("tr-TR")
      const userName = log.user.name || "Bilinmiyor"
      const userEmail = log.user.email
      const type = log.type
      const description = log.description.replace(/"/g, '""') // CSV escape
      const targetId = log.targetId || ""
      const targetType = log.targetType || ""
      const ipAddress = log.ipAddress || ""

      return `"${date}","${userName}","${userEmail}","${type}","${description}","${targetId}","${targetType}","${ipAddress}"`
    })

    const csv = csvHeader + csvRows.join("\n")

    // CSV dosyası olarak döndür
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="activity-log-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Activity log export error:", error)
    return NextResponse.json(
      { error: error.message || "Aktivite logları export edilemedi" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
