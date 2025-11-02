import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/comments/stats
 * Yorum istatistikleri
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      )
    }

    // Toplam yorum sayısı
    const totalComments = await prisma.comment.count()

    // Durum bazlı sayılar
    const approvedCount = await prisma.comment.count({
      where: { status: "APPROVED" }
    })

    const pendingCount = await prisma.comment.count({
      where: { status: "PENDING" }
    })

    const rejectedCount = await prisma.comment.count({
      where: { status: "REJECTED" }
    })

    const spamCount = await prisma.comment.count({
      where: { isSpam: true }
    })

    // Son 7 gün
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentComments = await prisma.comment.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    })

    // Son 30 gün
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyComments = await prisma.comment.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // En çok yorumlanan planlar
    const topCommentedPlans = await prisma.plan.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        comments: {
          _count: "desc"
        }
      },
      take: 10,
    })

    // En aktif yorumcular
    const topCommenters = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        comments: {
          _count: "desc"
        }
      },
      take: 10,
    })

    // Günlük yorum trendi (son 30 gün)
    const dailyTrend = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::bigint as count
      FROM "Comment"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `

    return NextResponse.json({
      total: totalComments,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      spam: spamCount,
      recent7Days: recentComments,
      recent30Days: monthlyComments,
      topPlans: topCommentedPlans.map(p => ({
        ...p,
        commentCount: p._count.comments
      })),
      topCommenters: topCommenters.map(u => ({
        ...u,
        commentCount: u._count.comments
      })),
      dailyTrend: dailyTrend.map(d => ({
        date: d.date,
        count: Number(d.count)
      }))
    })
  } catch (error) {
    console.error("Comment stats error:", error)
    return NextResponse.json(
      { error: "İstatistikler getirilemedi" },
      { status: 500 }
    )
  }
}
