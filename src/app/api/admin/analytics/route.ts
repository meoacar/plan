import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, eachDayOfInterval, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Varsayılan: son 30 gün
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30)

    const startOfPeriod = startOfDay(startDate)
    const endOfPeriod = endOfDay(endDate)

    // Önceki dönem için karşılaştırma
    const periodLength = endOfPeriod.getTime() - startOfPeriod.getTime()
    const previousStartDate = new Date(startOfPeriod.getTime() - periodLength)
    const previousEndDate = new Date(endOfPeriod.getTime() - periodLength)

    // Toplam istatistikler
    const [
      totalUsers,
      totalPlans,
      totalComments,
      totalLikes,
      newUsers,
      newPlans,
      previousNewUsers,
      previousNewPlans,
      approvedPlans,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.plan.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfPeriod,
            lte: endOfPeriod,
          },
        },
      }),
      prisma.plan.count({
        where: {
          createdAt: {
            gte: startOfPeriod,
            lte: endOfPeriod,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),
      prisma.plan.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
      }),
      prisma.plan.findMany({
        where: {
          status: "APPROVED",
          createdAt: {
            gte: startOfPeriod,
            lte: endOfPeriod,
          },
        },
        select: {
          views: true,
        },
      }),
    ])

    // Ortalama görüntülenme hesapla
    const totalViews = approvedPlans.reduce((sum: number, plan: { views: number }) => sum + plan.views, 0)
    const avgViews = approvedPlans.length > 0 ? Math.round(totalViews / approvedPlans.length) : 0

    // Kullanıcı büyümesi (günlük)
    const userGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Plan aktivitesi (günlük)
    const planActivity = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "Plan"
      WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Engagement (yorumlar ve beğeniler)
    const commentActivity = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "Comment"
      WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    const likeActivity = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "Like"
      WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Tüm günleri doldur (boş günler için 0)
    const allDays = eachDayOfInterval({ start: startOfPeriod, end: endOfPeriod })
    
    const userGrowthMap = new Map(
      userGrowth.map((item: { date: Date; count: bigint }) => [format(item.date, "yyyy-MM-dd"), Number(item.count)])
    )
    const planActivityMap = new Map(
      planActivity.map((item: { date: Date; count: bigint }) => [format(item.date, "yyyy-MM-dd"), Number(item.count)])
    )
    const commentActivityMap = new Map(
      commentActivity.map((item: { date: Date; count: bigint }) => [format(item.date, "yyyy-MM-dd"), Number(item.count)])
    )
    const likeActivityMap = new Map(
      likeActivity.map((item: { date: Date; count: bigint }) => [format(item.date, "yyyy-MM-dd"), Number(item.count)])
    )

    const userGrowthData = allDays.map((day) => ({
      date: format(day, "yyyy-MM-dd"),
      count: userGrowthMap.get(format(day, "yyyy-MM-dd")) || 0,
    }))

    const planActivityData = allDays.map((day) => ({
      date: format(day, "yyyy-MM-dd"),
      count: planActivityMap.get(format(day, "yyyy-MM-dd")) || 0,
    }))

    const engagementData = allDays.map((day) => ({
      date: format(day, "yyyy-MM-dd"),
      comments: commentActivityMap.get(format(day, "yyyy-MM-dd")) || 0,
      likes: likeActivityMap.get(format(day, "yyyy-MM-dd")) || 0,
    }))

    // En aktif kullanıcılar
    const topUsers = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            plans: true,
            comments: true,
            likes: true,
          },
        },
      },
      take: 10,
      orderBy: [
        {
          plans: {
            _count: "desc",
          },
        },
      ],
    })

    const topUsersWithScore = topUsers.map((user: {
      id: string
      name: string | null
      email: string
      image: string | null
      _count: { plans: number; comments: number; likes: number }
    }) => ({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      activityScore: user._count.plans * 10 + user._count.comments * 2 + user._count.likes,
      planCount: user._count.plans,
      commentCount: user._count.comments,
      likeCount: user._count.likes,
    }))

    // En popüler planlar
    const topPlans = await prisma.plan.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [
        {
          views: "desc",
        },
      ],
      take: 10,
    })

    const topPlansData = topPlans.map((plan: {
      id: string
      title: string
      slug: string
      views: number
      user: { name: string | null }
      _count: { likes: number; comments: number }
    }) => ({
      plan: {
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        authorName: plan.user.name,
      },
      views: plan.views,
      likes: plan._count.likes,
      comments: plan._count.comments,
    }))

    // Değişim yüzdeleri
    const userChange = previousNewUsers > 0 
      ? Math.round(((newUsers - previousNewUsers) / previousNewUsers) * 100)
      : 0
    const planChange = previousNewPlans > 0
      ? Math.round(((newPlans - previousNewPlans) / previousNewPlans) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPlans,
        totalComments,
        totalLikes,
        newUsers,
        newPlans,
        avgViews,
        userChange,
        planChange,
      },
      userGrowth: userGrowthData,
      planActivity: planActivityData,
      engagement: engagementData,
      topUsers: topUsersWithScore,
      topPlans: topPlansData,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "İstatistikler yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}
