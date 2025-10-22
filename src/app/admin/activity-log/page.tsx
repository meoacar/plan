import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivityLogViewer } from "@/components/admin/activity-log-viewer"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    type?: string
    startDate?: string
    endDate?: string
  }>
}

// Disable caching for admin pages
export const dynamic = "force-dynamic"

export default async function AdminActivityLogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const page = parseInt(params.page || "1")
  const pageSize = 50
  const search = params.search || ""
  const type = params.type || undefined
  const startDate = params.startDate
  const endDate = params.endDate

  // Filtreleme koşulları
  const where: any = {}

  // İşlem tipi filtresi
  if (type) {
    where.type = type
  }

  // Kullanıcı arama (ad veya email)
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

  // Toplam sayı
  const total = await prisma.activityLog.count({ where })

  // Aktivite loglarını getir
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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="bg-gradient-to-r from-[#2d7a4a] to-[#4caf50] text-white p-8 rounded-xl mb-8 shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">📝 Aktivite Logu</h1>
        <p className="text-lg text-white/90">
          Sistem ve kullanıcı aktivitelerini görüntüleyin ve filtreleyin
        </p>
      </div>

      <ActivityLogViewer
        initialLogs={logs}
        total={total}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}
