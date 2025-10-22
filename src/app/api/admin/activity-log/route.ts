import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

/**
 * GET /api/admin/activity-log
 * Aktivite loglarını listeler, filtreler ve arama yapar
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.9
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = 50
    const type = searchParams.get("type") || undefined
    const userId = searchParams.get("userId") || undefined
    const search = searchParams.get("search") || undefined
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Filtreleme koşulları
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    // Kullanıcı adı veya email ile arama
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Toplam kayıt sayısı
    const total = await prisma.activityLog.count({ where })

    // Logları getir
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error: any) {
    console.error("Activity log fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Aktivite logları alınamadı" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
