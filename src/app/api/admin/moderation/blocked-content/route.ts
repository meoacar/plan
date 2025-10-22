import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"

/**
 * GET /api/admin/moderation/blocked-content
 * PENDING durumundaki planları ve yorumları listeler
 * Requirements: 4.6
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all" // all, plan, comment
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = 20

    let blockedPlans: unknown[] = []
    let blockedComments: unknown[] = []
    let totalPlans = 0
    let totalComments = 0

    // PENDING durumundaki planları getir
    if (type === "all" || type === "plan") {
      const [plans, count] = await Promise.all([
        prisma.plan.findMany({
          where: {
            status: "PENDING",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: type === "plan" ? (page - 1) * pageSize : 0,
          take: type === "plan" ? pageSize : undefined,
        }),
        prisma.plan.count({
          where: {
            status: "PENDING",
          },
        }),
      ])

      blockedPlans = plans
      totalPlans = count
    }

    // Spam olarak işaretlenmiş yorumları getir
    // Not: Şu an Comment modelinde status field'ı yok, bu yüzden tüm yorumları döndürüyoruz
    // Gelecekte Comment modeline status eklenebilir
    if (type === "all" || type === "comment") {
      // Şimdilik boş array döndürüyoruz
      // İleride Comment modeline status field'ı eklendiğinde burası güncellenecek
      blockedComments = []
      totalComments = 0
    }

    return NextResponse.json({
      blockedPlans,
      blockedComments,
      totalPlans,
      totalComments,
      page,
      pageSize,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Oturum") || error.message.includes("admin")) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes("Oturum") ? 401 : 403 }
        )
      }
    }
    console.error("Blocked content GET error:", error)
    return NextResponse.json(
      { error: "Engellenen içerik yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}
