import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, eachDayOfInterval, format } from "date-fns"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export const metadata: Metadata = {
  title: "Analitik ve Raporlar | Admin Panel",
  description: "Platform istatistikleri ve analitik raporları",
}

export const revalidate = 300 // 5 dakika cache

async function getAnalyticsData() {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)
  const startOfPeriod = startOfDay(startDate)
  const endOfPeriod = endOfDay(endDate)

  // Önceki dönem
  const periodLength = endOfPeriod.getTime() - startOfPeriod.getTime()
  const previousStartDate = new Date(startOfPeriod.getTime() - periodLength)
  const previousEndDate = new Date(endOfPeriod.getTime() - periodLength)

  // Safe count helper
  const safeCount = async (model: any, where?: any) => {
    try {
      return await model.count(where ? { where } : undefined)
    } catch {
      return 0
    }
  }

  const [
    totalUsers,
    totalPlans,
    totalComments,
    totalLikes,
    totalConfessions,
    totalConfessionComments,
    totalGroups,
    totalFollows,
    totalNotifications,
    newUsers,
    newPlans,
    newConfessions,
    newGroups,
    previousNewUsers,
    previousNewPlans,
    previousNewConfessions,
    approvedPlans,
    pendingConfessions,
    approvedConfessions,
    rejectedConfessions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.plan.count(),
    prisma.comment.count(),
    prisma.like.count(),
    safeCount(prisma.confession),
    safeCount(prisma.confessionComment),
    safeCount(prisma.socialGroup),
    safeCount(prisma.follow),
    safeCount(prisma.notification),
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
    safeCount(prisma.confession, {
      createdAt: {
        gte: startOfPeriod,
        lte: endOfPeriod,
      },
    }),
    safeCount(prisma.socialGroup, {
      createdAt: {
        gte: startOfPeriod,
        lte: endOfPeriod,
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
    safeCount(prisma.confession, {
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
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
    safeCount(prisma.confession, { status: "PENDING" }),
    safeCount(prisma.confession, { status: "APPROVED" }),
    safeCount(prisma.confession, { status: "REJECTED" }),
  ])

  const totalViews = approvedPlans.reduce((sum: number, plan: { views: number }) => sum + plan.views, 0)
  const avgViews = approvedPlans.length > 0 ? Math.round(totalViews / approvedPlans.length) : 0

  const userGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM "User"
    WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  const planActivity = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*)::int as count
    FROM "Plan"
    WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

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

  const userGrowthData = allDays.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return {
      date: dateKey,
      count: (userGrowthMap.get(dateKey) ?? 0) as number,
    }
  })

  const planActivityData = allDays.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return {
      date: dateKey,
      count: (planActivityMap.get(dateKey) ?? 0) as number,
    }
  })

  const engagementData = allDays.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return {
      date: dateKey,
      comments: (commentActivityMap.get(dateKey) ?? 0) as number,
      likes: (likeActivityMap.get(dateKey) ?? 0) as number,
    }
  })

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
          Plan: true,
          Comment_Comment_userIdToUser: true,
          Like: true,
        },
      },
    },
    take: 10,
    orderBy: [
      {
        Plan: {
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
    _count: { Plan: number; Comment_Comment_userIdToUser: number; Like: number }
  }) => ({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    activityScore: user._count.Plan * 10 + user._count.Comment_Comment_userIdToUser * 2 + user._count.Like,
    planCount: user._count.Plan,
    commentCount: user._count.Comment_Comment_userIdToUser,
    likeCount: user._count.Like,
  }))

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
      User: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          Like: true,
          Comment: true,
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
    User: { name: string | null }
    _count: { Like: number; Comment: number }
  }) => ({
    plan: {
      id: plan.id,
      title: plan.title,
      slug: plan.slug,
      authorName: plan.User.name,
    },
    views: plan.views,
    likes: plan._count.Like,
    comments: plan._count.Comment,
  }))

  const userChange =
    previousNewUsers > 0 ? Math.round(((newUsers - previousNewUsers) / previousNewUsers) * 100) : 0
  const planChange =
    previousNewPlans > 0 ? Math.round(((newPlans - previousNewPlans) / previousNewPlans) * 100) : 0
  const confessionChange =
    previousNewConfessions > 0 ? Math.round(((newConfessions - previousNewConfessions) / previousNewConfessions) * 100) : 0

  return {
    stats: {
      totalUsers,
      totalPlans,
      totalComments,
      totalLikes,
      totalConfessions,
      totalConfessionComments,
      totalGroups,
      totalFollows,
      totalNotifications,
      newUsers,
      newPlans,
      newConfessions,
      newGroups,
      avgViews,
      userChange,
      planChange,
      confessionChange,
      pendingConfessions,
      approvedConfessions,
      rejectedConfessions,
    },
    userGrowth: userGrowthData,
    planActivity: planActivityData,
    engagement: engagementData,
    topUsers: topUsersWithScore,
    topPlans: topPlansData,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return <AnalyticsDashboard initialData={data} />
}
