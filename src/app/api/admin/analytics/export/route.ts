import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, format } from "date-fns"

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

    // Günlük istatistikler
    const dailyStats = await prisma.$queryRaw<
      Array<{
        date: Date
        new_users: bigint
        new_plans: bigint
        new_comments: bigint
        new_likes: bigint
      }>
    >`
      SELECT 
        DATE(d.date) as date,
        COALESCE(u.count, 0)::int as new_users,
        COALESCE(p.count, 0)::int as new_plans,
        COALESCE(c.count, 0)::int as new_comments,
        COALESCE(l.count, 0)::int as new_likes
      FROM (
        SELECT generate_series(
          ${startOfPeriod}::date,
          ${endOfPeriod}::date,
          '1 day'::interval
        )::date as date
      ) d
      LEFT JOIN (
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
        GROUP BY DATE("createdAt")
      ) u ON d.date = u.date
      LEFT JOIN (
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Plan"
        WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
        GROUP BY DATE("createdAt")
      ) p ON d.date = p.date
      LEFT JOIN (
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Comment"
        WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
        GROUP BY DATE("createdAt")
      ) c ON d.date = c.date
      LEFT JOIN (
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Like"
        WHERE "createdAt" >= ${startOfPeriod} AND "createdAt" <= ${endOfPeriod}
        GROUP BY DATE("createdAt")
      ) l ON d.date = l.date
      ORDER BY d.date ASC
    `

    // CSV oluştur
    const csvHeaders = "Tarih,Yeni Kullanıcılar,Yeni Planlar,Yeni Yorumlar,Yeni Beğeniler\n"
    const csvRows = dailyStats
      .map((row: {
        date: Date
        new_users: bigint
        new_plans: bigint
        new_comments: bigint
        new_likes: bigint
      }) => {
        const dateStr = format(row.date, "yyyy-MM-dd")
        return `${dateStr},${row.new_users},${row.new_plans},${row.new_comments},${row.new_likes}`
      })
      .join("\n")

    const csv = csvHeaders + csvRows

    // CSV dosyası olarak döndür
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-${format(startOfPeriod, "yyyy-MM-dd")}-${format(endOfPeriod, "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Analytics export error:", error)
    return NextResponse.json(
      { error: "CSV export sırasında hata oluştu" },
      { status: 500 }
    )
  }
}
